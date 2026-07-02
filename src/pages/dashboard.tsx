import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  BarChart3,
  PenLine,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  BookOpen,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
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
  Cell,
} from 'recharts';

function getChartStyles(resolved: 'dark' | 'light') {
  const isDark = resolved === 'dark';
  return {
    tick: isDark ? '#737373' : '#78716C',
    tooltipBg: isDark ? '#141414' : '#F5F5F4',
    tooltipBorder: isDark ? '#1F1F1F' : '#E7E5E4',
    tooltipColor: isDark ? '#E5E5E5' : '#1C1917',
    success: isDark ? '#3ECF71' : '#22C55E',
    warning: isDark ? '#D4A843' : '#CA8A04',
    danger: isDark ? '#E8665A' : '#DC4A3A',
  };
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSemester, setNoSemester] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (noSemester) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <GraduationCap className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Atten-Dance</h1>
        <p className="text-muted-foreground mb-1 text-lg">Because college makes you dance for attendance 💃</p>
        <p className="text-muted-foreground mb-8">Create your first semester to get started.</p>
        <Link
          to="/semesters/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 glow-primary"
        >
          <GraduationCap className="h-4 w-4" />
          Create Semester
        </Link>
      </div>
    );
  }

  if (!analytics) return null;

  const { resolved } = useTheme();
  const { stats, overall, semester, threshold } = analytics;
  const cs = getChartStyles(resolved);

  const overallColor =
    overall.percentage >= threshold
      ? 'text-success'
      : overall.percentage >= threshold - 10
        ? 'text-warning'
        : 'text-danger';

  const totalSafeSkips = Math.min(
    ...stats.map((s) => s.safeSkips.combined)
  );

  const subjectsBelow = stats.filter(
    (s) => s.combined.percentage < threshold
  ).length;

  const chartData = stats.map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.substring(0, 12) + '…' : s.subjectName,
    lectures: s.lecture.percentage,
    labs: s.lab.percentage,
    combined: s.combined.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {semester.name} — {overall.total} sessions logged
        </p>
      </div>

      {/* Hero Stats Layout */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Massive Overall Hero */}
        <Link to="/analytics" className="relative flex flex-col items-center justify-center p-8 lg:w-1/3 group hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 rounded-[3rem] bg-card opacity-5 blur-3xl transition-all duration-700 group-hover:opacity-10"
               style={{ backgroundColor: overall.percentage >= threshold ? 'var(--color-success)' : 'var(--color-danger)' }} />
          
          <div className="relative z-10 text-center space-y-2">
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
              Overall
            </span>
            <div className="flex items-center justify-center">
              <p className={`text-7xl font-black tracking-tighter ${overallColor}`}>
                {overall.percentage.toFixed(1)}%
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 mt-4">
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {overall.attended} / {overall.total} Sessions
              </p>
              {(() => {
                const lTotal = stats.reduce((a, s) => a + s.lecture.total, 0);
                const lAttended = stats.reduce((a, s) => a + s.lecture.attended, 0);
                const labTotal = stats.reduce((a, s) => a + s.lab.total, 0);
                const labAttended = stats.reduce((a, s) => a + s.lab.attended, 0);
                return (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70 group-hover:text-foreground/70 transition-colors">
                    {lTotal > 0 && <span>{lAttended}/{lTotal} Lectures</span>}
                    {lTotal > 0 && labTotal > 0 && <span>•</span>}
                    {labTotal > 0 && <span>{labAttended}/{labTotal} Labs</span>}
                  </div>
                );
              })()}
            </div>
          </div>
        </Link>

        {/* Secondary Glass Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:w-2/3">
          {/* Safe Skips */}
          <Link to="/safe-skips" className="glass rounded-3xl p-6 block hover:scale-[1.02] transition-transform duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 group-hover:glow-success transition-all">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Safe Skips
              </span>
            </div>
            <p className={`text-4xl font-black tracking-tighter ${totalSafeSkips > 3 ? 'text-success' : totalSafeSkips > 0 ? 'text-warning' : 'text-danger'}`}>
              {totalSafeSkips === Infinity ? '∞' : totalSafeSkips}
            </p>
          </Link>

          {/* Subjects Below Threshold */}
          <Link to="/recovery" className="glass rounded-3xl p-6 block hover:scale-[1.02] transition-transform duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 group-hover:glow-danger transition-all">
                <BookOpen className="h-5 w-5 text-danger" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                At Risk
              </span>
            </div>
            <p className={`text-4xl font-black tracking-tighter ${subjectsBelow > 0 ? 'text-danger' : 'text-success'}`}>
              {subjectsBelow}
            </p>
          </Link>

          {/* Total Subjects */}
          <Link to="/calendar" className="glass rounded-3xl p-6 block hover:scale-[1.02] transition-transform duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 group-hover:glow-primary transition-all">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Subjects
              </span>
            </div>
            <p className="text-4xl font-black tracking-tighter text-foreground">
              {stats.length}
            </p>
          </Link>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Attendance by Subject</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
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
                  contentStyle={{
                    background: cs.tooltipBg,
                    border: `1px solid ${cs.tooltipBorder}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: cs.tooltipColor,
                  }}
                  itemStyle={{ color: cs.tooltipColor }}
                  labelStyle={{ color: cs.tooltipColor, fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Bar dataKey="combined" radius={[6, 6, 0, 0]} name="Combined">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.combined >= threshold
                          ? cs.success
                          : entry.combined >= threshold - 10
                            ? cs.warning
                            : cs.danger
                      }
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Above {threshold}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Near {threshold}%
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> Below {threshold}%
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          to="/input"
          className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-secondary/50 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Log Attendance</p>
            <p className="text-xs text-muted-foreground">Record today's sessions</p>
          </div>
        </Link>
        <Link
          to="/analytics"
          className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-secondary/50 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15 group-hover:bg-chart-2/25 transition-colors">
            <BarChart3 className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="text-sm font-semibold">View Analytics</p>
            <p className="text-xs text-muted-foreground">Detailed breakdowns</p>
          </div>
        </Link>
        <Link
          to="/safe-skips"
          className="flex items-center gap-3 glass rounded-xl p-4 hover:bg-secondary/50 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 group-hover:bg-success/25 transition-colors">
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold">Safe Skips</p>
            <p className="text-xs text-muted-foreground">Plan your bunks wisely</p>
          </div>
        </Link>
      </div>

      {/* Subject Quick Stats */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Subject Overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Link to="/calendar" key={s.subjectId} className="glass rounded-xl p-4 block hover:bg-secondary/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{s.subjectName}</h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.combined.percentage >= threshold
                      ? 'bg-success/15 text-success'
                      : s.combined.percentage >= threshold - 10
                        ? 'bg-warning/15 text-warning'
                        : 'bg-danger/15 text-danger'
                    }`}
                >
                  {s.combined.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-1.5">
                {s.lecture.total > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Lectures:</span>
                    <span className="font-medium">{s.lecture.attended}/{s.lecture.total}</span>
                    <span className={`ml-auto font-medium ${s.lecture.percentage >= threshold ? 'text-success' : 'text-danger'
                      }`}>
                      {s.lecture.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
                {s.lab.total > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <FlaskConical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Labs:</span>
                    <span className="font-medium">{s.lab.attended}/{s.lab.total}</span>
                    <span className={`ml-auto font-medium ${s.lab.percentage >= threshold ? 'text-success' : 'text-danger'
                      }`}>
                      {s.lab.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${s.combined.percentage >= threshold ? 'bg-success' : 'bg-danger'
                    }`}
                  style={{ width: `${Math.min(s.combined.percentage, 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
