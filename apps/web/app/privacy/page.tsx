import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-void text-text-main py-16 font-mono relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay z-50 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-12 border-b border-border-std pb-6">
                    <h1 className="text-4xl font-display font-bold text-white uppercase tracking-widest mb-2">Privacy Policy</h1>
                    <p className="text-cyan text-sm tracking-widest uppercase">&gt; Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-text-dim">
                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">1. Information We Collect</h2>
                        <p>We collect information to provide better services to our users. When you use EVERYDAYDROP, we collect the following types of information: personal identification information (Name, Email address, Phone number, Shipping Address) when you register for an account or place an order. We also collect the images and text prompts you provide to generate designs.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">2. How We Use Your Information</h2>
                        <p>The information we collect is used in the following ways:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-dim">
                            <li>To process and fulfill your orders, including printing and shipping.</li>
                            <li>To manage your account and provide customer support.</li>
                            <li>To process payments securely via our payment gateway partners (e.g., Razorpay).</li>
                            <li>To improve our AI generation models (your public designs may be displayed in the Community Gallery).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">3. Data Security</h2>
                        <p>We are committed to securing your data and keeping it confidential. We secure your personal data from unauthorized access, use, or disclosure. We use industry-standard encryption algorithms and secure HTTP protocols to protect communications.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">4. Third-Party Services</h2>
                        <p>We may employ third-party companies and individuals due to the following reasons: to facilitate our Service; to provide the Service on our behalf; to perform Service-related services; or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white uppercase mb-4 border-l-2 border-cyan pl-3">5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at contact@everydaydrop.in or via phone at +91 70284 78109.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
