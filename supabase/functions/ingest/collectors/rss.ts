// News RSS — pulls configured feeds (innovation/trend press by default).
// Configure with the RSS_FEEDS env var (comma-separated). Keyless.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getText, splitFeedItems, tagText, tagAttr } from "../lib/http.ts";

const DEFAULT_FEEDS = [
  "https://techcrunch.com/feed/",
  "https://www.technologyreview.com/feed/",
  "https://hnrss.org/frontpage",
];

function host(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return "";
  }
}

export const rss: Collector = {
  sourceName: "News RSS",
  async collect(ctx) {
    const feeds = (ctx.env("RSS_FEEDS")?.split(",").map((s) => s.trim()).filter(Boolean)) ??
      DEFAULT_FEEDS;
    const cutoff = ctx.now.getTime() - ctx.lookbackDays * 86400000;
    const out: NormalizedSignal[] = [];

    for (const feed of feeds) {
      try {
        const xml = await getText(feed);
        const items = splitFeedItems(xml).slice(0, ctx.perTopicLimit);
        for (const item of items) {
          const title = tagText(item, "title");
          const link = tagText(item, "link") ?? tagAttr(item, "link", "href");
          if (!title || !link) continue;
          const dateStr = tagText(item, "pubDate") ?? tagText(item, "updated") ??
            tagText(item, "published");
          const ts = dateStr ? Date.parse(dateStr) : NaN;
          if (!Number.isNaN(ts) && ts < cutoff) continue;
          const desc = tagText(item, "description") ?? tagText(item, "summary");
          out.push({
            externalId: link,
            signalType: "news_volume",
            title,
            url: link,
            entities: [host(feed)],
            keywords: [],
            metricValue: 1,
            metricUnit: "articles",
            observedAt: Number.isNaN(ts) ? undefined : new Date(ts).toISOString(),
            publishedAt: Number.isNaN(ts) ? undefined : new Date(ts).toISOString(),
            snippet: desc ?? title,
          });
        }
      } catch (e) {
        ctx.log(`rss "${feed}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
