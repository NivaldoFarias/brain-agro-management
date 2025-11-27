# Build stage
FROM oven/bun:1.3.3-alpine AS builder

WORKDIR /app

# Copy package files for monorepo
COPY package.json bun.lock* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (needed for build)
RUN bun install --frozen-lockfile

# Copy source code for all workspaces
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.base.json tsconfig.json ./

# Build the API application (Bun bundles dependencies, including @agro/shared)
RUN cd apps/api && bun run build

# Production stage
FROM oven/bun:1.3.3-alpine AS production

WORKDIR /app

# Install dumb-init and curl for proper signal handling and health checks
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files for production install
COPY --from=builder /app/package.json /app/bun.lock* ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built application and necessary files
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/src/database ./apps/api/src/database

# Copy complete shared package source (needed for workspace dependency resolution)
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared ./packages/shared

# Create data and logs directories for SQLite and application logs
RUN mkdir -p /app/apps/api/data /app/apps/api/logs && \
  chown -R nodejs:nodejs /app/apps/api/data /app/apps/api/logs

# Switch to non-root user
USER nodejs

# Expose port (default 3000, can be overridden by API__PORT env var)
EXPOSE 3000 7860

# Health check - check actual API endpoint on port 7860 for HF Spaces
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:7860/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application from project root
CMD ["bun", "run", "apps/api/dist/main.js"]
