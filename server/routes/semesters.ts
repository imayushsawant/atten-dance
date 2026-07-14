import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as queries from '../db/queries.js';

const router = Router();

// GET /api/semesters — list all for current user
router.get('/', async (req, res) => {
  const data = await queries.getAllSemesters(req.user!.id);
  res.json(data);
});

// GET /api/semesters/active — get the active semester with subjects
router.get('/active', async (req, res) => {
  const semester = await queries.getActiveSemester(req.user!.id);
  if (!semester) {
    return res.json(null);
  }
  const semSubjects = await queries.getSubjectsBySemester(semester.id);
  res.json({ ...semester, subjects: semSubjects });
});

// GET /api/semesters/:id — get one with subjects
router.get('/:id', async (req, res) => {
  const semester = await queries.getSemesterById(req.params.id);
  if (!semester) return res.status(404).json({ error: 'Semester not found' });
  const semSubjects = await queries.getSubjectsBySemester(semester.id);
  res.json({ ...semester, subjects: semSubjects });
});

// POST /api/semesters — create with subjects
router.post('/', async (req, res) => {
  const { name, subjects: subjectList, threshold } = req.body;
  if (!name || !subjectList || !Array.isArray(subjectList)) {
    return res.status(400).json({ error: 'Name and subjects array required' });
  }

  const semesterId = randomUUID();
  const semester = await queries.createSemester({
    id: semesterId,
    userId: req.user!.id,
    name,
    threshold: threshold ?? 75,
    isActive: false,
  });

  const createdSubjects = await queries.createSubjects(
    subjectList.map((s: { name: string; hasLecture: boolean; hasLab: boolean }) => ({
      id: randomUUID(),
      semesterId,
      name: s.name,
      hasLecture: s.hasLecture ?? true,
      hasLab: s.hasLab ?? false,
    }))
  );

  // If this is the first semester, make it active
  const allSemesters = await queries.getAllSemesters(req.user!.id);
  if (allSemesters.length === 1) {
    await queries.setActiveSemester(req.user!.id, semesterId);
  }

  res.status(201).json({ ...semester, subjects: createdSubjects });
});

// PUT /api/semesters/:id — update semester name/threshold
router.put('/:id', async (req, res) => {
  const { name, threshold } = req.body;
  const updated = await queries.updateSemester(req.params.id, { name, threshold });
  if (!updated) return res.status(404).json({ error: 'Semester not found' });
  res.json(updated);
});

// PUT /api/semesters/:id/activate — set as active
router.put('/:id/activate', async (req, res) => {
  const result = await queries.setActiveSemester(req.user!.id, req.params.id);
  if (!result) return res.status(404).json({ error: 'Semester not found' });
  res.json(result);
});

// PUT /api/semesters/:id/deactivate — set as inactive
router.put('/:id/deactivate', async (req, res) => {
  const result = await queries.deactivateSemester(req.params.id);
  if (!result) return res.status(404).json({ error: 'Semester not found' });
  res.json(result);
});

// PUT /api/semesters/:id/subjects — replace subjects for a semester
router.put('/:id/subjects', async (req, res) => {
  const { subjects: subjectList } = req.body;
  if (!subjectList || !Array.isArray(subjectList)) {
    return res.status(400).json({ error: 'Subjects array required' });
  }

  const existing = await queries.getSubjectsBySemester(req.params.id);
  const existingIds = existing.map(s => s.id);
  
  const newIds = subjectList.filter((s: { id?: string }) => s.id).map((s: { id: string }) => s.id);
  
  // Delete subjects not in new list
  const toDelete = existingIds.filter(id => !newIds.includes(id));
  for (const id of toDelete) {
    await queries.deleteSubject(id);
  }
  
  // Update or create
  for (const s of subjectList) {
    if (s.id) {
       await queries.updateSubject(s.id, { name: s.name, hasLecture: s.hasLecture, hasLab: s.hasLab });
    } else {
       await queries.createSubject({ id: randomUUID(), semesterId: req.params.id, name: s.name, hasLecture: s.hasLecture, hasLab: s.hasLab });
    }
  }

  res.json(await queries.getSubjectsBySemester(req.params.id));
});

// DELETE /api/semesters/:id — delete semester
router.delete('/:id', async (req, res) => {
  const deleted = await queries.deleteSemester(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Semester not found' });
  res.json(deleted);
});

// PUT /api/semesters/:id/share — get or generate a share code
router.put('/:id/share', async (req, res) => {
  let semester = await queries.getSemesterById(req.params.id);
  if (!semester) return res.status(404).json({ error: 'Semester not found' });
  
  if (!semester.shareCode) {
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    semester = await queries.updateSemester(req.params.id, { shareCode });
  }
  
  res.json({ shareCode: semester.shareCode });
});

// POST /api/semesters/import — import a semester using a share code
router.post('/import', async (req, res) => {
  const { shareCode } = req.body;
  if (!shareCode) return res.status(400).json({ error: 'shareCode is required' });

  const originalSemester = await queries.getSemesterByShareCode(shareCode);
  if (!originalSemester) return res.status(404).json({ error: 'Invalid share code' });

  const originalSubjects = await queries.getSubjectsBySemester(originalSemester.id);

  const semesterId = randomUUID();
  const newSemester = await queries.createSemester({
    id: semesterId,
    userId: req.user!.id,
    name: originalSemester.name,
    threshold: originalSemester.threshold,
    isActive: false,
  });

  const createdSubjects = await queries.createSubjects(
    originalSubjects.map(s => ({
      id: randomUUID(),
      semesterId,
      name: s.name,
      hasLecture: s.hasLecture,
      hasLab: s.hasLab,
    }))
  );

  res.status(201).json({ ...newSemester, subjects: createdSubjects });
});

export default router;
