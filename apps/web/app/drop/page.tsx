'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';

// Define the target date outside the component to prevent recreation on every render
// This fixes the Maximum Update Depth Exceeded error in React
const targetDate = new Date();
targetDate.setMonth(2); // March is month 2 (0-indexed)
targetDate.setDate(1);
targetDate.setHours(0, 0, 0, 0);

if (targetDate.getTime() < new Date().getTime()) {
    targetDate.setFullYear(targetDate.getFullYear() + 1);
}

export default function DropPage() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const calculateTimeLeft = () => {
            const difference = targetDate.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        calculateTimeLeft(); // initialize immediately
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch for the clock

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-void relative overflow-hidden flex flex-col items-center justify-center font-sans">
            {/* Elegant Background Mesh Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-magenta/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-white/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.02] pointer-events-none" />

            {/* Glowing noise overlay for texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            <div className="w-full max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Header Sequence */}
                <div className="text-center mb-16 max-w-2xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
                        <span className="text-xs uppercase tracking-[0.3em] text-text-main/80 font-medium">Limited Edition Run</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold text-text-main tracking-tighter leading-tight drop-shadow-2xl">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta">SPRING</span> DROP
                    </h1>

                    <p className="text-lg text-text-main/60 leading-relaxed font-light">
                        Our most highly anticipated garments. Premium fabrics. Unseen iterations.
                        Unlocking exactly at the strike of midnight on March 1st.
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
                            placeholder={subscribed ? "You're on the list!" : "Enter email for early access..."}
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

                {/* Footer Link */}
                <div className="mt-24 pt-8 border-t border-white/5 w-full text-center">
                    <Link href="/products" className="inline-flex items-center gap-2 text-text-main/50 hover:text-text-main transition-colors group text-sm font-medium tracking-wide">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Standard Collections
                    </Link>
                </div>
            </div>
        </div>
    );
}
