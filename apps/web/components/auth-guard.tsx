'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth-store';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRoles, fallback }: AuthGuardProps) {
    const router = useRouter();
    const { accessToken, user } = useAuthStore();

    useEffect(() => {
        if (!accessToken) {
            router.replace('/login');
        }
    }, [accessToken, router]);

    if (!accessToken || !user) {
        return fallback ? <>{fallback}</> : (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Redirecting to login...</span>
                </div>
            </div>
        );
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">Access Denied</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
