# Build command (run from workspace root):
# docker build -t unsia-hris-service -f unsia-hris-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-hris-service /app/unsia-hris-service
RUN cd /app/unsia-hris-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-hris-service /app/unsia-hris-service
WORKDIR /app/unsia-hris-service
ENV NODE_ENV production
EXPOSE 3007
CMD ["npm", "run", "start"]
