// ============================================================
// Module 3: My Fears — OBSTACLES & RESISTANCE
// Inward Journey — Fear Inventory & Reframing
// ============================================================

import { ModuleData } from "../types";

export const module3: ModuleData = {
  id: 3,
  slug: "my-fears",
  title: "My Fears",
  subtitle: "Naming your obstacles and reclaiming the energy they hold",
  journeyPhase: "inward",
  icon: "shield",
  themeColor: "#dc2626",
  outputLabel: "Your Fear Inventory & Reframes",

  introduction: [
    {
      id: "m3-intro-1",
      type: "heading",
      heading: "My Fears & Obstacles",
      level: 1,
    },
    {
      id: "m3-intro-2",
      type: "paragraph",
      content:
        "You have now explored what excites you and what pains you. Before we turn outward, there is one more essential step: confronting what stands in the way. Every person who has ever pursued a meaningful life has encountered fear — not as a sign they are on the wrong path, but often as proof they are on the right one.",
    },
    {
      id: "m3-intro-3",
      type: "paragraph",
      content:
        "This journey will give you the strength of breaking the cycles of identical mistakes we commit in life — the ones that lead us to feel that we have no control over our fate. Then you won't be a slave to your instincts, fears, or the societal codes.",
    },
    {
      id: "m3-intro-4",
      type: "quote",
      quote: {
        text: "We should not, like sheep, follow the herd of creatures in front of us, making our way where others go, not where we ought to go.",
        author: "Seneca",
      },
    },
    {
      id: "m3-intro-5",
      type: "paragraph",
      content:
        "In this module, we will build your fear inventory — not to eliminate fear, but to see it clearly. Once named and understood, fear loses much of its power. What remains is information: a map of what matters to you so much that you are afraid to lose it, fail at it, or be judged for pursuing it.",
    },
  ],

  completionMessage:
    "You have named your fears, identified the beliefs behind them, and begun the work of reframing. Fear does not disappear — but it no longer runs the show. You have completed the Inward Journey. You now know what excites you, what pains you, and what scares you. This is the foundation. Now we turn outward.",

  steps: [
    // ── Step 1: Three Categories of Obstacles ──
    {
      id: "m3-step-1",
      title: "Real Difficulties, False Beliefs, Psychological Resistance",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m3-s1-c1",
          type: "framework",
          content:
            "Obstacles to pursuing your mission generally fall into three categories:\n\n1. Real Difficulties — genuine external constraints: lack of money, family obligations, health issues, limited access to education or opportunity. These are real and must be acknowledged.\n\n2. False Beliefs — stories you tell yourself that feel like facts: 'I'm not smart enough,' 'People like me don't do that,' 'It's too late.' These are powerful but not true.\n\n3. Psychological Resistance — the deeper, often unconscious forces that keep you stuck: fear of success, fear of being seen, self-sabotage, comfort with the familiar. These are the hardest to spot because they disguise themselves as reason.",
        },
        {
          id: "m3-s1-c2",
          type: "quote",
          quote: {
            text: "Others' opinion of you does not have to become your reality.",
            author: "Les Brown",
          },
        },
      ],
      exercises: [
        {
          id: "m3-e1",
          type: "freetext",
          prompt:
            "What real, practical difficulties stand between you and the life you described in Module 1? Be specific.",
          guidance:
            "Not every limit is a lie. Some walls are real — a body's actual capacity, an obligation you have freely chosen, the hours the day actually contains — and honesty about these is not defeat; it is the ground beneath any serious plan. But many of the walls we live behind were painted onto open air long ago, and we stopped testing them because testing them felt dangerous. For now, name only the genuine constraints — not the stories. Financial obligations, location, health, dependents, time. We will separate the real walls from the painted ones as we go.",
          placeholder:
            "List the real, tangible obstacles you face...",
        },
        {
          id: "m3-e2",
          type: "freetext",
          prompt:
            "What beliefs do you hold about yourself that might be limiting you? What stories do you repeat about what you can or cannot do?",
          guidance:
            "Robert Kegan drew a line that, once seen, is hard to unsee: the difference between a belief you have and a belief that has you. A belief you can hold at arm's length and turn over — that one you have. A belief you cannot see because you are looking through it — that one has you. This is why a limiting belief almost never announces itself as a belief; it arrives wearing the clothes of plain fact: 'this is just how the world is, this is just who I am.' So write them down exactly as your inner voice says them — and notice which ones you've never once questioned.",
          placeholder:
            "Write down the limiting beliefs as they sound in your head...",
          followUpPrompt:
            "For each belief you listed — when did you first start believing this? Say it aloud, then ask: whose voice is that? Where did you first hear it, and what were they afraid of when they taught it to you?",
        },
        {
          id: "m3-e3",
          type: "freetext",
          prompt:
            "Have you ever been close to a breakthrough — close to pursuing something meaningful — and pulled back? What happened?",
          guidance:
            "Steven Pressfield gave this force a name — Resistance — and noticed it is not random: the more an act matters to the life you are actually meant to live, the more Resistance you feel before it. Seen this way, the pull-back is a compass needle swinging toward true north. Kegan and Lahey found something just as dignified underneath self-sabotage: beside the goal you announce sits a hidden, competing commitment — one foot on the gas, one foot on the brake — and the brake is usually not laziness but loyalty to something you are quietly afraid to lose. The moment you could have leaped but didn't is rich data. What stopped you — and what was it protecting?",
          placeholder:
            "Describe times you pulled back from your own potential...",
        },
      ],
    },

    // ── Step 2: The Fear Inventory ──
    {
      id: "m3-step-2",
      title: "Naming Your Fears",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m3-s2-c1",
          type: "paragraph",
          content:
            "The opinion of others is an important factor in persevering in one's mission or in abandoning it. The possible rejection of close friends awakens old fears of being abandoned that date back to childhood. It is not uncommon that the decision to pursue your mission may frighten and upset parents and loved ones. They will show their disagreement in various ways: coldness, withdrawal, sarcasm, and even threats. But the price to pay for making one's soul's desire come true is never too high.",
        },
        {
          id: "m3-s2-c2",
          type: "paragraph",
          content:
            "A future mother, terrified of the birth process, drew her strength and courage from the consideration of the great archetypal images that inhabited her. Thus linked to the power of the myth of the universal mother, she realized that she was no longer alone to live her adventure, but that she was in relation with all of humanity. Your fears, too, are not yours alone. They are shared by every person who has ever dared to live authentically.",
        },
        {
          id: "m3-s2-c3",
          type: "framework",
          content:
            "Psychologist Abraham Maslow identified a pattern he called the Jonah complex — named after the biblical Jonah who fled from his calling. It describes the fear of success: the unconscious avoidance of your own greatness. As Maslow put it, 'we fear our highest possibilities, as well as our lowest ones' — we thrill to the godlike potential we glimpse in our best moments, and yet we simultaneously 'shiver with weakness, awe, and fear' before those very same possibilities. Many people are not afraid of failing — they are afraid of what happens if they actually succeed: new responsibilities, jealousy from others, loss of current identity, and the terrifying weight of living up to their potential. The Jonah complex is one of the most common and least recognized obstacles to pursuing your mission.",
        },
      ],
      exercises: [
        {
          id: "m3-e4",
          type: "multiselect",
          prompt:
            "Which of these fears do you recognize in yourself? Select all that apply.",
          guidance:
            "Be honest. Most people carry several of these. Naming them is the first step to disarming them.",
          options: [
            { id: "fear-rejection", label: "Fear of Rejection", description: "Fear that others will judge, mock, or distance themselves from you if you pursue your true path" },
            { id: "fear-failure", label: "Fear of Failure", description: "Fear that you will try and not succeed — that you will be exposed as not good enough" },
            { id: "fear-success", label: "Fear of Success", description: "Fear of what changes if you actually get what you want — new responsibilities, jealousy from others, losing your current identity" },
            { id: "fear-isolation", label: "Fear of Isolation", description: "Fear that pursuing your authentic path will separate you from the people you love" },
            { id: "fear-inadequacy", label: "Fear of Inadequacy", description: "A deep sense that you lack some fundamental quality needed to fulfill your potential" },
            { id: "fear-visibility", label: "Fear of Being Seen", description: "Fear of stepping into the spotlight — of being noticed, scrutinized, or exposed" },
            { id: "fear-change", label: "Fear of Change", description: "Fear of leaving the familiar behind — even when the familiar is not fulfilling" },
            { id: "fear-loss", label: "Fear of Loss", description: "Fear that pursuing your purpose will cost you security, relationships, or stability" },
          ],
        },
        {
          id: "m3-e5",
          type: "freetext",
          prompt:
            "Choose the fear that feels strongest right now. Describe it fully. When does it show up? How does it control your decisions?",
          guidance:
            "Give this fear a full voice. Let it speak. And consider that some fear is not about danger at all. Marianne Williamson named it — in the passage so often misattributed to Mandela: 'Our deepest fear is not that we are inadequate. Our deepest fear is that we are powerful beyond measure.' Sometimes what we are most afraid of is our own size, because to let our real capacity show is to be on the hook for living up to it. The more clearly you see the fear, the less power it has over you.",
          placeholder:
            "Describe your strongest fear in detail — when it appears, what it says, what it stops you from doing...",
          followUpPrompt:
            "If this fear could talk, what would it say it's trying to protect you from? Every fear has a protective intention — what is this one guarding?",
        },
      ],
    },

    // ── Step 3: Personal Development Restraints ──
    {
      id: "m3-step-3",
      title: "What Holds You Back",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m3-s3-c1",
          type: "heading",
          heading: "Twelve Restraints — Three Modes",
          level: 2,
        },
        {
          id: "m3-s3-c2",
          type: "framework",
          content:
            "Researcher Carol Sanford identified twelve common reasons why capable people use limiting thinking patterns. They fall into three modes:\n\nReactive Mode — Avoiding being controlled, maintaining independence:\n• Familiar: There is comfort in the familiar, rooted in the brain's need for security. Without managing this, we default to what we know.\n• Protectiveness: When we identify with an idea, role, or relationship, we defend it and resist alternatives.\n• Assertiveness: Needing to be heard or taken seriously, which blocks dialogue and new perspectives.\n• Isolation: Staying away from people we think will influence us in ways we don't want.\n\nEgo Mode — Need to belong, be seen, be remembered:\n• Hope: Pursuing hope based on personal beliefs rather than reality.\n• Discriminating: Wanting to control what influences us.\n• Creative: Manifesting outcomes in areas where we want to leave a legacy.\n• Accomplishment: Achieving personal goals and gaining recognition.\n\nPurpose Mode — Inability to see where to contribute:\n• Stewardship: Working for the whole without personal gain.\n• Fulfillment: Finding meaning in helping others accomplish their work.\n• Transcendence: Rising above pettiness with higher-order aims.\n• Wholeness: Considering everything that sustains and evolves the systems we are part of.",
        },
      ],
      exercises: [
        {
          id: "m3-e6",
          type: "multiselect",
          prompt:
            "Which of these restraint modes do you recognize most strongly in yourself?",
          guidance:
            "Most people operate primarily from one or two of these modes. Which patterns feel most familiar?",
          options: [
            { id: "mode-reactive", label: "Reactive", description: "You tend to protect your independence and resist being influenced. You find comfort in the familiar and can be defensive about your positions." },
            { id: "mode-ego", label: "Ego", description: "You are driven by belonging, recognition, and leaving your mark. You want to be seen, remembered, and accomplish visible goals." },
            { id: "mode-purpose", label: "Purpose", description: "You struggle to see where you fit in the bigger picture. You sense something larger but can't find your place in it yet." },
          ],
        },
        {
          id: "m3-e7",
          type: "freetext",
          prompt:
            "Looking at the specific restraints within your dominant mode — which ones are actively operating in your life right now? Give an example.",
          guidance:
            "Don't stay abstract. Name a specific situation where one of these restraints showed up recently.",
          placeholder:
            "Describe a recent situation where this pattern played out...",
        },
      ],
    },

    // ── Step 4: Reframing & Visualization ──
    {
      id: "m3-step-4",
      title: "Reframing Your Fears",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m3-s4-c1",
          type: "paragraph",
          content:
            "Humans have the power to influence the subconscious mind through repetition. By subjecting the subconscious mind on a daily basis with positive, constructive knowledge, we create firmly rooted beliefs in self-empowerment which replace old and unhelpful belief systems. As William James wrote: 'The big revolution of our generation is to discover that the human being transforms the external aspects of his life by changing his interior attitudes.' If we take an idea and just hold it in our mind, we unconsciously start to do things that advance us towards that goal. This is not magical thinking — it is the documented power of focused intention and sustained attention.",
        },
        {
          id: "m3-s4-c2",
          type: "quote",
          quote: {
            text: "One whose desires and impulses are not his own, has no character, no more than a steam engine has character.",
            author: "John Stuart Mill",
          },
        },
        {
          id: "m3-s4-c3",
          type: "callout",
          content:
            "Reframing is not positive thinking or denial. It is looking at the same situation from a higher vantage point — one where the fear is acknowledged but no longer given the authority to make your decisions.",
        },
      ],
      exercises: [
        {
          id: "m3-e8",
          type: "freetext",
          prompt:
            "Take your strongest limiting belief from Step 1 and rewrite it. What would the truer, wiser version of that belief be?",
          guidance:
            "Example: 'I'm too old to start' becomes 'I have decades of experience that give me a perspective no younger person has.' The reframe must feel honest, not just optimistic.",
          placeholder:
            "Original belief: ...\nReframed belief: ...",
          followUpPrompt:
            "How does it feel to read the reframed version? Does any part of you believe it?",
        },
        {
          id: "m3-e9",
          type: "visualization",
          prompt:
            "Close your eyes for a moment. Imagine yourself five years from now, living the life you described in Module 1 — having moved through your fears, not around them. What does that life look like? What are you doing? Who is around you? How do you feel?",
          guidance:
            "This is a visualization exercise. Take 2-3 minutes with your eyes closed before writing. Let the image form naturally. Then describe what you saw.",
          placeholder:
            "Describe the future you saw...",
        },
        {
          id: "m3-e10",
          type: "freetext",
          prompt:
            "What is the cost of NOT pursuing your purpose? If you let fear win — if you stay safe — what do you lose?",
          guidance:
            "Jung observed that 'when an inner situation is not made conscious, it happens outside, as fate.' The fear you refuse to face does not stay quietly where you left it — it arranges your life from behind, and you come to call the result your circumstances, your luck, your fate. Sometimes we focus so much on the risk of action that we forget the risk of inaction. What is the price of staying where you are?",
          placeholder:
            "Describe what you lose if fear wins...",
          followUpPrompt:
            "Is that price acceptable to you?",
        },
        {
          id: "m3-e11",
          type: "freetext",
          prompt:
            "List your three biggest obstacles — then for each, name the talent, gift, or insight you gained precisely BECAUSE of that obstacle. What did it force you to develop?",
          guidance:
            "Every obstacle carries a hidden curriculum. The financial struggle that forced you to be resourceful. The rejection that made you resilient. The isolation that deepened your inner life. Map the gifts that came from your difficulties.",
          placeholder:
            "Obstacle 1: ... Gift gained: ...\nObstacle 2: ... Gift gained: ...\nObstacle 3: ... Gift gained: ...",
        },
        {
          id: "m3-e12",
          type: "freetext",
          prompt:
            "What is your metaphor for life? Is life a battle? A garden? A journey? A rough sea? A classroom? A game? Name your metaphor — then ask: how does this metaphor shape my behavior and my relationship to fear?",
          guidance:
            "The metaphors we use for life are not just poetic — they are perception filters that shape our actions. Someone who sees life as a battle will relate to fear differently than someone who sees life as a garden. Neither is wrong, but becoming aware of your metaphor gives you the power to choose a more empowering one.",
          placeholder:
            "My metaphor for life is... and it makes me...",
        },
      ],
    },

    // ── Step 5: Inward Journey Completion ──
    {
      id: "m3-step-5",
      title: "Completing the Inward Journey",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m3-s5-c1",
          type: "heading",
          heading: "What You Now Know About Yourself",
          level: 2,
        },
        {
          id: "m3-s5-c2",
          type: "paragraph",
          content:
            "You have completed the Inward Journey — three modules of looking within. You now have a map of your passions, your wounds, your shadows, and your fears. This is the foundation upon which your purpose will be built. In the Outward Journey, we will turn this inner knowledge toward the world: its needs, your story, and the unique gift you are here to give.",
        },
      ],
      exercises: [
        {
          id: "m3-e13",
          type: "freetext",
          prompt:
            "In a few sentences, summarize what you have learned about yourself across these three modules. What is the clearest thing that has emerged?",
          guidance:
            "Don't try to be comprehensive. Just name the most important insight — the one thing that feels truest.",
          placeholder:
            "Summarize your deepest insight from the Inward Journey...",
          followUpPrompt:
            "Hold onto this insight. We will return to it in Module 6 when we synthesize everything into your Ikigai statement.",
        },
      ],
    },
  ],
};
