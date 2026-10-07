import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coffee, Gift, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroCarousel: React.FC = () => {
  const { banners } = useApp();
  const heroBanners = banners.filter((b) => b.bannerType === 'hero' && b.isVisible);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  // Drag and swipe states
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentBanner = heroBanners[currentIndex] || heroBanners[0];

  const prevSlide = useCallback(() => {
    if (heroBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, [heroBanners.length]);

  const nextSlide = useCallback(() => {
    if (heroBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
  }, [heroBanners.length]);

  // Autoplay (3.5 - 5 seconds) with pause during manual interaction
  useEffect(() => {
    if (heroBanners.length <= 1 || isPaused || isDragging) return;

    const duration = (currentBanner?.slideDuration || 4.5) * 1000;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, heroBanners.length, isPaused, isDragging, currentBanner]);

  // Global PC keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
          activeEl.getAttribute('contenteditable') === 'true');

      if (isTyping) return;

      if (e.key === 'ArrowLeft') {
        prevSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 4000);
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 4000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  if (!currentBanner) {
    return null;
  }

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(link.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mouse Drag Events for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    setDragCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (isDragging && dragStartX !== null && dragCurrentX !== null) {
      const diff = dragCurrentX - dragStartX;
      if (diff < -50) {
        nextSlide();
      } else if (diff > 50) {
        prevSlide();
      }
    }
    setIsDragging(false);
    setDragStartX(null);
    setDragCurrentX(null);
    setTimeout(() => setIsPaused(false), 4000);
  };

  // Touch Swipe Events for Mobile & Tablet
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
      if (diffX < -40) {
        nextSlide();
      } else if (diffX > 40) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setTimeout(() => setIsPaused(false), 4000);
  };

  // Heading text matching reference: "Good Coffee. \n Great Surprise."
  const headingText = currentBanner.heading || 'Good Coffee.\nGreat Surprise.';
  const eyebrowText = currentBanner.subtitle || 'MORE THAN JUST COFFEE';
  const descriptionText =
    currentBanner.description ||
    'Every cup is a new adventure. Enjoy premium coffee and discover a collectible toy hidden inside.';
  const ctaButtonText = currentBanner.ctaText || 'EXPLORE OUR MENU';
  const ctaButtonLink = currentBanner.ctaLink || '#coffee-flavours';

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Carousel"
      tabIndex={0}
      className="relative w-full min-h-[380px] sm:min-h-[430px] md:min-h-[470px] lg:min-h-[500px] max-h-[560px] bg-[#0e0a08] overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing select-none focus:outline-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsPaused(false);
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Container — ZERO CROP GUARANTEE */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Ambient atmospheric matching background glow */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-3xl scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
          aria-hidden="true"
        />

        {/* The Actual Uploaded Image: 100% full view, NEVER cropped, aspect ratio preserved */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <img
            key={currentBanner.id}
            src={currentBanner.image}
            alt={currentBanner.heading}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover sm:object-contain object-center transition-opacity duration-700 ease-out pointer-events-none select-none max-h-[560px]"
          />
        </div>

        {/* Atmospheric soft vignette ensuring white text readability over photo */}
        <div className="absolute inset-0 z-15 bg-gradient-to-r from-black/75 via-black/35 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Main Hero Overlay Content matching exact reference image layout */}
      <div className="relative z-20 max-w-7xl mx-auto w-full h-full flex-1 px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 flex flex-col justify-between pointer-events-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full h-full">
          {/* LEFT-SIDE HERO CONTENT: Eyebrow + Heading + Description + CTA + Inline Features */}
          <div className="max-w-xl pointer-events-auto">
            {/* 1. Small Eyebrow */}
            <p className="text-[10px] sm:text-[11px] tracking-[0.24em] font-semibold uppercase text-white/90 drop-shadow-md">
              {eyebrowText}
            </p>

            {/* 2. Main Heading: "Good Coffee. \n Great Surprise." */}
            <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-white leading-[1.08] tracking-tight drop-shadow-lg mt-2 sm:mt-2.5 whitespace-pre-line text-balance">
              {headingText}
            </h1>

            {/* 3. Description */}
            <p className="text-xs sm:text-sm text-white/90 font-light max-w-md leading-relaxed drop-shadow mt-2.5 sm:mt-3 line-clamp-2 sm:line-clamp-3">
              {descriptionText}
            </p>

            {/* 4. Pure White Pill CTA: EXPLORE OUR MENU → */}
            <div className="pt-3 sm:pt-4">
              <a
                href={ctaButtonLink}
                onClick={(e) => handleCtaClick(e, ctaButtonLink)}
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#e4be88] text-[#120d09] font-bold text-[11px] sm:text-xs tracking-[0.14em] uppercase shadow-xl hover:shadow-2xl transition-all duration-200 group pointer-events-auto"
              >
                <span>{ctaButtonText}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>

            {/* 7. FEATURE STRIP — INSIDE HERO (lower-left, directly over photo, white text/icons, transparent) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-4 sm:pt-6 text-white/95 text-[10px] sm:text-[11px] font-medium tracking-wide drop-shadow pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 stroke-[2] text-white shrink-0" />
                <span>Premium Coffee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 stroke-[2] text-white shrink-0" />
                <span>Hidden Surprise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 stroke-[2] text-white shrink-0" />
                <span>Collectible Toys</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 stroke-[2] text-white shrink-0" />
                <span>A Little Joy in Every Cup</span>
              </div>
            </div>

            {/* 8. Minimal Slide Indicators (bottom-left below feature strip matching reference) */}
            {heroBanners.length > 1 && (
              <div className="flex items-center gap-1.5 pt-3 sm:pt-4 pointer-events-auto">
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                      idx === currentIndex
                        ? 'w-6 bg-white shadow-xs'
                        : 'w-1.5 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT-SIDE HERO CONTENT: Small handwritten promotional text matching reference image */}
          <div className="hidden lg:flex flex-col items-start self-center pr-4 pointer-events-none select-none">
            <div className="text-white drop-shadow-lg leading-snug">
              <p
                style={{ fontFamily: "'Caveat', cursive" }}
                className="text-2xl xl:text-3xl text-white font-medium rotate-[-3deg] tracking-wide"
              >
                Same great coffee.
                <br />
                New surprise every
                <br />
                time.
              </p>
              {/* Hand-drawn curved arrow pointing toward coffee cups */}
              <div className="ml-4 mt-1 text-white">
                <svg
                  className="w-7 h-7 stroke-white fill-none rotate-[10deg] drop-shadow"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 4 C 18 12, 10 14, 5 14" />
                  <polyline points="9 10 5 14 9 18" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
