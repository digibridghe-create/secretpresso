import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';

export const CoffeeFlavoursGrid: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useApp();

  // Find all coffee products belonging to the coffee section or typed as coffee
  const coffeeProducts = products.filter(
    (p) => p.isVisible && (p.sectionId === 'sec-coffee-flavours' || p.productType === 'coffee')
  );

  // Filter by category
  const filteredProducts =
    selectedCategory === 'cat-all'
      ? coffeeProducts
      : coffeeProducts.filter((p) => p.categoryId === selectedCategory);

  return (
    <section
      id="coffee-flavours"
      className="w-full bg-[#FAF7F2] text-[#140F0B] py-14 sm:py-20 px-4 sm:px-8 border-b border-[#EFE7DA]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header matching reference screenshot: Title on left, subtitle & View All on right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.25em] text-[#8C6D48] uppercase font-semibold mb-1">
              Our Menu
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#140F0B]">
              Coffee Flavours
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <p className="max-w-md text-[#6B5A4E] text-xs sm:text-sm font-light leading-relaxed hidden md:block">
              From classic favourites to exciting new blends, choose your perfect cup. Each one comes with a surprise inside.
            </p>
            <button
              onClick={() => setSelectedCategory('cat-all')}
              className="text-xs sm:text-sm font-medium text-[#140F0B] hover:text-[#B08A4A] transition-colors whitespace-nowrap"
            >
              View All →
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter Pills matching reference screenshot */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          <button
            onClick={() => setSelectedCategory('cat-all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'cat-all'
                ? 'bg-[#140F0B] text-white shadow-xs'
                : 'bg-white/80 text-[#4A4036] hover:text-[#140F0B] border border-[#D5CCC0] hover:border-[#140F0B]'
            }`}
          >
            ALL
          </button>
          {categories
            .filter((c) => c.isVisible && c.id !== 'cat-all')
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#140F0B] text-white shadow-xs'
                    : 'bg-white/80 text-[#4A4036] hover:text-[#140F0B] border border-[#D5CCC0] hover:border-[#140F0B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* 5-Column Responsive Product Grid matching reference */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-[#8C7A6B]">
            <p className="text-sm">No coffee roasts found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
