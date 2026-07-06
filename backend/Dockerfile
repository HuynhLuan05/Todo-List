# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

# Copy Prisma schema first for code generation caching
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy built app and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create folder for SQLite data persistence
RUN mkdir -p /app/data

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/todo.db"

# Migrate DB schema and start backend
CMD npx prisma db push && npm run start
