import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useMissionFit, decodePayload, encodePayload } from '@/lib/missionFit/store';
import type { MemberReflection, MissionInvite } from '@/lib/missionFit/types';
import { memberQuestions, consentCopy } from '@/data/missionFit/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Compass, Lock, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

type Phase = 'reflect' | 'consent' | 'done';

export default function MemberReflectionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const { getMember, updateMember, buildInvite } = useMissionFit();

  // Two modes: store-backed (founder's device, has :id) or standalone invite (?d=)
  const storeMember = id ? getMember(id) : undefined;
  const invite: MissionInvite | null = useMemo(() => {
    const code = params.get('d');
    if (code) return decodePayload<MissionInvite>(code);
    if (id) return buildInvite(id);
    return null;
  }, [params, id, buildInvite]);

  const [responses, setResponses] = useState<Record<string, string>>(storeMember?.responses || {});
  const [phase, setPhase] = useState<Phase>('reflect');
  const [agreed, setAgreed] = useState(false);
  const [shareCode, setShareCode] = useState('');

  if (!invite) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-2xl text-foreground mb-2">Reflection unavailable</h1>
        <p className="text-muted-foreground">This invite link is invalid, or the company mission hasn’t been set up yet.</p>
      </div>
    );
  }

  const answered = memberQuestions.filter(q => (responses[q.id] || '').trim().length > 0).length;
  const canContinue = answered >= 4;

  const setAnswer = (qid: string, value: string) => {
    const next = { ...responses, [qid]: value };
    setResponses(next);
    if (id && storeMember) updateMember(id, { responses: next });
  };

  const confirmShare = () => {
    const now = new Date().toISOString();
    if (id && storeMember) {
      updateMember(id, { responses, consentShared: true, completedAt: now });
      toast.success('Reflection shared.');
      navigate('/mission-fit');
      return;
    }
    // Standalone invite: produce a portable share code for the founder to import.
    const member: MemberReflection = {
      id: invite.memberId,
      name: invite.memberName,
      role: invite.role,
      responses,
      consentShared: true,
      completedAt: now,
      updatedAt: now,
    };
    setShareCode(encodePayload(member));
    setPhase('done');
  };

  // ── Done screen (standalone invite) ──
  if (phase === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-green-600 mb-3">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Thank you, {invite.memberName.split(' ')[0]}.</span>
        </div>
        <h1 className="font-serif text-2xl text-foreground mb-3">Your reflection is ready to share</h1>
        <p className="text-muted-foreground mb-4">
          Copy the code below and send it to {invite.founderName || 'the founder'}. They’ll use it to generate a
          conversation guide with you. Only what you wrote here is included.
        </p>
        <textarea readOnly value={shareCode} className="w-full h-32 rounded-md border border-input bg-muted/40 p-3 text-xs font-mono" />
        <Button
          className="mt-3 gap-2"
          onClick={() => navigator.clipboard.writeText(shareCode).then(() => toast.success('Code copied.'))}
        >
          <Copy className="h-4 w-4" /> Copy code
        </Button>
      </div>
    );
  }

  // ── Consent gate ──
  if (phase === 'consent') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 text-accent mb-3">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">{consentCopy.title}</span>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {consentCopy.body.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{consentCopy.privateNote}</span>
            </div>
            <label className="flex items-center gap-3 pt-2 cursor-pointer">
              <Checkbox checked={agreed} onCheckedChange={v => setAgreed(!!v)} />
              <span className="text-foreground">{consentCopy.agree}</span>
            </label>
          </CardContent>
        </Card>
        <div className="flex justify-between mt-4">
          <Button variant="ghost" onClick={() => setPhase('reflect')}>Back</Button>
          <Button disabled={!agreed} onClick={confirmShare}>Share my reflection</Button>
        </div>
      </div>
    );
  }

  // ── Reflection ──
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-accent mb-2">
        <Compass className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wide">Mission reflection</span>
      </div>
      <h1 className="font-serif text-3xl text-foreground mb-2">
        {invite.memberName ? `${invite.memberName.split(' ')[0]}, what moves you?` : 'What moves you?'}
      </h1>
      <p className="text-muted-foreground mb-6">
        A short reflection on what you care about — for a mutual fit check with {invite.companyName || 'the team'}.
        There are no scores. Be honest; that’s what makes it useful.
      </p>

      {invite.mission && (
        <Card className="mb-8 bg-accent/5 border-accent/30">
          <CardContent className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-accent mb-1">
              The mission you’re reflecting on
            </div>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{invite.mission}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {memberQuestions.map((q, i) => (
          <div key={q.id}>
            <label className="block font-medium text-foreground mb-1">
              <span className="text-accent mr-2">{i + 1}.</span>{q.prompt}
            </label>
            {q.guidance && <p className="text-sm text-muted-foreground mb-2">{q.guidance}</p>}
            <textarea
              className="w-full rounded-md border border-input bg-background p-3 text-sm leading-relaxed min-h-[88px] focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Take your time…"
              value={responses[q.id] || ''}
              onChange={e => setAnswer(q.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <span className="text-sm text-muted-foreground">{answered} of {memberQuestions.length} answered</span>
        <Button disabled={!canContinue} onClick={() => setPhase('consent')}>Continue</Button>
      </div>
      {!canContinue && (
        <p className="text-sm text-muted-foreground mt-2 text-right">Answer at least 4 to continue.</p>
      )}
    </div>
  );
}
