// ============================================================
// Archetypes — 12 Purpose Archetypes
// Used in Module 5: What's Your Story
// ============================================================

import { Archetype } from "../types";

export const archetypes: Archetype[] = [
  {
    id: "sage",
    name: "The Sage",
    icon: "book-open",
    shortDescription: "The seeker of truth and understanding",
    fullDescription:
      "The Sage is driven by a deep need to understand the world. You are not satisfied with surface explanations — you want to know why things are the way they are. You process the world through inquiry, reflection, and the patient accumulation of insight. Your gift to the world is clarity: you see patterns others miss and can distill complexity into wisdom that others can use.",
    strengths: [
      "Deep analytical thinking",
      "Pattern recognition across domains",
      "Patience with complexity and ambiguity",
      "Ability to synthesize knowledge into wisdom",
      "Teaching and mentoring through understanding",
    ],
    worldContribution:
      "The Sage brings understanding to confusion. In a world drowning in information, the Sage's gift is meaning — turning noise into signal, data into insight, knowledge into wisdom.",
    signalQuestions: [
      "Do you spend more time thinking about ideas than implementing them?",
      "Do people come to you when they need something explained clearly?",
      "Do you feel restless when you don't understand something deeply?",
    ],
  },
  {
    id: "conductor",
    name: "The Conductor",
    icon: "wand",
    shortDescription: "The orchestrator who brings order to chaos",
    fullDescription:
      "The Conductor sees the whole picture and knows how to bring disparate elements into harmony. You are not necessarily the loudest voice, but you are the one who makes the symphony possible. You understand systems, people, and timing. Your gift is coordination — you know how to organize complex efforts and bring out the best in every player.",
    strengths: [
      "Systems thinking and strategic vision",
      "Ability to coordinate complex, multi-stakeholder efforts",
      "Reading group dynamics and managing energy",
      "Bringing structure without killing creativity",
      "Seeing how different talents complement each other",
    ],
    worldContribution:
      "The Conductor builds the bridges between brilliant individuals and turns isolated efforts into collective impact. Without Conductors, great ideas die in isolation.",
    signalQuestions: [
      "Do you naturally see how different people's strengths could combine?",
      "Do you get frustrated when talented people are disorganized or misaligned?",
      "Do you find yourself mediating, coordinating, or facilitating — even when no one asked?",
    ],
  },
  {
    id: "mentor",
    name: "The Mentor",
    icon: "users",
    shortDescription: "The guide who sees potential in others",
    fullDescription:
      "The Mentor is driven by a profound desire to develop others. You see potential in people before they see it in themselves, and you feel compelled to nurture it. Your gift is not just teaching — it is believing in someone so deeply that they begin to believe in themselves. You draw out what is already there.",
    strengths: [
      "Seeing hidden potential in others",
      "Patient, personalized guidance",
      "Deep listening and empathic presence",
      "Creating safe space for growth and vulnerability",
      "Accountability with compassion",
    ],
    worldContribution:
      "The Mentor multiplies human potential. Every great leader, artist, and innovator was shaped by a Mentor who saw what they could become. Mentors change the world one person at a time.",
    signalQuestions: [
      "Do you get more satisfaction from someone else's breakthrough than your own?",
      "Do you notice what people are good at before they do?",
      "Have people told you that you changed their life through your belief in them?",
    ],
  },
  {
    id: "healer",
    name: "The Healer",
    icon: "heart-pulse",
    shortDescription: "The mender who restores what is broken",
    fullDescription:
      "The Healer is drawn to what is wounded — in people, communities, or systems. You have an intuitive sense for pain, and a natural capacity to create conditions for recovery. Your healing may be physical, emotional, spiritual, or systemic. Your gift is presence: being with suffering without turning away, and knowing how to hold space for transformation.",
    strengths: [
      "Deep empathy and emotional attunement",
      "Comfort with pain, grief, and difficult emotions",
      "Intuitive understanding of what needs to mend",
      "Creating safe, restorative environments",
      "Transforming pain into growth",
    ],
    worldContribution:
      "The Healer restores what has been broken. In a world that produces trauma at scale — through war, displacement, injustice, and isolation — Healers are essential infrastructure.",
    signalQuestions: [
      "Do people naturally open up to you about their pain?",
      "Do you feel pulled toward what is broken rather than what is shiny?",
      "Does witnessing someone's healing give you a sense of deep fulfillment?",
    ],
  },
  {
    id: "artist",
    name: "The Artist",
    icon: "palette",
    shortDescription: "The creator who makes the invisible visible",
    fullDescription:
      "The Artist is compelled to express what cannot be said in ordinary language. You see the world differently — through color, sound, movement, word, or form — and you feel a deep need to create. Your gift is not decoration; it is revelation. You make the invisible visible, the felt tangible, the unspoken heard.",
    strengths: [
      "Original perception and creative vision",
      "Ability to express complex emotions and ideas through form",
      "Comfort with ambiguity and the unfinished",
      "Sensitivity to beauty, dissonance, and meaning",
      "Channeling the unconscious into conscious expression",
    ],
    worldContribution:
      "The Artist reminds humanity of what it is. Through art, we process grief, celebrate beauty, confront truth, and imagine what could be. Without Artists, culture dies.",
    signalQuestions: [
      "Do you feel physically uncomfortable when you haven't created in a while?",
      "Do you see patterns, colors, or compositions where others see ordinary scenes?",
      "Do you create not for applause but because you must?",
    ],
  },
  {
    id: "warrior",
    name: "The Warrior",
    icon: "sword",
    shortDescription: "The protector who stands for what is right",
    fullDescription:
      "The Warrior is driven by a fierce sense of justice and the courage to act on it. You do not look away from injustice — you confront it. Your strength is not aggression; it is principled action in the face of opposition. You protect the vulnerable, challenge the powerful, and are willing to bear personal cost for what you believe is right.",
    strengths: [
      "Moral courage and willingness to take a stand",
      "Resilience under pressure and adversity",
      "Ability to act decisively in ambiguous situations",
      "Protecting others who cannot protect themselves",
      "Channeling anger into constructive action",
    ],
    worldContribution:
      "The Warrior defends what is worth protecting. Every social advance — from civil rights to environmental protection — was won by Warriors who refused to accept the status quo.",
    signalQuestions: [
      "Do you feel compelled to act when you witness injustice, even at personal risk?",
      "Do you find yourself standing up for others in situations where most stay silent?",
      "Does the phrase 'pick your battles' frustrate you because you want to fight them all?",
    ],
  },
  {
    id: "researcher",
    name: "The Researcher",
    icon: "microscope",
    shortDescription: "The investigator who uncovers hidden truth",
    fullDescription:
      "The Researcher is driven by an insatiable curiosity about how things work. You want to go deeper than anyone else — to discover what has not yet been found, to prove what has not yet been proven. Your gift is rigor: you combine intellectual honesty with methodical persistence to advance the frontier of human knowledge.",
    strengths: [
      "Methodical, systematic investigation",
      "Comfort with uncertainty and long timelines",
      "Intellectual honesty and openness to being wrong",
      "Ability to hold complex problems for extended periods",
      "Advancing knowledge through original inquiry",
    ],
    worldContribution:
      "The Researcher expands the boundaries of what humanity knows. From medicine to physics to psychology, every breakthrough began with a Researcher who asked a question no one else thought to ask.",
    signalQuestions: [
      "Do you find yourself going much deeper into topics than anyone around you?",
      "Do you enjoy the process of investigation itself, not just the result?",
      "Do you feel uncomfortable making claims without evidence?",
    ],
  },
  {
    id: "contemplative",
    name: "The Contemplative",
    icon: "moon",
    shortDescription: "The witness who holds space for the sacred",
    fullDescription:
      "The Contemplative is drawn to silence, depth, and the inner dimensions of existence. You are not driven to produce or perform — you are drawn to be present. Your gift is a quality of attention that allows others to slow down, go deeper, and reconnect with what is essential. In a world addicted to speed and noise, you hold the counter-frequency.",
    strengths: [
      "Deep presence and quality of attention",
      "Comfort with stillness, silence, and not-knowing",
      "Access to intuition and inner knowing",
      "Ability to hold space for others' inner work",
      "Bridging the spiritual and the practical",
    ],
    worldContribution:
      "The Contemplative reminds the world to pause. In an era of constant acceleration, the Contemplative offers the radical act of stillness — and the wisdom that comes from it.",
    signalQuestions: [
      "Do you need regular solitude to function well?",
      "Do you sense things before you can articulate them?",
      "Does the pace of modern life feel fundamentally misaligned with something you carry?",
    ],
  },
  {
    id: "prophet",
    name: "The Prophet",
    icon: "megaphone",
    shortDescription: "The voice that speaks uncomfortable truths",
    fullDescription:
      "The Prophet sees what others cannot — or will not — see, and feels compelled to name it. You are not trying to be disruptive; you simply cannot stay silent when the truth demands to be spoken. Your gift is moral clarity: the ability to cut through noise, denial, and comfortable lies to say what needs to be said.",
    strengths: [
      "Moral clarity and courage of conviction",
      "Ability to see systemic patterns and name them",
      "Comfort with being unpopular or misunderstood",
      "Communicating urgency without losing nuance",
      "Catalyzing change through truth-telling",
    ],
    worldContribution:
      "The Prophet wakes people up. Every era needs voices that name what is happening — the injustice, the hypocrisy, the opportunity — and refuse to let the world sleepwalk through it.",
    signalQuestions: [
      "Do you see patterns in society that others seem to miss or ignore?",
      "Do you feel compelled to speak even when it makes you unpopular?",
      "Has someone told you that something you said changed how they see the world?",
    ],
  },
  {
    id: "lover",
    name: "The Lover",
    icon: "heart",
    shortDescription: "The connector who lives through relationship",
    fullDescription:
      "The Lover is driven by connection — to people, to beauty, to experience, to life itself. You feel things deeply and are not afraid to let that depth show. Your gift is wholehearted engagement: you bring passion, intimacy, and devotion to everything you touch. You remind others that the deepest human need is to love and be loved.",
    strengths: [
      "Deep emotional capacity and expressiveness",
      "Ability to create intimate, meaningful connection",
      "Passion and devotion that inspires others",
      "Sensitivity to beauty, pleasure, and aliveness",
      "Bringing warmth and humanity to cold systems",
    ],
    worldContribution:
      "The Lover humanizes the world. In institutions, teams, and communities that have become transactional, the Lover reintroduces heart — reminding everyone that relationships are the point, not the overhead.",
    signalQuestions: [
      "Do you lead with your heart more than your head?",
      "Do you find it difficult to be part of systems that don't value human connection?",
      "Do people describe you as passionate, warm, or deeply caring?",
    ],
  },
  {
    id: "builder",
    name: "The Builder",
    icon: "hammer",
    shortDescription: "The maker who turns vision into reality",
    fullDescription:
      "The Builder is driven to create tangible things in the world — organizations, products, systems, infrastructure. While others dream, you build. Your gift is execution: the ability to take an idea and make it real, brick by brick, through persistence, resourcefulness, and practical intelligence.",
    strengths: [
      "Turning abstract ideas into concrete reality",
      "Persistence and follow-through over long projects",
      "Practical problem-solving and resourcefulness",
      "Building systems and structures that endure",
      "Entrepreneurial energy and bias toward action",
    ],
    worldContribution:
      "The Builder makes things happen. Ideas without Builders remain dreams. Builders create the organizations, products, and infrastructure that make visions operational.",
    signalQuestions: [
      "Do you get impatient with discussions that don't lead to action?",
      "Do you feel most alive when you're making something — shipping, launching, constructing?",
      "Do people come to you to 'make it happen'?",
    ],
  },
  {
    id: "guardian",
    name: "The Guardian",
    icon: "shield-check",
    shortDescription: "The steward who preserves what matters",
    fullDescription:
      "The Guardian is driven to protect and preserve what is valuable — traditions, ecosystems, institutions, communities. You are not resistant to change for its own sake; you understand that some things are worth conserving. Your gift is stewardship: the wisdom to know what must be protected so that the future has roots.",
    strengths: [
      "Long-term thinking and institutional wisdom",
      "Loyalty, reliability, and consistency",
      "Ability to maintain and strengthen existing systems",
      "Seeing value in what others want to discard",
      "Creating stability that allows others to take risks",
    ],
    worldContribution:
      "The Guardian ensures continuity. In a culture obsessed with disruption, Guardians protect the wisdom, traditions, and ecosystems that took generations to build.",
    signalQuestions: [
      "Do you feel protective of things others want to replace or discard?",
      "Do you value preservation as much as innovation?",
      "Do people rely on you for stability, consistency, or institutional memory?",
    ],
  },
];
