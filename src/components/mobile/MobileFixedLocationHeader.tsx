import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileFixedLocationHeaderProps {
  onOpenAddress?: () => void;
  onOpenAccount?: () => void;
}

export const MobileFixedLocationHeader: React.FC<MobileFixedLocationHeaderProps> = ({
  onOpenAddress,
  onOpenAccount,
}) => {
  const { setIsAddressModalOpen, setIsAccountModalOpen } = useApp() as any;
  const [selectedAddress] = useState(
    'Home • 135/10 Vivekanand College, Ranganathpur Colony'
  );

  const headerContent = (
    <div
      className="md:hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 99999,
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingBottom: '8px',
        background: 'transparent',
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxShadow: 'none',
        border: 'none',
        transform: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      {/* Location Button */}
      <button
        onClick={() => (onOpenAddress ? onOpenAddress() : setIsAddressModalOpen?.(true))}
        style={{
          background: 'transparent',
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
          border: 'none',
          transform: 'none',
        }}
        className="flex-1 flex items-center justify-between text-left py-1 px-0 min-w-0 cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-[#C89B63] shrink-0 drop-shadow-md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white drop-shadow-md truncate">
                {selectedAddress.split('•')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-white/90 shrink-0 drop-shadow-md" />
            </div>
            <p className="text-[10px] text-white/90 drop-shadow-md truncate max-w-[220px]">
              {selectedAddress.split('•')[1] || selectedAddress}
            </p>
          </div>
        </div>
      </button>

      {/* Account Button */}
      <button
        onClick={() => (onOpenAccount ? onOpenAccount() : setIsAccountModalOpen?.(true))}
        style={{
          background: 'transparent',
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
          border: 'none',
          transform: 'none',
        }}
        className="w-9 h-9 rounded-full bg-black/40 text-white font-serif font-bold text-xs flex items-center justify-center border border-white/30 shadow-md active:scale-95 transition-transform shrink-0 overflow-hidden"
        aria-label="Account"
      >
        <div className="w-full h-full flex items-center justify-center bg-black/50 text-white">
          <User className="w-4 h-4 text-[#C89B63] drop-shadow" />
        </div>
      </button>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(headerContent, document.body);
};

export const MobileLocationAddressAccount = MobileFixedLocationHeader;
export const FixedMobileTopControls = MobileFixedLocationHeader;
