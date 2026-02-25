import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-void relative">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 text-cyan animate-spin" />
                <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest animate-pulse">
                    Loading...
                </span>
            </div>
        </div>
    );
}
