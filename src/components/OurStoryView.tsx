import React from 'react';
import { ArrowLeft, Sparkles, Coffee, Gift, HeartHandshake, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OurStoryView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-[#0d0a08] text-[#f5f0eb] pt-28 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-xs sm:text-sm text-[#bcaaa0] hover:text-[#e4be88] transition-colors mb-8 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Brew Home</span>
        </button>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-[#d6b07c] font-semibold">
            The Philosophy of Wonder
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#fbf7f2]">
            Our Story & Craft
          </h1>
          <p className="text-xs sm:text-sm text-[#baa899] font-light leading-relaxed">
            Where master-roasted specialty coffee meets the timeless joy of unexpected discovery.
          </p>
        </div>

        {/* Story Section 1: The Origin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16 p-6 sm:p-8 rounded-3xl bg-[#140e0a] border border-[#2e2016]">
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#c89b63] font-semibold">
              Chapter 01 · The Roaster&apos;s Spark
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#fbf7f2] leading-snug">
              Specialty Coffee Deserves A Sense of Wonder
            </h2>
            <p className="text-xs sm:text-sm text-[#a89686] font-light leading-relaxed">
              SECRETpresso was born from a simple observation: as coffee evolved into high-minded craftsmanship, it lost some of the playful enchantment of everyday living.
            </p>
            <p className="text-xs sm:text-sm text-[#a89686] font-light leading-relaxed">
              We asked ourselves: What if every morning cup could evoke the anticipation of unwrapping a gift? We partnered with ethical micro-lot coffee farmers across Ethiopia, Colombia, and Coorg to harvest shade-grown Arabica beans, roasted in small batches to preserve floral clarity and caramel sweetness.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1f1712] border border-[#3e2b1d]">
            <img
              src="/uploads/hero_secretpresso_banner_1791216817348.jpg"
              alt="SECRETpresso Cup and Barista Bear"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-4"
            />
          </div>
        </div>

        {/* Story Section 2: The Collectible Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16 p-6 sm:p-8 rounded-3xl bg-[#140e0a] border border-[#2e2016]">
          <div className="order-2 md:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1f1712] border border-[#3e2b1d]">
            <img
              src="/uploads/promo_collectible_toys_1791216844306.jpg"
              alt="Collectible Barista Figurines"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-4"
            />
          </div>

          <div className="order-1 md:order-2 space-y-4">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#c89b63] font-semibold">
              Chapter 02 · The Secret Inside
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#fbf7f2] leading-snug">
              Miniature Art for Real Coffee Lovers
            </h2>
            <p className="text-xs sm:text-sm text-[#a89686] font-light leading-relaxed">
              Every season, our in-house sculptors collaborate with independent character artists to create limited-edition barista toys, tiny portafilters, espresso bears, and collectible charms.
            </p>
            <p className="text-xs sm:text-sm text-[#a89686] font-light leading-relaxed">
              Carefully sealed in food-safe collectible capsules beneath the protective sleeve, they bring smiles to work desks, kitchen shelves, and collector vaults around the world.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 text-center">
          <div className="p-6 rounded-2xl bg-[#16100c] border border-[#2d1e14] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#251a12] text-[#c89b63] flex items-center justify-center mx-auto">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">Grade 1 Specialty Beans</h3>
            <p className="text-xs text-[#9d8977] leading-relaxed">
              Direct-trade beans scored 84+ on the SCA scale, roasted weekly to peak aromatic vibrance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#16100c] border border-[#2d1e14] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#251a12] text-[#c89b63] flex items-center justify-center mx-auto">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">Collectible Series</h3>
            <p className="text-xs text-[#9d8977] leading-relaxed">
              Limited batch releases with rare gold editions and tradeable designer characters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#16100c] border border-[#2d1e14] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#251a12] text-[#c89b63] flex items-center justify-center mx-auto">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">Patisserie Perfection</h3>
            <p className="text-xs text-[#9d8977] leading-relaxed">
              Hand-layered mascarpone Tiramisu, French brioche donuts, and decadent chocolate ganaches.
            </p>
          </div>
        </div>

        {/* Return Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-3.5 rounded-full bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs sm:text-sm tracking-wide shadow-xl transition-all"
          >
            Taste The Collection
          </button>
        </div>
      </div>
    </div>
  );
};
