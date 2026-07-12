// ============================================================
// Cohort data access — the university course-pilot layer.
//
// The new pilot tables/RPCs are not in the generated Supabase types, so we
// use a loosely-typed client here (matching the pattern in store.ts). The
// privacy boundary is enforced server-side by RLS + SECURITY DEFINER RPCs;
// this module never has a way to read another student's raw journey.
// ============================================================

import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export interface Cohort {
  id: string;
  instructor_id: string;
  name: string;
  join_code: string;
  term: string | null;
  tone: string;
  created_at: string;
  archived_at: string | null;
}

export interface RosterEntry {
  user_id: string;
  email: string | null;
  role: 'student' | 'instructor';
  joined_at: string;
  modules_completed: number;
  total_modules: number;
  current_module: number;
  is_complete: boolean;
  last_active_at: string | null;
  shared: boolean;
}

export interface SharedSummary {
  student_id: string;
  email: string | null;
  summary: string;
  shared_at: string;
}

export interface ClarityLift {
  n: number;
  avg_pre: number;
  avg_post: number;
  lift: number;
}

export type CheckpointPhase = 'pre' | 'post';

export interface Checkpoint {
  clarity: number;
  decided: number;
  note?: string | null;
}

// ── Student: membership, join ──

export async function getMyStudentCohort(userId: string): Promise<Cohort | null> {
  const { data } = await sb
    .from('cohort_members')
    .select('role, cohort:cohorts(*)')
    .eq('user_id', userId)
    .eq('role', 'student')
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.cohort as Cohort) ?? null;
}

export async function joinCohort(code: string): Promise<string> {
  const { data, error } = await sb.rpc('join_cohort', { p_code: code.trim() });
  if (error) {
    const msg = String(error.message || '');
    if (msg.includes('invalid_code')) {
      throw new Error("That code didn't match a class. Double-check it and try again.");
    }
    if (msg.includes('not_authenticated')) {
      throw new Error('Please sign in first, then join your class.');
    }
    throw new Error(msg || 'Could not join the class.');
  }
  return data as string;
}

// ── Instructor: cohorts, roster, shares, aggregate ──

export async function listMyCohorts(userId: string): Promise<Cohort[]> {
  const { data } = await sb
    .from('cohorts')
    .select('*')
    .eq('instructor_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  return (data ?? []) as Cohort[];
}

export async function createCohort(
  userId: string,
  name: string,
  term: string | null,
): Promise<Cohort> {
  const { data, error } = await sb
    .from('cohorts')
    .insert({ name, term, instructor_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Cohort;
}

export async function getRoster(cohortId: string): Promise<RosterEntry[]> {
  const { data, error } = await sb.rpc('cohort_roster', { p_cohort: cohortId });
  if (error) throw new Error(error.message);
  return (data ?? []) as RosterEntry[];
}

export async function getSharedSummaries(cohortId: string): Promise<SharedSummary[]> {
  const { data, error } = await sb.rpc('cohort_shared_summaries', { p_cohort: cohortId });
  if (error) throw new Error(error.message);
  return (data ?? []) as SharedSummary[];
}

export async function getClarityLift(cohortId: string): Promise<ClarityLift | null> {
  const { data, error } = await sb.rpc('cohort_clarity_lift', { p_cohort: cohortId });
  if (error) throw new Error(error.message);
  // RPC returns 0 rows below the anonymity threshold.
  const row = Array.isArray(data) ? data[0] : data;
  return (row as ClarityLift) ?? null;
}

// ── Instrumentation: checkpoints, events ──

export async function getMyCheckpoint(
  userId: string,
  cohortId: string,
  phase: CheckpointPhase,
): Promise<Checkpoint | null> {
  const { data } = await sb
    .from('checkpoint_responses')
    .select('clarity, decided, note')
    .eq('user_id', userId)
    .eq('cohort_id', cohortId)
    .eq('phase', phase)
    .maybeSingle();
  return (data as Checkpoint) ?? null;
}

export async function saveCheckpoint(
  userId: string,
  cohortId: string,
  phase: CheckpointPhase,
  cp: Checkpoint,
): Promise<void> {
  const { error } = await sb.from('checkpoint_responses').upsert(
    {
      user_id: userId,
      cohort_id: cohortId,
      phase,
      clarity: cp.clarity,
      decided: cp.decided,
      note: cp.note ?? null,
    },
    { onConflict: 'user_id,cohort_id,phase' },
  );
  if (error) throw new Error(error.message);
}

export async function shareSummary(
  userId: string,
  cohortId: string,
  summary: string,
): Promise<void> {
  const { error } = await sb.from('shared_summaries').upsert(
    { student_id: userId, cohort_id: cohortId, summary },
    { onConflict: 'cohort_id,student_id' },
  );
  if (error) throw new Error(error.message);
}

/** Best-effort funnel event; never throws into the UI. */
export async function logEvent(
  userId: string | null,
  cohortId: string | null,
  name: string,
  props: Record<string, unknown> = {},
): Promise<void> {
  try {
    await sb.from('analytic_events').insert({
      user_id: userId,
      cohort_id: cohortId,
      name,
      props,
    });
  } catch {
    // swallow — analytics must never break a user flow
  }
}
