import type { ModuleContent, Archetype, WorldNeedCategory } from './types';
import { allModules } from '@/data';
import { worldNeedCategories as dataWorldNeeds } from '@/data/content/world-needs';
import { archetypes as dataArchetypes } from '@/data/content/archetypes';
import type { ModuleData, ContentBlock as DataContentBlock } from '@/data/types';

// ── Helpers to convert data-pack types to lib types ──

function convertContentBlock(block: DataContentBlock): import('./types').ContentBlock {
  switch (block.type) {
    case 'quote':
      return {
        type: 'quote',
        text: block.quote?.text ?? '',
        author: block.quote?.author,
        source: block.quote?.source,
      };
    case 'heading':
      return {
        type: 'heading',
        text: block.heading ?? '',
        level: block.level,
      };
    case 'framework':
    case 'callout':
      return {
        type: block.type,
        text: block.content ?? '',
      };
    case 'paragraph':
    default:
      return {
        type: 'paragraph',
        text: block.content ?? '',
      };
  }
}

function convertModule(mod: ModuleData): ModuleContent {
  const steps: import('./types').ModuleStep[] = [];

  // First step: introduction content (no exercise)
  if (mod.introduction.length > 0) {
    steps.push({
      title: mod.subtitle,
      content: mod.introduction.map(convertContentBlock),
    });
  }

  // Flatten: each exercise in each data step becomes its own UI step
  for (const dataStep of mod.steps) {
    const contentBlocks = dataStep.contentBlocks.map(convertContentBlock);

    if (dataStep.exercises.length === 0) {
      // Step with content only
      steps.push({ title: dataStep.title, content: contentBlocks });
    } else {
      // First exercise gets the step's content blocks
      dataStep.exercises.forEach((ex, idx) => {
        const exerciseType = ex.type === 'card_select' ? 'cardselect' : ex.type;
        steps.push({
          title: idx === 0 ? dataStep.title : undefined,
          content: idx === 0 ? contentBlocks : [],
          exercise: {
            type: exerciseType as any,
            prompt: ex.prompt,
            placeholder: ex.placeholder,
            guidance: ex.guidance,
            options: ex.options?.map(o => typeof o === 'string' ? o : o.label),
          },
        });
      });
    }
  }

  return {
    id: mod.id,
    title: mod.title,
    description: mod.subtitle,
    icon: mod.icon.charAt(0).toUpperCase() + mod.icon.slice(1),
    journeyPhase: mod.journeyPhase,
    steps,
  };
}

// ── Exported data ──

export const modules: ModuleContent[] = allModules.map(convertModule);

export const worldNeedCategories: WorldNeedCategory[] = dataWorldNeeds.map(cat => ({
  title: cat.title,
  icon: cat.icon.charAt(0).toUpperCase() + cat.icon.slice(1),
  description: cat.description,
  topics: cat.subtopics.map(s => ({ id: s.id, title: s.title, description: s.description })),
}));

export const archetypes: Archetype[] = dataArchetypes.map(a => ({
  id: a.id,
  name: a.name,
  icon: a.icon.charAt(0).toUpperCase() + a.icon.slice(1),
  description: a.shortDescription,
  fullDescription: a.fullDescription,
  strengths: a.strengths,
  worldContribution: a.worldContribution,
  signalQuestions: a.signalQuestions,
}));

export const moduleIcons: Record<number, string> = {
  1: "Flame",
  2: "Eye",
  3: "Shield",
  4: "Globe",
  5: "Scroll",
  6: "Sparkles",
};
