import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";

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
  const { state, isModuleUnlocked, getModuleState } = useJourney(user);

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
          <ProgressBar value={overallProgress} label={`${completedCount} of ${modules.length} modules complete`} />
        </div>

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
