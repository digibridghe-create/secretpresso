import React from 'react';
import { Section, Product } from '../types';
import { ProductSlider } from './ProductSlider';
import { ProductCard } from './ProductCard';

interface DynamicSectionProps {
  section: Section;
  products: Product[];
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ section, products }) => {
  return (
    <section
      id={section.id}
      className="w-full bg-[#FAF7F2] text-[#140F0B] py-14 sm:py-18 px-4 sm:px-8 border-b border-[#EFE7DA]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with warm editorial typography matching reference */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#8C6D48] uppercase font-semibold">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#140F0B] mt-1">
              {section.name}
            </h2>
          </div>
          {section.subtitle && (
            <p className="max-w-md text-[#6B5A4E] text-xs sm:text-sm font-light leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Display Rendering */}
        {section.displayStyle === 'grid' ? (
          /* Grid Layout using global ProductCard */
          products.length === 0 ? (
            <p className="text-xs text-[#8C7A6B] py-8 text-center">
              No products currently assigned to this collection.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          /* Horizontal Slider Layout using global ProductCard */
          <ProductSlider products={products} />
        )}
      </div>
    </section>
  );
};
