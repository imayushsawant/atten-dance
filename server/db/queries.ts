import { db } from './index';
import { semesters, subjects, attendanceRecords, settings } from './schema';
import type { NewSemester, NewSubject, NewAttendanceRecord } from './schema';
import { eq, and, desc } from 'drizzle-orm';

// ════════════════════════════════════════════════════════════
//  SEMESTERS
// ════════════════════════════════════════════════════════════

export function getAllSemesters() {
  return db.select().from(semesters).orderBy(desc(semesters.createdAt)).all();
}

export function getSemesterById(id: string) {
  return db.select().from(semesters).where(eq(semesters.id, id)).get();
}

export function getActiveSemester() {
  return db.select().from(semesters).where(eq(semesters.isActive, true)).get();
}

export function createSemester(data: NewSemester) {
  return db.insert(semesters).values(data).returning().get();
}

export function updateSemester(id: string, data: Partial<NewSemester>) {
  return db.update(semesters).set(data).where(eq(semesters.id, id)).returning().get();
}

export function deleteSemester(id: string) {
  return db.delete(semesters).where(eq(semesters.id, id)).returning().get();
}

export function setActiveSemester(id: string) {
  // Deactivate all first
  db.update(semesters).set({ isActive: false }).run();
  // Activate the chosen one
  return db.update(semesters).set({ isActive: true }).where(eq(semesters.id, id)).returning().get();
}

// ════════════════════════════════════════════════════════════
//  SUBJECTS
// ════════════════════════════════════════════════════════════

export function getSubjectsBySemester(semesterId: string) {
  return db.select().from(subjects).where(eq(subjects.semesterId, semesterId)).all();
}

export function getSubjectById(id: string) {
  return db.select().from(subjects).where(eq(subjects.id, id)).get();
}

export function createSubject(data: NewSubject) {
  return db.insert(subjects).values(data).returning().get();
}

export function createSubjects(data: NewSubject[]) {
  if (data.length === 0) return [];
  return db.insert(subjects).values(data).returning().all();
}

export function updateSubject(id: string, data: Partial<NewSubject>) {
  return db.update(subjects).set(data).where(eq(subjects.id, id)).returning().get();
}

export function deleteSubject(id: string) {
  return db.delete(subjects).where(eq(subjects.id, id)).returning().get();
}

export function deleteSubjectsBySemester(semesterId: string) {
  return db.delete(subjects).where(eq(subjects.semesterId, semesterId)).returning().all();
}

// ════════════════════════════════════════════════════════════
//  ATTENDANCE RECORDS
// ════════════════════════════════════════════════════════════

export function getAttendanceBySemester(semesterId: string) {
  return db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.semesterId, semesterId))
    .orderBy(desc(attendanceRecords.date))
    .all();
}

export function getAttendanceByDate(semesterId: string, date: string) {
  return db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.semesterId, semesterId),
        eq(attendanceRecords.date, date)
      )
    )
    .all();
}

export function getAttendanceBySubject(subjectId: string) {
  return db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.subjectId, subjectId))
    .orderBy(desc(attendanceRecords.date))
    .all();
}

export function createAttendanceRecord(data: NewAttendanceRecord) {
  return db.insert(attendanceRecords).values(data).returning().get();
}

export function createAttendanceRecords(data: NewAttendanceRecord[]) {
  if (data.length === 0) return [];
  return db.insert(attendanceRecords).values(data).returning().all();
}

export function deleteAttendanceRecord(id: string) {
  return db.delete(attendanceRecords).where(eq(attendanceRecords.id, id)).returning().get();
}

export function deleteAttendanceBySubjectAndDate(
  subjectId: string,
  date: string,
  type: 'lecture' | 'lab'
) {
  return db
    .delete(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.subjectId, subjectId),
        eq(attendanceRecords.date, date),
        eq(attendanceRecords.type, type)
      )
    )
    .returning()
    .all();
}

// ════════════════════════════════════════════════════════════
//  ANALYTICS (Computed)
// ════════════════════════════════════════════════════════════

export type SubjectStats = {
  subjectId: string;
  subjectName: string;
  lecture: { attended: number; total: number; percentage: number };
  lab: { attended: number; total: number; percentage: number };
  combined: { attended: number; total: number; percentage: number };
  safeSkips: { lecture: number; lab: number; combined: number };
  recovery: { lecture: number; lab: number };
};

export function getAnalytics(semesterId: string, threshold?: number) {
  const semester = getSemesterById(semesterId);
  if (!semester) return null;

  const t = threshold ?? semester.threshold;
  const thresholdRatio = t / 100;

  const semSubjects = getSubjectsBySemester(semesterId);
  const allRecords = getAttendanceBySemester(semesterId);

  const stats: SubjectStats[] = semSubjects.map((subject) => {
    const subjectRecords = allRecords.filter((r) => r.subjectId === subject.id);

    const lectureRecords = subjectRecords.filter((r) => r.type === 'lecture');
    const labRecords = subjectRecords.filter((r) => r.type === 'lab');

    const lectureAttended = lectureRecords.filter((r) => r.status === 'attended').length;
    const lectureTotal = lectureRecords.length;
    const labAttended = labRecords.filter((r) => r.status === 'attended').length;
    const labTotal = labRecords.length;

    const combinedAttended = lectureAttended + labAttended;
    const combinedTotal = lectureTotal + labTotal;

    const lecturePct = lectureTotal > 0 ? (lectureAttended / lectureTotal) * 100 : 100;
    const labPct = labTotal > 0 ? (labAttended / labTotal) * 100 : 100;
    let combinedPct = 100;
    if (lectureTotal > 0 && labTotal > 0) {
      combinedPct = (lecturePct + labPct) / 2;
    } else if (lectureTotal > 0) {
      combinedPct = lecturePct;
    } else if (labTotal > 0) {
      combinedPct = labPct;
    }

    // Safe skips: how many can you skip before dropping below threshold
    // Formula: floor((attended - threshold * total) / threshold)
    // Only if currently above threshold
    const lectureSafeSkips = lectureTotal > 0
      ? Math.max(0, Math.floor((lectureAttended - thresholdRatio * lectureTotal) / thresholdRatio))
      : 0;
    const labSafeSkips = labTotal > 0
      ? Math.max(0, Math.floor((labAttended - thresholdRatio * labTotal) / thresholdRatio))
      : 0;
    const combinedSafeSkips = Math.min(
      subject.hasLecture ? lectureSafeSkips : Infinity,
      subject.hasLab ? labSafeSkips : Infinity
    );

    // Recovery: how many consecutive sessions to attend to reach threshold
    // Formula: ceil((threshold * total - attended) / (1 - threshold))
    const lectureRecovery = lecturePct < t && lectureTotal > 0
      ? Math.ceil((thresholdRatio * lectureTotal - lectureAttended) / (1 - thresholdRatio))
      : 0;
    const labRecovery = labPct < t && labTotal > 0
      ? Math.ceil((thresholdRatio * labTotal - labAttended) / (1 - thresholdRatio))
      : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      lecture: {
        attended: lectureAttended,
        total: lectureTotal,
        percentage: Math.round(lecturePct * 100) / 100,
      },
      lab: {
        attended: labAttended,
        total: labTotal,
        percentage: Math.round(labPct * 100) / 100,
      },
      combined: {
        attended: combinedAttended,
        total: combinedTotal,
        percentage: Math.round(combinedPct * 100) / 100,
      },
      safeSkips: {
        lecture: lectureSafeSkips,
        lab: labSafeSkips,
        combined: combinedSafeSkips === Infinity ? 0 : combinedSafeSkips,
      },
      recovery: {
        lecture: lectureRecovery,
        lab: labRecovery,
      },
    };
  });

  // Overall stats
  const totalAttended = stats.reduce((s, st) => s + st.combined.attended, 0);
  const totalSessions = stats.reduce((s, st) => s + st.combined.total, 0);
  
  const totalLectureAttended = stats.reduce((s, st) => s + st.lecture.attended, 0);
  const totalLectureSessions = stats.reduce((s, st) => s + st.lecture.total, 0);
  const lecturePct = totalLectureSessions > 0 ? (totalLectureAttended / totalLectureSessions) * 100 : 100;
  
  const totalLabAttended = stats.reduce((s, st) => s + st.lab.attended, 0);
  const totalLabSessions = stats.reduce((s, st) => s + st.lab.total, 0);
  const labPct = totalLabSessions > 0 ? (totalLabAttended / totalLabSessions) * 100 : 100;

  let overallPct = 100;
  if (totalLectureSessions > 0 && totalLabSessions > 0) {
    overallPct = (lecturePct + labPct) / 2;
  } else if (totalLectureSessions > 0) {
    overallPct = lecturePct;
  } else if (totalLabSessions > 0) {
    overallPct = labPct;
  }

  // Calculate recovery based on the new average overall percentage
  let overallLectureSafeSkips = 0;
  let overallLabSafeSkips = 0;
  if (overallPct >= thresholdRatio * 100) {
    if (totalLectureSessions > 0 && totalLabSessions > 0) {
      const lecturePct = (totalLectureAttended / totalLectureSessions) * 100;
      const labPct = (totalLabAttended / totalLabSessions) * 100;
      
      const reqLecPct = 2 * thresholdRatio - (labPct / 100);
      if (reqLecPct <= 0) {
        overallLectureSafeSkips = 999; // effectively infinite
      } else {
        overallLectureSafeSkips = Math.max(0, Math.floor((totalLectureAttended / reqLecPct) - totalLectureSessions));
      }

      const reqLabPct = 2 * thresholdRatio - (lecturePct / 100);
      if (reqLabPct <= 0) {
        overallLabSafeSkips = 999;
      } else {
        overallLabSafeSkips = Math.max(0, Math.floor((totalLabAttended / reqLabPct) - totalLabSessions));
      }
    } else if (totalLectureSessions > 0) {
      overallLectureSafeSkips = Math.max(0, Math.floor((totalLectureAttended - thresholdRatio * totalLectureSessions) / thresholdRatio));
    } else if (totalLabSessions > 0) {
      overallLabSafeSkips = Math.max(0, Math.floor((totalLabAttended - thresholdRatio * totalLabSessions) / thresholdRatio));
    }
  }

  let overallLectureRecovery = 0;
  let overallLabRecovery = 0;

  if (overallPct < t) {
    if (totalLabSessions > 0 && totalLectureSessions > 0) {
      // To recover overall average using ONLY lectures:
      // (newLecturePct + labPct)/2 = threshold
      // newLecturePct = 2*threshold - labPct
      const reqLecPct = 2 * thresholdRatio - (labPct / 100);
      if (reqLecPct > 0.9999) {
        overallLectureRecovery = -1; // impossible
      } else if (reqLecPct > (lecturePct / 100)) {
        overallLectureRecovery = Math.max(0, Math.ceil((reqLecPct * totalLectureSessions - totalLectureAttended) / (1 - reqLecPct)));
      }

      const reqLabPct = 2 * thresholdRatio - (lecturePct / 100);
      if (reqLabPct > 0.9999) {
        overallLabRecovery = -1; // impossible
      } else if (reqLabPct > (labPct / 100)) {
        overallLabRecovery = Math.max(0, Math.ceil((reqLabPct * totalLabSessions - totalLabAttended) / (1 - reqLabPct)));
      }
    } else if (totalLectureSessions > 0) {
      overallLectureRecovery = Math.ceil((thresholdRatio * totalLectureSessions - totalLectureAttended) / (1 - thresholdRatio));
    } else if (totalLabSessions > 0) {
      overallLabRecovery = Math.ceil((thresholdRatio * totalLabSessions - totalLabAttended) / (1 - thresholdRatio));
    }
  }

  // Combined recovery isn't a flat number anymore since weights differ, 
  // but we can supply 0 to deprecate it in the UI
  const overallRecovery = 0; 

  return {
    semester,
    subjects: semSubjects,
    stats,
    overall: {
      attended: totalAttended,
      total: totalSessions,
      percentage: Math.round(overallPct * 100) / 100,
      recovery: {
        combined: overallRecovery,
        lecture: overallLectureRecovery,
        lab: overallLabRecovery,
        combinations: getRecoveryCombinations(
          totalLectureAttended,
          totalLectureSessions,
          totalLabAttended,
          totalLabSessions,
          thresholdRatio * 100
        ),
      },
      safeSkips: {
        lecture: overallLectureSafeSkips,
        lab: overallLabSafeSkips,
        combinations: getSafeSkipCombinations(
          totalLectureAttended,
          totalLectureSessions,
          totalLabAttended,
          totalLabSessions,
          thresholdRatio * 100
        ),
      },
    },
    threshold: t,
  };
}

// Compute how many sessions needed to reach a target percentage
export function sessionsToReachTarget(
  attended: number,
  total: number,
  targetPct: number
): number {
  const target = targetPct / 100;
  if (total === 0) return 0;
  if (attended / total >= target) return 0;
  // attended + n >= target * (total + n)
  // n >= (target * total - attended) / (1 - target)
  return Math.ceil((target * total - attended) / (1 - target));
}

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════

export function getSetting(key: string): string | undefined {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value;
}

export function setSetting(key: string, value: string) {
  // Upsert
  const existing = getSetting(key);
  if (existing !== undefined) {
    return db.update(settings).set({ value }).where(eq(settings.key, key)).returning().get();
  }
  return db.insert(settings).values({ key, value }).returning().get();
}

export function getAllSettings() {
  return db.select().from(settings).all();
}

export function getRecoveryCombinations(lectureAttended: number, lectureTotal: number, labAttended: number, labTotal: number, targetPct: number, maxClasses: number = 30): { lecture: number; lab: number; resultingPercentage: number }[] {
  const target = targetPct / 100;
  if (lectureTotal === 0 || labTotal === 0) return [];
  const currentAverage = ((lectureAttended / lectureTotal) + (labAttended / labTotal)) / 2;
  if (currentAverage >= target) return [];
  const combinations: { lecture: number; lab: number; resultingPercentage: number }[] = [];
  for (let l = 1; l <= maxClasses; l++) {
    const newLecPct = (lectureAttended + l) / (lectureTotal + l);
    const reqLabPct = 2 * target - newLecPct;
    if (reqLabPct <= (labAttended / labTotal)) continue;
    if (reqLabPct > 0.9999) continue;
    const b = Math.ceil((reqLabPct * labTotal - labAttended) / (1 - reqLabPct));
    if (b > 0 && b <= maxClasses) {
      const newLabPct = (labAttended + b) / (labTotal + b);
      const resultingPct = ((newLecPct + newLabPct) / 2) * 100;
      combinations.push({ lecture: l, lab: b, resultingPercentage: Math.round(resultingPct * 100) / 100 });
    }
  }
  if (combinations.length <= 3) return combinations;
  return [
    combinations[0],
    combinations[Math.floor(combinations.length / 2)],
    combinations[combinations.length - 1],
  ];
}

export function getSafeSkipCombinations(lectureAttended: number, lectureTotal: number, labAttended: number, labTotal: number, targetPct: number, maxClasses: number = 30): { lecture: number; lab: number; resultingPercentage: number }[] {
  const target = targetPct / 100;
  if (lectureTotal === 0 || labTotal === 0) return [];
  const currentAverage = ((lectureAttended / lectureTotal) + (labAttended / labTotal)) / 2;
  if (currentAverage < target) return [];

  const combinations: { lecture: number; lab: number; resultingPercentage: number }[] = [];
  
  // Try skipping l lectures and find the maximum labs we can skip alongside
  for (let l = 1; l <= maxClasses; l++) {
    const newLecPct = lectureAttended / (lectureTotal + l);
    const minReqLabPct = 2 * target - newLecPct;
    
    if (minReqLabPct > (labAttended / labTotal)) continue;
    
    let b = 0;
    if (minReqLabPct <= 0) {
      b = maxClasses;
    } else {
      b = Math.floor((labAttended / minReqLabPct) - labTotal);
    }
    
    if (b > 0 && b <= maxClasses) {
      const newLabPct = labAttended / (labTotal + b);
      const resultingPct = ((newLecPct + newLabPct) / 2) * 100;
      combinations.push({ lecture: l, lab: b, resultingPercentage: Math.round(resultingPct * 100) / 100 });
    }
  }

  // Filter out combinations that are not "maximal" if needed, but since b decreases as l increases, 
  // these naturally form a pareto frontier of safe combinations.
  if (combinations.length <= 3) return combinations;
  return [
    combinations[0],
    combinations[Math.floor(combinations.length / 2)],
    combinations[combinations.length - 1],
  ];
}
