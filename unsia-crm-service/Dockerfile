# Build command (run from workspace root):
# docker build -t unsia-crm-service -f unsia-crm-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-crm-service /app/unsia-crm-service
RUN cd /app/unsia-crm-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-crm-service /app/unsia-crm-service
WORKDIR /app/unsia-crm-service
ENV NODE_ENV production
EXPOSE 3003
CMD ["npm", "run", "start"]
