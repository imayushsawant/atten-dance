import { Router } from 'express';
import * as queries from '../db/queries.js';

const router = Router();

// GET /api/analytics/:semesterId — full analytics for a semester
router.get('/:semesterId', async (req, res) => {
  const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
  const analytics = await queries.getAnalytics(req.params.semesterId, threshold);
  if (!analytics) return res.status(404).json({ error: 'Semester not found' });
  res.json(analytics);
});

// GET /api/analytics/:semesterId/time-window — analytics for a specific date range
router.get('/:semesterId/time-window', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
  }
  const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
  const analytics = await queries.getAnalyticsForDateRange(
    req.params.semesterId,
    start as string,
    end as string,
    threshold
  );
  if (!analytics) return res.status(404).json({ error: 'Semester not found' });
  res.json(analytics);
});

// GET /api/analytics/:semesterId/target — compute sessions to reach target %
router.get('/:semesterId/target', async (req, res) => {
  const targetPct = Number(req.query.target) || 75;
  const analytics = await queries.getAnalytics(req.params.semesterId);
  if (!analytics) return res.status(404).json({ error: 'Semester not found' });

  const isTotalSessions = analytics.semester.calculationMethod === 'total_sessions';

  const results = analytics.stats.map((stat) => {
    if (isTotalSessions) {
      const needed = queries.sessionsToReachTarget(
        stat.combined.attended,
        stat.combined.total,
        targetPct
      );
      return {
        subjectId: stat.subjectId,
        subjectName: stat.subjectName,
        lecture: {
          current: stat.combined.percentage,
          sessionsNeeded: stat.lecture.total > 0 || !stat.lab.total ? needed : 0,
        },
        lab: {
          current: stat.combined.percentage,
          sessionsNeeded: stat.lab.total > 0 || !stat.lecture.total ? needed : 0,
        },
        combined: {
          current: stat.combined.percentage,
          sessionsNeeded: needed,
        },
      };
    }

    return {
      subjectId: stat.subjectId,
      subjectName: stat.subjectName,
      lecture: {
        current: stat.lecture.percentage,
        sessionsNeeded: queries.sessionsToReachTarget(
          stat.lecture.attended,
          stat.lecture.total,
          targetPct
        ),
      },
      lab: {
        current: stat.lab.percentage,
        sessionsNeeded: queries.sessionsToReachTarget(
          stat.lab.attended,
          stat.lab.total,
          targetPct
        ),
      },
      combined: {
        current: stat.combined.percentage,
        sessionsNeeded: 0,
      },
    };
  });

  const totalLectureAttended = analytics.stats.reduce((s, st) => s + st.lecture.attended, 0);
  const totalLectureSessions = analytics.stats.reduce((s, st) => s + st.lecture.total, 0);
  const lecturePct = totalLectureSessions > 0 ? (totalLectureAttended / totalLectureSessions) * 100 : 100;

  const totalLabAttended = analytics.stats.reduce((s, st) => s + st.lab.attended, 0);
  const totalLabSessions = analytics.stats.reduce((s, st) => s + st.lab.total, 0);
  const labPct = totalLabSessions > 0 ? (totalLabAttended / totalLabSessions) * 100 : 100;

  const totalAttended = analytics.overall.attended;
  const totalSessions = analytics.overall.total;

  const targetRatio = targetPct / 100;
  let overallLectureRecovery = 0;
  let overallLabRecovery = 0;
  let overallRecovery = 0;
  let recoveryCombos: { lecture: number; lab: number; resultingPercentage: number }[] = [];

  if (isTotalSessions) {
    if (analytics.overall.percentage < targetPct && totalSessions > 0) {
      overallRecovery = queries.sessionsToReachTarget(totalAttended, totalSessions, targetPct);
      overallLectureRecovery = overallRecovery;
      overallLabRecovery = overallRecovery;
      recoveryCombos = queries.getTotalSessionsRecoveryCombinations(
        overallRecovery,
        totalAttended,
        totalSessions,
        totalLectureSessions > 0,
        totalLabSessions > 0
      );
    }
  } else {
    if (analytics.overall.percentage < targetPct) {
      if (totalLabSessions > 0 && totalLectureSessions > 0) {
        const reqLecPct = 2 * targetRatio - (labPct / 100);
        if (reqLecPct > 0.9999) {
          overallLectureRecovery = -1;
        } else if (reqLecPct > (lecturePct / 100)) {
          overallLectureRecovery = Math.max(0, Math.ceil((reqLecPct * totalLectureSessions - totalLectureAttended) / (1 - reqLecPct)));
        }

        const reqLabPct = 2 * targetRatio - (lecturePct / 100);
        if (reqLabPct > 0.9999) {
          overallLabRecovery = -1;
        } else if (reqLabPct > (labPct / 100)) {
          overallLabRecovery = Math.max(0, Math.ceil((reqLabPct * totalLabSessions - totalLabAttended) / (1 - reqLabPct)));
        }
      } else if (totalLectureSessions > 0) {
        overallLectureRecovery = Math.ceil((targetRatio * totalLectureSessions - totalLectureAttended) / (1 - targetRatio));
      } else if (totalLabSessions > 0) {
        overallLabRecovery = Math.ceil((targetRatio * totalLabSessions - totalLabAttended) / (1 - targetRatio));
      }
    }

    recoveryCombos = queries.getRecoveryCombinations(
      totalLectureAttended,
      totalLectureSessions,
      totalLabAttended,
      totalLabSessions,
      targetPct
    );
  }

  res.json({ 
    target: targetPct, 
    overall: {
      current: analytics.overall.percentage,
      sessionsNeeded: {
        combined: overallRecovery,
        lecture: overallLectureRecovery,
        lab: overallLabRecovery,
        combinations: recoveryCombos,
      },
    },
    results 
  });
});

export default router;
