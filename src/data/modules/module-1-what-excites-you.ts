// ============================================================
// Module 1: What Excites You — SEED MY ELEMENT
// Inward Journey — Passion Discovery
// ============================================================

import { ModuleData } from "../types";

export const module1: ModuleData = {
  id: 1,
  slug: "what-excites-you",
  title: "What Excites You",
  subtitle: "Discovering what makes you come alive",
  journeyPhase: "inward",
  icon: "flame",
  themeColor: "#d97706",
  outputLabel: "Your Passion Inventory",

  introduction: [
    {
      id: "m1-intro-1",
      type: "heading",
      heading: "Seed My Element",
      level: 1,
    },
    {
      id: "m1-intro-2",
      type: "paragraph",
      content:
        "Each of us, with no exception, is born with a purpose to co-create the world with what we are meant to give during our lifetime. And so, it is only through finding what we are meant to give that we can find our Ikigai: Our Reason for Being.",
    },
    {
      id: "m1-intro-3",
      type: "paragraph",
      content:
        "So knowing yourself and following your mission is the beginning of all wisdom and constitutes an essential asset to release the desire of the soul. There is no need to wonder for a long time about the nature of what one experiences when one feels invaded by a persistent inclination, a recurring interest, a tenacious fascination for a certain kind of life or for a particular activity. Such attraction undoubtedly reveals the existence of a mission and its profile.",
    },
    {
      id: "m1-intro-4",
      type: "quote",
      quote: {
        text: "Ask yourself what makes you come alive, and go and do more of that, because what the world needs is more of us, all of us to come alive!",
        author: "Howard Thurman",
      },
    },
    {
      id: "m1-intro-5",
      type: "callout",
      content:
        "Research shows that 70% of employees endure their jobs rather than enjoy them. People who report having a clear sense of purpose have improved life expectancy, reduced risk of heart attack and stroke, and are 2.4 times less likely to develop Alzheimer's disease. This journey is not a luxury — it is essential.",
    },
    {
      id: "m1-intro-6",
      type: "paragraph",
      content:
        "In this first module, we will explore what truly excites you — not what you think should excite you, not what looks impressive on a resume, but the real, honest inclinations of your soul. We will move through your passions, your childhood dreams, and the deeper spiritual aspirations hiding beneath the surface.",
    },
  ],

  completionMessage:
    "You have begun to map the landscape of what makes you come alive. These passions, interests, and metapassions are the raw material of your purpose. Hold onto them — they will become clearer as you continue the journey inward.",

  steps: [
    // ── Step 1: What Is Passion? ──
    {
      id: "m1-step-1",
      title: "What Is Passion?",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m1-s1-c1",
          type: "paragraph",
          content:
            "Guidance counselors and career advisors make extensive use of tests to identify talents and aptitudes. Although these tests produce interesting results, they do not fully reveal your personal mission. The most telling clue of your direction is your passion.",
        },
        {
          id: "m1-s1-c2",
          type: "framework",
          content:
            "Passion is \"a strong inclination towards an object that one pursues, to which one clings with all one's might.\" It is more than a trend, an interest, or a propensity. It is distinguished by a strong emotional intensity. Its effects are manifold: it gives a feeling of living in fullness, to the point of feeling overwhelmed. It produces a very feverish state of excitement as well as a state of flow. It prompts you to concentrate all your efforts on the object of your attachment. It leads you to forget the daily grind, your worries, your human relationships and even your most basic biological needs.",
        },
        {
          id: "m1-s1-c3",
          type: "quote",
          quote: {
            text: "Follow your bliss. If you do, you will find yourself following the path that has always been there deep within.",
            author: "Joseph Campbell",
            source: "The Power of Myth, 1988",
          },
        },
        {
          id: "m1-s1-c4",
          type: "paragraph",
          content:
            "Indeed, whoever follows their passion will not be able to miss their life. On the other hand, whoever refuses runs the risk of falling into boredom. This is not about reckless abandon — it is about honest attention to what genuinely moves you.",
        },
      ],
      exercises: [
        {
          id: "m1-e1",
          type: "freetext",
          prompt: "What is it that really keeps you alive — and not just makes a living?",
          guidance:
            "Don't think about job titles or what's practical. Think about what fills you with energy. What would you do even if nobody paid you?",
          placeholder:
            "Write freely here. There are no wrong answers...",
          followUpPrompt:
            "Tell me more about why this feels alive for you. When did you first notice this pull?",
        },
        {
          id: "m1-e2",
          type: "freetext",
          prompt: "What hobby or activity are you most passionate about?",
          guidance:
            "This could be something you currently do, something you used to do, or something you keep wanting to start.",
          placeholder: "Describe the activity and what it means to you...",
        },
        {
          id: "m1-e3",
          type: "freetext",
          prompt:
            "What topics do you naturally gravitate toward — in bookstores, podcasts, conversations? What could you explore for hours?",
          guidance:
            "Your natural curiosities — the things you gravitate toward without being told to — are breadcrumbs from your deeper self. Think about the subjects that light you up.",
          placeholder: "List the topics, genres, or subjects that pull you in...",
        },
      ],
    },

    // ── Step 2: Flow States ──
    {
      id: "m1-step-2",
      title: "When Does Time Disappear?",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m1-s2-c1",
          type: "paragraph",
          content:
            "Psychologist Mihaly Csikszentmihalyi described \"flow\" as a state of complete absorption in an activity — where you are fully engaged and not thinking about anything else. Flow is one of the strongest signals that you are touching something essential about who you are.",
        },
        {
          id: "m1-s2-c2",
          type: "callout",
          content:
            "Flow is not about what looks productive from the outside. It is about what feels effortless from the inside — the activity where challenge meets skill and the self temporarily dissolves into the work.",
        },
      ],
      exercises: [
        {
          id: "m1-e4",
          type: "freetext",
          prompt:
            "With what activities do you experience flow? When does your time fly?",
          guidance:
            "Think of an activity where you feel fully engaged and won't be thinking about anything else while doing it. Where challenge meets your skill and you lose yourself.",
          placeholder:
            "Describe activities where you lose track of time...",
          followUpPrompt:
            "What is it about this activity that pulls you in so completely? Is it the creation, the problem-solving, the connection, or something else?",
        },
        {
          id: "m1-e5",
          type: "freetext",
          prompt:
            "What do you find easy to do that others seem to struggle with?",
          guidance:
            "Sometimes our gifts are invisible to us precisely because they come naturally. What feels obvious to you that others find impressive or difficult?",
          placeholder:
            "Think about compliments you've received or tasks others ask you for help with...",
        },
      ],
    },

    // ── Step 3: The Dreams of Adolescence ──
    {
      id: "m1-step-3",
      title: "The Dreams of Adolescence",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m1-s3-c1",
          type: "paragraph",
          content:
            "Adolescence is a time of great intuitions about the future. As writer Joseph Chilton Pearce wrote: \"Adolescents have a sense of a unique greatness hidden within them. This is the age of heroes and heroines. They have an immense fear of wrong orientation and of missing their precious life.\"",
        },
        {
          id: "m1-s3-c2",
          type: "paragraph",
          content:
            "Despite the strength of their aspirations, young people often feel unable to define their dreams of greatness or are discouraged from ever achieving them. Disappointed, some even go so far as to give up entirely. It is not uncommon for childhood dreams to fade under the weight of everyday concerns. Too bad, because they hid a presentiment of their mission.",
        },
        {
          id: "m1-s3-c3",
          type: "quote",
          quote: {
            text: "The unrealized dreams of youth always come back to haunt us.",
            author: "Jackson Brown",
          },
        },
      ],
      exercises: [
        {
          id: "m1-e6",
          type: "freetext",
          prompt:
            "What did you love doing when you were a child? What did you dream of becoming?",
          guidance:
            "Go back before the world told you what was realistic. What did you naturally gravitate toward? What did you pretend to be?",
          placeholder:
            "Recall your childhood fascinations and dreams...",
          followUpPrompt:
            "Is there a thread connecting those childhood dreams to anything you still feel drawn to today?",
        },
        {
          id: "m1-e7",
          type: "freetext",
          prompt:
            "Who were your heroes growing up? What people around you influenced you the most?",
          guidance:
            "The people we admire reveal what we value. Think about fictional characters, real people, family members, teachers.",
          placeholder: "List your heroes and what you admired about them...",
        },
        {
          id: "m1-e8",
          type: "freetext",
          prompt:
            "What types of people did you especially NOT want to become? What forms of work repelled you?",
          guidance:
            "What you reject is just as revealing as what you desire. Your aversions contain information about your authentic direction.",
          placeholder:
            "Describe the kinds of lives or careers that felt wrong to you...",
        },
      ],
    },

    // ── Step 4: Your Metapassions ──
    {
      id: "m1-step-4",
      title: "Your Metapassions",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m1-s4-c1",
          type: "heading",
          heading: "The Deeper Aspirations Beneath the Surface",
          level: 2,
        },
        {
          id: "m1-s4-c2",
          type: "framework",
          content:
            "Within any impulse of passion hides more subtle states of mind referred to as metapassions. They correspond to the deeper aspirations of the soul. The one who has a passion for painting surely possesses the metapassions of beauty and creativity. The one who loves cycling holds the metapassion of surpassing themselves. The one drawn to exotic travel carries the metapassion of knowing different cultures. The one who collaborates with those from different backgrounds holds the metapassion of unconditional love. Whatever activity you enjoy, it conceals one or more of the spiritual aspirations of your soul.",
        },
        {
          id: "m1-s4-c3",
          type: "paragraph",
          content:
            "Abraham Maslow called these deeper drives 'Being-values' or B-values — the ultimate motivations that emerge when basic needs are met: perfection, truth, beauty, goodness, unity, aliveness, justice, simplicity, playfulness. He found that self-actualizing people are not driven by deficiency but by these meta-motivations — and that pursuing them is what eventually leads beyond self-actualization into self-transcendence.",
        },
        {
          id: "m1-s4-c4",
          type: "callout",
          content:
            "Metapassions are the WHY behind the WHAT. They are the spiritual fuel that powers your surface interests. Identifying them helps you see the common thread running through seemingly different passions.",
        },
      ],
      exercises: [
        {
          id: "m1-e9",
          type: "multiselect",
          prompt:
            "Which of these metapassions resonate most strongly with you? Select all that feel true.",
          guidance:
            "Don't overthink this. Go with your gut. Which words make you feel something?",
          options: [
            { id: "mp-beauty", label: "Beauty", description: "A drive toward aesthetic experience, harmony, and creating or appreciating what is beautiful" },
            { id: "mp-truth", label: "Truth", description: "A need to understand, to see clearly, to cut through illusion and know what is real" },
            { id: "mp-justice", label: "Justice", description: "A pull toward fairness, equality, and righting what is wrong in the world" },
            { id: "mp-freedom", label: "Freedom", description: "A need for autonomy, self-direction, and liberation from constraint" },
            { id: "mp-connection", label: "Connection", description: "A deep desire to relate, to belong, to bridge the space between people" },
            { id: "mp-creation", label: "Creation", description: "A drive to make something new — to bring into existence what did not exist before" },
            { id: "mp-healing", label: "Healing", description: "A pull toward mending what is broken — in people, systems, or the natural world" },
            { id: "mp-mastery", label: "Mastery", description: "A drive to excel, to push limits, to develop deep expertise and surpass yourself" },
            { id: "mp-discovery", label: "Discovery", description: "A fascination with the unknown — exploration, research, uncovering what is hidden" },
            { id: "mp-love", label: "Love", description: "An unconditional care and devotion — a desire to serve others out of deep compassion" },
            { id: "mp-wisdom", label: "Wisdom", description: "A search for deeper understanding that integrates knowledge with lived experience" },
            { id: "mp-transcendence", label: "Transcendence", description: "A longing to go beyond the ordinary — to touch the sacred, the mystical, the infinite" },
          ],
          minSelections: 1,
          maxSelections: 4,
        },
        {
          id: "m1-e10",
          type: "freetext",
          prompt:
            "Forget your job title. Ask yourself: what do you do that adds remarkable, distinctive value? What have you accomplished that you can unabashedly brag about?",
          guidance:
            "This is not about modesty. This is about honestly recognizing where your unique contribution shows up. What are you most proud of?",
          placeholder:
            "Describe your most meaningful accomplishments and unique contributions...",
        },
      ],
    },

    // ── Step 5: Synthesis ──
    {
      id: "m1-step-5",
      title: "Seeing the Pattern",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m1-s5-c1",
          type: "quote",
          quote: {
            text: "Now is the time to get serious about living your ideals. How long can you afford to put off who you really want to be? Your nobler self cannot wait any longer. Put your principles into practice — now. Stop the excuses and the procrastination. This is your life. Decide to be extraordinary and do what you need to do — now.",
            author: "Epictetus",
          },
        },
        {
          id: "m1-s5-c2",
          type: "paragraph",
          content:
            "You have now explored what makes you come alive from multiple angles: your passions, your flow states, your childhood dreams, and the metapassions beneath it all. Before moving on, take a moment to look at everything you have written and see if a pattern emerges.",
        },
      ],
      exercises: [
        {
          id: "m1-e11",
          type: "freetext",
          prompt:
            "Looking at everything you've written in this module — what themes or patterns do you notice? What keeps showing up?",
          guidance:
            "Read back through your responses. Notice recurring words, feelings, or ideas. The pattern does not need to be neat — just honest.",
          placeholder:
            "Describe the threads you see connecting your answers...",
          followUpPrompt:
            "If you had to describe your 'element' — the environment or activity where you are most naturally yourself — what would it be?",
        },
      ],
    },
  ],
};
