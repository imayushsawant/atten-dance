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
import { BookOpen, FlaskConical, TrendingUp, TrendingDown, CalendarRange, Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';

function getChartStyles(resolved: 'dark' | 'light') {
  const isDark = resolved === 'dark';
  return {
    tick: isDark ? '#737373' : '#78716C',
    grid: isDark ? '#1F1F1F' : '#E7E5E4',
    tooltipBg: isDark ? '#141414' : '#F5F5F4',
    tooltipBorder: isDark ? '#1F1F1F' : '#E7E5E4',
    tooltipColor: isDark ? '#E5E5E5' : '#1C1917',
    legendColor: isDark ? '#737373' : '#78716C',
    success: '#10b981',
    danger: '#ef4444',
    accent1: '#0ea5e9',
    accent2: '#8b5cf6',
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

/* ─── Inline Calendar Picker ────────────────────────────── */

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

  // Close on click outside
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

  // Sync viewMonth when value changes externally
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
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm text-left outline-none transition-all',
          open
            ? 'border-primary ring-2 ring-primary/40'
            : 'border-border hover:border-primary/40',
          !value && 'text-muted-foreground'
        )}
      >
        <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
        {value ? formatDate(value) : 'Pick a date'}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[280px] glass rounded-xl p-4 shadow-2xl border border-border animate-fade-in">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold">
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
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
                    'flex items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-all',
                    !inMonth && 'opacity-25',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary',
                    today && !isSelected && 'text-primary font-bold ring-1 ring-primary/30'
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
  const tooltipStyle = {
    background: cs.tooltipBg,
    border: `1px solid ${cs.tooltipBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: cs.tooltipColor,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Time Window
        </h1>
        <p className="text-muted-foreground">
          Analyze attendance for a specific time period
        </p>
      </div>

      {/* Date Range Picker Card */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Select Date Range</h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <CalendarPicker
            id="tw-start-date"
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
          />

          <div className="hidden sm:flex items-center pb-2.5">
            <div className="w-6 h-px bg-border" />
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
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed glow-primary sm:w-auto"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-72 rounded-xl shimmer ${i === 2 ? 'lg:col-span-2' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && !analytics && !error && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] animate-fade-in">
          <CalendarRange className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium">No data found</p>
          <p className="text-sm text-muted-foreground">Try a different date range.</p>
        </div>
      )}

      {/* Results */}
      {!loading && analytics && (
        <div className="space-y-6 animate-fade-in">
          {/* Date Range Banner */}
          <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              <span className="font-semibold">{formatDate(analytics.startDate)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold">{formatDate(analytics.endDate)}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{daysBetween(analytics.startDate, analytics.endDate)} days span</span>
              <span>•</span>
              <span>{analytics.daysWithRecords} days with records</span>
              <span>•</span>
              <span>{analytics.overall.total} total sessions</span>
            </div>
          </div>

          {/* Overall Stats Row */}
          <OverallStats analytics={analytics} />

          {/* Charts */}
          <Charts analytics={analytics} cs={cs} tooltipStyle={tooltipStyle} />

          {/* Subject-wise Breakdown */}
          <SubjectBreakdown stats={analytics.stats} threshold={analytics.threshold} />
        </div>
      )}
    </div>
  );
}

/* ─── Overall Stats Row ─────────────────────────────────── */

function OverallStats({ analytics }: { analytics: TimeWindowAnalytics }) {
  const { stats, overall, threshold } = analytics;

  const lTotal = stats.reduce((a, s) => a + s.lecture.total, 0);
  const lAttended = stats.reduce((a, s) => a + s.lecture.attended, 0);
  const lPct = lTotal > 0 ? (lAttended / lTotal) * 100 : 100;

  const labTotal = stats.reduce((a, s) => a + s.lab.total, 0);
  const labAttended = stats.reduce((a, s) => a + s.lab.attended, 0);
  const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="glass rounded-xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall</p>
        <p className={`text-4xl font-bold ${overall.percentage >= threshold ? 'text-success' : 'text-danger'}`}>
          {overall.percentage.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {overall.attended}/{overall.total} sessions
        </p>
      </div>
      <div className="glass rounded-xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lectures Only</p>
        <p className={`text-4xl font-bold ${lPct >= threshold ? 'text-success' : 'text-danger'}`}>
          {lPct.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {lAttended}/{lTotal} lectures
        </p>
      </div>
      <div className="glass rounded-xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Labs Only</p>
        <p className={`text-4xl font-bold ${labPct >= threshold ? 'text-success' : 'text-danger'}`}>
          {labPct.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {labAttended}/{labTotal} labs
        </p>
      </div>
    </div>
  );
}

/* ─── Charts Grid ───────────────────────────────────────── */

function Charts({
  analytics,
  cs,
  tooltipStyle,
}: {
  analytics: TimeWindowAnalytics;
  cs: ReturnType<typeof getChartStyles>;
  tooltipStyle: React.CSSProperties;
}) {
  const { stats, threshold } = analytics;

  const barChartData = stats.map((s) => ({
    name: s.subjectName.length > 10 ? s.subjectName.substring(0, 10) + '…' : s.subjectName,
    Lectures: s.lecture.total > 0 ? s.lecture.percentage : null,
    Labs: s.lab.total > 0 ? s.lab.percentage : null,
  }));

  const overall = analytics.overall;
  const pieData = [
    { name: 'Attended', value: overall.attended, fill: cs.success },
    { name: 'Skipped', value: overall.total - overall.attended, fill: cs.danger },
  ].filter((d) => d.value > 0);

  const trendData = stats.map((s) => ({
    name: s.subjectName.length > 10 ? s.subjectName.substring(0, 10) + '…' : s.subjectName,
    percentage: s.combined.percentage,
    threshold,
  }));

  // Don't render charts if there's no data at all
  if (overall.total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Bar Chart: Lectures vs Labs */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Lectures vs Labs by Subject</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
              <XAxis
                dataKey="name"
                tick={{ fill: cs.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: cs.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-secondary)' }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: cs.tooltipColor }}
                labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any) => [`${value.toFixed(1)}%`]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: cs.legendColor }}
              />
              <Bar dataKey="Lectures" fill={cs.accent1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Labs" fill={cs.accent2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Attended vs Skipped */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Attendance Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: cs.tooltipColor }}
                labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: cs.legendColor }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Performance Comparison */}
      <div className="glass rounded-xl p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold mb-4">Subject Performance Comparison</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
              <XAxis
                dataKey="name"
                tick={{ fill: cs.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: cs.tick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-border)', strokeWidth: 2, strokeDasharray: '4 4' }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: cs.tooltipColor }}
                labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: any) => [`${value.toFixed(1)}%`]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke={cs.accent1}
                strokeWidth={2}
                dot={{ fill: cs.accent1, r: 4 }}
                name="Attendance %"
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke={cs.danger}
                strokeWidth={1}
                strokeDasharray="8 4"
                dot={false}
                name="Threshold"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Subject-wise Breakdown ────────────────────────────── */

function SubjectBreakdown({
  stats,
  threshold,
}: {
  stats: TimeWindowAnalytics['stats'];
  threshold: number;
}) {
  // Filter out subjects with no records in this window
  const activeStats = stats.filter((s) => s.combined.total > 0);

  if (activeStats.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">Subject-wise Breakdown</h2>
      <div className="space-y-3">
        {activeStats.map((s) => (
          <div key={s.subjectId} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">{s.subjectName}</h3>
              <div className="flex items-center gap-2">
                {s.combined.percentage >= threshold ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span
                  className={`text-lg font-bold ${
                    s.combined.percentage >= threshold ? 'text-success' : 'text-danger'
                  }`}
                >
                  {s.combined.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Lectures */}
              {s.lecture.total > 0 && (
                <div className="rounded-lg border border-border bg-background/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Lectures
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${
                        s.lecture.percentage >= threshold ? 'text-success' : 'text-danger'
                      }`}>
                        {s.lecture.percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.lecture.attended}/{s.lecture.total} attended
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.lecture.percentage >= threshold ? 'bg-success' : 'bg-danger'
                      }`}
                      style={{ width: `${Math.min(s.lecture.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Labs */}
              {s.lab.total > 0 && (
                <div className="rounded-lg border border-border bg-background/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Labs
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${
                        s.lab.percentage >= threshold ? 'text-success' : 'text-danger'
                      }`}>
                        {s.lab.percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.lab.attended}/{s.lab.total} attended
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.lab.percentage >= threshold ? 'bg-success' : 'bg-danger'
                      }`}
                      style={{ width: `${Math.min(s.lab.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
