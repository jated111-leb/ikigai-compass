import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyStudentCohort, shareSummary, logEvent, type Cohort } from "@/lib/cohorts";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Check } from "lucide-react";

interface ShareWithInstructorProps {
  /** The text shared with the instructor — typically the ikigai statement. */
  summary: string | null | undefined;
}

/**
 * Opt-in control: lets a student send *only* their synthesis to their
 * instructor. This is the single path by which student content reaches an
 * instructor — everything else stays private.
 */
export function ShareWithInstructor({ summary }: ShareWithInstructorProps) {
  const { user } = useAuth();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getMyStudentCohort(user.id)
      .then((c) => active && setCohort(c))
      .catch(() => active && setCohort(null));
    return () => {
      active = false;
    };
  }, [user]);

  if (!cohort || !summary) return null;

  const handleShare = async () => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      await shareSummary(user.id, cohort.id, summary);
      logEvent(user.id, cohort.id, "summary_shared", {});
      setShared(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not share.");
    } finally {
      setBusy(false);
    }
  };

  if (shared) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-accent">
        <Check className="h-4 w-4" /> Shared with {cohort.name}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="ghost" onClick={handleShare} disabled={busy} className="gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        Share summary with instructor
      </Button>
      <span className="text-[11px] text-muted-foreground">
        Shares only this statement — not your reflections.
      </span>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </div>
  );
}
