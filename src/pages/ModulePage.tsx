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
import { Sigil } from "@/components/Sigil";
import { CompassArtifact } from "@/components/CompassArtifact";
import { Button } from "@/components/ui/button";
import { archetypes } from "@/lib/content";
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertCircle, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import * as Icons from "lucide-react";
import { streamSynthesis, hasApiKey, setApiKey } from "@/lib/ai-service";
import { AnimatePresence, motion } from "framer-motion";
import { MODULE_KANJI, MODULE_HUE, ROMAN } from "@/lib/module-meta";

const INVOCATIONS = [
  "Now, listen inward…",
  "Let the question settle before you answer.",
  "Speak from the part of you that already knows.",
  "There is no wrong answer — only an honest one.",
  "Pause. Breathe. Then begin.",
  "Trust the first words that arrive.",
];

const ModulePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const moduleId = parseInt(id || "1");
  const moduleContent = modules.find(m => m.id === moduleId);
  const { state, getModuleState, isModuleUnlocked, saveExercise, completeModule, setWorldNeeds, setTimelineEvents, setArchetype, setIkigaiStatement } = useJourney(user);

  const modState = getModuleState(moduleId);
  const [step, setStep] = useState(modState.currentStep || 0);
  const [direction, setDirection] = useState(1);
  const [showSigil, setShowSigil] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisText, setSynthesisText] = useState('');
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [showSynthesisKeyForm, setShowSynthesisKeyForm] = useState(false);
  const [synthApiKeyInput, setSynthApiKeyInput] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Apply per-module aura
  useEffect(() => {
    const hue = MODULE_HUE[moduleId] ?? 38;
    document.body.style.setProperty("--aura-hue", String(hue));
    document.body.style.setProperty("--aura-strength", "0.16");
    document.body.classList.add("has-aura");
    return () => {
      document.body.classList.remove("has-aura");
      document.body.style.removeProperty("--aura-hue");
      document.body.style.removeProperty("--aura-strength");
    };
  }, [moduleId]);

  if (!moduleContent || !isModuleUnlocked(moduleId)) {
    navigate("/journey");
    return null;
  }

  const totalSteps = moduleContent.steps.length;
  const currentStepData = moduleContent.steps[step];
  const isLastStep = step === totalSteps - 1;
  const IconComp = (Icons as any)[moduleContent.icon] || Icons.Circle;
  const kanji = MODULE_KANJI[moduleId];
  const invocation = INVOCATIONS[(moduleId + step) % INVOCATIONS.length];

  const exerciseData = modState.exercises[String(step)] || {} as any;

  const handleExerciseSave = (data: any) => {
    saveExercise(moduleId, step, data);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    completeModule(moduleId);
    setShowSigil(true);
    // Shooting star ritual
    window.dispatchEvent(new CustomEvent('ikigai:shootingstar'));
    setTimeout(() => window.dispatchEvent(new CustomEvent('ikigai:shootingstar')), 400);
    setTimeout(() => {
      navigate("/journey");
    }, 2600);
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
        (text) => setSynthesisText(text),
      );
      setIkigaiStatement(fullText);
      setSynthesizing(false);
    } catch (err: any) {
      if (err.message === 'NO_API_KEY') setShowSynthesisKeyForm(true);
      else if (err.message === 'INVALID_API_KEY') { setSynthesisError('Invalid API key. Please check your key and try again.'); setShowSynthesisKeyForm(true); }
      else setSynthesisError(err.message || 'Failed to generate synthesis. Please try again.');
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

  const getUserResponse = (): string => {
    if (!currentStepData.exercise) return '';
    const type = currentStepData.exercise.type;
    if (type === 'freetext' || type === 'visualization') return exerciseData.response || '';
    if (type === 'multiselect') return (exerciseData.selected || []).join(', ');
    if (type === 'ranking') return (exerciseData.order || []).join(', ');
    if (type === 'cardselect') return state.selectedWorldNeeds.join(', ');
    if (type === 'timeline') return state.timelineEvents.map((e: any) => `${e.year}: ${e.description}`).join('; ');
    return '';
  };

  const themeColors: Record<number, string> = { 1: '#d97706', 2: '#7c3aed', 3: '#dc2626', 4: '#059669', 5: '#2563eb', 6: '#d97706' };
  const themeColor = themeColors[moduleId] || '#d97706';

  return (
    <div className="py-8 px-6 relative">
      {/* Sigil stamp overlay on completion */}
      <AnimatePresence>
        {showSigil && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="animate-stamp inline-block">
                <Sigil moduleId={moduleId} size={220} glow animate />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="mt-6 font-serif italic text-lg text-accent/90"
              >
                Chapter <span className="roman">{ROMAN[moduleId]}</span> · sealed.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto relative">
        {/* Kanji watermark */}
        <div className="kanji-watermark" aria-hidden>{kanji}</div>

        {/* Module header */}
        <div className="mb-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
            >
              <IconComp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">
                Chapter <span className="roman">{ROMAN[moduleId]}</span>
              </span>
              <h1 className="text-2xl font-serif font-bold text-primary">{moduleContent.title}</h1>
            </div>
          </div>
          <ProgressBar value={((step + 1) / totalSteps) * 100} label={`Verse ${step + 1} of ${totalSteps}`} size="sm" />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, y: direction > 0 ? 24 : -24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: direction > 0 ? -24 : 24, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Step title */}
          {currentStepData.title && (
            <h2 className="text-xl font-serif font-semibold text-foreground/90 mb-4 ink-bleed">{currentStepData.title}</h2>
          )}

          {/* Content zone */}
          {currentStepData.content.length > 0 && (
            <div className={step === 0 ? "drop-cap" : ""}>
              <ContentBlock blocks={currentStepData.content} />
            </div>
          )}

          {/* Exercise zone */}
          {currentStepData.exercise && (
            <div className="pt-2 space-y-4">
              <p className="font-serif italic text-accent/80 text-base ink-bleed">— {invocation}</p>
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

          {/* Archetypes — module 5 */}
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
              {showSynthesisKeyForm && (
                <div className="bg-background/60 rounded-lg p-4 space-y-3 border border-border/60">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    <span>Enter your OpenAI API key to generate your Ikigai</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password" value={synthApiKeyInput}
                      onChange={(e) => setSynthApiKeyInput(e.target.value)}
                      placeholder="sk-..." className="bg-background"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSynthesisKey(); }}
                    />
                    <Button variant="warm" size="sm" onClick={handleSaveSynthesisKey}>Save</Button>
                  </div>
                </div>
              )}
              {synthesisError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-destructive">{synthesisError}</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={handleSynthesize}>Try again</Button>
                  </div>
                </div>
              )}

              {!state.ikigaiStatement && !synthesizing && !showSynthesisKeyForm && (
                <div className="text-center">
                  <Button variant="hero" size="lg" onClick={handleSynthesize} className="px-8 py-6 text-lg">
                    <Sparkles className="h-5 w-5 mr-2" /> Forge My Compass
                  </Button>
                </div>
              )}
              {synthesizing && (
                <div className="space-y-6 py-4">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="w-3 h-3 rounded-full bg-accent"
                          style={{ animation: `breathe 2s ease-in-out ${i * 0.3}s infinite` }} />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic font-serif">Engraving your compass…</p>
                  </div>
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
                <div className="animate-fade-slide-in">
                  <CompassArtifact statement={state.ikigaiStatement} />
                  <div className="text-center mt-4">
                    <Button variant="warm" onClick={() => navigate("/export")}>
                      Export My Journey
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI coaching */}
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
              onClick={() => { setDirection(-1); setStep(Math.max(0, step - 1)); }}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {isLastStep ? (
              <Button variant="hero" onClick={handleComplete} className="gap-2">
                <Check className="h-4 w-4" /> Seal Chapter
              </Button>
            ) : (
              <Button variant="default" onClick={handleNext} className="gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModulePage;
