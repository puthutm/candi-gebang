# Build command (run from workspace root):
# docker build -t unsia-finance-service -f unsia-finance-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-finance-service /app/unsia-finance-service
RUN cd /app/unsia-finance-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-finance-service /app/unsia-finance-service
WORKDIR /app/unsia-finance-service
ENV NODE_ENV production
EXPOSE 3005
CMD ["npm", "run", "start"]
