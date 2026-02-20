# ── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json 2>/dev/null || true
RUN npm ci --ignore-scripts && npm cache clean --force

# ── Stage 2: Build ───────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

COPY . .
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm run build --workspace @atelier/api

# ── Stage 3: Production ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S atelier && \
    adduser -S atelier -u 1001 -G atelier

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl curl

# Copy only what's needed
COPY --from=build --chown=atelier:atelier /app/package.json /app/package-lock.json ./
COPY --from=build --chown=atelier:atelier /app/apps/api ./apps/api
COPY --from=build --chown=atelier:atelier /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/health || exit 1

USER atelier

CMD ["npm", "run", "start", "--workspace", "@atelier/api"]
