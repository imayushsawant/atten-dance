import { useEffect, useState } from 'react';
import { Wand2, Plus, Minus, RotateCcw, AlertTriangle, Check, X, BookOpen, FlaskConical, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics, Subject } from '@/lib/api';
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
  
  // 'overall' mode uses simple steppers. 'subject' mode uses EntryRow[].
  const [mode, setMode] = useState<'overall' | 'subject'>('overall');
  
  // State for overall mode
  const [modifiers, setModifiers] = useState<Modifiers>({});
  
  // State for subject mode
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
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="h-12 w-64 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-muted-foreground">{error || 'Failed to load analytics.'}</p>
      </div>
    );
  }

  const { stats, overall, threshold } = analytics;

  // --- CALCULATION LOGIC ---
  
  // Base overall totals from stats
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
    if (lecTotal > 0 && labTotal > 0) {
      combinedPct = (lecPct + labPct) / 2;
    } else if (lecTotal > 0) {
      combinedPct = lecPct;
    } else if (labTotal > 0) {
      combinedPct = labPct;
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
    // In subject mode, overall totals come from the updated subject totals
    newOverallLecAttended = predictedStats.reduce((acc, s) => acc + s.predicted.lecAttended, 0);
    newOverallLecTotal = predictedStats.reduce((acc, s) => acc + s.predicted.lecTotal, 0);
    newOverallLabAttended = predictedStats.reduce((acc, s) => acc + s.predicted.labAttended, 0);
    newOverallLabTotal = predictedStats.reduce((acc, s) => acc + s.predicted.labTotal, 0);
  } else {
    // In overall mode, add generic modifiers directly to overall totals
    const overallMod = modifiers['overall'] || defaultSubjectMod();
    newOverallLecAttended += overallMod.lecture.attend;
    newOverallLecTotal += overallMod.lecture.attend + overallMod.lecture.skip;
    
    newOverallLabAttended += overallMod.lab.attend;
    newOverallLabTotal += overallMod.lab.attend + overallMod.lab.skip;
  }

  // Calculate predicted overall percentage as average of overall lec and lab percentages
  const overallLecPct = newOverallLecTotal > 0 ? (newOverallLecAttended / newOverallLecTotal) * 100 : 100;
  const overallLabPct = newOverallLabTotal > 0 ? (newOverallLabAttended / newOverallLabTotal) * 100 : 100;
  
  let predictedOverallPercentage = 100;
  if (newOverallLecTotal > 0 && newOverallLabTotal > 0) {
    predictedOverallPercentage = (overallLecPct + overallLabPct) / 2;
  } else if (newOverallLecTotal > 0) {
    predictedOverallPercentage = overallLecPct;
  } else if (newOverallLabTotal > 0) {
    predictedOverallPercentage = overallLabPct;
  }

  const newOverallAttendedSum = newOverallLecAttended + newOverallLabAttended;
  const newOverallTotalSum = newOverallLecTotal + newOverallLabTotal;

  // --- ACTIONS ---

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

  // Subject Mode Actions
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

  // --- RENDERING ---

  const getColor = (val: number) => val >= threshold ? 'text-success' : val >= threshold - 10 ? 'text-warning' : 'text-danger';
  const getBgColor = (val: number) => val >= threshold ? 'bg-success' : val >= threshold - 10 ? 'bg-warning' : 'bg-danger';

  const overallDiff = predictedOverallPercentage - overall.percentage;
  const isOverallPositive = overallDiff >= 0;
  
  const currentOverallMod = modifiers['overall'] || defaultSubjectMod();

  // Filter entries for Subject Mode
  const lectureEntries = entries.filter((e) => e.type === 'lecture');
  const labEntries = entries.filter((e) => e.type === 'lab');

  function renderSection(
    type: 'lecture' | 'lab',
    sectionEntries: EntryRow[],
    icon: React.ReactNode,
    bgClass: string
  ) {
    if (sectionEntries.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bgClass)}>
            {icon}
          </div>
          <h2 className="text-sm font-semibold">
            {type === 'lecture' ? 'Lectures' : 'Labs'}
          </h2>
        </div>

        <div className="glass rounded-xl overflow-hidden divide-y divide-border">
          {sectionEntries.map((entry) => {
            const label = getEntryLabel(entry);
            const instancesOfKind = entries.filter(e => e.subjectId === entry.subjectId && e.type === entry.type);
            const canRemove = instancesOfKind.length > 1;

            return (
              <div
                key={entry.instanceId}
                className={cn(
                  'flex items-center gap-4 px-4 py-3.5 transition-colors',
                  entry.status === 'attended' && 'bg-success/[0.04]',
                  entry.status === 'skipped' && 'bg-danger/[0.04]'
                )}
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {entry.subjectName}
                  </p>
                  {label && (
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                      {label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {canRemove && (
                    <button
                      onClick={() => removeInstance(entry.instanceId)}
                      className="flex h-9 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/15 hover:text-danger transition-colors"
                      title="Remove this instance"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => addInstance(entry.subjectId, entry.subjectName, entry.type)}
                    className="flex h-9 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors"
                    title={`Add another ${type}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'attended')}
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-all',
                      entry.status === 'attended'
                        ? 'bg-success text-success-foreground shadow-sm shadow-success/25'
                        : 'bg-secondary text-muted-foreground hover:bg-success/15 hover:text-success'
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Present</span>
                  </button>
                  <button
                    onClick={() => setEntryStatus(entry.instanceId, 'skipped')}
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-all',
                      entry.status === 'skipped'
                        ? 'bg-danger text-danger-foreground shadow-sm shadow-danger/25'
                        : 'bg-secondary text-muted-foreground hover:bg-danger/15 hover:text-danger'
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Predictor
          </h1>
          <p className="text-muted-foreground">
            Test scenarios to see how they affect your percentages.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border">
            <button
              onClick={() => setMode('overall')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                mode === 'overall' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Overall Mode
            </button>
            <button
              onClick={() => setMode('subject')}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                mode === 'subject' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Subject Mode
            </button>
          </div>

          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors border border-transparent hover:border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Results Section (Now on the left, col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall Hero Card */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Predicted Overall</span>
                <div className="flex items-baseline justify-center gap-4">
                  <span className={`text-5xl font-black tracking-tighter ${getColor(predictedOverallPercentage)}`}>
                    {predictedOverallPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="line-through opacity-70 mr-2">{overall.percentage.toFixed(1)}%</span>
                  <span className={`font-medium ${isOverallPositive ? 'text-success' : 'text-danger'}`}>
                    {isOverallPositive ? '+' : ''}{overallDiff.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <div className="glass bg-background/50 rounded-2xl p-3 text-center flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Attended</p>
                  <p className="text-xl font-bold">{newOverallAttendedSum}</p>
                </div>
                <div className="glass bg-background/50 rounded-2xl p-3 text-center flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                  <p className="text-xl font-bold">{newOverallTotalSum}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {mode === 'subject' ? 'Predicted Breakdown' : 'Current Subjects'}
            </h2>
            <div className="flex flex-col gap-3">
              {predictedStats.map(s => {
                const diff = s.predicted.combined - s.combined.percentage;
                const isPositive = diff >= 0;
                // Only consider it changed if in subject mode and we actually changed it
                const hasChanged = mode === 'subject' && Math.abs(diff) > 0.01;

                return (
                  <div key={s.subjectId} className={`glass rounded-2xl p-4 transition-all duration-300 ${hasChanged ? 'border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-semibold truncate pr-2">{s.subjectName}</h3>
                      <span className={`text-base font-bold tracking-tight ${getColor(s.predicted.combined)}`}>
                        {s.predicted.combined.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="text-muted-foreground">Original: {s.combined.percentage.toFixed(1)}%</span>
                      {hasChanged && (
                        <span className={`font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {isPositive ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBgColor(s.predicted.combined)}`}
                        style={{ width: `${Math.min(s.predicted.combined, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls Section (Now on the right, col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {mode === 'overall' ? (
            <div className="glass rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Global Simulators</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                These adjustments apply to your overall attendance count equally. Use this for a quick estimation.
              </p>

              <div className="space-y-6 pt-4 border-t border-border/50">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground/80 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Lectures
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Stepper 
                      label="Attend" 
                      value={currentOverallMod.lecture.attend} 
                      onChange={(d) => handleUpdateOverall('lecture', 'attend', d)} 
                      color="text-success"
                      bg="bg-success/10"
                    />
                    <Stepper 
                      label="Skip" 
                      value={currentOverallMod.lecture.skip} 
                      onChange={(d) => handleUpdateOverall('lecture', 'skip', d)} 
                      color="text-danger"
                      bg="bg-danger/10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground/80 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-chart-4" />
                    Labs
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Stepper 
                      label="Attend" 
                      value={currentOverallMod.lab.attend} 
                      onChange={(d) => handleUpdateOverall('lab', 'attend', d)} 
                      color="text-success"
                      bg="bg-success/10"
                    />
                    <Stepper 
                      label="Skip" 
                      value={currentOverallMod.lab.skip} 
                      onChange={(d) => handleUpdateOverall('lab', 'skip', d)} 
                      color="text-danger"
                      bg="bg-danger/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {renderSection(
                'lecture',
                lectureEntries,
                <BookOpen className="h-5 w-5 text-primary" />,
                'bg-primary/10'
              )}

              {renderSection(
                'lab',
                labEntries,
                <FlaskConical className="h-5 w-5 text-chart-4" />,
                'bg-chart-4/10'
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
  bg 
}: { 
  label: string; 
  value: number; 
  onChange: (delta: number) => void;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-background border border-border/50">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={() => onChange(-1)}
          disabled={value <= 0}
          className="h-7 w-7 flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className={`text-lg font-bold ${value > 0 ? color : 'text-foreground'}`}>
          {value}
        </span>
        <button 
          onClick={() => onChange(1)}
          className={`h-7 w-7 flex items-center justify-center rounded-md ${bg} ${color} hover:opacity-80 transition-colors`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
