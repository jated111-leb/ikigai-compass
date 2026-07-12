import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listMyCohorts,
  createCohort,
  getRoster,
  getSharedSummaries,
  getClarityLift,
  type Cohort,
  type RosterEntry,
  type SharedSummary,
  type ClarityLift,
} from "@/lib/cohorts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Copy, Check, Users, Share2, TrendingUp } from "lucide-react";

const TeachPage = () => {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cohort | null>(null);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [term, setTerm] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const list = await listMyCohorts(user.id);
    setCohorts(list);
    setSelected((prev) => prev ?? list[0] ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async () => {
    if (!user || !name.trim() || creating) return;
    setCreating(true);
    try {
      const c = await createCohort(user.id, name.trim(), term.trim() || null);
      setName("");
      setTerm("");
      setCohorts((prev) => [c, ...prev]);
      setSelected(c);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary">For educators</h1>
          <p className="mt-1 text-muted-foreground">
            Create a class, share the code, and follow participation. You see who has completed
            the journey and anything a student chooses to share — never their private reflections.
          </p>
        </div>

        {/* Create */}
        <div className="mb-8 rounded-xl border border-border/50 bg-muted/20 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Plus className="h-4 w-4 text-accent/80" /> New class
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Class name (e.g. FYE 101 — Section A)"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Term (optional)"
              className="sm:max-w-[180px]"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating || !name.trim()} className="shrink-0">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </div>

        {cohorts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes yet. Create one above to begin.</p>
        ) : (
          <>
            {/* Cohort tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {cohorts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    selected?.id === c.id
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-accent/60"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {selected && <CohortDetail cohort={selected} />}
          </>
        )}
      </div>
    </div>
  );
};

function CohortDetail({ cohort }: { cohort: Cohort }) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [shares, setShares] = useState<SharedSummary[]>([]);
  const [lift, setLift] = useState<ClarityLift | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const [r, s, l] = await Promise.all([
        getRoster(cohort.id).catch(() => []),
        getSharedSummaries(cohort.id).catch(() => []),
        getClarityLift(cohort.id).catch(() => null),
      ]);
      if (!active) return;
      setRoster(r);
      setShares(s);
      setLift(l);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [cohort.id]);

  const joinLink = `${window.location.origin}/journey?code=${cohort.join_code}`;
  const students = roster.filter((r) => r.role === "student");
  const completed = students.filter((s) => s.is_complete).length;

  const copyCode = () => {
    navigator.clipboard?.writeText(cohort.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-8">
      {/* Join code */}
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Class join code</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-serif text-3xl font-bold tracking-[0.3em] text-primary">
            {cohort.join_code}
          </span>
          <Button variant="ghost" size="sm" onClick={copyCode} className="gap-1.5">
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="mt-2 break-all text-xs text-muted-foreground">
          Or share this link: <span className="text-foreground/70">{joinLink}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<Users className="h-4 w-4" />} label="Enrolled" value={students.length} />
            <Stat icon={<Check className="h-4 w-4" />} label="Completed" value={completed} />
            <Stat
              icon={<TrendingUp className="h-4 w-4" />}
              label="Clarity lift"
              value={lift ? `+${lift.lift}` : "—"}
              hint={lift ? `n=${lift.n}` : "needs 5+ pre/post"}
            />
          </div>

          {/* Roster */}
          <div>
            <h2 className="mb-3 font-serif text-lg font-semibold text-primary">Participation</h2>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No students yet. Share the code above to get started.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Student</th>
                      <th className="px-4 py-2 font-medium">Progress</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.user_id} className="border-t border-border/40">
                        <td className="px-4 py-2 text-foreground">{s.email ?? "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {s.modules_completed}/{s.total_modules}
                        </td>
                        <td className="px-4 py-2">
                          {s.is_complete ? (
                            <span className="text-accent">Complete</span>
                          ) : s.modules_completed > 0 ? (
                            <span className="text-muted-foreground">In progress</span>
                          ) : (
                            <span className="text-muted-foreground/60">Not started</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {s.shared ? <Check className="h-4 w-4 text-accent" /> : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Participation only. Students&apos; reflections and AI conversations stay private to them.
            </p>
          </div>

          {/* Shared summaries */}
          {shares.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-primary">
                <Share2 className="h-4 w-4 text-accent/80" /> Shared with you ({shares.length})
              </h2>
              <div className="space-y-3">
                {shares.map((s) => (
                  <div key={s.student_id} className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <p className="mb-1 text-xs text-muted-foreground">{s.email ?? "A student"}</p>
                    <p className="whitespace-pre-wrap text-sm italic text-foreground/90">
                      &ldquo;{s.summary}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-center">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-serif text-2xl font-bold text-primary">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default TeachPage;
