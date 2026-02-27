# Product Specification Document

## 1. Product Overview
**Product Name**: EVERYDAYDROP (Atelier Thread SaaS / Manus-Ai)
**Product Purpose**: A production-ready, multi-tenant SaaS AI-powered custom fashion e-commerce platform based in India. It enables users to design, visualize in 2D and 3D, and purchase premium apparel using state-of-the-art AI generative design models and high-quality materials.

## 2. Target Audience
- **Individuals** seeking unique, custom-designed clothing that matches their absolute personal taste.
- **Artists and Digital Creators** looking for a frictionless avenue to print their digital art or AI-generated ideas on merchandise.
- **Eco-conscious Consumers** who prefer sustainable printing materials like Bamboo, Hemp, and pure Linen.

## 3. Key Features

### 3.1 AI Design Studio
- **Generative AI Creation**: Users can generate stunning custom designs from simple text prompts or reference images using advanced multimodal AI (Google Gemini 2.0 Flash, Leonardo API, Pollinations API).
- **Advanced Image Operations**: Integrated AI tools for background removal and image upscaling.
- **Interactive 2D & 3D Editor**: A web-based canvas (powered by Konva) and 3D visualization engine (powered by React Three Fiber) where users can position, scale, and adjust their generated designs perfectly within the printable area of the apparel.

### 3.2 Premium Material & Printing Options
- **Eco-Friendly Materials**: Bamboo Fiber, 100% Hemp, Pure Linen, 100% Cotton (240 GSM), and Denim Cotton Blend.
- **Diverse Printing Techniques**: Direct-to-Film (DTF), Screen Print, Puff Print, High-Density (HD), Embroidery, and Bleach Art.

### 3.3 E-Commerce & Retail
- **Intuitive Browsing**: A complete product catalog with categorized views (shop, drop, community).
- **Seamless Checkout & Credits**: Secure payments integrated via Razorpay. Users can also purchase and utilize platform credits for AI generation.
- **Fulfillment Integration**: Automated print-on-demand fulfillment capabilities routed via Printful.
- **Admin Dashboard**: A comprehensive operational portal for administrators to track revenue, manage orders, handle refunds, monitor credits, and manage the product catalog.

### 3.4 Community & Storage
- **Drop, Shop & Gallery**: Dedicated community spaces for direct user asset uploads and engagement, backed by dedicated cloud storage buckets.
- **Community Likes System**: A robust trending system where users can like designs, contributing to global sorting and discovery.
- **My Designs**: A personal cloud-synced library (`user-designs`) for users to save and revisit their historically generated designs or uploaded inspirations.

### 3.5 Core System Experience
- **Responsive UX**: Modern Next.js 15 interface utilizing modern UI components (shadcn/ui, Framer Motion) with full Dark Mode support.
- **Robust Backend**: Powered by Supabase for secure authentication, PostgreSQL database, storage buckets, and Edge Functions.

## 4. User Flows

### 4.1 Customer Experience Flow
1. **Onboarding**: User lands on the platform and authenticates via Supabase Auth.
2. **Design Creation**: User navigates to the AI Studio. They enter a prompt or image, utilizing purchased credits to generate, upscale, or remove backgrounds using AI.
3. **Apparel Customization**: The user applies the design to a digital t-shirt or hoodie mockup, utilizing 2D and 3D rendering to perfectly place their art.
4. **Social & Sharing**: User can publish their design to the community gallery to accumulate likes.
5. **Checkout**: User selects the base material, size, and printing type, adds the custom item to their cart, and securely checks out via Razorpay.
6. **Fulfillment Tracking**: User actively tracks their Printful-integrated order status until home delivery.

### 4.2 Administrator Flow
1. **Authentication**: Admin signs in securely to access the protected portal.
2. **Order Fulfillment**: Admin reviews incoming orders, manages Printful synchronization, handles shipping/refunds, and sequentially updates order tracking statuses.
3. **Store Management**: Admin dynamically adds or updates base apparel categories and products, tweaking available printing capabilities and pricing.

## 5. Technical Architecture
- **Frontend Framework**: Next.js 15, React 18, TypeScript, Tailwind CSS.
- **State Management & Data Fetching**: Zustand (Auth, Cart), React Query.
- **Graphics & Visualization**: React Three Fiber, Three.js, Konva.
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI Infrastructures**: Google Generative AI, Pollinations API, Leonardo API.
- **Payment & E-commerce Hub**: Razorpay Integration, Printful API.
- **Hosting/Deployment**: Vercel.
