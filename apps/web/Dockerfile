# ── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --ignore-scripts && npm cache clean --force

# ── Stage 2: Build ───────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

COPY . .

# Build args for Next.js public env vars (baked at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
ARG NEXT_PUBLIC_TENANT_SLUG=manusai
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TENANT_SLUG=$NEXT_PUBLIC_TENANT_SLUG

RUN npm run build --workspace @atelier/web

# ── Stage 3: Production ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S atelier && \
    adduser -S atelier -u 1001 -G atelier

RUN apk add --no-cache curl

# Copy built application
COPY --from=build --chown=atelier:atelier /app/package.json /app/package-lock.json ./
COPY --from=build --chown=atelier:atelier /app/apps/web ./apps/web
COPY --from=build --chown=atelier:atelier /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

USER atelier

CMD ["npm", "run", "start", "--workspace", "@atelier/web"]
