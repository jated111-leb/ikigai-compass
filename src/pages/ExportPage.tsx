import { useNavigate } from "react-router-dom";
import { loadJourney } from "@/lib/store";
import { modules, worldNeedCategories, archetypes } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const ExportPage = () => {
  const navigate = useNavigate();
  const journey = loadJourney();

  if (!journey) {
    navigate("/");
    return null;
  }

  const getExerciseResponses = (moduleId: number) => {
    const mod = journey.modules[String(moduleId)];
    if (!mod) return [];
    return Object.entries(mod.exercises).map(([stepIdx, ex]) => ({
      step: parseInt(stepIdx),
      ...ex,
    }));
  };

  const selectedTopics = journey.selectedWorldNeeds.map(id => {
    const topic = worldNeedCategories.flatMap(c => c.topics).find(t => t.id === id);
    return topic?.title || id;
  });

  const archetype = archetypes.find(a => a.id === journey.archetypeResult);

  return (
    <div className="py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Actions (hidden in print) */}
        <div className="flex justify-end mb-10 no-print">
          <Button variant="warm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">My Ikigai Journey</h1>
          <p className="text-muted-foreground">
            Started {new Date(journey.startedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Ikigai statement */}
        {journey.ikigaiStatement && (
          <div className="border-2 border-accent/30 rounded-2xl p-8 bg-accent/5 text-center mb-12">
            <h2 className="text-sm text-accent font-semibold uppercase tracking-wider mb-4">My Purpose</h2>
            <p className="text-xl font-serif leading-relaxed text-primary italic">
              "{journey.ikigaiStatement}"
            </p>
          </div>
        )}

        {/* Per-module summaries */}
        {modules.map((mod) => {
          const responses = getExerciseResponses(mod.id);
          if (responses.length === 0 && mod.id !== 4 && mod.id !== 5) return null;

          return (
            <div key={mod.id} className="mb-10 print-break">
              <h2 className="text-xl font-serif font-semibold text-primary border-b border-border/40 pb-2 mb-4">
                Module {mod.id}: {mod.title}
              </h2>

              {responses.filter(r => r.response).map((r, i) => (
                <div key={i} className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{r.prompt}</p>
                  <p className="text-foreground leading-relaxed pl-4 border-l-2 border-accent/30">
                    {r.response}
                  </p>
                </div>
              ))}

              {responses.filter(r => r.selected && r.selected.length > 0).map((r, i) => (
                <div key={`sel-${i}`} className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{r.prompt}</p>
                  <div className="flex flex-wrap gap-2 pl-4">
                    {r.selected!.map(s => (
                      <span key={s} className="text-sm bg-secondary px-3 py-1 rounded-full text-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              ))}

              {/* World needs for module 4 */}
              {mod.id === 4 && selectedTopics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">World needs that resonate:</p>
                  <div className="flex flex-wrap gap-2 pl-4">
                    {selectedTopics.map(t => (
                      <span key={t} className="text-sm bg-accent/15 px-3 py-1 rounded-full text-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline for module 5 */}
              {mod.id === 5 && journey.timelineEvents.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Life timeline:</p>
                  <div className="space-y-2 pl-4">
                    {journey.timelineEvents.map(e => (
                      <div key={e.id} className="flex gap-3 text-sm">
                        <span className="font-semibold text-accent w-12">{e.year}</span>
                        <span className="text-foreground">{e.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Archetype for module 5 */}
              {mod.id === 5 && archetype && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Archetype:</p>
                  <p className="text-foreground pl-4 border-l-2 border-accent/30">
                    <strong>{archetype.name}</strong> — {archetype.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExportPage;
