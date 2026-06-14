// ============================================================
// Mission Fit — Local-first store
// ============================================================
// MVP persistence: localStorage on the facilitator's device.
// Cross-person collection happens through explicit, consent-based
// share codes (encode/decode below) rather than silent server sync —
// which keeps each person the owner of what they share.

import { useState, useCallback, useEffect } from 'react';
import type {
  MissionFitState,
  CompanyProfile,
  MemberReflection,
  Dossier,
  MissionInvite,
} from './types';

const STORAGE_KEY = 'ikigai-mission-fit';

function createInitialState(): MissionFitState {
  return { company: null, members: [], dossiers: {} };
}

function load(): MissionFitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createInitialState(), ...JSON.parse(raw) } : createInitialState();
  } catch {
    return createInitialState();
  }
}

function save(state: MissionFitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Base64 <-> JSON helpers (unicode-safe) for share codes ──

export function encodePayload(obj: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

export function decodePayload<T>(code: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(code.trim())))) as T;
  } catch {
    return null;
  }
}

const emptyCompany = (): CompanyProfile => ({
  companyName: '',
  founderName: '',
  responses: {},
  synthesis: null,
  updatedAt: new Date().toISOString(),
});

export function useMissionFit() {
  const [state, setState] = useState<MissionFitState>(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const updateCompany = useCallback((patch: Partial<CompanyProfile>) => {
    setState(prev => ({
      ...prev,
      company: { ...(prev.company || emptyCompany()), ...patch, updatedAt: new Date().toISOString() },
    }));
  }, []);

  const addMember = useCallback((name: string, role: string): string => {
    const id = newId();
    const member: MemberReflection = {
      id,
      name,
      role,
      responses: {},
      consentShared: false,
      completedAt: null,
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, members: [...prev.members, member] }));
    return id;
  }, []);

  const upsertMember = useCallback((member: MemberReflection) => {
    setState(prev => {
      const exists = prev.members.some(m => m.id === member.id);
      return {
        ...prev,
        members: exists
          ? prev.members.map(m => (m.id === member.id ? member : m))
          : [...prev.members, member],
      };
    });
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<MemberReflection>) => {
    setState(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
      ),
    }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setState(prev => {
      const dossiers = { ...prev.dossiers };
      delete dossiers[id];
      return { ...prev, members: prev.members.filter(m => m.id !== id), dossiers };
    });
  }, []);

  const saveDossier = useCallback((dossier: Dossier) => {
    setState(prev => ({ ...prev, dossiers: { ...prev.dossiers, [dossier.memberId]: dossier } }));
  }, []);

  const getMember = useCallback(
    (id: string) => state.members.find(m => m.id === id),
    [state.members]
  );

  /** Build the minimal company context a member sees while reflecting. */
  const buildInvite = useCallback(
    (memberId: string): MissionInvite | null => {
      const member = state.members.find(m => m.id === memberId);
      const company = state.company;
      if (!member || !company) return null;
      return {
        companyName: company.companyName,
        founderName: company.founderName,
        mission: company.synthesis || company.responses['mission'] || '',
        memberId: member.id,
        memberName: member.name,
        role: member.role,
      };
    },
    [state.members, state.company]
  );

  return {
    state,
    updateCompany,
    addMember,
    upsertMember,
    updateMember,
    removeMember,
    saveDossier,
    getMember,
    buildInvite,
  };
}
