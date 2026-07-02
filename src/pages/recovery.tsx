import { useEffect, useState } from 'react';
import {
  HeartPulse,
  BookOpen,
  FlaskConical,
  Target,
  ArrowUp,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics, TargetResult } from '@/lib/api';

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
      // Load target result
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
      <div className="space-y-6 max-w-3xl mx-auto">
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

  // Filter to subjects that need recovery (below threshold)
  const needsRecovery = stats.filter(
    (s) =>
      (s.lecture.total > 0 && s.lecture.percentage < threshold) ||
      (s.lab.total > 0 && s.lab.percentage < threshold)
  );

  const allClear = needsRecovery.length === 0;

  // Subjects above threshold
  const safeSubjects = stats.filter(
    (s) =>
      (s.lecture.total === 0 || s.lecture.percentage >= threshold) &&
      (s.lab.total === 0 || s.lab.percentage >= threshold)
  );

  // Subjects on the edge: above threshold but 0 safe skips in either lecture or lab
  const edgeSubjects = safeSubjects.filter((s) => {
    const lectureEdge = s.lecture.total > 0 && s.lecture.percentage >= threshold && s.safeSkips.lecture === 0;
    const labEdge = s.lab.total > 0 && s.lab.percentage >= threshold && s.safeSkips.lab === 0;
    return lectureEdge || labEdge;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recovery Planner</h1>
          <p className="text-muted-foreground">
            How many consecutive sessions to attend to reach your target
          </p>
        </div>
        <button
          onClick={() => document.getElementById('custom-target-calc')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
        >
          <Target className="h-3.5 w-3.5 text-chart-3" /> Calculator
        </button>
      </div>

      {/* Overall Recovery */}
      {/* Recovery Status Banner */}
      {analytics.overall.percentage >= threshold ? (
        <div className="glass rounded-xl p-6 text-center glow-success">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success" />
          <p className="text-lg font-semibold text-success">
            Overall Attendance: {analytics.overall.percentage.toFixed(2)}% ✅
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {allClear
              ? `All subjects are above ${threshold}%. You're cruising!`
              : `You're above ${threshold}% overall, but ${needsRecovery.length} subject${needsRecovery.length !== 1 ? 's' : ''} still need${needsRecovery.length === 1 ? 's' : ''} attention below.`}
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl p-6 text-center glow-danger">
          <HeartPulse className="h-10 w-10 mx-auto mb-3 text-danger" />
          <p className="text-lg font-semibold text-danger">
            Overall Attendance: {analytics.overall.percentage.toFixed(2)}% 📉
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {needsRecovery.length} subject{needsRecovery.length !== 1 ? 's' : ''} below{' '}
            {threshold}% — here's your recovery plan
          </p>
        </div>
      )}
      {analytics.overall.percentage < threshold && (analytics.overall.recovery.lecture > 0 || analytics.overall.recovery.lab > 0) && (
        <div className="glass rounded-xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Overall Recovery</h2>
          </div>

          <div className="space-y-3">
            {/* <div className="rounded-lg border border-border bg-background/30 p-4">
              <p className="text-sm text-muted-foreground">
                Overall average is currently at{' '}
                <span className="font-bold text-danger">
                  {analytics.overall.percentage.toFixed(2)}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your college averages total lectures and total labs equally. Missing a lab hurts your average more since they are less frequent!
              </p>
            </div> */}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">If you only attend Lectures</span>
                </div>
                {analytics.overall.recovery.lecture === -1 ? (
                  <p className="text-sm font-bold text-danger">Impossible (Lab attendance too low)</p>
                ) : (
                  <p className="text-lg font-bold text-primary">{analytics.overall.recovery.lecture} needed</p>
                )}
              </div>
              <div className="rounded-lg border border-border bg-background/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="h-4 w-4 text-chart-4" />
                  <span className="text-xs font-medium text-muted-foreground">If you only attend Labs</span>
                </div>
                {analytics.overall.recovery.lab === -1 ? (
                  <p className="text-sm font-bold text-danger">Impossible (Lecture attendance too low)</p>
                ) : (
                  <p className="text-lg font-bold text-chart-4">{analytics.overall.recovery.lab} needed</p>
                )}
              </div>
            </div>

            {(analytics.overall.recovery.lecture > 50 || analytics.overall.recovery.lab > 50) && (
              <p className="text-[10px] text-muted-foreground">
                * Note: The "Only Lectures" or "Only Labs" numbers can be extremely high because compensating for one type entirely with another requires a massive number of classes due to percentage math. We highly recommend using a combination below.
              </p>
            )}

            {/* Dynamic Combinations */}
            {analytics.overall.recovery.combinations?.length > 0 && (
              <div className="rounded-lg border border-border bg-background/30 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Examples of valid combinations:
                </p>
                <div className="flex flex-col gap-2">
                  {analytics.overall.recovery.combinations.map((combo, idx) => (
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
                      <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                        {combo.resultingPercentage.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Edge Warning — subjects one skip away from dropping */}
      {analytics.overall.percentage >= threshold && edgeSubjects.length > 0 && (
        <div className="glass rounded-xl p-5 border border-[hsl(45,100%,50%)]/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-[hsl(45,100%,50%)]" />
            <h2 className="text-sm font-semibold text-[hsl(45,100%,50%)]">On Thin Ice ⚠️</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            These subjects are above {threshold}% but even <span className="font-bold text-[hsl(45,100%,50%)]">one more skip</span> will drop you below the threshold.
          </p>
          <div className="space-y-2">
            {edgeSubjects.map((s) => {
              const lectureEdge = s.lecture.total > 0 && s.lecture.percentage >= threshold && s.safeSkips.lecture === 0;
              const labEdge = s.lab.total > 0 && s.lab.percentage >= threshold && s.safeSkips.lab === 0;
              return (
                <div key={s.subjectId} className="rounded-lg border border-[hsl(45,100%,50%)]/20 bg-[hsl(45,100%,50%)]/5 px-4 py-3">
                  <p className="text-sm font-medium mb-1">{s.subjectName}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {lectureEdge && (
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Lectures at</span>
                        <span className="font-bold text-[hsl(45,100%,50%)]">{s.lecture.percentage.toFixed(2)}%</span>
                        <span className="text-muted-foreground">— 0 skips left</span>
                      </span>
                    )}
                    {labEdge && (
                      <span className="flex items-center gap-1.5">
                        <FlaskConical className="h-3 w-3 text-chart-4" />
                        <span className="text-muted-foreground">Labs at</span>
                        <span className="font-bold text-[hsl(45,100%,50%)]">{s.lab.percentage.toFixed(2)}%</span>
                        <span className="text-muted-foreground">— 0 skips left</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safe Subjects — explicitly above threshold */}
      {analytics.overall.percentage >= threshold && safeSubjects.length > 0 && (
        <div className="glass rounded-xl p-5 border border-success/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h2 className="text-sm font-semibold">Above {threshold}%</h2>
          </div>
          <div className="space-y-2">
            {safeSubjects.map((s) => (
              <div key={s.subjectId} className="rounded-lg border border-border bg-background/30 px-4 py-3">
                <p className="text-sm font-medium mb-1">{s.subjectName}</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  {s.lecture.total > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-primary" />
                      <span className="font-bold text-success">{s.lecture.percentage.toFixed(2)}%</span>
                      <span className="text-muted-foreground">
                        — {s.safeSkips.lecture} skip{s.safeSkips.lecture !== 1 ? 's' : ''} left
                      </span>
                    </span>
                  )}
                  {s.lab.total > 0 && (
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="h-3 w-3 text-chart-4" />
                      <span className="font-bold text-success">{s.lab.percentage.toFixed(2)}%</span>
                      <span className="text-muted-foreground">
                        — {s.safeSkips.lab} skip{s.safeSkips.lab !== 1 ? 's' : ''} left
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Details (for subjects below threshold) */}
      {!allClear && (
        <div className="space-y-6">
          {/* Subject-wise Recovery */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Subject-wise Recovery to {threshold}%</h2>
            {needsRecovery.map((s) => (
              <div
                key={s.subjectId}
                className="glass rounded-xl p-5 border border-danger/20"
              >
                <h3 className="text-sm font-semibold mb-3">{s.subjectName}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {s.lecture.total > 0 && s.lecture.percentage < threshold && (
                    <div className="rounded-lg border border-border bg-background/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Lectures
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Currently at{' '}
                        <span className="font-medium text-danger">
                          {s.lecture.percentage.toFixed(2)}%
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <ArrowUp className="h-4 w-4 text-primary" />
                        <p className="text-sm">
                          Attend{' '}
                          <span className="text-lg font-bold text-primary">
                            {s.recovery.lecture}
                          </span>{' '}
                          more consecutive lectures
                        </p>
                      </div>
                    </div>
                  )}
                  {s.lab.total > 0 && s.lab.percentage < threshold && (
                    <div className="rounded-lg border border-border bg-background/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="h-4 w-4 text-chart-4" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Labs
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Currently at{' '}
                        <span className="font-medium text-danger">
                          {s.lab.percentage.toFixed(2)}%
                        </span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <ArrowUp className="h-4 w-4 text-chart-4" />
                        <p className="text-sm">
                          Attend{' '}
                          <span className="text-lg font-bold text-chart-4">
                            {s.recovery.lab}
                          </span>{' '}
                          more consecutive labs
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Target Calculator */}
      <div id="custom-target-calc" className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-chart-3" />
          <h2 className="text-sm font-semibold">Custom Target Calculator</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Want to reach a specific percentage? See how many sessions you need.
        </p>

        {/* Target slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">
              Target Percentage
            </label>
            <span className="text-sm font-bold text-chart-3">{targetPct}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={targetPct}
            onChange={(e) => handleTargetChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-chart-3"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Results */}
        {targetResult && (
          <div className="space-y-4">
            {(targetResult.overall.sessionsNeeded.lecture > 0 || targetResult.overall.sessionsNeeded.lab > 0) && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Overall Average Target
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently at {targetResult.overall.current.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-primary/10">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                      <BookOpen className="h-3 w-3 text-primary" /> If only Lectures
                    </p>
                    {targetResult.overall.sessionsNeeded.lecture === -1 ? (
                      <p className="text-xs font-bold text-danger mt-1">Impossible</p>
                    ) : (
                      <p className="text-sm font-bold text-primary">{targetResult.overall.sessionsNeeded.lecture} needed</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                      <FlaskConical className="h-3 w-3 text-chart-4" /> If only Labs
                    </p>
                    {targetResult.overall.sessionsNeeded.lab === -1 ? (
                      <p className="text-xs font-bold text-danger mt-1">Impossible</p>
                    ) : (
                      <p className="text-sm font-bold text-chart-4">{targetResult.overall.sessionsNeeded.lab} needed</p>
                    )}
                  </div>
                </div>

                {/* Dynamic Combinations for Custom Target */}
                {targetResult.overall.sessionsNeeded.combinations?.length > 0 && (
                  <div className="pt-3 border-t border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" /> Examples of valid combinations:
                    </p>
                    <div className="flex flex-col gap-2">
                      {targetResult.overall.sessionsNeeded.combinations.map((combo, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 text-xs font-medium">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-primary" /> {combo.lecture} Lecture{combo.lecture !== 1 ? 's' : ''}
                            </span>
                            <span className="text-muted-foreground">&amp;</span>
                            <span className="flex items-center gap-1.5">
                              <FlaskConical className="h-3.5 w-3.5 text-chart-4" /> {combo.lab} Lab{combo.lab !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">
                            {combo.resultingPercentage.toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {targetResult.results.map((r) => {
                const needsLecture = r.lecture.sessionsNeeded > 0;
                const needsLab = r.lab.sessionsNeeded > 0;
                if (!needsLecture && !needsLab) return null;

                return (
                  <div
                    key={r.subjectId}
                    className="rounded-lg border border-border bg-background/30 px-4 py-3"
                  >
                    <p className="text-sm font-medium mb-1">{r.subjectName}</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {needsLecture && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3 text-primary" />
                          <span className="text-muted-foreground">Lectures:</span>
                          <span className="font-bold text-primary">
                            {r.lecture.sessionsNeeded}
                          </span>
                          <span className="text-muted-foreground">
                            more ({r.lecture.current.toFixed(2)}% → {targetPct}%)
                          </span>
                        </span>
                      )}
                      {needsLab && (
                        <span className="flex items-center gap-1.5">
                          <FlaskConical className="h-3 w-3 text-chart-4" />
                          <span className="text-muted-foreground">Labs:</span>
                          <span className="font-bold text-chart-4">
                            {r.lab.sessionsNeeded}
                          </span>
                          <span className="text-muted-foreground">
                            more ({r.lab.current.toFixed(2)}% → {targetPct}%)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {targetResult.results.every(
                (r) => r.lecture.sessionsNeeded === 0 && r.lab.sessionsNeeded === 0
              ) && (
                  <div className="text-center py-4 text-sm text-success">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-2" />
                    All subjects are already at or above {targetPct}%!
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
