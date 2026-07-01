import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Semesters ───────────────────────────────────────────
export const semesters = sqliteTable('semesters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  threshold: integer('threshold').notNull().default(75),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Subjects ────────────────────────────────────────────
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hasLecture: integer('has_lecture', { mode: 'boolean' }).notNull().default(true),
  hasLab: integer('has_lab', { mode: 'boolean' }).notNull().default(false),
});

// ─── Attendance Records ──────────────────────────────────
export const attendanceRecords = sqliteTable('attendance_records', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['lecture', 'lab'] }).notNull(),
  status: text('status', { enum: ['attended', 'skipped'] }).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── Settings ────────────────────────────────────────────
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// ─── Types ───────────────────────────────────────────────
export type Semester = typeof semesters.$inferSelect;
export type NewSemester = typeof semesters.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type Setting = typeof settings.$inferSelect;
