import { db } from './client.js';
import { lmsClasses } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed LMS DB ---');

    console.log('Seeding lms classes...');
    await db
      .insert(lmsClasses)
      .values({
        classOfferingRefId: crypto.randomUUID(), // Stub reference
        className: 'A',
        courseRefId: crypto.randomUUID(),
        academicPeriodRefId: crypto.randomUUID(),
        lecturerRefId: crypto.randomUUID(),
      })
      .onConflictDoNothing();

    console.log('--- Seed LMS DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding LMS DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
