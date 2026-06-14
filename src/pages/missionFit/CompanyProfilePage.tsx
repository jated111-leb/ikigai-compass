import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMissionFit } from '@/lib/missionFit/store';
import { synthesizeCompanyProfile } from '@/lib/missionFit/ai';
import { companyQuestions } from '@/data/missionFit/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ApiKeyGate } from '@/components/missionFit/ApiKeyGate';
import { MarkdownLite } from '@/components/missionFit/MarkdownLite';
import { Building2, Sparkles, Loader2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { state, updateCompany } = useMissionFit();
  const company = state.company;
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState(company?.synthesis || '');

  const responses = company?.responses || {};
  const answered = companyQuestions.filter(q => (responses[q.id] || '').trim().length > 0).length;
  const canGenerate = answered >= 3;

  const generate = async () => {
    if (!company) return;
    setGenerating(true);
    setDraft('');
    try {
      const result = await synthesizeCompanyProfile(company, text => setDraft(text));
      updateCompany({ synthesis: result });
      toast.success('Mission Profile generated.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg.includes('API_KEY') ? 'Check your OpenAI key.' : 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-accent mb-2">
        <Building2 className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wide">The soul of your company</span>
      </div>
      <h1 className="font-serif text-3xl text-foreground mb-6">Define your mission</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div>
          <label className="text-sm text-muted-foreground">Company name</label>
          <Input value={company?.companyName || ''} onChange={e => updateCompany({ companyName: e.target.value })} placeholder="Company name" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Your name</label>
          <Input value={company?.founderName || ''} onChange={e => updateCompany({ founderName: e.target.value })} placeholder="Founder name" />
        </div>
      </div>

      <div className="space-y-6">
        {companyQuestions.map((q, i) => (
          <div key={q.id}>
            <label className="block font-medium text-foreground mb-1">
              <span className="text-accent mr-2">{i + 1}.</span>{q.prompt}
            </label>
            {q.guidance && <p className="text-sm text-muted-foreground mb-2">{q.guidance}</p>}
            <textarea
              className="w-full rounded-md border border-input bg-background p-3 text-sm leading-relaxed min-h-[88px] focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder={q.placeholder || 'Take your time…'}
              value={responses[q.id] || ''}
              onChange={e => updateCompany({ responses: { ...responses, [q.id]: e.target.value } })}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <ApiKeyGate>
          <Button onClick={generate} disabled={!canGenerate || generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {company?.synthesis ? 'Regenerate Mission Profile' : 'Generate Mission Profile'}
          </Button>
          {!canGenerate && <p className="text-sm text-muted-foreground">Answer at least 3 questions to generate.</p>}
        </ApiKeyGate>

        {draft && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Mission Profile</span>
              </div>
              <MarkdownLite text={draft} />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => navigate('/mission-fit')}>Back to studio</Button>
        </div>
      </div>
    </div>
  );
}
