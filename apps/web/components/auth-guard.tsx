'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth-store';

export function AuthGuard({
    children,
    requireAdmin = false,
}: {
    children: React.ReactNode;
    requireAdmin?: boolean;
}) {
    const router = useRouter();
    const { session, profile, loading, initialized } = useAuthStore();

    useEffect(() => {
        if (!initialized || loading) return;

        if (!session) {
            router.push('/login');
            return;
        }

        if (requireAdmin && profile?.role !== 'admin') {
            router.push('/');
            return;
        }
    }, [session, profile, loading, initialized, requireAdmin, router]);

    if (!initialized || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) return null;
    if (requireAdmin && profile?.role !== 'admin') return null;

    return <>{children}</>;
}
