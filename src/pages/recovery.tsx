import { useEffect, useState } from 'react';
import {
  HeartPulseIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  TargetIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from '@/components/icons';
import { api } from '@/lib/api';
import type { Analytics, TargetResult } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function RecoveryPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [targetPct, setTargetPct] = useState(75);
  const [targetResult, setTargetResult] = useState<TargetResult | null>(null);
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
      setTargetPct(data.threshold);
      const target = await api.analytics.getTarget(active.id, data.threshold);
      setTargetResult(target);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleTargetChange(newTarget: number) {
    setTargetPct(newTarget);
    if (!analytics) return;
    try {
      const result = await api.analytics.getTarget(analytics.semester.id, newTarget);
      setTargetResult(result);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="h-36 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          Recovery Planner Unavailable
        </h1>
        <p className="text-sm text-text-secondary">
          Create or select an active semester first.
        </p>
      </div>
    );
  }

  const { stats, threshold, semester } = analytics;

  const needsRecovery = stats.filter(
    (s) =>
      (s.lecture.total > 0 && s.lecture.percentage < threshold) ||
      (s.lab.total > 0 && s.lab.percentage < threshold)
  );

  const allClear = needsRecovery.length === 0;

  const safeSubjects = stats.filter(
    (s) =>
      (s.lecture.total === 0 || s.lecture.percentage >= threshold) &&
      (s.lab.total === 0 || s.lab.percentage >= threshold)
  );

  const edgeSubjects = safeSubjects.filter((s) => {
    const lectureEdge = s.lecture.total > 0 && s.lecture.percentage >= threshold && s.safeSkips.lecture === 0;
    const labEdge = s.lab.total > 0 && s.lab.percentage >= threshold && s.safeSkips.lab === 0;
    return lectureEdge || labEdge;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="eyebrow">Workspace / Recovery</span>
          <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
            Recovery planner
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            <span>Consecutive sessions needed to reach target</span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-chip text-[10px] font-semibold tracking-wider uppercase text-forest-700 dark:text-text-primary">
              {semester.calculationMethod === 'total_sessions' ? 'Total Sessions' : '50 / 50 Split'}
            </span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>Target: {threshold}%</span>
          </div>
        </div>

        <button
          onClick={() => document.getElementById('custom-target-calc')?.scrollIntoView({ behavior: 'smooth' })}
          className="self-start sm:self-auto flex items-center gap-2 rounded-lg border border-border-strong bg-card px-3.5 py-2 text-xs font-medium text-text-secondary hover:bg-panel hover:text-text-primary transition-colors"
        >
          <TargetIcon className="h-3.5 w-3.5 text-forest-800 dark:text-accent" />
          Goal Simulator
        </button>
      </div>

      {/* Recovery Status Card */}
      {analytics.overall.percentage >= threshold ? (
        <div className="ledger-card p-6 border-ok/40 bg-ok-bg/15">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ok-bg text-ok shrink-0">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="eyebrow text-[10px]">Overall Standing</span>
              <h2 className="font-serif text-xl font-normal text-text-primary mt-0.5">
                Overall Attendance: {analytics.overall.percentage.toFixed(2)}%
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                {allClear
                  ? `All subjects are currently above ${threshold}%. You're in safe standing!`
                  : `Overall is above ${threshold}%, but ${needsRecovery.length} subject${needsRecovery.length !== 1 ? 's' : ''} require attention below.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ledger-card p-6 border-risk/40 bg-risk-bg/15">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-risk-bg text-risk shrink-0">
              <HeartPulseIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="eyebrow text-[10px]">Action Required</span>
              <h2 className="font-serif text-xl font-normal text-text-primary mt-0.5">
                Overall Attendance: {analytics.overall.percentage.toFixed(2)}%
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                You have {needsRecovery.length} subject{needsRecovery.length !== 1 ? 's' : ''} below {threshold}%. Follow the recovery quotas below to regain safe status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Recovery Quotas */}
      {analytics.overall.percentage < threshold && (analytics.overall.recovery.lecture > 0 || analytics.overall.recovery.lab > 0) && (
        <div className="ledger-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUpIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
            <h2 className="font-serif text-lg font-normal text-text-primary">Overall recovery targets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border-subtle bg-panel/30 p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                <BookOpenIcon className="h-4 w-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Attending Lectures Only</span>
              </div>
              {analytics.overall.recovery.lecture === -1 ? (
                <p className="text-xs font-semibold text-risk">Impossible (Lab attendance too low)</p>
              ) : (
                <div className="font-serif text-3xl font-semibold text-text-primary">
                  {analytics.overall.recovery.lecture}
                  <span className="text-xs font-normal text-text-secondary font-sans ml-1.5">more needed</span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border-subtle bg-panel/30 p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
                <FlaskConicalIcon className="h-4 w-4" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Attending Labs Only</span>
              </div>
              {analytics.overall.recovery.lab === -1 ? (
                <p className="text-xs font-semibold text-risk">Impossible (Lecture attendance too low)</p>
              ) : (
                <div className="font-serif text-3xl font-semibold text-text-primary">
                  {analytics.overall.recovery.lab}
                  <span className="text-xs font-normal text-text-secondary font-sans ml-1.5">more needed</span>
                </div>
              )}
            </div>
          </div>

          {analytics.overall.recovery.combinations?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <span className="eyebrow text-[10px] block mb-2 flex items-center gap-1.5">
                <TargetIcon className="h-3 w-3" />
                Balanced Attendance Combinations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analytics.overall.recovery.combinations.map((combo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border-subtle bg-panel/30 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 font-medium text-text-primary">
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
      )}

      {/* Edge Warning: Subjects one skip away */}
      {edgeSubjects.length > 0 && (
        <div className="ledger-card p-6 border-warn/40 bg-warn/10">
          <div className="flex items-center gap-2.5 mb-3 text-warn">
            <AlertTriangleIcon className="h-5 w-5" />
            <h2 className="font-serif text-lg font-normal text-text-primary">
              Edge Warning — zero skips remaining
            </h2>
          </div>
          <p className="text-xs text-text-secondary mb-4">
            These subjects are currently above threshold, but skipping even 1 more session will pull them into risk.
          </p>
          <div className="space-y-2">
            {edgeSubjects.map((s) => {
              const lectureEdge = s.lecture.total > 0 && s.lecture.percentage >= threshold && s.safeSkips.lecture === 0;
              const labEdge = s.lab.total > 0 && s.lab.percentage >= threshold && s.safeSkips.lab === 0;
              return (
                <div key={s.subjectId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-warn/30 bg-card text-xs">
                  <span className="font-medium text-text-primary">{s.subjectName}</span>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0 text-text-muted">
                    {lectureEdge && (
                      <span>Lectures: <strong className="text-warn">{s.lecture.percentage.toFixed(1)}%</strong> (0 skips)</span>
                    )}
                    {labEdge && (
                      <span>Labs: <strong className="text-warn">{s.lab.percentage.toFixed(1)}%</strong> (0 skips)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject-wise Recovery (Below threshold) */}
      {!allClear && (
        <div>
          <div className="mb-4">
            <span className="eyebrow">Recovery Quotas</span>
            <h2 className="font-serif text-xl font-normal text-text-primary mt-1">
              Consecutive sessions required to reach {threshold}%
            </h2>
          </div>

          <div className="space-y-4">
            {needsRecovery.map((s) => (
              <div key={s.subjectId} className="ledger-card p-5 border-risk/40">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-base font-medium text-text-primary">
                      {s.subjectName}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Current: {s.combined.percentage.toFixed(1)}% • Target: {threshold}%
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-risk-bg text-risk">
                    Recovery Needed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {s.lecture.total > 0 && s.lecture.percentage < threshold && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-text-muted flex items-center gap-1.5">
                          <BookOpenIcon className="h-3.5 w-3.5" /> Lectures
                        </span>
                        <span className="font-semibold text-risk">{s.lecture.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-serif text-3xl font-semibold text-text-primary">
                          {s.recovery.lecture}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">consecutive lectures to attend</span>
                      </div>
                    </div>
                  )}

                  {s.lab.total > 0 && s.lab.percentage < threshold && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-text-muted flex items-center gap-1.5">
                          <FlaskConicalIcon className="h-3.5 w-3.5" /> Labs
                        </span>
                        <span className="font-semibold text-risk">{s.lab.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-serif text-3xl font-semibold text-text-primary">
                          {s.recovery.lab}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">consecutive labs to attend</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Simulator / Custom Target Calculator */}
      <div id="custom-target-calc" className="ledger-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <TargetIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
          <h2 className="font-serif text-xl font-normal text-text-primary">Goal Simulator</h2>
        </div>
        <p className="text-xs text-text-secondary mb-6">
          Set a custom target percentage to calculate the sessions required across all subjects.
        </p>

        {/* Target Slider & Presets */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[10px]">Target Percentage</span>
            <span className="font-serif text-2xl font-semibold text-text-primary tabular-nums">
              {targetPct}%
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="95"
            step="1"
            value={targetPct}
            onChange={(e) => handleTargetChange(Number(e.target.value))}
            className="w-full accent-forest-800 dark:accent-accent cursor-pointer"
          />

          <div className="flex items-center gap-2">
            {[75, 80, 85, 90].map((preset) => (
              <button
                key={preset}
                onClick={() => handleTargetChange(preset)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors border',
                  targetPct === preset
                    ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark border-transparent font-semibold'
                    : 'bg-card text-text-secondary border-border-subtle hover:bg-panel hover:text-text-primary'
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Target Results */}
        {targetResult && (
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <span className="eyebrow text-[10px] block mb-2">Subject Targets for {targetPct}%</span>
            <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg overflow-hidden bg-panel/20">
              {targetResult.subjects.map((sub) => (
                <div key={sub.subjectId} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div>
                    <p className="font-medium text-text-primary">{sub.subjectName}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Current: {sub.currentPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    {sub.currentPercentage >= targetPct ? (
                      <span className="font-semibold text-ok">Goal Achieved ✓</span>
                    ) : (
                      <span className="font-semibold text-text-primary">
                        +{sub.sessionsNeeded} session{sub.sessionsNeeded !== 1 ? 's' : ''} needed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
