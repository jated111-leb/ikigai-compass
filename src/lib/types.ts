export interface ExerciseData {
  type: 'freetext' | 'multiselect' | 'ranking' | 'cardselect' | 'timeline' | 'visualization';
  prompt: string;
  response?: string;
  selected?: string[];
  order?: string[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  description: string;
  emotional: 'positive' | 'negative' | 'transformative';
}

export interface JourneyState {
  currentModule: number;
  currentStep: number;
  modules: Record<string, ModuleState>;
  selectedWorldNeeds: string[];
  timelineEvents: TimelineEvent[];
  archetypeResult: string | null;
  ikigaiStatement: string | null;
  startedAt: string;
  lastActiveAt: string;
}

export interface ModuleState {
  completed: boolean;
  currentStep: number;
  exercises: Record<string, ExerciseData>;
  aiResponses: string[];
}

export interface ContentBlock {
  type: 'paragraph' | 'quote' | 'heading' | 'framework' | 'callout';
  text: string;
  author?: string;
  source?: string;
  level?: 1 | 2 | 3;
}

export interface Exercise {
  type: 'freetext' | 'multiselect' | 'ranking' | 'cardselect' | 'timeline' | 'visualization';
  prompt: string;
  placeholder?: string;
  options?: string[];
  guidance?: string;
}

export interface ModuleStep {
  title?: string;
  content: ContentBlock[];
  exercise?: Exercise;
}

export interface ModuleContent {
  id: number;
  title: string;
  description: string;
  icon: string;
  journeyPhase: 'inward' | 'outward';
  steps: ModuleStep[];
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  description: string;
  fullDescription: string;
  strengths: string[];
  worldContribution: string;
  signalQuestions: string[];
}

export interface WorldNeedCategory {
  title: string;
  icon: string;
  description: string;
  topics: { id: string; title: string; description: string }[];
}
