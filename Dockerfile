# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy configuration files needed for build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY drizzle.config.ts ./

# Copy source code
COPY src ./src

# Build the application
RUN pnpm build

# Verify build output
RUN ls -la dist/ || (echo "Build failed - dist directory not found" && exit 1)
RUN test -f dist/src/main.js || (echo "Build failed - dist/src/main.js not found" && exit 1)

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy database migrations and schema (if needed at runtime)
COPY --from=builder /app/src/database ./src/database

# Copy drizzle config for migrations (if needed)
COPY --from=builder /app/drizzle.config.ts ./

# Verify files are copied
RUN ls -la dist/ || (echo "dist directory not found" && exit 1)
RUN test -f dist/src/main.js || (echo "dist/src/main.js not found" && exit 1)

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Railway will use PORT env variable, typically 8080)
EXPOSE 8080

# Note: Railway manages health checks automatically
# The app listens on PORT env variable (default 3000, Railway uses 8080)

# Start the application
CMD ["node", "dist/src/main.js"]

