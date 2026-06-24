// GitHub — repositories gaining stars in the lookback window, per topic.
// Keyless (60 search req/hr unauth); set GITHUB_TOKEN to raise the limit.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { getJson, isoDaysAgo } from "../lib/http.ts";

interface RepoSearch {
  items: Array<{
    id: number;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    topics?: string[];
    language: string | null;
    owner: { login: string };
    created_at: string;
    pushed_at: string;
  }>;
}

export const github: Collector = {
  sourceName: "GitHub",
  async collect(ctx) {
    const token = ctx.env("GITHUB_TOKEN");
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const since = isoDaysAgo(ctx.now, ctx.lookbackDays).slice(0, 10);
    const out: NormalizedSignal[] = [];

    for (const topic of ctx.topics) {
      const q = encodeURIComponent(`${topic} created:>${since}`);
      const url =
        `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${ctx.perTopicLimit}`;
      try {
        const data = await getJson<RepoSearch>(url, { headers });
        for (const r of data.items ?? []) {
          out.push({
            externalId: String(r.id),
            signalType: "repo_velocity",
            title: r.full_name,
            summary: r.description ?? undefined,
            url: r.html_url,
            entities: [r.owner.login],
            keywords: [topic, ...(r.topics ?? []), r.language ?? ""].filter(Boolean),
            metricValue: r.stargazers_count,
            metricUnit: "stars",
            observedAt: r.pushed_at,
            publishedAt: r.created_at,
            snippet: r.description ?? undefined,
          });
        }
      } catch (e) {
        ctx.log(`github "${topic}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
