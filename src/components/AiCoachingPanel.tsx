import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Key, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney } from "@/lib/store";
import {
  streamCoachingResponse,
  streamFollowUpResponse,
  hasApiKey,
  setApiKey,
  buildCrossModuleContext,
  type CoachingContext,
} from "@/lib/ai-service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiCoachingPanelProps {
  moduleId: number;
  exercisePrompt: string;
  exerciseGuidance?: string;
  followUpPrompt?: string;
  userResponse: string;
}

export function AiCoachingPanel({
  moduleId,
  exercisePrompt,
  exerciseGuidance,
  followUpPrompt,
  userResponse,
}: AiCoachingPanelProps) {
  const { user } = useAuth();
  const { state } = useJourney(user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [started, setStarted] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build coaching context
  const buildContext = useCallback((): CoachingContext => {
    // Gather previous responses from this module
    const modData = state.modules[String(moduleId)];
    const previousResponses: { prompt: string; response: string }[] = [];
    if (modData?.exercises) {
      for (const [, ex] of Object.entries(modData.exercises)) {
        const exercise = ex as any;
        if (exercise.response && exercise.prompt !== exercisePrompt) {
          previousResponses.push({
            prompt: exercise.prompt,
            response: exercise.response,
          });
        }
      }
    }

    const crossModuleContext = buildCrossModuleContext(
      state.modules,
      moduleId
    );

    return {
      moduleId,
      exercisePrompt,
      exerciseGuidance,
      followUpPrompt,
      userResponse,
      previousResponses,
      crossModuleContext,
    };
  }, [
    moduleId,
    exercisePrompt,
    exerciseGuidance,
    followUpPrompt,
    userResponse,
    state.modules,
  ]);

  // Generate initial coaching response
  const handleStart = useCallback(async () => {
    if (!hasApiKey()) {
      setShowApiKeyForm(true);
      setStarted(true);
      return;
    }

    setStarted(true);
    setMessages([]);
    setStreaming(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const context = buildContext();
      const fullText = await streamCoachingResponse(
        context,
        (text) => {
          setMessages([{ role: "assistant", content: text }]);
        },
        controller.signal
      );
      setMessages([{ role: "assistant", content: fullText }]);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      if (err.message === "NO_API_KEY") {
        setShowApiKeyForm(true);
      } else if (err.message === "INVALID_API_KEY") {
        setError(
          "Invalid API key. Please check your key and try again."
        );
        setShowApiKeyForm(true);
      } else {
        setError(err.message || "Failed to get coaching response. Please try again.");
      }
    } finally {
      setStreaming(false);
    }
  }, [buildContext]);

  // Handle follow-up question
  const handleFollowUp = useCallback(async () => {
    if (!followUp.trim() || streaming) return;

    const question = followUp;
    setFollowUp("");
    setStreaming(true);
    setError(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(newMessages);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const context = buildContext();
      const fullText = await streamFollowUpResponse(
        context,
        newMessages,
        question,
        (text) => {
          setMessages([
            ...newMessages,
            { role: "assistant", content: text },
          ]);
        },
        controller.signal
      );
      setMessages([
        ...newMessages,
        { role: "assistant", content: fullText },
      ]);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setStreaming(false);
    }
  }, [followUp, streaming, messages, buildContext]);

  // Save API key and retry
  const handleSaveApiKey = useCallback(() => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setApiKeyInput("");
      setShowApiKeyForm(false);
      setError(null);
      // Trigger coaching after saving key
      setTimeout(() => handleStart(), 100);
    }
  }, [apiKeyInput, handleStart]);

  // Don't show anything if user hasn't typed enough
  if (!userResponse || userResponse.trim().length < 10) return null;

  // Show "Get AI Coaching" button before started
  if (!started) {
    return (
      <div className="pt-4">
        <Button
          variant="warm"
          size="sm"
          onClick={handleStart}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Get AI Coaching
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-ai-bg border border-ai-border rounded-xl p-6 space-y-4 animate-fade-slide-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-breathe" />
        <span className="text-sm font-medium text-muted-foreground">
          AI Coach
        </span>
      </div>

      {/* API Key Form */}
      {showApiKeyForm && (
        <div className="bg-background/60 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Key className="h-4 w-4" />
            <span>Enter your OpenAI API key to enable AI coaching</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveApiKey();
              }}
            />
            <Button variant="warm" size="sm" onClick={handleSaveApiKey}>
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your key is stored locally in your browser and never sent to our
            servers.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={handleStart}
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Loading state (before first chunk arrives) */}
      {streaming && messages.length === 0 && (
        <div className="bg-background/60 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
          <span className="text-sm text-muted-foreground italic">
            Reflecting on your response...
          </span>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`rounded-lg p-4 ${
            msg.role === "assistant"
              ? "bg-background/60"
              : "bg-accent/10 border border-accent/20"
          }`}
        >
          {msg.role === "user" && (
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              Your question:
            </p>
          )}
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {msg.content}
            {streaming && i === messages.length - 1 && msg.role === "assistant" && (
              <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </p>
        </div>
      ))}

      <div ref={messagesEndRef} />

      {/* Follow-up input */}
      {messages.length > 0 && !showApiKeyForm && (
        <div className="flex gap-2">
          <Input
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="bg-background"
            disabled={streaming}
            onKeyDown={(e) => {
              if (e.key === "Enter" && followUp.trim()) {
                handleFollowUp();
              }
            }}
          />
          <Button
            variant="warm"
            size="icon"
            onClick={handleFollowUp}
            disabled={streaming || !followUp.trim()}
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
