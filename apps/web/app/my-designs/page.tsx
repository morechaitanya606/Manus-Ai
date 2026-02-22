'use client';

import { useMyDesigns, useToggleDesignPublic } from '../../hooks/use-designs';
import { AuthGuard } from '../../components/auth-guard';
import { Button } from '../../components/ui/button';
import { Sparkles, Image as ImageIcon, Globe, Lock, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MyDesignsPage() {
    return (
        <AuthGuard>
            <MyDesignsContent />
        </AuthGuard>
    );
}

function MyDesignsContent() {
    const { data: designs, isLoading } = useMyDesigns();
    const togglePublic = useToggleDesignPublic();

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold font-display">
                            My <span className="gradient-text">Designs</span>
                        </h1>
                        <p className="mt-1 text-[hsl(var(--muted-foreground))]">Your AI-generated design collection</p>
                    </div>
                    <Link href="/studio">
                        <Button variant="gradient" className="rounded-full">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create New
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-square skeleton rounded-2xl" />
                        ))}
                    </div>
                ) : designs && designs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {designs.map((design, i) => (
                            <div
                                key={design.id}
                                className="group bg-white rounded-2xl border border-[hsl(var(--border))] overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] flex items-center justify-center relative overflow-hidden">
                                    {design.original_image_url ? (
                                        <img src={design.original_image_url} alt={design.prompt} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            {design.status === 'pending' ? (
                                                <div className="h-8 w-8 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin mx-auto mb-2" />
                                            ) : design.status === 'failed' ? (
                                                <ImageIcon className="h-8 w-8 text-red-300 mx-auto mb-2" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-2" />
                                            )}
                                            <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">{design.status}</p>
                                        </div>
                                    )}
                                    {/* Status badge */}
                                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium ${design.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            design.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {design.status}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm line-clamp-2 mb-3">{design.prompt}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {new Date(design.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => togglePublic.mutate({ id: design.id, is_public: !design.is_public })}
                                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition ${design.is_public ? 'bg-green-50 text-green-600' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                                }`}
                                        >
                                            {design.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {design.is_public ? 'Public' : 'Private'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-fade-in">
                        <Sparkles className="h-16 w-16 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Create your first AI design</p>
                        <Link href="/studio">
                            <Button variant="gradient" className="rounded-full px-8">Open Studio</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
