// ============================================================
// Mission Fit — Content (questions & copy)
// ============================================================

export interface MfQuestion {
  id: string;
  prompt: string;
  guidance?: string;
  placeholder?: string;
}

// ── Company side: the founder defines the soul of the company ──

export const companyQuestions: MfQuestion[] = [
  {
    id: 'mission',
    prompt: 'In a sentence or two, what is the mission of your company — the change you exist to create in the world?',
    guidance: 'The north star. Not what you sell — why it matters that you exist.',
    placeholder: 'We exist so that…',
  },
  {
    id: 'why_you',
    prompt: 'Why does this mission matter to you personally? What in your own story makes it non-negotiable?',
    guidance: 'The conviction underneath the company. This is what a mission-aligned hire needs to feel from you.',
  },
  {
    id: 'convictions',
    prompt: 'What do you believe about people, work, or the world that shapes how you build here?',
    guidance: 'Your core convictions — the philosophy a great hire would recognise and share.',
  },
  {
    id: 'who_thrives',
    prompt: 'What does someone need to genuinely care about to thrive here — and what would make someone a poor fit no matter how skilled?',
    guidance: 'Be honest about the second half. Clarity here is a kindness to everyone.',
  },
  {
    id: 'values_in_action',
    prompt: 'When this company is at its best, what does a decision or a moment actually feel like?',
    guidance: 'Values shown through behaviour, not adjectives.',
  },
  {
    id: 'tradeoffs',
    prompt: 'What tensions or trade-offs do you knowingly accept in service of the mission?',
    guidance: 'e.g. speed vs. polish, growth vs. depth, mission vs. margin. Where do you lean, and why?',
  },
  {
    id: 'contribution',
    prompt: 'A year from now, what should a great hire be able to say they contributed to the mission?',
    guidance: 'What does meaningful contribution look like here?',
  },
];

// ── Member side: mission-layer reflection (employer-safe) ──

export const memberQuestions: MfQuestion[] = [
  {
    id: 'flow',
    prompt: 'What kind of work makes you lose track of time — and what is it about that work that pulls you in?',
    guidance: 'Not your skills — the underlying thing that energises you.',
  },
  {
    id: 'seeking',
    prompt: 'Beyond compensation and title, what are you genuinely hoping this chapter of your work life gives you?',
    guidance: 'What would make this time well spent, for you?',
  },
  {
    id: 'care_about',
    prompt: 'What change in the world — large or small — do you actually care about? Why that one?',
    guidance: 'There are no right answers. Honesty here is what makes the rest useful.',
  },
  {
    id: 'aligned_moment',
    prompt: 'Describe a moment at work or in a project when you felt most aligned and alive. What was true in that moment?',
    guidance: 'Specifics matter more than polish.',
  },
  {
    id: 'needs',
    prompt: 'What do you need from a mission or a team to do your best work — and what environments drain or disillusion you?',
  },
  {
    id: 'resonance',
    prompt: "Reading this company's mission below, what genuinely resonates — and what, if anything, gives you pause or feels unclear?",
    guidance: 'Honest hesitation is welcome and useful — this is a mutual fit check, not a test.',
  },
  {
    id: 'proud',
    prompt: 'A year from now, what would make you proud of how you spent your time here?',
  },
];

// ── Copy ──

export const consentCopy = {
  title: 'Before you share',
  body: [
    'This reflection is yours. Nothing is shared until you choose to share it here.',
    'Only your answers to these mission-focused questions will be shared — to generate a conversation guide between you and the team. There are no scores and no pass/fail.',
    'This is a mutual fit check: it is meant to help you decide whether this mission fits you, as much as the other way around.',
  ],
  privateNote:
    'Deeper personal material — your fears, your shadow, your private story — is intentionally not asked here. That work belongs to you alone in the personal Ikigai Journey.',
  agree: 'I understand, and I choose to share my reflection',
};

export const missionFitIntro = {
  title: 'Mission Fit',
  tagline: 'A mutual mission-alignment check for purpose-driven teams.',
  body:
    'Define the soul of your company, invite a teammate to reflect on what they care about, and generate a dossier that turns the final interview — or the first month — into the most honest conversation either side has had.',
};
