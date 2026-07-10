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
  { name: 'unsia-portal-web', port: 3000, hasShared: true },
  { name: 'unsia-integration-worker', port: null, hasShared: false }
];

const sharedContractsSrc = path.join(__dirname, 'unsia-shared-contracts');

// Helper to copy directory recursively (excluding node_modules and dist)
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    if (element === 'node_modules' || element === 'dist' || element === '.turbo') {
      return;
    }
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

console.log('=== Starting Standalone Migration ===');

services.forEach(service => {
  const servicePath = path.join(__dirname, service.name);
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠ Service folder not found: ${service.name}. Skipping.`);
    return;
  }

  console.log(`\n> Migrating ${service.name}...`);

  // 1. Copy unsia-shared-contracts into the service directory
  if (service.hasShared) {
    const targetSharedPath = path.join(servicePath, 'unsia-shared-contracts');
    if (fs.existsSync(targetSharedPath)) {
      fs.rmSync(targetSharedPath, { recursive: true, force: true });
    }
    console.log(`  - Copying unsia-shared-contracts into ${service.name}`);
    copyFolderSync(sharedContractsSrc, targetSharedPath);

    // 2. Update package.json dependency to point locally
    const pkgJsonPath = path.join(servicePath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkg.dependencies && pkg.dependencies['@unsia/shared-contracts']) {
        pkg.dependencies['@unsia/shared-contracts'] = 'file:./unsia-shared-contracts';
        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log(`  - Updated package.json dependencies`);
      }
    }

    // 3. Create standalone Dockerfile for services with shared-contracts
    const dockerfilePath = path.join(servicePath, 'Dockerfile');
    const dockerfileContent = `# Build command (run from service folder):
# docker build -t ${service.name} .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY . /app/service
RUN cd /app/service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/service /app/service
WORKDIR /app/service
ENV NODE_ENV production
EXPOSE ${service.port}
CMD ["npm", "run", "start"]
`;
    fs.writeFileSync(dockerfilePath, dockerfileContent, 'utf8');
    console.log(`  - Updated Dockerfile to standalone version`);

  } else {
    // Standalone Dockerfile for worker (no shared contracts dependency)
    const dockerfilePath = path.join(servicePath, 'Dockerfile');
    const dockerfileContent = `# Build command (run from service folder):
# docker build -t ${service.name} .

FROM node:20-alpine AS builder
WORKDIR /app/service
COPY . .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app/service
COPY --from=builder /app/service /app/service
RUN npm prune --production
CMD ["npm", "run", "start"]
`;
    fs.writeFileSync(dockerfilePath, dockerfileContent, 'utf8');
    console.log(`  - Updated Dockerfile to standalone version (no shared contracts)`);
  }
});

// 4. Update docker-compose.yml to use the standalone directories as build context
const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
if (fs.existsSync(dockerComposePath)) {
  let dc = fs.readFileSync(dockerComposePath, 'utf8');

  // Replace build contexts
  services.forEach(service => {
    const originalBuildBlockPattern = new RegExp(
      `build:\\s*\\n\\s*context:\\s*\\.\\s*\\n\\s*dockerfile:\\s*\\./${service.name}/Dockerfile`,
      'g'
    );
    const replacement = `build:\n      context: ./${service.name}`;
    dc = dc.replace(originalBuildBlockPattern, replacement);
  });

  fs.writeFileSync(dockerComposePath, dc, 'utf8');
  console.log(`\n✔ Updated docker-compose.yml build contexts`);
}

console.log('\n=== Standalone Migration Completed Successfully! ===');
