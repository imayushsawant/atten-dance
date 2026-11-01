import 'dotenv/config';
import { pool } from './db/index.js';

const indexes = [
  'CREATE INDEX IF NOT EXISTS attendance_record_subject_id_idx ON attendance_record (subject_id)',
  'CREATE INDEX IF NOT EXISTS attendance_record_date_idx ON attendance_record (date)',
  'CREATE INDEX IF NOT EXISTS attendance_record_subject_id_date_idx ON attendance_record (subject_id, date)',
  'CREATE INDEX IF NOT EXISTS subjects_semester_id_idx ON subjects (semester_id)',
  'CREATE INDEX IF NOT EXISTS semesters_user_id_idx ON semesters (user_id)',
  'CREATE INDEX IF NOT EXISTS semesters_user_id_is_active_idx ON semesters (user_id, is_active)',
  'CREATE INDEX IF NOT EXISTS notes_user_id_date_idx ON notes (user_id, date)',
  'CREATE INDEX IF NOT EXISTS notes_date_idx ON notes (date)',
  'CREATE INDEX IF NOT EXISTS session_user_id_idx ON session (user_id)',
  'CREATE INDEX IF NOT EXISTS account_user_id_idx ON account (user_id)',
];

async function applyIndexes() {
  console.log('🚀 Applying database indexes...');
  const start = Date.now();
  for (const sql of indexes) {
    const t0 = Date.now();
    await pool.query(sql);
    console.log(`✓ Executed: ${sql} (${Date.now() - t0}ms)`);
  }
  console.log(`✨ All indexes successfully applied in ${Date.now() - start}ms!`);

  // Verify indexes
  const res = await pool.query(`
    SELECT indexname, tablename 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY tablename, indexname
  `);
  console.log('\nVerified Indexes in Database:');
  console.table(res.rows);

  await pool.end();
}

applyIndexes().catch((err) => {
  console.error('Error applying indexes:', err);
  process.exit(1);
});

