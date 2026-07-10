# Build command (run from workspace root):
# docker build -t unsia-reference-service -f unsia-reference-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-reference-service /app/unsia-reference-service
RUN cd /app/unsia-reference-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-reference-service /app/unsia-reference-service
WORKDIR /app/unsia-reference-service
ENV NODE_ENV production
EXPOSE 3002
CMD ["npm", "run", "start"]
