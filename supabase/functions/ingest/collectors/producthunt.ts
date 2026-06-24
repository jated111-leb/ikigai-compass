// Product Hunt — top launches in the lookback window via the GraphQL API v2.
// Requires PRODUCTHUNT_TOKEN (developer token); skipped if unset.
import { Collector, NormalizedSignal } from "../lib/types.ts";
import { fetchWithTimeout, isoDaysAgo } from "../lib/http.ts";

const ENDPOINT = "https://api.producthunt.com/v2/api/graphql";

const QUERY = `
query Posts($after: DateTime!, $first: Int!) {
  posts(order: VOTES, postedAfter: $after, first: $first) {
    edges { node {
      id name tagline url votesCount commentsCount createdAt
      topics(first: 5) { edges { node { name } } }
    } }
  }
}`;

interface PhResp {
  data?: {
    posts: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          tagline: string;
          url: string;
          votesCount: number;
          commentsCount: number;
          createdAt: string;
          topics: { edges: Array<{ node: { name: string } }> };
        };
      }>;
    };
  };
}

export const producthunt: Collector = {
  sourceName: "Product Hunt",
  requiresEnv: ["PRODUCTHUNT_TOKEN"],
  async collect(ctx) {
    const token = ctx.env("PRODUCTHUNT_TOKEN")!;
    const after = isoDaysAgo(ctx.now, ctx.lookbackDays);
    try {
      const res = await fetchWithTimeout(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: QUERY, variables: { after, first: Math.min(ctx.perTopicLimit * 4, 50) } }),
      });
      if (!res.ok) throw new Error(`POST ${ENDPOINT} -> ${res.status}`);
      const json = (await res.json()) as PhResp;
      const out: NormalizedSignal[] = [];
      for (const e of json.data?.posts.edges ?? []) {
        const n = e.node;
        out.push({
          externalId: n.id,
          signalType: "launch",
          title: n.name,
          summary: n.tagline,
          url: n.url,
          entities: [],
          keywords: n.topics.edges.map((t) => t.node.name),
          metricValue: n.votesCount,
          metricUnit: "votes",
          observedAt: n.createdAt,
          publishedAt: n.createdAt,
          snippet: n.tagline,
        });
      }
      return out;
    } catch (e) {
      ctx.log(`producthunt: ${e instanceof Error ? e.message : e}`);
      return [];
    }
  },
};
