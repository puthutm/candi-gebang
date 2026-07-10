const { execSync } = require('child_process');
const path = require('path');

const services = [
  'unsia-core-service',
  'unsia-reference-service',
  'unsia-crm-service',
  'unsia-pmb-service',
  'unsia-finance-service',
  'unsia-academic-service',
  'unsia-hris-service',
  'unsia-lms-service',
  'unsia-assessment-service'
];

console.log('=== Running All Database Seeders ===');

for (const service of services) {
  const dir = path.join(__dirname, service);
  console.log(`\n> Running seed in: ${service}...`);
  try {
    execSync('npm run db:seed', { cwd: dir, stdio: 'inherit' });
    console.log(`✓ Successfully seeded ${service}`);
  } catch (err) {
    console.error(`✗ Error seeding ${service}:`, err.message);
  }
}

console.log('\n=== Seeding Process Finished ===');
