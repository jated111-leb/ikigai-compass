import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { saveCheckpoint, logEvent, type CheckpointPhase } from "@/lib/cohorts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckpointCardProps {
  cohortId: string;
  phase: CheckpointPhase;
  onDone: () => void;
  className?: string;
}

const SCALE = [1, 2, 3, 4, 5];

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground/80">{label}</p>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-full border text-sm transition-colors ${
              value === n
                ? "border-accent bg-accent/20 text-foreground"
                : "border-border/60 text-muted-foreground hover:border-accent/60"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Not at all</span>
        <span>Very much</span>
      </div>
    </div>
  );
}

/**
 * A short pre/post reflection checkpoint. Private to the student; instructors
 * only ever see the anonymity-thresholded aggregate lift.
 */
export function CheckpointCard({ cohortId, phase, onDone, className = "" }: CheckpointCardProps) {
  const { user } = useAuth();
  const [clarity, setClarity] = useState<number | null>(null);
  const [decided, setDecided] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = clarity !== null && decided !== null && !busy;

  const handleSave = async () => {
    if (!user || clarity === null || decided === null) return;
    setBusy(true);
    setError(null);
    try {
      await saveCheckpoint(user.id, cohortId, phase, { clarity, decided });
      logEvent(user.id, cohortId, "checkpoint_saved", { phase });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-xl border border-accent/25 bg-accent/5 p-5 ${className}`}>
      <h3 className="mb-1 font-serif text-lg font-semibold text-primary">
        {phase === "pre" ? "Before you begin" : "Now that you've finished"}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Two quick questions — just for you, to mark where you&apos;re starting from. Your
        instructor only ever sees the class-wide average, never your answers.
      </p>

      <div className="space-y-5">
        <ScaleRow
          label="I have a clear sense of direction for my career and life."
          value={clarity}
          onChange={setClarity}
        />
        <ScaleRow
          label="I feel decided about my major / career path."
          value={decided}
          onChange={setDecided}
        />
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} disabled={!canSave}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & continue"}
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="text-xs text-muted-foreground hover:text-accent"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
