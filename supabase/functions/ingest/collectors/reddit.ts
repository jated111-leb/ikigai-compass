// Reddit — top posts per subreddit in the lookback window.
// Uses OAuth when REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET are set (recommended,
// per Reddit's API terms); otherwise best-effort against the public .json
// endpoint. Configure subreddits with REDDIT_SUBREDDITS (comma-separated).
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { fetchWithTimeout, getJson } from "../lib/http.ts";

const DEFAULT_SUBS = ["startups", "Futurology", "technology", "climate", "Entrepreneur"];

interface Listing {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        permalink: string;
        url: string;
        author: string;
        ups: number;
        num_comments: number;
        created_utc: number;
        subreddit: string;
        selftext?: string;
      };
    }>;
  };
}

async function oauthToken(id: string, secret: string): Promise<string | undefined> {
  const res = await fetchWithTimeout("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.access_token as string | undefined;
}

export const reddit: Collector = {
  sourceName: "Reddit API",
  async collect(ctx) {
    const subs = (ctx.env("REDDIT_SUBREDDITS")?.split(",").map((s) => s.trim()).filter(Boolean)) ??
      DEFAULT_SUBS;
    const id = ctx.env("REDDIT_CLIENT_ID");
    const secret = ctx.env("REDDIT_CLIENT_SECRET");
    const t = (ctx.lookbackDays <= 1) ? "day" : ctx.lookbackDays <= 7 ? "week" : "month";

    let token: string | undefined;
    let base = "https://www.reddit.com";
    const headers: Record<string, string> = {};
    if (id && secret) {
      token = await oauthToken(id, secret);
      if (token) {
        base = "https://oauth.reddit.com";
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const out: NormalizedSignal[] = [];
    for (const sub of subs) {
      const url = `${base}/r/${sub}/top.json?t=${t}&limit=${ctx.perTopicLimit}`;
      try {
        const data = await getJson<Listing>(url, { headers });
        for (const c of data.data?.children ?? []) {
          const p = c.data;
          out.push({
            externalId: p.id,
            signalType: "social_velocity",
            title: p.title,
            summary: p.selftext?.slice(0, 500) || undefined,
            url: `https://www.reddit.com${p.permalink}`,
            entities: [p.author, `r/${p.subreddit}`],
            keywords: [p.subreddit],
            metricValue: p.ups,
            metricUnit: "upvotes",
            observedAt: new Date(p.created_utc * 1000).toISOString(),
            publishedAt: new Date(p.created_utc * 1000).toISOString(),
            snippet: p.title,
          });
        }
      } catch (e) {
        ctx.log(`reddit "r/${sub}": ${e instanceof Error ? e.message : e}`);
      }
    }
    return out;
  },
};
