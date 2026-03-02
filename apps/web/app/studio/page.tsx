'use client';

import { useCallback, useEffect, useState, useRef, Suspense, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { useGenerateDesign, useUploadDesign, useRemoveBackground, useUpscaleImage } from '../../hooks/use-designs';
import { useProducts, useProduct } from '../../hooks/use-products';
import { Sparkles, Terminal, Activity, Shuffle, ZoomIn, ZoomOut, Layers as LayersIcon, ArrowRight, Shirt, AlertCircle, Loader2, X, Download, Upload, Wand2, ScissorsLineDashed, ChevronDown, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { MockupEditor } from '../../components/mockup-editor';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { hasUnlimitedCreditsAccess } from '../../lib/roles';

const MockupViewer3D = dynamic(() => import('../../components/mockup-viewer-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-void border border-border-std text-magenta font-mono text-xs gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="animate-pulse tracking-widest uppercase text-[10px]">Loading 3D Engine...</span>
    </div>
  )
});

const GENERATION_STEPS = [
  'Allocating Neural Nodes...',
  'Synthesizing Pixels...',
  'Refining Output Array...',
  'Finalizing Asset...',
];

const normalizeColorToken = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const COLOR_TOKEN_ALIASES: Record<string, string> = {
  blk: 'black',
  black: 'black',
  wht: 'white',
  white: 'white',
  offwhite: 'white',
  ivory: 'white',
  natural: 'white',
  gry: 'gray',
  grey: 'gray',
  gray: 'gray',
  heathergray: 'gray',
  heathergrey: 'gray',
  nvy: 'navy',
  navy: 'navy',
  red: 'red',
  maroon: 'red',
  burgundy: 'red',
  grn: 'green',
  green: 'green',
  olive: 'olive',
  blue: 'blue',
  blu: 'blue',
  yellow: 'yellow',
  ylw: 'yellow',
  orange: 'orange',
  org: 'orange',
  pink: 'pink',
  pnk: 'pink',
  purple: 'purple',
  ppl: 'purple',
  brown: 'brown',
  brn: 'brown',
  tan: 'tan',
  cream: 'cream',
};

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#16161A',
  white: '#F5F5F5',
  gray: '#2A2A35',
  navy: '#1B2A4A',
  red: '#8B1A1A',
  green: '#1A3C2A',
  olive: '#3B4A31',
  blue: '#1A365D',
  yellow: '#B7791F',
  orange: '#C05621',
  pink: '#97266D',
  purple: '#44337A',
  brown: '#5E4028',
  tan: '#D6BC98',
  cream: '#FFFDD0',
};

const canonicalizeColorToken = (value: string): string => {
  const normalized = normalizeColorToken(value);
  return COLOR_TOKEN_ALIASES[normalized] || normalized;
};

const parseHexColor = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '').trim();
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) return null;

  const full = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const getColorHexFromName = (colorName: string): string => {
  const trimmed = colorName.trim();

  if (/^#([0-9A-F]{3}){1,2}$/i.test(trimmed)) {
    return trimmed;
  }

  const canonical = canonicalizeColorToken(trimmed);
  return COLOR_HEX_MAP[canonical] || '#16161A';
};

const isLightColor = (value: string): boolean => {
  const canonical = canonicalizeColorToken(value);
  if (canonical === 'white' || canonical === 'cream' || canonical === 'tan') return true;

  const rgb = parseHexColor(getColorHexFromName(value));
  if (!rgb) return false;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance >= 0.72;
};

const FALLBACK_COLORS = [
  { name: 'BLK', hex: '#16161A' },
  { name: 'WHT', hex: '#F5F5F5' },
  { name: 'GRY', hex: '#2A2A35' },
  { name: 'NVY', hex: '#1B2A4A' },
  { name: 'RED', hex: '#8B1A1A' },
  { name: 'GRN', hex: '#1A3C2A' },
];

const GARMENT_TYPES = [
  { id: 'tshirt', label: 'T-Shirt', icon: <Shirt className="w-3 h-3" /> },
  { id: 'hoodie', label: 'Hoodie', icon: <LayersIcon className="w-3 h-3" /> },
  { id: 'bag', label: 'Tote Bag', icon: <ShoppingBag className="w-3 h-3" /> },
];

const mapCategoryToGarmentType = (category: string): 'tshirt' | 'hoodie' | 'bag' => {
  const value = category.toLowerCase();
  if (value.includes('hood') || value.includes('sweater')) return 'hoodie';
  if (value.includes('bag') || value.includes('tote')) return 'bag';
  return 'tshirt';
};

const PRINT_PLACEMENTS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'both', label: 'Both' },
];

const SIZES = ['S', 'M', 'L', 'XL'];
const STYLE_PRESETS = [
  { value: 'none', label: 'No Style' },
  { value: 'anime', label: 'Anime' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'vintage', label: 'Vintage Poster' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'pop-art', label: 'Pop Art' },
  { value: 'line-art', label: 'Line Art' },
];
type EditPosition = 'top' | 'center' | 'bottom';
type AddonIcon = 'none' | 'star' | 'lightning' | 'crown' | 'heart' | 'fire';
type StudioDesign = { id: string; image_url: string };
const DUPLICATE_DISTANCE_THRESHOLD = 4;
const ADDON_ICON_OPTIONS: Array<{ value: AddonIcon; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'star', label: 'Star' },
  { value: 'lightning', label: 'Lightning' },
  { value: 'crown', label: 'Crown' },
  { value: 'heart', label: 'Heart' },
  { value: 'fire', label: 'Fire' },
];

function StudioContent() {
  const searchParams = useSearchParams();
  const initGarmentType = searchParams.get('product') || 'tshirt';
  const initGarmentColor = searchParams.get('color') || 'BLK';
  const initProductId = searchParams.get('productId') || undefined;

  const { session, profile } = useAuthStore();
  const { data: allProducts } = useProducts();
  const { data: selectedProduct } = useProduct(initProductId);
  const generateDesign = useGenerateDesign();
  const uploadDesign = useUploadDesign();
  const removeBackground = useRemoveBackground();
  const upscaleImage = useUpscaleImage();

  const [prompt, setPrompt] = useState('');
  const [garmentType, setGarmentType] = useState(initGarmentType);
  const [printPlacement, setPrintPlacement] = useState<'front' | 'back' | 'both'>('front');
  const [garmentView, setGarmentView] = useState<'front' | 'back'>('front');
  const [garmentColor, setGarmentColor] = useState(initGarmentColor);
  const [garmentSize, setGarmentSize] = useState('M');
  const [stylePreset, setStylePreset] = useState('none');
  const [editText, setEditText] = useState('');
  const [editPosition, setEditPosition] = useState<EditPosition>('bottom');
  const [editColor, setEditColor] = useState('#ffffff');
  const [editAddonIcon, setEditAddonIcon] = useState<AddonIcon>('none');
  const [generationStep, setGenerationStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isReferenceUploading, setIsReferenceUploading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [promptReferenceImage, setPromptReferenceImage] = useState<{ url: string; name: string } | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);

  const [previewImages, setPreviewImages] = useState<{ front: string | null, back: string | null }>({ front: null, back: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');

  const [generatedDesigns, setGeneratedDesigns] = useState<StudioDesign[]>([]);

  const [activeLayers, setActiveLayers] = useState<{ front: string | null, back: string | null }>({ front: null, back: null });
  const frontEditorRef = useRef<any>(null);
  const backEditorRef = useRef<any>(null);
  const signatureCacheRef = useRef<Map<string, string>>(new Map());
  const normalizedUrlCacheRef = useRef<Map<string, string>>(new Map());
  const generatedDesignsRef = useRef<StudioDesign[]>([]);
  const isResizingLeftPanelRef = useRef(false);

  useEffect(() => {
    generatedDesignsRef.current = generatedDesigns;
  }, [generatedDesigns]);

  const resolveDesignImageUrl = (design: any): string | null => {
    return (
      design?.image_url ||
      design?.print_ready_url ||
      design?.original_image_url ||
      design?.record?.image_url ||
      design?.record?.print_ready_url ||
      design?.record?.original_image_url ||
      null
    );
  };

  const hammingDistance = (a: string, b: string) => {
    const length = Math.min(a.length, b.length);
    let distance = Math.abs(a.length - b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] !== b[i]) distance++;
    }
    return distance;
  };

  const getComparableImageUrl = useCallback((imageUrl: string): string => {
    const raw = String(imageUrl || '').trim();
    if (!raw) return '';

    const cached = normalizedUrlCacheRef.current.get(raw);
    if (cached) return cached;

    const queryIndex = raw.indexOf('?');
    const hashIndex = raw.indexOf('#');
    let end = raw.length;

    if (queryIndex !== -1) end = Math.min(end, queryIndex);
    if (hashIndex !== -1) end = Math.min(end, hashIndex);

    const normalized = raw.slice(0, end);
    normalizedUrlCacheRef.current.set(raw, normalized);
    return normalized;
  }, []);

  const loadImageElement = useCallback((src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Image load failed'));
      image.src = src;
    }), []);

  const getImageSignature = useCallback(async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl) return null;
    const signatureKey = getComparableImageUrl(imageUrl) || imageUrl;
    const cached = signatureCacheRef.current.get(signatureKey);
    if (cached) return cached;

    let imageForHash: HTMLImageElement | null = null;
    let objectUrl: string | null = null;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Image fetch failed');
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      imageForHash = await loadImageElement(objectUrl);
    } catch {
      try {
        imageForHash = await loadImageElement(imageUrl);
      } catch {
        return null;
      }
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 8;
      canvas.height = 8;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return null;

      context.drawImage(imageForHash, 0, 0, 8, 8);
      const pixels = context.getImageData(0, 0, 8, 8).data;

      const luminance: number[] = [];
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        luminance.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
      }

      const average = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
      const signature = luminance.map((value) => (value >= average ? '1' : '0')).join('');
      signatureCacheRef.current.set(signatureKey, signature);
      return signature;
    } catch {
      return null;
    }
  }, [getComparableImageUrl, loadImageElement]);

  const appendUniqueDesigns = async (incoming: StudioDesign[]) => {
    const uniqueIncoming: StudioDesign[] = [];
    let duplicateCount = 0;
    const existingSnapshot = [...generatedDesignsRef.current];

    for (const design of incoming) {
      const candidate: StudioDesign = {
        id: String(design.id),
        image_url: String(design.image_url).trim(),
      };

      if (!candidate.id || !candidate.image_url) {
        duplicateCount++;
        continue;
      }

      const comparePool = [...existingSnapshot, ...uniqueIncoming];
      const candidateComparableUrl = getComparableImageUrl(candidate.image_url);
      const exactDuplicate = comparePool.some(
        (existing) =>
          existing.id === candidate.id ||
          existing.image_url === candidate.image_url ||
          getComparableImageUrl(existing.image_url) === candidateComparableUrl
      );

      if (exactDuplicate) {
        duplicateCount++;
        continue;
      }

      let nearDuplicate = false;
      const candidateSignature = await getImageSignature(candidate.image_url);
      if (candidateSignature) {
        for (const existing of comparePool) {
          const existingSignature = await getImageSignature(existing.image_url);
          if (
            existingSignature &&
            hammingDistance(candidateSignature, existingSignature) <= DUPLICATE_DISTANCE_THRESHOLD
          ) {
            nearDuplicate = true;
            break;
          }
        }
      }

      if (nearDuplicate) {
        duplicateCount++;
        continue;
      }

      uniqueIncoming.push(candidate);
    }

    if (uniqueIncoming.length > 0) {
      generatedDesignsRef.current = [...generatedDesignsRef.current, ...uniqueIncoming];
      setGeneratedDesigns((prev) => [...prev, ...uniqueIncoming]);
    }

    return {
      addedDesigns: uniqueIncoming,
      duplicateCount,
    };
  };

  const removeDesignFromLibrary = (designId: string) => {
    const removed = generatedDesignsRef.current.find((d) => d.id === designId);
    if (removed?.image_url) {
      const signatureKey = getComparableImageUrl(removed.image_url) || removed.image_url;
      signatureCacheRef.current.delete(signatureKey);
      normalizedUrlCacheRef.current.delete(removed.image_url);
    }

    generatedDesignsRef.current = generatedDesignsRef.current.filter((d) => d.id !== designId);
    setGeneratedDesigns((prev) => prev.filter((d) => d.id !== designId));
    setActiveLayers((prev) => ({
      front: prev.front === designId ? null : prev.front,
      back: prev.back === designId ? null : prev.back,
    }));
  };

  useEffect(() => {
    let cancelled = false;

    const pruneExistingDuplicates = async () => {
      const snapshot = [...generatedDesignsRef.current];
      if (snapshot.length < 2) return;

      const uniqueDesigns: StudioDesign[] = [];
      let duplicateCount = 0;

      for (const design of snapshot) {
        const candidate: StudioDesign = {
          id: String(design.id),
          image_url: String(design.image_url || '').trim(),
        };

        if (!candidate.id || !candidate.image_url) {
          duplicateCount++;
          continue;
        }

        const candidateComparableUrl = getComparableImageUrl(candidate.image_url);
        const exactDuplicate = uniqueDesigns.some(
          (existing) =>
            existing.id === candidate.id ||
            existing.image_url === candidate.image_url ||
            getComparableImageUrl(existing.image_url) === candidateComparableUrl
        );
        if (exactDuplicate) {
          duplicateCount++;
          continue;
        }

        let nearDuplicate = false;
        const candidateSignature = await getImageSignature(candidate.image_url);
        if (candidateSignature) {
          for (const existing of uniqueDesigns) {
            const existingSignature = await getImageSignature(existing.image_url);
            if (
              existingSignature &&
              hammingDistance(candidateSignature, existingSignature) <= DUPLICATE_DISTANCE_THRESHOLD
            ) {
              nearDuplicate = true;
              break;
            }
          }
        }

        if (nearDuplicate) {
          duplicateCount++;
          continue;
        }

        uniqueDesigns.push(candidate);
      }

      if (cancelled || duplicateCount === 0) return;

      generatedDesignsRef.current = uniqueDesigns;
      setGeneratedDesigns(uniqueDesigns);
      toast.info(`Duplicates removed: ${duplicateCount}`);

      const validIds = new Set(uniqueDesigns.map((design) => design.id));
      setActiveLayers((prev) => ({
        front: prev.front && validIds.has(prev.front) ? prev.front : null,
        back: prev.back && validIds.has(prev.back) ? prev.back : null,
      }));
    };

    void pruneExistingDuplicates();

    return () => {
      cancelled = true;
    };
  }, [generatedDesigns, getComparableImageUrl, getImageSignature]);

  const getCurrentLayerDesign = () => {
    const layerId = activeLayers[garmentView as 'front' | 'back'];
    if (!layerId) return null;
    return generatedDesigns.find((d) => d.id === layerId) || null;
  };

  const runGeneration = async (
    referenceImageUrl?: string,
    editOptions?: {
      text?: string;
      position?: EditPosition;
      color?: string;
      addon_icon?: AddonIcon;
    },
    promptOverride?: string
  ) => {
    const normalizedPrompt = (promptOverride ?? prompt).trim();
    const selectedStyle = stylePreset !== 'none' ? stylePreset : undefined;
    const normalizedEditOptions = editOptions
      ? {
        text: editOptions.text?.trim() || undefined,
        position: editOptions.position,
        color: editOptions.color,
        addon_icon: editOptions.addon_icon && editOptions.addon_icon !== 'none' ? editOptions.addon_icon : undefined,
      }
      : undefined;

    if (!normalizedPrompt && !referenceImageUrl) return;

    setGenerationStep(0);
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const result = await generateDesign.mutateAsync({
        prompt: normalizedPrompt,
        style_preset: selectedStyle,
        reference_image_url: referenceImageUrl,
        edit_options: normalizedEditOptions,
      });
      const record = (result as any)?.record ?? result;
      const imageUrl = resolveDesignImageUrl(record);

      if (record?.id && imageUrl) {
        const normalizedDesign = {
          id: String(record.id),
          image_url: String(imageUrl),
        };
        const { addedDesigns, duplicateCount } = await appendUniqueDesigns([normalizedDesign]);
        if (duplicateCount > 0) {
          toast.info(`Duplicates removed: ${duplicateCount}`);
        }
        if (addedDesigns.length > 0) {
          const latest = addedDesigns[addedDesigns.length - 1];
          setActiveLayers((prev) => ({ ...prev, [garmentView]: latest.id }));
        }
      } else {
        console.error('Invalid generate-design response:', result);
        alert('Design generated but image data was missing. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      clearInterval(stepInterval);
      setGenerationStep(0);
    }
  };

  const handleGenerate = async () => {
    const referenceUrl = promptReferenceImage?.url?.trim();
    if (!prompt.trim() && !referenceUrl) {
      alert('Enter a prompt or upload a reference image for edit.');
      return;
    }
    await runGeneration(referenceUrl || undefined);
  };

  const handleEditActive = async () => {
    const activeDesign = getCurrentLayerDesign();
    const editSourceUrl = activeDesign?.image_url || promptReferenceImage?.url;
    if (!editSourceUrl) {
      alert('Select an active image or upload a prompt reference image first.');
      return;
    }
    const hasStructuredEdits = Boolean(editText.trim()) || editAddonIcon !== 'none';
    if (!prompt.trim() && !hasStructuredEdits) {
      alert('Tell what to edit in prompt or use advanced text/add-on fields.');
      return;
    }
    await runGeneration(editSourceUrl, {
      text: editText.trim() || undefined,
      position: editPosition,
      color: editColor,
      addon_icon: editAddonIcon,
    });
  };

  const handlePromptReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!session) {
      alert("Please sign in to upload designs.");
      return;
    }

    setIsReferenceUploading(true);
    try {
      const result = await uploadDesign.mutateAsync(file);
      const imageUrl = resolveDesignImageUrl(result);
      if (!imageUrl) {
        throw new Error('Uploaded image URL missing.');
      }
      setPromptReferenceImage({ url: String(imageUrl), name: file.name });
      toast.success('Reference image ready for prompt edits');
    } catch (error: any) {
      console.error('Reference upload error:', error);
      alert(error?.message || 'Failed to upload reference image.');
    } finally {
      setIsReferenceUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!session) {
      alert("Please sign in to upload designs.");
      return;
    }

    setIsUploading(true);
    try {
      const addedDesigns: Array<{ id: string; image_url: string }> = [];
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          const result = await uploadDesign.mutateAsync(file);
          const imageUrl = resolveDesignImageUrl(result);

          if (result?.id && imageUrl) {
            addedDesigns.push({
              id: String(result.id),
              image_url: String(imageUrl),
            });
          } else {
            failedFiles.push(file.name);
          }
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          failedFiles.push(file.name);
        }
      }

      const { addedDesigns: uniqueDesigns, duplicateCount } = await appendUniqueDesigns(addedDesigns);
      if (duplicateCount > 0) {
        toast.info(`Duplicates removed: ${duplicateCount}`);
      }

      if (uniqueDesigns.length > 0) {
        const latest = uniqueDesigns[uniqueDesigns.length - 1];
        setActiveLayers((prev) => ({ ...prev, [garmentView]: latest.id }));
      }

      if (failedFiles.length > 0 || duplicateCount > 0) {
        const duplicateMessage =
          duplicateCount > 0 ? `, skipped ${duplicateCount} duplicate(s)` : '';
        const failedMessage =
          failedFiles.length > 0 ? `. Failed: ${failedFiles.join(', ')}` : '.';
        alert(
          `Uploaded ${uniqueDesigns.length}/${files.length} unique file(s)${duplicateMessage}${failedMessage}`
        );
      } else if (uniqueDesigns.length === 0) {
        alert('Failed to upload selected files.');
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const handleAiModify = async (action: 'remove_background' | 'variations') => {
    const currentActiveLayer = activeLayers[garmentView as 'front' | 'back'];
    if (!currentActiveLayer) return;

    const activeDesign = generatedDesigns.find((d) => d.id === currentActiveLayer);
    if (!activeDesign?.image_url) {
      alert('No active image available for modification.');
      return;
    }

    setIsModifying(true);
    try {
      const result =
        action === 'remove_background'
          ? await removeBackground.mutateAsync({
            designId: currentActiveLayer,
            imageUrl: activeDesign.image_url,
          })
          : await upscaleImage.mutateAsync({
            designId: currentActiveLayer,
            imageUrl: activeDesign.image_url,
          });

      const newImageUrl = resolveDesignImageUrl(result);
      if (!newImageUrl) {
        throw new Error('AI modification succeeded but no image URL was returned.');
      }

      setGeneratedDesigns((prev) =>
        prev.map((design) =>
          design.id === currentActiveLayer ? { ...design, image_url: newImageUrl } : design
        )
      );
    } catch (error: any) {
      console.error('AI modify error:', error);
      alert(error?.message || 'Failed to apply AI modification.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleShufflePrompt = () => {
    const ideas = ['Cyberpunk samurai cat, neon noir', 'Digital data rain matrix style', 'Abstract neon liquid swirls in dark void'];
    setPrompt(ideas[Math.floor(Math.random() * ideas.length)]);
  };

  const handleZoomIn = () => {
    setCanvasZoom((prev) => Math.min(prev + 10, 180));
  };

  const handleZoomOut = () => {
    setCanvasZoom((prev) => Math.max(prev - 10, 60));
  };

  const handleZoomReset = () => {
    setCanvasZoom(100);
  };

  const clampLeftPanelWidth = useCallback((value: number) => {
    return Math.min(520, Math.max(280, value));
  }, []);

  const startLeftPanelResize = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    event.preventDefault();
    isResizingLeftPanelRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingLeftPanelRef.current) return;
      setLeftPanelWidth(clampLeftPanelWidth(event.clientX));
    };

    const stopResizing = () => {
      if (!isResizingLeftPanelRef.current) return;
      isResizingLeftPanelRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [clampLeftPanelWidth]);

  const handlePreviewAll = () => {
    // Only capture and export the canvases that have an active design loaded AND are allowed by printPlacement
    const useFront = printPlacement === 'front' || printPlacement === 'both';
    const useBack = printPlacement === 'back' || printPlacement === 'both';

    const frontUrl = useFront && activeDesignFront && frontEditorRef.current ? frontEditorRef.current.exportCanvas() : null;
    const backUrl = useBack && activeDesignBack && backEditorRef.current ? backEditorRef.current.exportCanvas() : null;

    setPreviewImages({ front: frontUrl, back: backUrl });
    setModalOpen(true);
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-void text-text-main p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
        <div className="absolute inset-0 crt-overlay pointer-events-none" />

        <div className="text-center max-w-md border border-border-std bg-panel/80 backdrop-blur p-8 relative z-10 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan"></div>

          <Terminal className="h-12 w-12 text-cyan mx-auto mb-4" />
          <h1 className="text-xl font-mono font-bold text-text-main mb-2 uppercase tracking-widest">Sign in to start creating</h1>
          <p className="text-text-dim font-mono text-xs mb-8">Create an account to access the AI Design Studio and generate custom designs.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-6 py-2 border border-cyan text-cyan font-mono text-xs hover:bg-cyan hover:text-void transition-colors uppercase font-bold tracking-widest">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic base image selection — picks the correct product photo based on garmentType + garmentColor
  const getBaseImage = (type: string, view: string): string => {
    const isWhite = isLightColor(garmentColor);

    const imageMap: Record<string, Record<string, { white: string; black: string }>> = {
      tshirt: {
        front: {
          white: '/images/mockups/tshirt_white_front.jpg',
          black: '/images/mockups/tshirt_black_front.jpeg',
        },
        back: {
          white: '/images/mockups/tshirt_white_back.jpeg',
          black: '/images/mockups/tshirt_black_back.jpeg',
        },
      },
      hoodie: {
        front: {
          white: '/images/mockups/hoodie_white_front.jpeg',
          black: '/images/mockups/hoodie_black_front.jpeg',
        },
        back: {
          white: '/images/mockups/hoodie_white_back.jpeg',
          black: '/images/mockups/hoodie_black_back.jpeg',
        },
      },
      bag: {
        front: {
          white: '/images/mockups/tote_bag.jpeg',
          black: '/images/mockups/tote_bag.jpeg',
        },
        back: {
          white: '/images/mockups/tote_bag.jpeg',
          black: '/images/mockups/tote_bag.jpeg',
        },
      },
    };

    const product = imageMap[type];
    if (!product) return '/images/mockups/tshirt_black_front.jpeg';
    const side = product[view];
    if (!side) return '/images/mockups/tshirt_black_front.jpeg';
    return isWhite ? side.white : side.black;
  };

  // Available Colors Calculation
  const availableColors = selectedProduct && selectedProduct.colors && selectedProduct.colors.length > 0
    ? selectedProduct.colors.map((c) => ({
      name: c.name,
      hex: c.hex?.trim() && /^#([0-9A-F]{3}){1,2}$/i.test(c.hex) ? c.hex : getColorHexFromName(c.name),
    }))
    : FALLBACK_COLORS;

  const fallbackProductForType = (allProducts || []).find(
    (product) => mapCategoryToGarmentType(product.category) === garmentType
  );
  const selectedProductMatchesType =
    !!selectedProduct && mapCategoryToGarmentType(selectedProduct.category) === garmentType;
  const checkoutProduct = selectedProductMatchesType ? selectedProduct : fallbackProductForType;
  const checkoutBasePrice = Number(checkoutProduct?.base_price || 999);
  const resolvedCheckoutBasePrice = Number.isFinite(checkoutBasePrice) ? checkoutBasePrice : 999;

  // Map garment color name to hex for 3D viewer
  const garmentColorHex = getColorHexFromName(garmentColor);

  const currentBaseImage = getBaseImage(garmentType, garmentView);
  const activeDesignFront = generatedDesigns.find(d => d.id === activeLayers.front);
  const activeDesignBack = generatedDesigns.find(d => d.id === activeLayers.back);
  const currentActiveDesign = garmentView === 'front' ? activeDesignFront : activeDesignBack;
  const canGenerate = Boolean(prompt.trim() || promptReferenceImage?.url);
  const activeEditSource = currentActiveDesign?.image_url || promptReferenceImage?.url;
  const canEditActive = Boolean(
    activeEditSource && (prompt.trim() || editText.trim() || editAddonIcon !== 'none')
  );
  const isUnlimitedCreditsUser = hasUnlimitedCreditsAccess(profile);
  const currentCredits = profile?.ai_credits ?? 0;
  const canProceedToBuy = Boolean(currentActiveDesign && checkoutProduct?.id);
  const checkoutHref = canProceedToBuy
    ? `/gallery/${checkoutProduct!.id}?design=${encodeURIComponent(currentActiveDesign!.id)}&color=${encodeURIComponent(garmentColor)}`
    : '#';

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-y-auto overflow-x-hidden lg:overflow-hidden relative bg-void text-text-main selection:bg-cyan selection:text-void">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none z-0" />
      <div className="absolute inset-0 crt-overlay pointer-events-none z-[100]" />

      {/* LEFT PANEL: TOOLS & ASSETS */}
      <aside
        style={{ ['--left-panel-width' as string]: `${leftPanelWidth}px` } as CSSProperties}
        className="w-full lg:w-[var(--left-panel-width)] shrink-0 lg:border-r border-b lg:border-b-0 border-border-std bg-panel/50 backdrop-blur-sm flex flex-col z-10 max-h-none lg:max-h-full"
      >
        <div className="h-10 border-b border-border-std flex items-center px-4 justify-between bg-panel-highlight/30">
          <span className="font-mono text-[11px] tracking-widest text-text-dim uppercase">Design Prompt</span>
          <Terminal className="text-text-dim h-4 w-4" />
        </div>

        {/* Prompt Input Area */}
        <div className="p-4 border-b border-border-std max-h-[52vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <div className="relative group">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="font-mono text-[10px] text-cyan uppercase tracking-widest">
                  Prompt (Generate New / Edit Image)
                </label>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer bg-transparent border border-border-std hover:border-cyan text-text-dim hover:text-cyan font-mono text-[9px] py-1 px-2 transition-colors items-center justify-center gap-1 uppercase tracking-widest">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handlePromptReferenceUpload}
                      disabled={isReferenceUploading || generateDesign.isPending}
                    />
                    {isReferenceUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Upload Ref
                  </label>
                  {promptReferenceImage && (
                    <button
                      onClick={() => setPromptReferenceImage(null)}
                      className="font-mono text-[9px] border border-red-400/60 bg-red-500/10 text-red-300 hover:text-red-200 hover:border-red-300 uppercase tracking-widest transition-colors px-2 py-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-36 bg-void border border-border-std p-3 font-mono text-[11px] text-text-main focus:border-cyan focus:ring-0 focus:outline-none resize-none rounded-none placeholder-text-dim/50 transition-colors overflow-y-auto"
                placeholder="> For new design: describe full idea&#10;> For edit: describe exact changes (text, style, effects)&#10;> e.g. Keep logo, add EVERYDAYDROP at bottom in white, anime style"
              />
              {promptReferenceImage && (
                <div className="mt-2 flex items-center gap-2 border border-cyan/30 bg-cyan/5 p-1.5 relative">
                  <Image
                    src={promptReferenceImage.url}
                    alt="Reference preview"
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 object-cover border border-border-std shrink-0"
                    onError={() => setPromptReferenceImage(null)}
                  />
                  <button
                    onClick={() => setPromptReferenceImage(null)}
                    className="absolute top-1 right-1 text-red-400/80 hover:text-red-400 transition-colors"
                    title="Delete reference image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-mono text-[8px] text-cyan uppercase tracking-widest">Reference</p>
                    <p className="font-mono text-[9px] text-text-dim truncate">{promptReferenceImage.name}</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 w-1.5 h-3 bg-cyan/50 animate-pulse"></div>
            </div>

            <div className="border border-border-std bg-void/70 p-2 space-y-2">
              <p className="font-mono text-[9px] text-magenta uppercase tracking-widest">Design Upload (Library)</p>
              <p className="font-mono text-[9px] text-text-dim">
                Upload one or multiple images directly into generated designs panel.
              </p>
              <label className="inline-flex cursor-pointer bg-transparent border border-border-std hover:border-magenta text-text-dim hover:text-magenta font-mono text-[10px] py-1.5 px-2 transition-colors items-center justify-center gap-1 uppercase tracking-widest">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || generateDesign.isPending}
                />
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                Upload Design
              </label>
            </div>

            <p className="font-mono text-[9px] text-text-dim leading-relaxed">
              Single prompt flow: write prompt {'->'} optional reference upload {'->'} click <span className="text-cyan">GENERATE NEW</span>.
              Use <span className="text-magenta">EDIT ACTIVE IMAGE</span> to force edit on active layer/reference source.
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleShufflePrompt}
              className="flex-shrink-0 bg-transparent border border-border-std hover:border-text-dim text-text-dim hover:text-text-main font-mono text-xs py-2 px-3 transition-colors flex items-center justify-center gap-1"
              title="Random Prompt"
            >
              <Shuffle className="h-3 w-3" />
            </button>
            <button
              onClick={handleGenerate}
              disabled={generateDesign.isPending || isUploading || isReferenceUploading || !canGenerate}
              className="flex-1 bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void disabled:opacity-50 disabled:hover:bg-cyan/10 disabled:hover:text-cyan font-mono text-[10px] sm:text-[11px] font-bold py-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/20 to-transparent translate-y-[-100%] group-hover:animate-[scanline_2s_linear_infinite]" />

              {generateDesign.isPending ? (
                <><Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> GENERATING...</>
              ) : (
                <><Activity className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-90 transition-transform" /> GENERATE NEW</>
              )}
            </button>
          </div>

          <button
            onClick={handleEditActive}
            disabled={generateDesign.isPending || isUploading || isReferenceUploading || !canEditActive}
            className="w-full mt-2 bg-magenta/10 border border-magenta text-magenta hover:bg-magenta hover:text-void disabled:opacity-50 disabled:hover:bg-magenta/10 disabled:hover:text-magenta font-mono text-[10px] sm:text-[11px] font-bold py-2 transition-all shadow-[0_0_15px_rgba(255,0,255,0.15)] flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-magenta/20 to-transparent translate-y-[-100%] group-hover:animate-[scanline_2s_linear_infinite]" />
            {generateDesign.isPending ? (
              <><Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> APPLYING EDIT...</>
            ) : (
              <><Wand2 className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-12 transition-transform" /> EDIT ACTIVE IMAGE</>
            )}
          </button>

          <button
            onClick={() => setShowAdvancedSettings((prev) => !prev)}
            className="w-full mt-2 bg-panel/40 border border-border-std text-text-dim hover:border-cyan/70 hover:text-cyan font-mono text-[10px] sm:text-[11px] py-2 px-3 transition-colors flex items-center justify-between tracking-widest uppercase"
          >
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedSettings ? 'rotate-180 text-cyan' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showAdvancedSettings && (
              <motion.div
                key="advanced-settings-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -6 }}
                  animate={{ y: 0 }}
                  exit={{ y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="mt-3 space-y-2 pb-1"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Style Mode</label>
                    <select
                      value={stylePreset}
                      onChange={(e) => setStylePreset(e.target.value)}
                      className="w-full sm:w-[180px] bg-void border border-border-std text-text-main font-mono text-[10px] px-2 py-1 uppercase tracking-widest focus:border-cyan focus:outline-none"
                    >
                      {STYLE_PRESETS.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Edit Text</label>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="e.g. EVERYDAYDROP"
                      className="w-full sm:w-[180px] bg-void border border-border-std text-text-main font-mono text-[10px] px-2 py-1 tracking-widest focus:border-cyan focus:outline-none placeholder-text-dim/50"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Text Position</label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value as EditPosition)}
                      className="w-full sm:w-[180px] bg-void border border-border-std text-text-main font-mono text-[10px] px-2 py-1 uppercase tracking-widest focus:border-cyan focus:outline-none"
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Text Color</label>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-6 p-0 bg-transparent border border-border-std cursor-pointer"
                        title="Text color"
                      />
                      <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest w-[64px] text-right">
                        {editColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Add-on Icon</label>
                    <select
                      value={editAddonIcon}
                      onChange={(e) => setEditAddonIcon(e.target.value as AddonIcon)}
                      className="w-full sm:w-[180px] bg-void border border-border-std text-text-main font-mono text-[10px] px-2 py-1 uppercase tracking-widest focus:border-cyan focus:outline-none"
                    >
                      {ADDON_ICON_OPTIONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="font-mono text-[9px] text-text-dim">
                    Explicit controls are used for in-image edits. Prompt remains optional for extra direction.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {generateDesign.isError && (
            <div className="mt-2 text-[10px] font-mono text-red-500 border border-red-500 bg-red-500/10 p-2 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{generateDesign.error.message}</span>
            </div>
          )}
        </div>

        {/* Asset Library */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-10 border-b border-border-std flex items-center px-4 justify-between bg-panel-highlight/30">
            <span className="font-mono text-[11px] tracking-widest text-text-dim uppercase">Generated Designs</span>
            <span className="font-mono text-[10px] text-cyan">{generatedDesigns.length} READY</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              {generateDesign.isPending && (
                <div className="col-span-2 aspect-[2/1] bg-void border border-dashed border-cyan/30 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 relative">
                    <div className="absolute inset-0 border-2 border-cyan/20 border-t-cyan rounded-full animate-spin"></div>
                  </div>
                  <span className="font-mono text-[9px] text-cyan animate-pulse">{GENERATION_STEPS[generationStep]}</span>
                </div>
              )}

              {generatedDesigns.map((design, idx) => (
                <div
                  key={design.id}
                  onClick={() => setActiveLayers(prev => ({ ...prev, [garmentView]: design.id }))}
                  className={`group relative aspect-square border transition-colors cursor-pointer overflow-hidden ${activeLayers[garmentView as 'front' | 'back'] === design.id ? 'border-cyan shadow-[0_0_10px_rgba(0,240,255,0.25)]' : 'border-border-std hover:border-cyan/50'}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDesignFromLibrary(design.id);
                    }}
                    className="absolute top-1.5 left-1.5 z-30 h-5 w-5 border border-red-400/50 bg-void/90 text-red-300 hover:text-red-200 hover:border-red-300 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                    title="Delete design"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#f2f2f2_0%,#d9d9d9_45%,#2b2b35_100%)] opacity-95" />
                  <Image
                    src={design.image_url}
                    alt="Generated Asset"
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 45vw, 220px"
                    className="relative z-10 object-contain p-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                    onError={() => removeDesignFromLibrary(design.id)}
                  />
                  <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                    <span className="font-mono text-[9px] text-cyan">Design {idx + 1}</span>
                  </div>
                  {activeLayers[garmentView as 'front' | 'back'] === design.id && (
                    <div className="absolute top-1.5 right-1.5 z-20 flex gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
              ))}

              {!generateDesign.isPending && generatedDesigns.length === 0 && (
                <div className="col-span-2 border border-dashed border-border-std p-3 text-center font-mono text-[10px] text-text-dim">
                  Upload or generate designs to build your library.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div
        onMouseDown={startLeftPanelResize}
        className="hidden lg:flex w-2 shrink-0 cursor-col-resize select-none items-center justify-center border-r border-border-std bg-panel/30 hover:bg-cyan/10 transition-colors z-20"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize design prompt panel"
        title="Drag to resize prompt panel"
      >
        <div className="h-16 w-[2px] bg-border-std" />
      </div>

      {/* CENTER PANEL: THE STAGE */}
      <section className="w-full lg:flex-1 flex flex-col relative bg-void/50 min-h-[360px] sm:min-h-[500px]">
        <div className="min-h-10 shrink-0 border-b border-border-std flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2 bg-panel/30 z-20">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-text-dim uppercase truncate">Live Customizer</span>
            <span className="h-3 w-px bg-border-std"></span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] text-text-dim whitespace-nowrap">ZOOM: {canvasZoom}%</span>
              <button
                onClick={handleZoomOut}
                className="h-6 w-6 border border-border-std text-text-dim hover:text-cyan hover:border-cyan/70 flex items-center justify-center transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              <button
                onClick={handleZoomIn}
                className="h-6 w-6 border border-border-std text-text-dim hover:text-cyan hover:border-cyan/70 flex items-center justify-center transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              <button
                onClick={handleZoomReset}
                className="h-6 px-2 border border-border-std text-[9px] font-mono tracking-widest text-text-dim hover:text-cyan hover:border-cyan/70 transition-colors uppercase"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] sm:text-[10px] text-magenta uppercase">CREDIT_BALANCE:</span>
              <span className="font-mono text-[11px] sm:text-xs text-text-main font-bold whitespace-nowrap">
                {isUnlimitedCreditsUser ? 'UNLIMITED' : `${currentCredits} CR`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden group/canvas bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)] p-4 sm:p-8">
          <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(#33333E_1px,transparent_1px),linear-gradient(90deg,#33333E_1px,transparent_1px)] bg-[length:100px_100px]"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-[360px] sm:max-w-[500px] aspect-[4/5] sm:aspect-square md:aspect-[4/5] flex flex-col items-center justify-center z-10 transition-transform duration-300 min-h-0 flex-1 max-h-full"
          >
            <div
              className="relative w-full h-full transition-transform duration-200"
              style={{ transform: `scale(${canvasZoom / 100})`, transformOrigin: 'center center' }}
            >
              {/* Front View Canvas */}
              <div className={`w-full h-full cursor-crosshair min-h-0 flex flex-col ${garmentView === 'front' ? 'relative z-10 flex-1' : 'absolute inset-0 opacity-0 pointer-events-none z-0'}`}>
                {activeDesignFront ? (
                  <MockupEditor
                    editorRef={frontEditorRef}
                    baseImage={getBaseImage(garmentType, 'front')}
                    designImage={activeDesignFront.image_url}
                    onPreview={handlePreviewAll}
                  />
                ) : (
                  <div className="relative w-full h-full flex-1">
                    <Image
                      src={getBaseImage(garmentType, 'front')}
                      alt="Base Substrate Front"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 90vw, 500px"
                      className="object-contain filter grayscale contrast-125 brightness-90 opacity-50"
                    />
                    <div className={`absolute border-2 border-dashed border-cyan/20 flex flex-col items-center justify-center bg-cyan/5 pointer-events-none ${garmentType === 'hoodie' ? 'top-[32%] left-[30%] w-[40%] h-[38%]' :
                      garmentType === 'bag' ? 'top-[18%] left-[28%] w-[44%] h-[52%]' :
                        'top-[20%] left-[28%] w-[44%] h-[50%]'
                      }`}>
                      <Sparkles className="h-8 w-8 text-cyan/40 mb-2" />
                      <span className="font-mono text-[10px] text-cyan/60 uppercase text-center px-4">Generate a design<br />for the Front</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Back View Canvas */}
              <div className={`w-full h-full cursor-crosshair min-h-0 flex flex-col ${garmentView === 'back' ? 'relative z-10 flex-1' : 'absolute inset-0 opacity-0 pointer-events-none z-0'}`}>
                {activeDesignBack ? (
                  <MockupEditor
                    editorRef={backEditorRef}
                    baseImage={getBaseImage(garmentType, 'back')}
                    designImage={activeDesignBack.image_url}
                    onPreview={handlePreviewAll}
                  />
                ) : (
                  <div className="relative w-full h-full flex-1">
                    <Image
                      src={getBaseImage(garmentType, 'back')}
                      alt="Base Substrate Back"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 90vw, 500px"
                      className="object-contain filter grayscale contrast-125 brightness-90 opacity-50"
                    />
                    <div className={`absolute border-2 border-dashed border-cyan/20 flex flex-col items-center justify-center bg-cyan/5 pointer-events-none ${garmentType === 'hoodie' ? 'top-[32%] left-[30%] w-[40%] h-[38%]' :
                      garmentType === 'bag' ? 'top-[18%] left-[28%] w-[44%] h-[52%]' :
                        'top-[20%] left-[28%] w-[44%] h-[50%]'
                      }`}>
                      <Sparkles className="h-8 w-8 text-cyan/40 mb-2" />
                      <span className="font-mono text-[10px] text-cyan/60 uppercase text-center px-4">Generate a design<br />for the Back</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* RIGHT PANEL: CONFIGURATION */}
      <aside className="w-full lg:w-[300px] shrink-0 lg:border-l border-t lg:border-t-0 border-border-std bg-panel/50 backdrop-blur-sm flex flex-col z-10">
        <div className="h-10 border-b border-border-std flex items-center px-4 justify-between bg-panel-highlight/30">
          <span className="font-mono text-[11px] tracking-widest text-text-dim uppercase">Settings</span>
          <LayersIcon className="text-text-dim h-4 w-4" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Layers Section */}
          <div className="p-4 border-b border-border-std">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-xs text-text-main uppercase tracking-widest">Layers</h3>
            </div>
            <div className="space-y-2">
              {currentActiveDesign ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-cyan/10 border border-cyan p-2 cursor-pointer group shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                    <div className="w-8 h-8 bg-void border border-border-std overflow-hidden shrink-0">
                      <Image
                        src={currentActiveDesign.image_url}
                        alt="Active Layer"
                        width={32}
                        height={32}
                        unoptimized
                        className="w-full h-full object-cover grayscale brightness-125"
                        onError={() => removeDesignFromLibrary(currentActiveDesign.id)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] text-cyan truncate">Active Layer</div>
                      <div className="font-mono text-[8px] text-cyan/70">BLEND: MULTIPLY</div>
                    </div>
                  </div>

                  {/* AI ToolKit for the active layer */}
                  <div className="flex gap-2 pl-2 border-l-2 border-cyan/30 ml-4 py-1">
                    <button
                      onClick={() => handleAiModify('remove_background')}
                      disabled={isModifying}
                      className="flex-1 py-1.5 px-2 bg-void border border-border-std hover:border-cyan text-text-dim hover:text-cyan font-mono text-[8px] uppercase tracking-widest transition-all shadow flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isModifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScissorsLineDashed className="w-3 h-3" />}
                      Remove BG
                    </button>
                    <button
                      onClick={() => handleAiModify('variations')}
                      disabled={isModifying}
                      className="flex-1 py-1.5 px-2 bg-void border border-border-std hover:border-magenta text-text-dim hover:text-magenta font-mono text-[8px] uppercase tracking-widest transition-all shadow flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isModifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      AI Vars
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-text-dim p-2 border border-dashed border-border-std text-center">
                  No Active Design
                </div>
              )}

              <div className="flex items-center gap-3 border border-transparent p-2 opacity-50">
                <div className="w-8 h-8 bg-void border border-border-std flex items-center justify-center shrink-0">
                  <Shirt className="h-4 w-4 text-text-dim" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] text-text-main truncate">Base: {garmentType.toUpperCase()} ({garmentView.toUpperCase()})</div>
                  <div className="font-mono text-[8px] text-text-dim">Locked Base</div>
                </div>
              </div>
            </div>
          </div>

          {/* Substrate Config */}
          <div className="p-4 border-b border-border-std">
            <h3 className="font-display font-bold text-xs text-text-main uppercase tracking-widest mb-4">Garment Options</h3>

            <div className="mb-6">
              <label className="block font-mono text-[10px] text-text-dim mb-2 uppercase tracking-widest">Type & Print Placement</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {GARMENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setGarmentType(type.id)}
                    className={`flex-1 flex gap-1 items-center justify-center py-2 border transition-all text-[9px] font-mono uppercase tracking-widest ${garmentType === type.id ? 'border-cyan bg-cyan/10 text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'border-border-std text-text-dim hover:text-text-main hover:border-cyan/50'}`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {PRINT_PLACEMENTS.map(placement => (
                  <button
                    key={placement.id}
                    onClick={() => {
                      setPrintPlacement(placement.id as 'front' | 'back' | 'both');
                      if (placement.id !== 'both') setGarmentView(placement.id as 'front' | 'back');
                    }}
                    className={`flex-1 py-1.5 border transition-all text-[9px] font-mono uppercase tracking-widest ${printPlacement === placement.id ? 'border-magenta bg-magenta/10 text-magenta shadow-[0_0_10px_rgba(255,0,255,0.2)]' : 'border-border-std text-text-dim hover:text-text-main hover:border-magenta/50'}`}
                  >
                    {placement.label}
                  </button>
                ))}
              </div>

              {printPlacement === 'both' && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-dashed border-border-std">
                  <span className="text-[9px] text-text-dim flex items-center shrink-0">EDITING:</span>
                  <button onClick={() => setGarmentView('front')} className={`flex-1 px-2 py-1.5 border text-[9px] font-mono uppercase tracking-widest transition-colors ${garmentView === 'front' ? 'border-cyan text-cyan bg-cyan/10' : 'border-border-std text-text-dim hover:text-text-main'}`}>FRONT</button>
                  <button onClick={() => setGarmentView('back')} className={`flex-1 px-2 py-1.5 border text-[9px] font-mono uppercase tracking-widest transition-colors ${garmentView === 'back' ? 'border-cyan text-cyan bg-cyan/10' : 'border-border-std text-text-dim hover:text-text-main'}`}>BACK</button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-mono text-[10px] text-text-dim mb-2 uppercase tracking-widest border-l-2 border-cyan pl-2">GARMENT COLOR</label>
              <div className="flex gap-2">
                {availableColors.map((colorOption) => {
                  const colorName = colorOption.name;
                  const hexCode = colorOption.hex || getColorHexFromName(colorName);
                  const isLight = isLightColor(hexCode);
                  const isActive = canonicalizeColorToken(garmentColor) === canonicalizeColorToken(colorName);

                  return (
                    <button
                      key={colorName}
                      onClick={() => setGarmentColor(colorName)}
                      className={`group relative w-8 h-8 rounded-sm border transition-all ${isActive
                        ? 'border-cyan shadow-[0_0_10px_rgba(0,240,255,0.4)] scale-110 z-10'
                        : `border-border-std opacity-70 hover:opacity-100 ${isLight ? 'border-gray-300' : ''}`
                        }`}
                      style={{ backgroundColor: hexCode }}
                      title={colorName}
                    >
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan uppercase opacity-0 group-hover:opacity-100 transition-opacity">{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 mt-8">
              <label className="block font-mono text-[10px] text-text-dim mb-2 uppercase tracking-widest border-l-2 border-magenta pl-2">GARMENT SIZE</label>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setGarmentSize(size)}
                    className={`font-mono text-[10px] py-1.5 transition-colors border ${garmentSize === size ? 'border-magenta bg-magenta/10 text-magenta font-bold shadow-[0_0_10px_rgba(255,0,255,0.2)]' : 'border-border-std text-text-dim hover:text-text-main hover:border-magenta/50 hover:bg-magenta/5'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-dashed border-border-std">
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-text-dim">MATERIAL</span>
                <span className="text-text-main">{garmentType === 'bag' ? '100% CANVAS' : '100% COTTON'}</span>
              </div>
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-text-dim">WEIGHT</span>
                <span className="text-text-main">{garmentType === 'bag' ? '12 OZ' : garmentType === 'hoodie' ? '340 GSM' : '240 GSM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing / CTA */}
        <div className="p-4 border-t border-border-std bg-panel-highlight/10">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between font-mono text-[10px] tracking-widest">
              <span className="text-text-dim uppercase">Base Price</span>
              <span className="text-text-main">₹ {resolvedCheckoutBasePrice.toFixed(0)}</span>
            </div>
            {currentActiveDesign && (
              <div className="flex justify-between font-mono text-[10px] text-cyan tracking-widest">
                <span className="uppercase">Print Fee</span>
                <span>₹ 500</span>
              </div>
            )}
            <div className="h-px bg-border-std border-b border-dashed border-border-std my-3"></div>
            <div className="flex justify-between font-mono text-sm font-bold items-end tracking-widest pt-1 border-t-2 border-transparent relative">
              <span className="text-magenta uppercase">Total Price</span>
              <span className="text-text-main text-lg leading-none shadow-cyan">
                ₹ {currentActiveDesign ? resolvedCheckoutBasePrice + 500 : resolvedCheckoutBasePrice}
              </span>
            </div>
          </div>

          <Link href={checkoutHref} className={!canProceedToBuy ? 'pointer-events-none opacity-50 inline-block w-full' : 'inline-block w-full'}>
            <button disabled={!canProceedToBuy} className="relative w-full bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void font-mono font-bold text-xs py-3 transition-colors flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(0,240,255,0.3)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              PROCEED TO BUY
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </aside>

      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-void/90 backdrop-blur-sm p-4">
          {/* Cyberpunk frame */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05)_0%,transparent_80%)] pointer-events-none" />

          <div className="relative w-full max-w-4xl bg-panel border-2 border-cyan shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col p-3 sm:p-4 h-[90vh] sm:h-[80vh]">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan/50"></div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-between items-start sm:items-center mb-4 border-b border-border-std pb-2 shrink-0">
              <h2 className="font-mono text-cyan text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4" /> Canvas Render Preview</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('2d')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-all ${previewMode === '2d' ? 'border-cyan bg-cyan/20 text-cyan' : 'border-border-std text-text-dim hover:border-cyan/50 hover:text-text-main'}`}
                >
                  2D Flat
                </button>
                <button
                  onClick={() => setPreviewMode('3d')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-all ${previewMode === '3d' ? 'border-magenta bg-magenta/20 text-magenta' : 'border-border-std text-text-dim hover:border-magenta/50 hover:text-text-main'}`}
                >
                  3D View
                </button>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="text-text-dim hover:text-red-500 transition-colors sm:ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 w-full bg-void border border-border-std overflow-hidden flex items-center justify-center p-2 mb-4">
              {previewMode === '2d' ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full h-full items-center justify-center outline-none shrink overflow-y-auto">
                  {/* Front Preview Shell */}
                  {previewImages.front ? (
                    <div className="relative h-[45%] sm:h-full w-full sm:w-auto aspect-[4/5] bg-panel/30 border border-border-std overflow-hidden">
                      <Image
                        src={getBaseImage(garmentType, 'front')}
                        alt="Front Base"
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 90vw, 320px"
                        className="absolute inset-0 object-contain p-4 z-0 opacity-80"
                      />
                      <Image
                        src={previewImages.front}
                        alt="Front Design"
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 90vw, 320px"
                        className="absolute inset-0 object-contain p-4 z-10 drop-shadow-md"
                      />
                    </div>
                  ) : null}

                  {/* Back Preview Shell */}
                  {previewImages.back ? (
                    <div className="relative h-[45%] sm:h-full w-full sm:w-auto aspect-[4/5] bg-panel/30 border border-border-std overflow-hidden">
                      <Image
                        src={getBaseImage(garmentType, 'back')}
                        alt="Back Base"
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 90vw, 320px"
                        className="absolute inset-0 object-contain p-4 z-0 opacity-80"
                      />
                      <Image
                        src={previewImages.back}
                        alt="Back Design"
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 90vw, 320px"
                        className="absolute inset-0 object-contain p-4 z-10 drop-shadow-md"
                      />
                    </div>
                  ) : null}

                  {!previewImages.front && !previewImages.back && (
                    <div className="font-mono text-text-dim text-xs uppercase tracking-widest text-center">
                      <p>No designs generated yet.</p>
                      <p className="mt-2 text-cyan/50 text-[10px]">Add a design to the front or back to view render.</p>
                    </div>
                  )}
                </div>
              ) : (
                <MockupViewer3D frontTextureUrl={previewImages.front} backTextureUrl={previewImages.back} view={garmentView as 'front' | 'back'} productType={garmentType as 'tshirt' | 'hoodie' | 'bag'} color={garmentColorHex} />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 shrink-0">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 font-mono text-xs uppercase tracking-widest border border-border-std text-text-dim hover:text-text-main hover:border-text-dim transition-all">
                Dismiss
              </button>
              {previewImages.front && (
                <a
                  href={previewImages.front}
                  download={`atelier_render_front_${Date.now()}.png`}
                  className="sm:flex-[2] py-2 font-mono text-xs uppercase tracking-widest bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Front Composite
                </a>
              )}
              {previewImages.back && (
                <a
                  href={previewImages.back}
                  download={`atelier_render_back_${Date.now()}.png`}
                  className="sm:flex-[2] py-2 font-mono text-xs uppercase tracking-widest bg-magenta/10 border border-magenta text-magenta hover:bg-magenta hover:text-void transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Back Composite
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-void"><Loader2 className="w-8 h-8 animate-spin text-cyan" /></div>}>
      <StudioContent />
    </Suspense>
  );
}
