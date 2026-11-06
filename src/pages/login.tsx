import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useSession, signIn, signUp } from '@/lib/auth-client';
import LoadingScreen from '@/components/loading-screen';
import {
  ShieldCheckIcon,
  AnalyticsIcon,
  HeartPulseIcon,
  BookOpenIcon,
} from '@/components/icons';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [isSignUp, setIsSignUp] = useState(mode ? mode === 'signup' : true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (sessionPending) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp.email({
          email,
          password,
          name,
        });
        if (signUpError) throw new Error(signUpError.message || 'Failed to sign up');
        window.location.href = '/dashboard';
      } else {
        const { error: signInError } = await signIn.email({
          email,
          password,
        });
        if (signInError) throw new Error(signInError.message || 'Invalid email or password');
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full lg:h-screen lg:grid lg:grid-cols-12 bg-page text-text-primary font-sans overflow-y-auto lg:overflow-hidden overscroll-contain">
      {/* 60% Left Side - Editorial Brand & Features (Hidden on mobile) */}
      <div className="relative hidden lg:flex col-span-7 flex-col justify-between p-12 lg:p-16 border-r border-border-subtle bg-panel/30">
        <div>
          {/* Brand Mark */}
          <div className="flex items-center gap-3.5 mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panel border border-border-subtle text-accent p-2 shadow-xs">
              <Logo className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight text-text-primary">
                Atten<span className="text-text-primary dark:text-white">-</span>Dance
              </div>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">Because colleges make you dance for attendance.</p>
            </div>
          </div>

          <span className="eyebrow block mb-3">Attendance Tracker</span>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal tracking-tight text-text-primary max-w-xl leading-tight mb-4">
            Stop guessing. Start strategizing your attendance.
          </h1>
          <p className="text-sm text-text-secondary max-w-lg leading-relaxed mb-10">
            Because colleges make you dance for attendance. Take control of your schedule with mathematical clarity. Know exactly when you can safely sleep in, and when you must show up.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-ok-bg text-ok flex items-center justify-center mb-2.5">
                <ShieldCheckIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Safe Skips</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Calculates the exact number of lectures and labs you can miss right now before dropping below target.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-risk-bg text-risk flex items-center justify-center mb-2.5">
                <HeartPulseIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Recovery Planner</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Generates consecutive attendance quotas and balanced combinations to restore good standing.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-chip text-text-primary flex items-center justify-center mb-2.5">
                <AnalyticsIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Deep Analytics</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Inspect subject-by-subject performance, 50/50 split comparisons, and threshold margins.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-panel text-forest-700 dark:text-text-primary flex items-center justify-center mb-2.5 border border-border-subtle">
                <BookOpenIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Verification Logs</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Daily chronologically sorted session records with multi-instance support and holiday notes.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-text-muted">
          Atten-Dance • Local-first privacy architecture
        </div>
      </div>

      {/* 40% Right Side - Authentication Form */}
      <div className="col-span-12 lg:col-span-5 flex flex-col justify-center p-6 sm:p-10 lg:p-12 min-h-[100dvh] lg:h-screen bg-card">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Brand Mark */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel border border-border-subtle text-accent p-1.5 shadow-xs">
              <Logo className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-base text-text-primary tracking-tight">
              Atten<span className="text-text-primary dark:text-white">-</span>Dance
            </span>
          </div>

          <div className="mb-6">
            <span className="eyebrow block mb-1">Access Account</span>
            <h2 className="font-serif text-2xl font-normal text-text-primary">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {isSignUp
                ? 'Register to sync your attendance across all your devices.'
                : 'Enter your credentials to continue tracking your term.'}
            </p>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5 mb-6">
            {isSignUp && (
              <div>
                <label className="eyebrow text-[10px] block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                />
              </div>
            )}

            <div>
              <label className="eyebrow text-[10px] block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@university.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="eyebrow text-[10px] block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-risk font-medium pt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || sessionPending}
              className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Processing…' : (isSignUp ? 'Create an account' : 'Sign In')}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-xs text-text-secondary hover:text-text-primary underline transition-colors"
              >
                {isSignUp ? 'Already registered? Sign in' : "New to Atten-Dance? Create an account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3 text-border-subtle">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="eyebrow text-[10px]">Or</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          {/* Google OAuth */}
          <button
            id="login-google"
            type="button"
            onClick={() => signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
            disabled={sessionPending}
            className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-card px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-panel transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
