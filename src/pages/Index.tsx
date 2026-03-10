import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney, clearJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
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
    <div>
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary leading-tight">
            Ikigai Journey
          </h1>
          <p className="text-lg text-accent font-serif italic">
            A guided journey to discover your reason for being
          </p>
          <p className="text-foreground/70 leading-relaxed max-w-md mx-auto">
            Six modules that guide you from inner reflection
            to outer purpose — helping you find the intersection of passion, wound, and meaning.
          </p>

          <div className="flex flex-col items-center gap-3 pt-4">
            {authLoading || journeyLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            ) : !user ? (
              <Button variant="hero" size="lg" onClick={() => navigate("/login")} className="px-10 py-6 text-lg">
                Sign In to Begin <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : hasProgress ? (
              <>
                <Button variant="hero" size="lg" onClick={() => navigate("/journey")} className="px-10 py-6 text-lg">
                  Continue Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                      Start Fresh
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
              <Button variant="hero" size="lg" onClick={() => navigate("/journey")} className="px-10 py-6 text-lg">
                Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Module preview */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold text-primary text-center mb-12">The Path Ahead</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {modules.map((mod) => {
              const IconComp = (Icons as any)[mod.icon] || Icons.Circle;
              const themeColors: Record<number, string> = { 1: '#d97706', 2: '#7c3aed', 3: '#dc2626', 4: '#059669', 5: '#2563eb', 6: '#d97706' };
              const color = themeColors[mod.id] || '#d97706';
              return (
                <div key={mod.id} className="text-center space-y-3 p-6 rounded-xl bg-card/50 border border-border/40">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Module {mod.id}</span>
                  <h3 className="font-serif font-semibold text-foreground">{mod.title}</h3>
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
