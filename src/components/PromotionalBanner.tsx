import React from 'react';
import { useApp } from '../context/AppContext';

export const PromotionalBanner: React.FC = () => {
  const { banners } = useApp();
  const promoBanner = banners.find((b) => b.bannerType === 'promo' && b.isVisible);

  if (!promoBanner) return null;

  const textProps = promoBanner.textPositions?.desktop || {
    x: 52,
    y: 26,
    fontSize: 44,
    lineHeight: 1.2,
    alignment: 'left',
    color: '#ffffff',
    visible: true,
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(link.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#FAF7F2] border-b border-[#EFE7DA] py-8 sm:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative w-full min-h-[320px] md:min-h-[400px] max-h-[480px] rounded-3xl overflow-hidden bg-[#150f0c] border border-[#35251b] shadow-xl flex items-center justify-center">
          {/* Ambient atmosphere glow */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-2xl scale-105 pointer-events-none"
            style={{ backgroundImage: `url(${promoBanner.image})` }}
            aria-hidden="true"
          />

          {/* Full-width image preserving 100% of aspect ratio without cropping */}
          <img
            src={promoBanner.image}
            alt={promoBanner.heading}
            referrerPolicy="no-referrer"
            className="relative z-10 w-full h-full object-contain max-h-[460px]"
          />

          {/* Soft vignette to guarantee readability without obscuring photography */}
          <div className="absolute inset-0 z-15 bg-gradient-to-r from-black/50 via-transparent to-black/60 pointer-events-none" />

          {/* Positioned Text Overlay matching Admin coordinates */}
          <div className="absolute inset-0 z-20 p-6 sm:p-12 pointer-events-none">
            <div
              className="pointer-events-auto transition-all duration-300"
              style={{
                position: 'absolute',
                left: `${Math.min(Math.max(textProps.x, 2), 65)}%`,
                top: `${Math.min(Math.max(textProps.y, 8), 65)}%`,
                textAlign: textProps.alignment || 'left',
                color: textProps.color || '#ffffff',
                maxWidth: textProps.maxWidth ? `${textProps.maxWidth}px` : '500px',
              }}
            >
              {textProps.visible !== false && (
                <div className="space-y-3">
                  {promoBanner.subtitle && (
                    <p className="text-[10px] sm:text-xs tracking-[0.25em] font-semibold uppercase text-[#e0bb87] drop-shadow">
                      {promoBanner.subtitle}
                    </p>
                  )}

                  {promoBanner.heading && (
                    <h2
                      className="font-serif font-medium tracking-tight whitespace-pre-line drop-shadow-md text-[#fbf7f2]"
                      style={{
                        fontSize: `clamp(24px, 3.5vw, ${textProps.fontSize || 42}px)`,
                        lineHeight: textProps.lineHeight || 1.15,
                      }}
                    >
                      {promoBanner.heading}
                    </h2>
                  )}

                  {promoBanner.description && (
                    <p className="text-xs sm:text-sm text-[#e4dad0] font-light leading-relaxed drop-shadow max-w-md">
                      {promoBanner.description}
                    </p>
                  )}

                  {promoBanner.ctaText && (
                    <div className="pt-2">
                      <a
                        href={promoBanner.ctaLink || '#coffee-flavours'}
                        onClick={(e) => handleCtaClick(e, promoBanner.ctaLink || '#coffee-flavours')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c89b63] hover:bg-[#dfb780] text-[#120d09] font-medium text-xs tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 group"
                      >
                        <span>{promoBanner.ctaText}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
