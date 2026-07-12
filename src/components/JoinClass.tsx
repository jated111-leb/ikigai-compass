import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { joinCohort, logEvent } from "@/lib/cohorts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, GraduationCap, Check } from "lucide-react";

interface JoinClassProps {
  onJoined?: (cohortId: string) => void;
  className?: string;
}

/**
 * Lets a student enter a class join code and enroll. Enrollment goes through
 * the join_cohort RPC (the student can't read cohorts by code directly).
 */
export function JoinClass({ onJoined, className = "" }: JoinClassProps) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const cohortId = await joinCohort(code);
      setJoined(true);
      logEvent(user?.id ?? null, cohortId, "cohort_joined", { via: "code" });
      onJoined?.(cohortId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join the class.");
    } finally {
      setBusy(false);
    }
  };

  if (joined) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-sm text-foreground ${className}`}
      >
        <Check className="h-4 w-4 text-accent" aria-hidden="true" />
        You&apos;re in. Your instructor will see your progress — never your answers.
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-border/50 bg-muted/20 px-4 py-3 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <GraduationCap className="h-4 w-4 text-accent/80" aria-hidden="true" />
        Have a class code?
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. 7F2A9C"
          maxLength={12}
          className="uppercase tracking-widest"
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          aria-label="Class join code"
        />
        <Button onClick={handleJoin} disabled={busy || !code.trim()} className="shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join class"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Joining shares only your progress and anything you choose to share — not your reflections.
      </p>
    </div>
  );
}
