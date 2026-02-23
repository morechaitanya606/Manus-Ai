import React from 'react';

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-void text-text-main py-16 font-mono relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay z-50 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-12 border-b border-border-std pb-6">
                    <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest mb-2">Shipping Policy</h1>
                    <p className="text-cyan text-sm tracking-widest uppercase">&gt; Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-text-dim">
                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">1. Order Processing Time</h2>
                        <p>All items at The Quote Shop are custom-printed on demand just for you. Please allow <strong>2 to 4 business days</strong> for your order to be printed, quality-checked, and packaged before it is handed over to our shipping carriers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">2. Shipping Timelines</h2>
                        <p>Once your order has been processed and dispatched from our printing facility in Pune, typical delivery times are as follows:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-dim">
                            <li><strong>Metro Cities (India):</strong> 2 to 4 business days.</li>
                            <li><strong>Rest of India:</strong> 4 to 7 business days.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">3. Shipping Rates</h2>
                        <p>We charge a flat rate of ₹99 for shipping across India. Occasionally, we offer free shipping promotions on orders above a certain value, which will be clearly indicated at checkout.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">4. Tracking Your Order</h2>
                        <p>As soon as your order ships, you will receive an email containing a tracking number and a link to trace your package&apos;s journey until it reaches your doorstep.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">5. Delays & Issues</h2>
                        <p>While we strive to ensure timely delivery, unpredictable weather, natural disasters, or logistical issues with courier services may occasionally cause delays. If your order is significantly delayed or lost in transit, please reach out to us at contact@thequoteshop.in with your Order ID.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
