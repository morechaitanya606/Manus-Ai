'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';

import { getSupabase } from '../../lib/supabase';
import { useProducts, type Product } from '../../hooks/use-products';
import { ArrowRight } from 'lucide-react';

type DropState = 'loading' | 'countdown' | 'live' | 'ended';

export default function ShopDropPage() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [dropDate, setDropDate] = useState<Date | null>(null);
    const [dropState, setDropState] = useState<DropState>('loading');

    const { data: products } = useProducts();

    useEffect(() => {
        setMounted(true);
        fetchDropDate();
    }, []);

    const fetchDropDate = async () => {
        const supabase = getSupabase();
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'shop_drop_date').single();

        if (data && data.value) {
            setDropDate(new Date(data.value));
        } else {
            // Fallback to a default string if not configured in admin yet
            const defaultDate = new Date();
            defaultDate.setMonth(2); // March 1st fallback
            defaultDate.setDate(1);
            defaultDate.setHours(0, 0, 0, 0);
            if (defaultDate.getTime() < new Date().getTime()) {
                defaultDate.setFullYear(defaultDate.getFullYear() + 1);
            }
            setDropDate(defaultDate);
        }
    };

    useEffect(() => {
        if (!dropDate) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = dropDate.getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now < target) {
                // Countdown
                setDropState('countdown');
                const difference = target - now;
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else if (now >= target && now < target + twentyFourHours) {
                // Live for 24 hours
                setDropState('live');
            } else {
                // Ended after 24 hours
                setDropState('ended');
            }
        };

        calculateTimeLeft(); // initialize immediately
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [dropDate]);

    if (!mounted) return null;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            // Optional: Insert into a newsletter/subscribers table
        }
    };

    const toCssColor = (colorName: string): string => {
        const c = colorName.toLowerCase().trim();
        const map: Record<string, string> = {
            navy: '#1B2A4A', red: '#8B1A1A', maroon: '#5C1010', olive: '#4B5320',
            black: '#111111', white: '#F5F5F5', grey: '#808080', gray: '#808080',
            charcoal: '#36454F', melange: '#BEBEBE', yellow: '#FFD700',
            green: '#228B22', blue: '#0000FF', royal: '#4169E1'
        };
        return map[c] || c;
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-void relative overflow-hidden flex flex-col items-center font-sans tracking-wide">
            {/* Elegant Background Mesh Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-magenta/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen fixed" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen fixed" />
            <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen fixed" />

            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.02] pointer-events-none fixed" />

            {/* Glowing noise overlay for texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay fixed" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            <div className={`w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center ${dropState === 'live' ? 'py-12' : 'justify-center min-h-[calc(100vh-4rem)]'}`}>

                {dropState === 'loading' && (
                    <div className="animate-pulse text-cyan font-mono text-sm tracking-widest uppercase">
                        Loading products...
                    </div>
                )}

                {/* --- COUNTDOWN STATE --- */}
                {dropState === 'countdown' && (
                    <div className="w-full flex flex-col items-center animate-fade-in">
                        <div className="text-center mb-16 max-w-2xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
                                <span className="text-xs uppercase tracking-[0.3em] text-text-main/80 font-medium">Limited Edition Run</span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-bold text-text-main tracking-tighter leading-tight drop-shadow-2xl">
                                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta">SPRING</span> DROP
                            </h1>

                            <p className="text-lg text-text-main/60 leading-relaxed font-light">
                                Our most awaited collection. Premium fabrics. Fresh designs.
                                Available from {dropDate?.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}.
                            </p>
                        </div>

                        {/* Glassmorphic Countdown Wrapper */}
                        <div className="relative w-full max-w-4xl mx-auto mb-20 p-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-white/0 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                {[
                                    { label: 'Days', value: timeLeft.days },
                                    { label: 'Hours', value: timeLeft.hours },
                                    { label: 'Minutes', value: timeLeft.minutes },
                                    { label: 'Seconds', value: timeLeft.seconds }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-8 md:p-12 relative bg-void/40 hover:bg-white/5 transition-colors duration-500 group">
                                        <span className="text-6xl md:text-8xl font-bold text-text-main tracking-tighter tabular-nums leading-none">
                                            {item.value.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-sm uppercase tracking-[0.2em] text-text-main/40 mt-6 font-medium group-hover:text-cyan transition-colors">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Input */}
                        <div className="w-full max-w-md mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan/30 to-magenta/30 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                            <form onSubmit={handleSubscribe} className="relative flex items-center bg-void border border-white/10 rounded-2xl overflow-hidden p-2 shadow-2xl">
                                <div className="pl-4 text-text-main/40">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder={subscribed ? "You're on the list!" : "Enter your email for updates..."}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={subscribed}
                                    required
                                    className="w-full bg-transparent border-none text-text-main px-4 py-3 placeholder:text-text-main/30 focus:outline-none disabled:opacity-50 font-light"
                                />
                                <button
                                    type="submit"
                                    disabled={subscribed}
                                    className={`px-8 py-3 rounded-xl font-medium tracking-wide transition-all duration-300 ${subscribed
                                        ? 'bg-white/10 text-text-main cursor-default'
                                        : 'bg-white text-void hover:bg-gray-100 hover:scale-[0.98]'
                                        }`}
                                >
                                    {subscribed ? 'Confirmed' : 'Notify'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- LIVE STATE --- */}
                {dropState === 'live' && (
                    <div className="w-full animate-fade-in flex flex-col items-center">
                        <div className="text-center mb-12 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 mb-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">SALE IS LIVE NOW</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-text-main tracking-tighter">
                                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta">SPRING</span> DROP
                            </h1>
                            <p className="text-text-main/60 font-light max-w-xl mx-auto">
                                This exclusive collection is available for 24 hours only. Grab your favourite before it's gone!
                            </p>
                        </div>

                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr">
                            {!products ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-lg border border-white/10" />
                                ))
                            ) : (
                                // For the drop, just show some products, ideally marked for the drop, or just display the whole catalog if custom drop products aren't filtered yet
                                products.slice(0, 12).map((product: Product) => (
                                    <Link key={product.id} href={`/gallery/${product.id}`} className="group flex flex-col h-full relative cursor-crosshair">
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5 border border-border-std group-hover:border-cyan/50 transition-colors duration-500 rounded-lg">
                                            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60 z-10" />
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-80 mix-blend-luminosity hover:mix-blend-normal"
                                            />
                                            {product.category && (
                                                <div className="absolute top-4 right-4 z-20">
                                                    <span className="inline-block border border-white/20 bg-void/80 backdrop-blur-md px-2 py-1 text-xs sm:text-xs font-mono uppercase tracking-[0.2em] text-text-main">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-col flex-grow relative z-20">
                                            <h3 className="text-lg sm:text-xl font-display font-medium text-text-main group-hover:text-cyan transition-colors leading-tight">
                                                {product.name}
                                            </h3>

                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">
                                                    ₹{Number(product.base_price).toFixed(0)}
                                                </span>
                                                <span className="text-xs sm:text-[10px] font-mono text-text-main/60 uppercase tracking-widest">
                                                    {(product.sizes || []).length} sizes
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-center gap-1 min-h-[16px] sm:min-h-[20px]">
                                                {(product.colors || []).slice(0, 4).map((color: string) => (
                                                    <span
                                                        key={color}
                                                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 border border-border-std rounded-full"
                                                        style={{ backgroundColor: toCssColor(color) }}
                                                        title={color}
                                                    />
                                                ))}
                                                {(product.colors || []).length > 4 && (
                                                    <span className="text-[11px] sm:text-[10px] text-text-main/60 ml-1 font-mono">
                                                        +{product.colors.length - 4}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-4 sm:mt-5 flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                                                <span className="inline-flex items-center gap-1 text-xs sm:text-[11px] font-mono uppercase tracking-widest text-text-main/50 group-hover:text-text-main transition-colors">
                                                    View Details
                                                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- ENDED STATE --- */}
                {dropState === 'ended' && (
                    <div className="w-full flex flex-col items-center animate-fade-in text-center max-w-2xl mx-auto">
                        <div className="h-24 w-24 border border-white/10 bg-white/5 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            <ArrowLeft className="h-8 w-8 text-text-main/40" />
                        </div>
                        <h1 className="text-5xl font-bold text-text-main tracking-tighter mb-4">
                            THE DROP HAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-magenta to-white">ENDED</span>
                        </h1>
                        <p className="text-text-main/60 font-light mb-12">
                            This exclusive sale has ended.
                            Don't worry — check out our regular collection or wait for the next sale!
                        </p>

                        <Link href="/products" className="px-8 py-4 bg-white text-void font-bold font-mono tracking-widest uppercase hover:bg-gray-200 hover:scale-[0.98] transition-all duration-300 rounded-lg">
                            Browse All Products
                        </Link>
                    </div>
                )}

                {/* Footer Link (Show on countdown & ended, optional on live) */}
                {dropState !== 'live' && (
                    <div className="mt-24 pt-8 border-t border-white/5 w-full text-center">
                        <Link href="/products" className="inline-flex items-center gap-2 text-text-main/50 hover:text-text-main transition-colors group text-sm font-medium tracking-wide">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return to All Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
