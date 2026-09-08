# ==============================================================================
# BACKEND PRODUCTION DOCKERFILE (NESTJS + PRISMA)
# ==============================================================================

# STAGE 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies for lean production image
RUN npm prune --production

# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy runtime assets from builder
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs prisma ./prisma/
COPY --chown=nestjs:nodejs node_modules ./node_modules/
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist/

# Run as unprivileged user
USER nestjs

EXPOSE 4000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/main.js"]
