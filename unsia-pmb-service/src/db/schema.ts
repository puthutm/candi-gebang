import { pgTable, uuid, varchar, timestamp, boolean, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Applicants Table
export const applicants = pgTable('applicants', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadRefId: uuid('lead_ref_id'), // reference to converted CRM lead if any
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }).notNull(),
  status: varchar('status', { length: 50 }).default('REGISTERED').notNull(), // 'REGISTERED', 'BIODATA_COMPLETED', 'DOCUMENTS_UPLOADED', 'EXAM_COMPLETED', 'VERIFIED', 'ACCEPTED', 'HANDOVER_COMPLETED'
  studyProgramRefId: uuid('study_program_ref_id'), // reference to reference study program
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Biodatas Table
export const biodatas = pgTable('biodatas', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicantId: uuid('applicant_id')
    .references(() => applicants.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }), // 'M', 'F'
  placeOfBirth: varchar('place_of_birth', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth'),
  religionCode: varchar('religion_code', { length: 20 }),
  nationality: varchar('nationality', { length: 100 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Documents Table
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicantId: uuid('applicant_id')
    .references(() => applicants.id, { onDelete: 'cascade' })
    .notNull(),
  documentTypeCode: varchar('document_type_code', { length: 50 }).notNull(), // e.g. 'KTP', 'IJAZAH'
  fileUrl: varchar('file_url', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // 'PENDING', 'VERIFIED', 'REJECTED'
  rejectionReason: text('rejection_reason'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by'), // person_ref_id of the admin
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const applicantsRelations = relations(applicants, ({ one, many }) => ({
  biodata: one(biodatas, {
    fields: [applicants.id],
    references: [biodatas.applicantId],
  }),
  documents: many(documents),
}));

export const biodatasRelations = relations(biodatas, ({ one }) => ({
  applicant: one(applicants, {
    fields: [biodatas.applicantId],
    references: [applicants.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  applicant: one(applicants, {
    fields: [documents.applicantId],
    references: [applicants.id],
  }),
}));
