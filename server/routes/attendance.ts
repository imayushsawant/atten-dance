import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as queries from '../db/queries';

const router = Router();

// GET /api/attendance/:semesterId — all records for a semester
router.get('/:semesterId', async (req, res) => {
  const records = await queries.getAttendanceBySemester(req.params.semesterId);
  res.json(records);
});

// GET /api/attendance/:semesterId/date/:date — records for a specific date
router.get('/:semesterId/date/:date', async (req, res) => {
  const records = await queries.getAttendanceByDate(req.params.semesterId, req.params.date);
  res.json(records);
});

// POST /api/attendance — create a record
router.post('/', async (req, res) => {
  const { subjectId, type, status, date } = req.body;
  if (!subjectId || !type || !status || !date) {
    return res.status(400).json({ error: 'All fields required: subjectId, type, status, date' });
  }

  const record = await queries.createAttendanceRecord({
    id: randomUUID(),
    subjectId,
    type,
    status,
    date,
  });

  res.status(201).json(record);
});

// POST /api/attendance/bulk — create multiple records at once
router.post('/bulk', async (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Records array required' });
  }

  const created = await queries.createAttendanceRecords(
    records.map((r: { subjectId: string; type: string; status: string; date: string }) => ({
      id: randomUUID(),
      subjectId: r.subjectId,
      type: r.type as 'lecture' | 'lab',
      status: r.status as 'attended' | 'skipped',
      date: r.date,
    }))
  );

  res.status(201).json(created);
});

// DELETE /api/attendance/record/:id — delete a specific record
router.delete('/record/:id', async (req, res) => {
  const deleted = await queries.deleteAttendanceRecord(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Record not found' });
  res.json(deleted);
});

export default router;
