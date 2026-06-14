import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMissionFit, decodePayload, encodePayload } from '@/lib/missionFit/store';
import type { MemberReflection } from '@/lib/missionFit/types';
import { missionFitIntro } from '@/data/missionFit/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Users, Plus, Link2, FileText, Trash2, ClipboardPaste, ArrowRight, Compass,
} from 'lucide-react';

function memberStatus(m: MemberReflection, hasDossier: boolean) {
  if (hasDossier) return { label: 'Dossier ready', tone: 'bg-accent/15 text-accent-foreground' };
  if (m.consentShared) return { label: 'Shared', tone: 'bg-green-500/10 text-green-700 dark:text-green-400' };
  if (Object.keys(m.responses).length > 0) return { label: 'In progress', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' };
  return { label: 'Not started', tone: 'bg-muted text-muted-foreground' };
}

export default function MissionFitPage() {
  const navigate = useNavigate();
  const { state, addMember, removeMember, upsertMember, buildInvite } = useMissionFit();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');

  const company = state.company;
  const missionReady = !!(company && (company.synthesis || company.responses['mission']));

  const handleAdd = () => {
    if (!name.trim()) return;
    addMember(name.trim(), role.trim() || 'Team member');
    setName('');
    setRole('');
  };

  const copyInvite = (memberId: string) => {
    const invite = buildInvite(memberId);
    if (!invite) {
      toast.error('Define your company mission first.');
      return;
    }
    const url = `${window.location.origin}/mission-fit/reflect?d=${encodePayload(invite)}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success('Invite link copied — send it to your teammate.'),
      () => toast.error('Could not copy to clipboard.')
    );
  };

  const handleImport = () => {
    const member = decodePayload<MemberReflection>(importCode);
    if (!member || !member.id || !member.name) {
      toast.error('That reflection code is not valid.');
      return;
    }
    upsertMember({ ...member, consentShared: true });
    setImportCode('');
    setShowImport(false);
    toast.success(`Imported ${member.name}'s reflection.`);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-accent mb-2">
        <Compass className="h-5 w-5" />
        <span className="text-sm font-medium uppercase tracking-wide">{missionFitIntro.title}</span>
      </div>
      <h1 className="font-serif text-3xl text-foreground mb-2">{missionFitIntro.tagline}</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">{missionFitIntro.body}</p>

      {/* Step 1 — Company mission */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-foreground">1 · The soul of your company</h2>
        </div>
        <Card>
          <CardContent className="p-5">
            {missionReady ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-serif text-lg text-foreground">{company!.companyName || 'Your company'}</div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                    {company!.synthesis || company!.responses['mission']}
                  </p>
                  {company!.synthesis ? (
                    <Badge className="mt-3 bg-accent/15 text-accent-foreground">Mission Profile generated</Badge>
                  ) : (
                    <Badge className="mt-3 bg-amber-500/10 text-amber-700 dark:text-amber-400">Draft — not yet synthesized</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/mission-fit/company')}>Edit</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  Define your mission, convictions, and who thrives here — the reference every dossier is built against.
                </p>
                <Button onClick={() => navigate('/mission-fit/company')} className="gap-1.5 shrink-0">
                  Define mission <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Step 2 — Team members */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-foreground">2 · Your people</h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setShowImport(v => !v)}>
            <ClipboardPaste className="h-4 w-4" /> Import a reflection
          </Button>
        </div>

        {showImport && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Paste the reflection code a teammate sent you after they chose to share.
              </p>
              <textarea
                className="w-full rounded-md border border-input bg-background p-2 text-sm font-mono h-24"
                placeholder="Paste reflection code…"
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleImport} disabled={!importCode.trim()}>Import</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {state.members.map(m => {
            const hasDossier = !!state.dossiers[m.id];
            const status = memberStatus(m, hasDossier);
            return (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{m.name}</span>
                      <Badge className={status.tone}>{status.label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{m.role}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" title="Copy invite link" onClick={() => copyInvite(m.id)}>
                      <Link2 className="h-4 w-4" />
                    </Button>
                    {m.consentShared ? (
                      <Button size="sm" variant={hasDossier ? 'outline' : 'default'} className="gap-1.5" onClick={() => navigate(`/mission-fit/dossier/${m.id}`)}>
                        <FileText className="h-4 w-4" /> {hasDossier ? 'View dossier' : 'Generate dossier'}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/mission-fit/member/${m.id}`)}>
                        Open reflection
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-muted-foreground" title="Remove" onClick={() => removeMember(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add member */}
        <Card className="mt-3 border-dashed">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-2">
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <Input placeholder="Role (e.g. Growth Marketing Manager)" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <Button onClick={handleAdd} disabled={!name.trim()} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
