'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { useState } from 'react';

const MOCK_SHOP_ITEMS = [
    {
        id: 'shop-1',
        name: 'Neon Samurai Hoodie',
        description: 'A premium heavyweight hoodie featuring an exclusive cyberpunk neon samurai design. 100% Cotton faced with a cozy fleece interior.',
        price: '75.00',
        image_url: '/images/mockups/hoodie_black_back.jpeg',
        category: 'Hoodie',
        colors: ['BLK'],
        sizes: ['S', 'M', 'L', 'XL'],
        is_new: true,
    },
    {
        id: 'shop-2',
        name: 'Abstract Void T-Shirt',
        description: 'Minimalist abstract graphics on our signature 100% organic cotton tee. Soft, breathable, and pre-shrunk.',
        price: '35.00',
        image_url: '/images/mockups/tshirt_white_front.jpg',
        category: 'T-Shirt',
        colors: ['WHT'],
        sizes: ['M', 'L', 'XL'],
        is_new: false,
    },
    {
        id: 'shop-3',
        name: 'Glitch Art Tote',
        description: 'Heavy duty canvas tote bag with a digital glitch print. Perfect for groceries, records, or your laptop.',
        price: '25.00',
        image_url: '/images/mockups/tote_bag.jpeg',
        category: 'Accessories',
        colors: ['BLK'],
        sizes: ['OS'],
        is_new: true,
    }
];

export default function ShopItemPage() {
    const { id } = useParams<{ id: string }>();
    const item = MOCK_SHOP_ITEMS.find(i => i.id === id);
    const [selectedSize, setSelectedSize] = useState(item?.sizes?.[0] || '');
    const formatPriceINR = (amount: string | number | null | undefined) => {
        const value = Number(amount);
        return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    };

    if (!item) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex justify-center items-center bg-void">
                <div className="text-center">
                    <p className="font-mono text-red-500 uppercase tracking-widest mb-4">Item Not Found</p>
                    <Link href="/shop" className="text-magenta font-mono uppercase tracking-widest hover:underline text-sm border border-magenta px-4 py-2 hover:bg-magenta hover:text-void transition-colors">Return to Shop</Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = () => {
        alert(`Added ${item.name} (Size: ${selectedSize}) to Cart! (Mock)`);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-void text-text-main p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 crt-overlay pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/shop" className="inline-flex items-center gap-2 text-text-dim hover:text-magenta font-mono text-[10px] uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="aspect-square relative flex items-center justify-center bg-panel border border-border-std overflow-hidden group">
                            {item.is_new && (
                                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-magenta text-void font-bold font-mono text-[10px] uppercase tracking-widest">
                                    New Drop
                                </div>
                            )}
                            <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col">
                        <div className="border-l-2 border-magenta pl-6 mb-8">
                            <h1 className="text-3xl md:text-5xl font-mono font-bold text-text-main mb-2 uppercase tracking-tight leading-none">{item.name}</h1>
                            <p className="text-magenta font-mono text-xl tracking-widest">₹{formatPriceINR(item.price)}</p>
                        </div>

                        <div className="prose prose-invert border-b border-border-std pb-8 mb-8">
                            <p className="text-text-dim font-mono text-sm leading-relaxed">{item.description}</p>
                        </div>

                        <div className="mb-8 border-b border-border-std pb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-text-main font-mono text-[10px] uppercase tracking-widest">Size</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {item.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-12 h-12 flex items-center justify-center font-mono text-sm transition-colors ${selectedSize === size ? 'border border-magenta text-magenta bg-magenta/10 font-bold' : 'border border-border-std text-text-dim hover:border-text-dim hover:text-text-main'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-magenta hover:bg-magenta/90 text-void transition-all duration-300 font-bold font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Add to Cart
                            </button>
                            <div className="flex items-center justify-center gap-2 text-text-dim font-mono text-[10px] uppercase tracking-widest">
                                <Truck className="w-3.5 h-3.5" /> Ships directly from our partner facility
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
