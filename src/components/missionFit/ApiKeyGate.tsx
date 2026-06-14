// Inline OpenAI key entry. The key is stored only in the browser
// (localStorage) and used for direct calls to OpenAI — never sent to
// any server of ours. Mirrors the personal journey's key handling.

import { useState } from 'react';
import { hasApiKey, setApiKey } from '@/lib/ai-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound } from 'lucide-react';

export function ApiKeyGate({ onReady, children }: { onReady?: () => void; children?: React.ReactNode }) {
  const [ready, setReady] = useState(hasApiKey());
  const [value, setValue] = useState('');

  if (ready) return <>{children}</>;

  const submit = () => {
    if (!value.trim()) return;
    setApiKey(value.trim());
    setReady(true);
    onReady?.();
  };

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-center gap-2 text-foreground mb-1.5">
        <KeyRound className="h-4 w-4" />
        <span className="font-medium">Connect an OpenAI key to generate</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Your key is stored locally in your browser and is never sent to our servers.
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="sk-…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <Button onClick={submit} disabled={!value.trim()}>Save</Button>
      </div>
    </div>
  );
}
