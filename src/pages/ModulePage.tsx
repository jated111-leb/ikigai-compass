import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { ContentBlock } from "@/components/ContentBlock";
import { ExerciseFreeText } from "@/components/ExerciseFreeText";
import { ExerciseMultiSelect } from "@/components/ExerciseMultiSelect";
import { ExerciseRanking } from "@/components/ExerciseRanking";
import { ExerciseCardSelect } from "@/components/ExerciseCardSelect";
import { ExerciseTimeline } from "@/components/ExerciseTimeline";
import { AiCoachingPanel } from "@/components/AiCoachingPanel";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { archetypes } from "@/lib/content";
import { ArrowLeft, ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";

const ModulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleId = parseInt(id || "1");
  const moduleContent = modules.find(m => m.id === moduleId);
  const { state, getModuleState, isModuleUnlocked, saveExercise, completeModule, setWorldNeeds, setTimelineEvents, setArchetype, setIkigaiStatement } = useJourney();

  const modState = getModuleState(moduleId);
  const [step, setStep] = useState(modState.currentStep || 0);
  const [showAi, setShowAi] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowAi(false);
  }, [step]);

  if (!moduleContent || !isModuleUnlocked(moduleId)) {
    navigate("/journey");
    return null;
  }

  const totalSteps = moduleContent.steps.length;
  const currentStepData = moduleContent.steps[step];
  const isLastStep = step === totalSteps - 1;
  const IconComp = (Icons as any)[moduleContent.icon] || Icons.Circle;

  const exerciseData = modState.exercises[String(step)] || {};

  const handleExerciseSave = (data: any) => {
    saveExercise(moduleId, step, data);
    if (!showAi) setShowAi(true);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    completeModule(moduleId);
    navigate("/journey");
  };

  // Module 6 synthesis
  const [synthesizing, setSynthesizing] = useState(false);
  const handleSynthesize = () => {
    setSynthesizing(true);
    setTimeout(() => {
      const statement = "To use my gift of deep understanding and creative expression to help others find their own path to meaning — bridging the gap between who they are and who they're becoming.";
      setIkigaiStatement(statement);
      setSynthesizing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/journey")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Journey Map
          </Button>
          <div className="flex items-center gap-2 text-accent">
            <Compass className="h-4 w-4" />
          </div>
        </div>

        {/* Module header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <IconComp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Module {moduleId}</span>
              <h1 className="text-2xl font-serif font-bold text-primary">{moduleContent.title}</h1>
            </div>
          </div>
          <ProgressBar value={((step + 1) / totalSteps) * 100} label={`Step ${step + 1} of ${totalSteps}`} size="sm" />
        </div>

        {/* Step content */}
        <div className="animate-fade-slide-in space-y-8" key={step}>
          {/* Content zone */}
          {currentStepData.content.length > 0 && (
            <ContentBlock blocks={currentStepData.content} />
          )}

          {/* Exercise zone */}
          {currentStepData.exercise && (
            <div className="pt-2">
              {currentStepData.exercise.type === 'freetext' && (
                <ExerciseFreeText
                  prompt={currentStepData.exercise.prompt}
                  placeholder={currentStepData.exercise.placeholder}
                  value={exerciseData.response || ''}
                  onSave={(response) => handleExerciseSave({ type: 'freetext', prompt: currentStepData.exercise!.prompt, response })}
                />
              )}
              {currentStepData.exercise.type === 'multiselect' && (
                <ExerciseMultiSelect
                  prompt={currentStepData.exercise.prompt}
                  options={currentStepData.exercise.options || []}
                  selected={exerciseData.selected || []}
                  onSave={(selected) => handleExerciseSave({ type: 'multiselect', prompt: currentStepData.exercise!.prompt, selected })}
                />
              )}
              {currentStepData.exercise.type === 'ranking' && (
                <ExerciseRanking
                  prompt={currentStepData.exercise.prompt}
                  options={currentStepData.exercise.options || []}
                  order={exerciseData.order || currentStepData.exercise.options || []}
                  onSave={(order) => handleExerciseSave({ type: 'ranking', prompt: currentStepData.exercise!.prompt, order })}
                />
              )}
              {currentStepData.exercise.type === 'cardselect' && (
                <ExerciseCardSelect
                  selected={state.selectedWorldNeeds}
                  onSave={(selected) => { setWorldNeeds(selected); setShowAi(true); }}
                />
              )}
              {currentStepData.exercise.type === 'timeline' && (
                <ExerciseTimeline
                  events={state.timelineEvents}
                  onSave={(events) => { setTimelineEvents(events); setShowAi(true); }}
                />
              )}
            </div>
          )}

          {/* Archetypes section for module 5 */}
          {moduleId === 5 && step === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif font-semibold text-foreground text-lg">Explore the Archetypes</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {archetypes.map(a => (
                  <ArchetypeCard
                    key={a.id}
                    archetype={a}
                    isSelected={state.archetypeResult === a.id}
                    onSelect={() => setArchetype(a.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Module 6 synthesis */}
          {moduleId === 6 && isLastStep && (
            <div className="space-y-6 pt-4">
              {!state.ikigaiStatement && !synthesizing && (
                <div className="text-center">
                  <Button variant="hero" size="lg" onClick={handleSynthesize} className="px-8 py-6 text-lg">
                    <Sparkles className="h-5 w-5 mr-2" /> Generate My Ikigai
                  </Button>
                </div>
              )}
              {synthesizing && (
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-accent"
                        style={{
                          animation: `breathe 2s ease-in-out ${i * 0.3}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic font-serif">Synthesizing your journey...</p>
                </div>
              )}
              {state.ikigaiStatement && (
                <div className="text-center py-8 space-y-6 animate-fade-slide-in">
                  <div className="border-2 border-accent/30 rounded-2xl p-8 bg-accent/5">
                    <p className="text-2xl font-serif leading-relaxed text-primary italic">
                      "{state.ikigaiStatement}"
                    </p>
                  </div>
                  <Button variant="warm" onClick={() => navigate("/export")}>
                    Export My Journey
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* AI coaching */}
          <AiCoachingPanel visible={showAi} />

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {isLastStep ? (
              <Button variant="hero" onClick={handleComplete} className="gap-2">
                <Check className="h-4 w-4" /> Complete Module
              </Button>
            ) : (
              <Button variant="default" onClick={handleNext} className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
