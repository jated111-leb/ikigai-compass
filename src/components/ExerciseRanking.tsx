import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ExerciseRankingProps {
  prompt: string;
  options: string[];
  order: string[];
  onSave: (order: string[]) => void;
}

export function ExerciseRanking({ prompt, options, order, onSave }: ExerciseRankingProps) {
  const items = order.length === options.length ? order : options;

  const move = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const target = index + direction;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    onSave(newItems);
  };

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-foreground font-serif">{prompt}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background"
          >
            <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {i + 1}
            </span>
            <span className="flex-1 text-foreground">{item}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
