import { useNavigate } from "react-router-dom";
import { useJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

const JourneyPage = () => {
  const navigate = useNavigate();
  const { state, isModuleUnlocked, getModuleState } = useJourney();

  const completedCount = modules.filter(m => getModuleState(m.id).completed).length;
  const overallProgress = (completedCount / modules.length) * 100;

  const getStatus = (moduleId: number): 'locked' | 'available' | 'completed' => {
    if (getModuleState(moduleId).completed) return 'completed';
    if (isModuleUnlocked(moduleId)) return 'available';
    return 'locked';
  };

  const inwardModules = modules.filter(m => m.id <= 3);
  const outwardModules = modules.filter(m => m.id > 3);

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
          <div className="flex items-center gap-2 text-accent">
            <Compass className="h-5 w-5" />
            <span className="font-serif font-semibold text-primary">Your Journey</span>
          </div>
        </div>

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
              <ModuleCard key={m.id} moduleId={m.id} title={m.title} description={m.description} icon={m.icon} status={getStatus(m.id)} />
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
              <ModuleCard key={m.id} moduleId={m.id} title={m.title} description={m.description} icon={m.icon} status={getStatus(m.id)} />
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
