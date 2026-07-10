# Build command (run from workspace root):
# docker build -t unsia-pmb-service -f unsia-pmb-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-pmb-service /app/unsia-pmb-service
RUN cd /app/unsia-pmb-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-pmb-service /app/unsia-pmb-service
WORKDIR /app/unsia-pmb-service
ENV NODE_ENV production
EXPOSE 3004
CMD ["npm", "run", "start"]
