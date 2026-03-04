'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Search, Loader2, ShoppingBag, ArrowRight, Sparkles, Package, Truck, Printer, Layers, X, Filter } from 'lucide-react';
import type { Product } from '../../hooks/use-products';
import { GalleryFilters, FilterState, initialFilterState } from '../../components/gallery-filters';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'tshirt', label: 'T-Shirts' },
  { key: 'shirt', label: 'Shirts' },
  { key: 'hoodie', label: 'Hoodies' },
  { key: 'pants', label: 'Pants' },
  { key: 'cap', label: 'Caps' },
  { key: 'tote', label: 'Totes' },
  { key: 'poster', label: 'Posters' },
];

type SortMode = 'newest' | 'price_low_high' | 'price_high_low';

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
];

const PAGE_SIZE = 10;

const FALLBACK_COLOR_MAP: Record<string, string> = {
  black: '#121212',
  white: '#f4f4f5',
  navy: '#1e2a4a',
  navyblue: '#1e2a4a',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  gray: '#6b7280',
  grey: '#6b7280',
  beige: '#d6c2a2',
  cream: '#efe8d8',
};

const toCssColor = (input: string) => {
  const normalized = String(input || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!normalized) return '#232331';
  return FALLBACK_COLOR_MAP[normalized] || normalized;
};

export default function GalleryPage() {
  const { data: products, isLoading } = useProducts();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingNextBatch, setIsLoadingNextBatch] = useState(false);
  const [nextBatchSize, setNextBatchSize] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesCategory || !matchesSearch) return false;

      // Price filter
      if (filters.price.length > 0) {
        const price = Number(product.base_price || 0);
        const matchesPrice = filters.price.some(range => {
          if (range === 'lt500') return price < 500;
          if (range === '500-1000') return price >= 500 && price <= 1000;
          if (range === '1000-1500') return price > 1000 && price <= 1500;
          if (range === '1500-2000') return price > 1500 && price <= 2000;
          if (range === 'gt2000') return price > 2000;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // Color filter
      if (filters.color.length > 0) {
        const pColors = (product.colors || []).map(c => c.toLowerCase());
        const matchesColor = filters.color.some(c => pColors.includes(c.toLowerCase()));
        if (!matchesColor) return false;
      }

      // Size filter
      if (filters.size.length > 0) {
        const pSizes = product.sizes || [];
        const matchesSize = filters.size.some(s => pSizes.includes(s));
        if (!matchesSize) return false;
      }

      // Fit filter
      if (filters.fit.length > 0) {
        if (!filters.fit.includes(product.fit)) return false;
      }

      // Fabric filter
      if (filters.fabric.length > 0) {
        if (!filters.fabric.includes(product.fabric)) return false;
      }

      // Neck filter
      if (filters.neck.length > 0) {
        const pFeatures = product.features || [];
        const matches = filters.neck.some(n => pFeatures.includes(n));
        const matchesDefault = filters.neck.includes('Round Neck') && pFeatures.some((f: string) => f.toLowerCase().includes('round neck'));
        if (!matches && !matchesDefault) return false;
      }

      // Sleeve filter
      if (filters.sleeve.length > 0) {
        const pFeatures = product.features || [];
        const matches = filters.sleeve.some(s => pFeatures.includes(s));
        const matchesDefault = filters.sleeve.includes('Short Sleeves') && pFeatures.some((f: string) => f.toLowerCase().includes('short sleeve'));
        if (!matches && !matchesDefault) return false;
      }

      // Pattern filter
      if (filters.pattern.length > 0) {
        const pFeatures = product.features || [];
        const matches = filters.pattern.some(p => pFeatures.includes(p));
        const matchesPrinted = filters.pattern.includes('Printed') && pFeatures.some((f: string) => f.toLowerCase().includes('print'));
        const matchesSolid = filters.pattern.includes('Solid') && pFeatures.some((f: string) => f.toLowerCase().includes('solid'));
        if (!matches && !matchesPrinted && !matchesSolid) return false;
      }

      // Availability filter
      if (filters.availability.length > 0) {
        const isInStock = product.is_active;
        if (filters.availability.includes('in_stock') && !isInStock) return false;
        if (filters.availability.includes('out_stock') && isInStock) return false;
      }

      return true;
    });
  }, [products, category, search]);

  const getPrice = (product: Product) => {
    const value = Number(product.base_price);
    return Number.isFinite(value) ? value : 0;
  };

  const sortedProducts = useMemo(() => {
    const source = [...filteredProducts];
    if (sortMode === 'price_low_high') {
      return source.sort((a, b) => getPrice(a) - getPrice(b));
    }
    if (sortMode === 'price_high_low') {
      return source.sort((a, b) => getPrice(b) - getPrice(a));
    }
    return source;
  }, [filteredProducts, sortMode]);

  useEffect(() => {
    if (loadMoreTimerRef.current) {
      clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }
    setIsLoadingNextBatch(false);
    setNextBatchSize(PAGE_SIZE);
    setVisibleCount(PAGE_SIZE);
  }, [category, search, sortMode]);

  const hasMore = visibleCount < sortedProducts.length;
  const visibleProducts = sortedProducts.slice(0, visibleCount);

  useEffect(() => {
    if (!hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingNextBatch) {
          const remaining = sortedProducts.length - visibleCount;
          if (remaining <= 0) return;

          const batch = Math.min(PAGE_SIZE, remaining);
          setNextBatchSize(batch);
          setIsLoadingNextBatch(true);

          if (loadMoreTimerRef.current) {
            clearTimeout(loadMoreTimerRef.current);
          }

          loadMoreTimerRef.current = setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batch, sortedProducts.length));
            setIsLoadingNextBatch(false);
            setNextBatchSize(PAGE_SIZE);
          }, 250);
        }
      },
      { rootMargin: '220px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, sortedProducts.length, visibleCount, isLoadingNextBatch]);

  useEffect(() => {
    return () => {
      if (loadMoreTimerRef.current) {
        clearTimeout(loadMoreTimerRef.current);
      }
    };
  }, []);

  const activeCategoryLabel = CATEGORIES.find((cat) => cat.key === category)?.label || 'All';
  const hasActiveFilters = category !== 'all' || Boolean(search.trim());

  return (
    <div className="min-h-screen bg-void">
      <section className="relative overflow-hidden border-b border-border-std bg-void">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] sm:text-xs tracking-widest uppercase bg-cyan/5 px-2 py-1 w-fit border border-cyan/20 mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold font-display text-text-main uppercase glitch-text tracking-wider" data-text="Surf & Shop">
                Surf & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Shop</span>
              </h1>
              <p className="text-text-dim mt-3 text-[11px] sm:text-sm md:text-base font-mono border-l-2 border-border-std pl-3 uppercase tracking-widest">
                &gt; Browse blanks fast. Pick product. Start purchase.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="bg-panel/50 backdrop-blur-sm border border-cyan/30 p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan"></div>
                <Printer className="h-16 w-16 text-cyan/80 animate-pulse-fast" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border-std bg-panel/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
              <input
                type="text"
                placeholder="Search by product or category..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-border-std bg-void text-sm focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setCategory('all');
                  setSearch('');
                }}
                className="h-10 px-3 border border-border-std text-text-dim hover:text-text-main hover:border-cyan transition-colors font-mono text-[10px] uppercase tracking-widest flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`snap-start shrink-0 px-3 py-1.5 border text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all ${category === cat.key
                  ? 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'border-border-std text-text-dim hover:border-cyan/50 hover:text-text-main'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest">
            <span className="text-text-dim whitespace-nowrap">
              {sortedProducts.length} Items
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-cyan hidden sm:inline whitespace-nowrap">
                Category: {activeCategoryLabel}
              </span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="min-w-[150px] sm:min-w-[170px] bg-void border border-border-std text-text-main text-[10px] font-mono px-2 py-1.5 uppercase tracking-widest focus:border-cyan focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 bg-void">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full flex justify-end">
              <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="flex items-center gap-2 border border-border-std px-4 py-2 font-mono text-xs text-text-dim hover:text-cyan hover:border-cyan uppercase tracking-widest transition-colors bg-panel/50">
                <Filter className="w-4 h-4" /> Filters {Object.values(filters).some(arr => arr.length > 0) && '(Active)'}
              </button>
            </div>

            {/* Sidebar Filters */}
            <aside className={`lg:sticky lg:top-36 lg:h-[calc(100vh-160px)] z-40 lg:w-64 shrink-0 transition-all ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <GalleryFilters filters={filters} onFilterChange={setFilters} products={products || []} />
            </aside>

            {/* Product Grid */}
            <div className="flex-1 w-full min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-panel border border-border-std overflow-hidden animate-pulse">
                      <div className="aspect-square bg-panel-highlight" />
                      <div className="p-3 sm:p-4 space-y-2">
                        <div className="h-3.5 bg-panel-highlight rounded w-3/4" />
                        <div className="h-3 bg-panel-highlight rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {visibleProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/gallery/${product.id}`}
                        className="group bg-panel border border-border-std overflow-hidden hover:border-cyan/70 hover:shadow-[0_0_15px_rgba(0,240,255,0.12)] transition-all duration-300"
                      >
                        <div className="aspect-square bg-panel-highlight relative overflow-hidden">
                          <span className="absolute top-2 left-2 z-20 text-[9px] font-mono uppercase tracking-widest bg-void/80 border border-border-std px-1.5 py-0.5 text-text-dim">
                            {product.category}
                          </span>
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              unoptimized
                              className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ShoppingBag className="h-10 w-10 text-text-dim/30" />
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 sm:p-4">
                          <h3 className="font-bold text-[11px] sm:text-sm uppercase tracking-wide group-hover:text-cyan transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">
                              ₹{Number(product.base_price).toFixed(0)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono text-text-dim uppercase tracking-widest">
                              {(product.sizes || []).length} sizes
                            </span>
                          </div>

                          {(product.fabric || product.gsm) && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono text-text-dim uppercase tracking-widest">
                              {product.fabric && <span className="border border-border-std bg-void px-1.5 py-0.5">{product.fabric}</span>}
                              {product.gsm && <span className="border border-border-std bg-void px-1.5 py-0.5">{product.gsm} GSM</span>}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-1 min-h-[16px] sm:min-h-[20px]">
                            {(product.colors || []).slice(0, 4).map((color) => (
                              <span
                                key={color}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 border border-border-std"
                                style={{ backgroundColor: toCssColor(color) }}
                                title={color}
                              />
                            ))}
                            {(product.colors || []).length > 4 && (
                              <span className="text-[9px] sm:text-[10px] text-text-dim ml-1 font-mono">
                                +{product.colors.length - 4}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 sm:mt-3 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-cyan group-hover:text-text-main transition-colors">
                              Customize / Buy Plain
                              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {isLoadingNextBatch &&
                      Array.from({ length: nextBatchSize }).map((_, index) => (
                        <div key={`next-skeleton-${index}`} className="bg-panel border border-border-std overflow-hidden">
                          <div className="aspect-square skeleton" />
                          <div className="p-2.5 sm:p-4 space-y-2">
                            <div className="h-3.5 w-4/5 skeleton" />
                            <div className="h-3 w-3/5 skeleton" />
                            <div className="h-3 w-2/5 skeleton" />
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="pt-6 flex justify-center">
                    {hasMore ? (
                      <div ref={loadMoreRef} className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-cyan">
                        <Loader2 className={`h-4 w-4 ${isLoadingNextBatch ? 'animate-spin' : ''}`} />
                        {isLoadingNextBatch ? 'Loading More' : 'Scroll For More'}
                      </div>
                    ) : sortedProducts.length > PAGE_SIZE ? (
                      <div className="text-[10px] font-mono uppercase tracking-widest text-text-dim border border-border-std px-3 py-1.5">
                        You reached the end
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-panel border border-border-std">
                  <ShoppingBag className="h-10 w-10 text-text-dim/30 mx-auto mb-3" />
                  <h3 className="text-base font-semibold mb-2">No products found</h3>
                  <p className="text-text-dim text-sm mb-4">Try changing category, clearing filters, or search text.</p>
                  <Button
                    onClick={() => {
                      setCategory('all');
                      setSearch('');
                      setFilters(initialFilterState);
                    }}
                    className="rounded-none border border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-mono text-xs uppercase tracking-widest"
                  >
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 bg-magenta/5 border-t border-b border-border-std relative overflow-hidden">
        <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-5 text-center">
            <span className="text-lg sm:text-3xl text-magenta font-bold">*</span>
            <h2 className="text-base sm:text-2xl font-bold uppercase text-text-main font-mono tracking-[0.15em]">
              High Quality <span className="text-cyan">Offset Printing</span>
            </h2>
            <span className="text-lg sm:text-3xl text-magenta font-bold">*</span>
          </div>
        </div>
      </section>

      <section className="bg-void py-10 md:py-20 relative overflow-hidden border-b border-border-std">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-text-main border border-border-std bg-panel/50 backdrop-blur-md p-6 sm:p-10 md:p-14 relative">
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-cyan"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-magenta"></div>

            <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-display tracking-tight uppercase mb-3 sm:mb-4">
              Experience <span className="text-magenta">Superior Quality</span>
            </h2>
            <p className="text-cyan font-mono text-[10px] sm:text-xs uppercase tracking-widest mb-4 sm:mb-6 border-y border-cyan/20 py-2 inline-block">
              With our premium printing services
            </p>
            <p className="text-text-dim max-w-2xl mx-auto mb-8 text-xs sm:text-sm font-mono leading-relaxed">
              &gt; Build your brand with AI designs, ready templates, and custom uploads.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
              <Link href="/studio">
                <Button size="lg" className="rounded-none border border-cyan bg-cyan/10 text-cyan hover:bg-cyan hover:text-void font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all font-mono tracking-widest uppercase h-11 px-7">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Launch Studio
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="rounded-none border border-magenta text-magenta hover:bg-magenta hover:text-white font-bold transition-all font-mono tracking-widest uppercase h-11 px-7">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-panel py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-[0.03]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-1">
            <div className="flex flex-col border border-border-std p-4 sm:p-6 hover:border-cyan transition-colors group bg-void relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 border border-cyan/30 bg-cyan/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-cyan/20 transition-colors">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-cyan" />
              </div>
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-text-main mb-2 sm:mb-3">Bulk Order</h3>
              <p className="text-[11px] sm:text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">
                Order in bulk for events, teams, and brands.
              </p>
            </div>

            <div className="flex flex-col border border-border-std p-4 sm:p-6 hover:border-magenta transition-colors group bg-void relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-magenta/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 border border-magenta/30 bg-magenta/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-magenta/20 transition-colors">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-magenta" />
              </div>
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-text-main mb-2 sm:mb-3">Pan-India Shipping</h3>
              <p className="text-[11px] sm:text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">
                Fast shipping within 3-5 working days.
              </p>
            </div>

            <div className="flex flex-col border border-border-std p-4 sm:p-6 hover:border-cyan transition-colors group bg-void relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 border border-cyan/30 bg-cyan/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-cyan/20 transition-colors">
                <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-cyan" />
              </div>
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-text-main mb-2 sm:mb-3">Multiple Printing</h3>
              <p className="text-[11px] sm:text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">
                DTF, sublimation, and screen print options.
              </p>
            </div>

            <div className="flex flex-col border border-border-std p-4 sm:p-6 hover:border-magenta transition-colors group bg-void relative">
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-magenta/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 border border-magenta/30 bg-magenta/5 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-magenta/20 transition-colors">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-magenta" />
              </div>
              <h3 className="font-mono font-bold text-xs sm:text-sm uppercase text-text-main mb-2 sm:mb-3">AI Design Studio</h3>
              <p className="text-[11px] sm:text-xs text-text-dim border-l border-border-std pl-3 font-mono leading-relaxed">
                Generate or upload designs and buy instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
