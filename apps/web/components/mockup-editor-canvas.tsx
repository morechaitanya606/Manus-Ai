'use client';

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Focus, Download } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

interface MockupEditorProps {
    baseImage: string;
    designImage?: string;
    onSave?: (data: { x: number; y: number; scale: number; rotation: number }) => void;
    onPreview?: (dataUrl: string) => void;
    innerRef?: any;
}

export default function MockupEditorCanvas({ baseImage, designImage, onSave, onPreview, innerRef }: MockupEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Images
    const [designImg] = useImage(designImage || '', 'anonymous');

    // Nodes
    const designNodeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    // State
    const [isSelected, setIsSelected] = useState(true);

    // Centering logic
    const updateDimensions = useCallback(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setDimensions({ width, height });
        }
    }, []);

    useEffect(() => {
        updateDimensions();
        // A slight delay to ensure container is fully rendered across devices
        const timer = setTimeout(updateDimensions, 100);
        window.addEventListener('resize', updateDimensions);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateDimensions);
        };
    }, [updateDimensions]);

    // Attach transformer
    useEffect(() => {
        if (isSelected && trRef.current && designNodeRef.current) {
            trRef.current.nodes([designNodeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, designImg]);

    // Initial positioning
    useEffect(() => {
        if (designImg && designNodeRef.current && dimensions.width > 0 && dimensions.height > 0) {
            // Recenter and rescale whenever a new image is loaded
            const maxW = dimensions.width * 0.44;
            const maxH = dimensions.height * 0.50;
            const scale = Math.min(maxW / designImg.width, maxH / designImg.height) * 0.8;

            designNodeRef.current.x(dimensions.width / 2);
            designNodeRef.current.y(dimensions.height * 0.45);
            designNodeRef.current.scaleX(scale);
            designNodeRef.current.scaleY(scale);
            designNodeRef.current.rotation(0);
            designNodeRef.current.offsetX(designImg.width / 2);
            designNodeRef.current.offsetY(designImg.height / 2);
            designNodeRef.current.getLayer().batchDraw();
            setIsSelected(true);
        }
    }, [designImg]);

    const checkDeselect = (e: any) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setIsSelected(false);
        }
    };

    const handleCenter = () => {
        if (designNodeRef.current && dimensions.width > 0 && designImg) {
            const maxW = dimensions.width * 0.44;
            const maxH = dimensions.height * 0.50;
            const scale = Math.min(maxW / designImg.width, maxH / designImg.height) * 0.8;

            designNodeRef.current.x(dimensions.width / 2);
            designNodeRef.current.y(dimensions.height * 0.45);
            designNodeRef.current.scaleX(scale);
            designNodeRef.current.scaleY(scale);
            designNodeRef.current.rotation(0);
            designNodeRef.current.offsetX(designImg.width / 2);
            designNodeRef.current.offsetY(designImg.height / 2);
            designNodeRef.current.getLayer().batchDraw();
            setIsSelected(true);
        }
    };

    const handleExport = () => {
        if (stageRef.current && onPreview) {
            // Hide transformer before export
            setIsSelected(false);

            // Wait for next tick to ensure transformer is hidden
            setTimeout(() => {
                if (stageRef.current) {
                    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
                    onPreview(dataUrl);
                }
                // Reselect
                setIsSelected(true);
            }, 50);
        }
    };

    useImperativeHandle(innerRef, () => ({
        exportCanvas: () => {
            if (!stageRef.current) return null;

            // Synchronously detach transformer for pure export
            const wasSelected = isSelected;
            if (wasSelected && trRef.current) {
                trRef.current.nodes([]);
            }

            // Wait for next tick if needed, but Konva batchDraw handles it synchronously on toDataURL
            const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

            // Restore instantly
            if (wasSelected && trRef.current && designNodeRef.current) {
                trRef.current.nodes([designNodeRef.current]);
            }

            return dataUrl;
        }
    }));

    return (
        <div className="flex flex-col gap-3 sm:gap-4 w-full h-full justify-center min-h-0">
            <div
                ref={containerRef}
                className="relative w-full aspect-[4/5] sm:aspect-square bg-void border border-border-std overflow-hidden group/canvas shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center min-h-0 flex-1 max-h-full"
            >
                {/* Cyberpunk grid overlay to match styling */}
                <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-[0.05] pointer-events-none z-0" />
                <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-0" />

                {/* Base Product Image */}
                <Image
                    src={baseImage}
                    alt="Product Base"
                    fill
                    className="object-contain pointer-events-none p-2 sm:p-4 z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] opacity-90"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Print area guide */}
                <div className="absolute w-[44%] h-[50%] border-2 border-dashed border-cyan/30 top-[20%] pointer-events-none flex items-center justify-center z-10 transition-colors group-hover/canvas:border-cyan/60">
                    <span className="text-[9px] text-cyan/40 font-mono uppercase tracking-widest absolute bottom-2">Print Area</span>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan/50"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan/50"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan/50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan/50"></div>
                </div>

                {/* Konva Stage overlay for interactive design layer */}
                {dimensions.width > 0 && (
                    <div className="absolute inset-0 z-20">
                        <Stage
                            ref={stageRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            onMouseDown={checkDeselect}
                            onTouchStart={checkDeselect}
                        >
                            <Layer>
                                {/* Design Image */}
                                {designImg && (
                                    <KonvaImage
                                        image={designImg}
                                        name="designImage"
                                        ref={designNodeRef}
                                        onClick={() => setIsSelected(true)}
                                        onTap={() => setIsSelected(true)}
                                        onDragEnd={(e) => {
                                            if (onSave) {
                                                onSave({
                                                    x: e.target.x(),
                                                    y: e.target.y(),
                                                    scale: e.target.scaleX(),
                                                    rotation: e.target.rotation()
                                                });
                                            }
                                        }}
                                        onTransformEnd={(e) => {
                                            const node = designNodeRef.current;
                                            if (onSave && node) {
                                                onSave({
                                                    x: node.x(),
                                                    y: node.y(),
                                                    scale: node.scaleX(),
                                                    rotation: node.rotation()
                                                });
                                            }
                                        }}
                                        draggable
                                    />
                                )}

                                {isSelected && (
                                    <Transformer
                                        ref={trRef}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            if (newBox.width < 5 || newBox.height < 5) {
                                                return oldBox;
                                            }
                                            return newBox;
                                        }}
                                        anchorStroke="#00f0ff"
                                        anchorFill="#0f0f13"
                                        anchorSize={10}
                                        borderStroke="#00f0ff"
                                        borderDash={[5, 5]}
                                        keepRatio={true}
                                        rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                                    />
                                )}
                            </Layer>
                        </Stage>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex-shrink-0 grid grid-cols-1 bg-panel p-4 border border-border-std shadow-[0_0_10px_rgba(0,0,0,0.5)] relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-magenta/50"></div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <span className="text-[10px] font-mono tracking-widest text-text-dim uppercase text-center sm:text-left">Design Options</span>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCenter}
                            className="w-full sm:w-auto sm:min-w-[136px] justify-center text-[10px] font-mono tracking-widest uppercase h-8 border border-border-std hover:border-cyan hover:text-cyan text-text-dim transition-colors rounded-none flex items-center gap-2"
                        >
                            <Focus className="w-3 h-3" /> Center Layout
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExport}
                            className="w-full sm:w-auto sm:min-w-[136px] justify-center bg-cyan/10 text-[10px] font-mono tracking-widest uppercase h-8 border border-cyan hover:bg-cyan hover:text-void text-cyan transition-colors rounded-none flex items-center gap-2"
                        >
                            <Download className="w-3 h-3" /> Preview Render
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
