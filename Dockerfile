# Dockerfile multi-stage optimisé pour Next.js 16 en production

# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:22-alpine AS deps

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for Prisma CLI and build)
# Optimisations: ignore-scripts évite les hooks post-install inutiles
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts && \
    npm cache clean --force

# ===================================
# Stage 2: Builder
# ===================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Accept DATABASE_URL as build argument with dummy default
# Prisma needs it to generate the client, but the actual URL will be provided at runtime
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

# Compile prisma.config.ts to prisma.config.js for Prisma 7 compatibility
RUN node scripts/compile-prisma-config.js

# Generate Prisma Client before build (required for TypeScript compilation)
RUN npx prisma generate

# Build Next.js application
# Standalone output for optimal Docker image size
# Utilise le cache de build Next.js pour accélérer les rebuilds
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ===================================
# Stage 3: Runner (Production)
# ===================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy only necessary Prisma files (migrations are done in db-init container)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy custom entrypoint script (as root before switching user)
USER root
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with our custom entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
