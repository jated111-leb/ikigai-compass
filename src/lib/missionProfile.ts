// Derives a `mission_profiles` row from a user's Ikigai journey so the trend
// feed can rank signals against what the user actually cares about.
//
// Keyless and deterministic: keywords come from the world-needs they picked,
// their Ikigai statement, and archetype; sector weights come from the
// distribution of their selected world-need categories; geo focus is detected
// from free text. (An embedding could be added later for semantic ranking.)

import { supabase } from '@/integrations/supabase/client';
import { worldNeedCategories } from '@/data/content/world-needs';
import type { JourneyState } from './types';

export interface MissionProfileInput {
  keywords: string[];
  sector_weights: Record<string, number>;
  need_weights: Record<string, number>;
  geo_focus: string[];
  derived_from: Record<string, unknown>;
}

// world-need subtopic id -> { phrase, categoryId }
const SUBTOPIC = new Map<string, { phrase: string; categoryId: string }>();
for (const cat of worldNeedCategories) {
  for (const sub of cat.subtopics) {
    SUBTOPIC.set(sub.id, { phrase: toPhrase(sub.title), categoryId: cat.id });
  }
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you',
  'our', 'are', 'was', 'will', 'would', 'can', 'could', 'should', 'have', 'has',
  'their', 'them', 'they', 'what', 'who', 'how', 'why', 'about', 'more', 'most',
  'world', 'people', 'want', 'make', 'making', 'help', 'helping', 'life', 'living',
]);

const GEO_TERMS: Record<string, string> = {
  iraq: 'iraq', baghdad: 'iraq', kurdistan: 'iraq', erbil: 'iraq',
  mena: 'mena', 'middle east': 'mena', 'north africa': 'mena',
  gcc: 'gcc', gulf: 'gcc', uae: 'gcc', dubai: 'gcc', 'abu dhabi': 'gcc',
  saudi: 'gcc', qatar: 'gcc', kuwait: 'gcc', bahrain: 'gcc', oman: 'gcc',
  lebanon: 'levant', levant: 'levant', jordan: 'levant', syria: 'levant',
};

function toPhrase(title: string): string {
  // "Mental Health & Wellbeing" -> "mental health"
  return title.split(/[&,/]/)[0].trim().toLowerCase().replace(/\s+/g, ' ');
}

function collectFreeText(state: JourneyState): string {
  const parts: string[] = [];
  if (state.ikigaiStatement) parts.push(state.ikigaiStatement);
  if (state.archetypeResult) parts.push(state.archetypeResult);
  for (const mod of Object.values(state.modules ?? {})) {
    for (const ex of Object.values(mod.exercises ?? {})) {
      if (ex.response) parts.push(ex.response);
      if (ex.selected) parts.push(ex.selected.join(' '));
    }
  }
  return parts.join('  ').toLowerCase();
}

function phrasesFromText(text: string, max: number): string[] {
  const words = text.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();
  const bump = (t: string) => counts.set(t, (counts.get(t) ?? 0) + 1);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.length > 3 && !STOPWORDS.has(w)) bump(w);
    const next = words[i + 1];
    if (next && w.length > 2 && next.length > 2 && !STOPWORDS.has(w) && !STOPWORDS.has(next)) {
      bump(`${w} ${next}`); // bigram
    }
  }
  return [...counts.entries()]
    .filter(([t, c]) => (t.includes(' ') ? c >= 1 : c >= 2)) // keep repeated unigrams, any bigram
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([t]) => t);
}

export function deriveMissionProfile(state: JourneyState): MissionProfileInput {
  const selected = state.selectedWorldNeeds ?? [];

  // Sector weights = normalized distribution over world-need categories.
  const catCounts: Record<string, number> = {};
  const keywordSet = new Set<string>();
  for (const id of selected) {
    const meta = SUBTOPIC.get(id);
    if (!meta) continue;
    catCounts[meta.categoryId] = (catCounts[meta.categoryId] ?? 0) + 1;
    if (meta.phrase) keywordSet.add(meta.phrase);
  }
  const totalCat = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
  const sector_weights: Record<string, number> = {};
  for (const [cat, n] of Object.entries(catCounts)) {
    sector_weights[cat] = Math.round((n / totalCat) * 100) / 100;
  }

  // Keywords from free text (statement, archetype, answers).
  const text = collectFreeText(state);
  for (const p of phrasesFromText(text, 24)) keywordSet.add(p);

  // Geo focus detected in free text.
  const geo = new Set<string>();
  for (const [term, region] of Object.entries(GEO_TERMS)) {
    if (text.includes(term)) geo.add(region);
  }

  return {
    keywords: [...keywordSet].slice(0, 40),
    sector_weights,
    need_weights: {},
    geo_focus: [...geo],
    derived_from: {
      selectedWorldNeeds: selected,
      hasStatement: !!state.ikigaiStatement,
      archetype: state.archetypeResult ?? null,
      derivedAt: new Date().toISOString(),
    },
  };
}

// Derive and upsert the mission profile for a user. Safe to call repeatedly.
export async function upsertMissionProfile(userId: string, state: JourneyState) {
  const profile = deriveMissionProfile(state);
  // `mission_profiles` isn't in the generated Database types yet, so cast the
  // client (same pattern store.ts uses for journey upserts).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('mission_profiles').upsert(
    {
      user_id: userId,
      keywords: profile.keywords,
      sector_weights: profile.sector_weights,
      need_weights: profile.need_weights,
      geo_focus: profile.geo_focus,
      derived_from: profile.derived_from,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
  return profile;
}
