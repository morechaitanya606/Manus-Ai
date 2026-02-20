'use client';

import { DesignStudio } from '../../components/design-studio';
import { Sparkles } from 'lucide-react';

export default function StudioPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
          <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">AI Design Studio</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Create stunning designs with AI, preview on apparel, and sell
          </p>
        </div>
      </div>
      <DesignStudio />
    </div>
  );
}
