export interface ExerciseData {
  type: 'freetext' | 'multiselect' | 'ranking' | 'cardselect' | 'timeline';
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
  type: 'paragraph' | 'quote';
  text: string;
  author?: string;
}

export interface Exercise {
  type: 'freetext' | 'multiselect' | 'ranking' | 'cardselect' | 'timeline';
  prompt: string;
  placeholder?: string;
  options?: string[];
}

export interface ModuleStep {
  content: ContentBlock[];
  exercise?: Exercise;
}

export interface ModuleContent {
  id: number;
  title: string;
  description: string;
  icon: string;
  steps: ModuleStep[];
}

export interface Archetype {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface WorldNeedCategory {
  title: string;
  icon: string;
  topics: { id: string; title: string; description: string }[];
}
