// YouTube — most-viewed recent videos per topic via the Data API v3.
// Requires YOUTUBE_API_KEY; skipped if unset.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getJson, isoDaysAgo } from "../lib/http.ts";

interface SearchResp {
  items: Array<{
    id: { videoId: string };
    snippet: { title: string; description: string; channelTitle: string; publishedAt: string };
  }>;
}
interface VideosResp {
  items: Array<{ id: string; statistics?: { viewCount?: string; likeCount?: string } }>;
}

export const youtube: Collector = {
  sourceName: "YouTube Data API",
  requiresEnv: ["YOUTUBE_API_KEY"],
  async collect(ctx) {
    const key = ctx.env("YOUTUBE_API_KEY")!;
    const after = isoDaysAgo(ctx.now, ctx.lookbackDays);
    const out: NormalizedSignal[] = [];

    for (const topic of ctx.topics) {
      try {
        const q = encodeURIComponent(topic);
        const sUrl =
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount` +
          `&publishedAfter=${after}&maxResults=${ctx.perTopicLimit}&q=${q}&key=${key}`;
        const search = await getJson<SearchResp>(sUrl);
        const ids = search.items.map((i) => i.id.videoId).filter(Boolean);
        if (!ids.length) continue;

        const vUrl =
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids.join(",")}&key=${key}`;
        const stats = await getJson<VideosResp>(vUrl);
        const views = new Map(stats.items.map((v) => [v.id, Number(v.statistics?.viewCount ?? 0)]));

        for (const it of search.items) {
          const vid = it.id.videoId;
          out.push({
            externalId: vid,
            signalType: "social_velocity",
            title: it.snippet.title,
            summary: it.snippet.description,
            url: `https://www.youtube.com/watch?v=${vid}`,
            entities: [it.snippet.channelTitle],
            keywords: [topic],
            metricValue: views.get(vid) ?? 0,
            metricUnit: "views",
            observedAt: it.snippet.publishedAt,
            publishedAt: it.snippet.publishedAt,
            snippet: it.snippet.title,
          });
        }
      } catch (e) {
        ctx.log(`youtube "${topic}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
