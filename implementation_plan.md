# Implementation Plan: ERP Pendidikan / SIAKAD Terintegrasi UNSIA

## Ringkasan Proyek

ERP UNSIA adalah sistem kampus modular terdistribusi yang mengelola lifecycle dari **lead → applicant → mahasiswa → alumni**. Sistem dibangun sebagai **multi-repo**, **multi-service**, dengan **database fisik per modul**, dan integrasi lintas modul via **API + event-driven (outbox/inbox)**.

---

## Analisis Dokumen Handoff

Dokumen [AI_HANDOFF_PACK_ERP_UNSIA_FULL_CONTEXT.md](file:///d:/Superman/Superman/Coding/candi/candi-gembang/AI_HANDOFF_PACK_ERP_UNSIA_FULL_CONTEXT.md) (~21.335 baris) mencakup:
1. Master Prompt & Struktur Repo
2. PRD Global v6.5
3. BRD v1.1.1
4. SRS v1.0
5. Role & Permission Matrix
6. Module Boundary
7. DBML Global
8. API Contract
9. OpenAPI Swagger

---

## Analisis UI Reference

Direktori [UI/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI) berisi **HTML mockup** dan **PDF design** untuk setiap modul:

| Modul | File UI | Format |
|-------|---------|--------|
| **SSO** | `SSO MAHASISWA.html`, `SSO SUPERADMIN.html` | HTML |
| **PMB** | `ADMIN PMB.html`, `ADMIN PMB 2.html`, `DASHBOARD PENDAFTARAN.html`, `PMB PUBLIK.html`, `commandcenter.html`, `ujiantesmasuk.html` | HTML |
| **KEUANGAN** | `ADMIN KEUANGAN.html`, `KEUANGAN MAHASISWA.html` | HTML |
| **AKADEMIK/ADMIN** | `Admin Akademik UNSIA ONLINE.html`, `Admin Akademik UNSIA _BIRO.html`, `Admin Akademik UNSIA _Prodi.html`, `admin akademik 2.html` | HTML |
| **AKADEMIK/MAHASISWA** | `SIAKAD MAHASISWA PERTAMA KALI.html`, `SIAKAD ONBOARDING PENDAFTAR MAHASISWA.html` | HTML |
| **AKADEMIK/SA** | `Panduan Pengambilan KRS.html`, `Usecase KRS.html`, `activity diagram.html` | HTML |
| **CRM** | `CRM UNSIA.html` | HTML |
| **LMS** | `LMS DOSEN DAN MAHASISWA.html`, `ICEMS Diskusi - MAHASISWA.html`, `ICEMS SESI - DOsen.html`, dll. (9 file) | HTML |
| **MARKETING** | `Sistem Informasi Marketing UNSIA.pdf`, `Update UI Sistem Marketing.pdf` | PDF |
| **SDM** | `HRIS.html`, `SDM Admins.html` | HTML |

---

## Arsitektur & Tech Stack

```
Architecture   : Modular Distributed ERP (Multi-Repo)
Frontend       : Next.js + TypeScript + Tailwind CSS + Shadcn UI + TanStack Query
Backend API    : Next.js Route Handler + TypeScript + Zod
ORM            : Drizzle ORM
Database       : PostgreSQL (1 DB per modul, total 10 DB)
Worker         : Node.js TypeScript (outbox/inbox/retry/DLQ/reconciliation)
Auth           : Core Service (JWT/OIDC, RBAC, active role, data scope)
Integration    : API + Event + Snapshot + Read Model + Reconciliation
Deployment     : Docker + Nginx/API Gateway + CI/CD
```

---

## Daftar Modul & Database

| # | Modul | Repo | Database | Domain |
|---|-------|------|----------|--------|
| 1 | Core | `unsia-core-service` | `core_db` | Identity, SSO, RBAC, user, role, permission, session, service token, audit |
| 2 | Reference | `unsia-reference-service` | `reference_db` | Master data, prodi, tahun ajaran, periode akademik, status code |
| 3 | CRM | `unsia-crm-service` | `crm_db` | Lead, campaign, agent, referral, follow-up, commission |
| 4 | PMB | `unsia-pmb-service` | `pmb_db` | Applicant, biodata, dokumen, seleksi, LoA, handover |
| 5 | Finance | `unsia-finance-service` | `finance_db` | Invoice, payment, callback, clearance, receipt |
| 6 | Academic | `unsia-academic-service` | `academic_db` | Student, NIM, curriculum, class, KRS, grade, KHS, transcript |
| 7 | HRIS | `unsia-hris-service` | `hris_db` | Employee, lecturer, homebase, unit kerja, jabatan |
| 8 | LMS | `unsia-lms-service` | `lms_db` | Online class, enrollment, session, material, task, progress |
| 9 | Assessment | `unsia-assessment-service` | `assessment_db` | Question bank, session, attempt, scoring, result |
| 10 | Portal | `unsia-portal-web` | `portal_db` | Dashboard, notification, preference, read model |
| - | Worker | `unsia-integration-worker` | (multi-DB) | Outbox, inbox, retry, DLQ, reconciliation |
| - | Shared | `unsia-shared-contracts` | - | Types, event schema, role/permission codes |
| - | Infra | `unsia-infra` | - | Docker, gateway, CI/CD, monitoring |

---

## Proposed Implementation: Phased Release

> [!IMPORTANT]
> Implementasi wajib mengikuti urutan fase berikut. Setiap fase bergantung pada output fase sebelumnya.

### Phase 0 — Architecture Foundation
**Fokus:** Shared contracts, infra base, database template, event library

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Setup `unsia-shared-contracts` | shared-contracts | Response envelope, error codes, role codes, permission codes, event schema types, Zod DTOs |
| 2 | Setup `unsia-infra` | infra | Docker Compose (local), Nginx config, env templates, PostgreSQL per modul, Redis, RabbitMQ |
| 3 | Buat template service standar | - | Boilerplate Next.js service: auth/rbac/scope/audit/idempotency middleware, outbox/inbox, response lib |
| 4 | Buat migration & seed standar | - | Drizzle config template, audit_logs, idempotency_keys, outbox_events, inbox_events, reconciliation_logs |

---

### Phase 1 — Core + Reference Service
**Fokus:** Identity, SSO, RBAC, master data

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Core Service: person, user, password, session, role, permission | core-service | Login, refresh, logout, switch-role, user CRUD |
| 2 | Core Service: application registry, service client/token | core-service | App launcher, service-to-service auth |
| 3 | Core Service: audit log global | core-service | Audit endpoint + middleware |
| 4 | Core Service: JWT/JWKS + token cache support | core-service | Public key endpoint untuk offline validation |
| 5 | Reference Service: study_program, academic_year, academic_period | reference-service | Master data CRUD + event publish |
| 6 | Reference Service: status_code, payment_component, document_type, region, religion | reference-service | Full master data |
| 7 | Portal Web: Login page + role selector + app launcher | portal-web | UI SSO sesuai mockup `SSO MAHASISWA.html` & `SSO SUPERADMIN.html` |

**UI Reference:** [SSO/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/SSO)

---

### Phase 2 — CRM + PMB + Finance (Basic)
**Fokus:** Lead → Applicant → Invoice → Payment

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | CRM Service: campaign, lead, agent, referral, follow-up | crm-service | Lead capture + funnel + convert to PMB |
| 2 | PMB Service: applicant, biodata, document, wave | pmb-service | Applicant registration + document upload/verify |
| 3 | PMB Service: invoice request ke Finance | pmb-service | API call Finance + applicant_invoice_statuses read model |
| 4 | Finance Service: invoice, payment, callback, receipt | finance-service | Invoice CRUD + payment callback idempotent |
| 5 | Finance Service: clearance basic | finance-service | Clearance status per subject |
| 6 | Integration Worker: outbox PMB↔Finance | worker | Event finance.invoice_created, finance.payment_paid → PMB |
| 7 | Portal Web: PMB admin pages | portal-web | UI sesuai mockup `ADMIN PMB.html`, `DASHBOARD PENDAFTARAN.html` |
| 8 | Portal Web: Finance admin pages | portal-web | UI sesuai mockup `ADMIN KEUANGAN.html` |
| 9 | Portal Web: PMB publik (pendaftaran) | portal-web | UI sesuai `PMB PUBLIK.html` |
| 10 | Portal Web: CRM dashboard | portal-web | UI sesuai `CRM UNSIA.html` |

**UI Reference:** [PMB/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/PMB), [KEUANGAN/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/KEUANGAN), [CRM/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/CRM)

---

### Phase 3 — Academic Onboarding
**Fokus:** Handover, Student, NIM, Seleksi

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | PMB Service: selection, LoA, handover | pmb-service | Seleksi + LoA issuance + handover request |
| 2 | Academic Service: student creation + NIM generator | academic-service | Handover idempotent → student + NIM |
| 3 | Academic Service: curriculum, course | academic-service | Curriculum CRUD + course management |
| 4 | Integration Worker: PMB→Academic handover | worker | Event pmb.handover_requested → academic.student_created |
| 5 | Portal Web: Academic admin pages | portal-web | UI sesuai `Admin Akademik UNSIA _BIRO.html`, `Admin Akademik UNSIA _Prodi.html` |
| 6 | Portal Web: Student onboarding | portal-web | UI sesuai `SIAKAD ONBOARDING PENDAFTAR MAHASISWA.html` |

**UI Reference:** [AKADEMIK/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/AKADEMIK)

---

### Phase 4 — KRS + HRIS + LMS Sync
**Fokus:** KRS, kelas, dosen, LMS enrollment

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | HRIS Service: employee, lecturer, homebase | hris-service | Dosen CRUD + event publish |
| 2 | Academic Service: class/course_offering, KRS, schedule | academic-service | KRS + clearance policy + class management |
| 3 | LMS Service: online class, enrollment, session, material | lms-service | Class sync dari Academic + enrollment dari KRS |
| 4 | LMS Service: assignment, attendance, progress | lms-service | Tugas + presensi + progress tracking |
| 5 | Integration Worker: Academic→LMS class/enrollment sync | worker | Event academic.class_opened, academic.krs_approved → LMS |
| 6 | Portal Web: HRIS/SDM admin pages | portal-web | UI sesuai `HRIS.html`, `SDM Admins.html` |
| 7 | Portal Web: LMS dosen + mahasiswa | portal-web | UI sesuai `LMS DOSEN DAN MAHASISWA.html`, ICEMS files |
| 8 | Portal Web: KRS mahasiswa | portal-web | UI sesuai `SIAKAD MAHASISWA PERTAMA KALI.html`, `Usecase KRS.html` |

**UI Reference:** [SDM/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/SDM), [LMS/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/LMS), [AKADEMIK/](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/AKADEMIK)

---

### Phase 5 — Assessment + Grade Input
**Fokus:** CBT/quiz/survey, scoring, grade flow

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Assessment Service: question bank, versioning | assessment-service | Bank soal CRUD + versioning |
| 2 | Assessment Service: session, attempt, answer, scoring | assessment-service | CBT/quiz engine + result publish |
| 3 | LMS Service: quiz activity → Assessment | lms-service | Quiz integration |
| 4 | PMB Service: CBT selection → Assessment | pmb-service | CBT PMB integration |
| 5 | Academic Service: grade input dari LMS/Assessment | academic-service | Grade input receiver (bukan final grade otomatis) |
| 6 | Portal Web: Assessment UI | portal-web | UI ujian sesuai `ujiantesmasuk.html` |

**UI Reference:** [PMB/ujiantesmasuk.html](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/PMB/ujiantesmasuk.html)

---

### Phase 6 — Grade Finalization + KHS + Transcript
**Fokus:** Final grade, KHS, transkrip, alumni

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Academic Service: final grade, KHS, transcript | academic-service | Grade finalization + KHS generation + transcript |
| 2 | Academic Service: graduation, alumni | academic-service | Yudisium + alumni record |
| 3 | Finance Service: clearance enforcement | finance-service | Clearance → KHS/transkrip/wisuda policy |
| 4 | Portal Web: Mahasiswa keuangan | portal-web | UI sesuai `KEUANGAN MAHASISWA.html` |
| 5 | Portal Web: Academic ONLINE admin | portal-web | UI sesuai `Admin Akademik UNSIA ONLINE.html` |

---

### Phase 7 — Portal Dashboard + Reporting + Notification
**Fokus:** Dashboard role-based, notification, data freshness

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Portal: notification center | portal-web | Notification event → read marker |
| 2 | Portal: dashboard read model per role | portal-web | Widget + refreshed_at + source status |
| 3 | Portal: preference, shortcut, activity log | portal-web | User preference CRUD |
| 4 | Integration Worker: all module → Portal notification | worker | Event routing ke portal_db |
| 5 | Reporting: warehouse/data mart setup | infra | CDC/event → reporting aggregation |

**UI Reference:** [PMB/commandcenter.html](file:///d:/Superman/Superman/Coding/candi/candi-gembang/UI/PMB/commandcenter.html)

---

### Phase 8 — Hardening & Reconciliation
**Fokus:** Failure scenario, reconciliation, UAT

| # | Task | Repo | Output |
|---|------|------|--------|
| 1 | Reconciliation jobs: PMB↔Finance, Academic↔Finance, Academic↔LMS | worker | Mismatch report + correction job |
| 2 | Degraded mode testing per modul | all | UAT partial outage lulus |
| 3 | Idempotency stress testing | all | Duplicate event/callback tidak membuat data ganda |
| 4 | Performance & security audit | all | RBAC/scope test, query optimization |

---

## Prinsip Arsitektur yang Harus Dipatuhi

> [!CAUTION]
> Pelanggaran prinsip berikut akan merusak integritas arsitektur.

1. **No cross-database FK** — Relasi lintas modul pakai `*_ref_id`
2. **No direct cross-database join** — Pakai API/snapshot/read model
3. **No credential di luar Core** — Login, session, role hanya di `core_db`
4. **Idempotent critical flows** — Payment callback, handover, NIM, class sync, grade sync
5. **Outbox/inbox mandatory** — Setiap event ditulis ke outbox dalam transaksi lokal
6. **Snapshot ≠ source of truth** — Harus punya `synced_at`, `source_event_key`
7. **Backend enforced RBAC** — Frontend hanya hide/show, backend reject

---

## Open Questions

> [!IMPORTANT]
> Pertanyaan berikut mempengaruhi arah implementasi dan perlu jawaban sebelum eksekusi.

1. **Fase mana yang ingin dikerjakan duluan?** Apakah mulai dari Phase 0 (Foundation) atau ada modul spesifik yang prioritas?

2. **Apakah ingin dikerjakan dalam satu workspace (mono-workspace)?** Dokumen menetapkan multi-repo, tapi untuk development awal apakah ingin semua service dalam satu workspace dulu?

3. **Event broker pilihan:** RabbitMQ, Redis (BullMQ), atau in-process polling outbox? Ini mempengaruhi setup infra.

4. **Apakah UI mockup HTML di folder `UI/` harus di-replicate pixel-perfect** atau sebagai referensi layout/flow saja?

5. **Deployment target:** Local Docker saja dulu, atau langsung siapkan CI/CD (GitHub Actions / GitLab CI)?

6. **Marketing module** — Ada folder `UI/MARKETING` dengan 2 PDF. Apakah ini termasuk scope atau terpisah dari CRM?

---

## Verification Plan

### Automated Tests
- Unit test per service (Vitest/Jest)
- Contract test API (Zod schema validation)
- Integration test: event flow (outbox → inbox → snapshot update)
- Idempotency test: duplicate callback, duplicate handover, duplicate event

### Manual Verification
- UAT partial outage (matikan 1 DB, verifikasi modul lain tetap jalan)
- RBAC test: cross-scope access ditolak
- UI flow test per mockup HTML reference
- Reconciliation mismatch detection
