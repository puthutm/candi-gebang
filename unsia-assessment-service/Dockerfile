# Build command (run from workspace root):
# docker build -t unsia-assessment-service -f unsia-assessment-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-assessment-service /app/unsia-assessment-service
RUN cd /app/unsia-assessment-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-assessment-service /app/unsia-assessment-service
WORKDIR /app/unsia-assessment-service
ENV NODE_ENV production
EXPOSE 3009
CMD ["npm", "run", "start"]
