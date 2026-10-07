import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingCartBar: React.FC = () => {
  const { cartCount, cartTotal, setIsCartOpen, isCartOpen, isCheckoutOpen, currentView } = useApp();

  if (cartCount === 0 || isCartOpen || isCheckoutOpen || currentView === 'admin') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex items-center gap-4 px-5 py-3 rounded-full bg-[#1b1510]/95 hover:bg-[#251d16] text-[#f5f0eb] border border-[#503d2e] shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#c89b63] text-[#100c08] flex items-center justify-center font-bold text-xs">
            {cartCount}
          </div>
          <span className="text-xs sm:text-sm font-medium tracking-wide">
            {cartCount === 1 ? '1 Item' : `${cartCount} Items`}
          </span>
        </div>

        <span className="text-[#6d5b4d]">·</span>

        <span className="text-xs sm:text-sm font-semibold tabular-nums text-[#e8ded3]">
          ₹{cartTotal.toFixed(2)}
        </span>

        <div className="flex items-center gap-1.5 pl-2 text-xs font-medium text-[#c89b63] group-hover:text-[#e4be88]">
          <span>View Bag</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );
};
