// Trend-engine ingestion entrypoint.
//
// Invoke: POST/GET /functions/v1/ingest?source=all|github|hackernews|gdelt|rss|
//         googletrends|reddit|youtube|producthunt&lookback=7&limit=15&topics=a,b
//
// Auth: if INGEST_SECRET is set, callers must send `x-ingest-key: <secret>`.
// Writes use the service role, so RLS is bypassed for the curated tables.
//
// Designed to be triggered on a schedule (Supabase cron / pg_cron) or manually.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Collector, CollectContext } from "./lib/types.ts";
import { loadSources, persist, PersistResult, serviceClient } from "./lib/db.ts";
import { DEFAULT_TOPICS } from "./lib/queries.ts";

import { github } from "./collectors/github.ts";
import { hackernews } from "./collectors/hackernews.ts";
import { gdelt } from "./collectors/gdelt.ts";
import { rss } from "./collectors/rss.ts";
import { googletrends } from "./collectors/googletrends.ts";
import { reddit } from "./collectors/reddit.ts";
import { youtube } from "./collectors/youtube.ts";
import { producthunt } from "./collectors/producthunt.ts";

const COLLECTORS: Record<string, Collector> = {
  github,
  hackernews,
  gdelt,
  rss,
  googletrends,
  reddit,
  youtube,
  producthunt,
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-key",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const secret = Deno.env.get("INGEST_SECRET");
  if (secret && req.headers.get("x-ingest-key") !== secret) {
    return json({ error: "unauthorized" }, 401);
  }

  const url = new URL(req.url);
  const which = (url.searchParams.get("source") ?? "all").toLowerCase();
  const lookbackDays = Math.max(1, Number(url.searchParams.get("lookback") ?? 7));
  const perTopicLimit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 15)));
  const topics = url.searchParams.get("topics")?.split(",").map((s) => s.trim()).filter(Boolean) ??
    DEFAULT_TOPICS;

  const selected = which === "all"
    ? Object.values(COLLECTORS)
    : which.split(",").map((k) => COLLECTORS[k.trim()]).filter(Boolean);

  if (!selected.length) {
    return json({ error: `unknown source '${which}'`, available: Object.keys(COLLECTORS) }, 400);
  }

  const logs: string[] = [];
  const ctx: CollectContext = {
    lookbackDays,
    perTopicLimit,
    topics,
    now: new Date(),
    env: (k) => Deno.env.get(k),
    log: (m) => logs.push(m),
  };

  let db;
  try {
    db = serviceClient();
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }

  const sources = await loadSources(db);
  const results: PersistResult[] = [];

  for (const collector of selected) {
    const source = sources.get(collector.sourceName);
    if (!source) {
      results.push({
        source: collector.sourceName,
        status: "skipped",
        reason: "not in trend_sources registry",
        signalsIn: 0,
        signalsKept: 0,
      });
      continue;
    }
    // Gate credentialed collectors on their required secrets.
    const missing = (collector.requiresEnv ?? []).filter((k) => !Deno.env.get(k));
    if (missing.length) {
      results.push({
        source: collector.sourceName,
        status: "skipped",
        reason: `missing env: ${missing.join(", ")}`,
        signalsIn: 0,
        signalsKept: 0,
      });
      continue;
    }

    try {
      const signals = await collector.collect(ctx);
      results.push(await persist(db, source, signals));
    } catch (e) {
      results.push({
        source: collector.sourceName,
        status: "error",
        reason: e instanceof Error ? e.message : String(e),
        signalsIn: 0,
        signalsKept: 0,
      });
    }
  }

  const totalKept = results.reduce((n, r) => n + r.signalsKept, 0);
  return json({
    ok: true,
    params: { source: which, lookbackDays, perTopicLimit, topics },
    totalKept,
    results,
    logs,
  });
});
