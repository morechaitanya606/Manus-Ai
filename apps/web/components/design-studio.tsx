'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../lib/api-client';
import { useAuthStore } from '../stores/auth-store';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Textarea } from './ui/input';
import { toast } from './ui/toast';
import { Badge } from './ui/badge';
import {
  Sparkles,
  Wand2,
  Eye,
  Layers,
  RotateCcw,
  ShoppingBag,
  Shirt,
  MapPin,
  Ruler,
} from 'lucide-react';

type DesignJobResponse = { success: boolean; data: { jobId: string; status: string } };
type DesignStatusResponse = {
  success: boolean;
  data: {
    id: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    imageUrl?: string;
    errorMessage?: string;
  };
};
type MockupResponse = { success: boolean; data: { id: string; previewUrl: string } };
type ProductsResponse = { success: boolean; data: Array<{ id: string; title: string; type: string }> };

const APPAREL_TYPES = [
  { value: 'T-Shirt', label: 'T-Shirt', icon: '👕' },
  { value: 'Hoodie', label: 'Hoodie', icon: '🧥' },
  { value: 'Shirt', label: 'Shirt', icon: '👔' },
  { value: 'Tank Top', label: 'Tank Top', icon: '🎽' },
];

const COLOR_OPTIONS = [
  { value: 'black', label: 'Black', hex: '#1a1a1a' },
  { value: 'white', label: 'White', hex: '#f5f5f5' },
  { value: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { value: 'red', label: 'Red', hex: '#c0392b' },
  { value: 'forest', label: 'Forest', hex: '#2d6a4f' },
  { value: 'charcoal', label: 'Charcoal', hex: '#374151' },
];

const PROMPT_SUGGESTIONS = [
  'Streetwear tiger graphic with cyberpunk neon accents',
  'Minimalist Japanese wave art in indigo ink',
  'Retro 80s synthwave sunset palette design',
  'Abstract watercolor floral arrangement',
  'Gothic calligraphy letter with ornate frame',
  'Psychedelic mushroom forest illustration',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function DesignStudio() {
  const auth = useAuthStore();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [designStatus, setDesignStatus] = useState<string | null>(null);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [selectedApparel, setSelectedApparel] = useState('T-Shirt');
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [position, setPosition] = useState({ x: 200, y: 160 });
  const [scale, setScale] = useState(0.6);
  const [dragging, setDragging] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canCallApi = useMemo(
    () => Boolean(auth.accessToken && auth.user?.tenantId),
    [auth.accessToken, auth.user?.tenantId]
  );

  const productsQuery = useQuery({
    queryKey: ['studio-products', auth.user?.tenantId],
    queryFn: async () => {
      const response = await apiFetch<ProductsResponse>('/products', {
        params: { page: 1, limit: 10 },
      });
      return response.data;
    },
    enabled: canCallApi,
  });

  const selectedProductId = productsQuery.data?.find((p) => p.type === selectedApparel)?.id || productsQuery.data?.[0]?.id;

  // Auto-polling
  useEffect(() => {
    if (isPolling && jobId) {
      pollTimerRef.current = setInterval(async () => {
        try {
          const response = await apiFetch<DesignStatusResponse>(`/designs/status/${jobId}`);
          const { status, imageUrl, errorMessage } = response.data;
          setDesignStatus(status);

          if (status === 'COMPLETED' && imageUrl) {
            setDesignUrl(imageUrl);
            setIsPolling(false);
            toast('success', 'Design Ready!', 'Your AI design has been generated.');
          } else if (status === 'FAILED') {
            setIsPolling(false);
            toast('error', 'Generation Failed', errorMessage || 'Design generation failed.');
          }
        } catch {
          // silent retry
        }
      }, 3000);

      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      };
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isPolling, jobId]);

  const generateDesign = useMutation({
    mutationFn: async () => {
      const response = await apiFetch<DesignJobResponse>('/designs/generate', {
        method: 'POST',
        body: { prompt, apparelType: selectedApparel, color: selectedColor },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      setDesignUrl(null);
      setMockupUrl(null);
      setDesignStatus('QUEUED');
      setIsPolling(true);
      toast('info', 'Design Queued', 'Your design is being generated...');
    },
    onError: (err) => {
      toast('error', 'Error', err instanceof Error ? err.message : 'Failed to queue design');
    },
  });

  const renderMockup = useMutation({
    mutationFn: async () => {
      if (!selectedProductId) throw new Error('No product available for mockup');
      const response = await apiFetch<MockupResponse>('/designs/mockup', {
        method: 'POST',
        body: {
          productId: selectedProductId,
          designImageUrl: designUrl,
          apparelTemplateUrl: `https://picsum.photos/seed/template-${selectedApparel.toLowerCase()}/800/800`,
          placementX: position.x,
          placementY: position.y,
          scale,
          color: selectedColor,
          placement: 'front',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMockupUrl(data.previewUrl);
      toast('success', 'Mockup Rendered!', 'Realistic mockup is ready.');
    },
    onError: (err) => {
      toast('error', 'Mockup Failed', err instanceof Error ? err.message : 'Failed to render mockup');
    },
  });

  const resetStudio = () => {
    setPrompt('');
    setJobId(null);
    setDesignUrl(null);
    setMockupUrl(null);
    setDesignStatus(null);
    setIsPolling(false);
    setPosition({ x: 200, y: 160 });
    setScale(0.6);
    setShowOrderPanel(false);
    setShippingAddress('');
  };

  const handleOrderDesign = async () => {
    if (!shippingAddress.trim()) {
      toast('warning', 'Address Required', 'Please enter your shipping address.');
      return;
    }
    if (!selectedProductId) {
      toast('error', 'No Product', 'Could not find a matching product.');
      return;
    }
    setIsOrdering(true);
    try {
      await apiFetch('/carts/items', {
        method: 'POST',
        body: { productId: selectedProductId, quantity: 1, size: selectedSize, color: selectedColor },
      });
      const idempotencyKey = `studio-order-${Date.now()}`;
      await apiFetch('/orders/checkout', {
        method: 'POST',
        body: { shippingAddress, idempotencyKey, designJobId: jobId },
      });
      toast('success', 'Order Placed! 🎉', 'We\'ll print your custom design and ship it soon.');
      router.push('/orders');
    } catch (err) {
      toast('error', 'Order Failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragging || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setPosition({
      x: Math.max(0, Math.min(600, event.clientX - rect.left - 70)),
      y: Math.max(0, Math.min(600, event.clientY - rect.top - 70)),
    });
  };

  if (!canCallApi) {
    return (
      <div className="text-center py-20 space-y-4">
        <Sparkles className="h-12 w-12 mx-auto text-[hsl(var(--primary))] animate-pulse" />
        <h2 className="text-xl font-semibold">Sign in to access the Design Studio</h2>
        <p className="text-[hsl(var(--muted-foreground))]">Create AI-powered designs for your custom apparel</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Sidebar Controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              AI Prompt
            </CardTitle>
            <CardDescription>Describe your design idea</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream design..."
            />
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1 text-[10px] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition"
                >
                  {s.slice(0, 30)}...
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apparel Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-[hsl(var(--primary))]" />
              Apparel Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {APPAREL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedApparel(type.value)}
                  className={`rounded-lg border p-3 text-left transition ${selectedApparel === type.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--foreground)/0.2)]'
                    }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <p className="text-sm font-medium mt-1">{type.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color */}
        <Card>
          <CardHeader>
            <CardTitle>Base Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-8 w-8 rounded-full border-2 transition ${selectedColor === color.value
                    ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]'
                    : 'border-[hsl(var(--border))]'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scale */}
        <Card>
          <CardHeader>
            <CardTitle>Design Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="range"
              min={0.2}
              max={1.5}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{Math.round(scale * 100)}%</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={!prompt.trim() || generateDesign.isPending}
            loading={generateDesign.isPending}
            onClick={() => generateDesign.mutate()}
          >
            <Sparkles className="h-4 w-4" />
            Generate Design
          </Button>

          <Button
            size="lg"
            className="w-full"
            disabled={!designUrl || !selectedProductId || renderMockup.isPending}
            loading={renderMockup.isPending}
            onClick={() => renderMockup.mutate()}
          >
            <Layers className="h-4 w-4" />
            Render Mockup
          </Button>

          <Button variant="outline" size="sm" className="w-full" onClick={resetStudio}>
            <RotateCcw className="h-4 w-4" />
            Reset Studio
          </Button>
        </div>

        {/* Size Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-[hsl(var(--primary))]" />
              Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${selectedSize === size
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

        {/* Order Panel */}
        {designUrl && (
          <Card className="border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[hsl(var(--primary))]" />
                Order This Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showOrderPanel ? (
                <Button variant="gradient" className="w-full" onClick={() => setShowOrderPanel(true)}>
                  <ShoppingBag className="h-4 w-4" />
                  I Love It — Order Now
                </Button>
              ) : (
                <>
                  <div className="text-sm space-y-1">
                    <p><span className="text-[hsl(var(--muted-foreground))]">Apparel:</span> {selectedApparel}</p>
                    <p><span className="text-[hsl(var(--muted-foreground))]">Size:</span> {selectedSize}</p>
                    <p><span className="text-[hsl(var(--muted-foreground))]">Color:</span> {selectedColor}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Shipping Address
                    </label>
                    <Textarea
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Full name, street, city, state, PIN, phone..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="gradient"
                      className="flex-1"
                      loading={isOrdering}
                      onClick={handleOrderDesign}
                    >
                      Place Order
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowOrderPanel(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status */}
        {designStatus && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Status:</span>
            <Badge variant={
              designStatus === 'COMPLETED' ? 'success' :
                designStatus === 'FAILED' ? 'destructive' :
                  designStatus === 'PROCESSING' ? 'info' : 'warning'
            }>
              {isPolling && (designStatus === 'QUEUED' || designStatus === 'PROCESSING') && (
                <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
              )}
              {designStatus}
            </Badge>
          </div>
        )}
      </div>

      {/* Preview Canvas */}
      <Card className="relative min-h-[500px] overflow-hidden">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            {mockupUrl ? 'Mockup' : designUrl ? 'Overlay' : 'Template'}
          </Badge>
        </div>

        <div
          ref={frameRef}
          className="relative mx-auto aspect-square h-full max-h-[600px] w-full max-w-[600px] overflow-hidden rounded-xl border border-[hsl(var(--border))]"
          style={{ backgroundColor: COLOR_OPTIONS.find((c) => c.value === selectedColor)?.hex || '#1a1a1a' }}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
        >
          {mockupUrl ? (
            <Image src={mockupUrl} alt="Mockup preview" fill sizes="600px" className="object-cover" />
          ) : (
            <>
              {/* Apparel silhouette placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Shirt className="h-48 w-48 text-white/10" />
              </div>

              {designUrl && (
                <motion.div
                  drag
                  dragMomentum={false}
                  onDragStart={() => setDragging(true)}
                  onDragEnd={(_, info) => {
                    setDragging(false);
                    setPosition((prev) => ({
                      x: prev.x + info.offset.x,
                      y: prev.y + info.offset.y,
                    }));
                  }}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: `${180 * scale}px`,
                    height: `${180 * scale}px`,
                  }}
                  className="absolute cursor-grab rounded-md border-2 border-dashed border-white/40 bg-white/5 p-1 backdrop-blur-sm active:cursor-grabbing"
                >
                  <Image src={designUrl} alt="Design overlay" fill className="object-contain" />
                </motion.div>
              )}
            </>
          )}

          {/* Empty state */}
          {!designUrl && !mockupUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 space-y-2">
              <Sparkles className="h-12 w-12" />
              <p className="text-sm font-medium">Generate a design to preview it here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
