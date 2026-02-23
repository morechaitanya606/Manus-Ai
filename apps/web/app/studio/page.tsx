'use client';

import { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { useGenerateDesign } from '../../hooks/use-designs';
import { useProducts } from '../../hooks/use-products';
import { Sparkles, Terminal, Activity, Shuffle, ZoomIn, ZoomOut, Hand, Focus, Layers as LayersIcon, ArrowRight, Shirt, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MockupEditor } from '../../components/mockup-editor';

const GENERATION_STEPS = [
  'Allocating Neural Nodes...',
  'Synthesizing Pixels...',
  'Refining Output Array...',
  'Finalizing Asset...',
];

const GARMENT_COLORS = [
  { name: 'BLK', class: 'bg-[#16161A]' },
  { name: 'WHT', class: 'bg-[#F5F5F5]' },
  { name: 'GRY', class: 'bg-[#2A2A35]' },
];

const SIZES = ['S', 'M', 'L', 'XL'];

export default function StudioPage() {
  const { session, profile } = useAuthStore();
  const { data: products } = useProducts();
  const generateDesign = useGenerateDesign();

  const [prompt, setPrompt] = useState('');
  const [garmentColor, setGarmentColor] = useState('BLK');
  const [garmentSize, setGarmentSize] = useState('M');
  const [generationStep, setGenerationStep] = useState(0);

  const [generatedDesigns, setGeneratedDesigns] = useState<Array<{
    id: string;
    image_url: string;
  }>>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerationStep(0);
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const result = await generateDesign.mutateAsync({
        prompt: prompt,
      });
      if (result) {
        setGeneratedDesigns(prev => [...prev, result]);
        setActiveLayer(result.id);
      }
    } finally {
      clearInterval(stepInterval);
      setGenerationStep(0);
    }
  };

  const handleShufflePrompt = () => {
    const ideas = ['Cyberpunk samurai cat, neon noir', 'Digital data rain matrix style', 'Abstract neon liquid swirls in dark void'];
    setPrompt(ideas[Math.floor(Math.random() * ideas.length)]);
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
          <h1 className="text-xl font-mono font-bold text-white mb-2 uppercase tracking-widest">Sign in to start creating</h1>
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

  const baseImage = products?.[0]?.image_url || 'https://picsum.photos/seed/shirt/500/500';
  const activeDesign = generatedDesigns.find(d => d.id === activeLayer);
  const currentCredits = profile?.ai_credits ?? 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-auto lg:overflow-hidden relative bg-void text-text-main selection:bg-cyan selection:text-void">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none z-0" />
      <div className="absolute inset-0 crt-overlay pointer-events-none z-[100]" />

      {/* LEFT PANEL: TOOLS & ASSETS */}
      <aside className="w-full lg:w-[320px] shrink-0 lg:border-r border-b lg:border-b-0 border-border-std bg-panel/50 backdrop-blur-sm flex flex-col z-10 max-h-[50vh] lg:max-h-full">
        <div className="h-10 border-b border-border-std flex items-center px-4 justify-between bg-panel-highlight/30">
          <span className="font-mono text-[11px] tracking-widest text-text-dim uppercase">Design Prompt</span>
          <Terminal className="text-text-dim h-4 w-4" />
        </div>

        {/* Prompt Input Area */}
        <div className="p-4 border-b border-border-std">
          <label className="block font-mono text-xs text-cyan mb-2">What would you like to design?</label>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-void border border-border-std p-3 font-mono text-xs text-text-main focus:border-cyan focus:ring-0 focus:outline-none resize-none rounded-none placeholder-text-dim/50 transition-colors"
              placeholder="> Describe your idea...&#10;> e.g. Cyberpunk samurai cat, neon noir, 8k render"
            />
            {/* Blinking Cursor Decor */}
            <div className="absolute bottom-3 right-3 w-1.5 h-3 bg-cyan/50 animate-pulse"></div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleShufflePrompt}
              className="flex-1 bg-transparent border border-border-std hover:border-text-dim text-text-dim hover:text-white font-mono text-xs py-2 transition-colors flex items-center justify-center gap-1"
            >
              <Shuffle className="h-3 w-3" /> RND
            </button>
            <button
              onClick={handleGenerate}
              disabled={generateDesign.isPending || !prompt.trim()}
              className="flex-[2] bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void disabled:opacity-50 disabled:hover:bg-cyan/10 disabled:hover:text-cyan font-mono text-[10px] sm:text-xs font-bold py-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/20 to-transparent translate-y-[-100%] group-hover:animate-[scanline_2s_linear_infinite]" />

              {generateDesign.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> GENERATING...</>
              ) : (
                <><Activity className="h-4 w-4 group-hover:rotate-90 transition-transform" /> GENERATE DESIGN</>
              )}
            </button>
          </div>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {generateDesign.isPending && (
              <div className="aspect-square bg-void border border-dashed border-cyan/30 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 border-2 border-cyan/20 border-t-cyan rounded-full animate-spin"></div>
                </div>
                <span className="font-mono text-[9px] text-cyan animate-pulse">{GENERATION_STEPS[generationStep]}</span>
              </div>
            )}

            {generatedDesigns.map((design, idx) => (
              <div
                key={design.id}
                onClick={() => setActiveLayer(design.id)}
                className={`group relative aspect-square bg-void border transition-colors cursor-pointer overflow-hidden ${activeLayer === design.id ? 'border-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'border-border-std hover:border-cyan/50'}`}
              >
                <img src={design.image_url} alt="Generated Asset" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="font-mono text-[10px] text-cyan">Design {idx + 1}</span>
                </div>
                {activeLayer === design.id && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER PANEL: THE STAGE */}
      <section className="w-full lg:flex-1 flex flex-col relative bg-void/50 min-h-[500px]">
        <div className="h-10 shrink-0 border-b border-border-std flex items-center justify-between px-6 bg-panel/30 z-20">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] tracking-widest text-text-dim uppercase">Live Customizer</span>
            <span className="h-3 w-px bg-border-std"></span>
            <span className="font-mono text-[10px] text-text-dim">ZOOM: 100%</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-magenta uppercase">CREDIT_BALANCE:</span>
              <span className="font-mono text-xs text-white font-bold">{currentCredits} CR</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden group/canvas bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)] p-4 sm:p-8">
          <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(#33333E_1px,transparent_1px),linear-gradient(90deg,#33333E_1px,transparent_1px)] bg-[length:100px_100px]"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-[500px] aspect-[4/5] sm:aspect-square md:aspect-[4/5] flex items-center justify-center z-10 transition-transform duration-300"
          >
            {activeDesign ? (
              <div className="w-full h-full relative cursor-crosshair">
                <MockupEditor baseImage={baseImage} designImage={activeDesign.image_url} />
                {/* Cyberpunk overlays for canvas */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan/30 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan/30 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan/30 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan/30 pointer-events-none"></div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  alt="Base Substrate"
                  className="w-full h-full object-contain filter grayscale contrast-125 brightness-90 opacity-50"
                  src={baseImage}
                />
                <div className="absolute top-[20%] left-[28%] w-[44%] h-[50%] border-2 border-dashed border-cyan/20 flex flex-col items-center justify-center bg-cyan/5">
                  <Sparkles className="h-8 w-8 text-cyan/40 mb-2" />
                  <span className="font-mono text-[10px] text-cyan/60 uppercase text-center px-4">Generate a design<br />to see it here</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Floating Toolbar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-panel border border-border-std px-4 py-2 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-30 opacity-50 hover:opacity-100 transition-opacity">
            <button className="text-text-dim hover:text-cyan transition-colors" title="Zoom Out"><ZoomOut className="h-4 w-4" /></button>
            <span className="font-mono text-[10px] text-white w-8 text-center">100%</span>
            <button className="text-text-dim hover:text-cyan transition-colors" title="Zoom In"><ZoomIn className="h-4 w-4" /></button>
            <div className="w-px h-4 bg-border-std"></div>
            <button className="text-text-dim hover:text-cyan transition-colors" title="Pan Tool"><Hand className="h-4 w-4" /></button>
            <button className="text-text-dim hover:text-cyan transition-colors" title="Reset View"><Focus className="h-4 w-4" /></button>
          </div>
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
              {activeDesign ? (
                <div className="flex items-center gap-3 bg-cyan/10 border border-cyan p-2 cursor-pointer group shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                  <div className="w-8 h-8 bg-void border border-border-std overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover grayscale brightness-125" src={activeDesign.image_url} alt="Active Layer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-cyan truncate">Active Layer</div>
                    <div className="font-mono text-[8px] text-cyan/70">BLEND: MULTIPLY</div>
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
                  <div className="font-mono text-[10px] text-white truncate">Base: T-Shirt</div>
                  <div className="font-mono text-[8px] text-text-dim">Locked Base</div>
                </div>
              </div>
            </div>
          </div>

          {/* Substrate Config */}
          <div className="p-4 border-b border-border-std">
            <h3 className="font-display font-bold text-xs text-text-main uppercase tracking-widest mb-4">Garment Options</h3>

            <div className="mb-4">
              <label className="block font-mono text-[10px] text-text-dim mb-2 uppercase tracking-widest border-l-2 border-cyan pl-2">GARMENT COLOR</label>
              <div className="flex gap-2">
                {GARMENT_COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setGarmentColor(color.name)}
                    className={`relative w-8 h-8 border transition-all ${color.class} ${garmentColor === color.name ? 'border-cyan ring-1 ring-cyan scale-110 z-10 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'border-border-std opacity-50 hover:opacity-100 hover:border-text-dim'}`}
                  >
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan uppercase opacity-0 group-hover:opacity-100 transition-opacity">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 mt-8">
              <label className="block font-mono text-[10px] text-text-dim mb-2 uppercase tracking-widest border-l-2 border-magenta pl-2">GARMENT SIZE</label>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setGarmentSize(size)}
                    className={`font-mono text-[10px] py-1.5 transition-colors border ${garmentSize === size ? 'border-magenta bg-magenta/10 text-magenta font-bold shadow-[0_0_10px_rgba(255,0,255,0.2)]' : 'border-border-std text-text-dim hover:text-white hover:border-magenta/50 hover:bg-magenta/5'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-dashed border-border-std">
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-text-dim">MATERIAL</span>
                <span className="text-white">100% COTTON</span>
              </div>
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-text-dim">WEIGHT</span>
                <span className="text-white">240 GSM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing / CTA */}
        <div className="p-4 border-t border-border-std bg-panel-highlight/10">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between font-mono text-[10px] tracking-widest">
              <span className="text-text-dim uppercase">Base Price</span>
              <span className="text-white">₹ {products?.[0]?.base_price ? Number(products[0].base_price).toFixed(0) : '999'}</span>
            </div>
            {activeDesign && (
              <div className="flex justify-between font-mono text-[10px] text-cyan tracking-widest">
                <span className="uppercase">Print Fee</span>
                <span>₹ 500</span>
              </div>
            )}
            <div className="h-px bg-border-std border-b border-dashed border-border-std my-3"></div>
            <div className="flex justify-between font-mono text-sm font-bold items-end tracking-widest pt-1 border-t-2 border-transparent relative">
              <span className="text-magenta uppercase">Total Price</span>
              <span className="text-white text-lg leading-none shadow-cyan">
                ₹ {activeDesign ? Number(products?.[0]?.base_price || 999) + 500 : Number(products?.[0]?.base_price || 999)}
              </span>
            </div>
          </div>

          <Link href={activeDesign ? `/gallery/${products?.[0]?.id || ''}?design=${activeDesign.id}` : '#'} className={!activeDesign ? 'pointer-events-none opacity-50 inline-block w-full' : 'inline-block w-full'}>
            <button disabled={!activeDesign} className="relative w-full bg-cyan/10 border border-cyan text-cyan hover:bg-cyan hover:text-void font-mono font-bold text-xs py-3 transition-colors flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(0,240,255,0.3)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              PROCEED TO BUY
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
