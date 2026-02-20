<p align="center">
  <img src="https://img.shields.io/badge/ManusAI-AI%20Fashion%20Platform-blueviolet?style=for-the-badge&logo=sparkles" alt="ManusAI Badge" />
</p>

<h1 align="center">🧵 ManusAI — AI-Powered Custom Fashion Platform</h1>

<p align="center">
  <strong>Production-ready SaaS platform for AI-generated custom fashion</strong><br/>
  Design → Preview → Order → Deliver
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Fastify-000?style=flat-square&logo=fastify" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

## ✨ What is ManusAI?

ManusAI is a **production-grade, AI-powered custom fashion marketplace** where users can:

- 🎨 **Generate designs** using AI (OpenAI / Stable Diffusion)
- 👕 **Preview designs** on real apparel mockups (T-shirts, hoodies, shirts)
- 🛒 **Order directly** from the Design Studio or Sample Gallery
- 📦 **Track orders** through a complete order lifecycle
- 💾 **Save designs** and re-order anytime

Admins can manage products, process orders, view revenue analytics, and control AI usage — all from a premium dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│              Next.js 14 (App Router)                │
│     TailwindCSS · ShadCN UI · TanStack Query        │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                   BACKEND API                       │
│            Fastify · TypeScript · Zod               │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌────────┐         │
│  │ Auth │ │Products│ │Designs│ │ Orders │          │
│  └──────┘ └────────┘ └───┬───┘ └───┬────┘          │
│                          │         │                │
│  ┌───────────────────────▼─────────▼───────────┐   │
│  │          Background Workers (BullMQ)         │   │
│  │    AI Generation · Mockup Render · Events    │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
         ┌─────────────┼─────────────┐
    ┌────▼────┐  ┌─────▼─────┐ ┌────▼────┐
    │PostgreSQL│  │   Redis   │ │ S3/MinIO│
    │ (Prisma) │  │  (Cache)  │ │(Storage)│
    └──────────┘  └───────────┘ └─────────┘
```

**Style**: Modular Monolith → Route → Controller → Service → Repository → DB

---

## 📱 Pages (17 total)

| Page | Path | Description |
|------|------|-------------|
| 🏠 **Home** | `/` | "Your Imagination, Worn" — hero with dual CTAs |
| 🎨 **Design Studio** | `/studio` | AI prompt → generate → preview on apparel → order |
| 🖼️ **Gallery** | `/gallery` | Browse 1000+ designs with Men/Women/Unisex filters |
| 📋 **Gallery Detail** | `/gallery/:id` | Size/color picker + inline order form |
| 💾 **My Designs** | `/my-designs` | Design history with status, re-order, preview |
| 👤 **Profile** | `/profile` | Account details + quick links |
| 🔐 **Login/Signup** | `/login`, `/signup` | Branded auth with validation |
| 📦 **Orders** | `/orders` | Order history |
| 📄 **Order Detail** | `/orders/:id` | Shipment tracking + status |
| 🛒 **Cart** | `/cart` | Cart management |
| 💳 **Checkout** | `/checkout` | Stripe-powered checkout |
| 📊 **Admin Dashboard** | `/dashboard` | Revenue, orders, AI metrics |
| 📦 **Admin Products** | `/dashboard/products` | CRUD products + stock |
| 📋 **Admin Orders** | `/dashboard/orders` | Order management + status |
| 🛍️ **Products** | `/products`, `/products/:id` | Product catalog |

---

## 🔌 API Endpoints

```
Auth
  POST   /api/v1/auth/signup
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  GET    /api/v1/auth/me

Designs (Core)
  POST   /api/v1/designs/generate      → Queue AI generation
  GET    /api/v1/designs/my             → User's design history
  GET    /api/v1/designs/status/:jobId  → Poll generation status
  POST   /api/v1/designs/mockup         → Render apparel mockup
  POST   /api/v1/designs/signed-upload  → Get pre-signed upload URL

Products
  GET    /api/v1/products
  GET    /api/v1/products/:id
  POST   /api/v1/products               (admin)
  PATCH  /api/v1/products/:id            (admin)
  PATCH  /api/v1/products/:id/stock      (admin)

Cart
  GET    /api/v1/cart
  POST   /api/v1/cart/items
  PATCH  /api/v1/cart/items/:itemId
  DELETE /api/v1/cart/items/:itemId

Orders
  POST   /api/v1/orders/checkout         (Idempotency-Key required)
  GET    /api/v1/orders/my
  GET    /api/v1/orders/:id
  PATCH  /api/v1/orders/:id/status       (admin)
  POST   /api/v1/orders/webhooks/stripe

Admin
  GET    /api/v1/admin/metrics

Health
  GET    /health
  GET    /api/v1/health
```

---

## 🛡️ Security & Reliability

| Feature | Implementation |
|---------|---------------|
| **Auth** | JWT with refresh token rotation |
| **RBAC** | PLATFORM_ADMIN, STORE_OWNER, STORE_MANAGER, CUSTOMER |
| **Input Validation** | Zod schemas at every route boundary |
| **Security Headers** | Helmet (CSP, HSTS, etc.) |
| **CORS** | Strict origin allowlist |
| **Rate Limiting** | Global (120/min) + AI-specific (10/min) |
| **Idempotency** | Idempotency keys for checkout/payments |
| **Error Handling** | Centralized error handler, no stack traces in prod |
| **Graceful Shutdown** | SIGTERM/SIGINT handlers |
| **Structured Logging** | Pino with request IDs |
| **Upload Limits** | 10MB max, image-only validation |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### 1. Install

```bash
git clone https://github.com/morechaitanya606/ManusAi.git
cd ManusAi
npm install
```

### 2. Configure

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit the .env files with your credentials
```

### 3. Database Setup

```bash
npm run db:push --workspace @atelier/api
npm run db:seed --workspace @atelier/api
```

### 4. Run

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| 🌐 Web | http://localhost:3000 |
| 🔧 API | http://localhost:5001 |
| 📖 Swagger | http://localhost:5001/docs |
| 💚 Health | http://localhost:5001/api/v1/health |

---

## 🐳 Docker (Full Stack)

```bash
npm run docker:up
```

Starts: PostgreSQL + Redis + MinIO + API + Worker + Web

---

## ☁️ Production Deployment

| Component | Provider | Notes |
|-----------|----------|-------|
| **Frontend** | Vercel | Set root dir to `apps/web` |
| **API** | Railway / Render | Use `apps/api/Dockerfile` |
| **Database** | Neon / Supabase | Managed PostgreSQL |
| **Redis** | Upstash | Serverless Redis |
| **Storage** | AWS S3 / Cloudflare R2 | S3-compatible |
| **Payments** | Stripe | Test + Live keys |

### Deploy Frontend (Vercel)

```bash
# Connect repo → select apps/web as root
# Set env vars:
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
NEXT_PUBLIC_TENANT_SLUG=atelier-thread
```

### Deploy Backend (Railway)

```bash
# Point to apps/api/Dockerfile
# Set env vars from apps/api/.env.example
# Key: DATABASE_URL, REDIS_URL, JWT secrets, STRIPE keys, S3 config
```

### Database Migration

```bash
npx prisma db push --schema=apps/api/prisma/schema.prisma
npx ts-node apps/api/prisma/seed.ts
```

---

## 🧠 AI Design Engine

```
User Prompt → API Job → BullMQ Worker → AI Provider → S3 Upload → Status Update
```

- **Providers**: OpenAI Image API, Stable Diffusion, Mock (for testing)
- **Provider abstraction**: swap providers via `AI_PROVIDER` env var
- **Rate limited**: 10 requests/minute per user
- **Mockup rendering**: Sharp-based image compositing with placement controls

---

## 🛒 Order Flow

```
Cart → Validate Stock → Reserve → Create Order (PENDING) → Stripe Payment Intent
  → Webhook Confirms → Mark PAID → Deduct Stock → Emit order.created → Clear Cart
```

- ✅ Database transactions
- ✅ Idempotency keys prevent duplicates
- ✅ Stock reservation prevents overselling
- ✅ Payment failure recovery

---

## 📁 Monorepo Structure

```
ManusAi/
├── apps/
│   ├── api/                    # Fastify backend
│   │   ├── src/
│   │   │   ├── modules/        # auth, designs, products, carts, orders, admin, tenants
│   │   │   ├── lib/            # ai, mockups, payments, storage
│   │   │   ├── plugins/        # prisma, redis, queues, auth, security, swagger
│   │   │   ├── jobs/           # BullMQ workers
│   │   │   └── config/         # env validation, logging, otel
│   │   └── prisma/             # schema + seed
│   └── web/                    # Next.js 14 frontend
│       ├── app/                # 17 pages (App Router)
│       ├── components/         # UI components + design system
│       ├── stores/             # Zustand (auth state)
│       └── lib/                # API client, utils
├── packages/types/             # Shared types
├── infra/k8s/                  # Kubernetes manifests
├── docker-compose.saas.yml     # Full stack Docker
├── .github/workflows/ci.yml   # CI/CD pipeline
└── Dockerfile(s)               # Multi-stage production builds
```

---

## 🔄 CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. ✅ Lint + Type Check
2. ✅ Build Frontend
3. ✅ Build Docker Images (API + Web)

---

## 🗺️ Roadmap

- [x] Phase 1: Modular Monolith (current)
- [ ] Phase 2: Service extraction (Auth, Product, Order, AI)
- [ ] Phase 3: Event backbone + dedicated workers
- [ ] Phase 4: Creator marketplace + subscription AI credits
- [ ] Phase 5: Multi-tenant SaaS with custom storefronts

---

## 📄 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, ShadCN UI, TanStack Query, Zustand, Framer Motion |
| Backend | Fastify, TypeScript, Prisma, Zod |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | BullMQ |
| AI | OpenAI / Stable Diffusion (abstracted) |
| Payments | Stripe |
| Storage | S3 / R2 / MinIO |
| Auth | JWT + Refresh Tokens + RBAC |
| DevOps | Docker, GitHub Actions, Kubernetes-ready |

---

<p align="center">
  Built with ❤️ by <strong>ManusAI Team</strong>
</p>
