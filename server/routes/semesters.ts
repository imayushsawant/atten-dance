import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as queries from '../db/queries';

const router = Router();

// GET /api/semesters — list all
router.get('/', (_req, res) => {
  const data = queries.getAllSemesters();
  res.json(data);
});

// GET /api/semesters/active — get the active semester with subjects
router.get('/active', (_req, res) => {
  const semester = queries.getActiveSemester();
  if (!semester) {
    return res.json(null);
  }
  const semSubjects = queries.getSubjectsBySemester(semester.id);
  res.json({ ...semester, subjects: semSubjects });
});

// GET /api/semesters/:id — get one with subjects
router.get('/:id', (req, res) => {
  const semester = queries.getSemesterById(req.params.id);
  if (!semester) return res.status(404).json({ error: 'Semester not found' });
  const semSubjects = queries.getSubjectsBySemester(semester.id);
  res.json({ ...semester, subjects: semSubjects });
});

// POST /api/semesters — create with subjects
router.post('/', (req, res) => {
  const { name, subjects: subjectList, threshold } = req.body;
  if (!name || !subjectList || !Array.isArray(subjectList)) {
    return res.status(400).json({ error: 'Name and subjects array required' });
  }

  const semesterId = randomUUID();
  const semester = queries.createSemester({
    id: semesterId,
    name,
    threshold: threshold ?? 75,
    isActive: false,
  });

  const createdSubjects = queries.createSubjects(
    subjectList.map((s: { name: string; hasLecture: boolean; hasLab: boolean }) => ({
      id: randomUUID(),
      semesterId,
      name: s.name,
      hasLecture: s.hasLecture ?? true,
      hasLab: s.hasLab ?? false,
    }))
  );

  // If this is the first semester, make it active
  const allSemesters = queries.getAllSemesters();
  if (allSemesters.length === 1) {
    queries.setActiveSemester(semesterId);
  }

  res.status(201).json({ ...semester, subjects: createdSubjects });
});

// PUT /api/semesters/:id — update semester name/threshold
router.put('/:id', (req, res) => {
  const { name, threshold } = req.body;
  const updated = queries.updateSemester(req.params.id, { name, threshold });
  if (!updated) return res.status(404).json({ error: 'Semester not found' });
  res.json(updated);
});

// PUT /api/semesters/:id/activate — set as active
router.put('/:id/activate', (req, res) => {
  const result = queries.setActiveSemester(req.params.id);
  if (!result) return res.status(404).json({ error: 'Semester not found' });
  res.json(result);
});

// PUT /api/semesters/:id/subjects — replace subjects for a semester
router.put('/:id/subjects', (req, res) => {
  const { subjects: subjectList } = req.body;
  if (!subjectList || !Array.isArray(subjectList)) {
    return res.status(400).json({ error: 'Subjects array required' });
  }

  // Delete existing subjects (cascade deletes attendance records too)
  queries.deleteSubjectsBySemester(req.params.id);

  const createdSubjects = queries.createSubjects(
    subjectList.map((s: { name: string; hasLecture: boolean; hasLab: boolean }) => ({
      id: randomUUID(),
      semesterId: req.params.id,
      name: s.name,
      hasLecture: s.hasLecture ?? true,
      hasLab: s.hasLab ?? false,
    }))
  );

  res.json(createdSubjects);
});

// DELETE /api/semesters/:id — delete semester
router.delete('/:id', (req, res) => {
  const deleted = queries.deleteSemester(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Semester not found' });
  res.json(deleted);
});

export default router;
