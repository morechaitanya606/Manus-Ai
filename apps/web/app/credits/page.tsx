'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { handleCreditPurchase } from '../../lib/razorpay-credits';
import { CREDIT_PACKAGES } from '../../config/credits';
import { Button } from '../../components/ui/button';
import { Sparkles, CheckCircle2, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function CreditsPage() {
    const { session, profile } = useAuthStore();
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleBuy = async (pkg: typeof CREDIT_PACKAGES[0]) => {
        if (!session?.user?.id) {
            toast.error('Please sign in to purchase credits.');
            return;
        }

        setProcessingId(pkg.id);

        try {
            await handleCreditPurchase(
                pkg,
                session.user.id,
                () => {
                    toast.success(`Successfully added ${pkg.credits} credits!`);
                    // Invalidate profile query to refetch credits
                    queryClient.invalidateQueries({ queryKey: ['profile'] });
                    setProcessingId(null);
                },
                (err) => {
                    toast.error(err);
                    setProcessingId(null);
                }
            );
        } catch (error) {
            console.error('Purchase failed', error);
            toast.error('An unexpected error occurred.');
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-void py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <Link href="/studio" className="inline-flex items-center text-sm font-medium text-text-dim hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Studio
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-none border border-border-std border-dashed mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
                        Supercharge Your Creativity
                    </h1>
                    <p className="text-xl text-text-dim max-w-2xl mx-auto">
                        Get more AI credits to continue generating stunning, print-ready designs for your products.
                    </p>

                    {profile && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-panel border border-border-std rounded-none border border-border-std border-dashed px-6 py-2 shadow-sm">
                            <span className="text-sm font-medium text-text-dim">Current Balance:</span>
                            <span className="text-lg font-bold text-white flex items-center">
                                <Zap className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                                {profile.ai_credits} Credits
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {CREDIT_PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative flex flex-col p-8 rounded-3xl bg-panel border-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] ${pkg.popular
                                    ? 'border-purple-500 shadow-purple-500/20 scale-105 z-10'
                                    : 'border-border-std hover:border-[hsl(var(--primary)/0.5)]'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-none border border-border-std border-dashed">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                                    ₹{pkg.price}
                                </div>
                            </div>

                            <div className="flex-1">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                                        <span className="text-lg font-semibold text-white">{pkg.credits} AI Generations</span>
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                                        <span className="text-text-dim">Commercial Use Rights</span>
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                                        <span className="text-text-dim">Never Expires</span>
                                    </li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => handleBuy(pkg)}
                                disabled={processingId !== null}
                                variant={pkg.popular ? 'gradient' : 'outline'}
                                className={`w-full py-6 text-lg ${pkg.popular ? 'shadow-[0_0_10px_rgba(0,240,255,0.1)] shadow-purple-500/30' : ''}`}
                            >
                                {processingId === pkg.id ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    `Buy ${pkg.credits} Credits`
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
