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

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const [form, setForm] = useState({
    tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || 'manusai',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast('warning', 'Missing Fields', 'Please fill in email and password.');
      return;
    }
    setLoading(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          accessToken: string;
          refreshToken: string;
          user: { id: string; email: string; role: string; tenantId: string; displayName?: string };
        };
      }>('/auth/login', {
        method: 'POST',
        body: { tenantSlug: form.tenantSlug, email: form.email, password: form.password },
      });

      auth.setSession(response.data);
      toast('success', 'Welcome back!', `Signed in as ${response.data.user.email}`);
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast('error', 'Login Failed', message);
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
          <h1 className="text-2xl font-display font-bold">Welcome Back</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Sign in to your store</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Tenant"
            placeholder="Your store slug"
            value={form.tenantSlug}
            onChange={update('tenantSlug')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[hsl(var(--primary))] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
