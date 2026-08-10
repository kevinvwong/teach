import { pgTable, uuid, varchar, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * IRT Assessment Response Schema
 *
 * Stores individual student responses for item calibration and progress tracking.
 * Each row = one item response within a quiz session.
 *
 * Migration: npx drizzle-kit push
 */

export const assessmentResponses = pgTable('assessment_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull(),
  studentId: varchar('student_id', { length: 255 }),
  itemId: varchar('item_id', { length: 50 }).notNull(),
  itemBank: varchar('item_bank', { length: 100 }).notNull(),
  response: varchar('response', { length: 10 }).notNull(),
  correct: boolean('correct').notNull(),
  responseTimeMs: integer('response_time_ms'),
  thetaAtTime: numeric('theta_at_time', { precision: 6, scale: 3 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Item Calibration Schema
 *
 * Stores IRT parameters for each calibrated item.
 * Updated after each calibration run by the psychometric-consultant agent.
 */
export const itemCalibrations = pgTable('item_calibrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: varchar('item_id', { length: 50 }).notNull().unique(),
  itemBank: varchar('item_bank', { length: 100 }).notNull(),
  domain: varchar('domain', { length: 100 }),
  a: numeric('a', { precision: 6, scale: 3 }).notNull(),
  b: numeric('b', { precision: 6, scale: 3 }).notNull(),
  c: numeric('c', { precision: 6, scale: 3 }).notNull(),
  infitMNSQ: numeric('infit_mnsq', { precision: 5, scale: 3 }),
  outfitMNSQ: numeric('outfit_mnsq', { precision: 5, scale: 3 }),
  nResponses: integer('n_responses').default(0),
  status: varchar('status', { length: 20 }).default('draft'),
  calibratedAt: timestamp('calibrated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Quiz Sessions Schema
 *
 * Tracks each quiz administration session.
 */
export const quizSessions = pgTable('quiz_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: varchar('student_id', { length: 255 }),
  itemBank: varchar('item_bank', { length: 100 }).notNull(),
  nItems: integer('n_items').default(0),
  nCorrect: integer('n_correct').default(0),
  finalTheta: numeric('final_theta', { precision: 6, scale: 3 }),
  finalThetaSE: numeric('final_theta_se', { precision: 6, scale: 3 }),
  classification: varchar('classification', { length: 20 }),
  completed: boolean('completed').default(false),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

/**
 * Student Progress Schema
 *
 * Tracks overall progress across the full course.
 */
export const studentProgress = pgTable('student_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: varchar('student_id', { length: 255 }).notNull(),
  courseId: varchar('course_id', { length: 100 }).notNull(),
  currentModule: integer('current_module').default(0),
  overallTheta: numeric('overall_theta', { precision: 6, scale: 3 }),
  modulesCompleted: integer('modules_completed').default(0),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});
