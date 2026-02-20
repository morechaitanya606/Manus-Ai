'use client';

import Link from 'next/link';
import { useAuthStore } from '../../stores/auth-store';
import { AuthGuard } from '../../components/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    User,
    Mail,
    Shield,
    Sparkles,
    ShoppingBag,
    Palette,
    Images,
    Settings,
    ChevronRight,
} from 'lucide-react';

const QUICK_LINKS = [
    { href: '/my-designs', label: 'My Designs', description: 'View your AI-generated designs', icon: Sparkles, color: 'hsl(var(--primary))' },
    { href: '/orders', label: 'My Orders', description: 'Track your orders and shipments', icon: ShoppingBag, color: 'hsl(var(--chart-1))' },
    { href: '/studio', label: 'Design Studio', description: 'Create a new AI design', icon: Palette, color: 'hsl(var(--chart-2))' },
    { href: '/gallery', label: 'Browse Gallery', description: 'Explore 1000+ ready designs', icon: Images, color: 'hsl(var(--chart-3))' },
];

function ProfileContent() {
    const { user } = useAuthStore();

    const roleBadgeVariant = (role?: string) => {
        switch (role) {
            case 'PLATFORM_ADMIN': return 'destructive';
            case 'STORE_OWNER': return 'info';
            case 'STORE_MANAGER': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
                    <User className="h-6 w-6 text-[hsl(var(--primary))]" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold">Profile</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Your account details and quick links</p>
                </div>
            </div>

            {/* Account Info Card */}
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-[hsl(var(--primary))]" />
                        Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--chart-1))] text-white text-xl font-bold">
                            {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{user?.displayName || 'User'}</p>
                            <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                                <Mail className="h-3 w-3" />
                                {user?.email}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
                        <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Role:</span>
                        <Badge variant={roleBadgeVariant(user?.role) as 'destructive' | 'info' | 'warning' | 'secondary'}>
                            {user?.role?.replace('_', ' ') || 'CUSTOMER'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Quick Links</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}>
                                <Card variant="interactive" className="p-4 group cursor-pointer h-full">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg p-2" style={{ backgroundColor: `${link.color} / 0.1)`.replace(')', '') }}>
                                            <Icon className="h-5 w-5" style={{ color: link.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium group-hover:text-[hsl(var(--primary))] transition">{link.label}</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">{link.description}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition" />
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <AuthGuard>
            <ProfileContent />
        </AuthGuard>
    );
}
