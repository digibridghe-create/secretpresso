import React from 'react';
import { Home, Coffee, Tag, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
  onOpenOffers: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenOffers }) => {
  const { currentView, setCurrentView } = useApp();

  const handleNav = (view: 'home' | 'menu' | 'offers' | 'orders') => {
    if (view === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'menu') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('coffee-flavours');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (view === 'offers') {
      onOpenOffers();
    } else if (view === 'orders') {
      setCurrentView('track-order');
    }
  };

  const isHomeActive = currentView === 'home';
  const isOrdersActive = currentView === 'track-order';

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md border border-[#E5DBCC] rounded-2xl shadow-xl px-4 py-2 flex items-center justify-around transition-all"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      {/* 1. Brew Home */}
      <button
        onClick={() => handleNav('home')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          isHomeActive
            ? 'bg-[#FAF5EE] text-[#140F0B] font-semibold'
            : 'text-[#7A6E64] hover:text-[#140F0B]'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] tracking-tight">Brew Home</span>
      </button>

      {/* 2. Menu */}
      <button
        onClick={() => handleNav('menu')}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#7A6E64] hover:text-[#140F0B] transition-all"
      >
        <Coffee className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>

      {/* 3. Offers */}
      <button
        onClick={() => handleNav('offers')}
        className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[#7A6E64] hover:text-[#140F0B] transition-all"
      >
        <Tag className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] tracking-tight">Offers</span>
      </button>

      {/* 4. Orders */}
      <button
        onClick={() => handleNav('orders')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
          isOrdersActive
            ? 'bg-[#FAF5EE] text-[#140F0B] font-semibold'
            : 'text-[#7A6E64] hover:text-[#140F0B]'
        }`}
      >
        <Receipt className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] tracking-tight">Orders</span>
      </button>
    </nav>
  );
};
