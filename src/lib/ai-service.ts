// ============================================================
// AI Service — OpenAI Integration for Coaching & Synthesis
// ============================================================

import { aiSystemPrompts, masterSynthesisPrompt } from '@/data/ai-prompts/system-prompts';

const API_URL = 'https://api.openai.com/v1/chat/completions';

// ── API Key Management ──

function getApiKey(): string | null {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) ||
    localStorage.getItem('ikigai-openai-key') ||
    null
  );
}

export function setApiKey(key: string) {
  localStorage.setItem('ikigai-openai-key', key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
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
  options?: { model?: string; maxTokens?: number; signal?: AbortSignal }
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: options?.maxTokens || 500,
    }),
    signal: options?.signal,
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    const errorText = await response.text().catch(() => '');
    throw new Error(`API_ERROR_${response.status}: ${errorText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const content = JSON.parse(data).choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch {
        // Skip malformed JSON chunks
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

// ── Build System Message from Module Prompt ──

function buildSystemMessage(
  moduleId: number,
  previousContext: string,
  crossModuleContext: string
): string {
  const prompt = aiSystemPrompts.find(p => p.moduleId === moduleId);
  if (!prompt) return 'You are a helpful coaching assistant.';

  return [
    prompt.role,
    `\n\n## Context:\n${prompt.context}`,
    `\n\n## Instructions:\n${prompt.instructions}`,
    `\n\n## Tone:\n${prompt.tone}`,
    `\n\n## Cross-Module References:\n${prompt.crossModuleRefs}`,
    previousContext ? `\n\n## Previous responses in this module:\n${previousContext}` : '',
    crossModuleContext ? `\n\n## Key insights from previous modules:\n${crossModuleContext}` : '',
  ].join('');
}

// ── Coaching Response ──

export async function streamCoachingResponse(
  context: CoachingContext,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  // Build previous responses context
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

  // Build user message
  let userMessage = `The user just completed this exercise:\n\nQuestion: ${context.exercisePrompt}`;
  if (context.exerciseGuidance) {
    userMessage += `\nGuidance provided: ${context.exerciseGuidance}`;
  }
  userMessage += `\n\nTheir response: "${context.userResponse}"`;
  userMessage += `\n\nPlease provide a coaching response. Be specific to what they shared. Keep it concise (2-4 sentences).`;
  if (context.followUpPrompt) {
    userMessage += `\n\nIf appropriate, you may also weave in this follow-up question to deepen their reflection: "${context.followUpPrompt}"`;
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
  // Build comprehensive user data summary
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

  return streamChat(
    [
      { role: 'system', content: masterSynthesisPrompt },
      {
        role: 'user',
        content: `Here is everything this person has shared across their entire Ikigai Journey:\n${userData}\n\nPlease generate their personalized Ikigai purpose statement and threads, following the output format specified in your instructions.`,
      },
    ],
    onChunk,
    { model: 'gpt-4o', maxTokens: 1500, signal }
  );
}
