import { db } from './client.js';
import { applicants, biodatas } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed PMB DB ---');

    console.log('Seeding applicants...');
    const [appRecord] = await db
      .insert(applicants)
      .values({
        email: 'john.doe@gmail.com',
        phone: '+6281234567890',
        status: 'BIODATA_COMPLETED',
      })
      .onConflictDoNothing()
      .returning();

    if (appRecord) {
      console.log('Seeding biodata...');
      await db
        .insert(biodatas)
        .values({
          applicantId: appRecord.id,
          firstName: 'John',
          lastName: 'Doe',
          gender: 'M',
          placeOfBirth: 'Jakarta',
          dateOfBirth: new Date('2000-01-01'),
          religionCode: 'ISLAM',
          nationality: 'Indonesia',
          address: 'Jl. Merdeka No. 10',
        })
        .onConflictDoNothing();
    }

    console.log('--- Seed PMB DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding PMB DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
