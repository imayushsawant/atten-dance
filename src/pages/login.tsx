import { useState } from 'react';
import { useSession, signIn, signUp } from '@/lib/auth-client';
import { ShieldCheck, BarChart3, HeartPulse, History } from 'lucide-react';
import Logo from '@/assets/Logo.svg';

export default function LoginPage() {
  const { data: session, isPending: sessionPending } = useSession();
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  if (session && !sessionPending) {
    window.location.href = '/';
    return null;
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
        window.location.href = '/';
      } else {
        const { error: signInError } = await signIn.email({
          email,
          password,
        });
        if (signInError) throw new Error(signInError.message || 'Invalid email or password');
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full lg:grid lg:grid-cols-10 bg-background overflow-hidden">

      {/* 70% Left Side - Marketing & Features (Hidden on small screens) */}
      <div className="relative hidden lg:flex col-span-7 flex-col justify-center p-6 lg:p-8 xl:p-10 overflow-hidden border-r border-border/50">
        
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-0 right-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto my-auto flex flex-col justify-center h-full max-h-[750px]">
          <div className="flex items-center gap-4 mb-4 xl:mb-5">
            <div className="flex h-14 w-14 xl:h-16 xl:w-16 items-center justify-center rounded-2xl bg-primary/20 glow-primary p-2.5 floating-panel">
              <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-foreground">
              Atten-Dance
            </h1>
          </div>

          <h2 className="text-2xl xl:text-4xl font-black tracking-tight mb-2 xl:mb-3 text-gradient leading-tight">
            Stop guessing. <br />
            Start strategizing your attendance.
          </h2>
          
          <p className="text-sm xl:text-base text-muted-foreground max-w-2xl mb-6 xl:mb-8 leading-relaxed">
            Because colleges make you dance for attendance. Take back control of your schedule with algorithmic precision. Know exactly when you can safely sleep in, and when you absolutely must show up.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 xl:gap-5">
            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm xl:text-base font-bold text-foreground mb-1">Safe Skips</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Calculates the exact number of lectures and labs you can bunk right now without ever dropping below your threshold.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-danger">
              <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center mb-3 border border-danger/20">
                <HeartPulse className="h-5 w-5 text-danger" />
              </div>
              <h3 className="text-sm xl:text-base font-bold text-foreground mb-1">Recovery Planner</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Currently in the danger zone? We'll generate combinations of consecutive sessions you need to attend to bounce back.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center mb-3 border border-chart-1/20">
                <BarChart3 className="h-5 w-5 text-chart-1" />
              </div>
              <h3 className="text-sm xl:text-base font-bold text-foreground mb-1">Deep Analytics</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Visualize your attendance habits over time with stunning, interactive charts. Spot trends before they become problems.
              </p>
            </div>

            <div className="glass rounded-xl p-4 xl:p-5 transition-all hover:-translate-y-1 hover:glow-primary">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center mb-3 border border-chart-4/20">
                <History className="h-5 w-5 text-chart-4" />
              </div>
              <h3 className="text-sm xl:text-base font-bold text-foreground mb-1">Subject-wise Records</h3>
              <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
                Detailed logs for every subject. Prove your teachers wrong when they incorrectly claim you were absent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 30% Right Side - Login Panel */}
      <div className="col-span-12 lg:col-span-3 flex flex-col justify-center p-6 md:p-8 lg:p-6 bg-card relative z-20 shadow-2xl h-screen overflow-hidden">
        
        <div className="w-full max-w-sm mx-auto my-auto flex flex-col justify-center h-full max-h-[600px]">
          {/* Mobile Logo (Only visible on small screens) */}
          <div className="flex lg:hidden flex-col items-center text-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 glow-primary p-2.5">
              <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gradient mb-1.5">
                Atten-Dance
              </h1>
              <p className="text-xs text-muted-foreground">
                Because colleges make you dance for attendance.
              </p>
            </div>
          </div>

          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl font-bold text-foreground">Welcome to Atten-Dance</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sign in to sync your attendance data across all your devices.
            </p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3 mb-6">
            {isSignUp && (
              <div>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            )}
            <div>
              <input 
                type="email" 
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {error && <p className="text-xs text-danger font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || sessionPending}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:glow-primary disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
            
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
             <div className="h-px flex-1 bg-border" />
             <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Or</span>
             <div className="h-px flex-1 bg-border" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              id="login-google"
              type="button"
              onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
              disabled={sessionPending}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/40 hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="transition-colors group-hover:text-primary">Continue with Google</span>
            </button>
          </div>

          <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground/60">
            By continuing, you agree to our Terms of Service and Privacy Policy. <br />
            We only request your name and email address.
          </p>
        </div>

      </div>
    </div>
  );
}
