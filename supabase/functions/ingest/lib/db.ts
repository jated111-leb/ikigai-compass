// Persistence for the ingestion layer: resolves the source registry,
// enforces the access policy, and upserts raw + normalized signals
// idempotently, while recording an ingestion_runs row per source.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NormalizedSignal } from "./types.ts";

export interface SourceRow {
  id: string;
  name: string;
  access_policy: string;
  enabled: boolean;
}

export interface PersistResult {
  source: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
  signalsIn: number;
  signalsKept: number;
}

const SNIPPET_MAX = 280;

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// name -> source row, for collectors to resolve their source_id.
export async function loadSources(db: SupabaseClient): Promise<Map<string, SourceRow>> {
  const { data, error } = await db
    .from("trend_sources")
    .select("id,name,access_policy,enabled");
  if (error) throw new Error(`loadSources: ${error.message}`);
  const map = new Map<string, SourceRow>();
  for (const row of data ?? []) map.set(row.name, row as SourceRow);
  return map;
}

function clip(s: string | undefined, n: number): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// Write a batch of signals for one source. Idempotent via raw_signals.dedupe_key
// and signals.raw_signal_id (both unique). Records an ingestion_runs row.
export async function persist(
  db: SupabaseClient,
  source: SourceRow,
  signals: NormalizedSignal[],
): Promise<PersistResult> {
  // Compliance gate: never ingest from blocked or disabled sources.
  if (!source.enabled) {
    return { source: source.name, status: "skipped", reason: "disabled", signalsIn: 0, signalsKept: 0 };
  }
  if (source.access_policy === "blocked") {
    return { source: source.name, status: "skipped", reason: "blocked policy", signalsIn: 0, signalsKept: 0 };
  }

  const { data: runRow, error: runErr } = await db
    .from("ingestion_runs")
    .insert({ source_id: source.id, status: "running", signals_in: signals.length })
    .select("id")
    .single();
  if (runErr) throw new Error(`ingestion_runs insert: ${runErr.message}`);
  const runId = runRow!.id as string;

  try {
    let kept = 0;
    if (signals.length > 0) {
      // light_meta sources are capped to a short snippet, no body. The DB also
      // enforces <=280 via CHECK; we clip here to avoid the insert erroring.
      const rawRows = signals.map((s) => ({
        source_id: source.id,
        dedupe_key: `${source.name}:${s.externalId}`,
        external_id: s.externalId,
        url: s.url ?? null,
        title: clip(s.title, 500) ?? null,
        snippet: clip(s.snippet ?? s.summary, SNIPPET_MAX) ?? null,
        payload: source.access_policy.startsWith("api") ? (s as unknown) : null,
        access_policy_snapshot: source.access_policy,
        published_at: s.publishedAt ?? null,
      }));

      const { data: rawData, error: rawErr } = await db
        .from("raw_signals")
        .upsert(rawRows, { onConflict: "dedupe_key" })
        .select("id,dedupe_key");
      if (rawErr) throw new Error(`raw_signals upsert: ${rawErr.message}`);

      const idByKey = new Map<string, string>();
      for (const r of rawData ?? []) idByKey.set(r.dedupe_key as string, r.id as string);

      const signalRows = signals
        .map((s) => {
          const rawId = idByKey.get(`${source.name}:${s.externalId}`);
          if (!rawId) return null;
          return {
            raw_signal_id: rawId,
            source_id: source.id,
            signal_type: s.signalType,
            title: clip(s.title, 500) ?? s.externalId,
            summary: clip(s.summary, 2000) ?? null,
            url: s.url ?? null,
            entities: s.entities ?? [],
            keywords: s.keywords ?? [],
            metric_value: s.metricValue ?? null,
            metric_unit: s.metricUnit ?? null,
            geo_hint: s.geoHint ?? null,
            observed_at: s.observedAt ?? s.publishedAt ?? null,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      const { error: sigErr, count } = await db
        .from("signals")
        .upsert(signalRows, { onConflict: "raw_signal_id", count: "exact" });
      if (sigErr) throw new Error(`signals upsert: ${sigErr.message}`);
      kept = count ?? signalRows.length;
    }

    await db
      .from("ingestion_runs")
      .update({ status: "ok", finished_at: new Date().toISOString(), signals_kept: kept })
      .eq("id", runId);

    return { source: source.name, status: "ok", signalsIn: signals.length, signalsKept: kept };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .from("ingestion_runs")
      .update({ status: "error", finished_at: new Date().toISOString(), error: message })
      .eq("id", runId);
    return { source: source.name, status: "error", reason: message, signalsIn: signals.length, signalsKept: 0 };
  }
}
