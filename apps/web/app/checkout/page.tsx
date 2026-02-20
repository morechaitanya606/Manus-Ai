'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api-client';
import { AuthGuard } from '../../components/auth-guard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../components/ui/toast';
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react';

function CheckoutContent() {
    const router = useRouter();
    const [address, setAddress] = useState({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!address.name.trim()) errs.name = 'Name is required';
        if (!address.phone.trim()) errs.phone = 'Phone is required';
        if (!address.line1.trim()) errs.line1 = 'Address is required';
        if (!address.city.trim()) errs.city = 'City is required';
        if (!address.state.trim()) errs.state = 'State is required';
        if (!address.postalCode.trim()) errs.postalCode = 'Postal code is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const checkout = useMutation({
        mutationFn: async () => {
            const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const res = await apiFetch<{
                success: boolean;
                data: {
                    orderId: string;
                    orderNumber: string;
                    amount: number;
                    paymentIntentId: string;
                    clientSecret: string;
                    paymentMode: string;
                };
            }>('/orders/checkout', {
                method: 'POST',
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
                body: {
                    storeId: 'default',
                    taxRate: 0.08,
                    shippingAddress: address,
                    idempotencyKey,
                },
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast('success', 'Order Placed!', `Order ${data.orderNumber} created.`);
            if (data.paymentMode === 'test') {
                toast('info', 'Test Mode', 'Payment processed in test mode.');
            }
            router.push(`/orders/${data.orderId}`);
        },
        onError: (err) => {
            toast('error', 'Checkout Failed', err instanceof Error ? err.message : 'Something went wrong');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        checkout.mutate();
    };

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setAddress((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Shipping Form */}
            <div className="space-y-6">
                <Card className="space-y-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <h2 className="text-lg font-semibold">Shipping Address</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Full Name" placeholder="John Doe" value={address.name} onChange={update('name')} error={errors.name} />
                        <Input label="Phone" placeholder="+1 (555) 123-4567" value={address.phone} onChange={update('phone')} error={errors.phone} />
                    </div>
                    <Input label="Address Line 1" placeholder="123 Main St" value={address.line1} onChange={update('line1')} error={errors.line1} />
                    <Input label="Address Line 2 (optional)" placeholder="Apt 4B" value={address.line2} onChange={update('line2')} />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Input label="City" placeholder="New York" value={address.city} onChange={update('city')} error={errors.city} />
                        <Input label="State" placeholder="NY" value={address.state} onChange={update('state')} error={errors.state} />
                        <Input label="Postal Code" placeholder="10001" value={address.postalCode} onChange={update('postalCode')} error={errors.postalCode} />
                    </div>
                </Card>
            </div>

            {/* Payment Summary */}
            <div>
                <Card variant="elevated" className="sticky top-24 space-y-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
                        <h2 className="text-lg font-semibold">Payment</h2>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4 text-center space-y-2">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Payment is handled securely via Stripe
                        </p>
                        <div className="flex items-center justify-center gap-1 text-xs text-[hsl(var(--success))]">
                            <ShieldCheck className="h-4 w-4" />
                            Secure & encrypted
                        </div>
                    </div>
                    <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        loading={checkout.isPending}
                    >
                        <CreditCard className="h-5 w-5" />
                        Place Order
                    </Button>
                    <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                        By placing your order you agree to our terms.
                    </p>
                </Card>
            </div>
        </form>
    );
}

export default function CheckoutPage() {
    return (
        <AuthGuard>
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-3xl font-display font-bold">Checkout</h1>
                <CheckoutContent />
            </div>
        </AuthGuard>
    );
}
