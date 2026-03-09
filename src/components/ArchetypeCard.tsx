import * as Icons from "lucide-react";
import type { Archetype } from "@/lib/types";

interface ArchetypeCardProps {
  archetype: Archetype;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ArchetypeCard({ archetype, isSelected, onSelect }: ArchetypeCardProps) {
  const IconComp = (Icons as any)[archetype.icon] || Icons.Circle;

  return (
    <button
      onClick={onSelect}
      className={`text-left p-5 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-accent bg-accent/10 shadow-sm'
          : 'border-border/40 bg-card hover:border-accent/40'
      }`}
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
  );
}
