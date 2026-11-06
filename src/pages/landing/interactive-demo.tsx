import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  PenLineIcon,
  ShieldCheckIcon,
  HeartPulseIcon,
  CalculatorIcon,
  HistoryIcon,
  RotateCcwIcon,
  CheckIcon,
  CloseIcon,
  TargetIcon,
  ChevronRightIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/lib/api';
import {
  INITIAL_SEMESTER,
  INITIAL_SUBJECTS,
  INITIAL_TALLY,
  INITIAL_RECORDS,
  calculateDemoAnalytics,
  type SubjectTally,
} from './mock-data';

// Import the REAL production components
import InputPage from '@/pages/input';
import RecoveryPage from '@/pages/recovery';
import PredictorPage from '@/pages/predictor';
import HistoryPage from '@/pages/history';
import SafeSkipsPage from '@/pages/safe-skips';

type DemoTab = 'input' | 'recovery' | 'predictor' | 'history' | 'safe-skips';

interface TabDefinition {
  id: DemoTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  caption: string;
}

const DEMO_TABS: TabDefinition[] = [
  {
    id: 'input',
    label: '1. Mark Attendance',
    shortLabel: 'Mark Class',
    icon: PenLineIcon,
    caption: 'Mark sample sessions as Present (Save) or Bunked (Skip). Every click recalculates your real-time standing.',
  },
  {
    id: 'recovery',
    label: '2. Recovery Calculator',
    shortLabel: 'Recovery',
    icon: HeartPulseIcon,
    badge: 'Near Target',
    caption: 'See the exact consecutive lectures needed to recover standing. Notice how DBMS requires 4 classes to hit 75%.',
  },
  {
    id: 'predictor',
    label: '3. Attendance Predictor',
    shortLabel: 'Predictor',
    icon: CalculatorIcon,
    caption: 'Simulate hypothetical attendance scenarios across subjects or overall to forecast future margins.',
  },
  {
    id: 'history',
    label: '4. Verification History',
    shortLabel: 'History',
    icon: HistoryIcon,
    caption: 'A timestamped ledger of every session logged in this demo. Cross-check dates and remove entries.',
  },
  {
    id: 'safe-skips',
    label: '5. Safe Skips Buffer',
    shortLabel: 'Safe Skips',
    icon: ShieldCheckIcon,
    caption: 'Instant visibility into how many classes you can afford to miss right now without breaching target threshold.',
  },
];

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>('input');
  const [tally, setTally] = useState<SubjectTally>(INITIAL_TALLY);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [lastActionToast, setLastActionToast] = useState<string | null>(null);

  // In-memory analytics calculation
  const analytics = useMemo(() => {
    return calculateDemoAnalytics(INITIAL_SEMESTER, INITIAL_SUBJECTS, tally);
  }, [tally]);

  // Handle Save (Present) or Skip (Bunked)
  const handleAction = (subjectId: string, type: 'lecture' | 'lab', status: 'attended' | 'skipped') => {
    const subject = INITIAL_SUBJECTS.find((s) => s.id === subjectId);
    const subjectName = subject?.name || 'Subject';

    // 1. Update in-memory tally
    setTally((prev) => {
      const currentSubj = prev[subjectId] || {
        lecture: { attended: 0, total: 0 },
        lab: { attended: 0, total: 0 },
      };
      const currentKind = currentSubj[type];
      return {
        ...prev,
        [subjectId]: {
          ...currentSubj,
          [type]: {
            attended: currentKind.attended + (status === 'attended' ? 1 : 0),
            total: currentKind.total + 1,
          },
        },
      };
    });

    // 2. Append timestamped entry to demo History
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: `demo-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId,
      semesterId: INITIAL_SEMESTER.id,
      type,
      status,
      date: now.toISOString().split('T')[0],
      orderIndex: records.length,
      createdAt: now.toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);

    // 3. Trigger feedback toast
    const actionLabel = status === 'attended' ? 'Present (+Save)' : 'Bunked (+Skip)';
    setLastActionToast(`${subjectName} marked ${actionLabel}`);
    setTimeout(() => setLastActionToast(null), 3000);
  };

  // Reset demo in-memory state
  const handleReset = () => {
    setTally(INITIAL_TALLY);
    setRecords(INITIAL_RECORDS);
    setLastActionToast('Demo state reset to default');
    setTimeout(() => setLastActionToast(null), 2500);
  };

  // Quick Action Buttons
  const handleQuickAttendDBMS = () => {
    handleAction('sub-dbms', 'lecture', 'attended');
  };

  const handleQuickSkipOS = () => {
    handleAction('sub-os', 'lecture', 'skipped');
  };

  // Safe Skips / At Risk counts
  const atRiskCount = analytics.stats.filter(
    (s) => (s.lecture.total > 0 && s.lecture.percentage < analytics.threshold) ||
           (s.lab.total > 0 && s.lab.percentage < analytics.threshold)
  ).length;

  const currentOverallPct = analytics.overall.percentage;
  const isSafe = currentOverallPct >= analytics.threshold;

  return (
    <div className="w-full">
      {/* Outer Ledger Container */}
      <div className="ledger-card overflow-hidden shadow-xs border-border-strong/60 transition-all duration-300">
        {/* Top Control Bar: Context & Quick Actions */}
        <div className="border-b border-border-subtle bg-panel/50 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-forest-800 text-text-on-dark shadow-2xs">
              <TargetIcon className="h-3 w-3 text-accent" />
              <span>Interactive Live Demo</span>
            </span>
            <span className="text-xs text-text-secondary font-medium">
              Sample college semester • In-memory state
            </span>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Quick Test Bunk / Attend Triggers */}
            <button
              onClick={handleQuickAttendDBMS}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ok/40 bg-ok-bg/70 text-ok text-xs font-medium hover:bg-ok-bg transition-colors"
              title="Add 1 attended lecture to Database Systems"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              <span>Attend DBMS</span>
            </button>

            <button
              onClick={handleQuickSkipOS}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-risk/40 bg-risk-bg/70 text-risk text-xs font-medium hover:bg-risk-bg transition-colors"
              title="Add 1 skipped lecture to Operating Systems"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              <span>Bunk OS</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-strong bg-card text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
              title="Reset all demo actions"
            >
              <RotateCcwIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Live KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle bg-card border-b border-border-subtle">
          {/* Overall Attendance */}
          <div className="p-3.5 sm:p-4">
            <span className="eyebrow text-[10px] block mb-1">Overall Percentage</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-serif text-2xl sm:text-3xl font-semibold',
                  isSafe ? 'text-ok' : 'text-risk'
                )}
              >
                {currentOverallPct.toFixed(1)}%
              </span>
              <span className="text-[11px] text-text-muted">
                (target {analytics.threshold}%)
              </span>
            </div>
          </div>

          {/* Safe Skips Buffer */}
          <div className="p-3.5 sm:p-4">
            <span className="eyebrow text-[10px] block mb-1">Safe Skips</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">
                {analytics.overall.safeSkips.lecture}
              </span>
              <span className="text-[11px] text-text-muted">lectures buffer</span>
            </div>
          </div>

          {/* Subjects At Risk */}
          <div className="p-3.5 sm:p-4">
            <span className="eyebrow text-[10px] block mb-1">At Risk Subjects</span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  'font-serif text-2xl sm:text-3xl font-semibold',
                  atRiskCount > 0 ? 'text-risk' : 'text-ok'
                )}
              >
                {atRiskCount}
              </span>
              <span className="text-[11px] text-text-muted">
                {atRiskCount === 1 ? 'subject below 75%' : 'subjects below 75%'}
              </span>
            </div>
          </div>

          {/* Demo History Actions */}
          <div className="p-3.5 sm:p-4">
            <span className="eyebrow text-[10px] block mb-1">Logged Sessions</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary">
                {records.length}
              </span>
              <span className="text-[11px] text-text-muted">in session log</span>
            </div>
          </div>
        </div>

        {/* Action Toast Alert Banner */}
        {lastActionToast && (
          <div className="bg-ok-bg/30 border-b border-ok/30 px-4 py-2 flex items-center justify-between text-xs text-ok animate-fade-in font-medium">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ok animate-pulse" />
              <span>{lastActionToast}</span>
            </div>
            <span className="text-[11px] opacity-75">Updated all views in real time</span>
          </div>
        )}

        {/* Feature Navigation Tabs */}
        <div className="border-b border-border-subtle bg-panel/30 overflow-x-auto hide-scrollbar">
          <div className="flex p-2 gap-1.5 min-w-max">
            {DEMO_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border',
                    isActive
                      ? 'bg-card text-text-primary border-border-strong shadow-xs font-semibold'
                      : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-card/60'
                  )}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      isActive ? 'text-forest-800 dark:text-accent' : 'text-text-muted'
                    )}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-warn/15 text-warn border border-warn/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Feature Caption */}
        <div className="bg-card px-5 py-3 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary mr-1.5">
              {DEMO_TABS.find((t) => t.id === activeTab)?.shortLabel}:
            </span>
            {DEMO_TABS.find((t) => t.id === activeTab)?.caption}
          </div>
          <span className="text-[11px] text-text-muted shrink-0">
            Real production UI component
          </span>
        </div>

        {/* Production Component Render Area */}
        <div className="p-4 sm:p-6 md:p-8 bg-page/40 min-h-[460px] overflow-hidden">
          {activeTab === 'input' && (
            <div className="animate-fade-in">
              <InputPage
                injectedSubjects={INITIAL_SUBJECTS}
                injectedRecords={records}
                onDemoAction={handleAction}
                isDemo={true}
                hideHeader={true}
              />
            </div>
          )}

          {activeTab === 'recovery' && (
            <div className="animate-fade-in">
              <RecoveryPage
                injectedAnalytics={analytics}
                isDemo={true}
                hideHeader={true}
              />
            </div>
          )}

          {activeTab === 'predictor' && (
            <div className="animate-fade-in">
              <PredictorPage
                injectedAnalytics={analytics}
                isDemo={true}
                hideHeader={true}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <HistoryPage
                injectedSubjects={INITIAL_SUBJECTS}
                injectedRecords={records}
                onDeleteRecord={(id) => {
                  setRecords((prev) => prev.filter((r) => r.id !== id));
                  setLastActionToast('Record deleted from verification log');
                  setTimeout(() => setLastActionToast(null), 2500);
                }}
                isDemo={true}
                hideHeader={true}
              />
            </div>
          )}

          {activeTab === 'safe-skips' && (
            <div className="animate-fade-in">
              <SafeSkipsPage
                injectedAnalytics={analytics}
                isDemo={true}
                hideHeader={true}
              />
            </div>
          )}
        </div>

        {/* Demo Footer & Immediate CTA Banner */}
        <div className="p-5 sm:p-6 bg-card border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <span>Sample data. Sign up to track your own courses.</span>
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              All demo interactions are client-side. Refreshing resets the session.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/login?mode=signup"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-forest-800 dark:bg-cta-bg px-5 py-2.5 text-xs font-medium text-text-on-dark hover:opacity-95 transition-opacity shadow-xs"
            >
              <span>Sign up to track your own</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/login?mode=login"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-border-strong text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-panel transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
