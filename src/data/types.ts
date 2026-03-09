// ============================================================
// Ikigai Journey — Content Pack Type Definitions
// ============================================================

export interface Quote {
  text: string;
  author: string;
  source?: string;
}

export interface ContentBlock {
  id: string;
  type: "paragraph" | "quote" | "heading" | "framework" | "callout";
  content?: string;
  quote?: Quote;
  heading?: string;
  level?: 1 | 2 | 3;
}

export interface ExerciseOption {
  id: string;
  label: string;
  description?: string;
}

export interface Exercise {
  id: string;
  type: "freetext" | "multiselect" | "ranking" | "card_select" | "timeline" | "visualization";
  prompt: string;
  guidance?: string;
  placeholder?: string;
  options?: ExerciseOption[];
  minSelections?: number;
  maxSelections?: number;
  followUpPrompt?: string;
}

export interface ModuleStep {
  id: string;
  title: string;
  contentBlocks: ContentBlock[];
  exercises: Exercise[];
  aiCoachingEnabled: boolean;
}

export interface ModuleData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  journeyPhase: "inward" | "outward";
  icon: string;
  themeColor: string;
  introduction: ContentBlock[];
  steps: ModuleStep[];
  completionMessage: string;
  outputLabel: string;
}

export interface WorldNeedCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  subtopics: WorldNeedSubtopic[];
}

export interface WorldNeedSubtopic {
  id: string;
  title: string;
  description: string;
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  strengths: string[];
  worldContribution: string;
  signalQuestions: string[];
}

export interface AISystemPrompt {
  moduleId: number;
  role: string;
  context: string;
  instructions: string;
  tone: string;
  crossModuleRefs: string;
  depthPrompts: string[];
}
