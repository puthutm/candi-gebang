# RUNBOOK: UNSIA ERP Ecosystem Orchestration Guide

Panduan ini menjelaskan cara melakukan inisialisasi, migrasi database, seeding, dan eksekusi untuk ke-13 layanan modular pada ekosistem ERP Pendidikan/SIAKAD Universitas Siber Asia (UNSIA).

---

## 1. Topologi Layanan & Port

| Port | Layanan | Jenis | Deskripsi |
|------|---------|-------|-----------|
| **3000** | `unsia-portal-web` | Next.js Frontend | Portal SSO & dashboards multi-role |
| **3001** | `unsia-core-service` | Next.js API | Core IAM, auth tokens, RBAC, dan audit log |
| **3002** | `unsia-reference-service` | Next.js API | Master data prodi, periode akademik, status |
| **3003** | `unsia-crm-service` | Next.js API | CRM Leads, campaigns, conversion |
| **3004** | `unsia-pmb-service` | Next.js API | PMB registrasi, document checks, and handover |
| **3005** | `unsia-finance-service` | Next.js API | Invoices, payments callback, KRS & graduation clearances |
| **3006** | `unsia-academic-service` | Next.js API | SIAKAD students, KRS approval, KHS, transcripts, graduation |
| **3007** | `unsia-hris-service` | Next.js API | HRIS Kepegawaian & lecturer status validation |
| **3008** | `unsia-lms-service` | Next.js API | LMS online classes & student enrollment sync |
| **3009** | `unsia-assessment-service` | Next.js API | Assessment CBT quiz attempts & scoring engine |
| **-** | `unsia-integration-worker` | Node.js Daemon | Outbox Publisher, Inbox Consumer, & Reconciliation |

---

## 2. Langkah Penyusunan Infrastruktur (Docker)

1. Pastikan Docker Desktop aktif di komputer Anda.
2. Pindah ke direktori `unsia-infra/docker-compose`:
   ```bash
   cd unsia-infra/docker-compose
   ```
3. Jalankan command Docker Compose untuk menyalakan 10 database modular terpisah PostgreSQL, Redis, dan RabbitMQ:
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   ```
4. Skrip [init.sql](file:///d:/Superman/Superman/Coding/candi/candi-gembang/unsia-infra/docker-compose/init.sql) secara otomatis akan menginisialisasi database berikut:
   - `core_db`, `reference_db`, `crm_db`, `pmb_db`, `finance_db`, `academic_db`, `hris_db`, `lms_db`, `assessment_db`, `portal_db`.

---

## 3. Langkah Migrasi & Seeding Database

Jalankan perintah migrasi skema database Drizzle dan data seeding untuk setiap modul API Next.js dengan perintah berikut di masing-masing direktori modul:

```bash
# Contoh untuk Core Service:
cd unsia-core-service
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

Lakukan hal serupa untuk modul:
- `unsia-reference-service`
- `unsia-crm-service`
- `unsia-pmb-service`
- `unsia-finance-service`
- `unsia-academic-service`
- `unsia-hris-service`
- `unsia-lms-service`
- `unsia-assessment-service`

---

## 4. Eksekusi Layanan & Worker Daemon

### Menjalankan Next.js Services & Web Portal
Di masing-masing direktori modul, jalankan mode development:
```bash
npm run dev
```

### Menjalankan Integration Worker (Outbox/Inbox/Reconciliation)
1. Pindah ke direktori `unsia-integration-worker`:
   ```bash
   cd unsia-integration-worker
   npm install
   ```
2. Jalankan daemon polling outbox publisher dan data mart reconciliation:
   ```bash
   npm run dev
   ```
   Worker akan secara berkala:
   - Mem-polling tabel `outbox_events` per DB modul dan mempublikasikannya ke exchange RabbitMQ.
   - Melakukan audit rekonsiliasi data kelayakan transaksi keuangan (`finance_db`) dan LMS enrollment (`academic_db` vs `lms_db`) setiap 60 detik.
