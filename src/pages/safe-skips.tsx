import { useEffect, useState } from 'react';
import {
  ShieldCheckIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  AlertTriangleIcon,
  TargetIcon,
} from '@/components/icons';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';
import { cn } from '@/lib/utils';

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
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="h-44 rounded-xl shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          Safe Skips Unavailable
        </h1>
        <p className="text-sm text-text-secondary">
          Create or select an active semester first.
        </p>
      </div>
    );
  }

  const { stats, threshold, semester } = analytics;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Safe Skips</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Safe skips calculator
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
          <span>Skips remaining before hitting target</span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-chip text-[10px] font-semibold tracking-wider uppercase text-forest-700 dark:text-text-primary">
            {semester.calculationMethod === 'total_sessions' ? 'Total Sessions' : '50 / 50 Split'}
          </span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span>Target: {threshold}%</span>
        </div>
      </div>

      {/* Overall Safe Skips Card */}
      {analytics.overall.percentage >= threshold ? (
        <div className="ledger-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ok-bg text-ok">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="eyebrow text-[10px]">Overall Bunk Buffer</span>
              <h2 className="font-serif text-xl font-normal text-text-primary">
                You have room to safely miss sessions
              </h2>
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-panel/40 p-4 text-xs text-text-secondary">
            Overall attendance is currently at{' '}
            <span className="font-serif font-semibold text-text-primary text-sm">
              {analytics.overall.percentage.toFixed(2)}%
            </span>
            . {semester.calculationMethod === 'total_sessions'
              ? `Every lecture and lab carries equal weight. You have a shared total of ${analytics.overall.safeSkips.lecture} sessions you can safely skip before dropping below ${threshold}%.`
              : `You can safely miss the following sessions without breaching your ${threshold}% target.`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-border-subtle bg-card p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                <BookOpenIcon className="h-4 w-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">If only skipping Lectures</span>
              </div>
              <div className="font-serif text-3xl font-semibold text-text-primary">
                {analytics.overall.safeSkips.lecture === 999 ? '∞' : analytics.overall.safeSkips.lecture}
                <span className="text-xs font-normal text-text-secondary font-sans ml-1.5">safe to miss</span>
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-card p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                <FlaskConicalIcon className="h-4 w-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">If only skipping Labs</span>
              </div>
              <div className="font-serif text-3xl font-semibold text-text-primary">
                {analytics.overall.safeSkips.lab === 999 ? '∞' : analytics.overall.safeSkips.lab}
                <span className="text-xs font-normal text-text-secondary font-sans ml-1.5">safe to miss</span>
              </div>
            </div>
          </div>

          {/* Valid Combinations */}
          {analytics.overall.safeSkips.combinations?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <span className="eyebrow text-[10px] block mb-2 flex items-center gap-1.5">
                <TargetIcon className="h-3 w-3" />
                Valid Split Combinations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analytics.overall.safeSkips.combinations.map((combo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-panel/30 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 text-text-primary font-medium">
                      <span>{combo.lecture} Lectures</span>
                      <span className="text-text-muted">+</span>
                      <span>{combo.lab} Labs</span>
                    </div>
                    <span className="font-semibold text-ok font-mono text-[11px]">
                      {combo.resultingPercentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="ledger-card p-6 text-center border-risk/40 bg-risk-bg/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-risk-bg text-risk mx-auto mb-3">
            <AlertTriangleIcon className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-xl font-normal text-text-primary mb-1">
            Overall is currently at {analytics.overall.percentage.toFixed(2)}%
          </h2>
          <p className="text-xs text-text-secondary">
            You cannot safely skip any more sessions right now without falling further below {threshold}%.
          </p>
        </div>
      )}

      {/* Per-subject Breakdown */}
      <div>
        <div className="mb-4">
          <span className="eyebrow">Subject Buffers</span>
          <h2 className="font-serif text-xl font-normal text-text-primary mt-1">
            Buffer per subject
          </h2>
        </div>

        <div className="space-y-4">
          {stats.map((s) => {
            const hasLecture = s.lecture.total > 0;
            const hasLab = s.lab.total > 0;
            const isAtRisk = s.safeSkips.combined <= 0;

            return (
              <div
                key={s.subjectId}
                className={cn(
                  'ledger-card p-5 transition-colors',
                  isAtRisk && 'border-risk/40'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-base font-medium text-text-primary">
                      {s.subjectName}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Current: {s.combined.percentage.toFixed(1)}% • Target: {threshold}%
                    </p>
                  </div>
                  {isAtRisk ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-risk-bg text-risk">
                      <AlertTriangleIcon className="h-3 w-3" />
                      At Risk
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-ok-bg text-ok">
                      <ShieldCheckIcon className="h-3 w-3" />
                      Buffer Available
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Lectures */}
                  {hasLecture && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-text-muted">
                        <BookOpenIcon className="h-3.5 w-3.5" />
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Lectures</span>
                      </div>
                      <div className={cn(
                        'font-serif text-3xl font-semibold',
                        s.safeSkips.lecture > 3 ? 'text-ok' : s.safeSkips.lecture > 0 ? 'text-warn' : 'text-risk'
                      )}>
                        {s.safeSkips.lecture}
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">
                        {s.lecture.attended}/{s.lecture.total} ({s.lecture.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  )}

                  {/* Labs */}
                  {hasLab && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-text-muted">
                        <FlaskConicalIcon className="h-3.5 w-3.5" />
                        <span className="font-semibold uppercase tracking-wider text-[10px]">Labs</span>
                      </div>
                      <div className={cn(
                        'font-serif text-3xl font-semibold',
                        s.safeSkips.lab > 3 ? 'text-ok' : s.safeSkips.lab > 0 ? 'text-warn' : 'text-risk'
                      )}>
                        {s.safeSkips.lab}
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">
                        {s.lab.attended}/{s.lab.total} ({s.lab.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  )}

                  {/* Combined */}
                  <div className="rounded-lg border border-border-subtle bg-panel/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1 text-xs text-text-muted">
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Combined</span>
                    </div>
                    <div className={cn(
                      'font-serif text-3xl font-semibold',
                      s.safeSkips.combined > 3 ? 'text-ok' : s.safeSkips.combined > 0 ? 'text-warn' : 'text-risk'
                    )}>
                      {s.safeSkips.combined}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                      {semester.calculationMethod === 'total_sessions' ? 'shared skips' : 'both session types'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
