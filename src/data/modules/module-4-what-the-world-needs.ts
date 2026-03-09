// ============================================================
// Module 4: What the World Needs — GAPS IN THE WORLD
// Outward Journey — World Needs Explorer
// ============================================================

import { ModuleData } from "../types";

export const module4: ModuleData = {
  id: 4,
  slug: "what-the-world-needs",
  title: "What the World Needs",
  subtitle: "Turning your gaze outward to find where you are called",
  journeyPhase: "outward",
  icon: "globe",
  themeColor: "#059669",
  outputLabel: "Your World Needs Map",

  introduction: [
    {
      id: "m4-intro-1",
      type: "heading",
      heading: "Gaps in the World",
      level: 1,
    },
    {
      id: "m4-intro-2",
      type: "paragraph",
      content:
        "Welcome to the Outward Journey. You have spent three modules looking within — discovering your passions, your wounds, and your fears. Now we turn your gaze to the world. Not to find a 'cause' that looks good on paper, but to notice where your inner landscape resonates with the world's genuine needs.",
    },
    {
      id: "m4-intro-3",
      type: "paragraph",
      content:
        "When you look at the people that have ever meaningfully moved the world forward — solved problems that had not been solved — nobody taught them how to do it. One of the most fascinating things is that they decided to do it because they knew it was important, before having any idea how. And then they trusted in both the rightness of it and their own capability to learn.",
    },
    {
      id: "m4-intro-4",
      type: "quote",
      quote: {
        text: "Until he extends his circle of compassion to include all living things, man will not himself find peace.",
        author: "Albert Schweitzer",
      },
    },
    {
      id: "m4-intro-5",
      type: "paragraph",
      content:
        "Take deep responsibility for the impact that you have during your life while you are here. Do all of the study, all the training, all the application that you need to empower the kind of impact you want to have. In this module, you will explore five domains of world need — and discover which ones call to you.",
    },
    {
      id: "m4-intro-6",
      type: "callout",
      content:
        "This module uses a visual explorer. Browse the five categories below, drill into the sub-topics, and mark the ones that resonate with you. You don't need to pick the 'most important' cause — pick the ones that genuinely move you. Your emotional response is your compass.",
    },
  ],

  completionMessage:
    "You have mapped the territories of the world's need that call to you. Notice the pattern: the areas that move you are almost certainly connected to your passions and your wounds from the Inward Journey. Your Ikigai lives at this intersection.",

  steps: [
    // ── Step 1: The Alien Perspective ──
    {
      id: "m4-step-1",
      title: "The Alien Perspective",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m4-s1-c1",
          type: "paragraph",
          content:
            "Before exploring the world's gaps, try this thought experiment: Imagine you are an alien visiting Earth for the first time. You have no cultural bias, no national identity, no political allegiance. You simply observe. What would strike you as broken? What would seem beautiful? What would confuse you about how humans have organized their world?",
        },
        {
          id: "m4-s1-c2",
          type: "paragraph",
          content:
            "This perspective helps us step outside the stories we have been told about what matters and what is 'just how things are.' Many of humanity's greatest problems persist not because they are unsolvable, but because we have normalized them.",
        },
      ],
      exercises: [
        {
          id: "m4-e1",
          type: "freetext",
          prompt:
            "If you were seeing Earth for the first time, with fresh eyes — what would strike you as most urgently wrong? What would you want to fix first?",
          guidance:
            "Drop all familiarity. Pretend you've never been told 'that's just how it is.' What would genuinely shock you?",
          placeholder:
            "Describe what you'd see with alien eyes...",
          followUpPrompt:
            "Why do you think this particular issue stands out to you? Is there a connection to what you explored in the Inward Journey?",
        },
      ],
    },

    // ── Step 2: Explore the Five Domains ──
    {
      id: "m4-step-2",
      title: "Explore the Five Domains",
      aiCoachingEnabled: false,
      contentBlocks: [
        {
          id: "m4-s2-c1",
          type: "heading",
          heading: "Where Is the World Calling You?",
          level: 2,
        },
        {
          id: "m4-s2-c2",
          type: "paragraph",
          content:
            "Below are five domains of world need. Each contains specific sub-topics — real areas where the world is hurting, growing, or transforming. Browse them all. Read the descriptions. And mark the ones that make you feel something — the ones where you think: 'Yes. This matters to me.'",
        },
        {
          id: "m4-s2-c3",
          type: "callout",
          content:
            "This is the card explorer. Take your time. There are no wrong choices. Select topics that genuinely resonate — even if you don't know how they connect to your life yet. Trust your response.",
        },
      ],
      exercises: [
        {
          id: "m4-e2",
          type: "card_select",
          prompt:
            "Explore the five categories below and select the topics that resonate with you. Click on a category to expand it, then toggle 'This resonates with me' on any sub-topic that moves you.",
          guidance:
            "You can select as many as feel true. The AI will help you find patterns in your selections later.",
        },
      ],
    },

    // ── Step 3: Connecting Inner to Outer ──
    {
      id: "m4-step-3",
      title: "Connecting Inner to Outer",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m4-s3-c1",
          type: "paragraph",
          content:
            "Now let's connect what you've selected to what you discovered in the Inward Journey. Your purpose is not found in either your inner world or the outer world alone — it lives in the space between them. The Magical Blend is about creating and discovering meaning in that liminal space, fully participating in the mystery of life.",
        },
        {
          id: "m4-s3-c2",
          type: "framework",
          content:
            "The Magical Blend: Modernism says we DISCOVER meaning 'out there' in the world, leading us to doggedly pursue absolute ideals and neglect our subjective experience. Postmodernism says we CREATE all meaning ourselves — so it is all imaginary, subjective, worthless — and we slip into nihilism. The truth is neither. We create-and-discover meaning, a dance in the liminal space — not self, not world, but a magical blend — where we are fully participating in the mystery of life and cosmos, continually creating and discovering meaning, as well as beauty, freedom, and divinity.",
        },
      ],
      exercises: [
        {
          id: "m4-e3",
          type: "freetext",
          prompt:
            "Looking at the world-need topics you selected — what connections do you see to your passions from Module 1 and your wounds from Module 2?",
          guidance:
            "The pattern may already be emerging. What you love, what has hurt you, and what the world needs are often three expressions of the same deeper call.",
          placeholder:
            "Describe the connections you see between your inner world and the world's needs...",
          followUpPrompt:
            "If you could dedicate the next chapter of your life to one of these intersections — inner passion meeting outer need — which one would it be?",
        },
        {
          id: "m4-e4",
          type: "freetext",
          prompt:
            "What problem in the world do you feel most equipped to contribute to — not because you have all the answers, but because you understand the terrain?",
          guidance:
            "Think about specific knowledge — the kind you can't be trained for, that comes from your unique combination of experience, curiosity, and passion.",
          placeholder:
            "Describe the problem and why you feel called to it...",
        },
      ],
    },
  ],
};
