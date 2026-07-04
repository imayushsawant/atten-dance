import { useSession, signIn } from '@/lib/auth-client';
import Logo from '@/assets/Logo.svg';

export default function LoginPage() {
  const { data: session, isPending } = useSession();

  // If already logged in, redirect
  if (session && !isPending) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Logo & Branding */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 glow-primary p-3 floating-panel">
              <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gradient">
                Atten-Dance
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Because colleges make you dance for attendance. Track, analyze, and never get caught off-guard.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              id="login-google"
              onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
              disabled={isPending}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google icon */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="transition-colors group-hover:text-primary">Sign in with Google</span>
            </button>

            <button
              id="login-github"
              onClick={() => signIn.social({ provider: 'github', callbackURL: '/' })}
              disabled={isPending}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* GitHub icon */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="transition-colors group-hover:text-primary">Sign in with GitHub</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            Your attendance data is private and secure. We only access your name and email from your account.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/40">
            MIT — do whatever you want with it. Just don't bunk too many classes.
          </p>
        </div>
      </div>
    </div>
  );
}
