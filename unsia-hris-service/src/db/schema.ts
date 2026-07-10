import { pgTable, uuid, varchar, timestamp, boolean, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Employees Table
export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  personRefId: uuid('person_ref_id').notNull().unique(), // reference to Core person
  employeeNip: varchar('employee_nip', { length: 50 }).notNull().unique(), // Nomor Induk Pegawai
  status: varchar('status', { length: 30 }).default('ACTIVE').notNull(), // 'ACTIVE', 'INACTIVE'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Lecturers Table
export const lecturers = pgTable('lecturers', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  nidn: varchar('nidn', { length: 50 }).unique(), // Nomor Induk Dosen Nasional
  isHomebase: boolean('is_homebase').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Lecturer Homebases Table
export const lecturerHomebases = pgTable('lecturer_homebases', {
  id: uuid('id').defaultRandom().primaryKey(),
  lecturerId: uuid('lecturer_id')
    .references(() => lecturers.id, { onDelete: 'cascade' })
    .notNull(),
  studyProgramRefId: uuid('study_program_ref_id').notNull(), // reference to Reference Study Program
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
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
export const employeesRelations = relations(employees, ({ one }) => ({
  lecturer: one(lecturers, {
    fields: [employees.id],
    references: [lecturers.employeeId],
  }),
}));

export const lecturersRelations = relations(lecturers, ({ one, many }) => ({
  employee: one(employees, {
    fields: [lecturers.employeeId],
    references: [employees.id],
  }),
  homebases: many(lecturerHomebases),
}));

export const lecturerHomebasesRelations = relations(lecturerHomebases, ({ one }) => ({
  lecturer: one(lecturers, {
    fields: [lecturerHomebases.lecturerId],
    references: [lecturers.id],
  }),
}));
