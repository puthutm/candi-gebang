import { pgTable, uuid, varchar, timestamp, boolean, text, integer, jsonb } from 'drizzle-orm/pg-core';

// 1. Study Programs (Program Studi)
export const studyPrograms = pgTable('study_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(), // S1, S2, D3, etc.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Academic Years (Tahun Ajaran)
export const academicYears = pgTable('academic_years', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // e.g. '2025/2026'
  name: varchar('name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Academic Periods (Semester/Periode Akademik)
export const academicPeriods = pgTable('academic_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  academicYearId: uuid('academic_year_id')
    .references(() => academicYears.id, { onDelete: 'cascade' })
    .notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. '20251'
  name: varchar('name', { length: 100 }).notNull(),
  termCode: varchar('term_code', { length: 20 }).notNull(), // 'ODD', 'EVEN', 'SHORT'
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Curriculum Years (Tahun Kurikulum)
export const curriculumYears = pgTable('curriculum_years', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // e.g. 'K2024'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Status Codes Table
export const statusCodes = pgTable('status_codes', {
  code: varchar('code', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  group: varchar('group', { length: 50 }).notNull(), // e.g., 'INVOICE_STATUS', 'APPLICANT_STATUS'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Payment Components Table
export const paymentComponents = pgTable('payment_components', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. 'SPP', 'PMB_REG'
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Payment Methods Table
export const paymentMethods = pgTable('payment_methods', {
  code: varchar('code', { length: 50 }).primaryKey(), // e.g. 'VA_BNI', 'VA_MANDIRI'
  name: varchar('name', { length: 100 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(), // e.g. 'VA', 'CREDIT_CARD'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Document Types Table
export const documentTypes = pgTable('document_types', {
  code: varchar('code', { length: 50 }).primaryKey(), // e.g., 'IJAZAH', 'KTP', 'TRANSCRIPT'
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  isRequired: boolean('is_required').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Regions Table (Wilayah/Negara/Provinsi/Kabupaten)
export const regions = pgTable('regions', {
  code: varchar('code', { length: 50 }).primaryKey(), // e.g. 'ID.31.71' (Jakarta Selatan)
  parentCode: varchar('parent_code', { length: 50 }),
  name: varchar('name', { length: 150 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(), // 'COUNTRY', 'PROVINCE', 'REGENCY', 'DISTRICT'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Religions Table
export const religions = pgTable('religions', {
  code: varchar('code', { length: 20 }).primaryKey(), // e.g. 'ISLAM', 'KRISTEN'
  name: varchar('name', { length: 50 }).notNull(),
});

// --- TECHNICAL TABLES ---

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'), // external_ref
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
