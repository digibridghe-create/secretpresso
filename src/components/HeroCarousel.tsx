import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resolveImage } from '../utils/imageResolver';

export const HeroCarousel: React.FC = () => {
  const { banners } = useApp();

  const heroBanners = banners.filter((b) => b.bannerType === 'hero' && b.isVisible);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const currentBanner = heroBanners[currentIndex] || heroBanners[0];

  const prevSlide = useCallback(() => {
    if (heroBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, [heroBanners.length]);

  const nextSlide = useCallback(() => {
    if (heroBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
  }, [heroBanners.length]);

  // Touch swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const touchDeltaY = useRef<number>(0);

  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (heroBanners.length <= 1 || isPaused) return;
    const duration = (currentBanner?.slideDuration || 4.5) * 1000;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, duration);
  }, [heroBanners.length, isPaused, currentBanner]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = touchDeltaX.current;
    const diffY = touchDeltaY.current;
    const swipeThreshold = 50; // Sensible 50px threshold

    // Ensure horizontal gesture dominates vertical scrolling
    if (Math.abs(diffX) >= swipeThreshold && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      if (diffX < 0) {
        // Swiped LEFT -> Next banner
        nextSlide();
      } else {
        // Swiped RIGHT -> Previous banner
        prevSlide();
      }
      resetAutoplay();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
  };

  // Autoplay
  useEffect(() => {
    if (heroBanners.length <= 1 || isPaused) return;

    const duration = (currentBanner?.slideDuration || 4.5) * 1000;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, heroBanners.length, isPaused, currentBanner]);

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

  const bannerImg = resolveImage(currentBanner.image);

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
      className="relative w-full min-h-[380px] sm:min-h-[430px] md:min-h-[470px] lg:min-h-[500px] max-h-[560px] bg-[#0e0a08] overflow-hidden flex flex-col justify-between select-none focus:outline-none touch-pan-y cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Banner Image Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={bannerImg}
          alt={headingText}
          className="w-full h-full object-cover object-center animate-fade-in"
        />
        {/* Subtle bottom gradient for readability of hero content */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d0a08]/90 via-[#0d0a08]/40 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-25 flex-1 flex flex-col justify-end px-4 sm:px-8 pb-10 sm:pb-12 pt-16 md:pt-24">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c140f]/75 border border-[#c89b63]/40 text-[#dfb780] text-[10px] sm:text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#c89b63]" />
            <span>{eyebrowText}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#fbf7f2] font-normal leading-[1.1] whitespace-pre-line drop-shadow-md">
            {headingText}
          </h1>

          <p className="text-xs sm:text-sm text-[#d6ccc2] max-w-lg leading-relaxed drop-shadow">
            {descriptionText}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <a
              href={ctaButtonLink}
              onClick={(e) => handleCtaClick(e, ctaButtonLink)}
              className="px-6 py-3 rounded-full bg-[#c89b63] text-[#100c08] text-xs sm:text-sm font-bold tracking-wider uppercase hover:bg-[#dfb780] transition-colors shadow-lg active:scale-95"
            >
              {ctaButtonText}
            </a>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Navigation */}
      {heroBanners.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-6 bg-[#c89b63]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
