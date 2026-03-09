import { useNavigate } from "react-router-dom";
import { loadJourney, clearJourney } from "@/lib/store";
import { modules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Compass, ArrowRight, RotateCcw } from "lucide-react";
import * as Icons from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const navigate = useNavigate();
  const existing = loadJourney();
  const hasProgress = existing && existing.currentModule > 1;

  const handleStartFresh = () => {
    clearJourney();
    navigate("/journey");
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Compass className="h-8 w-8" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary leading-tight">
            Ikigai Journey
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            Discover your purpose through guided self-exploration
          </p>
          <p className="text-foreground/70 leading-relaxed max-w-md mx-auto">
            A contemplative journey through six modules that guide you from inner reflection 
            to outer purpose — helping you find the intersection of passion, skill, and meaning.
          </p>

          <div className="flex flex-col items-center gap-3 pt-4">
            {hasProgress ? (
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
              return (
                <div key={mod.id} className="text-center space-y-3 p-6 rounded-xl bg-card/50 border border-border/40">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
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
