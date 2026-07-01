import { useEffect, useState } from 'react';
import { ShieldCheck, BookOpen, FlaskConical, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';

export default function SafeSkipsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setLoading(false);
        return;
      }
      const data = await api.analytics.get(active.id);
      setAnalytics(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg font-medium">No active semester</p>
        <p className="text-sm text-muted-foreground">Create a semester first.</p>
      </div>
    );
  }

  const { stats, threshold } = analytics;

  const totalMinSafeSkips = Math.min(
    ...stats.map((s) => s.safeSkips.combined)
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Safe Skips</h1>
        <p className="text-muted-foreground">
          How many sessions you can skip before dropping below {threshold}%
        </p>
      </div>

      {/* Overall safe skip banner */}
      <div
        className={`glass rounded-xl p-6 text-center ${
          totalMinSafeSkips > 3 ? 'glow-success' : totalMinSafeSkips > 0 ? '' : 'glow-danger'
        }`}
      >
        <ShieldCheck
          className={`h-10 w-10 mx-auto mb-3 ${
            totalMinSafeSkips > 3
              ? 'text-success'
              : totalMinSafeSkips > 0
                ? 'text-warning'
                : 'text-danger'
          }`}
        />
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Minimum safe skips across all subjects
        </p>
        <p
          className={`text-5xl font-bold ${
            totalMinSafeSkips > 3
              ? 'text-success'
              : totalMinSafeSkips > 0
                ? 'text-warning'
                : 'text-danger'
          }`}
        >
          {totalMinSafeSkips === Infinity ? '∞' : totalMinSafeSkips}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {totalMinSafeSkips > 0
            ? `You can safely skip ${totalMinSafeSkips} session${totalMinSafeSkips !== 1 ? 's' : ''} of each subject without any dropping below ${threshold}%`
            : 'You cannot afford to skip any sessions right now ⚠️'}
        </p>
      </div>

      {/* Explanation */}
      <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">How is this calculated?</p>
        <p>
          Safe skips = ⌊(attended − {threshold}% × total) ÷ {threshold}%⌋. The "combined" number
          is the minimum of lecture and lab safe skips — meaning you can skip that many of{' '}
          <strong>each type</strong> without either one dropping below the threshold.
        </p>
      </div>

      {/* Per-subject breakdown */}
      <div className="space-y-3">
        {stats.map((s) => {
          const hasLecture = s.lecture.total > 0;
          const hasLab = s.lab.total > 0;
          const isAtRisk = s.safeSkips.combined <= 0;

          return (
            <div
              key={s.subjectId}
              className={`glass rounded-xl p-5 ${isAtRisk ? 'border border-danger/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{s.subjectName}</h3>
                {isAtRisk && (
                  <span className="flex items-center gap-1 text-xs font-medium text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    At Risk
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Lectures */}
                {hasLecture && (
                  <div className="rounded-lg border border-border bg-background/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Lectures</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        s.safeSkips.lecture > 3
                          ? 'text-success'
                          : s.safeSkips.lecture > 0
                            ? 'text-warning'
                            : 'text-danger'
                      }`}
                    >
                      {s.safeSkips.lecture}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {s.lecture.attended}/{s.lecture.total} ({s.lecture.percentage.toFixed(1)}%)
                    </p>
                  </div>
                )}

                {/* Labs */}
                {hasLab && (
                  <div className="rounded-lg border border-border bg-background/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <FlaskConical className="h-3.5 w-3.5 text-chart-4" />
                      <span className="text-xs font-medium text-muted-foreground">Labs</span>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        s.safeSkips.lab > 3
                          ? 'text-success'
                          : s.safeSkips.lab > 0
                            ? 'text-warning'
                            : 'text-danger'
                      }`}
                    >
                      {s.safeSkips.lab}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {s.lab.attended}/{s.lab.total} ({s.lab.percentage.toFixed(1)}%)
                    </p>
                  </div>
                )}

                {/* Combined */}
                <div className="rounded-lg border border-border bg-background/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Combined</span>
                  </div>
                  <p
                    className={`text-3xl font-bold ${
                      s.safeSkips.combined > 3
                        ? 'text-success'
                        : s.safeSkips.combined > 0
                          ? 'text-warning'
                          : 'text-danger'
                    }`}
                  >
                    {s.safeSkips.combined}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    safe to skip both types
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
