import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// ─── BetterAuth Tables ───────────────────────────────────
export const user = pgTable('users', {
  id: text('user_id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  dob: timestamp('dob', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
});

// ─── Semesters ───────────────────────────────────────────
export const semesters = pgTable('semesters', {
  id: text('semester_id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  threshold: integer('threshold').notNull().default(75),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Subjects ────────────────────────────────────────────
export const subjects = pgTable('subjects', {
  id: text('subject_id').primaryKey(),
  semesterId: text('semester_id')
    .notNull()
    .references(() => semesters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hasLecture: boolean('has_lecture').notNull().default(true),
  hasLab: boolean('has_lab').notNull().default(false),
});

// ─── Attendance Records ──────────────────────────────────
export const attendanceRecords = pgTable('attendance_record', {
  id: text('record_id').primaryKey(),
  subjectId: text('subject_id')
    .notNull()
    .references(() => subjects.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['lecture', 'lab'] }).notNull(),
  status: text('status', { enum: ['attended', 'skipped'] }).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Settings ────────────────────────────────────────────
export const settings = pgTable('settings', {
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
