import { useEffect, useState } from 'react';
import { DownloadIcon } from '@/components/icons';
import { Logo } from '@/components/logo';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const active = await api.semesters.getActive();
      if (active) {
        setThreshold(active.threshold);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const [semesters, settings] = await Promise.all([
        api.semesters.list(),
        api.settings.get(),
      ]);

      const fullData = await Promise.all(
        semesters.map(async (sem) => {
          const [detail, attendance] = await Promise.all([
            api.semesters.get(sem.id),
            api.attendance.getBySemester(sem.id),
          ]);
          return { ...detail, attendance };
        })
      );

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        semesters: fullData,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atten-dance-ledger-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-48 rounded shimmer" />
        </div>
        <div className="h-44 rounded-xl shimmer" />
      </div>
    );
  }

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Paper Light', desc: 'Warm cream & forest ink' },
    { value: 'dark' as const, icon: Moon, label: 'Night Notebook', desc: 'Deep green-black' },
    { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Match device setting' },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Settings</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Tracker configuration
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Customize themes, review threshold policies, and export your attendance ledger.
        </p>
      </div>

      {/* Appearance */}
      <div className="ledger-card p-6">
        <span className="eyebrow block mb-1">Appearance</span>
        <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
          Color theme
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          Select your reading environment. Night notebook preserves a green paper undertone.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center text-center p-4 rounded-lg border transition-colors',
                theme === opt.value
                  ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark border-transparent font-medium shadow-xs'
                  : 'bg-card text-text-secondary border-border-subtle hover:bg-panel hover:text-text-primary'
              )}
            >
              <opt.icon className="h-5 w-5 mb-2" />
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] opacity-75 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Threshold Information */}
      <div className="ledger-card p-6">
        <span className="eyebrow block mb-1">Semester Policies</span>
        <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
          Target threshold: {threshold}%
        </h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          The minimum required attendance threshold is managed per semester. 
          To adjust target percentages or switch calculation methods between <strong>Total Sessions</strong> and <strong>50/50 Split</strong>, visit the <strong>Manage Semesters</strong> section.
        </p>
      </div>

      {/* Data Management */}
      <div className="ledger-card p-6">
        <span className="eyebrow block mb-1">Ledger Backup</span>
        <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
          Data management
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          Export a complete offline backup of all logged semesters, subjects, and sessions.
        </p>

        <button
          onClick={handleExport}
          className="flex items-center gap-3 w-full rounded-lg border border-border-strong bg-card p-4 text-xs font-medium text-text-primary hover:bg-panel transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chip text-text-primary shrink-0">
            <DownloadIcon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-text-primary">Export Ledger Data (JSON)</div>
            <div className="text-[11px] text-text-muted mt-0.5">Download full snapshot of your attendance database</div>
          </div>
        </button>
      </div>

      {/* Colophon / About */}
      <div className="ledger-panel p-6">
        <span className="eyebrow block mb-2">Colophon</span>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border-subtle text-accent p-1.5 shadow-xs">
            <Logo className="h-full w-full object-contain" />
          </div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            Atten<span className="text-accent">-</span>Dance
          </h2>
        </div>
        <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed">
          <p>
            An editorial attendance ledger crafted for students navigating mandatory attendance requirements.
          </p>
          <p className="text-[11px] text-text-muted pt-2 border-t border-border-subtle">
            Database resides securely on your local machine.
          </p>
        </div>
      </div>
    </div>
  );
}
