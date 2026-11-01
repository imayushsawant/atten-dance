import { NavLink, Link, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard,
  PenLine,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  HeartPulse,
  Settings,
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  History as HistoryIcon,
  LogOut,
  Wand2,
  Clock,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';
import { useSession, signOut } from '@/lib/auth-client';
import Logo from '@/assets/Logo.svg';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input', icon: PenLine, label: 'Log Attendance' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/safe-skips', icon: ShieldCheck, label: 'Safe Skips' },
  { to: '/recovery', icon: HeartPulse, label: 'Recovery' },
  { to: '/history', icon: HistoryIcon, label: 'History' },
  { to: '/predictor', icon: Wand2, label: 'Predictor' },
  { to: '/time-window', icon: Clock, label: 'Time Window' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Close sidebar on route change (mobile) & smoothly reset scroll
  useEffect(() => {
    setSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  function cycleTheme() {
    const order: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  return (
    <div className="flex h-screen overflow-hidden bg-background p-0 lg:p-4">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card transition-transform duration-300 lg:relative lg:translate-x-0 lg:rounded-2xl lg:border lg:border-border lg:shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex h-20 items-center gap-3 border-b border-border/50 px-6 hover:bg-secondary/50 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 glow-primary p-2">
            <img src={Logo} alt="Atten-Dance Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              Atten-Dance
            </h1>
            <p className="text-[10px] leading-tight text-muted-foreground mt-0.5 opacity-80 max-w-[140px]">
              Because colleges make you dance for attendance
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary glow-primary border border-primary/20 shadow-sm'
                    : 'text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Semester selector link */}
        <div className="border-t border-border/50 p-3 space-y-2">
          <NavLink
            to="/semesters"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary glow-primary border border-primary/20'
                  : 'text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <GraduationCap className="h-4.5 w-4.5" />
            <span>Semesters</span>
          </NavLink>

          {/* User profile & logout */}
          <UserFooter onLoggingOut={() => setIsLoggingOut(true)} />
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-4">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-base font-bold text-primary">Atten-Dance</span>
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-all"
            title={`Current: ${themeLabel}. Click to switch.`}
          >
            <ThemeIcon className="h-3.5 w-3.5" />
            <span>{themeLabel}</span>
          </button>
        </header>

        {/* Page content with smooth route transition */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="animate-fade-in p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        {isLoggingOut && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-2xl border border-border">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-lg font-semibold tracking-tight">Logging out...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserFooter({ onLoggingOut }: { onLoggingOut: () => void }) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const user = session.user;
  const initials = (user.name || user.email || '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mt-2 border-t border-border/50 pt-3">
      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="h-8 w-8 rounded-full border border-border object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
        </div>
        <button
          onClick={async () => {
            onLoggingOut();
            await signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } });
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
