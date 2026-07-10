import { db } from './client.js';
import { questionBanks, questions, questionVersions, assessmentSessions } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed Assessment DB ---');

    console.log('Seeding question bank...');
    const [bank] = await db
      .insert(questionBanks)
      .values({
        code: 'BANK-PMB-MATHEMATICS',
        name: 'Bank Soal Matematika PMB',
        description: 'Soal Tes Potensi Akademik Matematika PMB',
      })
      .onConflictDoNothing()
      .returning();

    if (bank) {
      console.log('Seeding questions...');
      const [q1] = await db.insert(questions).values({ questionBankId: bank.id, type: 'MULTIPLE_CHOICE' }).returning();
      const [q2] = await db.insert(questions).values({ questionBankId: bank.id, type: 'MULTIPLE_CHOICE' }).returning();

      console.log('Seeding question versions...');
      await db.insert(questionVersions).values({
        questionId: q1.id,
        version: 1,
        content: 'Berapakah hasil dari 2 + 2?',
        optionsJson: [
          { key: 'A', val: '3' },
          { key: 'B', val: '4' },
          { key: 'C', val: '5' },
          { key: 'D', val: '6' },
        ],
        correctKey: 'B',
        isActive: true,
      });

      await db.insert(questionVersions).values({
        questionId: q2.id,
        version: 1,
        content: 'Berapakah hasil dari 5 * 6?',
        optionsJson: [
          { key: 'A', val: '25' },
          { key: 'B', val: '30' },
          { key: 'C', val: '35' },
          { key: 'D', val: '40' },
        ],
        correctKey: 'B',
        isActive: true,
      });

      console.log('Seeding assessment session...');
      await db.insert(assessmentSessions).values({
        questionBankId: bank.id,
        code: 'PMB-2026-MATH-CBT',
        contextOwner: 'PMB',
        contextRefId: crypto.randomUUID(), // Wave stub ref
        durationMinutes: 60,
        isActive: true,
      });
    }

    console.log('--- Seed Assessment DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding Assessment DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
