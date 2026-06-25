// Trend ingest function — fans out per source, honors access_policy.
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

type Source = {
  id: string;
  name: string;
  access_policy: string;
  base_url: string | null;
  enabled: boolean;
};

type RawCandidate = {
  dedupe_key: string;
  external_id?: string;
  url?: string;
  title?: string;
  snippet?: string;
  payload?: Record<string, unknown>;
  published_at?: string;
  // normalized fields
  signal_type: string;
  summary?: string;
  keywords?: string[];
  metric_value?: number;
  metric_unit?: string;
  observed_at?: string;
};

const truncate = (s: string | undefined | null, n = 280) =>
  s ? (s.length > n ? s.slice(0, n) : s) : undefined;

const keywordize = (s: string) =>
  Array.from(
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
    ),
  ).slice(0, 12);

const STOPWORDS = new Set([
  "this","that","with","from","have","they","your","there","about","what","which","when","where","while","would","should","could","into","over","than","then","more","also","just","like","been","were","their","them","other","because","after","before","still","make","made","very","much","most","some","such","only","being","does","doing","done","using","through","across","every","under","upon","without","within"
]);

// ---------- Collectors ----------
async function collectHackerNews(): Promise<RawCandidate[]> {
  const r = await fetch("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50");
  if (!r.ok) throw new Error(`HN ${r.status}`);
  const data = await r.json();
  return (data.hits ?? []).map((h: any): RawCandidate => ({
    dedupe_key: `hn:${h.objectID}`,
    external_id: h.objectID,
    url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    title: h.title ?? h.story_title ?? "(untitled)",
    snippet: truncate(h.story_text ?? h.comment_text),
    payload: { points: h.points, num_comments: h.num_comments, author: h.author },
    published_at: h.created_at,
    signal_type: "news_volume",
    summary: undefined,
    keywords: keywordize(h.title ?? h.story_title ?? ""),
    metric_value: h.points ?? 0,
    metric_unit: "points",
    observed_at: h.created_at,
  }));
}

async function collectGDELT(): Promise<RawCandidate[]> {
  const url = "https://api.gdeltproject.org/api/v2/doc/doc?query=sourcelang:eng&mode=ArtList&maxrecords=50&format=json&timespan=1d";
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GDELT ${r.status}`);
  const data = await r.json().catch(() => ({ articles: [] }));
  return (data.articles ?? []).map((a: any): RawCandidate => ({
    dedupe_key: `gdelt:${a.url}`,
    url: a.url,
    title: a.title ?? "(untitled)",
    snippet: truncate(a.seendate),
    payload: { domain: a.domain, language: a.language, sourcecountry: a.sourcecountry },
    published_at: a.seendate ? new Date(a.seendate.slice(0,4)+"-"+a.seendate.slice(4,6)+"-"+a.seendate.slice(6,8)+"T"+a.seendate.slice(9,11)+":"+a.seendate.slice(11,13)+":"+a.seendate.slice(13,15)+"Z").toISOString() : undefined,
    signal_type: "news_volume",
    keywords: keywordize(a.title ?? ""),
    geo_hint: a.sourcecountry,
    observed_at: undefined,
  } as any));
}

async function collectGitHub(): Promise<RawCandidate[]> {
  const since = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);
  const r = await fetch(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=30`, {
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "ikigai-trend-engine" },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const data = await r.json();
  return (data.items ?? []).map((repo: any): RawCandidate => ({
    dedupe_key: `gh:${repo.id}`,
    external_id: String(repo.id),
    url: repo.html_url,
    title: `${repo.full_name}: ${repo.description ?? ""}`.slice(0, 200),
    snippet: truncate(repo.description),
    payload: { stars: repo.stargazers_count, language: repo.language, topics: repo.topics },
    published_at: repo.created_at,
    signal_type: "repo_velocity",
    keywords: keywordize(`${repo.name} ${repo.description ?? ""} ${(repo.topics ?? []).join(" ")}`),
    metric_value: repo.stargazers_count,
    metric_unit: "stars",
    observed_at: repo.created_at,
  }));
}

async function collectRSS(): Promise<RawCandidate[]> {
  const feeds = [
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://techcrunch.com/feed/",
  ];
  const out: RawCandidate[] = [];
  for (const feed of feeds) {
    try {
      const r = await fetch(feed, { headers: { "User-Agent": "ikigai-trend-engine" } });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
      for (const item of items.slice(0, 30)) {
        const title = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? "").trim();
        const link = (item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim();
        const desc = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ?? "")
          .replace(/<[^>]+>/g, " ").trim();
        const pub = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "").trim();
        if (!link || !title) continue;
        out.push({
          dedupe_key: `rss:${link}`,
          url: link,
          title,
          snippet: truncate(desc),
          payload: { feed },
          published_at: pub ? new Date(pub).toISOString() : undefined,
          signal_type: "news_volume",
          keywords: keywordize(`${title} ${desc}`),
          observed_at: pub ? new Date(pub).toISOString() : undefined,
        } as any);
      }
    } catch (_e) { /* skip */ }
  }
  return out;
}

async function collectYouTube(): Promise<RawCandidate[]> {
  const key = Deno.env.get("YOUTUBE_API_KEY");
  if (!key) return [];
  // Most popular videos globally — a coarse but real signal.
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=25&key=${key}`);
  if (!r.ok) throw new Error(`YouTube ${r.status}`);
  const data = await r.json();
  return (data.items ?? []).map((v: any): RawCandidate => ({
    dedupe_key: `yt:${v.id}`,
    external_id: v.id,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.snippet?.title ?? "(untitled)",
    snippet: truncate(v.snippet?.description),
    payload: { channel: v.snippet?.channelTitle, views: v.statistics?.viewCount, likes: v.statistics?.likeCount, tags: v.snippet?.tags },
    published_at: v.snippet?.publishedAt,
    signal_type: "social_velocity",
    keywords: keywordize(`${v.snippet?.title ?? ""} ${(v.snippet?.tags ?? []).join(" ")}`),
    metric_value: Number(v.statistics?.viewCount ?? 0),
    metric_unit: "views",
    observed_at: v.snippet?.publishedAt,
  }));
}

async function collectProductHunt(): Promise<RawCandidate[]> {
  const token = Deno.env.get("PRODUCTHUNT_TOKEN");
  if (!token) return [];
  const query = `{ posts(first: 30, order: VOTES) { edges { node { id name tagline url votesCount createdAt topics { edges { node { name } } } } } } }`;
  const r = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(`ProductHunt ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const edges = data?.data?.posts?.edges ?? [];
  return edges.map(({ node: p }: any): RawCandidate => ({
    dedupe_key: `ph:${p.id}`,
    external_id: p.id,
    url: p.url,
    title: `${p.name}: ${p.tagline}`,
    snippet: truncate(p.tagline),
    payload: { votes: p.votesCount, topics: p.topics?.edges?.map((e: any) => e.node.name) },
    published_at: p.createdAt,
    signal_type: "launch",
    keywords: keywordize(`${p.name} ${p.tagline} ${(p.topics?.edges ?? []).map((e: any) => e.node.name).join(" ")}`),
    metric_value: p.votesCount,
    metric_unit: "votes",
    observed_at: p.createdAt,
  }));
}

async function collectGoogleTrends(): Promise<RawCandidate[]> {
  // Public Google Trends "Trending Now" RSS feed — no key required.
  const geos = ["US", "GB", "DE", "IN", "BR"];
  const out: RawCandidate[] = [];
  for (const geo of geos) {
    try {
      const r = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, {
        headers: { "User-Agent": "Mozilla/5.0 ikigai-trend-engine" },
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
      for (const item of items.slice(0, 25)) {
        const title = (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1] ?? "").trim();
        if (!title) continue;
        const traffic = (item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] ?? "").trim();
        const pub = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "").trim();
        const newsTitles = Array.from(item.matchAll(/<ht:news_item_title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/ht:news_item_title>/g)).map((m) => m[1].trim());
        const newsSnippets = Array.from(item.matchAll(/<ht:news_item_snippet>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/ht:news_item_snippet>/g)).map((m) => m[1].trim());
        const newsUrls = Array.from(item.matchAll(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/g)).map((m) => m[1].trim());
        const dateKey = pub ? new Date(pub).toISOString().slice(0, 10) : "";
        out.push({
          dedupe_key: `gtrends:${geo}:${dateKey}:${title.toLowerCase()}`,
          url: newsUrls[0] ?? `https://trends.google.com/trends/explore?geo=${geo}&q=${encodeURIComponent(title)}`,
          title,
          snippet: truncate([traffic && `${traffic} searches`, newsTitles[0], newsSnippets[0]].filter(Boolean).join(" — ")),
          payload: { geo, traffic, news_titles: newsTitles, news_urls: newsUrls },
          published_at: pub ? new Date(pub).toISOString() : undefined,
          signal_type: "search_interest",
          keywords: keywordize(`${title} ${newsTitles.join(" ")}`),
          metric_value: Number(String(traffic).replace(/[^0-9]/g, "")) || 0,
          metric_unit: "searches",
          observed_at: pub ? new Date(pub).toISOString() : undefined,
          geo_hint: geo,
        } as any);
      }
    } catch (_e) { /* skip geo */ }
  }
  return out;
}


const COLLECTORS: Record<string, () => Promise<RawCandidate[]>> = {
  "Hacker News (Algolia)": collectHackerNews,
  "GDELT": collectGDELT,
  "GitHub": collectGitHub,
  "News RSS": collectRSS,
  "YouTube Data API": collectYouTube,
  "Product Hunt": collectProductHunt,
  "Google Trends": collectGoogleTrends,
};


async function runSource(source: Source) {
  if (!source.enabled) return { skipped: "disabled" };
  if (source.access_policy === "blocked") return { skipped: "blocked" };
  const collector = COLLECTORS[source.name];
  if (!collector) return { skipped: "no collector" };

  const { data: runRow } = await supabase
    .from("ingestion_runs")
    .insert({ source_id: source.id, status: "running" })
    .select("id")
    .single();
  const runId = runRow?.id;

  try {
    const candidates = await collector();

    // Light-meta hard cap on snippet.
    if (source.access_policy === "light_meta") {
      for (const c of candidates) c.snippet = truncate(c.snippet, 280);
    }

    let kept = 0;
    for (const c of candidates) {
      const { data: raw, error: rawErr } = await supabase
        .from("raw_signals")
        .upsert({
          source_id: source.id,
          dedupe_key: c.dedupe_key,
          external_id: c.external_id,
          url: c.url,
          title: c.title,
          snippet: c.snippet,
          payload: c.payload ?? {},
          access_policy_snapshot: source.access_policy,
          published_at: c.published_at,
        }, { onConflict: "dedupe_key" })
        .select("id")
        .single();
      if (rawErr || !raw) continue;

      // Idempotent normalized signal — one per raw_signal.
      const { error: sigErr } = await supabase
        .from("signals")
        .upsert({
          raw_signal_id: raw.id,
          source_id: source.id,
          signal_type: c.signal_type,
          title: c.title ?? "(untitled)",
          summary: c.snippet,
          url: c.url,
          keywords: c.keywords ?? [],
          metric_value: c.metric_value,
          metric_unit: c.metric_unit,
          observed_at: c.observed_at,
        }, { onConflict: "raw_signal_id" } as any);
      if (!sigErr) kept++;
    }

    await supabase.from("ingestion_runs")
      .update({ status: "ok", signals_in: candidates.length, signals_kept: kept, finished_at: new Date().toISOString() })
      .eq("id", runId);
    return { source: source.name, in: candidates.length, kept };
  } catch (e: any) {
    await supabase.from("ingestion_runs")
      .update({ status: "error", error: String(e?.message ?? e), finished_at: new Date().toISOString() })
      .eq("id", runId);
    return { source: source.name, error: String(e?.message ?? e) };
  }
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

  const url = new URL(req.url);
  const sourceFilter = url.searchParams.get("source") ?? "all";

  const { data: sources, error } = await supabase
    .from("trend_sources")
    .select("id, name, access_policy, base_url, enabled")
    .eq("enabled", true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const targets = sourceFilter === "all"
    ? (sources as Source[])
    : (sources as Source[]).filter((s) => s.name.toLowerCase().includes(sourceFilter.toLowerCase()));

  const results = [];
  for (const s of targets) {
    results.push(await runSource(s));
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
