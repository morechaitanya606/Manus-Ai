# EVERYDAYDROP 🎨

> India's AI-powered custom print-on-demand platform — sustainable materials, premium quality, doorstep delivery.

## 🌟 Features

- **AI Design Studio** — Generate, upscale, and remove backgrounds using AI (Google Gemini 2.0 Flash, Leonardo, Pollinations)
- **Interactive 2D & 3D Editor** — Perfectly position designs on digital apparel using Konva and React Three Fiber
- **7 Premium Materials** — Bamboo, Hemp, Linen, Cotton 240 GSM, Bleach Art, Denim
- **Multiple Printing Methods** — DTF, Screen Print, Puff, HD, Embroidery, Bleach Art
- **Dark Mode** — Modern Next.js interface with full dark mode support using shadcn/ui and Framer Motion
- **Community & Social** — Community gallery with a design likes/trending system and dedicated cloud storage
- **Order & Credit Management** — Razorpay integration for checkout and platform credit purchasing
- **Printful Integration** — Automated print-on-demand fulfillment routing
- **Admin Dashboard** — Comprehensive portal for tracking revenue, managing orders, refunds, and product catalogs

## 📋 Recent Updates (v2.0.0)

- **AI Design Studio** — Generate, upscale, and remove backgrounds using AI (Google Gemini 2.0 Flash, Leonardo, Pollinations)
- **Interactive 2D & 3D Editor** — Perfectly position designs on digital apparel using Konva and React Three Fiber
- **7 Premium Materials** — Bamboo, Hemp, Linen, Cotton 240 GSM, Bleach Art, Denim
- **Multiple Printing Methods** — DTF, Screen Print, Puff, HD, Embroidery, Bleach Art
- **Dark Mode** — Modern Next.js interface with full dark mode support using shadcn/ui and Framer Motion
- **Community & Social** — Community gallery with a design likes/trending system and dedicated cloud storage
- **Order & Credit Management** — Razorpay integration for checkout and platform credit purchasing
- **Printful Integration** — Automated print-on-demand fulfillment routing
- **Admin Dashboard** — Comprehensive portal for tracking revenue, managing orders, refunds, and product catalogs

## 🛒 Product Catalog

| Product | Material | Price |
|---------|----------|-------|
| Denim Pants | Denim Cotton Blend | ₹600 |
| Cotton T-Shirt 240 GSM | 100% Cotton | ₹699 |
| Bamboo T-Shirt | Bamboo Fiber | ₹799 |
| Bleach Art T-Shirt | 100% Cotton | ₹899 |
| Bamboo Shirt | Bamboo Fiber | ₹999 |
| Hemp Shirt | 100% Hemp | ₹1,199 |
| Linen Shirt | Pure Linen | ₹1,299 |

## 🏗️ Tech Stack

- **Frontend** — Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State & Data** — Zustand, React Query
- **Graphics** — React Three Fiber, Three.js, Konva
- **Backend** — Supabase (PostgreSQL, Auth, Storage Buckets, Edge Functions)
- **AI** — Google Generative AI, Leonardo API, Pollinations API
- **Payments & E-Commerce** — Razorpay, Printful API
- **Deployment** — Vercel

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (marketing)/     # Homepage
│   ├── about/           # About us
│   ├── admin/           # Admin portal
│   ├── community/       # Community gallery
│   ├── credits/         # Credit purchasing
│   ├── drop/            # Drop catalog
│   ├── gallery/         # General gallery
│   ├── shop/            # General shop catalog
│   ├── studio/          # AI Design Studio (2D & 3D Editor)
│   ├── my-designs/      # Saved designs
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Payment checkout
│   ├── orders/          # User orders
│   ├── profile/         # User profile
│   └── dashboard/       # Admin dashboard
├── components/          # Shared UI components
├── hooks/               # React Query hooks
├── stores/              # Zustand state stores (Auth, Cart)
└── lib/                 # Supabase client, Razorpay, Pollinations utilities

supabase/
├── migrations/          # PostgreSQL database schemas
└── functions/           # Edge functions (AI ops, payments, etc.)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Razorpay account (for payments)
- Google AI API key (for design generation)

### Installation

```bash
# Clone the repo
git clone https://github.com/morechaitanya606/Manus-Ai.git
cd Manus-Ai

# Install dependencies
npm install

# Navigate to web app
cd apps/web

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
GEMINI_API_KEY=your_gemini_api_key
```

### Run Development Server

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

## 🔐 Admin Setup

1. Sign up on the website with your email
2. Set yourself as admin in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@gmail.com';
```

3. The Dashboard link will appear in the navbar after login

### Admin Dashboard Capabilities

- **Overview** — Revenue, orders, users, AI credits stats
- **Order Fulfillment** — Mark orders as printing → shipped → delivered
- **Product Management** — Add, edit, delete products with images
- **Design Downloads** — Download customer designs for printing

## 🌐 Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set **Root Directory** to `apps/web`
4. Add environment variables (same as `.env.local`)
5. Deploy!

### Post-Deployment

Update Supabase Auth settings:
- **Site URL** → `https://your-domain.vercel.app`
- **Redirect URLs** → `https://your-domain.vercel.app/auth/callback`

## 📄 Pages

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Public |
| About | `/about` | Public |
| How It Works | `/how-it-works` | Public |
| Pricing | `/pricing` | Public |
| Printing Types | `/printing-types` | Public |
| FAQ | `/faq` | Public |
| Contact | `/contact` | Public |
| Gallery | `/gallery` | Public |
| Product Detail | `/gallery/:id` | Public |
| AI Studio | `/studio` | Auth |
| My Designs | `/my-designs` | Auth |
| Cart | `/cart` | Public |
| Checkout | `/checkout` | Auth |
| Orders | `/orders` | Auth |
| Profile | `/profile` | Auth |
| Dashboard | `/dashboard` | Admin |
| Manage Orders | `/dashboard/orders` | Admin |
| Manage Products | `/dashboard/products` | Admin |

## 🎨 Dark Mode

Click the Moon/Sun icon in the navbar to toggle. Preference is saved in localStorage and auto-detects system theme on first visit.

## 📞 Contact

- **Email**: contact@everydaydrop.in
- **Phone**: +91 70284 78109
- **Location**: Pune, Maharashtra, India

---

Made with ❤️ in India | © 2026 EVERYDAYDROP
