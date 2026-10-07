import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { resolveImage } from '../utils/imageResolver';

export const FloatingCartBar: React.FC = () => {
  const {
    cart,
    cartCount,
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

  // Get unique products in cart (up to 3 for overlapping display)
  const uniqueProducts = Array.from(
    new Map(cart.map((item) => [item.product.id, item.product])).values()
  );

  const displayProducts = uniqueProducts.slice(0, 3);
  const remainingCount = uniqueProducts.length - 3;

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-auto max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={() => {
          setIsCartOpen(false);
          setCurrentView('cart');
        }}
        className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-4 sm:px-6 py-3.5 rounded-full bg-[#1c140f]/95 hover:bg-[#251b14] text-[#f5f0eb] border border-[#523d2e] shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group focus:outline-none cursor-pointer"
      >
        {/* Left Side: Overlapping Product Thumbnails */}
        <div className="flex items-center -space-x-3.5 sm:-space-x-4 shrink-0 py-0.5 pl-0.5">
          {displayProducts.map((prod, index) => {
            const imgSrc =
              !imageErrors[prod.id] && prod.image ? resolveImage(prod.image) : resolveImage(null);
            return (
              <div
                key={prod.id}
                style={{ zIndex: displayProducts.length - index }}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-[#3d2c20] bg-[#221812] overflow-hidden shadow-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              >
                <img
                  src={imgSrc}
                  alt={prod.name}
                  onError={() => handleImageError(prod.id)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none pointer-events-none"
                />
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div
              style={{ zIndex: 0 }}
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-[#3d2c20] bg-[#c89b63] text-[#120d09] font-bold text-xs flex items-center justify-center shadow-md shrink-0"
            >
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Center: View cart & Real Item Count */}
        <div className="flex flex-col text-left px-2 sm:px-3 flex-1 min-w-0">
          <span className="font-serif text-sm sm:text-base font-semibold text-[#fbf7f2] tracking-wide group-hover:text-[#dfb780] transition-colors">
            View cart
          </span>
          <span className="text-[11px] sm:text-xs text-[#b8a391] font-medium tracking-wide">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right Side: Clean Arrow / Chevron */}
        <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-[#3a291d] shrink-0 text-[#c89b63] group-hover:text-[#dfb780]">
          <span className="text-sm sm:text-base font-bold tracking-widest group-hover:translate-x-1.5 transition-transform duration-200">
            →
          </span>
        </div>
      </button>
    </div>
  );
};
