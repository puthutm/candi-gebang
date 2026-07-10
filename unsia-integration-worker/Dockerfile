# Build command (run from workspace root):
# docker build -t unsia-integration-worker -f unsia-integration-worker/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-integration-worker /app/unsia-integration-worker
RUN cd /app/unsia-integration-worker && npm install && npm run build

FROM node:20-alpine
WORKDIR /app/unsia-integration-worker
COPY --from=builder /app/unsia-integration-worker /app/unsia-integration-worker
RUN npm prune --production
CMD ["npm", "run", "start"]
