'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { Button } from './ui/button';
import { Textarea } from './ui/input';
import { toast } from './ui/toast';
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
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
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

const CREATION_STEPS = [
  { id: 'capture', label: 'Capture Spark' },
  { id: 'shape', label: 'Shape Concept' },
  { id: 'craft', label: 'Craft Artwork' },
  { id: 'match', label: 'Match Fit' },
  { id: 'cut', label: 'Cut Pattern' },
  { id: 'build', label: 'Build Sample' },
  { id: 'preview', label: 'Preview Style' },
];

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

  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [selectedApparel, setSelectedApparel] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedFabric, setSelectedFabric] = useState('cotton');

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  // History items (mock for UI)
  const [designHistory] = useState([
    { id: '1', name: 'Cyberpunk Tiger Design', time: '2d ago' },
    { id: '2', name: 'Japanese Wave Art', time: '5d ago' },
    { id: '3', name: 'Minimalist Retro Sun', time: '7d ago' },
  ]);

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
    setCurrentStep(0);

    try {
      // Simulate step progression
      for (let i = 0; i < CREATION_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

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
      setCurrentStep(CREATION_STEPS.length);
      toast('success', 'Design Generated! ✨', 'Select your favorite apparel below');
    } catch (err) {
      toast('error', 'Generation Failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Order ─── */
  const handleOrder = async () => {
    if (!auth.session) {
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
    setCurrentStep(0);
  };

  /* ─── MAIN RENDER ─── */
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* ── Left Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] flex-shrink-0">
        <div className="p-4">
          <button
            onClick={resetStudio}
            className="flex items-center gap-2 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[hsl(var(--muted))] transition"
          >
            <Plus className="h-4 w-4" />
            New Design
          </button>
        </div>

        <div className="px-4 pb-2">
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Design History</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {designHistory.map((item) => (
            <button
              key={item.id}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left hover:bg-[hsl(var(--muted))] transition group"
            >
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition">
                <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.time}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-4">
            <Textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream design... e.g. A cyberpunk tiger with neon glow, Japanese wave art, mandala pattern..."
              className="text-base border-[hsl(var(--border))] rounded-xl"
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
              className="w-full rounded-xl"
              disabled={!prompt.trim() || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your design...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Design
                </>
              )}
            </Button>
          </div>

          {/* Creation Progress / Steps */}
          {(isGenerating || generatedImage) && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white overflow-hidden animate-fade-in">
              {/* Status Bar */}
              <div className="px-5 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <div className="flex items-center gap-2 text-sm">
                  {generatedImage ? (
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
                  )}
                  <span className="font-medium">
                    {generatedImage ? 'Custyle completed the creation' : 'Custyle is creating your design...'}
                  </span>
                </div>
              </div>

              <div className="flex">
                {/* Steps Panel */}
                <div className="w-56 border-r border-[hsl(var(--border))] p-4 flex-shrink-0">
                  <div className="space-y-1">
                    {CREATION_STEPS.map((step, i) => {
                      const isDone = i < currentStep || generatedImage !== null;
                      const isCurrent = i === currentStep && isGenerating;
                      return (
                        <div key={step.id} className="flex items-center gap-2 py-1.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] flex-shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))] flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-[hsl(var(--muted-foreground)/0.3)] flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isDone ? 'text-[hsl(var(--primary))] font-medium' : isCurrent ? 'text-[hsl(var(--foreground))] font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Analysis Panel */}
                <div className="flex-1 p-5">
                  {isGenerating ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                        Analyzing your ideas to capture every creative spark...
                      </h3>
                      <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">Prioritizing Initial Requirements</p>
                          <p className="mt-1">Deconstructing the prompt to break down elements for synthesis. Focusing on rigid constraints before fleshing out the scene.</p>
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(var(--foreground))]">Defining Visual Parameters</p>
                          <p className="mt-1">Identifying essential keywords and the color palette. Analyzing symbolic elements and compositional impact.</p>
                        </div>
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                        Design Complete — Select Apparel Below
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Your AI-generated design is ready. Click on any apparel type below to preview and customize it.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Apparel Preview Grid */}
          {generatedImage && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">Preview on All Apparel</h2>
                <Button variant="outline" size="sm" onClick={resetStudio} className="rounded-full">
                  <RotateCcw className="h-4 w-4" />
                  New Design
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {APPAREL_TYPES.map((apparel) => (
                  <button
                    key={apparel.value}
                    onClick={() => {
                      setSelectedApparel(apparel.value);
                      setShowOrderForm(false);
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedApparel === apparel.value
                      ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)] scale-[1.02]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:scale-[1.01]'
                      }`}
                  >
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ backgroundColor: COLOR_OPTIONS.find(c => c.value === selectedColor)?.hex || '#1a1a1a' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-20">{apparel.emoji}</span>
                      </div>
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
                      {selectedApparel === apparel.value && (
                        <div className="absolute top-2 right-2">
                          <span className="rounded-full bg-[hsl(var(--primary))] text-white text-xs px-2.5 py-0.5 font-medium">
                            Selected ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="font-semibold text-sm">{apparel.emoji} {apparel.label}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">From ₹{BASE_PRICES[apparel.value]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customization Panel */}
          {selectedApparel && generatedImage && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-display font-bold">
                Customize Your {APPAREL_TYPES.find(a => a.value === selectedApparel)?.emoji} {selectedApparel}
              </h2>

              {/* Color */}
              <div className="rounded-2xl border border-[hsl(var(--border))] p-4">
                <h3 className="text-sm font-semibold mb-3">Color</h3>
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
              </div>

              {/* Size */}
              <div className="rounded-2xl border border-[hsl(var(--border))] p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Size
                </h3>
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
              </div>

              {/* Fabric */}
              <div className="rounded-2xl border border-[hsl(var(--border))] p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Fabric
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FABRIC_OPTIONS.map((fabric) => (
                    <button
                      key={fabric.value}
                      onClick={() => setSelectedFabric(fabric.value)}
                      className={`rounded-xl border p-3 text-left transition ${selectedFabric === fabric.value
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
              </div>

              {/* Price & Order */}
              <div className="rounded-2xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {APPAREL_TYPES.find(a => a.value === selectedApparel)?.emoji} {selectedApparel} ({selectedSize}, {COLOR_OPTIONS.find(c => c.value === selectedColor)?.label})
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
                  <Button variant="gradient" className="w-full rounded-xl" size="lg" onClick={() => setShowOrderForm(true)}>
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
                        className="flex-1 rounded-xl"
                        loading={isOrdering}
                        onClick={handleOrder}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Place Order — ₹{totalPrice}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowOrderForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Download */}
              {generatedImage && (
                <a
                  href={generatedImage}
                  download={`custyle-design-${Date.now()}.png`}
                  className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
                >
                  <Download className="h-4 w-4" />
                  Download design image
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
