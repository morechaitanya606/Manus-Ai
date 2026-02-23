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
                className="relative w-full aspect-square bg-void border border-border-std overflow-hidden group/canvas shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
                {/* Cyberpunk Scanner Lines & Background */}
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-[0.05] pointer-events-none z-0" />
                <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-0" />

                {/* Base Product Image (e.g., T-Shirt Vector) */}
                <Image
                    src={baseImage}
                    alt="Product Base"
                    fill
                    className="object-contain pointer-events-none p-4 z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Printable Box Guide (Optional, can be hidden) */}
                <div className="absolute w-[40%] h-[50%] border border-dashed border-cyan/30 top-[20%] pointer-events-none flex items-center justify-center z-10 transition-colors group-hover/canvas:border-cyan/60">
                    <span className="text-[9px] text-cyan/40 font-mono uppercase tracking-widest absolute bottom-2">Print Area</span>
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan/50"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan/50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan/50"></div>
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
                        <div className={`absolute inset-0 border-2 border-cyan transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {/* Drag Handle Indicator */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel p-1.5 rounded-none border border-border-std border-dashed shadow-md text-cyan">
                                <Move className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4 bg-panel p-4 border border-border-std shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                <div>
                    <label className="text-[10px] font-mono tracking-widest text-text-dim uppercase flex justify-between mb-3 border-b border-border-std pb-1">
                        <span>Scale</span>
                        <span className="text-cyan">{Math.round(scale * 100)}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border border-border-std shrink-0 text-text-dim hover:text-cyan hover:border-cyan hover:bg-cyan/10 transition-colors" onClick={() => setScale(s => Math.max(0.1, s - 0.05))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <input
                            type="range"
                            min="0.1" max="1" step="0.01"
                            value={scale}
                            onChange={e => setScale(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-void appearance-none cursor-pointer border border-border-std
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-cyan
                                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none"
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border border-border-std shrink-0 text-text-dim hover:text-cyan hover:border-cyan hover:bg-cyan/10 transition-colors" onClick={() => setScale(s => Math.min(1, s + 0.05))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-mono tracking-widest text-text-dim uppercase flex justify-between mb-3 border-b border-border-std pb-1">
                        <span>Rotation</span>
                        <span className="text-magenta">{rotation}°</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="-180" max="180" step="1"
                            value={rotation}
                            onChange={e => setRotation(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-void appearance-none cursor-pointer border border-border-std
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-magenta [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-magenta
                                [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-magenta [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none"
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border border-border-std shrink-0 text-text-dim hover:text-magenta hover:border-magenta hover:bg-magenta/10 transition-colors" onClick={() => setRotation(r => (r + 90) % 360)}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="col-span-2 pt-2 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => { setPosition({ x: 0, y: 0 }); setScale(0.4); setRotation(0); }} className="text-[10px] font-mono tracking-widest uppercase h-8 border border-transparent hover:border-text-dim/50 text-text-dim transition-colors rounded-none">
                        Reset Canvas
                    </Button>
                </div>
            </div>
        </div>
    );
}
