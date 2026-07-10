# Build command (run from workspace root):
# docker build -t unsia-lms-service -f unsia-lms-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-lms-service /app/unsia-lms-service
RUN cd /app/unsia-lms-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-lms-service /app/unsia-lms-service
WORKDIR /app/unsia-lms-service
ENV NODE_ENV production
EXPOSE 3008
CMD ["npm", "run", "start"]
