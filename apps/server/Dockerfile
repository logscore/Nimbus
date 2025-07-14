FROM oven/bun AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run --cwd apps/server build

# Production image
FROM oven/bun AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=1284

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Create app directory in runner
RUN mkdir -p /app/apps/server/dist /app/packages/db

# Copy built application and db package
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/server/dist/ /app/apps/server/dist/
COPY --from=builder --chown=nodejs:nodejs /app/packages/db /app/packages/db

# Switch to non-root user
USER nodejs

WORKDIR /app/apps/server

EXPOSE ${PORT}

RUN bun --cwd /app/packages/db push

# Start the application with db push
CMD bun dist/index.js