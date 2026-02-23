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
        <div className="min-h-screen bg-void relative overflow-hidden text-text-main font-mono">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0" />
            <div className="absolute inset-0 crt-overlay pointer-events-none z-50" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-border-std pb-4 animate-fade-in">
                    <Link href="/dashboard/products">
                        <Button className="rounded-none bg-panel border-border-std hover:bg-cyan/10 hover:text-cyan hover:border-cyan transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="inline-flex items-center gap-2 text-cyan font-mono text-[10px] tracking-widest uppercase bg-cyan/5 px-2 py-1 border border-cyan/20 mb-2">
                            <Plus className="h-3 w-3" />
                            <span>NEW_COMPONENT_ENTRY</span>
                        </div>
                        <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase">
                            ADD // <span className="text-magenta">PRODUCT</span>
                        </h1>
                        <p className="text-[10px] tracking-widest text-cyan uppercase mt-1">&gt; INITIALIZE COMPONENT DATA PARAMETERS</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500 font-mono text-xs text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-red-500 font-bold">[ERR!]</span> {error}
                    </div>
                )}

                <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {/* Basic Info */}
                    <div className="bg-panel border border-border-std p-6 relative group">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                        <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-cyan animate-pulse"></span> BASIC_DATA
                        </h2>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">PRODUCT_IDENTIFIER *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. PREMIUM_COTTON_TSHIRT"
                                    className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">DESCRIPTION_MATRIX</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Execute description sequence..."
                                    rows={3}
                                    className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">CATEGORY_CLASS *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                                    >
                                        {CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">CREDIT_VALUE (₹) *</label>
                                    <input
                                        type="number"
                                        value={form.base_price}
                                        onChange={(e) => setForm(prev => ({ ...prev, base_price: e.target.value }))}
                                        placeholder="e.g. 999"
                                        min="0"
                                        className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-magenta placeholder:text-text-dim focus:outline-none focus:border-magenta focus:shadow-[0_0_10px_rgba(255,0,255,0.2)] transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-panel border border-border-std p-6 relative group">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                        <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-cyan animate-pulse"></span> PRODUCT IMAGES <span className="text-[10px] font-normal text-text-dim">(MAX 5)</span>
                        </h2>

                        <div className="flex flex-wrap gap-3 mb-4">
                            {form.images.map((img, i) => (
                                <div key={i} className="relative h-24 w-24 border border-cyan/30 overflow-hidden group">
                                    <Image src={img} alt="" fill className="object-cover" sizes="96px" unoptimized />
                                    <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 h-5 w-5 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="h-24 w-24 border border-dashed border-border-std hover:border-cyan hover:bg-cyan/5 flex flex-col items-center justify-center cursor-pointer transition-all">
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin text-cyan" /> : <Upload className="h-5 w-5 text-text-dim group-hover:text-cyan" />}
                                <span className="text-[10px] text-text-dim mt-2 font-mono tracking-widest uppercase">UPLOAD</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="OR ENTER IMAGE URL..."
                                className="flex-1 bg-void px-4 py-2 border border-border-std text-sm font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && addImageUrl()}
                            />
                            <Button className="rounded-none bg-panel border-border-std text-cyan font-mono text-[10px] tracking-widest uppercase hover:text-white hover:bg-cyan hover:border-cyan transition-colors" onClick={addImageUrl}>
                                ADD URL
                            </Button>
                        </div>
                    </div>

                    {/* Fabric & Fit */}
                    <div className="bg-panel border border-border-std p-6 relative group">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                        <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-cyan animate-pulse"></span> MATERIAL SPECIFICATIONS
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">FABRIC TYPE</label>
                                <input
                                    type="text"
                                    value={form.fabric}
                                    onChange={(e) => setForm(prev => ({ ...prev, fabric: e.target.value }))}
                                    placeholder="e.g. 100% Cotton"
                                    className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">FIT TYPE</label>
                                <select
                                    value={form.fit}
                                    onChange={(e) => setForm(prev => ({ ...prev, fit: e.target.value }))}
                                    className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all uppercase"
                                >
                                    <option value="Regular">REGULAR</option>
                                    <option value="Slim Fit">SLIM FIT</option>
                                    <option value="Oversized">OVERSIZED</option>
                                    <option value="Relaxed">RELAXED</option>
                                    <option value="Classic Fit">CLASSIC FIT</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-text-dim uppercase mb-1.5">MATERIAL WEIGHT (GSM)</label>
                                <input
                                    type="number"
                                    value={form.gsm}
                                    onChange={(e) => setForm(prev => ({ ...prev, gsm: e.target.value }))}
                                    placeholder="e.g. 240"
                                    className="w-full bg-void px-4 py-2.5 border border-border-std text-sm font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colors & Sizes & Printing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Colors */}
                        <div className="bg-panel border border-border-std p-6 relative group">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>

                            <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-cyan animate-pulse"></span> AVAILABLE COLORS
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {COMMON_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase border transition-all ${form.colors.includes(color)
                                            ? 'bg-cyan text-void border-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                            : 'border-border-std text-text-dim hover:border-cyan hover:text-cyan'
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
                                    placeholder="ENTER CUSTOM COLOR..."
                                    className="flex-1 bg-void px-4 py-2 border border-border-std text-xs font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomColor()}
                                />
                                <Button className="rounded-none bg-panel border-border-std text-cyan hover:bg-cyan hover:text-void transition-colors" onClick={addCustomColor}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {form.colors.length > 0 && (
                                <p className="text-[10px] text-cyan font-mono tracking-widest uppercase mt-3">
                                    [COLORS]: {form.colors.join(' // ')}
                                </p>
                            )}
                        </div>

                        {/* Sizes */}
                        <div className="bg-panel border border-border-std p-6 relative group flex flex-col">
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                            <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-cyan animate-pulse"></span> AVAILABLE SIZES
                            </h2>
                            <div className="flex flex-wrap gap-2 flex-1">
                                {COMMON_SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`px-4 py-2 text-xs font-mono font-bold border transition-all ${form.sizes.includes(size)
                                            ? 'bg-magenta text-white border-magenta shadow-[0_0_10px_rgba(255,0,255,0.3)]'
                                            : 'border-border-std text-text-dim hover:border-magenta hover:text-magenta'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Printing Methods */}
                        <div className="bg-panel border border-border-std p-6 relative group">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500/50"></div>

                            <h2 className="font-mono font-bold text-yellow-500 tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-yellow-500 animate-pulse"></span> PRINTING METHODS
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {PRINTING_METHODS.map(method => (
                                    <button
                                        key={method}
                                        onClick={() => togglePrintingMethod(method)}
                                        className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase border transition-all ${form.printing_methods.includes(method)
                                            ? 'bg-yellow-500 text-void border-yellow-500'
                                            : 'border-border-std text-text-dim hover:border-yellow-500 hover:text-yellow-500'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-panel border border-border-std p-6 relative group">
                            <h2 className="font-mono font-bold text-cyan tracking-widest uppercase mb-4 flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 bg-cyan animate-pulse"></span> PRODUCT FEATURES
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.features.map(f => (
                                    <span key={f} className="inline-flex items-center gap-1 px-2 py-1 border border-cyan/30 bg-cyan/5 text-cyan text-[10px] font-mono uppercase tracking-wider">
                                        {f}
                                        <button onClick={() => setForm(prev => ({ ...prev, features: prev.features.filter(x => x !== f) }))} className="hover:text-red-500 transition-colors ml-1">
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
                                    placeholder="ADD FEATURE..."
                                    className="flex-1 bg-void px-4 py-2 border border-border-std text-xs font-mono text-cyan placeholder:text-text-dim focus:outline-none focus:border-cyan transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                />
                                <Button className="rounded-none bg-panel border-border-std text-cyan hover:bg-cyan hover:text-void transition-colors" onClick={addFeature}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end gap-4 pt-6 pb-12 border-t border-border-std mt-8 relative z-10">
                        <Link href="/dashboard/products">
                            <Button className="rounded-none bg-void border border-border-std text-text-dim font-mono tracking-widest text-xs uppercase px-6 py-5 hover:text-white hover:border-white transition-all">
                                CANCEL
                            </Button>
                        </Link>
                        <Button
                            className="rounded-none bg-cyan/10 border border-cyan text-cyan font-mono font-bold tracking-widest text-xs uppercase px-8 py-5 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:bg-cyan hover:text-void transition-all"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            SAVE PRODUCT
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
