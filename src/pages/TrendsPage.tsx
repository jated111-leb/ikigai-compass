import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type RankedTrend = {
  trend_id: string;
  title: string;
  thesis: string;
  trend_type: string;
  maturity_stage: string;
  momentum_score: number;
  opportunity_score: number;
  evidence_score: number;
  relevance_score: number;
  match_score: number;
};

const MATURITY_OPTIONS = ["all", "weak-signal", "emerging", "scaling", "mainstream", "mature", "declining"];

function Bar({ label, value, accent = "bg-primary" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted-foreground tracking-wide uppercase">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-accent/20 overflow-hidden">
        <div className={`h-full ${accent}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums text-muted-foreground">{Math.round(value)}</span>
    </div>
  );
}

export default function TrendsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trends, setTrends] = useState<RankedTrend[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [maturity, setMaturity] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: ranked, error: rankErr }, { data: savedRows }] = await Promise.all([
        supabase.rpc("ranked_trends_for_me"),
        supabase.from("saved_trends").select("trend_id"),
      ]);
      if (cancelled) return;
      if (rankErr) toast.error("Could not load trends");
      setTrends((ranked as RankedTrend[]) ?? []);
      setSaved(new Set((savedRows ?? []).map((r: any) => r.trend_id)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const visible = useMemo(() => {
    return trends.filter((t) => {
      if (maturity !== "all" && t.maturity_stage !== maturity) return false;
      if (savedOnly && !saved.has(t.trend_id)) return false;
      return true;
    });
  }, [trends, maturity, savedOnly, saved]);

  async function toggleSave(trendId: string) {
    if (!user) return;
    const isSaved = saved.has(trendId);
    const next = new Set(saved);
    if (isSaved) {
      next.delete(trendId);
      setSaved(next);
      const { error } = await supabase.from("saved_trends").delete().eq("user_id", user.id).eq("trend_id", trendId);
      if (error) { setSaved(saved); toast.error("Could not remove"); }
    } else {
      next.add(trendId);
      setSaved(next);
      const { error } = await supabase.from("saved_trends").insert({ user_id: user.id, trend_id: trendId });
      if (error) { setSaved(saved); toast.error("Could not save"); }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-3">
          <Sparkles className="h-3.5 w-3.5" /> World Currents
        </div>
        <h1 className="font-serif text-4xl text-foreground mb-2">Trends</h1>
        <p className="text-muted-foreground italic">
          What the world is reaching for, ranked against your unfolding ikigai.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-accent/15">
        <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Maturity</span>
        {MATURITY_OPTIONS.map((m) => (
          <button
            key={m}
            onClick={() => setMaturity(m)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              maturity === m
                ? "bg-primary text-primary-foreground border-primary"
                : "border-accent/30 text-muted-foreground hover:border-accent/60"
            }`}
          >
            {m}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setSavedOnly((v) => !v)}
          className={`text-xs px-3 py-1 rounded-full border transition flex items-center gap-1 ${
            savedOnly ? "bg-accent text-accent-foreground border-accent" : "border-accent/30 text-muted-foreground hover:border-accent/60"
          }`}
        >
          <Bookmark className="h-3 w-3" /> Saved only
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Reading the currents…
        </div>
      ) : visible.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground italic">
          No trends to show yet. The next ingestion will surface fresh signals.
        </div>
      ) : (
        <ul className="space-y-5">
          {visible.map((t) => {
            const isSaved = saved.has(t.trend_id);
            return (
              <li key={t.trend_id} className="border border-accent/20 rounded-lg p-5 bg-card hover:border-accent/40 transition">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                      <span>{t.trend_type}</span>
                      <span>·</span>
                      <span>{t.maturity_stage}</span>
                    </div>
                    <h3 className="font-serif text-xl text-foreground leading-tight">{t.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className="border-accent/40 text-accent">
                      {Math.round(t.match_score)} match
                    </Badge>
                    <button onClick={() => toggleSave(t.trend_id)} aria-label={isSaved ? "Unsave" : "Save"}
                      className="text-muted-foreground hover:text-accent transition">
                      {isSaved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed mb-4">{t.thesis}</p>
                <div className="space-y-1.5">
                  <Bar label="Momentum" value={t.momentum_score} accent="bg-primary" />
                  <Bar label="Opportunity" value={t.opportunity_score} accent="bg-accent" />
                  <Bar label="Evidence" value={t.evidence_score} accent="bg-foreground/40" />
                  <Bar label="Relevance" value={t.relevance_score} accent="bg-accent" />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 pt-6 border-t border-accent/15 text-center">
        <Button variant="ghost" size="sm" onClick={() => navigate("/journey")}>
          Return to your journey
        </Button>
      </div>
    </div>
  );
}
