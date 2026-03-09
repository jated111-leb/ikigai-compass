// ============================================================
// Module 6: What's Your Gift — SYNTHESIS & PURPOSE
// Outward Journey — Mission Formulation & Ikigai Statement
// ============================================================

import { ModuleData } from "../types";

export const module6: ModuleData = {
  id: 6,
  slug: "whats-your-gift",
  title: "What's Your Gift",
  subtitle: "Synthesizing everything into your purpose",
  journeyPhase: "outward",
  icon: "sparkles",
  themeColor: "#d97706",
  outputLabel: "Your Ikigai Statement",

  introduction: [
    {
      id: "m6-intro-1",
      type: "heading",
      heading: "Your Special Purpose",
      level: 1,
    },
    {
      id: "m6-intro-2",
      type: "paragraph",
      content:
        "You have traveled through five modules of deep self-exploration. You have mapped your passions, confronted your wounds and fears, surveyed the world's needs, reconstructed your story, and discovered your archetype. Now it is time for the synthesis — the moment where all of these threads weave together into something whole.",
    },
    {
      id: "m6-intro-3",
      type: "framework",
      content:
        "Your Special Purpose lives at one place and one place only — the intersection of the timeless (where you feel flow and the Deep Now) and the timebound (where life's a bitch and then we die). It is a four-step process:\n\n1. Find what makes you come alive (your talent)\n2. Pursue a flow-fueled path to mastery\n3. Notice where you feel the wound of the world most acutely (your trauma)\n4. Take a stand at the intersection of your trauma and your talent\n\nBut you won't find it at a workshop. It won't come to you on a vision board. Mantras and affirmations are insufficient to conjure this peculiar thing. Your Special Purpose lives at the intersection of the timeless and the timebound — and you have spent this entire journey standing at that intersection.",
    },
    {
      id: "m6-intro-4",
      type: "quote",
      quote: {
        text: "Your own self-actualization is compulsory. If you don't self-actualize, the universe is less without your participation.",
        author: "Ikigai Philosophy",
      },
    },
    {
      id: "m6-intro-5",
      type: "paragraph",
      content:
        "Competition becomes an obsolete concept when everyone identifies their unique role — as an emergent property of the whole, as an interconnected part of the universe with a unique contribution to make. When you find your gift, you are not competing with anyone. You are offering something that only you can give.",
    },
  ],

  completionMessage:
    "You have completed the Ikigai Journey. You now hold a purpose statement that emerged from the deepest parts of yourself — your passions, your wounds, your fears, your place in the world, and the story of your life. This is not a final answer. It is a living compass. Return to it, refine it, and let it guide your choices. The world needs what you have to give.",

  steps: [
    // ── Step 1: The Seven Mission Questions ──
    {
      id: "m6-step-1",
      title: "Your Mission — Seven Questions",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m6-s1-c1",
          type: "paragraph",
          content:
            "Before the AI synthesizes your journey, let's ground your purpose through seven focused questions. These questions have been used by purpose coaches worldwide to help people articulate their mission clearly and concretely.",
        },
        {
          id: "m6-s1-c2",
          type: "callout",
          content:
            "Answer these questions drawing on everything you have explored in the previous five modules. Let your earlier reflections inform your answers here. This is where your inner exploration meets concrete intention.",
        },
      ],
      exercises: [
        {
          id: "m6-e1",
          type: "freetext",
          prompt: "What is the problem you are seeing in the world?",
          guidance:
            "Draw on Module 4 (What the World Needs) and Module 2 (What Bothers You). Name the specific problem that calls to you.",
          placeholder: "Name the problem...",
        },
        {
          id: "m6-e2",
          type: "freetext",
          prompt: "What are you intending to fix or contribute to?",
          guidance:
            "Not the entire problem — your specific piece of it. What is your angle of contribution?",
          placeholder: "Describe your intended contribution...",
        },
        {
          id: "m6-e3",
          type: "freetext",
          prompt:
            "Why are you doing this? And why is that? And why is that?",
          guidance:
            "Ask yourself 'why' at least three times. Each answer peels back a layer. The third 'why' usually reveals the real reason.",
          placeholder:
            "Layer 1: I'm doing this because...\nLayer 2: And that matters because...\nLayer 3: And at the deepest level, it's because...",
          followUpPrompt:
            "That third layer — does it connect to something you wrote in Module 2 about your personal suffering or Module 1 about what excites you?",
        },
        {
          id: "m6-e4",
          type: "freetext",
          prompt:
            "What in your past experience makes you passionate about this?",
          guidance:
            "Draw on Module 5 (Your Story). What life experiences have uniquely prepared you for this contribution?",
          placeholder: "Connect your past to your purpose...",
        },
        {
          id: "m6-e5",
          type: "freetext",
          prompt: "What would the best version of yourself look like?",
          guidance:
            "Imagine yourself fully expressed, fully alive, fully contributing. Not perfect — but real and purposeful. What does that look like?",
          placeholder: "Describe your best, most authentic self...",
        },
        {
          id: "m6-e6",
          type: "freetext",
          prompt:
            "How are you different from other people working on similar things?",
          guidance:
            "This is about your specific knowledge — the kind that cannot be trained for. What unique combination of experience, perspective, and passion do you bring?",
          placeholder: "Describe your unique angle...",
        },
        {
          id: "m6-e7",
          type: "freetext",
          prompt:
            "Is your mission narrow enough to differentiate you? Can you make it more specific?",
          guidance:
            "A mission that tries to do everything does nothing. The more specific your purpose, the more powerful it becomes. Try to narrow it to one sentence.",
          placeholder: "Refine and narrow your mission...",
        },
      ],
    },

    // ── Step 2: The Three Pillars ──
    {
      id: "m6-step-2",
      title: "Sovereignty, Right Relationship, Coherence",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m6-s2-c1",
          type: "heading",
          heading: "The Three Pillars of Mature Purpose",
          level: 2,
        },
        {
          id: "m6-s2-c2",
          type: "framework",
          content:
            "A new kind of humanity wants to emerge, and for those with ears to hear, it is calling from the future. Three pillars support this emergence:\n\nSovereignty: Knowing when you are able to respond to the world and when you are merely reacting — and learning how to grow this capacity to respond into ever greater scope and strength. This involves integrity, discernment, and embodiment.\n\nRight Relationship: Finding your right place in the bigger story. Becoming clear on who you are in your deepest, most authentic self and learning how to show up in the many different relationships that make up your lived world. It involves discovering your vocation — that which is both most meaningful for you to gift to the world and which you are most singularly prepared to give.\n\nCoherence: Entering into a relationship where the whole is simultaneously much more than the sum of the individuals and the individuals are much more themselves for being part of the whole. It involves humility, gratitude, and surrendering yourself into something higher than yourself while simultaneously becoming most fully grounded in your most singular self.",
        },
      ],
      exercises: [
        {
          id: "m6-e8",
          type: "freetext",
          prompt:
            "Sovereignty: Where in your life do you respond with wisdom, and where do you merely react? What would it look like to strengthen your capacity to respond?",
          guidance:
            "Think about situations that trigger you. Where do you lose your center? Where do you hold it?",
          placeholder: "Reflect on your sovereignty...",
        },
        {
          id: "m6-e9",
          type: "freetext",
          prompt:
            "Right Relationship: What is your right place in the bigger story? What role is yours to play — not someone else's?",
          guidance:
            "Draw on your archetype from Module 5. What is uniquely yours to give?",
          placeholder: "Reflect on your right place...",
        },
        {
          id: "m6-e10",
          type: "freetext",
          prompt:
            "Coherence: What larger whole do you want to be part of? What community, cause, or mission is greater than yourself but needs exactly what you carry?",
          guidance:
            "Purpose is never purely individual. It always connects you to something larger. What is that larger thing for you?",
          placeholder: "Reflect on where you belong...",
          followUpPrompt:
            "If sovereignty, right relationship, and coherence were all fully alive in you — what would your life look like? What would you be doing?",
        },
      ],
    },

    // ── Step 3: The Synthesis ──
    {
      id: "m6-step-3",
      title: "Your Ikigai",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m6-s3-c1",
          type: "heading",
          heading: "The Moment of Synthesis",
          level: 2,
        },
        {
          id: "m6-s3-c2",
          type: "paragraph",
          content:
            "Everything you have written across six modules — your passions, wounds, fears, the world's needs that call to you, your life story, your archetype, your mission answers, and your three pillars — will now be synthesized into your Ikigai: your reason for being. This is not a slogan or a tagline. It is a living compass.",
        },
        {
          id: "m6-s3-c3",
          type: "quote",
          quote: {
            text: "Imagination is the matrix of reality. Everything that exists for us in this world begins in someone's imagination.",
            author: "David Spangler",
          },
        },
        {
          id: "m6-s3-c4",
          type: "callout",
          content:
            "When you click 'Generate My Ikigai,' the AI will read everything you have shared across all six modules and craft a personalized purpose statement. This statement is a starting point — not a final answer. You can refine it, return to it, and let it evolve as you do.",
        },
      ],
      exercises: [
        {
          id: "m6-e11",
          type: "freetext",
          prompt:
            "Before the AI synthesizes your journey — try writing your own purpose statement first. In one to three sentences, describe your reason for being.",
          guidance:
            "Don't try to be perfect. Just try to be honest. You can compare this with what the AI generates and refine from there.",
          placeholder:
            "My purpose is to...",
          followUpPrompt:
            "Now let's see what emerges when the AI synthesizes everything you've shared across the entire journey. Click 'Generate My Ikigai' below.",
        },
      ],
    },
  ],
};
