'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Mail, Phone, MapPin, Clock, Send, Loader2, MessageCircle, Instagram } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate send
        await new Promise(r => setTimeout(r, 1500));
        setSending(false);
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-display">
                        Get In <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="mt-6 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                        Have a question about custom printing, bulk orders, or just want to say hi? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-20 bg-[hsl(var(--card))]">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Contact Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold">Contact Information</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Reach out to us for custom orders, bulk pricing, partnerships, or any questions.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Email</p>
                                        <a href="mailto:contact@thequoteshop.in" className="text-sm text-[hsl(var(--primary))] hover:underline">contact@thequoteshop.in</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Phone / WhatsApp</p>
                                        <a href="tel:+917028478109" className="text-sm text-[hsl(var(--primary))] hover:underline">+91 70284 78109</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Address</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Pune, Maharashtra, India</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                    <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Office Hours</p>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">10 AM to 7 PM (Mon to Sat)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <p className="font-medium text-sm mb-3">Follow Us</p>
                                <div className="flex gap-3">
                                    <a href="#" className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] transition">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] transition">
                                        <MessageCircle className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3 bg-[hsl(var(--muted))] rounded-2xl p-8">
                            {sent ? (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="text-5xl mb-4">✅</div>
                                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                                        We&apos;ll get back to you within 24 hours.
                                    </p>
                                    <Button variant="outline" onClick={() => setSent(false)} className="rounded-xl">
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <h3 className="text-xl font-bold mb-2">Send us a Message</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Your name"
                                                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                                        <select
                                            value={form.subject}
                                            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
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
                                        <label className="block text-sm font-medium mb-1.5">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Tell us how we can help..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition resize-none"
                                        />
                                    </div>
                                    <Button variant="gradient" size="lg" className="rounded-xl w-full" disabled={sending}>
                                        {sending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="h-64 bg-gradient-to-r from-[hsl(var(--primary)/0.05)] to-[hsl(var(--accent)/0.05)] flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="h-8 w-8 text-[hsl(var(--primary))] mx-auto mb-2" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Pune, Maharashtra, India</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">🇮🇳 Made in India with ❤️</p>
                </div>
            </section>
        </div>
    );
}
