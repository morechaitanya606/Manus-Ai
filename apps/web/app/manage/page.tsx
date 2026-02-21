'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input, Textarea } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../components/ui/toast';
import {
    Plus,
    Trash2,
    Edit3,
    Package,
    Upload,
    Eye,
    ImageIcon,
    Loader2,
    RefreshCw,
} from 'lucide-react';

interface Product {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    basePrice: number;
    images: string[];
    colors: string[];
    sizes: string[];
    fabric: string;
    stock: number;
    createdAt: string;
}

const APPAREL_TYPES = ['T-Shirt', 'Hoodie', 'Shirt', 'Jacket', 'Tank Top', 'Dress', 'Polo', 'Sweatshirt'];
const CATEGORIES = ['Men', 'Women', 'Unisex'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLOR_OPTIONS = ['Black', 'White', 'Navy', 'Red', 'Green', 'Blue', 'Gray', 'Pink', 'Yellow', 'Orange', 'Purple', 'Brown', 'Cream', 'Maroon'];
const FABRIC_OPTIONS = ['Cotton', 'Silk', 'Polyester', 'Linen', 'Organic Cotton', 'Fleece', 'Rayon', 'Nylon', 'Denim'];

export default function ManageProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('T-Shirt');
    const [category, setCategory] = useState('Unisex');
    const [basePrice, setBasePrice] = useState('599');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
    const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'White']);
    const [fabric, setFabric] = useState('Cotton');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            toast('error', 'Failed to Load', 'Could not connect to the database.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType('T-Shirt');
        setCategory('Unisex');
        setBasePrice('599');
        setImageUrl('');
        setSelectedSizes(['S', 'M', 'L', 'XL']);
        setSelectedColors(['Black', 'White']);
        setFabric('Cotton');
        setEditingId(null);
    };

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const toggleColor = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast('warning', 'Title Required', 'Please enter a product name.');
            return;
        }

        setSaving(true);
        try {
            const body = {
                title: title.trim(),
                description: description.trim(),
                type,
                category,
                basePrice: Number(basePrice) || 599,
                images: imageUrl.trim() ? [imageUrl.trim()] : [],
                colors: selectedColors.length > 0 ? selectedColors : ['Black'],
                sizes: selectedSizes.length > 0 ? selectedSizes : ['M'],
                fabric,
                stock: 100,
            };

            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                toast('success', editingId ? 'Updated!' : 'Added!', `${title} saved to database.`);
                resetForm();
                setShowForm(false);
                fetchProducts();
            } else {
                toast('error', 'Error', data.error || 'Failed to save.');
            }
        } catch (err) {
            console.error('Save error:', err);
            toast('error', 'Error', 'Failed to save product.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product: Product) => {
        setTitle(product.title);
        setDescription(product.description || '');
        setType(product.type || 'T-Shirt');
        setCategory(product.category || 'Unisex');
        setBasePrice(String(product.basePrice || 599));
        setImageUrl(product.images?.[0] || '');
        setSelectedSizes(product.sizes?.length ? product.sizes : ['M']);
        setSelectedColors(product.colors?.length ? product.colors : ['Black']);
        setFabric(product.fabric || 'Cotton');
        setEditingId(product._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast('info', 'Deleted', `${name} removed.`);
                fetchProducts();
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast('error', 'Error', 'Failed to delete.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
                        <Package className="h-6 w-6 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Manage Products</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} in database`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Link href="/gallery">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            View Gallery
                        </Button>
                    </Link>
                    <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <Card className="border-[hsl(var(--primary)/0.3)] animate-fade-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[hsl(var(--primary))]" />
                            {editingId ? 'Edit Product' : 'Add New Product'}
                        </CardTitle>
                        <CardDescription>
                            Only the name is required — everything else is optional and has defaults.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Row 1: Title + Price */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Product Name <span className="text-red-500">*</span></label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Cyberpunk Tiger Tee, Floral Summer Dress..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Price (₹)</label>
                                <Input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    placeholder="599"
                                />
                            </div>
                        </div>

                        {/* Row 2: Description */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description <span className="text-xs text-[hsl(var(--muted-foreground))]">(optional)</span></label>
                            <Textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your design..."
                            />
                        </div>

                        {/* Row 3: Image URL */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                                <ImageIcon className="h-4 w-4" />
                                Image URL <span className="text-xs text-[hsl(var(--muted-foreground))]">(paste image link)</span>
                            </label>
                            <Input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/design.jpg or paste any image URL"
                            />
                            {imageUrl && (
                                <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-[hsl(var(--border))] mt-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>

                        {/* Row 4: Type + Category + Fabric */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Apparel Type</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {APPAREL_TYPES.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${type === t
                                                    ? 'bg-[hsl(var(--primary))] text-white'
                                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.15)]'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {CATEGORIES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCategory(c)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${category === c
                                                    ? 'bg-[hsl(var(--primary))] text-white'
                                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.15)]'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Fabric</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {FABRIC_OPTIONS.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFabric(f)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${fabric === f
                                                    ? 'bg-[hsl(var(--primary))] text-white'
                                                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.15)]'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Sizes */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Available Sizes</label>
                            <div className="flex flex-wrap gap-2">
                                {SIZE_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSize(s)}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${selectedSizes.includes(s)
                                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground)/0.3)]'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 6: Colors */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Available Colors</label>
                            <div className="flex flex-wrap gap-1.5">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => toggleColor(c)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedColors.includes(c)
                                                ? 'bg-[hsl(var(--primary))] text-white'
                                                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.15)]'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button variant="gradient" onClick={handleSubmit} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {editingId ? 'Update Product' : 'Add Product'}
                            </Button>
                            <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Product List */}
            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                    <p className="mt-3 text-[hsl(var(--muted-foreground))]">Loading products from database...</p>
                </div>
            ) : products.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent className="space-y-4">
                        <div className="rounded-full bg-[hsl(var(--muted))] p-6 w-fit mx-auto">
                            <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <h2 className="text-xl font-semibold">No products yet</h2>
                        <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                            Click &quot;Add Product&quot; above to add your first design. Only a name is required!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {products.map((product) => (
                        <Card key={product._id} className="overflow-hidden">
                            <div className="flex items-center gap-4 p-4">
                                {/* Image */}
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-[hsl(var(--muted))] flex-shrink-0">
                                    {product.images?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <ImageIcon className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.5)]" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{product.title}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        {product.type && <Badge variant="secondary" className="text-xs">{product.type}</Badge>}
                                        {product.category && <Badge variant="outline" className="text-xs">{product.category}</Badge>}
                                        {product.fabric && <Badge variant="outline" className="text-xs">{product.fabric}</Badge>}
                                        <span className="text-sm font-bold text-[hsl(var(--primary))]">₹{product.basePrice || 599}</span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 truncate">
                                        {product.sizes?.length > 0 && `Sizes: ${product.sizes.join(', ')}`}
                                        {product.colors?.length > 0 && ` • Colors: ${product.colors.slice(0, 4).join(', ')}${product.colors.length > 4 ? ` +${product.colors.length - 4}` : ''}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDelete(product._id, product.title)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
