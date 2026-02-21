'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Textarea } from './ui/input';
import { toast } from './ui/toast';
import { Badge } from './ui/badge';
import {
  Sparkles,
  Wand2,
  RotateCcw,
  ShoppingBag,
  Shirt,
  MapPin,
  Ruler,
  Download,
  Loader2,
} from 'lucide-react';

/* ─── CONSTANTS ─── */

const APPAREL_TYPES = [
  { value: 'T-Shirt', label: 'T-Shirt', emoji: '👕', fabric: 'Cotton' },
  { value: 'Hoodie', label: 'Hoodie', emoji: '🧥', fabric: 'Fleece' },
  { value: 'Shirt', label: 'Shirt', emoji: '👔', fabric: 'Cotton' },
  { value: 'Jacket', label: 'Jacket', emoji: '🧥', fabric: 'Nylon' },
  { value: 'Tank Top', label: 'Tank Top', emoji: '🎽', fabric: 'Cotton' },
  { value: 'Dress', label: 'Dress', emoji: '👗', fabric: 'Rayon' },
];

const COLOR_OPTIONS = [
  { value: 'black', label: 'Black', hex: '#1a1a1a' },
  { value: 'white', label: 'White', hex: '#f5f5f5' },
  { value: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { value: 'red', label: 'Red', hex: '#c0392b' },
  { value: 'forest', label: 'Forest', hex: '#2d6a4f' },
  { value: 'charcoal', label: 'Charcoal', hex: '#374151' },
  { value: 'burgundy', label: 'Burgundy', hex: '#722f37' },
  { value: 'cream', label: 'Cream', hex: '#f5f0e1' },
];

const FABRIC_OPTIONS = [
  { value: 'cotton', label: 'Cotton', desc: 'Breathable & soft', price: 0 },
  { value: 'silk', label: 'Silk', desc: 'Premium luxury', price: 300 },
  { value: 'polyester', label: 'Polyester', desc: 'Durable & wrinkle-free', price: 100 },
  { value: 'linen', label: 'Linen', desc: 'Cool & natural', price: 200 },
  { value: 'organic', label: 'Organic Cotton', desc: 'Eco-friendly', price: 150 },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const BASE_PRICES: Record<string, number> = {
  'T-Shirt': 599,
  'Hoodie': 1299,
  'Shirt': 899,
  'Jacket': 1799,
  'Tank Top': 449,
  'Dress': 1199,
};

const PROMPT_SUGGESTIONS = [
  'Cyberpunk tiger with neon glow effects',
  'Minimalist Japanese wave art in indigo',
  'Retro 80s synthwave sunset',
  'Abstract watercolor floral arrangement',
  'Geometric mountain landscape with aurora',
  'Indian mandala art with peacock feathers',
  'Psychedelic mushroom forest illustration',
  'Vintage motorcycle with American flag',
];

/* ─── COMPONENT ─── */

export function DesignStudio() {
  const auth = useAuthStore();
  const router = useRouter();

  // Prompt & generation
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Selection
  const [selectedApparel, setSelectedApparel] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('cotton');

  // Order
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  const selectedFabricData = FABRIC_OPTIONS.find(f => f.value === selectedFabric);
  const basePrice = selectedApparel ? BASE_PRICES[selectedApparel] || 599 : 0;
  const totalPrice = basePrice + (selectedFabricData?.price || 0);

  /* ─── Generate Design ─── */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast('warning', 'Enter a Prompt', 'Describe your dream design first.');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setSelectedApparel(null);
    setShowOrderForm(false);

    try {
      const res = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedImage(data.image);
      toast('success', 'Design Generated! ✨', 'Select your favorite apparel below');
    } catch (err) {
      toast('error', 'Generation Failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Order ─── */
  const handleOrder = async () => {
    if (!auth.accessToken) {
      toast('warning', 'Sign In Required', 'Please sign in to place an order.');
      router.push('/login');
      return;
    }
    if (!selectedApparel || !selectedSize || !selectedColor || !selectedFabric) {
      toast('warning', 'Selection Required', 'Pick apparel, size, color, and fabric.');
      return;
    }
    if (!shippingAddress.trim()) {
      toast('warning', 'Address Required', 'Please enter your shipping address.');
      return;
    }
    setIsOrdering(true);
    try {
      // Placeholder for checkout integration
      toast('success', 'Order Placed! 🎉', `Your custom ${selectedApparel} in ${selectedFabric} will be shipped soon.`);
      router.push('/');
    } catch (err) {
      toast('error', 'Order Failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const resetStudio = () => {
    setPrompt('');
    setGeneratedImage(null);
    setSelectedApparel(null);
    setShowOrderForm(false);
    setShippingAddress('');
    setIsOrdering(false);
    setIsGenerating(false);
  };

  /* ─── STEP 1: PROMPT INPUT ─── */
  const renderPromptSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
          Describe Your Design
        </CardTitle>
        <CardDescription>AI will generate your custom design</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A cyberpunk tiger with neon glow, Japanese wave art, mandala pattern..."
          className="text-base"
        />
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1 text-[11px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition"
            >
              {s.length > 35 ? s.slice(0, 35) + '...' : s}
            </button>
          ))}
        </div>
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={!prompt.trim() || isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Design...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Design
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  /* ─── STEP 2: APPAREL PREVIEW GRID ─── */
  const renderApparelPreview = () => {
    if (!generatedImage) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">Preview on All Apparel</h2>
          <Button variant="outline" size="sm" onClick={resetStudio}>
            <RotateCcw className="h-4 w-4" />
            New Design
          </Button>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Click on any apparel to select it and customize further
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {APPAREL_TYPES.map((apparel) => (
            <button
              key={apparel.value}
              onClick={() => {
                setSelectedApparel(apparel.value);
                setShowOrderForm(false);
              }}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedApparel === apparel.value
                  ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)] scale-[1.02]'
                  : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:scale-[1.01]'
                }`}
            >
              {/* Mockup preview area */}
              <div
                className="relative aspect-square overflow-hidden"
                style={{ backgroundColor: COLOR_OPTIONS.find(c => c.value === selectedColor)?.hex || '#1a1a1a' }}
              >
                {/* Apparel silhouette background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-20">{apparel.emoji}</span>
                </div>

                {/* Design overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="relative w-3/5 h-3/5 drop-shadow-2xl">
                    <Image
                      src={generatedImage}
                      alt={`Design on ${apparel.label}`}
                      fill
                      className="object-contain"
                      sizes="200px"
                    />
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedApparel === apparel.value && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-[hsl(var(--primary))] text-white text-xs">
                      Selected ✓
                    </Badge>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="p-3 bg-[hsl(var(--card))]">
                <p className="font-semibold text-sm">{apparel.emoji} {apparel.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">From ₹{BASE_PRICES[apparel.value]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ─── STEP 3: CUSTOMIZATION PANEL ─── */
  const renderCustomization = () => {
    if (!selectedApparel || !generatedImage) return null;

    const apparelData = APPAREL_TYPES.find(a => a.value === selectedApparel);

    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-xl font-display font-bold">
          Customize Your {apparelData?.emoji} {selectedApparel}
        </h2>

        {/* Color */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-9 w-9 rounded-full border-2 transition ${selectedColor === color.value
                      ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-[hsl(var(--primary))]" />
              Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${selectedSize === size
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.3)]'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fabric */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shirt className="h-4 w-4 text-[hsl(var(--primary))]" />
              Fabric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FABRIC_OPTIONS.map((fabric) => (
                <button
                  key={fabric.value}
                  onClick={() => setSelectedFabric(fabric.value)}
                  className={`rounded-lg border p-3 text-left transition ${selectedFabric === fabric.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.2)]'
                    }`}
                >
                  <p className="text-sm font-medium">{fabric.label}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{fabric.desc}</p>
                  {fabric.price > 0 && (
                    <p className="text-[10px] text-[hsl(var(--primary))] mt-0.5">+₹{fabric.price}</p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Summary & Order */}
        <Card className="border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)]">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {apparelData?.emoji} {selectedApparel} ({selectedSize}, {COLOR_OPTIONS.find(c => c.value === selectedColor)?.label})
              </span>
              <span className="text-sm">₹{basePrice}</span>
            </div>
            {(selectedFabricData?.price ?? 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{selectedFabricData?.label} upgrade</span>
                <span className="text-sm">+₹{selectedFabricData?.price}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-2">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-[hsl(var(--primary))]">₹{totalPrice}</span>
            </div>

            {!showOrderForm ? (
              <Button variant="gradient" className="w-full" size="lg" onClick={() => setShowOrderForm(true)}>
                <ShoppingBag className="h-4 w-4" />
                Order This — ₹{totalPrice}
              </Button>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Shipping Address
                  </label>
                  <Textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Full name, street, city, state, PIN code, phone number..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="gradient"
                    className="flex-1"
                    loading={isOrdering}
                    onClick={handleOrder}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Place Order — ₹{totalPrice}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowOrderForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download Design */}
        {generatedImage && (
          <a
            href={generatedImage}
            download={`manusai-design-${Date.now()}.png`}
            className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
          >
            <Download className="h-4 w-4" />
            Download design image
          </a>
        )}
      </div>
    );
  };

  /* ─── MAIN RENDER ─── */
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[hsl(var(--primary)/0.1)] p-2.5">
          <Sparkles className="h-6 w-6 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">AI Design Studio</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Describe your dream design → Preview on all apparel → Order your favorite
          </p>
        </div>
      </div>

      {/* Step 1: Prompt */}
      {renderPromptSection()}

      {/* Generation loading state */}
      {isGenerating && (
        <div className="text-center py-12 space-y-4 animate-pulse">
          <div className="rounded-full bg-[hsl(var(--primary)/0.1)] p-6 w-fit mx-auto">
            <Sparkles className="h-12 w-12 text-[hsl(var(--primary))] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold">Generating your design...</h2>
          <p className="text-[hsl(var(--muted-foreground))]">AI is creating your custom artwork. This takes 5-10 seconds.</p>
        </div>
      )}

      {/* Step 2: Apparel Preview Grid */}
      {renderApparelPreview()}

      {/* Step 3: Customization */}
      {renderCustomization()}
    </div>
  );
}
