'use client';

import { Check, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

export interface FilterState {
    price: string[];
    color: string[];
    size: string[];
    neck: string[];
    sleeve: string[];
    fit: string[];
    fabric: string[];
    pattern: string[];
    availability: string[];
}

export const initialFilterState: FilterState = {
    price: [],
    color: [],
    size: [],
    neck: [],
    sleeve: [],
    fit: [],
    fabric: [],
    pattern: [],
    availability: [],
};

// Safely extract color name — handles both string "Red" and object {name:"Red",hex:"#..."}
function extractColorName(raw: any): string {
    if (!raw) return '';
    if (typeof raw === 'string') {
        // Try parsing as JSON (e.g. '{"name":"Red","hex":""}')
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.name) return String(parsed.name).trim();
        } catch {
            // Not JSON — return as-is if it looks like a plain word
            const cleaned = raw.trim();
            if (cleaned && !/[{}\[\]"]/.test(cleaned)) return cleaned;
        }
        return '';
    }
    if (typeof raw === 'object' && raw.name) return String(raw.name).trim();
    return '';
}

interface FilterSectionProps {
    title: string;
    options: { value: string; label: string; count?: number }[];
    selectedOptions: string[];
    onChange: (updates: string[]) => void;
    defaultExpanded?: boolean;
}

function FilterSection({ title, options, selectedOptions, onChange, defaultExpanded = true }: FilterSectionProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [showAll, setShowAll] = useState(false);

    const toggleOption = (value: string) => {
        if (selectedOptions.includes(value)) {
            onChange(selectedOptions.filter((o) => o !== value));
        } else {
            onChange([...selectedOptions, value]);
        }
    };

    const hasMore = options.length > 5;
    const visibleOptions = hasMore && !showAll ? options.slice(0, 5) : options;

    if (options.length === 0) return null;

    return (
        <div className="border-b border-border-std/60 py-4">
            <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-main font-mono">
                    {title}
                    {selectedOptions.length > 0 && (
                        <span className="ml-2 text-[10px] bg-cyan text-void px-1.5 py-0.5 font-bold">
                            {selectedOptions.length}
                        </span>
                    )}
                </h3>
                {expanded
                    ? <ChevronUp className="h-3.5 w-3.5 text-text-dim shrink-0" />
                    : <ChevronDown className="h-3.5 w-3.5 text-text-dim shrink-0" />
                }
            </button>

            {expanded && (
                <div className="mt-3 space-y-2">
                    {visibleOptions.map((opt) => {
                        const isSelected = selectedOptions.includes(opt.value);
                        return (
                            <label
                                key={opt.value}
                                className="flex items-center gap-3 cursor-pointer group py-0.5"
                                onClick={() => toggleOption(opt.value)}
                            >
                                <div className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${isSelected ? 'border-cyan bg-cyan text-void' : 'border-border-std bg-void group-hover:border-text-dim'}`}>
                                    {isSelected && <Check className="h-2.5 w-2.5" />}
                                </div>
                                <div className="flex flex-1 items-center justify-between min-w-0 gap-2">
                                    <span className={`text-xs font-mono truncate ${isSelected ? 'text-cyan font-bold' : 'text-text-main/60 group-hover:text-text-main'} transition-colors`}>
                                        {opt.label}
                                    </span>
                                    {opt.count !== undefined && (
                                        <span className="text-[10px] text-text-main/30 font-mono shrink-0">
                                            {opt.count}
                                        </span>
                                    )}
                                </div>
                            </label>
                        );
                    })}

                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-[10px] text-cyan hover:text-text-main font-mono tracking-widest mt-1 transition-colors"
                        >
                            {showAll ? '− Show less' : `+ ${options.length - 5} more`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

interface GalleryFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    products: any[];
    open: boolean;
    onClose: () => void;
}

export function GalleryFilters({ filters, onFilterChange, products, open, onClose }: GalleryFiltersProps) {
    const getCounts = useCallback((extractFn: (p: any) => string[]) => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            extractFn(p).forEach(v => {
                if (v && v.trim()) counts[v] = (counts[v] || 0) + 1;
            });
        });
        return counts;
    }, [products]);

    const getPriceCounts = useCallback(() => {
        const c = { lt500: 0, '500-1000': 0, '1000-1500': 0, '1500-2000': 0, gt2000: 0 };
        products.forEach(p => {
            const price = Number(p.base_price || 0);
            if (price < 500) c.lt500++;
            else if (price <= 1000) c['500-1000']++;
            else if (price <= 1500) c['1000-1500']++;
            else if (price <= 2000) c['1500-2000']++;
            else c.gt2000++;
        });
        return c;
    }, [products]);

    const priceCounts = useMemo(getPriceCounts, [getPriceCounts]);
    const sizeCounts = useMemo(() => getCounts(p => p.sizes || []), [getCounts]);

    // FIXED: properly extract color names from objects or strings
    const colorCounts = useMemo(() => getCounts(p => {
        const colors = p.colors || [];
        return (Array.isArray(colors) ? colors : [colors]).map(extractColorName).filter(Boolean);
    }), [getCounts]);

    const neckCounts = useMemo(() => getCounts(p => (p.features || []).filter((f: string) => f.toLowerCase().includes('neck'))), [getCounts]);
    const sleeveCounts = useMemo(() => getCounts(p => (p.features || []).filter((f: string) => f.toLowerCase().includes('sleeve'))), [getCounts]);
    const fitCounts = useMemo(() => getCounts(p => p.fit ? [p.fit] : []), [getCounts]);
    const fabricCounts = useMemo(() => getCounts(p => p.fabric ? [p.fabric] : []), [getCounts]);

    const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
    const totalActive = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);

    const updateFilter = (key: keyof FilterState, values: string[]) => {
        onFilterChange({ ...filters, [key]: values });
    };

    // Build clean color options — no duplicates, no JSON strings
    const knownColors = ['Black', 'White', 'Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Pink', 'Purple', 'Navy', 'Gray', 'Grey', 'Brown', 'Beige', 'Cream', 'Olive'];
    const dynamicColors = Object.keys(colorCounts)
        .filter(c => c && c.trim() && !c.includes('{') && !knownColors.includes(c))
        .sort();
    const colorOptions = [
        ...knownColors.filter(c => colorCounts[c] > 0),
        ...dynamicColors,
    ].map(c => ({ value: c, label: c, count: colorCounts[c] || 0 }));

    const filterContent = (
        <div className="flex flex-col" style={{ height: '100%' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border-std bg-panel shrink-0">
                <h2 className="font-bold font-mono uppercase tracking-widest text-text-main flex items-center gap-2 text-sm">
                    <SlidersHorizontal className="h-4 w-4 text-cyan" />
                    Filters
                    {totalActive > 0 && (
                        <span className="bg-cyan text-void text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{totalActive}</span>
                    )}
                </h2>
                <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                        <button
                            onClick={() => onFilterChange(initialFilterState)}
                            className="text-[10px] font-mono text-cyan hover:text-text-main uppercase tracking-widest transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                    <button onClick={onClose} className="text-text-main/50 hover:text-text-main transition-colors lg:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable filter body */}
            <div
                className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6"
                style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
                <FilterSection
                    title="Price"
                    options={[
                        { value: 'lt500', label: 'Under ₹500', count: priceCounts.lt500 },
                        { value: '500-1000', label: '₹500 – ₹1000', count: priceCounts['500-1000'] },
                        { value: '1000-1500', label: '₹1000 – ₹1500', count: priceCounts['1000-1500'] },
                        { value: '1500-2000', label: '₹1500 – ₹2000', count: priceCounts['1500-2000'] },
                        { value: 'gt2000', label: 'Above ₹2000', count: priceCounts.gt2000 },
                    ]}
                    selectedOptions={filters.price}
                    onChange={(v) => updateFilter('price', v)}
                />

                <FilterSection
                    title="Colour"
                    options={colorOptions}
                    selectedOptions={filters.color}
                    onChange={(v) => updateFilter('color', v)}
                />

                <FilterSection
                    title="Size"
                    options={['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
                        .map(s => ({ value: s, label: s, count: sizeCounts[s] || 0 }))
                        .filter(o => o.count > 0)}
                    selectedOptions={filters.size}
                    onChange={(v) => updateFilter('size', v)}
                />

                <FilterSection
                    title="Fabric"
                    options={[
                        'Cotton', 'Hemp', 'Bamboo', 'Polyester', 'Linen',
                        ...Object.keys(fabricCounts).filter(f => !['Cotton', 'Hemp', 'Bamboo', 'Polyester', 'Linen'].includes(f) && f !== 'undefined'),
                    ]
                        .map(f => ({ value: f, label: f, count: fabricCounts[f] || 0 }))
                        .filter(o => o.count > 0)}
                    selectedOptions={filters.fabric}
                    onChange={(v) => updateFilter('fabric', v)}
                />

                <FilterSection
                    title="Fit"
                    options={[
                        'Regular Fit', 'Slim Fit', 'Oversized',
                        ...Object.keys(fitCounts).filter(f => !['Regular Fit', 'Slim Fit', 'Oversized'].includes(f) && f !== 'undefined'),
                    ]
                        .map(f => ({ value: f, label: f, count: fitCounts[f] || 0 }))
                        .filter(o => o.count > 0)}
                    selectedOptions={filters.fit}
                    onChange={(v) => updateFilter('fit', v)}
                />

                {Object.keys(neckCounts).length > 0 && (
                    <FilterSection
                        title="Neck Style"
                        options={Object.keys(neckCounts).map(n => ({ value: n, label: n, count: neckCounts[n] }))}
                        selectedOptions={filters.neck}
                        onChange={(v) => updateFilter('neck', v)}
                        defaultExpanded={false}
                    />
                )}

                {Object.keys(sleeveCounts).length > 0 && (
                    <FilterSection
                        title="Sleeve"
                        options={Object.keys(sleeveCounts).map(n => ({ value: n, label: n, count: sleeveCounts[n] }))}
                        selectedOptions={filters.sleeve}
                        onChange={(v) => updateFilter('sleeve', v)}
                        defaultExpanded={false}
                    />
                )}
            </div>

            {/* Footer: Apply (mobile only) */}
            <div className="lg:hidden px-4 py-3 border-t border-border-std bg-panel shrink-0">
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-cyan text-void font-mono font-bold text-sm uppercase tracking-widest hover:bg-cyan/90 transition-colors"
                >
                    Show {products.length} Results
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* ─── MOBILE: bottom sheet drawer ─── */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
                {/* Drawer */}
                <div className={`absolute bottom-0 left-0 right-0 bg-void border-t border-border-std rounded-t-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '85vh' }}>
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 bg-text-main/20 rounded-full" />
                    </div>
                    {filterContent}
                </div>
            </div>

            {/* ─── DESKTOP: sidebar panel ─── */}
            <div className="hidden lg:flex w-64 shrink-0 flex-col h-full bg-void border-r border-border-std">
                {filterContent}
            </div>
        </>
    );
}
