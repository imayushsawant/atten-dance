import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { resetPassword } from '@/lib/auth-client';
import {
  ShieldCheckIcon,
  AnalyticsIcon,
  HeartPulseIcon,
  BookOpenIcon,
} from '@/components/icons';
import { Logo } from '@/components/logo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isInvalidToken = !!errorParam || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        throw new Error(error.message || 'Failed to reset password. The link may have expired.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password');
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
              <p className="text-sm text-text-muted mt-1 leading-relaxed">
                Because colleges make you dance for attendance.
              </p>
            </div>
          </div>

          <span className="eyebrow block mb-3">Security & Account</span>
          <h1 className="font-serif text-4xl lg:text-5xl font-normal tracking-tight text-text-primary max-w-xl leading-tight mb-4">
            Protect your academic records with robust security.
          </h1>
          <p className="text-sm text-text-secondary max-w-lg leading-relaxed mb-10">
            Set a new secure password to regain access to your attendance logs, safe skip calculations, and recovery quotas.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-ok-bg text-ok flex items-center justify-center mb-2.5">
                <ShieldCheckIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Encrypted Sessions</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                All attendance calculations and sync data are cryptographically bound to your authenticated account.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-risk-bg text-risk flex items-center justify-center mb-2.5">
                <HeartPulseIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">One-Time Security Token</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Reset links are single-use and expire within 60 minutes to prevent unauthorized account access.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-chip text-text-primary flex items-center justify-center mb-2.5">
                <AnalyticsIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Automatic Revocation</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Previous active sessions can be re-authenticated seamlessly with your updated credentials.
              </p>
            </div>

            <div className="ledger-card p-4">
              <div className="h-9 w-9 rounded-lg bg-panel text-forest-700 dark:text-text-primary flex items-center justify-center mb-2.5 border border-border-subtle">
                <BookOpenIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-text-primary mb-1">Continuous Backups</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your historical term archives and lecture tallies remain intact across all password updates.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-text-muted">
          Atten-Dance • Local-first privacy architecture
        </div>
      </div>

      {/* 40% Right Side - Reset Password Card */}
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

          {isInvalidToken ? (
            /* Expired or Missing Token State */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-risk-bg border border-risk/30 text-risk text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-risk" />
                  Link Expired or Invalid
                </div>
                <h2 className="font-serif text-2xl font-normal text-text-primary">
                  Password Reset Expired
                </h2>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  This password reset link is invalid or has expired. For your security, reset links are single-use and expire after 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/login?mode=forgot')}
                  className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity cursor-pointer text-center"
                >
                  Request a New Reset Link
                </button>

                <Link
                  to="/login"
                  className="block w-full text-center rounded-md border border-border-strong bg-card px-4 py-2.5 text-xs font-medium text-text-primary hover:bg-panel transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Password Reset Success State */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ok-bg border border-ok/30 text-ok text-[10px] font-semibold uppercase tracking-wider mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Password Updated
                </div>
                <h2 className="font-serif text-2xl font-normal text-text-primary">
                  All set!
                </h2>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Your password has been successfully reset. You can now sign in using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity cursor-pointer"
              >
                Sign In With New Password
              </button>
            </div>
          ) : (
            /* New Password Form */
            <div>
              <div className="mb-6">
                <span className="eyebrow block mb-1">Set New Password</span>
                <h2 className="font-serif text-2xl font-normal text-text-primary">
                  Create new password
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Choose a secure password of at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 mb-6">
                <div>
                  <label className="eyebrow text-[10px] block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="eyebrow text-[10px] block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-border-strong bg-card px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-forest-800 dark:focus:border-accent transition-colors"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-risk font-medium pt-1">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? 'Resetting Password…' : 'Reset Password'}
                </button>
              </form>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-text-secondary hover:text-text-primary underline transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

