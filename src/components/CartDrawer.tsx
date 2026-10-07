import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Sparkles, ShoppingBag, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartDeliveryFee,
    cartTotal,
    setIsCheckoutOpen,
    openCustomizationModal,
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#120e0a] text-[#f5f0eb] border-l border-[#2e2116] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#241a12] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#c89b63]" />
              <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">
                Your Secret Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-[#9d8977] hover:text-[#f5f0eb] p-1 rounded-full hover:bg-[#1f1610] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body — Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1b140f] border border-[#2b1f16] flex items-center justify-center mx-auto text-[#6d5b4d]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="font-serif text-base text-[#e8ded3]">Your bag is currently empty</p>
                <p className="text-xs text-[#8e7d6f] max-w-xs mx-auto">
                  Explore our artisanal roasts and sweet delicacies to discover your secret surprise.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2 rounded-full bg-[#c89b63] hover:bg-[#dfb780] text-[#120d09] text-xs font-semibold tracking-wide transition-colors"
                >
                  Explore Roasts
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#9d8977] pb-2 border-b border-[#241a12]">
                  <span>{cart.length} unique item{cart.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={clearCart}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#1b140f] border border-[#2b1f16] space-y-2.5"
                    >
                      <div className="flex gap-3.5">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-contain bg-[#221812] shrink-0 self-start"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-[#f5f0eb] leading-tight">
                                {item.product.name}
                              </h4>
                              {item.product.surpriseToyNote && (
                                <p className="text-[10px] text-[#dfb780] flex items-center gap-1 mt-0.5">
                                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{item.product.surpriseToyNote}</span>
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#7e6d5e] hover:text-rose-400 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Customizations display */}
                          {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                            <div className="text-[11px] text-[#b3a191] space-y-0.5 mt-1.5">
                              {item.selectedCustomizations.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span className="text-[#8c7a6b] font-medium">{c.groupName}:</span>
                                  <span className="text-[#dfd5c8]">{c.optionName}</span>
                                  {c.priceAdjustment > 0 && (
                                    <span className="text-[#c89b63] text-[10px] font-semibold">
                                      (+₹{c.priceAdjustment})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Special instructions */}
                          {item.specialInstructions && (
                            <p className="text-[10.5px] text-[#c4b5a5] italic mt-1.5 bg-[#140e0a] p-1.5 rounded border border-[#2b1f16] leading-relaxed">
                              &ldquo;{item.specialInstructions}&rdquo;
                            </p>
                          )}

                          {/* Edit Customization Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              openCustomizationModal(item.product, item);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c89b63] hover:text-[#e4be88] mt-2 transition-colors focus:outline-none"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Customization</span>
                          </button>
                        </div>
                      </div>

                      {/* Quantity & Item Total Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#291e16]">
                        <div className="flex items-center border border-[#3b2d22] rounded-lg bg-[#140e0a]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-[#dfb780] text-[#a49180] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold tabular-nums text-[#f5f0eb]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-[#dfb780] text-[#a49180] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-semibold text-[#f5f0eb] tabular-nums">
                            ₹{item.totalPrice.toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-[#8e7d6f] tabular-nums">
                              ₹{item.unitPrice.toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer with Financials */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#241a12] bg-[#100c08] space-y-3">
              <div className="space-y-1.5 text-xs text-[#a99888]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#f5f0eb] font-medium tabular-nums">
                    ₹{cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST 5%)</span>
                  <span className="text-[#f5f0eb] font-medium tabular-nums">
                    ₹{cartTax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Handcrafted Express Delivery</span>
                  <span className="text-[#f5f0eb] font-medium tabular-nums">
                    {cartDeliveryFee === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `₹${cartDeliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {cartDeliveryFee > 0 && (
                  <p className="text-[10px] text-[#7d6c5d]">
                    Add ₹{(499 - cartSubtotal).toFixed(2)} more for free delivery
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#241a12] flex justify-between items-baseline">
                <span className="font-serif text-sm font-medium text-[#f5f0eb]">Total</span>
                <span className="font-serif text-lg font-bold text-[#f5f0eb] tabular-nums">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
