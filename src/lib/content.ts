import type { ModuleContent, Archetype, WorldNeedCategory } from './types';

export const modules: ModuleContent[] = [
  {
    id: 1,
    title: "What Excites You",
    description: "Uncover the passions and curiosities that light you up from within.",
    icon: "Flame",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "The first step toward purpose is recognizing what genuinely excites you — not what you think should excite you, but the things that make time disappear." },
          { type: 'quote', text: "Don't ask what the world needs. Ask what makes you come alive, and go do it. Because what the world needs is people who have come alive.", author: "Howard Thurman" },
        ],
        exercise: { type: 'freetext', prompt: "What activities make you lose track of time?", placeholder: "Think about moments when hours felt like minutes..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Passion often hides in the things we do without being asked — the topics we read about for fun, the conversations we never tire of." },
        ],
        exercise: { type: 'multiselect', prompt: "Which of these themes resonate with you? Select all that apply.", options: ["Creating things with my hands", "Solving complex problems", "Helping others grow", "Exploring new places or ideas", "Understanding how things work", "Expressing myself creatively", "Building systems or processes", "Connecting with nature", "Leading and organizing", "Teaching or mentoring"] },
      },
      {
        content: [
          { type: 'paragraph', text: "Sometimes our passions are buried under layers of expectations. Let's dig deeper." },
          { type: 'quote', text: "Your work is to discover your world and then with all your heart give yourself to it.", author: "Buddha" },
        ],
        exercise: { type: 'freetext', prompt: "If money were no object and failure were impossible, what would you spend your days doing?", placeholder: "Let yourself dream without limits..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Now rank these areas by how strongly they call to you. What feels most alive?" },
        ],
        exercise: { type: 'ranking', prompt: "Rank these from most to least exciting for you:", options: ["Creative expression", "Intellectual exploration", "Human connection", "Physical mastery", "Spiritual growth"] },
      },
    ],
  },
  {
    id: 2,
    title: "What Bothers You",
    description: "Your frustrations reveal what you care about most deeply.",
    icon: "AlertTriangle",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "Anger and frustration are often misunderstood. They can be powerful signals pointing toward what matters most to you." },
          { type: 'quote', text: "He who angers you conquers you. But he who understands his anger discovers his values.", author: "Elizabeth Kenny" },
        ],
        exercise: { type: 'freetext', prompt: "What injustice or problem in the world makes you most frustrated?", placeholder: "Think about news stories, situations, or experiences that stir something deep..." },
      },
      {
        content: [
          { type: 'paragraph', text: "The Stoics taught that our reactions reveal our deepest values. What bothers us is a map to what we hold sacred." },
          { type: 'quote', text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
        ],
        exercise: { type: 'multiselect', prompt: "Which of these situations would you most want to change?", options: ["People not reaching their potential", "Environmental destruction", "Inequality and unfairness", "Lack of authentic connection", "Dishonesty and manipulation", "Suffering that could be prevented", "Wasted resources or talent", "Loss of beauty or culture"] },
      },
      {
        content: [
          { type: 'paragraph', text: "Behind every frustration is a vision of how things could be better. That vision is part of your purpose." },
        ],
        exercise: { type: 'freetext', prompt: "Describe a specific moment when you felt compelled to take action because something was wrong.", placeholder: "A time when you couldn't stay silent or inactive..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Let's connect your frustrations to your deeper values." },
          { type: 'quote', text: "It is not the critic who counts; not the man who points out how the strong man stumbles. The credit belongs to the man who is actually in the arena.", author: "Theodore Roosevelt" },
        ],
        exercise: { type: 'freetext', prompt: "What value is underneath your biggest frustration? Why does this matter so much to you?", placeholder: "Go beneath the surface emotion to the core belief..." },
      },
    ],
  },
  {
    id: 3,
    title: "My Fears",
    description: "Face the fears that hold you back from your fullest expression.",
    icon: "Shield",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "Fear is the guardian of your comfort zone — and your comfort zone is the boundary of your current self. To grow, we must understand what we fear and why." },
          { type: 'quote', text: "We suffer more often in imagination than in reality.", author: "Seneca" },
        ],
        exercise: { type: 'freetext', prompt: "What is your biggest fear about pursuing what truly matters to you?", placeholder: "Be honest — no one sees this but you..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Fear often comes in predictable patterns. Recognizing which patterns are at play can loosen their grip." },
        ],
        exercise: { type: 'multiselect', prompt: "Which fears do you recognize in yourself?", options: ["Fear of failure", "Fear of not being good enough", "Fear of what others will think", "Fear of financial instability", "Fear of losing relationships", "Fear of wasting time", "Fear of commitment to one path", "Fear of success and its demands"] },
      },
      {
        content: [
          { type: 'paragraph', text: "The Stoics practiced negative visualization — imagining the worst — not to create anxiety, but to realize that most fears are survivable." },
          { type: 'quote', text: "It is not because things are difficult that we do not dare; it is because we do not dare that things are difficult.", author: "Seneca" },
        ],
        exercise: { type: 'freetext', prompt: "If your biggest fear came true, what would actually happen? Walk through the realistic scenario.", placeholder: "Describe the actual consequences, step by step..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Now let's flip the lens. What is the cost of NOT acting on your purpose because of fear?" },
          { type: 'quote', text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
        ],
        exercise: { type: 'freetext', prompt: "Imagine yourself at 80, looking back. What would you regret not trying?", placeholder: "Write from the perspective of your future self..." },
      },
    ],
  },
  {
    id: 4,
    title: "What the World Needs",
    description: "Explore the needs around you that align with your unique gifts.",
    icon: "Globe",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "Purpose lives at the intersection of what you love, what you're good at, and what the world needs. This module explores that third circle." },
          { type: 'quote', text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.", author: "Ralph Waldo Emerson" },
          { type: 'paragraph', text: "Explore the categories below and select the causes and needs that resonate with you most deeply. There are no right answers — only honest ones." },
        ],
        exercise: { type: 'cardselect', prompt: "Explore these categories and select what resonates:" },
      },
      {
        content: [
          { type: 'paragraph', text: "Now that you've explored various world needs, let's reflect on why certain topics called to you." },
        ],
        exercise: { type: 'freetext', prompt: "Why do you think those particular needs resonated? What personal experience connects you to them?", placeholder: "Think about your life story and how it relates..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Connection between personal passion and world needs is where purpose begins to crystallize." },
          { type: 'quote', text: "Everyone has been made for some particular work, and the desire for that work has been put in every heart.", author: "Rumi" },
        ],
        exercise: { type: 'freetext', prompt: "How might your passions from Module 1 connect to the world needs you selected?", placeholder: "Look for bridges between your excitement and the world's needs..." },
      },
    ],
  },
  {
    id: 5,
    title: "What's Your Story",
    description: "Map the defining moments that shaped who you are becoming.",
    icon: "BookOpen",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "Your life story is not random. The events that shaped you — both joyful and painful — have been preparing you for something." },
          { type: 'quote', text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
          { type: 'paragraph', text: "Build your timeline below. Add the key moments that made you who you are — the turning points, the revelations, the wounds, and the triumphs." },
        ],
        exercise: { type: 'timeline', prompt: "Add the defining moments of your life:" },
      },
      {
        content: [
          { type: 'paragraph', text: "Looking at your timeline, patterns begin to emerge. These patterns point toward your archetypal nature — the fundamental role you're drawn to play in the world." },
        ],
        exercise: { type: 'freetext', prompt: "What patterns do you notice in your timeline? Are there recurring themes?", placeholder: "Look for threads that connect multiple events..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Based on the patterns of your life, certain archetypes may resonate with you. These aren't labels — they're lenses for understanding your natural way of engaging with the world." },
          { type: 'quote', text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
        ],
        exercise: { type: 'freetext', prompt: "Which archetype(s) feel most like you, and why?", placeholder: "Browse the archetypes below and reflect..." },
      },
    ],
  },
  {
    id: 6,
    title: "What's Your Gift",
    description: "Synthesize your journey into a clear statement of purpose.",
    icon: "Sparkles",
    steps: [
      {
        content: [
          { type: 'paragraph', text: "You've traveled deep — exploring your passions, frustrations, fears, the world's needs, and your own story. Now it's time to bring it all together." },
          { type: 'quote', text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
          { type: 'paragraph', text: "Your Ikigai — your reason for being — lives at the intersection of everything you've explored. Let's find the words for it." },
        ],
        exercise: { type: 'freetext', prompt: "In your own words, describe the gift you want to bring to the world:", placeholder: "Don't overthink it. Write from the heart..." },
      },
      {
        content: [
          { type: 'paragraph', text: "Now let's refine. A purpose statement doesn't need to be grand — it needs to be true." },
        ],
        exercise: { type: 'freetext', prompt: "Complete this sentence: 'I am at my best when I am...'", placeholder: "Think about the intersection of passion, skill, and impact..." },
      },
      {
        content: [
          { type: 'paragraph', text: "You've done the inner work. Now let's crystallize your Ikigai into a statement you can carry with you." },
          { type: 'quote', text: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Pablo Picasso" },
        ],
      },
    ],
  },
];

export const worldNeedCategories: WorldNeedCategory[] = [
  {
    title: "A More Beautiful World",
    icon: "Palette",
    topics: [
      { id: "art-access", title: "Art Accessibility", description: "Making art and culture available to everyone" },
      { id: "urban-design", title: "Urban Design", description: "Creating beautiful, livable cities and spaces" },
      { id: "nature-preservation", title: "Nature Preservation", description: "Protecting natural landscapes and biodiversity" },
      { id: "craft-revival", title: "Craft Revival", description: "Preserving traditional craftsmanship and artisanal skills" },
      { id: "music-education", title: "Music Education", description: "Bringing music to underserved communities" },
      { id: "cultural-heritage", title: "Cultural Heritage", description: "Preserving and celebrating diverse cultural traditions" },
      { id: "design-thinking", title: "Design Thinking", description: "Applying beauty and intentionality to everyday objects" },
      { id: "creative-expression", title: "Creative Expression", description: "Empowering people to express themselves creatively" },
    ],
  },
  {
    title: "A More Compassionate World",
    icon: "Heart",
    topics: [
      { id: "mental-health", title: "Mental Health", description: "Reducing stigma and increasing access to mental health care" },
      { id: "elder-care", title: "Elder Care", description: "Ensuring dignity and connection for aging populations" },
      { id: "refugee-support", title: "Refugee Support", description: "Helping displaced people rebuild their lives" },
      { id: "community-building", title: "Community Building", description: "Creating spaces for genuine human connection" },
      { id: "conflict-resolution", title: "Conflict Resolution", description: "Building bridges between divided groups" },
      { id: "child-welfare", title: "Child Welfare", description: "Protecting and nurturing vulnerable children" },
      { id: "disability-inclusion", title: "Disability Inclusion", description: "Creating a world accessible to all abilities" },
      { id: "animal-welfare", title: "Animal Welfare", description: "Protecting animals from suffering and cruelty" },
    ],
  },
  {
    title: "A Healthier World",
    icon: "Leaf",
    topics: [
      { id: "clean-water", title: "Clean Water", description: "Ensuring access to safe drinking water for all" },
      { id: "food-systems", title: "Food Systems", description: "Creating sustainable, equitable food production" },
      { id: "preventive-health", title: "Preventive Health", description: "Shifting focus from treatment to prevention" },
      { id: "climate-action", title: "Climate Action", description: "Addressing the root causes of climate change" },
      { id: "ocean-health", title: "Ocean Health", description: "Protecting marine ecosystems and ocean life" },
      { id: "clean-energy", title: "Clean Energy", description: "Transitioning to renewable energy sources" },
      { id: "wellness-access", title: "Wellness Access", description: "Making wellness practices available to everyone" },
      { id: "air-quality", title: "Air Quality", description: "Reducing pollution and improving air quality" },
    ],
  },
  {
    title: "A More Prosperous World",
    icon: "Lightbulb",
    topics: [
      { id: "education-access", title: "Education Access", description: "Making quality education available to all" },
      { id: "economic-mobility", title: "Economic Mobility", description: "Creating pathways out of poverty" },
      { id: "entrepreneurship", title: "Entrepreneurship", description: "Empowering people to create their own opportunities" },
      { id: "tech-for-good", title: "Technology for Good", description: "Using technology to solve human problems" },
      { id: "financial-literacy", title: "Financial Literacy", description: "Teaching people to manage and grow resources" },
      { id: "innovation", title: "Innovation", description: "Encouraging creative solutions to systemic problems" },
      { id: "sustainable-business", title: "Sustainable Business", description: "Building businesses that benefit people and planet" },
      { id: "skills-training", title: "Skills Training", description: "Preparing people for the future of work" },
    ],
  },
  {
    title: "A More Truthful World",
    icon: "Scale",
    topics: [
      { id: "media-literacy", title: "Media Literacy", description: "Helping people navigate information critically" },
      { id: "transparency", title: "Transparency", description: "Increasing openness in institutions and governance" },
      { id: "scientific-literacy", title: "Scientific Literacy", description: "Building public understanding of science" },
      { id: "justice-reform", title: "Justice Reform", description: "Creating fairer legal and justice systems" },
      { id: "ethical-tech", title: "Ethical Technology", description: "Ensuring technology respects privacy and truth" },
      { id: "civic-engagement", title: "Civic Engagement", description: "Empowering people to participate in democracy" },
      { id: "whistleblower-protection", title: "Whistleblower Protection", description: "Protecting those who speak truth to power" },
      { id: "philosophical-education", title: "Philosophical Education", description: "Teaching critical thinking and ethics" },
    ],
  },
];

export const archetypes: Archetype[] = [
  { id: "sage", name: "The Sage", icon: "BookOpen", description: "You seek truth and understanding. You're driven to learn deeply and share wisdom with others." },
  { id: "conductor", name: "The Conductor", icon: "Music", description: "You orchestrate complex systems and people, bringing harmony to chaos and alignment to groups." },
  { id: "mentor", name: "The Mentor", icon: "GraduationCap", description: "You see potential in others and feel called to guide them toward their own growth." },
  { id: "healer", name: "The Healer", icon: "Heart", description: "You're drawn to restore wholeness — whether in people, relationships, or communities." },
  { id: "artist", name: "The Artist", icon: "Palette", description: "You create beauty and meaning, transforming raw experience into something others can feel." },
  { id: "warrior", name: "The Warrior", icon: "Shield", description: "You fight for what's right, channeling courage and conviction into purposeful action." },
  { id: "researcher", name: "The Researcher", icon: "Search", description: "You investigate and analyze, driven to understand the hidden patterns beneath the surface." },
  { id: "contemplative", name: "The Contemplative", icon: "Eye", description: "You find truth through stillness and reflection, offering depth in a world of surfaces." },
  { id: "prophet", name: "The Prophet", icon: "Megaphone", description: "You see what others don't and feel compelled to speak truth, even when it's uncomfortable." },
  { id: "lover", name: "The Lover", icon: "Sparkles", description: "You lead with passion and beauty, bringing warmth and connection wherever you go." },
  { id: "builder", name: "The Builder", icon: "Hammer", description: "You create structures and systems that last, turning vision into tangible reality." },
  { id: "guardian", name: "The Guardian", icon: "ShieldCheck", description: "You protect what matters most, standing firm for values, people, and traditions worth preserving." },
];

export const moduleIcons: Record<number, string> = {
  1: "Flame",
  2: "AlertTriangle",
  3: "Shield",
  4: "Globe",
  5: "BookOpen",
  6: "Sparkles",
};
