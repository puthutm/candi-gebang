# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build shared contracts
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build

# Build next app
COPY unsia-crm-service /app/service
WORKDIR /app/service
RUN npm install && npm run build

# Runner stage (highly optimized size)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3003
ENV HOSTNAME "0.0.0.0"

# Copy minimal standalone files for Next.js
COPY --from=builder /app/service/.next/standalone ./
COPY --from=builder /app/service/.next/static /app/.next/static

EXPOSE 3003
CMD ["node", "server.js"]
