'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { useProducts } from '../../hooks/use-products';
import { ShoppingBag, ArrowRight, Terminal, QrCode, Sparkles, Palette, Zap, Star, Printer, Package, Upload } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'Generate AI Design', desc: 'Describe your vision and our AI engine creates stunning, print-ready designs in seconds' },
  { icon: Upload, title: 'Upload Your Own', desc: 'Already have a design? Upload it directly and preview on any product instantly' },
  { icon: Palette, title: 'Choose Your Product', desc: 'T-Shirts, Hoodies, Caps, Totes, Posters & more — premium quality guaranteed' },
  { icon: Printer, title: 'We Print & Ship', desc: 'Printed on our own high-quality machines and shipped across India to your doorstep' },
];

export default function HomePage() {
  const { data: products } = useProducts();
  const [showDesign, setShowDesign] = useState(false);

  useEffect(() => {
    // Loop the design reveal: 6s hidden -> 6s shown -> repeat
    const timer = setInterval(() => {
      setShowDesign(prev => !prev);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-void min-h-screen font-display">
      {/* Global Grid & CRT Overlays */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05] pointer-events-none z-0" />
      <div className="fixed inset-0 scanline opacity-10 pointer-events-none z-0" />
      <div className="fixed inset-0 crt-overlay z-10 pointer-events-none" />

      {/* Main Hero Split Area */}
      <main className="relative z-20 flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] border-b border-border-std">

        {/* MOBILE ONLY HERO (Matches user provided image) */}
        <div className="flex lg:hidden w-full min-h-[calc(100vh-4rem)] flex-col px-4 py-6 relative z-30 bg-void font-display overflow-hidden">

          {/* Typography */}
          <div className="mb-6 flex flex-col z-10 relative">
            <h1 className="text-5xl font-display font-bold leading-[0.85] tracking-tighter uppercase mb-4">
              <span className="text-white">DESIGN.</span><br />
              <span className="text-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">PRINT. DELIVER.</span>
            </h1>

            {/* System Ready Badge */}
            <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-3 py-1.5 w-fit">
              <Terminal className="h-4 w-4 text-green-500" />
              <span className="font-mono text-[10px] font-bold text-green-500 uppercase tracking-widest">SYSTEM_READY // PRINTERS_ONLINE</span>
            </div>
          </div>

          {/* Visualizer Block */}
          <div className="relative w-full flex-1 min-h-[300px] bg-[#080812] border border-white/5 overflow-hidden flex items-center justify-center mb-6">
            {/* Grid bg */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-[0.05] pointer-events-none" />

            {/* Crosshairs */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan/20"></div>
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-cyan/20"></div>

            {/* Img with animation */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotateY: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="relative w-[85%] h-[85%] max-w-[300px] max-h-[400px]">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8r7kTRy35CA6EY8iGtdBkVVsbhG9Hlft-9R9iiiSWJnKfSjbYywGzr9md10kY9ghnnDCR1ZmUbTbjPw--wEA_nkeIeWMSPgyv0vq4ATBxtfugSCnNJEMHdUp6HX9bTpIe7p5U8QnOgaOiOJY-s0NWGXjgBo-iL4Bl3rEPJKPzA1MVh_qzKpdJiVz9EyxSvVq6CgXAy6b12wP5P_4JxWbBAU457vaS2-dnpKKuYZv0DhOWd__llO2AY3YJmJ5J6QXeXPG0Uxgb8VI"
                  alt="White T-Shirt Render"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 85vw, 425px"
                  className="object-contain filter grayscale contrast-125 brightness-90 drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-cyan mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

              {/* Revealed Design Always Visible with No Glow */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="flex flex-col items-center mt-[15%] opacity-90 mix-blend-screen scale-125">
                  <span className="font-display font-bold text-5xl text-blue-700 text-center leading-[0.8] tracking-tighter mix-blend-plus-lighter">
                    EVERYDAY<br />DROP
                  </span>
                  <div className="w-16 h-1 bg-blue-700 mt-4 opacity-100"></div>
                  <span className="font-mono text-[8px] text-white tracking-[0.4em] uppercase mt-3 opacity-90 font-bold">
                    EST. 2026
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Top Right Text */}
            <div className="absolute top-3 right-3 text-right z-20">
              <div className="font-mono text-[9px] text-text-dim uppercase tracking-widest">RENDER_SCALE</div>
              <div className="font-mono text-[12px] text-cyan font-bold leading-tight">1:1</div>
              <div className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-2">NODE_LOCATION</div>
              <div className="font-mono text-[12px] text-white font-bold leading-tight">MUM-01</div>
            </div>

            {/* Bottom Left Text */}
            <div className="absolute bottom-3 left-3 text-left z-20">
              <div className="font-mono text-[9px] text-text-dim uppercase tracking-widest">PIPELINE_LATENCY</div>
              <div className="font-mono text-[12px] text-white font-bold leading-tight">0.02ms</div>
              <div className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-2">FABRIC_STOCK</div>
              <div className="font-mono text-[12px] text-white font-bold leading-tight">98.4%</div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/studio" className="w-full shrink-0 z-20 relative">
            <button className="w-full bg-cyan hover:bg-white transition-colors h-16 flex items-center justify-between px-6 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <span className="font-mono font-bold text-base text-black tracking-widest uppercase">[ INITIALIZE PROJECT ]</span>
              <ArrowRight className="h-6 w-6 text-black" />
            </button>
          </Link>
          <div className="mt-3 font-mono text-[9px] text-text-dim tracking-[0.3em] z-20 relative">
            RATION_V4.2_STABLE ///
          </div>
        </div>

        {/* Desktop Left Pane: Typography & CTA */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center px-6 lg:px-20 relative border-r border-border-std">
          {/* Decorative Corner */}
          <div className="absolute top-10 left-10 opacity-20 text-cyan hidden md:block">
            <QrCode className="h-10 w-10 text-4xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-8 max-w-2xl relative z-10"
          >
            {/* Data Tag */}
            <div className="inline-flex items-center gap-2 text-green-500 font-mono text-xs tracking-widest uppercase bg-green-500/5 px-2 py-1 w-fit border border-green-500/20">
              <Terminal className="h-4 w-4" />
              <span>Premium Custom Merchandise</span>
            </div>

            {/* Hero Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-display leading-[0.9] tracking-tighter text-white uppercase">
                DESIGN. PRINT.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta">DELIVER.</span>
              </h1>
              <p className="text-text-dim font-mono text-sm lg:text-base mt-4 max-w-md leading-relaxed border-l-2 border-border-std pl-4">
                &gt; Create custom merchandise in minutes. Upload your designs, launch your store, and let us handle the printing and fulfillment.
              </p>
            </div>

            {/* Specs Grid (Mini) */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-std bg-panel/30 backdrop-blur-sm">
              <div className="px-4 py-2 border-r border-border-std">
                <div className="text-[10px] text-text-dim font-mono uppercase mb-1">Fast Shipping</div>
                <div className="text-xl font-display font-bold text-white">24-48h</div>
              </div>
              <div className="px-4 py-2">
                <div className="text-[10px] text-text-dim font-mono uppercase mb-1">Satisfaction</div>
                <div className="text-xl font-display font-bold text-white">100%</div>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/studio">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-cyan hover:bg-white transition-colors duration-200 h-14 w-full sm:w-auto min-w-[240px] px-8 flex items-center justify-between rounded-sm mt-4"
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <span className="relative z-10 text-void font-mono font-bold text-lg tracking-wider group-hover:text-void transition-colors">Start Designing</span>
                <span className="relative z-10 text-void group-hover:translate-x-1 transition-transform">
                  <ArrowRight />
                </span>
                {/* Corner Accents */}
                <div className="absolute top-0 right-0 h-2 w-2 bg-void transform translate-x-1 -translate-y-1 rotate-45"></div>
                <div className="absolute bottom-0 left-0 h-2 w-2 bg-void transform -translate-x-1 translate-y-1 rotate-45"></div>
              </motion.button>
            </Link>
          </motion.div>

          <div className="absolute bottom-6 left-6 font-mono text-[10px] text-text-dim opacity-50 hidden md:block">
            COORD: 34.0522° N, 118.2437° W
          </div>
        </div>

        {/* Right Pane: 3D Visualizer */}
        <div className="hidden lg:flex w-1/2 bg-void relative items-center justify-center overflow-hidden group/visualizer">
          {/* Background Radial Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-cyan/5 to-transparent opacity-50"></div>

          {/* Grid Floor Perspective */}
          <motion.div
            animate={{ backgroundPosition: ["0px 0px", "0px 40px"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 opacity-20 transform origin-bottom"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
            }}
          />

          {/* Central Visual Container with 3D Float */}
          <motion.div
            animate={{ y: [-15, 15, -15], rotateY: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-[500px] h-[600px] flex items-center justify-center transform-style-3d"
          >
            {/* Rotating Rings */}
            <div className="absolute inset-0 border border-cyan/20 rounded-full animate-spin-slow border-dashed"></div>
            <div className="absolute inset-[10%] border border-magenta/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

            {/* T-Shirt Image with Glitch/Hover Effect */}
            <div className="relative z-10 w-[400px] h-[500px]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8r7kTRy35CA6EY8iGtdBkVVsbhG9Hlft-9R9iiiSWJnKfSjbYywGzr9md10kY9ghnnDCR1ZmUbTbjPw--wEA_nkeIeWMSPgyv0vq4ATBxtfugSCnNJEMHdUp6HX9bTpIe7p5U8QnOgaOiOJY-s0NWGXjgBo-iL4Bl3rEPJKPzA1MVh_qzKpdJiVz9EyxSvVq6CgXAy6b12wP5P_4JxWbBAU457vaS2-dnpKKuYZv0DhOWd__llO2AY3YJmJ5J6QXeXPG0Uxgb8VI"
                alt="Ghost T-Shirt Render"
                fill
                unoptimized
                sizes="400px"
                className="object-contain filter grayscale contrast-150 brightness-75 opacity-80 mix-blend-screen drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                priority
              />
              <div className="absolute inset-0 bg-cyan mix-blend-overlay opacity-0 group-hover/visualizer:opacity-20 transition-opacity duration-300"></div>

              {/* Revealed Design */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showDesign ? 1 : 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="flex flex-col items-center mt-[15%] opacity-90 drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] mix-blend-screen scale-110">
                  <span className="font-display font-bold text-5xl text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan text-center leading-[0.8] tracking-tighter mix-blend-plus-lighter">
                    EVERYDAY<br />DROP
                  </span>
                  <div className="w-16 h-1 bg-cyan mt-4 opacity-80 shadow-[0_0_10px_#00F0FF]"></div>
                  <span className="font-mono text-[9px] text-white tracking-[0.3em] uppercase mt-2 opacity-80 font-bold">
                    Design. Print. Deliver.
                  </span>
                </div>
              </motion.div>

              <div className="absolute top-0 left-0 w-full h-1 bg-cyan shadow-[0_0_10px_#00F0FF] animate-scan opacity-50 z-20"></div>
            </div>

            {/* Floating Data Points */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1 }}
              className="absolute top-[20%] right-[10%] bg-panel/80 border border-cyan/30 backdrop-blur px-2 py-1 text-[10px] font-mono text-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            >
              MESH_DENSITY: HIGH
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="absolute bottom-[25%] left-[5%] bg-panel/80 border border-magenta/30 backdrop-blur px-2 py-1 text-[10px] font-mono text-magenta shadow-[0_0_10px_rgba(211,45,255,0.2)]"
            >
              UV_MAP: UNWRAPPED
            </motion.div>

            {/* Crosshairs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-cyan/10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[120%] bg-cyan/10 pointer-events-none"></div>
          </motion.div>

          {/* Corner Brackets */}
          <div className="absolute top-10 left-10 h-16 w-16 border-t-2 border-l-2 border-cyan opacity-50"></div>
          <div className="absolute top-10 right-10 h-16 w-16 border-t-2 border-r-2 border-cyan opacity-50"></div>
          <div className="absolute bottom-10 left-10 h-16 w-16 border-b-2 border-l-2 border-cyan opacity-50"></div>
          <div className="absolute bottom-10 right-10 h-16 w-16 border-b-2 border-r-2 border-cyan opacity-50"></div>

          {/* Render Status */}
          <div className="absolute bottom-8 right-8 text-right">
            <div className="text-xs font-mono text-text-dim mb-1">LIVE PREVIEW</div>
            <div className="flex gap-1 justify-end">
              <div className="w-1 h-3 bg-cyan animate-pulse"></div>
              <div className="w-1 h-3 bg-cyan/50"></div>
              <div className="w-1 h-3 bg-cyan/20"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Scrolling Marquee Footer Area */}
      <div className="h-10 bg-panel border-b border-border-std flex items-center overflow-hidden shrink-0 relative z-20">
        <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
          {/* Loop Array to emulate smooth infinite scrolling */}
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center gap-4 text-xs font-mono font-bold text-text-dim uppercase tracking-widest">
              <span className="text-cyan">+++</span> PREMIUM QUALITY
              <span className="text-cyan">+++</span> FAST SHIPPING
              <span className="text-cyan">+++</span> NO MINIMUMS
            </span>
          ))}
        </div>
      </div>

      {/* Live Inventory Preview */}
      {products && products.length > 0 && (
        <section className="relative z-20 py-24 bg-void/90 backdrop-blur-sm border-t border-border-std border-dashed">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-border-std pb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight">
                  <span className="text-cyan">Featured Products</span>
                </h2>
                <p className="mt-2 text-text-dim font-mono text-xs uppercase tracking-widest">
                  &gt; Check out some of our most popular items ready for you to customize.
                </p>
              </div>
              <Link href="/gallery" className="mt-4 md:mt-0 group flex items-center text-xs font-mono text-magenta border border-magenta px-4 py-2 hover:bg-magenta hover:text-white transition-all shadow-[0_0_10px_rgba(211,45,255,0.2)]">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {products.slice(0, 5).map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/gallery/${product.id}`}
                    className="group flex flex-col bg-panel border border-border-std hover:border-cyan transition-colors overflow-hidden relative"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-cyan border border-cyan/30 backdrop-blur">
                      ID: {product.id.split('-')[0]}
                    </div>

                    <div className="aspect-square bg-grid-pattern bg-[length:20px_20px] bg-panel-highlight relative overflow-hidden flex items-center justify-center p-6">
                      <div className="absolute inset-0 bg-cyan mix-blend-overlay opacity-0 group-hover:opacity-10 transition-opacity"></div>

                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500 ease-out filter contrast-125"
                        />
                      ) : (
                        <ShoppingBag className="h-12 w-12 text-border-std" />
                      )}
                    </div>

                    <div className="p-4 border-t border-border-std">
                      <h3 className="font-mono text-xs font-bold text-text-main group-hover:text-cyan transition-colors truncate uppercase">
                        {product.name}
                      </h3>
                      <div className="flex items-end justify-between mt-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-text-dim font-mono mb-0.5">Starting at</span>
                          <span className="text-sm font-bold text-white font-mono tracking-wider">₹{Number(product.base_price).toFixed(0)}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 border border-magenta/30 text-magenta font-mono uppercase bg-magenta/5">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative z-20 py-24 bg-void border-t border-border-std border-dashed">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16 border-b border-border-std pb-8">
            <div className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/5 px-3 py-1.5 mb-6">
              <Terminal className="h-4 w-4 text-cyan" />
              <span className="font-mono text-[10px] font-bold text-cyan uppercase tracking-widest">OPERATION_MANUAL //</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tighter text-white uppercase">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-white to-magenta drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">EVERYDAYDROP</span> Works
            </h2>
            <p className="mt-4 text-text-dim font-mono text-sm max-w-2xl mx-auto tracking-wide">
              &gt; From imagination to doorstep — create, customize, and get it printed on premium products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative bg-panel border flex flex-col items-start border-border-std p-6 hover:border-cyan transition-colors duration-300 overflow-hidden"
              >
                {/* Crosshairs & Accents */}
                <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan/50 tracking-widest">
                  PHASE_0{i + 1}
                </div>

                <div className="flex items-center justify-center h-12 w-12 border border-cyan/30 bg-cyan/10 text-cyan mb-4 group-hover:bg-cyan group-hover:text-void transition-colors shadow-[0_0_10px_rgba(0,240,255,0.1)] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <feature.icon className="h-5 w-5" />
                </div>

                <div className="text-[10px] font-mono font-bold text-magenta mb-2 uppercase tracking-widest">STEP {i + 1}</div>
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-tight mb-2">{feature.title}</h3>
                <p className="text-xs font-mono text-text-dim leading-relaxed">{feature.desc}</p>

                {/* Hover scanline */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan shadow-[0_0_10px_#00F0FF] opacity-0 group-hover:opacity-50 group-hover:animate-scan"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Order / Printing Banner */}
      <section className="py-12 bg-magenta relative border-y border-magenta z-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white opacity-50 shadow-[0_0_10px_#FFF]"></div>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white opacity-50 shadow-[0_0_10px_#FFF]"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="py-4 md:py-0 px-4">
              <Package className="h-8 w-8 mx-auto mb-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <h3 className="font-mono font-bold text-lg text-white uppercase tracking-widest">Bulk Orders</h3>
              <p className="text-xs font-mono text-white/80 mt-2 uppercase tracking-wide">Order in bulk with ease — corporate branding, events, merch</p>
            </div>
            <div className="py-4 md:py-0 px-4">
              <Printer className="h-8 w-8 mx-auto mb-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <h3 className="font-mono font-bold text-lg text-white uppercase tracking-widest">High Quality Printing</h3>
              <p className="text-xs font-mono text-white/80 mt-2 uppercase tracking-wide">Printed on our own machines — DTF, sublimation, screen print</p>
            </div>
            <div className="py-4 md:py-0 px-4">
              <Zap className="h-8 w-8 mx-auto mb-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <h3 className="font-mono font-bold text-lg text-white uppercase tracking-widest">Fast Delivery</h3>
              <p className="text-xs font-mono text-white/80 mt-2 uppercase tracking-wide">Quick turnaround — shipped across India within 3-5 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-void relative z-20 border-t border-border-std border-dashed flex justify-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="border border-cyan/40 bg-panel/80 p-12 md:p-20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10 pointer-events-none"></div>

            {/* glowing corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-[3px] border-l-[3px] border-cyan shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[3px] border-r-[3px] border-magenta shadow-[0_0_15px_rgba(211,45,255,0.5)]"></div>

            {/* Cyberpunk Decor */}
            <div className="absolute right-8 top-8 opacity-20 hidden md:block">
              <QrCode className="w-24 h-24 text-cyan" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 border border-magenta/50 bg-magenta/10 px-3 py-1 mb-6">
                <Star className="h-3 w-3 text-magenta" />
                <span className="font-mono text-[10px] font-bold text-magenta uppercase tracking-widest">Start for free — AI credits included</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Ready to Create<br />
                <span className="text-cyan drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">Something Amazing?</span>
              </h2>
              <p className="text-text-dim max-w-xl mx-auto mb-10 font-mono text-sm tracking-wide">
                &gt; Join creators and brands who are designing and selling custom apparel with AI — printed in India, shipped to your doorstep.
              </p>

              <Link href="/signup">
                <button className="relative group/btn bg-cyan hover:bg-white transition-colors h-16 px-10 flex items-center justify-between gap-6 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] border-none outline-none">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  <span className="relative z-10 font-mono font-bold text-base text-black tracking-widest uppercase">
                    [ Get Started Free ]
                  </span>
                  <ArrowRight className="relative z-10 h-6 w-6 text-black group-hover/btn:translate-x-1 transition-transform" />

                  {/* Glitch sub-text */}
                  <div className="absolute -bottom-6 right-0 font-mono text-[8px] text-cyan uppercase tracking-widest opacity-70">
                    AUTH_REQUIRED //
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
