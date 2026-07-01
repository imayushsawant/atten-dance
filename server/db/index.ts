import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'atten-dance.db');

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS semesters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      threshold INTEGER NOT NULL DEFAULT 75,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      has_lecture INTEGER NOT NULL DEFAULT 1,
      has_lab INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('lecture', 'lab')),
      status TEXT NOT NULL CHECK(status IN ('attended', 'skipped')),
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default settings if not present
  const existing = sqlite.prepare('SELECT key FROM settings WHERE key = ?').get('default_threshold');
  if (!existing) {
    sqlite.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('default_threshold', '75');
  }
}
