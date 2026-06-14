// ============================================================
// Mission Fit — AI (company synthesis & alignment dossier)
// ============================================================

import { streamChatCompletion } from '@/lib/ai-service';
import { companyQuestions, memberQuestions } from '@/data/missionFit/content';
import type { CompanyProfile, MemberReflection } from './types';

function formatAnswers(questions: { id: string; prompt: string }[], responses: Record<string, string>) {
  return questions
    .map(q => {
      const a = (responses[q.id] || '').trim();
      return a ? `Q: ${q.prompt}\nA: ${a}` : null;
    })
    .filter(Boolean)
    .join('\n\n');
}

// ── Company Mission Profile synthesis ──

const COMPANY_SYNTHESIS_PROMPT = `You are a thoughtful organisational philosopher helping a founder articulate the soul of their company so that mission-alignment can be assessed honestly with candidates and new hires.

You will receive a founder's raw answers about their company's mission, convictions, values-in-action, and the trade-offs they accept.

Write a clear, grounded "Mission Profile" with these sections (use "## " markdown headings):

## The Mission
One or two crisp sentences capturing the change this company exists to create.

## What We Believe
3–5 core convictions about people, work, or the world that shape how this team operates. Bullet points beginning with "- ".

## Who Thrives Here
A short, honest paragraph describing the person who flourishes on this mission — and, plainly, who does not.

## How We Behave
3–4 concrete behaviours or trade-offs that show the values in action (not adjectives). Bullet points beginning with "- ".

Be specific and faithful to the founder's own words and emphasis. Do not invent values they did not express. Keep the whole thing under 350 words. Warm, precise, no corporate jargon.`;

export async function synthesizeCompanyProfile(
  profile: CompanyProfile,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const answers = formatAnswers(companyQuestions, profile.responses);
  return streamChatCompletion(
    [
      { role: 'system', content: COMPANY_SYNTHESIS_PROMPT },
      {
        role: 'user',
        content: `Company: ${profile.companyName || 'Unnamed company'}\nFounder: ${profile.founderName || 'The founder'}\n\nFounder's answers:\n\n${answers}\n\nWrite the Mission Profile.`,
      },
    ],
    onChunk,
    { model: 'gpt-4o', maxTokens: 900, signal }
  );
}

// ── Alignment Dossier ──

const DOSSIER_PROMPT = `You are a wise, candid guide who helps purpose-driven teams and the people joining them have honest conversations about mission alignment.

You will receive (1) a company's Mission Profile and (2) a team member's mission reflection. Produce a "Mission Alignment Dossier" that prepares both sides for a real conversation.

CRITICAL RULES:
- Do NOT produce a score, rating, percentage, or any "hire / don't hire" verdict. This is a conversation guide, not an evaluation.
- Treat divergence as valuable and worth exploring, never as disqualifying.
- Quote or reference specifics from BOTH sides so it feels true, not generic.
- Be honest. Flattery that hides real differences is a failure.
- This is a MUTUAL fit check — the member is deciding about the mission as much as the team is.

Use these exact sections (with "## " markdown headings):

## Alignment Snapshot
2–4 sentences describing, in plain language, where this person and this mission genuinely meet. No score.

## Where You Resonate
3–5 specific points of authentic alignment. Each bullet ("- ") should connect something the member said to something the mission stands for.

## Where You May Diverge
2–4 honest points of difference, tension, ambiguity, or open question — framed as worth talking about. Be specific and kind.

## Questions For Your Conversation
Exactly 5 questions the team member and the founder should actually discuss together. Numbered "1." to "5.". Make them open, specific to this pairing, and impossible to answer with a rehearsed line.

## A Note To You
2–4 sentences addressed directly to the team member: what to pay attention to in the coming weeks to learn whether this mission truly fits *you*.

Keep the whole dossier under 550 words. Grounded, warm, direct.`;

export async function generateDossier(
  company: CompanyProfile,
  member: MemberReflection,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const missionContext = company.synthesis
    ? company.synthesis
    : formatAnswers(companyQuestions, company.responses);
  const memberAnswers = formatAnswers(memberQuestions, member.responses);

  return streamChatCompletion(
    [
      { role: 'system', content: DOSSIER_PROMPT },
      {
        role: 'user',
        content: `# COMPANY MISSION PROFILE\nCompany: ${company.companyName || 'The company'}\n\n${missionContext}\n\n# TEAM MEMBER REFLECTION\nName: ${member.name}\nRole: ${member.role}\n\n${memberAnswers}\n\nWrite the Mission Alignment Dossier for ${member.name}.`,
      },
    ],
    onChunk,
    { model: 'gpt-4o', maxTokens: 1400, signal }
  );
}
