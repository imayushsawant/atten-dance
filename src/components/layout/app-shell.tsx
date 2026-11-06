import { NavLink, Link, Outlet, useLocation } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import {
  DashboardIcon,
  PenLineIcon,
  CalendarIcon,
  AnalyticsIcon,
  ShieldCheckIcon,
  HeartPulseIcon,
  HistoryIcon,
  CalculatorIcon,
  TimeWindowIcon,
  SemestersIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
  LogoutIcon,
  SunIcon,
  MoonIcon,
  MoreHorizontalIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { useSession, signOut } from '@/lib/auth-client';
import { useTheme } from '@/lib/theme-provider';
import { api } from '@/lib/api';
import type { Semester } from '@/lib/api';
import { Logo } from '@/components/logo';

const workspaceNavItems = [
  { to: '/', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/input', icon: PenLineIcon, label: 'Log Attendance' },
  { to: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { to: '/analytics', icon: AnalyticsIcon, label: 'Analytics' },
  { to: '/safe-skips', icon: ShieldCheckIcon, label: 'Safe Skips' },
  { to: '/recovery', icon: HeartPulseIcon, label: 'Recovery' },
  { to: '/history', icon: HistoryIcon, label: 'History' },
  { to: '/predictor', icon: CalculatorIcon, label: 'Predictor' },
  { to: '/time-window', icon: TimeWindowIcon, label: 'Time Window' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { resolved, setTheme } = useTheme();

  // Close sidebar on route change & smoothly reset scroll
  useEffect(() => {
    setSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Load active semester for sidebar & header pills
  useEffect(() => {
    api.semesters.getActive()
      .then((sem) => setActiveSemester(sem))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-page text-text-primary font-sans">
      {/* Sidebar - Desktop fixed & Mobile slide-over drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar-bg text-sidebar-text transition-transform duration-300 ease-out',
          'border-r border-sidebar-divider',
          'pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]',
          'lg:static lg:translate-x-0 lg:shrink-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-sidebar-divider px-5">
          <Link to="/" className="flex items-center gap-3 group">
            {/* SVG Brand Logo Mark */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-accent p-1.5 shadow-xs transition-colors group-hover:bg-white/15">
              <Logo className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-text-on-dark flex items-center">
                Atten<span className="text-accent">-</span>Dance
              </div>
              <p className="text-[11px] leading-tight text-sidebar-text-muted">
                Attendance Tracker
              </p>
            </div>
          </Link>

          {/* Close button on mobile drawer */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-sidebar-text-muted hover:text-text-on-dark rounded-md lg:hidden"
            aria-label="Close navigation"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 overscroll-contain">
          {/* Section: WORKSPACE */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.2em] text-sidebar-text-muted uppercase">
              Workspace
            </div>
            <nav className="space-y-1">
              {workspaceNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-nav-active-bg text-nav-active-text font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-accent'
                        : 'text-sidebar-text hover:bg-white/5 hover:text-text-on-dark'
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0 opacity-80 group-hover:opacity-100" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Section: SEMESTER */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.2em] text-sidebar-text-muted uppercase flex items-center justify-between">
              <span>Semester</span>
              {activeSemester && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-text-on-dark tracking-normal uppercase">
                  Active
                </span>
              )}
            </div>

            {activeSemester && (
              <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-white/5 border border-sidebar-divider text-xs">
                <div className="font-medium text-text-on-dark truncate">{activeSemester.name}</div>
                <div className="text-[11px] text-sidebar-text-muted flex items-center gap-1.5 mt-0.5">
                  <span>Target: {activeSemester.threshold}%</span>
                  <span>•</span>
                  <span>{activeSemester.calculationMethod === 'total_sessions' ? 'Total' : '50/50'}</span>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              <NavLink
                to="/semesters"
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-nav-active-bg text-nav-active-text font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-accent'
                      : 'text-sidebar-text hover:bg-white/5 hover:text-text-on-dark'
                  )
                }
              >
                <SemestersIcon className="h-4.5 w-4.5 shrink-0 opacity-80 group-hover:opacity-100" />
                <span className="truncate">Manage Semesters</span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Footer: User profile & Sign out */}
        <div className="border-t border-sidebar-divider p-3">
          <UserFooter onLoggingOut={() => setIsLoggingOut(true)} />
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-card px-4 lg:hidden pt-[env(safe-area-inset-top,0px)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-panel border border-border-subtle text-accent p-1">
              <Logo className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-sm text-text-primary tracking-tight">
              Atten<span className="text-accent">-</span>Dance
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {activeSemester && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-chip text-text-secondary max-w-[120px] truncate">
                {activeSemester.name}
              </span>
            )}
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === 'dark' ? <SunIcon className="h-4 w-4 text-warn" /> : <MoonIcon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overscroll-contain bg-page">
          <div key={location.pathname} className="animate-fade-in p-4 sm:p-6 md:p-8 lg:p-12 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-12 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile & PWA Bottom Navigation Bar */}
        <nav className="fixed bottom-0 inset-x-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-card border-t border-border-subtle lg:hidden">
          <div className="grid grid-cols-5 w-full items-center">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-forest-800 dark:text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <DashboardIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/input"
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-forest-800 dark:text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <PenLineIcon className="h-5 w-5" />
              <span>Log</span>
            </NavLink>

            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-forest-800 dark:text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-forest-800 dark:text-accent font-semibold' : 'text-text-muted hover:text-text-primary'
                )
              }
            >
              <AnalyticsIcon className="h-5 w-5" />
              <span>Analytics</span>
            </NavLink>

            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              <MoreHorizontalIcon className="h-5 w-5" />
              <span>More</span>
            </button>
          </div>
        </nav>

        {/* Logout Loading Overlay */}
        {isLoggingOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="ledger-card p-8 flex flex-col items-center gap-4 max-w-xs text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-forest-800 dark:border-accent border-t-transparent" />
              <p className="font-serif text-lg text-text-primary">Signing out...</p>
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
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1">
      {user.image ? (
        <img
          src={user.image}
          alt={user.name || 'User'}
          className="h-8 w-8 rounded-full border border-sidebar-divider object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nav-active-bg text-nav-active-text text-xs font-semibold">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium text-text-on-dark">{user.name}</p>
        <p className="truncate text-[10px] text-sidebar-text-muted">{user.email}</p>
      </div>

      <Link
        to="/settings"
        className="p-1.5 text-sidebar-text-muted hover:text-text-on-dark rounded transition-colors"
        title="Settings"
      >
        <SettingsIcon className="h-4 w-4" />
      </Link>

      <button
        onClick={async () => {
          onLoggingOut();
          await signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } });
        }}
        className="p-1.5 text-sidebar-text-muted hover:text-risk rounded transition-colors"
        title="Sign out"
      >
        <LogoutIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
