import { db } from './index.js';
import { semesters, subjects, attendanceRecords, settings, notes } from './schema.js';
import type { NewSemester, NewSubject, NewAttendanceRecord, NewNote } from './schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';

// ════════════════════════════════════════════════════════════
//  SEMESTERS
// ════════════════════════════════════════════════════════════

export async function getAllSemesters(userId: string) {
  return db.select().from(semesters).where(eq(semesters.userId, userId)).orderBy(desc(semesters.createdAt));
}

export async function getSemesterById(id: string) {
  const rows = await db.select().from(semesters).where(eq(semesters.id, id));
  return rows[0];
}

export async function getSemesterByShareCode(shareCode: string) {
  const rows = await db.select().from(semesters).where(eq(semesters.shareCode, shareCode));
  return rows[0];
}

export async function getActiveSemester(userId: string) {
  const rows = await db.select().from(semesters).where(
    and(eq(semesters.userId, userId), eq(semesters.isActive, true))
  );
  return rows[0];
}

export async function createSemester(data: NewSemester) {
  const rows = await db.insert(semesters).values(data).returning();
  return rows[0];
}

export async function updateSemester(id: string, data: Partial<NewSemester>) {
  const rows = await db.update(semesters).set(data).where(eq(semesters.id, id)).returning();
  return rows[0];
}

export async function deleteSemester(id: string) {
  const rows = await db.delete(semesters).where(eq(semesters.id, id)).returning();
  return rows[0];
}

export async function setActiveSemester(userId: string, id: string) {
  // Deactivate all of THIS USER's semesters first
  await db.update(semesters).set({ isActive: false }).where(eq(semesters.userId, userId));
  // Activate the chosen one
  const rows = await db.update(semesters).set({ isActive: true }).where(eq(semesters.id, id)).returning();
  return rows[0];
}

export async function deactivateSemester(id: string) {
  const rows = await db.update(semesters).set({ isActive: false }).where(eq(semesters.id, id)).returning();
  return rows[0];
}

// ════════════════════════════════════════════════════════════
//  SUBJECTS
// ════════════════════════════════════════════════════════════

export async function getSubjectsBySemester(semesterId: string) {
  return db.select().from(subjects).where(eq(subjects.semesterId, semesterId));
}

export async function getSubjectById(id: string) {
  const rows = await db.select().from(subjects).where(eq(subjects.id, id));
  return rows[0];
}

export async function createSubject(data: NewSubject) {
  const rows = await db.insert(subjects).values(data).returning();
  return rows[0];
}

export async function createSubjects(data: NewSubject[]) {
  if (data.length === 0) return [];
  return db.insert(subjects).values(data).returning();
}

export async function updateSubject(id: string, data: Partial<NewSubject>) {
  const rows = await db.update(subjects).set(data).where(eq(subjects.id, id)).returning();
  return rows[0];
}

export async function deleteSubject(id: string) {
  const rows = await db.delete(subjects).where(eq(subjects.id, id)).returning();
  return rows[0];
}

export async function deleteSubjectsBySemester(semesterId: string) {
  return db.delete(subjects).where(eq(subjects.semesterId, semesterId)).returning();
}

// ════════════════════════════════════════════════════════════
//  ATTENDANCE RECORDS
// ════════════════════════════════════════════════════════════

export async function getAttendanceBySemester(semesterId: string) {
  const records = await db
    .select({
      id: attendanceRecords.id,
      subjectId: attendanceRecords.subjectId,
      semesterId: subjects.semesterId,
      type: attendanceRecords.type,
      status: attendanceRecords.status,
      date: attendanceRecords.date,
      orderIndex: attendanceRecords.orderIndex,
      createdAt: attendanceRecords.createdAt,
    })
    .from(attendanceRecords)
    .innerJoin(subjects, eq(attendanceRecords.subjectId, subjects.id))
    .where(eq(subjects.semesterId, semesterId))
    .orderBy(desc(attendanceRecords.date), asc(attendanceRecords.orderIndex), asc(attendanceRecords.createdAt));
  return records;
}

export async function getAttendanceByDate(semesterId: string, date: string) {
  const records = await db
    .select({
      id: attendanceRecords.id,
      subjectId: attendanceRecords.subjectId,
      semesterId: subjects.semesterId,
      type: attendanceRecords.type,
      status: attendanceRecords.status,
      date: attendanceRecords.date,
      orderIndex: attendanceRecords.orderIndex,
      createdAt: attendanceRecords.createdAt,
    })
    .from(attendanceRecords)
    .innerJoin(subjects, eq(attendanceRecords.subjectId, subjects.id))
    .where(
      and(
        eq(subjects.semesterId, semesterId),
        eq(attendanceRecords.date, date)
      )
    )
    .orderBy(asc(attendanceRecords.orderIndex), asc(attendanceRecords.createdAt));
  return records;
}

export async function getAttendanceBySubject(subjectId: string) {
  return db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.subjectId, subjectId))
    .orderBy(desc(attendanceRecords.date), asc(attendanceRecords.orderIndex), asc(attendanceRecords.createdAt));
}

export async function createAttendanceRecord(data: Omit<NewAttendanceRecord, 'semesterId'>) {
  const rows = await db.insert(attendanceRecords).values(data).returning();
  return rows[0];
}

export async function createAttendanceRecords(data: Omit<NewAttendanceRecord, 'semesterId'>[]) {
  if (data.length === 0) return [];
  return db.insert(attendanceRecords).values(data).returning();
}

export async function reorderAttendanceRecords(recordIds: string[]) {
  if (recordIds.length === 0) return [];
  return db.transaction(async (tx) => {
    const results = [];
    for (let i = 0; i < recordIds.length; i++) {
      const rows = await tx
        .update(attendanceRecords)
        .set({ orderIndex: i })
        .where(eq(attendanceRecords.id, recordIds[i]))
        .returning();
      if (rows[0]) results.push(rows[0]);
    }
    return results;
  });
}

export async function deleteAttendanceRecord(id: string) {
  const rows = await db.delete(attendanceRecords).where(eq(attendanceRecords.id, id)).returning();
  return rows[0];
}

export async function deleteAttendanceBySubjectAndDate(
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
    .returning();
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

export async function getAnalytics(semesterId: string, threshold?: number) {
  const semester = await getSemesterById(semesterId);
  if (!semester) return null;

  const method = semester.calculationMethod ?? 'split_average';
  const isTotalSessions = method === 'total_sessions';

  const t = threshold ?? semester.threshold;
  const thresholdRatio = t / 100;

  const semSubjects = await getSubjectsBySemester(semesterId);
  const allRecords = await getAttendanceBySemester(semesterId);

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
      lectureSafeSkips = subject.hasLecture ? combinedSafeSkips : 0;
      labSafeSkips = subject.hasLab ? combinedSafeSkips : 0;

      const combinedNeeded = combinedPct < t && combinedTotal > 0
        ? Math.ceil((thresholdRatio * combinedTotal - combinedAttended) / (1 - thresholdRatio))
        : 0;
      lectureRecovery = subject.hasLecture ? combinedNeeded : 0;
      labRecovery = subject.hasLab ? combinedNeeded : 0;
    } else {
      if (lectureTotal > 0 && labTotal > 0) {
        combinedPct = (lecturePct + labPct) / 2;
      } else if (lectureTotal > 0) {
        combinedPct = lecturePct;
      } else if (labTotal > 0) {
        combinedPct = labPct;
      }

      lectureSafeSkips = lectureTotal > 0
        ? Math.max(0, Math.floor((lectureAttended - thresholdRatio * lectureTotal) / thresholdRatio))
        : 0;
      labSafeSkips = labTotal > 0
        ? Math.max(0, Math.floor((labAttended - thresholdRatio * labTotal) / thresholdRatio))
        : 0;
      combinedSafeSkips = Math.min(
        subject.hasLecture ? lectureSafeSkips : Infinity,
        subject.hasLab ? labSafeSkips : Infinity
      );

      lectureRecovery = lecturePct < t && lectureTotal > 0
        ? Math.ceil((thresholdRatio * lectureTotal - lectureAttended) / (1 - thresholdRatio))
        : 0;
      labRecovery = labPct < t && labTotal > 0
        ? Math.ceil((thresholdRatio * labTotal - labAttended) / (1 - thresholdRatio))
        : 0;
    }

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
  let overallLectureSafeSkips = 0;
  let overallLabSafeSkips = 0;
  let overallRecovery = 0;
  let overallLectureRecovery = 0;
  let overallLabRecovery = 0;
  let recoveryCombos: { lecture: number; lab: number; resultingPercentage: number }[];
  let safeSkipCombos: { lecture: number; lab: number; resultingPercentage: number }[];

  if (isTotalSessions) {
    overallPct = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 100;

    const overallSafe = totalSessions > 0
      ? Math.max(0, Math.floor((totalAttended - thresholdRatio * totalSessions) / thresholdRatio))
      : 0;
    overallLectureSafeSkips = overallSafe;
    overallLabSafeSkips = overallSafe;
    safeSkipCombos = getTotalSessionsSafeSkipCombinations(
      overallSafe,
      totalAttended,
      totalSessions,
      totalLectureSessions > 0,
      totalLabSessions > 0
    );

    if (overallPct < t && totalSessions > 0) {
      overallRecovery = Math.ceil((thresholdRatio * totalSessions - totalAttended) / (1 - thresholdRatio));
      overallLectureRecovery = overallRecovery;
      overallLabRecovery = overallRecovery;
      recoveryCombos = getTotalSessionsRecoveryCombinations(
        overallRecovery,
        totalAttended,
        totalSessions,
        totalLectureSessions > 0,
        totalLabSessions > 0
      );
    }
  } else {
    if (totalLectureSessions > 0 && totalLabSessions > 0) {
      overallPct = (lecturePct + labPct) / 2;
    } else if (totalLectureSessions > 0) {
      overallPct = lecturePct;
    } else if (totalLabSessions > 0) {
      overallPct = labPct;
    }

    if (overallPct >= thresholdRatio * 100) {
      if (totalLectureSessions > 0 && totalLabSessions > 0) {
        const reqLecPct = 2 * thresholdRatio - (labPct / 100);
        if (reqLecPct <= 0) {
          overallLectureSafeSkips = 999;
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

    if (overallPct < t) {
      if (totalLabSessions > 0 && totalLectureSessions > 0) {
        const reqLecPct = 2 * thresholdRatio - (labPct / 100);
        if (reqLecPct > 0.9999) {
          overallLectureRecovery = -1;
        } else if (reqLecPct > (lecturePct / 100)) {
          overallLectureRecovery = Math.max(0, Math.ceil((reqLecPct * totalLectureSessions - totalLectureAttended) / (1 - reqLecPct)));
        }

        const reqLabPct = 2 * thresholdRatio - (lecturePct / 100);
        if (reqLabPct > 0.9999) {
          overallLabRecovery = -1;
        } else if (reqLabPct > (labPct / 100)) {
          overallLabRecovery = Math.max(0, Math.ceil((reqLabPct * totalLabSessions - totalLabAttended) / (1 - reqLabPct)));
        }
      } else if (totalLectureSessions > 0) {
        overallLectureRecovery = Math.ceil((thresholdRatio * totalLectureSessions - totalLectureAttended) / (1 - thresholdRatio));
      } else if (totalLabSessions > 0) {
        overallLabRecovery = Math.ceil((thresholdRatio * totalLabSessions - totalLabAttended) / (1 - thresholdRatio));
      }
    }

    recoveryCombos = getRecoveryCombinations(
      totalLectureAttended,
      totalLectureSessions,
      totalLabAttended,
      totalLabSessions,
      thresholdRatio * 100
    );
    safeSkipCombos = getSafeSkipCombinations(
      totalLectureAttended,
      totalLectureSessions,
      totalLabAttended,
      totalLabSessions,
      thresholdRatio * 100
    );
  }

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
        combinations: recoveryCombos,
      },
      safeSkips: {
        lecture: overallLectureSafeSkips,
        lab: overallLabSafeSkips,
        combinations: safeSkipCombos,
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
//  TIME-WINDOW ANALYTICS (Date-Range Filtered, Read-Only)
// ════════════════════════════════════════════════════════════

export async function getAnalyticsForDateRange(
  semesterId: string,
  startDate: string,
  endDate: string,
  threshold?: number
) {
  const semester = await getSemesterById(semesterId);
  if (!semester) return null;

  const method = semester.calculationMethod ?? 'split_average';
  const isTotalSessions = method === 'total_sessions';

  const t = threshold ?? semester.threshold;
  const thresholdRatio = t / 100;

  const semSubjects = await getSubjectsBySemester(semesterId);
  const allRecords = await getAttendanceBySemester(semesterId);

  // Filter records to the date range (YYYY-MM-DD string comparison works)
  const rangeRecords = allRecords.filter(
    (r) => r.date >= startDate && r.date <= endDate
  );

  const stats: SubjectStats[] = semSubjects.map((subject) => {
    const subjectRecords = rangeRecords.filter((r) => r.subjectId === subject.id);

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
      lectureSafeSkips = subject.hasLecture ? combinedSafeSkips : 0;
      labSafeSkips = subject.hasLab ? combinedSafeSkips : 0;

      const combinedNeeded = combinedPct < t && combinedTotal > 0
        ? Math.ceil((thresholdRatio * combinedTotal - combinedAttended) / (1 - thresholdRatio))
        : 0;
      lectureRecovery = subject.hasLecture ? combinedNeeded : 0;
      labRecovery = subject.hasLab ? combinedNeeded : 0;
    } else {
      if (lectureTotal > 0 && labTotal > 0) {
        combinedPct = (lecturePct + labPct) / 2;
      } else if (lectureTotal > 0) {
        combinedPct = lecturePct;
      } else if (labTotal > 0) {
        combinedPct = labPct;
      }

      lectureSafeSkips = lectureTotal > 0
        ? Math.max(0, Math.floor((lectureAttended - thresholdRatio * lectureTotal) / thresholdRatio))
        : 0;
      labSafeSkips = labTotal > 0
        ? Math.max(0, Math.floor((labAttended - thresholdRatio * labTotal) / thresholdRatio))
        : 0;
      combinedSafeSkips = Math.min(
        subject.hasLecture ? lectureSafeSkips : Infinity,
        subject.hasLab ? labSafeSkips : Infinity
      );

      lectureRecovery = lecturePct < t && lectureTotal > 0
        ? Math.ceil((thresholdRatio * lectureTotal - lectureAttended) / (1 - thresholdRatio))
        : 0;
      labRecovery = labPct < t && labTotal > 0
        ? Math.ceil((thresholdRatio * labTotal - labAttended) / (1 - thresholdRatio))
        : 0;
    }

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
  const overallLecturePct = totalLectureSessions > 0 ? (totalLectureAttended / totalLectureSessions) * 100 : 100;

  const totalLabAttended = stats.reduce((s, st) => s + st.lab.attended, 0);
  const totalLabSessions = stats.reduce((s, st) => s + st.lab.total, 0);
  const overallLabPct = totalLabSessions > 0 ? (totalLabAttended / totalLabSessions) * 100 : 100;

  let overallPct = 100;
  if (isTotalSessions) {
    overallPct = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 100;
  } else {
    if (totalLectureSessions > 0 && totalLabSessions > 0) {
      overallPct = (overallLecturePct + overallLabPct) / 2;
    } else if (totalLectureSessions > 0) {
      overallPct = overallLecturePct;
    } else if (totalLabSessions > 0) {
      overallPct = overallLabPct;
    }
  }

  // Unique dates in range for "days with records"
  const uniqueDates = new Set(rangeRecords.map((r) => r.date));

  return {
    semester,
    subjects: semSubjects,
    stats,
    overall: {
      attended: totalAttended,
      total: totalSessions,
      percentage: Math.round(overallPct * 100) / 100,
      recovery: { combined: 0, lecture: 0, lab: 0, combinations: [] },
      safeSkips: { lecture: 0, lab: 0, combinations: [] },
    },
    threshold: t,
    startDate,
    endDate,
    daysWithRecords: uniqueDates.size,
  };
}

// ════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════

export async function getSetting(key: string): Promise<string | undefined> {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value;
}

export async function setSetting(key: string, value: string) {
  // Upsert
  const existing = await getSetting(key);
  if (existing !== undefined) {
    const rows = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
    return rows[0];
  }
  const rows = await db.insert(settings).values({ key, value }).returning();
  return rows[0];
}

export async function getAllSettings() {
  return db.select().from(settings);
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

// ════════════════════════════════════════════════════════════

export function getTotalSessionsRecoveryCombinations(
  needed: number,
  totalAttended: number,
  totalSessions: number,
  hasLectures: boolean = true,
  hasLabs: boolean = true
): { lecture: number; lab: number; resultingPercentage: number }[] {
  if (needed <= 0) return [];
  const resultingPct = Math.round(((totalAttended + needed) / (totalSessions + needed)) * 10000) / 100;
  
  if (!hasLectures && hasLabs) {
    return [{ lecture: 0, lab: needed, resultingPercentage: resultingPct }];
  }
  if (hasLectures && !hasLabs) {
    return [{ lecture: needed, lab: 0, resultingPercentage: resultingPct }];
  }
  
  const half = Math.floor(needed / 2);
  const combos: { lecture: number; lab: number; resultingPercentage: number }[] = [
    { lecture: needed, lab: 0, resultingPercentage: resultingPct },
  ];
  if (half > 0 && half < needed) {
    combos.push({ lecture: half, lab: needed - half, resultingPercentage: resultingPct });
  }
  combos.push({ lecture: 0, lab: needed, resultingPercentage: resultingPct });
  return combos;
}

export function getTotalSessionsSafeSkipCombinations(
  safeSkips: number,
  totalAttended: number,
  totalSessions: number,
  hasLectures: boolean = true,
  hasLabs: boolean = true
): { lecture: number; lab: number; resultingPercentage: number }[] {
  if (safeSkips <= 0) return [];
  const resultingPct = Math.round((totalAttended / (totalSessions + safeSkips)) * 10000) / 100;
  
  if (!hasLectures && hasLabs) {
    return [{ lecture: 0, lab: safeSkips, resultingPercentage: resultingPct }];
  }
  if (hasLectures && !hasLabs) {
    return [{ lecture: safeSkips, lab: 0, resultingPercentage: resultingPct }];
  }
  
  const half = Math.floor(safeSkips / 2);
  const combos: { lecture: number; lab: number; resultingPercentage: number }[] = [
    { lecture: safeSkips, lab: 0, resultingPercentage: resultingPct },
  ];
  if (half > 0 && half < safeSkips) {
    combos.push({ lecture: half, lab: safeSkips - half, resultingPercentage: resultingPct });
  }
  combos.push({ lecture: 0, lab: safeSkips, resultingPercentage: resultingPct });
  return combos;
}

//  NOTES
// ════════════════════════════════════════════════════════════

export async function getNoteByDate(userId: string, date: string) {
  const rows = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.date, date)));
  return rows[0] ?? null;
}

export async function getNotesByDateRange(userId: string, startDate: string, endDate: string) {
  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(notes.date);
  // Filter in JS since drizzle-orm gte/lte on text columns can be fiddly
  return allNotes.filter(n => n.date >= startDate && n.date <= endDate);
}

export async function upsertNote(id: string, userId: string, date: string, content: string) {
  const existing = await getNoteByDate(userId, date);
  if (existing) {
    const rows = await db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, existing.id))
      .returning();
    return rows[0];
  }
  const rows = await db
    .insert(notes)
    .values({ id, userId, date, content })
    .returning();
  return rows[0];
}

export async function deleteNoteByDate(userId: string, date: string) {
  const rows = await db
    .delete(notes)
    .where(and(eq(notes.userId, userId), eq(notes.date, date)))
    .returning();
  return rows[0] ?? null;
}
