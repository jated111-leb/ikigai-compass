import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney, clearJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { isOnboardingComplete } from "./OnboardingPage";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { state, journeyLoading, resetJourney } = useJourney(user);
  const hasProgress = user && state.currentModule > 1;

  const handleStartFresh = async () => {
    await resetJourney();
    navigate("/journey");
  };

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Mystical orb backdrop */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="w-[520px] h-[520px] rounded-full animate-orb"
            style={{
              background: 'radial-gradient(circle, hsl(38 92% 58% / 0.45), hsl(20 88% 50% / 0.25) 40%, transparent 70%)',
            }}
          />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
          <div
            className="w-[380px] h-[380px] rounded-full animate-orb"
            style={{
              background: 'radial-gradient(circle, hsl(280 60% 55% / 0.35), transparent 70%)',
              animationDelay: '-3s',
            }}
          />
        </div>

        <div className="relative max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div className="flex justify-center animate-float">
            <Logo size="lg" showText={false} />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] tracking-[0.5em] uppercase text-accent/80 font-medium" style={{ fontFamily: '"Noto Serif JP", serif' }}>
              生き甲斐 · A Reason for Being
            </p>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.05] shimmer-text">
              Ikigai Journey
            </h1>
            <p className="text-base md:text-lg text-accent/90 font-serif italic pt-2">
              Six chapters between the inner flame and the outer world
            </p>
          </div>

          <p className="text-foreground/65 leading-relaxed max-w-md mx-auto">
            A slow, deliberate path to the intersection of passion, wound,
            and meaning — guided by a witness that learns you before it answers.
          </p>

          <div className="flex flex-col items-center gap-3 pt-6">
            {authLoading || journeyLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            ) : !user ? (
              <Button variant="hero" size="lg" onClick={() => navigate("/login")} className="px-10 py-6 text-base tracking-wider uppercase shadow-glow">
                Enter the Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : hasProgress ? (
              <>
                <Button variant="hero" size="lg" onClick={() => navigate("/journey")} className="px-10 py-6 text-base tracking-wider uppercase shadow-glow">
                  Continue Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors mt-2">
                      Begin Again
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-serif">Start a new journey?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will erase all your reflections and progress. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep my progress</AlertDialogCancel>
                      <AlertDialogAction onClick={handleStartFresh} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <RotateCcw className="h-4 w-4 mr-2" /> Start Fresh
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate(isOnboardingComplete() ? "/journey" : "/onboarding")}
                className="px-10 py-6 text-base tracking-wider uppercase shadow-glow"
              >
                Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* veil at the bottom for transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 veil-overlay pointer-events-none" />
      </section>

      {/* Module preview */}
      <section className="relative pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <p className="text-[10px] tracking-[0.4em] uppercase text-accent/80">The Path Ahead</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">Six Chapters, One Compass</h2>
            <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {modules.map((mod, idx) => {
              const IconComp = (Icons as any)[mod.icon] || Icons.Circle;
              const themeColors: Record<number, string> = { 1: '#f59e0b', 2: '#a78bfa', 3: '#f87171', 4: '#34d399', 5: '#60a5fa', 6: '#fbbf24' };
              const color = themeColors[mod.id] || '#f59e0b';
              return (
                <div
                  key={mod.id}
                  className="mystical-card text-center space-y-3 p-6 rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border"
                    style={{
                      backgroundColor: `${color}1f`,
                      color,
                      borderColor: `${color}55`,
                      boxShadow: `0 0 18px ${color}33`,
                    }}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium block">
                    Chapter {mod.id.toString().padStart(2, '0')}
                  </span>
                  <h3 className="font-serif font-semibold text-foreground text-lg">{mod.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
