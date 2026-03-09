import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TimelineEvent } from "@/lib/types";
import { Plus, X } from "lucide-react";

interface ExerciseTimelineProps {
  events: TimelineEvent[];
  onSave: (events: TimelineEvent[]) => void;
}

const emotionalColors = {
  positive: 'border-module-completed bg-module-completed/10',
  negative: 'border-destructive bg-destructive/10',
  transformative: 'border-accent bg-accent/10',
};

const emotionalLabels = {
  positive: '✦ Positive',
  negative: '✦ Negative',
  transformative: '✦ Transformative',
};

export function ExerciseTimeline({ events, onSave }: ExerciseTimelineProps) {
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [emotional, setEmotional] = useState<'positive' | 'negative' | 'transformative'>('positive');

  const addEvent = () => {
    if (!year.trim() || !description.trim()) return;
    const newEvent: TimelineEvent = { id: Date.now().toString(), year: year.trim(), description: description.trim(), emotional };
    onSave([...events, newEvent].sort((a, b) => a.year.localeCompare(b.year)));
    setYear('');
    setDescription('');
  };

  const removeEvent = (id: string) => {
    onSave(events.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <label className="block text-lg font-semibold text-foreground font-serif">Add the defining moments of your life:</label>
      
      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year or age"
          className="sm:w-28 bg-background"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened?"
          className="flex-1 bg-background"
          onKeyDown={(e) => e.key === 'Enter' && addEvent()}
        />
        <Select value={emotional} onValueChange={(v) => setEmotional(v as typeof emotional)}>
          <SelectTrigger className="sm:w-44 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
            <SelectItem value="transformative">Transformative</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={addEvent} variant="warm" size="icon" className="flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline */}
      {events.length > 0 && (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className={`relative pl-6 p-4 rounded-lg border-l-4 ${emotionalColors[event.emotional]} animate-fade-slide-in`}>
                <div className="absolute -left-[1.65rem] top-5 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-accent">{event.year}</span>
                    <p className="text-foreground mt-1">{event.description}</p>
                    <span className="text-xs text-muted-foreground mt-1 inline-block">{emotionalLabels[event.emotional]}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => removeEvent(event.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="text-muted-foreground text-center py-8 italic">Add your first life event above to begin building your timeline.</p>
      )}
    </div>
  );
}
