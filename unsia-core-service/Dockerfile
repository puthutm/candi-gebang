# Build command (run from workspace root):
# docker build -t unsia-core-service -f unsia-core-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-core-service /app/unsia-core-service
RUN cd /app/unsia-core-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-core-service /app/unsia-core-service
WORKDIR /app/unsia-core-service
ENV NODE_ENV production
EXPOSE 3001
CMD ["npm", "run", "start"]
