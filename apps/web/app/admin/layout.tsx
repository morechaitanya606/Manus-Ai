'use client';

import { useAuthStore } from '../../stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, initialized } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (initialized && !isAdmin()) {
            router.push('/');
        }
    }, [initialized, isAdmin, router]);

    if (!initialized || !isAdmin()) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-void">
                <Loader2 className="h-8 w-8 animate-spin text-cyan" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-void">
            {children}
        </div>
    );
}
