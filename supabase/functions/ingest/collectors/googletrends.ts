// Google Trends — daily trending searches via the public RSS feed.
// Google has no official Trends API; the daily-trends RSS endpoint is the
// most stable keyless surface. Best-effort: skips cleanly on parse failure.
// Configure regions with GOOGLE_TRENDS_GEO (comma-separated, e.g. "US,GB").
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getText, splitFeedItems, tagText } from "../lib/http.ts";

const DEFAULT_GEOS = ["US"];

// The daily RSS uses a namespaced <ht:approx_traffic> like "200,000+".
function parseTraffic(block: string): number | undefined {
  const m = block.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/i);
  if (!m) return undefined;
  const n = parseInt(m[1].replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? undefined : n;
}

export const googletrends: Collector = {
  sourceName: "Google Trends",
  async collect(ctx) {
    const geos = (ctx.env("GOOGLE_TRENDS_GEO")?.split(",").map((s) => s.trim()).filter(Boolean)) ??
      DEFAULT_GEOS;
    const out: NormalizedSignal[] = [];

    for (const geo of geos) {
      const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${encodeURIComponent(geo)}`;
      try {
        const xml = await getText(url);
        const items = splitFeedItems(xml).slice(0, ctx.perTopicLimit);
        for (const item of items) {
          const title = tagText(item, "title");
          if (!title) continue;
          const link = tagText(item, "link") ?? `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}&geo=${geo}`;
          const news = tagText(item, "ht:news_item_title");
          out.push({
            externalId: `${geo}:${title}`,
            signalType: "search_interest",
            title,
            summary: news,
            url: link,
            entities: [],
            keywords: [title],
            metricValue: parseTraffic(item),
            metricUnit: "approx_searches",
            geoHint: geo,
            observedAt: ctx.now.toISOString(),
            snippet: news ?? title,
          });
        }
      } catch (e) {
        ctx.log(`googletrends "${geo}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
