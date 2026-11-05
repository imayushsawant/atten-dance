import { useState, useRef, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarRange, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { TimeWindowAnalytics } from '@/lib/api';
import { useTheme } from '@/lib/theme-provider';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';

function getChartStyles(resolved: 'dark' | 'light') {
  const isDark = resolved === 'dark';
  return {
    tick: isDark ? '#7F8C80' : '#8A8F85',
    grid: isDark ? '#233229' : '#E6E1D5',
    tooltipBg: isDark ? '#16211B' : '#FBF9F5',
    tooltipBorder: isDark ? '#33463B' : '#D9D3C4',
    tooltipColor: isDark ? '#F1EDE0' : '#1F3329',
    legendColor: isDark ? '#B7BFB2' : '#5E665E',
    lectures: isDark ? '#E8794F' : '#25392F',
    labs: isDark ? '#9DB38A' : '#7A8B6A',
    ok: isDark ? '#9DB38A' : '#7A8B6A',
    warn: isDark ? '#E3B766' : '#D4A04A',
    risk: isDark ? '#E27D67' : '#C65F4A',
  };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysBetween(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function CalendarPicker({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? new Date(value + 'T00:00:00') : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  useEffect(() => {
    if (value) setViewMonth(new Date(value + 'T00:00:00'));
  }, [value]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [viewMonth]);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  return (
    <div className={cn("flex-1 space-y-1.5 relative", open && "z-50")} ref={containerRef}>
      <label htmlFor={id} className="eyebrow text-[10px] block">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2.5 text-xs text-left outline-none transition-colors',
          open
            ? 'border-forest-800 dark:border-accent'
            : 'border-border-strong hover:border-text-muted',
          !value && 'text-text-muted'
        )}
      >
        <CalendarRange className="h-4 w-4 text-text-muted shrink-0" />
        <span className="font-medium text-text-primary">{value ? formatDate(value) : 'Pick date'}</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[100] mt-2 w-full min-w-[280px] ledger-card p-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-subtle">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-panel hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-serif text-sm font-medium text-text-primary">
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-panel hover:text-text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1 text-center text-[10px] font-semibold text-text-muted uppercase">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, viewMonth);
              const today = isToday(day);
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    onChange(dateStr);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex items-center justify-center rounded-md py-1.5 text-xs font-medium transition-colors',
                    !inMonth && 'opacity-25',
                    isSelected
                      ? 'bg-forest-800 dark:bg-cta-bg text-text-on-dark font-semibold'
                      : 'hover:bg-panel text-text-primary',
                    today && !isSelected && 'text-forest-800 dark:text-accent font-semibold ring-1 ring-border-strong'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimeWindowPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState<TimeWindowAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { resolved } = useTheme();

  async function handleAnalyze() {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be before or equal to end date.');
      return;
    }

    setError(null);
    setLoading(true);
    setHasSearched(true);

    try {
      const active = await api.semesters.getActive();
      if (!active) {
        setError('No active semester found. Please activate a semester first.');
        setAnalytics(null);
        return;
      }
      const data = await api.analytics.getTimeWindow(active.id, startDate, endDate);
      setAnalytics(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch analytics.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }

  const cs = getChartStyles(resolved);

  const barChartData = analytics
    ? analytics.stats.map((s) => ({
        name: s.subjectName.length > 12 ? s.subjectName.substring(0, 12) + '…' : s.subjectName,
        Lectures: s.lecture.total > 0 ? Number(s.lecture.percentage.toFixed(1)) : null,
        Labs: s.lab.total > 0 ? Number(s.lab.percentage.toFixed(1)) : null,
      }))
    : [];

  const pieData = analytics
    ? [
        { name: 'Attended', value: analytics.overall.attended, fill: cs.ok },
        { name: 'Skipped', value: analytics.overall.total - analytics.overall.attended, fill: cs.risk },
      ].filter((d) => d.value > 0)
    : [];

  const tooltipStyle = {
    background: cs.tooltipBg,
    border: `1px solid ${cs.tooltipBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: cs.tooltipColor,
    boxShadow: 'none',
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Time Window</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Time window analysis
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Isolate attendance statistics over a specific date interval (e.g. past week or month).
        </p>
      </div>

      {/* Date Range Picker Card */}
      <div className="ledger-card p-6 relative z-20">
        <span className="eyebrow block mb-3">Select Date Range</span>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <CalendarPicker
            id="tw-start-date"
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />

          <div className="hidden sm:flex items-center pb-3 text-text-muted">
            <span className="h-px w-4 bg-border-strong" />
          </div>

          <CalendarPicker
            id="tw-end-date"
            label="End Date"
            value={endDate}
            onChange={setEndDate}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !startDate || !endDate}
            className="flex items-center justify-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-6 py-2.5 text-xs font-medium text-text-on-dark transition-opacity hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
          >
            {loading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-on-dark border-t-transparent" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            {loading ? 'Analyzing…' : 'Analyze Window'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-xs text-risk">{error}</p>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl shimmer" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && !analytics && !error && (
        <div className="ledger-card p-12 text-center">
          <CalendarRange className="h-10 w-10 text-text-muted mx-auto mb-2 opacity-50" />
          <h2 className="font-serif text-lg font-normal text-text-primary">No sessions logged in this window</h2>
          <p className="text-xs text-text-muted mt-1">Try expanding the date range.</p>
        </div>
      )}

      {/* Results */}
      {!loading && analytics && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Pill Bar */}
          <div className="ledger-panel p-4 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-forest-800 dark:text-accent" />
              <span className="font-medium text-text-primary">{formatDate(analytics.startDate)}</span>
              <span className="text-text-muted">→</span>
              <span className="font-medium text-text-primary">{formatDate(analytics.endDate)}</span>
            </div>
            <span className="text-border-strong">•</span>
            <span>{daysBetween(analytics.startDate, analytics.endDate)} days span</span>
            <span className="text-border-strong">•</span>
            <span>{analytics.overall.total} sessions conducted</span>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="ledger-card p-5 text-center">
              <span className="eyebrow text-[10px]">Window Overall</span>
              <div className="font-serif text-4xl font-semibold text-text-primary mt-2">
                {analytics.overall.percentage.toFixed(1)}%
              </div>
              <p className="text-xs text-text-muted mt-1">
                {analytics.overall.attended} / {analytics.overall.total} attended
              </p>
            </div>

            <div className="ledger-card p-5 text-center">
              <span className="eyebrow text-[10px]">Window Lectures</span>
              {(() => {
                const lTotal = analytics.stats.reduce((a, s) => a + s.lecture.total, 0);
                const lAttended = analytics.stats.reduce((a, s) => a + s.lecture.attended, 0);
                const lPct = lTotal > 0 ? (lAttended / lTotal) * 100 : 100;
                return (
                  <>
                    <div className="font-serif text-4xl font-semibold text-text-primary mt-2">
                      {lPct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {lAttended} / {lTotal} attended
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="ledger-card p-5 text-center">
              <span className="eyebrow text-[10px]">Window Labs</span>
              {(() => {
                const labTotal = analytics.stats.reduce((a, s) => a + s.lab.total, 0);
                const labAttended = analytics.stats.reduce((a, s) => a + s.lab.attended, 0);
                const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;
                return (
                  <>
                    <div className="font-serif text-4xl font-semibold text-text-primary mt-2">
                      {labPct.toFixed(1)}%
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {labAttended} / {labTotal} attended
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="ledger-card p-6">
              <span className="eyebrow">Window Breakdown</span>
              <h3 className="font-serif text-lg font-normal text-text-primary mt-1 mb-4">
                Lectures vs Labs
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
                    <XAxis dataKey="name" tick={{ fill: cs.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: cs.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="Lectures" fill={cs.lectures} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Labs" fill={cs.labs} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ledger-card p-6">
              <span className="eyebrow">Window Ratio</span>
              <h3 className="font-serif text-lg font-normal text-text-primary mt-1 mb-4">
                Attended vs Skipped
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: cs.legendColor }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
