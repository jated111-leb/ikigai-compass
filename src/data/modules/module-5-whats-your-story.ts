// ============================================================
// Module 5: What's Your Story — INDIVIDUATION & THE SELF
// Outward Journey — Life Story & Archetype Discovery
// ============================================================

import { ModuleData } from "../types";

export const module5: ModuleData = {
  id: 5,
  slug: "whats-your-story",
  title: "What's Your Story",
  subtitle: "Reconstructing your life narrative to discover your authentic self",
  journeyPhase: "outward",
  icon: "scroll",
  themeColor: "#2563eb",
  outputLabel: "Your Life Pattern & Archetype",

  introduction: [
    {
      id: "m5-intro-1",
      type: "heading",
      heading: "Individuation & The Self",
      level: 1,
    },
    {
      id: "m5-intro-2",
      type: "paragraph",
      content:
        "Carl Jung called it individuation: the process of becoming fully yourself by integrating the conscious and unconscious aspects of your psyche. It is the journey of stripping away the roles, expectations, and identities that were given to you — and discovering the self that was there all along.",
    },
    {
      id: "m5-intro-3",
      type: "quote",
      quote: {
        text: "The goal of identity (self-actualization) seems to be simultaneously an end-goal in itself, and also a transitional goal, a rite of passage, a step along the path to the transcendence of identity.",
        author: "Abraham Maslow",
        source: "Peak-Experiences as Acute Identity Experiences, 1961",
      },
    },
    {
      id: "m5-intro-4",
      type: "paragraph",
      content:
        "In this module, you will reconstruct your life story — not as a resume, but as a narrative of becoming. You will look for patterns, turning points, and recurring themes. Then you will discover which archetypal pattern your life most closely mirrors. This is not a personality test — it is a recognition exercise. You already are who you are. We are just naming it.",
    },
    {
      id: "m5-intro-5",
      type: "paragraph",
      content:
        "Far too many in this world never actually become real — they remain reflections of friends, shadows of family, and imitations of those they would strive to impress. This module is about becoming real.",
    },
  ],

  completionMessage:
    "You have reconstructed your story, identified your patterns, and met your archetype. You are no longer defined by what others expected of you — you are defined by what you have discovered to be true. One module remains: the synthesis of everything into your Ikigai.",

  steps: [
    // ── Step 1: Disidentification ──
    {
      id: "m5-step-1",
      title: "Stripping Away the Masks",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m5-s1-c1",
          type: "paragraph",
          content:
            "Before we can discover who we truly are, we must see clearly who we have been pretending to be. We all carry identities that were given to us — by family, culture, career, society. Some of these identities served us well. Others became cages. Individuation begins with the courage to question: which parts of my identity are authentically mine, and which were imposed?",
        },
        {
          id: "m5-s1-c2",
          type: "framework",
          content:
            "Robert Kegan's research on adult development reveals three stages most relevant to this work:\n\nStage 3 — The Socialized Mind (58% of adults): 'I am my relationships. I follow the rules. My identity comes from belonging.' At this stage, we define ourselves through the expectations of others.\n\nStage 4 — The Self-Authoring Mind (35% of adults): 'I have an identity. I make choices. I question expectations and values. I create my own sense of authority.' This is where individuation begins.\n\nStage 5 — The Self-Transforming Mind (1% of adults): 'I hold many identities. I embrace paradox. I see myself as part of larger systems.' This is where purpose transcends the personal.",
        },
        {
          id: "m5-s1-c3",
          type: "quote",
          quote: {
            text: "Who is driving your life? Is the calmer, wiser Higher Self in charge, or are you driven by an immature, short-sighted ego and the beliefs and ideals of others?",
            author: "Adult Development Framework",
          },
        },
      ],
      exercises: [
        {
          id: "m5-e1",
          type: "freetext",
          prompt:
            "What roles and identities do you currently carry? List them all — professional, relational, cultural, social.",
          guidance:
            "Examples: father, engineer, eldest child, 'the responsible one,' Lebanese, entrepreneur, caretaker, the funny one. List every identity you can think of.",
          placeholder:
            "List all the roles and identities you carry...",
        },
        {
          id: "m5-e2",
          type: "freetext",
          prompt:
            "Which of these identities feel authentically yours — and which were given to you by others? Which ones would you keep if no one was watching?",
          guidance:
            "Be honest. Some identities you carry out of love, some out of habit, some out of fear. Which ones are truly you?",
          placeholder:
            "Separate the authentic from the imposed...",
          followUpPrompt:
            "For the identities that feel imposed — what would it mean to let them go? What are you afraid would happen?",
        },
        {
          id: "m5-e3",
          type: "multiselect",
          prompt:
            "Which of Kegan's stages feels most like where you are right now?",
          guidance:
            "There's no 'right' answer. Most adults are at Stage 3 or transitioning to Stage 4. This is about honest self-location.",
          options: [
            { id: "kegan-3", label: "Stage 3 — Socialized Mind", description: "I define myself largely through my relationships and the expectations others have of me. I follow the rules of my community." },
            { id: "kegan-3-4", label: "Transitioning from 3 to 4", description: "I'm beginning to question expectations I've always followed. I feel tension between who I've been and who I'm becoming." },
            { id: "kegan-4", label: "Stage 4 — Self-Authoring Mind", description: "I have developed my own internal compass. I make choices based on my own values, even when they conflict with others' expectations." },
            { id: "kegan-4-5", label: "Transitioning from 4 to 5", description: "I'm starting to hold multiple perspectives simultaneously. I see my own identity as more fluid and interconnected than I once did." },
          ],
        },
        {
          id: "m5-e4",
          type: "freetext",
          prompt:
            "How did your family stand out from others in your community? What story did your family tell about itself — and how has that story shaped yours?",
          guidance:
            "Every family carries a narrative: 'We are the hardworking ones,' 'We are the creative ones,' 'We survive.' Your family's story is the first layer of your own identity. Which parts of it did you adopt? Which parts did you rebel against?",
          placeholder:
            "Describe your family's story and how it shaped your own...",
        },
        {
          id: "m5-e5",
          type: "freetext",
          prompt:
            "Are your beliefs and ethics rooted in deep introspection — or were they adopted from the larger narrative of your society, your family, your peers?",
          guidance:
            "This is the critical thinker's question. To find the superior and unique within yourself, you need to step away from the herd and question everything you held to be true. This fierce inquiry may lead to some alienation — but it is the essential starter to knowing who you truly are.",
          placeholder:
            "Examine which of your beliefs are truly yours vs. inherited...",
          followUpPrompt:
            "What is one belief you held for years that you now realize was never really yours? Where did it come from?",
        },
      ],
    },

    // ── Step 2: Your Life Timeline ──
    {
      id: "m5-step-2",
      title: "Your Life Timeline",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m5-s2-c1",
          type: "heading",
          heading: "Mapping the Story So Far",
          level: 2,
        },
        {
          id: "m5-s2-c2",
          type: "paragraph",
          content:
            "Your life is not a random sequence of events. When you step back and look at it as a whole, patterns emerge — recurring themes, pivotal moments, and a direction that was always there, even when you couldn't see it. In this exercise, you will build a timeline of the moments that shaped you.",
        },
        {
          id: "m5-s2-c3",
          type: "callout",
          content:
            "Add the events that truly mattered — not the ones that look good on a resume. Include losses, discoveries, relationships, failures, awakenings. Tag each event as positive, negative, or transformative. Look for the story your life has been telling.",
        },
      ],
      exercises: [
        {
          id: "m5-e6",
          type: "timeline",
          prompt:
            "Build your life timeline. Add the key moments that shaped who you are — the events that changed your direction, opened your eyes, broke you down, or built you up.",
          guidance:
            "Include: childhood memories that stuck, adolescent turning points, major life decisions, losses, discoveries, relationships that changed you, moments of clarity or confusion. For each event, tag it as positive, negative, or transformative.",
        },
        {
          id: "m5-e7",
          type: "freetext",
          prompt:
            "Looking at your timeline — what patterns do you see? What themes repeat across different stages of your life?",
          guidance:
            "Step back and look at the whole thing. Is there a pattern of seeking? Of loss and renewal? Of building and breaking? Of helping? Of creating? Name the recurring theme.",
          placeholder:
            "Describe the patterns you see in your life story...",
          followUpPrompt:
            "If your life so far were a chapter in a larger story — what would the chapter title be? And what do you think the next chapter is about?",
        },
        {
          id: "m5-e8",
          type: "freetext",
          prompt:
            "Now look forward. What are your dreams for the future — the ones that would make your life truly amazing? List them freely, without filtering for what's 'realistic.'",
          guidance:
            "Knowing your personal dreams provides insight into who you are. This list will shift and alter over time — that's fine. Right now, just let yourself want what you want. Include everything: experiences, achievements, ways of living, relationships, contributions.",
          placeholder:
            "My dreams for the future...",
        },
      ],
    },

    // ── Step 3: Archetype Discovery ──
    {
      id: "m5-step-3",
      title: "Your Archetype",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m5-s3-c1",
          type: "heading",
          heading: "Which Pattern Do You Carry?",
          level: 2,
        },
        {
          id: "m5-s3-c2",
          type: "paragraph",
          content:
            "Archetypes are universal patterns of human vocation — recurring modes of being that appear across cultures and throughout history. They are not personality types or labels. They are patterns of purpose — ways of being in the world that carry specific gifts and specific callings. You likely carry a blend of two or three, with one dominant.",
        },
        {
          id: "m5-s3-c3",
          type: "paragraph",
          content:
            "Based on everything you have shared throughout this journey — your passions, your wounds, your fears, the world needs that call to you, and the story of your life — an archetypal pattern will emerge. Browse the archetypes below and notice which ones resonate most deeply.",
        },
        {
          id: "m5-s3-c4",
          type: "callout",
          content:
            "This is not a quiz with a single right answer. Read all twelve archetypes. Notice which descriptions make you feel recognized — as if someone finally named what you have always been. Select up to three.",
        },
      ],
      exercises: [
        {
          id: "m5-e9",
          type: "card_select",
          prompt:
            "Browse the twelve archetypes below. Select the ones that resonate most strongly — the ones where you think: 'Yes, this is me.' Select up to 3.",
          guidance:
            "Read the full description of each. Pay attention to your emotional response, not just your intellectual agreement. The one that gives you chills is probably yours.",
          maxSelections: 3,
          minSelections: 1,
        },
        {
          id: "m5-e10",
          type: "freetext",
          prompt:
            "Why did you choose these archetypes? What about each one feels true to your experience?",
          guidance:
            "Connect the archetype to your actual life. Give examples. When have you lived this pattern?",
          placeholder:
            "Explain your connection to each archetype you selected...",
          followUpPrompt:
            "If these archetypes had to work together as a team inside you — what kind of mission would they naturally pursue?",
        },
        {
          id: "m5-e11",
          type: "freetext",
          prompt:
            "If you had to describe in three lines what makes you an original and unique being in the world — what would you say? Which of your qualities would you emphasize?",
          guidance:
            "Think about the intersection of your strengths, your experiences, and your archetype. What combination exists in you that exists in no one else? Intelligence, perseverance, helpfulness, humor, sensitivity, power, loyalty, creativity — what is your unique blend?",
          placeholder:
            "Describe what makes you unique in three lines...",
        },
      ],
    },

    // ── Step 4: Your Authentic Identity ──
    {
      id: "m5-step-4",
      title: "Who You Really Are",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m5-s4-c1",
          type: "paragraph",
          content:
            "Gradually, you start to understand your part in the theatre of earthly affairs. Not the role that someone else told you that you should have — the role you chose for yourself, the role that your soul already knows it wishes to play.",
        },
        {
          id: "m5-s4-c2",
          type: "quote",
          quote: {
            text: "There is a mysterious concordance between the movements of the soul and the calls of the universe.",
            author: "Carl Jung",
          },
        },
      ],
      exercises: [
        {
          id: "m5-e12",
          type: "freetext",
          prompt:
            "Imagine your own eulogy. A close family member, a dear friend, and a colleague each speak about you. What qualities does your relative emphasize? How does your friend describe your human relationships? What does your colleague say about working with you?",
          guidance:
            "This exercise comes from Stephen Covey. It is not morbid — it is clarifying. By imagining what you want people to say about you at the end, you discover what truly matters to you now. Write what you would want them to honestly say.",
          placeholder:
            "Family member says...\nFriend says...\nColleague says...",
          followUpPrompt:
            "Is the person they are describing the person you are currently being? Where is the gap?",
        },
        {
          id: "m5-e13",
          type: "freetext",
          prompt:
            "Based on everything you've explored — your passions, wounds, fears, the world's needs, your life story, and your archetype — who are you, really? Describe yourself as if introducing your deepest self to someone who truly wants to know.",
          guidance:
            "Not your job title. Not your roles. The essence of who you are and what you are here to do. Write from the heart.",
          placeholder:
            "Introduce your authentic self...",
          followUpPrompt:
            "How does it feel to read what you just wrote? Does it feel true?",
        },
      ],
    },
  ],
};
