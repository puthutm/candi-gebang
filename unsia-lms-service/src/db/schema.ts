import { pgTable, uuid, varchar, timestamp, boolean, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. LMS Classes (Copied/Synced from Academic Class Offerings, local copy)
export const lmsClasses = pgTable('lms_classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  classOfferingRefId: uuid('class_offering_ref_id').notNull().unique(), // reference to Academic Class Offering
  className: varchar('class_name', { length: 10 }).notNull(),
  courseRefId: uuid('course_ref_id').notNull(), // reference to course in Academic
  academicPeriodRefId: uuid('academic_period_ref_id').notNull(),
  lecturerRefId: uuid('lecturer_ref_id'), // reference to HRIS lecturer
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. LMS Enrollments (Copied/Synced from approved KRS items, local copy)
export const lmsEnrollments = pgTable('lms_enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  lmsClassId: uuid('lms_class_id')
    .references(() => lmsClasses.id, { onDelete: 'cascade' })
    .notNull(),
  studentRefId: uuid('student_ref_id').notNull(), // reference to Student in Academic
  status: varchar('status', { length: 30 }).default('ACTIVE').notNull(), // 'ACTIVE', 'SUSPENDED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Sessions (Sesi pertemuan kuliah online)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  lmsClassId: uuid('lms_class_id')
    .references(() => lmsClasses.id, { onDelete: 'cascade' })
    .notNull(),
  sessionNo: integer('session_no').notNull(), // 1 to 16
  topic: varchar('topic', { length: 255 }).notNull(),
  description: text('description'),
  meetUrl: varchar('meet_url', { length: 255 }),
  scheduleDate: timestamp('schedule_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Materials (Materi perkuliahan)
export const materials = pgTable('materials', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  contentUrl: varchar('content_url', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'PDF', 'VIDEO', 'SLIDE'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Assignments (Tugas kuliah)
export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  instruction: text('instruction').notNull(),
  dueDate: timestamp('due_date').notNull(),
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

// Relationships definition
export const lmsClassesRelations = relations(lmsClasses, ({ many }) => ({
  enrollments: many(lmsEnrollments),
  sessions: many(sessions),
}));

export const lmsEnrollmentsRelations = relations(lmsEnrollments, ({ one }) => ({
  lmsClass: one(lmsClasses, {
    fields: [lmsEnrollments.lmsClassId],
    references: [lmsClasses.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  lmsClass: one(lmsClasses, {
    fields: [sessions.lmsClassId],
    references: [lmsClasses.id],
  }),
  materials: many(materials),
  assignments: many(assignments),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  session: one(sessions, {
    fields: [materials.sessionId],
    references: [sessions.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  session: one(sessions, {
    fields: [assignments.sessionId],
    references: [sessions.id],
  }),
}));
