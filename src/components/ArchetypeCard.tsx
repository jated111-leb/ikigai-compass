import { useState } from "react";
import * as Icons from "lucide-react";
import type { Archetype } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ArchetypeCardProps {
  archetype: Archetype;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ArchetypeCard({ archetype, isSelected, onSelect }: ArchetypeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const IconComp = (Icons as any)[archetype.icon] || Icons.Circle;

  return (
    <div
      className={`text-left rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-accent bg-accent/10 shadow-sm'
          : 'border-border/40 bg-card hover:border-accent/40'
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full text-left p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'
          }`}>
            <IconComp className="h-5 w-5" />
          </div>
          <h3 className="font-serif font-semibold text-foreground">{archetype.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{archetype.description}</p>
      </button>

      <div className="px-5 pb-2">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
        >
          {expanded ? 'Less' : 'Learn more'}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 animate-fade-slide-in border-t border-border/30 pt-4">
          <p className="text-sm text-foreground/80 leading-relaxed">{archetype.fullDescription}</p>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Strengths</h4>
            <ul className="space-y-1">
              {archetype.strengths.map((s, i) => (
                <li key={i} className="text-sm text-foreground/75 flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>{s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">World Contribution</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{archetype.worldContribution}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Do These Sound Like You?</h4>
            <ul className="space-y-2">
              {archetype.signalQuestions.map((q, i) => (
                <li key={i} className="text-sm text-foreground/70 italic">"  {q}"</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
