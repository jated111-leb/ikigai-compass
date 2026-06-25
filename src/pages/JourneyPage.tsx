import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Sigil } from "@/components/Sigil";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { isOnboardingComplete } from "./OnboardingPage";
import { ROMAN } from "@/lib/module-meta";


// Module theme colors from the data pack
const moduleThemeColors: Record<number, string> = {
  1: '#d97706',
  2: '#7c3aed',
  3: '#dc2626',
  4: '#059669',
  5: '#2563eb',
  6: '#d97706',
};

const JourneyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, journeyLoading, isModuleUnlocked, getModuleState } = useJourney(user);

  // Redirect first-time users to onboarding
  if (!journeyLoading && state.currentModule <= 1 && !isOnboardingComplete()) {
    navigate("/onboarding", { replace: true });
    return null;
  }

  if (journeyLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const completedCount = modules.filter(m => getModuleState(m.id).completed).length;
  const overallProgress = (completedCount / modules.length) * 100;

  const getStatus = (moduleId: number): 'locked' | 'available' | 'completed' => {
    if (getModuleState(moduleId).completed) return 'completed';
    if (isModuleUnlocked(moduleId)) return 'available';
    return 'locked';
  };

  const inwardModules = modules.filter(m => m.journeyPhase === 'inward');
  const outwardModules = modules.filter(m => m.journeyPhase === 'outward');

  return (
    <div className="py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-10">
          <ProgressBar value={overallProgress} label={`${completedCount} of ${modules.length} chapters sealed`} />
        </div>

        {/* Sigil collection — appears once at least one chapter is sealed */}
        {completedCount > 0 && (
          <div className="mb-12 rounded-2xl border border-accent/15 bg-background/40 p-5 cursor-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-primary">Your seals</h3>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                <span className="roman">{ROMAN[completedCount] ?? completedCount}</span> of <span className="roman">{ROMAN[modules.length]}</span>
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2 place-items-center">
              {modules.map(m => {
                const done = getModuleState(m.id).completed;
                return (
                  <div key={m.id} className={done ? "" : "opacity-15 grayscale"}>
                    <Sigil moduleId={m.id} size={56} glow={done} />
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Inward Journey */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-serif font-semibold text-primary">Inward Journey</h2>
            <p className="text-sm text-muted-foreground">Exploring what lies within</p>
          </div>
          <div className="space-y-3">
            {inwardModules.map(m => (
              <ModuleCard key={m.id} moduleId={m.id} title={m.title} description={m.description} icon={m.icon} status={getStatus(m.id)} themeColor={moduleThemeColors[m.id]} />
            ))}
          </div>
        </div>

        {/* Outward Journey */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-serif font-semibold text-primary">Outward Journey</h2>
            <p className="text-sm text-muted-foreground">Discovering your place in the world</p>
          </div>
          <div className="space-y-3">
            {outwardModules.map(m => (
              <ModuleCard key={m.id} moduleId={m.id} title={m.title} description={m.description} icon={m.icon} status={getStatus(m.id)} themeColor={moduleThemeColors[m.id]} />
            ))}
          </div>
        </div>

        {/* Export link */}
        {completedCount === modules.length && (
          <div className="mt-10 text-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/export")} className="px-8">
              View Your Complete Journey
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
