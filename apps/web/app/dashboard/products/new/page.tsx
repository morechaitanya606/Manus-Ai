'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '../../../../components/auth-guard';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Plus, X, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { value: 'tshirt', label: 'T-Shirt' },
    { value: 'shirt', label: 'Shirt' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'pants', label: 'Pants' },
    { value: 'cap', label: 'Cap' },
    { value: 'tote', label: 'Tote Bag' },
    { value: 'poster', label: 'Poster / Sticker' },
];

const PRINTING_METHODS = ['DTF', 'Screen Print', 'Sublimation', 'Embroidery', 'Heat Transfer'];
const COMMON_COLORS = ['Black', 'White', 'Grey', 'Navy', 'Red', 'Olive', 'Beige', 'Cream', 'Maroon', 'Royal Blue', 'Forest Green', 'Pink', 'Lavender', 'Sky Blue'];
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38'];

export default function NewProductPage() {
    return (
        <AuthGuard requireAdmin>
            <NewProductForm />
        </AuthGuard>
    );
}

function NewProductForm() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'tshirt',
        base_price: '',
        fabric: '',
        fit: 'Regular',
        gsm: '',
        colors: ['Black', 'White'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        printing_methods: ['DTF'],
        features: [] as string[],
        images: [] as string[],
    });

    const [newFeature, setNewFeature] = useState('');
    const [newColor, setNewColor] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.url) {
                setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
            } else {
                setError('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch {
            setError('Upload failed');
        }
        setUploading(false);
    };

    const addImageUrl = () => {
        if (imageUrl.trim()) {
            setForm(prev => ({ ...prev, images: [...prev.images, imageUrl.trim()] }));
            setImageUrl('');
        }
    };

    const removeImage = (index: number) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const toggleColor = (color: string) => {
        setForm(prev => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter(c => c !== color)
                : [...prev.colors, color]
        }));
    };

    const addCustomColor = () => {
        if (newColor.trim() && !form.colors.includes(newColor.trim())) {
            setForm(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }));
            setNewColor('');
        }
    };

    const toggleSize = (size: string) => {
        setForm(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const togglePrintingMethod = (method: string) => {
        setForm(prev => ({
            ...prev,
            printing_methods: prev.printing_methods.includes(method)
                ? prev.printing_methods.filter(m => m !== method)
                : [...prev.printing_methods, method]
        }));
    };

    const addFeature = () => {
        if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
            setForm(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
            setNewFeature('');
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.base_price) {
            setError('Name and price are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                router.push('/dashboard/products');
            } else {
                setError(data.error || 'Failed to save product');
            }
        } catch {
            setError('Failed to save product');
        }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--muted))]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard/products">
                        <Button variant="outline" size="sm" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-display">
                            Add New <span className="gradient-text">Product</span>
                        </h1>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Fill in the product details below</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Basic Information</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Premium Cotton T-Shirt"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe the product..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition bg-[hsl(var(--card))]"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={form.base_price}
                                        onChange={(e) => setForm(prev => ({ ...prev, base_price: e.target.value }))}
                                        placeholder="e.g. 999"
                                        min="0"
                                        className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Product Images</h2>
                        <div className="flex flex-wrap gap-3 mb-4">
                            {form.images.map((img, i) => (
                                <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-[hsl(var(--border))] group">
                                    <Image src={img} alt="" fill className="object-cover" sizes="96px" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="h-24 w-24 rounded-xl border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--primary))] transition">
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />}
                                <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Upload</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Or paste image URL..."
                                className="flex-1 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                onKeyDown={(e) => e.key === 'Enter' && addImageUrl()}
                            />
                            <Button variant="outline" size="sm" onClick={addImageUrl}>Add URL</Button>
                        </div>
                    </div>

                    {/* Fabric & Fit */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Material Details</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Fabric</label>
                                <input
                                    type="text"
                                    value={form.fabric}
                                    onChange={(e) => setForm(prev => ({ ...prev, fabric: e.target.value }))}
                                    placeholder="e.g. 100% Cotton"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Fit</label>
                                <select
                                    value={form.fit}
                                    onChange={(e) => setForm(prev => ({ ...prev, fit: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm bg-[hsl(var(--card))]"
                                >
                                    <option>Regular</option>
                                    <option>Slim Fit</option>
                                    <option>Oversized</option>
                                    <option>Relaxed</option>
                                    <option>Classic Fit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">GSM</label>
                                <input
                                    type="number"
                                    value={form.gsm}
                                    onChange={(e) => setForm(prev => ({ ...prev, gsm: e.target.value }))}
                                    placeholder="e.g. 240"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Available Colors</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {COMMON_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => toggleColor(color)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition ${form.colors.includes(color)
                                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                placeholder="Add custom color..."
                                className="flex-1 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && addCustomColor()}
                            />
                            <Button variant="outline" size="sm" onClick={addCustomColor}><Plus className="h-4 w-4" /></Button>
                        </div>
                        {form.colors.length > 0 && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                Selected: {form.colors.join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Sizes */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Available Sizes</h2>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_SIZES.map(size => (
                                <button
                                    key={size}
                                    onClick={() => toggleSize(size)}
                                    className={`px-4 py-2 text-sm rounded-xl border transition font-medium ${form.sizes.includes(size)
                                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Printing Methods */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Printing Methods</h2>
                        <div className="flex flex-wrap gap-2">
                            {PRINTING_METHODS.map(method => (
                                <button
                                    key={method}
                                    onClick={() => togglePrintingMethod(method)}
                                    className={`px-4 py-2 text-sm rounded-xl border transition ${form.printing_methods.includes(method)
                                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
                        <h2 className="font-semibold mb-4">Features / Tags</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {form.features.map(f => (
                                <span key={f} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs">
                                    {f}
                                    <button onClick={() => setForm(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }))}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add feature (e.g. Eco-friendly, Premium)..."
                                className="flex-1 px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                            />
                            <Button variant="outline" size="sm" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end gap-3 pb-8">
                        <Link href="/dashboard/products">
                            <Button variant="outline" size="lg" className="rounded-xl">Cancel</Button>
                        </Link>
                        <Button variant="gradient" size="lg" className="rounded-xl px-8" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                            Save Product
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
