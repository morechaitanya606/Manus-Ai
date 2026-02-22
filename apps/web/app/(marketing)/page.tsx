'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { useProducts } from '../../hooks/use-products';
import { Sparkles, Palette, Zap, ShoppingBag, ArrowRight, Star } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'AI Design Generation', desc: 'Describe your vision, our AI creates stunning designs in seconds' },
  { icon: Palette, title: 'Realistic Mockups', desc: 'Preview your designs on T-shirts, hoodies, caps, totes & posters' },
  { icon: Zap, title: 'Instant Checkout', desc: 'Seamless ordering with automatic order fulfillment' },
  { icon: ShoppingBag, title: 'Print & Ship', desc: 'Professional printing and worldwide shipping via Printful' },
];

export default function HomePage() {
  const { data: products } = useProducts();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-white to-[hsl(var(--muted))]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl" />
          <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-[hsl(var(--accent)/0.06)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/0.1)] px-4 py-1.5 text-sm font-medium text-[hsl(var(--primary))] mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Custom Fashion
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight animate-slide-up">
              Design Your
              <br />
              <span className="gradient-text-hero">Dream Merch</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto animate-slide-up animation-delay-100">
              Create stunning AI-generated designs, preview on realistic apparel mockups,
              and launch your custom fashion brand — all in one platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-200">
              <Link href="/studio">
                <Button variant="gradient" size="lg" className="rounded-full px-8 text-base shadow-lg shadow-[hsl(var(--primary)/0.3)]">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base">
                  Browse Gallery
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in animation-delay-300">
              {[
                { value: '500+', label: 'Designs Created' },
                { value: '5', label: 'Product Types' },
                { value: '24/7', label: 'AI Available' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold font-display gradient-text">{stat.value}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              How <span className="gradient-text">Custyle</span> Works
            </h2>
            <p className="mt-4 text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              From imagination to doorstep in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative bg-[hsl(var(--muted))] rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.08)] transition-all duration-300 border border-transparent hover:border-[hsl(var(--border))]"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white mb-4 shadow-lg shadow-[hsl(var(--primary)/0.2)] group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="text-xs font-bold text-[hsl(var(--primary))] mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      {products && products.length > 0 && (
        <section className="py-24 bg-[hsl(var(--muted))]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display">
                  Our <span className="gradient-text">Products</span>
                </h2>
                <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                  Premium apparel ready for your custom designs
                </p>
              </div>
              <Link href="/gallery">
                <Button variant="outline" className="rounded-full">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {products.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/gallery/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.06)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] relative overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        sizes="20vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm group-hover:text-[hsl(var(--primary))] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold">${Number(product.base_price).toFixed(2)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium capitalize">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Start for free — 10 AI credits included
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Join thousands of creators who are designing and selling custom apparel with AI
              </p>
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-10 bg-white text-[hsl(var(--primary))] hover:bg-white/90 font-semibold shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
