// ============================================================
// Ikigai Journey — Content Pack Master Index
// Import this file to access all content data
// ============================================================

// Type definitions
export type {
  Quote,
  ContentBlock,
  ExerciseOption,
  Exercise,
  ModuleStep,
  ModuleData,
  WorldNeedCategory,
  WorldNeedSubtopic,
  Archetype,
  AISystemPrompt,
} from "./types";

// Module content
export { module1 } from "./modules/module-1-what-excites-you";
export { module2 } from "./modules/module-2-what-bothers-you";
export { module3 } from "./modules/module-3-my-fears";
export { module4 } from "./modules/module-4-what-the-world-needs";
export { module5 } from "./modules/module-5-whats-your-story";
export { module6 } from "./modules/module-6-whats-your-gift";

// Data
export { worldNeedCategories } from "./content/world-needs";
export { archetypes } from "./content/archetypes";

// AI Prompts
export { aiSystemPrompts, masterSynthesisPrompt } from "./ai-prompts/system-prompts";

// ── Convenience: All modules as an array ──
import { module1 } from "./modules/module-1-what-excites-you";
import { module2 } from "./modules/module-2-what-bothers-you";
import { module3 } from "./modules/module-3-my-fears";
import { module4 } from "./modules/module-4-what-the-world-needs";
import { module5 } from "./modules/module-5-whats-your-story";
import { module6 } from "./modules/module-6-whats-your-gift";
import { ModuleData } from "./types";

export const allModules: ModuleData[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
];

export function getModuleById(id: number): ModuleData | undefined {
  return allModules.find((m) => m.id === id);
}

export function getModuleBySlug(slug: string): ModuleData | undefined {
  return allModules.find((m) => m.slug === slug);
}
