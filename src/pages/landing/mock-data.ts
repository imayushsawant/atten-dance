import type { Analytics, AttendanceRecord, Semester, Subject } from '@/lib/api';

export const INITIAL_SEMESTER: Semester = {
  id: 'demo-semester',
  name: 'Fall 2026 Semester',
  isActive: true,
  threshold: 75,
  calculationMethod: 'split_average',
  createdAt: '2026-08-15T00:00:00Z',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-os',
    semesterId: 'demo-semester',
    name: 'Operating Systems',
    hasLecture: true,
    hasLab: true,
  },
  {
    id: 'sub-dbms',
    semesterId: 'demo-semester',
    name: 'Database Management Systems',
    hasLecture: true,
    hasLab: true,
  },
  {
    id: 'sub-cn',
    semesterId: 'demo-semester',
    name: 'Computer Networks',
    hasLecture: true,
    hasLab: true,
  },
  {
    id: 'sub-toc',
    semesterId: 'demo-semester',
    name: 'Theory of Computation',
    hasLecture: true,
    hasLab: false,
  },
];

export type SubjectTally = Record<
  string,
  {
    lecture: { attended: number; total: number };
    lab: { attended: number; total: number };
  }
>;

export const INITIAL_TALLY: SubjectTally = {
  'sub-os': {
    lecture: { attended: 18, total: 24 }, // 75.0% - Exact boundary (0 safe skips!)
    lab: { attended: 9, total: 10 },      // 90.0%
  },
  'sub-dbms': {
    lecture: { attended: 14, total: 20 }, // 70.0% - Danger (4 consecutive needed)
    lab: { attended: 8, total: 10 },      // 80.0%
  },
  'sub-cn': {
    lecture: { attended: 23, total: 26 }, // 88.5% - Safe buffer (4 safe skips)
    lab: { attended: 11, total: 12 },     // 91.7%
  },
  'sub-toc': {
    lecture: { attended: 19, total: 24 }, // 79.2% - 1 safe skip
    lab: { attended: 0, total: 0 },
  },
};

export const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec-1',
    subjectId: 'sub-dbms',
    semesterId: 'demo-semester',
    type: 'lecture',
    status: 'attended',
    date: '2026-11-06',
    orderIndex: 0,
    createdAt: '2026-11-06T09:00:00Z',
  },
  {
    id: 'rec-2',
    subjectId: 'sub-os',
    semesterId: 'demo-semester',
    type: 'lecture',
    status: 'skipped',
    date: '2026-11-05',
    orderIndex: 1,
    createdAt: '2026-11-05T11:00:00Z',
  },
  {
    id: 'rec-3',
    subjectId: 'sub-cn',
    semesterId: 'demo-semester',
    type: 'lab',
    status: 'attended',
    date: '2026-11-05',
    orderIndex: 2,
    createdAt: '2026-11-05T14:00:00Z',
  },
  {
    id: 'rec-4',
    subjectId: 'sub-toc',
    semesterId: 'demo-semester',
    type: 'lecture',
    status: 'attended',
    date: '2026-11-04',
    orderIndex: 3,
    createdAt: '2026-11-04T10:00:00Z',
  },
  {
    id: 'rec-5',
    subjectId: 'sub-dbms',
    semesterId: 'demo-semester',
    type: 'lecture',
    status: 'skipped',
    date: '2026-11-03',
    orderIndex: 4,
    createdAt: '2026-11-03T09:00:00Z',
  },
];

export function calculateDemoAnalytics(
  semester: Semester,
  subjects: Subject[],
  tally: SubjectTally
): Analytics {
  const threshold = semester.threshold;
  const thresholdRatio = threshold / 100;
  const isTotalSessions = semester.calculationMethod === 'total_sessions';

  const stats = subjects.map((subj) => {
    const sTally = tally[subj.id] || { lecture: { attended: 0, total: 0 }, lab: { attended: 0, total: 0 } };
    const lecAttended = subj.hasLecture ? sTally.lecture.attended : 0;
    const lecTotal = subj.hasLecture ? sTally.lecture.total : 0;
    const labAttended = subj.hasLab ? sTally.lab.attended : 0;
    const labTotal = subj.hasLab ? sTally.lab.total : 0;

    const lecPct = lecTotal > 0 ? (lecAttended / lecTotal) * 100 : 100;
    const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;

    const combinedAttended = lecAttended + labAttended;
    const combinedTotal = lecTotal + labTotal;

    let combinedPct: number;
    let lectureSafeSkips: number;
    let labSafeSkips: number;
    let combinedSafeSkips: number;
    let lectureRecovery: number;
    let labRecovery: number;

    if (isTotalSessions) {
      combinedPct = combinedTotal > 0 ? (combinedAttended / combinedTotal) * 100 : 100;
      combinedSafeSkips = combinedTotal > 0
        ? Math.max(0, Math.floor((combinedAttended - thresholdRatio * combinedTotal) / thresholdRatio))
        : 0;
      lectureSafeSkips = subj.hasLecture ? combinedSafeSkips : 0;
      labSafeSkips = subj.hasLab ? combinedSafeSkips : 0;

      const combinedNeeded = combinedPct < threshold && combinedTotal > 0
        ? Math.ceil((thresholdRatio * combinedTotal - combinedAttended) / (1 - thresholdRatio))
        : 0;
      lectureRecovery = subj.hasLecture ? combinedNeeded : 0;
      labRecovery = subj.hasLab ? combinedNeeded : 0;
    } else {
      if (lecTotal > 0 && labTotal > 0) {
        combinedPct = (lecPct + labPct) / 2;
      } else if (lecTotal > 0) {
        combinedPct = lecPct;
      } else {
        combinedPct = labPct;
      }

      lectureSafeSkips = lecTotal > 0
        ? Math.max(0, Math.floor((lecAttended - thresholdRatio * lecTotal) / thresholdRatio))
        : 0;
      labSafeSkips = labTotal > 0
        ? Math.max(0, Math.floor((labAttended - thresholdRatio * labTotal) / thresholdRatio))
        : 0;
      combinedSafeSkips = Math.min(
        subj.hasLecture ? lectureSafeSkips : Infinity,
        subj.hasLab ? labSafeSkips : Infinity
      );
      if (combinedSafeSkips === Infinity) combinedSafeSkips = 0;

      lectureRecovery = lecPct < threshold && lecTotal > 0
        ? Math.ceil((thresholdRatio * lecTotal - lecAttended) / (1 - thresholdRatio))
        : 0;
      labRecovery = labPct < threshold && labTotal > 0
        ? Math.ceil((thresholdRatio * labTotal - labAttended) / (1 - thresholdRatio))
        : 0;
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      lecture: { attended: lecAttended, total: lecTotal, percentage: Math.round(lecPct * 100) / 100 },
      lab: { attended: labAttended, total: labTotal, percentage: Math.round(labPct * 100) / 100 },
      combined: { attended: combinedAttended, total: combinedTotal, percentage: Math.round(combinedPct * 100) / 100 },
      safeSkips: { lecture: lectureSafeSkips, lab: labSafeSkips, combined: combinedSafeSkips },
      recovery: { lecture: lectureRecovery, lab: labRecovery },
    };
  });

  const totalLecAttended = stats.reduce((acc, s) => acc + s.lecture.attended, 0);
  const totalLecSessions = stats.reduce((acc, s) => acc + s.lecture.total, 0);
  const totalLabAttended = stats.reduce((acc, s) => acc + s.lab.attended, 0);
  const totalLabSessions = stats.reduce((acc, s) => acc + s.lab.total, 0);

  const overallLecPct = totalLecSessions > 0 ? (totalLecAttended / totalLecSessions) * 100 : 100;
  const overallLabPct = totalLabSessions > 0 ? (totalLabAttended / totalLabSessions) * 100 : 100;

  const totalAttended = totalLecAttended + totalLabAttended;
  const totalSessions = totalLecSessions + totalLabSessions;

  let overallPct: number;
  if (isTotalSessions) {
    overallPct = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 100;
  } else {
    overallPct = totalLecSessions > 0 && totalLabSessions > 0
      ? (overallLecPct + overallLabPct) / 2
      : (totalLecSessions > 0 ? overallLecPct : overallLabPct);
  }

  const overallLecSafe = totalLecSessions > 0
    ? Math.max(0, Math.floor((totalLecAttended - thresholdRatio * totalLecSessions) / thresholdRatio))
    : 0;
  const overallLabSafe = totalLabSessions > 0
    ? Math.max(0, Math.floor((totalLabAttended - thresholdRatio * totalLabSessions) / thresholdRatio))
    : 0;

  const overallLecRecovery = overallLecPct < threshold && totalLecSessions > 0
    ? Math.ceil((thresholdRatio * totalLecSessions - totalLecAttended) / (1 - thresholdRatio))
    : 0;
  const overallLabRecovery = overallLabPct < threshold && totalLabSessions > 0
    ? Math.ceil((thresholdRatio * totalLabSessions - totalLabAttended) / (1 - thresholdRatio))
    : 0;

  return {
    semester,
    subjects,
    stats,
    overall: {
      attended: totalAttended,
      total: totalSessions,
      percentage: Math.round(overallPct * 100) / 100,
      safeSkips: {
        lecture: overallLecSafe,
        lab: overallLabSafe,
        combinations: [],
      },
      recovery: {
        combined: Math.max(overallLecRecovery, overallLabRecovery),
        lecture: overallLecRecovery,
        lab: overallLabRecovery,
        combinations: [],
      },
    },
    threshold,
  };
}

