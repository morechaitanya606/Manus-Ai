'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth-store';
import { Button } from '../../../components/ui/button';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const { signUpWithEmail, signInWithGoogle, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const { error } = await signUpWithEmail(email, password, { full_name: fullName });
        if (error) {
            setError(error);
        } else {
            setSuccess(true);
        }
    };

    const handleGoogle = async () => {
        const { error } = await signInWithGoogle();
        if (error) setError(error);
    };

    if (success) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4 bg-void relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="w-full max-w-md text-center animate-fade-in relative z-10 bg-panel border-2 border-cyan p-8 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan"></div>

                    <div className="inline-flex items-center justify-center h-16 w-16 bg-cyan/10 border border-cyan mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                        <Mail className="h-8 w-8 text-cyan" />
                    </div>
                    <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase mb-2">VERIFICATION REQUIRED</h1>
                    <p className="text-[10px] font-mono tracking-widest text-text-dim mb-8 uppercase leading-relaxed">
                        &gt; We&apos;ve sent an email to <strong>{email}</strong>.<br />
                        &gt; Please verify your email to continue.
                    </p>
                    <Link href="/login">
                        <Button className="w-full rounded-none border border-cyan bg-cyan/10 text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void transition-colors animate-pulse-fast">
                            RETURN TO LOGIN
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 bg-void relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center h-14 w-14 border border-cyan bg-cyan/10 mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                        <User className="h-6 w-6 text-cyan" />
                    </div>
                    <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-white">CREATE ACCOUNT</h1>
                    <p className="text-[10px] font-mono tracking-widest text-cyan mt-2 uppercase">
                        &gt; Join the platform
                    </p>
                </div>

                {/* Form */}
                <div className="bg-panel border border-border-std p-8 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-slide-up">
                    {/* Cyberpunk corners */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/50 -translate-x-[2px] -translate-y-[2px]"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan/50 translate-x-[2px] -translate-y-[2px]"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan/50 -translate-x-[2px] translate-y-[2px]"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan/50 translate-x-[2px] translate-y-[2px]"></div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 text-[10px] font-mono tracking-widest uppercase">
                            ERR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">FULL NAME</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="> JOHN DOE"
                                    required
                                    className="w-full pl-3 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors uppercase placeholder:normal-case placeholder:text-text-dim/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">EMAIL ADDRESS</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="> user@example.com"
                                    required
                                    className="w-full pl-3 pr-4 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors uppercase placeholder:normal-case placeholder:text-text-dim/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-2">PASSWORD</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="> •••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-3 pr-10 py-3 bg-void border border-border-std font-mono text-xs text-white focus:outline-none focus:border-cyan focus:ring-0 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-cyan transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[9px] font-mono tracking-widest text-text-dim mt-2 uppercase">&gt; MINIMUM 6 CHARACTERS</p>
                        </div>

                        <Button type="submit" className="w-full py-4 mt-2 rounded-none bg-cyan/10 border border-cyan text-cyan font-mono font-bold tracking-widest uppercase hover:bg-cyan hover:text-void animate-in transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50" disabled={loading}>
                            {loading ? 'SIGNING UP...' : 'SIGN UP'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-std border-dashed" />
                        </div>
                        <div className="relative flex justify-center text-[9px] font-mono tracking-widest uppercase">
                            <span className="bg-panel px-3 text-text-dim">QUICK SIGN UP</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 py-3 border border-border-std bg-void hover:border-text-dim transition-colors text-xs font-mono font-bold uppercase tracking-widest text-text-dim hover:text-white"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        SIGN UP WITH GOOGLE
                    </button>

                    <p className="mt-8 text-center text-[10px] font-mono tracking-widest uppercase text-text-dim">
                        ALREADY HAVE AN ACCOUNT?{' '}
                        <Link href="/login" className="font-bold text-cyan hover:text-magenta transition-colors">
                            SIGN IN
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
