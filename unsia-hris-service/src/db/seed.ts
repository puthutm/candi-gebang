import { db } from './client.js';
import { employees, lecturers } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed HRIS DB ---');

    console.log('Seeding employees...');
    const [empRecord] = await db
      .insert(employees)
      .values({
        personRefId: crypto.randomUUID(), // Stub reference
        employeeNip: 'NIP0001',
        status: 'ACTIVE',
      })
      .onConflictDoNothing()
      .returning();

    if (empRecord) {
      console.log('Seeding lecturers...');
      await db
        .insert(lecturers)
        .values({
          employeeId: empRecord.id,
          nidn: 'NIDN0001',
          isHomebase: true,
        })
        .onConflictDoNothing();
    }

    console.log('--- Seed HRIS DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding HRIS DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
