// ============================================================
// AI Service — Lovable AI Gateway via Edge Function
// No user-provided API keys. Streams from `ai-coach` function.
// ============================================================

import { aiSystemPrompts, masterSynthesisPrompt, metaFramePrompt } from '@/data/ai-prompts/system-prompts';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ai-coach`;

// ── Back-compat shims (no longer needed but kept so callers don't break) ──
export function hasApiKey(): boolean {
  return true;
}
export function setApiKey(_key: string) {
  // no-op: AI runs via Lovable AI Gateway server-side
}

// ── Types ──

export interface CoachingContext {
  moduleId: number;
  exercisePrompt: string;
  exerciseGuidance?: string;
  followUpPrompt?: string;
  userResponse: string;
  previousResponses: { prompt: string; response: string }[];
  crossModuleContext?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── Core Streaming Function ──

async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: { model?: string; signal?: AbortSignal }
): Promise<string> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model,
      messages,
    }),
    signal: options?.signal,
  });

  if (!response.ok) {
    let msg = `API_ERROR_${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) msg = data.error;
    } catch {
      // ignore
    }
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again in a moment.');
    if (response.status === 402) throw new Error('AI credits exhausted. Please add credits to continue.');
    throw new Error(msg);
  }

  if (!response.body) throw new Error('No response body from AI service.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const content = JSON.parse(data).choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch {
        // skip malformed
      }
    }
  }

  return fullText;
}

// ── Build Cross-Module Context ──

export function buildCrossModuleContext(
  modules: Record<string, any>,
  currentModuleId: number
): string {
  if (currentModuleId <= 1) return '';

  let context = '';
  for (let m = 1; m < currentModuleId; m++) {
    const modData = modules[String(m)];
    if (!modData?.exercises) continue;

    const entries: string[] = [];
    for (const [, exercise] of Object.entries(modData.exercises)) {
      const ex = exercise as any;
      if (ex.response && ex.response.trim().length > 0) {
        entries.push(`Q: ${ex.prompt}\nA: ${ex.response}`);
      }
      if (ex.selected && ex.selected.length > 0) {
        entries.push(`Q: ${ex.prompt}\nSelected: ${ex.selected.join(', ')}`);
      }
    }

    if (entries.length > 0) {
      context += `\n### Module ${m}:\n${entries.join('\n\n')}\n`;
    }
  }

  return context;
}

// ── Build System Message ──

function buildSystemMessage(
  moduleId: number,
  previousContext: string,
  crossModuleContext: string
): string {
  const prompt = aiSystemPrompts.find(p => p.moduleId === moduleId);
  const moduleBlock = prompt
    ? [
        `\n\n## Module ${moduleId} — your role here:\n${prompt.role}`,
        `\n\n## Module context:\n${prompt.context}`,
        `\n\n## Module-specific instructions:\n${prompt.instructions}`,
        `\n\n## Tone for this module:\n${prompt.tone}`,
        `\n\n## Cross-module references:\n${prompt.crossModuleRefs}`,
      ].join('')
    : '';

  return [
    metaFramePrompt,
    moduleBlock,
    previousContext ? `\n\n## Their previous responses in this module:\n${previousContext}` : '',
    crossModuleContext ? `\n\n## What they shared in earlier modules:\n${crossModuleContext}` : '',
  ].join('');

}

// ── Coaching Response ──

export async function streamCoachingResponse(
  context: CoachingContext,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let prevContext = '';
  if (context.previousResponses.length > 0) {
    prevContext = context.previousResponses
      .map(r => `Q: ${r.prompt}\nA: ${r.response}`)
      .join('\n\n');
  }

  const systemMessage = buildSystemMessage(
    context.moduleId,
    prevContext,
    context.crossModuleContext || ''
  );

  // Modulate the ask based on where the user is in the journey.
  // Early modules: listen + one question. Middle: connect threads. Final: synthesize.
  const stance =
    context.moduleId <= 3
      ? `You are still LEARNING about this person. Do not diagnose them or offer a verdict. Briefly acknowledge something specific they actually wrote (quote a few of their own words if you can), then ask ONE precise follow-up question that invites them to go a layer deeper. Keep it to 2–3 sentences. Do not propose careers, identities, or purpose statements yet.`
      : context.moduleId <= 4
      ? `You may begin to gently CONNECT THREADS between what they just wrote and what they shared in earlier modules — but still more curiosity than conclusion. 3–4 sentences. End with a question that sharpens the connection.`
      : context.moduleId === 5
      ? `You may now NAME PATTERNS you have actually observed across their own words. Quote them. 3–5 sentences. Offer the pattern as an observation they can confirm or refine, not a verdict.`
      : `This is the final module — SYNTHESIS is appropriate. Weave together their specific language from across the journey. Be precise, not flowery. 4–6 sentences.`;

  let userMessage = `The user just responded to this prompt in Module ${context.moduleId}:\n\nPrompt: ${context.exercisePrompt}`;
  if (context.exerciseGuidance) {
    userMessage += `\nGuidance shown to them: ${context.exerciseGuidance}`;
  }
  userMessage += `\n\nTheir response: """${context.userResponse}"""`;
  userMessage += `\n\n${stance}`;
  if (context.followUpPrompt && context.moduleId >= 4) {
    userMessage += `\n\nIf it fits naturally, you may also weave in this follow-up question: "${context.followUpPrompt}"`;
  }


  return streamChat(
    [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    onChunk,
    { signal }
  );
}

// ── Follow-Up Response ──

export async function streamFollowUpResponse(
  context: CoachingContext,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
  followUpQuestion: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const systemMessage = buildSystemMessage(
    context.moduleId,
    '',
    context.crossModuleContext || ''
  );

  const messages: ChatMessage[] = [
    { role: 'system', content: systemMessage },
    ...conversationHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: followUpQuestion },
  ];

  return streamChat(messages, onChunk, { signal });
}

// ── Module 6 Synthesis ──

export async function streamSynthesis(
  allModuleData: Record<string, any>,
  selectedWorldNeeds: string[],
  timelineEvents: any[],
  archetypeResult: string | null,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let userData = '';
  for (let m = 1; m <= 6; m++) {
    const modData = allModuleData[String(m)];
    if (!modData?.exercises) continue;
    userData += `\n## Module ${m} Responses:\n`;
    for (const [, exercise] of Object.entries(modData.exercises)) {
      const ex = exercise as any;
      if (ex.response && ex.response.trim()) {
        userData += `- Q: ${ex.prompt}\n  A: ${ex.response}\n\n`;
      }
      if (ex.selected && ex.selected.length > 0) {
        userData += `- Q: ${ex.prompt}\n  Selected: ${ex.selected.join(', ')}\n\n`;
      }
      if (ex.order && ex.order.length > 0) {
        userData += `- Q: ${ex.prompt}\n  Ranked: ${ex.order.join(' > ')}\n\n`;
      }
    }
  }

  if (selectedWorldNeeds.length > 0) {
    userData += `\n## Selected World Needs: ${selectedWorldNeeds.join(', ')}\n`;
  }

  if (timelineEvents.length > 0) {
    userData += `\n## Life Timeline:\n`;
    timelineEvents.forEach(e => {
      userData += `- ${e.year}: ${e.description} (${e.emotional})\n`;
    });
  }

  if (archetypeResult) {
    userData += `\n## Selected Archetype: ${archetypeResult}\n`;
  }

  // Suppress unused warning
  void supabase;

  return streamChat(
    [
      { role: 'system', content: masterSynthesisPrompt },
      {
        role: 'user',
        content: `Here is everything this person has shared across their entire Ikigai Journey:\n${userData}\n\nPlease generate their personalized Ikigai purpose statement and threads, following the output format specified in your instructions.`,
      },
    ],
    onChunk,
    { model: 'google/gemini-2.5-pro', signal }
  );
}
