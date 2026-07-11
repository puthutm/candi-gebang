# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build shared contracts
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build

# Build next app
COPY unsia-core-service /app/service
WORKDIR /app/service
RUN npm install && npm run db:generate && npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Copy standalone Next.js output
COPY --from=builder /app/service/.next/standalone ./
COPY --from=builder /app/service/.next/static /app/.next/static

# Copy full node_modules (includes tsx, drizzle-orm, pg, bcrypt, etc.)
COPY --from=builder /app/service/node_modules ./node_modules

# Copy migrations and migration script
COPY --from=builder /app/service/drizzle /app/drizzle
COPY --from=builder /app/service/migrate.js /app/migrate.js

# Copy seed TypeScript source (tsx will run it directly)
COPY --from=builder /app/service/src/db /app/src/db

EXPOSE 3001
CMD ["sh", "-c", "node migrate.js && npx tsx src/db/seed.ts && node server.js"]
