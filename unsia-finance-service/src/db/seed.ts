import { db } from './client.js';
import { invoices, invoiceItems } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed Finance DB ---');

    console.log('Seeding invoices...');
    const [invRecord] = await db
      .insert(invoices)
      .values({
        invoiceNo: 'INV/2026/0001',
        billToType: 'APPLICANT',
        billToRefId: crypto.randomUUID(), // Stub reference
        amount: '250000.00',
        status: 'UNPAID',
        description: 'Biaya Pendaftaran PMB - Jane Doe',
        dueDate: new Date('2026-12-31'),
      })
      .onConflictDoNothing()
      .returning();

    if (invRecord) {
      console.log('Seeding invoice items...');
      await db
        .insert(invoiceItems)
        .values({
          invoiceId: invRecord.id,
          itemCode: 'PMB_REG',
          itemName: 'Biaya Pendaftaran PMB',
          amount: '250000.00',
        })
        .onConflictDoNothing();
    }

    console.log('--- Seed Finance DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Finance DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
