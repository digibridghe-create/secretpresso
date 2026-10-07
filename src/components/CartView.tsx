import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  ChevronRight,
  Clock,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { resolveImage } from '../utils/imageResolver';

export const CartView: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartDeliveryFee,
    cartTotal,
    setCurrentView,
    showToast,
    products,
    openCustomizationModal,
    setActiveOrder,
    setTrackingOrderId,
  } = useApp();

  // Checkout form state
  const [customerName, setCustomerName] = useState('Aarav Sharma');
  const [customerEmail, setCustomerEmail] = useState('aarav.sharma@example.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Flat 402, Royale Crest, Indiranagar, Bengaluru, 560038'
  );
  const [notes, setNotes] = useState('Please leave with security/reception if unavailable.');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'netbanking'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderResult, setPlacedOrderResult] = useState<any | null>(null);

  // Calculate discount
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalGrandTotal = Math.max(0, cartTotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SECRET10') {
      const disc = Math.round(cartSubtotal * 0.1);
      setAppliedCoupon({ code: 'SECRET10', discount: disc });
      showToast('Coupon SECRET10 applied successfully!', 'success');
    } else if (code === 'WELCOME50') {
      setAppliedCoupon({ code: 'WELCOME50', discount: 50 });
      showToast('Coupon WELCOME50 applied successfully!', 'success');
    } else {
      showToast('Invalid or expired coupon code', 'error');
    }
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      showToast('Please provide your name, phone number and delivery address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.unitPrice,
          basePrice: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          surpriseToyNote: item.product.surpriseToyNote,
          selectedCustomizations: item.selectedCustomizations,
          specialInstructions: item.specialInstructions,
        })),
        subtotal: cartSubtotal,
        tax: cartTax,
        deliveryFee: cartDeliveryFee,
        total: finalGrandTotal,
        paymentMethod: paymentMethod === 'netbanking' ? 'card' : paymentMethod,
      };

      const newOrder = await api.createOrder(orderData);
      setActiveOrder(newOrder);
      setTrackingOrderId(newOrder.id);
      clearCart();
      setPlacedOrderResult(newOrder);
      showToast('Order placed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recommended products
  const recommendedProducts = products.filter((p) => p.isVisible).slice(0, 6);

  if (placedOrderResult) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#140F0B] pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto bg-white border border-[#E5DBCC] rounded-3xl p-8 text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C89B63] font-semibold">
              SECRETpresso Atelier
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#140F0B] mt-1">Order Confirmed!</h2>
            <p className="text-xs text-[#7A6E64] mt-1">
              Your secret coffee roasts and surprises are being prepared with care.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5DBCC] text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Order ID:</span>
              <span className="font-mono font-semibold text-[#C89B63]">{placedOrderResult.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Delivery Recipient:</span>
              <span className="text-[#140F0B] font-medium">{placedOrderResult.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Delivery Address:</span>
              <span className="text-[#140F0B] font-medium text-right truncate max-w-[200px]">{placedOrderResult.deliveryAddress}</span>
            </div>
            <div className="flex justify-between border-t border-[#E5DBCC] pt-2 mt-2">
              <span className="text-[#7A6E64] font-medium">Total Paid:</span>
              <span className="font-serif font-bold text-base text-[#140F0B]">₹{placedOrderResult.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setCurrentView('track-order')}
              className="flex-1 py-3.5 rounded-full bg-[#140F0B] hover:bg-[#2B2018] text-white text-xs font-semibold tracking-wide transition-colors shadow-md"
            >
              Track Order Status
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="flex-1 py-3.5 rounded-full bg-[#FAF5EE] hover:bg-[#F0EBE1] text-[#140F0B] border border-[#D5CCC0] text-xs font-semibold tracking-wide transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#140F0B] pt-24 sm:pt-28 pb-32 px-4 sm:px-8 selection:bg-[#C89B63] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE7DA]">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-xs font-medium text-[#C89B63] hover:text-[#140F0B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C89B63]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#140F0B]">
              Secret Bag & Checkout
            </h1>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white border border-[#E5DBCC] rounded-3xl p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EE] border border-[#D5CCC0] flex items-center justify-center mx-auto text-[#8C7A6B]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl text-[#140F0B]">Your cart is currently empty</h2>
            <p className="text-xs text-[#7A6E64] max-w-sm mx-auto">
              Explore our artisanal coffee roasts, velvet desserts, and secret collectible surprises.
            </p>
            <button
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 rounded-full bg-[#140F0B] hover:bg-[#2B2018] text-white text-xs font-semibold tracking-wide transition-colors shadow-md"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items, Delivery, Coupons, Recommendations */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Cart Items */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
                  <h2 className="font-serif text-lg font-bold text-[#140F0B]">
                    1. Cart Items ({cart.reduce((s, i) => s + i.quantity, 0)})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-[#8C7A6B] hover:text-rose-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => {
                    const itemImg = resolveImage(item.product.image);
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#FAF5EE] border border-[#E5DBCC] flex gap-4 items-start"
                      >
                        <img
                          src={itemImg}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-white shrink-0 border border-[#D5CCC0]"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-[#140F0B] leading-tight">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#8C7A6B] hover:text-rose-600 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Surprise note */}
                          {item.product.surpriseToyNote && (
                            <p className="text-[11px] text-[#C89B63] font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3 shrink-0" />
                              <span>{item.product.surpriseToyNote}</span>
                            </p>
                          )}

                          {/* Customizations */}
                          {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                            <div className="text-[11px] text-[#7A6E64] space-y-0.5 pt-1">
                              {item.selectedCustomizations.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span className="font-medium">{c.groupName}:</span>
                                  <span>{c.optionName}</span>
                                  {c.priceAdjustment > 0 && (
                                    <span className="text-[#C89B63] font-semibold">(+₹{c.priceAdjustment})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {item.specialInstructions && (
                            <p className="text-[10.5px] text-[#7A6E64] italic mt-1 bg-white p-1.5 rounded border border-[#E5DBCC]">
                              &ldquo;{item.specialInstructions}&rdquo;
                            </p>
                          )}

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#EFE7DA]">
                            <div className="flex items-center gap-2.5 bg-white px-2.5 py-1 rounded-lg border border-[#D5CCC0]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-[#7A6E64] hover:text-[#140F0B] transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold text-[#140F0B] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-[#7A6E64] hover:text-[#140F0B] transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="font-serif font-bold text-sm sm:text-base text-[#140F0B]">
                              ₹{item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Delivery Information */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C89B63]" />
                    <h2 className="font-serif text-lg font-bold text-[#140F0B]">
                      2. Delivery Information
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsEditingAddress((prev) => !prev)}
                    className="text-xs text-[#C89B63] hover:text-[#140F0B] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAddress ? 'Done' : 'Change Address'}</span>
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] text-[#7A6E64] uppercase tracking-wider font-semibold">Recipient Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#7A6E64] uppercase tracking-wider font-semibold">Phone Number</label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#7A6E64] uppercase tracking-wider font-semibold">Email Address</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#7A6E64] uppercase tracking-wider font-semibold">Delivery Address</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={2}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#7A6E64] uppercase tracking-wider font-semibold">Delivery Instructions / Notes</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#140F0B]">{customerName}</span>
                      <span className="text-[#C89B63] font-medium">{customerPhone}</span>
                    </div>
                    <p className="text-[#7A6E64] leading-relaxed">{deliveryAddress}</p>
                    {notes && (
                      <p className="text-[#7A6E64] italic text-[11px] bg-[#FAF5EE] p-2 rounded border border-[#E5DBCC]">
                        Note: {notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Offers / Coupons */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F0EBE1]">
                  <Tag className="w-5 h-5 text-[#C89B63]" />
                  <h2 className="font-serif text-lg font-bold text-[#140F0B]">
                    3. Offers & Coupons
                  </h2>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon (e.g. SECRET10)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#D5CCC0] text-xs text-[#140F0B] uppercase placeholder:normal-case focus:outline-none focus:border-[#140F0B]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#140F0B] hover:bg-[#2B2018] text-white text-xs font-semibold tracking-wide transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <span>Coupon <b>{appliedCoupon.code}</b> applied (-₹{appliedCoupon.discount})</span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-700 hover:underline text-[11px] font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon({ code: 'SECRET10', discount: Math.round(cartSubtotal * 0.1) });
                        showToast('SECRET10 applied', 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] border border-[#D5CCC0] text-[#140F0B] hover:bg-[#F0EBE1] font-medium"
                    >
                      Use <span className="font-bold">SECRET10</span> (10% off)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon({ code: 'WELCOME50', discount: 50 });
                        showToast('WELCOME50 applied', 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] border border-[#D5CCC0] text-[#140F0B] hover:bg-[#F0EBE1] font-medium"
                    >
                      Use <span className="font-bold">WELCOME50</span> (₹50 off)
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Complete Your Order / Recommended Products */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F0EBE1]">
                  <Sparkles className="w-5 h-5 text-[#C89B63]" />
                  <h2 className="font-serif text-lg font-bold text-[#140F0B]">
                    4. Complete Your Order (Recommended)
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recommendedProducts.map((prod) => {
                    const prodImg = resolveImage(prod.image);
                    return (
                      <div
                        key={prod.id}
                        className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E5DBCC] flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          <img
                            src={prodImg}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-28 object-cover rounded-lg bg-white border border-[#D5CCC0]"
                          />
                          <h4 className="text-xs font-semibold text-[#140F0B] line-clamp-1 group-hover:text-[#C89B63] transition-colors">
                            {prod.name}
                          </h4>
                          <span className="font-serif text-xs font-semibold text-[#140F0B]">
                            ₹{prod.salePrice ?? prod.price}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openCustomizationModal(prod)}
                          className="mt-3 w-full py-1.5 rounded-lg bg-[#140F0B] hover:bg-[#2B2018] text-white text-[11px] font-semibold tracking-wide transition-colors shadow-2xs"
                        >
                          + Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Bill Details, Payment Method, Place Order */}
            <div className="lg:col-span-5 space-y-6">
              {/* 5. Bill Details */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <h2 className="font-serif text-lg font-bold text-[#140F0B] pb-3 border-b border-[#F0EBE1]">
                  5. Bill Details
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#7A6E64]">
                    <span>Item Total</span>
                    <span className="font-medium text-[#140F0B]">₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#7A6E64]">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-medium text-[#140F0B]">₹{cartTax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-[#7A6E64]">
                    <span>Delivery Charge</span>
                    <span className="font-medium text-[#140F0B]">
                      {cartDeliveryFee === 0 ? 'FREE' : `₹${cartDeliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[#EFE7DA] font-serif text-base font-bold text-[#140F0B]">
                    <span>Grand Total</span>
                    <span className="text-[#C89B63]">₹{finalGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* 6. Cancellation / Order Policy */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-4 text-[11px] text-[#7A6E64] space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#C89B63] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Order & Cancellation Policy</span>
                </div>
                <p>
                  Orders cannot be cancelled once preparation has begun in our atelier. Estimated delivery time: 30–45 mins.
                </p>
              </div>

              {/* 7. Payment Method */}
              <div className="bg-white border border-[#E5DBCC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-[#F0EBE1]">
                  <CreditCard className="w-5 h-5 text-[#C89B63]" />
                  <h2 className="font-serif text-lg font-bold text-[#140F0B]">
                    7. Payment Method
                  </h2>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-[#FAF5EE] border-[#140F0B] text-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] text-[#7A6E64] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-[#C89B63]" />
                      <span className="font-semibold">UPI (Instant Pay)</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#140F0B]"
                    />
                  </label>

                  {paymentMethod === 'upi' && (
                    <div className="pl-7 pb-2 flex gap-2">
                      {(['gpay', 'phonepe', 'paytm', 'other'] as const).map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiApp(app)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] uppercase font-semibold border transition-all ${
                            upiApp === app
                              ? 'bg-[#140F0B] text-white border-[#140F0B]'
                              : 'bg-white text-[#7A6E64] border-[#D5CCC0]'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Card */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#FAF5EE] border-[#140F0B] text-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] text-[#7A6E64] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-[#C89B63]" />
                      <span className="font-semibold">Credit / Debit Card</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#140F0B]"
                    />
                  </label>

                  {/* Net Banking */}
                  <label
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#FAF5EE] border-[#140F0B] text-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] text-[#7A6E64] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-[#C89B63]" />
                      <span className="font-semibold">Net Banking</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="accent-[#140F0B]"
                    />
                  </label>

                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-[#FAF5EE] border-[#140F0B] text-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] text-[#7A6E64] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Banknote className="w-4 h-4 text-[#C89B63]" />
                      <span className="font-semibold">Cash on Delivery (COD)</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#140F0B]"
                    />
                  </label>
                </div>
              </div>

              {/* 8. Place Order Button & Sticky Bottom Bar */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl bg-[#140F0B] hover:bg-[#2B2018] text-white font-serif font-bold text-base tracking-wide flex items-center justify-center gap-3 transition-colors shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing your order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (₹{finalGrandTotal.toFixed(2)})</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
