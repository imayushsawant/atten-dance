import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// ─── BetterAuth Tables ───────────────────────────────────
export const users = pgTable('users', {
  id: text('user_id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  dob: timestamp('dob', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const account = pgTable('account', {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Semesters ───────────────────────────────────────────
export const semesters = pgTable('semesters', {
  id: text('semester_id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  threshold: integer('threshold').notNull().default(75),
  shareCode: text('share_code').unique(),
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
