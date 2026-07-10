const fs = require('fs');
const path = require('path');

const services = [
  { name: 'unsia-core-service', port: 3001, hasShared: true },
  { name: 'unsia-reference-service', port: 3002, hasShared: true },
  { name: 'unsia-crm-service', port: 3003, hasShared: true },
  { name: 'unsia-pmb-service', port: 3004, hasShared: true },
  { name: 'unsia-finance-service', port: 3005, hasShared: true },
  { name: 'unsia-academic-service', port: 3006, hasShared: true },
  { name: 'unsia-hris-service', port: 3007, hasShared: true },
  { name: 'unsia-lms-service', port: 3008, hasShared: true },
  { name: 'unsia-assessment-service', port: 3009, hasShared: true },
  { name: 'unsia-portal-web', port: 3000, hasShared: true }
];

console.log('=== Optimizing Next.js Docker Images (Standalone Output) ===');

services.forEach(service => {
  const servicePath = path.join(__dirname, service.name);
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠ Folder not found: ${service.name}. Skipping.`);
    return;
  }

  console.log(`\n> Optimizing ${service.name}...`);

  // 1. Create or update next.config.js to include output: 'standalone'
  const nextConfigPath = path.join(servicePath, 'next.config.js');
  const nextConfigMjsPath = path.join(servicePath, 'next.config.mjs');

  const standaloneConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

  if (fs.existsSync(nextConfigMjsPath)) {
    // If next.config.mjs exists, read and make sure output: 'standalone' is set
    let content = fs.readFileSync(nextConfigMjsPath, 'utf8');
    if (!content.includes("output: 'standalone'") && !content.includes('output: "standalone"')) {
      // Simple injection before the final export
      content = content.replace(
        /const nextConfig = {/,
        "const nextConfig = {\n  output: 'standalone',"
      );
      fs.writeFileSync(nextConfigMjsPath, content, 'utf8');
      console.log(`  - Updated next.config.mjs with standalone output`);
    } else {
      console.log(`  - next.config.mjs already configured for standalone`);
    }
  } else if (fs.existsSync(nextConfigPath)) {
    let content = fs.readFileSync(nextConfigPath, 'utf8');
    if (!content.includes("output: 'standalone'") && !content.includes('output: "standalone"')) {
      content = content.replace(
        /const nextConfig = {/,
        "const nextConfig = {\n  output: 'standalone',"
      );
      fs.writeFileSync(nextConfigPath, content, 'utf8');
      console.log(`  - Updated next.config.js with standalone output`);
    } else {
      console.log(`  - next.config.js already configured for standalone`);
    }
  } else {
    // Create new next.config.js
    fs.writeFileSync(nextConfigPath, standaloneConfigContent, 'utf8');
    console.log(`  - Created new next.config.js with standalone output`);
  }

  // 2. Check if 'public' folder exists
  const hasPublic = fs.existsSync(path.join(servicePath, 'public'));

  // 3. Write optimized Dockerfile
  const dockerfilePath = path.join(servicePath, 'Dockerfile');
  
  let publicCopyLine = '';
  if (hasPublic) {
    publicCopyLine = '\nCOPY --from=builder /app/service/public /app/public';
  }

  const optimizedDockerfile = `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build shared contracts
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build

# Build next app
COPY . /app/service
WORKDIR /app/service
RUN npm install && npm run build

# Runner stage (highly optimized size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT ${service.port}
ENV HOSTNAME "0.0.0.0"

# Copy minimal standalone files for Next.js
COPY --from=builder /app/service/.next/standalone ./
COPY --from=builder /app/service/.next/static /app/.next/static${publicCopyLine}

EXPOSE ${service.port}
CMD ["node", "server.js"]
`;

  fs.writeFileSync(dockerfilePath, optimizedDockerfile, 'utf8');
  console.log(`  - Created optimized standalone Dockerfile`);
});

console.log('\n=== Next.js Standalone Image Optimization Completed! ===');
