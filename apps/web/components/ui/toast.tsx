'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    add: (toast: Omit<Toast, 'id'>) => void;
    remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    add: (toast) => {
        const id = Math.random().toString(36).slice(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, toast.duration || 4000);
    },
    remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(type: ToastType, title: string, description?: string) {
    useToastStore.getState().add({ type, title, description });
}

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
    error: 'border-red-500/30 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200',
    warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200',
    info: 'border-sky-500/30 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200',
};

function ToastItem({ item }: { item: Toast }) {
    const remove = useToastStore((s) => s.remove);
    const Icon = ICONS[item.type];

    return (
        <div
            className={cn(
                'animate-toast-in pointer-events-auto flex w-80 items-start gap-3 rounded-none border border-border-std border p-4 shadow-[0_0_10px_rgba(0,240,255,0.1)] backdrop-blur',
                COLORS[item.type]
            )}
        >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description && <p className="mt-0.5 text-xs opacity-80">{item.description}</p>}
            </div>
            <button onClick={() => remove(item.id)} className="shrink-0 rounded p-0.5 hover:opacity-70 transition">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} item={t} />
            ))}
        </div>
    );
}
