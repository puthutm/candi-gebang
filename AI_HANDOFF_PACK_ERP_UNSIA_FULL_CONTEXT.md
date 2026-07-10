# AI HANDOFF PACK
# ERP Pendidikan / SIAKAD Terintegrasi UNSIA
# Multi-Repo + Next.js + TypeScript + Drizzle ORM

Dokumen ini dibuat untuk dilempar ke AI developer lain.

Isi dokumen ini mencakup baseline utama proyek ERP UNSIA:

1. Master prompt arsitektur dan struktur repo.
2. PRD Global UNSIA.
3. BRD UNSIA.
4. SRS ERP UNSIA.
5. Finalisasi Role dan Permission.
6. Finalisasi Module Boundary.
7. DBML Global UNSIA.
8. Finalisasi API Contract.
9. OpenAPI Swagger Final.

Gunakan dokumen ini sebagai konteks utama sebelum membuat kode, backlog, struktur folder, Drizzle schema, API route, middleware, worker, test case, deployment, atau runbook.

---

## Cara Pakai untuk AI Lain

Salin file ini ke AI lain, lalu beri instruksi seperti ini:

```text
Pelajari seluruh dokumen AI handoff pack ini.
Jangan mengubah arsitektur utama.
Gunakan multi-repo, Next.js, TypeScript, Drizzle ORM, PostgreSQL per modul, RBAC, data scope, idempotency, audit, outbox/inbox, event-driven integration, degraded mode, dan reconciliation.
Setelah paham, bantu saya mengerjakan task berikut: [isi task].
```

---



# BAGIAN 1 - MASTER PROMPT DAN STRUKTUR REPO

# MASTER PROMPT AI
# ERP Pendidikan / SIAKAD Terintegrasi UNSIA
# Multi-Repo, Next.js, TypeScript, Drizzle ORM

## 1. Peran AI

Bertindak sebagai System Analyst, Software Architect, Technical Lead, Backend Engineer, Frontend Engineer, Database Architect, DevOps Engineer, dan QA Engineer untuk proyek ERP Pendidikan / SIAKAD Terintegrasi UNSIA.

Tugas utama AI adalah membantu merancang, membangun, menguji, dan menyiapkan implementasi sistem ERP UNSIA berbasis multi-repo, modular service, database per modul, API contract, event-driven integration, outbox/inbox, idempotency, audit trail, RBAC, data scope, degraded mode, dan reconciliation.

Gunakan bahasa Indonesia yang jelas, teknis, dan langsung. Berikan output yang siap dipakai developer.

---

## 2. Konteks Produk

Produk yang akan dibangun adalah ERP Pendidikan / SIAKAD Terintegrasi UNSIA.

Sistem mencakup lifecycle kampus dari:

1. Lead
2. CRM
3. Pendaftar PMB
4. Biodata applicant
5. Upload dokumen
6. Seleksi
7. LoA
8. Invoice
9. Payment
10. Clearance
11. Handover ke akademik
12. Generate NIM
13. Mahasiswa aktif
14. KRS
15. Kelas akademik
16. LMS
17. Assessment
18. Nilai
19. KHS
20. Transkrip
21. Alumni
22. Portal
23. Notification
24. Dashboard
25. Reporting

Sistem ini bukan aplikasi tunggal sederhana. Sistem ini adalah ekosistem ERP modular yang harus menjaga ownership data, keamanan akses, integrasi lintas modul, dan kualitas release.

---

## 3. Keputusan Arsitektur Final

Keputusan arsitektur final:

```text
Architecture style : Modular distributed ERP
Repository model   : Multi-repo
Frontend           : Next.js + TypeScript
Backend API        : Next.js Route Handler + TypeScript
ORM                : Drizzle ORM
Database           : PostgreSQL per modul
Worker             : Node.js TypeScript worker
Integration        : API + event + snapshot + read model
Auth authority     : Core Service
Access control     : RBAC + active role + data scope
Critical flow      : Idempotency + audit + outbox/inbox
Deployment         : Docker + API Gateway + CI/CD
```

Setiap modul memiliki database fisik sendiri.

Tidak boleh ada foreign key lintas database.

Tidak boleh ada direct cross-database join untuk transaksi online.

Relasi lintas modul wajib menggunakan external reference, API, event, snapshot, read model, warehouse, dan reconciliation.

---

## 4. Prinsip Utama Sistem

Wajib ikuti prinsip berikut:

1. Satu modul memiliki satu database fisik.
2. Setiap service hanya boleh mengakses database miliknya sendiri.
3. Foreign key hanya boleh ada di dalam database modul yang sama.
4. Relasi lintas modul memakai external reference.
5. Cross-module write hanya boleh lewat API command atau event resmi.
6. Cross-module read memakai API query, snapshot, read model, event projection, atau warehouse.
7. Snapshot bukan source of truth.
8. Source of truth tetap berada di modul pemilik domain.
9. Critical command wajib idempotent.
10. Perubahan data penting wajib membuat audit log.
11. Perubahan data penting wajib membuat outbox event.
12. Consumer event wajib idempotent.
13. Duplicate event tidak boleh membuat data ganda.
14. Setiap modul wajib punya degraded mode.
15. Setiap modul wajib punya reconciliation untuk data lintas modul.
16. Semua endpoint protected wajib validasi token, active role, permission, application, dan data scope.
17. Frontend hanya membantu menyembunyikan menu atau tombol.
18. Backend tetap menjadi penentu akhir akses.
19. Aksi sensitif wajib audit.
20. Service-to-service communication wajib memakai service token.

---

## 5. Daftar Modul dan Database

| Modul | Repo | Database | Domain Utama |
|---|---|---|---|
| Core | unsia-core-service | core_db | Identity, SSO, user, role, permission, session, service token, audit global |
| Reference | unsia-reference-service | reference_db | Master data, prodi, tahun ajaran, periode akademik, status code |
| CRM | unsia-crm-service | crm_db | Lead, campaign, agent, referral, follow-up |
| PMB | unsia-pmb-service | pmb_db | Applicant, biodata, dokumen, seleksi, LoA, handover |
| Finance | unsia-finance-service | finance_db | Invoice, payment, callback, clearance, receipt |
| Academic | unsia-academic-service | academic_db | Student, NIM, curriculum, class, KRS, grade, KHS, transcript |
| HRIS | unsia-hris-service | hris_db | Employee, lecturer, homebase, unit kerja, jabatan |
| LMS | unsia-lms-service | lms_db | Online class, enrollment, session, material, task, progress, grade input |
| Assessment | unsia-assessment-service | assessment_db | Question bank, session, attempt, answer, scoring, result |
| Portal | unsia-portal-web | portal_db | Dashboard, notification, shortcut, preference, activity log |
| Worker | unsia-integration-worker | depends on service DB and broker | Outbox, inbox, retry, DLQ, replay, reconciliation |
| Shared | unsia-shared-contracts | no database | OpenAPI type, event schema, role code, permission code |
| Infra | unsia-infra | no database | Docker, gateway, deployment, monitoring, CI/CD |
| Docs | unsia-docs | no database | SRS, BRD, FSD, API contract, DBML, UAT, runbook |

---

## 6. Struktur Multi-Repo Final

```text
unsia-core-service/
unsia-reference-service/
unsia-crm-service/
unsia-pmb-service/
unsia-finance-service/
unsia-academic-service/
unsia-hris-service/
unsia-lms-service/
unsia-assessment-service/
unsia-portal-web/
unsia-integration-worker/
unsia-shared-contracts/
unsia-infra/
unsia-docs/
```

Urutan pembuatan repo yang disarankan:

```text
1. unsia-shared-contracts
2. unsia-infra
3. unsia-core-service
4. unsia-reference-service
5. unsia-pmb-service
6. unsia-finance-service
7. unsia-academic-service
8. unsia-integration-worker
9. unsia-portal-web
10. unsia-lms-service
11. unsia-assessment-service
12. unsia-hris-service
13. unsia-crm-service
14. unsia-docs
```

---

## 7. Tech Stack Final

### Frontend

```text
Next.js
TypeScript
Tailwind CSS
Shadcn UI
TanStack Query
React Hook Form
Zod
```

### Backend API

```text
Next.js Route Handler
TypeScript
Zod validation
Drizzle ORM
PostgreSQL
JWT validation
RBAC middleware
Data scope middleware
Audit middleware
Idempotency middleware
Response envelope
```

### ORM dan Database

```text
Drizzle ORM
PostgreSQL
drizzle-kit
Migration per service
Schema per service repo
No cross-service schema import
```

### Worker

```text
Node.js
TypeScript
Drizzle ORM
Event broker client
Outbox processor
Inbox processor
Retry handler
DLQ handler
Reconciliation job
```

### Infra

```text
Docker
Docker Compose
Nginx or API Gateway
GitHub Actions or GitLab CI
PostgreSQL per module
Redis or RabbitMQ
Monitoring
Logging
Tracing
Backup
Restore
```

---

## 8. API Standard

Semua endpoint protected wajib memakai header berikut:

```http
Authorization: Bearer <access_token>
X-Application-Code: <application_code>
X-Active-Role: <role_code>
X-Correlation-Id: <uuid>
Accept: application/json
Content-Type: application/json
```

Command kritis wajib memakai:

```http
Idempotency-Key: <deterministic_business_key>
```

Service-to-service call wajib memakai:

```http
X-Service-Token: <service_token>
X-Service-Name: <caller_service_name>
X-Correlation-Id: <uuid>
```

Payment callback wajib memakai:

```http
X-Provider-Signature: <provider_signature>
X-Provider-Event-Id: <provider_event_id>
X-Correlation-Id: <uuid>
```

---

## 9. Response Envelope

### Success

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {},
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1"
  }
}
```

### List

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": [],
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1"
  }
}
```

---

## 10. RBAC dan Data Scope

Gunakan konsep:

```text
RBAC + Active Role + Data Scope + Backend Enforcement
```

Prinsip:

1. User dapat memiliki lebih dari satu role.
2. User hanya menjalankan satu active role dalam satu session.
3. Menu frontend mengikuti active role.
4. Permission action mengikuti active role.
5. Data yang dapat dibaca atau diubah mengikuti data scope.
6. Direct URL dan direct API call tanpa permission harus ditolak.
7. Backend wajib menjadi penentu akhir akses.

Contoh role:

```text
super_admin
admin_bppti
technical_admin
auditor
admin_referensi
admin_crm
agen_mitra
pendaftar
admin_pmb
admin_finance
admin_akademik_biro
kaprodi
admin_akademik_prodi
dosen
dosen_pa
mahasiswa
admin_sdm
admin_lms
admin_assessment
pimpinan
service_account
```

Contoh permission:

```text
pmb.applicant.read
pmb.applicant.create
pmb.document.verify
finance.invoice.create
finance.payment.verify
academic.krs.approve
academic.grade.publish
lms.class.sync
assessment.result.publish
core.role.assign
```

Contoh data scope:

```text
global
module_domain
study_program
assigned_class
advisor
self
agent
read_only_aggregate
technical
```

---

## 11. Event Standard

Event wajib punya identitas jelas.

Contoh event:

```text
pmb.applicant_created
pmb.document_verified
pmb.loa_issued
pmb.handover_requested
finance.invoice_created
finance.payment_paid
finance.clearance_changed
academic.student_created
academic.nim_generated
academic.krs_approved
academic.grade_finalized
lms.class_synced
lms.enrollment_synced
assessment.result_published
portal.notification_created
```

Payload event minimal:

```json
{
  "event_id": "uuid",
  "event_name": "finance.payment_paid",
  "event_version": "v1",
  "event_key": "finance.payment_paid:<payment_id>",
  "producer": "finance-service",
  "occurred_at": "2026-06-22T10:00:00+07:00",
  "correlation_id": "uuid",
  "causation_id": "uuid",
  "payload": {}
}
```

---

## 12. Tabel Teknis Wajib di Setiap Service

Setiap service minimal punya tabel teknis berikut:

```text
audit_logs
idempotency_keys
outbox_events
inbox_events
reconciliation_logs
```

Untuk service yang butuh file:

```text
file_uploads
file_versions
```

Untuk service yang butuh status history:

```text
status_histories
```

---

## 13. Aturan Drizzle ORM

Wajib ikuti aturan berikut:

1. Satu service hanya punya satu `DATABASE_URL`.
2. Drizzle schema hanya untuk database service sendiri.
3. Tidak boleh import Drizzle schema dari service lain.
4. Tidak boleh membuat foreign key ke tabel service lain.
5. Relasi lintas modul memakai `*_ref_id`.
6. Migration dikelola di repo masing-masing.
7. Seed data dikelola di repo masing-masing.
8. Repository layer wajib membungkus query Drizzle.
9. Service layer tidak boleh langsung query Drizzle jika query kompleks.
10. Gunakan transaction hanya untuk operasi di database service sendiri.

Contoh external reference:

```text
person_ref_id
user_ref_id
applicant_ref_id
student_ref_id
invoice_ref_id
payment_ref_id
academic_period_ref_id
study_program_ref_id
course_ref_id
class_ref_id
lecturer_ref_id
```

---

## 14. Struktur Standar Service Repo

Gunakan struktur ini untuk semua backend service berbasis Next.js API.

```text
unsia-{module}-service/
├── app/
│   └── api/
│       └── v1/
│           ├── health/
│           │   └── route.ts
│           └── {resource}/
│               ├── route.ts
│               └── [id]/
│                   └── route.ts
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── app.ts
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema.ts
│   │   ├── relations.ts
│   │   └── seed.ts
│   ├── modules/
│   │   └── {resource}/
│   │       ├── {resource}.service.ts
│   │       ├── {resource}.repository.ts
│   │       ├── {resource}.validator.ts
│   │       ├── {resource}.types.ts
│   │       └── {resource}.mapper.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── scope.middleware.ts
│   │   ├── idempotency.middleware.ts
│   │   └── audit.middleware.ts
│   ├── lib/
│   │   ├── response.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── pagination.ts
│   │   ├── date.ts
│   │   └── uuid.ts
│   ├── clients/
│   │   ├── core.client.ts
│   │   ├── reference.client.ts
│   │   └── internal.client.ts
│   ├── events/
│   │   ├── event-names.ts
│   │   ├── outbox.publisher.ts
│   │   ├── inbox.consumer.ts
│   │   └── event.mapper.ts
│   ├── audit/
│   │   └── audit.service.ts
│   ├── idempotency/
│   │   └── idempotency.service.ts
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── contract/
├── drizzle/
│   ├── migrations/
│   └── meta/
├── drizzle.config.ts
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

---

## 15. Struktur Core Service

```text
unsia-core-service/
├── app/
│   └── api/
│       └── v1/
│           ├── auth/
│           │   ├── login/
│           │   │   └── route.ts
│           │   ├── refresh/
│           │   │   └── route.ts
│           │   ├── me/
│           │   │   └── route.ts
│           │   ├── logout/
│           │   │   └── route.ts
│           │   └── switch-role/
│           │       └── route.ts
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── roles/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── permissions/
│           │   └── route.ts
│           ├── applications/
│           │   └── route.ts
│           ├── service-tokens/
│           │   └── route.ts
│           ├── audit-logs/
│           │   └── route.ts
│           └── health/
│               └── route.ts
├── src/
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema.ts
│   │   └── relations.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── role/
│   │   ├── permission/
│   │   ├── application/
│   │   ├── session/
│   │   ├── service-token/
│   │   └── audit/
│   ├── middlewares/
│   ├── lib/
│   └── tests/
├── drizzle/
├── drizzle.config.ts
├── Dockerfile
└── package.json
```

Core owns:

```text
person
user_account
password
session
refresh_token
role
permission
user_role
active_role_session
application_registry
service_client
service_token
impersonation_log
audit_log
```

Core does not own:

```text
student
applicant
invoice
payment
course
class
LMS activity
assessment result
```

---

## 16. Struktur Reference Service

```text
unsia-reference-service/
├── app/
│   └── api/
│       └── v1/
│           ├── study-programs/
│           ├── academic-years/
│           ├── academic-periods/
│           ├── curriculum-years/
│           ├── status-codes/
│           ├── payment-components/
│           ├── document-types/
│           ├── regions/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── study-program/
│   │   ├── academic-year/
│   │   ├── academic-period/
│   │   ├── curriculum-year/
│   │   ├── status-code/
│   │   ├── payment-component/
│   │   ├── document-type/
│   │   └── region/
│   ├── middlewares/
│   ├── lib/
│   └── tests/
├── drizzle/
├── drizzle.config.ts
└── package.json
```

Reference owns:

```text
study_program
academic_year
academic_period
curriculum_year
status_code
payment_component
payment_method
document_type
region
religion
```

---

## 17. Struktur CRM Service

```text
unsia-crm-service/
├── app/
│   └── api/
│       └── v1/
│           ├── campaigns/
│           ├── leads/
│           ├── agents/
│           ├── referrals/
│           ├── follow-ups/
│           ├── commissions/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── campaign/
│   │   ├── lead/
│   │   ├── agent/
│   │   ├── referral/
│   │   ├── follow-up/
│   │   └── commission/
│   ├── clients/
│   │   ├── core.client.ts
│   │   └── pmb.client.ts
│   ├── events/
│   └── tests/
├── drizzle/
└── package.json
```

CRM owns:

```text
campaign
lead
agent
referral
follow_up
commission
lead_conversion
```

CRM may store snapshot:

```text
person_snapshot
applicant_ref_id
```

---

## 18. Struktur PMB Service

```text
unsia-pmb-service/
├── app/
│   └── api/
│       └── v1/
│           ├── applicants/
│           ├── biodata/
│           ├── documents/
│           ├── selections/
│           ├── loa/
│           ├── handover/
│           ├── invoice-requests/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── applicant/
│   │   ├── biodata/
│   │   ├── document/
│   │   ├── selection/
│   │   ├── loa/
│   │   ├── handover/
│   │   └── invoice-request/
│   ├── clients/
│   │   ├── core.client.ts
│   │   ├── reference.client.ts
│   │   ├── finance.client.ts
│   │   └── academic.client.ts
│   ├── events/
│   ├── audit/
│   ├── idempotency/
│   └── tests/
├── drizzle/
└── package.json
```

PMB owns:

```text
applicant
applicant_biodata
applicant_document
selection_result
loa
handover_request
pmb_status_history
```

PMB does not own:

```text
invoice
payment
student
nim
krs
```

PMB publishes:

```text
pmb.applicant_created
pmb.document_verified
pmb.loa_issued
pmb.handover_requested
```

---

## 19. Struktur Finance Service

```text
unsia-finance-service/
├── app/
│   └── api/
│       └── v1/
│           ├── invoices/
│           ├── payments/
│           ├── payment-callbacks/
│           ├── manual-verifications/
│           ├── receipts/
│           ├── clearances/
│           ├── scholarships/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── invoice/
│   │   ├── payment/
│   │   ├── payment-callback/
│   │   ├── manual-verification/
│   │   ├── receipt/
│   │   ├── clearance/
│   │   └── scholarship/
│   ├── clients/
│   │   ├── core.client.ts
│   │   ├── reference.client.ts
│   │   ├── pmb.client.ts
│   │   └── academic.client.ts
│   ├── events/
│   ├── audit/
│   ├── idempotency/
│   └── tests/
├── drizzle/
└── package.json
```

Finance owns:

```text
invoice
invoice_item
payment
payment_callback
payment_verification
receipt
clearance
scholarship
finance_status_history
```

Finance publishes:

```text
finance.invoice_created
finance.payment_paid
finance.clearance_changed
finance.receipt_issued
```

---

## 20. Struktur Academic Service

```text
unsia-academic-service/
├── app/
│   └── api/
│       └── v1/
│           ├── students/
│           ├── nim/
│           ├── curriculums/
│           ├── courses/
│           ├── classes/
│           ├── krs/
│           ├── grades/
│           ├── khs/
│           ├── transcripts/
│           ├── alumni/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── student/
│   │   ├── nim/
│   │   ├── curriculum/
│   │   ├── course/
│   │   ├── class/
│   │   ├── krs/
│   │   ├── grade/
│   │   ├── khs/
│   │   ├── transcript/
│   │   └── alumni/
│   ├── clients/
│   │   ├── core.client.ts
│   │   ├── reference.client.ts
│   │   ├── finance.client.ts
│   │   ├── hris.client.ts
│   │   └── lms.client.ts
│   ├── events/
│   ├── audit/
│   ├── idempotency/
│   └── tests/
├── drizzle/
└── package.json
```

Academic owns:

```text
student
nim_sequence
curriculum
curriculum_course
course
class
class_schedule
krs
krs_item
source_grade
final_grade
khs
transcript
alumni
```

Academic publishes:

```text
academic.student_created
academic.nim_generated
academic.class_created
academic.krs_approved
academic.grade_finalized
academic.transcript_generated
```

---

## 21. Struktur HRIS Service

```text
unsia-hris-service/
├── app/
│   └── api/
│       └── v1/
│           ├── employees/
│           ├── lecturers/
│           ├── homebases/
│           ├── units/
│           ├── positions/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── employee/
│   │   ├── lecturer/
│   │   ├── homebase/
│   │   ├── unit/
│   │   └── position/
│   ├── events/
│   └── tests/
├── drizzle/
└── package.json
```

HRIS owns:

```text
employee
lecturer
homebase
unit
position
employment_status
```

---

## 22. Struktur LMS Service

```text
unsia-lms-service/
├── app/
│   └── api/
│       └── v1/
│           ├── online-classes/
│           ├── enrollments/
│           ├── sessions/
│           ├── materials/
│           ├── tasks/
│           ├── attendance/
│           ├── progress/
│           ├── grade-inputs/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── online-class/
│   │   ├── enrollment/
│   │   ├── session/
│   │   ├── material/
│   │   ├── task/
│   │   ├── attendance/
│   │   ├── progress/
│   │   └── grade-input/
│   ├── clients/
│   │   ├── academic.client.ts
│   │   └── assessment.client.ts
│   ├── events/
│   └── tests/
├── drizzle/
└── package.json
```

LMS owns:

```text
online_class
lms_enrollment
session
material
task
attendance
progress
grade_input
```

LMS publishes:

```text
lms.class_synced
lms.enrollment_synced
lms.grade_input_submitted
```

---

## 23. Struktur Assessment Service

```text
unsia-assessment-service/
├── app/
│   └── api/
│       └── v1/
│           ├── question-banks/
│           ├── questions/
│           ├── sessions/
│           ├── attempts/
│           ├── answers/
│           ├── scoring/
│           ├── results/
│           └── health/
├── src/
│   ├── db/
│   ├── modules/
│   │   ├── question-bank/
│   │   ├── question/
│   │   ├── assessment-session/
│   │   ├── attempt/
│   │   ├── answer/
│   │   ├── scoring/
│   │   └── result/
│   ├── clients/
│   │   ├── academic.client.ts
│   │   └── lms.client.ts
│   ├── events/
│   └── tests/
├── drizzle/
└── package.json
```

Assessment owns:

```text
question_bank
question
assessment_session
attempt
answer
scoring
assessment_result
```

Assessment publishes:

```text
assessment.result_published
assessment.attempt_completed
```

---

## 24. Struktur Portal Web

Portal adalah frontend utama dan workspace role-based.

```text
unsia-portal-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── switch-role/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── pmb/
│   │   ├── finance/
│   │   ├── academic/
│   │   ├── lms/
│   │   ├── assessment/
│   │   ├── hris/
│   │   ├── crm/
│   │   └── settings/
│   ├── api/
│   │   └── proxy/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   ├── feedback/
│   │   └── charts/
│   ├── features/
│   │   ├── auth/
│   │   ├── core/
│   │   ├── reference/
│   │   ├── crm/
│   │   ├── pmb/
│   │   ├── finance/
│   │   ├── academic/
│   │   ├── hris/
│   │   ├── lms/
│   │   ├── assessment/
│   │   └── portal/
│   ├── hooks/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── stores/
│   ├── types/
│   └── constants/
├── public/
├── .env.example
├── Dockerfile
└── package.json
```

Portal rules:

1. Portal tidak boleh menjadi source of truth transaksi bisnis.
2. Portal hanya consume API service.
3. Portal boleh punya database `portal_db` untuk dashboard, notification, shortcut, preference, dan activity log.
4. Portal wajib menampilkan loading state.
5. Portal wajib menampilkan empty state.
6. Portal wajib menampilkan error state.
7. Portal wajib menampilkan degraded mode.
8. Portal wajib menampilkan freshness status untuk snapshot/read model.

---

## 25. Struktur Integration Worker

```text
unsia-integration-worker/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── db/
│   │   ├── clients/
│   │   │   ├── core.db.ts
│   │   │   ├── pmb.db.ts
│   │   │   ├── finance.db.ts
│   │   │   ├── academic.db.ts
│   │   │   ├── lms.db.ts
│   │   │   └── assessment.db.ts
│   │   └── connection-registry.ts
│   ├── workers/
│   │   ├── outbox.worker.ts
│   │   ├── inbox.worker.ts
│   │   ├── retry.worker.ts
│   │   ├── dlq.worker.ts
│   │   ├── replay.worker.ts
│   │   └── reconciliation.worker.ts
│   ├── events/
│   │   ├── broker.ts
│   │   ├── publisher.ts
│   │   ├── consumer.ts
│   │   ├── event-router.ts
│   │   └── event-registry.ts
│   ├── handlers/
│   │   ├── pmb.handlers.ts
│   │   ├── finance.handlers.ts
│   │   ├── academic.handlers.ts
│   │   ├── lms.handlers.ts
│   │   └── assessment.handlers.ts
│   ├── reconciliation/
│   │   ├── finance-academic.reconciliation.ts
│   │   ├── pmb-academic.reconciliation.ts
│   │   └── lms-academic.reconciliation.ts
│   ├── lib/
│   │   ├── logger.ts
│   │   ├── retry.ts
│   │   ├── backoff.ts
│   │   └── errors.ts
│   └── main.ts
├── Dockerfile
├── package.json
└── README.md
```

Worker responsibilities:

1. Process outbox events.
2. Publish event to broker.
3. Consume event into inbox.
4. Handle duplicate event safely.
5. Retry failed event.
6. Move failed event to DLQ.
7. Replay DLQ event.
8. Run reconciliation job.
9. Create evidence for integration logs.
10. Keep correlation ID and causation ID.

Worker is not a Next.js app. Worker uses Node.js TypeScript.

---

## 26. Struktur Shared Contracts

```text
unsia-shared-contracts/
├── src/
│   ├── api/
│   │   ├── response-envelope.ts
│   │   ├── error-envelope.ts
│   │   ├── pagination.ts
│   │   └── headers.ts
│   ├── auth/
│   │   ├── role-code.ts
│   │   ├── permission-code.ts
│   │   ├── data-scope.ts
│   │   └── application-code.ts
│   ├── events/
│   │   ├── event-envelope.ts
│   │   ├── event-name.ts
│   │   ├── event-version.ts
│   │   ├── pmb.events.ts
│   │   ├── finance.events.ts
│   │   ├── academic.events.ts
│   │   ├── lms.events.ts
│   │   └── assessment.events.ts
│   ├── errors/
│   │   ├── error-code.ts
│   │   └── http-status.ts
│   ├── schemas/
│   │   ├── core/
│   │   ├── reference/
│   │   ├── pmb/
│   │   ├── finance/
│   │   ├── academic/
│   │   ├── lms/
│   │   └── assessment/
│   └── index.ts
├── openapi/
│   └── openapi.json
├── event-contract/
│   └── event-catalog.json
├── package.json
└── README.md
```

Allowed in shared contracts:

```text
OpenAPI types
Event schema
Role code
Permission code
Error code
Response envelope
Header constant
Zod DTO
Shared TypeScript type
```

Forbidden in shared contracts:

```text
Business logic
Repository logic
Database query
Drizzle schema
Service-specific implementation
Domain workflow logic
```

---

## 27. Struktur Infra Repo

```text
unsia-infra/
├── docker/
│   ├── core-service.Dockerfile
│   ├── reference-service.Dockerfile
│   ├── pmb-service.Dockerfile
│   ├── finance-service.Dockerfile
│   ├── academic-service.Dockerfile
│   ├── portal-web.Dockerfile
│   └── integration-worker.Dockerfile
├── docker-compose/
│   ├── docker-compose.local.yml
│   ├── docker-compose.staging.yml
│   └── docker-compose.prod.yml
├── gateway/
│   ├── nginx.conf
│   └── routes.conf
├── env/
│   ├── local.env.example
│   ├── staging.env.example
│   └── production.env.example
├── ci-cd/
│   ├── github-actions/
│   └── gitlab-ci/
├── database/
│   ├── backup/
│   ├── restore/
│   └── migration-runner/
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   └── alerts/
├── logging/
│   └── loki/
└── README.md
```

---

## 28. Struktur Docs Repo

```text
unsia-docs/
├── 01-product/
│   ├── PRD_Global_UNSIA.md
│   └── BRD_UNSIA.md
├── 02-system-analysis/
│   ├── SRS_ERP_UNSIA.md
│   ├── FSD_Per_Modul_UNSIA.md
│   ├── Module_Boundary.md
│   └── Role_Permission.md
├── 03-api/
│   ├── API_Contract.md
│   └── OpenAPI_Swagger_Final_ERP_UNSIA.json
├── 04-database/
│   ├── DBML_Global_UNSIA.dbml
│   ├── core_db.md
│   ├── reference_db.md
│   ├── pmb_db.md
│   ├── finance_db.md
│   ├── academic_db.md
│   └── lms_db.md
├── 05-event/
│   ├── Event_Contract.md
│   └── Event_Catalog.md
├── 06-qa-uat/
│   ├── UAT_Scenario_QA_Test_Plan.md
│   └── Test_Case_Matrix.md
├── 07-dev/
│   ├── Developer_Implementation_Specification.md
│   ├── Rencana_Kerja_Developer.md
│   └── Struktur_Folder_Multi_Repo.md
├── 08-runbook/
│   ├── Deployment_Runbook.md
│   ├── Rollback_Runbook.md
│   ├── Incident_Runbook.md
│   └── Reconciliation_Runbook.md
└── README.md
```

---

## 29. Naming Convention

### Repo

```text
unsia-{module}-service
unsia-portal-web
unsia-integration-worker
unsia-shared-contracts
unsia-infra
unsia-docs
```

### Database

```text
core_db
reference_db
crm_db
pmb_db
finance_db
academic_db
hris_db
lms_db
assessment_db
portal_db
```

### Environment Variable

```text
DATABASE_URL
CORE_SERVICE_URL
REFERENCE_SERVICE_URL
PMB_SERVICE_URL
FINANCE_SERVICE_URL
ACADEMIC_SERVICE_URL
HRIS_SERVICE_URL
LMS_SERVICE_URL
ASSESSMENT_SERVICE_URL
PORTAL_SERVICE_URL
JWT_PUBLIC_KEY
JWT_PRIVATE_KEY
SERVICE_TOKEN
REDIS_URL
RABBITMQ_URL
LOG_LEVEL
```

### API Path

```text
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{action}
```

### Event Name

```text
module.domain_action
```

Example:

```text
finance.payment_paid
academic.krs_approved
pmb.loa_issued
```

---

## 30. Development Rules

1. Jangan buat fitur tanpa module boundary.
2. Jangan buat endpoint tanpa permission rule.
3. Jangan buat command kritis tanpa idempotency key.
4. Jangan ubah status tanpa state machine.
5. Jangan publish event tanpa outbox.
6. Jangan consume event tanpa inbox.
7. Jangan simpan data lintas modul tanpa menandai sebagai snapshot.
8. Jangan buat cross-database FK.
9. Jangan direct query ke database service lain.
10. Jangan taruh business logic di shared contracts.
11. Jangan hanya validasi akses di frontend.
12. Jangan mengabaikan audit untuk aksi sensitif.
13. Jangan skip error envelope.
14. Jangan skip correlation ID.
15. Jangan release tanpa test evidence.

---

## 31. Critical Flow MVP

Prioritas implementasi awal:

```text
Core Auth
Role and Permission
Reference Master Data
PMB Applicant
PMB Document Verification
PMB LoA
Finance Invoice
Payment Callback
Finance Clearance
PMB Handover
Academic Student Creation
Generate NIM
Academic KRS
LMS Class Sync
Assessment Result Publish
Grade Finalization
KHS
Transcript
Portal Dashboard
Notification
```

---

## 32. Checklist Repository Baru

Setiap repo service wajib memiliki:

```text
README.md
.env.example
Dockerfile
package.json
tsconfig.json
drizzle.config.ts
src/db/client.ts
src/db/schema.ts
src/lib/response.ts
src/lib/errors.ts
src/middlewares/auth.middleware.ts
src/middlewares/rbac.middleware.ts
src/middlewares/scope.middleware.ts
src/middlewares/audit.middleware.ts
src/events/outbox.publisher.ts
src/idempotency/idempotency.service.ts
tests/
drizzle/migrations/
```

Checklist sebelum development:

```text
[ ] Repo dibuat
[ ] README dibuat
[ ] .env.example dibuat
[ ] Dockerfile dibuat
[ ] Drizzle config dibuat
[ ] Database schema awal dibuat
[ ] Migration awal dibuat
[ ] Health endpoint dibuat
[ ] Response envelope dibuat
[ ] Error envelope dibuat
[ ] Auth middleware dibuat
[ ] RBAC middleware dibuat
[ ] Data scope middleware dibuat
[ ] Audit log dibuat
[ ] Idempotency table dibuat
[ ] Outbox table dibuat
[ ] Inbox table dibuat
[ ] Unit test awal dibuat
[ ] Contract test awal dibuat
```

---

## 33. Expected Output dari AI

Ketika diminta membantu, AI harus memberi output yang siap dipakai.

Contoh output yang diharapkan:

1. Struktur folder repo.
2. Kode awal Next.js API Route Handler.
3. Drizzle schema.
4. Drizzle migration plan.
5. Zod validator.
6. Service layer.
7. Repository layer.
8. RBAC middleware.
9. Data scope middleware.
10. Idempotency handler.
11. Audit log handler.
12. Outbox event publisher.
13. API contract.
14. Event contract.
15. Test case.
16. UAT scenario.
17. Dockerfile.
18. CI/CD pipeline.
19. Runbook.
20. Backlog sprint.

AI wajib menjaga arsitektur multi-repo dan database boundary dalam setiap jawaban.

---

## 34. Instruksi Khusus untuk AI

Jangan mengubah keputusan arsitektur utama.

Gunakan stack berikut:

```text
Next.js
TypeScript
Drizzle ORM
PostgreSQL
Tailwind CSS
Shadcn UI
TanStack Query
Zod
Docker
Node.js TypeScript worker
```

Jangan menyarankan Prisma kecuali diminta membandingkan.

Jangan menyarankan monorepo.

Jangan menyarankan satu database besar.

Jangan membuat foreign key lintas database.

Jangan membuat service mengakses database service lain.

Jangan membuat shared contracts berisi business logic.

Jangan menghilangkan RBAC, data scope, audit, idempotency, outbox/inbox, degraded mode, dan reconciliation.

Semua desain harus mengikuti:

```text
Multi-repo
Multi-service
Database per modul
API-first
Contract-first
Event-driven
RBAC-enforced
Audit-ready
Idempotent
UAT-driven
```

---

## 35. Ringkasan Final

ERP UNSIA harus dibangun sebagai sistem modular terdistribusi berbasis multi-repo.

Setiap modul punya repo dan database sendiri.

Next.js digunakan untuk frontend dan backend API Route Handler.

TypeScript digunakan di semua repo.

Drizzle ORM digunakan untuk akses database dan migration.

PostgreSQL digunakan per modul.

Integration worker menggunakan Node.js TypeScript.

Core menjadi pusat identity, auth, role, permission, session, service token, dan audit global.

Reference menjadi pusat master data.

PMB menjadi source of truth applicant.

Finance menjadi source of truth invoice, payment, dan clearance.

Academic menjadi source of truth student, NIM, KRS, nilai final, KHS, transkrip, dan alumni.

LMS menjadi source of truth aktivitas pembelajaran online.

Assessment menjadi source of truth assessment session, attempt, scoring, dan result.

Portal menjadi dashboard dan workspace role-based, bukan source of truth transaksi bisnis.

Integrasi lintas modul wajib melalui API, event, snapshot, read model, dan reconciliation.

Sistem harus aman, traceable, idempotent, auditable, testable, dan siap release bertahap.



# BAGIAN - PRD GLOBAL UNSIA

_Sumber file: `PRD_Global_UNSIA.docx`_

UNSIA

PRODUCT REQUIREMENT DOCUMENT

PRD Global - Distributed Modular Database Revision

ERP Pendidikan / SIAKAD Terintegrasi UNSIA

v6.5 Revised Draft | 19 Juni 2026

| Item | Isi |
| --- | --- |
| Dokumen | Product Requirement Document Global - Revisi Arsitektur Database Modular Terdistribusi |
| Produk | ERP Pendidikan / SIAKAD Terintegrasi UNSIA |
| Versi | v6.5 Revised Draft |
| Basis Revisi | PRD Global UNSIA v6.4 Detailed FULL, BRD Global v1.0, BRD Per Modul v1.0, dan keputusan desain database fisik per modul. |
| Status | Draft revisi untuk review Product Owner, System Analyst, Technical Lead, DBA, Security, DevOps, dan Owner Modul. |
| Keputusan Utama | Mengganti asumsi satu PostgreSQL utama dengan schema per domain menjadi database fisik berdiri sendiri per modul, tanpa cross-database foreign key dan tanpa direct cross-database join pada transaksi online. |

## 1. Kontrol Dokumen

| Versi | Tanggal | Status | Catatan Perubahan |
| --- | --- | --- | --- |
| v6.5 | 19 Juni 2026 | Revised Draft | Revisi arsitektur data menjadi physical database per modul, event-driven integration, snapshot/read model, outbox/inbox, degraded mode, dan failure isolation. |
| v6.4 | 17 Juni 2026 | Detailed PRD | Baseline detailed PRD dengan multi-repo dan satu PostgreSQL utama/schema per domain. |
| v6.5.1 | 22 Juni 2026 | Updated Draft | Penambahan Appendix B - Event Contract Standard untuk memperjelas event identity, payload schema, idempotency, retry, DLQ, snapshot/read model, reconciliation, security, error contract, observability, dan UAT event. |

| Peran | Tanggung Jawab pada Revisi v6.5 |
| --- | --- |
| Product Owner | Mengesahkan scope bisnis, prioritas release, dan batasan toleransi eventual consistency. |
| System Analyst | Menjaga traceability PRD ke BRD, API contract, event contract, state machine, UAT, dan release plan. |
| Technical Lead | Memastikan arsitektur multi-service, API composition, outbox/inbox worker, retry, dan deployment dapat diimplementasikan. |
| DBA | Menetapkan database boundary, internal FK, index, idempotency, backup/restore, RPO/RTO, replication, dan recovery per database. |
| Security/DevOps | Menentukan service authentication, secret management, network policy, observability, backup isolation, dan disaster recovery. |
| Owner Modul | Memvalidasi data ownership, snapshot minimum, event yang dibutuhkan, degraded mode, dan proses rekonsiliasi. |
| QA/UAT Lead | Menguji failure scenario, duplicate event, delayed event, retry, partial outage, data reconciliation, dan permission scope. |

## 2. Ringkasan Eksekutif Revisi

Revisi v6.5 menetapkan bahwa ERP Pendidikan / SIAKAD Terintegrasi UNSIA tidak lagi diasumsikan berjalan pada satu database PostgreSQL utama dengan schema per domain. Produk direvisi menjadi ekosistem modular dengan database fisik berdiri sendiri per modul: Core, Referensi, CRM, PMB, Finance, Akademik, HRIS, LMS, Assessment, dan Portal.

Tujuan utama perubahan ini adalah failure isolation. Jika satu database modul mengalami gangguan, modul lain yang tidak bergantung langsung pada data real-time modul tersebut harus tetap dapat membaca dan memproses data lokalnya. Gangguan Finance tidak boleh menghentikan input biodata PMB, gangguan LMS tidak boleh menghentikan KRS Akademik, dan gangguan Portal tidak boleh menghentikan transaksi operasional modul sumber.

Konsekuensinya, integritas lintas modul tidak lagi dijaga dengan foreign key lintas database. Integritas lintas modul dijaga dengan API contract, event contract, idempotency key, outbox/inbox pattern, snapshot lokal, read model, reconciliation job, dan data ownership yang tegas.

PRD ini tetap mempertahankan prinsip produk v6.4: single identity melalui Core, source of truth tunggal per domain, backend-enforced RBAC, academic calendar first, curriculum preserved per student, finance clearance terintegrasi, audit, dan idempotency. Revisi ini hanya mengubah model persistence dan pola integrasi agar lebih tahan terhadap partial outage.

| Keputusan DBA: Agar klaim “satu DB mati tidak mempengaruhi DB yang tidak berhubungan” valid secara operasional, database per modul harus ditempatkan minimal sebagai database instance/cluster terpisah untuk modul kritikal. Jika semua database masih berada di satu server/cluster fisik yang sama, maka kegagalan server/cluster tetap dapat menjatuhkan seluruh modul. |
| --- |

## 3. Latar Belakang Revisi Arsitektur

Baseline v6.4 sudah menetapkan domain ownership dan modul tidak boleh mengubah langsung data domain lain. Namun asumsi satu database utama masih memiliki satu availability boundary. Desain tersebut kuat untuk konsistensi dan reporting lintas modul, tetapi kurang optimal bila target operasional adalah isolasi kegagalan antar database.

| Masalah pada Desain Satu DB Utama | Risiko | Arah Revisi v6.5 |
| --- | --- | --- |
| Satu database utama menjadi shared persistence boundary. | Gangguan database/cluster dapat mempengaruhi semua modul sekaligus. | Database fisik dipisah per modul dengan backup, restore, dan recovery masing-masing. |
| Cross-schema join mudah dilakukan. | Aplikasi berisiko bergantung pada tabel domain lain dan melanggar ownership. | Online transaction dilarang melakukan direct cross-database join; gunakan API/read model. |
| Cross-schema FK menggoda dipakai untuk semua relasi. | Modul menjadi tightly coupled dan sulit dipisah. | FK hanya internal database. Relasi lintas modul memakai external_ref_id dan contract validation. |
| Reporting lintas modul bisa langsung dari DB produksi. | Query analitik berat dapat mengganggu transaksi operasional. | Reporting lintas modul melalui warehouse, data mart, atau portal read model. |
| Retry integrasi bisa membuat data ganda bila tidak seragam. | Duplicate applicant, duplicate payment, duplicate grade input. | Semua proses kritis wajib punya idempotency key dan event_key deterministik. |

## 4. Visi, Tujuan, dan Prinsip Produk v6.5

Visi produk tetap membangun backbone operasional kampus dari peminat sampai alumni. Revisi v6.5 menambahkan prinsip resilience dan data independence agar sistem tetap dapat beroperasi secara parsial ketika salah satu modul mengalami gangguan.

| Tujuan Produk | Penjelasan Revisi | Indikator Keberhasilan |
| --- | --- | --- |
| Single identity dan SSO | Core tetap menjadi authority akun, role, permission, token, app registry, dan service client. | Tidak ada credential table di luar Core; modul dapat memvalidasi token yang belum expired menggunakan cache/public key. |
| Data ownership jelas | Setiap database modul hanya menjadi source of truth untuk domainnya sendiri. | Tidak ada write langsung ke database modul lain; semua write lintas modul melalui API/event. |
| Failure isolation | Gangguan database satu modul tidak menghentikan data dan proses modul lain yang tidak bergantung langsung. | UAT partial outage membuktikan modul lain tetap berjalan dengan snapshot terakhir atau degraded mode. |
| Eventual consistency terkendali | Data lintas modul disinkronkan melalui event dan read model dengan staleness yang terlihat. | Setiap read model memiliki source_event_key, synced_at, dan status rekonsiliasi. |
| Finance clearance terintegrasi | Finance tetap source of truth clearance, sementara Academic/PMB menyimpan clearance snapshot untuk operasional terbatas. | KRS/ujian/KHS/transkrip/wisuda mematuhi policy clearance dengan fallback pending_review saat Finance tidak tersedia. |
| Audit dan idempotency | Setiap database memiliki audit lokal, idempotency lokal, outbox, dan inbox. | Duplicate event, retry API, dan callback berulang tidak membuat data ganda. |

| Prinsip Produk v6.5 | Makna Praktis |
| --- | --- |
| Physical database per module | Core, Referensi, CRM, PMB, Finance, Akademik, HRIS, LMS, Assessment, dan Portal memiliki database fisik sendiri. |
| No cross-database foreign key | Relasi lintas modul memakai external_ref_id, bukan FK database. FK hanya boleh di dalam database modul yang sama. |
| No direct cross-database join for OLTP | Transaksi online tidak boleh melakukan join langsung ke database modul lain. Data lintas modul diperoleh melalui API composition, snapshot, read model, atau event projection. |
| Snapshot is not source of truth | Snapshot dipakai agar modul tetap operasional saat dependency down, tetapi kebenaran final tetap di modul pemilik. |
| Outbox/inbox mandatory | Setiap perubahan penting diterbitkan ke outbox dan dikonsumsi via inbox secara idempotent. |
| Degraded mode by design | Setiap modul wajib memiliki perilaku jelas ketika dependency utama tidak tersedia. |
| Reconciliation before report finalization | Laporan final lintas modul harus melewati rekonsiliasi, bukan hanya membaca snapshot yang mungkin stale. |

## 5. Scope Produk Global Revisi

| Modul | Database Fisik | Source of Truth | Data Lintas Modul yang Boleh Disimpan Lokal |
| --- | --- | --- | --- |
| Core | core_db | persons, users, roles, permissions, sessions, service clients, app registry | Scope_ref_id dari Referensi/HRIS untuk role assignment; tidak menjadi pemilik master prodi/unit. |
| Referensi | reference_db | regions, religions, study_programs, academic_years, academic_periods, payment components, status codes | User_ref_id untuk audit; tidak menyimpan credential. |
| CRM | crm_db | campaigns, leads, agents, referrals, follow-ups, commissions | person snapshot dari Core; applicant_ref_id dari PMB setelah convert. |
| PMB | pmb_db | applicants, applicant biodata, documents, selection status, re-registration, LoA, handover | person snapshot, reference snapshot, invoice/payment status snapshot, assessment result reference, student_ref_id setelah handover. |
| Finance | finance_db | invoices, invoice items, payments, receipts, callbacks, clearances, journal entries | customer snapshot dari PMB/Akademik/Core; academic_period_ref_id dari Referensi. |
| Akademik | academic_db | students, NIM, curriculums, courses, course offerings, KRS, final grades, KHS, transcripts, alumni | person snapshot, applicant_ref_id, lecturer_ref_id, clearance snapshot, reference snapshot. |
| HRIS | hris_db | employees, lecturers, positions, work units, homebase, BKD, payroll source | person snapshot dari Core; study_program_ref_id dari Referensi. |
| LMS | lms_db | online classes, LMS enrollment, sessions, materials, assignments, attendance, progress, LMS grade input | academic class snapshot, student snapshot, lecturer snapshot, assessment_session_ref_id. |
| Assessment | assessment_db | question banks, question versions, assessment sessions, attempts, answers, scoring results | participant snapshot dari PMB/Akademik/Core; context_ref_id dari consumer. |
| Portal | portal_db | notifications, read markers, preferences, shortcuts, dashboard read models | user/role snapshot, notification events, aggregated dashboard payload. |

## 5.1 Out of Scope Revisi

Distributed transaction two-phase commit lintas database tidak menjadi requirement. Konsistensi lintas modul memakai saga/eventual consistency.

Direct database link, FDW, atau cross-database join untuk transaksi online tidak menjadi pola resmi aplikasi.

Data warehouse final dan BI enterprise penuh dapat menjadi dokumen turunan, bukan bagian detail DDL PRD ini.

Integrasi PDDIKTI/NeoFeeder full automation tetap bukan MVP pertama, tetapi desain data akademik harus siap untuk mapping dan rekonsiliasi.

Mobile app native penuh tetap di luar MVP awal; portal responsive/mobile web menjadi prioritas.

## 6. Definisi Kunci Tambahan v6.5

| Istilah | Definisi Produk | Contoh |
| --- | --- | --- |
| Physical module database | Database fisik yang dimiliki satu modul dan menjadi batas ownership serta recovery. | academic_db hanya dimiliki modul Akademik. |
| External reference / *_ref_id | UUID milik domain lain yang disimpan tanpa FK database lintas modul. | pmb_db.applicants.person_ref_id menunjuk core_db.persons.id. |
| Snapshot | Salinan ringkas data domain lain untuk kebutuhan tampilan/proses lokal saat dependency down. | lms_db.student_snapshots berisi nim dan nama mahasiswa. |
| Read model | Projection lokal hasil event untuk query cepat atau dashboard. | pmb_db.applicant_invoice_statuses dari event Finance. |
| Outbox event | Event yang ditulis dalam transaksi lokal database pemilik sebelum dipublish ke broker. | finance.payment_paid. |
| Inbox event | Catatan event masuk yang sudah diterima/diproses consumer untuk mencegah duplicate processing. | academic_db.inbox_events menyimpan finance.clearance_changed. |
| Eventual consistency | Kondisi data antar modul menjadi konsisten setelah event diproses, bukan harus serentak dalam satu transaksi. | Payment paid di Finance muncul di PMB beberapa detik kemudian. |
| Degraded mode | Mode operasi terbatas ketika dependency tidak tersedia. | Academic menahan finalisasi KRS sebagai pending_review jika clearance real-time tidak tersedia. |
| Reconciliation job | Proses berkala untuk membandingkan snapshot/read model dengan source of truth. | PMB mencocokkan applicant invoice status dengan Finance setiap malam. |

## 7. Stakeholder dan Kebutuhan Tambahan

| Persona/Role | Kebutuhan Tambahan Akibat Database Terdistribusi |
| --- | --- |
| Pendaftar | Tetap dapat mengisi biodata dan dokumen meskipun Finance sementara tidak tersedia; status pembayaran menampilkan status terakhir dan label waktu sinkronisasi. |
| Mahasiswa | Tetap dapat melihat KRS/nilai terakhir meskipun modul Finance atau LMS sedang gangguan, dengan indikator data mungkin belum real-time. |
| Dosen | Tetap dapat mengakses kelas LMS yang sudah tersinkron meskipun Academic sementara tidak tersedia. |
| Admin Modul | Memiliki informasi jelas apakah data yang tampil real-time dari source API atau snapshot lokal. |
| Pimpinan | Dashboard agregat menampilkan timestamp refresh dan status kesehatan sumber data. |
| DBA/DevOps | Membutuhkan dashboard health per database, replication status, backup status, lag event, dan retry queue. |

## 8. Proses Bisnis End-to-End dan Mode Integrasi

| Tahap | Modul Pemilik | Database Pemilik | Integrasi Keluar | Fallback Jika Dependency Down |
| --- | --- | --- | --- | --- |
| Lead/Peminat | CRM | crm_db | crm.lead_created, crm.lead_qualified | Lead tetap tercatat lokal; handover ke PMB masuk retry queue. |
| Applicant/Pendaftar | PMB | pmb_db | pmb.applicant_created, pmb.document_verified | PMB tetap menerima biodata/dokumen; invoice creation retry jika Finance down. |
| Invoice dan Payment | Finance | finance_db | finance.invoice_created, finance.payment_paid, finance.clearance_changed | Finance outage hanya mempengaruhi billing/payment/clearance real-time; modul lain memakai snapshot terakhir. |
| Seleksi/CBT | Assessment + PMB | assessment_db + pmb_db | assessment.result_calculated, pmb.selection_decided | Jika Assessment down, jadwal CBT/quiz tertahan; PMB non-CBT tetap jalan. |
| LoA dan Handover | PMB | pmb_db | pmb.ready_for_academic, pmb.handover_requested | Jika Academic down, handover masuk pending retry, applicant tetap tersimpan. |
| Generate NIM | Akademik | academic_db | academic.student_created | Jika PMB down, Akademik tetap memproses request yang sudah diterima dan idempotent. |
| KRS dan Kelas | Akademik | academic_db | academic.krs_approved, academic.class_opened | KRS baru butuh clearance policy; LMS sync retry jika LMS down. |
| Pembelajaran Online | LMS | lms_db | lms.progress_updated, lms.grade_input_submitted | Kelas yang sudah tersinkron tetap berjalan meskipun Academic down. |
| Nilai Final/KHS/Transkrip | Akademik | academic_db | academic.final_grade_published, academic.khs_issued | Nilai final tidak dipindah ke LMS; input LMS/Assessment masuk sebagai grade input. |
| Dashboard/Notifikasi | Portal | portal_db | portal.notification_created | Jika Portal down, modul sumber tetap jalan; notifikasi diproses ulang setelah pulih. |

## 9. Arsitektur Produk dan Asumsi Implementasi v6.5

| Aspek | Keputusan Produk v6.5 | Implikasi |
| --- | --- | --- |
| Aplikasi | Multi-repo/multi-service per modul. | Deployment dapat bertahap dan failure modul lebih terisolasi. |
| Database | Physical database per modul. | Migration, backup, restore, RPO/RTO, indexing, dan tuning dilakukan per database. |
| Availability boundary | Minimal per database modul; modul kritikal direkomendasikan berada pada instance/cluster terpisah. | DB mati pada satu modul tidak otomatis menjatuhkan DB modul lain jika infrastruktur fisiknya terpisah. |
| Auth | Core tetap identity authority dengan OIDC/JWT/service client. | Token validasi dapat dilakukan lokal memakai cached JWKS/public key. Login baru bergantung pada Core. |
| Integrasi sync | REST/gRPC API + service client + circuit breaker + timeout. | Dipakai untuk command/query real-time yang memang membutuhkan data terbaru. |
| Integrasi async | Event broker + transactional outbox/inbox. | Dipakai untuk sinkronisasi status, snapshot, read model, dan notification. |
| Data reference | External_ref_id dan snapshot. | Tidak ada cross-database FK; validasi via API/event. |
| Reporting | Portal read model untuk dashboard operasional; warehouse/data mart untuk laporan lintas modul final. | Query analitik tidak membebani database transaksi. |
| Audit | Audit lokal per database + optional audit aggregation. | Aksi sensitif tetap terlacak walau database modul lain down. |
| Idempotency | Idempotency key lokal per modul dan event_key deterministik lintas modul. | Retry aman, duplicate event tidak menghasilkan data ganda. |

Frontend/API Gateway
  -> Core Service / core_db
  -> PMB Service / pmb_db
  -> Finance Service / finance_db
  -> Academic Service / academic_db
  -> LMS Service / lms_db

Event Broker
  <- outbox_events dari setiap DB
  -> inbox_events consumer
  -> snapshot/read model lokal

Reporting Warehouse/Data Mart
  <- CDC/Event dari semua DB
  -> dashboard/laporan lintas modul

## 10. Source of Truth dan Ownership Data v6.5

| Domain Data | Source of Truth | Aturan Produk v6.5 |
| --- | --- | --- |
| Identitas orang | core_db.persons | Modul lain menyimpan person_ref_id dan snapshot minimum; tidak membuat identitas paralel. |
| Akun, role, permission | core_db.users, roles, permissions | Tidak ada password/session/role authority di modul lain. Permission cache boleh ada untuk degraded read. |
| Master data umum | reference_db.* | Modul lain menyimpan ref_id/code/name snapshot; perubahan master dipublish sebagai event. |
| Lead/peminat | crm_db.* | PMB menerima lead_ref_id saat convert; CRM tetap pemilik histori lead dan campaign. |
| Applicant PMB | pmb_db.* | Finance/Akademik menyimpan applicant_ref_id/customer snapshot; tidak mengubah applicant langsung. |
| Invoice/payment/clearance | finance_db.* | PMB/Akademik/LMS/Portal hanya membaca via API atau snapshot/event. |
| Mahasiswa/KRS/nilai final | academic_db.* | LMS/Portal menyimpan snapshot; final grade tetap di Akademik. |
| Dosen/karyawan | hris_db.* | Academic/LMS memakai lecturer_ref_id dan snapshot; tidak membuat dosen mandiri. |
| Kelas online/progress | lms_db.* | LMS kelas berasal dari class snapshot Academic, tetapi progress/tugas/presensi LMS dimiliki LMS. |
| Assessment | assessment_db.* | Consumer menerima result event/API; assessment menyimpan attempt, answer, score. |
| Notifikasi/preferensi | portal_db.* | Portal tidak menjadi pemilik status bisnis sumber. |

## 11. Pola Integrasi Antar Modul

| Pola | Kapan Dipakai | Aturan Guardrail |
| --- | --- | --- |
| API Command | Saat modul meminta modul pemilik melakukan perubahan data. | Contoh PMB meminta Finance membuat invoice. Request wajib idempotent. |
| API Query | Saat butuh data real-time dari source of truth. | Gunakan timeout pendek, circuit breaker, dan fallback snapshot bila tersedia. |
| Event Publication | Saat terjadi perubahan status penting. | Event ditulis ke outbox dalam transaksi lokal yang sama dengan perubahan domain. |
| Event Consumption | Saat modul lain perlu update snapshot/read model. | Consumer mencatat event_key di inbox agar tidak memproses duplikat. |
| Snapshot | Untuk tampilan/proses lokal saat dependency down. | Harus memiliki source_event_key/synced_at agar staleness terlihat. |
| Read Model | Untuk dashboard atau query lintas domain yang sering dibaca. | Tidak boleh menjadi sumber kebenaran final; harus bisa direbuild dari event/source. |
| Reconciliation | Untuk memastikan snapshot tidak menyimpang dari source. | Job berkala wajib menghasilkan mismatch report dan retry correction. |
| Warehouse/Data Mart | Untuk laporan lintas modul dan analitik historis. | Tidak boleh digunakan untuk transaksi operasional real-time. |

## 12. Event Catalog Minimum

| Event | Publisher | Consumer Utama | Payload Minimum |
| --- | --- | --- | --- |
| core.person_updated | Core | CRM, PMB, HRIS, Academic, Portal | person_id, full_name, email, phone, status_code, occurred_at |
| reference.study_program_updated | Referensi | PMB, Academic, HRIS, LMS, Portal | study_program_id, code, name, status_code, occurred_at |
| reference.academic_period_updated | Referensi | PMB, Finance, Academic, LMS, Assessment, Portal | academic_period_id, academic_year_id, code, name, term_code, status_code |
| crm.lead_qualified | CRM | PMB | lead_id, person_ref_id, source_code, campaign_id, agent_id, occurred_at |
| pmb.applicant_created | PMB | Finance, Assessment, Portal | applicant_id, person_ref_id, applicant_no, target_period_ref_id, study_program_ref_id |
| finance.invoice_created | Finance | PMB, Portal | invoice_id, invoice_no, bill_to_type, bill_to_ref_id, amount_total, status_code |
| finance.payment_paid | Finance | PMB, Academic, Portal | payment_id, invoice_id, bill_to_type, bill_to_ref_id, paid_amount, paid_at |
| finance.clearance_changed | Finance | PMB, Academic, LMS, Portal | subject_type, subject_ref_id, academic_period_ref_id, service_code, status_code |
| pmb.ready_for_academic | PMB | Academic | applicant_id, person_ref_id, target_period_ref_id, study_program_ref_id, curriculum_candidate_ref |
| academic.student_created | Academic | PMB, Finance, LMS, Portal | student_id, person_ref_id, nim, entry_period_ref_id, study_program_ref_id, curriculum_id |
| academic.class_opened | Academic | LMS, Portal | course_offering_id, academic_period_ref_id, course_id, class_code, lecturer_refs |
| academic.krs_approved | Academic | LMS, Finance, Portal | student_id, krs_id, academic_period_ref_id, krs_item_ids |
| lms.grade_input_submitted | LMS | Academic | student_ref_id, course_offering_ref_id, source_ref_id, score, submitted_at |
| assessment.result_calculated | Assessment | PMB, LMS, Academic, Portal | assessment_session_id, participant_type, participant_ref_id, total_score, passed |

## 13. Kebutuhan Produk Global Revisi

| ID | Prioritas | Kebutuhan Produk | Acceptance Criteria |
| --- | --- | --- | --- |
| PRD-DB-001 | P0 | Setiap modul utama harus memiliki database fisik sendiri. | Core, Referensi, CRM, PMB, Finance, Akademik, HRIS, LMS, Assessment, dan Portal memiliki database terpisah dengan credential dan migration pipeline masing-masing. |
| PRD-DB-002 | P0 | Tidak boleh ada cross-database foreign key. | DDL setiap database hanya mendefinisikan FK internal; relasi lintas modul memakai external_ref_id. |
| PRD-DB-003 | P0 | Transaksi online tidak boleh melakukan direct join lintas database. | Code review dan query audit tidak menemukan join dari service satu modul ke DB modul lain. |
| PRD-DB-004 | P0 | Setiap database modul wajib memiliki audit_logs, idempotency_keys, outbox_events, dan inbox_events. | Semua modul dapat mencatat audit lokal, mencegah retry ganda, publish event, dan consume event secara idempotent. |
| PRD-INT-001 | P0 | Semua command lintas modul harus melalui API resmi modul pemilik. | Modul peminta tidak memiliki credential write ke database modul pemilik. |
| PRD-INT-002 | P0 | Setiap event lintas modul harus memiliki event_key deterministik dan payload contract. | Consumer dapat menolak/mengabaikan event duplikat berdasarkan event_key. |
| PRD-INT-003 | P0 | Setiap snapshot/read model harus menyimpan sumber dan waktu sinkronisasi. | Tabel snapshot/read model memiliki source_event_key/source_module dan synced_at/refreshed_at. |
| PRD-INT-004 | P0 | Setiap modul harus memiliki fallback behavior saat dependency down. | UAT partial outage membuktikan service tidak crash dan memberi status degraded/pending/retry. |
| PRD-INT-005 | P0 | Setiap proses kritis wajib idempotent. | Payment callback, PMB handover, generate NIM, class sync, KRS sync, grade sync, dan notification tidak membuat duplikasi saat retry. |
| PRD-RES-001 | P0 | Sistem harus mendukung partial availability. | Saat satu database non-Core mati, modul lain yang tidak memerlukan real-time data dari DB tersebut tetap dapat membaca/menulis data lokalnya. |
| PRD-RES-002 | P0 | Core dependency harus dimitigasi dengan token validation cache. | Service tetap dapat memvalidasi token aktif yang belum expired menggunakan cached public key/JWKS. |
| PRD-RES-003 | P1 | Dashboard harus menampilkan data freshness. | Setiap widget lintas modul menampilkan refreshed_at atau status data source. |
| PRD-REP-001 | P1 | Laporan lintas modul final harus melewati rekonsiliasi. | Ada mismatch report untuk snapshot PMB-Finance, Academic-Finance, Academic-LMS, LMS-Assessment. |
| PRD-SEC-001 | P0 | Database credential harus scoped per service. | Service hanya memiliki akses ke database miliknya sendiri, kecuali read-only reporting connector yang disetujui. |
| PRD-OPS-001 | P0 | Setiap database memiliki backup/restore dan monitoring sendiri. | Ada health check, backup status, restore test, event lag, dead letter queue, dan alert per modul. |

## 14. Data Independence dan Failure Isolation

| Database Mati | Terdampak Langsung | Tetap Bisa Berjalan | Fallback/Guardrail |
| --- | --- | --- | --- |
| core_db | Login baru, role switching, user provisioning, app launcher real-time. | Token yang belum expired dapat diverifikasi lokal jika JWKS/public key cache tersedia. | Batasi write sensitif; aktifkan cached permission dengan TTL pendek. |
| reference_db | Perubahan master data dan lookup real-time. | Modul tetap memakai reference snapshot terakhir. | Tampilkan warning data referensi mungkin tidak terbaru; retry sync. |
| crm_db | Lead capture, follow-up, campaign, agent commission. | PMB, Finance, Academic, HRIS, LMS, Assessment tetap berjalan. | Handover lead tertunda; tidak berdampak pada applicant yang sudah ada di PMB. |
| pmb_db | Applicant baru, biodata, dokumen, LoA, handover. | CRM lead, Finance pembayaran applicant existing, Academic mahasiswa existing, LMS, HRIS. | Finance/Academic memakai customer/applicant snapshot yang sudah ada. |
| finance_db | Invoice baru, payment verification, clearance real-time, receipt, jurnal. | PMB input biodata/dokumen, Academic data existing, LMS existing class, Assessment. | Gunakan clearance/payment snapshot terakhir; proses yang butuh clear real-time masuk pending_review. |
| academic_db | Generate NIM, KRS, kelas akademik, nilai final, KHS, transkrip. | CRM, PMB, Finance applicant payment, LMS kelas yang sudah sync, Assessment CBT PMB, HRIS. | LMS memakai academic class/student snapshot; class sync baru masuk retry. |
| hris_db | Perubahan dosen/pegawai/homebase/jabatan. | Academic dan LMS tetap memakai lecturer snapshot yang sudah tersinkron. | Plotting dosen baru ditahan bila butuh validasi real-time. |
| lms_db | Pembelajaran online, materi, tugas, presensi LMS, progress. | Academic KRS/kelas/nilai final, Finance, PMB, HRIS, Assessment non-LMS. | Grade sync dari LMS tertunda; final grade tidak boleh tergantung langsung pada DB LMS. |
| assessment_db | CBT/quiz/survey attempt dan scoring. | PMB non-CBT, LMS non-quiz, Academic, Finance, Portal. | Jadwal quiz/CBT masuk postponed; result export retry setelah pulih. |
| portal_db | Dashboard, notification center, user preference, shortcut. | Semua modul operasional sumber tetap berjalan. | Notification event tertahan di outbox/inbox dan diproses ulang setelah Portal pulih. |

## 15. Revisi Requirement Per Modul

## 15.1 Core

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-CORE-DB-001 | P0 | Core harus menyediakan OIDC/JWT dan service client yang dapat divalidasi oleh modul lain tanpa query database Core pada setiap request. |
| PRD-CORE-DB-002 | P0 | Core harus menerbitkan event person/user/role/application update agar modul lain dapat memperbarui snapshot/cache. |
| PRD-CORE-DB-003 | P1 | Core harus menyediakan endpoint introspection untuk kasus verifikasi real-time, tetapi service wajib memiliki fallback cached public key. |

## 15.2 Referensi

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-REF-DB-001 | P0 | Referensi harus menerbitkan event perubahan master data untuk study program, academic year, academic period, status code, payment component, payment method, dan document type. |
| PRD-REF-DB-002 | P0 | Modul consumer harus menyimpan reference snapshot minimum yang dibutuhkan untuk operasi lokal. |
| PRD-REF-DB-003 | P1 | Perubahan master data sensitif wajib memiliki effective_from/effective_to dan tidak memutus histori transaksi lama. |

## 15.3 CRM

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-CRM-DB-001 | P0 | CRM menyimpan lead secara mandiri dan tidak bergantung pada PMB untuk operasi lead capture/follow-up. |
| PRD-CRM-DB-002 | P0 | Konversi lead ke applicant PMB dilakukan melalui API/event idempotent, bukan insert langsung ke pmb_db. |
| PRD-CRM-DB-003 | P1 | CRM menyimpan applicant_ref_id setelah PMB berhasil membuat applicant. |

## 15.4 PMB

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-PMB-DB-001 | P0 | PMB menyimpan applicant dan dokumen secara mandiri dengan person_ref_id dan reference snapshot. |
| PRD-PMB-DB-002 | P0 | PMB tidak menyimpan payment sebagai source of truth; PMB menyimpan applicant_invoice_statuses sebagai read model dari Finance. |
| PRD-PMB-DB-003 | P0 | Handover PMB ke Academic wajib idempotent dan aman ketika Academic down. |

## 15.5 Finance

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-FIN-DB-001 | P0 | Finance menjadi satu-satunya source of truth invoice, payment, receipt, clearance, dan jurnal. |
| PRD-FIN-DB-002 | P0 | Finance menyimpan customer snapshot untuk APPLICANT/STUDENT/PERSON agar invoice/payment tetap dapat diproses walau PMB/Academic sementara down. |
| PRD-FIN-DB-003 | P0 | Payment callback harus idempotent berdasarkan provider_code + provider_event_id dan internal idempotency key. |

## 15.6 Akademik

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-ACA-DB-001 | P0 | Akademik menyimpan student, NIM, curriculum, course offering, KRS, final grade, KHS, transcript secara mandiri. |
| PRD-ACA-DB-002 | P0 | Akademik tidak query langsung finance_db saat transaksi KRS; validasi menggunakan Finance API atau clearance snapshot sesuai policy. |
| PRD-ACA-DB-003 | P0 | Akademik menerbitkan class_opened, krs_approved, final_grade_published untuk LMS/Portal/reporting. |

## 15.7 HRIS

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-HRIS-DB-001 | P0 | HRIS menjadi source of truth employee dan lecturer. Academic/LMS memakai lecturer_ref_id dan lecturer snapshot. |
| PRD-HRIS-DB-002 | P1 | Perubahan status dosen aktif/nonaktif dipublish sebagai event agar Academic/LMS dapat menolak plotting baru. |

## 15.8 LMS

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-LMS-DB-001 | P0 | LMS tidak membuat kelas akademik; LMS membuat online class dari event/snapshot course_offering Academic. |
| PRD-LMS-DB-002 | P0 | Enrollment LMS berasal dari krs_approved event dan disimpan sebagai enrollment lokal. |
| PRD-LMS-DB-003 | P0 | Grade input dari LMS ke Academic wajib idempotent dan tidak boleh menimpa final grade. |

## 15.9 Assessment

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-ASM-DB-001 | P0 | Assessment menyimpan question bank, version, session, participant snapshot, attempt, answer, dan scoring result secara mandiri. |
| PRD-ASM-DB-002 | P0 | Result dikirim ke consumer melalui API/event dengan result_export dan retry policy. |

## 15.10 Portal

| ID | Prioritas | Requirement Revisi |
| --- | --- | --- |
| PRD-POR-DB-001 | P0 | Portal menyimpan notification, read marker, user preference, shortcut, dan dashboard read model, bukan data bisnis sumber. |
| PRD-POR-DB-002 | P1 | Dashboard widget harus menyimpan refreshed_at/source_modules agar data freshness terlihat. |

## 16. Non-Functional Requirement Tambahan

| Kategori | Requirement | Acceptance Criteria |
| --- | --- | --- |
| Availability | Setiap modul memiliki health check aplikasi, database, event publisher, event consumer, dan dependency eksternal. | Status health modul dapat dilihat oleh DevOps dan Portal admin. |
| RTO/RPO | RTO/RPO ditetapkan per database modul sesuai kritikalitas. | Core/Finance/Academic memiliki target lebih ketat daripada Portal/CRM bila disepakati bisnis. |
| Observability | Setiap request lintas modul membawa request_id/correlation_id. | Trace dapat mengikuti flow PMB invoice hingga Finance payment dan Portal notification. |
| Event Reliability | Outbox publisher dan inbox consumer memiliki retry dan dead letter queue. | Event gagal tidak hilang dan dapat direprocess. |
| Security | Service credential hanya dapat mengakses database modul sendiri. | Secret scan dan database role audit tidak menemukan credential lintas DB tidak sah. |
| Data Freshness | Read model/snapshot memiliki timestamp sinkronisasi. | UI lintas modul menampilkan atau menyimpan freshness metadata. |
| Backup/Restore | Backup dilakukan per database dan restore diuji berkala. | Restore test menghasilkan bukti dan waktu pemulihan. |
| Performance | Query transaksi hanya memakai database lokal modul. | Tidak ada direct query OLTP ke DB modul lain. |

## 17. Business Rule Global Revisi

Tidak ada modul yang boleh menyimpan credential, password, atau session authority selain Core.

Tidak ada modul yang boleh melakukan write langsung ke database modul lain.

Tidak ada cross-database foreign key dalam desain fisik.

Tidak ada direct cross-database join untuk transaksi online.

Setiap external_ref_id harus dapat divalidasi melalui API atau event source modul pemilik.

Setiap snapshot/read model harus menyimpan sumber, waktu sinkronisasi, dan status pemrosesan.

Snapshot/read model tidak boleh menjadi dasar laporan final tanpa rekonsiliasi.

Payment callback, PMB handover, generate NIM, class sync, KRS sync, grade sync, dan notification delivery wajib idempotent.

Final grade tetap dimiliki Academic walaupun input berasal dari LMS atau Assessment.

Finance tetap menjadi source of truth clearance walaupun Academic/LMS menyimpan clearance snapshot.

Portal tidak boleh mengubah status bisnis sumber kecuali melalui API modul pemilik.

Modul consumer harus aman terhadap event duplikat, event terlambat, dan event out of order.

## 18. Data Quality dan Reconciliation

| Area Rekonsiliasi | Sumber A | Sumber B | Mismatch yang Harus Dideteksi |
| --- | --- | --- | --- |
| Applicant Payment | pmb_db.applicant_invoice_statuses | finance_db.invoices/payments | Status invoice/payment berbeda, invoice hilang, amount mismatch. |
| PMB Handover | pmb_db.handover_logs | academic_db.students | Applicant ready tetapi student belum dibuat, duplicate student_ref_id. |
| Student Clearance | academic_db.student_clearance_snapshots | finance_db.clearances | Clearance KRS/ujian/KHS/transkrip tidak sinkron. |
| Academic-LMS Class | academic_db.course_offerings/krs_items | lms_db.lms_classes/lms_enrollments | Class belum sync, enrollment kurang/lebih, student inactive masih enrolled. |
| LMS/Assessment Grade Input | lms_db.grade_inputs/assessment_db.scoring_results | academic_db.grade_inputs | Score belum terkirim, score duplikat, source_ref_id ganda. |
| Portal Dashboard | portal_db.dashboard_read_models | Source module summary API/warehouse | Widget stale, source unavailable, angka KPI berbeda dari source. |

## 19. Pola Query Data Lintas Modul

Dalam desain v6.5, join lintas modul dilakukan secara logis, bukan SQL join langsung antar database produksi. Berikut pola resminya.

| Kebutuhan | Pola Resmi | Contoh |
| --- | --- | --- |
| Detail applicant + payment status | PMB API membaca pmb_db.applicants dan pmb_db.applicant_invoice_statuses; jika butuh real-time, call Finance API. | GET /pmb/applicants/{id} + optional GET /finance/invoices?bill_to=APPLICANT:{id} |
| KRS + clearance | Academic API membaca krs lokal dan clearance snapshot; jika policy real-time, call Finance API sebelum finalisasi. | POST /academic/krs/{id}/finalize memvalidasi finance.clearance snapshot/API. |
| LMS class + student list | LMS membaca lms_db.lms_classes, academic_class_snapshots, student_snapshots. | Tidak join ke academic_db saat kelas dibuka. |
| Dashboard pimpinan | Portal membaca portal_db.dashboard_read_models atau summary API masing-masing modul. | Widget menampilkan refreshed_at dan source status. |
| Laporan final semester | Warehouse/data mart membaca event/CDC semua modul dan menjalankan rekonsiliasi. | Laporan KRS vs pembayaran vs nilai final. |

-- Contoh anti-pattern yang dilarang:
SELECT * FROM pmb_db.applicants a
JOIN finance_db.invoices i ON i.bill_to_ref_id = a.id;

-- Pola yang benar:
-- 1) PMB membaca applicant lokal.
-- 2) PMB membaca applicant_invoice_statuses lokal, atau call Finance API.
-- 3) Finance tetap source of truth invoice/payment.

## 20. Release Plan Revisi

| Fase | Fokus | Output Wajib |
| --- | --- | --- |
| Phase 0 - Architecture Foundation | Database boundary, service identity, event broker, outbox/inbox library, idempotency standard, observability. | Template DB modul, migration standard, event contract base, retry/DLQ, correlation_id. |
| Phase 1 - Core + Referensi | Identity, role, permission, service client, master data event. | core_db, reference_db, JWKS cache, reference snapshots. |
| Phase 2 - CRM + PMB + Finance Basic | Lead-to-applicant, invoice, payment, applicant invoice status read model. | crm_db, pmb_db, finance_db, event PMB-Finance. |
| Phase 3 - Academic Core | Student/NIM, curriculum, course offering, KRS, clearance snapshot. | academic_db, handover PMB-Academic, Finance clearance sync. |
| Phase 4 - HRIS + LMS | Lecturer source, class sync, KRS enrollment, LMS delivery. | hris_db, lms_db, academic class/student/lecturer snapshots. |
| Phase 5 - Assessment + Grade Input | CBT/quiz/survey, scoring, result export, grade input to Academic. | assessment_db, LMS/PMB/Academic result integration. |
| Phase 6 - Portal + Reporting | Notification, dashboard read model, data freshness, warehouse/reporting plan. | portal_db, dashboard_read_models, reconciliation reports. |

## 21. Acceptance Criteria dan UAT Partial Outage

Matikan finance_db. PMB tetap dapat membuat/mengubah applicant dan upload dokumen. Status invoice menampilkan snapshot terakhir atau “payment status unavailable”.

Matikan academic_db. LMS tetap dapat membuka kelas dan enrollment yang sudah tersinkron; class sync baru masuk retry queue.

Matikan lms_db. Academic tetap dapat membuka kelas, KRS, dan final grade tanpa error database LMS.

Matikan portal_db. PMB, Finance, Academic, LMS, HRIS, dan Assessment tetap dapat melakukan transaksi sumber; notification event diproses ulang setelah Portal pulih.

Kirim payment callback yang sama dua kali. Finance hanya membuat satu payment/receipt/journal effect.

Kirim event finance.payment_paid dua kali ke PMB. PMB applicant_invoice_statuses tidak duplikat dan inbox mencatat event sudah diproses.

Kirim handover applicant yang sama dua kali. Academic hanya membuat satu student dan satu NIM.

Ubah status dosen menjadi nonaktif di HRIS. Academic/LMS menerima event dan menolak plotting baru setelah snapshot tersinkron.

Dashboard Portal menampilkan refreshed_at dan status source ketika salah satu modul down.

Reconciliation job mendeteksi mismatch antara pmb applicant invoice status dan Finance invoice/payment source.

## 22. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Kompleksitas arsitektur naik. | Tim development dan QA membutuhkan disiplin event/API yang lebih tinggi. | Sediakan platform library untuk outbox/inbox, idempotency, contract testing, dan tracing. |
| Event terlambat atau gagal diproses. | Snapshot/read model stale. | Retry, DLQ, event lag monitoring, reconciliation job. |
| Data lintas modul berbeda sementara. | User melihat status yang belum terbaru. | Tampilkan freshness metadata dan status pending/retry. |
| Core menjadi dependency kritikal. | Login baru dan role switching terganggu. | JWT public key cache, permission snapshot, token TTL yang terukur, Core HA. |
| Reference snapshot stale. | Dropdown/status lokal tidak terbaru. | Effective dating, event update, background sync, validasi saat command sensitif. |
| Reporting lintas modul berat. | Database transaksi terganggu bila query langsung. | Gunakan warehouse/data mart dan read replica khusus reporting. |
| Infrastruktur fisik tetap single point of failure. | Semua database bisa mati jika satu cluster/server sama gagal. | Pisahkan instance/cluster untuk modul kritikal sesuai target availability. |

## 23. Dokumen Turunan Setelah Revisi PRD

| Dokumen Turunan | Fungsi | Owner Awal |
| --- | --- | --- |
| Distributed ERD/DBML per Modul | Menentukan tabel internal, external_ref_id, snapshot, read model, outbox/inbox per database. | DBA + System Analyst |
| API Contract per Modul | Menentukan command/query resmi antar service dan error contract. | System Analyst + Technical Lead |
| Event Contract Catalog | Menentukan event_key, schema payload, publisher, consumer, versioning, dan retry policy. | System Analyst + Technical Lead |
| Data Dictionary per Database | Menjelaskan field, tipe data, constraint internal, index, PII classification. | DBA |
| State Machine | Menentukan status applicant, invoice, payment, clearance, KRS, grade, handover. | System Analyst |
| RBAC Matrix + Service Scope | Menentukan role user dan permission service-to-service. | System Analyst + Security |
| Resilience Test Plan | Menguji DB down, API timeout, duplicate event, delayed event, DLQ, restore. | QA/UAT + DevOps |
| Migration Strategy | Menentukan migrasi dari schema-per-domain ke physical DB per modul jika sudah ada implementasi sebelumnya. | DBA + Technical Lead |

## Appendix A - Database Boundary Minimum

| Database | Internal FK Boleh | External Ref Yang Dipakai | Read Model/Snapshot Minimum |
| --- | --- | --- | --- |
| core_db | users -> persons; role_assignments -> users/roles | scope_ref_id ke Ref/HRIS sesuai kebutuhan | Tidak wajib, kecuali app health/status modul. |
| reference_db | academic_periods -> academic_years; study_programs -> academic_levels | actor_user_ref_id ke Core untuk audit | Tidak wajib. |
| crm_db | leads -> campaigns/agents; follow_ups -> leads | person_ref_id, user_ref_id, applicant_ref_id | person_snapshots. |
| pmb_db | applicant_biodata/documents/selection -> applicants | person_ref_id, lead_ref_id, invoice_ref_id, assessment_session_ref_id, student_ref_id | person_snapshots, reference_snapshots, applicant_invoice_statuses. |
| finance_db | payments -> invoices; invoice_items -> invoices; journal_lines -> journal_entries | bill_to_ref_id, person_ref_id, academic_period_ref_id | customer_snapshots. |
| academic_db | krs_items -> krs_headers; grades -> krs_items; courses -> curriculums internal mapping | person_ref_id, applicant_ref_id, lecturer_ref_id, academic_period_ref_id | person_snapshots, reference_snapshots, student_clearance_snapshots. |
| hris_db | lecturers -> employees; employment_records -> employees | person_ref_id, study_program_ref_id, academic_period_ref_id | person_snapshots. |
| lms_db | enrollments -> lms_classes; sessions/materials/assignments -> lms_classes | course_offering_ref_id, student_ref_id, lecturer_ref_id, assessment_session_ref_id | academic_class_snapshots, student_snapshots, lecturer_snapshots. |
| assessment_db | questions -> banks; versions -> questions; answers -> attempts | context_ref_id, participant_ref_id, user_ref_id | participant_snapshots. |
| portal_db | notifications -> notification_events | user_ref_id, role_ref_id, application_ref_id, source_entity_id | user_snapshots, role_snapshots, dashboard_read_models. |

## Appendix B - Event Contract Standard

Appendix ini melengkapi Section 12 Event Catalog Minimum. Tujuannya adalah mengubah daftar event menjadi kontrak teknis yang dapat langsung dipakai oleh Backend, QA/UAT, DBA, Security, DevOps, dan Owner Modul. Standar ini berlaku untuk seluruh event pada Core, Referensi, CRM, PMB, Finance, Akademik, HRIS, LMS, Assessment, Portal, dan Reporting.

## B.1 Prinsip Umum Event Contract

| ID | Prinsip | Ketentuan |
| --- | --- | --- |
| EC-G-001 | Setiap event wajib memiliki identitas unik. | Event harus memiliki event_name, event_version, event_key, aggregate_type, aggregate_id, occurred_at, dan publisher_service. |
| EC-G-002 | Event ditulis melalui transactional outbox. | Event hanya boleh dipublish setelah transaksi lokal database pemilik berhasil commit. |
| EC-G-003 | Setiap consumer wajib idempotent. | Consumer wajib mencatat event_key ke inbox_events sebelum atau saat pemrosesan event. |
| EC-G-004 | Snapshot bukan source of truth. | Snapshot harus memuat source_event_key dan synced_at agar staleness data dapat dibaca. |
| EC-G-005 | Event contract wajib versioned. | Perubahan payload yang tidak backward compatible harus menaikkan event_version. |
| EC-G-006 | Retry dan DLQ wajib tersedia. | Event gagal proses tidak boleh hilang. Event harus masuk retry queue dan DLQ jika gagal permanen. |
| EC-G-007 | Reconciliation wajib untuk data lintas modul kritis. | Snapshot/read model yang berbeda dari source of truth harus menghasilkan mismatch report. |

## B.2 Struktur Wajib Event Identity

| Field | Tipe | Deskripsi |
| --- | --- | --- |
| event_name | string | Nama event dengan format domain.action, contoh finance.payment_paid. |
| event_version | string | Versi schema event, contoh v1. |
| event_key | string | Kunci unik global untuk idempotency dan duplicate handling. |
| event_type | string | DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, atau SNAPSHOT_EVENT. |
| publisher_service | string | Nama service pengirim event. |
| publisher_database | string | Database source of truth pemilik event. |
| aggregate_type | string | Objek bisnis utama, contoh payment, invoice, applicant, student, krs. |
| aggregate_id | uuid/string | ID objek bisnis utama pada database pemilik. |
| correlation_id | string | ID untuk melacak satu proses end-to-end lintas service. |
| causation_id | string | ID event atau command yang memicu event ini. |
| occurred_at | datetime | Waktu kejadian bisnis terjadi. |
| published_at | datetime | Waktu event berhasil dikirim ke broker. |

Contoh envelope event:

{
  "event_name": "finance.payment_paid",
  "event_version": "v1",
  "event_key": "finance.payment_paid:payment_id:8f2c:v1",
  "event_type": "INTEGRATION_EVENT",
  "publisher_service": "finance-service",
  "publisher_database": "finance_db",
  "aggregate_type": "payment",
  "aggregate_id": "8f2c",
  "correlation_id": "corr-20260619-001",
  "causation_id": "payment_callback:gateway:trx-9001",
  "occurred_at": "2026-06-19T10:15:00Z",
  "published_at": "2026-06-19T10:15:05Z"
}

## B.3 Business Trigger dan State Change

| Komponen | Penjelasan |
| --- | --- |
| Field | Keterangan |
| business_trigger | Kondisi bisnis yang menyebabkan event diterbitkan. |
| pre_condition | Status atau kondisi data sebelum event terjadi. |
| post_condition | Status atau kondisi data setelah event terjadi. |
| source_table | Tabel utama yang menjadi sumber perubahan. |
| state_transition | Perubahan status, contoh UNPAID menjadi PAID. |
| publish_timing | Waktu event boleh dipublish, umumnya setelah commit transaksi lokal. |

## B.4 Publisher, Consumer, dan Tujuan Konsumsi

| Event | Publisher | Consumer | Tujuan Konsumsi |
| --- | --- | --- | --- |
| core.person_updated | Core | CRM, PMB, Academic, HRIS, LMS, Assessment, Portal | Memperbarui person snapshot lokal. |
| pmb.applicant_created | PMB | Finance, Assessment, Portal, Reporting | Membuat konteks applicant, notifikasi, dan projection dashboard. |
| finance.invoice_created | Finance | PMB, Academic, Portal, Reporting | Memperbarui status tagihan pada consumer. |
| finance.payment_paid | Finance | PMB, Academic, Portal, Reporting | Memperbarui payment status, clearance snapshot, notifikasi, dan laporan. |
| finance.clearance_changed | Finance | PMB, Academic, LMS, Portal | Mengatur kelayakan layanan akademik. |
| academic.student_created | Academic | PMB, LMS, Portal, Reporting | Menghubungkan applicant dengan student/NIM. |
| academic.krs_approved | Academic | LMS, Portal, Reporting | Membuat atau memperbarui enrollment LMS. |
| assessment.result_calculated | Assessment | PMB, LMS, Academic, Portal | Mengirim hasil assessment ke context owner. |

## B.5 Payload Schema dan Validation Rule

Setiap event wajib memiliki payload schema. Payload hanya memuat data yang dibutuhkan consumer. Data sensitif dan PII harus dibatasi sesuai kebutuhan bisnis dan prinsip least privilege.

| Field | Required | Validation Rule |
| --- | --- | --- |
| payment_id | Ya | UUID dan harus ada pada finance_db.payments. |
| invoice_id | Ya | UUID dan harus ada pada finance_db.invoices. |
| invoice_no | Ya | String, tidak kosong. |
| bill_to_type | Ya | APPLICANT, STUDENT, atau PERSON. |
| bill_to_ref_id | Ya | UUID external reference subject pembayaran. |
| paid_amount | Ya | Decimal lebih dari 0. |
| payment_method_code | Ya | Kode metode pembayaran dari master/reference. |
| paid_at | Ya | Datetime valid. |
| status_code | Ya | Harus PAID untuk event finance.payment_paid. |

Contoh payload finance.payment_paid:

{
  "payment_id": "8f2c",
  "invoice_id": "inv-1001",
  "invoice_no": "INV/PMB/2026/0001",
  "bill_to_type": "APPLICANT",
  "bill_to_ref_id": "app-2201",
  "paid_amount": 2500000,
  "payment_method_code": "VA_BNI",
  "paid_at": "2026-06-19T10:15:00Z",
  "status_code": "PAID"
}

## B.6 Idempotency dan Duplicate Handling

| Area | Aturan |
| --- | --- |
| Event key | event_key harus unik dan deterministik. Format disarankan: {event_name}:{aggregate_id}:{event_version}. |
| Consumer inbox | Consumer wajib menyimpan event_key pada inbox_events. |
| Duplicate event | Jika event_key sudah pernah diproses, consumer tidak memproses ulang payload. |
| Retry command | Command/API yang memicu event wajib membawa idempotency_key. |
| Conflict payload | Jika event_key sama tetapi payload berbeda, consumer menolak event dan mencatat mismatch untuk investigasi. |

## B.7 Ordering, Dependency, dan Causality

| Event | Wajib Setelah | Catatan |
| --- | --- | --- |
| finance.payment_paid | finance.invoice_created | Payment tidak valid tanpa invoice. |
| finance.clearance_changed | finance.payment_paid atau finance.clearance_reviewed | Clearance berubah berdasarkan status finance resmi. |
| academic.student_created | pmb.ready_for_academic atau pmb.handover_requested | Mahasiswa dibuat setelah applicant siap diserahkan ke Akademik. |
| lms.enrollment_synced | academic.krs_approved | Enrollment LMS hanya berasal dari KRS valid. |
| academic.final_grade_published | academic.grade_input_received | LMS/Assessment hanya memberi input, final grade tetap di Akademik. |

## B.8 Retry Policy dan Dead Letter Queue

| Komponen | Aturan |
| --- | --- |
| Retry schedule | 1 menit, 5 menit, 15 menit, lalu exponential backoff. |
| Maksimal retry | 10 kali atau sesuai SLA modul. |
| Temporary failure | Event tetap berada pada retry queue. |
| Permanent failure | Event masuk DLQ setelah retry maksimum. |
| DLQ payload | Wajib menyimpan event_key, consumer, last_error, retry_count, failed_at, dan raw_payload. |
| Recovery | Event dari DLQ dapat direplay secara manual oleh role DevOps/SRE yang berwenang. |

Field teknis yang disarankan pada outbox/inbox:

retry_count
next_retry_at
last_error
locked_at
locked_by
processed_at
dead_letter_at
schema_version
correlation_id
causation_id

## B.9 Snapshot dan Read Model Impact

| Event | Consumer | Tabel Lokal yang Diupdate |
| --- | --- | --- |
| core.person_updated | PMB, Academic, LMS | person_snapshots |
| reference.study_program_updated | PMB, Academic, HRIS, LMS | reference_snapshots atau study_program_snapshots |
| finance.invoice_created | PMB, Academic, Portal | applicant_invoice_statuses, student_finance_snapshots, dashboard_read_models |
| finance.clearance_changed | Academic, LMS, Portal | student_clearance_snapshots, lms_clearance_snapshots, dashboard_read_models |
| academic.krs_approved | LMS, Portal | lms_enrollments, dashboard_read_models |
| assessment.result_calculated | PMB, LMS, Academic | assessment_result_snapshots atau grade_inputs |

Setiap snapshot/read model minimal memiliki source_event_key, source_event_name, source_updated_at, synced_at, dan sync_status.

## B.10 Reconciliation Rule

| Relasi Kritis | Reconciliation Rule |
| --- | --- |
| PMB invoice snapshot vs Finance invoice/payment | Cocokkan invoice_id, payment status, paid_amount, dan paid_at. |
| Academic clearance snapshot vs Finance clearance | Cocokkan subject_ref_id, service_code, academic_period_ref_id, dan status_code. |
| LMS enrollment vs Academic KRS | Cocokkan krs_item_ref_id, student_ref_id, course_offering_ref_id, dan enrollment status. |
| Academic grade input vs LMS/Assessment source | Cocokkan source_module, source_ref_id, score, weight, dan submitted_at. |
| Portal dashboard read model vs source events | Cocokkan refreshed_at, source status, dan payload aggregate. |

Jika snapshot berbeda dari source of truth, sistem membuat mismatch report. Jika dapat diperbaiki otomatis, correction job dijalankan. Jika perlu keputusan admin, status data menjadi pending_review.

## B.11 Security dan Authorization Event

| Aspek | Aturan |
| --- | --- |
| Publisher authorization | Hanya service owner domain yang boleh publish event domainnya. |
| Consumer authorization | Hanya consumer terdaftar yang boleh subscribe event tertentu. |
| PII minimization | Payload tidak boleh membawa data pribadi berlebihan. Gunakan ref_id dan snapshot minimum. |
| Service authentication | Publish dan consume event memakai service credential yang dikelola Core/Security. |
| Audit | Publish, consume, retry, DLQ, dan replay event wajib tercatat audit. |
| Replay control | Replay DLQ hanya boleh dilakukan role DevOps/SRE atau admin teknis yang diberi izin. |

## B.12 Error Contract

| Error Code | Keterangan | Tindakan |
| --- | --- | --- |
| EVENT_DUPLICATE | event_key sudah pernah diproses. | Abaikan payload dan catat sebagai duplicate. |
| EVENT_SCHEMA_INVALID | Payload tidak sesuai schema. | Tolak event dan catat error. |
| EVENT_VERSION_UNSUPPORTED | Consumer belum mendukung event_version. | Masukkan ke DLQ atau compatibility queue. |
| SOURCE_REF_NOT_FOUND | External reference tidak ditemukan. | Retry jika kemungkinan event pendahulu belum masuk. |
| SNAPSHOT_UPDATE_FAILED | Snapshot lokal gagal diperbarui. | Retry dan catat last_error. |
| RECONCILIATION_REQUIRED | Data source dan snapshot berbeda. | Buat mismatch report. |
| CONSUMER_TEMPORARY_FAILURE | Consumer gagal sementara. | Retry sesuai retry policy. |
| CONSUMER_PERMANENT_FAILURE | Consumer gagal permanen. | Masuk DLQ. |

## B.13 Observability dan Monitoring

| Metric | Tujuan |
| --- | --- |
| outbox_pending_count | Mengukur event yang belum dipublish. |
| inbox_pending_count | Mengukur event masuk yang belum diproses. |
| event_lag_seconds | Mengukur keterlambatan event dari occurred_at ke processed_at. |
| retry_count_by_event | Melihat event yang sering gagal. |
| dlq_count_by_consumer | Menemukan consumer bermasalah. |
| reconciliation_mismatch_count | Mengukur selisih source of truth dan snapshot/read model. |

## B.14 UAT Event Contract

| Skenario UAT | Expected Result |
| --- | --- |
| Event valid diterbitkan. | Event masuk outbox dan dipublish ke broker setelah transaksi lokal commit. |
| Event diterima consumer. | Consumer menyimpan event_key pada inbox_events dan memperbarui snapshot/read model. |
| Event yang sama dikirim dua kali. | Consumer hanya memproses satu kali. |
| Consumer down. | Event masuk retry queue dan diproses ulang saat consumer pulih. |
| Payload tidak valid. | Event ditolak dengan EVENT_SCHEMA_INVALID. |
| Event version tidak didukung. | Event masuk DLQ atau compatibility queue. |
| Snapshot berbeda dengan source. | Reconciliation job membuat mismatch report. |
| DLQ direplay. | Replay tercatat audit dan tidak membuat data duplikat. |

## B.15 Template Final Event Contract

Event Name        :
Event Version     :
Event Type        :
Publisher Service :
Publisher DB      :
Source Table      :
Aggregate Type    :
Aggregate ID      :
Business Trigger  :
Pre-condition     :
Post-condition    :
Consumer          :
Payload Schema    :
Validation Rule   :
Idempotency Rule  :
Ordering Rule     :
Retry Policy      :
DLQ Policy        :
Snapshot Impact   :
Reconciliation    :
Security Rule     :
Error Contract    :
Observability     :
UAT Scenario      :


# BAGIAN - BRD UNSIA

_Sumber file: `BRD_UNSIA.docx`_

UNSIA

BUSINESS REQUIREMENT DOCUMENT

BRD Global dan Per Modul - Distributed Modular Database FULL

Produk: ERP Pendidikan / SIAKAD Terintegrasi UNSIA

Versi BRD: v1.1 Distributed Database FULL

Tanggal: 19 Juni 2026

Status: Revised Full Draft

Basis Penyusunan: PRD Global UNSIA v6.5 Distributed Database FULL, PRD Global UNSIA v6.4 Detailed FULL, BRD Global UNSIA v1.0 Draft, BRD Per Modul UNSIA v1.0 Draft, dan revisi arsitektur database fisik per modul.

Tujuan Dokumen: Menurunkan keputusan produk v6.5 menjadi kebutuhan bisnis yang dapat divalidasi stakeholder serta menjadi dasar FSD, ERD/DBML per database, API Contract, Event Contract, RBAC Matrix, UAT, migration mapping, dan release plan.

## 1. Kontrol Dokumen

| Versi | Tanggal | Status | Catatan |
| --- | --- | --- | --- |
| v1.0 | 18 Juni 2026 | Draft Awal | BRD Global dan BRD Per Modul disusun berdasarkan PRD Global v6.4 dengan asumsi satu PostgreSQL utama dan schema per domain. |
| v1.1 | 19 Juni 2026 | Revised Full Draft | BRD direvisi mengikuti keputusan physical database per modul, no cross-database FK, no online cross-database join, event-driven integration, snapshot/read model, dan graceful degradation. |
| v1.1.1 | 22 Juni 2026 | Updated Draft | Penambahan Appendix A - Event Contract Standard sebagai standar kebutuhan bisnis dan teknis untuk event identity, trigger bisnis, payload schema, idempotency, retry, DLQ, snapshot/read model, reconciliation, security, error handling, observability, dan UAT event. |

## 1.1 Peran dan Tanggung Jawab

| Peran | Tanggung Jawab |
| --- | --- |
| Product Owner | Mengesahkan kebutuhan bisnis, scope, prioritas, release MVP, dan acceptance criteria global. |
| System Analyst | Menyusun BRD, menjaga traceability ke PRD, mengubah BRD menjadi FSD, API/Event Contract, RBAC, UAT, dan state machine. |
| Owner Modul | Memvalidasi proses bisnis, aturan operasional, laporan, risiko, dan acceptance criteria per modul. |
| Technical Lead | Menilai kelayakan implementasi multi-repo, API, event broker, database terpisah, dan dependency teknis lintas modul. |
| DBA | Memastikan kebutuhan bisnis dapat diturunkan menjadi database fisik per modul, constraint lokal, index, external reference, snapshot, read model, migration, backup, dan reconciliation. |
| Backend Lead | Menyusun service boundary, command/query API, event publisher/consumer, idempotency, dan error handling. |
| Frontend Lead | Menyusun flow UI, degraded-mode behavior, sync timestamp display, dan role-based navigation. |
| QA/UAT Lead | Menurunkan business requirement menjadi skenario UAT normal, negative case, integration case, failure case, dan reconciliation case. |
| DevOps/SRE | Menyediakan deployment, monitoring, alert, log, trace, event broker, retry, DLQ, backup, restore, dan runbook. |

## 2. Ringkasan Eksekutif

UNSIA membutuhkan ERP Pendidikan / SIAKAD Terintegrasi untuk mengelola lifecycle kampus dari lead, applicant, pembayaran, mahasiswa aktif, KRS, LMS, assessment, nilai, KHS, transkrip, sampai alumni. BRD ini memformalkan kebutuhan bisnis lintas modul setelah keputusan arsitektur database direvisi menjadi physical database per modul.

Keputusan bisnis kunci dalam BRD v1.1 adalah sebagai berikut:

1. Setiap modul memiliki database fisik sendiri: `core_db`, `reference_db`, `crm_db`, `pmb_db`, `finance_db`, `academic_db`, `hris_db`, `lms_db`, `assessment_db`, dan `portal_db`.

2. Tidak ada foreign key lintas database. Relasi antar modul memakai external reference seperti `person_ref_id`, `applicant_ref_id`, `student_ref_id`, `academic_period_ref_id`, dan `invoice_ref_id`.

3. Tidak ada direct cross-database join untuk transaksi online. Kebutuhan tampilan lintas modul dipenuhi melalui API composition, snapshot, read model, event projection, atau warehouse.

4. Jika salah satu database modul mati, proses modul lain yang tidak berhubungan langsung tetap berjalan dalam mode normal atau degraded mode.

5. Source of truth tetap tunggal per domain. Snapshot dan read model bukan sumber kebenaran utama.

6. Proses kritis wajib memiliki idempotency, audit trail, event log, dan reconciliation.

7. Tahun Ajaran, Periode Akademik, Tahun Kurikulum, dan Kurikulum Prodi tetap dipisahkan secara bisnis dan data.

## 3. Latar Belakang dan Masalah Bisnis

Operasional perguruan tinggi memiliki rangkaian proses yang saling bergantung. CRM menghasilkan lead; PMB mengubah lead menjadi applicant; Finance mengelola invoice, payment, dan clearance; Akademik mengubah applicant valid menjadi mahasiswa; HRIS menjadi sumber dosen; LMS menjalankan pembelajaran online berdasarkan kelas dan KRS; Assessment menjadi mesin CBT/quiz/survey; Portal menyajikan dashboard dan notifikasi.

Pada model terpusat, database tunggal memberikan kemudahan join dan constraint, tetapi memiliki risiko operasional: kegagalan database utama atau kesalahan migration dapat berdampak luas ke semua modul. Karena target bisnis UNSIA adalah modul yang lebih tahan gangguan, BRD ini menetapkan pendekatan distributed modular database.

| Masalah Bisnis | Dampak | Arah Solusi Bisnis |
| --- | --- | --- |
| Data calon mahasiswa, mahasiswa, dosen, dan transaksi tersebar tanpa ownership jelas. | Duplikasi data, laporan tidak konsisten, dan audit sulit. | Menetapkan source of truth per domain dan external reference resmi. |
| Satu database utama menjadi titik kegagalan besar. | Gangguan DB dapat menghentikan proses lintas modul. | Memisahkan database fisik per modul dan membuat graceful degradation. |
| Status payment tidak selalu menjadi dasar layanan akademik. | KRS, ujian, KHS, transkrip, atau wisuda dapat berjalan tanpa kontrol finansial. | Finance menjadi source of truth clearance dan publish clearance event. |
| Tahun Ajaran sering rancu dengan Tahun Kurikulum. | Kelas, KRS, invoice, LMS, nilai, dan transkrip rawan salah periode. | Memisahkan kalender operasional dengan versi kurikulum. |
| Role hanya dikontrol di tampilan. | Kebocoran data lintas prodi atau lintas user. | Backend wajib menegakkan permission dan data scope. |
| Integrasi manual antar modul. | Data dobel atau hilang saat retry. | Setiap proses kritis memakai idempotency, outbox/inbox, audit, dan reconciliation. |
| Reporting lintas modul langsung query ke transaksi. | Beban produksi tinggi dan dependency antar DB makin rapat. | Reporting memakai read model, dashboard projection, atau data warehouse. |

## 4. Tujuan Bisnis dan Indikator Keberhasilan

| Tujuan Bisnis | Deskripsi | Indikator Keberhasilan |
| --- | --- | --- |
| Single identity | Semua pengguna menggunakan satu identitas, akun, role, dan session dari Core. | Tidak ada credential dan role table di luar Core. |
| Lifecycle mahasiswa end-to-end | Data dapat dilacak dari lead, applicant, mahasiswa aktif, alumni. | Tidak ada mahasiswa aktif tanpa histori PMB atau mekanisme create sah. |
| Modular database independence | Setiap modul memiliki database fisik sendiri. | Gangguan database satu modul tidak menghentikan modul lain yang tidak terkait langsung. |
| Source of truth tunggal | Setiap data utama memiliki satu owner bisnis dan teknis. | Modul lain tidak melakukan write langsung ke data domain lain. |
| Kontrol pembayaran dan clearance | Finance mengendalikan status kelayakan layanan akademik. | KRS, ujian, KHS, transkrip, dan wisuda dapat dibatasi sesuai clearance. |
| Konsistensi kalender akademik dan kurikulum | Tahun Ajaran, Periode Akademik, Tahun Kurikulum, dan Kurikulum Prodi tidak bercampur. | Kelas, KRS, invoice, LMS, nilai, dan laporan memakai periode; struktur MK memakai kurikulum. |
| Audit bisnis kuat | Aksi sensitif memiliki actor, role, timestamp, reason, old value, new value. | Payment, handover, NIM, clearance, nilai final dapat ditelusuri. |
| Integrasi idempotent | Retry request/event tidak membuat data ganda. | Payment callback, handover, generate NIM, class sync, grade sync tidak dobel. |
| Degraded operation | Modul tetap berjalan terbatas saat dependency down. | UI menampilkan data terakhir, status sync, dan batasan operasi. |
| Delivery bertahap | Implementasi dapat dilakukan per modul tanpa merusak ownership data. | MVP berjalan bertahap dari foundation, PMB, Finance, Akademik, LMS, Assessment, Portal, Reporting. |

## 5. Ruang Lingkup Bisnis

## 5.1 In Scope

| Modul | Database | Ruang Lingkup Bisnis | Catatan Ownership |
| --- | --- | --- | --- |
| Core | `core_db` | Identitas, SSO, RBAC, active role, application launcher, service client, impersonation, audit global. | Source of truth person, user, role, permission, session. |
| Referensi | `reference_db` | Master data lintas modul, prodi, tahun ajaran, periode akademik, jalur PMB, komponen pembayaran, status code. | Source of truth master data. |
| CRM | `crm_db` | Lead, campaign, agen, referral, follow-up, pipeline, komisi. | Source of truth peminat sebelum applicant. |
| PMB | `pmb_db` | Applicant, biodata, dokumen, seleksi, daftar ulang, LoA, handover ke Akademik. | Source of truth applicant sebelum mahasiswa. |
| Finance | `finance_db` | Invoice, payment, callback, verifikasi manual, receipt, clearance, cicilan, beasiswa, jurnal dasar. | Source of truth transaksi dan clearance. |
| Akademik | `academic_db` | Student, NIM, kurikulum, mata kuliah, kelas, KRS, nilai final, KHS, transkrip, yudisium, alumni. | Source of truth mahasiswa, kelas, KRS, nilai final. |
| HRIS/SDM | `hris_db` | Pegawai, dosen, homebase, unit kerja, jabatan, status aktif, BKD, payroll source. | Source of truth dosen dan karyawan. |
| LMS | `lms_db` | Kelas online, enrollment dari KRS valid, sesi, materi, tugas, presensi, progress, grade input. | Delivery pembelajaran online; bukan owner kelas akademik. |
| Assessment | `assessment_db` | Bank soal, versi soal, CBT, quiz, survey, attempt, jawaban, scoring, result API. | Mesin assessment reusable. |
| Portal | `portal_db` | Dashboard role-based, notification center, preference, shortcut, activity log, read model dashboard. | Presentation layer dan notification center; bukan source transaksi. |
| Reporting | `reporting_db` / warehouse | Agregasi lintas modul, KPI, laporan pimpinan. | Analitik; bukan source transaksi operasional. |

## 5.2 Out of Scope Awal

Mobile app native penuh belum menjadi scope awal; portal responsive/mobile web menjadi prioritas.

Integrasi PDDIKTI/NeoFeeder full automation belum menjadi MVP pertama, tetapi struktur data harus siap.

Vendor payment gateway spesifik belum ditetapkan; BRD hanya mengatur kebutuhan bisnis validasi pembayaran, callback, idempotency, dan rekonsiliasi.

Migrasi historis lengkap dari sistem lama memerlukan dokumen migration mapping terpisah.

Workflow equivalency kurikulum lama-baru belum menjadi MVP penuh.

Distributed transaction atau 2-phase commit lintas database bukan pattern bisnis utama.

Direct cross-database join untuk dashboard/transaksi tidak menjadi scope resmi.

## 6. Stakeholder dan Persona

| Persona/Role | Aktivitas Utama | Kebutuhan Bisnis |
| --- | --- | --- |
| Pendaftar | Mendaftar, mengisi biodata, upload dokumen, seleksi, membayar, daftar ulang, menerima LoA. | Proses jelas, status transparan, invoice valid, bukti pembayaran tercatat, notifikasi tepat waktu. |
| Mahasiswa | Melihat tagihan, KRS, mengikuti LMS, mengerjakan tugas/quiz, melihat nilai/KHS/transkrip. | Akses tunggal, status keuangan jelas, KRS mudah dipahami, kelas LMS otomatis. |
| Dosen | Mengajar, mengelola sesi LMS, materi, tugas, quiz, presensi, nilai input. | Kelas sesuai plotting Akademik dan data dosen dari HRIS. |
| Dosen PA | Menyetujui KRS mahasiswa bimbingan dan memberi catatan akademik. | Akses scoped hanya ke mahasiswa bimbingan dan status clearance/KRS. |
| Admin PMB | Mengelola gelombang, applicant, dokumen, seleksi, daftar ulang, LoA, handover. | Target periode masuk, status applicant, invoice/payment valid, integrasi Assessment. |
| Admin Keuangan | Mengelola invoice, pembayaran, verifikasi, clearance, kas/bank, jurnal, laporan. | Membaca data pendaftar/mahasiswa dari domain sumber dan mengelola audit transaksi. |
| Admin Akademik Biro | Mengelola kalender akademik, NIM, kurikulum, kelas, KRS, nilai, KHS, transkrip, alumni. | Kontrol global akademik dan integrasi dengan PMB, Finance, LMS, HRIS. |
| Admin Akademik Prodi/Kaprodi | Mengelola kurikulum prodi, kelas, dosen pengampu, monitoring mahasiswa prodi. | Scope `study_program_ref_id` ditegakkan backend. |
| Admin SDM/HRIS | Mengelola dosen, pegawai, homebase, jabatan, status aktif. | Data person dari Core dan employment sebagai source of truth. |
| Admin LMS | Mengelola kelas online, materi, tugas, progress, dan sinkronisasi kelas. | Data kelas dan peserta mengikuti Academic. |
| Admin Assessment | Mengelola bank soal, sesi CBT/quiz, scoring, dan result. | Attempt dan score audit-ready serta reusable lintas konteks. |
| Pimpinan | Melihat KPI lintas modul dan risiko operasional. | Dashboard agregat read-only dengan drilldown terbatas dan timestamp sinkronisasi. |
| DBA/SRE | Menjaga availability, backup, restore, event, dan observability. | Database per modul dapat dipulihkan tanpa merusak modul lain. |

## 7. Keputusan Bisnis Utama

| ID | Keputusan Bisnis | Konsekuensi |
| --- | --- | --- |
| BD-001 | Core menjadi identity authority. | Semua modul membaca user/role dari token dan snapshot, bukan membuat login sendiri. |
| BD-002 | Setiap modul memiliki database fisik sendiri. | Tidak ada cross-database FK dan setiap DB punya backup/migration sendiri. |
| BD-003 | Source of truth tunggal per domain. | Modul lain menyimpan external reference dan snapshot, bukan menyalin kepemilikan. |
| BD-004 | Integrasi memakai API/event/read model. | Reporting dan tampilan lintas modul tidak memakai direct join produksi. |
| BD-005 | Tahun Ajaran dan Tahun Kurikulum dipisahkan. | Periode semester tidak boleh menjadi versi kurikulum. |
| BD-006 | Finance menjadi owner clearance. | Layanan akademik bergantung pada status clearance Finance. |
| BD-007 | Academic menjadi owner final grade. | LMS/Assessment hanya memberi grade input, bukan final grade. |
| BD-008 | LMS tidak membuat kelas akademik. | Kelas LMS berasal dari event/API Academic. |
| BD-009 | Assessment reusable lintas konteks. | CBT PMB, quiz LMS, survey memakai mesin sama dengan context berbeda. |
| BD-010 | Portal bukan source transaksi bisnis. | Portal hanya read model, notification, preference, shortcut. |

## 8. Proses Bisnis End-to-End

| Tahap | Deskripsi Bisnis | Modul Pemilik | Output Bisnis | Integrasi |
| --- | --- | --- | --- | --- |
| Lead/Peminat | Peminat masuk dari campaign/referral/agen/landing page/input manual. | CRM | Lead dengan source dan status follow-up. | Core person snapshot opsional. |
| Applicant/Pendaftar | Lead qualified atau pendaftar publik menjadi applicant. | PMB | Applicant dan akun pendaftar. | CRM event/API, Core user/person. |
| Biodata dan Dokumen | Pendaftar melengkapi biodata dan upload dokumen. | PMB | Biodata snapshot, dokumen pending/verified/rejected. | Referensi snapshot. |
| Invoice dan Payment | PMB/Akademik meminta invoice ke Finance. | Finance | Invoice, payment, receipt, payment status. | Finance API/event ke PMB/Academic/Portal. |
| Seleksi dan Daftar Ulang | Applicant mengikuti seleksi/CBT dan daftar ulang. | PMB + Assessment + Finance | Score, result, re-registration. | Assessment result event, Finance payment status. |
| LoA dan Handover | LoA diterbitkan dan applicant ready for academic. | PMB | LoA, handover request. | PMB event/API ke Academic. |
| Generate NIM | Akademik membuat student dan NIM. | Akademik | Mahasiswa baru, NIM, entry period, curriculum. | PMB handover, Finance clearance. |
| KRS dan Kelas | Mahasiswa mengikuti KRS paket/mandiri. | Akademik | KRS header/item, class enrollment. | Finance clearance snapshot, HRIS lecturer snapshot. |
| Pembelajaran Online | Kelas dan peserta KRS disinkronkan ke LMS. | LMS | LMS class, enrollment, session, material, task. | Academic class/KRS event. |
| Quiz/Assessment | Peserta mengerjakan CBT/quiz/survey. | Assessment | Attempt, answer, score, result. | PMB/LMS as context owner. |
| Nilai Final | Input nilai dari LMS/Assessment diproses Akademik. | Akademik | Final grade dan grade history. | LMS/Assessment event/API. |
| KHS/Transkrip | Nilai final digunakan untuk KHS/transkrip. | Akademik | KHS, transkrip, IPK. | Finance clearance untuk akses layanan. |
| Graduation/Alumni | Mahasiswa lulus dan menjadi alumni. | Akademik | Graduation record, alumni. | Finance clearance wisuda. |
| Dashboard/Notifikasi | Status penting ditampilkan ke user/pimpinan. | Portal | Notification, dashboard read model. | Event dari semua modul. |

## 9. Business Rule Global

| ID | Business Rule |
| --- | --- |
| BR-G-001 | Tidak ada password, session, dan role table di luar Core. |
| BR-G-002 | Tidak ada cross-database foreign key. |
| BR-G-003 | Tidak ada direct cross-database join untuk transaksi online. |
| BR-G-004 | Data bisnis utama hanya memiliki satu source of truth. |
| BR-G-005 | Modul tidak boleh write langsung ke database modul lain. |
| BR-G-006 | Semua external reference wajib dapat divalidasi melalui API, event, snapshot, atau reconciliation. |
| BR-G-007 | Setiap event consumer wajib idempotent. |
| BR-G-008 | Snapshot dan read model bukan source of truth. |
| BR-G-009 | Read model lintas modul wajib memiliki `synced_at` atau `refreshed_at`. |
| BR-G-010 | Tahun Ajaran adalah kalender operasional, bukan Tahun Kurikulum. |
| BR-G-011 | Periode Akademik wajib berada di bawah Tahun Ajaran. |
| BR-G-012 | Tahun Kurikulum adalah atribut versi di dalam Kurikulum Prodi. |
| BR-G-013 | Mahasiswa wajib menyimpan `curriculum_id` saat NIM dibuat. |
| BR-G-014 | Gelombang PMB wajib memiliki `target_entry_period_ref_id`. |
| BR-G-015 | Payment status resmi hanya berasal dari Finance. |
| BR-G-016 | Clearance layanan akademik hanya berasal dari Finance. |
| BR-G-017 | Handover PMB ke Academic wajib idempotent. |
| BR-G-018 | Generate NIM wajib idempotent dan unique. |
| BR-G-019 | Kelas LMS wajib berasal dari kelas Academic. |
| BR-G-020 | Enrollment LMS wajib berasal dari KRS valid. |
| BR-G-021 | LMS/Assessment tidak boleh langsung menimpa final grade Academic. |
| BR-G-022 | Question yang sudah dipakai attempt tidak boleh diedit langsung; harus versi baru. |
| BR-G-023 | Portal tidak boleh menjadi owner data transaksi bisnis. |
| BR-G-024 | Proses kritis wajib mencatat audit trail. |

## 10. Kebutuhan Bisnis Global

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan Bisnis |
| --- | --- | --- | --- |
| BRD-G-001 | P0 | Sistem harus menyediakan ERP/SIAKAD terintegrasi untuk lifecycle lead sampai alumni. | Data dapat ditelusuri dari CRM, PMB, Finance, Academic, LMS, Assessment, Portal. |
| BRD-G-002 | P0 | Sistem harus memakai Core sebagai pusat identity dan access. | Semua modul menggunakan token/claim Core. |
| BRD-G-003 | P0 | Setiap modul harus memiliki database fisik sendiri. | Setiap modul dapat backup, restore, migration, dan recovery terpisah. |
| BRD-G-004 | P0 | Sistem tidak boleh memakai cross-database FK. | ERD fisik hanya memiliki FK internal database; relasi lintas modul memakai external reference. |
| BRD-G-005 | P0 | Sistem tidak boleh memakai direct cross-database join pada transaksi online. | UI transaksi membaca API/snapshot/read model. |
| BRD-G-006 | P0 | Sistem harus memiliki outbox/inbox event per modul. | Event dapat dipublish, diterima, diproses, diretry, dan ditelusuri. |
| BRD-G-007 | P0 | Setiap proses kritis harus idempotent. | Retry tidak membuat applicant/student/payment/class/grade duplikat. |
| BRD-G-008 | P0 | Source of truth per domain harus jelas. | Modul lain tidak mengubah data owner secara langsung. |
| BRD-G-009 | P0 | Sistem harus mendukung degraded mode saat dependency down. | Modul tidak terkait tetap berjalan dan UI menampilkan data terakhir. |
| BRD-G-010 | P1 | Reporting lintas modul harus memakai read model/warehouse. | Dashboard pimpinan tidak query langsung ke semua database transaksi. |
| BRD-G-011 | P1 | Reconciliation lintas modul harus tersedia. | Selisih source vs snapshot/read model dapat dideteksi dan diperbaiki. |
| BRD-G-012 | P1 | Setiap dashboard/read model harus menampilkan waktu sinkronisasi terakhir. | User mengetahui freshness data. |

## 11. Source of Truth dan Ownership Data

| Domain Data | Source of Truth | Konsumen | Aturan Bisnis |
| --- | --- | --- | --- |
| Person/user/role/permission | Core | Semua modul | Modul lain simpan `person_ref_id`, `user_ref_id`, snapshot jika perlu. |
| Master data prodi/periode/status | Referensi | PMB, Finance, Academic, HRIS, LMS, Assessment, Portal | Modul lain simpan `*_ref_id` dan reference snapshot. |
| Lead/peminat | CRM | PMB, Portal, Reporting | PMB menerima lead qualified, bukan mengubah lead langsung. |
| Applicant | PMB | CRM, Finance, Academic, Assessment, Portal | Academic baru membuat student setelah PMB ready for handover. |
| Invoice/payment/clearance | Finance | PMB, Academic, Portal, Reporting | Status bayar dan clearance hanya dari Finance. |
| Student/KRS/final grade | Academic | Finance, LMS, Assessment, Portal, Reporting | LMS/Assessment hanya input, final grade milik Academic. |
| Dosen/pegawai | HRIS | Academic, LMS, Finance, Portal | Academic/LMS tidak membuat biodata dosen sendiri. |
| Kelas online/progress | LMS | Academic, Portal, Reporting | LMS mengikuti kelas dan peserta dari Academic. |
| Attempt/scoring | Assessment | PMB, LMS, Academic, Portal | Assessment result dikirim ke context owner. |
| Notification/preference | Portal | User dan modul sumber | Portal bukan source transaksi bisnis. |

## 12. Pola Relasi dan Join Data Bisnis

## 12.1 Prinsip Relasi Lintas Modul

Relasi lintas modul tidak diwujudkan sebagai FK database. Relasi diwujudkan melalui:

1. External reference ID.

2. Snapshot lokal.

3. Read model lokal.

4. API query/command.

5. Event contract.

6. Reconciliation job.

7. Warehouse untuk reporting.

## 12.2 Contoh Relasi Bisnis

| Relasi Bisnis | Implementasi Data | Cara Validasi |
| --- | --- | --- |
| Applicant memiliki person | `pmb_db.applicants.person_ref_id` | Core API atau `person_snapshots`. |
| Applicant berasal dari lead | `pmb_db.applicants.lead_ref_id` | CRM event/API. |
| Applicant punya status payment | `pmb_db.applicant_invoice_statuses` | Finance event `invoice_created/payment_paid`. |
| Student berasal dari applicant | `academic_db.students.applicant_ref_id` | PMB handover event dan idempotency key. |
| Student punya clearance KRS | `academic_db.student_clearance_snapshots` | Finance event `clearance_updated`. |
| LMS class berasal dari course offering | `lms_db.academic_class_snapshots.course_offering_ref_id` | Academic event `course_offering_created`. |
| LMS enrollment berasal dari KRS item | `lms_db.lms_enrollments.krs_item_ref_id` | Academic event `krs_approved`. |
| Quiz LMS memakai Assessment | `lms_db.quiz_activities.assessment_session_ref_id` | Assessment API/event. |
| Portal dashboard membaca semua modul | `portal_db.dashboard_read_models` | Event/read model/warehouse. |

## 12.3 Business Rule Join

| ID | Rule |
| --- | --- |
| JOIN-001 | Join lintas modul untuk transaksi online dilarang. |
| JOIN-002 | Join lokal di dalam satu database modul diperbolehkan. |
| JOIN-003 | Untuk data lintas modul yang sering dibaca, modul wajib memakai read model. |
| JOIN-004 | Untuk data lintas modul yang harus real-time, modul menggunakan API owner. |
| JOIN-005 | Untuk laporan agregat, sistem menggunakan warehouse/data mart. |
| JOIN-006 | UI wajib membedakan data real-time dan data snapshot dengan timestamp. |

## 13. BRD Per Modul

## 13.1 Modul Core

## Tujuan Bisnis

Core menjadi pusat identitas, akses, role, permission, session, application registry, service client, impersonation, audit global, idempotency, dan security foundation untuk seluruh modul.

## Stakeholder Utama

Super Admin, Admin BPPTI, Admin Modul, Pendaftar, Mahasiswa, Dosen, Pegawai, Pimpinan, Service Account antar modul.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Person dan user identity; SSO; active role; role, permission, data scope; application registry; service client; impersonation; audit global; token validation; idempotency; event outbox/inbox. | Data bisnis PMB, Finance, Akademik, HRIS, LMS, Assessment, Portal; pengaturan KRS/nilai/invoice/payment. |

## Proses Bisnis Utama

| Proses | Deskripsi | Output |
| --- | --- | --- |
| User onboarding | Admin membuat/menghubungkan person dengan user dan role. | User aktif dengan role dan scope. |
| Login dan role selection | User login melalui Core dan memilih active role. | Token/session membawa identity, active role, application, scope. |
| Role switching | User berpindah role sesuai hak. | Active role berubah dan audit tercatat. |
| Service authentication | Modul memakai service client/token. | Permintaan antar modul dapat divalidasi. |
| Impersonation | Admin tertentu masuk sebagai user lain untuk support. | Audit impersonation lengkap. |
| Token degraded mode | Modul memverifikasi JWT dari cache saat Core tidak tersedia. | Operasi terbatas tetap berjalan untuk token valid. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-CORE-001 | P0 | Core harus menjadi satu-satunya pusat login dan session. | Tidak ada modul operasional yang menyimpan credential/session sendiri. |
| BRD-CORE-002 | P0 | Core harus menyediakan active role session untuk user multi-role. | Menu, permission, data scope mengikuti active role. |
| BRD-CORE-003 | P0 | Core harus mengelola role, permission, dan data scope lintas modul. | Endpoint protected menolak akses tanpa permission/scope valid. |
| BRD-CORE-004 | P0 | Core harus menyediakan application registry dan app launcher. | User hanya melihat aplikasi sesuai active role. |
| BRD-CORE-005 | P0 | Core harus menyediakan service client/token. | Modul dapat memvalidasi service-to-service call. |
| BRD-CORE-006 | P0 | Core harus menyediakan audit global untuk aksi lintas modul. | Actor, role, timestamp, request id, reason tercatat. |
| BRD-CORE-007 | P0 | Core harus mendukung offline token validation terbatas. | JWT valid dapat diverifikasi lokal selama TTL/cache valid. |
| BRD-CORE-008 | P1 | Core harus mendukung impersonation terbatas. | Impersonation wajib reason dan mencatat actor asli. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| persons, users, roles, permissions, role_assignments, sessions, applications, service_clients, audit_logs, idempotency_keys, outbox_events, inbox_events. | Master data scope dari Referensi atau modul pemilik melalui external reference/snapshot. |

## Integrasi

| Integrasi | Kebutuhan | Guardrail |
| --- | --- | --- |
| Core ke semua modul | Token validation, active role, permission, app launcher. | Modul tidak membuat login sendiri. |
| Semua modul ke Core | User/person lookup, audit summary, service client validation. | Gunakan API/cache; tidak direct DB join. |

## Reporting dan Output

Daftar user aktif, role assignment, permission matrix, audit log sensitif, impersonation log, failed login, access denied, service client usage.

## UAT Starter

1. User multi-role login dan memilih active role berbeda.

2. Admin Prodi mencoba akses data prodi lain dan ditolak.

3. Service token invalid ditolak.

4. Impersonation tanpa reason ditolak.

5. Token valid tetap bisa diverifikasi saat Core API sementara tidak tersedia.

## Dependency dan Open Issue

Daftar role/permission final, struktur data scope, kebijakan MFA, masa berlaku session/token, TTL permission cache, kebijakan lockout.

## 13.2 Modul Referensi

## Tujuan Bisnis

Referensi menyediakan master data standar lintas modul agar dropdown, status, periode, prodi, jalur PMB, komponen pembayaran, dan kode bisnis konsisten.

## Stakeholder Utama

Admin Referensi, Admin Akademik Biro, Admin PMB, Admin Finance, Admin HRIS, Admin LMS, QA, DBA.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Wilayah, agama, kewarganegaraan, prodi, jenjang, tahun ajaran, periode akademik, jalur PMB, jenis dokumen, komponen pembayaran, metode pembayaran, status code. | Transaksi PMB, invoice, payment, KRS, nilai, attempt assessment. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-REF-001 | P0 | Referensi harus menyediakan master data lintas modul. | Dropdown/status lintas modul menggunakan kode standar. |
| BRD-REF-002 | P0 | Status bisnis kritis harus berupa managed code. | Transaksi tidak dapat menyimpan status tidak terdaftar. |
| BRD-REF-003 | P0 | Tahun Ajaran dan Periode Akademik harus tersedia lintas modul. | Gelombang, invoice, kelas, KRS, LMS, nilai, laporan punya konteks periode. |
| BRD-REF-004 | P1 | Master data yang sudah dipakai transaksi tidak boleh hard delete. | Tersedia inactive/archived. |
| BRD-REF-005 | P1 | Referensi harus publish event saat master berubah. | Modul consumer memperbarui snapshot lokal. |
| BRD-REF-006 | P1 | Referensi harus mendukung valid_from/valid_to untuk data tertentu. | Master periodik dapat dikontrol masa berlaku. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| regions, religions, academic_levels, study_programs, academic_years, academic_periods, pmb_paths, document_types, payment_components, payment_methods, status_codes. | Role/user dari Core untuk otorisasi pengelolaan master data. |

## Integrasi

Referensi publish master-data event ke PMB, Finance, Academic, HRIS, LMS, Assessment, Portal. Consumer menyimpan `reference_snapshots` atau cache. Tidak ada direct DB join.

## Reporting dan Output

Daftar master aktif/nonaktif, audit perubahan master, status code catalog, periode akademik per tahun ajaran, prodi aktif.

## UAT Starter

1. Membuat Periode Akademik tanpa Tahun Ajaran ditolak.

2. Menghapus master yang sudah dipakai transaksi ditolak.

3. PMB hanya menampilkan jalur PMB aktif.

4. Status bebas yang tidak terdaftar ditolak.

5. Perubahan nama prodi memicu event dan snapshot consumer diperbarui.

## 13.3 Modul CRM

## Tujuan Bisnis

CRM mengelola peminat sebelum menjadi applicant: campaign, lead, agen, referral, follow-up, pipeline, dan komisi.

## Stakeholder Utama

Owner CRM, Admin Marketing, Admin PMB, Agen/Mitra, Pimpinan, Finance untuk komisi.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Lead, campaign, agen, referral, follow-up, pipeline, commission eligibility, handover ke PMB. | Applicant biodata lengkap, dokumen PMB, invoice/payment resmi, generate NIM. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-CRM-001 | P0 | CRM harus mengelola lead dari berbagai sumber. | Lead memiliki source, campaign, status, dan follow-up. |
| BRD-CRM-002 | P0 | Lead qualified dapat dikonversi menjadi applicant PMB. | Conversion idempotent dan tidak membuat applicant duplikat. |
| BRD-CRM-003 | P1 | Agen hanya melihat lead/referral miliknya. | Agent scope ditegakkan backend. |
| BRD-CRM-004 | P1 | CRM harus menyimpan `applicant_ref_id` setelah handover berhasil. | CRM dapat menelusuri lead menjadi applicant tanpa FK lintas DB. |
| BRD-CRM-005 | P1 | CRM tetap dapat mencatat lead/follow-up saat PMB down. | Handover masuk retry/pending queue. |
| BRD-CRM-006 | P1 | CRM mendukung komisi/referral berdasarkan rule. | Komisi hanya eligible setelah kondisi bisnis terpenuhi. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| campaigns, agents, leads, follow_ups, lead_stage_histories, referrals, commission_rules, commissions, handover_to_pmb_logs. | Person/user dari Core via snapshot/API; applicant status dari PMB via event/API; payment status komisi dari Finance bila diperlukan. |

## Integrasi

CRM ke PMB melalui event/API `lead_qualified`. PMB mengembalikan `applicant_ref_id`. CRM tidak mengubah applicant langsung.

## Reporting dan Output

Lead funnel, conversion rate, campaign performance, agent performance, follow-up aging, komisi referral.

## UAT Starter

1. Lead baru dibuat dari campaign aktif.

2. Lead qualified dikirim dua kali ke PMB dan hanya satu applicant terbentuk.

3. Agen mencoba melihat lead agen lain dan ditolak.

4. PMB down saat handover; CRM tetap menyimpan status pending.

## 13.4 Modul PMB

## Tujuan Bisnis

PMB mengelola applicant, biodata, dokumen, seleksi, daftar ulang, LoA, dan handover ke Akademik.

## Stakeholder Utama

Pendaftar, Admin PMB, Owner PMB, Admin Finance, Admin Akademik, Admin Assessment, Pimpinan.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Wave, applicant, biodata, dokumen, seleksi, daftar ulang, LoA, handover, invoice/payment status read model. | Payment resmi, clearance resmi, NIM, KRS, nilai final. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-PMB-001 | P0 | PMB harus mengelola gelombang dengan target periode masuk. | Wave tidak dapat dibuka tanpa `target_entry_period_ref_id`. |
| BRD-PMB-002 | P0 | Applicant dapat mengisi biodata dan upload dokumen. | Status kelengkapan dan verifikasi dokumen tercatat. |
| BRD-PMB-003 | P0 | PMB harus membaca status pembayaran dari Finance. | Admin PMB tidak dapat mengubah status paid langsung. |
| BRD-PMB-004 | P0 | LoA hanya diterbitkan setelah syarat terpenuhi. | Seleksi, daftar ulang, payment wajib valid. |
| BRD-PMB-005 | P0 | Handover ke Akademik harus idempotent. | Request berulang tidak membuat mahasiswa ganda. |
| BRD-PMB-006 | P0 | PMB menyimpan invoice/payment read model. | PMB tetap menampilkan status terakhir saat Finance down. |
| BRD-PMB-007 | P1 | PMB menerima result dari Assessment. | Hasil CBT dapat menjadi dasar seleksi. |
| BRD-PMB-008 | P1 | PMB menyimpan person/reference snapshot. | Data dasar tetap tampil saat Core/Referensi down. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| waves, applicants, applicant_biodata, applicant_program_choices, applicant_documents, applicant_invoice_statuses, selections, re_registrations, loa_documents, handover_logs. | Person/user Core, master Referensi, lead CRM, invoice/payment Finance, assessment result, student Academic. |

## Integrasi

PMB menerima lead dari CRM, meminta invoice ke Finance, menerima payment event, meminta/menautkan session Assessment, dan mengirim handover ke Academic.

## Reporting dan Output

Applicant per wave, kelengkapan dokumen, status seleksi, status pembayaran read model, LoA issued, handover pending/success/failed.

## UAT Starter

1. Wave tanpa target period ditolak.

2. Applicant upload dokumen dan admin verifikasi.

3. LoA tanpa payment valid ditolak.

4. Finance down; PMB menampilkan payment status terakhir dengan timestamp.

5. Handover dua kali tidak membuat student duplikat.

## 13.5 Modul Finance

## Tujuan Bisnis

Finance menjadi source of truth invoice, payment, callback, manual verification, receipt, clearance, cicilan, beasiswa, jurnal dasar, dan laporan keuangan.

## Stakeholder Utama

Admin Finance, Pendaftar, Mahasiswa, Admin PMB, Admin Akademik, Pimpinan, Auditor.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Invoice, invoice item, payment, callback, manual verification, receipt, clearance, installment, scholarship, journal entry, customer snapshot. | Biodata applicant final, NIM generation, KRS, final grade. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-FIN-001 | P0 | Finance harus mengelola invoice pendaftar/mahasiswa. | Invoice memiliki item, due date, status, dan audit. |
| BRD-FIN-002 | P0 | Finance menjadi sumber status pembayaran dan clearance. | Modul lain membaca payment/clearance dari Finance/API/event. |
| BRD-FIN-003 | P0 | Callback payment gateway idempotent. | Callback berulang tidak membuat payment/jurnal ganda. |
| BRD-FIN-004 | P0 | Manual verification harus audit-ready. | Actor, timestamp, bukti, status, reason tercatat. |
| BRD-FIN-005 | P0 | Clearance mengendalikan layanan akademik. | KRS/ujian/KHS/transkrip/wisuda dapat clear/blocked/conditional. |
| BRD-FIN-006 | P1 | Finance mendukung cicilan dan beasiswa. | Tagihan dapat disesuaikan sesuai policy dan audit. |
| BRD-FIN-007 | P1 | Finance publish event invoice/payment/clearance. | PMB/Academic/Portal memperbarui read model. |
| BRD-FIN-008 | P1 | Finance tetap dapat memproses existing invoice saat PMB/Academic down. | Customer snapshot cukup untuk transaksi existing. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| customer_snapshots, invoices, invoice_items, payments, payment_callbacks, manual_verifications, receipts, clearances, installment_plans, scholarships, journal_entries, journal_lines. | Applicant PMB, student Academic, person Core, payment component/method Referensi. |

## Integrasi

Finance menerima request invoice dari PMB/Academic, publish invoice/payment/clearance event, dan memberi API query clearance real-time bila dibutuhkan.

## Reporting dan Output

Invoice aging, payment completion, manual verification queue, clearance blocked list, receipt report, journal basic, scholarship/discount report.

## UAT Starter

1. Invoice dibuat untuk applicant PMB.

2. Callback valid membuat payment dan receipt.

3. Callback sama dikirim ulang tidak membuat payment ganda.

4. Academic membaca clearance snapshot dari event Finance.

5. Manual verification tanpa bukti/reason ditolak sesuai policy.

## 13.6 Modul Akademik

## Tujuan Bisnis

Akademik menjadi source of truth student, NIM, kurikulum, mata kuliah, kelas, KRS, nilai final, KHS, transkrip, yudisium, dan alumni.

## Stakeholder Utama

Admin Akademik Biro, Admin Akademik Prodi, Kaprodi, Mahasiswa, Dosen, Dosen PA, Admin Finance, Admin LMS, Pimpinan.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Student, NIM, curriculum, course, curriculum course, period setting, course offering, schedule, lecturer assignment, KRS, grade final, KHS, transcript, graduation, alumni, clearance snapshot. | Payment resmi, LMS material/progress, assessment attempt. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-ACA-001 | P0 | Academic harus membuat student dan NIM dari handover PMB valid. | Student tidak dibuat tanpa applicant ready dan syarat Finance. |
| BRD-ACA-002 | P0 | NIM generation harus unik dan idempotent. | Handover berulang tidak membuat NIM/mahasiswa ganda. |
| BRD-ACA-003 | P0 | Student wajib menyimpan entry period dan curriculum. | Histori kurikulum mahasiswa stabil. |
| BRD-ACA-004 | P0 | Academic mengelola kurikulum dan mata kuliah. | Kurikulum dapat versioned dan tidak merusak data lama. |
| BRD-ACA-005 | P0 | Course offering wajib berada pada periode akademik. | Kelas tanpa `academic_period_ref_id` ditolak. |
| BRD-ACA-006 | P0 | KRS harus memvalidasi clearance Finance. | KRS final ditolak jika clearance blocked. |
| BRD-ACA-007 | P0 | LMS enrollment berasal dari KRS approved. | Academic publish KRS/class event ke LMS. |
| BRD-ACA-008 | P0 | Final grade hanya milik Academic. | LMS/Assessment input tidak menimpa final grade otomatis. |
| BRD-ACA-009 | P1 | KHS/transkrip/wisuda dapat dibatasi clearance. | Layanan ditolak/conditional sesuai Finance policy. |
| BRD-ACA-010 | P1 | Academic menyimpan reference/person/clearance snapshot. | Operasi tertentu tetap berjalan saat dependency down. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| students, nim_sequences, curriculums, courses, curriculum_courses, course_offerings, course_schedules, course_lecturers, krs_headers, krs_items, grades, grade_inputs, khs, transcripts, graduations, alumni. | PMB applicant, Finance clearance, HRIS lecturer, Reference period/prodi, Core person/user, LMS/Assessment grade input. |

## Integrasi

Academic menerima handover PMB, menerima clearance Finance, membaca dosen HRIS, publish class/KRS event ke LMS, menerima grade input LMS/Assessment.

## Reporting dan Output

Mahasiswa aktif, NIM generated, kelas per periode, KRS status, dosen pengampu, nilai final, KHS, transkrip, alumni, clearance blocking report.

## UAT Starter

1. Generate NIM tanpa handover valid ditolak.

2. Handover sama dua kali tidak membuat student ganda.

3. KRS final blocked saat clearance blocked.

4. LMS grade input masuk sebagai input, bukan final grade.

5. Perubahan final grade wajib reason dan audit.

## 13.7 Modul HRIS/SDM

## Tujuan Bisnis

HRIS menjadi source of truth pegawai, dosen, homebase, jabatan, unit kerja, status aktif, BKD, performance, sertifikasi, dan payroll source.

## Stakeholder Utama

Admin SDM, Dosen, Pegawai, Admin Akademik, Admin LMS, Finance Payroll, Pimpinan.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Employee, lecturer, work unit, position, employment status, employment record, homebase history, BKD, performance, certification, payroll source. | Kelas akademik, KRS, LMS material, payroll processing final. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-HRIS-001 | P0 | HRIS menjadi sumber data dosen dan pegawai. | Academic/LMS tidak membuat biodata dosen sendiri. |
| BRD-HRIS-002 | P0 | HRIS mengelola status aktif dosen. | Dosen nonaktif tidak dapat diplot ke kelas baru. |
| BRD-HRIS-003 | P1 | HRIS mengelola homebase dan histori homebase. | Perubahan homebase tidak menghapus histori lama. |
| BRD-HRIS-004 | P1 | HRIS publish event dosen/pegawai update. | Academic/LMS memperbarui lecturer snapshot. |
| BRD-HRIS-005 | P1 | HRIS menyediakan data payroll source. | Finance dapat membaca payroll source sesuai scope. |
| BRD-HRIS-006 | P1 | HRIS tetap berjalan saat Academic/LMS down. | Update dosen tersimpan dan event dikirim saat dependency pulih. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| employees, lecturers, work_units, positions, employment_statuses, employment_records, homebase_histories, bkd_records, performance_records, certifications, payroll_sources. | Person Core, study program Reference. |

## Integrasi

HRIS publish lecturer/employee event ke Academic, LMS, Finance, Portal. Academic dan LMS memakai `lecturer_ref_id` + snapshot.

## Reporting dan Output

Daftar pegawai, daftar dosen aktif, homebase dosen, BKD per periode, payroll source, sertifikasi, status aktif/nonaktif.

## UAT Starter

1. Membuat dosen dari person Core.

2. Dosen nonaktif ditolak saat plotting kelas.

3. Perubahan homebase menyimpan histori.

4. LMS menerima update dosen dari event HRIS.

## 13.8 Modul LMS

## Tujuan Bisnis

LMS mengelola pembelajaran online berdasarkan kelas akademik dan enrollment KRS valid.

## Stakeholder Utama

Dosen, Mahasiswa, Admin LMS, Admin Akademik, Admin Assessment, Pimpinan.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| LMS class, enrollment dari KRS, session, material, assignment, submission, attendance, progress, quiz activity, grade input. | Kelas akademik source, KRS approval, final grade, transkrip. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-LMS-001 | P0 | LMS class harus berasal dari course offering Academic. | LMS tidak dapat membuat kelas akademik sendiri. |
| BRD-LMS-002 | P0 | LMS enrollment harus berasal dari KRS approved. | Mahasiswa tidak dapat self-enroll. |
| BRD-LMS-003 | P1 | LMS mengelola sesi, materi, tugas, presensi, progress. | Dosen hanya mengelola kelas yang diampu. |
| BRD-LMS-004 | P1 | LMS dapat membuat quiz activity melalui Assessment. | Quiz memiliki `assessment_session_ref_id`. |
| BRD-LMS-005 | P0 | LMS grade input tidak menimpa final grade. | Grade input dikirim ke Academic sebagai source input. |
| BRD-LMS-006 | P1 | LMS menyimpan class/student/lecturer snapshot. | Kelas tetap tampil dengan data terakhir saat Academic/HRIS down. |
| BRD-LMS-007 | P1 | LMS down tidak menghentikan KRS Academic. | Academic tetap dapat mengelola KRS walau LMS sync pending. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| lms_classes, lms_enrollments, lms_lecturers, sessions, materials, assignments, submissions, attendance, progress, quiz_activities, grade_inputs. | Academic class/KRS/student, HRIS lecturer, Assessment session/result, Core user. |

## Integrasi

LMS menerima class/KRS event dari Academic, lecturer event dari HRIS, membuat quiz ke Assessment, dan mengirim grade input ke Academic.

## Reporting dan Output

Kelas online aktif, enrollment LMS, materi tersedia, tugas/pengumpulan, presensi, progress mahasiswa, grade input status.

## UAT Starter

1. Academic membuat kelas dan LMS menerima class sync.

2. Mahasiswa tanpa KRS approved tidak muncul di kelas LMS.

3. Dosen hanya melihat kelas yang diampu.

4. Grade input LMS dikirim ke Academic dan tidak menjadi final otomatis.

## 13.9 Modul Assessment

## Tujuan Bisnis

Assessment menyediakan mesin assessment reusable untuk CBT PMB, quiz LMS, survey, dan scoring lain dengan bank soal berversi.

## Stakeholder Utama

Admin Assessment, Admin PMB, Admin LMS, Dosen, Pendaftar, Mahasiswa, Pimpinan.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Question bank, question version, assessment session, session question, participant snapshot, attempt, answer, scoring result, result export. | Status seleksi final PMB, final grade Academic, LMS material. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-ASM-001 | P0 | Assessment harus mendukung bank soal dan versioning. | Soal yang sudah dipakai tidak diedit langsung. |
| BRD-ASM-002 | P0 | Assessment reusable untuk CBT PMB, quiz LMS, survey. | Context menentukan consumer result. |
| BRD-ASM-003 | P0 | Attempt dan jawaban harus audit-ready. | Peserta, waktu, jawaban, score, status tercatat. |
| BRD-ASM-004 | P0 | Scoring result harus idempotent. | Result event berulang tidak membuat score duplikat. |
| BRD-ASM-005 | P1 | Assessment menyimpan participant snapshot. | Attempt tetap bisa ditelusuri saat PMB/LMS down. |
| BRD-ASM-006 | P1 | Assessment mengirim result ke context owner. | PMB/LMS menerima result sesuai session context. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| question_banks, questions, question_versions, assessment_sessions, session_questions, participant_snapshots, attempts, attempt_answers, scoring_results, result_exports. | Participant dari PMB/LMS/Core, context owner PMB/LMS, result consumer Academic bila relevan. |

## Integrasi

Assessment menerima request session dari PMB/LMS, menerima participant snapshot, publish result event, dan menyediakan result API.

## Reporting dan Output

Daftar bank soal, versi soal, session aktif, attempt completion, score distribution, export status.

## UAT Starter

1. Membuat soal versi pertama.

2. Soal sudah dipakai attempt tidak dapat diedit langsung.

3. CBT PMB menghasilkan result ke PMB.

4. Quiz LMS menghasilkan result ke LMS.

5. Event result duplikat tidak membuat result ganda.

## 13.10 Modul Portal

## Tujuan Bisnis

Portal menjadi presentation layer, dashboard role-based, notification center, preference, shortcut, dan activity log.

## Stakeholder Utama

Pendaftar, Mahasiswa, Dosen, Admin Modul, Pimpinan, Product Owner.

## Scope Bisnis

| In Scope | Out of Scope |
| --- | --- |
| Dashboard role-based, notifications, user preferences, shortcuts, activity logs, dashboard read models, user/role snapshots. | Source of truth transaksi PMB, Finance, Academic, HRIS, LMS, Assessment. |

## Kebutuhan Bisnis Modul

| ID | Prioritas | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| BRD-POR-001 | P1 | Portal menampilkan dashboard berbasis active role. | User hanya melihat widget sesuai role dan scope. |
| BRD-POR-002 | P1 | Portal menjadi notification center. | Notifikasi dikirim ke user sesuai event dan role. |
| BRD-POR-003 | P1 | Portal menyimpan preference dan shortcut user/role. | Shortcut mengikuti active role. |
| BRD-POR-004 | P1 | Portal tidak menjadi source transaksi bisnis. | Portal tidak mengubah payment/KRS/nilai langsung. |
| BRD-POR-005 | P1 | Dashboard memakai read model/summary API. | Widget memiliki `refreshed_at`. |
| BRD-POR-006 | P1 | Portal down tidak menghentikan modul sumber. | PMB/Finance/Academic/LMS tetap berjalan. |

## Data Ownership

| Data Dimiliki | Data Dibaca/Dikonsumsi |
| --- | --- |
| notification_events, notifications, user_preferences, shortcuts, activity_logs, dashboard_read_models, dashboard_widgets, user_snapshots, role_snapshots. | Event/status dari semua modul, user/role Core. |

## Integrasi

Portal menerima event dari semua modul untuk notification/read model, membaca Core role/user snapshot, dan menyediakan dashboard berbasis role.

## Reporting dan Output

Unread notification, user activity, dashboard KPI, role shortcut list, read model freshness.

## UAT Starter

1. Mahasiswa menerima notifikasi payment paid.

2. Dosen menerima notifikasi kelas LMS.

3. Pimpinan melihat dashboard read-only.

4. Portal down tidak memblokir transaksi Finance.

## 14. Kebutuhan Integrasi Lintas Modul

| ID | Prioritas | Integrasi | Kebutuhan Bisnis | Guardrail |
| --- | --- | --- | --- | --- |
| INT-001 | P0 | Core ke semua modul | Token, role, permission, scope. | Modul tidak membuat login sendiri. |
| INT-002 | P0 | Referensi ke semua modul | Master data dan status code. | Consumer memakai snapshot/cache/event. |
| INT-003 | P0 | CRM ke PMB | Lead qualified menjadi applicant. | Conversion idempotent. |
| INT-004 | P0 | PMB ke Finance | Request invoice dan baca payment status. | Payment status hanya dari Finance. |
| INT-005 | P0 | Finance ke PMB | Invoice/payment event. | PMB read model bukan source. |
| INT-006 | P0 | PMB ke Assessment | CBT selection session. | Result dikembalikan sesuai context. |
| INT-007 | P0 | PMB ke Academic | Handover applicant ready. | Student/NIM dibuat oleh Academic. |
| INT-008 | P0 | Finance ke Academic | Clearance event/API. | KRS/layanan akademik mengikuti clearance. |
| INT-009 | P0 | HRIS ke Academic/LMS | Lecturer active status dan homebase. | Dosen nonaktif tidak diplot. |
| INT-010 | P0 | Academic ke LMS | Class and KRS enrollment sync. | LMS tidak self-enroll. |
| INT-011 | P0 | LMS ke Academic | Grade input. | Final grade tetap milik Academic. |
| INT-012 | P0 | Assessment ke PMB/LMS | Result event/API. | Consumer memproses idempotent. |
| INT-013 | P1 | Semua modul ke Portal | Notification/dashboard event. | Portal tidak menjadi source transaksi. |
| INT-014 | P1 | Semua modul ke Reporting | Data warehouse/read model. | Tidak query langsung DB produksi lintas modul. |

## 15. Reporting dan Dashboard

| Kategori Laporan | Modul Sumber | Output Bisnis | Catatan |
| --- | --- | --- | --- |
| PMB Funnel | CRM + PMB | Lead, applicant, submitted, accepted, LoA, handover. | Dibangun via warehouse/read model. |
| Finance Collection | Finance | Invoice issued, paid, overdue, outstanding. | Source Finance. |
| Payment vs Applicant | PMB + Finance | Applicant paid/unpaid per wave/prodi. | PMB read model atau warehouse. |
| Student Intake | PMB + Academic | Applicant handover vs student created. | Reconciliation critical. |
| KRS Monitoring | Academic + Finance | KRS submitted/approved/finalized vs clearance. | Academic read model clearance. |
| LMS Engagement | LMS + Academic | Class active, attendance, progress, submission. | LMS source, Academic class context. |
| Assessment Result | Assessment + PMB/LMS | CBT/quiz completion and score. | Context-specific. |
| Lecturer Load | HRIS + Academic + LMS | Dosen aktif, kelas diampu, BKD. | HRIS source. |
| Executive KPI | Semua modul | Dashboard pimpinan. | Portal/warehouse, timestamp wajib. |

## 16. Non-Functional Business Requirement

| ID | Kategori | Kebutuhan Bisnis | Kriteria Penerimaan |
| --- | --- | --- | --- |
| NFBR-001 | Availability | Modul kritikal harus memiliki rencana availability. | Core, Finance, Academic memiliki HA/recovery plan. |
| NFBR-002 | Reliability | Event tidak hilang saat failure sementara. | Outbox pending dapat dipublish ulang. |
| NFBR-003 | Resilience | Modul tetap berjalan dalam degraded mode. | UI menampilkan data terakhir dan batasan operasi. |
| NFBR-004 | Performance | Query transaksi utama memakai database lokal/read model. | Tidak ada online direct cross-database join. |
| NFBR-005 | Security | RBAC dan data scope ditegakkan backend. | Akses lintas scope ditolak. |
| NFBR-006 | Auditability | Aksi sensitif audit-ready. | Actor, role, timestamp, reason, old/new value tercatat. |
| NFBR-007 | Data Integrity | External reference dapat direkonsiliasi. | Mismatch dapat dideteksi dan diperbaiki. |
| NFBR-008 | Observability | Request/event lintas modul dapat ditelusuri. | Correlation id dan event key tersedia. |
| NFBR-009 | Backup/Restore | Database per modul dapat dipulihkan terpisah. | Restore drill tersedia sebelum production. |
| NFBR-010 | Compliance | Data pribadi dan transaksi sensitif dilindungi. | Akses, audit, dan retention sesuai policy. |

## 17. Failure Scenario Business Requirement

| Scenario | Dampak yang Diterima | Modul yang Tetap Harus Jalan | Kebutuhan UI/Operasional |
| --- | --- | --- | --- |
| `finance_db` down | Invoice baru, payment verification, clearance real-time tertunda. | CRM, PMB biodata/dokumen, Academic baca clearance snapshot, LMS, Assessment non-Finance. | Tampilkan payment/clearance terakhir + timestamp. |
| `academic_db` down | Generate NIM, KRS, final grade, KHS, transkrip tertunda. | CRM, PMB pendaftaran, Finance payment existing, HRIS, Assessment CBT PMB. | Handover masuk pending/retry. |
| `lms_db` down | Pembelajaran online dan progress LMS tertunda. | Academic KRS/kelas, PMB, Finance, HRIS, Assessment non-LMS. | Academic tidak menunggu LMS untuk KRS. |
| `core_db` down | Login baru dan role switch terganggu. | Modul dapat memverifikasi token valid dengan cache terbatas. | Tampilkan keterbatasan login/role switch. |
| `portal_db` down | Dashboard dan notification center tidak tersedia. | Semua transaksi sumber tetap berjalan. | Event notifikasi pending. |
| Event broker down | Sinkronisasi read model tertunda. | Transaksi lokal tetap commit dan event tertahan di outbox. | Monitoring outbox backlog. |

## 18. Asumsi, Dependency, Risiko, dan Mitigasi

## 18.1 Asumsi

| ID | Asumsi |
| --- | --- |
| ASM-001 | Setiap modul dapat memiliki database fisik sendiri. |
| ASM-002 | Semua modul memakai UUID global sebagai primary/external reference. |
| ASM-003 | Event broker tersedia untuk integrasi asinkron. |
| ASM-004 | API Gateway/service discovery tersedia untuk integrasi sinkron. |
| ASM-005 | Core menyediakan token yang dapat diverifikasi lokal. |
| ASM-006 | Setiap modul memiliki owner bisnis dan technical owner. |
| ASM-007 | Data warehouse/read model tersedia untuk reporting lintas modul. |

## 18.2 Dependency

| Dependency | Keterangan | Risiko Jika Tidak Tersedia |
| --- | --- | --- |
| Core SSO/RBAC | Fondasi akses seluruh modul. | Modul membuat auth sendiri. |
| Reference master | Fondasi periode/prodi/status. | Transaksi tidak konsisten. |
| Event broker | Fondasi sync read model. | Integrasi menjadi terlalu sinkron dan rapuh. |
| API contract | Fondasi command/query lintas modul. | Integrasi tidak stabil. |
| Idempotency standard | Fondasi retry aman. | Data ganda. |
| Reconciliation job | Fondasi konsistensi snapshot. | Mismatch tidak terdeteksi. |
| Observability | Fondasi tracing dan audit teknis. | Incident sulit ditelusuri. |

## 18.3 Risiko dan Mitigasi

| ID | Risiko | Dampak | Mitigasi |
| --- | --- | --- | --- |
| RSK-001 | Database per modul masih berada dalam satu server fisik. | Failure server tetap menjatuhkan semua DB. | Pisahkan cluster/instance untuk modul kritikal. |
| RSK-002 | Event consumer tidak idempotent. | Data dobel. | Unique event_key dan inbox processing rule. |
| RSK-003 | Snapshot stale dipakai untuk keputusan kritis. | Keputusan bisnis salah. | Timestamp, stale policy, real-time API fallback. |
| RSK-004 | Reporting query langsung ke DB transaksi. | Beban tinggi dan dependency rapat. | Warehouse/read model. |
| RSK-005 | Handover applicant tidak terkunci. | Student/NIM ganda. | Idempotency, unique applicant_ref_id di Academic, NIM sequence lock. |
| RSK-006 | Payment callback dobel. | Payment/jurnal ganda. | Provider event id unique, idempotency, callback log. |
| RSK-007 | RBAC hanya di UI. | Kebocoran data. | Backend permission/scope test. |
| RSK-008 | Tahun Ajaran dan Tahun Kurikulum rancu. | Salah periode dan transkrip. | Validasi form, label UI, data model terpisah. |
| RSK-009 | Migration data lama kotor. | Constraint gagal dan data dobel. | Pre-flight cleansing dan dry-run. |
| RSK-010 | Core down terlalu lama. | Login dan akses terganggu. | HA Core, token cache, disaster recovery. |

## 19. Release Bisnis dan MVP

| Release | Fokus Bisnis | Modul | Acceptance Business Milestone |
| --- | --- | --- | --- |
| R0 Foundation | Identity, master data, event foundation, DB per modul, audit, idempotency. | Core, Referensi, Infrastructure | Login, RBAC, master period/prodi, outbox/inbox baseline siap. |
| R1 PMB Basic | Lead dan applicant registration. | CRM, PMB, Core, Referensi | Lead/applicant/biodata/dokumen berjalan. |
| R2 Finance Basic | Invoice/payment/receipt/clearance basic. | Finance, PMB | PMB dapat request invoice dan membaca payment status. |
| R3 Academic Onboarding | Handover dan generate NIM. | PMB, Academic, Finance | Applicant valid menjadi student/NIM tanpa duplikasi. |
| R4 KRS dan LMS Sync | KRS, class offering, LMS class/enrollment. | Academic, HRIS, LMS | KRS approved muncul di LMS. |
| R5 Assessment | CBT PMB dan quiz LMS. | Assessment, PMB, LMS | Result assessment terkirim ke context owner. |
| R6 Grade/KHS/Transcript | Final grade, KHS, transkrip. | Academic, LMS, Assessment, Finance | Grade final dan layanan akademik terkontrol clearance. |
| R7 Portal/Reporting | Dashboard, notification, KPI. | Portal, Reporting, semua modul | Dashboard role-based dengan sync timestamp. |
| R8 Hardening | Failure handling, reconciliation, migration, performance. | Semua modul | UAT failure scenario dan reconciliation lulus. |

## 20. Acceptance Criteria Global dan UAT Starter

## 20.1 Acceptance Criteria Global

1. Semua user login melalui Core.

2. User multi-role dapat memilih active role dan scope berubah sesuai role.

3. Tidak ada cross-database FK pada ERD fisik.

4. Tidak ada direct cross-database join pada transaksi online.

5. Lead qualified tidak membuat applicant duplikat saat retry.

6. Applicant handover tidak membuat student/NIM duplikat saat retry.

7. Payment callback duplikat tidak membuat payment/jurnal ganda.

8. PMB tidak dapat mengubah status paid langsung.

9. Academic tidak dapat finalize KRS jika clearance blocked.

10. LMS tidak dapat membuat kelas akademik sendiri.

11. LMS enrollment hanya berasal dari KRS approved.

12. LMS/Assessment grade input tidak menimpa final grade.

13. Portal tidak dapat mengubah transaksi sumber.

14. Finance down tidak menghentikan input biodata PMB.

15. LMS down tidak menghentikan KRS Academic.

16. Portal down tidak menghentikan transaksi sumber.

17. Read model/dashboard menampilkan timestamp sinkronisasi.

18. Reconciliation job dapat mendeteksi mismatch source vs snapshot.

## 20.2 UAT Starter Matrix

| ID | Scenario | Modul | Expected Result |
| --- | --- | --- | --- |
| UAT-G-001 | User login dan pilih active role. | Core | Menu/scope sesuai active role. |
| UAT-G-002 | Admin Prodi akses prodi lain via API. | Core/Academic | Ditolak. |
| UAT-G-003 | Lead qualified dikirim ulang. | CRM/PMB | Hanya satu applicant. |
| UAT-G-004 | Applicant bayar dan callback provider duplikat. | Finance/PMB | Payment satu, status PMB update via event. |
| UAT-G-005 | Applicant ready handover dikirim dua kali. | PMB/Academic | Hanya satu student dan NIM. |
| UAT-G-006 | Finance down saat applicant detail dibuka. | PMB | Status pembayaran terakhir tampil dengan timestamp. |
| UAT-G-007 | Clearance blocked saat mahasiswa final KRS. | Finance/Academic | KRS final ditolak. |
| UAT-G-008 | Academic class sync duplikat ke LMS. | Academic/LMS | LMS class tidak dobel. |
| UAT-G-009 | Dosen nonaktif diplot ke kelas. | HRIS/Academic | Ditolak. |
| UAT-G-010 | LMS grade input dikirim ke Academic. | LMS/Academic | Masuk grade input, bukan final grade otomatis. |
| UAT-G-011 | Soal digunakan attempt lalu diedit. | Assessment | Edit langsung ditolak, harus versi baru. |
| UAT-G-012 | Portal down saat Finance payment. | Finance/Portal | Payment tetap sukses, notifikasi pending. |
| UAT-G-013 | Event broker down saat transaksi lokal. | Semua modul | Transaksi commit, event pending di outbox. |

## 21. Dokumen Turunan

| Dokumen | Tujuan | Owner |
| --- | --- | --- |
| FSD Global dan Per Modul | Detail fungsi, form, flow, state machine, validation. | System Analyst |
| ERD/DBML per Database | Struktur tabel lokal, FK internal, external reference, index. | DBA |
| API Contract | Endpoint, request, response, error code, permission, idempotency. | Technical Lead/Backend Lead |
| Event Contract | Event name, payload, version, owner, consumer, retry, DLQ. | Technical Lead |
| RBAC Matrix | Role, permission, menu, endpoint, scope. | System Analyst/Core Owner |
| UAT Scenario | Test case bisnis normal, negatif, failure, retry. | QA/UAT Lead |
| Migration Mapping | Mapping data lama, cleansing, dry-run, rollback. | DBA/Owner Data |
| Reconciliation Spec | Aturan source vs snapshot/read model. | DBA/Technical Lead |
| Operations Runbook | Backup, restore, failover, monitoring, incident. | DevOps/SRE |

## 22. Approval

| Area | Owner | Status Review | Tanggal | Catatan |
| --- | --- | --- | --- | --- |
| Product Owner | - | Belum direview | - | - |
| Core | Admin BPPTI/Core Owner | Belum direview | - | - |
| Referensi | Admin Referensi/Admin Akademik | Belum direview | - | - |
| CRM | Owner CRM/Marketing PMB | Belum direview | - | - |
| PMB | Owner PMB/Admin PMB | Belum direview | - | - |
| Finance | Owner Finance/Admin Keuangan | Belum direview | - | - |
| Akademik | Biro Akademik/Prodi | Belum direview | - | - |
| HRIS/SDM | Owner HRIS/Admin SDM | Belum direview | - | - |
| LMS | Owner LMS/Admin LMS | Belum direview | - | - |
| Assessment | Owner Assessment/Admin Assessment | Belum direview | - | - |
| Portal | Owner Portal | Belum direview | - | - |
| DBA | DBA Lead | Belum direview | - | - |
| Technical Lead | Technical Lead | Belum direview | - | - |
| QA/UAT | QA/UAT Lead | Belum direview | - | - |
| DevOps/SRE | SRE Lead | Belum direview | - | - |

## 23. Penutup

BRD v1.1 ini menetapkan kebutuhan bisnis UNSIA setelah keputusan arsitektur database berubah menjadi physical database per modul. Fokusnya bukan hanya memisahkan database, tetapi memastikan proses bisnis tetap konsisten melalui source of truth tunggal, external reference, API/event contract, snapshot, read model, audit, idempotency, reconciliation, dan graceful degradation.

Dokumen ini harus divalidasi oleh Product Owner, Owner Modul, Technical Lead, DBA, QA/UAT, dan SRE sebelum diturunkan ke FSD, ERD/DBML, API Contract, Event Contract, RBAC Matrix, UAT, migration mapping, dan release plan.

## Appendix A - Event Contract Standard

Appendix ini melengkapi BRD UNSIA v1.1 sebagai standar kebutuhan event lintas modul. Tujuannya adalah memastikan proses bisnis yang berjalan melalui API, outbox/inbox, snapshot, read model, dan reconciliation memiliki kontrak event yang jelas, konsisten, teruji, dan dapat diaudit. Standar ini menjadi dasar turunan untuk FSD, API Contract, Event Contract Catalog, ERD/DBML, UAT, observability, dan release plan.

## A.1 Tujuan Bisnis Event Contract

| ID | Tujuan Bisnis | Kriteria Penerimaan |
| --- | --- | --- |
| EC-B-001 | Menjamin proses lintas modul tetap konsisten tanpa cross-database FK. | Relasi lintas modul diproses melalui event, external reference, snapshot, dan reconciliation. |
| EC-B-002 | Mencegah data ganda saat retry terjadi. | Semua event consumer wajib idempotent dan mencatat event_key. |
| EC-B-003 | Menjaga layanan tetap berjalan saat dependency down. | Consumer memakai snapshot/read model dengan informasi waktu sinkronisasi. |
| EC-B-004 | Memastikan audit bisnis tersedia. | Publish, consume, retry, DLQ, replay, dan reconciliation wajib tercatat. |
| EC-B-005 | Memastikan reporting lintas modul tidak membebani transaksi. | Dashboard memakai read model atau warehouse, bukan join langsung ke database produksi. |

## A.2 Struktur Wajib Event Identity

| Field | Deskripsi |
| --- | --- |
| event_name | Nama event dengan format domain.action, contoh finance.payment_paid. |
| event_version | Versi schema event, contoh v1. |
| event_key | Kunci unik global untuk duplicate handling dan idempotency. |
| event_type | DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, atau SNAPSHOT_EVENT. |
| publisher_service | Service yang menerbitkan event. |
| publisher_database | Database source of truth pemilik event. |
| aggregate_type | Objek bisnis utama, contoh payment, invoice, applicant, student, krs. |
| aggregate_id | ID objek bisnis utama pada database pemilik. |
| correlation_id | ID untuk melacak satu proses bisnis end-to-end. |
| causation_id | ID command atau event yang memicu event saat ini. |
| occurred_at | Waktu kejadian bisnis terjadi. |
| published_at | Waktu event berhasil dikirim ke broker. |

Contoh event envelope:

{
  "event_name": "finance.payment_paid",
  "event_version": "v1",
  "event_key": "finance.payment_paid:payment_id:8f2c:v1",
  "event_type": "INTEGRATION_EVENT",
  "publisher_service": "finance-service",
  "publisher_database": "finance_db",
  "aggregate_type": "payment",
  "aggregate_id": "8f2c",
  "correlation_id": "corr-20260619-001",
  "causation_id": "payment_callback:gateway:trx-9001",
  "occurred_at": "2026-06-19T10:15:00Z",
  "published_at": "2026-06-19T10:15:05Z"
}

## A.3 Trigger Bisnis dan Perubahan Status

| Komponen | Penjelasan |
| --- | --- |
| business_trigger | Kondisi bisnis yang menyebabkan event diterbitkan. |
| pre_condition | Status atau kondisi data sebelum event terjadi. |
| post_condition | Status atau kondisi data setelah event terjadi. |
| source_table | Tabel utama yang menjadi sumber perubahan. |
| state_transition | Perubahan status, contoh UNPAID menjadi PAID. |
| publish_timing | Waktu event boleh dipublish, umumnya setelah commit transaksi lokal. |

## A.4 Publisher, Consumer, dan Tujuan Konsumsi

| Event | Publisher | Consumer | Tujuan Konsumsi |
| --- | --- | --- | --- |
| core.person_updated | Core | CRM, PMB, Academic, HRIS, LMS, Assessment, Portal | Update person snapshot lokal. |
| pmb.applicant_created | PMB | Finance, Assessment, Portal, Reporting | Membuat konteks applicant dan dashboard. |
| finance.invoice_created | Finance | PMB, Academic, Portal, Reporting | Update status tagihan. |
| finance.payment_paid | Finance | PMB, Academic, Portal, Reporting | Update status bayar, clearance snapshot, notifikasi, dan laporan. |
| finance.clearance_changed | Finance | PMB, Academic, LMS, Portal | Mengatur kelayakan layanan akademik. |
| academic.student_created | Academic | PMB, LMS, Portal, Reporting | Menghubungkan applicant dengan student/NIM. |
| academic.krs_approved | Academic | LMS, Portal, Reporting | Membuat atau memperbarui enrollment LMS. |
| assessment.result_calculated | Assessment | PMB, LMS, Academic, Portal | Mengirim hasil assessment ke context owner. |

## A.5 Payload Schema dan Validation Rule

Setiap event wajib memiliki payload schema. Payload harus cukup untuk kebutuhan consumer, tetapi tidak membawa data pribadi berlebihan. Untuk data sensitif, gunakan external_ref_id dan snapshot minimum.

| Field | Required | Validation Rule |
| --- | --- | --- |
| payment_id | Ya | UUID dan harus ada pada finance_db.payments. |
| invoice_id | Ya | UUID dan harus ada pada finance_db.invoices. |
| invoice_no | Ya | String dan tidak kosong. |
| bill_to_type | Ya | APPLICANT, STUDENT, atau PERSON. |
| bill_to_ref_id | Ya | UUID external reference subject pembayaran. |
| paid_amount | Ya | Decimal lebih dari 0. |
| payment_method_code | Ya | Kode metode pembayaran. |
| paid_at | Ya | Datetime valid. |
| status_code | Ya | Harus PAID untuk finance.payment_paid. |

Contoh payload finance.payment_paid:

{
  "payment_id": "8f2c",
  "invoice_id": "inv-1001",
  "invoice_no": "INV/PMB/2026/0001",
  "bill_to_type": "APPLICANT",
  "bill_to_ref_id": "app-2201",
  "paid_amount": 2500000,
  "payment_method_code": "VA_BNI",
  "paid_at": "2026-06-19T10:15:00Z",
  "status_code": "PAID"
}

## A.6 Idempotency dan Duplicate Handling

| Area | Aturan |
| --- | --- |
| Event key | event_key harus unik dan deterministik. Format disarankan: {event_name}:{aggregate_id}:{event_version}. |
| Consumer inbox | Consumer wajib menyimpan event_key pada inbox_events. |
| Duplicate event | Jika event_key sudah pernah diproses, consumer tidak memproses ulang payload. |
| Retry command | Command/API yang memicu event wajib membawa idempotency_key. |
| Conflict payload | Jika event_key sama tetapi payload berbeda, consumer menolak event dan mencatat mismatch. |

## A.7 Ordering, Dependency, dan Causality

| Event | Wajib Setelah | Catatan |
| --- | --- | --- |
| finance.payment_paid | finance.invoice_created | Payment tidak valid tanpa invoice. |
| finance.clearance_changed | finance.payment_paid atau finance.clearance_reviewed | Clearance berubah berdasarkan status finance resmi. |
| academic.student_created | pmb.ready_for_academic atau pmb.handover_requested | Mahasiswa dibuat setelah applicant siap diserahkan ke Academic. |
| lms.enrollment_synced | academic.krs_approved | Enrollment LMS berasal dari KRS valid. |
| academic.final_grade_published | academic.grade_input_received | LMS/Assessment hanya memberi input, final grade tetap di Academic. |

## A.8 Retry Policy dan Dead Letter Queue

| Komponen | Aturan |
| --- | --- |
| Retry schedule | 1 menit, 5 menit, 15 menit, lalu exponential backoff. |
| Maksimal retry | 10 kali atau sesuai SLA modul. |
| Temporary failure | Event tetap berada pada retry queue. |
| Permanent failure | Event masuk DLQ setelah retry maksimum. |
| DLQ payload | Wajib menyimpan event_key, consumer, last_error, retry_count, failed_at, dan raw_payload. |
| Recovery | Event dari DLQ dapat direplay manual oleh role DevOps/SRE yang berwenang. |

Field teknis yang disarankan pada outbox/inbox:

retry_count
next_retry_at
last_error
locked_at
locked_by
processed_at
dead_letter_at
schema_version
correlation_id
causation_id

## A.9 Snapshot dan Read Model Impact

| Event | Consumer | Tabel Lokal yang Diupdate |
| --- | --- | --- |
| core.person_updated | PMB, Academic, LMS | person_snapshots |
| reference.study_program_updated | PMB, Academic, HRIS, LMS | reference_snapshots atau study_program_snapshots |
| finance.invoice_created | PMB, Academic, Portal | applicant_invoice_statuses, student_finance_snapshots, dashboard_read_models |
| finance.clearance_changed | Academic, LMS, Portal | student_clearance_snapshots, lms_clearance_snapshots, dashboard_read_models |
| academic.krs_approved | LMS, Portal | lms_enrollments, dashboard_read_models |
| assessment.result_calculated | PMB, LMS, Academic | assessment_result_snapshots atau grade_inputs |

Setiap snapshot/read model minimal memiliki source_event_key, source_event_name, source_updated_at, synced_at, dan sync_status.

## A.10 Reconciliation Rule

| Relasi Kritis | Reconciliation Rule |
| --- | --- |
| PMB invoice snapshot vs Finance invoice/payment | Cocokkan invoice_id, payment status, paid_amount, dan paid_at. |
| Academic clearance snapshot vs Finance clearance | Cocokkan subject_ref_id, service_code, academic_period_ref_id, dan status_code. |
| LMS enrollment vs Academic KRS | Cocokkan krs_item_ref_id, student_ref_id, course_offering_ref_id, dan enrollment status. |
| Academic grade input vs LMS/Assessment source | Cocokkan source_module, source_ref_id, score, weight, dan submitted_at. |
| Portal dashboard read model vs source events | Cocokkan refreshed_at, source status, dan payload aggregate. |

Jika snapshot berbeda dari source of truth, sistem membuat mismatch report. Jika dapat diperbaiki otomatis, correction job dijalankan. Jika perlu keputusan admin, status data menjadi pending_review.

## A.11 Security dan Authorization Event

| Aspek | Aturan |
| --- | --- |
| Publisher authorization | Hanya service owner domain yang boleh publish event domainnya. |
| Consumer authorization | Hanya consumer terdaftar yang boleh subscribe event tertentu. |
| PII minimization | Payload tidak boleh membawa data pribadi berlebihan. Gunakan ref_id dan snapshot minimum. |
| Service authentication | Publish dan consume event memakai service credential yang dikelola Core/Security. |
| Audit | Publish, consume, retry, DLQ, dan replay event wajib tercatat audit. |
| Replay control | Replay DLQ hanya boleh dilakukan role DevOps/SRE atau admin teknis yang diberi izin. |

## A.12 Error Contract

| Error Code | Keterangan | Tindakan |
| --- | --- | --- |
| EVENT_DUPLICATE | event_key sudah pernah diproses. | Abaikan payload dan catat sebagai duplicate. |
| EVENT_SCHEMA_INVALID | Payload tidak sesuai schema. | Tolak event dan catat error. |
| EVENT_VERSION_UNSUPPORTED | Consumer belum mendukung event_version. | Masukkan ke DLQ atau compatibility queue. |
| SOURCE_REF_NOT_FOUND | External reference tidak ditemukan. | Retry jika kemungkinan event pendahulu belum masuk. |
| SNAPSHOT_UPDATE_FAILED | Snapshot lokal gagal diperbarui. | Retry dan catat last_error. |
| RECONCILIATION_REQUIRED | Data source dan snapshot berbeda. | Buat mismatch report. |
| CONSUMER_TEMPORARY_FAILURE | Consumer gagal sementara. | Retry sesuai retry policy. |
| CONSUMER_PERMANENT_FAILURE | Consumer gagal permanen. | Masuk DLQ. |

## A.13 Observability dan Monitoring

| Metric | Tujuan |
| --- | --- |
| outbox_pending_count | Mengukur event yang belum dipublish. |
| inbox_pending_count | Mengukur event masuk yang belum diproses. |
| event_lag_seconds | Mengukur keterlambatan event dari occurred_at ke processed_at. |
| retry_count_by_event | Melihat event yang sering gagal. |
| dlq_count_by_consumer | Menemukan consumer bermasalah. |
| reconciliation_mismatch_count | Mengukur selisih source of truth dan snapshot/read model. |

## A.14 UAT Event Contract

| Skenario UAT | Expected Result |
| --- | --- |
| Event valid diterbitkan. | Event masuk outbox dan dipublish ke broker setelah transaksi lokal commit. |
| Event diterima consumer. | Consumer menyimpan event_key pada inbox_events dan memperbarui snapshot/read model. |
| Event yang sama dikirim dua kali. | Consumer hanya memproses satu kali. |
| Consumer down. | Event masuk retry queue dan diproses ulang saat consumer pulih. |
| Payload tidak valid. | Event ditolak dengan EVENT_SCHEMA_INVALID. |
| Event version tidak didukung. | Event masuk DLQ atau compatibility queue. |
| Snapshot berbeda dengan source. | Reconciliation job membuat mismatch report. |
| DLQ direplay. | Replay tercatat audit dan tidak membuat data duplikat. |

## A.15 Template Final Event Contract

Event Name        :
Event Version     :
Event Type        :
Publisher Service :
Publisher DB      :
Source Table      :
Aggregate Type    :
Aggregate ID      :
Business Trigger  :
Pre-condition     :
Post-condition    :
Consumer          :
Payload Schema    :
Validation Rule   :
Idempotency Rule  :
Ordering Rule     :
Retry Policy      :
DLQ Policy        :
Snapshot Impact   :
Reconciliation    :
Security Rule     :
Error Contract    :
Observability     :
UAT Scenario      :


# BAGIAN - SRS ERP UNSIA

_Sumber file: `SRS_ERP_UNSIA.docx`_

UNSIA

SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## ERP Pendidikan / SIAKAD Terintegrasi UNSIA

## Versi 1.0 Draft | 22 Juni 2026

Dokumen ini menyatukan kebutuhan sistem perangkat lunak untuk ERP Pendidikan / SIAKAD Terintegrasi UNSIA sebagai acuan implementasi developer, QA, DBA, DevOps, dan owner modul.

| Item | Isi |
| --- | --- |
| Dokumen | Software Requirements Specification (SRS) |
| Produk | ERP Pendidikan / SIAKAD Terintegrasi UNSIA |
| Versi | v1.0 Draft |
| Basis | PRD Global v6.5.1, BRD v1.1.1, FSD v1.0.1, OpenAPI v1.0.1, Event Contract, DBML, UAT/QA Test Plan, dan dokumen struktur repo. |
| Arsitektur | Modular distributed ERP dengan database fisik per modul, API/event-driven integration, outbox/inbox, idempotency, audit, RBAC, data scope, degraded mode, dan reconciliation. |
| Status | Draft untuk review Product Owner, Technical Lead, DBA, Security/DevOps, QA/UAT Lead, Backend Lead, Frontend Lead, dan Owner Modul. |

## Kontrol Dokumen

| Versi | Tanggal | Status | Catatan |
| --- | --- | --- | --- |
| v1.0 | 22 Juni 2026 | Draft | Penyusunan SRS awal berdasarkan baseline PRD, BRD, FSD, OpenAPI, Event Contract, DBML, UAT, dan rancangan multi-repo. |

## Daftar Approval

| Peran | Nama | Status | Tanggal | Catatan |
| --- | --- | --- | --- | --- |
| Product Owner |  | Belum disetujui |  |  |
| System Analyst |  | Drafted |  |  |
| Technical Lead |  | Belum direview |  |  |
| Backend Lead |  | Belum direview |  |  |
| Frontend Lead |  | Belum direview |  |  |
| DBA |  | Belum direview |  |  |
| Security/DevOps |  | Belum direview |  |  |
| QA/UAT Lead |  | Belum direview |  |  |
| Owner Core |  | Belum direview |  |  |
| Owner PMB |  | Belum direview |  |  |
| Owner Finance |  | Belum direview |  |  |
| Owner Akademik |  | Belum direview |  |  |

## Daftar Isi

Catatan: daftar isi dapat diperbarui otomatis di Microsoft Word melalui References > Update Table setelah dokumen dibuka.

1. Pendahuluan

2. Deskripsi Umum Sistem

3. Arsitektur dan Batasan Teknis

4. User Class dan Role

5. Kebutuhan Fungsional Global

6. Kebutuhan Fungsional Per Modul

7. External Interface Requirements

8. Data Requirements

9. Non-Functional Requirements

10. Security, Audit, dan Compliance

11. State Machine Requirements

12. Testing dan Acceptance Criteria

13. Deployment, Operasional, dan Release

14. Requirement Traceability Matrix

15. Lampiran

## 1. Pendahuluan

## 1.1 Tujuan Dokumen

SRS ini menetapkan kebutuhan perangkat lunak untuk ERP Pendidikan / SIAKAD Terintegrasi UNSIA. Dokumen ini menjadi acuan tunggal bagi tim developer, QA, DBA, DevOps/SRE, Product Owner, dan Owner Modul dalam merancang, membangun, menguji, merilis, dan mengoperasikan sistem.

SRS ini menerjemahkan kebutuhan produk, bisnis, fungsi, API, event, database, role/permission, dan UAT menjadi requirement yang dapat diimplementasikan dan diuji.

## 1.2 Ruang Lingkup Sistem

Sistem mencakup lifecycle kampus dari lead, applicant, pembayaran, mahasiswa aktif, KRS, LMS, assessment, nilai, KHS, transkrip, alumni, dashboard, notification, sampai reporting. Sistem terdiri dari modul Core, Referensi, CRM, PMB, Finance, Akademik, HRIS/SDM, LMS, Assessment, Portal, Integration Worker, dan Reporting/warehouse.

## 1.3 Definisi, Akronim, dan Istilah

| Istilah | Definisi |
| --- | --- |
| SRS | Software Requirements Specification, dokumen kebutuhan perangkat lunak. |
| ERP | Enterprise Resource Planning untuk mengintegrasikan proses operasional kampus. |
| SIAKAD | Sistem Informasi Akademik. |
| Source of Truth | Modul/domain yang menjadi pemilik data utama. |
| External Reference | ID lintas modul seperti person_ref_id, applicant_ref_id, student_ref_id, invoice_ref_id tanpa FK lintas database. |
| Snapshot/Read Model | Salinan ringkas data lintas modul untuk tampilan/operasi terbatas, bukan sumber kebenaran final. |
| Outbox/Inbox | Pola event-driven untuk publish dan consume event secara idempotent. |
| Idempotency | Kemampuan request/event diproses berulang tanpa menghasilkan data ganda. |
| DLQ | Dead Letter Queue untuk event yang gagal diproses setelah retry. |
| Degraded Mode | Mode operasi terbatas saat dependency modul lain down. |
| RBAC | Role-Based Access Control. |
| Data Scope | Batas data yang boleh diakses role tertentu. |

## 1.4 Referensi Dokumen

| Dokumen Referensi | Kegunaan dalam SRS |
| --- | --- |
| PRD Global UNSIA v6.5.1 | Menjadi dasar scope produk, arsitektur database modular, event-driven integration, dan NFR. |
| BRD UNSIA v1.1.1 | Menjadi dasar kebutuhan bisnis, source of truth, role stakeholder, dan aturan global. |
| FSD Per Modul v1.0.1 | Menjadi dasar fungsi per modul, UI standard, audit, event behavior, dan UAT starter. |
| OpenAPI/Swagger v1.0.1 | Menjadi dasar API contract, endpoint, header, security, dan response envelope. |
| UAT Scenario dan QA Test Plan v1.0.1 | Menjadi dasar test level, quality gate, defect severity, dan go/no-go rule. |
| DBML Global v1.0.1 | Menjadi dasar struktur database, outbox/inbox, idempotency, dan reconciliation table. |

## 1.5 Prioritas Requirement

| Kode Prioritas | Makna |
| --- | --- |
| P0 | Wajib untuk MVP/go-live terbatas. Tanpa ini proses utama tidak boleh dirilis. |
| P1 | Penting untuk stabilitas operasional dan release tahap berikutnya. |
| P2 | Enhancement atau optimasi setelah proses utama stabil. |

## 2. Deskripsi Umum Sistem

## 2.1 Perspektif Produk

ERP UNSIA adalah sistem kampus modular yang mengelola proses end-to-end dari peminat sampai alumni. Sistem tidak dibangun sebagai satu aplikasi monolitik dengan satu database utama, melainkan sebagai ekosistem service/modul dengan database fisik per modul. Integrasi lintas modul dilakukan melalui API, event, snapshot/read model, dan reconciliation.

## 2.2 Modul Sistem

| Modul | Fungsi Utama | Database |
| --- | --- | --- |
| Core | Identity, SSO, RBAC, permission, active role, service token, audit, idempotency, integration control. | core_db |
| Referensi | Master data lintas modul, prodi, tahun ajaran, periode akademik, status code, komponen pembayaran. | reference_db |
| CRM | Campaign, lead, agent, referral, follow-up, conversion, commission. | crm_db |
| PMB | Applicant, biodata, dokumen, seleksi, LoA, invoice request, handover akademik. | pmb_db |
| Finance | Invoice, invoice item, payment, callback, manual verification, receipt, clearance, beasiswa. | finance_db |
| Akademik | Student, NIM, kurikulum, mata kuliah, kelas, KRS, final grade, KHS, transkrip, alumni. | academic_db |
| HRIS/SDM | Employee, lecturer, homebase, unit kerja, jabatan, status aktif, BKD. | hris_db |
| LMS | Online class, enrollment, sesi, materi, tugas, presensi, progress, grade input. | lms_db |
| Assessment | Question bank, assessment session, attempt, answer, scoring, result publish. | assessment_db |
| Portal | Dashboard, notification, read marker, shortcut, preference, activity log, dashboard read model. | portal_db |

## 2.3 User Class

| User Class | Kebutuhan Utama |
| --- | --- |
| Pendaftar | Mendaftar, mengisi biodata, upload dokumen, melihat invoice, pembayaran, status, dan LoA. |
| Mahasiswa | Mengelola KRS, melihat tagihan, mengikuti LMS, melihat nilai, KHS, dan transkrip. |
| Dosen | Mengelola kelas LMS, materi, tugas, presensi, dan grade input. |
| Dosen PA | Menyetujui/menolak KRS mahasiswa bimbingan dan memberi catatan akademik. |
| Admin PMB | Mengelola pendaftar, dokumen, seleksi, LoA, dan handover. |
| Admin Finance | Mengelola invoice, payment, verifikasi, clearance, dan laporan keuangan. |
| Admin Akademik Biro | Mengelola mahasiswa, NIM, kurikulum, kelas, KRS, nilai, KHS, transkrip, alumni. |
| Kaprodi/Admin Prodi | Mengelola dan memonitor data akademik sesuai prodi. |
| Admin SDM | Mengelola pegawai, dosen, homebase, jabatan, dan status aktif. |
| Admin LMS | Mengelola kelas online, enrollment, dan sinkronisasi LMS. |
| Admin Assessment | Mengelola bank soal, sesi assessment, scoring, dan result publish. |
| Pimpinan | Melihat dashboard KPI dan laporan agregat. |
| Technical Admin/DevOps/SRE | Mengelola observability, service token, retry, DLQ, reconciliation, dan runbook. |

## 2.4 Asumsi dan Dependensi

Setiap modul memiliki database fisik atau instance/cluster terpisah minimal untuk modul kritikal.

Semua modul menggunakan Core sebagai identity dan access authority.

API dan event contract tersedia sebelum implementasi endpoint P0 dimulai.

Deployment awal dapat menggunakan Docker, Nginx, PostgreSQL, Redis, dan RabbitMQ/BullMQ.

Sistem pembayaran eksternal akan dihubungkan melalui provider callback yang wajib divalidasi signature-nya.

Reporting final lintas modul menggunakan read model/warehouse yang telah direkonsiliasi.

## 3. Arsitektur dan Batasan Teknis

## 3.1 Arsitektur Target

Sistem menggunakan modular distributed architecture dengan service per modul, database per modul, API/event-driven integration, outbox/inbox, idempotency, audit trail, degraded mode, dan reconciliation. Untuk pilihan stack full Next.js, setiap modul dapat dibuat sebagai Next.js/Node service terpisah dengan PostgreSQL masing-masing, sedangkan portal web dan integration worker dipisah.

## 3.2 Struktur Repo Target

unsia-core-service

unsia-reference-service

unsia-crm-service

unsia-pmb-service

unsia-finance-service

unsia-academic-service

unsia-hris-service

unsia-lms-service

unsia-assessment-service

unsia-portal-web

unsia-integration-worker

unsia-shared-contracts

unsia-infra

unsia-docs

## 3.3 Constraint Arsitektur

Tidak ada credential, password, atau session authority selain Core.

Tidak ada write langsung ke database modul lain.

Tidak ada cross-database foreign key.

Tidak ada direct cross-database join untuk transaksi online.

Relasi lintas modul wajib menggunakan external reference.

Setiap snapshot/read model wajib menyimpan source_module, source_event_key, synced_at/refreshed_at, dan reconciliation status bila relevan.

Payment callback, PMB handover, generate NIM, class sync, enrollment sync, grade sync, dan notification delivery wajib idempotent.

Final grade hanya dimiliki Academic.

Finance tetap source of truth untuk invoice, payment, dan clearance.

Portal tidak boleh menjadi source transaksi bisnis.

## 3.4 Technology Stack Rekomendasi

| Layer | Teknologi Rekomendasi |
| --- | --- |
| Frontend/Portal | Next.js, React, TypeScript, Tailwind CSS, Shadcn UI, TanStack Query |
| Service/API | Next.js Route Handler atau Node.js TypeScript service per modul |
| ORM/DB Access | Prisma atau Drizzle |
| Database | PostgreSQL per modul |
| Cache/Lock | Redis |
| Queue/Event | RabbitMQ atau BullMQ + Redis |
| Worker | Node.js TypeScript worker untuk outbox/inbox, retry, DLQ, reconciliation |
| Storage | MinIO/S3-compatible object storage |
| API Docs | OpenAPI/Swagger |
| Observability | Pino/Loki, Prometheus/Grafana, Sentry |
| Deployment | Docker, Nginx/API gateway, CI/CD GitHub Actions/GitLab CI |

## 4. User Role, Permission, dan Data Scope

## 4.1 Role Final

| Role Code | Nama Role | Data Scope Utama |
| --- | --- | --- |
| super_admin | Super Admin | Global |
| admin_bppti | Admin BPPTI | Global teknis sesuai assignment |
| technical_admin | Technical Admin | Technical scope |
| auditor | Auditor | Read-only audit |
| admin_referensi | Admin Referensi | Global referensi |
| admin_crm | Admin CRM/Marketing | CRM domain |
| agen_mitra | Agent/Mitra | Own lead/referral |
| pendaftar | Pendaftar | Self scope |
| admin_pmb | Admin PMB | PMB domain |
| admin_finance | Admin Finance | Finance domain |
| admin_akademik_biro | Admin Akademik Biro | Academic global |
| kaprodi | Kaprodi | study_program_id |
| admin_akademik_prodi | Admin Akademik Prodi | study_program_id |
| dosen | Dosen | Assigned class |
| dosen_pa | Dosen PA | Advisor scope |
| mahasiswa | Mahasiswa | Self scope |
| admin_sdm | Admin SDM/HRIS | HRIS domain |
| admin_lms | Admin LMS | LMS domain |
| admin_assessment | Admin Assessment | Assessment domain |
| pimpinan | Pimpinan | Read-only aggregate |
| service_account | Service Account | Service scope sesuai client |

## 4.2 Permission Naming

Permission menggunakan format module.resource.action, misalnya pmb.applicant.read, finance.payment.verify, academic.krs.approve, lms.grade_input.submit, integration.dlq.replay.

## 4.3 Authorization Flow

Request

-> Validate Authorization Bearer Token

-> Validate X-Application-Code

-> Validate X-Active-Role

-> Load Role Assignment

-> Check Permission

-> Resolve Data Scope

-> Validate Resource Scope

-> Process Request

-> Write Audit Log if sensitive action

-> Return Success/Error Envelope

## 5. Kebutuhan Fungsional Global

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-G-001 | P0 | Sistem harus menyediakan ERP/SIAKAD terintegrasi untuk lifecycle lead sampai alumni. | Data dapat ditelusuri dari CRM, PMB, Finance, Academic, LMS, Assessment, Portal, dan Reporting. |
| SRS-G-002 | P0 | Sistem harus memakai Core sebagai pusat identity dan access. | Semua modul menggunakan token/claim Core dan tidak memiliki credential table sendiri. |
| SRS-G-003 | P0 | Setiap modul harus memiliki database fisik sendiri. | Setiap modul dapat backup, restore, migration, dan recovery terpisah. |
| SRS-G-004 | P0 | Sistem tidak boleh memakai cross-database FK. | ERD fisik hanya memiliki FK internal database; relasi lintas modul memakai external reference. |
| SRS-G-005 | P0 | Sistem tidak boleh memakai direct cross-database join pada transaksi online. | UI transaksi membaca API/snapshot/read model, bukan join lintas database. |
| SRS-G-006 | P0 | Setiap modul harus memiliki outbox/inbox event. | Event dapat dipublish, diterima, diproses, diretry, dan ditelusuri. |
| SRS-G-007 | P0 | Setiap proses kritis harus idempotent. | Retry tidak membuat applicant, student, payment, class, enrollment, grade, atau notification duplikat. |
| SRS-G-008 | P0 | Source of truth per domain harus jelas. | Modul lain tidak mengubah data owner secara langsung. |
| SRS-G-009 | P0 | Sistem harus mendukung degraded mode saat dependency down. | Modul tidak terkait tetap berjalan dan UI menampilkan data terakhir atau pending_review. |
| SRS-G-010 | P1 | Reporting lintas modul harus memakai read model/warehouse. | Dashboard pimpinan tidak query langsung ke semua database transaksi. |
| SRS-G-011 | P1 | Reconciliation lintas modul harus tersedia. | Selisih source vs snapshot/read model dapat dideteksi, dipantau, dan diperbaiki. |
| SRS-G-012 | P1 | Setiap dashboard/read model harus menampilkan waktu sinkronisasi terakhir. | User mengetahui freshness data melalui synced_at/refreshed_at. |

## 6. Kebutuhan Fungsional Per Modul

## 6.1 Modul Core

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-CORE-001 | P0 | Sistem harus menyediakan login dan session user. | User aktif dapat login dan menerima access token/refresh token. |
| SRS-CORE-002 | P0 | Sistem harus menyediakan active role selector. | User multi-role dapat memilih active role dan menu/permission berubah sesuai role. |
| SRS-CORE-003 | P0 | Sistem harus mengelola role, permission, data scope, dan application launcher. | Role/permission/scope dapat diassign dan ditegakkan backend. |
| SRS-CORE-004 | P0 | Sistem harus menyediakan service token untuk service-to-service call. | Service token dapat dibuat, dirotasi, dicabut, dan divalidasi. |
| SRS-CORE-005 | P1 | Sistem harus menyediakan impersonation dengan reason. | Impersonation terbatas durasi, wajib reason, dan semua aksi audit. |

## 6.2 Modul Referensi

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-REF-001 | P0 | Sistem harus mengelola prodi sebagai master data. | Prodi aktif dapat dipakai PMB, Academic, HRIS, dan Portal. |
| SRS-REF-002 | P0 | Sistem harus mengelola Tahun Ajaran dan Periode Akademik. | Periode berada di bawah tahun ajaran dan dapat dipakai PMB, Finance, Academic, LMS. |
| SRS-REF-003 | P0 | Sistem harus mengelola status code lintas modul. | Status transaksi tidak menggunakan string bebas. |
| SRS-REF-004 | P1 | Sistem harus publish event perubahan master data. | Consumer dapat memperbarui reference snapshot. |

## 6.3 Modul CRM

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-CRM-001 | P0 | Sistem harus mengelola campaign, lead, agent, referral, dan follow-up. | Admin CRM dapat mengelola lead; agent hanya lead miliknya. |
| SRS-CRM-002 | P0 | Sistem harus melakukan convert qualified lead ke applicant PMB. | Convert menggunakan PMB API dan idempotent. |
| SRS-CRM-003 | P1 | Sistem harus menyediakan dashboard funnel dan conversion. | Conversion rate dapat dilihat sesuai role/scope. |

## 6.4 Modul PMB

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-PMB-001 | P0 | Sistem harus membuat dan mengelola applicant. | Applicant memiliki biodata, status, prodi tujuan, dan periode masuk. |
| SRS-PMB-002 | P0 | Sistem harus menyediakan upload dan verifikasi dokumen. | Dokumen dapat verified/rejected dengan reason. |
| SRS-PMB-003 | P0 | Sistem harus request invoice ke Finance. | PMB tidak membuat invoice lokal; Finance menjadi source of truth. |
| SRS-PMB-004 | P0 | Sistem harus menerbitkan LoA. | LoA hanya terbit setelah dokumen dan payment policy valid. |
| SRS-PMB-005 | P0 | Sistem harus handover applicant ke Academic. | Handover idempotent dan tidak membuat student/NIM ganda. |

## 6.5 Modul Finance

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-FIN-001 | P0 | Sistem harus membuat invoice dan invoice item. | Invoice memiliki bill_to_ref_id dan status resmi Finance. |
| SRS-FIN-002 | P0 | Sistem harus memproses payment callback. | Signature valid, provider_event_id unique, duplicate callback aman. |
| SRS-FIN-003 | P0 | Sistem harus menyediakan manual payment verification. | Admin Finance dapat verifikasi bukti pembayaran dengan audit. |
| SRS-FIN-004 | P0 | Sistem harus mengelola clearance. | Clearance resmi berasal dari Finance dan dapat dibaca Academic/PMB/LMS/Portal. |

## 6.6 Modul Akademik

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-ACD-001 | P0 | Sistem harus generate student dan NIM dari applicant valid. | applicant_ref_id unique dan NIM unique. |
| SRS-ACD-002 | P0 | Sistem harus mengelola kurikulum, mata kuliah, dan kelas. | Kelas menjadi source untuk LMS class sync. |
| SRS-ACD-003 | P0 | Sistem harus mengelola KRS dan approval Dosen PA. | KRS mematuhi periode aktif dan clearance policy. |
| SRS-ACD-004 | P0 | Sistem harus mengelola source grade dan final grade. | LMS/Assessment hanya input; final grade milik Academic. |
| SRS-ACD-005 | P1 | Sistem harus menghasilkan KHS, transkrip, yudisium, dan alumni. | Mahasiswa dapat melihat/download dokumen sesuai self scope. |

## 6.7 Modul HRIS/SDM

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-HRIS-001 | P0 | Sistem harus mengelola employee dan lecturer. | Dosen aktif dapat dibaca Academic dan LMS. |
| SRS-HRIS-002 | P0 | Sistem harus mengelola homebase, unit kerja, jabatan, dan status aktif. | Dosen nonaktif tidak boleh diplot ke kelas baru. |
| SRS-HRIS-003 | P1 | Sistem harus publish event perubahan status dosen. | Academic dan LMS memperbarui lecturer snapshot. |

## 6.8 Modul LMS

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-LMS-001 | P0 | Sistem harus sync class dari Academic. | Duplicate class sync tidak membuat kelas ganda. |
| SRS-LMS-002 | P0 | Sistem harus sync enrollment dari KRS approved. | Enrollment LMS berasal dari KRS valid dan idempotent. |
| SRS-LMS-003 | P0 | Sistem harus mengelola sesi, materi, tugas, presensi, progress. | Dosen assigned dapat mengelola kelas; mahasiswa enrolled dapat mengikuti. |
| SRS-LMS-004 | P0 | Sistem harus mengirim grade input ke Academic. | Grade sync idempotent dan tidak menimpa final grade. |

## 6.9 Modul Assessment

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-ASM-001 | P0 | Sistem harus mengelola question bank dan versioning soal. | Soal yang sudah dipakai attempt tidak diedit langsung. |
| SRS-ASM-002 | P0 | Sistem harus mengelola assessment session, participant, attempt, answer, dan scoring. | Attempt submitted bersifat immutable. |
| SRS-ASM-003 | P0 | Sistem harus publish result ke context owner. | Result publish idempotent dan hanya menjadi input bagi PMB/LMS/Academic. |

## 6.10 Modul Portal

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-POR-001 | P0 | Sistem harus menyediakan dashboard role-based. | Dashboard mengikuti active role dan menampilkan refreshed_at. |
| SRS-POR-002 | P0 | Sistem harus menyediakan notification center. | Notification idempotent dan user hanya melihat notifikasi miliknya. |
| SRS-POR-003 | P1 | Sistem harus menyediakan executive dashboard agregat. | Pimpinan hanya read-only aggregate dan tidak dapat mengubah transaksi. |

## 6.11 Modul Integration Worker

| ID | Prioritas | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| SRS-INT-001 | P0 | Sistem harus publish outbox event setelah transaksi lokal commit. | Outbox status berubah menjadi published dan traceable. |
| SRS-INT-002 | P0 | Sistem harus consume event dengan inbox idempotent. | event_key diproses satu kali dan duplicate ditandai ignored. |
| SRS-INT-003 | P0 | Sistem harus menyediakan retry, DLQ, dan replay. | Replay wajib reason dan audit, tidak membuat data duplikat. |
| SRS-INT-004 | P1 | Sistem harus menjalankan reconciliation source vs snapshot. | Mismatch dapat ditampilkan, dikoreksi, diabaikan dengan reason, atau pending_review. |

## 7. External Interface Requirements

## 7.1 User Interface Requirements

| Area UI | Requirement |
| --- | --- |
| List Page | Harus mendukung pagination, sorting, search, filter, loading state, empty state, dan export jika role diizinkan. |
| Form Page | Harus menampilkan mandatory marker, validation message spesifik, confirmation untuk aksi sensitif, dan save draft jika proses panjang. |
| Detail Page | Harus menampilkan ringkasan data, status, histori perubahan, related records, dan action button sesuai permission. |
| Snapshot Page | Harus menampilkan source_module, synced_at/refreshed_at, dan label data tidak real-time jika stale. |
| Error State | Harus menampilkan pesan user-friendly dan trace_id untuk support teknis. |
| Degraded Mode UI | Harus menampilkan status dependency dan membatasi aksi berisiko menjadi read-only atau pending_review. |

## 7.2 API Interface Requirements

Authorization: Bearer <access_token>

X-Application-Code: <application_code>

X-Active-Role: <role_code>

X-Correlation-Id: <uuid>

Idempotency-Key: <unique_business_key> # for critical commands

Semua response sukses dan error wajib memakai envelope standar. Endpoint protected harus menolak request tanpa token, active role, permission, atau scope yang valid.

### 7.3 Success Envelope

{

"success": true,

"message": "Request processed successfully",

"data": {},

"meta": {

"trace_id": "uuid",

"correlation_id": "uuid",

"timestamp": "2026-06-22T10:00:00+07:00",

"api_version": "v1"

}

}

### 7.4 Error Envelope

{

"success": false,

"error": {

"code": "FORBIDDEN_SCOPE",

"message": "Anda tidak memiliki akses ke data ini.",

"details": {}

},

"meta": {

"trace_id": "uuid",

"correlation_id": "uuid",

"timestamp": "2026-06-22T10:00:00+07:00",

"api_version": "v1"

}

}

## 7.5 Integration/Event Interface Requirements

| Requirement | Acceptance Criteria |
| --- | --- |
| Setiap event penting harus memiliki event_name, event_version, event_key, publisher, consumer, aggregate_id, correlation_id, causation_id, occurred_at, dan payload. | Event contract test dapat memvalidasi schema dan event identity. |
| Outbox event hanya dipublish setelah transaksi lokal commit. | Rollback transaksi tidak menghasilkan event published. |
| Consumer wajib mencatat event_key di inbox. | Duplicate event diproses satu kali dan ditandai ignored. |
| Event gagal sementara masuk retry queue. | Retry_count, next_retry_at, dan last_error tercatat. |
| Event gagal permanen masuk DLQ. | DLQ dapat direplay dengan reason dan audit. |
| Reconciliation mismatch harus tersedia. | Mismatch source vs snapshot muncul di monitor dan memiliki status open/corrected/ignored/pending_review. |

## 8. Data Requirements

## 8.1 Source of Truth

| Domain Data | Source of Truth | Consumer |
| --- | --- | --- |
| Person/user/role/permission | Core | Semua modul |
| Master data prodi/periode/status | Referensi | PMB, Finance, Academic, HRIS, LMS, Assessment, Portal |
| Lead/peminat | CRM | PMB, Portal, Reporting |
| Applicant | PMB | CRM, Finance, Academic, Assessment, Portal |
| Invoice/payment/clearance | Finance | PMB, Academic, LMS, Portal, Reporting |
| Student/KRS/final grade | Academic | Finance, LMS, Assessment, Portal, Reporting |
| Dosen/pegawai | HRIS | Academic, LMS, Portal |
| Kelas online/progress | LMS | Academic, Portal, Reporting |
| Attempt/scoring | Assessment | PMB, LMS, Academic, Portal |
| Notification/preference | Portal | User dan modul sumber |

## 8.2 External Reference Standard

| Field | Modul Penyimpan | Mengarah ke Source |
| --- | --- | --- |
| person_ref_id | PMB, HRIS, Academic, LMS, Portal | Core |
| user_ref_id | Portal, audit lokal | Core |
| study_program_ref_id | PMB, Academic, HRIS | Referensi |
| academic_period_ref_id | PMB, Finance, Academic, LMS | Referensi |
| lead_ref_id | PMB | CRM |
| applicant_ref_id | Finance, Academic | PMB |
| invoice_ref_id | PMB, Portal | Finance |
| student_ref_id | Finance, LMS, Portal | Academic |
| lecturer_ref_id | Academic, LMS | HRIS |
| academic_class_ref_id | LMS | Academic |
| assessment_session_ref_id | PMB, LMS, Academic | Assessment |

## 8.3 Tabel Teknis Wajib per Database Modul

audit_logs

idempotency_keys

outbox_events

inbox_events

reconciliation_mismatch_logs

Core dapat memiliki tambahan event_contracts, event_consumers, event_replay_logs, integration_event_logs, service_clients, roles, permissions, user_role_assignments, dan active_role_sessions.

## 9. Non-Functional Requirements

| ID | Kategori | Requirement | Acceptance Criteria |
| --- | --- | --- | --- |
| NFR-001 | Availability | Setiap modul memiliki health check aplikasi, database, event publisher, event consumer, dan dependency eksternal. | Status health dapat dilihat DevOps dan admin teknis. |
| NFR-002 | Security | Endpoint protected wajib validasi token, active role, permission, dan data scope. | Direct URL/API access tanpa hak ditolak. |
| NFR-003 | Reliability | Retry integrasi tidak boleh membuat record duplikat. | Idempotency dan unique business key terbukti pada test. |
| NFR-004 | Observability | Setiap request lintas modul membawa correlation_id. | Trace dapat mengikuti flow PMB invoice hingga Finance payment dan Portal notification. |
| NFR-005 | Event Observability | Metric event_lag_seconds, outbox_pending_count, inbox_pending_count, retry_count_by_event, dlq_count_by_consumer, reconciliation_mismatch_count tersedia. | Dashboard observability tersedia. |
| NFR-006 | Performance | Query transaksi hanya memakai database lokal modul. | Tidak ada direct OLTP query ke DB modul lain. |
| NFR-007 | Backup/Restore | Backup per database modul dan restore diuji berkala. | Restore test menghasilkan bukti dan waktu pemulihan. |
| NFR-008 | Accessibility | Main flow mendukung keyboard navigation, label jelas, validation message spesifik, dan responsive layout. | QA aksesibilitas main flow pass. |
| NFR-009 | Auditability | Aksi sensitif, retry, replay, DLQ, dan reconciliation memiliki audit evidence. | Audit log dapat ditelusuri berdasarkan actor/system, timestamp, trace_id/correlation_id. |

## 10. Security, Audit, dan Compliance

## 10.1 Security Requirements

Semua endpoint protected wajib menggunakan Bearer Token dari Core.

Setiap request protected wajib membawa X-Application-Code, X-Active-Role, dan X-Correlation-Id.

Service-to-service call wajib menggunakan service token resmi.

Payment callback wajib validasi provider signature.

Sensitive data pada log, event log, dan export wajib dimasking sesuai permission.

Service credential hanya dapat mengakses database modul sendiri.

Secret management dan rotasi credential wajib tersedia sebelum production.

## 10.2 Audit Requirements

| Aksi | Audit Wajib |
| --- | --- |
| Login/logout dan switch active role | actor, role, session, IP, user agent, timestamp |
| Assign role/permission/scope | old value, new value, actor, reason bila sensitif |
| Verify/reject dokumen PMB | status lama/baru, reason rejection, actor |
| Issue LoA dan handover | applicant_id, student_ref_id jika ada, idempotency_key, correlation_id |
| Payment callback/manual verification | provider_event_id, invoice_ref_id, amount, signature status, actor/system |
| Generate NIM | applicant_ref_id, student_id, nim, actor/system |
| Approve/reject KRS | krs_id, actor dosen PA, status lama/baru, reason |
| Finalize/correct grade | old grade, new grade, reason, actor |
| Replay DLQ dan reconciliation resolve | reason, payload hash, event_key, actor/system |

## 11. State Machine Requirements

Setiap perubahan status harus mengikuti allowed transition, actor yang sah, guard condition, postcondition, audit, dan error code konsisten. Invalid transition harus ditolak dengan STATE_TRANSITION_INVALID atau BUSINESS_RULE_VIOLATION.

## 11.1 Applicant State Machine

DRAFT

-> SUBMITTED

-> DOCUMENT_VERIFIED

-> ACCEPTED

-> LOA_ISSUED

-> HANDED_OVER

## 11.2 Invoice/Payment State Machine

INVOICE_DRAFT

-> ISSUED

-> PARTIALLY_PAID

-> PAID

-> CANCELLED/EXPIRED

PAYMENT_RECEIVED

-> VERIFIED

-> REJECTED/REVERSED

## 11.3 KRS State Machine

DRAFT

-> SUBMITTED

-> APPROVED

-> REJECTED

-> FINALIZED

-> CANCELLED

## 11.4 Assessment Attempt State Machine

NOT_STARTED

-> IN_PROGRESS

-> SUBMITTED

-> SCORED

-> RESULT_PUBLISHED

## 11.5 Event Processing State Machine

PENDING

-> PUBLISHED

-> PROCESSED

-> RETRYING

-> FAILED

-> DLQ

-> REPLAYED

-> IGNORED_DUPLICATE

## 12. Testing dan Acceptance Criteria

## 12.1 Test Level dan Quality Gate

| Test Level | Tujuan | Exit Criteria |
| --- | --- | --- |
| Requirement Review | Memastikan requirement tidak ambigu sebelum development/test. | Tidak ada ambiguitas P0 dan semua P0 punya acceptance criteria. |
| Functional Test | Memastikan fungsi, form, list, action, validasi, output, audit berjalan sesuai FSD. | Seluruh P0 pass dan P1 mayor pass atau workaround disetujui. |
| API Contract Test | Memastikan endpoint, header, payload, response envelope, error envelope, security scheme konsisten. | Endpoint P0 pass, error code konsisten, trace_id/correlation_id tersedia. |
| Integration Test | Memastikan komunikasi lintas modul berjalan dengan service token, event key, retry, dan audit. | Tidak ada duplicate record, event retry aman, integration log tersedia. |
| RBAC/Scope Test | Memastikan role, permission, endpoint, dan data scope ditegakkan backend. | Tidak ada unauthorized read/write dan direct URL/API ditolak. |
| State Machine Test | Memastikan status bergerak sesuai transition, guard, actor, audit, error. | Allowed transition pass, invalid transition ditolak. |
| Migration Validation | Memastikan schema, seed, FK internal, unique index, rollback aman. | Tidak ada blocking migration defect. |
| Regression/Smoke | Memastikan perubahan baru tidak merusak critical path. | Smoke P0 pass sebelum release candidate. |
| Event Contract Test | Memastikan event identity, schema, outbox/inbox, retry, DLQ, reconciliation sesuai kontrak. | Duplicate event aman, retry tidak membuat data ganda, DLQ replay audit-ready. |

## 12.2 Critical UAT Scenario

| ID | Scenario | Expected Result |
| --- | --- | --- |
| UAT-001 | User login dan memilih active role. | Menu, permission, dan scope mengikuti active role. |
| UAT-002 | Admin Prodi A membuka data Prodi B. | Ditolak oleh backend. |
| UAT-003 | Lead dikonversi dua kali menjadi applicant. | Hanya satu applicant terbentuk. |
| UAT-004 | Payment callback provider dikirim dua kali. | Payment tidak dobel dan response idempotent. |
| UAT-005 | Applicant handover dua kali ke Academic. | Student/NIM tidak dobel. |
| UAT-006 | Finance down saat PMB input biodata. | PMB tetap berjalan untuk biodata/dokumen dan status bayar memakai snapshot/degraded label. |
| UAT-007 | Mahasiswa dengan clearance blocked submit KRS final. | KRS ditolak/pending sesuai policy. |
| UAT-008 | Academic publish krs_approved dua kali. | LMS enrollment tidak dobel. |
| UAT-009 | LMS mengirim grade input duplicate. | Academic tidak membuat grade input ganda. |
| UAT-010 | Event consumer down lalu pulih. | Event retry dan diproses setelah consumer pulih. |
| UAT-011 | DLQ replay dilakukan. | Replay audit-ready dan tidak membuat duplicate record. |
| UAT-012 | Snapshot stale. | UI menampilkan synced_at/refreshed_at dan label freshness. |

## 12.3 Go/No-Go Criteria

Seluruh P0 UAT dan SIT pass.

Tidak ada defect Sev-1 dan Sev-2 terbuka.

RBAC/scope test pass.

Migration dry-run pass dan rollback rehearsal aman.

Smoke test pass sebelum release candidate.

Sign-off Product Owner, QA/UAT Lead, Technical Lead, DBA, dan Owner Modul terkait lengkap.

Release ditahan jika ada duplikasi payment, duplikasi student/NIM, kebocoran data lintas scope, bypass state machine, migration failure tanpa rollback aman, atau proses akademik/keuangan P0 tidak berjalan.

## 13. Deployment, Operasional, dan Release

## 13.1 Deployment Environment

| Environment | Tujuan |
| --- | --- |
| Local Development | Development per repo/modul menggunakan Docker Compose lokal. |
| QA | Functional test, API contract test, RBAC/scope test, state machine test. |
| Staging | SIT, UAT, migration rehearsal, smoke, integration event test. |
| Production | Pilot/go-live bertahap dengan monitoring dan rollback plan. |

## 13.2 Release Bertahap

| Release | Scope |
| --- | --- |
| Release 0 - Foundation | Infra, shared contracts, Core Auth/RBAC, Reference master, audit, idempotency, outbox/inbox baseline. |
| Release 1 - PMB & Finance MVP | Applicant, document, request invoice, payment callback/manual verification, clearance, LoA. |
| Release 2 - Academic MVP | Handover, generate student/NIM, curriculum, class, KRS, KHS basic. |
| Release 3 - LMS & Assessment | Class sync, enrollment, LMS activity, grade input, assessment session/attempt/scoring/result. |
| Release 4 - Portal & Dashboard | Portal multi-role, notification center, executive dashboard, activity log. |
| Release 5 - Hardening & Reporting | Reconciliation, warehouse/read model, observability, backup/restore rehearsal, performance tuning. |

## 13.3 Operational Requirements

Setiap service memiliki health endpoint.

Setiap database memiliki backup dan restore runbook.

Setiap event consumer memiliki metric lag, retry count, DLQ count.

Setiap incident integration memiliki correlation_id untuk tracing.

Secret dan service token harus dirotasi sesuai policy.

Rollback plan tersedia per service dan per database migration.

## 14. Requirement Traceability Matrix

| Requirement Area | Source Basis | Test Basis |
| --- | --- | --- |
| Module boundary dan database per modul | PRD, BRD, DBML | Migration validation, integration test, degraded mode test |
| Role, permission, dan data scope | FSD, RBAC Matrix, OpenAPI | RBAC/scope test, direct API access test |
| API contract | OpenAPI, FSD | API contract test, integration test |
| Event contract dan outbox/inbox | PRD, BRD, FSD Appendix Event, UAT Appendix | Event contract test, duplicate event test, retry/DLQ test |
| State machine | FSD, UAT | State machine test dan negative transition test |
| Audit dan idempotency | BRD, FSD, OpenAPI, UAT | Audit evidence test, duplicate request test |
| Degraded mode dan reconciliation | PRD, BRD, FSD, UAT | Partial outage test dan mismatch reconciliation test |
| Release readiness | UAT/QA Test Plan | Go/no-go checklist, smoke test, sign-off |

## 15. Lampiran

## 15.1 Endpoint P0

| Modul | Endpoint/Fungsi P0 |
| --- | --- |
| Core | Login, refresh token, auth me, switch role, application launcher, role/permission management. |
| Referensi | Study programs, academic years, academic periods, status code, payment components. |
| CRM | Lead create/read/update, follow-up, convert lead to applicant. |
| PMB | Applicant create/read/update, submit, document upload/verify/reject, request invoice, issue LoA, handover. |
| Finance | Invoice create/read, payment callback, manual verification, clearance read/update. |
| Academic | Generate student/NIM, student read, class create/read, KRS submit/approve/reject, grade import/finalize. |
| HRIS | Lecturer active read, lecturer status change. |
| LMS | Class sync, enrollment sync, session/material/task/attendance, grade sync. |
| Assessment | Session create, attempt start/submit, scoring, result publish. |
| Portal | Dashboard role-based, notification read/mark-read, preference/shortcut. |
| Integration | Event catalog, outbox monitoring, inbox monitoring, DLQ replay, reconciliation mismatch. |

## 15.2 Error Code Minimum

| Error Code | HTTP | Makna |
| --- | --- | --- |
| AUTH_REQUIRED | 401 | Token tidak ditemukan. |
| TOKEN_EXPIRED | 401 | Token expired. |
| TOKEN_INVALID | 401 | Token tidak valid. |
| ROLE_NOT_ASSIGNED | 403 | User tidak memiliki active role. |
| PERMISSION_DENIED | 403 | Permission tidak tersedia. |
| FORBIDDEN_SCOPE | 403 | Data di luar scope user. |
| VALIDATION_ERROR | 422 | Validasi field gagal. |
| RESOURCE_NOT_FOUND | 404 | Data tidak ditemukan. |
| STATE_TRANSITION_INVALID | 409 | Perubahan status tidak diizinkan. |
| DUPLICATE_REQUEST | 409 | Request duplikat. |
| IDEMPOTENCY_KEY_REQUIRED | 422 | Idempotency-Key wajib tetapi tidak dikirim. |
| IDEMPOTENCY_PAYLOAD_MISMATCH | 409 | Key sama tetapi payload berbeda. |
| BUSINESS_RULE_VIOLATION | 409 | Melanggar aturan bisnis. |
| INTEGRATION_FAILED | 502 | Service dependency gagal. |
| DEPENDENCY_UNAVAILABLE | 503 | Modul dependency down. |
| PROVIDER_SIGNATURE_INVALID | 401 | Signature payment callback invalid. |
| EVENT_SCHEMA_INVALID | 422 | Payload event tidak sesuai schema. |
| RECONCILIATION_REQUIRED | 409 | Snapshot berbeda dari source. |

## 15.3 Definition of Done Requirement

Requirement memiliki ID, prioritas, deskripsi, owner, dan acceptance criteria.

Requirement dapat ditelusuri ke modul, API/event, tabel/domain, role/scope, dan test case.

Endpoint terkait memiliki API contract dan error code.

Proses kritis memiliki idempotency rule dan unique business key.

Aksi sensitif memiliki audit rule.

Event terkait memiliki event contract, outbox/inbox, retry, DLQ, dan reconciliation rule jika perlu.

QA memiliki positive, negative, RBAC/scope, idempotency, audit, dan regression scenario.


# BAGIAN - FINALISASI ROLE DAN PERMISSION ERP UNSIA

_Sumber file: `Finalisasi Role dan Permission ERP UNSIA.docx`_

## FINALISASI ROLE DAN PERMISSION

## ERP Pendidikan / SIAKAD Terintegrasi UNSIA

## 1. Tujuan Finalisasi Role dan Permission

Finalisasi role dan permission bertujuan menetapkan siapa yang boleh mengakses modul, menu, data, endpoint, aksi bisnis, laporan, integrasi teknis, dan fitur administratif dalam ERP Pendidikan / SIAKAD Terintegrasi UNSIA.

Dokumen ini menjadi acuan untuk:

Backend authorization.

Frontend menu visibility.

Data scope enforcement.

API contract security.

Audit trail.

UAT RBAC/scope test.

Role assignment oleh administrator.

Permission matrix per modul.

Prinsip utama: akses tidak cukup hanya dikontrol di tampilan. Semua endpoint protected wajib memvalidasi token, active role, permission, application, dan data scope di backend.

## 2. Prinsip Utama RBAC

Role dan permission ERP UNSIA menggunakan pendekatan:

RBAC + Data Scope + Active Role + Backend Enforcement

Artinya:

User dapat memiliki lebih dari satu role.

User hanya menjalankan satu active role dalam satu session aktif.

Menu yang tampil mengikuti active role.

Permission action mengikuti active role.

Data yang dapat dibaca/diubah mengikuti data scope.

Frontend hanya membantu menyembunyikan menu/tombol.

Backend tetap menjadi penentu akhir boleh atau tidaknya akses.

Direct URL/direct API call tanpa permission/scope harus ditolak.

Aksi sensitif wajib audit.

Aksi teknis lintas modul wajib memakai service token.

## 3. Konsep Utama

### 3.1 User

User adalah akun yang digunakan untuk login ke sistem. Satu user dapat memiliki beberapa role.

Contoh:

Satu dosen dapat memiliki role dosen, dosen_pa, dan kaprodi.

Satu pegawai dapat memiliki role admin_pmb dan admin_referensi.

Satu pimpinan dapat memiliki role pimpinan dan dosen.

### 3.2 Active Role

Active role adalah role yang sedang dipakai user dalam session berjalan.

Contoh:

Jika user memiliki role dosen dan kaprodi, maka ketika memilih active role kaprodi, menu dan data yang muncul adalah menu dan data untuk Kaprodi. Ketika berpindah ke active role dosen, menu dan scope berubah menjadi kelas yang diampu.

### 3.3 Permission

Permission adalah hak akses granular terhadap resource dan action.

Format standar:

module.resource.action

Contoh:

pmb.applicant.read
pmb.applicant.create
pmb.document.verify
finance.invoice.create
academic.krs.approve
lms.class.sync
assessment.result.publish
core.role.assign

### 3.4 Data Scope

Data scope adalah batas data yang boleh diakses role tertentu.

Contoh:

| Scope | Makna |
| --- | --- |
| global | Bisa mengakses seluruh data sesuai permission |
| module_domain | Bisa mengakses seluruh data dalam domain modul |
| study_program | Hanya data prodi tertentu |
| assigned_class | Hanya kelas yang ditugaskan |
| advisor | Hanya mahasiswa bimbingan akademik |
| self | Hanya data milik sendiri |
| agent | Hanya lead/referral milik agent |
| read_only_aggregate | Hanya data agregat dashboard/laporan |
| technical | Akses teknis terbatas untuk integrasi, log, retry, DLQ |

## 4. Standar Kode Role

| Role Code | Nama Role | Kategori |
| --- | --- | --- |
| super_admin | Super Admin | System Admin |
| admin_bppti | Admin BPPTI | System Admin |
| technical_admin | Technical Admin | Technical |
| auditor | Auditor | Control |
| admin_referensi | Admin Referensi | Module Admin |
| admin_crm | Admin CRM/Marketing | Module Admin |
| agen_mitra | Agent/Mitra | External/Marketing |
| pendaftar | Pendaftar | End User |
| admin_pmb | Admin PMB | Module Admin |
| admin_finance | Admin Finance | Module Admin |
| admin_akademik_biro | Admin Akademik Biro | Module Admin |
| kaprodi | Kaprodi | Academic Management |
| admin_akademik_prodi | Admin Akademik Prodi | Academic Management |
| dosen | Dosen | Lecturer |
| dosen_pa | Dosen Pembimbing Akademik | Lecturer Advisor |
| mahasiswa | Mahasiswa | Student |
| admin_sdm | Admin SDM/HRIS | Module Admin |
| admin_lms | Admin LMS | Module Admin |
| admin_assessment | Admin Assessment | Module Admin |
| pimpinan | Pimpinan | Executive |
| service_account | Service Account | System Integration |

## 5. Role dan Data Scope Final

| Role | Modul/Menu Utama | Data Scope |
| --- | --- | --- |
| Super Admin | Core, role, permission, application registry, audit, service token | Global |
| Admin BPPTI | Core, user management, application registry, service token, audit teknis | Global teknis sesuai assignment |
| Technical Admin | Integration log, outbox/inbox, DLQ, replay, observability | Technical scope |
| Auditor | Audit log, access log, integration evidence, report read-only | Read-only audit |
| Admin Referensi | Master data, status code, payment component, document type | Global referensi |
| Admin CRM | Campaign, lead, follow-up, conversion, commission | CRM domain |
| Agent/Mitra | Lead/referral milik sendiri | Agent scope |
| Pendaftar | PMB public, biodata, upload dokumen, invoice status, LoA | Self scope |
| Admin PMB | Gelombang, applicant, dokumen, seleksi, LoA, handover | PMB domain |
| Admin Finance | Invoice, payment, verification, clearance, scholarship, finance report | Finance domain |
| Admin Akademik Biro | Calendar, student, NIM, class, KRS, grade, KHS, transcript, alumni | Academic global |
| Kaprodi | Curriculum, course, class, monitoring mahasiswa prodi | study_program_id |
| Admin Akademik Prodi | Course, class, KRS monitoring, grade monitoring prodi | study_program_id |
| Dosen | LMS class, session, material, task, attendance, grade input | Assigned class |
| Dosen PA | Approval KRS mahasiswa bimbingan | Advisor scope |
| Mahasiswa | KRS, LMS, invoice, grade, KHS, transcript | Self scope |
| Admin SDM | Employee, lecturer, homebase, status, BKD, certification | HRIS domain |
| Admin LMS | LMS class, enrollment, material, task, attendance, progress | LMS domain |
| Admin Assessment | Question bank, session, attempt, scoring, result | Assessment domain |
| Pimpinan | Executive dashboard, KPI, report aggregate | Read-only aggregate |
| Service Account | API/event antar modul | Service scope sesuai client |

## 6. Permission Naming Convention

Permission harus memakai format konsisten:

{module}.{resource}.{action}

### 6.1 Module Code

| Modul | Code |
| --- | --- |
| Core | core |
| Referensi | ref |
| CRM | crm |
| PMB | pmb |
| Finance | finance |
| Academic | academic |
| HRIS | hris |
| LMS | lms |
| Assessment | assessment |
| Portal | portal |
| Reporting | reporting |
| Integration/Event | integration |

### 6.2 Action Code

| Action | Makna |
| --- | --- |
| read | Melihat data |
| create | Membuat data |
| update | Mengubah data |
| delete | Menghapus data jika diizinkan |
| deactivate | Menonaktifkan data |
| submit | Submit proses |
| approve | Menyetujui |
| reject | Menolak |
| verify | Verifikasi |
| issue | Menerbitkan dokumen/status |
| handover | Menyerahkan data ke modul lain |
| sync | Sinkronisasi |
| import | Import data |
| export | Export data |
| download | Download dokumen/laporan |
| publish | Publish event/result |
| replay | Replay event/DLQ |
| reconcile | Rekonsiliasi data |
| manage | Kelola penuh |
| view_sensitive | Melihat data sensitif |
| impersonate | Impersonation |
| assign | Assign role/permission/scope |

## 7. Permission Core

| Permission | Deskripsi | Role |
| --- | --- | --- |
| core.auth.login | Login sistem | Semua user |
| core.auth.refresh | Refresh token | Authenticated user |
| core.profile.read | Melihat profil sendiri | Semua user |
| core.active_role.switch | Mengganti active role | User multi-role |
| core.application.read | Melihat application launcher | Semua user |
| core.user.read | Melihat user | Super Admin, Admin BPPTI |
| core.user.create | Membuat user | Super Admin, Admin BPPTI |
| core.user.update | Mengubah user | Super Admin, Admin BPPTI |
| core.user.deactivate | Menonaktifkan user | Super Admin |
| core.role.read | Melihat role | Super Admin, Admin BPPTI |
| core.role.create | Membuat role | Super Admin |
| core.role.update | Mengubah role | Super Admin |
| core.role.assign | Assign role ke user | Super Admin, Admin BPPTI |
| core.permission.read | Melihat permission | Super Admin, Admin BPPTI |
| core.permission.assign | Assign permission ke role | Super Admin |
| core.scope.assign | Assign data scope | Super Admin |
| core.service_token.manage | Kelola service token | Super Admin, Admin BPPTI, Technical Admin |
| core.impersonation.start | Mulai impersonation | Super Admin/Admin tertentu |
| core.impersonation.stop | Menghentikan impersonation | Actor impersonation |
| core.audit.read | Melihat audit log | Super Admin, Auditor |
| core.audit.export | Export audit log | Auditor, Super Admin |

## 8. Permission Referensi

| Permission | Deskripsi | Role |
| --- | --- | --- |
| ref.master.read | Melihat master data | Admin Referensi, Admin Modul terkait |
| ref.master.create | Membuat master data | Admin Referensi |
| ref.master.update | Mengubah master data | Admin Referensi |
| ref.master.deactivate | Menonaktifkan master data | Admin Referensi |
| ref.study_program.read | Melihat prodi | Admin Referensi, Admin Akademik, PMB, Finance |
| ref.study_program.create | Membuat prodi | Admin Referensi |
| ref.study_program.update | Mengubah prodi | Admin Referensi |
| ref.academic_year.read | Melihat tahun ajaran | Admin Referensi, Admin Akademik |
| ref.academic_year.create | Membuat tahun ajaran | Admin Akademik Biro/Admin Referensi |
| ref.academic_year.update | Mengubah tahun ajaran | Admin Akademik Biro/Admin Referensi |
| ref.academic_period.read | Melihat periode akademik | Admin Modul terkait |
| ref.academic_period.create | Membuat periode akademik | Admin Akademik Biro |
| ref.academic_period.update | Mengubah periode akademik | Admin Akademik Biro |
| ref.status_code.manage | Kelola status code | Admin Referensi |
| ref.payment_component.manage | Kelola komponen pembayaran | Admin Finance, Admin Referensi |
| ref.document_type.manage | Kelola jenis dokumen | Admin Referensi, Admin PMB |

## 9. Permission CRM

| Permission | Deskripsi | Role |
| --- | --- | --- |
| crm.campaign.read | Melihat campaign | Admin CRM |
| crm.campaign.create | Membuat campaign | Admin CRM |
| crm.campaign.update | Mengubah campaign | Admin CRM |
| crm.lead.read | Melihat lead | Admin CRM, Agent/Mitra sesuai scope |
| crm.lead.create | Membuat lead | Admin CRM, Agent/Mitra |
| crm.lead.update | Mengubah lead | Admin CRM, Agent/Mitra sesuai scope |
| crm.lead.follow_up | Follow-up lead | Admin CRM, Agent/Mitra sesuai scope |
| crm.lead.convert | Convert lead ke applicant | Admin CRM |
| crm.referral.read | Melihat referral | Admin CRM, Agent/Mitra sesuai scope |
| crm.commission.read | Melihat komisi | Admin CRM, Agent/Mitra sesuai scope |
| crm.commission.approve | Approval komisi | Admin CRM |

## 10. Permission PMB

| Permission | Deskripsi | Role |
| --- | --- | --- |
| pmb.applicant.read | Melihat applicant | Admin PMB, Pendaftar self |
| pmb.applicant.create | Membuat applicant | Admin PMB, Pendaftar, CRM via API |
| pmb.applicant.update | Mengubah applicant | Admin PMB, Pendaftar self selama status memungkinkan |
| pmb.applicant.submit | Submit pendaftaran | Pendaftar |
| pmb.document.upload | Upload dokumen | Pendaftar |
| pmb.document.read | Melihat dokumen | Admin PMB, Pendaftar self |
| pmb.document.verify | Verifikasi dokumen | Admin PMB |
| pmb.document.reject | Menolak dokumen | Admin PMB |
| pmb.selection.read | Melihat hasil seleksi | Admin PMB, Pendaftar self |
| pmb.selection.update | Mengubah status seleksi | Admin PMB |
| pmb.invoice.request | Request invoice ke Finance | Admin PMB |
| pmb.loa.issue | Menerbitkan LoA | Admin PMB |
| pmb.loa.download | Download LoA | Admin PMB, Pendaftar self |
| pmb.handover.execute | Handover ke Academic | Admin PMB |
| pmb.report.read | Melihat laporan PMB | Admin PMB, Pimpinan read-only |
| pmb.report.export | Export laporan PMB | Admin PMB |

## 11. Permission Finance

| Permission | Deskripsi | Role |
| --- | --- | --- |
| finance.invoice.read | Melihat invoice | Admin Finance, Pendaftar self, Mahasiswa self |
| finance.invoice.create | Membuat invoice | Admin Finance, PMB/Academic via API |
| finance.invoice.update | Mengubah invoice | Admin Finance |
| finance.payment.read | Melihat pembayaran | Admin Finance, Pendaftar self, Mahasiswa self |
| finance.payment.callback_process | Proses callback payment | Service Account Finance |
| finance.payment.verify | Verifikasi pembayaran manual | Admin Finance |
| finance.receipt.issue | Menerbitkan receipt | Admin Finance |
| finance.clearance.read | Melihat clearance | Admin Finance, Academic/LMS/Portal via API |
| finance.clearance.update | Mengubah clearance | Admin Finance |
| finance.scholarship.manage | Kelola beasiswa/diskon | Admin Finance |
| finance.report.read | Melihat laporan finance | Admin Finance, Pimpinan read-only |
| finance.report.export | Export laporan finance | Admin Finance |

## 12. Permission Akademik

| Permission | Deskripsi | Role |
| --- | --- | --- |
| academic.student.read | Melihat mahasiswa | Admin Akademik Biro, Admin Prodi/Kaprodi sesuai scope |
| academic.student.create_from_applicant | Membuat student dari applicant | Admin Akademik Biro/System via PMB handover |
| academic.student.update | Mengubah data student | Admin Akademik Biro |
| academic.nim.generate | Generate NIM | Admin Akademik Biro/System |
| academic.curriculum.read | Melihat kurikulum | Admin Akademik, Kaprodi |
| academic.curriculum.manage | Kelola kurikulum | Admin Akademik Biro, Kaprodi sesuai scope |
| academic.course.read | Melihat mata kuliah | Admin Akademik, Kaprodi, Mahasiswa |
| academic.course.manage | Kelola mata kuliah | Admin Akademik Biro, Kaprodi sesuai scope |
| academic.class.read | Melihat kelas | Admin Akademik, Kaprodi, Dosen, Mahasiswa sesuai scope |
| academic.class.create | Membuka kelas | Admin Akademik Biro, Kaprodi sesuai scope |
| academic.class.update | Mengubah kelas | Admin Akademik Biro, Kaprodi sesuai scope |
| academic.krs.read | Melihat KRS | Admin Akademik, Dosen PA, Mahasiswa self |
| academic.krs.create | Membuat draft KRS | Mahasiswa |
| academic.krs.submit | Submit KRS | Mahasiswa |
| academic.krs.approve | Approval KRS | Dosen PA |
| academic.krs.reject | Menolak KRS | Dosen PA |
| academic.grade.source_import | Import source grade | Academic via LMS/Assessment |
| academic.grade.read | Melihat nilai | Admin Akademik, Dosen sesuai kelas, Mahasiswa self |
| academic.grade.finalize | Finalisasi nilai | Admin Akademik Biro/Kaprodi sesuai policy |
| academic.grade.correct | Koreksi nilai | Admin Akademik Biro dengan reason |
| academic.khs.read | Melihat KHS | Mahasiswa self, Admin Akademik |
| academic.khs.download | Download KHS | Mahasiswa self, Admin Akademik |
| academic.transcript.read | Melihat transkrip | Mahasiswa self, Admin Akademik |
| academic.transcript.download | Download transkrip | Mahasiswa self, Admin Akademik |
| academic.alumni.manage | Kelola alumni | Admin Akademik Biro |
| academic.report.read | Laporan akademik | Admin Akademik, Pimpinan read-only |

## 13. Permission HRIS/SDM

| Permission | Deskripsi | Role |
| --- | --- | --- |
| hris.employee.read | Melihat pegawai | Admin SDM |
| hris.employee.create | Membuat pegawai | Admin SDM |
| hris.employee.update | Mengubah pegawai | Admin SDM |
| hris.employee.deactivate | Menonaktifkan pegawai | Admin SDM |
| hris.lecturer.read | Melihat dosen | Admin SDM, Academic/LMS via API |
| hris.lecturer.create | Membuat data dosen | Admin SDM |
| hris.lecturer.update | Mengubah data dosen | Admin SDM |
| hris.lecturer.status_update | Update status aktif dosen | Admin SDM |
| hris.homebase.manage | Kelola homebase | Admin SDM |
| hris.bkd.read | Melihat BKD | Admin SDM |
| hris.bkd.manage | Kelola BKD | Admin SDM |
| hris.report.read | Laporan SDM | Admin SDM, Pimpinan read-only |

## 14. Permission LMS

| Permission | Deskripsi | Role |
| --- | --- | --- |
| lms.class.read | Melihat kelas LMS | Admin LMS, Dosen assigned, Mahasiswa enrolled |
| lms.class.sync | Sync kelas dari Academic | Admin LMS/System |
| lms.enrollment.read | Melihat enrollment | Admin LMS, Dosen assigned, Mahasiswa self |
| lms.enrollment.sync | Sync enrollment dari KRS | Admin LMS/System |
| lms.session.create | Membuat sesi | Dosen assigned, Admin LMS |
| lms.session.update | Mengubah sesi | Dosen assigned, Admin LMS |
| lms.material.create | Upload materi | Dosen assigned |
| lms.material.update | Ubah materi | Dosen assigned |
| lms.assignment.create | Membuat tugas | Dosen assigned |
| lms.assignment.update | Mengubah tugas | Dosen assigned |
| lms.submission.submit | Submit tugas | Mahasiswa enrolled |
| lms.submission.grade | Menilai tugas | Dosen assigned |
| lms.attendance.manage | Kelola presensi | Dosen assigned |
| lms.progress.read | Melihat progress | Dosen assigned, Mahasiswa self |
| lms.grade_input.submit | Submit grade input ke Academic | Dosen assigned/Admin LMS |
| lms.report.read | Laporan LMS | Admin LMS, Pimpinan read-only |

## 15. Permission Assessment

| Permission | Deskripsi | Role |
| --- | --- | --- |
| assessment.question_bank.read | Melihat bank soal | Admin Assessment, Dosen sesuai policy |
| assessment.question_bank.create | Membuat bank soal | Admin Assessment |
| assessment.question_bank.update | Mengubah bank soal | Admin Assessment |
| assessment.question.version_create | Membuat versi soal | Admin Assessment |
| assessment.session.read | Melihat assessment session | Admin Assessment |
| assessment.session.create | Membuat assessment session | Admin Assessment |
| assessment.session.update | Mengubah assessment session | Admin Assessment |
| assessment.participant.manage | Kelola participant | Admin Assessment/System consumer |
| assessment.attempt.start | Mulai attempt | Peserta sesuai context |
| assessment.attempt.submit | Submit attempt | Peserta sesuai context |
| assessment.scoring.execute | Eksekusi scoring | Admin Assessment/System |
| assessment.result.read | Melihat hasil | Admin Assessment/Consumer sesuai scope |
| assessment.result.publish | Publish result ke consumer | Admin Assessment/System |
| assessment.report.read | Laporan assessment | Admin Assessment, Pimpinan read-only |

## 16. Permission Portal

| Permission | Deskripsi | Role |
| --- | --- | --- |
| portal.dashboard.read | Melihat dashboard | Semua user sesuai active role |
| portal.notification.read | Melihat notifikasi | Semua user self |
| portal.notification.mark_read | Tandai notifikasi terbaca | Semua user self |
| portal.shortcut.manage | Kelola shortcut pribadi | Semua user |
| portal.preference.update | Update preferensi user | Semua user self |
| portal.applicant_view.read | Applicant portal | Pendaftar |
| portal.student_view.read | Student portal | Mahasiswa |
| portal.lecturer_view.read | Lecturer portal | Dosen |
| portal.executive_dashboard.read | Executive dashboard | Pimpinan |
| portal.activity_log.read_self | Melihat activity sendiri | Semua user |
| portal.activity_log.read_admin | Melihat activity user lain | Super Admin, Auditor |

## 17. Permission Integration dan Event

| Permission | Deskripsi | Role |
| --- | --- | --- |
| integration.outbox.read | Melihat outbox event | Technical Admin, Auditor read-only |
| integration.inbox.read | Melihat inbox event | Technical Admin, Auditor read-only |
| integration.dlq.read | Melihat DLQ | Technical Admin |
| integration.dlq.replay | Replay DLQ | Technical Admin |
| integration.event_catalog.read | Melihat event catalog | Technical Admin, Backend Lead, QA |
| integration.event_catalog.manage | Kelola event catalog | Technical Admin |
| integration.reconciliation.read | Melihat mismatch | Technical Admin, Owner Modul terkait, Auditor |
| integration.reconciliation.resolve | Menyelesaikan mismatch | Technical Admin/Owner Modul sesuai domain |
| integration.service_token.use | Service-to-service call | Service Account |

## 18. Matrix Akses Modul per Role

- Role | Core | Ref | CRM | PMB | Finance | Academic | HRIS | LMS | Assessment | Portal | Report
- Super Admin | Full | Read | Read | Read | Read | Read | Read | Read | Read | Full | Read
- Admin BPPTI | Manage technical | Read | - | - | - | - | - | - | - | Manage | Technical
- Technical Admin | Technical | - | - | - | - | - | - | - | - | Technical | Technical
- Auditor | Audit read | Read | Read | Read | Read | Read | Read | Read | Read | Read | Audit report
- Admin Referensi | - | Full | - | Ref read | Ref read | Ref read | Ref read | Ref read | Ref read | Read | Ref report
- Admin CRM | - | Read | Full | Limited conversion | - | - | - | - | - | Notification | CRM report
- Agent/Mitra | - | - | Own lead | - | - | - | - | - | - | Own portal | Own report
- Pendaftar | - | Read public | - | Self | Self invoice status | - | - | - | Attempt context | Applicant portal | -
- Admin PMB | - | Read | Read converted | Full | Request/read status | Handover only | - | - | Request CBT/read result | PMB notification | PMB report
- Admin Finance | - | Read | - | Read applicant snapshot | Full | Clearance API | - | - | - | Finance notification | Finance report
- Admin Akademik Biro | - | Read | - | Read handover | Clearance read | Full | Lecturer read | Sync class | Result read | Academic portal | Academic report
- Kaprodi | - | Read | - | - | Clearance read | Prodi scope | Lecturer read | Class scope | Result read | Prodi dashboard | Prodi report
- Admin Akademik Prodi | - | Read | - | - | Clearance read | Prodi scope | Lecturer read | Class scope | Result read | Prodi dashboard | Prodi report
- Dosen | - | Read | - | - | - | Assigned class read | Own lecturer read | Assigned class | Assessment context | Lecturer portal | Teaching report
- Dosen PA | - | Read | - | - | Clearance read | Advisor scope | Own lecturer read | - | - | Lecturer portal | PA report
- Mahasiswa | - | Read | - | - | Self invoice | Self academic | - | Self enrolled | Attempt context | Student portal | Self report
- Admin SDM | - | Read | - | - | - | Lecturer ref | Full | Lecturer ref | - | HRIS notification | HRIS report
- Admin LMS | - | Read | - | - | Clearance snapshot | Class/KRS sync read | Lecturer read | Full | Assessment context | LMS notification | LMS report
- Admin Assessment | - | Read | - | Participant context | - | Context result | - | Context result | Full | Assessment notification | Assessment report
- Pimpinan | - | Read aggregate | Aggregate | Aggregate | Aggregate | Aggregate | Aggregate | Aggregate | Aggregate | Executive dashboard | Aggregate report
- Service Account | API only | API only | API only | API only | API only | API only | API only | API only | API only | API only | API only

Keterangan:

Full berarti CRUD dan aksi bisnis sesuai modul.

Read berarti melihat data sesuai kebutuhan operasional.

Aggregate berarti hanya data ringkasan, bukan data transaksi detail.

Self berarti hanya data milik user tersebut.

Scope berarti dibatasi oleh prodi, kelas, bimbingan, atau assignment.

API only berarti akses bukan lewat UI, tetapi melalui service token dan endpoint resmi.

## 19. Data Scope Detail

### 19.1 Global Scope

Digunakan oleh:

super_admin

role tertentu yang memang diberi kewenangan lintas organisasi

Aturan:

Dapat membaca seluruh data sesuai permission.

Aksi sensitif tetap wajib audit.

Tidak otomatis boleh mengubah data domain jika permission action tidak tersedia.

### 19.2 Module Domain Scope

Digunakan oleh:

admin_pmb

admin_finance

admin_crm

admin_sdm

admin_lms

admin_assessment

Aturan:

Bisa mengakses data dalam domain modul.

Tidak boleh write ke modul lain.

Jika butuh data modul lain, gunakan API/event/snapshot.

### 19.3 Study Program Scope

Digunakan oleh:

kaprodi

admin_akademik_prodi

Aturan:

Hanya boleh mengakses data dengan study_program_ref_id yang assigned.

Tidak boleh melihat data prodi lain.

Direct API dengan study_program_ref_id lain harus ditolak.

Export data hanya untuk prodi yang assigned.

### 19.4 Assigned Class Scope

Digunakan oleh:

dosen

Aturan:

Hanya boleh mengakses kelas yang ditugaskan.

Hanya boleh input nilai untuk kelas yang diampu.

Tidak boleh melihat submission kelas lain.

Tidak boleh finalisasi nilai final jika bukan kewenangannya.

### 19.5 Advisor Scope

Digunakan oleh:

dosen_pa

Aturan:

Hanya boleh melihat mahasiswa bimbingan.

Hanya boleh approve/reject KRS mahasiswa bimbingan.

Tidak boleh melihat mahasiswa di luar daftar bimbingan.

Catatan PA hanya untuk mahasiswa bimbingan.

### 19.6 Self Scope

Digunakan oleh:

pendaftar

mahasiswa

Aturan:

Hanya boleh melihat dan mengubah data milik sendiri.

Pendaftar hanya bisa mengubah biodata selama status masih memungkinkan.

Mahasiswa hanya bisa melihat invoice, KRS, LMS, nilai, KHS, dan transkrip miliknya sendiri.

Direct API ke data user lain harus ditolak.

### 19.7 Agent Scope

Digunakan oleh:

agen_mitra

Aturan:

Hanya bisa melihat lead/referral milik sendiri.

Tidak boleh melihat lead agent lain.

Tidak boleh menerbitkan LoA.

Tidak boleh melihat data pembayaran detail applicant.

### 19.8 Read-only Aggregate Scope

Digunakan oleh:

pimpinan

Aturan:

Hanya melihat dashboard dan KPI agregat.

Tidak boleh mengubah transaksi.

Drilldown detail harus terbatas dan masked jika berisi data sensitif.

Export mengikuti kebijakan data governance.

### 19.9 Technical Scope

Digunakan oleh:

technical_admin

service_account

Aturan:

Hanya untuk integrasi, observability, retry, DLQ, dan service-to-service call.

Tidak boleh dipakai untuk memanipulasi data bisnis tanpa proses resmi.

Replay event wajib reason dan audit.

Service account tidak boleh login UI.

## 20. Backend Authorization Flow

Setiap request endpoint protected wajib melewati flow berikut:

Request
  ↓
Validate Authorization Bearer Token
  ↓
Validate X-Application-Code
  ↓
Validate X-Active-Role
  ↓
Load Role Assignment
  ↓
Check Permission
  ↓
Resolve Data Scope
  ↓
Validate Resource Scope
  ↓
Process Request
  ↓
Write Audit Log if sensitive action
  ↓
Return Success/Error Envelope

Jika salah satu validasi gagal:

| Kondisi | Response |
| --- | --- |
| Token tidak valid | 401 Unauthorized |
| Role tidak dimiliki user | 403 Forbidden |
| Permission tidak tersedia | 403 Forbidden |
| Scope tidak sesuai | 403 Forbidden |
| Resource tidak ditemukan dalam scope | 404 Not Found atau 403 Forbidden sesuai policy |
| Aksi melanggar state machine | 409 Conflict |
| Input tidak valid | 422 Validation Error |

## 21. Header API Wajib

Endpoint protected wajib menerima header berikut:

Authorization: Bearer <token>
X-Application-Code: <application_code>
X-Active-Role: <role_code>
X-Correlation-Id: <uuid>

Endpoint command kritis wajib menambahkan:

Idempotency-Key: <unique_business_key>

Contoh:

Authorization: Bearer eyJ...
X-Application-Code: ACADEMIC
X-Active-Role: dosen_pa
X-Correlation-Id: 71c5c6d4-01b2-4f4a-8a74-292a527c1e3d
Idempotency-Key: academic:krs:approve:krs-uuid

## 22. Rule Active Role

User dapat memiliki banyak role.

Satu session hanya memiliki satu active role.

Active role harus dipilih setelah login jika user multi-role.

Switching role wajib dicatat audit.

Token/session harus membawa active role.

Permission dan scope dihitung berdasarkan active role.

Application launcher mengikuti active role.

Shortcut portal mengikuti active role.

Jika role dicabut, active session terkait harus invalid atau refresh permission sesuai policy.

## 23. Rule Frontend

Frontend wajib:

Menampilkan menu sesuai active role.

Menampilkan tombol sesuai permission.

Menyembunyikan aksi yang tidak dimiliki role.

Menampilkan pesan akses ditolak jika backend mengembalikan 403.

Tidak menyimpan permission secara permanen di browser.

Refresh permission saat active role berubah.

Menampilkan scope aktif, misalnya prodi, kelas, atau self.

Untuk role pimpinan, hanya tampilkan dashboard agregat.

Untuk data snapshot, tampilkan synced_at atau refreshed_at.

Namun frontend bukan sumber kebenaran permission. Backend tetap wajib melakukan validasi ulang.

## 24. Rule Audit untuk Aksi Berbasis Permission

Aksi berikut wajib audit:

| Aksi | Audit Wajib |
| --- | --- |
| Login/logout | Ya |
| Switch active role | Ya |
| Create/update/deactivate user | Ya |
| Assign role/permission/scope | Ya |
| Impersonation | Ya, wajib reason |
| Create/update master data | Ya |
| Verify/reject dokumen PMB | Ya |
| Issue LoA | Ya |
| Handover PMB ke Academic | Ya |
| Payment verification | Ya |
| Clearance update | Ya |
| Generate NIM | Ya |
| Approve/reject KRS | Ya |
| Finalisasi/koreksi nilai | Ya |
| Publish result Assessment | Ya |
| Replay DLQ/event | Ya, wajib reason |
| Reconciliation resolve | Ya |

Audit minimal mencatat:

actor_user_id
actor_person_ref_id
active_role
permission_used
module
resource
resource_id
action
old_value
new_value
reason
request_id
correlation_id
ip_address
user_agent
timestamp

## 25. Tabel RBAC yang Direkomendasikan

### 25.1 roles

id
role_code
role_name
role_category
description
is_system_role
is_active
created_at
updated_at

### 25.2 permissions

id
permission_code
module_code
resource_code
action_code
description
is_sensitive
is_active
created_at
updated_at

### 25.3 role_permissions

id
role_id
permission_id
created_at
created_by

### 25.4 user_role_assignments

id
user_id
role_id
scope_type
scope_value
valid_from
valid_to
is_active
assigned_by
assigned_at
revoked_by
revoked_at

### 25.5 active_role_sessions

id
session_id
user_id
role_id
scope_type
scope_value
activated_at
expired_at
ip_address
user_agent

### 25.6 applications

id
application_code
application_name
module_code
url
is_active
sort_order

### 25.7 application_role_access

id
application_id
role_id
is_active
created_at

### 25.8 permission_audit_logs

id
actor_user_id
active_role
permission_code
resource_type
resource_id
decision
reason
correlation_id
created_at

## 26. Contoh Policy Rule

### 26.1 Admin Prodi Mengakses Mahasiswa

Role: kaprodi
Permission: academic.student.read
Scope type: study_program
Scope value: study_program_ref_id

Rule:
allow jika student.study_program_ref_id == user.scope_value
deny jika berbeda

### 26.2 Dosen Mengisi Nilai

Role: dosen
Permission: lms.grade_input.submit
Scope type: assigned_class

Rule:
allow jika class_id berada dalam daftar assigned_class dosen
deny jika class_id bukan kelas dosen tersebut

### 26.3 Mahasiswa Melihat KHS

Role: mahasiswa
Permission: academic.khs.read
Scope type: self

Rule:
allow jika khs.student_ref_id == current_user.student_ref_id
deny jika milik mahasiswa lain

### 26.4 Dosen PA Approve KRS

Role: dosen_pa
Permission: academic.krs.approve
Scope type: advisor

Rule:
allow jika krs.student_ref_id ada dalam daftar mahasiswa bimbingan dosen PA
deny jika bukan mahasiswa bimbingannya

### 26.5 Pimpinan Melihat Dashboard

Role: pimpinan
Permission: portal.executive_dashboard.read
Scope type: read_only_aggregate

Rule:
allow read aggregate KPI
deny create/update/delete transaction

## 27. UAT RBAC dan Data Scope

| ID | Scenario | Expected Result |
| --- | --- | --- |
| RBAC-001 | Super Admin membuka role/permission management | Berhasil |
| RBAC-002 | Admin PMB mengelola applicant | Berhasil |
| RBAC-003 | Admin PMB mencoba finalisasi nilai | Ditolak |
| RBAC-004 | Admin Prodi A membuka data mahasiswa Prodi A | Berhasil |
| RBAC-005 | Admin Prodi A membuka data mahasiswa Prodi B | Ditolak |
| RBAC-006 | Dosen membuka kelas yang diampu | Berhasil |
| RBAC-007 | Dosen membuka kelas dosen lain | Ditolak |
| RBAC-008 | Dosen PA approve KRS mahasiswa bimbingan | Berhasil |
| RBAC-009 | Dosen PA approve KRS bukan bimbingan | Ditolak |
| RBAC-010 | Mahasiswa membuka KHS sendiri | Berhasil |
| RBAC-011 | Mahasiswa membuka KHS mahasiswa lain via direct URL | Ditolak |
| RBAC-012 | Agent melihat lead milik sendiri | Berhasil |
| RBAC-013 | Agent melihat lead agent lain | Ditolak |
| RBAC-014 | Pimpinan membuka dashboard KPI | Berhasil |
| RBAC-015 | Pimpinan mencoba update transaksi | Ditolak |
| RBAC-016 | Technical Admin replay DLQ dengan reason | Berhasil |
| RBAC-017 | Technical Admin replay DLQ tanpa reason | Ditolak |
| RBAC-018 | User multi-role switch active role | Menu dan permission berubah |
| RBAC-019 | Service token invalid memanggil endpoint integrasi | Ditolak |
| RBAC-020 | Direct API call tanpa permission | Ditolak |

## 28. Checklist Finalisasi Role dan Permission

| Checklist | Status |
| --- | --- |
| Daftar role final sudah ditentukan | Belum/Sudah |
| Role code sudah distandarkan | Belum/Sudah |
| Permission naming convention sudah ditentukan | Belum/Sudah |
| Permission per modul sudah dibuat | Belum/Sudah |
| Data scope per role sudah ditentukan | Belum/Sudah |
| Active role behavior sudah ditentukan | Belum/Sudah |
| Backend authorization flow sudah ditentukan | Belum/Sudah |
| Header API authorization sudah ditentukan | Belum/Sudah |
| Role-menu matrix sudah dibuat | Belum/Sudah |
| Role-permission matrix sudah dibuat | Belum/Sudah |
| Role-data scope matrix sudah dibuat | Belum/Sudah |
| Aksi sensitif sudah ditandai audit wajib | Belum/Sudah |
| Service account permission sudah ditentukan | Belum/Sudah |
| Impersonation policy sudah ditentukan | Belum/Sudah |
| Direct URL/API access test sudah masuk UAT | Belum/Sudah |
| Approval Product Owner sudah diperoleh | Belum/Sudah |
| Approval Technical Lead sudah diperoleh | Belum/Sudah |
| Approval QA/UAT Lead sudah diperoleh | Belum/Sudah |

## 29. Acceptance Criteria Finalisasi Role dan Permission

Finalisasi role dan permission dinyatakan selesai apabila:

Semua role bisnis dan teknis sudah memiliki role code final.

Semua menu utama sudah memiliki mapping role.

Semua endpoint protected sudah memiliki permission requirement.

Semua role sudah memiliki data scope yang jelas.

Semua user multi-role dapat memilih active role.

Menu, permission, dan data scope berubah sesuai active role.

Backend menolak request tanpa permission.

Backend menolak request yang melanggar data scope.

Direct URL/direct API tidak bisa melewati kontrol akses.

Aksi sensitif tercatat di audit log.

Service-to-service call memakai service token.

Permission matrix dapat diuji oleh QA.

Role assignment dapat dikelola dari Core.

Tidak ada modul selain Core yang menyimpan credential/session sendiri.

Product Owner, Technical Lead, Backend Lead, Frontend Lead, QA/UAT Lead, dan Owner Modul menyetujui matrix final.

## 30. Keputusan Final

Keputusan final role dan permission ERP UNSIA adalah:

Core menjadi satu-satunya authority untuk user, role, permission, active role, session, service token, dan data scope.

Setiap user dapat memiliki banyak role, tetapi hanya satu active role yang berlaku dalam satu session aktif.

Permission menggunakan format standar module.resource.action.

Data access dikendalikan melalui data scope.

Role operasional dibatasi sesuai domain modul.

Role akademik prodi dibatasi berdasarkan study_program_id.

Role dosen dibatasi berdasarkan assigned class.

Role dosen PA dibatasi berdasarkan mahasiswa bimbingan.

Role mahasiswa dan pendaftar dibatasi berdasarkan self scope.

Role pimpinan bersifat read-only aggregate.

Role technical hanya untuk integrasi, observability, DLQ, replay, dan reconciliation.

Backend wajib menjadi enforcement utama, sedangkan frontend hanya mengikuti hasil permission untuk tampilan.


# BAGIAN - FINALISASI MODULE BOUNDARY ERP UNSIA

_Sumber file: `Finalisasi Module Boundary.docx`_

## FINALISASI MODULE BOUNDARY

## ERP Pendidikan / SIAKAD Terintegrasi UNSIA

## 1. Tujuan Finalisasi Module Boundary

Finalisasi module boundary bertujuan menetapkan batas tanggung jawab setiap modul ERP UNSIA agar proses development tidak tumpang tindih, tidak terjadi duplikasi data, tidak ada modul yang mengubah data milik modul lain secara langsung, dan integrasi lintas modul berjalan melalui mekanisme resmi berupa API, event, snapshot, read model, serta reconciliation.

Module boundary menjadi dasar bagi tim developer untuk menyusun service, database, endpoint, event contract, RBAC, ERD/DBML, backlog, test scenario, dan release plan.

## 2. Prinsip Utama Module Boundary

Setiap modul hanya boleh memiliki dan mengubah data yang menjadi domain bisnisnya sendiri. Modul lain yang membutuhkan data tersebut hanya boleh membaca melalui API, menerima event, atau menyimpan snapshot/read model yang bersifat turunan.

Prinsip wajib:

Satu modul memiliki satu database fisik.

Setiap database hanya boleh memiliki foreign key internal.

Relasi lintas modul menggunakan external reference, bukan foreign key lintas database.

Transaksi online tidak boleh melakukan direct cross-database join.

Write lintas modul harus melalui API command atau event resmi.

Read lintas modul menggunakan API query, snapshot, read model, event projection, atau warehouse.

Snapshot bukan source of truth.

Data final tetap mengikuti modul pemilik domain.

Proses kritis wajib idempotent.

Perubahan data penting wajib menghasilkan audit log dan outbox event.

Consumer event wajib idempotent agar duplicate event tidak membuat data ganda.

Setiap modul wajib memiliki degraded mode jika dependency utama sedang down.

## 3. Daftar Modul dan Database Boundary

| Modul | Database | Domain Utama |
| --- | --- | --- |
| Core | core_db | Identity, SSO, RBAC, permission, session, service token, audit global |
| Referensi | reference_db | Master data umum, prodi, periode akademik, status code, komponen pembayaran |
| CRM | crm_db | Lead, campaign, agent, referral, follow-up, pipeline marketing |
| PMB | pmb_db | Applicant, biodata pendaftar, dokumen PMB, seleksi, LoA, handover akademik |
| Finance | finance_db | Invoice, payment, callback, verifikasi, receipt, clearance, beasiswa |
| Akademik | academic_db | Student, NIM, kurikulum, mata kuliah, kelas, KRS, nilai final, KHS, transkrip |
| HRIS/SDM | hris_db | Employee, lecturer, homebase, unit kerja, jabatan, status aktif |
| LMS | lms_db | Kelas online, enrollment LMS, sesi, materi, tugas, presensi, progress, grade input |
| Assessment | assessment_db | Bank soal, assessment session, attempt, answer, scoring, result |
| Portal | portal_db | Dashboard role-based, notification, shortcut, preference, activity log |

## 4. Boundary Modul Core

### 4.1 Tanggung Jawab Core

Core menjadi pusat identitas dan akses sistem. Semua login, user, role, permission, session, active role, service token, application launcher, dan audit global dikendalikan oleh Core.

### 4.2 Data yang Dimiliki Core

| Data | Status |
| --- | --- |
| Person | Source of truth |
| User account | Source of truth |
| Password/session/token | Source of truth |
| Role | Source of truth |
| Permission | Source of truth |
| Active role session | Source of truth |
| Application registry | Source of truth |
| Service client/token | Source of truth |
| Impersonation log | Source of truth |
| Audit global | Source of truth atau agregator audit |

### 4.3 Data yang Tidak Boleh Dimiliki Core

Core tidak boleh menjadi pemilik master prodi, data mahasiswa, invoice, payment, applicant, kelas, LMS activity, assessment result, dan notification preference detail. Core hanya menyimpan referensi minimum jika diperlukan untuk role assignment.

### 4.4 Integrasi Core

| Arah Integrasi | Mekanisme |
| --- | --- |
| Core ke semua modul | JWT, active role, permission claim, service token |
| Modul ke Core | Validasi user, role, permission, dan scope |
| Core ke Portal | User/role snapshot untuk dashboard dan shortcut |

### 4.5 Boundary Rule Core

Tidak ada tabel user/password di modul selain Core.

Modul lain hanya boleh menyimpan person_ref_id atau user_ref_id.

Permission boleh dicache untuk kebutuhan performa, tetapi authority tetap Core.

Service-to-service communication wajib menggunakan service client/token resmi.

Impersonation wajib memiliki reason dan audit trail.

## 5. Boundary Modul Referensi

### 5.1 Tanggung Jawab Referensi

Referensi menjadi pusat master data lintas modul. Modul ini menyediakan data standar seperti program studi, tahun ajaran, periode akademik, status code, komponen pembayaran, metode pembayaran, jenis dokumen, wilayah, agama, dan data referensi lain yang dipakai lintas modul.

### 5.2 Data yang Dimiliki Referensi

| Data | Status |
| --- | --- |
| Study program | Source of truth |
| Academic year | Source of truth |
| Academic period | Source of truth |
| Curriculum year reference | Source of truth referensi |
| Payment component | Source of truth referensi |
| Payment method | Source of truth referensi |
| Status code | Source of truth |
| Document type | Source of truth |
| Region | Source of truth |
| Religion | Source of truth |

### 5.3 Data yang Tidak Boleh Dimiliki Referensi

Referensi tidak boleh menyimpan credential user, applicant detail, student record, payment transaction, class transaction, LMS activity, dan assessment attempt.

### 5.4 Integrasi Referensi

| Arah Integrasi | Mekanisme |
| --- | --- |
| Referensi ke PMB | Prodi, jalur PMB, gelombang, document type |
| Referensi ke Finance | Payment component, payment method, academic period |
| Referensi ke Akademik | Prodi, academic year, academic period, status akademik |
| Referensi ke LMS | Academic period dan status referensi |
| Referensi ke Portal | Master label untuk dashboard |

### 5.5 Boundary Rule Referensi

Data referensi yang sudah dipakai transaksi tidak boleh hard delete.

Perubahan referensi penting wajib publish event.

Modul lain boleh menyimpan *_ref_id, code, name, dan snapshot.

Validasi transaksi tetap menggunakan referensi aktif.

Status bisnis kritis harus memakai status code standar, bukan string bebas.

## 6. Boundary Modul CRM

### 6.1 Tanggung Jawab CRM

CRM mengelola proses marketing sebelum seseorang menjadi applicant resmi. Modul ini menangani campaign, lead, referral, agent, follow-up, pipeline, dan komisi marketing.

### 6.2 Data yang Dimiliki CRM

| Data | Status |
| --- | --- |
| Campaign | Source of truth |
| Lead | Source of truth |
| Agent | Source of truth CRM |
| Referral | Source of truth |
| Follow-up history | Source of truth |
| Marketing pipeline | Source of truth |
| Commission record | Source of truth CRM |

### 6.3 Data yang Tidak Boleh Dimiliki CRM

CRM tidak boleh menjadi pemilik applicant, dokumen PMB, invoice, payment, student, NIM, KRS, nilai, atau clearance. Setelah lead dikonversi, PMB menjadi pemilik applicant.

### 6.4 Integrasi CRM

| Arah Integrasi | Mekanisme |
| --- | --- |
| CRM ke PMB | Convert qualified lead menjadi applicant |
| CRM ke Portal | Notifikasi follow-up atau progress lead |
| CRM ke Reporting | Funnel marketing dan conversion rate |

### 6.5 Boundary Rule CRM

CRM boleh membuat lead, tetapi tidak boleh membuat applicant langsung di database PMB.

Convert lead ke applicant wajib melalui PMB API.

Lead yang sudah dikonversi wajib menyimpan applicant_ref_id.

Duplicate conversion tidak boleh membuat applicant ganda.

Histori campaign tetap milik CRM meskipun lead sudah menjadi applicant.

## 7. Boundary Modul PMB

### 7.1 Tanggung Jawab PMB

PMB menjadi source of truth untuk proses penerimaan mahasiswa baru. Modul ini mengelola applicant, biodata, dokumen, seleksi, daftar ulang, LoA, dan handover ke Akademik.

### 7.2 Data yang Dimiliki PMB

| Data | Status |
| --- | --- |
| Applicant | Source of truth |
| Applicant biodata | Source of truth |
| Applicant document | Source of truth |
| Document verification | Source of truth |
| Selection status | Source of truth PMB |
| Re-registration | Source of truth PMB |
| LoA | Source of truth |
| Handover log | Source of truth PMB |

### 7.3 Data yang Tidak Boleh Dimiliki PMB

PMB tidak boleh menjadi pemilik invoice, payment, clearance final, student, NIM, KRS, nilai, dan transkrip. PMB hanya boleh menyimpan snapshot status invoice/payment dari Finance.

### 7.4 Integrasi PMB

| Arah Integrasi | Mekanisme |
| --- | --- |
| CRM ke PMB | Lead qualified menjadi applicant |
| PMB ke Finance | Request invoice |
| Finance ke PMB | Payment status dan invoice status event |
| PMB ke Assessment | CBT participant atau seleksi |
| Assessment ke PMB | Result seleksi |
| PMB ke Akademik | Handover applicant menjadi student |
| PMB ke Portal | Status pendaftaran, LoA, notifikasi |

### 7.5 Boundary Rule PMB

Applicant hanya dibuat oleh PMB.

Applicant dari lead harus menyimpan lead_ref_id.

Payment status resmi tetap dari Finance.

PMB hanya menyimpan payment snapshot untuk kebutuhan tampilan.

LoA hanya boleh diterbitkan jika dokumen dan payment policy valid.

Handover ke Akademik wajib idempotent.

Applicant yang sudah di-handover harus menyimpan student_ref_id.

PMB tidak boleh membuat NIM.

PMB tidak boleh mengubah data student di database Akademik.

## 8. Boundary Modul Finance

### 8.1 Tanggung Jawab Finance

Finance menjadi source of truth untuk seluruh transaksi keuangan, invoice, pembayaran, receipt, clearance, cicilan, beasiswa, diskon, callback payment gateway, dan verifikasi pembayaran manual.

### 8.2 Data yang Dimiliki Finance

| Data | Status |
| --- | --- |
| Invoice | Source of truth |
| Invoice item | Source of truth |
| Payment | Source of truth |
| Payment callback log | Source of truth |
| Manual payment verification | Source of truth |
| Receipt | Source of truth |
| Clearance | Source of truth |
| Scholarship/discount | Source of truth |
| Installment/dispensation | Source of truth |
| Finance report transaction | Source of truth Finance |

### 8.3 Data yang Tidak Boleh Dimiliki Finance

Finance tidak boleh menjadi pemilik applicant, student, KRS, kelas, nilai, dan LMS activity. Finance hanya boleh menyimpan customer snapshot dari PMB, Akademik, atau Core.

### 8.4 Integrasi Finance

| Arah Integrasi | Mekanisme |
| --- | --- |
| PMB ke Finance | Request invoice applicant |
| Academic ke Finance | Request invoice mahasiswa atau cek clearance |
| Payment Gateway ke Finance | Payment callback |
| Finance ke PMB | Payment status update |
| Finance ke Academic | Clearance update |
| Finance ke Portal | Notification invoice/payment |
| Finance ke Reporting | Financial KPI |

### 8.5 Boundary Rule Finance

Invoice dan payment hanya boleh dibuat di Finance.

Payment callback wajib validasi signature.

Payment callback wajib idempotent.

Duplicate callback tidak boleh membuat payment ganda.

Clearance final hanya milik Finance.

Academic, PMB, LMS, dan Portal hanya boleh membaca clearance melalui API atau snapshot/event.

Finance tidak boleh mengubah KRS secara langsung.

Finance hanya mengirim status clearance, sedangkan keputusan akademik tetap dijalankan oleh Academic sesuai policy.

## 9. Boundary Modul Akademik

### 9.1 Tanggung Jawab Akademik

Akademik menjadi source of truth untuk mahasiswa aktif, NIM, kalender akademik operasional, kurikulum, mata kuliah, kelas, KRS, nilai final, KHS, transkrip, yudisium, dan alumni.

### 9.2 Data yang Dimiliki Akademik

| Data | Status |
| --- | --- |
| Student | Source of truth |
| NIM | Source of truth |
| Curriculum | Source of truth Akademik |
| Course | Source of truth |
| Course offering/class | Source of truth |
| KRS | Source of truth |
| KRS approval | Source of truth |
| Grade input repository | Source akademik untuk input nilai |
| Final grade | Source of truth |
| KHS | Source of truth |
| Transcript | Source of truth |
| Alumni | Source of truth |

### 9.3 Data yang Tidak Boleh Dimiliki Akademik

Akademik tidak boleh menjadi pemilik payment, invoice, payment callback, credential user, data dosen utama, LMS progress, assessment attempt, dan notification preference. Akademik hanya boleh menyimpan clearance snapshot dari Finance dan lecturer snapshot dari HRIS.

### 9.4 Integrasi Akademik

| Arah Integrasi | Mekanisme |
| --- | --- |
| PMB ke Akademik | Handover applicant menjadi student |
| Finance ke Akademik | Clearance snapshot |
| HRIS ke Akademik | Lecturer active read model |
| Akademik ke LMS | Class sync dan enrollment sync |
| LMS ke Akademik | Grade input |
| Assessment ke Akademik | Assessment result |
| Akademik ke Portal | KRS, KHS, transkrip, notification |

### 9.5 Boundary Rule Akademik

Student hanya dibuat oleh Akademik setelah PMB handover valid.

Generate NIM hanya dilakukan oleh Akademik.

applicant_ref_id pada student wajib unique.

KRS hanya boleh dibuat dan difinalisasi di Akademik.

Clearance harus dibaca dari Finance API/snapshot.

Jika Finance down, proses yang membutuhkan clearance real-time masuk pending review sesuai policy.

Final grade hanya dimiliki Akademik.

LMS dan Assessment hanya memberikan grade input, bukan final grade.

Academic class menjadi dasar pembentukan kelas LMS.

Akademik tidak boleh membuat data dosen utama; data dosen berasal dari HRIS.

## 10. Boundary Modul HRIS/SDM

### 10.1 Tanggung Jawab HRIS

HRIS menjadi source of truth untuk pegawai, dosen, homebase, unit kerja, jabatan, status aktif, dan data SDM lain.

### 10.2 Data yang Dimiliki HRIS

| Data | Status |
| --- | --- |
| Employee | Source of truth |
| Lecturer | Source of truth |
| Homebase | Source of truth |
| Work unit | Source of truth |
| Position | Source of truth |
| Employment status | Source of truth |
| Lecturer active status | Source of truth |
| BKD reference | Source of truth HRIS |

### 10.3 Data yang Tidak Boleh Dimiliki HRIS

HRIS tidak boleh menjadi pemilik kelas akademik, KRS, nilai, invoice, payment, LMS session, dan assessment attempt. HRIS juga tidak boleh menjadi authority login; identity tetap Core.

### 10.4 Integrasi HRIS

| Arah Integrasi | Mekanisme |
| --- | --- |
| Core ke HRIS | Person reference |
| HRIS ke Academic | Lecturer active read model |
| HRIS ke LMS | Lecturer snapshot |
| HRIS ke Portal | Workspace dosen dan data profil ringkas |

### 10.5 Boundary Rule HRIS

Academic dan LMS tidak boleh membuat data dosen mandiri.

Dosen yang tidak aktif tidak boleh dipakai untuk plotting kelas baru.

Modul lain boleh menyimpan lecturer_ref_id dan snapshot.

Perubahan status dosen wajib dipublish sebagai event.

HRIS tidak boleh membuat user credential; credential tetap di Core.

## 11. Boundary Modul LMS

### 11.1 Tanggung Jawab LMS

LMS mengelola proses pembelajaran online seperti kelas online, enrollment LMS, sesi, materi, tugas, presensi, progress, diskusi, dan grade input.

### 11.2 Data yang Dimiliki LMS

| Data | Status |
| --- | --- |
| LMS class | Source of truth LMS, berasal dari Academic class snapshot |
| LMS enrollment | Source of truth LMS, berasal dari KRS approved |
| Session | Source of truth LMS |
| Material | Source of truth LMS |
| Assignment | Source of truth LMS |
| Submission | Source of truth LMS |
| Attendance | Source of truth LMS |
| Learning progress | Source of truth LMS |
| LMS grade input | Source of truth LMS sebagai input |

### 11.3 Data yang Tidak Boleh Dimiliki LMS

LMS tidak boleh membuat kelas akademik mandiri, tidak boleh membuat mahasiswa, tidak boleh menentukan final grade, tidak boleh mengubah KRS, dan tidak boleh menjadi pemilik data dosen.

### 11.4 Integrasi LMS

| Arah Integrasi | Mekanisme |
| --- | --- |
| Academic ke LMS | Class sync |
| Academic ke LMS | Enrollment sync dari KRS approved |
| HRIS ke LMS | Lecturer snapshot |
| Assessment ke LMS | Assessment result |
| LMS ke Academic | Grade input sync |
| LMS ke Portal | Activity dan notification |

### 11.5 Boundary Rule LMS

LMS class wajib memiliki academic_class_ref_id.

LMS enrollment wajib berasal dari KRS approved.

Duplicate class sync tidak boleh membuat kelas ganda.

Duplicate enrollment sync tidak boleh membuat enrollment ganda.

LMS grade input tidak otomatis menjadi final grade.

Finalisasi nilai tetap dilakukan oleh Academic.

LMS tetap dapat berjalan dengan snapshot terakhir jika Academic sementara down.

Jika data snapshot stale, UI wajib menampilkan status sinkronisasi terakhir.

## 12. Boundary Modul Assessment

### 12.1 Tanggung Jawab Assessment

Assessment menjadi engine untuk CBT, quiz, survey, question bank, session, attempt, answer, scoring, dan result publish. Assessment bersifat reusable dan dapat dipakai oleh PMB, LMS, maupun Academic.

### 12.2 Data yang Dimiliki Assessment

| Data | Status |
| --- | --- |
| Question bank | Source of truth |
| Question version | Source of truth |
| Assessment session | Source of truth |
| Participant context | Source of truth Assessment |
| Attempt | Source of truth |
| Answer | Source of truth |
| Scoring result | Source of truth Assessment |
| Result publish log | Source of truth |

### 12.3 Data yang Tidak Boleh Dimiliki Assessment

Assessment tidak boleh menentukan kelulusan PMB secara final, tidak boleh menentukan final grade akademik, tidak boleh membuat student, dan tidak boleh mengubah status KRS.

### 12.4 Integrasi Assessment

| Arah Integrasi | Mekanisme |
| --- | --- |
| PMB ke Assessment | CBT participant untuk seleksi |
| LMS ke Assessment | Quiz atau exam context |
| Academic ke Assessment | Ujian akademik jika dibutuhkan |
| Assessment ke PMB | Result seleksi |
| Assessment ke LMS | Result quiz/exam |
| Assessment ke Academic | Grade input/result |

### 12.5 Boundary Rule Assessment

Question yang sudah dipakai attempt tidak boleh diedit langsung.

Perubahan soal harus memakai versioning.

Attempt yang sudah submit bersifat immutable.

Result publish wajib idempotent.

Result hanya menjadi input bagi consumer.

Keputusan final tetap dilakukan oleh context owner, misalnya PMB untuk seleksi atau Academic untuk nilai final.

## 13. Boundary Modul Portal

### 13.1 Tanggung Jawab Portal

Portal menjadi presentation layer untuk dashboard role-based, notification center, shortcut, user preference, activity log, dan executive dashboard. Portal bukan pemilik transaksi bisnis utama.

### 13.2 Data yang Dimiliki Portal

| Data | Status |
| --- | --- |
| Notification | Source of truth Portal |
| Notification read marker | Source of truth Portal |
| User preference | Source of truth Portal |
| Shortcut | Source of truth Portal |
| Activity log view | Source of truth Portal |
| Dashboard read model | Snapshot/read model |
| Executive dashboard projection | Snapshot/read model |

### 13.3 Data yang Tidak Boleh Dimiliki Portal

Portal tidak boleh menjadi pemilik applicant, invoice, payment, student, KRS, final grade, LMS progress source, atau assessment result source. Portal hanya menampilkan data dari modul sumber.

### 13.4 Integrasi Portal

| Arah Integrasi | Mekanisme |
| --- | --- |
| Semua modul ke Portal | Notification event |
| PMB ke Portal | Applicant status |
| Finance ke Portal | Invoice dan payment status |
| Academic ke Portal | KRS, KHS, transkrip |
| LMS ke Portal | LMS activity summary |
| Assessment ke Portal | Assessment notification |
| Portal ke user | Dashboard dan notification center |

### 13.5 Boundary Rule Portal

Portal tidak boleh mengubah status bisnis sumber secara langsung.

Action dari Portal harus memanggil API modul pemilik.

Dashboard wajib menampilkan refreshed_at atau synced_at.

Data stale harus diberi label.

Portal down tidak boleh menghentikan transaksi PMB, Finance, Academic, LMS, atau Assessment.

Notification delivery wajib idempotent agar event duplikat tidak membuat notifikasi ganda.

## 14. Boundary Cross-Module Flow

### 14.1 Lead to Applicant

| Area | Modul Pemilik |
| --- | --- |
| Lead | CRM |
| Applicant | PMB |
| Conversion log | CRM dan PMB sesuai domain |
| Applicant status | PMB |
| Notification | Portal |

Aturan: 1. CRM tidak boleh insert langsung ke pmb_db. 2. PMB membuat applicant melalui API resmi. 3. CRM menyimpan applicant_ref_id. 4. Duplicate conversion wajib aman.

### 14.2 Applicant to Payment

| Area | Modul Pemilik |
| --- | --- |
| Applicant | PMB |
| Invoice | Finance |
| Payment | Finance |
| Payment status snapshot di PMB | PMB sebagai read model |
| Notification | Portal |

Aturan: 1. PMB hanya request invoice. 2. Finance membuat invoice. 3. Payment status final tetap dari Finance. 4. PMB menyimpan snapshot untuk tampilan applicant.

### 14.3 Applicant to Student

| Area | Modul Pemilik |
| --- | --- |
| Applicant | PMB |
| Handover | PMB |
| Student | Academic |
| NIM | Academic |
| Student reference di PMB | PMB sebagai reference |

Aturan: 1. PMB tidak boleh membuat student. 2. Academic tidak boleh membuat student tanpa handover valid. 3. applicant_ref_id wajib unique di Academic. 4. Duplicate handover tidak boleh membuat student/NIM ganda.

### 14.4 KRS to LMS

| Area | Modul Pemilik |
| --- | --- |
| Student | Academic |
| KRS | Academic |
| Class | Academic |
| LMS class | LMS |
| LMS enrollment | LMS |
| Learning activity | LMS |

Aturan: 1. Kelas akademik dibuat di Academic. 2. LMS class dibuat dari class sync. 3. Enrollment LMS dibuat dari KRS approved. 4. LMS tidak boleh membuat kelas akademik mandiri.

### 14.5 Grade Input to Final Grade

| Area | Modul Pemilik |
| --- | --- |
| Activity score | LMS atau Assessment |
| Grade input | LMS/Assessment sebagai source input |
| Grade repository | Academic |
| Final grade | Academic |
| KHS/Transcript | Academic |

Aturan: 1. LMS dan Assessment hanya mengirim grade input. 2. Academic melakukan validasi, komposisi, dan finalisasi. 3. Final grade tidak boleh diubah oleh LMS atau Assessment. 4. Koreksi nilai final wajib memiliki reason dan audit.

## 15. External Reference Standard

Setiap relasi lintas modul harus memakai external reference.

Contoh:

| Field | Modul Penyimpan | Mengarah ke Modul |
| --- | --- | --- |
| person_ref_id | PMB, HRIS, Academic, LMS | Core |
| user_ref_id | Portal, audit lokal | Core |
| study_program_ref_id | PMB, Academic, HRIS | Referensi |
| academic_period_ref_id | PMB, Finance, Academic, LMS | Referensi |
| lead_ref_id | PMB | CRM |
| applicant_ref_id | Finance, Academic | PMB |
| invoice_ref_id | PMB, Portal | Finance |
| student_ref_id | Finance, LMS, Portal | Academic |
| lecturer_ref_id | Academic, LMS | HRIS |
| academic_class_ref_id | LMS | Academic |
| assessment_session_ref_id | PMB, LMS, Academic | Assessment |

Aturan: 1. External reference tidak memakai FK lintas database. 2. Validasi external reference dilakukan melalui API atau event. 3. Snapshot wajib menyimpan source_event_key, synced_at, dan source_module. 4. Snapshot tidak boleh dipakai sebagai laporan final tanpa reconciliation.

## 16. Snapshot dan Read Model Boundary

Setiap modul boleh menyimpan snapshot data dari modul lain dengan batasan berikut:

| Snapshot | Disimpan di | Source of Truth |
| --- | --- | --- |
| Person snapshot | PMB, HRIS, Academic, LMS, Portal | Core |
| Reference snapshot | PMB, Finance, Academic, LMS | Referensi |
| Payment status snapshot | PMB, Academic, Portal | Finance |
| Clearance snapshot | Academic, LMS, Portal | Finance |
| Student snapshot | Finance, LMS, Portal | Academic |
| Lecturer snapshot | Academic, LMS | HRIS |
| Class snapshot | LMS, Portal | Academic |
| Assessment result snapshot | PMB, LMS, Academic | Assessment |

Aturan snapshot: 1. Snapshot hanya untuk kebutuhan tampilan dan operasi terbatas. 2. Snapshot wajib memiliki metadata sinkronisasi. 3. Snapshot stale harus ditampilkan di UI. 4. Mismatch antara snapshot dan source harus masuk reconciliation. 5. Laporan final lintas modul harus menggunakan data source atau warehouse yang sudah direkonsiliasi.

## 17. Checklist Finalisasi Module Boundary

| Checklist | Status |
| --- | --- |
| Setiap modul sudah memiliki database boundary | Belum/Sudah |
| Source of truth setiap domain sudah jelas | Belum/Sudah |
| Data yang boleh disimpan sebagai snapshot sudah didefinisikan | Belum/Sudah |
| Data yang tidak boleh dimiliki setiap modul sudah didefinisikan | Belum/Sudah |
| Cross-module API command sudah diidentifikasi | Belum/Sudah |
| Cross-module event sudah diidentifikasi | Belum/Sudah |
| External reference sudah distandarkan | Belum/Sudah |
| Write lintas modul langsung sudah dilarang | Belum/Sudah |
| Direct cross-database join sudah dilarang | Belum/Sudah |
| Modul consumer sudah wajib idempotent | Belum/Sudah |
| Degraded mode setiap modul sudah didefinisikan | Belum/Sudah |
| Reconciliation area sudah didefinisikan | Belum/Sudah |
| Boundary sudah disetujui Product Owner | Belum/Sudah |
| Boundary sudah disetujui Technical Lead | Belum/Sudah |
| Boundary sudah disetujui DBA | Belum/Sudah |
| Boundary sudah disetujui Owner Modul | Belum/Sudah |

## 18. Output dari Tahap Finalisasi Module Boundary

Output yang harus dihasilkan dari tahap ini adalah:

Dokumen Module Boundary Final.

Daftar database per modul.

Daftar source of truth per domain.

Daftar tabel utama per modul.

Daftar data yang tidak boleh dimiliki setiap modul.

Daftar external reference lintas modul.

Daftar snapshot/read model lintas modul.

Daftar API command lintas modul.

Daftar event lintas modul.

Daftar degraded mode per modul.

Daftar reconciliation area.

Sign-off dari Product Owner, Technical Lead, DBA, Backend Lead, QA/UAT Lead, DevOps/SRE, dan Owner Modul.

## 19. Acceptance Criteria Finalisasi Module Boundary

Tahap finalisasi module boundary dinyatakan selesai apabila:

Tidak ada domain data yang memiliki dua source of truth.

Tidak ada modul yang memiliki credential, password, atau session selain Core.

Tidak ada modul yang melakukan write langsung ke database modul lain.

Tidak ada desain FK lintas database.

Tidak ada direct cross-database join untuk transaksi online.

Semua relasi lintas modul sudah memakai external reference.

Semua proses kritis sudah ditandai sebagai idempotent.

Semua perubahan penting sudah memiliki rencana outbox event.

Semua consumer event sudah memiliki inbox dan duplicate handling.

Semua snapshot/read model sudah memiliki metadata source_module, source_event_key, dan synced_at.

Semua area mismatch sudah masuk daftar reconciliation.

Semua owner modul menyetujui boundary masing-masing.

Technical Lead menyetujui kelayakan implementasi.

DBA menyetujui boundary database dan constraint lokal.

QA/UAT Lead menyetujui bahwa boundary dapat diuji melalui test scenario.

## 20. Risiko Jika Module Boundary Tidak Difinalisasi

Jika module boundary tidak difinalisasi, risiko yang muncul adalah:

Data applicant, student, payment, dan grade dapat terduplikasi.

Developer membuat direct query lintas database.

Modul saling bergantung terlalu kuat.

Gangguan satu database dapat menjatuhkan proses lintas modul.

Audit trail sulit ditelusuri.

Payment status bisa berbeda antara PMB, Finance, dan Academic.

LMS dapat membuat kelas yang tidak valid secara akademik.

Assessment result dapat dianggap final tanpa validasi owner.

Portal dapat berubah menjadi sumber data bisnis yang salah.

Reconciliation menjadi sulit karena source of truth tidak jelas.

## 21. Rekomendasi Keputusan Final

Dengan mempertimbangkan kebutuhan ERP Pendidikan / SIAKAD Terintegrasi UNSIA, maka module boundary final yang direkomendasikan adalah:

Core sebagai identity dan access authority.

Referensi sebagai master data authority.

CRM sebagai lead dan marketing authority.

PMB sebagai applicant authority.

Finance sebagai invoice, payment, dan clearance authority.

Academic sebagai student, KRS, class, final grade, KHS, transcript, dan alumni authority.

HRIS sebagai lecturer dan employee authority.

LMS sebagai learning delivery dan learning activity authority.

Assessment sebagai assessment engine dan scoring authority.

Portal sebagai notification, dashboard, dan user workspace authority.

Setiap modul harus mempertahankan ownership data masing-masing, sedangkan kebutuhan lintas modul diselesaikan melalui API, event, snapshot, read model, degraded mode, dan reconciliation.


# BAGIAN - FINALISASI API CONTRACT ERP UNSIA

_Sumber file: `Finalisasi API Contract.docx`_

## FINALISASI API CONTRACT

## ERP Pendidikan / SIAKAD Terintegrasi UNSIA

## 1. Tujuan Finalisasi API Contract

Finalisasi API Contract bertujuan menetapkan standar komunikasi antar frontend, backend service, modul internal, service account, event monitoring, dan sistem eksternal dalam ERP Pendidikan / SIAKAD Terintegrasi UNSIA.

API Contract ini menjadi acuan untuk:

Backend implementation.

Frontend integration.

Service-to-service communication.

API gateway configuration.

Swagger/OpenAPI documentation.

API contract testing.

Integration testing.

UAT lintas modul.

Security review.

Regression test sebelum release.

Prinsip utama API Contract adalah semua endpoint harus konsisten dari sisi URL, method, header, request body, response body, error code, authorization, data scope, idempotency, audit, dan integration traceability.

## 2. Prinsip Utama API Contract

API ERP UNSIA menggunakan prinsip:

API-first, Contract-first, Secure-by-default, Idempotent for critical command, dan Observable by design.

Prinsip wajib:

Semua endpoint menggunakan prefix versi /api/v1.

Semua endpoint protected wajib memakai Bearer Token.

Semua endpoint protected wajib menerima X-Application-Code.

Semua endpoint protected wajib menerima X-Active-Role.

Semua endpoint protected wajib menerima X-Correlation-Id.

Endpoint command kritis wajib menerima Idempotency-Key.

Service-to-service call wajib memakai X-Service-Token.

Payment callback wajib validasi provider signature.

Semua response wajib memakai envelope standar.

Semua error wajib memakai error envelope standar.

Backend wajib validasi permission dan data scope.

Cross-domain write hanya boleh melalui API command atau event resmi.

Modul tidak boleh melakukan direct database write ke modul lain.

API tidak boleh membuka data lintas scope.

Endpoint yang mengubah status wajib mengikuti state machine.

Aksi sensitif wajib audit.

API lintas modul wajib traceable melalui correlation_id.

Breaking change wajib naik versi API, misalnya /api/v2.

## 3. API Base URL

### 3.1 Environment

| Environment | Base URL |
| --- | --- |
| Local | http://localhost:8000 |
| Staging | https://staging-api.unsia.ac.id |
| Production | https://api.unsia.ac.id |

### 3.2 API Versioning

Semua endpoint versi awal menggunakan:

/api/v1

Aturan versioning:

Perubahan minor yang backward-compatible tetap di /api/v1.

Penambahan field optional masih boleh di /api/v1.

Penghapusan field response tidak boleh dilakukan di versi yang sama.

Perubahan tipe data field wajib membuat versi baru.

Perubahan struktur payload utama wajib membuat /api/v2.

Endpoint lama harus diberi masa deprecation sebelum dimatikan.

## 4. Standar Header API

### 4.1 Header Wajib Endpoint Protected

Authorization: Bearer <access_token>
X-Application-Code: <application_code>
X-Active-Role: <role_code>
X-Correlation-Id: <uuid>
Accept: application/json
Content-Type: application/json

### 4.2 Header Tambahan untuk Command Kritis

Idempotency-Key: <deterministic_business_key>

### 4.3 Header untuk Service-to-Service

X-Service-Token: <service_token>
X-Service-Name: <caller_service_name>
X-Correlation-Id: <uuid>

### 4.4 Header untuk Payment Callback

X-Provider-Signature: <provider_signature>
X-Provider-Event-Id: <provider_event_id>
X-Correlation-Id: <uuid>

## 5. Security Scheme

### 5.1 Bearer Token

Digunakan oleh user/frontend untuk mengakses endpoint protected.

Authorization: Bearer <jwt_token>

Aturan:

Token diterbitkan oleh Core.

Token membawa user identity dan active role context.

Token expired harus menghasilkan 401.

Role tidak sesuai harus menghasilkan 403.

Data scope tidak sesuai harus menghasilkan 403.

### 5.2 Service Token

Digunakan untuk komunikasi antar service.

X-Service-Token: <service_token>

Aturan:

Service token diterbitkan/dikelola Core atau security service.

Service token memiliki allowed consumer dan allowed endpoint.

Service token harus bisa dirotasi.

Service token expired/revoked harus ditolak.

Service token tidak boleh digunakan untuk login UI.

### 5.3 Payment Provider Signature

Digunakan untuk validasi callback payment gateway.

Aturan:

Callback tanpa signature ditolak.

Signature invalid ditolak.

Provider event ID wajib unique.

Duplicate callback harus aman dan tidak membuat payment ganda.

## 6. Standar Response Envelope

### 6.1 Success Envelope

Semua response sukses wajib menggunakan struktur berikut:

{
  "success": true,
  "message": "Request processed successfully",
  "data": {},
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1"
  }
}

### 6.2 Success Envelope untuk List

{
  "success": true,
  "message": "Request processed successfully",
  "data": [],
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5
    },
    "sort": {
      "field": "created_at",
      "direction": "desc"
    }
  }
}

### 6.3 Error Envelope

{
  "success": false,
  "error": {
    "code": "FORBIDDEN_SCOPE",
    "message": "Anda tidak memiliki akses ke data ini.",
    "details": {}
  },
  "meta": {
    "trace_id": "uuid",
    "correlation_id": "uuid",
    "timestamp": "2026-06-22T10:00:00+07:00",
    "api_version": "v1"
  }
}

## 7. Standar HTTP Status Code

| HTTP Code | Makna | Contoh |
| --- | --- | --- |
| 200 | Request berhasil | Read, update sukses |
| 201 | Resource berhasil dibuat | Create applicant, create invoice |
| 202 | Request diterima untuk proses async | Sync, replay, retry |
| 400 | Bad request | Query parameter tidak valid |
| 401 | Unauthorized | Token tidak ada/expired |
| 403 | Forbidden | Permission/scope tidak sesuai |
| 404 | Not found | Resource tidak ditemukan |
| 409 | Conflict | State tidak valid, duplicate business process |
| 422 | Validation error | Field wajib kosong atau format salah |
| 429 | Too many requests | Rate limit |
| 500 | Internal server error | Error aplikasi |
| 502 | Integration failed | Dependency/service lain gagal |
| 503 | Service unavailable | Modul dependency sedang down |

## 8. Standar Error Code

| Error Code | HTTP | Deskripsi |
| --- | --- | --- |
| AUTH_REQUIRED | 401 | Token tidak ditemukan |
| TOKEN_EXPIRED | 401 | Token expired |
| TOKEN_INVALID | 401 | Token tidak valid |
| ROLE_NOT_ASSIGNED | 403 | User tidak memiliki active role |
| PERMISSION_DENIED | 403 | Permission tidak tersedia |
| FORBIDDEN_SCOPE | 403 | Data di luar scope user |
| SERVICE_TOKEN_INVALID | 401 | Service token salah |
| SERVICE_TOKEN_EXPIRED | 401 | Service token expired |
| VALIDATION_ERROR | 422 | Validasi field gagal |
| RESOURCE_NOT_FOUND | 404 | Data tidak ditemukan |
| STATE_TRANSITION_INVALID | 409 | Perubahan status tidak diizinkan |
| DUPLICATE_REQUEST | 409 | Request duplikat |
| IDEMPOTENCY_KEY_REQUIRED | 422 | Idempotency-Key wajib tetapi tidak dikirim |
| IDEMPOTENCY_PAYLOAD_MISMATCH | 409 | Key sama tetapi payload berbeda |
| BUSINESS_RULE_VIOLATION | 409 | Melanggar aturan bisnis |
| INTEGRATION_FAILED | 502 | Service dependency gagal |
| DEPENDENCY_UNAVAILABLE | 503 | Modul dependency down |
| PROVIDER_SIGNATURE_INVALID | 401 | Signature payment callback invalid |
| EVENT_SCHEMA_INVALID | 422 | Payload event tidak sesuai schema |
| RECONCILIATION_REQUIRED | 409 | Snapshot berbeda dengan source |
| INTERNAL_ERROR | 500 | Error internal |

## 9. Standar Pagination, Search, Filter, dan Sorting

### 9.1 Query Parameter List Page

GET /api/v1/pmb/applicants?page=1&per_page=20&search=andi&sort=created_at&direction=desc

### 9.2 Parameter Standar

| Parameter | Tipe | Default | Deskripsi |
| --- | --- | --- | --- |
| page | integer | 1 | Nomor halaman |
| per_page | integer | 20 | Jumlah data per halaman |
| search | string | null | Pencarian umum |
| sort | string | created_at | Field sorting |
| direction | enum | desc | asc atau desc |
| status | string | null | Filter status |
| date_from | date | null | Filter tanggal awal |
| date_to | date | null | Filter tanggal akhir |

### 9.3 Rule Pagination

Maksimal per_page adalah 100.

Semua list page P0 wajib pagination.

Search harus menggunakan index yang sesuai.

Sorting hanya boleh pada field yang di-whitelist.

Filter tidak boleh membuka data di luar scope user.

## 10. Standar Idempotency

### 10.1 Endpoint yang Wajib Idempotent

| Flow | Endpoint | Idempotency Key |
| --- | --- | --- |
| Switch role | POST /api/v1/auth/switch-role | core:switch-role:{user_id}:{role_id} |
| Convert lead | POST /api/v1/crm/leads/{id}/convert-to-applicant | crm:lead:{lead_id}:convert |
| Request invoice | POST /api/v1/pmb/applicants/{id}/request-invoice | pmb:invoice-request:{applicant_id} |
| Payment callback | POST /api/v1/finance/payment-callbacks/{provider} | finance:callback:{provider}:{provider_event_id} |
| Manual verification | POST /api/v1/finance/payment-verifications | finance:manual-verification:{payment_ref} |
| PMB handover | POST /api/v1/pmb/applicants/{id}/handover-to-academic | pmb:handover:{applicant_id} |
| Generate student/NIM | POST /api/v1/academic/students/generate-from-applicant | academic:generate-student:{applicant_ref_id} |
| Class sync | POST /api/v1/lms/classes/sync-from-academic | lms:class-sync:{academic_class_ref_id} |
| Enrollment sync | POST /api/v1/lms/enrollments/sync-from-krs | lms:enrollment-sync:{krs_item_ref_id} |
| Grade sync | POST /api/v1/lms/grade-syncs | lms:grade-sync:{source_grade_ref_id} |
| Result publish | POST /api/v1/assessment/results/publish | assessment:result-publish:{attempt_id} |
| DLQ replay | POST /api/v1/integration/dlq/{id}/replay | integration:dlq-replay:{dlq_id}:{reason_hash} |

### 10.2 Rule Idempotency

Endpoint kritis wajib menolak request tanpa Idempotency-Key.

Jika key sama dan payload sama, return response yang sama.

Jika key sama tetapi payload berbeda, return 409 IDEMPOTENCY_PAYLOAD_MISMATCH.

Idempotency record wajib menyimpan payload hash.

Idempotency record wajib menyimpan response hash atau response body.

Idempotency record wajib memiliki TTL sesuai kebijakan.

Idempotency tidak boleh menggantikan unique constraint database.

Idempotency wajib dikombinasikan dengan unique business key.

## 11. Standar Audit API

Aksi berikut wajib menulis audit log:

Login.

Refresh token.

Switch active role.

Impersonation.

Create/update/deactivate user.

Assign role.

Assign permission.

Assign scope.

Create/update/deactivate master data.

Submit applicant.

Verify/reject document.

Issue LoA.

Request invoice.

Process payment callback.

Manual payment verification.

Update clearance.

Handover applicant.

Generate student/NIM.

Submit/approve/reject KRS.

Finalize/correct grade.

Sync LMS class.

Sync enrollment.

Publish assessment result.

Replay DLQ.

Resolve reconciliation mismatch.

Audit minimal menyimpan:

actor_user_id
actor_person_ref_id
active_role
application_code
permission_code
module_code
resource_type
resource_id
action
old_value
new_value
reason
ip_address
user_agent
request_id
correlation_id
idempotency_key
created_at

## 12. Standar API Governance

### 12.1 Domain Ownership

Core hanya menulis ke core_db.

Referensi hanya menulis ke reference_db.

CRM hanya menulis ke crm_db.

PMB hanya menulis ke pmb_db.

Finance hanya menulis ke finance_db.

Academic hanya menulis ke academic_db.

HRIS hanya menulis ke hris_db.

LMS hanya menulis ke lms_db.

Assessment hanya menulis ke assessment_db.

Portal hanya menulis ke portal_db.

### 12.2 Cross-Domain Rule

| Kebutuhan | Pola Resmi |
| --- | --- |
| Write data domain lain | API command resmi |
| Read data domain lain | API query, snapshot, read model |
| Update snapshot | Event consumer |
| Reporting lintas modul | Read model/warehouse |
| Retry integrasi | Idempotency + retry queue |
| Data mismatch | Reconciliation |

### 12.3 Anti-pattern yang Dilarang

SELECT * FROM pmb_db.applicants a
JOIN finance_db.invoices i ON i.bill_to_ref_id = a.id;

Pola yang benar:

1. PMB membaca applicant lokal.
2. PMB membaca applicant_invoice_statuses lokal.
3. Jika butuh real-time, PMB memanggil Finance API.
4. Finance tetap source of truth invoice/payment.

## 13. API Contract per Modul

## 13.1 Core API

### 13.1.1 Login

POST /api/v1/auth/login

Public endpoint. Tidak memakai bearer token.

Request:

{
  "username": "user@unsia.ac.id",
  "password": "password",
  "captcha_token": "optional"
}

Response data:

{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "expires_in": 3600,
  "token_type": "Bearer"
}

Rule:

Credential harus valid.

User harus aktif.

Failed attempt policy berlaku.

Login sukses wajib audit.

Jika user multi-role, frontend menampilkan active role selector.

### 13.1.2 Refresh Token

POST /api/v1/auth/refresh

Rule:

Refresh token harus valid.

Session harus aktif.

Response mengembalikan access token baru.

Refresh token invalid menghasilkan 401.

### 13.1.3 Authenticated User Profile

GET /api/v1/auth/me

Response data minimal:

{
  "user_id": "uuid",
  "person_ref_id": "uuid",
  "name": "Nama User",
  "email": "user@unsia.ac.id",
  "active_role": "admin_pmb",
  "roles": [],
  "permissions": [],
  "data_scope": {
    "scope_type": "module_domain",
    "scope_value": "pmb"
  }
}

### 13.1.4 Switch Active Role

POST /api/v1/auth/switch-role

Wajib idempotent.

Request:

{
  "role_code": "kaprodi",
  "scope_type": "study_program",
  "scope_value": "uuid"
}

Rule:

Role harus assigned ke user.

Role harus aktif.

Scope harus valid.

Perubahan active role wajib audit.

Response mengembalikan profile/permission baru.

### 13.1.5 Application Launcher

GET /api/v1/applications

Rule:

Aplikasi tampil sesuai active role.

Shortcut mengikuti permission.

Application launcher tidak boleh menampilkan modul tanpa izin.

### 13.1.6 Impersonation

POST /api/v1/impersonations/start

Wajib idempotent dan wajib reason.

Request:

{
  "target_user_id": "uuid",
  "reason": "Investigasi kendala akun berdasarkan tiket support",
  "duration_minutes": 30
}

Rule:

Hanya role tertentu yang boleh impersonation.

Reason wajib.

Durasi wajib dibatasi.

Semua aksi dalam mode impersonation wajib audit.

## 13.2 Referensi API

### 13.2.1 Study Programs

GET /api/v1/ref/study-programs

Rule:

Endpoint dapat dipakai lintas modul.

Response hanya menampilkan prodi aktif kecuali parameter include_inactive=true untuk role admin.

Data ini menjadi referensi, bukan data transaksi.

### 13.2.2 Academic Years

GET /api/v1/ref/academic-years
POST /api/v1/ref/academic-years

Request create:

{
  "academic_year_code": "2026/2027",
  "name": "Tahun Akademik 2026/2027",
  "start_date": "2026-08-01",
  "end_date": "2027-07-31",
  "status": "DRAFT"
}

Rule:

Kode tahun ajaran unik.

Tanggal mulai harus lebih kecil dari tanggal selesai.

Aktivasi tahun ajaran mengikuti policy.

Perubahan status wajib audit.

### 13.2.3 Academic Periods

GET /api/v1/ref/academic-periods
POST /api/v1/ref/academic-periods

Request create:

{
  "academic_year_ref_id": "uuid",
  "period_code": "2026-GANJIL",
  "period_type": "REGULAR",
  "start_date": "2026-09-01",
  "end_date": "2027-01-31",
  "status": "DRAFT"
}

Rule:

Periode harus berada di bawah academic year.

Periode yang sudah dipakai transaksi tidak boleh hard delete.

Perubahan penting publish event referensi.

## 13.3 CRM API

### 13.3.1 Lead

GET /api/v1/crm/leads
POST /api/v1/crm/leads
GET /api/v1/crm/leads/{lead_id}
PATCH /api/v1/crm/leads/{lead_id}

Request create:

{
  "full_name": "Nama Calon Mahasiswa",
  "phone": "08123456789",
  "email": "calon@example.com",
  "campaign_ref_id": "uuid",
  "study_program_interest_ref_id": "uuid",
  "source": "agent",
  "agent_ref_id": "uuid"
}

Rule:

Agent hanya boleh membuat/melihat lead miliknya sendiri.

Admin CRM dapat melihat seluruh lead CRM domain.

Lead duplicate harus diberi flag atau ditolak sesuai policy.

Lead status mengikuti state machine CRM.

### 13.3.2 Convert Lead to Applicant

POST /api/v1/crm/leads/{lead_id}/convert-to-applicant

Wajib idempotent.

Request:

{
  "target_admission_wave_ref_id": "uuid",
  "study_program_ref_id": "uuid"
}

Rule:

Lead harus qualified.

Lead belum pernah dikonversi.

CRM memanggil PMB API secara resmi.

CRM menyimpan applicant_ref_id.

Duplicate request mengembalikan applicant existing.

## 13.4 PMB API

### 13.4.1 Applicant

GET /api/v1/pmb/applicants
POST /api/v1/pmb/applicants
GET /api/v1/pmb/applicants/{applicant_id}
PATCH /api/v1/pmb/applicants/{applicant_id}

Request create:

{
  "lead_ref_id": "uuid",
  "person_ref_id": "uuid",
  "full_name": "Nama Pendaftar",
  "email": "pendaftar@example.com",
  "phone": "08123456789",
  "study_program_ref_id": "uuid",
  "admission_wave_ref_id": "uuid"
}

Rule:

Applicant adalah source of truth PMB.

lead_ref_id tidak boleh dikonversi dua kali.

Pendaftar self hanya boleh melihat data sendiri.

Admin PMB dapat melihat data PMB domain.

Status applicant mengikuti state machine PMB.

### 13.4.2 Submit Applicant

POST /api/v1/pmb/applicants/{applicant_id}/submit

Rule:

Biodata minimum harus lengkap.

Status harus DRAFT.

Setelah submit, data tertentu terkunci.

Audit wajib.

### 13.4.3 Applicant Document

POST /api/v1/pmb/applicants/{applicant_id}/documents
POST /api/v1/pmb/applicants/{applicant_id}/documents/{document_id}/verify
POST /api/v1/pmb/applicants/{applicant_id}/documents/{document_id}/reject

Rule upload:

File type harus sesuai allowed type.

File size mengikuti policy.

Reupload membuat version baru.

Dokumen rejected wajib memiliki rejection reason.

Request reject:

{
  "reason": "Dokumen tidak terbaca jelas"
}

### 13.4.4 Request Invoice

POST /api/v1/pmb/applicants/{applicant_id}/request-invoice

Wajib idempotent.

Request:

{
  "invoice_type": "REGISTRATION",
  "academic_period_ref_id": "uuid",
  "payment_components": [
    {
      "component_ref_id": "uuid",
      "amount": 500000
    }
  ]
}

Rule:

PMB tidak membuat invoice lokal.

PMB memanggil Finance API.

Finance menjadi source of truth invoice.

PMB hanya menyimpan invoice/payment snapshot.

Duplicate request tidak membuat invoice ganda.

### 13.4.5 Issue LoA

POST /api/v1/pmb/applicants/{applicant_id}/issue-loa

Rule:

Dokumen wajib verified.

Payment policy harus valid.

Applicant harus accepted.

LoA wajib memiliki nomor unik.

Issue LoA wajib audit.

### 13.4.6 Handover to Academic

POST /api/v1/pmb/applicants/{applicant_id}/handover-to-academic

Wajib idempotent.

Request:

{
  "target_academic_period_ref_id": "uuid",
  "study_program_ref_id": "uuid",
  "handover_note": "Applicant siap dibuat mahasiswa"
}

Rule:

Applicant harus LoA issued.

Payment policy harus valid.

Dokumen harus lengkap.

PMB tidak membuat NIM.

PMB memanggil Academic API.

Duplicate handover tidak membuat student ganda.

Jika Academic down, handover masuk retry/pending.

## 13.5 Finance API

### 13.5.1 Invoice

POST /api/v1/finance/invoices
GET /api/v1/finance/invoices/{invoice_id}
GET /api/v1/finance/invoices

Request create:

{
  "bill_to_type": "APPLICANT",
  "bill_to_ref_id": "uuid",
  "academic_period_ref_id": "uuid",
  "invoice_type": "REGISTRATION",
  "items": [
    {
      "component_ref_id": "uuid",
      "description": "Biaya Pendaftaran",
      "amount": 500000
    }
  ],
  "due_date": "2026-07-31"
}

Rule:

Invoice hanya dibuat di Finance.

bill_to_ref_id adalah external reference.

Duplicate invoice request mengikuti idempotency key.

Invoice status mengikuti state machine Finance.

Invoice paid publish event payment/clearance.

### 13.5.2 Payment Callback

POST /api/v1/finance/payment-callbacks/{provider}

Wajib idempotent dan wajib validasi signature.

Request:

{
  "provider_event_id": "evt_123456",
  "provider_payment_ref": "pay_123456",
  "invoice_ref_id": "uuid",
  "paid_amount": 500000,
  "paid_at": "2026-06-22T10:00:00+07:00",
  "payment_method": "VA",
  "raw_payload": {}
}

Rule:

Signature provider wajib valid.

provider_event_id wajib unique.

Duplicate callback tidak membuat payment ganda.

Payment valid mengubah invoice status.

Finance publish finance.payment_paid.

Update clearance jika policy terpenuhi.

Callback gagal dicatat dengan error reason.

### 13.5.3 Manual Payment Verification

POST /api/v1/finance/payment-verifications

Wajib idempotent.

Request:

{
  "invoice_ref_id": "uuid",
  "paid_amount": 500000,
  "paid_at": "2026-06-22T10:00:00+07:00",
  "bank_account": "BCA",
  "proof_document_url": "signed-url",
  "verification_note": "Transfer valid"
}

Rule:

Hanya Admin Finance.

Bukti pembayaran wajib.

Verifikasi wajib audit.

Duplicate verification tidak membuat payment ganda.

### 13.5.4 Clearance

GET /api/v1/finance/clearances
PATCH /api/v1/finance/clearances/{clearance_id}

Query example:

GET /api/v1/finance/clearances?subject_type=STUDENT&subject_ref_id=uuid&service_type=KRS

Rule:

Finance adalah source of truth clearance.

Academic/LMS/PMB hanya membaca clearance.

Clearance update wajib publish event.

Clearance snapshot di modul lain bukan source of truth.

## 13.6 Academic API

### 13.6.1 Generate Student from Applicant

POST /api/v1/academic/students/generate-from-applicant

Wajib idempotent.

Request:

{
  "applicant_ref_id": "uuid",
  "person_ref_id": "uuid",
  "study_program_ref_id": "uuid",
  "academic_period_ref_id": "uuid",
  "loa_ref_id": "uuid"
}

Rule:

applicant_ref_id wajib unique.

Student hanya dibuat dari applicant valid.

Generate NIM hanya di Academic.

NIM wajib unique.

Duplicate request mengembalikan student existing.

Academic publish academic.student_created.

### 13.6.2 Student

GET /api/v1/academic/students
GET /api/v1/academic/students/{student_id}
PATCH /api/v1/academic/students/{student_id}

Rule:

Admin Akademik Biro dapat melihat global.

Kaprodi/Admin Prodi hanya melihat prodi assigned.

Mahasiswa hanya melihat dirinya sendiri.

Data scope wajib ditegakkan di backend.

### 13.6.3 Class / Course Offering

GET /api/v1/academic/classes
POST /api/v1/academic/classes
PATCH /api/v1/academic/classes/{class_id}

Request create:

{
  "course_ref_id": "uuid",
  "academic_period_ref_id": "uuid",
  "study_program_ref_id": "uuid",
  "lecturer_ref_id": "uuid",
  "class_code": "MNJ-101-A",
  "capacity": 40
}

Rule:

Dosen harus aktif dari HRIS snapshot/API.

Kelas dibuat oleh Academic.

LMS tidak boleh membuat kelas akademik.

Class opened publish event untuk LMS.

### 13.6.4 KRS

POST /api/v1/academic/krs
POST /api/v1/academic/krs/{krs_id}/submit
POST /api/v1/academic/krs/{krs_id}/approve
POST /api/v1/academic/krs/{krs_id}/reject

Rule:

Mahasiswa hanya membuat KRS sendiri.

Submit KRS harus sesuai periode aktif.

Dosen PA hanya approve mahasiswa bimbingan.

KRS final harus cek clearance Finance.

Jika Finance down dan policy real-time wajib, status menjadi PENDING_REVIEW.

Approved KRS publish event untuk LMS enrollment.

### 13.6.5 Grade

POST /api/v1/academic/grades/source-imports
POST /api/v1/academic/grades/{grade_id}/finalize
POST /api/v1/academic/grades/{grade_id}/correct

Rule:

LMS/Assessment hanya mengirim source grade.

Final grade hanya milik Academic.

Koreksi nilai wajib reason.

Finalisasi/koreksi nilai wajib audit.

Duplicate grade input tidak boleh membuat data ganda.

## 13.7 HRIS API

### 13.7.1 Lecturer

GET /api/v1/hris/lecturers
GET /api/v1/hris/lecturers/{lecturer_id}

Rule:

HRIS adalah source of truth dosen.

Academic dan LMS hanya membaca lecturer active read model.

Dosen nonaktif tidak boleh diplot ke kelas baru.

Perubahan status dosen publish event.

## 13.8 LMS API

### 13.8.1 Class Sync

POST /api/v1/lms/classes/sync-from-academic

Wajib idempotent.

Request:

{
  "academic_class_ref_id": "uuid",
  "course_ref_id": "uuid",
  "academic_period_ref_id": "uuid",
  "lecturer_ref_id": "uuid",
  "class_code": "MNJ-101-A"
}

Rule:

LMS class wajib berasal dari Academic class.

Duplicate sync tidak membuat kelas ganda.

LMS menyimpan academic class snapshot.

LMS tidak boleh mengubah class source.

### 13.8.2 Enrollment Sync

POST /api/v1/lms/enrollments/sync-from-krs

Wajib idempotent.

Request:

{
  "krs_item_ref_id": "uuid",
  "academic_class_ref_id": "uuid",
  "student_ref_id": "uuid",
  "enrollment_status": "ACTIVE"
}

Rule:

Enrollment berasal dari KRS approved.

Duplicate event tidak membuat enrollment ganda.

Student inactive tidak boleh aktif di LMS.

Enrollment update harus traceable.

### 13.8.3 Grade Sync

POST /api/v1/lms/grade-syncs

Wajib idempotent.

Request:

{
  "source_grade_ref_id": "uuid",
  "academic_class_ref_id": "uuid",
  "student_ref_id": "uuid",
  "score": 85,
  "score_component": "ASSIGNMENT",
  "submitted_at": "2026-06-22T10:00:00+07:00"
}

Rule:

LMS hanya mengirim grade input.

Academic tetap final grade owner.

Duplicate grade sync tidak membuat grade input ganda.

## 13.9 Assessment API

### 13.9.1 Assessment Session

POST /api/v1/assessment/sessions
GET /api/v1/assessment/sessions/{session_id}

Request:

{
  "context_type": "PMB_SELECTION",
  "context_ref_id": "uuid",
  "title": "Tes PMB Gelombang 1",
  "start_at": "2026-07-01T08:00:00+07:00",
  "end_at": "2026-07-01T10:00:00+07:00"
}

Rule:

Session harus memiliki context.

Participant harus berasal dari context owner.

Session status mengikuti state machine Assessment.

### 13.9.2 Attempt

POST /api/v1/assessment/attempts
POST /api/v1/assessment/attempts/{attempt_id}/submit

Rule:

Peserta hanya bisa attempt session yang assigned.

Attempt yang sudah submitted tidak boleh diubah.

Answer historis harus immutable.

### 13.9.3 Result Publish

POST /api/v1/assessment/results/publish

Wajib idempotent.

Request:

{
  "attempt_ref_id": "uuid",
  "context_type": "PMB_SELECTION",
  "context_ref_id": "uuid",
  "participant_ref_id": "uuid",
  "score": 87.5,
  "result_status": "PASSED"
}

Rule:

Result publish tidak boleh duplicate.

Result hanya input untuk PMB/LMS/Academic.

Keputusan final tetap di context owner.

Publish result wajib audit dan event.

## 13.10 Portal API

### 13.10.1 Dashboard

GET /api/v1/portal/dashboard

Rule:

Dashboard mengikuti active role.

Dashboard hanya membaca read model/snapshot.

Response wajib menampilkan refreshed_at.

Pimpinan hanya read-only aggregate.

Portal tidak boleh menjadi source of truth transaksi.

### 13.10.2 Notification

GET /api/v1/portal/notifications
POST /api/v1/portal/notifications
POST /api/v1/portal/notifications/{notification_id}/mark-read

Rule:

Notification event harus idempotent.

User hanya melihat notifikasi miliknya sendiri.

Link notifikasi harus menuju modul sumber.

Portal down tidak boleh menghentikan transaksi sumber.

## 13.11 Event Contract / Integration API

### 13.11.1 Event Catalog

GET /api/v1/integration/event-catalog

Rule:

Hanya Technical Admin/DevOps/QA/authorized role.

Menampilkan event name, version, publisher, consumer, payload schema, dan status.

Payload sensitif harus masked.

### 13.11.2 Outbox Monitoring

GET /api/v1/integration/outbox-events

Rule:

Read-only untuk auditor.

Technical admin dapat melihat retry status.

Payload sensitif dimasked.

### 13.11.3 Inbox Monitoring

GET /api/v1/integration/inbox-events

Rule:

Harus menampilkan event_key, consumer, status, processed_at.

Duplicate event ditandai IGNORED_DUPLICATE.

### 13.11.4 DLQ Replay

POST /api/v1/integration/dlq/{dlq_id}/replay

Wajib idempotent dan wajib reason.

Request:

{
  "reason": "Schema sudah diperbaiki dan event perlu diproses ulang",
  "replay_mode": "same_payload"
}

Rule:

Hanya DevOps/SRE/Technical Admin authorized.

Reason wajib.

Replay wajib audit.

Replay tidak boleh membuat data ganda.

### 13.11.5 Reconciliation Mismatch

GET /api/v1/integration/reconciliation-mismatches
POST /api/v1/integration/reconciliation-mismatches/{mismatch_id}/resolve

Request resolve:

{
  "action": "mark_corrected",
  "reason": "Snapshot telah diperbarui dari source of truth",
  "correction_payload": {}
}

Rule:

Resolve mismatch wajib reason.

Status hanya boleh CORRECTED, IGNORED, atau PENDING_REVIEW.

Semua aksi resolve wajib audit.

## 14. Endpoint Prioritas P0

Endpoint berikut wajib diprioritaskan pada MVP:

| Modul | Endpoint P0 |
| --- | --- |
| Core | Login, refresh, auth me, switch role, applications |
| Referensi | Study programs, academic years, academic periods |
| CRM | Lead create, lead read, convert lead |
| PMB | Applicant create/read, submit, document upload/verify, request invoice, issue LoA, handover |
| Finance | Invoice create/read, payment callback, manual verification, clearance read |
| Academic | Generate student, student read, class create/read, KRS submit/approve, grade source import, grade finalize |
| HRIS | Lecturer active read |
| LMS | Class sync, enrollment sync, grade sync |
| Assessment | Session create, attempt start/submit, result publish |
| Portal | Dashboard, notification |
| Integration | Event catalog, outbox, inbox, DLQ replay, reconciliation mismatch |

## 15. API Contract Validation Rule

Setiap endpoint harus memiliki:

Method.

URL path.

Operation ID.

Summary.

Description.

Request header.

Path parameter.

Query parameter.

Request body schema.

Response success schema.

Response error schema.

Permission requirement.

Data scope rule.

Idempotency rule.

Audit rule.

Event produced jika ada.

Event consumed jika ada.

Retry policy jika integrasi.

Error code.

UAT scenario.

## 16. Template Final API Contract per Endpoint

Gunakan template berikut untuk semua endpoint:

Endpoint Name      :
Module             :
Method             :
Path               :
Operation ID       :
Description        :
Caller             :
Security Scheme    :
Required Headers   :
Path Parameters    :
Query Parameters   :
Request Body       :
Success Response   :
Error Response     :
Permission         :
Data Scope         :
Idempotency        :
Audit              :
State Machine      :
Event Published    :
Event Consumed     :
Integration Target :
Retry Policy       :
Rate Limit         :
Validation Rule    :
Business Rule      :
UAT Scenario       :
Owner              :
Status             :

## 17. Contoh Final API Contract Endpoint

### Endpoint: PMB Handover to Academic

Endpoint Name      : Handover Applicant to Academic
Module             : PMB
Method             : POST
Path               : /api/v1/pmb/applicants/{applicant_id}/handover-to-academic
Operation ID       : handoverApplicantToAcademic
Description        : Mengirim applicant yang sudah memenuhi syarat menjadi mahasiswa ke Academic.
Caller             : Admin PMB
Security Scheme    : Bearer Auth
Required Headers   : Authorization, X-Application-Code, X-Active-Role, X-Correlation-Id, Idempotency-Key
Path Parameters    : applicant_id
Request Body       : target_academic_period_ref_id, study_program_ref_id, handover_note
Success Response   : student_ref_id, nim, handover_status
Error Response     : 401, 403, 404, 409, 422, 502
Permission         : pmb.handover.execute
Data Scope         : PMB domain
Idempotency        : pmb:handover:{applicant_id}
Audit              : wajib
State Machine      : LOA_ISSUED -> HANDED_OVER
Event Published    : pmb.ready_for_academic
Event Consumed     : academic.student_created
Integration Target : Academic API
Retry Policy       : retry jika Academic temporary unavailable
Validation Rule    : applicant accepted, LoA issued, payment policy valid
Business Rule      : PMB tidak membuat student/NIM
UAT Scenario       : duplicate handover tidak membuat student ganda
Owner              : PMB Owner, Academic Owner
Status             : Final draft

## 18. API Contract Test Scenario

| Test ID | Scenario | Expected Result |
| --- | --- | --- |
| API-001 | Endpoint protected tanpa token | 401 AUTH_REQUIRED |
| API-002 | Token expired | 401 TOKEN_EXPIRED |
| API-003 | Active role tidak dimiliki user | 403 ROLE_NOT_ASSIGNED |
| API-004 | Permission tidak tersedia | 403 PERMISSION_DENIED |
| API-005 | Scope tidak sesuai | 403 FORBIDDEN_SCOPE |
| API-006 | Command kritis tanpa Idempotency-Key | 422 IDEMPOTENCY_KEY_REQUIRED |
| API-007 | Idempotency key sama payload sama | Return response yang sama |
| API-008 | Idempotency key sama payload beda | 409 IDEMPOTENCY_PAYLOAD_MISMATCH |
| API-009 | Payment callback signature invalid | 401 PROVIDER_SIGNATURE_INVALID |
| API-010 | Duplicate payment callback | Payment tidak bertambah |
| API-011 | Handover duplicate | Student/NIM tidak bertambah |
| API-012 | Generate NIM duplicate | Return student existing |
| API-013 | KRS approve oleh bukan dosen PA | 403 FORBIDDEN_SCOPE |
| API-014 | Dosen akses kelas lain | 403 FORBIDDEN_SCOPE |
| API-015 | Endpoint dependency down | 502 atau 503 sesuai kondisi |
| API-016 | Response sukses | Memakai success envelope |
| API-017 | Response error | Memakai error envelope |
| API-018 | Traceability | Response memiliki trace_id/correlation_id |
| API-019 | Sensitive action | Audit log tercatat |
| API-020 | List endpoint | Pagination, filter, sorting berjalan |

## 19. Checklist Finalisasi API Contract

| Checklist | Status |
| --- | --- |
| Semua endpoint memakai /api/v1 | Belum/Sudah |
| Semua endpoint punya operation ID | Belum/Sudah |
| Semua endpoint protected punya security scheme | Belum/Sudah |
| Semua endpoint protected menerima X-Application-Code | Belum/Sudah |
| Semua endpoint protected menerima X-Active-Role | Belum/Sudah |
| Semua endpoint protected menerima X-Correlation-Id | Belum/Sudah |
| Command kritis memakai Idempotency-Key | Belum/Sudah |
| Semua response sukses memakai success envelope | Belum/Sudah |
| Semua response error memakai error envelope | Belum/Sudah |
| Semua endpoint punya error code standar | Belum/Sudah |
| Semua endpoint punya permission mapping | Belum/Sudah |
| Semua endpoint punya data scope rule | Belum/Sudah |
| Semua aksi sensitif punya audit rule | Belum/Sudah |
| Semua cross-module write melalui API resmi | Belum/Sudah |
| Semua service-to-service memakai service token | Belum/Sudah |
| Payment callback memakai signature validation | Belum/Sudah |
| Semua endpoint P0 punya API contract test | Belum/Sudah |
| Swagger/OpenAPI sudah sinkron dengan FSD | Belum/Sudah |
| QA/UAT scenario sudah mengacu ke endpoint | Belum/Sudah |
| Technical Lead sign-off | Belum/Sudah |
| Backend Lead sign-off | Belum/Sudah |
| Frontend Lead sign-off | Belum/Sudah |
| QA/UAT Lead sign-off | Belum/Sudah |
| Security/DevOps sign-off | Belum/Sudah |
| Owner Modul sign-off | Belum/Sudah |

## 20. Acceptance Criteria Finalisasi API Contract

API Contract dinyatakan final apabila:

Seluruh modul memiliki daftar endpoint final.

Semua endpoint memiliki method, path, request, response, dan error code.

Semua endpoint protected memiliki authorization rule.

Semua endpoint protected memiliki permission dan data scope rule.

Semua command kritis sudah ditandai idempotent.

Semua command kritis memiliki idempotency key deterministik.

Semua cross-module command memiliki service token atau bearer auth sesuai konteks.

Semua response menggunakan envelope standar.

Semua error menggunakan error envelope standar.

Semua API lintas modul membawa correlation ID.

Semua aksi sensitif memiliki audit rule.

Semua endpoint P0 masuk ke API contract test.

Swagger/OpenAPI dapat dijalankan di Swagger UI.

Frontend dapat menggunakan contract tanpa bertanya struktur response tambahan.

QA dapat membuat test case berdasarkan API contract.

Tidak ada direct database write lintas modul.

Tidak ada API yang bypass source of truth.

Tidak ada endpoint yang membuka data lintas scope.

Technical Lead, Backend Lead, Frontend Lead, QA/UAT Lead, DevOps/Security, dan Owner Modul menyetujui kontrak.

## 21. Keputusan Final API Contract

Keputusan final API Contract ERP UNSIA adalah:

API memakai standar REST dengan prefix /api/v1.

Semua endpoint protected memakai Core Auth.

Semua endpoint protected wajib membawa X-Application-Code, X-Active-Role, dan X-Correlation-Id.

Endpoint command kritis wajib memakai Idempotency-Key.

Service-to-service call wajib memakai X-Service-Token.

Payment callback wajib memakai provider signature validation.

Semua response memakai success/error envelope standar.

Semua endpoint wajib memiliki permission dan data scope rule.

Backend menjadi enforcement utama untuk RBAC dan scope.

Cross-domain write hanya melalui API command atau event resmi.

Semua proses kritis wajib idempotent dan audit-ready.

API Contract menjadi sumber utama untuk Swagger, backend implementation, frontend integration, API test, integration test, dan UAT.


# BAGIAN - DBML GLOBAL UNSIA

_Sumber file: `DBML_Global_UNSIA.dbml`_

```dbml
// DBML Global UNSIA v1.0.1 Event Contract Updated
// Dirapikan dari DBML Global UNSIA v6.4 ERD Detailed FULL.
// Catatan: file ini mempertahankan struktur tabel dan relasi baseline. Update v1.0.1 menambahkan standar Event Contract: outbox_events, inbox_events, idempotency_keys per modul, event_contract catalog, retry, DLQ, correlation/causation id, source_event_key, synced_at, dan reconciliation_mismatch_logs.


Project unsia_erp_global_v6_dba_reviewed {
  database_type: 'PostgreSQL'
  Note: 'UNSIA ERP / SIAKAD Terintegrasi v6 - DBA Reviewed. Update v1.0.1 menambahkan kontrol Event Contract: event catalog, transactional outbox, inbox idempotent consumer, retry, DLQ, correlation_id, causation_id, source_event_key, synced_at, dan reconciliation mismatch log untuk mendukung distributed modular database.'
}

/* =========================
   CORE / SSO / RBAC
========================= */

Table core.persons {
  id uuid [pk]
  full_name varchar [not null]
  email varchar
  phone varchar
  identity_number varchar
  gender varchar
  birth_place varchar
  birth_date date
  religion_id uuid
  country_id uuid
  province_id uuid
  city_id uuid
  district_id uuid
  village_id uuid
  address text
  created_at timestamp
  updated_at timestamp
}

Table core.users {
  id uuid [pk]
  person_id uuid [not null]
  username varchar [unique, not null]
  email varchar [unique, not null]
  password_hash text [not null]
  status varchar [not null, note: 'active, inactive, suspended']
  last_login_at timestamp
  created_at timestamp
  updated_at timestamp
}

Table core.roles {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  scope_type varchar [note: 'global, prodi, module, self']
  is_system boolean [default: false]
  is_active boolean [default: true]
}

Table core.permissions {
  id uuid [pk]
  code varchar [unique, not null, note: 'module.resource.action']
  module varchar [not null]
  resource varchar [not null]
  action varchar [not null]
  is_active boolean [default: true]
}

Table core.user_roles {
  id uuid [pk]
  user_id uuid [not null]
  role_id uuid [not null]
  study_program_id uuid [note: 'nullable; untuk scope admin prodi/kaprodi']
  assigned_at timestamp
  indexes {
    (user_id, role_id, study_program_id) [unique]
  }
}

Table core.role_permissions {
  id uuid [pk]
  role_id uuid [not null]
  permission_id uuid [not null]
  assigned_at timestamp

  indexes {
    (role_id, permission_id) [unique]
    role_id
    permission_id
  }
}

Table core.applications {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  launch_url text [not null]
  sso_protocol varchar
  is_active boolean [default: true]
}

Table core.oauth_clients {
  id uuid [pk]
  application_id uuid [not null]
  client_id varchar [unique, not null]
  client_secret_hash text
  client_type varchar [not null, note: 'confidential, public']
  grant_types jsonb
  scopes jsonb
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp

  indexes {
    application_id
    client_id
  }
}

Table core.redirect_uris {
  id uuid [pk]
  oauth_client_id uuid [not null]
  redirect_uri text [not null]
  is_active boolean [default: true]
  created_at timestamp

  indexes {
    oauth_client_id
    (oauth_client_id, redirect_uri) [unique]
  }
}

Table core.service_tokens {
  id uuid [pk]
  application_id uuid [not null]
  token_hash text [not null]
  scopes jsonb
  expired_at timestamp
  revoked_at timestamp
  created_at timestamp

  indexes {
    application_id
    token_hash [unique]
    expired_at
  }
}

Table core.idempotency_keys {
  id uuid [pk]
  module varchar [not null]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar
  request_hash text
  response_json jsonb
  response_payload jsonb
  status varchar [not null, note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    (module, idempotency_key) [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table core.integration_event_logs {
  id uuid [pk]
  source_module varchar [not null]
  target_module varchar [not null]
  event_type varchar [not null]
  event_key varchar [not null]
  idempotency_key varchar
  correlation_id varchar
  payload jsonb
  status varchar [not null, note: 'pending, success, failed, ignored']
  error_message text
  created_at timestamp
  processed_at timestamp

  indexes {
    (source_module, target_module, event_type, event_key) [unique]
    idempotency_key
    correlation_id
    status
    created_at
  }
}


Table core.sessions {
  id uuid [pk]
  user_id uuid [not null]
  token_hash text [not null]
  refresh_token_hash text
  expired_at timestamp [not null]
  revoked_at timestamp
  created_at timestamp

  indexes {
    user_id
    token_hash [unique]
    refresh_token_hash
    expired_at
  }
}

Table core.active_role_sessions {
  id uuid [pk]
  user_id uuid [not null]
  role_id uuid [not null]
  session_id uuid [not null]
  application_id uuid
  activated_at timestamp

  indexes {
    user_id
    role_id
    session_id
    application_id
    (session_id, application_id) [unique]
  }
}

Table core.impersonation_sessions {
  id uuid [pk]
  actor_user_id uuid [not null]
  target_user_id uuid [not null]
  target_role_id uuid [not null]
  application_id uuid
  session_id uuid [not null]
  reason text [not null]
  started_at timestamp
  ended_at timestamp
  expired_at timestamp [not null]
  status varchar [not null]
}

Table core.audit_logs {
  id uuid [pk]
  user_id uuid
  actor_user_id uuid
  target_user_id uuid
  active_role_id uuid
  impersonation_session_id uuid
  application_id uuid
  module varchar [not null]
  action varchar [not null]
  entity_name varchar
  entity_id uuid
  reason text
  old_value jsonb
  new_value jsonb
  request_id varchar
  ip_address varchar
  user_agent text
  created_at timestamp

  indexes {
    user_id
    actor_user_id
    target_user_id
    active_role_id
    impersonation_session_id
    application_id
    (module, entity_name, entity_id)
    request_id
    created_at
  }
}

/* =========================
   REFERENSI
========================= */

Table ref.countries {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.provinces {
  id uuid [pk]
  country_id uuid [not null]
  code varchar [not null]
  name varchar [not null]
  is_active boolean
}

Table ref.cities {
  id uuid [pk]
  province_id uuid [not null]
  code varchar [not null]
  name varchar [not null]
  type varchar
  is_active boolean
}

Table ref.districts {
  id uuid [pk]
  city_id uuid [not null]
  code varchar [not null]
  name varchar [not null]
  is_active boolean
}

Table ref.villages {
  id uuid [pk]
  district_id uuid [not null]
  code varchar [not null]
  name varchar [not null]
  postal_code varchar
  is_active boolean
}

Table ref.religions {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.study_programs {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  degree_level varchar
  faculty_name varchar
  mode varchar
  is_active boolean
}

Table ref.academic_years {
  id uuid [pk]
  code varchar [unique, not null, note: 'Contoh: 2026/2027']
  name varchar [not null, note: 'Contoh: Tahun Ajaran 2026/2027']
  start_year int
  end_year int
  start_date date
  end_date date
  status varchar [note: 'draft, active, closed, archived']
  is_active boolean
}

Table ref.academic_periods {
  id uuid [pk]
  academic_year_id uuid [not null]
  code varchar [unique, not null, note: 'Contoh: 2026/2027-GANJIL']
  name varchar [not null, note: 'Contoh: Ganjil 2026/2027']
  semester_type varchar [note: 'ganjil, genap, pendek']
  start_date date
  end_date date
  class_start_date date
  class_end_date date
  total_meetings int
  min_attendance_percentage numeric
  status varchar [note: 'draft, open, active, closed, archived']
  is_active boolean

  indexes {
    academic_year_id
    semester_type
    status
    (academic_year_id, semester_type) [unique]
  }
}

Table ref.admission_paths {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.pmb_waves {
  id uuid [pk]
  academic_year_id uuid [note: 'Tahun ajaran kalender operasional, bukan tahun kurikulum']
  target_entry_period_id uuid [not null, note: 'Periode akademik target masuk pendaftar']
  admission_path_id uuid
  code varchar [unique, not null]
  name varchar [not null]
  start_date date [note: 'Legacy alias untuk registration_start_at']
  end_date date [note: 'Legacy alias untuk registration_end_at']
  registration_start_at timestamp
  registration_end_at timestamp
  selection_start_at timestamp
  selection_end_at timestamp
  reregistration_deadline_at timestamp
  status varchar [note: 'draft, open, closed, archived']
  is_active boolean

  indexes {
    academic_year_id
    target_entry_period_id
    admission_path_id
    status
  }
}

Table ref.lead_sources {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.document_types {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  module_scope varchar
  is_required boolean
  is_active boolean
}

Table ref.payment_components {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  component_type varchar
  is_active boolean
}

Table ref.payment_methods {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  provider varchar
  is_active boolean
}

Table ref.employee_types {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.lecturer_statuses {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  is_active boolean
}

Table ref.status_codes {
  id uuid [pk]
  module varchar [not null]
  code varchar [not null]
  name varchar [not null]
  description text
  is_active boolean

  indexes {
    (module, code) [unique]
    module
    code
  }
}

/* =========================
   CRM
========================= */

Table crm.campaigns {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  channel varchar
  start_date date
  end_date date
  status varchar
  created_by uuid
}

Table crm.agents {
  id uuid [pk]
  person_id uuid [not null]
  agent_code varchar [unique, not null]
  organization_name varchar
  status varchar
  approval_status varchar
  approved_by uuid
  approved_at timestamp
}

Table crm.referrals {
  id uuid [pk]
  referral_type varchar [not null]
  referrer_person_id uuid
  agent_id uuid
  referral_code varchar [unique, not null]
  is_valid boolean
  created_at timestamp
}

Table crm.leads {
  id uuid [pk]
  person_id uuid [not null]
  study_program_id uuid
  lead_source_id uuid
  campaign_id uuid
  referral_id uuid
  lead_number varchar [unique, not null]
  status varchar [not null]
  owner_user_id uuid
  converted_at timestamp
  created_at timestamp
}

Table crm.lead_activities {
  id uuid [pk]
  lead_id uuid [not null]
  user_id uuid
  activity_type varchar
  note text
  activity_at timestamp
}

Table crm.lead_status_histories {
  id uuid [pk]
  lead_id uuid [not null]
  old_status varchar
  new_status varchar
  changed_by uuid
  note text
  changed_at timestamp
}

Table crm.commission_rules {
  id uuid [pk]
  referral_type varchar
  amount numeric
  calculation_type varchar
  is_active boolean
}

Table crm.commission_records {
  id uuid [pk]
  lead_id uuid [not null]
  commission_rule_id uuid
  referrer_person_id uuid
  amount numeric
  status varchar
  sent_to_finance_at timestamp
}

/* =========================
   PMB
========================= */
Table pmb.applicants {
  id uuid [pk]
  person_id uuid [not null]
  user_id uuid
  crm_lead_id uuid
  study_program_id uuid
  pmb_wave_id uuid
  admission_path_id uuid
  target_entry_period_id uuid [note: 'Snapshot dari ref.pmb_waves.target_entry_period_id']
  registration_number varchar [unique, not null]
  status varchar [not null, note: 'draft, submitted, verified, accepted, reregistration_completed, ready_for_academic']
  submitted_at timestamp
  accepted_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    person_id
    user_id
    crm_lead_id
    study_program_id
    pmb_wave_id
    admission_path_id
    target_entry_period_id
    status
  }
}

Table pmb.applicant_biodata {
  id uuid [pk]
  applicant_id uuid [not null]
  full_name varchar
  email varchar
  phone varchar
  nik varchar
  birth_place varchar
  birth_date date
  gender varchar
  religion_id uuid
  marital_status varchar
  citizenship varchar
  jacket_size varchar
  core_sync_status varchar
  core_synced_at timestamp
  updated_at timestamp
}

Table pmb.applicant_addresses {
  id uuid [pk]
  applicant_id uuid [not null]
  address_type varchar
  street text
  province_id uuid
  city_id uuid
  district_id uuid
  village_id uuid
  postal_code varchar
  is_same_as_ktp boolean
}

Table pmb.applicant_education_backgrounds {
  id uuid [pk]
  applicant_id uuid [not null]
  education_level_id uuid
  institution_name varchar
  npsn_or_pt_code varchar
  nisn_or_previous_nim varchar
  graduation_year int
  average_score numeric
}

Table pmb.applicant_family_members {
  id uuid [pk]
  applicant_id uuid [not null]
  relation varchar
  nik varchar
  full_name varchar
  education_level_id uuid
  occupation varchar
  income_range varchar
  phone varchar
  dependent_count int
}

Table pmb.applicant_financial_profiles {
  id uuid [pk]
  applicant_id uuid [not null]
  personal_income_range varchar
  bank_name varchar
  bank_account_name varchar
  bank_account_number varchar
  scholarship_interest boolean
}

Table pmb.applicant_facility_profiles {
  id uuid [pk]
  applicant_id uuid [not null]
  employment_status varchar
  has_vehicle boolean
  has_pjj_device boolean
  internet_access varchar
  special_need_status varchar
}

Table pmb.applicant_documents {
  id uuid [pk]
  applicant_id uuid [not null]
  document_type_id uuid [not null]
  file_url text
  verification_status varchar
  verification_note text
  verified_by uuid
  verified_at timestamp
  uploaded_at timestamp
}

Table pmb.applicant_status_histories {
  id uuid [pk]
  applicant_id uuid [not null]
  old_status varchar
  new_status varchar
  changed_by uuid
  note text
  changed_at timestamp
}

Table pmb.re_registrations {
  id uuid [pk]
  applicant_id uuid [not null]
  status varchar
  submitted_at timestamp
  verified_at timestamp
  verified_by uuid
}

Table pmb.loa_documents {
  id uuid [pk]
  applicant_id uuid [not null]
  loa_number varchar [unique, not null]
  file_url text
  issued_at timestamp
  issued_by uuid
}

Table pmb.handover_logs {
  id uuid [pk]
  applicant_id uuid [not null]
  target_module varchar [not null, note: 'academic']
  handover_status varchar [not null, note: 'pending, success, failed, ignored']
  idempotency_key varchar [not null]
  correlation_id varchar
  payload jsonb
  response_json jsonb
  error_message text
  handed_over_by uuid
  handed_over_at timestamp

  indexes {
    applicant_id
    idempotency_key [unique]
    correlation_id
    handover_status
  }
}


/* =========================
   FINANCE
========================= */

Table finance.invoices {
  id uuid [pk]
  invoice_number varchar [unique, not null]
  target_type varchar [not null]
  applicant_id uuid
  student_id uuid
  academic_period_id uuid
  total_amount numeric
  paid_amount numeric
  status varchar
  due_date date
  created_at timestamp
  updated_at timestamp
}

Table finance.invoice_items {
  id uuid [pk]
  invoice_id uuid [not null]
  payment_component_id uuid
  description text
  amount numeric
  discount_amount numeric
  final_amount numeric
}

Table finance.payments {
  id uuid [pk]
  invoice_id uuid [not null]
  payment_method_id uuid
  payment_number varchar [unique]
  amount numeric
  payment_status varchar
  paid_at timestamp
  external_reference varchar
  idempotency_key varchar
  created_at timestamp

  indexes {
    invoice_id
    payment_method_id
    payment_status
    external_reference
    idempotency_key [unique]
    (invoice_id, payment_status)
  }
}

Table finance.payment_gateway_callbacks {
  id uuid [pk]
  payment_id uuid
  provider varchar [not null]
  provider_event_id varchar
  external_reference varchar
  idempotency_key varchar
  payload jsonb
  signature_valid boolean
  callback_status varchar [note: 'received, processed, ignored, failed']
  received_at timestamp
  processed_at timestamp

  indexes {
    payment_id
    provider
    provider_event_id
    external_reference
    idempotency_key [unique]
    (provider, provider_event_id) [unique]
  }
}

Table finance.payment_verifications {
  id uuid [pk]
  payment_id uuid [not null]
  verified_by uuid
  verification_status varchar
  rejection_reason varchar
  note text
  verified_at timestamp
}

Table finance.scholarships {
  id uuid [pk]
  student_id uuid [not null]
  scholarship_type varchar
  amount numeric
  status varchar
  approved_by uuid
  approved_at timestamp
}

Table finance.installment_requests {
  id uuid [pk]
  invoice_id uuid [not null]
  student_id uuid
  status varchar
  reason text
  requested_at timestamp
  approved_by uuid
  approved_at timestamp
}

Table finance.clearance_policies {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar
  service_scope varchar
  rule_json jsonb
  is_active boolean
}

Table finance.student_clearances {
  id uuid [pk]
  student_id uuid [not null]
  academic_period_id uuid
  service_scope varchar
  status varchar
  reason text
  valid_until date
  updated_by uuid
  updated_at timestamp
}

Table finance.clearance_dispensations {
  id uuid [pk]
  student_clearance_id uuid [not null]
  reason text
  approved_by uuid
  approved_at timestamp
  valid_until date
  status varchar
}

Table finance.cash_accounts {
  id uuid [pk]
  account_code varchar [unique, not null]
  account_name varchar
  bank_name varchar
  account_number varchar
  is_active boolean
}

Table finance.cash_transactions {
  id uuid [pk]
  cash_account_id uuid [not null]
  transaction_type varchar
  source_type varchar
  source_id uuid
  amount numeric
  description text
  transaction_at timestamp
}

Table finance.payroll_runs {
  id uuid [pk]
  payroll_period varchar
  run_date date
  total_amount numeric
  status varchar
  approved_by uuid
}

Table finance.payroll_items {
  id uuid [pk]
  payroll_run_id uuid [not null]
  employee_id uuid
  gross_amount numeric
  deduction_amount numeric
  net_amount numeric
  status varchar
}

Table finance.disbursements {
  id uuid [pk]
  disbursement_type varchar
  commission_record_id uuid
  recipient_person_id uuid
  amount numeric
  status varchar
  disbursed_at timestamp
}

Table finance.tax_records {
  id uuid [pk]
  tax_type varchar
  source_type varchar
  source_id uuid
  amount numeric
  status varchar
  tax_period date
}

Table finance.bpjs_records {
  id uuid [pk]
  employee_id uuid
  amount numeric
  period varchar
  status varchar
}

Table finance.coa_accounts {
  id uuid [pk]
  account_code varchar [unique, not null]
  account_name varchar
  normal_balance varchar
  is_active boolean
}

Table finance.journals {
  id uuid [pk]
  journal_number varchar [unique, not null]
  journal_date date
  source_type varchar
  source_id uuid
  description text
  created_by uuid
}

Table finance.journal_entries {
  id uuid [pk]
  journal_id uuid [not null]
  coa_account_id uuid
  debit numeric
  credit numeric
  description text
}

Table finance.budgets {
  id uuid [pk]
  budget_code varchar [unique, not null]
  name varchar
  fiscal_year varchar
  total_amount numeric
  status varchar
}

Table finance.budget_lines {
  id uuid [pk]
  budget_id uuid [not null]
  coa_account_id uuid
  description text
  amount numeric
  realized_amount numeric
}

/* =========================
   ACADEMIC
========================= */
Table academic.students {
  id uuid [pk]
  person_id uuid [not null]
  user_id uuid
  applicant_id uuid
  study_program_id uuid [not null]
  nim varchar [unique, not null]
  student_status varchar
  entry_academic_year_id uuid
  entry_period_id uuid
  curriculum_id uuid
  current_semester int
  active_date date
  created_at timestamp
  updated_at timestamp

  indexes {
    person_id
    user_id
    applicant_id [unique]
    study_program_id
    entry_academic_year_id
    entry_period_id
    curriculum_id
    student_status
    (study_program_id, student_status)
  }
}

Table academic.student_advisors {
  id uuid [pk]
  student_id uuid [not null]
  lecturer_id uuid [not null]
  academic_period_id uuid
  is_active boolean
  assigned_at timestamp

  indexes {
    student_id
    lecturer_id
    academic_period_id
    (student_id, academic_period_id) [unique]
  }
}

Table academic.nim_format_configs {
  id uuid [pk]
  code varchar [unique, not null]
  format_template text
  token_order jsonb
  is_active boolean
  created_by uuid
}

Table academic.nim_sequences {
  id uuid [pk]
  study_program_id uuid [not null]
  entry_period_id uuid [not null]
  sequence_year varchar [not null]
  last_number int [not null, default: 0]
  updated_at timestamp

  indexes {
    (study_program_id, entry_period_id, sequence_year) [unique]
    study_program_id
    entry_period_id
  }
}


Table academic.academic_period_study_program_settings {
  id uuid [pk]
  academic_period_id uuid [not null]
  study_program_id uuid [not null]
  class_start_date date
  class_end_date date
  total_meetings int
  min_attendance_percentage numeric
  pddikti_start_date date
  pddikti_end_date date
  is_active boolean
  created_at timestamp
  updated_at timestamp

  indexes {
    academic_period_id
    study_program_id
    (academic_period_id, study_program_id) [unique]
  }
}

Table academic.academic_settings {
  id uuid [pk]
  setting_key varchar [unique, not null]
  setting_value jsonb
  updated_by uuid
  updated_at timestamp
}

Table academic.curriculums {
  id uuid [pk]
  study_program_id uuid [not null]
  code varchar [unique, not null, note: 'Contoh: SI-KUR-2021']
  name varchar [not null, note: 'Contoh: Kurikulum Sistem Informasi 2021']
  curriculum_year int [not null, note: 'Tahun Kurikulum, bukan Tahun Ajaran']
  year int [note: 'Deprecated alias. Gunakan curriculum_year.']
  status varchar [note: 'draft, active, inactive, archived']
  effective_at timestamp [note: 'Legacy alias. Gunakan effective_start_period_id.']
  effective_start_period_id uuid
  effective_end_period_id uuid
  is_active boolean
  is_default_for_new_student boolean
  created_at timestamp
  updated_at timestamp

  indexes {
    study_program_id
    curriculum_year
    status
    effective_start_period_id
    effective_end_period_id
    is_default_for_new_student
    (study_program_id, curriculum_year) [unique]
  }
}

Table academic.courses {
  id uuid [pk]
  study_program_id uuid
  course_code varchar [unique, not null]
  course_name varchar [not null]
  sks int
  course_type varchar
  minimum_grade numeric
  is_active boolean
}

Table academic.curriculum_courses {
  id uuid [pk]
  curriculum_id uuid [not null]
  course_id uuid [not null]
  semester int
  is_mandatory boolean

  indexes {
    curriculum_id
    course_id
    (curriculum_id, course_id) [unique]
  }
}

Table academic.class_packages {
  id uuid [pk]
  study_program_id uuid [not null]
  curriculum_id uuid [not null]
  semester int
  package_name varchar
  status varchar
}

Table academic.class_package_items {
  id uuid [pk]
  class_package_id uuid [not null]
  course_id uuid [not null]
  recommended_class_id uuid
}

Table academic.course_offerings {
  id uuid [pk]
  course_id uuid [not null]
  academic_period_id uuid [not null]
  curriculum_id uuid [note: 'Kurikulum Prodi yang menjadi konteks penawaran, bila berlaku']
  status varchar
  opened_at timestamp

  indexes {
    course_id
    academic_period_id
    curriculum_id
    status
    (course_id, academic_period_id, curriculum_id) [unique]
  }
}

Table academic.classes {
  id uuid [pk]
  course_offering_id uuid [not null]
  class_code varchar [not null]
  quota int
  enrolled_count int
  class_status varchar
  is_parallel boolean
  created_at timestamp

  indexes {
    course_offering_id
    class_code
    (course_offering_id, class_code) [unique]
  }
}

Table academic.class_lecturers {
  id uuid [pk]
  class_id uuid [not null]
  lecturer_id uuid [not null]
  role_type varchar [note: 'coordinator, teacher, assistant']

  indexes {
    class_id
    lecturer_id
    (class_id, lecturer_id, role_type) [unique]
  }
}

Table academic.class_schedules {
  id uuid [pk]
  class_id uuid [not null]
  day varchar
  start_time time
  end_time time
  room_or_link text
  session_type varchar
}

Table academic.krs {
  id uuid [pk]
  student_id uuid [not null]
  academic_period_id uuid [not null]
  status varchar
  advisor_id uuid
  is_package boolean
  finance_clearance_id uuid
  submitted_at timestamp
  approved_at timestamp

  indexes {
    student_id
    academic_period_id
    advisor_id
    finance_clearance_id
    status
    (student_id, academic_period_id) [unique]
  }
}

Table academic.krs_items {
  id uuid [pk]
  krs_id uuid [not null]
  class_id uuid [not null]
  status varchar
  selected_at timestamp

  indexes {
    krs_id
    class_id
    status
    (krs_id, class_id) [unique]
  }
}

Table academic.grades {
  id uuid [pk]
  krs_item_id uuid [not null]
  numeric_grade numeric
  letter_grade varchar
  grade_point numeric
  source varchar
  submitted_at timestamp
  submitted_by uuid

  indexes {
    krs_item_id [unique]
    submitted_by
    source
  }
}

Table academic.grade_histories {
  id uuid [pk]
  grade_id uuid [not null]
  old_value jsonb
  new_value jsonb
  changed_by uuid
  reason text
  changed_at timestamp
}

Table academic.khs {
  id uuid [pk]
  student_id uuid [not null]
  academic_period_id uuid [not null]
  ips numeric
  total_sks int
  file_url text
  issued_at timestamp
}

Table academic.transcripts {
  id uuid [pk]
  student_id uuid [not null]
  ipk numeric
  total_sks int
  file_url text
  issued_at timestamp
}

Table academic.academic_letters {
  id uuid [pk]
  student_id uuid [not null]
  letter_type varchar
  status varchar
  file_url text
  requested_at timestamp
  issued_at timestamp
}

Table academic.graduation_requirements {
  id uuid [pk]
  study_program_id uuid
  degree_level varchar
  minimum_sks int
  minimum_gpa numeric
  requirement_json jsonb
  is_active boolean
}

Table academic.yudisium_records {
  id uuid [pk]
  student_id uuid [not null]
  yudisium_date date
  graduation_status varchar
  final_gpa numeric
  transcript_number varchar
}

Table academic.alumni {
  id uuid [pk]
  student_id uuid [not null]
  person_id uuid [not null]
  graduation_date date
  alumni_number varchar
  status varchar
  created_at timestamp
}

/* =========================
   HRIS / SDM
========================= */

Table hris.work_units {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  parent_unit_id uuid
  is_active boolean
}

Table hris.positions {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  level varchar
  is_active boolean
}

Table hris.functional_positions {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar [not null]
  rank varchar
  is_active boolean
}

Table hris.employees {
  id uuid [pk]
  person_id uuid [not null]
  employee_type_id uuid
  work_unit_id uuid
  position_id uuid
  nip varchar [unique]
  employment_status varchar
  join_date date
  end_date date
  is_active boolean

  indexes {
    person_id [unique]
    employee_type_id
    work_unit_id
    position_id
    employment_status
    is_active
  }
}

Table hris.lecturers {
  id uuid [pk]
  employee_id uuid [not null]
  lecturer_status_id uuid
  functional_position_id uuid
  nidn varchar
  homebase_study_program_id uuid
  certification_status varchar
  is_active boolean

  indexes {
    employee_id [unique]
    nidn [unique]
    lecturer_status_id
    functional_position_id
    homebase_study_program_id
    is_active
  }
}

Table hris.attendances {
  id uuid [pk]
  employee_id uuid [not null]
  attendance_date date
  check_in time
  check_out time
  status varchar
}

Table hris.leave_requests {
  id uuid [pk]
  employee_id uuid [not null]
  leave_type varchar
  start_date date
  end_date date
  status varchar
  approved_by uuid
}

Table hris.bkd_records {
  id uuid [pk]
  lecturer_id uuid [not null]
  academic_period_id uuid
  teaching_load numeric
  research_load numeric
  service_load numeric
  status varchar
}

Table hris.performance_reviews {
  id uuid [pk]
  employee_id uuid [not null]
  review_period varchar
  score numeric
  status varchar
  reviewed_by uuid
}

Table hris.certifications {
  id uuid [pk]
  employee_id uuid [not null]
  certification_name varchar
  issuer varchar
  issued_date date
  expired_date date
  file_url text
}

Table hris.payroll_sources {
  id uuid [pk]
  employee_id uuid [not null]
  payroll_period varchar
  base_salary numeric
  allowance_amount numeric
  deduction_amount numeric
  status varchar
}

/* =========================
   LMS / ICEMS
========================= */

Table lms.classes {
  id uuid [pk]
  academic_class_id uuid [not null]
  lecturer_id uuid
  status varchar
  synced_at timestamp

  indexes {
    academic_class_id [unique]
    lecturer_id
    status
  }
}

Table lms.enrollments {
  id uuid [pk]
  lms_class_id uuid [not null]
  student_id uuid [not null]
  enrollment_status varchar
  enrolled_at timestamp

  indexes {
    lms_class_id
    student_id
    enrollment_status
    (lms_class_id, student_id) [unique]
  }
}

Table lms.sessions {
  id uuid [pk]
  lms_class_id uuid [not null]
  session_number int
  title varchar
  session_date date
  start_time time
  end_time time
  status varchar

  indexes {
    lms_class_id
    session_date
    status
    (lms_class_id, session_number) [unique]
  }
}

Table lms.materials {
  id uuid [pk]
  session_id uuid [not null]
  assessment_material_id uuid
  title varchar
  content_type varchar
  file_url text
  published_at timestamp
}

Table lms.videos {
  id uuid [pk]
  session_id uuid [not null]
  title varchar
  video_url text
  duration_minutes int
}

Table lms.vicon_links {
  id uuid [pk]
  session_id uuid [not null]
  provider varchar
  join_url text
  start_at timestamp
  end_at timestamp
}

Table lms.assignments {
  id uuid [pk]
  session_id uuid [not null]
  title varchar
  instruction text
  due_at timestamp
  status varchar
}

Table lms.assignment_submissions {
  id uuid [pk]
  assignment_id uuid [not null]
  student_id uuid [not null]
  file_url text
  submitted_at timestamp
  score numeric
  graded_by uuid
  graded_at timestamp

  indexes {
    assignment_id
    student_id
    graded_by
    (assignment_id, student_id) [unique]
  }
}

Table lms.quiz_activities {
  id uuid [pk]
  session_id uuid [not null]
  assessment_session_id uuid [not null]
  title varchar
  status varchar
}

Table lms.discussions {
  id uuid [pk]
  session_id uuid [not null]
  title varchar
  created_by uuid
  created_at timestamp
}

Table lms.discussion_comments {
  id uuid [pk]
  discussion_id uuid [not null]
  user_id uuid
  content text
  parent_comment_id uuid
  created_at timestamp
}

Table lms.attendances {
  id uuid [pk]
  session_id uuid [not null]
  student_id uuid [not null]
  attendance_status varchar
  submitted_at timestamp

  indexes {
    session_id
    student_id
    attendance_status
    (session_id, student_id) [unique]
  }
}

Table lms.learning_progress {
  id uuid [pk]
  enrollment_id uuid [not null]
  progress_percent numeric
  last_access_at timestamp
  completed_at timestamp

  indexes {
    enrollment_id [unique]
    last_access_at
  }
}

Table lms.grade_syncs {
  id uuid [pk]
  lms_class_id uuid [not null]
  academic_class_id uuid [not null]
  sync_status varchar
  synced_at timestamp
  payload jsonb
}

/* =========================
   ASSESSMENT
========================= */

Table assessment.question_banks {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar
  module_scope varchar
  owner_user_id uuid
  status varchar
}

Table assessment.questions {
  id uuid [pk]
  question_bank_id uuid [not null]
  question_type varchar
  difficulty varchar
  question_text text
  answer_explanation text
  status varchar
  created_by uuid
}

Table assessment.question_versions {
  id uuid [pk]
  question_id uuid [not null]
  version_number int [not null]
  question_type varchar
  difficulty varchar
  question_text text
  answer_explanation text
  options_snapshot jsonb
  status varchar [note: 'draft, approved, archived']
  created_by uuid
  created_at timestamp

  indexes {
    question_id
    created_by
    (question_id, version_number) [unique]
  }
}

Table assessment.question_options {
  id uuid [pk]
  question_id uuid [not null]
  option_label varchar
  option_text text
  is_correct boolean
  sort_order int
}

Table assessment.material_banks {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar
  module_scope varchar
  owner_user_id uuid
  status varchar
}

Table assessment.materials {
  id uuid [pk]
  material_bank_id uuid [not null]
  title varchar
  material_type varchar
  file_url text
  content_text text
  status varchar
  created_by uuid
}

Table assessment.question_sets {
  id uuid [pk]
  code varchar [unique, not null]
  name varchar
  randomize_questions boolean
  randomize_options boolean
  status varchar
}

Table assessment.question_set_items {
  id uuid [pk]
  question_set_id uuid [not null]
  question_id uuid [not null]
  score_weight numeric
  sort_order int

  indexes {
    question_set_id
    question_id
    (question_set_id, question_id) [unique]
  }
}

Table assessment.assessment_sessions {
  id uuid [pk]
  question_set_id uuid
  session_type varchar
  context_module varchar
  context_id uuid
  title varchar
  start_at timestamp
  end_at timestamp
  duration_minutes int
  status varchar
  passing_grade numeric
}

Table assessment.assessment_participants {
  id uuid [pk]
  assessment_session_id uuid [not null]
  participant_type varchar
  applicant_id uuid
  student_id uuid
  user_id uuid
  status varchar
}

Table assessment.assessment_attempts {
  id uuid [pk]
  assessment_session_id uuid [not null]
  participant_id uuid [not null]
  attempt_number int [default: 1]
  idempotency_key varchar
  started_at timestamp
  submitted_at timestamp
  status varchar
  total_score numeric

  indexes {
    assessment_session_id
    participant_id
    idempotency_key [unique]
    (assessment_session_id, participant_id, attempt_number) [unique]
  }
}

Table assessment.assessment_answers {
  id uuid [pk]
  attempt_id uuid [not null]
  question_id uuid [not null]
  selected_option_id uuid
  answer_text text
  score numeric
  graded_by uuid
  graded_at timestamp

  indexes {
    attempt_id
    question_id
    selected_option_id
    graded_by
    (attempt_id, question_id) [unique]
  }
}

Table assessment.assessment_scores {
  id uuid [pk]
  attempt_id uuid [not null]
  total_score numeric
  result_status varchar
  published_at timestamp
  sent_to_context_at timestamp
}

Table assessment.surveys {
  id uuid [pk]
  title varchar
  target_type varchar
  is_anonymous boolean
  start_at timestamp
  end_at timestamp
  status varchar
  created_by uuid
}

Table assessment.survey_questions {
  id uuid [pk]
  survey_id uuid [not null]
  question_type varchar
  question_text text
  sort_order int
}

Table assessment.survey_responses {
  id uuid [pk]
  survey_id uuid [not null]
  respondent_user_id uuid
  submitted_at timestamp
  response_json jsonb
}

/* =========================
   PORTAL
========================= */

Table portal.notifications {
  id uuid [pk]
  user_id uuid [not null]
  title varchar
  message text
  module_source varchar
  target_url text
  sent_at timestamp
}

Table portal.notification_reads {
  id uuid [pk]
  notification_id uuid [not null]
  user_id uuid [not null]
  read_at timestamp

  indexes {
    notification_id
    user_id
    (notification_id, user_id) [unique]
  }
}

Table portal.user_preferences {
  id uuid [pk]
  user_id uuid [not null]
  preference_key varchar
  preference_value jsonb
  updated_at timestamp

  indexes {
    user_id
    (user_id, preference_key) [unique]
  }
}

Table portal.menu_shortcuts {
  id uuid [pk]
  user_id uuid [not null]
  menu_code varchar
  menu_label varchar
  target_url text
  sort_order int

  indexes {
    user_id
    (user_id, menu_code) [unique]
  }
}

Table portal.portal_activity_logs {
  id uuid [pk]
  user_id uuid [not null]
  activity_type varchar
  module_target varchar
  description text
  created_at timestamp
}

/* =========================
   RELATIONS
========================= */

Ref: core.users.person_id > core.persons.id
Ref: core.user_roles.user_id > core.users.id
Ref: core.user_roles.role_id > core.roles.id
Ref: core.user_roles.study_program_id > ref.study_programs.id
Ref: core.role_permissions.role_id > core.roles.id
Ref: core.role_permissions.permission_id > core.permissions.id
Ref: core.sessions.user_id > core.users.id
Ref: core.active_role_sessions.user_id > core.users.id
Ref: core.active_role_sessions.role_id > core.roles.id
Ref: core.active_role_sessions.session_id > core.sessions.id
Ref: core.active_role_sessions.application_id > core.applications.id
Ref: core.impersonation_sessions.actor_user_id > core.users.id
Ref: core.impersonation_sessions.target_user_id > core.users.id
Ref: core.impersonation_sessions.target_role_id > core.roles.id
Ref: core.impersonation_sessions.application_id > core.applications.id
Ref: core.audit_logs.user_id > core.users.id

Ref: core.oauth_clients.application_id > core.applications.id
Ref: core.redirect_uris.oauth_client_id > core.oauth_clients.id
Ref: core.service_tokens.application_id > core.applications.id
Ref: core.audit_logs.actor_user_id > core.users.id
Ref: core.audit_logs.target_user_id > core.users.id
Ref: core.audit_logs.active_role_id > core.roles.id
Ref: core.audit_logs.impersonation_session_id > core.impersonation_sessions.id
Ref: core.audit_logs.application_id > core.applications.id

Ref: core.persons.religion_id > ref.religions.id
Ref: core.persons.country_id > ref.countries.id
Ref: core.persons.province_id > ref.provinces.id
Ref: core.persons.city_id > ref.cities.id
Ref: core.persons.district_id > ref.districts.id
Ref: core.persons.village_id > ref.villages.id
Ref: ref.provinces.country_id > ref.countries.id
Ref: ref.cities.province_id > ref.provinces.id
Ref: ref.districts.city_id > ref.cities.id
Ref: ref.villages.district_id > ref.districts.id
Ref: ref.academic_periods.academic_year_id > ref.academic_years.id

Ref: crm.campaigns.created_by > core.users.id
Ref: crm.agents.person_id > core.persons.id
Ref: crm.agents.approved_by > core.users.id
Ref: crm.referrals.referrer_person_id > core.persons.id
Ref: crm.referrals.agent_id > crm.agents.id
Ref: crm.leads.person_id > core.persons.id
Ref: crm.leads.study_program_id > ref.study_programs.id
Ref: crm.leads.lead_source_id > ref.lead_sources.id
Ref: crm.leads.campaign_id > crm.campaigns.id
Ref: crm.leads.referral_id > crm.referrals.id
Ref: crm.leads.owner_user_id > core.users.id
Ref: crm.lead_activities.lead_id > crm.leads.id
Ref: crm.lead_activities.user_id > core.users.id
Ref: crm.lead_status_histories.lead_id > crm.leads.id
Ref: crm.lead_status_histories.changed_by > core.users.id
Ref: crm.commission_records.lead_id > crm.leads.id
Ref: crm.commission_records.commission_rule_id > crm.commission_rules.id
Ref: crm.commission_records.referrer_person_id > core.persons.id

Ref: pmb.applicants.person_id > core.persons.id
Ref: pmb.applicants.user_id > core.users.id
Ref: pmb.applicants.crm_lead_id > crm.leads.id
Ref: pmb.applicants.study_program_id > ref.study_programs.id
Ref: pmb.applicants.pmb_wave_id > ref.pmb_waves.id
Ref: pmb.applicants.admission_path_id > ref.admission_paths.id
Ref: pmb.applicant_biodata.applicant_id > pmb.applicants.id
Ref: pmb.applicant_biodata.religion_id > ref.religions.id
Ref: pmb.applicant_addresses.applicant_id > pmb.applicants.id
Ref: pmb.applicant_addresses.province_id > ref.provinces.id
Ref: pmb.applicant_addresses.city_id > ref.cities.id
Ref: pmb.applicant_addresses.district_id > ref.districts.id
Ref: pmb.applicant_addresses.village_id > ref.villages.id
Ref: pmb.applicant_education_backgrounds.applicant_id > pmb.applicants.id
Ref: pmb.applicant_education_backgrounds.education_level_id > ref.status_codes.id
Ref: pmb.applicant_family_members.applicant_id > pmb.applicants.id
Ref: pmb.applicant_financial_profiles.applicant_id > pmb.applicants.id
Ref: pmb.applicant_facility_profiles.applicant_id > pmb.applicants.id
Ref: pmb.applicant_documents.applicant_id > pmb.applicants.id
Ref: pmb.applicant_documents.document_type_id > ref.document_types.id
Ref: pmb.applicant_documents.verified_by > core.users.id
Ref: pmb.applicant_status_histories.applicant_id > pmb.applicants.id
Ref: pmb.applicant_status_histories.changed_by > core.users.id
Ref: pmb.re_registrations.applicant_id > pmb.applicants.id
Ref: pmb.re_registrations.verified_by > core.users.id
Ref: pmb.loa_documents.applicant_id > pmb.applicants.id
Ref: pmb.loa_documents.issued_by > core.users.id
Ref: pmb.handover_logs.applicant_id > pmb.applicants.id
Ref: pmb.handover_logs.handed_over_by > core.users.id

Ref: finance.invoices.applicant_id > pmb.applicants.id
Ref: finance.invoices.student_id > academic.students.id
Ref: finance.invoices.academic_period_id > ref.academic_periods.id
Ref: finance.invoice_items.invoice_id > finance.invoices.id
Ref: finance.invoice_items.payment_component_id > ref.payment_components.id
Ref: finance.payments.invoice_id > finance.invoices.id
Ref: finance.payments.payment_method_id > ref.payment_methods.id
Ref: finance.payment_gateway_callbacks.payment_id > finance.payments.id
Ref: finance.payment_verifications.payment_id > finance.payments.id
Ref: finance.payment_verifications.verified_by > core.users.id
Ref: finance.scholarships.student_id > academic.students.id
Ref: finance.scholarships.approved_by > core.users.id
Ref: finance.installment_requests.invoice_id > finance.invoices.id
Ref: finance.installment_requests.student_id > academic.students.id
Ref: finance.installment_requests.approved_by > core.users.id
Ref: finance.student_clearances.student_id > academic.students.id
Ref: finance.student_clearances.academic_period_id > ref.academic_periods.id
Ref: finance.student_clearances.updated_by > core.users.id
Ref: finance.clearance_dispensations.student_clearance_id > finance.student_clearances.id
Ref: finance.clearance_dispensations.approved_by > core.users.id
Ref: finance.cash_transactions.cash_account_id > finance.cash_accounts.id
Ref: finance.payroll_items.payroll_run_id > finance.payroll_runs.id
Ref: finance.payroll_items.employee_id > hris.employees.id
Ref: finance.disbursements.commission_record_id > crm.commission_records.id
Ref: finance.disbursements.recipient_person_id > core.persons.id
Ref: finance.bpjs_records.employee_id > hris.employees.id
Ref: finance.journal_entries.journal_id > finance.journals.id
Ref: finance.journal_entries.coa_account_id > finance.coa_accounts.id
Ref: finance.budget_lines.budget_id > finance.budgets.id
Ref: finance.budget_lines.coa_account_id > finance.coa_accounts.id

Ref: academic.students.person_id > core.persons.id
Ref: academic.students.user_id > core.users.id
Ref: academic.students.applicant_id > pmb.applicants.id
Ref: academic.students.study_program_id > ref.study_programs.id
Ref: academic.students.entry_period_id > ref.academic_periods.id
Ref: academic.student_advisors.student_id > academic.students.id
Ref: academic.student_advisors.lecturer_id > hris.lecturers.id
Ref: academic.student_advisors.academic_period_id > ref.academic_periods.id
Ref: academic.nim_format_configs.created_by > core.users.id
Ref: academic.nim_sequences.study_program_id > ref.study_programs.id
Ref: academic.nim_sequences.entry_period_id > ref.academic_periods.id
Ref: academic.academic_settings.updated_by > core.users.id
Ref: academic.curriculums.study_program_id > ref.study_programs.id
Ref: academic.courses.study_program_id > ref.study_programs.id
Ref: academic.curriculum_courses.curriculum_id > academic.curriculums.id
Ref: academic.curriculum_courses.course_id > academic.courses.id
Ref: academic.class_packages.study_program_id > ref.study_programs.id
Ref: academic.class_packages.curriculum_id > academic.curriculums.id
Ref: academic.class_package_items.class_package_id > academic.class_packages.id
Ref: academic.class_package_items.course_id > academic.courses.id
Ref: academic.class_package_items.recommended_class_id > academic.classes.id
Ref: academic.course_offerings.course_id > academic.courses.id
Ref: academic.course_offerings.academic_period_id > ref.academic_periods.id
Ref: academic.classes.course_offering_id > academic.course_offerings.id
Ref: academic.class_lecturers.class_id > academic.classes.id
Ref: academic.class_lecturers.lecturer_id > hris.lecturers.id
Ref: academic.class_schedules.class_id > academic.classes.id
Ref: academic.krs.student_id > academic.students.id
Ref: academic.krs.academic_period_id > ref.academic_periods.id
Ref: academic.krs.advisor_id > hris.lecturers.id
Ref: academic.krs.finance_clearance_id > finance.student_clearances.id
Ref: academic.krs_items.krs_id > academic.krs.id
Ref: academic.krs_items.class_id > academic.classes.id
Ref: academic.grades.krs_item_id > academic.krs_items.id
Ref: academic.grades.submitted_by > core.users.id
Ref: academic.grade_histories.grade_id > academic.grades.id
Ref: academic.grade_histories.changed_by > core.users.id
Ref: academic.khs.student_id > academic.students.id
Ref: academic.khs.academic_period_id > ref.academic_periods.id
Ref: academic.transcripts.student_id > academic.students.id
Ref: academic.academic_letters.student_id > academic.students.id
Ref: academic.graduation_requirements.study_program_id > ref.study_programs.id
Ref: academic.yudisium_records.student_id > academic.students.id
Ref: academic.alumni.student_id > academic.students.id
Ref: academic.alumni.person_id > core.persons.id

Ref: hris.work_units.parent_unit_id > hris.work_units.id
Ref: hris.employees.person_id > core.persons.id
Ref: hris.employees.employee_type_id > ref.employee_types.id
Ref: hris.employees.work_unit_id > hris.work_units.id
Ref: hris.employees.position_id > hris.positions.id
Ref: hris.lecturers.employee_id > hris.employees.id
Ref: hris.lecturers.lecturer_status_id > ref.lecturer_statuses.id
Ref: hris.lecturers.functional_position_id > hris.functional_positions.id
Ref: hris.lecturers.homebase_study_program_id > ref.study_programs.id
Ref: hris.attendances.employee_id > hris.employees.id
Ref: hris.leave_requests.employee_id > hris.employees.id
Ref: hris.leave_requests.approved_by > core.users.id
Ref: hris.bkd_records.lecturer_id > hris.lecturers.id
Ref: hris.bkd_records.academic_period_id > ref.academic_periods.id
Ref: hris.performance_reviews.employee_id > hris.employees.id
Ref: hris.performance_reviews.reviewed_by > core.users.id
Ref: hris.certifications.employee_id > hris.employees.id
Ref: hris.payroll_sources.employee_id > hris.employees.id

Ref: lms.classes.academic_class_id > academic.classes.id
Ref: lms.classes.lecturer_id > hris.lecturers.id
Ref: lms.enrollments.lms_class_id > lms.classes.id
Ref: lms.enrollments.student_id > academic.students.id
Ref: lms.sessions.lms_class_id > lms.classes.id
Ref: lms.materials.session_id > lms.sessions.id
Ref: lms.materials.assessment_material_id > assessment.materials.id
Ref: lms.videos.session_id > lms.sessions.id
Ref: lms.vicon_links.session_id > lms.sessions.id
Ref: lms.assignments.session_id > lms.sessions.id
Ref: lms.assignment_submissions.assignment_id > lms.assignments.id
Ref: lms.assignment_submissions.student_id > academic.students.id
Ref: lms.assignment_submissions.graded_by > core.users.id
Ref: lms.quiz_activities.session_id > lms.sessions.id
Ref: lms.quiz_activities.assessment_session_id > assessment.assessment_sessions.id
Ref: lms.discussions.session_id > lms.sessions.id
Ref: lms.discussions.created_by > core.users.id
Ref: lms.discussion_comments.discussion_id > lms.discussions.id
Ref: lms.discussion_comments.user_id > core.users.id
Ref: lms.discussion_comments.parent_comment_id > lms.discussion_comments.id
Ref: lms.attendances.session_id > lms.sessions.id
Ref: lms.attendances.student_id > academic.students.id
Ref: lms.learning_progress.enrollment_id > lms.enrollments.id
Ref: lms.grade_syncs.lms_class_id > lms.classes.id
Ref: lms.grade_syncs.academic_class_id > academic.classes.id

Ref: assessment.question_banks.owner_user_id > core.users.id
Ref: assessment.questions.question_bank_id > assessment.question_banks.id
Ref: assessment.questions.created_by > core.users.id
Ref: assessment.question_versions.question_id > assessment.questions.id
Ref: assessment.question_versions.created_by > core.users.id
Ref: assessment.question_options.question_id > assessment.questions.id
Ref: assessment.material_banks.owner_user_id > core.users.id
Ref: assessment.materials.material_bank_id > assessment.material_banks.id
Ref: assessment.materials.created_by > core.users.id
Ref: assessment.question_set_items.question_set_id > assessment.question_sets.id
Ref: assessment.question_set_items.question_id > assessment.questions.id
Ref: assessment.assessment_sessions.question_set_id > assessment.question_sets.id
Ref: assessment.assessment_participants.assessment_session_id > assessment.assessment_sessions.id
Ref: assessment.assessment_participants.applicant_id > pmb.applicants.id
Ref: assessment.assessment_participants.student_id > academic.students.id
Ref: assessment.assessment_participants.user_id > core.users.id
Ref: assessment.assessment_attempts.assessment_session_id > assessment.assessment_sessions.id
Ref: assessment.assessment_attempts.participant_id > assessment.assessment_participants.id
Ref: assessment.assessment_answers.attempt_id > assessment.assessment_attempts.id
Ref: assessment.assessment_answers.question_id > assessment.questions.id
Ref: assessment.assessment_answers.selected_option_id > assessment.question_options.id
Ref: assessment.assessment_answers.graded_by > core.users.id
Ref: assessment.assessment_scores.attempt_id > assessment.assessment_attempts.id
Ref: assessment.surveys.created_by > core.users.id
Ref: assessment.survey_questions.survey_id > assessment.surveys.id
Ref: assessment.survey_responses.survey_id > assessment.surveys.id
Ref: assessment.survey_responses.respondent_user_id > core.users.id

Ref: portal.notifications.user_id > core.users.id
Ref: portal.notification_reads.notification_id > portal.notifications.id
Ref: portal.notification_reads.user_id > core.users.id
Ref: portal.user_preferences.user_id > core.users.id
Ref: portal.menu_shortcuts.user_id > core.users.id
Ref: portal.portal_activity_logs.user_id > core.users.id

// v6.1 Academic calendar, PMB entry period, and curriculum-year separation
Ref: ref.pmb_waves.academic_year_id > ref.academic_years.id
Ref: ref.pmb_waves.target_entry_period_id > ref.academic_periods.id
Ref: ref.pmb_waves.admission_path_id > ref.admission_paths.id
Ref: pmb.applicants.target_entry_period_id > ref.academic_periods.id
Ref: academic.students.entry_academic_year_id > ref.academic_years.id
Ref: academic.students.curriculum_id > academic.curriculums.id
Ref: academic.curriculums.effective_start_period_id > ref.academic_periods.id
Ref: academic.curriculums.effective_end_period_id > ref.academic_periods.id
Ref: academic.academic_period_study_program_settings.academic_period_id > ref.academic_periods.id
Ref: academic.academic_period_study_program_settings.study_program_id > ref.study_programs.id
Ref: academic.course_offerings.curriculum_id > academic.curriculums.id

/* =========================
   EVENT CONTRACT CATALOG v1.0.1
   Berlaku sebagai katalog teknis event lintas modul.
========================= */

Table core.event_contracts {
  id uuid [pk]
  event_name varchar [not null, note: 'format domain.action, contoh finance.payment_paid']
  event_version varchar [not null, default: 'v1']
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  publisher_module varchar [not null]
  publisher_database varchar
  aggregate_type varchar [not null]
  payload_schema jsonb [not null]
  validation_schema jsonb
  status varchar [not null, default: 'active', note: 'draft, active, deprecated, retired']
  backward_compatible boolean [default: true]
  description text
  created_at timestamp
  updated_at timestamp

  indexes {
    (event_name, event_version) [unique]
    publisher_module
    status
  }
}

Table core.event_consumers {
  id uuid [pk]
  event_contract_id uuid [not null]
  consumer_module varchar [not null]
  handler_name varchar
  retry_policy jsonb
  dlq_enabled boolean [default: true]
  max_retry int [default: 10]
  is_active boolean [default: true]
  created_at timestamp
  updated_at timestamp

  indexes {
    (event_contract_id, consumer_module) [unique]
    consumer_module
    is_active
  }
}

Table core.event_replay_logs {
  id uuid [pk]
  event_key varchar [not null]
  event_name varchar [not null]
  event_version varchar
  source_module varchar [not null]
  consumer_module varchar
  replay_reason text [not null]
  replayed_by uuid
  replayed_at timestamp
  replay_status varchar [not null, note: 'queued, success, failed']
  last_error text
  audit_ref_id uuid

  indexes {
    event_key
    event_name
    source_module
    consumer_module
    replay_status
    replayed_at
  }
}

/* --- CORE EVENT INFRASTRUCTURE --- */
Table core.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table core.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'core']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table core.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'core']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- REF EVENT INFRASTRUCTURE --- */
Table ref.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table ref.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'ref']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table ref.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'ref']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table ref.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'ref']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- CRM EVENT INFRASTRUCTURE --- */
Table crm.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table crm.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'crm']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table crm.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'crm']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table crm.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'crm']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- PMB EVENT INFRASTRUCTURE --- */
Table pmb.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table pmb.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'pmb']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table pmb.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'pmb']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table pmb.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'pmb']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- FINANCE EVENT INFRASTRUCTURE --- */
Table finance.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table finance.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'finance']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table finance.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'finance']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table finance.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'finance']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- ACADEMIC EVENT INFRASTRUCTURE --- */
Table academic.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table academic.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'academic']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table academic.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'academic']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table academic.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'academic']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- HRIS EVENT INFRASTRUCTURE --- */
Table hris.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table hris.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'hris']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table hris.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'hris']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table hris.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'hris']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- LMS EVENT INFRASTRUCTURE --- */
Table lms.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table lms.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'lms']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table lms.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'lms']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table lms.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'lms']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- ASSESSMENT EVENT INFRASTRUCTURE --- */
Table assessment.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table assessment.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'assessment']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table assessment.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'assessment']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table assessment.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'assessment']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}

/* --- PORTAL EVENT INFRASTRUCTURE --- */
Table portal.outbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null, default: 'v1']
  event_key varchar [not null]
  event_type varchar [not null, note: 'DOMAIN_EVENT, INTEGRATION_EVENT, NOTIFICATION_EVENT, SNAPSHOT_EVENT']
  aggregate_type varchar [not null]
  aggregate_id uuid [not null]
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  idempotency_key varchar
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING, PUBLISHED, RETRYING, FAILED, DLQ']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  occurred_at timestamp [not null]
  published_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    event_key [unique]
    event_name
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table portal.inbox_events {
  id uuid [pk]
  event_name varchar [not null]
  event_version varchar [not null]
  event_key varchar [not null]
  publisher_module varchar [not null]
  publisher_database varchar
  consumer_module varchar [not null, default: 'portal']
  aggregate_type varchar
  aggregate_id uuid
  payload jsonb [not null]
  payload_hash text
  headers jsonb
  correlation_id varchar
  causation_id varchar
  status varchar [not null, default: 'RECEIVED', note: 'RECEIVED, PROCESSED, RETRYING, FAILED, DLQ, IGNORED_DUPLICATE']
  retry_count int [default: 0]
  max_retry int [default: 10]
  next_retry_at timestamp
  locked_at timestamp
  locked_by varchar
  last_error text
  received_at timestamp
  processed_at timestamp
  dead_letter_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    (consumer_module, event_key) [unique]
    event_name
    publisher_module
    status
    next_retry_at
    (aggregate_type, aggregate_id)
    correlation_id
    dead_letter_at
  }
}

Table portal.idempotency_keys {
  id uuid [pk]
  idempotency_key varchar [not null]
  source_module varchar
  target_module varchar [default: 'portal']
  request_hash text
  response_payload jsonb
  status varchar [not null, default: 'processing', note: 'processing, completed, failed, expired']
  locked_until timestamp
  trace_id varchar
  correlation_id varchar
  last_error text
  expires_at timestamp
  created_at timestamp
  updated_at timestamp
  completed_at timestamp

  indexes {
    idempotency_key [unique]
    status
    locked_until
    expires_at
    correlation_id
  }
}

Table portal.reconciliation_mismatch_logs {
  id uuid [pk]
  source_module varchar [not null]
  source_table varchar [not null]
  source_ref_id uuid
  consumer_module varchar [not null, default: 'portal']
  consumer_table varchar
  consumer_ref_id uuid
  source_event_key varchar
  mismatch_type varchar [not null, note: 'missing_source, missing_snapshot, value_mismatch, stale_snapshot, duplicate_projection']
  source_value jsonb
  snapshot_value jsonb
  status varchar [not null, default: 'OPEN', note: 'OPEN, CORRECTED, IGNORED, PENDING_REVIEW']
  reason text
  detected_at timestamp
  corrected_at timestamp
  ignored_at timestamp
  created_at timestamp
  updated_at timestamp

  indexes {
    status
    mismatch_type
    source_module
    consumer_module
    source_event_key
    detected_at
  }
}


/* =========================
   STANDARD SNAPSHOT / READ MODEL FIELDS v1.0.1
   Setiap tabel snapshot/read model pada modul consumer wajib menambahkan field berikut pada migration SQL:
   - source_event_key varchar
   - source_event_name varchar
   - source_updated_at timestamp
   - synced_at timestamp
   - sync_status varchar note: 'fresh, stale, failed, pending_review'
   - reconciliation_status varchar note: 'matched, mismatch, corrected, ignored'

   Standar ini berlaku untuk contoh projection:
   - pmb applicant invoice status snapshot dari Finance
   - academic student clearance snapshot dari Finance
   - lms academic class snapshot dari Academic
   - lms enrollment projection dari Academic KRS
   - portal dashboard read model dari semua modul
========================= */

/* =========================
   EVENT CONTRACT INTERNAL REFERENCES
========================= */
Ref: core.event_consumers.event_contract_id > core.event_contracts.id
Ref: core.event_replay_logs.audit_ref_id > core.audit_logs.id


```



# BAGIAN - OPENAPI SWAGGER FINAL ERP UNSIA

_Sumber file: `OpenAPI_Swagger_Final_ERP_UNSIA.json`_

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "UNSIA ERP / SIAKAD Terintegrasi API",
    "version": "1.0.1-event-contract",
    "description": "OpenAPI/Swagger final baseline untuk ERP Pendidikan / SIAKAD Terintegrasi UNSIA. Spesifikasi ini menurunkan API Contract dan Integration Contract v1.0 menjadi kontrak OpenAPI untuk Swagger UI, backend implementation, integration test, dan UAT lintas modul.\n\nPrinsip: semua endpoint protected memakai Core Auth, active role, permission, application, dan data scope; endpoint kritis memakai Idempotency-Key; request lintas modul membawa X-Correlation-Id; cross-domain write dilakukan melalui API/service event resmi; response memakai envelope standar.\n\nUpdate v1.0.1: menambahkan Event Contract API untuk event catalog, outbox, inbox, DLQ replay, reconciliation mismatch, event_key, event_version, retry, correlation_id, causation_id, dan observability endpoint."
  },
  "servers": [
    {
      "url": "https://api.unsia.ac.id",
      "description": "Production placeholder"
    },
    {
      "url": "https://staging-api.unsia.ac.id",
      "description": "Staging placeholder"
    },
    {
      "url": "http://localhost:8000",
      "description": "Local development"
    }
  ],
  "tags": [
    {
      "name": "Core",
      "description": "Identity, SSO, RBAC, audit, service token, idempotency, integration control."
    },
    {
      "name": "Referensi",
      "description": "Master data lintas modul."
    },
    {
      "name": "CRM",
      "description": "Lead, campaign, referral, dan konversi lead."
    },
    {
      "name": "PMB",
      "description": "Applicant, dokumen, LoA, invoice request, dan handover akademik."
    },
    {
      "name": "Finance",
      "description": "Invoice, payment callback, manual verification, clearance."
    },
    {
      "name": "Academic",
      "description": "Mahasiswa, NIM, kelas, KRS, source grade, finalisasi nilai."
    },
    {
      "name": "HRIS",
      "description": "Lecturer active read model."
    },
    {
      "name": "LMS",
      "description": "Class sync, enrollment sync, grade sync."
    },
    {
      "name": "Assessment",
      "description": "Session, attempt, scoring, result publish."
    },
    {
      "name": "Portal",
      "description": "Notification dan dashboard role-based."
    },
    {
      "name": "Event Contract",
      "description": "Event catalog, outbox/inbox monitoring, retry, DLQ replay, reconciliation mismatch, and event observability."
    }
  ],
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/api/v1/auth/login": {
      "post": {
        "tags": [
          "Core"
        ],
        "operationId": "login",
        "summary": "Login user dan membuat session",
        "description": "Public endpoint untuk login. Tidak memakai bearer token.",
        "parameters": [],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/TokenResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Public",
        "x-idempotent": false,
        "x-audit-log": "audit login",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "security": []
      }
    },
    "/api/v1/auth/refresh": {
      "post": {
        "tags": [
          "Core"
        ],
        "operationId": "refreshToken",
        "summary": "Refresh access token",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/TokenResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "x-audit-log": "audit session",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/auth/me": {
      "get": {
        "tags": [
          "Core"
        ],
        "operationId": "getAuthenticatedUser",
        "summary": "Mengambil profil user, active role, permission, dan scope",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/UserProfile"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/auth/switch-role": {
      "post": {
        "tags": [
          "Core"
        ],
        "operationId": "switchActiveRole",
        "summary": "Mengubah active role session",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/UserProfile"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": true,
        "x-audit-log": "active_role_sessions",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SwitchRoleRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/applications": {
      "get": {
        "tags": [
          "Core"
        ],
        "operationId": "listApplications",
        "summary": "Application launcher berdasarkan role",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/Application"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/impersonations/start": {
      "post": {
        "tags": [
          "Core"
        ],
        "operationId": "startImpersonation",
        "summary": "Memulai impersonation dengan reason",
        "description": "Role/permission: admin_bppti.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/UserProfile"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_bppti",
        "x-idempotent": true,
        "x-audit-log": "impersonation audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ImpersonationStartRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/ref/study-programs": {
      "get": {
        "tags": [
          "Referensi"
        ],
        "operationId": "listStudyPrograms",
        "summary": "Daftar program studi",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/StudyProgram"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/ref/academic-years": {
      "get": {
        "tags": [
          "Referensi"
        ],
        "operationId": "listAcademicYears",
        "summary": "Daftar Tahun Ajaran",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/AcademicYear"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "tags": [
          "Referensi"
        ],
        "operationId": "createAcademicYear",
        "summary": "Membuat Tahun Ajaran operasional",
        "description": "Role/permission: admin_akademik_biro.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AcademicYear"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_akademik_biro",
        "x-idempotent": true,
        "x-audit-log": "audit master",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AcademicYearCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/ref/academic-periods": {
      "get": {
        "tags": [
          "Referensi"
        ],
        "operationId": "listAcademicPeriods",
        "summary": "Daftar Periode Akademik",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/AcademicPeriod"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "tags": [
          "Referensi"
        ],
        "operationId": "createAcademicPeriod",
        "summary": "Membuat Periode Akademik di bawah Tahun Ajaran",
        "description": "Role/permission: admin_akademik_biro.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AcademicPeriod"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_akademik_biro",
        "x-idempotent": true,
        "x-audit-log": "audit master",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AcademicPeriodCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/crm/leads": {
      "get": {
        "tags": [
          "CRM"
        ],
        "operationId": "listLeads",
        "summary": "List lead sesuai scope",
        "description": "Role/permission: admin_crm | agen_mitra.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/Lead"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_crm | agen_mitra",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      },
      "post": {
        "tags": [
          "CRM"
        ],
        "operationId": "createLead",
        "summary": "Membuat lead",
        "description": "Role/permission: admin_crm | agen_mitra.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Lead"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_crm | agen_mitra",
        "x-idempotent": true,
        "x-audit-log": "lead history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LeadCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/crm/leads/{lead_id}/convert-to-applicant": {
      "post": {
        "tags": [
          "CRM"
        ],
        "operationId": "convertLeadToApplicant",
        "summary": "Convert lead qualified ke PMB applicant",
        "description": "Role/permission: admin_crm.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "lead_id",
            "in": "path",
            "required": true,
            "description": "lead_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/ConvertLeadResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_crm",
        "x-idempotent": true,
        "x-audit-log": "lead status history, integration log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ConvertLeadRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "createApplicant",
        "summary": "Membuat applicant",
        "description": "Role/permission: pendaftar | admin_pmb.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "pendaftar | admin_pmb",
        "x-idempotent": true,
        "x-audit-log": "applicant status history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ApplicantCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/submit": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "submitApplicant",
        "summary": "Submit pendaftaran",
        "description": "Role/permission: pendaftar.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "pendaftar",
        "x-idempotent": true,
        "x-audit-log": "status history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SubmitRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/documents": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "uploadApplicantDocument",
        "summary": "Upload dokumen applicant",
        "description": "Role/permission: pendaftar.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "pendaftar",
        "x-idempotent": true,
        "x-audit-log": "document audit",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "$ref": "#/components/schemas/DocumentUploadRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/documents/{document_id}/verify": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "verifyApplicantDocument",
        "summary": "Verifikasi dokumen",
        "description": "Role/permission: admin_pmb.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "document_id",
            "in": "path",
            "required": true,
            "description": "document_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_pmb",
        "x-idempotent": true,
        "x-audit-log": "document audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyDocumentRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/request-invoice": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "requestApplicantInvoice",
        "summary": "Meminta invoice PMB ke Finance",
        "description": "Role/permission: admin_pmb.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Invoice"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_pmb",
        "x-idempotent": true,
        "x-audit-log": "integration log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RequestInvoiceRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/issue-loa": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "issueLoa",
        "summary": "Menerbitkan LoA setelah syarat terpenuhi",
        "description": "Role/permission: admin_pmb.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_pmb",
        "x-idempotent": true,
        "x-audit-log": "LoA audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IssueLoaRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/handover-to-academic": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "handoverApplicantToAcademic",
        "summary": "Handover applicant ke Akademik",
        "description": "Role/permission: admin_pmb.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/HandoverToAcademicResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_pmb",
        "x-idempotent": true,
        "x-audit-log": "handover log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/HandoverToAcademicRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/pmb/applicants/{applicant_id}/selection-results": {
      "post": {
        "tags": [
          "PMB"
        ],
        "operationId": "receiveAssessmentSelectionResult",
        "summary": "Menerima hasil seleksi/CBT dari Assessment",
        "description": "Role/permission: service:Assessment.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "applicant_id",
            "in": "path",
            "required": true,
            "description": "applicant_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Applicant"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:Assessment",
        "x-idempotent": true,
        "x-audit-log": "assessment score audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssessmentResultPublishRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/finance/invoices": {
      "post": {
        "tags": [
          "Finance"
        ],
        "operationId": "createInvoice",
        "summary": "Membuat invoice",
        "description": "Role/permission: service:PMB | service:Academic.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Invoice"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:PMB | service:Academic",
        "x-idempotent": true,
        "x-audit-log": "invoice audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/InvoiceCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/finance/invoices/{invoice_id}": {
      "get": {
        "tags": [
          "Finance"
        ],
        "operationId": "getInvoice",
        "summary": "Membaca invoice",
        "description": "Role/permission: Authorized consumer.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "invoice_id",
            "in": "path",
            "required": true,
            "description": "invoice_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Invoice"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authorized consumer",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/finance/payment-callbacks/{provider}": {
      "post": {
        "tags": [
          "Finance"
        ],
        "operationId": "receivePaymentCallback",
        "summary": "Menerima callback payment gateway",
        "description": "Role/permission: payment provider.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "provider",
            "in": "path",
            "required": true,
            "description": "Payment gateway provider code",
            "schema": {
              "type": "string"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Invoice"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "payment provider",
        "x-idempotent": true,
        "x-audit-log": "callback log, payment audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentCallbackRequest"
              }
            }
          }
        },
        "security": [
          {
            "paymentProviderSignature": []
          }
        ]
      }
    },
    "/api/v1/finance/payment-verifications": {
      "post": {
        "tags": [
          "Finance"
        ],
        "operationId": "verifyManualPayment",
        "summary": "Verifikasi pembayaran manual",
        "description": "Role/permission: admin_keuangan.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Invoice"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_keuangan",
        "x-idempotent": true,
        "x-audit-log": "payment verification audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentVerificationRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/finance/clearances": {
      "get": {
        "tags": [
          "Finance"
        ],
        "operationId": "checkClearance",
        "summary": "Cek clearance applicant/mahasiswa",
        "description": "Role/permission: Academic | LMS | Portal.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "student_id",
            "in": "query",
            "required": false,
            "description": "student_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "applicant_id",
            "in": "query",
            "required": false,
            "description": "applicant_id",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "service_code",
            "in": "query",
            "required": true,
            "description": "service_code",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "academic_period_id",
            "in": "query",
            "required": false,
            "description": "academic_period_id",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/ClearanceResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Academic | LMS | Portal",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/students/generate-from-applicant": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "generateStudentFromApplicant",
        "summary": "Generate mahasiswa dan NIM dari applicant",
        "description": "Role/permission: service:PMB | admin_akademik_biro.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Student"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:PMB | admin_akademik_biro",
        "x-idempotent": true,
        "x-audit-log": "NIM sequence, audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GenerateStudentFromApplicantRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/students": {
      "get": {
        "tags": [
          "Academic"
        ],
        "operationId": "listStudents",
        "summary": "List mahasiswa sesuai scope",
        "description": "Role/permission: admin_akademik | kaprodi.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "name": "filter[study_program_id]",
            "in": "query",
            "required": false,
            "description": "filter[study_program_id]",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/Student"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_akademik | kaprodi",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/classes": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "createAcademicClass",
        "summary": "Membuka kelas pada periode akademik",
        "description": "Role/permission: admin_akademik.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AcademicClass"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_akademik",
        "x-idempotent": true,
        "x-audit-log": "class audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ClassCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/krs": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "createKrsDraft",
        "summary": "Membuat draft KRS",
        "description": "Role/permission: mahasiswa | admin_akademik.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Krs"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "mahasiswa | admin_akademik",
        "x-idempotent": true,
        "x-audit-log": "KRS audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/KrsCreateRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/krs/{krs_id}/submit": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "submitKrs",
        "summary": "Submit KRS untuk approval",
        "description": "Role/permission: mahasiswa.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "krs_id",
            "in": "path",
            "required": true,
            "description": "krs_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Krs"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "mahasiswa",
        "x-idempotent": true,
        "x-audit-log": "KRS status history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SubmitRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/krs/{krs_id}/approve": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "approveKrs",
        "summary": "Approval KRS",
        "description": "Role/permission: dosen_pa.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "krs_id",
            "in": "path",
            "required": true,
            "description": "krs_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Krs"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "dosen_pa",
        "x-idempotent": true,
        "x-audit-log": "KRS status history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SubmitRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/grades/source-imports": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "importGradeSource",
        "summary": "Import source grade",
        "description": "Role/permission: service:LMS | service:Assessment.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Grade"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:LMS | service:Assessment",
        "x-idempotent": true,
        "x-audit-log": "grade source audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GradeSourceImportRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/academic/grades/{grade_id}/finalize": {
      "post": {
        "tags": [
          "Academic"
        ],
        "operationId": "finalizeGrade",
        "summary": "Finalisasi nilai akademik",
        "description": "Role/permission: dosen | admin_akademik.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "grade_id",
            "in": "path",
            "required": true,
            "description": "grade_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Grade"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "dosen | admin_akademik",
        "x-idempotent": true,
        "x-audit-log": "grade history",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GradeFinalizeRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/hris/lecturers": {
      "get": {
        "tags": [
          "HRIS"
        ],
        "operationId": "listActiveLecturers",
        "summary": "Membaca dosen aktif",
        "description": "Role/permission: Academic | LMS.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "name": "status",
            "in": "query",
            "required": false,
            "description": "status",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/Lecturer"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Academic | LMS",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/hris/lecturers/{lecturer_id}": {
      "get": {
        "tags": [
          "HRIS"
        ],
        "operationId": "getLecturer",
        "summary": "Detail dosen aktif",
        "description": "Role/permission: Academic | LMS.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "name": "lecturer_id",
            "in": "path",
            "required": true,
            "description": "lecturer_id identifier",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Lecturer"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Academic | LMS",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/lms/classes/sync-from-academic": {
      "post": {
        "tags": [
          "LMS"
        ],
        "operationId": "syncClassFromAcademic",
        "summary": "Sync kelas akademik ke LMS",
        "description": "Role/permission: service:Academic.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/LmsSyncResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:Academic",
        "x-idempotent": true,
        "x-audit-log": "sync log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LmsClassSyncRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/lms/enrollments/sync-from-krs": {
      "post": {
        "tags": [
          "LMS"
        ],
        "operationId": "syncEnrollmentFromKrs",
        "summary": "Sync peserta kelas dari KRS valid",
        "description": "Role/permission: service:Academic.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/LmsSyncResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:Academic",
        "x-idempotent": true,
        "x-audit-log": "sync log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EnrollmentSyncRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/lms/grade-syncs": {
      "post": {
        "tags": [
          "LMS"
        ],
        "operationId": "syncLmsGrade",
        "summary": "Kirim nilai aktivitas ke Academic",
        "description": "Role/permission: dosen | service:LMS.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Grade"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "dosen | service:LMS",
        "x-idempotent": true,
        "x-audit-log": "grade sync audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LmsGradeSyncRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/assessment/sessions": {
      "post": {
        "tags": [
          "Assessment"
        ],
        "operationId": "createAssessmentSession",
        "summary": "Membuat assessment session",
        "description": "Role/permission: PMB | LMS | admin_assessment.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AssessmentSession"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "PMB | LMS | admin_assessment",
        "x-idempotent": true,
        "x-audit-log": "session audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssessmentSessionRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/assessment/attempts": {
      "post": {
        "tags": [
          "Assessment"
        ],
        "operationId": "createAssessmentAttempt",
        "summary": "Membuat attempt peserta",
        "description": "Role/permission: participant.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AssessmentAttempt"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "participant",
        "x-idempotent": true,
        "x-audit-log": "attempt log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssessmentAttemptRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/assessment/results/publish": {
      "post": {
        "tags": [
          "Assessment"
        ],
        "operationId": "publishAssessmentResult",
        "summary": "Publish hasil ke consumer",
        "description": "Role/permission: admin_assessment | service:Assessment.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/AssessmentAttempt"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "admin_assessment | service:Assessment",
        "x-idempotent": true,
        "x-audit-log": "result audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AssessmentResultPublishRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/portal/notifications": {
      "post": {
        "tags": [
          "Portal"
        ],
        "operationId": "createPortalNotification",
        "summary": "Membuat notifikasi portal",
        "description": "Role/permission: service:any module.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/Notification"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "service:any module",
        "x-idempotent": true,
        "x-audit-log": "notification log",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NotificationRequest"
              }
            }
          }
        },
        "security": [
          {
            "serviceTokenAuth": []
          }
        ]
      }
    },
    "/api/v1/portal/dashboard": {
      "get": {
        "tags": [
          "Portal"
        ],
        "operationId": "getRoleBasedDashboard",
        "summary": "Dashboard sesuai role",
        "description": "Role/permission: Authenticated.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/DashboardResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "Authenticated",
        "x-idempotent": false,
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/event-contracts": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "listEventContracts",
        "summary": "List event contract catalog",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "$ref": "#/components/parameters/EventStatusQuery"
          },
          {
            "$ref": "#/components/parameters/EventNameQuery"
          },
          {
            "$ref": "#/components/parameters/ModuleQuery"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/EventContract"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event observability read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/event-contracts/{event_name}": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "getEventContractByName",
        "summary": "Detail event contract berdasarkan event_name",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/EventNamePath"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/EventContract"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event contract read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/outbox-events": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "listOutboxEvents",
        "summary": "List outbox events",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "$ref": "#/components/parameters/EventStatusQuery"
          },
          {
            "$ref": "#/components/parameters/EventNameQuery"
          },
          {
            "$ref": "#/components/parameters/ModuleQuery"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/OutboxEvent"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event observability read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/inbox-events": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "listInboxEvents",
        "summary": "List inbox events",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "$ref": "#/components/parameters/EventStatusQuery"
          },
          {
            "$ref": "#/components/parameters/EventNameQuery"
          },
          {
            "$ref": "#/components/parameters/ModuleQuery"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/InboxEvent"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event observability read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/dlq-events": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "listDlqEvents",
        "summary": "List DLQ events",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "$ref": "#/components/parameters/EventStatusQuery"
          },
          {
            "$ref": "#/components/parameters/EventNameQuery"
          },
          {
            "$ref": "#/components/parameters/ModuleQuery"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/DlqEvent"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event observability read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/dlq-events/{event_key}/replay": {
      "post": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "replayDlqEvent",
        "summary": "Replay event dari DLQ",
        "description": "Role/permission: devops_sre. Replay wajib memakai reason dan audit trail.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/EventKeyPath"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/EventReplayResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "devops_sre",
        "x-idempotent": true,
        "x-audit-log": "event DLQ replay audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/EventReplayRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/reconciliation-mismatches": {
      "get": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "listReconciliationMismatches",
        "summary": "List reconciliation mismatch logs",
        "description": "Role/permission: technical_admin | devops_sre | auditor.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/Sort"
          },
          {
            "$ref": "#/components/parameters/Search"
          },
          {
            "$ref": "#/components/parameters/EventStatusQuery"
          },
          {
            "$ref": "#/components/parameters/EventNameQuery"
          },
          {
            "$ref": "#/components/parameters/ModuleQuery"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "type": "array",
                          "items": {
                            "$ref": "#/components/schemas/ReconciliationMismatch"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | auditor",
        "x-idempotent": false,
        "x-audit-log": "event observability read",
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    },
    "/api/v1/integration/reconciliation-mismatches/{mismatch_id}/resolve": {
      "post": {
        "tags": [
          "Event Contract"
        ],
        "operationId": "resolveReconciliationMismatch",
        "summary": "Resolve reconciliation mismatch",
        "description": "Role/permission: technical_admin | devops_sre | owner_modul. Resolusi wajib mencatat reason.",
        "parameters": [
          {
            "$ref": "#/components/parameters/XApplicationCode"
          },
          {
            "$ref": "#/components/parameters/XActiveRole"
          },
          {
            "$ref": "#/components/parameters/XCorrelationId"
          },
          {
            "$ref": "#/components/parameters/MismatchIdPath"
          },
          {
            "$ref": "#/components/parameters/IdempotencyKey"
          }
        ],
        "responses": {
          "200": {
            "description": "Request processed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "allOf": [
                    {
                      "$ref": "#/components/schemas/SuccessEnvelope"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "data": {
                          "$ref": "#/components/schemas/ReconciliationResolveResponse"
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          "401": {
            "description": "Authentication required or token expired",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "403": {
            "description": "Forbidden or scope denied",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "404": {
            "description": "Data not found",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "409": {
            "description": "Business rule violation, duplicate request, or conflict state",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "422": {
            "description": "Validation error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          },
          "502": {
            "description": "Integration failed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ErrorEnvelope"
                }
              }
            }
          }
        },
        "x-permission-roles": "technical_admin | devops_sre | owner_modul",
        "x-idempotent": true,
        "x-audit-log": "reconciliation resolve audit",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReconciliationResolveRequest"
              }
            }
          }
        },
        "security": [
          {
            "bearerAuth": []
          }
        ]
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Access token dari Core SSO/OAuth/OIDC-style."
      },
      "serviceTokenAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-Service-Token",
        "description": "Service token komunikasi internal antar modul."
      },
      "paymentProviderSignature": {
        "type": "apiKey",
        "in": "header",
        "name": "X-Provider-Signature",
        "description": "Signature callback dari payment provider."
      }
    },
    "parameters": {
      "XApplicationCode": {
        "name": "X-Application-Code",
        "in": "header",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Kode aplikasi pemanggil, misalnya portal, pmb, academic, finance, lms."
      },
      "XActiveRole": {
        "name": "X-Active-Role",
        "in": "header",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Role aktif dari Core active role session."
      },
      "XCorrelationId": {
        "name": "X-Correlation-Id",
        "in": "header",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "ID korelasi untuk tracing lintas modul."
      },
      "IdempotencyKey": {
        "name": "Idempotency-Key",
        "in": "header",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Key deterministik untuk mencegah duplicate processing."
      },
      "Page": {
        "name": "page",
        "in": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "default": 1
        }
      },
      "Limit": {
        "name": "limit",
        "in": "query",
        "required": false,
        "schema": {
          "type": "integer",
          "default": 20,
          "maximum": 100
        }
      },
      "Sort": {
        "name": "sort",
        "in": "query",
        "required": false,
        "schema": {
          "type": "string",
          "example": "created_at:desc"
        }
      },
      "Search": {
        "name": "search",
        "in": "query",
        "required": false,
        "schema": {
          "type": "string"
        }
      },
      "EventNamePath": {
        "name": "event_name",
        "in": "path",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Event name, contoh finance.payment_paid."
      },
      "EventKeyPath": {
        "name": "event_key",
        "in": "path",
        "required": true,
        "schema": {
          "type": "string"
        },
        "description": "Event key unik."
      },
      "MismatchIdPath": {
        "name": "mismatch_id",
        "in": "path",
        "required": true,
        "schema": {
          "type": "string",
          "format": "uuid"
        },
        "description": "ID mismatch reconciliation."
      },
      "EventStatusQuery": {
        "name": "status",
        "in": "query",
        "required": false,
        "schema": {
          "type": "string"
        },
        "description": "Filter status event."
      },
      "EventNameQuery": {
        "name": "event_name",
        "in": "query",
        "required": false,
        "schema": {
          "type": "string"
        },
        "description": "Filter nama event."
      },
      "ModuleQuery": {
        "name": "module",
        "in": "query",
        "required": false,
        "schema": {
          "type": "string"
        },
        "description": "Filter modul publisher/consumer."
      }
    },
    "schemas": {
      "Meta": {
        "type": "object",
        "properties": {
          "request_id": {
            "type": "string",
            "example": "req_20260618_000001"
          },
          "correlation_id": {
            "type": "string",
            "example": "corr-uuid"
          },
          "timestamp": {
            "type": "string",
            "format": "date-time",
            "example": "2026-06-18T10:00:00+07:00"
          }
        },
        "required": [
          "request_id",
          "correlation_id",
          "timestamp"
        ]
      },
      "PaginationMeta": {
        "type": "object",
        "properties": {
          "page": {
            "type": "integer",
            "example": 1
          },
          "limit": {
            "type": "integer",
            "example": 20
          },
          "total": {
            "type": "integer",
            "example": 250
          },
          "total_page": {
            "type": "integer",
            "example": 13
          },
          "sort": {
            "type": "string",
            "example": "created_at:desc"
          }
        }
      },
      "SuccessEnvelope": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": true
          },
          "code": {
            "type": "string",
            "example": "OK"
          },
          "message": {
            "type": "string",
            "example": "Request processed successfully"
          },
          "data": {
            "type": "object",
            "additionalProperties": true
          },
          "meta": {
            "$ref": "#/components/schemas/Meta"
          }
        },
        "required": [
          "success",
          "code",
          "message",
          "data",
          "meta"
        ]
      },
      "ErrorDetail": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string",
            "example": "academic_period_id"
          },
          "message": {
            "type": "string",
            "example": "academic_period_id is required"
          }
        }
      },
      "ErrorEnvelope": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": false
          },
          "code": {
            "type": "string",
            "enum": [
              "AUTH_REQUIRED",
              "TOKEN_EXPIRED",
              "FORBIDDEN",
              "SCOPE_DENIED",
              "NOT_FOUND",
              "VALIDATION_ERROR",
              "BUSINESS_RULE_VIOLATION",
              "DUPLICATE_REQUEST",
              "CONFLICT_STATE",
              "INTEGRATION_FAILED",
              "INTERNAL_ERROR",
              "EVENT_SCHEMA_INVALID",
              "EVENT_DUPLICATE",
              "EVENT_VERSION_UNSUPPORTED",
              "SOURCE_REF_NOT_FOUND",
              "SNAPSHOT_UPDATE_FAILED",
              "RECONCILIATION_REQUIRED",
              "CONSUMER_TEMPORARY_FAILURE",
              "CONSUMER_PERMANENT_FAILURE",
              "DLQ_REPLAY_DENIED"
            ]
          },
          "message": {
            "type": "string",
            "example": "Request validation failed"
          },
          "errors": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ErrorDetail"
            }
          },
          "meta": {
            "$ref": "#/components/schemas/Meta"
          }
        },
        "required": [
          "success",
          "code",
          "message",
          "meta"
        ]
      },
      "TokenResponse": {
        "type": "object",
        "properties": {
          "access_token": {
            "type": "string"
          },
          "refresh_token": {
            "type": "string"
          },
          "expires_in": {
            "type": "integer",
            "example": 3600
          },
          "token_type": {
            "type": "string",
            "example": "Bearer"
          }
        }
      },
      "UserProfile": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "person_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "active_role": {
            "type": "string"
          },
          "permissions": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "scope": {
            "type": "object",
            "additionalProperties": true
          }
        }
      },
      "Application": {
        "type": "object",
        "properties": {
          "application_code": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "enabled": {
            "type": "boolean"
          }
        }
      },
      "StudyProgram": {
        "type": "object",
        "properties": {
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "code": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "degree": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "AcademicYear": {
        "type": "object",
        "properties": {
          "academic_year_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "code": {
            "type": "string",
            "example": "2026/2027"
          },
          "name": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "AcademicPeriod": {
        "type": "object",
        "properties": {
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_year_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "code": {
            "type": "string",
            "example": "2026-GANJIL"
          },
          "term": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Lead": {
        "type": "object",
        "properties": {
          "lead_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "phone": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "ConvertLeadResponse": {
        "type": "object",
        "properties": {
          "lead_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "applicant_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "applicant_number": {
            "type": "string",
            "example": "PMB-2026-000001"
          },
          "status": {
            "type": "string",
            "example": "draft"
          }
        }
      },
      "Applicant": {
        "type": "object",
        "properties": {
          "applicant_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "applicant_number": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          }
        }
      },
      "Invoice": {
        "type": "object",
        "properties": {
          "invoice_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "invoice_number": {
            "type": "string"
          },
          "payer_type": {
            "type": "string"
          },
          "payer_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "amount_total": {
            "type": "number"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Student": {
        "type": "object",
        "properties": {
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "nim": {
            "type": "string"
          },
          "person_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "AcademicClass": {
        "type": "object",
        "properties": {
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "course_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "class_code": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Krs": {
        "type": "object",
        "properties": {
          "krs_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Grade": {
        "type": "object",
        "properties": {
          "grade_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "final_grade": {
            "type": "number"
          },
          "letter_grade": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Lecturer": {
        "type": "object",
        "properties": {
          "lecturer_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "person_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "name": {
            "type": "string"
          },
          "homebase_study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "employment_status": {
            "type": "string"
          }
        }
      },
      "LmsSyncResponse": {
        "type": "object",
        "properties": {
          "sync_status": {
            "type": "string",
            "example": "upserted"
          },
          "lms_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "lms_enrollment_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          }
        }
      },
      "AssessmentSession": {
        "type": "object",
        "properties": {
          "assessment_session_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "context": {
            "type": "string"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "AssessmentAttempt": {
        "type": "object",
        "properties": {
          "attempt_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "assessment_session_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "status": {
            "type": "string"
          }
        }
      },
      "Notification": {
        "type": "object",
        "properties": {
          "notification_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "recipient_user_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "event_type": {
            "type": "string"
          },
          "read_status": {
            "type": "boolean"
          }
        }
      },
      "DashboardResponse": {
        "type": "object",
        "properties": {
          "role": {
            "type": "string"
          },
          "widgets": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "widget_code": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "summary": {
                  "type": "object",
                  "additionalProperties": true
                }
              }
            }
          }
        }
      },
      "ClearanceResponse": {
        "type": "object",
        "properties": {
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "applicant_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "service_code": {
            "type": "string"
          },
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "clearance_status": {
            "type": "string",
            "enum": [
              "clear",
              "conditional",
              "blocked"
            ]
          },
          "block_reasons": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string",
            "example": "admin@unsia.ac.id"
          },
          "password": {
            "type": "string",
            "format": "password"
          },
          "captcha_token": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "username",
          "password"
        ]
      },
      "SwitchRoleRequest": {
        "type": "object",
        "properties": {
          "role_code": {
            "type": "string",
            "example": "admin_pmb"
          },
          "scope_value": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "role_code"
        ]
      },
      "ImpersonationStartRequest": {
        "type": "object",
        "properties": {
          "target_user_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "reason": {
            "type": "string"
          },
          "duration_minutes": {
            "type": "integer",
            "default": 30
          }
        },
        "required": [
          "target_user_id",
          "reason"
        ]
      },
      "AcademicYearCreateRequest": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "example": "2026/2027"
          },
          "name": {
            "type": "string"
          },
          "start_date": {
            "type": "string",
            "format": "date"
          },
          "end_date": {
            "type": "string",
            "format": "date"
          },
          "status": {
            "type": "string",
            "default": "active"
          }
        },
        "required": [
          "code",
          "name"
        ]
      },
      "AcademicPeriodCreateRequest": {
        "type": "object",
        "properties": {
          "academic_year_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "code": {
            "type": "string",
            "example": "2026-GANJIL"
          },
          "term": {
            "type": "string",
            "enum": [
              "GANJIL",
              "GENAP",
              "PENDEK"
            ]
          },
          "start_date": {
            "type": "string",
            "format": "date"
          },
          "end_date": {
            "type": "string",
            "format": "date"
          }
        },
        "required": [
          "academic_year_id",
          "code",
          "term"
        ]
      },
      "LeadCreateRequest": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "phone": {
            "type": "string"
          },
          "campaign_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "source": {
            "type": "string"
          },
          "target_entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          }
        },
        "required": [
          "name",
          "phone"
        ]
      },
      "ConvertLeadRequest": {
        "type": "object",
        "properties": {
          "target_entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "admission_path_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "target_entry_period_id",
          "admission_path_id",
          "study_program_id",
          "reason"
        ]
      },
      "ApplicantCreateRequest": {
        "type": "object",
        "properties": {
          "person": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "phone": {
                "type": "string"
              }
            }
          },
          "target_entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "admission_path_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          }
        },
        "required": [
          "person",
          "target_entry_period_id",
          "study_program_id"
        ]
      },
      "SubmitRequest": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string"
          }
        }
      },
      "DocumentUploadRequest": {
        "type": "object",
        "properties": {
          "document_type_code": {
            "type": "string",
            "example": "KTP"
          },
          "file": {
            "type": "string",
            "format": "binary"
          }
        },
        "required": [
          "document_type_code",
          "file"
        ]
      },
      "VerifyDocumentRequest": {
        "type": "object",
        "properties": {
          "verification_status": {
            "type": "string",
            "enum": [
              "verified",
              "rejected"
            ]
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "verification_status"
        ]
      },
      "RequestInvoiceRequest": {
        "type": "object",
        "properties": {
          "invoice_context": {
            "type": "string",
            "enum": [
              "PMB_FORM",
              "RE_REGISTRATION"
            ]
          },
          "payment_component_codes": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "due_date": {
            "type": "string",
            "format": "date"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "invoice_context",
          "payment_component_codes",
          "due_date"
        ]
      },
      "IssueLoaRequest": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string"
          },
          "template_code": {
            "type": "string"
          }
        },
        "required": [
          "reason"
        ]
      },
      "HandoverToAcademicRequest": {
        "type": "object",
        "properties": {
          "entry_academic_year_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "curriculum_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "entry_academic_year_id",
          "entry_period_id",
          "study_program_id",
          "curriculum_id",
          "reason"
        ]
      },
      "HandoverToAcademicResponse": {
        "type": "object",
        "properties": {
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "nim": {
            "type": "string",
            "example": "20261010001"
          },
          "handover_status": {
            "type": "string",
            "example": "completed"
          }
        }
      },
      "InvoiceCreateRequest": {
        "type": "object",
        "properties": {
          "payer_type": {
            "type": "string",
            "enum": [
              "applicant",
              "student"
            ]
          },
          "payer_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "payment_component_code": {
                  "type": "string"
                },
                "amount": {
                  "type": "number"
                }
              }
            }
          },
          "source_module": {
            "type": "string"
          },
          "source_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "due_date": {
            "type": "string",
            "format": "date"
          }
        },
        "required": [
          "payer_type",
          "payer_ref_id",
          "academic_period_id",
          "items",
          "source_module",
          "source_ref_id"
        ]
      },
      "PaymentCallbackRequest": {
        "type": "object",
        "properties": {
          "provider_event_id": {
            "type": "string"
          },
          "invoice_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "payment_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "amount": {
            "type": "number"
          },
          "payment_status": {
            "type": "string",
            "enum": [
              "paid",
              "partial",
              "failed",
              "expired"
            ]
          },
          "signature_status": {
            "type": "string",
            "enum": [
              "valid",
              "invalid"
            ]
          },
          "payload_hash": {
            "type": "string"
          },
          "raw_payload": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "provider_event_id",
          "invoice_id",
          "amount",
          "payment_status",
          "payload_hash"
        ]
      },
      "PaymentVerificationRequest": {
        "type": "object",
        "properties": {
          "invoice_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "payment_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "verification_status": {
            "type": "string",
            "enum": [
              "verified",
              "rejected"
            ]
          },
          "amount": {
            "type": "number"
          },
          "paid_at": {
            "type": "string",
            "format": "date-time"
          },
          "attachment_ref": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "invoice_id",
          "verification_status",
          "reason"
        ]
      },
      "GenerateStudentFromApplicantRequest": {
        "type": "object",
        "properties": {
          "applicant_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "curriculum_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "entry_academic_year_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "entry_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "study_program_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "applicant_id",
          "curriculum_id",
          "entry_period_id"
        ]
      },
      "ClassCreateRequest": {
        "type": "object",
        "properties": {
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "course_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "class_code": {
            "type": "string"
          },
          "lecturer_ids": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid",
              "example": "00000000-0000-0000-0000-000000000000"
            }
          },
          "capacity": {
            "type": "integer"
          }
        },
        "required": [
          "academic_period_id",
          "course_id",
          "class_code"
        ]
      },
      "KrsCreateRequest": {
        "type": "object",
        "properties": {
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "academic_class_id": {
                  "type": "string",
                  "format": "uuid",
                  "example": "00000000-0000-0000-0000-000000000000"
                }
              }
            }
          }
        },
        "required": [
          "student_id",
          "academic_period_id"
        ]
      },
      "GradeSourceImportRequest": {
        "type": "object",
        "properties": {
          "source_module": {
            "type": "string",
            "enum": [
              "lms",
              "assessment"
            ]
          },
          "source_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "component_code": {
            "type": "string",
            "enum": [
              "QUIZ",
              "ASSIGNMENT",
              "CBT"
            ]
          },
          "score": {
            "type": "number"
          },
          "max_score": {
            "type": "number"
          },
          "submitted_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "source_module",
          "source_ref_id",
          "academic_class_id",
          "student_id",
          "component_code",
          "score",
          "max_score"
        ]
      },
      "GradeFinalizeRequest": {
        "type": "object",
        "properties": {
          "final_grade": {
            "type": "number"
          },
          "letter_grade": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        },
        "required": [
          "reason"
        ]
      },
      "LmsClassSyncRequest": {
        "type": "object",
        "properties": {
          "academic_period_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "course_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "class_code": {
            "type": "string"
          },
          "lecturer_ids": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid",
              "example": "00000000-0000-0000-0000-000000000000"
            }
          },
          "schedule": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "day": {
                  "type": "string"
                },
                "start_time": {
                  "type": "string"
                },
                "end_time": {
                  "type": "string"
                }
              }
            }
          }
        },
        "required": [
          "academic_period_id",
          "academic_class_id",
          "course_id",
          "class_code"
        ]
      },
      "EnrollmentSyncRequest": {
        "type": "object",
        "properties": {
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "krs_item_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "enrollment_status": {
            "type": "string",
            "default": "active"
          }
        },
        "required": [
          "academic_class_id",
          "krs_item_id",
          "student_id"
        ]
      },
      "LmsGradeSyncRequest": {
        "type": "object",
        "properties": {
          "source_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "student_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "component_code": {
            "type": "string"
          },
          "score": {
            "type": "number"
          },
          "max_score": {
            "type": "number"
          },
          "submitted_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "source_ref_id",
          "academic_class_id",
          "student_id",
          "component_code",
          "score",
          "max_score"
        ]
      },
      "AssessmentSessionRequest": {
        "type": "object",
        "properties": {
          "context": {
            "type": "string",
            "enum": [
              "PMB",
              "LMS",
              "ACADEMIC",
              "SURVEY"
            ]
          },
          "title": {
            "type": "string"
          },
          "consumer_module": {
            "type": "string"
          },
          "wave_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "academic_class_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "question_set_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "start_at": {
            "type": "string",
            "format": "date-time"
          },
          "end_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "context",
          "title"
        ]
      },
      "AssessmentAttemptRequest": {
        "type": "object",
        "properties": {
          "assessment_session_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "participant_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "started_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "assessment_session_id",
          "participant_ref_id"
        ]
      },
      "AssessmentResultPublishRequest": {
        "type": "object",
        "properties": {
          "attempt_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "consumer_module": {
            "type": "string",
            "enum": [
              "pmb",
              "lms",
              "academic"
            ]
          },
          "score": {
            "type": "number"
          },
          "result_status": {
            "type": "string"
          },
          "target_ref_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          }
        },
        "required": [
          "attempt_id",
          "consumer_module",
          "score",
          "result_status"
        ]
      },
      "NotificationRequest": {
        "type": "object",
        "properties": {
          "recipient_user_id": {
            "type": "string",
            "format": "uuid",
            "example": "00000000-0000-0000-0000-000000000000"
          },
          "event_type": {
            "type": "string"
          },
          "source_module": {
            "type": "string"
          },
          "event_key": {
            "type": "string"
          },
          "severity": {
            "type": "string",
            "enum": [
              "info",
              "warning",
              "urgent"
            ]
          },
          "title": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "link_url": {
            "type": "string"
          },
          "expires_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "recipient_user_id",
          "event_type",
          "source_module",
          "event_key",
          "message"
        ]
      },
      "EventContract": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "event_name": {
            "type": "string",
            "example": "finance.payment_paid"
          },
          "event_version": {
            "type": "string",
            "example": "v1"
          },
          "event_type": {
            "type": "string",
            "enum": [
              "DOMAIN_EVENT",
              "INTEGRATION_EVENT",
              "NOTIFICATION_EVENT",
              "SNAPSHOT_EVENT"
            ]
          },
          "publisher_module": {
            "type": "string",
            "example": "finance"
          },
          "publisher_database": {
            "type": "string",
            "example": "finance_db"
          },
          "aggregate_type": {
            "type": "string",
            "example": "payment"
          },
          "payload_schema": {
            "type": "object",
            "additionalProperties": true
          },
          "validation_schema": {
            "type": "object",
            "additionalProperties": true
          },
          "status": {
            "type": "string",
            "enum": [
              "draft",
              "active",
              "deprecated",
              "retired"
            ]
          },
          "description": {
            "type": "string"
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "event_name",
          "event_version",
          "event_type",
          "publisher_module",
          "aggregate_type",
          "payload_schema",
          "status"
        ]
      },
      "EventEnvelope": {
        "type": "object",
        "properties": {
          "event_name": {
            "type": "string",
            "example": "finance.payment_paid"
          },
          "event_version": {
            "type": "string",
            "example": "v1"
          },
          "event_key": {
            "type": "string",
            "example": "finance.payment_paid:payment_id:8f2c:v1"
          },
          "event_type": {
            "type": "string",
            "enum": [
              "DOMAIN_EVENT",
              "INTEGRATION_EVENT",
              "NOTIFICATION_EVENT",
              "SNAPSHOT_EVENT"
            ]
          },
          "publisher_service": {
            "type": "string",
            "example": "finance-service"
          },
          "publisher_database": {
            "type": "string",
            "example": "finance_db"
          },
          "aggregate_type": {
            "type": "string",
            "example": "payment"
          },
          "aggregate_id": {
            "type": "string",
            "format": "uuid"
          },
          "correlation_id": {
            "type": "string"
          },
          "causation_id": {
            "type": "string"
          },
          "occurred_at": {
            "type": "string",
            "format": "date-time"
          },
          "published_at": {
            "type": "string",
            "format": "date-time"
          },
          "payload": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "event_name",
          "event_version",
          "event_key",
          "publisher_service",
          "aggregate_type",
          "aggregate_id",
          "occurred_at",
          "payload"
        ]
      },
      "OutboxEvent": {
        "allOf": [
          {
            "$ref": "#/components/schemas/EventEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "status": {
                "type": "string",
                "enum": [
                  "PENDING",
                  "PUBLISHED",
                  "RETRYING",
                  "FAILED",
                  "DLQ"
                ]
              },
              "retry_count": {
                "type": "integer"
              },
              "max_retry": {
                "type": "integer"
              },
              "next_retry_at": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "last_error": {
                "type": "string",
                "nullable": true
              },
              "dead_letter_at": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "created_at": {
                "type": "string",
                "format": "date-time"
              },
              "updated_at": {
                "type": "string",
                "format": "date-time"
              }
            }
          }
        ]
      },
      "InboxEvent": {
        "allOf": [
          {
            "$ref": "#/components/schemas/EventEnvelope"
          },
          {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "format": "uuid"
              },
              "consumer_module": {
                "type": "string",
                "example": "pmb"
              },
              "status": {
                "type": "string",
                "enum": [
                  "RECEIVED",
                  "PROCESSED",
                  "RETRYING",
                  "FAILED",
                  "DLQ",
                  "IGNORED_DUPLICATE"
                ]
              },
              "retry_count": {
                "type": "integer"
              },
              "next_retry_at": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "received_at": {
                "type": "string",
                "format": "date-time"
              },
              "processed_at": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              },
              "last_error": {
                "type": "string",
                "nullable": true
              },
              "dead_letter_at": {
                "type": "string",
                "format": "date-time",
                "nullable": true
              }
            }
          }
        ]
      },
      "DlqEvent": {
        "type": "object",
        "properties": {
          "event_key": {
            "type": "string"
          },
          "event_name": {
            "type": "string"
          },
          "event_version": {
            "type": "string"
          },
          "publisher_module": {
            "type": "string"
          },
          "consumer_module": {
            "type": "string"
          },
          "retry_count": {
            "type": "integer"
          },
          "last_error": {
            "type": "string"
          },
          "dead_letter_at": {
            "type": "string",
            "format": "date-time"
          },
          "payload": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "event_key",
          "event_name",
          "publisher_module",
          "consumer_module",
          "last_error",
          "dead_letter_at"
        ]
      },
      "EventReplayRequest": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string",
            "example": "Replay after consumer fix"
          },
          "target_consumer": {
            "type": "string",
            "example": "pmb"
          },
          "force": {
            "type": "boolean",
            "default": false
          }
        },
        "required": [
          "reason"
        ]
      },
      "EventReplayResponse": {
        "type": "object",
        "properties": {
          "event_key": {
            "type": "string"
          },
          "replay_status": {
            "type": "string",
            "enum": [
              "queued",
              "success",
              "failed"
            ]
          },
          "audit_ref_id": {
            "type": "string",
            "format": "uuid"
          },
          "message": {
            "type": "string"
          }
        }
      },
      "ReconciliationMismatch": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "source_module": {
            "type": "string"
          },
          "source_table": {
            "type": "string"
          },
          "source_ref_id": {
            "type": "string",
            "format": "uuid"
          },
          "consumer_module": {
            "type": "string"
          },
          "consumer_table": {
            "type": "string"
          },
          "consumer_ref_id": {
            "type": "string",
            "format": "uuid"
          },
          "source_event_key": {
            "type": "string"
          },
          "mismatch_type": {
            "type": "string",
            "enum": [
              "missing_source",
              "missing_snapshot",
              "value_mismatch",
              "stale_snapshot",
              "duplicate_projection"
            ]
          },
          "source_value": {
            "type": "object",
            "additionalProperties": true
          },
          "snapshot_value": {
            "type": "object",
            "additionalProperties": true
          },
          "status": {
            "type": "string",
            "enum": [
              "OPEN",
              "CORRECTED",
              "IGNORED",
              "PENDING_REVIEW"
            ]
          },
          "reason": {
            "type": "string",
            "nullable": true
          },
          "detected_at": {
            "type": "string",
            "format": "date-time"
          },
          "corrected_at": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "ignored_at": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        }
      },
      "ReconciliationResolveRequest": {
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": [
              "mark_corrected",
              "mark_ignored",
              "set_pending_review"
            ]
          },
          "reason": {
            "type": "string"
          },
          "correction_payload": {
            "type": "object",
            "additionalProperties": true
          }
        },
        "required": [
          "action",
          "reason"
        ]
      },
      "ReconciliationResolveResponse": {
        "type": "object",
        "properties": {
          "mismatch_id": {
            "type": "string",
            "format": "uuid"
          },
          "status": {
            "type": "string",
            "enum": [
              "CORRECTED",
              "IGNORED",
              "PENDING_REVIEW"
            ]
          },
          "audit_ref_id": {
            "type": "string",
            "format": "uuid"
          }
        }
      }
    }
  },
  "x-api-governance": {
    "api_versioning": "All endpoints use /api/v1. Breaking changes must use /api/v2 or versioned contract.",
    "backend_scope": "Permission and data scope must be enforced in backend, not only UI.",
    "audit": "Sensitive actions log actor, active role, application, request_id, reason, IP, user agent, old value, and new value when relevant.",
    "idempotency": "Payment callback, handover, NIM generation, class sync, enrollment sync, and grade sync must use deterministic idempotency key.",
    "domain_ownership": "Module only writes to its own domain. Cross-domain write uses API/service event."
  }
}
```
