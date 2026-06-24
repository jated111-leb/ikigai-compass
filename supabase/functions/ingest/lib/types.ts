// Shared types for the trend-engine ingestion layer.

// A normalized signal as produced by a collector, before it is written
// to the `signals` table. `externalId` makes the raw row idempotent.
export interface NormalizedSignal {
  externalId: string;            // stable id at the source (or the URL)
  signalType: SignalType;        // maps to public.signal_type enum
  title: string;
  summary?: string;
  url?: string;
  entities?: string[];           // orgs / people / products
  keywords?: string[];
  metricValue?: number;          // upvotes, stars, points, views, articles…
  metricUnit?: string;
  geoHint?: string;
  observedAt?: string;           // ISO; when the metric pertains to
  publishedAt?: string;          // ISO; original publish time
  snippet?: string;              // short text (capped to 280 by the DB layer)
}

export type SignalType =
  | "search_interest"
  | "news_volume"
  | "social_velocity"
  | "launch"
  | "funding"
  | "repo_velocity"
  | "review_shift"
  | "ad_volume"
  | "curated_pick";

// Context handed to every collector.
export interface CollectContext {
  lookbackDays: number;          // how far back to pull
  perTopicLimit: number;         // max items per query/topic
  topics: string[];              // seed search themes
  now: Date;
  env: (key: string) => string | undefined;
  log: (msg: string) => void;
}

// A collector module's public shape.
export interface Collector {
  // Must match a `name` in the trend_sources registry.
  sourceName: string;
  // Env vars required to do anything; if any are missing the collector is skipped.
  requiresEnv?: string[];
  collect: (ctx: CollectContext) => Promise<NormalizedSignal[]>;
}
