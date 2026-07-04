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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// BetterAuth handler — must be before other /api routes
app.all(/^\/api\/auth\/.*/, async (req, res) => {
  try {
    await toNodeHandler(auth)(req, res);
  } catch (err: any) {
    console.error("Auth Route Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Auth Handler Error", message: err.message, stack: err.stack });
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🎓 Atten-Dance API running on http://localhost:${PORT}`);
  });
}

export default app;
