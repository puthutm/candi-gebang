# Build command (run from workspace root):
# docker build -t unsia-academic-service -f unsia-academic-service/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-academic-service /app/unsia-academic-service
RUN cd /app/unsia-academic-service && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-academic-service /app/unsia-academic-service
WORKDIR /app/unsia-academic-service
ENV NODE_ENV production
EXPOSE 3006
CMD ["npm", "run", "start"]
