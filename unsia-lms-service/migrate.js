const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const pg = require('pg');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

async function runMigrations() {
  console.log('Running database migrations...');
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, 'drizzle/migrations'),
    });
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
