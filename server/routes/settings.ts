import { Router } from 'express';
import * as queries from '../db/queries';

const router = Router();

// GET /api/settings — all settings
router.get('/', async (_req, res) => {
  const all = await queries.getAllSettings();
  const obj: Record<string, string> = {};
  all.forEach((s) => { obj[s.key] = s.value; });
  res.json(obj);
});

// PUT /api/settings — update one or more settings
router.put('/', async (req, res) => {
  const updates = req.body;
  if (typeof updates !== 'object') {
    return res.status(400).json({ error: 'Object of key-value pairs required' });
  }
  for (const [key, value] of Object.entries(updates)) {
    await queries.setSetting(key, String(value));
  }
  const all = await queries.getAllSettings();
  const obj: Record<string, string> = {};
  all.forEach((s) => { obj[s.key] = s.value; });
  res.json(obj);
});

export default router;
