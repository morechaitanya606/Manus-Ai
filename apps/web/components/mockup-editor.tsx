'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Move, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from './ui/button';

interface MockupEditorProps {
    baseImage: string;
    designImage: string;
    onSave?: (data: { x: number; y: number; scale: number; rotation: number }) => void;
}

export function MockupEditor({ baseImage, designImage, onSave }: MockupEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(0.4); // Start at 40% size
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;

        // Boundaries checking could be added here
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        onSave?.({ x: position.x, y: position.y, scale, rotation });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="relative w-full aspect-square bg-[#f5f5f5] rounded-xl overflow-hidden border border-[hsl(var(--border))] flex items-center justify-center"
            >
                {/* Base Product Image (e.g., T-Shirt Vector) */}
                <Image
                    src={baseImage}
                    alt="Product Base"
                    fill
                    className="object-contain pointer-events-none p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Printable Box Guide (Optional, can be hidden) */}
                <div className="absolute w-[40%] h-[50%] border-2 border-dashed border-[hsl(var(--primary)/0.2)] top-[20%] pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-[hsl(var(--primary)/0.4)] font-medium uppercase tracking-widest absolute bottom-2">Print Area</span>
                </div>

                {/* Draggable Design Overlay */}
                <div
                    className="absolute cursor-move inline-flex items-center justify-center group"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                        touchAction: 'none'
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                >
                    <div className="relative">
                        {/* The Design Image */}
                        <img
                            src={designImage}
                            alt="Design"
                            className="max-w-[300px] h-auto pointer-events-none drop-shadow-md"
                            draggable={false}
                        />

                        {/* Overlay Controls (Visible on hover/drag) */}
                        <div className={`absolute inset-0 border-2 border-[hsl(var(--primary))] transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {/* Drag Handle Indicator */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[hsl(var(--card))] p-1.5 rounded-full shadow-md text-[hsl(var(--primary))]">
                                <Move className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 bg-[hsl(var(--card))] p-4 rounded-xl border border-[hsl(var(--border))]">
                <div>
                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex justify-between mb-2">
                        <span>Size</span>
                        <span>{Math.round(scale * 100)}%</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setScale(s => Math.max(0.1, s - 0.05))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <input
                            type="range"
                            min="0.1" max="1" step="0.01"
                            value={scale}
                            onChange={e => setScale(parseFloat(e.target.value))}
                            className="flex-1 accent-[hsl(var(--primary))]"
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setScale(s => Math.min(1, s + 0.05))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex justify-between mb-2">
                        <span>Rotation</span>
                        <span>{rotation}°</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="-180" max="180" step="1"
                            value={rotation}
                            onChange={e => setRotation(parseInt(e.target.value))}
                            className="flex-1 accent-[hsl(var(--primary))]"
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" onClick={() => setRotation(r => (r + 90) % 360)}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="col-span-2 pt-2 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => { setPosition({ x: 0, y: 0 }); setScale(0.4); setRotation(0); }} className="text-xs h-7">
                        Reset Position
                    </Button>
                </div>
            </div>
        </div>
    );
}
