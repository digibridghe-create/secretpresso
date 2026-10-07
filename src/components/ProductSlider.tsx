import React, { useRef, useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductSliderProps {
  products: Product[];
}

export const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Mouse Drag state for desktop
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setHasMoved(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.4; // Drag speed
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Keyboard navigation when slider is focused or active (ArrowLeft / ArrowRight)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!sliderRef.current) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      sliderRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      sliderRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-[#8C7A6B] text-xs">
        No items assigned to this section yet.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scrollable Container with touch/drag support & hidden scrollbars — NO VISIBLE ARROWS */}
      <div
        ref={sliderRef}
        tabIndex={0}
        role="region"
        aria-label="Product collection carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onKeyDown={handleKeyDown}
        className={`flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1 snap-x snap-mandatory touch-pan-x cursor-grab ${
          isMouseDown ? 'cursor-grabbing select-none' : ''
        } focus:outline-none`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-[190px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
          />
        ))}
      </div>
    </div>
  );
};
