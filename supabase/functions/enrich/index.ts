// Trend enrich function — clusters recent signals into trends + LLM enrichment.
// Auth: requires x-ingest-key header.
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

const ENRICHMENT_VERSION = "v1";

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

// Cluster signals by their most-frequent shared keyword.
function cluster(signals: Signal[]): Map<string, Signal[]> {
  // Count keyword frequency.
  const counts = new Map<string, number>();
  for (const s of signals) for (const k of s.keywords ?? []) counts.set(k, (counts.get(k) ?? 0) + 1);

  // Assign each signal to its most-frequent keyword that has >=2 signals.
  const clusters = new Map<string, Signal[]>();
  for (const s of signals) {
    const sorted = (s.keywords ?? [])
      .filter((k) => (counts.get(k) ?? 0) >= 2)
      .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
    const key = sorted[0];
    if (!key) continue;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key)!.push(s);
  }
  return clusters;
}

async function enrichWithLLM(keyword: string, sigs: Signal[]): Promise<{
  title: string;
  thesis: string;
  trend_type: string;
  maturity_stage: string;
  needs: string[];
  sectors: string[];
  geos: string[];
} | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  const headlines = sigs.slice(0, 12).map((s) => `- ${s.title}`).join("\n");
  const prompt = `You classify emerging trends. Given a cluster of recent signals around the keyword "${keyword}", output a single trend in JSON.

Signals:
${headlines}

Return strict JSON only (no prose, no code fences):
{
  "title": "<5-8 word trend title>",
  "thesis": "<one sentence, <30 words, what is shifting and why it matters>",
  "trend_type": "consumer|startup|innovation|content|product|macro",
  "maturity_stage": "weak-signal|emerging|scaling|mainstream|mature|declining",
  "needs": ["connection","meaning","health","justice","sustainability","knowledge","beauty","play"],
  "sectors": ["tech","health_sector","climate","education","finance","media","civic","commerce"],
  "geos": ["global","mena","gcc","iraq","us","eu","apac","latam","africa"]
}
Pick 1-3 needs, 1-2 sectors, 1-2 geos. If nothing fits a facet, return [].`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });
  if (!r.ok) {
    console.error("LLM error", r.status, await r.text());
    return null;
  }
  const data = await r.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  const jsonText = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("LLM parse fail:", text.slice(0, 200));
    return null;
  }
}

function momentumScore(sigs: Signal[]): number {
  // Recency-weighted count. Newer signals weigh more.
  const now = Date.now();
  let score = 0;
  for (const s of sigs) {
    const obs = s.observed_at ? new Date(s.observed_at).getTime() : now - 7 * 86400_000;
    const ageHours = Math.max(0, (now - obs) / 3_600_000);
    const decay = Math.exp(-ageHours / 72); // 3-day half-life
    score += 10 * decay;
  }
  return Math.min(100, Math.round(score * 100) / 100);
}

function evidenceScore(sigs: Signal[]): number {
  const sources = new Set(sigs.map((s) => s.source_id));
  // 25 base per unique source, capped at 100.
  return Math.min(100, sources.size * 25 + Math.min(20, sigs.length));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const expected = Deno.env.get("INGEST_SECRET");
  const got = req.headers.get("x-ingest-key");
  if (!expected || got !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pull recent signals (last 48h) that are not yet linked to any trend.
  const since = new Date(Date.now() - 48 * 3_600_000).toISOString();
  const { data: signals, error: sigErr } = await supabase
    .from("signals")
    .select("id, title, summary, url, keywords, observed_at, metric_value, source_id, trend_signals!left(trend_id)")
    .gte("created_at", since)
    .limit(500);
  if (sigErr) {
    return new Response(JSON.stringify({ error: sigErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const orphans = (signals as any[]).filter((s) => !s.trend_signals || s.trend_signals.length === 0) as Signal[];

  const clusters = cluster(orphans);

  // Look up taxonomy node ids for need/sector/geo keys we might use.
  const { data: taxNodes } = await supabase.from("taxonomy_nodes").select("id, facet, key");
  const taxIndex = new Map<string, string>();
  for (const n of (taxNodes ?? []) as any[]) taxIndex.set(`${n.facet}:${n.key}`, n.id);

  const created: any[] = [];
  for (const [keyword, sigs] of clusters) {
    if (sigs.length < 2) continue;

    // Check if a trend already exists for this keyword (by slug match).
    const slug = slugify(keyword);
    let { data: existing } = await supabase
      .from("trends")
      .select("id, signal_count")
      .eq("slug", slug)
      .maybeSingle();

    let trendId: string;
    let enrichment: Awaited<ReturnType<typeof enrichWithLLM>> = null;

    if (!existing) {
      enrichment = await enrichWithLLM(keyword, sigs);
      const mom = momentumScore(sigs);
      const ev = evidenceScore(sigs);
      const obs = sigs.map((s) => s.observed_at).filter(Boolean).sort();
      const { data: inserted, error: insErr } = await supabase
        .from("trends")
        .insert({
          slug,
          title: enrichment?.title ?? keyword.replace(/^./, (c) => c.toUpperCase()),
          thesis: enrichment?.thesis ?? `Cluster of ${sigs.length} recent signals around "${keyword}".`,
          trend_type: (enrichment?.trend_type as any) ?? "consumer",
          maturity_stage: (enrichment?.maturity_stage as any) ?? "emerging",
          momentum_score: mom,
          evidence_score: ev,
          opportunity_score: Math.round(((mom + ev) / 2) * 100) / 100,
          signal_count: sigs.length,
          first_seen_at: obs[0] ?? new Date().toISOString(),
          last_seen_at: obs[obs.length - 1] ?? new Date().toISOString(),
          enrichment_version: ENRICHMENT_VERSION,
          status: "published",
        })
        .select("id")
        .single();
      if (insErr || !inserted) { console.error("trend insert", insErr); continue; }
      trendId = inserted.id;
      created.push({ slug, id: trendId, signals: sigs.length });

      // Link taxonomy nodes.
      if (enrichment) {
        const facetMap: Array<[string, string[]]> = [
          ["need", enrichment.needs ?? []],
          ["sector", enrichment.sectors ?? []],
          ["geo", enrichment.geos ?? []],
        ];
        const taxRows = [];
        for (const [facet, keys] of facetMap) {
          for (const k of keys) {
            const nodeId = taxIndex.get(`${facet}:${k}`);
            if (nodeId) taxRows.push({ trend_id: trendId, node_id: nodeId, confidence: 0.8, source: "llm" });
          }
        }
        if (taxRows.length) await supabase.from("trend_taxonomy").upsert(taxRows);
      }
    } else {
      trendId = existing.id;
      const mom = momentumScore(sigs);
      const ev = evidenceScore(sigs);
      await supabase.from("trends").update({
        momentum_score: mom,
        evidence_score: ev,
        signal_count: (existing.signal_count ?? 0) + sigs.length,
        last_seen_at: new Date().toISOString(),
      }).eq("id", trendId);
    }

    // Link signals to the trend.
    const linkRows = sigs.map((s) => ({ trend_id: trendId, signal_id: s.id, weight: 1 }));
    await supabase.from("trend_signals").upsert(linkRows);

    // Score snapshot.
    await supabase.from("trend_scores").insert({
      trend_id: trendId,
      momentum_score: momentumScore(sigs),
      evidence_score: evidenceScore(sigs),
    });
  }

  return new Response(JSON.stringify({
    ok: true,
    orphans: orphans.length,
    clusters: clusters.size,
    created,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
