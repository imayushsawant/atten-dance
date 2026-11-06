import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpenIcon,
  FlaskConicalIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChevronRightIcon,
} from '@/components/icons';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';
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
    tick: isDark ? '#7F8C80' : '#8A8F85',
    grid: isDark ? '#233229' : '#E6E1D5',
    tooltipBg: isDark ? '#16211B' : '#FBF9F5',
    tooltipBorder: isDark ? '#33463B' : '#D9D3C4',
    tooltipColor: isDark ? '#F1EDE0' : '#1F3329',
    legendColor: isDark ? '#B7BFB2' : '#5E665E',
    lectures: isDark ? '#E8794F' : '#25392F', // Forest or terracotta accent
    labs: isDark ? '#9DB38A' : '#7A8B6A',     // Sage
    ok: isDark ? '#9DB38A' : '#7A8B6A',
    warn: isDark ? '#E3B766' : '#D4A04A',
    risk: isDark ? '#E27D67' : '#C65F4A',
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolved } = useTheme();

  async function loadAnalytics() {
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

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-9 w-56 rounded shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-xl shimmer" />
          <div className="h-80 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto py-12">
        <span className="eyebrow mb-2">No Active Semester</span>
        <h1 className="font-serif text-2xl font-normal text-text-primary mb-2">
          Analytics Unavailable
        </h1>
        <p className="text-sm text-text-secondary">
          Create or select an active semester to view performance statistics.
        </p>
      </div>
    );
  }

  const { stats, overall, threshold, semester } = analytics;
  const cs = getChartStyles(resolved);

  const barChartData = stats.map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.substring(0, 12) + '…' : s.subjectName,
    Lectures: s.lecture.total > 0 ? Number(s.lecture.percentage.toFixed(1)) : null,
    Labs: s.lab.total > 0 ? Number(s.lab.percentage.toFixed(1)) : null,
  }));

  const pieData = [
    { name: 'Attended', value: overall.attended, fill: cs.ok },
    { name: 'Skipped', value: overall.total - overall.attended, fill: cs.risk },
  ].filter((d) => d.value > 0);

  const trendData = stats.map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.substring(0, 12) + '…' : s.subjectName,
    percentage: Number(s.combined.percentage.toFixed(1)),
    threshold,
  }));

  const tooltipStyle = {
    background: cs.tooltipBg,
    border: `1px solid ${cs.tooltipBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: cs.tooltipColor,
    boxShadow: 'none',
  };

  const lTotal = stats.reduce((a, s) => a + s.lecture.total, 0);
  const lAttended = stats.reduce((a, s) => a + s.lecture.attended, 0);
  const lPct = lTotal > 0 ? (lAttended / lTotal) * 100 : 100;

  const labTotal = stats.reduce((a, s) => a + s.lab.total, 0);
  const labAttended = stats.reduce((a, s) => a + s.lab.attended, 0);
  const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="eyebrow">Workspace / Analytics</span>
        <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
          Performance breakdown
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review subject comparisons, lecture vs lab ratios, and cumulative attendance trends.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card p-6 text-center">
          <span className="eyebrow text-[10px]">
            Overall Standing
          </span>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className={cn(
              'font-serif text-4xl sm:text-5xl font-semibold tracking-tight',
              overall.percentage >= threshold ? 'text-ok' : overall.percentage >= threshold - 5 ? 'text-warn' : 'text-risk'
            )}>
              {overall.percentage.toFixed(1)}
            </span>
            <span className="font-serif text-2xl font-semibold text-text-secondary">%</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            {overall.attended} / {overall.total} total sessions
          </p>
        </div>

        <div className="ledger-card p-6 text-center">
          <span className="eyebrow text-[10px]">Lectures Only</span>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className={cn(
              'font-serif text-4xl sm:text-5xl font-semibold tracking-tight',
              lPct >= threshold ? 'text-ok' : lPct >= threshold - 5 ? 'text-warn' : 'text-risk'
            )}>
              {lPct.toFixed(1)}
            </span>
            <span className="font-serif text-2xl font-semibold text-text-secondary">%</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            {lAttended} / {lTotal} lectures attended
          </p>
        </div>

        <div className="ledger-card p-6 text-center">
          <span className="eyebrow text-[10px]">Labs Only</span>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span className={cn(
              'font-serif text-4xl sm:text-5xl font-semibold tracking-tight',
              labPct >= threshold ? 'text-ok' : labPct >= threshold - 5 ? 'text-warn' : 'text-risk'
            )}>
              {labPct.toFixed(1)}
            </span>
            <span className="font-serif text-2xl font-semibold text-text-secondary">%</span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            {labAttended} / {labTotal} lab sessions attended
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart: Lectures vs Labs */}
        <div className="ledger-card p-6">
          <span className="eyebrow">Comparison</span>
          <h2 className="font-serif text-xl font-normal text-text-primary mt-1 mb-4">
            Lectures vs Labs by subject
          </h2>
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
                  cursor={{ fill: 'rgba(31,51,41,0.04)' }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: cs.tooltipColor }}
                  labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: cs.legendColor, paddingTop: '10px' }}
                />
                <Bar dataKey="Lectures" fill={cs.lectures} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Labs" fill={cs.labs} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Distribution */}
        <div className="ledger-card p-6">
          <span className="eyebrow">Distribution</span>
          <h2 className="font-serif text-xl font-normal text-text-primary mt-1 mb-4">
            Attended vs skipped ratio
          </h2>
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
                  wrapperStyle={{ fontSize: '11px', color: cs.legendColor, paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Comparison Line Chart */}
        <div className="ledger-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="eyebrow">Threshold Margin</span>
              <h2 className="font-serif text-xl font-normal text-text-primary mt-1">
                Distance to target threshold ({threshold}%)
              </h2>
            </div>
          </div>
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
                  cursor={{ stroke: cs.grid, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: cs.tooltipColor }}
                  labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value}%`]}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke={cs.lectures}
                  strokeWidth={2}
                  dot={{ fill: cs.lectures, r: 4 }}
                  name="Attendance %"
                />
                <Line
                  type="monotone"
                  dataKey="threshold"
                  stroke={cs.risk}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                  name="Threshold"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Subject Breakdown Cards */}
      <div>
        <div className="mb-4">
          <span className="eyebrow">Detailed Ledger</span>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-text-primary mt-1">
            Subject-wise attendance breakdown
          </h2>
        </div>

        <div className="space-y-3">
          {stats.map((s) => {
            const isOk = s.combined.percentage >= threshold;
            const isWarn = s.combined.percentage >= threshold - 5 && !isOk;
            const statusColor = isOk ? 'text-ok' : isWarn ? 'text-warn' : 'text-risk';

            return (
              <Link
                key={s.subjectId}
                to={`/history?subjectId=${s.subjectId}`}
                className="ledger-card p-5 block hover:border-border-strong transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-base font-medium text-text-primary group-hover:underline">
                      {s.subjectName}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Safe skips: {s.safeSkips.combined === Infinity ? '∞' : s.safeSkips.combined}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOk ? (
                      <TrendingUpIcon className="h-4 w-4 text-ok" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-risk" />
                    )}
                    <span className={cn('font-serif text-xl font-semibold tabular-nums', statusColor)}>
                      {s.combined.percentage.toFixed(1)}%
                    </span>
                    <ChevronRightIcon className="h-4 w-4 text-text-muted group-hover:translate-x-0.5 transition-transform ml-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lectures bar */}
                  {s.lecture.total > 0 && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-3">
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <BookOpenIcon className="h-3.5 w-3.5" />
                          <span className="font-semibold uppercase tracking-wider text-[10px]">Lectures</span>
                        </div>
                        <span className={cn(
                          'font-semibold tabular-nums',
                          s.lecture.percentage >= threshold ? 'text-ok' : 'text-risk'
                        )}>
                          {s.lecture.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {s.lecture.attended} of {s.lecture.total} attended
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-track overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            s.lecture.percentage >= threshold ? 'bg-ok' : 'bg-risk'
                          )}
                          style={{ width: `${Math.min(s.lecture.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Labs bar */}
                  {s.lab.total > 0 && (
                    <div className="rounded-lg border border-border-subtle bg-panel/30 p-3">
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <FlaskConicalIcon className="h-3.5 w-3.5" />
                          <span className="font-semibold uppercase tracking-wider text-[10px]">Labs</span>
                        </div>
                        <span className={cn(
                          'font-semibold tabular-nums',
                          s.lab.percentage >= threshold ? 'text-ok' : 'text-risk'
                        )}>
                          {s.lab.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {s.lab.attended} of {s.lab.total} attended
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-track overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            s.lab.percentage >= threshold ? 'bg-ok' : 'bg-risk'
                          )}
                          style={{ width: `${Math.min(s.lab.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
