import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyStudentCohort,
  getMyCheckpoint,
  joinCohort,
  logEvent,
  type Cohort,
} from "@/lib/cohorts";
import { JoinClass } from "@/components/JoinClass";
import { CheckpointCard } from "@/components/CheckpointCard";
import { GraduationCap } from "lucide-react";

interface CohortPanelProps {
  /** True once the student has completed every module (drives the post checkpoint). */
  journeyComplete: boolean;
  className?: string;
}

/**
 * Student-facing cohort surface on the journey hub: auto-enrolls from a
 * ?code= link, offers manual join, and shows the pre/post checkpoints.
 * Everything here is participation + private-to-student instrumentation.
 */
export function CohortPanel({ journeyComplete, className = "" }: CohortPanelProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [preDone, setPreDone] = useState(false);
  const [postDone, setPostDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (c: Cohort | null) => {
      if (!user || !c) {
        setCohort(null);
        setLoading(false);
        return;
      }
      setCohort(c);
      const [pre, post] = await Promise.all([
        getMyCheckpoint(user.id, c.id, "pre").catch(() => null),
        getMyCheckpoint(user.id, c.id, "post").catch(() => null),
      ]);
      setPreDone(!!pre);
      setPostDone(!!post);
      setLoading(false);
    },
    [user],
  );

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const code = searchParams.get("code");
      if (code) {
        // Consume the deep-link code, then clear it from the URL.
        try {
          await joinCohort(code);
          logEvent(user.id, null, "cohort_joined", { via: "link" });
        } catch {
          // invalid/expired code — fall through to whatever membership exists
        }
        const next = new URLSearchParams(searchParams);
        next.delete("code");
        setSearchParams(next, { replace: true });
      }
      const mine = await getMyStudentCohort(user.id).catch(() => null);
      if (active) load(mine);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) return null;

  // Not in a class → offer to join.
  if (!cohort) {
    return <JoinClass className={className} onJoined={() => user && getMyStudentCohort(user.id).then(load)} />;
  }

  // Pre checkpoint first.
  if (!preDone) {
    return <CheckpointCard cohortId={cohort.id} phase="pre" onDone={() => setPreDone(true)} className={className} />;
  }

  // Post checkpoint once the journey is complete.
  if (journeyComplete && !postDone) {
    return <CheckpointCard cohortId={cohort.id} phase="post" onDone={() => setPostDone(true)} className={className} />;
  }

  // Enrolled + checkpoint(s) done → quiet status line.
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground ${className}`}
    >
      <GraduationCap className="h-4 w-4 text-accent/80" aria-hidden="true" />
      Enrolled in <span className="text-foreground/80">{cohort.name}</span>. Your instructor sees
      your progress, never your answers.
    </div>
  );
}
