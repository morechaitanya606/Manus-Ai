'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { useGenerateDesign, useRemoveBackground, useUpscaleImage } from '../../hooks/use-designs';
import { useProducts } from '../../hooks/use-products';
import { Button } from '../../components/ui/button';
import { Sparkles, Wand2, Loader2, Image as ImageIcon, AlertCircle, Zap, ArrowRight, Download, SlidersHorizontal, Settings2, Eraser, PictureInPicture2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { MockupEditor } from '../../components/mockup-editor';

const STYLE_PRESETS = [
  { name: 'Minimalist', image: 'https://picsum.photos/seed/minimal/100/100' },
  { name: 'Anime', image: 'https://picsum.photos/seed/anime/100/100' },
  { name: 'Modern', image: 'https://picsum.photos/seed/modern/100/100' },
  { name: 'Cartoon', image: 'https://picsum.photos/seed/cartoon/100/100' },
  { name: 'Vintage', image: 'https://picsum.photos/seed/vintage/100/100' },
  { name: 'Watercolor', image: 'https://picsum.photos/seed/water/100/100' },
  { name: 'Cyberpunk', image: 'https://picsum.photos/seed/cyber/100/100' },
  { name: '3D Render', image: 'https://picsum.photos/seed/3d/100/100' },
];

const PROMPT_SUGGESTIONS = [
  'A majestic lion wearing a crown, digital art style',
  'Abstract geometric pattern with vibrant neon colors',
  'Vintage retro sunset with palm trees and ocean waves',
  'Cyberpunk city skyline at night with neon reflections',
];

const GENERATION_STEPS = [
  'Analyzing your prompt...',
  'Creating design composition...',
  'Generating artwork...',
  'Refining details...',
  'Finalizing your design...',
];

const GARMENT_COLORS = [
  { name: 'White', class: 'bg-white border-gray-200' },
  { name: 'Black', class: 'bg-black border-black' },
  { name: 'Heather', class: 'bg-[#9CA3AF] border-gray-500' },
  { name: 'Navy', class: 'bg-[#1E3A8A] border-blue-950' },
  { name: 'Red', class: 'bg-[#DC2626] border-red-700' },
  { name: 'Olive', class: 'bg-[#4B5320] border-green-900' },
];

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const ASPECT_RATIOS = ['1:1', '3:4', '4:3'];

export default function StudioPage() {
  const { session, profile } = useAuthStore();
  const { data: products } = useProducts();
  const generateDesign = useGenerateDesign();
  const removeBackground = useRemoveBackground();
  const upscaleImage = useUpscaleImage();

  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('');
  const [temperature, setTemperature] = useState(70);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const [garmentColor, setGarmentColor] = useState('White');
  const [garmentSize, setGarmentSize] = useState('L');

  const [generatedDesign, setGeneratedDesign] = useState<{
    id: string;
    image_url: string;
    credits_remaining?: number;
  } | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    setPrompt((prev) => `Masterpiece, highly detailed, gorgeous, ${prev}, vibrant, 8k resolution, trending on artstation`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerationStep(0);
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);

    try {
      // Pass the advanced params embedded in the prompt for now, 
      // or to the backend API if we update the edge function later.
      const result = await generateDesign.mutateAsync({
        prompt: `[Aspect: ${aspectRatio}] [Temp: ${temperature}] ${prompt}`,
        style_preset: stylePreset || undefined
      });
      setGeneratedDesign(result);
    } catch {
      // Error shown via mutation state
    } finally {
      clearInterval(stepInterval);
      setGenerationStep(0);
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

  const currentCredits = generatedDesign?.credits_remaining ?? profile?.ai_credits ?? 0;
  // Use a product image if available, otherwise fallback
  const baseImage = products?.[0]?.image_url || 'https://picsum.photos/seed/shirt/500/500';

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                Advanced AI <span className="gradient-text">Studio</span>
              </h1>
              <p className="mt-2 text-[hsl(var(--muted-foreground))]">
                Configure your generation settings and visualize on apparel instantly.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[hsl(var(--card))] rounded-full px-4 py-2 border border-[hsl(var(--border))]">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{currentCredits} credits</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Input & Advanced Config (Span 5) */}
          <div className="lg:col-span-5 space-y-6 animate-slide-up">

            {/* 1. Prompt Input with Magic Enhancer */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 relative shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold flex items-center gap-2">
                  1. Design Prompt
                </label>
                <button
                  onClick={handleEnhancePrompt}
                  className="text-xs font-medium text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] px-2.5 py-1 rounded-md hover:bg-[hsl(var(--primary)/0.2)] transition flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Magic Enhance
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your design... e.g., 'A mystical dragon with galaxy wings'"
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition"
              />
            </div>

            {/* 2. Visual Style Presets */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm">
              <label className="text-sm font-bold mb-3 block">2. Visual Style Type</label>
              <div className="grid grid-cols-4 gap-3">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => setStylePreset(stylePreset === style.name ? '' : style.name)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${stylePreset === style.name
                      ? 'border-[hsl(var(--primary))] shadow-md opacity-100 ring-2 ring-[hsl(var(--primary))/0.3]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <Image src={style.image} alt={style.name} fill className="object-cover" unoptimized sizes="100px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-2">
                      <span className="text-[10px] sm:text-xs font-medium text-white px-1 text-center leading-tight">
                        {style.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Advanced Settings */}
            <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                <Settings2 className="h-4 w-4" /> 3. Output Settings
              </h3>

              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] flex justify-between mb-2">
                  <span>AI Creativity (Temperature)</span>
                  <span>{temperature}%</span>
                </label>
                <input
                  type="range"
                  min="0" max="100" step="1"
                  value={temperature}
                  onChange={e => setTemperature(parseInt(e.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                />
                <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                  <span>Strict</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 block">
                  Aspect Ratio
                </label>
                <div className="flex bg-[hsl(var(--muted))] p-1 rounded-lg">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 text-xs py-1.5 rounded-md font-medium transition ${aspectRatio === ratio ? 'bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                        }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button Wrapper */}
            <div className="flex flex-col gap-2">
              <Button
                variant="gradient"
                size="lg"
                className="w-full shadow-lg shadow-[hsl(var(--primary)/0.3)] h-14 text-base"
                onClick={handleGenerate}
                disabled={!prompt.trim() || generateDesign.isPending || currentCredits <= 0}
              >
                {generateDesign.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {GENERATION_STEPS[generationStep]}
                  </>
                ) : currentCredits <= 0 ? (
                  <>
                    <Zap className="mr-2 h-5 w-5 fill-current" />
                    Out of Credits
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Product Design (1 Credit)
                  </>
                )}
              </Button>

              {currentCredits <= 0 && (
                <Link href="/credits" className="w-full">
                  <Button variant="outline" className="w-full border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800">
                    <Zap className="mr-2 h-4 w-4 fill-current" />
                    Buy More Credits
                  </Button>
                </Link>
              )}
            </div>

            {generateDesign.isError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {generateDesign.error.message}
              </div>
            )}
          </div>

          {/* Right: Live Customizer (Span 7) */}
          <div className="lg:col-span-7 animate-slide-up animation-delay-200">
            <div className="bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] p-6 lg:p-8 sticky top-24 shadow-sm flex flex-col md:flex-row gap-8">

              {/* Customizer Canvas */}
              <div className="flex-1 w-full mx-auto max-w-sm ml-0">
                <h3 className="text-lg font-bold font-display mb-4">Live Customizer</h3>
                <div className="w-full aspect-square">
                  {generatedDesign?.image_url ? (
                    // Loaded MockupEditor when generation finishes
                    <MockupEditor
                      baseImage={baseImage}
                      designImage={generatedDesign.image_url}
                    />
                  ) : generateDesign.isPending ? (
                    <div className="w-full h-full rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] flex items-center justify-center flex-col p-6 text-center">
                      <div className="relative mb-6">
                        <div className="h-16 w-16 rounded-full border-4 border-[hsl(var(--primary)/0.2)] border-t-[hsl(var(--primary))] animate-spin mx-auto" />
                        <Sparkles className="h-6 w-6 text-[hsl(var(--primary))] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="font-medium animate-pulse">{GENERATION_STEPS[generationStep]}</p>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-[#f5f5f5] border border-[hsl(var(--border))] flex items-center justify-center relative overflow-hidden">
                      <Image src={baseImage} alt="Base" fill className="object-contain p-4 opacity-70" unoptimized />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[40%] h-[50%] border-2 border-dashed border-[hsl(var(--primary)/0.3)] flex flex-col items-center justify-center text-center p-2">
                          <ImageIcon className="h-8 w-8 text-[hsl(var(--primary)/0.4)] mb-2" />
                          <span className="text-xs text-[hsl(var(--primary)/0.6)] font-medium">Your Generated Design Will Appear Here</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Configurations Side-panel */}
              <div className="w-full md:w-48 shrink-0 flex flex-col gap-6 pt-12 border-t md:border-t-0 md:border-l border-[hsl(var(--border))] md:pl-6">

                <div>
                  <h4 className="text-sm font-bold mb-3">Garment Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {GARMENT_COLORS.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setGarmentColor(color.name)}
                        className={`w-8 h-8 rounded-full border-2 transition shadow-sm ${color.class} ${garmentColor === color.name ? 'ring-2 ring-offset-2 ring-[hsl(var(--primary))] scale-110' : 'hover:scale-105 opacity-80'}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map(size => (
                      <button
                        key={size}
                        onClick={() => setGarmentSize(size)}
                        className={`w-10 h-10 rounded-lg text-xs font-semibold border transition ${garmentSize === size ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]' : 'bg-[hsl(var(--card))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-[hsl(var(--border))]" />

                {generatedDesign && (
                  <div className="flex flex-col gap-3 mt-auto">
                    <p className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded-md border border-green-100 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> Checkout Ready!
                    </p>

                    <div className="w-full">
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1 uppercase tracking-wider font-semibold">Base Price</p>
                      <p className="text-2xl font-bold">₹{products?.[0]?.base_price ? Number(products[0].base_price).toFixed(0) : '499'}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        className="w-full text-xs h-10 border border-[hsl(var(--border))]"
                        onClick={async () => {
                          try {
                            const res = await removeBackground.mutateAsync({
                              designId: generatedDesign.id,
                              imageUrl: generatedDesign.image_url
                            });
                            if (res?.image_url) {
                              setGeneratedDesign(prev => prev ? { ...prev, image_url: res.image_url } : null);
                            }
                          } catch (err) {
                            console.error('BG removal error:', err);
                          }
                        }}
                        disabled={removeBackground.isPending}
                      >
                        {removeBackground.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          <><Eraser className="w-4 h-4 mr-2" /> Remove Background</>
                        )}
                      </Button>

                      <Button
                        variant="secondary"
                        className="w-full text-xs h-10 border border-[hsl(var(--border))]"
                        onClick={async () => {
                          try {
                            const res = await upscaleImage.mutateAsync({
                              designId: generatedDesign.id,
                              imageUrl: generatedDesign.image_url
                            });
                            if (res?.image_url) {
                              setGeneratedDesign(prev => prev ? { ...prev, image_url: res.image_url } : null);
                            }
                          } catch (err) {
                            console.error('Upscale error:', err);
                          }
                        }}
                        disabled={upscaleImage.isPending}
                      >
                        {upscaleImage.isPending ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          <><PictureInPicture2 className="w-4 h-4 mr-2" /> Upscale (4x HD)</>
                        )}
                      </Button>
                    </div>

                    <Link href={`/gallery/${products?.[0]?.id || ''}?design=${generatedDesign.id}`}>
                      <Button className="w-full" variant="gradient">
                        Proceed <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>

                    <Button variant="outline" className="w-full text-xs" onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedDesign.image_url;
                      link.download = `design-${generatedDesign.id}.png`;
                      link.click();
                    }}>
                      <Download className="w-3 h-3 mr-1" /> Download Art
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
