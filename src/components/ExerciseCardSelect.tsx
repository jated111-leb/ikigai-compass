import { useState } from "react";
import { worldNeedCategories } from "@/lib/content";
import { ChevronDown, ChevronUp, Heart, Palette, Leaf, Lightbulb, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardSelectProps {
  selected: string[];
  onSave: (selected: string[]) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
  Lightbulb: <Lightbulb className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
};

export function ExerciseCardSelect({ selected, onSave }: ExerciseCardSelectProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    const next = selected.includes(topicId)
      ? selected.filter(s => s !== topicId)
      : [...selected, topicId];
    onSave(next);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {worldNeedCategories.map((cat) => {
          const isExpanded = expandedCategory === cat.title;
          const selectedInCat = cat.topics.filter(t => selected.includes(t.id)).length;

          return (
            <div key={cat.title} className="border border-border/60 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.title)}
                className="w-full flex items-center gap-4 p-5 bg-background hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="text-accent">{iconMap[cat.icon]}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-semibold text-foreground">{cat.title}</h3>
                  {selectedInCat > 0 && (
                    <span className="text-sm text-accent">{selectedInCat} selected</span>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 grid sm:grid-cols-2 gap-3 animate-fade-slide-in">
                  {cat.topics.map((topic) => {
                    const isSelected = selected.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10 shadow-sm'
                            : 'border-border/40 bg-card hover:border-accent/40'
                        }`}
                      >
                        <h4 className="font-semibold text-foreground text-sm">{topic.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                        {isSelected && (
                          <span className="inline-block mt-2 text-xs text-accent font-medium">✦ Resonates with me</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="pt-4 border-t border-border/40">
          <p className="text-sm text-muted-foreground mb-2">Your selections ({selected.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(id => {
              const topic = worldNeedCategories.flatMap(c => c.topics).find(t => t.id === id);
              return topic ? (
                <Badge key={id} variant="secondary" className="bg-accent/15 text-accent-foreground border-accent/30">
                  {topic.title}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
