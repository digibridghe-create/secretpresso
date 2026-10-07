import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { Product, SelectedCustomizationOption, CartItem } from '../types';
import { useApp } from '../context/AppContext';
import { getProductCustomizationGroups } from '../utils/customizations';

interface ProductCustomizationModalProps {
  product: Product | null;
  existingCartItem?: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  product,
  existingCartItem,
  isOpen,
  onClose,
}) => {
  const { addCustomizedToCart } = useApp();

  // Active image gallery index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selections state: map of groupId -> array of selected optionIds
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Dynamic customization groups resolved from product or category-smart defaults
  const customizationGroups = useMemo(() => {
    return getProductCustomizationGroups(product);
  }, [product]);

  // Gallery images list
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const imgs = [product.image];
    if (product.additionalImages && product.additionalImages.length > 0) {
      product.additionalImages.forEach((img) => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs;
  }, [product]);

  // Initialize or reset selections when product or modal opens
  useEffect(() => {
    if (!product || !isOpen) return;

    setActiveImageIndex(0);

    if (existingCartItem && existingCartItem.product.id === product.id) {
      // Pre-fill from existing cart item
      const map: Record<string, string[]> = {};
      existingCartItem.selectedCustomizations.forEach((item) => {
        if (!map[item.groupId]) map[item.groupId] = [];
        map[item.groupId].push(item.optionId);
      });
      setSelections(map);
      setSpecialInstructions(existingCartItem.specialInstructions || '');
      setQuantity(existingCartItem.quantity || 1);
    } else {
      // Initialize defaults from product customization groups
      const map: Record<string, string[]> = {};
      if (customizationGroups) {
        customizationGroups.forEach((grp) => {
          if (grp.type === 'single') {
            const def = grp.options.find((o) => o.isDefault) || grp.options[0];
            if (def) map[grp.id] = [def.id];
          } else {
            // Multi-select defaults (if any)
            const defaults = grp.options.filter((o) => o.isDefault).map((o) => o.id);
            map[grp.id] = defaults;
          }
        });
      }
      setSelections(map);
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [product, existingCartItem, isOpen, customizationGroups]);

  if (!isOpen || !product) {
    return null;
  }

  // Handle single-select option click
  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  // Handle multi-select toggle
  const handleMultiSelectToggle = (groupId: string, optionId: string) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      return {
        ...prev,
        [groupId]: next,
      };
    });
  };

  // Calculate live price
  const basePrice = product.salePrice ?? product.price;

  // Selected options detailed list
  const selectedOptionsList: SelectedCustomizationOption[] = [];
  let customizationAdditionsPerUnit = 0;

  if (customizationGroups) {
    customizationGroups.forEach((grp) => {
      const selectedIds = selections[grp.id] || [];
      grp.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          selectedOptionsList.push({
            groupId: grp.id,
            groupName: grp.name,
            optionId: opt.id,
            optionName: opt.name,
            priceAdjustment: opt.priceAdjustment,
          });
          customizationAdditionsPerUnit += opt.priceAdjustment;
        }
      });
    });
  }

  const finalUnitPrice = basePrice + customizationAdditionsPerUnit;
  const finalTotalPrice = finalUnitPrice * quantity;

  // Submit customization to cart
  const handleAddToCart = () => {
    addCustomizedToCart(
      product,
      selectedOptionsList,
      specialInstructions.trim(),
      quantity,
      existingCartItem?.id
    );
    onClose();
  };

  const isDrink =
    product.productType === 'coffee' ||
    product.sectionId === 'sec-coffee-flavours' ||
    product.name.toLowerCase().includes('coffee') ||
    product.name.toLowerCase().includes('latte') ||
    product.name.toLowerCase().includes('cold brew');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${product.name}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Surface — Warm Off-white / Cream matching reference aesthetic */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#F8F4EC] text-[#140F0B] rounded-[28px] sm:rounded-[36px] shadow-2xl border border-[#E2D7C5] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Close Button X */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[#4A3B2F] hover:text-[#140F0B] hover:bg-black/5 transition-colors focus:outline-none"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[85vh] overflow-y-auto no-scrollbar">
          {/* LEFT COLUMN: Gallery & Main Image (col-span-5) */}
          <div className="md:col-span-5 p-5 sm:p-7 md:p-8 flex flex-col justify-start md:border-r border-[#E2D7C5] md:border-b-0 border-b">
            {/* Main Tall Portrait Image Container matching reference */}
            <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-[#ECE4D6] shadow-xs">
              <img
                src={galleryImages[activeImageIndex] || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center select-none"
              />
              {product.badge && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-sm text-white text-[9px] font-semibold tracking-[0.14em] uppercase shadow-xs pointer-events-none whitespace-nowrap z-10">
                  <span>{product.badge}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3.5 overflow-x-auto no-scrollbar pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border transition-all focus:outline-none ${
                      idx === activeImageIndex
                        ? 'border-[#140F0B] ring-2 ring-[#140F0B] ring-offset-1 ring-offset-[#F8F4EC]'
                        : 'border-[#D4C8B5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Collectible surprise toy note if applicable */}
            {product.surpriseToyNote && (
              <div className="mt-4 p-3 rounded-xl bg-[#EBE2D2] border border-[#DDD0BC] text-center flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D48] shrink-0" />
                <p className="text-[11.5px] font-serif italic text-[#634E39]">
                  Secret Surprise: {product.surpriseToyNote}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Customization Controls & Live Add to Cart (col-span-7) */}
          <div className="md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Product Header */}
              <div>
                <p className="text-[10px] sm:text-[11px] tracking-[0.22em] font-semibold uppercase text-[#8C6D48]">
                  {isDrink ? 'CUSTOMIZE YOUR DRINK' : 'CUSTOMIZE YOUR SELECTION'}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#140F0B] leading-tight mt-1">
                  {product.name}
                </h2>
                <p className="text-xs sm:text-[13px] text-[#6E6053] font-normal leading-relaxed mt-1.5">
                  {product.description}
                </p>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#140F0B] mt-2 tabular-nums">
                  ₹{basePrice}
                </div>
              </div>

              {/* Dynamic Product-Specific Customization Groups */}
              {customizationGroups && customizationGroups.length > 0 && (
                <div className="space-y-4 pt-1">
                  {customizationGroups.map((group) => {
                    const isSingle = group.type === 'single';
                    const activeIds = selections[group.id] || [];

                    return (
                      <div key={group.id} className="space-y-2">
                        {/* Group Label */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#1E1711] tracking-wide">
                            {group.name}
                          </label>
                          {group.required && (
                            <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#8C6D48]">
                              Required
                            </span>
                          )}
                        </div>

                        {/* Single-select: Visual Pill/Radio Tiles */}
                        {isSingle ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {group.options.map((opt) => {
                              const isSelected = activeIds.includes(opt.id);
                              return (
                                <button
                                  type="button"
                                  key={opt.id}
                                  onClick={() => handleSingleSelect(group.id, opt.id)}
                                  className={`p-2.5 rounded-xl border text-center transition-all focus:outline-none flex flex-col items-center justify-center ${
                                    isSelected
                                      ? 'border-[#140F0B] bg-white text-[#140F0B] shadow-xs ring-1 ring-[#140F0B]'
                                      : 'border-[#D9CFBF] bg-[#EFE8DD]/70 text-[#4E4135] hover:border-[#140F0B]/40'
                                  }`}
                                >
                                  <span className="text-xs font-semibold leading-tight">
                                    {opt.name}
                                  </span>
                                  {(opt.detail || opt.priceAdjustment > 0) && (
                                    <span className="text-[10px] text-[#7A6B5D] mt-0.5 leading-tight">
                                      {opt.detail}
                                      {opt.priceAdjustment > 0
                                        ? ` (+₹${opt.priceAdjustment})`
                                        : ''}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Multi-select: Checkbox List with exact styling */
                          <div className="space-y-2">
                            {group.options.map((opt) => {
                              const isChecked = activeIds.includes(opt.id);
                              return (
                                <button
                                  type="button"
                                  key={opt.id}
                                  onClick={() => handleMultiSelectToggle(group.id, opt.id)}
                                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EFE8DD] transition-colors text-left group focus:outline-none border border-transparent hover:border-[#D9CFBF]"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {/* Rounded Square Checkbox */}
                                    <div
                                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                        isChecked
                                          ? 'bg-[#140F0B] border-[#140F0B] text-white'
                                          : 'border-[#B8AB98] bg-white group-hover:border-[#140F0B]'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span className="text-xs font-medium text-[#251B13]">
                                      {opt.name}
                                    </span>
                                  </div>

                                  <span className="text-[11px] font-semibold text-[#665647] tabular-nums">
                                    {opt.priceAdjustment > 0
                                      ? `(+₹${opt.priceAdjustment})`
                                      : 'Free'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Instructions (Max 200 chars) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="special-instructions" className="text-xs font-bold text-[#1E1711]">
                    Special Instructions
                  </label>
                  <span className="text-[10px] text-[#8C7D6F] tabular-nums">
                    {specialInstructions.length}/200
                  </span>
                </div>
                <textarea
                  id="special-instructions"
                  rows={2}
                  maxLength={200}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less sweet, extra ice, no caramel, etc..."
                  className="w-full p-3 rounded-xl border border-[#D5CABB] bg-white focus:bg-white text-xs text-[#140F0B] placeholder-[#958575] focus:outline-none focus:border-[#140F0B] transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Bottom Actions: Quantity Stepper + Dynamic Live Price Add Button */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#E2D7C5]">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#D5CABB] rounded-full px-3 py-2 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="p-1 text-[#4A3B2F] hover:text-[#140F0B] disabled:opacity-30 transition-colors focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-semibold text-[#140F0B] tabular-nums select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="p-1 text-[#4A3B2F] hover:text-[#140F0B] transition-colors focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#140F0B] hover:bg-[#2B2016] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 group focus:outline-none cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2] group-hover:scale-105 transition-transform" />
                <span>
                  {existingCartItem ? 'Update Item' : 'Add to Cart'} • ₹{finalTotalPrice}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
