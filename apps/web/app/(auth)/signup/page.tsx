'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { toast } from '../../../components/ui/toast';
import { Sparkles } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const auth = useAuthStore();
    const [form, setForm] = useState({
        tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'manusai',
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.displayName.trim()) errs.displayName = 'Name is required';
        if (!form.email.trim()) errs.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
        if (form.password.length < 8) errs.password = 'Min 8 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const response = await apiFetch<{
                success: boolean;
                data: {
                    accessToken: string;
                    refreshToken: string;
                    user: { id: string; email: string; role: string; tenantId: string; displayName?: string };
                };
            }>('/auth/signup', {
                method: 'POST',
                body: {
                    tenantSlug: form.tenantSlug,
                    email: form.email,
                    password: form.password,
                    displayName: form.displayName,
                },
            });

            auth.setSession(response.data);
            toast('success', 'Welcome!', 'Your account has been created.');
            router.push('/products');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            toast('error', 'Signup Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="mx-auto max-w-md animate-fade-in">
            <Card className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <h1 className="text-2xl font-display font-bold">Create Your Account</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Start creating AI-powered fashion designs
                    </p>
                </div>

                <form className="space-y-4" onSubmit={onSubmit}>
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={form.displayName}
                        onChange={update('displayName')}
                        error={errors.displayName}
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update('email')}
                        error={errors.email}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={update('password')}
                        error={errors.password}
                        helperText="Minimum 8 characters"
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={update('confirmPassword')}
                        error={errors.confirmPassword}
                    />
                    <Button type="submit" className="w-full" size="lg" loading={loading}>
                        Create Account
                    </Button>
                </form>

                <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    );
}
