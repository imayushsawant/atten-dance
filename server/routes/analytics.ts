import { Router } from 'express';
import * as queries from '../db/queries';

const router = Router();

// GET /api/analytics/:semesterId — full analytics for a semester
router.get('/:semesterId', async (req, res) => {
  const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
  const analytics = await queries.getAnalytics(req.params.semesterId, threshold);
  if (!analytics) return res.status(404).json({ error: 'Semester not found' });
  res.json(analytics);
});

// GET /api/analytics/:semesterId/target — compute sessions to reach target %
router.get('/:semesterId/target', async (req, res) => {
  const targetPct = Number(req.query.target) || 75;
  const analytics = await queries.getAnalytics(req.params.semesterId);
  if (!analytics) return res.status(404).json({ error: 'Semester not found' });

  const results = analytics.stats.map((stat) => ({
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
  }));

  const totalLectureAttended = analytics.stats.reduce((s, st) => s + st.lecture.attended, 0);
  const totalLectureSessions = analytics.stats.reduce((s, st) => s + st.lecture.total, 0);
  const lecturePct = totalLectureSessions > 0 ? (totalLectureAttended / totalLectureSessions) * 100 : 100;

  const totalLabAttended = analytics.stats.reduce((s, st) => s + st.lab.attended, 0);
  const totalLabSessions = analytics.stats.reduce((s, st) => s + st.lab.total, 0);
  const labPct = totalLabSessions > 0 ? (totalLabAttended / totalLabSessions) * 100 : 100;

  const targetRatio = targetPct / 100;
  let overallLectureRecovery = 0;
  let overallLabRecovery = 0;

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

  const overallRecovery = 0;

  res.json({ 
    target: targetPct, 
    overall: {
      current: analytics.overall.percentage,
      sessionsNeeded: {
        combined: overallRecovery,
        lecture: overallLectureRecovery,
        lab: overallLabRecovery,
        combinations: queries.getRecoveryCombinations(
          totalLectureAttended,
          totalLectureSessions,
          totalLabAttended,
          totalLabSessions,
          targetPct
        ),
      },
    },
    results 
  });
});

export default router;
