# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build shared contracts
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build

# Build next app
COPY unsia-hris-service /app/service
WORKDIR /app/service
RUN npm install && npm run db:generate && npx tsc src/db/seed.ts --outDir ./dist-seed --module commonjs --target es2022 --allowSyntheticDefaultImports true --skipLibCheck true && npm run build && npm prune --production

# Runner stage (highly optimized size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3007
ENV HOSTNAME "0.0.0.0"

# Copy minimal standalone files for Next.js
COPY --from=builder /app/service/.next/standalone ./
COPY --from=builder /app/service/.next/static /app/.next/static

# Copy production node_modules to guarantee all dependencies are present
COPY --from=builder /app/service/node_modules ./node_modules

# Copy migrations and migration script
COPY --from=builder /app/service/drizzle /app/drizzle
COPY --from=builder /app/service/migrate.js /app/migrate.js

# Copy compiled seed script
COPY --from=builder /app/service/dist-seed /app/dist-seed

EXPOSE 3007
CMD ["sh", "-c", "node migrate.js && node dist-seed/src/db/seed.js && node server.js"]
