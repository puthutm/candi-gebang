import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const FINANCE_DB_URL = process.env.FINANCE_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/finance_db';
const LMS_DB_URL = process.env.LMS_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/lms_db';
const ACADEMIC_DB_URL = process.env.ACADEMIC_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/academic_db';

export async function runReconciliation() {
  console.log('--- [Reconciliation] Running Periodic Integrity Audits ---');

  // 1. Audit Finance: Invoices vs Payments balance check
  try {
    const financePool = new pg.Pool({ connectionString: FINANCE_DB_URL });
    const client = await financePool.connect();

    try {
      const res = await client.query(`
        SELECT i.invoice_no, i.amount as invoice_amount, COALESCE(SUM(p.amount_paid), 0) as total_paid
        FROM invoices i
        LEFT JOIN payments p ON i.id = p.invoice_id
        WHERE i.status = 'PAID'
        GROUP BY i.invoice_no, i.amount
        HAVING i.amount != COALESCE(SUM(p.amount_paid), 0)
      `);

      if (res.rows.length > 0) {
        console.warn(`⚠ [Reconciliation] [Finance] Mismatch detected in ${res.rows.length} invoices!`);
        for (const row of res.rows) {
          console.warn(`  • Invoice: ${row.invoice_no} | Expected Amount: ${row.invoice_amount} | Total Paid: ${row.total_paid}`);
        }
      } else {
        console.log('✔ [Reconciliation] [Finance] Invoices and Payments balance checks passed.');
      }
    } catch (err: any) {
      console.error('[Reconciliation] Finance audit error:', err.message);
    } finally {
      client.release();
      await financePool.end();
    }
  } catch (err) {
    // skip
  }

  // 2. Audit Academic KRS vs LMS Enrollments
  try {
    const academicPool = new pg.Pool({ connectionString: ACADEMIC_DB_URL });
    const lmsPool = new pg.Pool({ connectionString: LMS_DB_URL });

    const acadClient = await academicPool.connect();
    const lmsClient = await lmsPool.connect();

    try {
      // Fetch active course offerings and student krs enrollments in Academic
      const krsRes = await acadClient.query(`
        SELECT ki.class_offering_id, ka.student_id 
        FROM krs_items ki
        JOIN krs_applications ka ON ki.krs_application_id = ka.id
        WHERE ka.status = 'APPROVED'
      `);

      // Fetch active enrollments in LMS
      const lmsRes = await lmsClient.query(`
        SELECT lc.class_offering_ref_id, le.student_ref_id
        FROM lms_enrollments le
        JOIN lms_classes lc ON le.lms_class_id = lc.id
        WHERE le.status = 'ACTIVE'
      `);

      const academicSet = new Set(krsRes.rows.map(r => `${r.student_id}_${r.class_offering_id}`));
      const lmsSet = new Set(lmsRes.rows.map(r => `${r.student_ref_id}_${r.class_offering_ref_id}`));

      const mismatches: string[] = [];
      for (const acadItem of academicSet) {
        if (!lmsSet.has(acadItem)) {
          mismatches.push(`Student enrolled in Academic KRS but missing in LMS class: ${acadItem}`);
        }
      }

      if (mismatches.length > 0) {
        console.warn(`⚠ [Reconciliation] [Academic/LMS] ${mismatches.length} enrollment mismatches found!`);
        mismatches.forEach(m => console.warn(`  • ${m}`));
      } else {
        console.log('✔ [Reconciliation] [Academic/LMS] Enrollment consistency checks passed.');
      }
    } catch (err: any) {
      console.error('[Reconciliation] Academic/LMS audit error:', err.message);
    } finally {
      acadClient.release();
      lmsClient.release();
      await academicPool.end();
      await lmsPool.end();
    }
  } catch (err) {
    // skip
  }
}
