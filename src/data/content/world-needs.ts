// ============================================================
// Gaps in the World — Five Categories of World Needs
// Used in Module 4: What the World Needs
// ============================================================

import { WorldNeedCategory } from "../types";

export const worldNeedCategories: WorldNeedCategory[] = [
  {
    id: "beautiful-world",
    title: "A More Beautiful World",
    icon: "palette",
    description:
      "Beauty is not a luxury — it is a human need. A world that prioritizes efficiency over aesthetics, profit over craft, loses something essential. These are the domains where beauty, creativity, and cultural richness are at stake.",
    subtopics: [
      {
        id: "bw-arts",
        title: "Arts & Creative Expression",
        description: "Supporting artistic freedom, funding for the arts, and making creative expression accessible to all — not just the privileged.",
      },
      {
        id: "bw-culture",
        title: "Cultural Preservation",
        description: "Protecting indigenous cultures, languages, and traditions from erasure in the face of globalization and homogenization.",
      },
      {
        id: "bw-architecture",
        title: "Architecture & Urban Design",
        description: "Designing cities and spaces that nurture human wellbeing — beauty in the built environment, not just function.",
      },
      {
        id: "bw-design",
        title: "Design & Aesthetics",
        description: "Bringing thoughtful design to everyday objects, interfaces, and experiences — elevating the quality of daily life.",
      },
      {
        id: "bw-music",
        title: "Music & Sound",
        description: "The universal language — preserving musical traditions, supporting independent musicians, and using sound for healing and connection.",
      },
      {
        id: "bw-dance",
        title: "Dance & Movement",
        description: "Embodied expression as a form of cultural identity, healing, and human connection across boundaries.",
      },
      {
        id: "bw-film",
        title: "Film & Storytelling",
        description: "The stories we tell shape how we see the world. Supporting diverse, truthful, and transformative narratives.",
      },
      {
        id: "bw-craftsmanship",
        title: "Craftsmanship & Artisanship",
        description: "Reviving the value of handmade, slow, and skillful work in a world of mass production.",
      },
    ],
  },
  {
    id: "compassionate-world",
    title: "A More Compassionate World",
    icon: "heart",
    description:
      "Compassion is the recognition that another's suffering is your own. These are the areas where humanity's capacity for care, justice, and solidarity is most needed — and most tested.",
    subtopics: [
      {
        id: "cw-family",
        title: "Family & Community",
        description: "Strengthening the bonds that hold society together — healthy families, resilient communities, intergenerational connection.",
      },
      {
        id: "cw-human-rights",
        title: "Human Rights & Dignity",
        description: "Defending the fundamental rights of every person — regardless of nation, race, gender, or circumstance.",
      },
      {
        id: "cw-social-good",
        title: "Social Good & Philanthropy",
        description: "Building systems of generosity that address root causes, not just symptoms. Effective giving, mutual aid, and solidarity.",
      },
      {
        id: "cw-animal-welfare",
        title: "Animal Welfare",
        description: "Extending the circle of compassion to all sentient beings. Protecting species, ending cruelty, and rethinking our relationship with animals.",
      },
      {
        id: "cw-politics",
        title: "Political Reform & Governance",
        description: "Creating political systems that serve people rather than power — transparency, accountability, and genuine representation.",
      },
      {
        id: "cw-refugees",
        title: "Refugees & Migration",
        description: "Supporting displaced peoples and building systems that respond to forced migration with humanity rather than hostility.",
      },
      {
        id: "cw-elderly",
        title: "Elder Care & Aging",
        description: "Honoring and caring for aging populations — loneliness, healthcare access, and the wisdom of elders.",
      },
      {
        id: "cw-children",
        title: "Children & Youth",
        description: "Protecting childhood, supporting healthy development, and creating pathways for young people to thrive.",
      },
      {
        id: "cw-homelessness",
        title: "Homelessness & Housing",
        description: "Ensuring that every person has access to safe, stable shelter — a foundation for everything else.",
      },
    ],
  },
  {
    id: "healthier-world",
    title: "A Healthier World",
    icon: "leaf",
    description:
      "Health is not merely the absence of disease — it is the full flourishing of body, mind, and ecosystem. These domains address the conditions that allow life itself to thrive.",
    subtopics: [
      {
        id: "hw-agriculture",
        title: "Agriculture & Food Systems",
        description: "Transforming how we grow, distribute, and relate to food — regenerative farming, food security, and ending food waste.",
      },
      {
        id: "hw-cures",
        title: "Medical Research & Cures",
        description: "Advancing treatments and cures for disease — and ensuring they are accessible to all, not just those who can pay.",
      },
      {
        id: "hw-environment",
        title: "Environment & Climate",
        description: "Addressing the climate crisis, protecting ecosystems, cleaning oceans, restoring forests, and reimagining our relationship with the Earth.",
      },
      {
        id: "hw-mental-health",
        title: "Mental Health & Wellbeing",
        description: "Destigmatizing mental health, building accessible support systems, and addressing the loneliness epidemic.",
      },
      {
        id: "hw-sports",
        title: "Sports & Physical Vitality",
        description: "Promoting physical health, movement, and the values of discipline, teamwork, and embodiment.",
      },
      {
        id: "hw-water",
        title: "Clean Water & Sanitation",
        description: "Ensuring access to clean water and sanitation — still unavailable to hundreds of millions worldwide.",
      },
      {
        id: "hw-biodiversity",
        title: "Biodiversity & Conservation",
        description: "Protecting the web of life — species extinction, habitat loss, and the delicate balance of ecosystems.",
      },
      {
        id: "hw-pollution",
        title: "Pollution & Waste",
        description: "Tackling plastic, chemical, and industrial pollution — and reimagining waste as a design problem.",
      },
    ],
  },
  {
    id: "prosperous-world",
    title: "A More Prosperous World",
    icon: "lightbulb",
    description:
      "True prosperity is not just wealth — it is the flourishing of human potential through education, innovation, and equitable systems. These domains address how we build, learn, and create shared abundance.",
    subtopics: [
      {
        id: "pw-technology",
        title: "Technology & Innovation",
        description: "Harnessing technology to solve real problems — AI, biotech, clean energy, space exploration — while keeping humanity at the center.",
      },
      {
        id: "pw-economy",
        title: "Decentralized Economy & New Models",
        description: "Reimagining economic systems beyond pure capitalism — cooperative models, circular economy, blockchain-based fairness.",
      },
      {
        id: "pw-education",
        title: "Education & Learning",
        description: "Transforming education from factory-model schooling to personalized, lifelong, wisdom-oriented learning.",
      },
      {
        id: "pw-manufacturing",
        title: "Manufacturing & Industry",
        description: "Clean manufacturing, ethical supply chains, and the future of making things in a post-industrial world.",
      },
      {
        id: "pw-science",
        title: "Science & Research",
        description: "Advancing human knowledge through open science, interdisciplinary collaboration, and curiosity-driven research.",
      },
      {
        id: "pw-entrepreneurship",
        title: "Entrepreneurship & Social Enterprise",
        description: "Building businesses that solve problems and create value for all stakeholders — not just shareholders.",
      },
      {
        id: "pw-poverty",
        title: "Poverty & Economic Justice",
        description: "Addressing systemic poverty, wealth inequality, and creating pathways to economic dignity for all.",
      },
      {
        id: "pw-infrastructure",
        title: "Infrastructure & Connectivity",
        description: "Building the physical and digital infrastructure that connects communities — roads, internet, energy grids.",
      },
    ],
  },
  {
    id: "truthful-world",
    title: "A More Truthful World",
    icon: "scale",
    description:
      "Without truth, everything else collapses. These are the domains where humanity's capacity for honesty, meaning-making, and moral clarity is most needed — in an age of misinformation and confusion.",
    subtopics: [
      {
        id: "tw-history",
        title: "History & Collective Memory",
        description: "Preserving honest history, learning from past mistakes, and ensuring that the stories of marginalized peoples are not erased.",
      },
      {
        id: "tw-journalism",
        title: "Journalism & Free Press",
        description: "Defending independent journalism, investigative reporting, and the public's right to accurate information.",
      },
      {
        id: "tw-law",
        title: "Law & Justice",
        description: "Building legal systems that deliver genuine justice — reforming courts, prisons, and the relationship between law and power.",
      },
      {
        id: "tw-media",
        title: "Media & Information",
        description: "Combating misinformation, building media literacy, and creating platforms that inform rather than manipulate.",
      },
      {
        id: "tw-spirituality",
        title: "Spirituality & Meaning",
        description: "Supporting humanity's search for meaning beyond materialism — contemplative traditions, wisdom practices, and existential health.",
      },
      {
        id: "tw-philosophy",
        title: "Philosophy & Ethics",
        description: "Bringing philosophical thinking to real-world decisions — technology ethics, bioethics, and the future of human values.",
      },
      {
        id: "tw-transparency",
        title: "Transparency & Accountability",
        description: "Holding institutions, governments, and corporations accountable — open data, whistleblower protection, and democratic oversight.",
      },
      {
        id: "tw-dialogue",
        title: "Dialogue & Bridge-Building",
        description: "Rebuilding the capacity for genuine dialogue across difference — political, cultural, religious, and generational.",
      },
    ],
  },
];
