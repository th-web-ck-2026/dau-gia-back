# Stage 1: Build source
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Install production dependencies only
FROM node:22-alpine AS prod-deps

WORKDIR /app

# Install build dependencies for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Stage 3: Runner (Production Image)
FROM node:22-alpine AS runner

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy compiled files from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
# Copy production dependencies
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# Copy package files
COPY --from=builder --chown=node:node /app/package*.json ./

# Use non-root node user for runtime execution
USER node

# Expose NestJS application port
EXPOSE 3000

# Health check using Node.js instead of curl (as curl is not installed in Alpine by default)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request('http://localhost:' + (process.env.PORT || 3000) + '/api/health', { timeout: 5000 }, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start application
CMD ["node", "dist/main"]

