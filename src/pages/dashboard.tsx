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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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
        <h1 className="text-3xl font-bold mb-2 text-gradient">Welcome to Atten-Dance</h1>
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

  const { stats, overall, semester, threshold } = analytics;

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Attendance */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Overall
            </span>
            {overall.percentage >= threshold ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </div>
          <p className={`text-3xl font-bold ${overallColor}`}>
            {overall.percentage.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {overall.attended}/{overall.total} attended
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overall.percentage >= threshold ? 'bg-success' : 'bg-danger'
              }`}
              style={{ width: `${Math.min(overall.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Safe Skips */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Safe Skips
            </span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <p className={`text-3xl font-bold ${
            totalSafeSkips > 3 ? 'text-success' : totalSafeSkips > 0 ? 'text-warning' : 'text-danger'
          }`}>
            {totalSafeSkips === Infinity ? '∞' : totalSafeSkips}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            sessions you can safely skip
          </p>
        </div>

        {/* Subjects Below Threshold */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              At Risk
            </span>
            <BookOpen className="h-4 w-4 text-warning" />
          </div>
          <p className={`text-3xl font-bold ${subjectsBelow > 0 ? 'text-danger' : 'text-success'}`}>
            {subjectsBelow}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            subjects below {threshold}%
          </p>
        </div>

        {/* Total Subjects */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Subjects
            </span>
            <FlaskConical className="h-4 w-4 text-chart-4" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            in {semester.name}
          </p>
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
                  tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'oklch(0.65 0.01 260)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(0.2 0.005 260)',
                    border: '1px solid oklch(0.3 0.01 260)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'oklch(0.985 0 0)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                />
                <Bar dataKey="combined" radius={[6, 6, 0, 0]} name="Combined">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.combined >= threshold
                          ? 'oklch(0.7 0.18 150)'
                          : entry.combined >= threshold - 10
                            ? 'oklch(0.75 0.15 60)'
                            : 'oklch(0.6 0.2 25)'
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
            <div key={s.subjectId} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold truncate">{s.subjectName}</h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.combined.percentage >= threshold
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
                    <span className={`ml-auto font-medium ${
                      s.lecture.percentage >= threshold ? 'text-success' : 'text-danger'
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
                    <span className={`ml-auto font-medium ${
                      s.lab.percentage >= threshold ? 'text-success' : 'text-danger'
                    }`}>
                      {s.lab.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.combined.percentage >= threshold ? 'bg-success' : 'bg-danger'
                  }`}
                  style={{ width: `${Math.min(s.combined.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
