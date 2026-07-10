import { pgTable, uuid, varchar, timestamp, boolean, text, primaryKey, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Persons Table
export const persons = pgTable('persons', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. User Accounts Table
export const userAccounts = pgTable('user_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  personId: uuid('person_id')
    .references(() => persons.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Passwords Table
export const passwords = pgTable('passwords', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Roles Table
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Permissions Table
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Role Permissions Link Table
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissionId: uuid('permission_id')
      .references(() => permissions.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table: any) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

// 7. User Roles (RBAC with scope)
export const userRoles = pgTable('user_roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  roleId: uuid('role_id')
    .references(() => roles.id, { onDelete: 'cascade' })
    .notNull(),
  scopeType: varchar('scope_type', { length: 50 }).notNull(), // e.g. 'global', 'study_program'
  scopeValue: varchar('scope_value', { length: 255 }).notNull(), // e.g. prodi ID or 'all'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  activeRole: varchar('active_role', { length: 50 }),
  activeScopeType: varchar('active_scope_type', { length: 50 }),
  activeScopeValue: varchar('active_scope_value', { length: 255 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Refresh Tokens Table
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Application Registry Table
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  url: varchar('url', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Service Clients Table
export const serviceClients = pgTable('service_clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: varchar('client_id', { length: 100 }).notNull().unique(),
  clientSecret: varchar('client_secret', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Service Tokens Table
export const serviceTokens = pgTable('service_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .references(() => serviceClients.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Notifications Table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('INFO').notNull(), // 'INFO', 'WARNING', 'ALERT'
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. User Preferences Table
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  theme: varchar('theme', { length: 20 }).default('dark').notNull(),
  language: varchar('language', { length: 5 }).default('id').notNull(),
  notificationEnabled: boolean('notification_enabled').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Impersonation Logs Table
export const impersonationLogs = pgTable('impersonation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  targetId: uuid('target_id')
    .references(() => userAccounts.id, { onDelete: 'cascade' })
    .notNull(),
  reason: text('reason').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Audit Logs Table (Global/Local)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id'),
  actorRole: varchar('actor_role', { length: 50 }),
  action: varchar('action', { length: 100 }).notNull(), // e.g., 'CREATE', 'UPDATE', 'DELETE'
  resource: varchar('resource', { length: 100 }).notNull(), // e.g., 'user_account'
  resourceId: varchar('resource_id', { length: 100 }),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 255 }),
  correlationId: uuid('correlation_id'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
});

// 15. Idempotency Keys Table
export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 255 }).primaryKey(),
  responseCode: integer('response_code').notNull(),
  responseBody: text('response_body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Outbox Events Table
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

// 17. Inbox Events Table
export const inboxEvents = pgTable('inbox_events', {
  eventKey: varchar('event_key', { length: 255 }).primaryKey(),
  eventName: varchar('event_name', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. Reconciliation Logs Table
export const reconciliationLogs = pgTable('reconciliation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  reconciliationType: varchar('reconciliation_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // e.g. 'success', 'mismatch'
  mismatches: jsonb('mismatches'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
});

// Relationships definition
export const personsRelations = relations(persons, (helpers: any) => ({
  userAccount: helpers.one(userAccounts, {
    fields: [persons.id],
    references: [userAccounts.personId],
  }),
}));

export const userAccountsRelations = relations(userAccounts, (helpers: any) => ({
  person: helpers.one(persons, {
    fields: [userAccounts.personId],
    references: [persons.id],
  }),
  passwords: helpers.many(passwords),
  userRoles: helpers.many(userRoles),
  sessions: helpers.many(sessions),
  refreshTokens: helpers.many(refreshTokens),
}));

export const rolesRelations = relations(roles, (helpers: any) => ({
  userRoles: helpers.many(userRoles),
  rolePermissions: helpers.many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, (helpers: any) => ({
  rolePermissions: helpers.many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, (helpers: any) => ({
  role: helpers.one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: helpers.one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, (helpers: any) => ({
  user: helpers.one(userAccounts, {
    fields: [userRoles.userId],
    references: [userAccounts.id],
  }),
  role: helpers.one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));
