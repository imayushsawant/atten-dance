import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/index';
import semesterRoutes from './routes/semesters';
import attendanceRoutes from './routes/attendance';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB tables
initializeDatabase();

// Routes
app.use('/api/semesters', semesterRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎓 Atten-Dance API running on http://localhost:${PORT}`);
});
