import React from 'react';
import { X, Tag, Sparkles, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OffersModal: React.FC<OffersModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const offers = [
    {
      code: 'SECRET10',
      title: '10% Off Specialty Brews',
      description: 'Get 10% off on all artisan coffee roasts and secret surprise cups today.',
      discount: '10% OFF',
    },
    {
      code: 'WELCOME50',
      title: 'Flat ₹50 Off First Order',
      description: 'Enjoy ₹50 instant discount on your first SECRETpresso experience.',
      discount: '₹50 OFF',
    },
    {
      code: 'SWEETPAIR',
      title: 'Complimentary Collectible Figurine',
      description: 'Receive a rare Series 1 Barista Bear figurine with any dessert pairing.',
      discount: 'FREE TOY',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DA]">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#C89B63]" />
            <h3 className="font-serif text-lg font-bold text-[#140F0B]">Available Offers & Coupons</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#7A6E64] hover:bg-[#FAF5EE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5DBCC] flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#140F0B] text-white text-[9px] font-bold tracking-wider uppercase">
                  {offer.discount}
                </div>
                <h4 className="font-serif text-sm font-bold text-[#140F0B]">{offer.title}</h4>
                <p className="text-[11px] text-[#7A6E64] leading-relaxed">{offer.description}</p>
                <div className="pt-1 font-mono text-xs font-bold text-[#C89B63]">Code: {offer.code}</div>
              </div>

              <button
                onClick={() => handleCopy(offer.code)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5CCC0] text-[#140F0B] text-xs font-semibold flex items-center gap-1.5 hover:border-[#140F0B] transition-colors shrink-0 shadow-2xs"
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide shadow-md"
        >
          Close Offers
        </button>
      </div>
    </div>
  );
};
