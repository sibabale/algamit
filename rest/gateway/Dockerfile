# Build stage
FROM --platform=linux/amd64 node:18-slim AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production stage
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --production
COPY --from=builder /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]