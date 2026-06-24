import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { upsertMissionProfile, deriveMissionProfile } from "@/lib/missionProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ExternalLink, Sparkles, TrendingUp, Target } from "lucide-react";

interface FeedRow {
  signal_id: string;
  title: string;
  summary: string | null;
  url: string | null;
  source_name: string;
  signal_type: string;
  metric_value: number | null;
  metric_unit: string | null;
  geo_hint: string | null;
  observed_at: string | null;
  momentum_score: number;
  relevance_score: number;
  match_score: number;
}

const SIGNAL_LABEL: Record<string, string> = {
  search_interest: "Search",
  news_volume: "News",
  social_velocity: "Social",
  launch: "Launch",
  funding: "Funding",
  repo_velocity: "Open source",
  review_shift: "Reviews",
  ad_volume: "Ads",
  curated_pick: "Curated",
};

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 w-20">{icon}{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-accent/15 overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="w-8 text-right tabular-nums">{Math.round(value)}</span>
    </div>
  );
}

const TrendsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: journey, journeyLoading } = useJourney(user);
  const [profileReady, setProfileReady] = useState(false);

  const missionPreview = useMemo(
    () => (journey ? deriveMissionProfile(journey) : null),
    [journey],
  );

  // Ensure the user's mission profile exists before querying the feed.
  useEffect(() => {
    if (!user || journeyLoading || !journey) return;
    let cancelled = false;
    (async () => {
      try {
        await upsertMissionProfile(user.id, journey);
      } catch (e) {
        console.error("mission profile upsert failed", e);
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, journeyLoading, journey]);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["trend-feed", user?.id],
    enabled: !!user && profileReady,
    queryFn: async (): Promise<FeedRow[]> => {
      // RPC isn't in the generated Database types yet; cast to call it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("ranked_signals_for_me", {
        lookback_days: 30,
        max_rows: 60,
      });
      if (error) throw error;
      return (data ?? []) as FeedRow[];
    },
  });

  if (journeyLoading || (!profileReady && !!user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const hasMission = (missionPreview?.keywords.length ?? 0) > 0;

  return (
    <div className="py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" /> Trends for your mission
          </h1>
          <p className="text-muted-foreground">
            Live signals from across the web, ranked by how they fit what you care about.
          </p>
        </div>

        {/* Mission summary */}
        {hasMission ? (
          <Card className="p-4 mb-6 bg-accent/5 border-accent/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Matching against your mission</p>
            <div className="flex flex-wrap gap-1.5">
              {missionPreview!.keywords.slice(0, 14).map((k) => (
                <Badge key={k} variant="secondary" className="font-normal">{k}</Badge>
              ))}
              {missionPreview!.geo_focus.map((g) => (
                <Badge key={g} className="font-normal">{g.toUpperCase()}</Badge>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 border-accent/20">
            <p className="text-sm text-muted-foreground">
              Complete more of your{" "}
              <button className="text-accent underline" onClick={() => navigate("/journey")}>Ikigai journey</button>{" "}
              to personalize these trends. For now they're ranked purely by momentum.
            </p>
          </Card>
        )}

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            {data ? `${data.length} signals` : ""}
          </p>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {isLoading && (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <Card className="p-4 border-destructive/30 text-sm text-destructive">
            Couldn't load the feed: {(error as Error).message}
          </Card>
        )}

        {data && data.length === 0 && !isLoading && (
          <Card className="p-6 text-center text-muted-foreground">
            <p className="mb-1">No signals yet.</p>
            <p className="text-sm">Run the ingestion function to pull trends from your sources.</p>
          </Card>
        )}

        <div className="space-y-3">
          {data?.map((row) => (
            <Card key={row.signal_id} className="p-4 hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{SIGNAL_LABEL[row.signal_type] ?? row.signal_type}</Badge>
                  <span className="text-xs text-muted-foreground">{row.source_name}</span>
                  {row.geo_hint && <span className="text-xs text-muted-foreground">· {row.geo_hint}</span>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-accent tabular-nums leading-none">{Math.round(row.match_score)}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">match</div>
                </div>
              </div>

              <h3 className="font-medium text-primary leading-snug mb-1">
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent inline-flex items-start gap-1">
                    {row.title}<ExternalLink className="h-3 w-3 mt-1 shrink-0 opacity-60" />
                  </a>
                ) : row.title}
              </h3>
              {row.summary && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{row.summary}</p>}

              <div className="space-y-1.5">
                <ScoreBar label="Relevance" value={row.relevance_score} icon={<Target className="h-3 w-3" />} />
                <ScoreBar label="Momentum" value={row.momentum_score} icon={<TrendingUp className="h-3 w-3" />} />
                {row.metric_value != null && (
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    {Math.round(row.metric_value).toLocaleString()} {row.metric_unit}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;
