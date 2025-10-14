# Builder stage
FROM oven/bun AS builder
WORKDIR /app

ARG VITE_PUBLIC_BACKEND_URL
ARG VITE_PUBLIC_FRONTEND_URL

ENV VITE_PUBLIC_BACKEND_URL=${VITE_PUBLIC_BACKEND_URL}
ENV VITE_PUBLIC_FRONTEND_URL=${VITE_PUBLIC_FRONTEND_URL}

# Copy package files for dependency installation
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application from web directory
WORKDIR /app/apps/web
RUN bun run build
RUN bash scripts/handle-nextjs-standalone-build.sh

# Production image
FROM oven/bun AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV VITE_PUBLIC_BACKEND_URL=${VITE_PUBLIC_BACKEND_URL}
ENV VITE_PUBLIC_FRONTEND_URL=${VITE_PUBLIC_FRONTEND_URL}

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy the standalone output
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/.next ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/web/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/packages/db ./packages/db

# Switch to non-root user
USER nodejs

EXPOSE ${PORT}

# Based on apps/web workspace path from root package.json
CMD ["bun", "run", "./build-start-folder/apps/web/server.js"]
