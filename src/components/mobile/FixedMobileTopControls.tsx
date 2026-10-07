import React, { useState } from 'react';
import { MapPin, ChevronDown, User } from 'lucide-react';

interface FixedMobileTopControlsProps {
  onOpenAddress: () => void;
  onOpenAccount: () => void;
}

export const FixedMobileTopControls: React.FC<FixedMobileTopControlsProps> = ({
  onOpenAddress,
  onOpenAccount,
}) => {
  const [selectedAddress] = useState(
    'Home • 135/10 Vivekanand College, Ranganathpur Colony'
  );

  return (
    <div
      className="md:hidden fixed left-3 right-3 z-40 pointer-events-auto flex items-center justify-between gap-3 bg-transparent"
      style={{
        top: 'max(8px, env(safe-area-inset-top, 8px))',
      }}
    >
      {/* Fully Transparent Location Bar */}
      <button
        onClick={onOpenAddress}
        style={{
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: 'none',
          border: 'none',
        }}
        className="flex-1 flex items-center justify-between text-left py-1 px-0 min-w-0 cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-[#C89B63] shrink-0 drop-shadow" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white drop-shadow-md truncate">
                {selectedAddress.split('•')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-white/90 shrink-0 drop-shadow" />
            </div>
            <p className="text-[10px] text-white/90 drop-shadow-md truncate max-w-[220px]">
              {selectedAddress.split('•')[1] || selectedAddress}
            </p>
          </div>
        </div>
      </button>

      {/* Profile Avatar (Icon Only, No text) */}
      <button
        onClick={onOpenAccount}
        style={{
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
        }}
        className="w-10 h-10 rounded-full bg-[#140F0B]/85 text-white font-serif font-bold text-xs flex items-center justify-center border-2 border-[#C89B63] shadow-md active:scale-95 transition-transform shrink-0 overflow-hidden"
        aria-label="My Secret Account"
      >
        <div className="w-full h-full flex items-center justify-center bg-[#140F0B] text-white">
          <User className="w-4 h-4 text-[#C89B63]" />
        </div>
      </button>
    </div>
  );
};
