import React, { useState } from 'react';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileFixedLocationBar: React.FC = () => {
  const { setIsAddressModalOpen, setIsAccountModalOpen } = useApp();
  const [selectedAddress] = useState(
    '135/10 Vivekanand College, Ranganathpur Colony'
  );

  return (
    <div
      className="md:hidden absolute top-0 left-0 right-0 z-50 pointer-events-auto flex items-center justify-between gap-3 px-4 pb-2"
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
        background: 'transparent !important',
        backgroundColor: 'transparent !important',
        backdropFilter: 'none !important',
        WebkitBackdropFilter: 'none !important',
        boxShadow: 'none !important',
        border: 'none !important',
        transform: 'none !important',
      }}
    >
      {/* Location & Address Button (Left / Middle) */}
      <button
        onClick={() => setIsAddressModalOpen(true)}
        style={{
          background: 'transparent !important',
          backgroundColor: 'transparent !important',
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
          boxShadow: 'none !important',
          border: 'none !important',
          transform: 'none !important',
        }}
        className="flex-1 flex items-start text-left py-0 px-0 min-w-0 cursor-pointer group"
      >
        <div className="flex items-start gap-2.5 min-w-0 w-full">
          {/* Location Pin Icon */}
          <div className="mt-0.5 shrink-0">
            <MapPin className="w-5 h-5 text-white drop-shadow-md" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Home + Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-white drop-shadow-md tracking-wide">
                Home
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-md mt-0.5" />
            </div>

            {/* Address Text */}
            <p className="text-xs text-white/95 font-normal drop-shadow-md truncate w-full mt-0.5">
              {selectedAddress}
            </p>
          </div>
        </div>
      </button>

      {/* Account / Profile Icon (Right) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsAccountModalOpen(true)}
          style={{
            background: 'transparent !important',
            backgroundColor: 'transparent !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
            boxShadow: 'none !important',
            border: 'none !important',
            transform: 'none !important',
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform overflow-hidden"
          aria-label="Account Profile"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/30 text-white shadow-md">
            <User className="w-4 h-4 text-[#C89B63]" />
          </div>
        </button>
      </div>
    </div>
  );
};

export const MobileLocationAddressAccount = MobileFixedLocationBar;
export const FixedMobileTopControls = MobileFixedLocationBar;
