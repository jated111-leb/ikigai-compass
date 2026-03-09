import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface AiCoachingPanelProps {
  visible: boolean;
}

export function AiCoachingPanel({ visible }: AiCoachingPanelProps) {
  const [followUp, setFollowUp] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  if (!visible) return null;

  return (
    <div className="bg-ai-bg border border-ai-border rounded-xl p-6 space-y-4 animate-fade-slide-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-breathe" />
        <span className="text-sm font-medium text-muted-foreground">AI Coach</span>
      </div>
      
      <div className="bg-background/60 rounded-lg p-4">
        <p className="text-foreground/80 leading-relaxed">
          AI coaching response will appear here based on your reflection. This space will offer personalized insights, 
          gentle challenges, and deeper questions to help you explore your thoughts further.
        </p>
      </div>

      {showResponse && (
        <div className="bg-background/60 rounded-lg p-4 animate-fade-slide-in">
          <p className="text-foreground/80 leading-relaxed">
            That's a great follow-up question. The AI will provide a thoughtful response here, building on your reflections.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="bg-background"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && followUp.trim()) {
              setShowResponse(true);
              setFollowUp('');
            }
          }}
        />
        <Button
          variant="warm"
          size="icon"
          onClick={() => {
            if (followUp.trim()) {
              setShowResponse(true);
              setFollowUp('');
            }
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
