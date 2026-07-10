import { pgTable, uuid, varchar, timestamp, boolean, text, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Question Banks Table (Bank Soal)
export const questionBanks = pgTable('question_banks', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. BANK-IF-101
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Questions Table
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionBankId: uuid('question_bank_id')
    .references(() => questionBanks.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 50 }).default('MULTIPLE_CHOICE').notNull(), // 'MULTIPLE_CHOICE', 'ESSAY'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Question Versions Table (Versioning questions so they don't break existing attempts)
export const questionVersions = pgTable('question_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  version: integer('version').notNull(),
  content: text('content').notNull(), // HTML or text of the question
  optionsJson: jsonb('options_json'), // options for multiple choice e.g., [{"key": "A", "val": "..."}]
  correctKey: varchar('correct_key', { length: 10 }), // correct option key if MCQ
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Assessment Sessions Table
export const assessmentSessions = pgTable('assessment_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionBankId: uuid('question_bank_id')
    .references(() => questionBanks.id, { onDelete: 'cascade' })
    .notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // session code
  contextOwner: varchar('context_owner', { length: 30 }).notNull(), // 'PMB', 'LMS'
  contextRefId: uuid('context_ref_id').notNull(), // e.g., quizId in LMS or waveId in PMB
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Attempts Table (Participant's attempt)
export const attempts = pgTable('attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  assessmentSessionId: uuid('assessment_session_id')
    .references(() => assessmentSessions.id, { onDelete: 'cascade' })
    .notNull(),
  participantRefId: uuid('participant_ref_id').notNull(), // studentRefId or applicantRefId
  status: varchar('status', { length: 30 }).default('IN_PROGRESS').notNull(), // 'IN_PROGRESS', 'SUBMITTED', 'GRADED'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
});

// 6. Attempt Answers Table
export const attemptAnswers = pgTable('attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .references(() => attempts.id, { onDelete: 'cascade' })
    .notNull(),
  questionVersionId: uuid('question_version_id')
    .references(() => questionVersions.id, { onDelete: 'cascade' })
    .notNull(),
  selectedOptionKey: varchar('selected_option_key', { length: 10 }),
  essayAnswer: text('essay_answer'),
  isCorrect: boolean('is_correct'),
  score: decimal('score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Scoring Results Table
export const scoringResults = pgTable('scoring_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .references(() => attempts.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  finalScore: decimal('final_score', { precision: 5, scale: 2 }).notNull(),
  correctCount: integer('correct_count').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- TECHNICAL TABLES ---

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'),
  actorRole: varchar('actor_role', { length: 50 }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 100 }),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 }),
  correlationId: uuid('correlation_id'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
});

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 255 }).primaryKey(),
  responseCode: integer('response_code').notNull(),
  responseBody: text('response_body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const outboxEvents = pgTable('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  eventKey: varchar('event_key', { length: 255 }).notNull().unique(),
  payload: jsonb('payload').notNull(),
  correlationId: uuid('correlation_id').notNull(),
  causationId: uuid('causation_id').notNull(),
  processedAt: timestamp('processed_at'),
  retryCount: integer('retry_count').default(0).notNull(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inboxEvents = pgTable('inbox_events', {
  eventKey: varchar('event_key', { length: 255 }).primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reconciliationLogs = pgTable('reconciliation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  reconciliationType: varchar('reconciliation_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  mismatches: jsonb('mismatches'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
});

// Relations definition
export const questionBanksRelations = relations(questionBanks, ({ many }) => ({
  questions: many(questions),
  sessions: many(assessmentSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  bank: one(questionBanks, {
    fields: [questions.questionBankId],
    references: [questionBanks.id],
  }),
  versions: many(questionVersions),
}));

export const questionVersionsRelations = relations(questionVersions, ({ one, many }) => ({
  question: one(questions, {
    fields: [questionVersions.questionId],
    references: [questions.id],
  }),
  answers: many(attemptAnswers),
}));

export const assessmentSessionsRelations = relations(assessmentSessions, ({ one, many }) => ({
  bank: one(questionBanks, {
    fields: [assessmentSessions.questionBankId],
    references: [questionBanks.id],
  }),
  attempts: many(attempts),
}));

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  session: one(assessmentSessions, {
    fields: [attempts.assessmentSessionId],
    references: [assessmentSessions.id],
  }),
  answers: many(attemptAnswers),
  scoringResult: one(scoringResults, {
    fields: [attempts.id],
    references: [scoringResults.attemptId],
  }),
}));

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(attempts, {
    fields: [attemptAnswers.attemptId],
    references: [attempts.id],
  }),
  questionVersion: one(questionVersions, {
    fields: [attemptAnswers.questionVersionId],
    references: [questionVersions.id],
  }),
}));

export const scoringResultsRelations = relations(scoringResults, ({ one }) => ({
  attempt: one(attempts, {
    fields: [scoringResults.attemptId],
    references: [attempts.id],
  }),
}));
