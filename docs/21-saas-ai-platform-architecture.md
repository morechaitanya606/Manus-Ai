# 21. SaaS AI Platform Architecture

## Vision

- Multi-tenant SaaS commerce platform for custom fashion stores
- AI design generation and realistic apparel mockups
- Full order lifecycle with payment and stock safety

## Runtime Stack

- Frontend: Next.js 14 + TypeScript + Tailwind + React Query + Zustand
- Backend: Fastify + TypeScript + Prisma + PostgreSQL
- Async: Redis + BullMQ workers
- Storage: S3-compatible object storage
- Payments: Stripe payment intents + webhook handling

## Core Flows

1. Design generation:
   - `POST /api/v1/designs/generate` -> queue job
   - worker generates image via provider abstraction
   - `GET /api/v1/designs/status/:jobId`
2. Mockup rendering:
   - `POST /api/v1/designs/mockup`
   - design overlay compositing via Sharp
   - optimized preview stored in object storage
3. Checkout:
   - validate cart
   - reserve stock
   - create order (`PAYMENT_PENDING`)
   - create Stripe payment intent
   - webhook success: commit stock deduction + clear cart + emit `order.created`
   - webhook failure: release reservations + mark `PAYMENT_FAILED`

## Tenant Isolation

- Tenant-owned tables include `tenantId`
- JWT payload includes tenant context
- Repository layer always filters by `tenantId`

## Deployment

- Web: Vercel
- API + Worker: Render / Railway / Fly.io
- Postgres: Neon / Supabase
- Redis: Upstash / managed Redis
- Object storage: S3 / R2
