import { Checkbox } from "@/components/ui/checkbox";

interface ExerciseMultiSelectProps {
  prompt: string;
  options: string[];
  selected: string[];
  onSave: (selected: string[]) => void;
}

export function ExerciseMultiSelect({ prompt, options, selected, onSave }: ExerciseMultiSelectProps) {
  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option];
    onSave(next);
  };

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-foreground font-serif">{prompt}</label>
      <div className="grid gap-3">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              selected.includes(option)
                ? 'border-accent bg-accent/10'
                : 'border-border/60 bg-background hover:border-accent/40'
            }`}
          >
            <Checkbox
              checked={selected.includes(option)}
              onCheckedChange={() => toggle(option)}
              className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <span className="text-foreground">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
