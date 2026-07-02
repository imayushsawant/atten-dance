import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, FlaskConical, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics } from '@/lib/api';
import { useTheme } from '@/lib/theme-provider';
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
    success: isDark ? '#3ECF71' : '#22C55E',
    danger: isDark ? '#E8665A' : '#DC4A3A',
    accent1: isDark ? '#A3A3A3' : '#78716C',
    accent2: isDark ? '#93C5FD' : '#2563EB',
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolved } = useTheme();

  useEffect(() => {
    loadAnalytics();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 rounded-xl shimmer" />
          ))}
        </div>
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

  const { stats, overall, threshold } = analytics;
  const cs = getChartStyles(resolved);

  // Chart data
  const barChartData = stats.map((s) => ({
    name: s.subjectName.length > 10 ? s.subjectName.substring(0, 10) + '…' : s.subjectName,
    Lectures: s.lecture.total > 0 ? s.lecture.percentage : null,
    Labs: s.lab.total > 0 ? s.lab.percentage : null,
  }));

  const pieData = [
    { name: 'Attended', value: overall.attended, fill: cs.success },
    { name: 'Skipped', value: overall.total - overall.attended, fill: cs.danger },
  ].filter((d) => d.value > 0);

  // Compute cumulative trend from all records
  const trendData = (() => {
    if (overall.total === 0) return [];
    // We don't have raw records here, so we'll show per-subject data
    return stats.map((s) => ({
      name: s.subjectName.length > 10 ? s.subjectName.substring(0, 10) + '…' : s.subjectName,
      percentage: s.combined.percentage,
      threshold,
    }));
  })();

  const tooltipStyle = {
    background: cs.tooltipBg,
    border: `1px solid ${cs.tooltipBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: cs.tooltipColor,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed attendance breakdown — {analytics.semester.name}
        </p>
      </div>

      {/* Overall Stats Row */}
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
          {(() => {
            const lTotal = stats.reduce((a, s) => a + s.lecture.total, 0);
            const lAttended = stats.reduce((a, s) => a + s.lecture.attended, 0);
            const lPct = lTotal > 0 ? (lAttended / lTotal) * 100 : 100;
            return (
              <>
                <p className={`text-4xl font-bold ${lPct >= threshold ? 'text-success' : 'text-danger'}`}>
                  {lPct.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lAttended}/{lTotal} lectures
                </p>
              </>
            );
          })()}
        </div>
        <div className="glass rounded-xl p-5 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Labs Only</p>
          {(() => {
            const labTotal = stats.reduce((a, s) => a + s.lab.total, 0);
            const labAttended = stats.reduce((a, s) => a + s.lab.attended, 0);
            const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;
            return (
              <>
                <p className={`text-4xl font-bold ${labPct >= threshold ? 'text-success' : 'text-danger'}`}>
                  {labPct.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {labAttended}/{labTotal} labs
                </p>
              </>
            );
          })()}
        </div>
      </div>

      {/* Charts Grid */}
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
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

        {/* Pie Chart: Overall */}
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
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

      {/* Detailed Subject Cards */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Subject-wise Breakdown</h2>
        <div className="space-y-3">
          {stats.map((s) => (
            <Link key={s.subjectId} to={`/history?subjectId=${s.subjectId}`} className="glass rounded-xl p-5 block hover:scale-[1.01] transition-transform duration-300 group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{s.subjectName}</h3>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
