import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useSession, signIn, signUp, requestPasswordReset } from '@/lib/auth-client';
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

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(mode === 'forgot');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Sync mode query parameter changes if user navigates with ?mode=forgot
  useEffect(() => {
    if (mode === 'forgot') {
      setShowForgotPassword(true);
    }
  }, [mode]);

  // Account collision & linking state
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

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

    const targetEmail = email.toLowerCase().trim();

    try {
      // First check if this email exists and was registered with Google OAuth (no password set yet)
      const checkRes = await fetch('/api/auth-linking/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (checkRes.ok) {
        const statusData = await checkRes.json();
        if (statusData.exists && statusData.hasGoogle && !statusData.hasPassword) {
          // Collision detected! Account was registered via Google OAuth without a password
          setLinkPassword(password);
          setConfirmPassword(password);
          setShowLinkPrompt(true);
          setIsLoading(false);
          return;
        }
      }

      if (isSignUp) {
        const { error: signUpError } = await signUp.email({
          email: targetEmail,
          password,
          name,
        });

        if (signUpError) {
          // If signup fails because user already exists, re-check if they are Google-only
          const recheck = await fetch('/api/auth-linking/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail }),
          }).then((r) => r.json()).catch(() => null);

          if (recheck?.exists && recheck?.hasGoogle && !recheck?.hasPassword) {
            setLinkPassword(password);
            setConfirmPassword(password);
            setShowLinkPrompt(true);
            setIsLoading(false);
            return;
          }

          throw new Error(signUpError.message || 'Failed to sign up');
        }

        window.location.href = '/dashboard';
      } else {
        const { error: signInError } = await signIn.email({
          email: targetEmail,
          password,
        });

        if (signInError) {
          // If sign-in failed, check if it's because this account has Google but no password
          const recheck = await fetch('/api/auth-linking/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail }),
          }).then((r) => r.json()).catch(() => null);

          if (recheck?.exists && recheck?.hasGoogle && !recheck?.hasPassword) {
            setLinkPassword(password);
            setConfirmPassword(password);
            setShowLinkPrompt(true);
            setIsLoading(false);
            return;
          }

          throw new Error(signInError.message || 'Invalid email or password');
        }

        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');

    if (linkPassword.length < 8) {
      setLinkError('Password must be at least 8 characters long');
      return;
    }

    if (linkPassword !== confirmPassword) {
      setLinkError('Passwords do not match');
      return;
    }

    setLinkLoading(true);
    const targetEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth-linking/link-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: linkPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link password');
      }

      // Automatically sign in with the newly linked password
      const { error: signInError } = await signIn.email({
        email: targetEmail,
        password: linkPassword,
      });

      if (signInError) {
        throw new Error(
          signInError.message || 'Password linked! Please sign in using your new password.'
        );
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      setLinkError(err.message);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess(false);

    const targetEmail = (forgotEmail || email).toLowerCase().trim();
    if (!targetEmail) {
      setForgotError('Please enter your email address');
      setForgotLoading(false);
      return;
    }

    try {
      const { error: resetError } = await requestPasswordReset({
        email: targetEmail,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message || 'Failed to send reset email. Please try again.');
      }

      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full lg:h-screen lg:grid lg:grid-cols-12 bg-page text-text-primary font-sans overflow-y-auto lg:overflow-hidden overscroll-contain">
      {/* 60% Left Side - Editorial Brand & Features (Hidden on mobile) */}
      <div className="relative hidden lg:flex col-span-7 flex-col justify-between p-12 lg:p-16 border-r border-border-subtle bg-panel/30">
        <div>
          {/* Brand Mark */}
          <Link to="/" className="inline-flex items-center gap-3.5 mb-12 group transition-opacity hover:opacity-90">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-panel border border-border-subtle text-accent p-2 shadow-xs group-hover:border-forest-600/40 transition-colors">
              <Logo className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight text-text-primary">
                Atten<span className="text-text-primary dark:text-white">-</span>Dance
              </div>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">Because colleges make you dance for attendance.</p>
            </div>
          </Link>

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
          <Link to="/" className="flex lg:hidden items-center gap-2.5 mb-8 group transition-opacity hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel border border-border-subtle text-accent p-1.5 shadow-xs group-hover:border-forest-600/40 transition-colors">
              <Logo className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-base text-text-primary tracking-tight">
              Atten<span className="text-text-primary dark:text-white">-</span>Dance
            </span>
          </Link>

          {showLinkPrompt ? (
            /* Collision Modal / Card: Account created via Google OAuth, prompt to set password */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-950/60 border border-forest-300 dark:border-forest-800 text-forest-800 dark:text-forest-200 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-600 dark:bg-forest-400" />
                  Account Found
                </div>
                <h2 className="font-serif text-2xl font-normal text-text-primary">
                  Link Email Login
                </h2>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  An account with <strong className="text-text-primary">{email}</strong> was created using <strong className="text-text-primary">Google Sign-In</strong>.
                </p>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Set a password below to link email & password credentials to your existing account. No duplicate accounts will be created.
                </p>
              </div>

              <form onSubmit={handleLinkPassword} className="space-y-3.5 mb-6">
                <div>
                  <label className="eyebrow text-[10px] block mb-1">Create Password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="eyebrow text-[10px] block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                </div>

                {linkError && (
                  <p className="text-xs text-risk font-medium pt-1">{linkError}</p>
                )}

                <button
                  type="submit"
                  disabled={linkLoading}
                  className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {linkLoading ? 'Linking Password…' : 'Set Password & Link Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="mb-4 flex items-center gap-3 text-border-subtle">
                <div className="h-px flex-1 bg-border-subtle" />
                <span className="eyebrow text-[10px]">Or</span>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>

              <button
                type="button"
                onClick={() => signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-card px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-panel transition-colors cursor-pointer mb-3"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google instead</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkPrompt(false);
                    setLinkError('');
                    setError('');
                  }}
                  className="text-xs text-text-secondary hover:text-text-primary underline transition-colors cursor-pointer"
                >
                  Cancel & go back
                </button>
              </div>
            </div>
          ) : showForgotPassword ? (
            /* Forgot Password Form */
            <div>
              <div className="mb-6">
                <span className="eyebrow block mb-1">Account Recovery</span>
                <h2 className="font-serif text-2xl font-normal text-text-primary">
                  Reset password
                </h2>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-ok-bg border border-ok/30 text-xs text-text-primary leading-relaxed">
                    <div className="flex items-center gap-2 text-ok font-semibold mb-1">
                      <span className="h-2 w-2 rounded-full bg-ok" />
                      Check your inbox
                    </div>
                    <p className="text-text-secondary">
                      We sent a password reset link to <strong className="text-text-primary">{forgotEmail || email}</strong>. The link is valid for 1 hour.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotError('');
                    }}
                    className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    Return to Sign In
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleForgotPassword}
                      className="text-xs text-text-secondary hover:text-text-primary underline transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? 'Resending…' : "Didn't receive it? Resend email"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5 mb-6">
                  <div>
                    <label className="eyebrow text-[10px] block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={forgotEmail || email}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setEmail(e.target.value);
                      }}
                      className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                    />
                  </div>

                  {forgotError && (
                    <p className="text-xs text-risk font-medium pt-1">{forgotError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {forgotLoading ? 'Sending Reset Link…' : 'Send Reset Link'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotError('');
                        setForgotSuccess(false);
                      }}
                      className="text-xs text-text-secondary hover:text-text-primary underline transition-colors cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Normal Sign-In / Sign-Up Form */
            <div>
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
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="eyebrow text-[10px]">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgotPassword(true);
                          setError('');
                        }}
                        className="text-[11px] text-text-secondary hover:text-text-primary underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
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
                  className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? 'Processing…' : (isSignUp ? 'Create an account' : 'Sign In')}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                    className="text-xs text-text-secondary hover:text-text-primary underline transition-colors cursor-pointer"
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
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-card px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-panel transition-colors disabled:opacity-50 cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}
