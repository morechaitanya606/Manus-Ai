import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-void text-text-main py-16 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay z-50 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-12 border-b border-border-std pb-6">
                    <h1 className="text-4xl font-display font-bold text-text-main uppercase tracking-widest mb-2">Terms & Conditions</h1>
                    <p className="text-cyan text-sm tracking-widest uppercase">&gt; Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-text-dim">
                    <section>
                        <h2 className="text-xl font-bold text-text-main uppercase mb-4 border-l-2 border-cyan pl-3">1. Acceptance of Terms</h2>
                        <p>By accessing and using EVERYDAYDROP, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-main uppercase mb-4 border-l-2 border-cyan pl-3">2. AI Generation & Content Policy</h2>
                        <p>Our platform allows you to generate images using Artificial Intelligence. You agree not to formulate prompts or use our services to create:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-dim">
                            <li>Illegal, harmful, or sexually explicit content.</li>
                            <li>Content that infringes on third-party intellectual property or copyrights.</li>
                            <li>Hate speech or discriminatory designs.</li>
                        </ul>
                        <p className="mt-2">EVERYDAYDROP reserves the right to cancel orders or terminate accounts that violate this policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-main uppercase mb-4 border-l-2 border-cyan pl-3">3. Payments & AI Credits</h2>
                        <p>We use Razorpay as our secure payment gateway for physical merchandise and AI Credit pack purchases. AI credits purchased are non-refundable once consumed to generate an image. Your payment details are never stored on our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-main uppercase mb-4 border-l-2 border-cyan pl-3">4. Intellectual Property</h2>
                        <p>You retain full rights and ownership over any original designs you upload to our platform. For AI-generated images, you are licensed to use them freely for commercial and non-commercial purposes when printed via our fulfillment network. However, public designs may be featured in our Community Gallery.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-main uppercase mb-4 border-l-2 border-cyan pl-3">5. Modification of Terms</h2>
                        <p>We reserve the right to update these terms at any time. Continued use of the platform after modifications constitutes your acceptance of the new terms.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
