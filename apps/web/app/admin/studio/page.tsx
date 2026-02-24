'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '../../../stores/auth-store';
import { getSupabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Upload, Sparkles, Image as ImageIcon, CheckCircle2, Loader2, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudioPage() {
    const { user } = useAuthStore();

    // --- Manual Upload State ---
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- AI Campaign State ---
    const [campaignTheme, setCampaignTheme] = useState('');
    const [campaignCount, setCampaignCount] = useState(5);
    const [campaignProgress, setCampaignProgress] = useState<{ step: string; current: number; total: number } | null>(null);

    // --- CSV Import State ---
    const [csvProgress, setCsvProgress] = useState<{ current: number; total: number } | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    // ==========================================
    // 1. Manual Bulk Upload Logic
    // ==========================================
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !user) return;

        setUploadProgress({ current: 0, total: files.length });
        const supabase = getSupabase();

        let successCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data: storageData, error: storageError } = await supabase.storage
                    .from('user-designs')
                    .upload(fileName, file);

                if (storageError) throw storageError;

                const { data: publicUrlData } = supabase.storage
                    .from('user-designs')
                    .getPublicUrl(fileName);

                const promptFromName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

                const { error: dbError } = await supabase.from('designs').insert({
                    user_id: user.id,
                    prompt: `[UPLOAD] ${promptFromName}`,
                    original_image_url: publicUrlData.publicUrl,
                    print_ready_url: publicUrlData.publicUrl,
                    status: 'completed',
                    is_public: false,
                });

                if (dbError) throw dbError;
                successCount++;
            } catch (err) {
                console.error(`Failed to upload ${file.name}:`, err);
                toast.error(`Failed to upload ${file.name}`);
            }
            setUploadProgress({ current: i + 1, total: files.length });
        }

        toast.success(`Successfully uploaded ${successCount} out of ${files.length} designs!`);
        setTimeout(() => setUploadProgress(null), 2000);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ==========================================
    // 2. AI Campaign Bulk Generator Logic
    // ==========================================
    const startAICampaign = async () => {
        if (!campaignTheme || campaignCount < 1 || !user) {
            toast.error('Please enter a theme and select at least 1 design.');
            return;
        }

        setCampaignProgress({ step: 'Generating Prompts...', current: 0, total: campaignCount });

        try {
            const promptRes = await fetch('/api/admin/generate-prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: campaignTheme, count: campaignCount }),
            });

            if (!promptRes.ok) throw new Error('Failed to generate prompts');
            const { prompts } = await promptRes.json();

            if (!prompts || prompts.length === 0) throw new Error('No prompts returned');

            const supabase = getSupabase();
            const { data: { session } } = await supabase.auth.getSession();

            let successCount = 0;

            for (let i = 0; i < prompts.length; i++) {
                setCampaignProgress({ step: `Generating Image ${i + 1}/${prompts.length}`, current: i, total: prompts.length });

                try {
                    const bgResponse = await fetch('/api/generate-design', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`,
                        },
                        body: JSON.stringify({ prompt: prompts[i] }),
                    });

                    if (!bgResponse.ok) throw new Error('Generation failed');
                    const data = await bgResponse.json();

                    if (data.record?.id) {
                        await supabase.from('designs').update({ is_public: true }).eq('id', data.record.id);
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Failed on prompt ${i}:`, err);
                    toast.error(`Generation ${i + 1} failed, continuing...`);
                }
            }

            setCampaignProgress({ step: 'Done!', current: prompts.length, total: prompts.length });
            toast.success(`Campaign complete: Generated ${successCount} designs!`);
            setTimeout(() => setCampaignProgress(null), 3000);

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Campaign failed');
            setCampaignProgress(null);
        }
    };

    // ==========================================
    // 3. CSV Bulk Product Import Logic
    // ==========================================
    const handleCSVUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !user) return;

        const file = files[0];
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please upload a valid CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast.error('CSV file is empty or missing data rows');
                return;
            }

            const headers = lines[0].split(',').map(h =>
                h.trim().toLowerCase().replace(/^["\uFEFF]+|["\uFEFF]+$/g, '')
            );
            const dataRows = lines.slice(1);
            const productsToImport = [];

            for (const row of dataRows) {
                // Better CSV value splitting that handles basic quotes
                const values = row.split(',').map(v => {
                    let val = v.trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.substring(1, val.length - 1);
                    }
                    return val;
                });

                if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

                const rowData: any = {};
                headers.forEach((header, index) => {
                    rowData[header] = values[index] || '';
                });

                const imageUrl = rowData.image_url || rowData.image || rowData.url || '';
                if (!imageUrl) continue;

                // Robust price parsing: remove currency symbols, commas, and handle NaN
                const rawPrice = rowData.base_price || rowData.price || '499';
                const cleanPriceStr = String(rawPrice).replace(/[^\d.-]/g, '');
                let price = parseFloat(cleanPriceStr);
                if (isNaN(price)) price = 499;

                productsToImport.push({
                    name: rowData.name || rowData.title || `Product ${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    description: rowData.description || rowData.desc || 'Premium quality custom product',
                    category: rowData.category || rowData.type || 'tshirt',
                    base_price: price,
                    images: [imageUrl],
                    is_active: true,
                    colors: ['White', 'Black', 'Navy'],
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                    fabric: '100% Cotton',
                    fit: 'Regular Fit',
                });
            }

            if (productsToImport.length === 0) {
                toast.error('No valid products found in CSV (image_url is required)');
                return;
            }

            setCsvProgress({ current: 0, total: productsToImport.length });

            try {
                const supabase = getSupabase();
                const { data: { session } } = await supabase.auth.getSession();

                const response = await fetch('/api/admin/products/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ products: productsToImport }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to import products');
                }

                const result = await response.json();
                toast.success(result.message);
            } catch (err: any) {
                console.error(err);
                toast.error(err.message || 'CSV Import failed');
            } finally {
                setCsvProgress(null);
                if (csvInputRef.current) csvInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Admin Studio</h1>
                <p className="text-lg text-[hsl(var(--muted-foreground))]">
                    Bulk upload or auto-generate hundreds of designs to instantly populate the public gallery.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* --- Card 1: Drag & Drop Manual Upload --- */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Manual Bulk Upload</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Drag & Drop 100+ images</p>
                        </div>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-[hsl(var(--primary)/0.05)]' : 'border-gray-300 hover:border-primary/50'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFileUpload(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="font-medium text-lg mb-1">Click or drag files here</p>
                        <p className="text-sm text-gray-500">Supports PNG, JPG, WEBP. Unlimited quantity.</p>
                    </div>

                    {uploadProgress && (
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Uploading files...</span>
                                <span>{uploadProgress.current} / {uploadProgress.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Card 2: AI Campaign Bulk Generator --- */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Campaign Builder</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Auto-generate N variations</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1">Campaign Theme / Seed Concept</label>
                            <input
                                type="text"
                                value={campaignTheme}
                                onChange={(e) => setCampaignTheme(e.target.value)}
                                placeholder="e.g. Vintage Samurai Cats"
                                className="w-full rounded-lg border border-[hsl(var(--border))] px-4 py-3 bg-[hsl(var(--background))] focus:ring-2 focus:ring-purple-500 outline-none"
                                disabled={campaignProgress !== null}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Number of Designs</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1" max="50"
                                    value={campaignCount}
                                    onChange={(e) => setCampaignCount(parseInt(e.target.value))}
                                    className="flex-1 accent-purple-600"
                                    disabled={campaignProgress !== null}
                                />
                                <span className="font-bold w-12 text-right">{campaignCount}</span>
                            </div>
                        </div>

                        <Button
                            variant="gradient"
                            className="w-full h-12 text-md shadow-lg shadow-purple-500/20"
                            onClick={startAICampaign}
                            disabled={campaignProgress !== null}
                        >
                            {campaignProgress ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Campaign Running...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2" /> Start AI Bulk Generation</>
                            )}
                        </Button>

                        {campaignProgress && (
                            <div className="mt-4 p-4 border rounded-xl bg-purple-50 border-purple-100">
                                <div className="flex justify-between text-sm font-medium text-purple-800 mb-2">
                                    <span>{campaignProgress.step}</span>
                                    <span>{campaignProgress.current} / {campaignProgress.total}</span>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(campaignProgress.current / campaignProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {/* --- Card 3: CSV Bulk Product Importer --- */}
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">CSV Bulk Importer</h2>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Populate Gallery from CSV file with smart defaults</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="font-bold mb-2">How it works:</h3>
                            <ul className="text-sm text-[hsl(var(--muted-foreground))] space-y-2 list-disc ml-4">
                                <li>Upload a <code className="bg-muted px-1 rounded">.csv</code> file with your product data.</li>
                                <li>Headers detected automatically: <code className="bg-muted px-1 rounded">name</code>, <code className="bg-muted px-1 rounded">price</code>, <code className="bg-muted px-1 rounded">category</code>, <code className="bg-muted px-1 rounded">image_url</code></li>
                                <li><strong>Required:</strong> <code className="bg-muted px-1 rounded">image_url</code> must be provided.</li>
                                <li>Missing headers like <code className="bg-muted px-1 rounded">price</code> will default to 499.</li>
                            </ul>

                            <div className="mt-6 flex flex-col gap-3">
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    ref={csvInputRef}
                                    onChange={(e) => handleCSVUpload(e.target.files)}
                                />
                                <Button
                                    variant="outline"
                                    className="h-12 border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
                                    onClick={() => csvInputRef.current?.click()}
                                    disabled={csvProgress !== null}
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Choose CSV File
                                </Button>
                            </div>
                        </div>

                        <div className="bg-[hsl(var(--muted))] rounded-2xl p-6 border border-[hsl(var(--border))]">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[hsl(var(--muted-foreground))]">
                                <AlertCircle className="w-4 h-4" />
                                CSV Example Format
                            </div>
                            <pre className="text-[10px] sm:text-xs overflow-x-auto text-[hsl(var(--foreground))] bg-black/5 p-3 rounded-lg font-mono">
                                {`name,price,category,image_url
"Cyber Wolf",599,tshirt,https://...
"Retro Sun",,hoodie,https://...
,,poster,https://...`}
                            </pre>
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-3">
                                * Missing values like names or prices will be filled with smart defaults.
                            </p>
                        </div>
                    </div>

                    {csvProgress && (
                        <div className="mt-6 p-4 border rounded-xl bg-green-50 border-green-100">
                            <div className="flex justify-between text-sm font-medium text-green-800 mb-2">
                                <span>Importing Products...</span>
                                <span>{csvProgress.current} / {csvProgress.total}</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(csvProgress.current / csvProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
