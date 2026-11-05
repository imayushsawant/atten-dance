import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import {
  PenLine,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Download,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSemester, setNoSemester] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [viewMode, setViewMode] = useState<'focus' | 'compact'>(() => {
    return (localStorage.getItem('dashboard_view_mode') as 'focus' | 'compact') || 'focus';
  });

  async function loadData() {
    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setNoSemester(true);
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

  useEffect(() => {
    loadData();
  }, []);

  function handleViewChange(mode: 'focus' | 'compact') {
    setViewMode(mode);
    localStorage.setItem('dashboard_view_mode', mode);
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importCode.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      await api.semesters.import(importCode.trim());
      setImportModalOpen(false);
      setImportCode('');
      navigate('/semesters');
    } catch (err: any) {
      setImportError(err.message || 'Failed to import semester');
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-10 w-72 rounded shimmer" />
          <div className="h-4 w-48 rounded shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-xl shimmer" />
      </div>
    );
  }

  if (noSemester) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-panel border border-border-subtle mb-6 text-forest-800 dark:text-accent">
            <GraduationCap className="h-8 w-8" />
          </div>
          <span className="eyebrow mb-2">Welcome to Atten-Dance</span>
          <h1 className="font-serif text-3xl font-normal text-text-primary mb-3">
            Your Attendance Ledger
          </h1>
          <p className="text-sm text-text-secondary mb-8 leading-relaxed">
            Because colleges make you dance for attendance. Set up your first semester to track sessions, forecast safe bunks, and preserve your attendance margin.
          </p>
          <Link
            to="/semesters/new"
            className="inline-flex items-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-6 py-3 text-sm font-medium text-text-on-dark transition-opacity hover:opacity-95"
          >
            <GraduationCap className="h-4 w-4" />
            Create Your First Semester
          </Link>
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <span className="text-xs text-text-muted">or</span>
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors underline underline-offset-4"
            >
              <Download className="h-3.5 w-3.5" />
              Import semester with share code
            </button>
          </div>
        </div>

        {importModalOpen && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="ledger-card w-full max-w-sm p-6">
              <div className="text-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-panel mx-auto mb-3 text-forest-800 dark:text-accent">
                  <Download className="h-6 w-6" />
                </div>
                <span className="eyebrow">Import</span>
                <h2 className="font-serif text-xl font-normal text-text-primary mt-1 mb-2">Import Semester</h2>
                <p className="text-xs text-text-secondary">
                  Enter the 6-character share code provided by a classmate.
                </p>
              </div>
              <form onSubmit={handleImport}>
                <input
                  type="text"
                  placeholder="CODE"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-border-strong bg-card px-4 py-3 text-center text-lg font-mono tracking-widest uppercase text-text-primary outline-none focus:border-forest-800 dark:focus:border-accent mb-2"
                  maxLength={6}
                  required
                />
                {importError && (
                  <p className="text-xs text-risk text-center mb-3">{importError}</p>
                )}
                <div className="flex gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setImportModalOpen(false);
                      setImportCode('');
                      setImportError('');
                    }}
                    className="flex-1 rounded-lg border border-border-strong py-2.5 text-xs font-medium text-text-secondary hover:bg-panel transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importCode.trim()}
                    className="flex-1 rounded-lg bg-forest-800 dark:bg-cta-bg text-text-on-dark py-2.5 text-xs font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  if (!analytics) return null;

  const { stats, overall, semester, threshold } = analytics;

  // Safe skips calculation
  const totalSafeSkips = semester.calculationMethod === 'total_sessions'
    ? analytics.overall.safeSkips.lecture
    : Math.min(...stats.map((s) => s.safeSkips.combined));

  const subjectsBelow = stats.filter((s) => s.combined.percentage < threshold).length;

  const lTotal = stats.reduce((a, s) => a + s.lecture.total, 0);
  const lAttended = stats.reduce((a, s) => a + s.lecture.attended, 0);
  const labTotal = stats.reduce((a, s) => a + s.lab.total, 0);
  const labAttended = stats.reduce((a, s) => a + s.lab.attended, 0);

  // Status color for overall
  const overallStatus =
    overall.percentage >= threshold
      ? 'ok'
      : overall.percentage >= threshold - 5
        ? 'warn'
        : 'risk';

  return (
    <div className="space-y-8">
      {/* ──────────────── Page Header ──────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border-subtle pb-6">
        <div>
          <div className="eyebrow mb-1">
            Attendance Ledger / {semester.name}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-text-primary">
            Know where you stand.
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            <span>
              {overall.total} sessions logged across {stats.length} subjects
            </span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-chip text-[10px] font-semibold tracking-wider uppercase text-forest-700 dark:text-text-primary">
              {semester.calculationMethod === 'total_sessions' ? 'Total Sessions' : '50 / 50 Split'}
            </span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span>Target: {threshold}%</span>
          </div>
        </div>

        {/* View Segmented Toggle (Focus / Compact) */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="eyebrow text-[10px]">View</span>
          <div className="flex items-center p-1 rounded-lg bg-chip border border-border-subtle text-xs">
            <button
              onClick={() => handleViewChange('focus')}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors',
                viewMode === 'focus'
                  ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              Focus
            </button>
            <button
              onClick={() => handleViewChange('compact')}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase transition-colors',
                viewMode === 'compact'
                  ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── Row 1: KPI Strip ──────────────── */}
      {viewMode === 'focus' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Card 1: Overall Attendance with Ring Chart (approx 4.5 / 12 cols) */}
          <div className="ledger-card p-6 lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow">Overall Attendance</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-serif text-4xl sm:text-5xl font-semibold text-text-primary tracking-tight">
                    {overall.percentage.toFixed(1)}
                  </span>
                  <span className="font-serif text-2xl font-semibold text-text-primary">%</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {semester.calculationMethod === 'total_sessions'
                    ? 'Raw attendance across all sessions'
                    : 'Weighted: 50% lectures + 50% labs'}
                </p>
              </div>

              {/* Circular Ring Chart */}
              <div className="shrink-0">
                <RingChart
                  percentage={overall.percentage}
                  threshold={threshold}
                  status={overallStatus}
                />
              </div>
            </div>

            {/* Sub-metrics breakdown */}
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="eyebrow text-[10px]">Lectures</span>
                <span className="font-semibold text-text-primary">
                  {lAttended} / {lTotal}
                </span>
              </div>
              <div className="h-3 w-px bg-border-subtle" />
              <div className="flex items-center gap-2">
                <span className="eyebrow text-[10px]">Labs</span>
                <span className="font-semibold text-text-primary">
                  {labAttended} / {labTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Safe Skips (approx 2.3 / 12 cols) */}
          <Link
            to="/safe-skips"
            className="ledger-card p-6 lg:col-span-2.5 flex flex-col justify-between hover:border-border-strong transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">Safe Skips</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ok-bg text-ok">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="font-serif text-4xl sm:text-5xl font-semibold text-text-primary tracking-tight">
                {totalSafeSkips === Infinity ? '∞' : totalSafeSkips}
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4 group-hover:text-text-primary transition-colors flex items-center justify-between">
              <span>Sessions you can miss</span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </p>
          </Link>

          {/* Card 3: At Risk (approx 2.3 / 12 cols) */}
          <Link
            to="/recovery"
            className="ledger-card p-6 lg:col-span-2.5 flex flex-col justify-between hover:border-border-strong transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">At Risk</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-risk-bg text-risk">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className={cn(
                'font-serif text-4xl sm:text-5xl font-semibold tracking-tight',
                subjectsBelow > 0 ? 'text-risk' : 'text-ok'
              )}>
                {subjectsBelow}
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4 group-hover:text-text-primary transition-colors flex items-center justify-between">
              <span>{subjectsBelow > 0 ? 'Below target threshold' : 'All subjects safe'}</span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
            </p>
          </Link>

          {/* Card 4: Total Subjects (approx 2.2 / 12 cols) */}
          <div className="ledger-card p-6 lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">Subjects</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chip text-text-secondary">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="font-serif text-4xl sm:text-5xl font-semibold text-text-primary tracking-tight">
                {stats.length}
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4">
              Registered this semester
            </p>
          </div>
        </div>
      ) : (
        /* Compact View Metric Row */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="ledger-card p-4">
            <span className="eyebrow text-[10px]">Overall</span>
            <div className="font-serif text-2xl font-semibold text-text-primary mt-1">
              {overall.percentage.toFixed(1)}%
            </div>
            <p className="text-[11px] text-text-muted mt-0.5 truncate">
              {overall.attended} / {overall.total} sessions
            </p>
          </div>

          <Link to="/safe-skips" className="ledger-card p-4 hover:border-border-strong transition-colors">
            <span className="eyebrow text-[10px]">Safe Skips</span>
            <div className="font-serif text-2xl font-semibold text-ok mt-1">
              {totalSafeSkips === Infinity ? '∞' : totalSafeSkips}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">Available to bunk</p>
          </Link>

          <Link to="/recovery" className="ledger-card p-4 hover:border-border-strong transition-colors">
            <span className="eyebrow text-[10px]">At Risk</span>
            <div className={cn(
              'font-serif text-2xl font-semibold mt-1',
              subjectsBelow > 0 ? 'text-risk' : 'text-ok'
            )}>
              {subjectsBelow}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">{subjectsBelow > 0 ? 'Needs attention' : 'All on track'}</p>
          </Link>

          <div className="ledger-card p-4">
            <span className="eyebrow text-[10px]">Subjects</span>
            <div className="font-serif text-2xl font-semibold text-text-primary mt-1">
              {stats.length}
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">Enrolled</p>
          </div>
        </div>
      )}

      {/* ──────────────── Row 2: Chart & Next Move (Focus View only) ──────────────── */}
      {viewMode === 'focus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Horizontal Bar Chart (8 cols on desktop) */}
          <div className="ledger-card p-6 lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <span className="eyebrow">Subject Performance</span>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-text-primary mt-1">
                    A subject-by-subject view
                  </h2>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ok" />
                    <span>Above {threshold}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-warn" />
                    <span>Near {threshold}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-risk" />
                    <span>Below {threshold}%</span>
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Rows */}
              <div className="space-y-4">
                {stats.map((s) => {
                  const pct = s.combined.percentage;
                  const isOk = pct >= threshold;
                  const isWarn = pct >= threshold - 5 && pct < threshold;
                  const barColor = isOk ? 'bg-ok' : isWarn ? 'bg-warn' : 'bg-risk';
                  const textColor = isOk ? 'text-ok' : isWarn ? 'text-warn' : 'text-risk';

                  return (
                    <div key={s.subjectId} className="flex items-center gap-3 text-sm">
                      {/* Subject Name Column */}
                      <div className="w-32 sm:w-48 lg:w-56 shrink-0 truncate font-medium text-text-primary" title={s.subjectName}>
                        {s.subjectName}
                      </div>

                      {/* Bar Track Area with gridlines */}
                      <div className="relative flex-1 h-3.5 rounded-xs bg-track overflow-hidden">
                        {/* 75% target threshold marker */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-border-strong z-10 opacity-70"
                          style={{ left: `${threshold}%` }}
                        />
                        {/* Colored progress bar with square edge */}
                        <div
                          className={cn('h-full transition-all duration-700 ease-out', barColor)}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      {/* Fixed-Width Value Column (56px) - Solves Issue #1: never overlaps 100%! */}
                      <div className={cn('w-14 shrink-0 text-right font-medium text-xs tabular-nums', textColor)}>
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gridline axis ticks at bottom */}
            <div className="mt-6 pt-3 border-t border-border-subtle flex items-center text-[10px] text-text-muted">
              <div className="w-32 sm:w-48 lg:w-56 shrink-0 text-text-muted uppercase tracking-wider font-semibold">
                Grid Scale
              </div>
              <div className="relative flex-1 flex justify-between px-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span className="font-semibold text-text-secondary">{threshold}% (Target)</span>
                <span>100%</span>
              </div>
              <div className="w-14 shrink-0" />
            </div>
          </div>

          {/* "Next Move" Panel (4 cols on desktop) */}
          <div className="ledger-panel p-6 lg:col-span-4 flex flex-col justify-between">
            <div>
              <span className="eyebrow">Next Move</span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-text-primary mt-1 mb-4">
                Recommended actions
              </h2>

              <div className="space-y-3">
                {/* 1. Primary CTA: Log Attendance */}
                <Link
                  to="/input"
                  className="flex items-center gap-3.5 p-3.5 rounded-lg bg-cta-bg text-cta-text hover:opacity-95 transition-all group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cta-tile text-cta-text">
                    <PenLine className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">Log Attendance</div>
                    <div className="text-xs text-sidebar-text-muted truncate">Record today's sessions</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-cta-text/70 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 2. Secondary CTA: Safe Skips */}
                <Link
                  to="/safe-skips"
                  className="flex items-center gap-3.5 p-3.5 rounded-lg bg-card border border-border-subtle text-text-primary hover:border-border-strong transition-all group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ok-bg text-ok">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">Safe Skips</div>
                    <div className="text-xs text-text-secondary truncate">
                      {totalSafeSkips > 0 ? `${totalSafeSkips} sessions safe to miss` : 'Calculate bunk buffers'}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 3. Secondary CTA: Recovery Plan */}
                <Link
                  to="/recovery"
                  className="flex items-center gap-3.5 p-3.5 rounded-lg bg-card border border-border-subtle text-text-primary hover:border-border-strong transition-all group"
                >
                  <div className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                    subjectsBelow > 0 ? 'bg-risk-bg text-risk' : 'bg-ok-bg text-ok'
                  )}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">Recovery Plan</div>
                    <div className="text-xs text-text-secondary truncate">
                      {subjectsBelow > 0 ? `${subjectsBelow} subject${subjectsBelow > 1 ? 's' : ''} below threshold` : 'All subjects above target'}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-text-muted mt-6">
              Keep records synced daily to ensure accurate calculation of attendance thresholds.
            </p>
          </div>
        </div>
      )}

      {/* ──────────────── Row 3: Subject Ledger Table ──────────────── */}
      <div className="ledger-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="eyebrow">Subject Ledger</span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-text-primary mt-1">
              Detailed breakdown
            </h2>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <span>Full Analytics</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-semibold tracking-[0.18em] text-text-muted uppercase">
                <th className="py-3 pr-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold text-right">Dashboard %</th>
                <th className="py-3 px-4 font-semibold text-right">Lectures</th>
                <th className="py-3 px-4 font-semibold text-right">Labs</th>
                <th className="py-3 pl-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {stats.map((s) => {
                const combinedPct = s.combined.percentage;
                const isBelow = combinedPct < threshold;
                const statusColor = isBelow
                  ? 'text-risk'
                  : combinedPct >= threshold + 5
                    ? 'text-ok'
                    : 'text-warn';

                return (
                  <tr key={s.subjectId} className="hover:bg-panel/40 transition-colors">
                    {/* Subject Name */}
                    <td className="py-3.5 pr-4 font-semibold text-text-primary">
                      <Link to="/calendar" className="hover:underline">
                        {s.subjectName}
                      </Link>
                    </td>

                    {/* Combined % */}
                    <td className={cn('py-3.5 px-4 text-right font-medium tabular-nums', statusColor)}>
                      {combinedPct.toFixed(1)}%
                    </td>

                    {/* Lectures breakdown */}
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums">
                      {s.lecture.total > 0 ? (
                        <span>
                          <span className="font-medium text-text-primary">
                            {s.lecture.attended}/{s.lecture.total}
                          </span>
                          <span className={cn(
                            'ml-1.5',
                            s.lecture.percentage < threshold ? 'text-risk font-semibold' : 'text-text-muted'
                          )}>
                            ({s.lecture.percentage.toFixed(0)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    {/* Labs breakdown */}
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums">
                      {s.lab.total > 0 ? (
                        <span>
                          <span className="font-medium text-text-primary">
                            {s.lab.attended}/{s.lab.total}
                          </span>
                          <span className={cn(
                            'ml-1.5',
                            s.lab.percentage < threshold ? 'text-risk font-semibold' : 'text-text-muted'
                          )}>
                            ({s.lab.percentage.toFixed(0)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 pl-4 text-right">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase',
                        isBelow ? 'bg-risk-bg text-risk' : 'bg-ok-bg text-ok'
                      )}>
                        {isBelow ? 'At Risk' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ──────────────── Pure SVG Ring Chart Component ────────────────
function RingChart({
  percentage,
  threshold,
  status,
}: {
  percentage: number;
  threshold: number;
  status: 'ok' | 'warn' | 'risk';
}) {
  const size = 106;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2; // ~47.5
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference;

  const colorClass =
    status === 'ok' ? 'stroke-ok' : status === 'warn' ? 'stroke-warn' : 'stroke-risk';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-track fill-none"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn('fill-none transition-all duration-700 ease-out', colorClass)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-serif text-lg font-semibold text-text-primary leading-tight">
          {percentage.toFixed(0)}%
        </span>
        <span className="text-[9px] font-semibold tracking-[0.14em] text-text-muted uppercase mt-0.5">
          Position
        </span>
      </div>
    </div>
  );
}
