import { pgTable, uuid, varchar, timestamp, boolean, text, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Students Table
export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  nim: varchar('nim', { length: 30 }).notNull().unique(), // Nomor Induk Mahasiswa
  applicantRefId: uuid('applicant_ref_id').notNull().unique(), // reference to PMB applicant (handover source)
  studyProgramRefId: uuid('study_program_ref_id').notNull(), // reference to master study program
  academicPeriodRefId: uuid('academic_period_ref_id').notNull(), // period of admission
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(), // 'ACTIVE', 'LEAVE', 'DROPOUT', 'GRADUATED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Student Biodatas Table (Copied from PMB during handover, local copy)
export const studentBiodatas = pgTable('student_biodatas', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }),
  placeOfBirth: varchar('place_of_birth', { length: 100 }),
  dateOfBirth: timestamp('date_of_birth'),
  religionCode: varchar('religion_code', { length: 20 }),
  nationality: varchar('nationality', { length: 100 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Curriculums Table
export const curriculums = pgTable('curriculums', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. CURR-IF-2024
  name: varchar('name', { length: 150 }).notNull(),
  studyProgramRefId: uuid('study_program_ref_id').notNull(),
  curriculumYearRefId: uuid('curriculum_year_ref_id').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Courses Table (Mata Kuliah)
export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  curriculumId: uuid('curriculum_id')
    .references(() => curriculums.id, { onDelete: 'cascade' })
    .notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. IF101
  name: varchar('name', { length: 150 }).notNull(),
  credits: integer('credits').notNull(), // SKS
  semesterOrder: integer('semester_order').notNull(), // Rekomendasi semester (1-8)
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Class Offerings Table (Kelas Kuliah dibuka per semester)
export const classOfferings = pgTable('class_offerings', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  academicPeriodRefId: uuid('academic_period_ref_id').notNull(),
  className: varchar('class_name', { length: 10 }).notNull(), // e.g., 'A', 'B', 'ONLINE'
  lecturerRefId: uuid('lecturer_ref_id'), // HRIS lecturer ref
  capacity: integer('capacity').default(50).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. KRS Applications Table (Kartu Rencana Studi)
export const krsApplications = pgTable('krs_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull(),
  academicPeriodRefId: uuid('academic_period_ref_id').notNull(),
  status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'
  advisorApprovalStatus: varchar('advisor_approval_status', { length: 50 }).default('PENDING').notNull(),
  advisorNotes: text('advisor_notes'),
  approvedAt: timestamp('approved_at'),
  approvedBy: uuid('approved_by'), // advisor lecturer ref
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. KRS Items Table
export const krsItems = pgTable('krs_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  krsApplicationId: uuid('krs_application_id')
    .references(() => krsApplications.id, { onDelete: 'cascade' })
    .notNull(),
  classOfferingId: uuid('class_offering_id')
    .references(() => classOfferings.id, { onDelete: 'cascade' })
    .notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Student Clearance Snapshots Table (Finance Clearance Cache for Degraded Mode)
export const studentClearanceSnapshots = pgTable('student_clearance_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull(),
  serviceCode: varchar('service_code', { length: 50 }).notNull(), // e.g., 'KRS_FILLING'
  status: varchar('status', { length: 30 }).notNull(), // 'CLEARED', 'BLOCKED'
  reason: text('reason'),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
  sourceEventKey: varchar('source_event_key', { length: 255 }),
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

// 9. Student Grades Table
export const studentGrades = pgTable('student_grades', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull(),
  classOfferingId: uuid('class_offering_id')
    .references(() => classOfferings.id, { onDelete: 'cascade' })
    .notNull(),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  gradePoint: decimal('grade_point', { precision: 3, scale: 2 }), // e.g. 4.00, 3.70
  gradeLetter: varchar('grade_letter', { length: 5 }), // e.g. 'A', 'A-', 'B+'
  attemptRefId: uuid('attempt_ref_id'), // reference to assessment service attempt
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. KHS Records Table (Kartu Hasil Studi per Semester)
export const khsRecords = pgTable('khs_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull(),
  academicPeriodRefId: uuid('academic_period_ref_id').notNull(),
  ips: decimal('ips', { precision: 3, scale: 2 }).notNull(), // Indeks Prestasi Semester (0.00 - 4.00)
  totalCredits: integer('total_credits').notNull(), // SKS diambil
  isLocked: boolean('is_locked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Transcript Records Table (Transkrip Nilai Kumulatif)
export const transcriptRecords = pgTable('transcript_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  ipk: decimal('ipk', { precision: 3, scale: 2 }).notNull(), // Indeks Prestasi Kumulatif
  totalCreditsEarned: integer('total_credits_earned').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Graduation Records Table (Yudisium & Alumni)
export const graduationRecords = pgTable('graduation_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .references(() => students.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  graduationDate: timestamp('graduation_date').notNull(),
  certificateNumber: varchar('certificate_number', { length: 100 }).unique(),
  status: varchar('status', { length: 50 }).default('YUDISIUM_COMPLETED').notNull(), // 'YUDISIUM_COMPLETED', 'ALUMNI'
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const studentsRelations = relations(students, ({ one, many }) => ({
  biodata: one(studentBiodatas, {
    fields: [students.id],
    references: [studentBiodatas.studentId],
  }),
  krsApplications: many(krsApplications),
  clearanceSnapshots: many(studentClearanceSnapshots),
}));

export const studentBiodatasRelations = relations(studentBiodatas, ({ one }) => ({
  student: one(students, {
    fields: [studentBiodatas.studentId],
    references: [students.id],
  }),
}));

export const curriculumsRelations = relations(curriculums, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  curriculum: one(curriculums, {
    fields: [courses.curriculumId],
    references: [curriculums.id],
  }),
  classOfferings: many(classOfferings),
}));

export const classOfferingsRelations = relations(classOfferings, ({ one, many }) => ({
  course: one(courses, {
    fields: [classOfferings.courseId],
    references: [courses.id],
  }),
  krsItems: many(krsItems),
}));

export const krsApplicationsRelations = relations(krsApplications, ({ one, many }) => ({
  student: one(students, {
    fields: [krsApplications.studentId],
    references: [students.id],
  }),
  items: many(krsItems),
}));

export const krsItemsRelations = relations(krsItems, ({ one }) => ({
  application: one(krsApplications, {
    fields: [krsItems.krsApplicationId],
    references: [krsApplications.id],
  }),
  classOffering: one(classOfferings, {
    fields: [krsItems.classOfferingId],
    references: [classOfferings.id],
  }),
}));
