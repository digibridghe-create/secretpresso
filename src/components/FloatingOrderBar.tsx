import React from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingOrderBar: React.FC = () => {
  const { activeOrder, setCurrentView, currentView, setTrackingOrderId } = useApp();

  // If no active order, or user is already on track-order page or admin, don't show
  if (!activeOrder || currentView === 'track-order' || currentView === 'admin') {
    return null;
  }

  const handleTrackClick = () => {
    setTrackingOrderId(activeOrder.id);
    setCurrentView('track-order');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Preparing Your Brew';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Active Order';
    }
  };

  return (
    <div className="fixed bottom-22 sm:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleTrackClick}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#18130f]/95 hover:bg-[#251d16] text-[#f5f0eb] border border-[#523d2d] shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-[#f5f0eb]">#{activeOrder.id}</span>
          <span className="text-[#6d5b4d]">·</span>
          <span className="text-[#dfb780] font-medium">{getStatusLabel(activeOrder.status)}</span>
        </div>

        <div className="flex items-center gap-1 pl-1 text-xs font-medium text-[#c89b63] group-hover:text-[#e4be88]">
          <span className="hidden sm:inline">Track Order</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );
};
