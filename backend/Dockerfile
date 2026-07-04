# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@9.15.0 --activate

# Copy workspace manifests (monorepo-wide lockfile lives at repo root)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

# Install only the backend workspace's dependencies
RUN pnpm install --frozen-lockfile --filter adinusa-ai-backend...

# Copy source
COPY backend/src/ ./backend/src/

# Stage 2: Production
FROM node:20-alpine

# Install pnpm
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@9.15.0 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --filter adinusa-ai-backend... && pnpm store prune

# Copy built application from builder
COPY --from=builder /app/backend/src ./backend/src

WORKDIR /app/backend

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => { if (r.statusCode !== 200) throw new Error('Not healthy') })"

CMD ["node", "src/app.js"]
