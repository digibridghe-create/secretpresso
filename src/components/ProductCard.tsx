import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

interface ProductImageProps {
  src: string;
  alt: string;
  badge?: string;
  className?: string;
}

/**
 * Reusable Global ProductImage Component
 * Enforces the exact reference shape:
 * - Tall portrait rectangle (aspect-ratio: 4 / 5)
 * - Asymmetric corner radius: Top = 32px strongly rounded, Bottom = 10px slightly rounded
 * - 100% full frame coverage with object-fit: cover and centered position
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  badge,
  className = '',
}) => {
  return (
    <div
      style={{
        borderRadius: '48px 48px 8px 8px',
        overflow: 'hidden',
      }}
      className={`relative w-full aspect-[4/5] bg-[#EFE8DD] shadow-xs ${className}`}
    >
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out select-none pointer-events-none"
      />

      {/* Subtle Top-Centered Pill Badge matching reference (e.g. BEST SELLER, CHEF CHOICE, LIMITED) */}
      {badge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-sm text-white text-[8.5px] font-semibold tracking-[0.14em] uppercase shadow-xs pointer-events-none whitespace-nowrap z-10">
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  className?: string;
  onCardClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  onCardClick,
}) => {
  const { openCustomizationModal, cart } = useApp();
  const inCart = cart.some((c) => c.product.id === product.id);

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      openCustomizationModal(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col justify-between bg-transparent select-none transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* 1. Tall 4:5 Portrait Image with Exact 48px 48px 8px 8px Asymmetric Radius */}
      <ProductImage
        src={product.image}
        alt={product.name}
        badge={product.badge}
      />

      {/* 2. Product Name, Description & Price Structure matching reference */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name (Serif, elegant, dark text) */}
          <h3 className="font-serif text-[15px] sm:text-base font-semibold text-[#140F0B] group-hover:text-[#B08A4A] transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>

          {/* Short Description / Flavor Notes (Small, clean sans-serif) */}
          <p className="text-[11.5px] sm:text-xs text-[#7A6E64] font-normal leading-tight mt-0.5 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Price & Circular Add Button Line */}
        <div className="flex items-center justify-between mt-2.5 pt-0.5">
          {/* Price (Editorial serif font, clearly visible) */}
          <div className="flex items-baseline gap-1.5 font-serif text-[15px] sm:text-base font-medium text-[#140F0B] tabular-nums">
            <span>₹{product.salePrice ?? product.price}</span>
            {product.salePrice && (
              <span className="text-xs text-[#9E9084] line-through tabular-nums font-normal">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Minimal Circular + / Add Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCustomizationModal(product);
            }}
            title={inCart ? 'Customize & add another' : 'Customize & add to bag'}
            aria-label={`Customize ${product.name}`}
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
              inCart
                ? 'bg-[#140F0B] text-white border border-[#140F0B] shadow-xs'
                : 'border border-[#D5CCC0] text-[#332A22] hover:border-[#140F0B] hover:bg-[#140F0B] hover:text-white'
            }`}
          >
            {inCart ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
