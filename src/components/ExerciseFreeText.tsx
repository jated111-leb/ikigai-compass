import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedSave } from "@/lib/store";

interface ExerciseFreeTextProps {
  prompt: string;
  placeholder?: string;
  value: string;
  onSave: (value: string) => void;
}

export function ExerciseFreeText({ prompt, placeholder, value, onSave }: ExerciseFreeTextProps) {
  const [text, setText] = useState(value);
  const debouncedSave = useDebouncedSave(onSave);

  useEffect(() => { setText(value); }, [value]);

  const handleChange = (val: string) => {
    setText(val);
    debouncedSave(val);
  };

  return (
    <div className="space-y-3">
      <label className="block text-lg font-semibold text-foreground font-serif">{prompt}</label>
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[160px] bg-background border-border/60 text-foreground resize-y text-base leading-relaxed focus:border-accent focus:ring-accent/30"
      />
      <p className="text-xs text-muted-foreground">Your response saves automatically.</p>
    </div>
  );
}
