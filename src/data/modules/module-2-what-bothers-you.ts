// ============================================================
// Module 2: What Bothers You — MY SUFFERING & SHADOW
// Inward Journey — Shadow Work & Wound Discovery
// ============================================================

import { ModuleData } from "../types";

export const module2: ModuleData = {
  id: 2,
  slug: "what-bothers-you",
  title: "What Bothers You",
  subtitle: "Looking into your suffering and shadow to find your gift",
  journeyPhase: "inward",
  icon: "eye",
  themeColor: "#7c3aed",
  outputLabel: "Your Wound & Shadow Map",

  introduction: [
    {
      id: "m2-intro-1",
      type: "heading",
      heading: "My Suffering & Shadow",
      level: 1,
    },
    {
      id: "m2-intro-2",
      type: "paragraph",
      content:
        "Some people discover their mission by witnessing a situation of lack: extreme poverty, deficient education, deadlock in relationships, blatant need, crisis. Moved and upset at first, they then set out to remedy these shortcomings. Your suffering and what bothers you about the world are not accidents — they are signals pointing you toward your unique contribution.",
    },
    {
      id: "m2-intro-3",
      type: "quote",
      quote: {
        text: "He who knows his why, can bear almost any how.",
        author: "Friedrich Nietzsche",
        source: "Quoted by Viktor Frankl in Man's Search for Meaning",
      },
    },
    {
      id: "m2-intro-4",
      type: "paragraph",
      content:
        "In this module, we enter more challenging territory. We will explore what genuinely bothers you — both in the world and within yourself. We will look at the shadow: the parts of yourself you have hidden in order to be accepted. This is not easy work, but it is where some of the deepest purpose lives.",
    },
    {
      id: "m2-intro-5",
      type: "callout",
      content:
        "Your Special Purpose lives at one place and one place only — the intersection of the timeless (where you feel flow and the Deep Now) and the timebound (where life's a bitch and then we die). Your wound and your talent are two halves of the same mission.",
    },
  ],

  completionMessage:
    "You have looked into what bothers you — in the world and within yourself. This is courageous work. The wounds you've named and the shadow you've acknowledged are not weaknesses. They are the other half of your gift. Your purpose will emerge at the intersection of what you love and what breaks your heart.",

  steps: [
    // ── Step 1: What Bothers You in the World ──
    {
      id: "m2-step-1",
      title: "What Bothers You in the World",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m2-s1-c1",
          type: "paragraph",
          content:
            "Look around the world, and see all of the things that really bother you. And realize that them bothering you is part of your guidance. See all the things that you really love, all the things that are beautiful, and realize they are connected. Animals are beautiful — and the devastation of animals and their habitat really bothers some people. Children are beautiful — so bad education systems are bothersome.",
        },
        {
          id: "m2-s1-c2",
          type: "paragraph",
          content:
            "So look at what you love. Look at how what you love is not well supported in various areas, and realize it does not have to be that way anymore. Your pain at the state of the world is not dysfunction — it is your moral compass pointing you toward where you are needed.",
        },
      ],
      exercises: [
        {
          id: "m2-e1",
          type: "freetext",
          prompt:
            "When you look at the world today, what genuinely upsets you? What situations of injustice, neglect, or brokenness make you feel something deep?",
          guidance:
            "Don't try to be noble or pick the 'right' cause. Be honest. What actually disturbs you? What do you find yourself arguing about, reading about, or losing sleep over?",
          placeholder:
            "Describe what genuinely bothers you about the world...",
          followUpPrompt:
            "When did you first become aware of this? Was there a specific moment or experience that opened your eyes to it?",
        },
        {
          id: "m2-e2",
          type: "freetext",
          prompt:
            "Is there a situation of lack, suffering, or crisis you've personally witnessed that moved you deeply?",
          guidance:
            "Think about times you saw something broken and felt compelled to act, or wished you could. A moment where you thought: 'This should not be this way.'",
          placeholder:
            "Describe the situation and what it stirred in you...",
        },
        {
          id: "m2-e3",
          type: "freetext",
          prompt:
            "Think about what bothered you in the news or on social media this past week. Name three things — and for each, ask: why does this bother ME specifically? What personal experience connects me to this issue?",
          guidance:
            "Your emotional reactions to the news are data. They reveal where your compassion lives. Don't dismiss your reactions — trace them back to their source.",
          placeholder:
            "Issue 1: ... Why it bothers me: ...\nIssue 2: ... Why it bothers me: ...\nIssue 3: ... Why it bothers me: ...",
        },
        {
          id: "m2-e4",
          type: "freetext",
          prompt:
            "If you could fix one thing in the world — no constraints, unlimited resources — what would it be and why?",
          guidance:
            "This is about desire, not practicality. What would you change if you had a magic wand?",
          placeholder:
            "Describe your one change and why it matters to you...",
          followUpPrompt:
            "What connects this to what you shared in Module 1 about what excites you? Do you see a relationship between what you love and what you want to fix?",
        },
      ],
    },

    // ── Step 2: Your Personal Suffering ──
    {
      id: "m2-step-2",
      title: "Your Personal Suffering",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m2-s2-c1",
          type: "paragraph",
          content:
            "Your purpose in life is deeply connected to your pain. A self-actualizing person does not blindly accept their fate, but constructs themselves and embraces all the pain and suffering that comes with it, as it is all a result of their own choosing — not shoved down their throat by a predefined system. This creation of meaning and cruising through life on one's own conditions leads a person to gain strength, to lift the greatest weight of life: the weight of responsibility and ownership of one's life.",
        },
        {
          id: "m2-s2-c2",
          type: "framework",
          content:
            "Viktor Frankl's logotherapy offers a key insight called dereflection: the idea that meaning is found not by obsessing over yourself, but by redirecting your attention outward — toward a cause to serve or a person to love. When you shift focus from 'What is wrong with me?' to 'What can I give?', suffering transforms from a dead weight into fuel. This is not denial — it is the radical act of converting pain into purpose.",
        },
        {
          id: "m2-s2-c3",
          type: "quote",
          quote: {
            text: "The more one forgets themselves, by giving themselves to a cause to serve, or another person to love — the more human they are and the more they actualize themselves.",
            author: "Viktor Frankl",
          },
        },
        {
          id: "m2-s2-c4",
          type: "callout",
          content:
            "This section asks you to touch difficult material. Go at your own pace. You can write as much or as little as feels right. There is no requirement to share everything — only what you are ready to look at.",
        },
      ],
      exercises: [
        {
          id: "m2-e5",
          type: "freetext",
          prompt:
            "What has been the most significant suffering or hardship in your life? What wound have you carried?",
          guidance:
            "This could be a loss, a betrayal, an injustice done to you, a prolonged struggle, or a pattern of pain. Name it honestly.",
          placeholder:
            "Describe the suffering that has shaped you most...",
          followUpPrompt:
            "How has this experience changed the way you see the world? Has it made you more sensitive to certain kinds of pain in others?",
        },
        {
          id: "m2-e6",
          type: "freetext",
          prompt:
            "What in your past experience makes you passionate about the problems you identified in the previous step?",
          guidance:
            "There is almost always a connection between what bothers us in the world and what has wounded us personally. Can you see the link?",
          placeholder:
            "Explore the connection between your personal pain and the world's pain...",
        },
        {
          id: "m2-e7",
          type: "freetext",
          prompt:
            "Awareness of your pain is the ultimate tool in changing your attitude. What has your suffering taught you? What strength or sensitivity has it given you?",
          guidance:
            "Pain that has been processed becomes wisdom. What do you understand now that you could not have understood without going through what you went through?",
          placeholder:
            "Describe the gifts that have come from your difficult experiences...",
        },
      ],
    },

    // ── Step 3: The Shadow ──
    {
      id: "m2-step-3",
      title: "The Shadow — Your Hidden Treasure",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m2-s3-c1",
          type: "heading",
          heading: "This Treasure Buried by Fear",
          level: 2,
        },
        {
          id: "m2-s3-c2",
          type: "framework",
          content:
            "Psychologist Jean Monbourquette, whose work on shadow integration forms the backbone of this module, describes the shadow as all that we have pushed back into the unconscious for fear of being rejected by people important in our lives. Once you've spotted aspects of your persona — the mask you wear — ask yourself what quality or trait you had to suppress in order to be appreciated and loved. For example: if you have wanted to be recognized as a gentle, generous, and smiling person, you have most likely had to hide your aggressiveness, your self-interest, and your outbursts of frustration. These qualities that you have been inclined to put on the back burner form the facets of your shadow.",
        },
        {
          id: "m2-s3-c3",
          type: "paragraph",
          content:
            "Now dare to recognize its value and legitimacy. Say to yourself: \"I have the right to be combative. I have the right to seek what is mine. I am entitled to my frustration.\" While making these statements, pay attention to the emotions you feel. They will be diverse. Some will feel confused. Others will feel guilty or ashamed. Still others will feel full of energy. With this exercise, you begin to tame your shadow.",
        },
        {
          id: "m2-s3-c4",
          type: "callout",
          content:
            "Shadow work is not about becoming the negative traits you suppressed. It is about reclaiming the energy you spent hiding them. When you integrate your shadow, you become whole — not perfect, but complete.",
        },
      ],
      exercises: [
        {
          id: "m2-e8",
          type: "freetext",
          prompt:
            "What image do you try to project to the world? What kind of person do you want others to see you as?",
          guidance:
            "Think about the 'persona' you wear. What qualities do you lead with? Gentle? Strong? Smart? Helpful? Independent? This is the mask — and it's not bad, but it's only part of you.",
          placeholder:
            "Describe the version of yourself you show to the world...",
          followUpPrompt:
            "What quality or trait did you have to suppress in order to maintain that image?",
        },
        {
          id: "m2-e9",
          type: "freetext",
          prompt:
            "What parts of yourself have you hidden, denied, or pushed away because they felt unacceptable?",
          guidance:
            "These might be emotions (anger, jealousy, ambition, vulnerability), behaviors (being loud, being selfish, being lazy), or desires (wanting power, wanting attention, wanting solitude). Name them.",
          placeholder:
            "Describe the qualities you've suppressed...",
        },
        {
          id: "m2-e10",
          type: "freetext",
          prompt:
            "Try saying to yourself: \"I have the right to be [your suppressed quality].\" What emotions come up when you say that?",
          guidance:
            "This is the taming exercise from Monbourquette's shadow work. Write down the quality, say it aloud if you can, and notice what you feel. Confusion? Relief? Guilt? Energy? All are valid.",
          placeholder:
            "Describe the quality and the emotions that arise...",
        },
        {
          id: "m2-e11",
          type: "freetext",
          prompt:
            "Is there someone who gets on your nerves, irritates you, or annoys you to the point of obsession? Describe what about them bothers you — then ask: could this be a part of my own shadow that I am projecting onto them?",
          guidance:
            "Monbourquette calls this shadow projection. The traits that trigger us most intensely in others are often the traits we have disowned in ourselves. The person who irritates you is holding up a mirror. What do you see?",
          placeholder:
            "Describe the person and the trait that bothers you, then explore whether it's your own shadow...",
          followUpPrompt:
            "If you could have an imagined conversation with this person — putting yourself in their shoes — what would they say about why they are the way they are? And what would you learn?",
        },
        {
          id: "m2-e12",
          type: "freetext",
          prompt:
            "What topics of conversation do you actively avoid? In what situations do you feel most inferior or defensive? What do these avoidances reveal about the parts of yourself you haven't yet accepted?",
          guidance:
            "The shadow hides in your avoidances. The topics you won't discuss, the situations where you feel small, and the comparisons that sting — all point toward something you have not yet integrated.",
          placeholder:
            "Name your avoidances and what they reveal...",
        },
      ],
    },

    // ── Step 4: The Wound as Gift ──
    {
      id: "m2-step-4",
      title: "From Wound to Gift",
      aiCoachingEnabled: true,
      contentBlocks: [
        {
          id: "m2-s4-c1",
          type: "paragraph",
          content:
            "The Special Purpose framework shows us that purpose lives at the intersection of talent and trauma. Your wound is not something to overcome so you can get on with your 'real' purpose — your wound IS part of your purpose. The most powerful change-makers in history were driven not by abstract ideals but by lived pain that became compassion, and then became action.",
        },
        {
          id: "m2-s4-c2",
          type: "quote",
          quote: {
            text: "True meaning in life is found in the self-transcendence of human experience.",
            author: "Viktor Frankl",
          },
        },
      ],
      exercises: [
        {
          id: "m2-e13",
          type: "freetext",
          prompt:
            "Looking at your wound and your passion side by side — where do they intersect? What cause or contribution sits at the meeting point of what you love and what has hurt you?",
          guidance:
            "This is the most important question in this module. Take your time with it. The intersection of your talent (Module 1) and your trauma (this module) is where your Special Purpose lives.",
          placeholder:
            "Explore where your passion and your pain meet...",
          followUpPrompt:
            "If you imagine standing at this intersection for the rest of your life — making it your life's work — how does that feel?",
        },
        {
          id: "m2-e14",
          type: "freetext",
          prompt:
            "How might your personal suffering become a source of strength or guidance for others who face similar challenges?",
          guidance:
            "The healed wound becomes the source of healing. Not because you have all the answers, but because you understand the terrain.",
          placeholder:
            "Describe how your wound could become your gift to others...",
        },
      ],
    },
  ],
};
