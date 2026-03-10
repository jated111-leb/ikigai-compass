import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (user) return <Navigate to="/journey" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error } = await signIn(email.trim());
    setSending(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex justify-center">
          <Logo size="lg" showText={false} />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to begin or continue your Ikigai journey
          </p>
        </div>

        {sent ? (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 space-y-3">
            <CheckCircle className="h-10 w-10 text-accent mx-auto" />
            <h2 className="font-serif font-semibold text-lg text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong className="text-foreground">{email}</strong>. Click it to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm text-accent underline underline-offset-4 hover:opacity-80"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="hero" className="w-full" disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
