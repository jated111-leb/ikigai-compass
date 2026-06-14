import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useMissionFit } from '@/lib/missionFit/store';
import { generateDossier } from '@/lib/missionFit/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ApiKeyGate } from '@/components/missionFit/ApiKeyGate';
import { MarkdownLite } from '@/components/missionFit/MarkdownLite';
import { FileText, Loader2, Printer, Sparkles } from 'lucide-react';

export default function DossierPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, getMember, saveDossier } = useMissionFit();
  const member = id ? getMember(id) : undefined;
  const company = state.company;
  const existing = id ? state.dossiers[id] : undefined;

  const [content, setContent] = useState(existing?.content || '');
  const [generating, setGenerating] = useState(false);
  const startedRef = useRef(false);

  const run = async () => {
    if (!company || !member) return;
    setGenerating(true);
    setContent('');
    try {
      const result = await generateDossier(company, member, text => setContent(text));
      saveDossier({ memberId: member.id, content: result, generatedAt: new Date().toISOString() });
      toast.success('Dossier ready.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg.includes('API_KEY') ? 'Check your OpenAI key.' : 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate the first time if shared but no dossier yet and a key exists.
  useEffect(() => {
    if (startedRef.current) return;
    if (existing || !member?.consentShared || !company) return;
    startedRef.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!member || !company) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-2xl text-foreground mb-2">Dossier unavailable</h1>
        <p className="text-muted-foreground mb-4">This member or the company mission could not be found.</p>
        <Button variant="outline" onClick={() => navigate('/mission-fit')}>Back to studio</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2 text-accent">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Mission Alignment Dossier</span>
        </div>
        <div className="flex gap-2">
          {content && !generating && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate('/mission-fit')}>Studio</Button>
        </div>
      </div>

      <div className="mb-1 font-serif text-3xl text-foreground">{member.name}</div>
      <div className="text-muted-foreground mb-2">
        {member.role} · {company.companyName || 'Company'}
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-xl">
        A conversation guide, not a verdict. There is no score. Use it to have the most honest conversation the two
        of you can — about where you meet, where you differ, and whether this mission fits.
      </p>

      <ApiKeyGate onReady={run}>
        {!content && !generating && (
          <Button onClick={run} className="gap-2">
            <Sparkles className="h-4 w-4" /> Generate dossier
          </Button>
        )}
      </ApiKeyGate>

      {generating && !content && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reflecting on the alignment…
        </div>
      )}

      {content && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <MarkdownLite text={content} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
