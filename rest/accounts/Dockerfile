# Build stage
FROM node:18-slim AS builder
WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
