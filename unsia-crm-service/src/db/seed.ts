import { db } from './client.js';
import { campaigns, agents, leads } from './schema.js';

async function main() {
  try {
    console.log('--- Starting Seed CRM DB ---');

    // 1. Seed Campaigns
    console.log('Seeding campaigns...');
    const campaignList = [
      {
        name: 'PMB 2026 Gelombang 1',
        code: 'PMB2026G1',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2026-03-31'),
        budget: '15000000.00',
      },
      {
        name: 'Expo Pendidikan Jakarta',
        code: 'EXPOJKT2026',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-15'),
        budget: '5000000.00',
      },
    ];

    const insertedCampaigns = [];
    for (const cmp of campaignList) {
      const [inserted] = await db
        .insert(campaigns)
        .values({
          name: cmp.name,
          code: cmp.code,
          startDate: cmp.startDate,
          endDate: cmp.endDate,
          budget: cmp.budget,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: campaigns.code,
          set: { name: cmp.name, budget: cmp.budget },
        })
        .returning();
      insertedCampaigns.push(inserted);
    }

    // 2. Seed Agents (assuming some personRefId from Core)
    console.log('Seeding agents...');
    const agentList = [
      {
        personRefId: crypto.randomUUID(), // Stub person ID
        agentCode: 'AGT001',
        status: 'ACTIVE',
        commissionRate: '5.00',
      },
      {
        personRefId: crypto.randomUUID(), // Stub person ID
        agentCode: 'AGT002',
        status: 'ACTIVE',
        commissionRate: '7.50',
      },
    ];

    const insertedAgents = [];
    for (const ag of agentList) {
      const [inserted] = await db
        .insert(agents)
        .values({
          personRefId: ag.personRefId,
          agentCode: ag.agentCode,
          status: ag.status,
          commissionRate: ag.commissionRate,
        })
        .onConflictDoUpdate({
          target: agents.agentCode,
          set: { status: ag.status, commissionRate: ag.commissionRate },
        })
        .returning();
      insertedAgents.push(inserted);
    }

    // 3. Seed Leads
    console.log('Seeding leads...');
    const leadList = [
      {
        campaignId: insertedCampaigns[0].id,
        agentId: insertedAgents[0].id,
        firstName: 'Budi',
        lastName: 'Santoso',
        email: 'budi.santoso@gmail.com',
        phone: '+6281234567890',
        source: 'MITRA',
        status: 'NEW',
      },
      {
        campaignId: insertedCampaigns[1].id,
        agentId: insertedAgents[1].id,
        firstName: 'Siti',
        lastName: 'Aminah',
        email: 'siti.aminah@gmail.com',
        phone: '+628998877665',
        source: 'EXPO',
        status: 'CONTACTED',
      },
    ];

    for (const ld of leadList) {
      await db.insert(leads).values({
        campaignId: ld.campaignId,
        agentId: ld.agentId,
        firstName: ld.firstName,
        lastName: ld.lastName,
        email: ld.email,
        phone: ld.phone,
        source: ld.source,
        status: ld.status,
      });
    }

    console.log('--- Seed CRM DB Completed Successfully! ---');
  } catch (error) {
    console.error('Error seeding CRM DB:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
