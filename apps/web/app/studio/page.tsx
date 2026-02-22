'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { useGenerateDesign } from '../../hooks/use-designs';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Sparkles, Wand2, Loader2, Image as ImageIcon, AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';

const STYLE_PRESETS = [
  'Minimalist', 'Abstract', 'Vintage', 'Graffiti', 'Watercolor',
  'Cyberpunk', 'Japanese', 'Pop Art', 'Geometric', 'Nature',
];

const PROMPT_SUGGESTIONS = [
  'A majestic lion wearing a crown, digital art style',
  'Abstract geometric pattern with vibrant neon colors',
  'Vintage retro sunset with palm trees and ocean waves',
  'Cyberpunk city skyline at night with neon reflections',
  'Minimalist mountain landscape with gradient sky',
];

export default function StudioPage() {
  const { session, profile } = useAuthStore();
  const { data: products } = useProducts();
  const generateDesign = useGenerateDesign();

  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('');
  const [generatedDesign, setGeneratedDesign] = useState<{
    id: string;
    image_url: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      const result = await generateDesign.mutateAsync({ prompt, style_preset: stylePreset || undefined });
      setGeneratedDesign(result);
    } catch {
      // Error shown via mutation state
    }
  };

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] mb-6 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-3">Sign in to start creating</h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">Create an account to access the AI Design Studio and generate custom designs</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login"><Button variant="outline">Sign In</Button></Link>
            <Link href="/signup"><Button variant="gradient">Create Account</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                AI Design <span className="gradient-text">Studio</span>
              </h1>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                Describe your design and let AI create it for you
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-[hsl(var(--border))]">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{profile?.ai_credits ?? 0} credits</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6 animate-slide-up">
            {/* Prompt Input */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
              <label className="text-sm font-medium mb-3 block">Design Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your design... e.g., 'A mystical dragon with galaxy wings'"
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{prompt.length}/1000</span>
              </div>

              {/* Suggestions */}
              <div className="mt-4">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">Try a suggestion:</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] transition truncate max-w-[200px]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Preset */}
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6">
              <label className="text-sm font-medium mb-3 block">Style Preset (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style}
                    onClick={() => setStylePreset(stylePreset === style ? '' : style)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${stylePreset === style
                        ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                        : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]'
                      }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              variant="gradient"
              size="lg"
              className="w-full shadow-lg shadow-[hsl(var(--primary)/0.3)]"
              onClick={handleGenerate}
              disabled={!prompt.trim() || generateDesign.isPending || (profile?.ai_credits ?? 0) <= 0}
            >
              {generateDesign.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Design
                </>
              )}
            </Button>

            {(profile?.ai_credits ?? 0) <= 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                You&apos;re out of AI credits. Contact support to get more.
              </div>
            )}

            {generateDesign.isError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {generateDesign.error.message}
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="animate-slide-up animation-delay-200">
            <div className="bg-white rounded-2xl border border-[hsl(var(--border))] p-6 sticky top-24">
              <h3 className="text-sm font-medium mb-4">Preview</h3>
              <div className="aspect-square rounded-xl bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--border))] flex items-center justify-center overflow-hidden">
                {generatedDesign?.image_url ? (
                  <img
                    src={generatedDesign.image_url}
                    alt="Generated design"
                    className="w-full h-full object-cover"
                  />
                ) : generateDesign.isPending ? (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-[hsl(var(--primary))] animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Creating your design...</p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <ImageIcon className="h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-3" />
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Your generated design will appear here
                    </p>
                  </div>
                )}
              </div>

              {generatedDesign && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Design ready! Apply it to a product:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {products?.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/gallery/${p.id}?design=${generatedDesign.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition text-sm"
                      >
                        <span className="capitalize">{p.category}</span>
                        <span className="text-[hsl(var(--muted-foreground))] ml-auto">${Number(p.base_price).toFixed(0)}</span>
                      </Link>
                    ))}
                  </div>
                  <Link href="/my-designs">
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      View All My Designs
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
