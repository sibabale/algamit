# Build stage
FROM node:18-slim AS builder
WORKDIR /app
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

# Use direct node command instead of entrypoint script
CMD ["node", "dist/index.js"]