import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import { requireAuth } from './middleware/auth';
import semesterRoutes from './routes/semesters';
import attendanceRoutes from './routes/attendance';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.VITE_APP_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// BetterAuth handler — must be before other /api routes
app.all('/api/auth/{*splat}', (req, res) => {
  return toNodeHandler(auth)(req, res);
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
