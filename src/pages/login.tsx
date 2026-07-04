import { useSession, signIn } from '@/lib/auth-client';
import { ShieldCheck, BarChart3, HeartPulse, Sparkles } from 'lucide-react';
import Logo from '@/assets/Logo.svg';

export default function LoginPage() {
  const { data: session, isPending } = useSession();

  // If already logged in, redirect
  if (session && !isPending) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="h-screen w-full lg:grid lg:grid-cols-10 bg-background overflow-hidden">
      
      {/* 70% Left Side - Marketing & Features (Hidden on small screens) */}
      <div className="relative hidden lg:flex col-span-7 flex-col justify-center p-8 lg:p-12 xl:p-16 overflow-y-auto border-r border-border/50">
        
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto my-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 glow-primary p-2 floating-panel">
              <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Atten-Dance
            </h1>
          </div>

          <h2 className="text-3xl xl:text-5xl font-black tracking-tight mb-4 text-gradient leading-tight">
            Stop guessing. <br />
            Start strategizing your attendance.
          </h2>
          
          <p className="text-base xl:text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Because colleges make you dance for attendance. Take back control of your schedule with algorithmic precision. Know exactly when you can safely sleep in, and when you absolutely must show up.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 xl:gap-6">
            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">Safe Skips Calculator</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Calculates the exact number of lectures and labs you can bunk right now without ever dropping below your threshold.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-danger">
              <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center mb-3 border border-danger/20">
                <HeartPulse className="h-5 w-5 text-danger" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">Recovery Planner</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Currently in the danger zone? We'll generate combinations of consecutive sessions you need to attend to bounce back.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center mb-3 border border-chart-1/20">
                <BarChart3 className="h-5 w-5 text-chart-1" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">Deep Analytics</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Visualize your attendance habits over time with stunning, interactive charts. Spot trends before they become problems.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center mb-3 border border-chart-4/20">
                <Sparkles className="h-5 w-5 text-chart-4" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">Premium Experience</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Built with a buttery smooth glassmorphism dark-mode interface. Staring at low attendance shouldn't hurt your eyes too.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 30% Right Side - Login Panel */}
      <div className="col-span-12 lg:col-span-3 flex flex-col justify-center p-6 md:p-10 lg:p-8 bg-card relative z-20 shadow-2xl h-screen overflow-y-auto">
        
        <div className="w-full max-w-sm mx-auto my-auto">
          {/* Mobile Logo (Only visible on small screens) */}
          <div className="flex lg:hidden flex-col items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 glow-primary p-3">
              <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gradient">
              Atten-Dance
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-xs xl:text-sm text-muted-foreground">
              Sign in to sync your attendance data across all your devices.
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              id="login-google"
              onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
              disabled={isPending}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/40 hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="transition-colors group-hover:text-primary">Continue with Google</span>
            </button>

            <button
              id="login-github"
              onClick={() => signIn.social({ provider: 'github', callbackURL: '/' })}
              disabled={isPending}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/40 hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* GitHub icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="transition-colors group-hover:text-primary">Continue with GitHub</span>
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] xl:text-xs leading-relaxed text-muted-foreground/60">
            By continuing, you agree to our Terms of Service and Privacy Policy. <br />
            We only request your name and email address.
          </p>
        </div>

      </div>
    </div>
  );
}
