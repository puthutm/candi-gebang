import { db } from './client.js';
import { studyPrograms, academicYears, academicPeriods } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed Reference DB ---');

    // 1. Seed Study Programs
    const prodis = [
      { code: 'IF', name: 'Informatika', level: 'S1' },
      { code: 'SI', name: 'Sistem Informasi', level: 'S1' },
      { code: 'IK', name: 'Ilmu Komunikasi', level: 'S1' },
      { code: 'MN', name: 'Manajemen', level: 'S1' },
      { code: 'AK', name: 'Akuntansi', level: 'S1' },
    ];

    console.log('Seeding study programs...');
    for (const prodi of prodis) {
      await db
        .insert(studyPrograms)
        .values({
          code: prodi.code,
          name: prodi.name,
          level: prodi.level,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: studyPrograms.code,
          set: { name: prodi.name, level: prodi.level },
        });
    }

    // 2. Seed Academic Years
    const years = [
      { code: '2025/2026', name: 'Tahun Ajaran 2025/2026' },
      { code: '2026/2027', name: 'Tahun Ajaran 2026/2027' },
    ];

    console.log('Seeding academic years...');
    const insertedYearsMap: Record<string, string> = {};
    for (const yr of years) {
      const [insertedYr] = await db
        .insert(academicYears)
        .values({
          code: yr.code,
          name: yr.name,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: academicYears.code,
          set: { name: yr.name },
        })
        .returning();
      insertedYearsMap[yr.code] = insertedYr.id;
    }

    // 3. Seed Academic Periods
    console.log('Seeding academic periods...');
    const yearId = insertedYearsMap['2025/2026'];
    if (yearId) {
      const periods = [
        {
          academicYearId: yearId,
          code: '20251',
          name: 'Semester Ganjil 2025/2026',
          termCode: 'ODD',
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-02-28'),
        },
        {
          academicYearId: yearId,
          code: '20252',
          name: 'Semester Genap 2025/2026',
          termCode: 'EVEN',
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-08-31'),
        },
      ];

      for (const prd of periods) {
        await db
          .insert(academicPeriods)
          .values({
            academicYearId: prd.academicYearId,
            code: prd.code,
            name: prd.name,
            termCode: prd.termCode,
            startDate: prd.startDate,
            endDate: prd.endDate,
            isActive: true,
          })
          .onConflictDoUpdate({
            target: academicPeriods.code,
            set: {
              name: prd.name,
              termCode: prd.termCode,
              startDate: prd.startDate,
              endDate: prd.endDate,
            },
          });
      }
    }

    console.log('--- Seed Reference DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Reference DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
