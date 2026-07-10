import amqp from 'amqplib';
import pg from 'pg';
import dotenv from 'dotenv';
import { runReconciliation } from './reconciliation.js';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'unsia.events';

// List of modules and their DB connection strings
const DATABASE_CONFIGS = [
  { name: 'core', url: process.env.CORE_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/core_db' },
  { name: 'reference', url: process.env.REFERENCE_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/reference_db' },
  { name: 'crm', url: process.env.CRM_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/crm_db' },
  { name: 'pmb', url: process.env.PMB_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/pmb_db' },
  { name: 'finance', url: process.env.FINANCE_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/finance_db' },
  { name: 'academic', url: process.env.ACADEMIC_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/academic_db' },
  { name: 'hris', url: process.env.HRIS_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/hris_db' },
  { name: 'lms', url: process.env.LMS_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/lms_db' },
  { name: 'assessment', url: process.env.ASSESSMENT_DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/assessment_db' },
];

async function start() {
  console.log('--- Starting UNSIA Integration Worker Daemon ---');

  // 1. Establish RabbitMQ connection
  let mqConn: any;
  let mqChannel: any;
  try {
    mqConn = await amqp.connect(RABBITMQ_URL);
    mqChannel = await mqConn.createChannel();
    await mqChannel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    console.log('✔ Connected to RabbitMQ Broker and Exchange declared:', EXCHANGE_NAME);
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ broker:', error);
    process.exit(1);
  }

  // 2. Initialize PostgreSQL pools gracefully
  const pools: { [key: string]: pg.Pool } = {};
  for (const dbConf of DATABASE_CONFIGS) {
    try {
      const pool = new pg.Pool({ connectionString: dbConf.url, max: 2 });
      pools[dbConf.name] = pool;
      console.log(`✔ PG Pool initialized for database: ${dbConf.name}_db`);
    } catch (e: any) {
      console.warn(`⚠ Could not initialize pool for ${dbConf.name}:`, e.message);
    }
  }

  // 3. Outbox Publisher Poller Loop
  // Polling table 'outbox_events' for new events, publishing to RabbitMQ, marking as processed
  setInterval(async () => {
    for (const [dbName, pool] of Object.entries(pools)) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(
            `SELECT id, event_name, event_key, payload, correlation_id, causation_id 
             FROM outbox_events 
             WHERE processed_at IS NULL 
             LIMIT 10`
          );

          for (const row of res.rows) {
            const routingKey = row.event_name.toLowerCase();
            const messageBuffer = Buffer.from(JSON.stringify({
              eventName: row.event_name,
              eventKey: row.event_key,
              correlationId: row.correlation_id,
              causationId: row.causation_id,
              payload: row.payload,
            }));

            // Publish to RabbitMQ
            mqChannel.publish(EXCHANGE_NAME, routingKey, messageBuffer, { persistent: true });
            console.log(`[Outbox] [${dbName}] Event published: ${row.event_name} with key: ${row.event_key}`);

            // Mark as processed in local Outbox table
            await client.query(
              `UPDATE outbox_events 
               SET processed_at = NOW() 
               WHERE id = $1`,
              [row.id]
            );
          }
        } catch (dbErr: any) {
          // If table doesn't exist yet (e.g. migration not run), catch and continue silently
          if (dbErr.message.includes('relation "outbox_events" does not exist')) {
            // silent skip
          } else {
            console.error(`Error polling outbox for ${dbName}:`, dbErr.message);
          }
        } finally {
          client.release();
        }
      } catch (poolErr) {
        // connection issue, ignore
      }
    }
  }, 3000);

  // 4. Setup general consumers for synchronization demo
  // Setting up direct RabbitMQ Consumers that simulate idempotent Inbox handling
  const consumerQueue = 'unsia_inbox_processor';
  await mqChannel.assertQueue(consumerQueue, { durable: true });
  await mqChannel.bindQueue(consumerQueue, EXCHANGE_NAME, '#'); // Bind to all events

  mqChannel.consume(consumerQueue, async (msg: any) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log(`[Inbox] Received Event: ${event.eventName} [Key: ${event.eventKey}]`);

      // Idempotency check simulation on target DB
      // In production, we write to inbox_events of target DB e.g. academic or finance.
      // Here we simulate successful routing.
      
      mqChannel.ack(msg);
    } catch (err: any) {
      console.error('Error processing consumed message:', err.message);
      // Nack and requeue
      mqChannel.nack(msg, false, true);
    }
  });

  console.log('✔ Integration Worker active and polling databases. Waiting for events...');

  // Start periodic reconciliation audit checks (every 60 seconds)
  setInterval(() => {
    runReconciliation().catch((err) => console.error('Reconciliation cycle error:', err));
  }, 60000);
}

start().catch((err) => {
  console.error('Integration Worker startup crash:', err);
  process.exit(1);
});
