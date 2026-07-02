import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, Download, Sun, Moon, Monitor } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(75);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const active = await api.semesters.getActive();
      if (active) {
        await api.semesters.update(active.id, { threshold });
      }
      await api.settings.update({ default_threshold: String(threshold) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const [semesters, settings] = await Promise.all([
        api.semesters.list(),
        api.settings.get(),
      ]);

      // Get details for each semester
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
      a.download = `atten-dance-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-48 rounded-xl shimmer" />
      </div>
    );
  }

  const themeOptions = [
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your attendance tracker</p>
      </div>

      {/* Appearance */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Choose your preferred theme. System will follow your device settings.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition-all',
                theme === opt.value
                  ? 'border-foreground/30 bg-foreground/5 text-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              )}
            >
              <opt.icon className="h-5 w-5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Attendance Threshold</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Set the minimum attendance percentage required. This affects safe skip and
          recovery calculations for the active semester.
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">
              Threshold
            </label>
            <span className="text-sm font-bold">{threshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-foreground"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>50%</span>
            <span>75% (default)</span>
            <span>100%</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-50"
        >
          {saved ? (
            <>
              <Save className="h-4 w-4" />
              Saved!
            </>
          ) : saving ? (
            'Saving…'
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Data Management */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Data Management</h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Export Data</p>
              <p className="text-xs text-muted-foreground">
                Download all your data as JSON
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-3">About</h2>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            <span className="font-bold text-sm text-foreground">Atten-Dance</span> — Because
            college makes you dance for attendance 💃
          </p>
          <p>Track your lectures, calculate safe bunks, and never get caught off-guard.</p>
          <p className="text-[10px]">Data stored locally in SQLite. Your data never leaves your machine.</p>
        </div>
      </div>
    </div>
  );
}
