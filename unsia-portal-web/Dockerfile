# Build command (run from workspace root):
# docker build -t unsia-portal-web -f unsia-portal-web/Dockerfile .

FROM node:20-alpine AS builder
WORKDIR /app
COPY unsia-shared-contracts /app/unsia-shared-contracts
RUN cd /app/unsia-shared-contracts && npm install && npm run build
COPY unsia-portal-web /app/unsia-portal-web
RUN cd /app/unsia-portal-web && npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/unsia-shared-contracts /app/unsia-shared-contracts
COPY --from=builder /app/unsia-portal-web /app/unsia-portal-web
WORKDIR /app/unsia-portal-web
ENV NODE_ENV production
EXPOSE 3000
CMD ["npm", "run", "start"]
