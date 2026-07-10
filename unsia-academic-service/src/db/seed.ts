import { db } from './client.js';
import { curriculums, courses } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed Academic DB ---');

    console.log('Seeding curriculums...');
    const [currRecord] = await db
      .insert(curriculums)
      .values({
        code: 'CURR-IF-2024',
        name: 'Kurikulum Informatika 2024',
        studyProgramRefId: crypto.randomUUID(), // Stub reference
        curriculumYearRefId: crypto.randomUUID(), // Stub reference
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    if (currRecord) {
      console.log('Seeding courses...');
      const courseList = [
        {
          curriculumId: currRecord.id,
          code: 'IF101',
          name: 'Pengantar Teknologi Informasi',
          credits: 3,
          semesterOrder: 1,
        },
        {
          curriculumId: currRecord.id,
          code: 'IF102',
          name: 'Dasar Pemrograman',
          credits: 4,
          semesterOrder: 1,
        },
      ];

      for (const crs of courseList) {
        await db
          .insert(courses)
          .values({
            curriculumId: crs.curriculumId,
            code: crs.code,
            name: crs.name,
            credits: crs.credits,
            semesterOrder: crs.semesterOrder,
            isActive: true,
          })
          .onConflictDoNothing();
      }
    }

    console.log('--- Seed Academic DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Academic DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
