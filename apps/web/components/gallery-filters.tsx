import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState, useMemo } from 'react';

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

interface FilterSectionProps {
    title: string;
    options: { value: string; label: string; count?: number }[];
    selectedOptions: string[];
    onChange: (updates: string[]) => void;
    defaultExpanded?: boolean;
}

function FilterSection({ title, options, selectedOptions, onChange, defaultExpanded = true }: FilterSectionProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    const toggleOption = (value: string) => {
        if (selectedOptions.includes(value)) {
            onChange(selectedOptions.filter((o) => o !== value));
        } else {
            onChange([...selectedOptions, value]);
        }
    };

    const isShowMoreActive = options.length > 6;
    const [showAll, setShowAll] = useState(!isShowMoreActive);

    const visibleOptions = showAll ? options : options.slice(0, 5);

    return (
        <div className="border-b border-border-std py-4">
            <button
                className="flex w-full items-center justify-between text-left focus:outline-none"
                onClick={() => setExpanded(!expanded)}
            >
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-main font-mono">{title}</h3>
                {expanded ? <ChevronUp className="h-4 w-4 text-text-dim" /> : <ChevronDown className="h-4 w-4 text-text-dim" />}
            </button>

            {expanded && (
                <div className="mt-3 space-y-2">
                    {visibleOptions.map((opt) => {
                        const isSelected = selectedOptions.includes(opt.value);
                        return (
                            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`flex h-4 w-4 items-center justify-center border transition-colors ${isSelected ? 'border-cyan bg-cyan text-void' : 'border-border-std bg-void group-hover:border-text-dim'}`}>
                                    {isSelected && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-1 items-center justify-between min-w-0">
                                    <span className={`text-[11px] font-mono tracking-wide truncate ${isSelected ? 'text-cyan' : 'text-text-dim group-hover:text-text-main transition-colors'}`}>
                                        {opt.label}
                                    </span>
                                    {opt.count !== undefined && (
                                        <span className="text-[10px] text-border-std tracking-widest font-mono shrink-0 ml-2">
                                            ({opt.count})
                                        </span>
                                    )}
                                </div>
                            </label>
                        );
                    })}

                    {isShowMoreActive && !showAll && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-[10px] text-cyan hover:text-text-main font-mono tracking-widest mt-2 focus:outline-none"
                        >
                            + {options.length - 5} MORE
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
}

export function GalleryFilters({ filters, onFilterChange, products }: GalleryFiltersProps) {
    const getCounts = (key: string, extractFn: (p: any) => string[]) => {
        const counts: Record<string, number> = {};
        products.forEach(p => {
            const vals = extractFn(p);
            vals.forEach(v => {
                if (v) counts[v] = (counts[v] || 0) + 1;
            });
        });
        return counts;
    };

    const getPriceCounts = () => {
        const counts = { 'lt500': 0, '500-1000': 0, '1000-1500': 0, '1500-2000': 0, 'gt2000': 0 };
        products.forEach(p => {
            const price = Number(p.base_price || 0);
            if (price < 500) counts['lt500']++;
            else if (price <= 1000) counts['500-1000']++;
            else if (price <= 1500) counts['1000-1500']++;
            else if (price <= 2000) counts['1500-2000']++;
            else counts['gt2000']++;
        });
        return counts;
    };

    const priceCounts = useMemo(() => getPriceCounts(), [products]);
    const sizeCounts = useMemo(() => getCounts('sizes', p => p.sizes || []), [products]);
    const colorCounts = useMemo(() => getCounts('colors', p => String(p.colors || []).split(',').map(s => s.trim())), [products]);

    // Try to extract features
    const neckCounts = useMemo(() => getCounts('neck', p => (p.features || []).filter((f: string) => f.toLowerCase().includes('neck'))), [products]);
    const sleeveCounts = useMemo(() => getCounts('sleeve', p => (p.features || []).filter((f: string) => f.toLowerCase().includes('sleeve'))), [products]);
    const fitCounts = useMemo(() => getCounts('fit', p => [p.fit]), [products]);
    const fabricCounts = useMemo(() => getCounts('fabric', p => [p.fabric]), [products]);
    const patternCounts = useMemo(() => getCounts('pattern', p => (p.features || []).filter((f: string) => f.toLowerCase().includes('print') || f.toLowerCase().includes('solid') || f.toLowerCase().includes('pattern'))), [products]);

    const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

    const handleClearAll = () => {
        onFilterChange(initialFilterState);
    };

    const updateFilter = (key: keyof FilterState, values: string[]) => {
        onFilterChange({ ...filters, [key]: values });
    };

    return (
        <div className="w-full flex-shrink-0 lg:w-64 flex flex-col h-full bg-void border border-border-std shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border-std bg-panel/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="font-bold font-mono uppercase tracking-widest text-text-main flex items-center gap-2 text-[14px]">
                    <span className="w-1.5 h-1.5 bg-cyan border border-cyan/50 shadow-[0_0_5px_#00f0ff]"></span>
                    Filters
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="text-[10px] font-mono text-cyan hover:text-text-main uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                        <X className="h-3 w-3" /> Clear
                    </button>
                )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                <FilterSection
                    title="Price"
                    options={[
                        { value: 'lt500', label: 'Less than ₹500', count: priceCounts['lt500'] },
                        { value: '500-1000', label: '₹500 - ₹1000', count: priceCounts['500-1000'] },
                        { value: '1000-1500', label: '₹1000 - ₹1500', count: priceCounts['1000-1500'] },
                        { value: '1500-2000', label: '₹1500 - ₹2000', count: priceCounts['1500-2000'] },
                        { value: 'gt2000', label: 'More than ₹2000', count: priceCounts['gt2000'] },
                    ]}
                    selectedOptions={filters.price}
                    onChange={(v) => updateFilter('price', v)}
                />

                <FilterSection
                    title="Color"
                    options={[
                        { value: 'Red', label: 'Red' },
                        { value: 'Green', label: 'Green' },
                        { value: 'Yellow', label: 'Yellow' },
                        { value: 'White', label: 'White' },
                        { value: 'Black', label: 'Black' },
                        // dynamically generated remaining colors
                        ...Object.keys(colorCounts)
                            .filter(c => !['Red', 'Green', 'Yellow', 'White', 'Black'].includes(c) && c !== 'undefined' && c.trim() !== '')
                            .map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))
                    ].map(opt => ({ ...opt, count: colorCounts[opt.value] || 0 }))}
                    selectedOptions={filters.color}
                    onChange={(v) => updateFilter('color', v)}
                />

                <FilterSection
                    title="Size"
                    options={[
                        { value: 'S', label: 'S' },
                        { value: 'M', label: 'M' },
                        { value: 'L', label: 'L' },
                        { value: 'XL', label: 'XL' },
                        { value: 'XXL', label: 'XXL' },
                        { value: 'XXXL', label: 'XXXL' },
                    ].map(opt => ({ ...opt, count: sizeCounts[opt.value] || 0 }))}
                    selectedOptions={filters.size}
                    onChange={(v) => updateFilter('size', v)}
                />

                <FilterSection
                    title="Neck"
                    options={[
                        { value: 'Round Neck', label: 'Round Neck' },
                        ...Object.keys(neckCounts).filter(n => n !== 'Round Neck').map(n => ({ value: n, label: n }))
                    ].map(opt => ({ ...opt, count: neckCounts[opt.value] || 0 }))}
                    selectedOptions={filters.neck}
                    onChange={(v) => updateFilter('neck', v)}
                />

                <FilterSection
                    title="Sleeve Length"
                    options={[
                        { value: 'Short Sleeves', label: 'Short Sleeves' },
                        ...Object.keys(sleeveCounts).filter(n => n !== 'Short Sleeves').map(n => ({ value: n, label: n }))
                    ].map(opt => ({ ...opt, count: sleeveCounts[opt.value] || 0 }))}
                    selectedOptions={filters.sleeve}
                    onChange={(v) => updateFilter('sleeve', v)}
                />

                <FilterSection
                    title="Fit"
                    options={[
                        { value: 'Regular Fit', label: 'Regular Fit' },
                        ...Object.keys(fitCounts)
                            .filter(f => f && f !== 'Regular Fit' && f !== 'undefined')
                            .map(f => ({ value: f, label: f }))
                    ].map(opt => ({ ...opt, count: fitCounts[opt.value] || 0 }))}
                    selectedOptions={filters.fit}
                    onChange={(v) => updateFilter('fit', v)}
                />

                <FilterSection
                    title="Fabric"
                    options={[
                        { value: 'Cotton', label: 'Cotton' },
                        ...Object.keys(fabricCounts)
                            .filter(f => f && f !== 'Cotton' && f !== 'undefined')
                            .map(f => ({ value: f, label: f }))
                    ].map(opt => ({ ...opt, count: fabricCounts[opt.value] || 0 }))}
                    selectedOptions={filters.fabric}
                    onChange={(v) => updateFilter('fabric', v)}
                />

                <FilterSection
                    title="Pattern"
                    options={[
                        { value: 'Printed', label: 'Printed' },
                        { value: 'Solid', label: 'Solid' },
                        ...Object.keys(patternCounts)
                            .filter(f => f && f !== 'Printed' && f !== 'Solid' && f !== 'undefined')
                            .map(f => ({ value: f, label: f }))
                    ].map(opt => ({ ...opt, count: patternCounts[opt.value] || 0 }))}
                    selectedOptions={filters.pattern}
                    onChange={(v) => updateFilter('pattern', v)}
                />

                <FilterSection
                    title="Availability"
                    options={[
                        { value: 'in_stock', label: 'In stock', count: products.filter(p => p.is_active).length },
                        { value: 'out_stock', label: 'Out of stock', count: products.filter(p => !p.is_active).length },
                    ]}
                    selectedOptions={filters.availability}
                    onChange={(v) => updateFilter('availability', v)}
                    defaultExpanded={false}
                />
            </div>
        </div>
    );
}
