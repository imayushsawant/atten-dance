import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as queries from '../db/queries';

const router = Router();

// GET /api/attendance/:semesterId — all records for a semester
router.get('/:semesterId', (req, res) => {
  const records = queries.getAttendanceBySemester(req.params.semesterId);
  res.json(records);
});

// GET /api/attendance/:semesterId/date/:date — records for a specific date
router.get('/:semesterId/date/:date', (req, res) => {
  const records = queries.getAttendanceByDate(req.params.semesterId, req.params.date);
  res.json(records);
});

// POST /api/attendance — create a record
router.post('/', (req, res) => {
  const { subjectId, semesterId, type, status, date } = req.body;
  if (!subjectId || !semesterId || !type || !status || !date) {
    return res.status(400).json({ error: 'All fields required: subjectId, semesterId, type, status, date' });
  }

  const record = queries.createAttendanceRecord({
    id: randomUUID(),
    subjectId,
    semesterId,
    type,
    status,
    date,
  });

  res.status(201).json(record);
});

// POST /api/attendance/bulk — create multiple records at once
router.post('/bulk', (req, res) => {
  const { records } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Records array required' });
  }

  const created = queries.createAttendanceRecords(
    records.map((r: { subjectId: string; semesterId: string; type: string; status: string; date: string }) => ({
      id: randomUUID(),
      ...r,
    }))
  );

  res.status(201).json(created);
});

// DELETE /api/attendance/record/:id — delete a specific record
router.delete('/record/:id', (req, res) => {
  const deleted = queries.deleteAttendanceRecord(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Record not found' });
  res.json(deleted);
});

export default router;
