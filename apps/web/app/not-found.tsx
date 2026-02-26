import Link from 'next/link';
import { Terminal, ArrowRight } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-void relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />

            <div className="relative z-10 text-center max-w-lg px-6">
                <div className="inline-flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-3 py-1.5 mb-6">
                    <Terminal className="h-4 w-4 text-red-500" />
                    <span className="font-mono text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        ERR_404 // PAGE_NOT_FOUND
                    </span>
                </div>

                <h1 className="text-7xl md:text-9xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta tracking-tighter mb-4">
                    404
                </h1>

                <p className="text-text-dim font-mono text-sm mb-8 border-l-2 border-border-std pl-4 text-left">
                    &gt; The page you are looking for does not exist or has been moved to another location.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-cyan text-cyan font-mono text-xs hover:bg-cyan hover:text-void transition-colors uppercase font-bold tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    >
                        Go Home
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-magenta text-magenta font-mono text-xs hover:bg-magenta hover:text-white transition-colors uppercase font-bold tracking-widest"
                    >
                        Browse Gallery
                    </Link>
                </div>

                <div className="mt-10 font-mono text-[8px] text-text-dim uppercase tracking-[0.4em]">
                    EVERYDAYDROP_V4.2 // SYSTEM_ONLINE
                </div>
            </div>
        </div>
    );
}
