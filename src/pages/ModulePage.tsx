import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as Icons from "lucide-react";
import { streamSynthesis, hasApiKey, setApiKey } from "@/lib/ai-service";

const ModulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const moduleId = parseInt(id || "1");
  const moduleContent = modules.find(m => m.id === moduleId);
  const { state, getModuleState, isModuleUnlocked, saveExercise, completeModule, setWorldNeeds, setTimelineEvents, setArchetype, setIkigaiStatement } = useJourney(user);

  const modState = getModuleState(moduleId);
  const [step, setStep] = useState(modState.currentStep || 0);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisText, setSynthesisText] = useState('');
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [showSynthesisKeyForm, setShowSynthesisKeyForm] = useState(false);
  const [synthApiKeyInput, setSynthApiKeyInput] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (!moduleContent || !isModuleUnlocked(moduleId)) {
    navigate("/journey");
    return null;
  }

  const totalSteps = moduleContent.steps.length;
  const currentStepData = moduleContent.steps[step];
  const isLastStep = step === totalSteps - 1;
  const IconComp = (Icons as any)[moduleContent.icon] || Icons.Circle;

  const exerciseData = modState.exercises[String(step)] || {} as any;

  const handleExerciseSave = (data: any) => {
    saveExercise(moduleId, step, data);
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

  const handleSynthesize = async () => {
    if (!hasApiKey()) {
      setShowSynthesisKeyForm(true);
      return;
    }

    setSynthesizing(true);
    setSynthesisText('');
    setSynthesisError(null);

    try {
      const fullText = await streamSynthesis(
        state.modules,
        state.selectedWorldNeeds,
        state.timelineEvents,
        state.archetypeResult,
        (text) => {
          setSynthesisText(text);
        }
      );

      // Extract just the Ikigai statement from the full response
      // The AI returns both statement and threads; store the full response
      setIkigaiStatement(fullText);
      setSynthesizing(false);
    } catch (err: any) {
      if (err.message === 'NO_API_KEY') {
        setShowSynthesisKeyForm(true);
      } else if (err.message === 'INVALID_API_KEY') {
        setSynthesisError('Invalid API key. Please check your key and try again.');
        setShowSynthesisKeyForm(true);
      } else {
        setSynthesisError(err.message || 'Failed to generate synthesis. Please try again.');
      }
      setSynthesizing(false);
    }
  };

  const handleSaveSynthesisKey = () => {
    if (synthApiKeyInput.trim()) {
      setApiKey(synthApiKeyInput.trim());
      setSynthApiKeyInput('');
      setShowSynthesisKeyForm(false);
      setSynthesisError(null);
      setTimeout(() => handleSynthesize(), 100);
    }
  };

  // Compute userResponse string for AI coaching based on exercise type
  const getUserResponse = (): string => {
    if (!currentStepData.exercise) return '';
    const type = currentStepData.exercise.type;
    if (type === 'freetext' || type === 'visualization') {
      return exerciseData.response || '';
    }
    if (type === 'multiselect') {
      return (exerciseData.selected || []).join(', ');
    }
    if (type === 'ranking') {
      return (exerciseData.order || []).join(', ');
    }
    if (type === 'cardselect') {
      return state.selectedWorldNeeds.join(', ');
    }
    if (type === 'timeline') {
      return state.timelineEvents.map((e: any) => `${e.year}: ${e.description}`).join('; ');
    }
    return '';
  };

  // Module theme colors
  const themeColors: Record<number, string> = { 1: '#d97706', 2: '#7c3aed', 3: '#dc2626', 4: '#059669', 5: '#2563eb', 6: '#d97706' };
  const themeColor = themeColors[moduleId] || '#d97706';

  return (
    <div className="py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Module header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
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
          {/* Step title */}
          {currentStepData.title && (
            <h2 className="text-xl font-serif font-semibold text-foreground/90 mb-4">{currentStepData.title}</h2>
          )}

          {/* Content zone */}
          {currentStepData.content.length > 0 && (
            <ContentBlock blocks={currentStepData.content} />
          )}

          {/* Exercise zone */}
          {currentStepData.exercise && (
            <div className="pt-2">
              {(currentStepData.exercise.type === 'freetext' || currentStepData.exercise.type === 'visualization') && (
                <ExerciseFreeText
                  prompt={currentStepData.exercise.prompt}
                  placeholder={currentStepData.exercise.placeholder}
                  guidance={currentStepData.exercise.guidance}
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
                  onSave={(selected) => { setWorldNeeds(selected); }}
                />
              )}
              {currentStepData.exercise.type === 'timeline' && (
                <ExerciseTimeline
                  events={state.timelineEvents}
                  onSave={(events) => { setTimelineEvents(events); }}
                />
              )}
            </div>
          )}

          {/* Archetypes section for module 5 - show on archetype step */}
          {moduleId === 5 && currentStepData.title === "Your Archetype" && (
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
              {/* API Key form for synthesis */}
              {showSynthesisKeyForm && (
                <div className="bg-background/60 rounded-lg p-4 space-y-3 border border-border/60">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    <span>Enter your OpenAI API key to generate your Ikigai</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={synthApiKeyInput}
                      onChange={(e) => setSynthApiKeyInput(e.target.value)}
                      placeholder="sk-..."
                      className="bg-background"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSynthesisKey();
                      }}
                    />
                    <Button variant="warm" size="sm" onClick={handleSaveSynthesisKey}>
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your key is stored locally in your browser and never sent to our servers.
                  </p>
                </div>
              )}

              {/* Synthesis error */}
              {synthesisError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-destructive">{synthesisError}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={handleSynthesize}>
                      Try again
                    </Button>
                  </div>
                </div>
              )}

              {!state.ikigaiStatement && !synthesizing && !showSynthesisKeyForm && (
                <div className="text-center">
                  <Button variant="hero" size="lg" onClick={handleSynthesize} className="px-8 py-6 text-lg">
                    <Sparkles className="h-5 w-5 mr-2" /> Generate My Ikigai
                  </Button>
                </div>
              )}
              {synthesizing && (
                <div className="space-y-6 py-4">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-accent"
                          style={{ animation: `breathe 2s ease-in-out ${i * 0.3}s infinite` }}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic font-serif">Synthesizing your journey...</p>
                  </div>
                  {/* Show streaming synthesis text */}
                  {synthesisText && (
                    <div className="border-2 border-accent/20 rounded-2xl p-8 bg-accent/5 animate-fade-slide-in">
                      <p className="text-lg font-serif leading-relaxed text-primary whitespace-pre-wrap">
                        {synthesisText}
                        <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 align-text-bottom" />
                      </p>
                    </div>
                  )}
                </div>
              )}
              {state.ikigaiStatement && !synthesizing && (
                <div className="py-8 space-y-6 animate-fade-slide-in">
                  <div className="border-2 border-accent/30 rounded-2xl p-8 bg-accent/5">
                    <p className="text-lg font-serif leading-relaxed text-primary whitespace-pre-wrap">
                      {state.ikigaiStatement}
                    </p>
                  </div>
                  <div className="text-center">
                    <Button variant="warm" onClick={() => navigate("/export")}>
                      Export My Journey
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI coaching - shows for exercise steps */}
          {currentStepData.exercise && (
            <AiCoachingPanel
              moduleId={moduleId}
              exercisePrompt={currentStepData.exercise.prompt}
              exerciseGuidance={currentStepData.exercise.guidance}
              followUpPrompt={currentStepData.exercise.followUpPrompt}
              userResponse={getUserResponse()}
            />
          )}

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
