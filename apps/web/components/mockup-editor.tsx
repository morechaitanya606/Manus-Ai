'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the Konva component to avoid SSR issues with canvas/window
const MockupEditorCanvas = dynamic(() => import('./mockup-editor-canvas'), {
    ssr: false,
    loading: () => (
        <div className="w-full aspect-[4/5] sm:aspect-square flex flex-col items-center justify-center bg-void border border-border-std text-cyan font-mono text-xs gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="animate-pulse tracking-widest uppercase text-[10px]">Initializing Engine</span>
        </div>
    )
});

interface MockupEditorProps {
    baseImage: string;
    designImage?: string;
    onSave?: (data: { x: number; y: number; scale: number; rotation: number }) => void;
    onPreview?: (dataUrl: string) => void;
    editorRef?: any;
}

export function MockupEditor(props: MockupEditorProps) {
    return <MockupEditorCanvas {...props} innerRef={props.editorRef} />;
}
