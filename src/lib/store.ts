import { useState, useCallback, useEffect, useRef } from 'react';
import type { JourneyState, ExerciseData, TimelineEvent } from './types';

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

export function loadJourney(): JourneyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJourney(state: JourneyState) {
  state.lastActiveAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearJourney() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useJourney() {
  const [state, setState] = useState<JourneyState>(() => loadJourney() || createInitialState());

  const persist = useCallback((updater: (prev: JourneyState) => JourneyState) => {
    setState(prev => {
      const next = updater(prev);
      saveJourney(next);
      return next;
    });
  }, []);

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

  const resetJourney = useCallback(() => {
    clearJourney();
    setState(createInitialState());
  }, []);

  return {
    state, getModuleState, isModuleUnlocked, saveExercise,
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
