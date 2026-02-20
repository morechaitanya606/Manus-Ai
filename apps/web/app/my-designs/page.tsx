'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';
import { AuthGuard } from '../../components/auth-guard';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Sparkles, Eye, ShoppingBag, RotateCcw, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type DesignJob = {
    id: string;
    prompt: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    imageUrl?: string;
    apparelType?: string;
    color?: string;
    createdAt: string;
};

type DesignsResponse = {
    success: boolean;
    data: DesignJob[];
};

const STATUS_CONFIG = {
    QUEUED: { icon: Clock, color: 'warning', label: 'Queued' },
    PROCESSING: { icon: Loader2, color: 'info', label: 'Processing' },
    COMPLETED: { icon: CheckCircle2, color: 'success', label: 'Completed' },
    FAILED: { icon: XCircle, color: 'destructive', label: 'Failed' },
} as const;

function MyDesignsContent() {
    const designsQuery = useQuery({
        queryKey: ['my-designs'],
        queryFn: async () => {
            const res = await apiFetch<DesignsResponse>('/designs/my');
            return res.data;
        },
    });

    const designs = designsQuery.data || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
                        <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">My Designs</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">Your AI-generated designs and order history</p>
                    </div>
                </div>
                <Link href="/studio">
                    <Button variant="gradient" size="sm">
                        <Sparkles className="h-4 w-4" />
                        New Design
                    </Button>
                </Link>
            </div>

            {/* Designs Grid */}
            {designsQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-square w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : designs.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <Sparkles className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)] mx-auto" />
                    <h2 className="text-xl font-semibold">No designs yet</h2>
                    <p className="text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                        Head to the Design Studio and create your first AI-powered design
                    </p>
                    <Link href="/studio">
                        <Button variant="gradient">Open Design Studio</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {designs.map((design) => {
                        const statusConf = STATUS_CONFIG[design.status];
                        const StatusIcon = statusConf.icon;
                        return (
                            <Card key={design.id} variant="interactive" className="overflow-hidden group">
                                {/* Preview */}
                                <div className="relative aspect-square bg-[hsl(var(--muted))] overflow-hidden">
                                    {design.imageUrl ? (
                                        <Image
                                            src={design.imageUrl}
                                            alt={design.prompt}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            {design.status === 'PROCESSING' ? (
                                                <Loader2 className="h-10 w-10 text-[hsl(var(--primary))] animate-spin" />
                                            ) : design.status === 'QUEUED' ? (
                                                <Clock className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.4)]" />
                                            ) : (
                                                <XCircle className="h-10 w-10 text-[hsl(var(--destructive)/0.4)]" />
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant={statusConf.color as 'success' | 'warning' | 'info' | 'destructive'} className="text-xs">
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {statusConf.label}
                                        </Badge>
                                    </div>
                                    {design.apparelType && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="secondary" className="text-xs">{design.apparelType}</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-sm line-clamp-2 font-medium">{design.prompt}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        {new Date(design.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {design.status === 'COMPLETED' && design.imageUrl && (
                                            <>
                                                <Link href={`/studio?designUrl=${encodeURIComponent(design.imageUrl)}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="h-3 w-3" />
                                                        Preview
                                                    </Button>
                                                </Link>
                                                <Link href={`/studio?designUrl=${encodeURIComponent(design.imageUrl)}&order=true`} className="flex-1">
                                                    <Button variant="gradient" size="sm" className="w-full">
                                                        <ShoppingBag className="h-3 w-3" />
                                                        Order
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                        {design.status === 'FAILED' && (
                                            <Link href="/studio" className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <RotateCcw className="h-3 w-3" />
                                                    Retry
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function MyDesignsPage() {
    return (
        <AuthGuard>
            <MyDesignsContent />
        </AuthGuard>
    );
}
