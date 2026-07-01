import { useEffect, useState } from 'react';
import { ShieldCheck, BookOpen, FlaskConical, AlertTriangle, Target, TrendingUp } from 'lucide-react';
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

      {/* Overall Average Safe Skips */}
      {analytics.overall.percentage >= threshold ? (
        <div className="glass rounded-xl p-5 border border-success/20 glow-success">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-success" />
            <h2 className="text-sm font-semibold">Overall Safe Skips</h2>
          </div>
          
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-background/30 p-4">
              <p className="text-sm text-muted-foreground">
                Overall average is currently at{' '}
                <span className="font-bold text-success">
                  {analytics.overall.percentage.toFixed(2)}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Here's how many sessions you can skip before your overall average drops below {threshold}%.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">If you only skip Lectures</span>
                </div>
                {analytics.overall.safeSkips.lecture === 999 ? (
                  <p className="text-lg font-bold text-primary">Infinite</p>
                ) : (
                  <p className="text-lg font-bold text-primary">{analytics.overall.safeSkips.lecture} safe</p>
                )}
              </div>
              <div className="rounded-lg border border-border bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="h-4 w-4 text-chart-4" />
                  <span className="text-xs font-medium text-muted-foreground">If you only skip Labs</span>
                </div>
                {analytics.overall.safeSkips.lab === 999 ? (
                  <p className="text-lg font-bold text-chart-4">Infinite</p>
                ) : (
                  <p className="text-lg font-bold text-chart-4">{analytics.overall.safeSkips.lab} safe</p>
                )}
              </div>
            </div>

            {/* Dynamic Combinations */}
            {analytics.overall.safeSkips.combinations?.length > 0 && (
              <div className="rounded-lg border border-border bg-background/30 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Examples of valid combinations:
                </p>
                <div className="flex flex-col gap-2">
                  {analytics.overall.safeSkips.combinations.map((combo, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-primary" /> {combo.lecture} Lecture{combo.lecture !== 1 ? 's' : ''}
                        </span>
                        <span className="text-muted-foreground">&amp;</span>
                        <span className="flex items-center gap-1.5">
                          <FlaskConical className="h-4 w-4 text-chart-4" /> {combo.lab} Lab{combo.lab !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded">
                        {combo.resultingPercentage.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-6 text-center glow-danger">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-danger" />
          <h2 className="text-lg font-bold text-danger mb-1">You are currently at {analytics.overall.percentage.toFixed(2)}%</h2>
          <p className="text-sm text-muted-foreground">
            Since your overall average is below the {threshold}% threshold, you cannot safely skip any more sessions right now. Head over to the Recovery tab to see how to get back on track!
          </p>
        </div>
      )}

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
