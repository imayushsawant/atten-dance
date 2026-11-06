import { useEffect, useState } from 'react';
import {
  PlusIcon,
  MinusIcon,
  RotateCcwIcon,
  CheckIcon,
  CloseIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@/components/icons';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';
import { cn } from '@/lib/utils';

type Modifier = { attend: number; skip: number };
type SubjectModifiers = { lecture: Modifier; lab: Modifier };
type Modifiers = Record<string, SubjectModifiers>;

type EntryStatus = 'attended' | 'skipped' | null;
type EntryRow = {
  subjectId: string;
  subjectName: string;
  type: 'lecture' | 'lab';
  status: EntryStatus;
  instanceId: string;
};

const defaultSubjectMod = (): SubjectModifiers => ({
  lecture: { attend: 0, skip: 0 },
  lab: { attend: 0, skip: 0 },
});

export default function PredictorPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [mode, setMode] = useState<'overall' | 'subject'>('overall');
  const [modifiers, setModifiers] = useState<Modifiers>({});
  const [entries, setEntries] = useState<EntryRow[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setError('No active semester found. Create one to use the predictor.');
        return;
      }
      const data = await api.analytics.get(active.id);
      setAnalytics(data);
      initializeEntries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function initializeEntries(data: Analytics) {
    const rows: EntryRow[] = [];
    for (const stat of data.stats) {
      const subject = data.subjects.find(s => s.id === stat.subjectId);
      if (!subject) continue;
      if (subject.hasLecture) {
        rows.push({ subjectId: subject.id, subjectName: subject.name, type: 'lecture', status: null, instanceId: crypto.randomUUID() });
      }
      if (subject.hasLab) {
        rows.push({ subjectId: subject.id, subjectName: subject.name, type: 'lab', status: null, instanceId: crypto.randomUUID() });
      }
    }
    setEntries(rows);
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-xl shimmer" />
          <div className="h-64 rounded-xl shimmer lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          Predictor Unavailable
        </h1>
        <p className="text-sm text-text-secondary">{error || 'Failed to load analytics.'}</p>
      </div>
    );
  }

  const { stats, overall, threshold, semester } = analytics;

  let newOverallLecAttended = stats.reduce((acc, s) => acc + s.lecture.attended, 0);
  let newOverallLecTotal = stats.reduce((acc, s) => acc + s.lecture.total, 0);
  let newOverallLabAttended = stats.reduce((acc, s) => acc + s.lab.attended, 0);
  let newOverallLabTotal = stats.reduce((acc, s) => acc + s.lab.total, 0);

  const predictedStats = stats.map(stat => {
    let lecAttended = stat.lecture.attended;
    let lecTotal = stat.lecture.total;
    let labAttended = stat.lab.attended;
    let labTotal = stat.lab.total;
    
    if (mode === 'subject') {
      const subjEntries = entries.filter(e => e.subjectId === stat.subjectId && e.status !== null);
      for (const e of subjEntries) {
        if (e.type === 'lecture') {
          lecTotal++;
          if (e.status === 'attended') lecAttended++;
        } else {
          labTotal++;
          if (e.status === 'attended') labAttended++;
        }
      }
    }
    
    const lecPct = lecTotal > 0 ? (lecAttended / lecTotal) * 100 : 100;
    const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;
    
    let combinedPct = 100;
    if (semester.calculationMethod === 'total_sessions') {
      const combinedTotal = lecTotal + labTotal;
      const combinedAttended = lecAttended + labAttended;
      combinedPct = combinedTotal > 0 ? (combinedAttended / combinedTotal) * 100 : 100;
    } else {
      if (lecTotal > 0 && labTotal > 0) {
        combinedPct = (lecPct + labPct) / 2;
      } else if (lecTotal > 0) {
        combinedPct = lecPct;
      } else if (labTotal > 0) {
        combinedPct = labPct;
      }
    }
    
    return {
      ...stat,
      predicted: {
        combined: combinedPct,
        lecTotal,
        lecAttended,
        labTotal,
        labAttended
      }
    };
  });

  if (mode === 'subject') {
    newOverallLecAttended = predictedStats.reduce((acc, s) => acc + s.predicted.lecAttended, 0);
    newOverallLecTotal = predictedStats.reduce((acc, s) => acc + s.predicted.lecTotal, 0);
    newOverallLabAttended = predictedStats.reduce((acc, s) => acc + s.predicted.labAttended, 0);
    newOverallLabTotal = predictedStats.reduce((acc, s) => acc + s.predicted.labTotal, 0);
  } else {
    const overallMod = modifiers['overall'] || defaultSubjectMod();
    newOverallLecAttended += overallMod.lecture.attend;
    newOverallLecTotal += overallMod.lecture.attend + overallMod.lecture.skip;
    newOverallLabAttended += overallMod.lab.attend;
    newOverallLabTotal += overallMod.lab.attend + overallMod.lab.skip;
  }

  const overallLecPct = newOverallLecTotal > 0 ? (newOverallLecAttended / newOverallLecTotal) * 100 : 100;
  const overallLabPct = newOverallLabTotal > 0 ? (newOverallLabAttended / newOverallLabTotal) * 100 : 100;
  
  let predictedOverallPercentage = 100;
  if (semester.calculationMethod === 'total_sessions') {
    const totalAttended = newOverallLecAttended + newOverallLabAttended;
    const totalSessions = newOverallLecTotal + newOverallLabTotal;
    predictedOverallPercentage = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 100;
  } else {
    if (newOverallLecTotal > 0 && newOverallLabTotal > 0) {
      predictedOverallPercentage = (overallLecPct + overallLabPct) / 2;
    } else if (newOverallLecTotal > 0) {
      predictedOverallPercentage = overallLecPct;
    } else if (newOverallLabTotal > 0) {
      predictedOverallPercentage = overallLabPct;
    }
  }

  const newOverallAttendedSum = newOverallLecAttended + newOverallLabAttended;
  const newOverallTotalSum = newOverallLecTotal + newOverallLabTotal;

  const handleUpdateOverall = (type: 'lecture' | 'lab', action: 'attend' | 'skip', delta: number) => {
    setModifiers(prev => {
      const current = prev['overall'] || defaultSubjectMod();
      const newValue = Math.max(0, current[type][action] + delta);
      return {
        ...prev,
        'overall': {
          ...current,
          [type]: {
            ...current[type],
            [action]: newValue
          }
        }
      };
    });
  };

  const handleReset = () => {
    setModifiers({});
    initializeEntries(analytics);
  };

  function setEntryStatus(instanceId: string, status: EntryStatus) {
    setEntries((prev) =>
      prev.map((e) =>
        e.instanceId === instanceId
          ? { ...e, status: e.status === status ? null : status }
          : e
      )
    );
  }

  function addInstance(subjectId: string, subjectName: string, type: 'lecture' | 'lab') {
    setEntries((prev) => {
      const lastIndex = prev.reduce((acc, e, i) =>
        e.subjectId === subjectId && e.type === type ? i : acc, -1);
      const newEntry: EntryRow = {
        subjectId,
        subjectName,
        type,
        status: null,
        instanceId: crypto.randomUUID(),
      };
      if (lastIndex === -1) return [...prev, newEntry];
      const result = [...prev];
      result.splice(lastIndex + 1, 0, newEntry);
      return result;
    });
  }

  function removeInstance(instanceId: string) {
    setEntries((prev) => prev.filter(e => e.instanceId !== instanceId));
  }

  function getEntryLabel(entry: EntryRow): string | null {
    const entryInstances = entries.filter(e => e.subjectId === entry.subjectId && e.type === entry.type);
    if (entryInstances.length <= 1) return null;
    const idx = entryInstances.findIndex(e => e.instanceId === entry.instanceId);
    return entry.type === 'lecture' ? `L${idx + 1}` : `Lab ${idx + 1}`;
  }

  const getColor = (val: number) => val >= threshold ? 'text-ok' : val >= threshold - 5 ? 'text-warn' : 'text-risk';
  const getBgColor = (val: number) => val >= threshold ? 'bg-ok' : val >= threshold - 5 ? 'bg-warn' : 'bg-risk';

  const currentOverallMod = modifiers['overall'] || defaultSubjectMod();
  const hasOverallModifications =
    currentOverallMod.lecture.attend > 0 ||
    currentOverallMod.lecture.skip > 0 ||
    currentOverallMod.lab.attend > 0 ||
    currentOverallMod.lab.skip > 0;

  const defaultEntriesCount = analytics.subjects.reduce(
    (acc, s) => acc + (s.hasLecture ? 1 : 0) + (s.hasLab ? 1 : 0),
    0
  );
  const hasSubjectModifications =
    entries.some((e) => e.status !== null) || entries.length !== defaultEntriesCount;

  const hasModifications = mode === 'overall' ? hasOverallModifications : hasSubjectModifications;

  const rawOverallDiff = predictedOverallPercentage - overall.percentage;
  const diffAbs = Math.abs(rawOverallDiff);
  const hasDiff = diffAbs >= 0.05;
  const isOverallPositive = rawOverallDiff > 0;
  const formattedDiff = hasDiff
    ? `${isOverallPositive ? '+' : '-'}${diffAbs.toFixed(1)}%`
    : '0.0%';

  const lectureEntries = entries.filter((e) => e.type === 'lecture');
  const labEntries = entries.filter((e) => e.type === 'lab');

  function renderSection(
    type: 'lecture' | 'lab',
    sectionEntries: EntryRow[],
    icon: React.ReactNode,
  ) {
    if (sectionEntries.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chip text-forest-700 dark:text-text-primary">
            {icon}
          </div>
          <h2 className="font-serif text-base font-normal text-text-primary">
            {type === 'lecture' ? 'Lectures Simulation' : 'Labs Simulation'}
          </h2>
        </div>

        <div className="ledger-card divide-y divide-border-subtle overflow-hidden">
          {sectionEntries.map((entry) => {
            const label = getEntryLabel(entry);
            const instancesOfKind = entries.filter(e => e.subjectId === entry.subjectId && e.type === entry.type);
            const canRemove = instancesOfKind.length > 1;

            return (
              <div
                key={entry.instanceId}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 transition-colors',
                  entry.status === 'attended' && 'bg-ok-bg/30',
                  entry.status === 'skipped' && 'bg-risk-bg/30'
                )}
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {entry.subjectName}
                  </p>
                  {label && (
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-chip text-text-secondary">
                      {label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {canRemove && (
                    <button
                      onClick={() => removeInstance(entry.instanceId)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-risk-bg hover:text-risk transition-colors"
                      title="Remove instance"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => addInstance(entry.subjectId, entry.subjectName, entry.type)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-panel text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
                    title={`Add another ${type}`}
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'attended')}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium border transition-colors',
                      entry.status === 'attended'
                        ? 'bg-ok-bg border-ok text-ok font-semibold'
                        : 'border-border-subtle bg-card text-text-secondary hover:bg-ok-bg/50 hover:text-ok'
                    )}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Present</span>
                  </button>
                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'skipped')}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium border transition-colors',
                      entry.status === 'skipped'
                        ? 'bg-risk-bg border-risk text-risk font-semibold'
                        : 'border-border-subtle bg-card text-text-secondary hover:bg-risk-bg/50 hover:text-risk'
                    )}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bunked</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="eyebrow">Workspace / Predictor</span>
          <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
            Scenario simulator
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Test hypothetical attendance scenarios to see their immediate impact on your standing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-chip border border-border-subtle text-xs">
            <button
              onClick={() => setMode('overall')}
              className={cn(
                "px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md transition-colors",
                mode === 'overall' ? "bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs" : "text-text-muted hover:text-text-primary"
              )}
            >
              Overall
            </button>
            <button
              onClick={() => setMode('subject')}
              className={cn(
                "px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md transition-colors",
                mode === 'subject' ? "bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs" : "text-text-muted hover:text-text-primary"
              )}
            >
              Subject
            </button>
          </div>

          <button 
            onClick={handleReset}
            disabled={!hasModifications}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-card text-xs font-medium transition-colors",
              hasModifications
                ? "text-text-secondary hover:bg-panel hover:text-text-primary cursor-pointer"
                : "opacity-40 cursor-not-allowed text-text-muted"
            )}
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Predicted Outcome Cards (4 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Predicted Overall Card */}
          <div className="ledger-card p-6 text-center">
            <span className="eyebrow text-[10px]">
              {hasModifications ? 'Predicted Overall' : 'Current Overall Attendance'}
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span
                className={cn(
                  'font-serif text-5xl font-semibold tracking-tight',
                  getColor(hasModifications ? predictedOverallPercentage : overall.percentage)
                )}
              >
                {(hasModifications ? predictedOverallPercentage : overall.percentage).toFixed(1)}
              </span>
              <span className="font-serif text-2xl font-semibold text-text-secondary">%</span>
            </div>

            {hasModifications ? (
              <div className="flex items-center justify-center gap-2.5 mt-2.5 text-xs">
                <span className="text-text-muted line-through">
                  Current: {overall.percentage.toFixed(1)}%
                </span>
                {hasDiff && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
                      isOverallPositive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    )}
                  >
                    {isOverallPositive ? (
                      <ArrowUpIcon className="h-3 w-3 stroke-[2.5]" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 stroke-[2.5]" />
                    )}
                    <span>{formattedDiff}</span>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-muted mt-2">
                Recorded standing • Adjust sessions below to predict
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border-subtle text-xs">
              <div className="rounded-lg bg-panel/40 p-2.5">
                <span className="eyebrow text-[9px] block mb-1">
                  {hasModifications ? 'Projected Attended' : 'Attended'}
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-serif text-xl font-semibold text-text-primary">
                    {hasModifications ? newOverallAttendedSum : overall.attended}
                  </span>
                  {hasModifications && newOverallAttendedSum !== overall.attended && (
                    <span className="text-[10px] text-ok font-semibold">
                      (+{newOverallAttendedSum - overall.attended})
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-panel/40 p-2.5">
                <span className="eyebrow text-[9px] block mb-1">
                  {hasModifications ? 'Projected Total' : 'Total Sessions'}
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-serif text-xl font-semibold text-text-primary">
                    {hasModifications ? newOverallTotalSum : overall.total}
                  </span>
                  {hasModifications && newOverallTotalSum !== overall.total && (
                    <span className="text-[10px] text-text-secondary font-semibold">
                      (+{newOverallTotalSum - overall.total})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown in simulation (hidden on mobile to keep interactive simulators immediately reachable) */}
          <div className="hidden lg:block ledger-card p-6">
            <span className="eyebrow text-[10px] block mb-1">Subject Impact</span>
            <h3 className="font-serif text-lg font-normal text-text-primary mb-4">
              Projected subject scores
            </h3>

            <div className="space-y-3">
              {predictedStats.map(s => {
                const diff = s.predicted.combined - s.combined.percentage;
                const absDiff = Math.abs(diff);
                const isPositive = diff > 0;
                const hasChanged = absDiff >= 0.05 && hasModifications;
                const displayPercentage = hasModifications ? s.predicted.combined : s.combined.percentage;

                return (
                  <div key={s.subjectId} className="p-3 rounded-lg border border-border-subtle bg-panel/20 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-medium text-text-primary truncate pr-2">{s.subjectName}</span>
                      <span className={cn('font-serif font-semibold text-sm tabular-nums', getColor(displayPercentage))}>
                        {displayPercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-2">
                      {hasChanged ? (
                        <>
                          <span className="line-through">Base: {s.combined.percentage.toFixed(1)}%</span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                              isPositive
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            )}
                          >
                            {isPositive ? (
                              <ArrowUpIcon className="h-2.5 w-2.5 stroke-[2.5]" />
                            ) : (
                              <ArrowDownIcon className="h-2.5 w-2.5 stroke-[2.5]" />
                            )}
                            <span>{isPositive ? '+' : '-'}{absDiff.toFixed(1)}%</span>
                          </span>
                        </>
                      ) : (
                        <span>{s.lecture.attended + s.lab.attended} / {s.lecture.total + s.lab.total} sessions logged</span>
                      )}
                    </div>

                    <div className="h-1.5 rounded-full bg-track overflow-hidden">
                      <div
                        className={cn('h-full transition-all duration-500', getBgColor(displayPercentage))}
                        style={{ width: `${Math.min(displayPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulators (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {mode === 'overall' ? (
            <div className="ledger-card p-6 space-y-6">
              <div>
                <span className="eyebrow">Global Simulators</span>
                <h2 className="font-serif text-xl font-normal text-text-primary mt-1">
                  Adjust session counts
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Simulate attending or skipping upcoming classes across the semester without altering logged data.
                </p>
              </div>

              <div className="space-y-6 pt-2 border-t border-border-subtle">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <BookOpenIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
                    Lectures Simulation
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Stepper 
                      label="Attend" 
                      value={currentOverallMod.lecture.attend} 
                      onChange={(d) => handleUpdateOverall('lecture', 'attend', d)} 
                      color="text-ok"
                    />
                    <Stepper 
                      label="Bunk / Skip" 
                      value={currentOverallMod.lecture.skip} 
                      onChange={(d) => handleUpdateOverall('lecture', 'skip', d)} 
                      color="text-risk"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <FlaskConicalIcon className="h-4 w-4 text-forest-800 dark:text-accent" />
                    Labs Simulation
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Stepper 
                      label="Attend" 
                      value={currentOverallMod.lab.attend} 
                      onChange={(d) => handleUpdateOverall('lab', 'attend', d)} 
                      color="text-ok"
                    />
                    <Stepper 
                      label="Bunk / Skip" 
                      value={currentOverallMod.lab.skip} 
                      onChange={(d) => handleUpdateOverall('lab', 'skip', d)} 
                      color="text-risk"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {renderSection(
                'lecture',
                lectureEntries,
                <BookOpenIcon className="h-4 w-4" />
              )}

              {renderSection(
                'lab',
                labEntries,
                <FlaskConicalIcon className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ 
  label, 
  value, 
  onChange, 
  color,
}: { 
  label: string; 
  value: number; 
  onChange: (delta: number) => void;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg border border-border-subtle bg-panel/30">
      <span className="eyebrow text-[10px] mb-2">{label}</span>
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={() => onChange(-1)}
          disabled={value <= 0}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-border-strong bg-card text-text-secondary hover:bg-panel disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <MinusIcon className="h-3 w-3" />
        </button>
        <span className={cn('font-serif text-xl font-semibold', value > 0 ? color : 'text-text-primary')}>
          {value}
        </span>
        <button 
          onClick={() => onChange(1)}
          className="h-7 w-7 flex items-center justify-center rounded-md border border-border-strong bg-card text-text-secondary hover:bg-panel transition-colors"
        >
          <PlusIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
