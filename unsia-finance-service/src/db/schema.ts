import { pgTable, uuid, varchar, timestamp, boolean, text, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Invoices Table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNo: varchar('invoice_no', { length: 50 }).notNull().unique(), // e.g. INV/2026/0001
  billToType: varchar('bill_to_type', { length: 30 }).notNull(), // 'APPLICANT', 'STUDENT', 'PERSON'
  billToRefId: uuid('bill_to_ref_id').notNull(), // external_ref to pmb applicant, student, etc.
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('UNPAID').notNull(), // 'UNPAID', 'PAID', 'EXPIRED', 'CANCELLED'
  description: text('description'),
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Invoice Items Table
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  itemCode: varchar('item_code', { length: 50 }).notNull(), // e.g. 'SPP', 'PMB_REG'
  itemName: varchar('item_name', { length: 150 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Payments Table (Transactions log)
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id')
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  providerEventId: varchar('provider_event_id', { length: 100 }).unique(), // payment gateway unique trx ID
  paymentMethodCode: varchar('payment_method_code', { length: 50 }).notNull(), // e.g. 'VA_BNI'
  amountPaid: decimal('amount_paid', { precision: 15, scale: 2 }).notNull(),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  verifiedBy: uuid('verified_by'), // admin person ref if verified manually
  verificationReason: text('verification_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Clearances Table (Layanan akademik clearance)
export const clearances = pgTable('clearances', {
  id: uuid('id').defaultRandom().primaryKey(),
  subjectRefId: uuid('subject_ref_id').notNull(), // applicant/student external ref
  subjectType: varchar('subject_type', { length: 30 }).notNull(), // 'APPLICANT', 'STUDENT'
  serviceCode: varchar('service_code', { length: 50 }).notNull(), // 'KRS_FILLING', 'EXAM_ATTENDANCE', 'GRADUATION'
  academicPeriodRefId: uuid('academic_period_ref_id'), // academic period ref
  status: varchar('status', { length: 30 }).default('BLOCKED').notNull(), // 'CLEARED', 'BLOCKED'
  reason: text('reason'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
  payments: many(payments),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));
