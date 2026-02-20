'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Palette,
  Shirt,
  Package,
  Zap,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

const STEPS = [
  {
    step: '01',
    icon: Sparkles,
    title: 'Describe Your Vision',
    description: 'Write a prompt describing your dream design — abstract art, typography, patterns, anything.',
  },
  {
    step: '02',
    icon: Palette,
    title: 'AI Generates It',
    description: 'Our AI engine creates a unique, high-resolution design from your prompt in seconds.',
  },
  {
    step: '03',
    icon: Eye,
    title: 'Preview on Apparel',
    description: 'See your design on T-shirts, hoodies, and more. Adjust placement, size, and color.',
  },
  {
    step: '04',
    icon: Package,
    title: 'Place Your Order',
    description: 'Love it? Order it. We print and ship your custom apparel directly to your door.',
  },
];

const STATS = [
  { value: '1000+', label: 'Ready Designs' },
  { value: '6', label: 'Apparel Types' },
  { value: '24h', label: 'Fast Shipping' },
  { value: '∞', label: 'AI Possibilities' },
];

export default function HomePage() {
  return (
    <div className="space-y-20 animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative text-center py-16 sm:py-24 space-y-6">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-[hsl(var(--primary)/0.08)] blur-[120px]" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span>AI-Powered Custom Fashion</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-tight tracking-tight">
          Your Imagination,{' '}
          <span className="bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--chart-1))] to-[hsl(var(--chart-2))] bg-clip-text text-transparent">
            Worn
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-[hsl(var(--muted-foreground))] leading-relaxed">
          Describe your dream design, let AI bring it to life, preview it on premium apparel, and order it — all in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/studio">
            <Button variant="gradient" size="lg" className="text-base px-8">
              <Palette className="h-5 w-5" />
              Create Your Design
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline" size="lg" className="text-base px-8">
              <Shirt className="h-5 w-5" />
              Browse 1000+ Designs
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} variant="glass" className="text-center p-6">
            <p className="text-3xl sm:text-4xl font-display font-bold text-[hsl(var(--primary))]">{stat.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
          </Card>
        ))}
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">How It Works</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 max-w-lg mx-auto">
            From idea to doorstep in four simple steps
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.step} variant="interactive" className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] rounded-full px-2 py-0.5">
                    {step.step}
                  </span>
                </div>
                <div className="rounded-xl bg-[hsl(var(--primary)/0.08)] p-3 w-fit">
                  <Icon className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Dual CTA ──────────────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-8 space-y-4 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent">
          <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-3 w-fit">
            <Sparkles className="h-8 w-8 text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-2xl font-display font-bold">Create with AI</h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Write a prompt and watch AI transform your idea into a print-ready design. Unique, every time.
          </p>
          <Link href="/studio">
            <Button variant="gradient">
              Open Design Studio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card variant="elevated" className="p-8 space-y-4 bg-gradient-to-br from-[hsl(var(--chart-1)/0.05)] to-transparent">
          <div className="rounded-xl bg-[hsl(var(--chart-1)/0.1)] p-3 w-fit">
            <ShoppingBag className="h-8 w-8 text-[hsl(var(--chart-1))]" />
          </div>
          <h3 className="text-2xl font-display font-bold">Browse Ready Designs</h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Explore 1000+ curated designs for men and women. Pick your favorite and order instantly.
          </p>
          <Link href="/gallery">
            <Button variant="outline">
              View Gallery
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="text-center py-16 space-y-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--chart-1)/0.05)] to-[hsl(var(--primary)/0.08)]">
        <Zap className="h-10 w-10 text-[hsl(var(--primary))] mx-auto" />
        <h2 className="text-3xl sm:text-4xl font-display font-bold">Ready to Wear Your Imagination?</h2>
        <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
          Join thousands of creators designing their own fashion.
        </p>
        <Link href="/signup">
          <Button variant="gradient" size="lg" className="mt-4">
            Get Started — It&apos;s Free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
