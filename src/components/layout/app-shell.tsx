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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input', icon: PenLine, label: 'Log Attendance' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/safe-skips', icon: ShieldCheck, label: 'Safe Skips' },
  { to: '/recovery', icon: HeartPulse, label: 'Recovery' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, resolved } = useTheme();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 glow-primary">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              Atten-Dance
            </h1>
            <p className="text-[10px] leading-tight text-muted-foreground">
              attendance tracker
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
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary/10 text-primary glow-primary border border-primary/20'
                    : 'text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-1">
          <NavLink
            to="/semesters"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-primary/10 text-primary glow-primary border border-primary/20'
                  : 'text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <GraduationCap className="h-4.5 w-4.5" />
            Manage Semesters
          </NavLink>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-foreground" />
              <span className="font-bold">Atten-Dance</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
