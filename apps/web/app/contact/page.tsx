'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2, MessageCircle, Instagram, Terminal } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        await new Promise(r => setTimeout(r, 1500));
        setSending(false);
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-void">
            {/* Hero */}
            <section className="relative overflow-hidden bg-void border-b border-border-std">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/5 px-3 py-1.5 mb-6">
                        <Terminal className="h-4 w-4 text-cyan" />
                        <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-widest">CONTACT_US //</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-white uppercase tracking-tighter">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-magenta">Touch</span>
                    </h1>
                    <p className="mt-6 text-text-dim max-w-2xl mx-auto font-mono text-sm">
                        &gt; Have a question about custom printing, bulk orders, or just want to say hi? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-20 bg-void">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-wider">Contact Information</h2>
                            <p className="text-sm text-text-dim font-mono">
                                &gt; Reach out to us for custom orders, bulk pricing, partnerships, or any questions.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 border border-border-std bg-panel hover:border-cyan transition-colors">
                                    <div className="h-10 w-10 border border-cyan/30 bg-cyan/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5 text-cyan" />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-white text-sm uppercase">Email</p>
                                        <a href="mailto:contact@everydaydrop.in" className="text-sm text-cyan hover:underline font-mono">contact@everydaydrop.in</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 border border-border-std bg-panel hover:border-cyan transition-colors">
                                    <div className="h-10 w-10 border border-cyan/30 bg-cyan/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-5 w-5 text-cyan" />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-white text-sm uppercase">Phone / WhatsApp</p>
                                        <a href="tel:+917028478109" className="text-sm text-cyan hover:underline font-mono">+91 70284 78109</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 border border-border-std bg-panel hover:border-cyan transition-colors">
                                    <div className="h-10 w-10 border border-cyan/30 bg-cyan/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-cyan" />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-white text-sm uppercase">Address</p>
                                        <p className="text-sm text-text-dim font-mono">Pune, Maharashtra, India</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 border border-border-std bg-panel hover:border-cyan transition-colors">
                                    <div className="h-10 w-10 border border-cyan/30 bg-cyan/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-5 w-5 text-cyan" />
                                    </div>
                                    <div>
                                        <p className="font-mono font-bold text-white text-sm uppercase">Office Hours</p>
                                        <p className="text-sm text-text-dim font-mono">10 AM to 7 PM (Mon to Sat)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <p className="font-mono font-bold text-white text-sm mb-3 uppercase tracking-widest">Follow Us</p>
                                <div className="flex gap-3">
                                    <a href="#" className="h-10 w-10 border border-border-std bg-panel flex items-center justify-center hover:bg-cyan/10 hover:text-cyan hover:border-cyan transition-colors">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="h-10 w-10 border border-border-std bg-panel flex items-center justify-center hover:bg-cyan/10 hover:text-cyan hover:border-cyan transition-colors">
                                        <MessageCircle className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3 bg-panel border border-border-std p-8 relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-magenta"></div>

                            {sent ? (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="text-5xl mb-4">✅</div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase">Message Sent!</h3>
                                    <p className="text-sm text-text-dim mb-6 font-mono">
                                        &gt; We&apos;ll get back to you within 24 hours.
                                    </p>
                                    <button onClick={() => setSent(false)} className="px-6 py-2 border border-cyan text-cyan font-mono text-xs hover:bg-cyan hover:text-void transition-colors uppercase font-bold tracking-widest">
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-wider">Send us a Message</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-cyan uppercase tracking-widest mb-1.5">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Your name"
                                                className="w-full px-4 py-2.5 border border-border-std bg-void text-sm font-mono focus:outline-none focus:border-cyan transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono text-cyan uppercase tracking-widest mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-2.5 border border-border-std bg-void text-sm font-mono focus:outline-none focus:border-cyan transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-cyan uppercase tracking-widest mb-1.5">Subject</label>
                                        <select
                                            value={form.subject}
                                            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-border-std bg-void text-sm font-mono focus:outline-none focus:border-cyan"
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="order">Order Issue</option>
                                            <option value="bulk">Bulk / Corporate Order</option>
                                            <option value="custom">Custom Product Request</option>
                                            <option value="partnership">Partnership / Collaboration</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-cyan uppercase tracking-widest mb-1.5">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Tell us how we can help..."
                                            className="w-full px-4 py-2.5 border border-border-std bg-void text-sm font-mono focus:outline-none focus:border-cyan transition-colors resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void disabled:opacity-50 font-mono text-xs font-bold py-3 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="h-64 bg-panel border-t border-border-std flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]" />
                <div className="text-center relative z-10">
                    <MapPin className="h-8 w-8 text-cyan mx-auto mb-2" />
                    <p className="text-sm text-text-dim font-mono">Pune, Maharashtra, India</p>
                    <p className="text-xs text-text-dim font-mono mt-1">🇮🇳 Made in India with ❤️</p>
                </div>
            </section>
        </div>
    );
}
