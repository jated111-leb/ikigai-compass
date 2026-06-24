// GDELT — global news coverage per topic via the DOC 2.0 API. Keyless.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getJson } from "../lib/http.ts";

interface GdeltDoc {
  articles?: Array<{
    url: string;
    title: string;
    seendate: string;     // e.g. 20260601T120000Z
    domain: string;
    sourcecountry: string;
    language: string;
  }>;
}

// "20260601T120000Z" -> ISO
function parseSeen(d: string): string | undefined {
  const m = d.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return undefined;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

export const gdelt: Collector = {
  sourceName: "GDELT",
  async collect(ctx) {
    const timespan = `${Math.max(1, ctx.lookbackDays) * 24}h`;
    const out: NormalizedSignal[] = [];

    for (const topic of ctx.topics) {
      const q = encodeURIComponent(`"${topic}"`);
      const url =
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}` +
        `&mode=ArtList&format=json&maxrecords=${ctx.perTopicLimit}&timespan=${timespan}&sort=hybridrel`;
      try {
        const data = await getJson<GdeltDoc>(url);
        for (const a of data.articles ?? []) {
          out.push({
            externalId: a.url,
            signalType: "news_volume",
            title: a.title,
            url: a.url,
            entities: [a.domain],
            keywords: [topic, a.language].filter(Boolean),
            metricValue: 1,
            metricUnit: "articles",
            geoHint: a.sourcecountry || undefined,
            observedAt: parseSeen(a.seendate),
            publishedAt: parseSeen(a.seendate),
            snippet: a.title,
          });
        }
      } catch (e) {
        ctx.log(`gdelt "${topic}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
