import { pgTable, uuid, varchar, timestamp, boolean, text, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Campaigns Table
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  budget: decimal('budget', { precision: 15, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Agents Table (Mitra/Marketing Agents)
export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  personRefId: uuid('person_ref_id').notNull(), // reference to person in Core DB
  agentCode: varchar('agent_code', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 30 }).default('ACTIVE').notNull(), // 'ACTIVE', 'INACTIVE'
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Leads Table
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(), // 'WEBSITE', 'MITRA', 'ADS', 'EXPO'
  status: varchar('status', { length: 50 }).default('NEW').notNull(), // 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'
  studyProgramRefId: uuid('study_program_ref_id'), // reference to reference study program
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Follow-Ups Table
export const followUps = pgTable('follow_ups', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  notes: text('notes').notNull(),
  followUpDate: timestamp('follow_up_date').defaultNow().notNull(),
  nextAction: varchar('next_action', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Referrals Table
export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  applicantRefId: uuid('applicant_ref_id'), // reference to PMB applicant when converted
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // 'PENDING', 'QUALIFIED', 'PAID', 'COMMISSION_PAID'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Commissions Table
export const commissions = pgTable('commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  referralId: uuid('referral_id').references(() => referrals.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('UNPAID').notNull(), // 'UNPAID', 'PAID'
  paidAt: timestamp('paid_at'),
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
export const campaignsRelations = relations(campaigns, ({ many }) => ({
  leads: many(leads),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  leads: many(leads),
  followUps: many(followUps),
  referrals: many(referrals),
  commissions: many(commissions),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [leads.campaignId],
    references: [campaigns.id],
  }),
  agent: one(agents, {
    fields: [leads.agentId],
    references: [agents.id],
  }),
  followUps: many(followUps),
  referral: one(referrals, {
    fields: [leads.id],
    references: [referrals.leadId],
  }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  lead: one(leads, {
    fields: [followUps.leadId],
    references: [leads.id],
  }),
  agent: one(agents, {
    fields: [followUps.agentId],
    references: [agents.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  lead: one(leads, {
    fields: [referrals.leadId],
    references: [leads.id],
  }),
  agent: one(agents, {
    fields: [referrals.agentId],
    references: [agents.id],
  }),
  commissions: many(commissions),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  agent: one(agents, {
    fields: [commissions.agentId],
    references: [agents.id],
  }),
  referral: one(referrals, {
    fields: [commissions.referralId],
    references: [referrals.id],
  }),
}));
