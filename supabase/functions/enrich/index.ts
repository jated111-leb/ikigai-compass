// Trend enrich function — clusters recent signals into trends and enriches
// each changed trend with Claude Haiku 4.5 via the Anthropic Batch API
// (50% off), structured outputs, and prompt caching.
//
// Two phases (Batch API is async):
//   POST /enrich?action=cluster  — cluster signals, create/refresh trends,
//                                   submit a batch for trends that changed.
//   POST /enrich?action=collect  — poll pending batches; apply results.
//
// Auth: requires x-ingest-key header matching INGEST_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const ENRICHMENT_VERSION = "haiku-v1";
const MODEL = "claude-haiku-4-5";
const ANTHROPIC_VERSION = "2023-06-01";

// Fixed vocabularies — must match taxonomy_nodes keys so links resolve.
const TREND_TYPES = ["consumer", "startup", "innovation", "content", "product", "macro"];
const MATURITY = ["weak-signal", "emerging", "scaling", "mainstream", "mature", "declining"];
const NEEDS = ["connection", "meaning", "health", "justice", "sustainability", "knowledge", "beauty", "play"];
const SECTORS = ["tech", "health_sector", "climate", "education", "finance", "media", "civic", "commerce"];
const GEOS = ["global", "mena", "gcc", "iraq", "us", "eu", "apac", "latam", "africa"];
const JTBD_FAMILIES = [
  "get-healthier", "feel-belonging", "save-time", "save-money", "learn-grow",
  "express-identity", "stay-safe", "be-entertained", "do-good", "gain-status",
  "manage-complexity", "access-the-inaccessible",
];

type Signal = {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  keywords: string[];
  observed_at: string | null;
  metric_value: number | null;
  source_id: string;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `trend-${Date.now()}`;

const titleCase = (s: string) => s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// ---------- Clustering & scoring ----------
function cluster(signals: Signal[]): Map<string, Signal[]> {
  const counts = new Map<string, number>();
  for (const s of signals) for (const k of s.keywords ?? []) counts.set(k, (counts.get(k) ?? 0) + 1);
  const clusters = new Map<string, Signal[]>();
  for (const s of signals) {
    const key = (s.keywords ?? [])
      .filter((k) => (counts.get(k) ?? 0) >= 2)
      .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))[0];
    if (!key) continue;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(s);
  }
  return clusters;
}

function momentumScore(sigs: Signal[]): number {
  const now = Date.now();
  let score = 0;
  for (const s of sigs) {
    const obs = s.observed_at ? new Date(s.observed_at).getTime() : now - 7 * 86400_000;
    const ageHours = Math.max(0, (now - obs) / 3_600_000);
    score += 10 * Math.exp(-ageHours / 72); // 3-day half-life
  }
  return Math.min(100, Math.round(score * 100) / 100);
}

function evidenceScore(sigs: Signal[]): number {
  const sources = new Set(sigs.map((s) => s.source_id));
  return Math.min(100, sources.size * 25 + Math.min(20, sigs.length));
}

// A trend is re-enriched only when its signal set grows materially since the
// last enrichment — keeps Haiku calls (and cost) bounded.
function materiallyChanged(newCount: number, signature: string | null): boolean {
  const prev = signature ? parseInt(signature, 10) : 0;
  if (!prev) return true; // never enriched
  return newCount >= prev * 1.5 || newCount - prev >= 5;
}

// ---------- Anthropic Batch API (raw HTTP — small, stable surface) ----------
const SYSTEM_PROMPT =
  `You classify emerging trends for an Ikigai/innovation discovery app. Given a cluster of ` +
  `recent signals about one theme, produce a single trend record as JSON.\n\n` +
  `Rules:\n` +
  `- title: 5-8 words, specific.\n` +
  `- thesis: one sentence (<30 words) on what is shifting and why it matters.\n` +
  `- description: 2-3 sentences of context.\n` +
  `- trend_type: one of ${TREND_TYPES.join(", ")}.\n` +
  `- maturity_stage: one of ${MATURITY.join(", ")}.\n` +
  `- needs (1-3): from ${NEEDS.join(", ")}.\n` +
  `- sectors (1-2): from ${SECTORS.join(", ")}.\n` +
  `- geos (1-2): from ${GEOS.join(", ")}. This is a GLOBAL app — choose the regions the ` +
  `evidence actually points to, and use "global" when it is not region-specific. Do not ` +
  `default to any one region.\n` +
  `- jtbd_family: from ${JTBD_FAMILIES.join(", ")}.\n` +
  `- jtbd_statement: "When [situation], I want to [motivation], so I can [outcome]."\n` +
  `Return only fields that fit; arrays may be empty if nothing applies.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "thesis", "description", "trend_type", "maturity_stage", "needs", "sectors", "geos", "jtbd_family", "jtbd_statement"],
  properties: {
    title: { type: "string" },
    thesis: { type: "string" },
    description: { type: "string" },
    trend_type: { type: "string", enum: TREND_TYPES },
    maturity_stage: { type: "string", enum: MATURITY },
    needs: { type: "array", items: { type: "string", enum: NEEDS } },
    sectors: { type: "array", items: { type: "string", enum: SECTORS } },
    geos: { type: "array", items: { type: "string", enum: GEOS } },
    jtbd_family: { type: "string", enum: JTBD_FAMILIES },
    jtbd_statement: { type: "string" },
  },
};

type Enrichment = {
  title: string; thesis: string; description: string;
  trend_type: string; maturity_stage: string;
  needs: string[]; sectors: string[]; geos: string[];
  jtbd_family: string; jtbd_statement: string;
};

function anthropicHeaders(key: string) {
  return {
    "x-api-key": key,
    "anthropic-version": ANTHROPIC_VERSION,
    "content-type": "application/json",
  };
}

function batchRequest(trendId: string, keyword: string, sigs: Signal[]) {
  const headlines = sigs.slice(0, 12).map((s) => `- ${s.title}`).join("\n");
  return {
    custom_id: trendId,
    params: {
      model: MODEL,
      max_tokens: 1024,
      // Prompt caching: identical system prefix across every request in the
      // batch → cache reads (~0.1x) after the first.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Theme keyword: "${keyword}"\n\nRecent signals:\n${headlines}` }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    },
  };
}

async function submitBatch(key: string, requests: unknown[]): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages/batches", {
    method: "POST",
    headers: anthropicHeaders(key),
    body: JSON.stringify({ requests }),
  });
  if (!r.ok) throw new Error(`batch submit ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (await r.json()).id as string;
}

async function getBatch(key: string, id: string): Promise<{ processing_status: string; results_url: string | null }> {
  const r = await fetch(`https://api.anthropic.com/v1/messages/batches/${id}`, { headers: anthropicHeaders(key) });
  if (!r.ok) throw new Error(`batch get ${r.status}`);
  const j = await r.json();
  return { processing_status: j.processing_status, results_url: j.results_url ?? null };
}

// Results are JSONL; one line per request. Returns custom_id -> parsed enrichment.
async function fetchResults(key: string, url: string): Promise<Map<string, Enrichment>> {
  const r = await fetch(url, { headers: anthropicHeaders(key) });
  if (!r.ok) throw new Error(`results ${r.status}`);
  const out = new Map<string, Enrichment>();
  for (const line of (await r.text()).split("\n")) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (row.result?.type !== "succeeded") continue;
      const textBlock = (row.result.message?.content ?? []).find((b: any) => b.type === "text");
      if (!textBlock) continue;
      out.set(row.custom_id, JSON.parse(textBlock.text) as Enrichment);
    } catch (_e) { /* skip malformed line */ }
  }
  return out;
}

// ---------- Phase 1: cluster + submit ----------
async function runCluster(): Promise<Response> {
  // Orphan signals from the last 14 days (covers the weekly window + retries).
  const since = new Date(Date.now() - 14 * 86400_000).toISOString();
  const { data: signals, error } = await supabase
    .from("signals")
    .select("id, title, summary, url, keywords, observed_at, metric_value, source_id, trend_signals!left(trend_id)")
    .gte("created_at", since)
    .limit(1000);
  if (error) return json({ error: error.message }, 500);

  const orphans = (signals as any[]).filter((s) => !s.trend_signals?.length) as Signal[];
  const clusters = cluster(orphans);

  const toEnrich: Array<{ trendId: string; keyword: string; sigs: Signal[]; signature: string }> = [];
  const created: any[] = [];
  let refreshed = 0;

  for (const [keyword, sigs] of clusters) {
    if (sigs.length < 2) continue;
    const slug = slugify(keyword);
    const { data: existing } = await supabase
      .from("trends")
      .select("id, signal_count, enrichment_signature")
      .eq("slug", slug)
      .maybeSingle();

    const mom = momentumScore(sigs);
    const ev = evidenceScore(sigs);
    let trendId: string;

    if (!existing) {
      const obs = sigs.map((s) => s.observed_at).filter(Boolean).sort() as string[];
      const { data: inserted, error: insErr } = await supabase
        .from("trends")
        .insert({
          slug,
          title: titleCase(keyword),
          thesis: `Emerging cluster of ${sigs.length} signals around "${keyword}".`,
          trend_type: "consumer",
          maturity_stage: "emerging",
          momentum_score: mom,
          evidence_score: ev,
          opportunity_score: Math.round(((mom + ev) / 2) * 100) / 100,
          signal_count: sigs.length,
          first_seen_at: obs[0] ?? new Date().toISOString(),
          last_seen_at: obs[obs.length - 1] ?? new Date().toISOString(),
          status: "published", // visible immediately; enrichment refines it
        })
        .select("id")
        .single();
      if (insErr || !inserted) { console.error("trend insert", insErr); continue; }
      trendId = inserted.id;
      created.push({ slug, id: trendId, signals: sigs.length });
      toEnrich.push({ trendId, keyword, sigs, signature: String(sigs.length) });
    } else {
      trendId = existing.id;
      const newCount = (existing.signal_count ?? 0) + sigs.length;
      await supabase.from("trends").update({
        momentum_score: mom,
        evidence_score: ev,
        signal_count: newCount,
        last_seen_at: new Date().toISOString(),
      }).eq("id", trendId);
      if (materiallyChanged(newCount, existing.enrichment_signature)) {
        toEnrich.push({ trendId, keyword, sigs, signature: String(newCount) });
        refreshed++;
      }
    }

    await supabase.from("trend_signals").upsert(sigs.map((s) => ({ trend_id: trendId, signal_id: s.id, weight: 1 })));
    await supabase.from("trend_scores").insert({ trend_id: trendId, momentum_score: mom, evidence_score: ev });
  }

  // Submit one Haiku batch for all trends needing (re-)enrichment.
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  let batch: string | null = null;
  if (key && toEnrich.length) {
    try {
      const providerId = await submitBatch(key, toEnrich.map((t) => batchRequest(t.trendId, t.keyword, t.sigs)));
      const { data: b } = await supabase
        .from("enrichment_batches")
        .insert({ provider_batch_id: providerId, status: "submitted", item_count: toEnrich.length })
        .select("id")
        .single();
      if (b) {
        await supabase.from("enrichment_items").insert(
          toEnrich.map((t) => ({ batch_id: b.id, trend_id: t.trendId, custom_id: t.trendId, signature: t.signature })),
        );
        batch = providerId;
      }
    } catch (e) {
      console.error("batch submit failed", e);
    }
  } else if (!key && toEnrich.length) {
    console.warn("ANTHROPIC_API_KEY not set — trends created without LLM enrichment");
  }

  return json({
    ok: true, orphans: orphans.length, clusters: clusters.size,
    created: created.length, refreshed, submitted: toEnrich.length, batch,
  });
}

// ---------- Phase 2: collect + apply ----------
async function applyEnrichment(
  trendId: string, e: Enrichment, signature: string | null,
  taxIndex: Map<string, string>,
): Promise<void> {
  const trend_type = TREND_TYPES.includes(e.trend_type) ? e.trend_type : "consumer";
  const maturity_stage = MATURITY.includes(e.maturity_stage) ? e.maturity_stage : "emerging";

  await supabase.from("trends").update({
    title: e.title?.slice(0, 200) || undefined,
    thesis: e.thesis || undefined,
    description: e.description || undefined,
    trend_type, maturity_stage,
    enrichment_version: ENRICHMENT_VERSION,
    enriched_at: new Date().toISOString(),
    enrichment_signature: signature,
  }).eq("id", trendId);

  // Taxonomy links (need/sector/geo).
  const taxRows: any[] = [];
  for (const [facet, keys] of [["need", e.needs], ["sector", e.sectors], ["geo", e.geos]] as const) {
    for (const k of keys ?? []) {
      const nodeId = taxIndex.get(`${facet}:${k}`);
      if (nodeId) taxRows.push({ trend_id: trendId, node_id: nodeId, confidence: 0.8, source: "llm" });
    }
  }
  if (taxRows.length) await supabase.from("trend_taxonomy").upsert(taxRows, { onConflict: "trend_id,node_id" });

  // JTBD: upsert the (family, statement) then link.
  if (e.jtbd_family && e.jtbd_statement) {
    const { data: j } = await supabase
      .from("jtbd")
      .upsert({ family: e.jtbd_family, statement: e.jtbd_statement, status: "approved" }, { onConflict: "family,statement" })
      .select("id")
      .single();
    if (j) await supabase.from("trend_jtbd").upsert({ trend_id: trendId, jtbd_id: j.id, confidence: 0.8 }, { onConflict: "trend_id,jtbd_id" });
  }
}

async function runCollect(): Promise<Response> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "ANTHROPIC_API_KEY not set" }, 500);

  const { data: pending } = await supabase
    .from("enrichment_batches")
    .select("id, provider_batch_id")
    .eq("status", "submitted");
  if (!pending?.length) return json({ ok: true, pending: 0 });

  // Resolve taxonomy node ids once.
  const { data: taxNodes } = await supabase.from("taxonomy_nodes").select("id, facet, key");
  const taxIndex = new Map<string, string>();
  for (const n of (taxNodes ?? []) as any[]) taxIndex.set(`${n.facet}:${n.key}`, n.id);

  let applied = 0, stillRunning = 0;
  for (const b of pending as any[]) {
    let status: { processing_status: string; results_url: string | null };
    try {
      status = await getBatch(key, b.provider_batch_id);
    } catch (e) {
      console.error("getBatch", e);
      continue;
    }
    if (status.processing_status !== "ended" || !status.results_url) { stillRunning++; continue; }

    const results = await fetchResults(key, status.results_url);
    const { data: items } = await supabase
      .from("enrichment_items")
      .select("id, trend_id, custom_id, signature")
      .eq("batch_id", b.id);

    for (const item of (items ?? []) as any[]) {
      const e = results.get(item.custom_id);
      if (!e) {
        await supabase.from("enrichment_items").update({ status: "failed" }).eq("id", item.id);
        continue;
      }
      await applyEnrichment(item.trend_id, e, item.signature, taxIndex);
      await supabase.from("enrichment_items").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", item.id);
      applied++;
    }
    await supabase.from("enrichment_batches").update({ status: "ended", completed_at: new Date().toISOString() }).eq("id", b.id);
  }
  return json({ ok: true, batches: pending.length, applied, stillRunning });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("INGEST_SECRET");
  if (!expected || req.headers.get("x-ingest-key") !== expected) return json({ error: "unauthorized" }, 401);

  const action = new URL(req.url).searchParams.get("action") ?? "cluster";
  try {
    if (action === "collect") return await runCollect();
    return await runCluster();
  } catch (e) {
    console.error("enrich error", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
