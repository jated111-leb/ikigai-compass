import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { isOnboardingComplete } from './OnboardingPage';

const LoginPage = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (user) return <Navigate to={isOnboardingComplete() ? "/journey" : "/onboarding"} replace />;

  const handleGoogle = async () => {
    setSigningIn(true);
    setError('');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setSigningIn(false);
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

        <div className="space-y-4">
          <Button
            type="button"
            variant="hero"
            className="w-full"
            disabled={signingIn}
            onClick={handleGoogle}
          >
            {signingIn ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Connecting...</>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#FFFFFF" d="M21.35 11.1H12v2.92h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.94S8.78 6.24 12 6.24c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.78 3.74 14.6 2.8 12 2.8 6.93 2.8 2.83 6.9 2.83 12s4.1 9.2 9.17 9.2c5.29 0 8.8-3.72 8.8-8.96 0-.6-.07-1.06-.15-1.55z"/>
                </svg>
                Continue with Google
              </span>
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
