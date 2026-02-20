'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { AuthGuard } from '../../../components/auth-guard';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { StatusBadge } from '../../../components/ui/badge';
import { SkeletonTable } from '../../../components/ui/skeleton';
import { toast } from '../../../components/ui/toast';
import { Plus, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

type Product = {
    id: string;
    title: string;
    type: string;
    basePrice: string;
    stock: number;
    reservedStock: number;
    isActive: boolean;
    createdAt: string;
};

function ProductsManagement() {
    const queryClient = useQueryClient();
    const [showAdd, setShowAdd] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        type: 'T-Shirt',
        basePrice: '',
        stock: '',
        sizes: 'S,M,L,XL',
        colors: 'Black,White,Navy',
    });

    const productsQuery = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const res = await apiFetch<{ success: boolean; data: Product[] }>('/products', {
                params: { page: 1, limit: 100 },
            });
            return res.data;
        },
    });

    const createProduct = useMutation({
        mutationFn: async () => {
            await apiFetch('/products', {
                method: 'POST',
                body: {
                    title: newProduct.title,
                    description: newProduct.description,
                    type: newProduct.type,
                    basePrice: Number(newProduct.basePrice),
                    stock: Number(newProduct.stock),
                    sizes: newProduct.sizes.split(',').map((s) => s.trim()),
                    colors: newProduct.colors.split(',').map((s) => s.trim()),
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast('success', 'Product Created', 'New product added successfully.');
            setShowAdd(false);
            setNewProduct({ title: '', description: '', type: 'T-Shirt', basePrice: '', stock: '', sizes: 'S,M,L,XL', colors: 'Black,White,Navy' });
        },
        onError: (err) => toast('error', 'Failed', err instanceof Error ? err.message : 'Could not create product'),
    });

    const updateStock = useMutation({
        mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
            await apiFetch(`/products/${id}/stock`, {
                method: 'PATCH',
                body: { stock },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast('success', 'Updated', 'Stock updated.');
        },
        onError: () => toast('error', 'Failed', 'Could not update stock'),
    });

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setNewProduct((prev) => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Product Management</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{productsQuery.data?.length ?? 0} products</p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </div>

            {showAdd && (
                <Card className="space-y-4 animate-slide-down">
                    <h3 className="font-semibold">New Product</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Title" value={newProduct.title} onChange={update('title')} placeholder="Urban Vibe Tee" />
                        <Input label="Type" value={newProduct.type} onChange={update('type')} placeholder="T-Shirt" />
                        <Input label="Price" type="number" value={newProduct.basePrice} onChange={update('basePrice')} placeholder="29.99" />
                        <Input label="Stock" type="number" value={newProduct.stock} onChange={update('stock')} placeholder="100" />
                        <Input label="Sizes (comma-separated)" value={newProduct.sizes} onChange={update('sizes')} />
                        <Input label="Colors (comma-separated)" value={newProduct.colors} onChange={update('colors')} />
                    </div>
                    <Input label="Description" value={newProduct.description} onChange={update('description')} placeholder="Premium cotton streetwear tee..." />
                    <div className="flex gap-2">
                        <Button loading={createProduct.isPending} onClick={() => createProduct.mutate()}>Create Product</Button>
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                    </div>
                </Card>
            )}

            {productsQuery.isLoading ? (
                <SkeletonTable rows={6} />
            ) : (
                <Card className="overflow-x-auto p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                                <th className="text-left p-3 font-medium">Product</th>
                                <th className="text-left p-3 font-medium">Type</th>
                                <th className="text-right p-3 font-medium">Price</th>
                                <th className="text-right p-3 font-medium">Stock</th>
                                <th className="text-center p-3 font-medium">Status</th>
                                <th className="text-right p-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsQuery.data?.map((product) => (
                                <tr key={product.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted)/0.5)] transition">
                                    <td className="p-3 font-medium">{product.title}</td>
                                    <td className="p-3 text-[hsl(var(--muted-foreground))]">{product.type}</td>
                                    <td className="p-3 text-right">${Number(product.basePrice).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <span className="font-semibold">{product.stock}</span>
                                        {product.reservedStock > 0 && (
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]"> ({product.reservedStock} reserved)</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <StatusBadge status={product.isActive ? 'COMPLETED' : 'CANCELLED'} />
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newStock = prompt('Enter new stock quantity:', String(product.stock));
                                                if (newStock) updateStock.mutate({ id: product.id, stock: Number(newStock) });
                                            }}
                                        >
                                            Update Stock
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <AuthGuard requiredRoles={['PLATFORM_ADMIN', 'STORE_OWNER', 'STORE_MANAGER']}>
            <div className="space-y-4 animate-fade-in">
                <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                    <ArrowLeft className="h-4 w-4" /> Dashboard
                </Link>
                <ProductsManagement />
            </div>
        </AuthGuard>
    );
}
