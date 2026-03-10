import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyState, ExerciseData, TimelineEvent } from './types';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'ikigai-journey';

const createInitialState = (): JourneyState => ({
  currentModule: 1,
  currentStep: 0,
  modules: {},
  selectedWorldNeeds: [],
  timelineEvents: [],
  archetypeResult: null,
  ikigaiStatement: null,
  startedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
});

// localStorage helpers (fallback cache)
function loadLocal(): JourneyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(state: JourneyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

// Supabase helpers
async function loadFromSupabase(userId: string): Promise<JourneyState | null> {
  const { data, error } = await supabase
    .from('journeys')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.state as unknown as JourneyState;
}

async function saveToSupabase(userId: string, state: JourneyState) {
  await supabase.from('journeys').upsert(
    {
      user_id: userId,
      state: JSON.parse(JSON.stringify(state)),
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: 'user_id' }
  );
}

async function deleteFromSupabase(userId: string) {
  await supabase.from('journeys').delete().eq('user_id', userId);
}

// Public function to load journey (used by ExportPage, Index)
export async function loadJourney(user: User | null): Promise<JourneyState | null> {
  if (user) {
    const remote = await loadFromSupabase(user.id);
    if (remote) return remote;
  }
  return loadLocal();
}

export function clearJourney() {
  clearLocal();
}

export function useJourney(user: User | null) {
  const [state, setState] = useState<JourneyState>(createInitialState);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const userRef = useRef(user);
  userRef.current = user;

  // Load on mount / user change
  useEffect(() => {
    let cancelled = false;
    setJourneyLoading(true);

    (async () => {
      const loaded = await loadJourney(user);
      if (!cancelled) {
        setState(loaded || createInitialState());
        setJourneyLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // Debounced Supabase sync
  const syncToSupabase = useCallback((next: JourneyState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const u = userRef.current;
      if (u) saveToSupabase(u.id, next);
    }, 1000);
  }, []);

  const persist = useCallback((updater: (prev: JourneyState) => JourneyState) => {
    setState(prev => {
      const next = { ...updater(prev), lastActiveAt: new Date().toISOString() };
      saveLocal(next); // immediate localStorage
      syncToSupabase(next); // debounced remote
      return next;
    });
  }, [syncToSupabase]);

  const getModuleState = useCallback((moduleId: number) => {
    return state.modules[String(moduleId)] || { completed: false, currentStep: 0, exercises: {}, aiResponses: [] };
  }, [state.modules]);

  const isModuleUnlocked = useCallback((moduleId: number) => {
    if (moduleId === 1) return true;
    const prev = state.modules[String(moduleId - 1)];
    return prev?.completed === true;
  }, [state.modules]);

  const saveExercise = useCallback((moduleId: number, stepIndex: number, data: Partial<ExerciseData>) => {
    persist(prev => {
      const mod = prev.modules[String(moduleId)] || { completed: false, currentStep: stepIndex, exercises: {}, aiResponses: [] };
      const existing = mod.exercises[String(stepIndex)] || {};
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [String(moduleId)]: {
            ...mod,
            currentStep: Math.max(mod.currentStep, stepIndex),
            exercises: { ...mod.exercises, [String(stepIndex)]: { ...existing, ...data } as ExerciseData },
          },
        },
      };
    });
  }, [persist]);

  const completeModule = useCallback((moduleId: number) => {
    persist(prev => {
      const mod = prev.modules[String(moduleId)] || { completed: false, currentStep: 0, exercises: {}, aiResponses: [] };
      return {
        ...prev,
        currentModule: Math.max(prev.currentModule, moduleId + 1),
        modules: { ...prev.modules, [String(moduleId)]: { ...mod, completed: true } },
      };
    });
  }, [persist]);

  const setWorldNeeds = useCallback((needs: string[]) => {
    persist(prev => ({ ...prev, selectedWorldNeeds: needs }));
  }, [persist]);

  const setTimelineEvents = useCallback((events: TimelineEvent[]) => {
    persist(prev => ({ ...prev, timelineEvents: events }));
  }, [persist]);

  const setArchetype = useCallback((archetype: string) => {
    persist(prev => ({ ...prev, archetypeResult: archetype }));
  }, [persist]);

  const setIkigaiStatement = useCallback((statement: string) => {
    persist(prev => ({ ...prev, ikigaiStatement: statement }));
  }, [persist]);

  const resetJourney = useCallback(async () => {
    clearLocal();
    const u = userRef.current;
    if (u) await deleteFromSupabase(u.id);
    setState(createInitialState());
  }, []);

  return {
    state, journeyLoading, getModuleState, isModuleUnlocked, saveExercise,
    completeModule, setWorldNeeds, setTimelineEvents,
    setArchetype, setIkigaiStatement, resetJourney,
  };
}

// Debounced save hook for text inputs
export function useDebouncedSave(callback: (value: string) => void, delay = 500) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return useCallback((value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(value), delay);
  }, [callback, delay]);
}
