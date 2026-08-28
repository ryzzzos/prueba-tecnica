# ==========================================
# Stage 1: Build & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copy dependency definitions and Prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies needed to build)
RUN pnpm install

# Copy source code and TypeScript configuration
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client and compile TypeScript to JavaScript
RUN pnpm prisma:generate && pnpm tsc

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL for Prisma engine compatibility and curl/wget for healthcheck
RUN apk add --no-cache openssl wget

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

ENV NODE_ENV=production

# Copy package definitions and prisma schema for runtime migrations
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install production dependencies
RUN pnpm install --prod

# Copy compiled JavaScript files from builder stage
COPY --from=builder /app/dist ./dist

# Re-generate Prisma client in production node_modules
RUN pnpm prisma:generate

# Expose HTTP port
EXPOSE 8000

# Entrypoint: Apply pending migrations, seed default categories, and start Express server
CMD ["sh", "-c", "pnpm prisma:deploy && pnpm prisma:seed && node dist/server.js"]
