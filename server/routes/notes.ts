import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as queries from '../db/queries.js';

const router = Router();

// GET /api/notes/:date — get note for authenticated user on a specific date
router.get('/:date', async (req, res) => {
  const userId = req.user!.id;
  const note = await queries.getNoteByDate(userId, req.params.date);
  res.json(note);
});

// GET /api/notes/range/:start/:end — get notes for a date range
router.get('/range/:start/:end', async (req, res) => {
  const userId = req.user!.id;
  const notes = await queries.getNotesByDateRange(userId, req.params.start, req.params.end);
  res.json(notes);
});

// PUT /api/notes/:date — upsert a note for a date
router.put('/:date', async (req, res) => {
  const userId = req.user!.id;
  const { content } = req.body;

  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (content.length > 200) {
    return res.status(400).json({ error: 'Content must be 200 characters or less' });
  }

  const note = await queries.upsertNote(randomUUID(), userId, req.params.date, content.trim());
  res.json(note);
});

// DELETE /api/notes/:date — delete a note for a date
router.delete('/:date', async (req, res) => {
  const userId = req.user!.id;
  const deleted = await queries.deleteNoteByDate(userId, req.params.date);
  if (!deleted) return res.status(404).json({ error: 'Note not found' });
  res.json(deleted);
});

export default router;
