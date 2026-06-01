'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Check,
  Star,
  Clock,
  Phone,
  RotateCcw,
  ShoppingBag,
  Plus,
  Minus,
  X,
  MapPin,
  ChevronDown,
  Instagram,
  Facebook,
  Award,
  ShieldCheck,
  Sparkles,
  Utensils
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hls from 'hls.js';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Structuring burgers data
interface Burger {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const BURGERS: Burger[] = [
  {
    id: 'supremo',
    name: 'Burger Supremo',
    description: 'Blend Angus 180g, cheddar cremoso derretido, cebola caramelizada artesanal, bacon crocante em tiras e maionese defumada no pão brioche premium.',
    price: 38.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'bacon-prime',
    name: 'Burger Bacon Prime',
    description: 'Blend Angus 180g grelhado na brasa, queijo provolone tostado, geleia de bacon defumada, maionese da casa e cebola roxa marinada em pão australiano.',
    price: 42.90,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'cheddar-explosion',
    name: 'Burger Cheddar Explosion',
    description: 'Dois smash blends Angus de 100g, melt de cheddar duplo injetado na hora, coberto por farofa de bacon crocante, servido no pão brioche selado.',
    price: 45.90,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop'
  }
];

// Reusable Background Video/Image component to support future video replacement easily
function SectionBackground({
  imageUrl,
  videoPlaceholderId,
  overlayOpacity = 'bg-black/60'
}: {
  imageUrl?: string;
  videoPlaceholderId: string;
  overlayOpacity?: string;
}) {
  return (
    <div id={`bg-container-${videoPlaceholderId}`} className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-transparent pointer-events-none">
      {/* Overlays Cinemáticos para Perfeita Legibilidade */}
      <div className={`absolute inset-0 ${overlayOpacity} z-10 transition-opacity duration-300`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/70 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
    </div>
  );
}

export default function Home() {
  // Navigation & Scroll Tracking
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const targetTimeRef = useRef(0);

  // Background Video State & Load/Buffer Management
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [bufferPercentage, setBufferPercentage] = useState(0);

  // Load Adaptive Stream or Direct MP4 url
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const video = videoRef.current;
    if (!video) return;

    const mp4Url = 'https://res.cloudinary.com/dq3cmyhmo/video/upload/v1780245130/Hamb%C3%BArguer_explode_em_c%C3%A2mera_lenta_202605311322_wodmyu.mp4';
    // Cloudinary adapts automatically if loaded as .m3u8 with adaptive streaming profiles.
    const hlsUrl = mp4Url.replace('.mp4', '.m3u8');

    // Identify Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let hls: Hls | null = null;

    // Track buffering progress of the video
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const pct = Math.round((bufferedEnd / duration) * 100);
          setBufferPercentage((prev) => Math.min(100, Math.max(prev, pct)));
        }
      }
    };

    const handleCanPlay = () => {
      setBufferPercentage(100);
      const timer = setTimeout(() => {
        setIsVideoLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    };

    video.addEventListener('progress', handleProgress);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);

    const loadNativeMp4 = () => {
      video.src = mp4Url;
      video.load();
    };

    // If not Safari and HLS is supported, use hls.js for adaptive streaming
    if (!isSafari && Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('HLS.js fatal error, falling back natively to raw MP4:', data);
          hls?.destroy();
          hls = null;
          loadNativeMp4();
        }
      });
    } else {
      // Direct native playback (ideal for Safari as requested, and fallback devices)
      loadNativeMp4();
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, []);

  // Safety loading fallback threshold
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsVideoLoading(false);
    }, 6000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // 1. Smoothly transition video currentTime when activeSection changes (extremely lightweight & fluid)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const video = videoRef.current;
    if (!video || isVideoLoading) return;
    const duration = video.duration;
    if (!duration || isNaN(duration)) return;

    if (activeSection > 0) {
      // Smoothly animate video forward to show the exploding burger sequence
      gsap.to(video, {
        currentTime: duration,
        duration: 1.6,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          targetTimeRef.current = video.currentTime;
        }
      });
    } else {
      // Smoothly reverse to the original appetizing static burger state when scrolled to the top
      gsap.to(video, {
        currentTime: 0,
        duration: 1.6,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          targetTimeRef.current = video.currentTime;
        }
      });
    }
  }, [activeSection, isVideoLoading]);

  // 2. High performance Scroll-To-Seek Lock in section 0 (Hero) with premium GSAP Inertial Interpolation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video || isVideoLoading) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Only handle lock/scrub if we are currently parked or starting on the Hero section
      if (activeSection !== 0) return;

      const duration = video.duration;
      if (!duration || isNaN(duration)) return;

      // Scrolling Down
      if (e.deltaY > 0) {
        // As long as the video hasn't scrubbed near the end, hijack the scroll event
        if (targetTimeRef.current < duration - 0.12) {
          e.preventDefault();
          
          // Smoothen out variations between mouse wheels and trackpads
          const rawDelta = e.deltaY;
          const cappedDelta = Math.sign(rawDelta) * Math.min(60, Math.abs(rawDelta));
          const step = cappedDelta * 0.0018; 
          
          let nextTarget = targetTimeRef.current + step;
          if (nextTarget > duration - 0.04) {
            nextTarget = duration;
          }
          
          targetTimeRef.current = nextTarget;

          // Perform state-of-the-art cinematic inertial seek via GSAP tweening
          gsap.to(video, {
            currentTime: nextTarget,
            duration: 0.70,
            ease: "power1.out",
            overwrite: "auto"
          });
        }
      } 
      // Scrolling Up
      else if (e.deltaY < 0) {
        // If we are at the top of the container, scrub the video backwards cleanly with similar physics
        if (containerRef.current && containerRef.current.scrollTop === 0) {
          if (targetTimeRef.current > 0.04) {
            e.preventDefault();
            
            const rawDelta = e.deltaY;
            const cappedDelta = Math.sign(rawDelta) * Math.min(60, Math.abs(rawDelta));
            const step = cappedDelta * 0.0018; 
            
            let nextTarget = targetTimeRef.current + step;
            if (nextTarget < 0) {
              nextTarget = 0;
            }
            
            targetTimeRef.current = nextTarget;

            gsap.to(video, {
              currentTime: nextTarget,
              duration: 0.70,
              ease: "power1.out",
              overwrite: "auto"
            });
          }
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (activeSection !== 0) return;
      if (e.touches.length === 0) return;

      const duration = video.duration;
      if (!duration || isNaN(duration)) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = scroll down (swipe up)

      if (deltaY > 0) {
        if (targetTimeRef.current < duration - 0.12) {
          e.preventDefault();
          
          const cappedDelta = Math.sign(deltaY) * Math.min(45, Math.abs(deltaY));
          const step = cappedDelta * 0.0025;
          let nextTarget = targetTimeRef.current + step;
          
          if (nextTarget > duration - 0.04) {
            nextTarget = duration;
          }
          targetTimeRef.current = nextTarget;
          
          gsap.to(video, {
            currentTime: nextTarget,
            duration: 0.75,
            ease: "power1.out",
            overwrite: "auto"
          });
          
          touchStartY = currentY;
        }
      } else if (deltaY < 0) {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
          if (targetTimeRef.current > 0.04) {
            e.preventDefault();
            
            const cappedDelta = Math.sign(deltaY) * Math.min(45, Math.abs(deltaY));
            const step = cappedDelta * 0.0025;
            let nextTarget = targetTimeRef.current + step;
            
            if (nextTarget < 0) {
              nextTarget = 0;
            }
            targetTimeRef.current = nextTarget;
            
            gsap.to(video, {
              currentTime: nextTarget,
              duration: 0.75,
              ease: "power1.out",
              overwrite: "auto"
            });
            
            touchStartY = currentY;
          }
        }
      }
    };

    hero.addEventListener('wheel', handleWheel, { passive: false });
    hero.addEventListener('touchstart', handleTouchStart, { passive: true });
    hero.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      hero.removeEventListener('wheel', handleWheel);
      hero.removeEventListener('touchstart', handleTouchStart);
      hero.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeSection, isVideoLoading]);

  // Mouse move 3D Parallax on background video element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const video = videoRef.current;
    if (!video) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Offset from center (-0.5 to 0.5)
      const xPercent = (clientX / innerWidth) - 0.5;
      const yPercent = (clientY / innerHeight) - 0.5;

      gsap.to(video, {
        x: xPercent * 30, // move up to 30px
        y: yPercent * 30,
        rotateX: -yPercent * 4, // subtle perspective tilt
        rotateY: xPercent * 4,
        transformPerspective: 1200,
        duration: 1.0,
        ease: "power2.out"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Cart Mechanics (Portuguese CRM & Conversion Catalyst)
  const [cart, setCart] = useState<{ burger: Burger; quantity: number; point: string; extras: string[] }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');

  // Point of rawness & Extra options for checkout configurator
  const [selectedBurgerForConfig, setSelectedBurgerForConfig] = useState<Burger | null>(null);
  const [configPoint, setConfigPoint] = useState('Ao Ponto');
  const [configExtras, setConfigExtras] = useState<string[]>([]);

  // Fake Visual Timer State for Combo (Ticks down nicely from 02:14:35)
  const [timer, setTimer] = useState({ hours: 2, minutes: 14, seconds: 35 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 14, seconds: 35 }; // Reset to loop
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track scrolling section to highlight current navigation dot
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    // Round to nearest section index
    const index = Math.round(scrollTop / height);
    if (index !== activeSection) {
      setActiveSection(index);
    }
  };

  // Quick navigation scroll function
  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: index * height,
      behavior: 'smooth'
    });
  };

  // Add Item to configurations first
  const openItemConfig = (burger: Burger) => {
    setSelectedBurgerForConfig(burger);
    setConfigPoint('Ao Ponto');
    setConfigExtras([]);
  };

  const handleToggleExtra = (extra: string) => {
    if (configExtras.includes(extra)) {
      setConfigExtras(configExtras.filter(e => e !== extra));
    } else {
      setConfigExtras([...configExtras, extra]);
    }
  };

  const confirmAddToCart = () => {
    if (!selectedBurgerForConfig) return;
    
    // Check if exactly same item with same point and extras already in cart
    const existingIndex = cart.findIndex(item => 
      item.burger.id === selectedBurgerForConfig.id && 
      item.point === configPoint && 
      JSON.stringify(item.extras.sort()) === JSON.stringify(configExtras.sort())
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { burger: selectedBurgerForConfig, quantity: 1, point: configPoint, extras: configExtras }]);
    }

    setSelectedBurgerForConfig(null);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  // Helper code to calculate price details
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const extrasCost = item.extras.length * 5.00; // Extra ingredients cost R$ 5,00 each
      return total + (item.burger.price + extrasCost) * item.quantity;
    }, 0);
  };

  // Custom checkout message formatter to send straight to active WhatsApp
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (deliveryType === 'delivery' && !clientAddress.trim()) {
      alert('Por favor, informe o endereço de entrega.');
      return;
    }

    const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;
    let itemsText = '';
    
    cart.forEach(item => {
      const extrasCost = item.extras.length * 5.00;
      const basePlusExtras = item.burger.price + extrasCost;
      itemsText += `• *${item.quantity}x ${item.burger.name}* (${formatCurrency(item.burger.price)})\n`;
      itemsText += `  Ponto: _${item.point}_\n`;
      if (item.extras.length > 0) {
        itemsText += `  Adicionais: _${item.extras.join(', ')}_ (+${formatCurrency(extrasCost)})\n`;
      }
      itemsText += `  Subtotal: ${formatCurrency(basePlusExtras * item.quantity)}\n\n`;
    });

    const finalTotal = getCartTotal() + (deliveryType === 'delivery' ? 7.00 : 0);

    const message = encodeURIComponent(
      `🍔 *NOVO PEDIDO - HAMBURGUERIA ARTESANAL* 🍔\n` +
      `------------------------------------------\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `🛵 *Forma:* ${deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada no Balcão'}\n` +
      `${deliveryType === 'delivery' ? `📍 *Endereço:* ${clientAddress}\n` : ''}` +
      `------------------------------------------\n` +
      `🛒 *Itens do Pedido:*\n\n${itemsText}` +
      `------------------------------------------\n` +
      `${deliveryType === 'delivery' ? `🛵 Taxa de Entrega: R$ 7,00\n` : ''}` +
      `💰 *Total Geral:* ${formatCurrency(finalTotal)}\n` +
      `------------------------------------------\n` +
      `✨ *Pedido gerado pelo site cinematográfico da casa!*`
    );

    window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=${message}`, '_blank');
  };

  return (
    <div className="bg-[#050505] text-white font-sans antialiased relative selection:bg-[#c5a059]/40 selection:text-white">
      
      {/* 0. CINEMATIC VIDEO LOADING OVERLAY */}
      <AnimatePresence>
        {isVideoLoading && (
          <motion.div
            key="video-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col items-center max-w-sm px-6 text-center">
              <div className="relative mb-6">
                {/* Outter glowing spinner ring */}
                <div className="w-16 h-16 rounded-full border-2 border-zinc-900 border-t-[#c5a059] animate-spin" />
                {/* Center glowing logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#c5a059] animate-pulse" />
                </div>
              </div>

              <span className="font-sans font-bold tracking-[0.2em] text-sm uppercase text-[#c5a059]">
                ARTISAN BURGER
              </span>
              <p className="text-xs text-zinc-550 font-mono tracking-widest mt-2 uppercase">
                Carregando Experiência Cinematográfica
              </p>
              
              {/* Buffering bar indicator */}
              <div className="w-48 h-[3px] bg-zinc-950 mt-6 rounded-full overflow-hidden relative border border-zinc-900">
                <div 
                  className="h-full bg-gradient-to-r from-[#7f0000] to-[#c5a059] transition-all duration-300"
                  style={{ width: `${bufferPercentage}%` }}
                />
              </div>
              <span className="text-zinc-650 text-[10px] font-mono mt-2 block">
                {bufferPercentage}% carregado
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Scroll-Seek Background Video */}
      <div id="video-scrub-container" className="fixed inset-0 w-full h-screen z-0 overflow-hidden bg-[#050505]">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover origin-center transition-opacity duration-500"
          style={{ transform: "scale(1)", opacity: 1.0 }}
        />
        
        {/* Dynamic Dark cinematic overlays for perfect contextual readability */}
        <div 
          className="absolute inset-0 bg-black transition-all duration-1000 ease-in-out pointer-events-none z-10"
          style={{ backgroundColor: activeSection === 0 ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.70)" }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black transition-all duration-1000 ease-in-out pointer-events-none z-10"
          style={{ opacity: activeSection === 0 ? 0.35 : 0.85 }}
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(127,0,0,0.1)_0%,_transparent_70%)] transition-all duration-1000 ease-in-out pointer-events-none z-10"
          style={{ opacity: activeSection === 0 ? 0.2 : 0.6 }}
        />
      </div>

      {/* Cinematic Background Overlays */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(127,0,0,0.15)_0%,_transparent_70%)] opacity-65 pointer-events-none z-10"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.7),rgba(5,5,5,0.3)_50%,rgba(5,5,5,0.8))] pointer-events-none z-10"></div>
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#7f0000] rounded-full blur-[150px] opacity-15 pointer-events-none z-10"></div>

      {/* 1. HEADER OVERLAY NAVIGATION (Fixed, Floating) */}
      <header id="header-nav" className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-6 backdrop-blur-[4px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection(0)}>
            <div className="relative p-2.5 bg-gradient-to-br from-[#7f0000] to-[#3a0000] border-2 border-[#c5a059]/40 rounded-lg shadow-lg">
              <Flame className="w-5 h-5 text-[#c5a059]" />
            </div>
            <span className="font-sans font-bold tracking-[0.2em] text-[#c5a059] text-lg hidden sm:inline-block uppercase">
              ARTISAN <span className="text-white font-light text-base">BURGER</span>
            </span>
          </div>

          <nav className="hidden md:flex gap-8 items-center text-xs uppercase tracking-widest font-semibold text-zinc-400">
            <button
              onClick={() => scrollToSection(1)}
              className={`hover:text-[#c5a059] transition-colors cursor-pointer ${activeSection === 1 ? 'text-[#c5a059] border-b-2 border-[#c5a059] pb-1' : ''}`}
            >
              Qualidade
            </button>
            <button
              onClick={() => scrollToSection(2)}
              className={`hover:text-[#c5a059] transition-colors cursor-pointer ${activeSection === 2 ? 'text-[#c5a059] border-b-2 border-[#c5a059] pb-1' : ''}`}
            >
              Processo
            </button>
            <button
              onClick={() => scrollToSection(3)}
              className={`hover:text-[#c5a059] transition-colors cursor-pointer ${activeSection === 3 ? 'text-[#c5a059] border-b-2 border-[#c5a059] pb-1' : ''}`}
            >
              Favoritos
            </button>
            <button
              onClick={() => scrollToSection(4)}
              className={`hover:text-[#c5a059] transition-colors cursor-pointer ${activeSection === 4 ? 'text-[#c5a059] border-b-2 border-[#c5a059] pb-1' : ''}`}
            >
              Avaliações
            </button>
            <button
              onClick={() => scrollToSection(5)}
              className={`hover:text-[#c5a059] transition-colors cursor-pointer ${activeSection === 5 ? 'text-[#c5a059] border-b-2 border-[#c5a059] pb-1' : ''}`}
            >
              Combo
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-zinc-950 border border-zinc-900 rounded-full hover:border-[#c5a059]/80 hover:text-[#c5a059] transition-all cursor-pointer shadow-md group flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7f0000] border border-[#c5a059]/70 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => scrollToSection(6)}
              className="px-6 py-2 bg-gradient-to-r from-[#7f0000] to-[#5a0000] border border-[#c5a059]/60 rounded-full font-bold uppercase tracking-widest text-xs hover:border-[#c5a059] hover:from-[#5a0000] hover:to-[#7f0000] hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all cursor-pointer"
            >
              Peça Agora
            </button>
          </div>
        </div>
      </header>

      {/* 2. PERSISTENT FLOATING DOT NAVIGATION INDICATORS (Right Side) */}
      <div id="dot-nav-indicators" className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-6">
        {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
          const names = ['Início', 'Experiência', 'Produção', 'Cardápio', 'Avaliações', 'Combos', 'Pedido'];
          const isActive = activeSection === idx;
          return (
            <div key={idx} className="group flex flex-col items-end cursor-pointer" onClick={() => scrollToSection(idx)}>
              <span className={`text-[9px] uppercase tracking-tighter transition-all duration-300 font-bold mb-1 ${
                isActive ? 'text-[#c5a059] translate-x-0' : 'text-zinc-500 opacity-60 translate-x-2'
              }`}>
                0{idx + 1} {names[idx]}
              </span>
              <div className={`h-[2.5px] transition-all duration-300 ${
                isActive ? 'w-10 bg-[#c5a059]' : 'w-4 bg-zinc-700 group-hover:w-6 group-hover:bg-zinc-400'
              }`} />
            </div>
          );
        })}
      </div>

      {/* 3. 100vh FULL-SCREEN CONTAINER WITH Y-SNAP */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen w-full snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scroll-smooth scrollbar-none"
      >
        
        {/* SEÇÃO 1 - HERO (100vh) */}
        <section ref={heroRef} id="banner-hero" className="h-screen w-full relative flex items-center snap-start justify-start px-6 lg:px-16 xl:px-24 overflow-hidden">
          {/* Transparent left-to-right shadow gradient keeping center-right completely unmasked */}
          <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />

          <div className="z-20 max-w-xl md:max-w-xl lg:max-w-2xl w-full flex flex-col items-start pt-16 md:pt-20 pl-0 md:pl-4 select-none">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: false }}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#4a0000]/80 border border-[#c5a059]/40 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase shadow-lg self-start animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              Premium & 100% Artesanal por Essência
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-[1.12] mb-5 italic tracking-tight text-white max-w-md lg:max-w-lg"
            >
              O Hambúrguer Artesanal Que Vai Mudar Seu <br />
              <span className="bg-gradient-to-r from-[#ffd700] to-[#c5a059] bg-clip-text text-transparent not-italic font-sans font-extrabold uppercase tracking-tighter">
                Conceito de Sabor
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false }}
              className="mt-3 text-zinc-350 max-w-sm lg:max-w-md text-sm sm:text-base leading-relaxed font-sans"
            >
              Ingredientes selecionados sob curadoria de chefs, carne Angus ultra-premium grelhada em chama viva e uma explosão de cremosidade insana em cada mordida.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false }}
              className="mt-10 flex flex-wrap gap-4 items-center"
            >
              <button
                onClick={() => scrollToSection(3)}
                className="px-8 py-4 bg-gradient-to-r from-[#7f0000] to-[#5a0000] text-white font-bold uppercase tracking-widest text-xs rounded-full border-b-4 border-[#3a0000] transition-all duration-300 hover:scale-105 hover:from-[#9a0000] hover:to-[#7f0000] hover:shadow-[0_0_25px_rgba(127,0,0,0.5)] cursor-pointer"
              >
                Peça Agora
              </button>
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video && video.duration) {
                    gsap.to(video, {
                      currentTime: video.duration - 0.25,
                      duration: 0.8,
                      onComplete: () => {
                        scrollToSection(1);
                      }
                    });
                  } else {
                    scrollToSection(1);
                  }
                }}
                className="px-8 py-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-[#c5a059]/40 rounded-full font-bold uppercase tracking-widest text-xs text-zinc-300 transition-all duration-300 cursor-pointer"
              >
                Ver Experiência
              </button>
            </motion.div>
          </div>

          {/* Scoll indicator down */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-80 cursor-pointer" onClick={() => scrollToSection(1)}>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#c5a059]">Scroll para Explorar</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-[#c5a059] rounded-full"
            />
            <div className="w-5 h-8 border-2 border-zinc-850 rounded-full flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2 - EXPERIÊNCIA GASTRONÔMICA (100vh) */}
        <section id="secao-experiencia" className="h-screen w-full relative flex items-center snap-start justify-center px-6 lg:px-16 overflow-hidden bg-[#050505]">
          <div className="z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase mb-4"
              >
                <Award className="w-4 h-4 text-[#c5a059]" />
                Incomparável
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: false }}
                className="text-3xl sm:text-4xl lg:text-6xl font-serif font-light leading-[1.15] mb-4 italic text-white"
              >
                Muito Além de Um <br />
                <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Hambúrguer</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false }}
                className="mt-4 text-zinc-400 font-light leading-relaxed text-sm sm:text-base lg:text-lg font-sans"
              >
                Criamos rituais para suas papilas gustativas. Nossos hambúrgueres começam na escolha científica dos cortes premium, passam pelo pão de fermentação natural selado na manteiga, e encerram com molhos de assinaturas secretas.
              </motion.p>

              {/* Checkbox item list */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { text: 'Carne Angus Certificada', desc: 'Sabor rico e marmoreio ideal' },
                  { text: 'Pão Artesanal Brioche', desc: 'Injetado e selado na chapa' },
                  { text: 'Molhos Exclusivos', desc: 'Receitas secretas da casa' },
                  { text: 'Ingredientes Frescos', desc: 'Colheita local selecionada' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: false }}
                    className="flex gap-3 items-start p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 hover:border-[#c5a059]/40 transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-[#4a0000]/60 border border-[#c5a059]/25 text-[#c5a059] group-hover:scale-110 transition-transform">
                      <Check className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#c5a059] transition-colors">{item.text}</h4>
                      <p className="text-zinc-500 text-[11px] sm:text-xs leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Video / Asset Placeholder Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="lg:col-span-6 h-48 lg:h-[70vh] relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group"
            >
              {/* Fallback image designed elegantly to feel like video display */}
              <img
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop"
                alt="Carne Sizzling Angus"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
              
              {/* Overlay with subtle static indicator text "VIDEO_FEED_RAW" layout option */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 border border-zinc-900 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest text-[#c5a059]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                Live Griddle Loop
              </div>

              {/* Preparado para vídeo de close da carne na chapa */}
              {/* 
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                >
                  <source src="/videos/griddle_close_up.mp4" type="video/mp4" />
                </video>
              */}

              <div className="absolute bottom-6 inset-x-6 z-20 bg-black/60 backdrop-blur-md border border-zinc-900 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#c5a059] uppercase font-bold tracking-widest">Carne Sizzling Angus</span>
                  <p className="text-xs text-zinc-350 mt-1 font-sans">Gabinete de fogo e ponto perfeito selado a 280°C.</p>
                </div>
                <div className="flex gap-1">
                  <Star className="w-4 h-4 text-[#c5a059] fill-current" />
                  <Star className="w-4 h-4 text-[#c5a059] fill-current" />
                  <Star className="w-4 h-4 text-[#c5a059] fill-current" />
                  <Star className="w-4 h-4 text-[#c5a059] fill-current" />
                  <Star className="w-4 h-4 text-[#c5a059] fill-current" />
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SEÇÃO 3 - PROCESSO ARTESANAL (100vh) */}
        <section id="secao-processo" className="h-screen w-full relative flex items-center snap-start justify-center px-6 lg:px-16 overflow-hidden bg-gradient-to-b from-[#050505] via-zinc-950 to-[#050505]">
          <div className="z-20 max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: -20 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              className="flex flex-col items-center mb-12 text-center"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase mb-3">
                <Utensils className="w-4.5 h-4.5" />
                Nossos Segredos Revelados
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-light leading-[1.1] text-white text-center">
                Preparado Com <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Perfeição</span>
              </h2>
              <div className="w-20 h-[2.5px] bg-[#c5a059] mt-4 rounded-full" />
            </motion.div>

            {/* Process Horizontal Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-6">
              {[
                {
                  step: '01',
                  title: 'Seleção Premium',
                  desc: 'Curadoria rígida da carne fresca de Angus com 20% de blend graxo secreto.'
                },
                {
                  step: '02',
                  title: 'Modelagem Manual',
                  desc: 'Porcionados artesanalmente com técnica de batida para extrair a textura ideal.'
                },
                {
                  step: '03',
                  title: 'Grelha Ativa',
                  desc: 'Selados em braseiro forte, caramelizando e mantendo todo o sumo interno.'
                },
                {
                  step: '04',
                  title: 'Montagem Final',
                  desc: 'Composição arquitetônica do burger com empilhamento premium de queijos e molhos.'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  viewport={{ once: false }}
                  className="relative group p-6 sm:p-8 bg-zinc-950/80 border border-zinc-900 rounded-3xl hover:bg-[#7f0000]/10 hover:border-[#c5a059]/40 hover:shadow-xl transition-all h-full"
                >
                  <div className="absolute top-4 right-6 text-5xl font-mono font-extrabold text-[#c5a059]/10 group-hover:text-[#c5a059]/25 transition-colors">
                    {item.step}
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center font-bold text-[#c5a059] border border-zinc-800 mb-6 group-hover:bg-[#c5a059] group-hover:text-zinc-950 transition-colors">
                    {item.step}
                  </div>

                  <h3 className="text-lg font-bold group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
                  <p className="mt-3 text-zinc-405 font-light text-sm leading-normal">{item.desc}</p>
                  
                  {/* Subtle link arrow */}
                  <div className="w-full bg-zinc-800/20 h-0.5 mt-6 relative overflow-hidden">
                    <div className="absolute h-full w-0 group-hover:w-full bg-[#c5a059] transition-all duration-700 left-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Video Placeholder Indicator */}
            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-8 block">
              Futuro Layout: Vídeo da montagem lenta tocando em grid de background
            </span>

          </div>
        </section>

        {/* SEÇÃO 4 - PRODUTOS DESTAQUE (100vh) */}
        <section id="secao-produtos" className="h-screen w-full relative flex items-center snap-start justify-center px-6 lg:px-16 overflow-hidden bg-[#050505]">
          <div className="z-20 max-w-7xl mx-auto w-full flex flex-col justify-center">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10"
            >
              <div>
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase">Artesanais Favoritos</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light leading-[1.12] text-white mt-1 italic">Os Favoritos da <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Casa</span></h2>
              </div>
              <p className="text-zinc-550 max-w-md font-light text-sm mt-3 md:mt-0 font-sans">
                Pressione para configurar seu ponto e adicionais e fazer o pedido diretamente pelo carrinho integrado.
              </p>
            </motion.div>

            {/* Burger Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 justify-center">
              {BURGERS.map((burger, i) => (
                <motion.div
                  key={burger.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  viewport={{ once: false }}
                  className="bg-zinc-950/40 border border-zinc-900 hover:border-[#c5a059]/40 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col group relative h-full"
                >
                  {/* Thumbnail */}
                  <div className="h-44 sm:h-48 relative overflow-hidden">
                    <img
                      src={burger.image}
                      alt={burger.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter brightness-95"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Price Tag */}
                    <div className="absolute top-4 right-4 bg-zinc-950 border border-[#c5a059]/40 px-4 py-1 rounded-full text-sm font-bold text-[#c5a059] shadow-lg">
                      R$ {burger.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-[#c5a059] transition-colors">{burger.name}</h3>
                      <p className="mt-2 text-zinc-400 font-light text-xs sm:text-sm leading-relaxed">{burger.description}</p>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => openItemConfig(burger)}
                        className="w-full py-3 bg-[#050505] border border-zinc-850 hover:bg-[#7f0000] text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:border-transparent transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner duration-300"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Quero Esse
                      </button>
                    </div>
                  </div>

                  {/* Future video indicators */}
                  <div className="absolute bottom-2 right-4 text-[9px] text-zinc-700 font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    Loop Individual Ativado
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* SEÇÃO 5 - PROVA SOCIAL (100vh) */}
        <section id="secao-provasocial" className="h-screen w-full relative flex items-center snap-start justify-center px-6 lg:px-16 overflow-hidden bg-[#050505]">
          <div className="z-20 max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase mb-2">Comunidade Apaixonada</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light leading-[1.1] text-white italic">Quem Prova, <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Volta</span></h2>
              <div className="flex gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 text-[#c5a059] fill-current animate-pulse" />
                ))}
              </div>
            </motion.div>

            {/* Testimonials Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
              {[
                {
                  text: 'Hamburguer incrível! O blend de carne bem gordurosa combinada com a maionese caseira é simplesmente divino. O brioche estava super quente e macio.',
                  author: 'Guilherme Silva',
                  role: 'Hamburguer Explorer',
                  score: 5
                },
                {
                  text: 'O Cheddar Explosion é uma verdadeira loucura sensorial. É farto e o queijo escorre maravilhoso, com um bacon crocante maravilhoso que faz toda diferença.',
                  author: 'Amanda Sant\'Anna',
                  role: 'Sommelier de Carnes',
                  score: 5
                },
                {
                  text: 'Melhor hamburgueria da região! Atendimento impecável, embalagem premium e os burgers chegam quentes, parecendo recém saindo da chapa. Nota 10.',
                  author: 'Rodrigo Mendonça',
                  role: 'Local Guide Google',
                  score: 5
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: false }}
                  className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6 sm:p-8 hover:border-[#c5a059]/40 hover:bg-zinc-950/70 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[#c5a059] text-4xl font-serif font-bold leading-none block mb-4">&ldquo;</span>
                    <p className="text-zinc-350 font-light text-sm leading-relaxed italic font-sans">{item.text}</p>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-4 pt-6 border-t border-zinc-900">
                    <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center font-bold text-[#c5a059] text-sm font-sans">
                      {item.author[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm font-sans">{item.author}</h4>
                      <p className="text-zinc-500 text-xs font-sans">{item.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Beautiful Stat Counters with actual golden gradient and borders */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-10 p-6 rounded-3xl bg-zinc-950/40 border border-zinc-900">
              {[
                { count: '+10.000', label: 'Pedidos Entregues' },
                { count: '4.9/5 ★', label: 'Avaliações do Delivery' },
                { count: '100% Angus', label: 'Certificação de Origem' },
                { count: '+30.000', label: 'Clientes Encantados' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center p-3">
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#c5a059] to-[#ffd700] bg-clip-text text-transparent font-sans">
                    {stat.count}
                  </span>
                  <span className="text-zinc-400 text-xs mt-1 font-light font-sans">{stat.label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SEÇÃO 6 - OFERTA ESPECIAL (100vh) */}
        <section id="secao-oferta" className="h-screen w-full relative flex items-center snap-start justify-center px-6 lg:px-16 overflow-hidden bg-[#050505]">
          <SectionBackground
            imageUrl="https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1200&auto=format&fit=crop"
            videoPlaceholderId="gourmet_burger_showcase"
            overlayOpacity="bg-black/70"
          />

          <div className="z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Countdown Details Side */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false }}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest text-[#c5a059] uppercase mb-4"
              >
                <Clock className="w-4 h-4 text-red-500 animate-spin" />
                Oferta Limitada para Hoje
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: false }}
                className="text-3xl sm:text-4xl lg:text-6xl font-serif font-light leading-[1.1] text-white italic"
              >
                Hoje Tem <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Combo Especial</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false }}
                className="mt-6 text-zinc-350 font-light leading-relaxed text-sm sm:text-base lg:text-lg font-sans"
              >
                Compre o monstruoso <strong className="font-bold text-white text-base">Cheddar Explosion</strong>, e acompanhado com Fritas Onduladas Rústicas + Maionese Artesanal de ervas + Coca-Cola de Vidro de 290ml por um valor inacreditável.
              </motion.p>

              {/* Combo Value Price Tags */}
              <div className="mt-8 flex items-center gap-6">
                <div className="text-zinc-500 line-through text-lg font-sans">
                  De R$ 68,90
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-green-500 flex items-center gap-2 font-sans">
                  Por R$ 49,90 <span className="text-xs bg-[#7f0000] text-white px-2.5 py-0.5 rounded-full border border-red-700 font-bold">27% OFF</span>
                </div>
              </div>

              {/* Countdown fake timer */}
              <div className="mt-8 flex items-center gap-4">
                <span className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Essa oferta expira em:</span>
                <div className="flex gap-2">
                  {[
                    { value: timer.hours, label: 'h' },
                    { value: timer.minutes, label: 'm' },
                    { value: timer.seconds, label: 's' }
                  ].map((t, idx) => (
                    <div key={idx} className="bg-zinc-950/80 border border-zinc-900 text-white font-mono px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 shadow-md">
                      <span className="text-[#c5a059]">{String(t.value).padStart(2, '0')}</span>
                      <span className="text-zinc-500 text-[10px]">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA action card and ordering directly */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="lg:col-span-6 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 p-8 rounded-3xl shadow-2xl"
            >
              <h3 className="text-lg font-bold text-[#c5a059] tracking-wider uppercase mb-1">Garantir Meu Combo Especial</h3>
              <p className="text-xs text-zinc-400 leading-normal font-light font-sans">Peça agora para prioridades no fogão. Entregas imediatas sob rigoroso controle de embalagem.</p>
              
              <ul className="mt-6 flex flex-col gap-3 font-sans">
                {[
                  'Incluso: Burger Cheddar Explosion (Duplo Smash Angus)',
                  'Incluso: Batatas Onduladas Rústicas Crocantes',
                  'Incluso: Molho Maionese Artesanal Exclusivo',
                  'Incluso: Coca-Cola Vidro Geladíssima'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 items-center text-xs text-zinc-300">
                    <Check className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  onClick={() => {
                    const comboBurger: Burger = {
                      id: 'combo_especial_hoje',
                      name: 'Combo Especial Cheddar Explosion',
                      description: 'Combo: Cheddar Explosion + Fritas Rústicas + Maionese Ervas + Coca-Cola Vidro.',
                      price: 49.90,
                      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop'
                    };
                    openItemConfig(comboBurger);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-[#7f0000] to-[#5a0000] text-white font-extrabold uppercase tracking-widest text-xs rounded-xl border-b-4 border-[#3a0000] hover:from-[#9a0000] hover:to-[#7f0000] hover:shadow-[0_0_20px_rgba(127,0,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                  Pedir Agora (R$ 49,90)
                </button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* SEÇÃO 7 - CTA FINAL (100vh) */}
        <section id="secao-ctafinal" className="h-screen w-full relative flex flex-col justify-between snap-start px-6 lg:px-16 overflow-hidden bg-[#050505] pt-28 pb-6">
          
          {/* Main big CTA centered */}
          <div className="z-20 max-w-4xl mx-auto w-full text-center my-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#7f0000]/20 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] shadow-xl mb-6">
                <Flame className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-light leading-[1.1] tracking-tight text-white italic">
                Seu Próximo Hambúrguer Favorito Está a <span className="text-[#c5a059] not-italic font-sans font-extrabold uppercase tracking-tighter">Um Clique</span>
              </h2>

              <p className="mt-6 text-zinc-400 font-light text-base sm:text-xl max-w-2xl leading-relaxed font-sans">
                Peça agora e receba no conforto da sua casa com nossa frota dedicada de entregadores. Sabor inexplicável garantido e entrega no tempo ideal.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 justify-center font-sans">
                <button
                  onClick={() => scrollToSection(3)}
                  className="px-10 py-5 bg-gradient-to-r from-[#7f0000] to-[#5a0000] text-white font-extrabold uppercase tracking-widest text-xs rounded-full border-b-4 border-[#3a0000] transition-all duration-300 hover:scale-105 hover:from-[#9a0000] hover:to-[#7f0000] hover:shadow-[0_0_30px_rgba(127,0,0,0.5)] cursor-pointer shadow-lg"
                >
                  Fazer Pedido Rápido
                </button>
                <button
                  onClick={() => {
                    const phoneNumber = '5511999999999';
                    window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=Ol%C3%A1!+Gostaria+de+conhecer+o+card%C3%A1pio+da+Hamburgueria+Artesanal.`, '_blank');
                  }}
                  className="px-10 py-5 bg-zinc-950 border border-zinc-900 hover:border-zinc-750 text-zinc-350 font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-inner"
                >
                  <Phone className="w-4 h-4 text-green-500" />
                  Falar no WhatsApp
                </button>
              </div>
            </motion.div>
          </div>

          {/* RODAPÉ INTEGRADO - NO CLUTTER */}
          <footer id="secao-rodape" className="z-20 max-w-7xl mx-auto w-full pt-8 border-t border-zinc-900 text-zinc-500 text-xs sm:text-sm font-sans flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
              <span className="text-[#c5a059] font-bold tracking-widest text-sm font-sans flex items-center gap-1.5 uppercase">
                <Flame className="w-4 h-4 text-[#c5a059]" />
                ARTESANAL BURGERS
              </span>
              <p className="font-light text-zinc-500 text-xs mt-0.5">Criando experiências de pura carne e brasa.</p>
            </div>

            {/* Address & Hours */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-center text-center sm:text-left text-xs text-zinc-400">
              <div className="flex gap-2 items-center justify-center sm:justify-start">
                <MapPin className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>Rua do Fogo, 452 - Jardins, São Paulo/SP</span>
              </div>
              <div className="flex gap-2 items-center justify-center sm:justify-start">
                <Clock className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>Seg a Dom: 18:00 às 23:30</span>
              </div>
            </div>

            {/* Social handles & copyright */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-zinc-950 rounded-full border border-zinc-905 text-zinc-400 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors">
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="p-2 bg-zinc-950 rounded-full border border-zinc-905 text-zinc-400 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors">
                  <Facebook className="w-4.5 h-4.5" />
                </a>
              </div>
              <span className="text-zinc-650 text-[11px] font-mono leading-none">
                &copy; {new Date().getFullYear()} Hambúrguer Artesanal. Todos os direitos reservados.
              </span>
            </div>
          </footer>

        </section>

      </div>

      {/* 4. MODAL - CONFIGURAÇÕES DO ITEM (PONTO & EXTRAS) BEFORE CART */}
      <AnimatePresence>
        {selectedBurgerForConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBurgerForConfig(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 overflow-hidden relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedBurgerForConfig(null)}
                className="absolute top-4 right-4 p-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-4 items-start pb-6 border-b border-zinc-900">
                <img
                  src={selectedBurgerForConfig.image}
                  alt={selectedBurgerForConfig.name}
                  className="w-20 h-20 rounded-xl object-cover border border-zinc-800 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold font-sans text-white">{selectedBurgerForConfig.name}</h3>
                  <p className="text-xs text-[#c5a059] mt-0.5 font-sans font-semibold">R$ {selectedBurgerForConfig.price.toFixed(2).replace('.', ',')}</p>
                  <p className="text-zinc-450 text-xs font-light mt-1.5 leading-relaxed truncate-2-lines font-sans">{selectedBurgerForConfig.description}</p>
                </div>
              </div>

              {/* Ponto Selection */}
              <div className="mt-6">
                <label className="text-xs font-bold text-[#c5a059] uppercase tracking-wider block font-sans">Escolha o Ponto:</label>
                <p className="text-zinc-550 text-[11px] mb-3 leading-normal font-sans">Defina a cocção ideal da carne na chapa</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Mal Passado', 'Ao Ponto', 'Bem Passado'].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setConfigPoint(pt)}
                      className={`py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer font-sans ${
                        configPoint === pt
                          ? 'bg-[#7a0000]/80 border-[#c5a059]/80 text-[#c5a059]'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras Add-ons Selection */}
              <div className="mt-6 font-sans">
                <label className="text-xs font-bold text-[#c5a059] uppercase tracking-wider block font-sans">Adicionais Extras (+ R$ 5,00 cada):</label>
                <p className="text-zinc-550 text-[11px] mb-3 leading-normal font-sans">Turbine seu hambúrguer artesanal à sua maneira</p>
                <div className="flex flex-col gap-2">
                  {[
                    'Bacon Extra Crocante',
                    'Queijo Cheddar Derretido',
                    'Maionese Artesanal Extra',
                    'Cebola Caramelizada'
                  ].map((extra) => {
                    const isSelected = configExtras.includes(extra);
                    return (
                      <button
                        key={extra}
                        type="button"
                        onClick={() => handleToggleExtra(extra)}
                        className={`w-full p-3.5 flex items-center justify-between text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#790000]/20 border-[#c5a059]/60 text-white'
                            : 'bg-zinc-950 border-zinc-900/80 text-zinc-400 hover:border-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isSelected ? 'bg-[#c5a059] border-[#c5a059] text-zinc-950 font-extrabold' : 'border-zinc-850'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </span>
                          {extra}
                        </span>
                        <span className="text-[#c5a059] font-mono font-bold">+ R$ 5,00</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Bottom Bar buttons */}
              <div className="mt-8 pt-6 border-t border-zinc-900 flex gap-4 items-center">
                <div className="flex-1 font-sans">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Valor Final</span>
                  <p className="text-xl font-bold font-sans text-white">
                    R$ {((selectedBurgerForConfig.price + configExtras.length * 5.0).toFixed(2)).replace('.', ',')}
                  </p>
                </div>
                <button
                  onClick={confirmAddToCart}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#7f0000] to-[#5a0000] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(127,0,0,0.5)] border-b-2 border-[#3a0000] hover:from-[#9a0000] hover:to-[#7f0000] transition-all cursor-pointer"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. SLIDE-OVER DRAWER - SHOPPING CART / REAL CONVERSION CRM */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop slideover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-zinc-950 border-l border-zinc-900 text-white flex flex-col h-full shadow-2xl relative"
              >
                {/* Header of Drawer */}
                <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#c5a059]" />
                    <h2 className="text-lg font-bold uppercase tracking-widest text-[#c5a059] font-sans">Seu Pedido Rápido</h2>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-zinc-900/80 text-zinc-400 hover:text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items collection body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-none space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <ShoppingBag className="w-12 h-12 text-zinc-700 mb-4" />
                      <p className="text-zinc-400 font-medium">Seu carrinho está vazio.</p>
                      <p className="text-zinc-600 text-xs mt-1 px-4 leading-normal">Escolha um dos favoritos e configure para saborear o verdadeiro hambúrguer artesanal.</p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          scrollToSection(3);
                        }}
                        className="mt-6 px-6 py-2 bg-zinc-900 hover:bg-zinc-850 text-[#c5a059] text-xs font-bold uppercase tracking-wider border border-zinc-800 hover:border-[#c5a059]/40 rounded-lg transition-all cursor-pointer font-sans"
                      >
                        Ir para os Favoritos
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest font-sans">Confirmação de Hambúrgueres</span>
                        <button
                          onClick={() => setCart([])}
                          className="text-[10px] text-zinc-600 hover:text-[#c5a059] uppercase leading-none font-bold cursor-pointer font-sans"
                        >
                          Limpar Tudo
                        </button>
                      </div>

                      <div className="space-y-4">
                        {cart.map((item, index) => {
                          const extrasCost = item.extras.length * 5.00;
                          return (
                            <div key={index} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex gap-4 items-start">
                              <img
                                src={item.burger.image}
                                alt={item.burger.name}
                                className="w-16 h-16 rounded-lg object-cover border border-zinc-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-white text-sm leading-tight font-sans">{item.burger.name}</h4>
                                <p className="text-[#c5a059] text-xs font-mono mt-0.5 font-bold">R$ {item.burger.price.toFixed(2).replace('.', ',')}</p>
                                
                                <div className="mt-2 text-[11px] text-zinc-500 flex flex-wrap gap-x-2 gap-y-1">
                                  <span className="bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">
                                    {item.point}
                                  </span>
                                  {item.extras.map((extra, exIdx) => (
                                    <span key={exIdx} className="bg-[#7f0000]/20 border border-[#c5a059]/25 px-1.5 py-0.5 rounded text-[10px] text-[#c5a059] font-sans font-medium">
                                      + {extra}
                                    </span>
                                  ))}
                                </div>

                                {/* Quantity selectors */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900">
                                  <span className="text-xs text-zinc-500 font-mono">
                                    Sub: R$ {((item.burger.price + extrasCost) * item.quantity).toFixed(2).replace('.', ',')}
                                  </span>
                                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5">
                                    <button
                                      onClick={() => handleUpdateQuantity(index, -1)}
                                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="font-bold text-xs px-2 w-4 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => handleUpdateQuantity(index, 1)}
                                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* CRM CLIENT INFO FORM - CONVERSÃO INTELIGENTE */}
                      <form onSubmit={handleCheckoutSubmit} className="mt-8 border-t border-zinc-900 pt-6 space-y-4 font-sans">
                        <span className="text-xs font-bold text-[#c5a059] uppercase tracking-wider block font-sans">Dados Para Envio (CRM Convencer)</span>
                        
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Seu Nome *</label>
                          <input
                            type="text"
                            required
                            placeholder="Informe seu nome completo"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm focus:border-[#c5a059] focus:outline-none placeholder:text-zinc-700"
                          />
                        </div>

                        {/* Delivery selector */}
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Forma de Retirada *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setDeliveryType('delivery')}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                deliveryType === 'delivery'
                                  ? 'bg-[#7a0000]/20 border-[#c5a059]/80 text-[#c5a059]'
                                  : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                              }`}
                            >
                              🛵 Entrega (+ R$ 7,00)
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeliveryType('retirada')}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                deliveryType === 'retirada'
                                  ? 'bg-[#7a0000]/20 border-[#c5a059]/80 text-[#c5a059]'
                                  : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
                              }`}
                            >
                              🏢 Retirar Balcão
                            </button>
                          </div>
                        </div>

                        {deliveryType === 'delivery' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Endereço de Entrega *</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="Rua, Número, Bairro, Complemento"
                              value={clientAddress}
                              onChange={(e) => setClientAddress(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm focus:border-[#c5a059] focus:outline-none placeholder:text-zinc-700 leading-relaxed resize-none"
                            />
                          </motion.div>
                        )}

                        {/* Order Summary & submit */}
                        <div className="mt-8 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs text-zinc-400">
                            <span>Subtotal itens</span>
                            <span>R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                          </div>
                          {deliveryType === 'delivery' && (
                            <div className="flex justify-between text-xs text-zinc-400">
                              <span>Taxa de Entrega</span>
                              <span>R$ 7,00</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-900">
                            <span className="text-[#c5a059]">Total Geral</span>
                            <span className="text-[#c5a059] font-mono">
                              R$ {(getCartTotal() + (deliveryType === 'delivery' ? 7.00 : 0.00)).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 mt-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-600 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                        >
                          <Phone className="w-4 h-4 fill-current" />
                          Enviar via WhatsApp
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
