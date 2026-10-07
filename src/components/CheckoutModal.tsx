import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartTax,
    cartDeliveryFee,
    cartTotal,
    clearCart,
    setActiveOrder,
    setTrackingOrderId,
    setCurrentView,
    showToast,
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      showToast('Please fill in name, phone number, and delivery address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'guest@secretpresso.coffee',
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.unitPrice,
          basePrice: item.product.salePrice ?? item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          surpriseToyNote: item.product.surpriseToyNote,
          selectedCustomizations: item.selectedCustomizations,
          specialInstructions: item.specialInstructions,
        })),
        subtotal: cartSubtotal,
        tax: cartTax,
        deliveryFee: cartDeliveryFee,
        total: cartTotal,
        paymentMethod,
      };

      const newOrder = await api.createOrder(orderPayload);
      setConfirmedOrder(newOrder);
      setActiveOrder(newOrder);
      setTrackingOrderId(newOrder.id);
      clearCart();
      showToast(`Order #${newOrder.id} placed successfully!`, 'success');
    } catch (err: any) {
      console.error('Order creation error:', err);
      showToast(err.message || 'Failed to place order, please try again', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndTrack = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setCurrentView('track-order');
  };

  const handleContinueBrowsing = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#140e0b] border border-[#3c2a1c] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={() => {
            setIsCheckoutOpen(false);
            setConfirmedOrder(null);
          }}
          className="absolute top-5 right-5 text-[#8f7e70] hover:text-[#f5f0eb] p-1 rounded-full hover:bg-[#251b14] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          /* Order Confirmation Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[#dfb780] font-semibold">
                Order Confirmed
              </p>
              <h3 className="font-serif text-2xl font-medium text-[#fbf7f2] mt-1">
                Order #{confirmedOrder.id}
              </h3>
              <p className="text-xs text-[#a99888] mt-1">
                Our baristas have started preparing your handcrafted brew and secret collectible surprise!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1b140f] border border-[#2e2016] text-left text-xs space-y-2">
              <div className="flex justify-between text-[#b9a999]">
                <span>Status:</span>
                <span className="text-emerald-400 font-medium capitalize">
                  {confirmedOrder.status}
                </span>
              </div>
              <div className="flex justify-between text-[#b9a999]">
                <span>Total Amount:</span>
                <span className="text-[#f5f0eb] font-semibold tabular-nums">
                  ₹{confirmedOrder.total?.toFixed(2)} ({confirmedOrder.paymentMethod.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between text-[#b9a999]">
                <span>Delivery To:</span>
                <span className="text-[#f5f0eb] font-medium text-right max-w-xs truncate">
                  {confirmedOrder.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleFinishAndTrack}
                className="flex-1 py-3 px-4 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-colors"
              >
                <span>Track Order Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleContinueBrowsing}
                className="flex-1 py-3 px-4 rounded-xl bg-[#221811] hover:bg-[#2f2117] text-[#e8ded3] font-medium text-xs border border-[#3e2c1e] transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-5 pb-3 border-b border-[#281c13]">
              <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
                Express Concierge Delivery
              </span>
              <h2 className="font-serif text-2xl font-medium text-[#fbf7f2] mt-0.5">
                Checkout Details
              </h2>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="elena@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="House/Apartment number, Street, Landmark, City, Postal Code"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Special Instructions / Barista Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring doorbell, extra hot espresso"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none transition-colors"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-3 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#c89b63] bg-[#291f16] text-[#dfb780]'
                        : 'border-[#38281b] bg-[#1a120d] text-[#a99888] hover:text-[#f5f0eb]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-3 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#c89b63] bg-[#291f16] text-[#dfb780]'
                        : 'border-[#38281b] bg-[#1a120d] text-[#a99888] hover:text-[#f5f0eb]'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#c89b63] bg-[#291f16] text-[#dfb780]'
                        : 'border-[#38281b] bg-[#1a120d] text-[#a99888] hover:text-[#f5f0eb]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit</span>
                  </button>
                </div>
              </div>

              {/* Summary and Submit */}
              <div className="pt-3 border-t border-[#261c14] space-y-2">
                <div className="max-h-36 overflow-y-auto space-y-2 py-2 pr-1 no-scrollbar border-b border-[#261c14]/60">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-[11px] text-[#b9a999]">
                      <div className="pr-2">
                        <span className="text-[#f5f0eb] font-medium">
                          {item.quantity}x {item.product.name}
                        </span>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <p className="text-[10px] text-[#8e7d6f] leading-tight mt-0.5">
                            {item.selectedCustomizations.map((c) => `${c.groupName}: ${c.optionName}`).join(' · ')}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[9.5px] text-[#c4b5a5] italic leading-tight mt-0.5">
                            &ldquo;{item.specialInstructions}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className="text-[#f5f0eb] font-semibold tabular-nums shrink-0">
                        ₹{item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-semibold text-[#f5f0eb]">
                  <span>Total Due:</span>
                  <span className="text-[#dfb780] tabular-nums text-base">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] disabled:bg-[#3d2f23] text-[#100c08] font-semibold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl transition-all duration-200"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
