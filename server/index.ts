import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { requireAuth } from './middleware/auth.js';
import semesterRoutes from './routes/semesters.js';
import attendanceRoutes from './routes/attendance.js';
import analyticsRoutes from './routes/analytics.js';
import settingsRoutes from './routes/settings.js';
import notesRoutes from './routes/notes.js';
import authLinkingRoutes from './routes/auth-linking.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.canibunk.in',
  'https://canibunk.in',
  'https://atten-dance.ayushsawant.dev',
  process.env.VITE_APP_URL,
  process.env.BETTER_AUTH_URL,
].filter(Boolean) as string[];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed =
      allowedOrigins.some((o) => o.replace(/\/$/, '') === cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.canibunk.in');
    return callback(null, isAllowed);
  },
  credentials: true,
}));
app.use(express.json());

// Account collision & linking endpoints (must be before BetterAuth catch-all handler)
app.use('/api/auth-linking', authLinkingRoutes);

// BetterAuth handler — must be before other /api routes
app.all(/^\/api\/auth\/.*/, async (req, res) => {
  try {
    await toNodeHandler(auth)(req, res);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Auth Route Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Auth Handler Error", message: error.message, stack: error.stack });
    }
  }
});

// Health check (no auth needed)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api/semesters', requireAuth, semesterRoutes);
app.use('/api/attendance', requireAuth, attendanceRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/notes', requireAuth, notesRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🎓 Atten-Dance API running on http://localhost:${PORT}`);
  });
}

export default app;
