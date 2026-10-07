import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { resolveImage } from '../utils/imageResolver';

export const FloatingCartBar: React.FC = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    settings,
    setIsCartOpen,
    isCartOpen,
    isCheckoutOpen,
    isCustomizationOpen,
    currentView,
    setCurrentView,
  } = useApp();

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (
    cartCount === 0 ||
    isCartOpen ||
    isCheckoutOpen ||
    isCustomizationOpen ||
    currentView === 'admin' ||
    currentView === 'cart'
  ) {
    return null;
  }

  // Show every item added up to 5 items on mobile without any hidden-count or overflow indicator for 1-4 items
  const displayCartItems = cart.slice(0, 5);

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const currencySymbol = settings?.currencySymbol || '₹';
  const formattedTotal = Number.isInteger(cartTotal) ? cartTotal : cartTotal.toFixed(0);

  return (
    <div
      className="fixed z-40 left-1/2 -translate-x-1/2 w-fit max-w-[calc(100vw-32px)] sm:max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
      style={{
        bottom: 'max(76px, calc(env(safe-area-inset-bottom, 0px) + 72px))',
      }}
    >
      <button
        onClick={() => {
          setIsCartOpen(false);
          setCurrentView('cart');
        }}
        className="h-[48px] sm:h-auto flex items-center justify-center gap-1.5 sm:gap-4 px-2 sm:px-6 py-1 sm:py-3.5 rounded-full bg-[#1A130E]/98 sm:bg-[#1C140F]/95 hover:bg-[#251B14] text-[#F5F0EB] border border-[#483526] shadow-[0_8px_25px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all active:scale-[0.98] group focus:outline-none cursor-pointer"
        aria-label={`View Cart with ${cartCount} items`}
      >
        {/* Left: Visible Thumbnails for EVERY added item (28px on mobile, no +X for 1-4 items) */}
        <div className="flex items-center gap-1 shrink-0">
          {displayCartItems.map((item) => {
            const hasError = imageErrors[item.id];
            const imgSrc = !hasError && item.product.image ? resolveImage(item.product.image) : resolveImage(null);
            return (
              <div
                key={item.id}
                className="w-7 h-7 sm:w-11 sm:h-11 rounded-full border border-[#523C2A] bg-[#221812] overflow-hidden shadow-2xs flex items-center justify-center shrink-0"
              >
                <img
                  src={imgSrc}
                  alt={item.product.name}
                  onError={() => handleImageError(item.id)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none pointer-events-none"
                />
              </div>
            );
          })}
        </div>

        {/* Center: Item Count & Total Amount */}
        <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 whitespace-nowrap shrink-0">
          <span className="font-serif text-xs sm:text-sm font-bold text-[#FBF7F2] tracking-wide group-hover:text-[#DFB780] transition-colors">
            {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
          </span>
          <span className="text-[10px] text-[#A89584]">·</span>
          <span className="text-[11px] sm:text-xs text-[#E4BE88] font-bold">
            {currencySymbol}{formattedTotal}
          </span>
        </div>

        {/* Right: View Cart Action Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#C89B63] hover:bg-[#DFB780] text-[#120D09] text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 transition-colors shadow-xs">
          <span>View Cart</span>
          <span className="text-xs sm:text-sm font-bold group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </button>
    </div>
  );
};
