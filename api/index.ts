import app from '../server/index.js';
import { pool } from '../server/db/index.js';

export default async function handler(req: any, res: any) {
  try {
    // Force a simple DB query to verify Supabase connection works on Vercel
    await pool.query('SELECT 1');
  } catch (err: any) {
    console.error("Supabase Connection Crash:", err);
    return res.status(500).json({
      error: "Supabase Connection Crash",
      message: err.message,
      stack: err.stack,
      hint: "Did you update DATABASE_URL in Vercel to match the .env file with port 5432 and your password?"
    });
  }

  return app(req, res);
}
