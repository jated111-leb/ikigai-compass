import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  Eye,
  Globe,
  Sparkles,
  Heart,
  Sun,
} from "lucide-react";

const ONBOARDING_KEY = "ikigai-onboarding-complete";

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

/* ------------------------------------------------------------------ */
/*  Step data                                                          */
/* ------------------------------------------------------------------ */

interface OnboardingStep {
  id: string;
  content: React.ReactNode;
}

function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <div className="flex justify-center">
        <Logo size="lg" showText={false} />
      </div>
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary leading-tight">
        A Journey to Discovering Your Ikigai
      </h1>
      <p className="text-lg text-accent font-serif italic">Your Reason for Being</p>
      <p className="text-foreground/70 leading-relaxed">
        Each of us is born with a purpose to co-create the world with what we are meant to give.
        This journey will help you find what that is — not through a test or a formula, but through
        deep self-exploration.
      </p>
    </div>
  );
}

function StepTwoPaths() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <div className="flex gap-6 justify-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
          <Eye className="h-6 w-6 text-amber-700" />
        </div>
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <Globe className="h-6 w-6 text-emerald-700" />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
        Two Paths That Converge
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 text-left w-full">
        <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-6 space-y-3">
          <h3 className="font-serif font-semibold text-amber-900 text-lg">Inward Journey</h3>
          <p className="text-amber-900/70 text-sm leading-relaxed">
            Explore what lies within — your passions, your talents, the dreams of your youth,
            and the shadows you've hidden from the world.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-6 space-y-3">
          <h3 className="font-serif font-semibold text-emerald-900 text-lg">Outward Journey</h3>
          <p className="text-emerald-900/70 text-sm leading-relaxed">
            Explore opportunities in the world — the gaps that call to you,
            the needs that resonate with your deepest concerns, and where your gifts can serve.
          </p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm italic">
        Where these two paths meet, you will find your purpose.
      </p>
    </div>
  );
}

function StepSpecialPurpose() {
  const steps = [
    { num: 1, text: "Find what makes you come alive — your talent", icon: Heart, color: "text-rose-600 bg-rose-50" },
    { num: 2, text: "Pursue a flow-fueled path to mastery", icon: Sun, color: "text-amber-600 bg-amber-50" },
    { num: 3, text: "Notice where you feel the wound of the world", icon: Eye, color: "text-violet-600 bg-violet-50" },
    { num: 4, text: "Take a stand at the intersection of your talent and the world's need", icon: Sparkles, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
        <Compass className="h-6 w-6 text-accent" />
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
        Your Special Purpose
      </h2>
      <p className="text-foreground/70 leading-relaxed">
        Finding your purpose is a four-step process:
      </p>
      <div className="space-y-4 w-full text-left">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.num} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-foreground/80 leading-relaxed pt-2 text-sm">{s.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepMagicalBlend() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
        <Sparkles className="h-6 w-6 text-violet-700" />
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
        The Magical Blend
      </h2>
      <div className="space-y-6 text-left">
        <p className="text-foreground/70 leading-relaxed">
          Purpose is not a fixed treasure waiting to be discovered "out there." Nor is it something
          you invent from nothing. It is something far more alive.
        </p>
        <div className="border-l-4 border-accent/40 pl-5 py-1">
          <p className="text-foreground/80 font-serif italic leading-relaxed">
            Create-and-discover meaning — a dance in the liminal space where you are fully
            participating in the mystery of life, continually finding beauty, freedom, and purpose.
          </p>
        </div>
        <p className="text-foreground/70 leading-relaxed">
          This journey is that dance. It will ask you to look honestly inward and bravely outward,
          and to trust what emerges in between.
        </p>
      </div>
    </div>
  );
}

function StepWhatAwaits() {
  const mods = [
    { num: 1, title: "What Makes You Come Alive", desc: "Passion, talent, and the dreams of your youth", color: "#d97706" },
    { num: 2, title: "Your Suffering & Shadow", desc: "Integrating what you've hidden to face the world whole", color: "#7c3aed" },
    { num: 3, title: "My Fears", desc: "Overcoming the obstacles on the path to your mission", color: "#dc2626" },
    { num: 4, title: "Gaps in the World", desc: "What the world needs and what resonates with your soul", color: "#059669" },
    { num: 5, title: "Individuation & The Self", desc: "Finding your uniqueness and your life's arc", color: "#2563eb" },
    { num: 6, title: "Transcend & Co-create", desc: "Crafting your Ikigai statement and stepping forward", color: "#d97706" },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
        What Awaits You
      </h2>
      <p className="text-foreground/70 leading-relaxed">
        Six modules will guide you from inner reflection to outer purpose:
      </p>
      <div className="grid gap-3 w-full text-left">
        {mods.map((m) => (
          <div key={m.num} className="flex items-center gap-4 py-2.5 px-4 rounded-xl bg-card/50 border border-border/30">
            <span
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: m.color }}
            >
              {m.num}
            </span>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-foreground text-sm">{m.title}</p>
              <p className="text-xs text-muted-foreground truncate">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">
        Each module includes guided reflections and AI coaching to deepen your exploration.
      </p>
    </div>
  );
}

function StepBegin() {
  return (
    <div className="flex flex-col items-center text-center space-y-8 max-w-lg mx-auto">
      <div className="flex justify-center">
        <Logo size="lg" showText={false} />
      </div>
      <div className="bg-[hsl(280,30%,55%)] rounded-2xl p-8 text-white/90 space-y-4 w-full">
        <span className="text-4xl leading-none block">&ldquo;</span>
        <p className="font-serif text-lg md:text-xl leading-relaxed italic">
          Ask yourself what makes you come alive, and go and do more of that,
          because what the world needs is more of us, all of us to come alive!
        </p>
        <p className="text-white/70 text-sm font-semibold tracking-wide">
          — Howard Thurman
        </p>
      </div>
      <p className="text-foreground/70 leading-relaxed">
        Your journey starts now. Take your time with each module — there is no rush.
        What matters is that you begin.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    { id: "welcome", content: <StepWelcome /> },
    { id: "paths", content: <StepTwoPaths /> },
    { id: "purpose", content: <StepSpecialPurpose /> },
    { id: "blend", content: <StepMagicalBlend /> },
    { id: "modules", content: <StepWhatAwaits /> },
    { id: "begin", content: <StepBegin /> },
  ];

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      markOnboardingComplete();
      navigate("/journey");
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, navigate]);

  const goBack = useCallback(() => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  }, [isFirst]);

  const skip = useCallback(() => {
    markOnboardingComplete();
    navigate("/journey");
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col px-6 py-10">
      {/* Skip button */}
      <div className="flex justify-end max-w-lg mx-auto w-full mb-4">
        {!isLast && (
          <button
            onClick={skip}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Skip intro
          </button>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full animate-in fade-in duration-500" key={steps[currentStep].id}>
          {steps[currentStep].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-lg mx-auto w-full pt-8 space-y-6">
        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "bg-accent w-7"
                  : i < currentStep
                    ? "bg-accent/40"
                    : "bg-border"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={isFirst}
            className={`gap-2 ${isFirst ? "invisible" : ""}`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <Button variant="hero" onClick={goNext} className="gap-2 px-8">
            {isLast ? (
              <>
                Begin Your Journey <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
