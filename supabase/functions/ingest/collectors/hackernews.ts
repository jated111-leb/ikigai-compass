// Hacker News — recent stories per topic via the public Algolia API. Keyless.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getJson } from "../lib/http.ts";

interface HnSearch {
  hits: Array<{
    objectID: string;
    title: string | null;
    url: string | null;
    author: string;
    points: number | null;
    num_comments: number | null;
    created_at: string;
    created_at_i: number;
  }>;
}

export const hackernews: Collector = {
  sourceName: "Hacker News (Algolia)",
  async collect(ctx) {
    const since = Math.floor((ctx.now.getTime() - ctx.lookbackDays * 86400000) / 1000);
    const out: NormalizedSignal[] = [];

    for (const topic of ctx.topics) {
      const q = encodeURIComponent(topic);
      const url =
        `https://hn.algolia.com/api/v1/search?query=${q}&tags=story` +
        `&numericFilters=created_at_i>${since}&hitsPerPage=${ctx.perTopicLimit}`;
      try {
        const data = await getJson<HnSearch>(url);
        for (const h of data.hits ?? []) {
          if (!h.title) continue;
          out.push({
            externalId: h.objectID,
            signalType: "social_velocity",
            title: h.title,
            url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
            entities: [h.author],
            keywords: [topic],
            metricValue: h.points ?? 0,
            metricUnit: "points",
            observedAt: h.created_at,
            publishedAt: h.created_at,
            snippet: h.title,
          });
        }
      } catch (e) {
        ctx.log(`hackernews "${topic}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
