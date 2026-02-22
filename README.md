# The Quote Shop 🎨

> India's AI-powered custom print-on-demand platform — sustainable materials, premium quality, doorstep delivery.

## 🌟 Features

- **AI Design Studio** — Generate stunning designs from text prompts using AI (Gemini 2.0 Flash)
- **7 Premium Materials** — Bamboo, Hemp, Linen, Cotton 240 GSM, Bleach Art, Denim
- **Multiple Printing Methods** — DTF, Screen Print, Puff, HD, Embroidery, Bleach Art
- **Dark Mode** — Full dark mode support with system preference detection
- **Product Recommendations** — Smart "You might also like" suggestions on product pages
- **Order Management** — Admin dashboard for tracking orders, printing, and shipping
- **Razorpay Payments** — Secure checkout with UPI, cards, net banking
- **Pan-India Shipping** — Flat ₹99 shipping, free above ₹2,000

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

- **Frontend** — Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** — Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI** — Google Gemini 2.0 Flash (Image Generation)
- **Payments** — Razorpay
- **Deployment** — Vercel

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (marketing)/     # Homepage
│   ├── about/           # About us
│   ├── how-it-works/    # Step-by-step guide
│   ├── pricing/         # Pricing table
│   ├── printing-types/  # Printing methods + materials
│   ├── faq/             # FAQ with search
│   ├── contact/         # Contact form
│   ├── gallery/         # Product catalog + detail pages
│   ├── studio/          # AI Design Studio
│   ├── my-designs/      # Saved designs
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Payment checkout
│   ├── orders/          # User orders
│   ├── profile/         # User profile
│   └── dashboard/       # Admin dashboard
│       ├── orders/      # Order fulfillment
│       └── products/    # Product management
├── components/          # Shared UI components
├── hooks/               # React Query hooks
├── stores/              # Zustand state stores
└── lib/                 # Supabase client, utilities
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

- **Email**: contact@thequoteshop.in
- **Phone**: +91 70284 78109
- **Location**: Pune, Maharashtra, India

---

Made with ❤️ in India | © 2026 The Quote Shop
