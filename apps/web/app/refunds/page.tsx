import React from 'react';

export default function RefundsPage() {
    return (
        <div className="min-h-screen bg-void text-text-main py-16 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay z-50 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-12 border-b border-border-std pb-6">
                    <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest mb-2">Refund & Cancellation Policy</h1>
                    <p className="text-cyan text-sm tracking-widest uppercase">&gt; Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-text-dim">
                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">1. Custom Made Orders</h2>
                        <p>At EVERYDAYDROP, every product is custom-printed exactly to the specifications and designs you provide at checkout. Because each order is uniquely created for you, <strong>we do not accept returns or exchanges for correctly fulfilled orders</strong>. This includes issues such as ordering the wrong size, color, or disliking the design after printing.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">2. Damaged or Defective Items</h2>
                        <p>If you receive a product that is damaged, misprinted, or defective, we take full responsibility. To be eligible for a replacement or refund:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-dim">
                            <li>You must contact us within <strong>7 days</strong> of the product delivery date.</li>
                            <li>Please provide clear photos of the issue along with your Order ID via email at contact@everydaydrop.in.</li>
                            <li>Upon verification, we will send a free replacement or issue a full refund to your original payment method.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">3. Cancellations</h2>
                        <p>Once an order is placed, it is sent to our printing queue almost immediately to ensure fast shipping times. Therefore, cancellations can only be requested within <strong>2 hours</strong> of placing the order. If the printing process has already begun, the order cannot be canceled.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">4. AI Credits</h2>
                        <p>Purchases of digital AI Credits are final and non-refundable. If you experience technical difficulties processing a generation request that consumes a credit without yielding a result, please contact support for an account credit adjustment.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">5. Processing Refunds</h2>
                        <p>Approved refunds are processed immediately on our end via Razorpay to your original method of payment. Please note that it may take your bank or credit card company 5-7 business days to officially post the refund to your account.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
