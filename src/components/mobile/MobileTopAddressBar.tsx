import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileTopAddressBar: React.FC = () => {
  const {
    deliveryAddress,
    setIsAddressModalOpen,
    currentView,
    isCartOpen,
    isCheckoutOpen,
  } = useApp();

  // Hide completely on Cart, Checkout, View Cart, Track Order, and any dedicated order/checkout views
  if (
    currentView === 'cart' ||
    currentView === 'track-order' ||
    currentView === 'admin' ||
    currentView !== 'home' ||
    isCartOpen ||
    isCheckoutOpen
  ) {
    return null;
  }

  // Split title and detailed address (e.g. "Home • 135/10 Vivekanand...")
  const parts = deliveryAddress ? deliveryAddress.split('•') : ['Home', 'Select delivery address'];
  const title = parts[0]?.trim() || 'Home';
  const detail = parts[1]?.trim() || deliveryAddress || '135/10 Vivekanand College, Bengaluru';

  return (
    <header
      className="md:hidden fixed top-0 left-0 right-0 w-full z-40 pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: 'transparent',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
        border: 'none',
        paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
        paddingLeft: '14px',
        paddingRight: '14px',
        paddingBottom: '8px',
      }}
      aria-label="Mobile Top Delivery Location"
    >
      <div className="flex items-center">
        {/* Clickable Delivery Address */}
        <button
          type="button"
          onClick={() => setIsAddressModalOpen(true)}
          className="pointer-events-auto flex items-center gap-2 text-left min-w-0 max-w-full group focus:outline-none cursor-pointer"
          style={{
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
          }}
          aria-label="Change delivery location"
        >
          {/* Location Pin Icon with strong intelligent contrast */}
          <div className="w-8 h-8 rounded-full bg-black/35 border border-white/25 backdrop-blur-[2px] flex items-center justify-center shrink-0 shadow-md">
            <MapPin className="w-4 h-4 text-[#E6BE8A] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Top Label */}
            <div className="flex items-center gap-1 leading-tight">
              <span className="text-[11px] font-bold text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] tracking-wide">
                Deliver to · {title}
              </span>
              <ChevronDown className="w-3 h-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] shrink-0" />
            </div>

            {/* Address Details with intelligent drop shadow */}
            <p className="text-[10px] text-white/95 font-medium drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] truncate max-w-[280px] sm:max-w-md mt-0.5">
              {detail}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};

