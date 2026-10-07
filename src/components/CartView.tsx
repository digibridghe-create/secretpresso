import React, { useState, useRef } from 'react';
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
  ChevronLeft,
  Clock,
  Leaf,
  Heart,
  Check,
  Zap,
  Coffee,
  ShieldCheck,
  FileText,
  X,
  Gift,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { resolveImage } from '../utils/imageResolver';

// Official UPI App Icons for payment selection UI
const GooglePayIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-lg bg-white border border-[#E2D8C9] flex items-center justify-center shrink-0 shadow-2xs">
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  </div>
);

const PhonePeIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-lg bg-[#5F259F] flex items-center justify-center text-white shrink-0 shadow-2xs font-sans">
    <span className="font-extrabold text-sm leading-none tracking-tight">पे</span>
  </div>
);

const PaytmIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-lg bg-[#002E6E] flex items-center justify-center shrink-0 shadow-2xs">
    <span className="text-[10px] font-black tracking-tight leading-none text-white">
      pay<span className="text-[#00BAF2]">tm</span>
    </span>
  </div>
);

const OtherUpiIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-lg bg-white border border-[#E2D8C9] flex items-center justify-center shrink-0 shadow-2xs">
    <span className="text-[10px] font-black tracking-tight text-[#0D5B3A] flex items-center">
      <span className="text-[#E77728]">U</span>PI
    </span>
  </div>
);

export const CartView: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTax,
    cartDeliveryFee,
    setCurrentView,
    showToast,
    products,
    openCustomizationModal,
    setActiveOrder,
    setTrackingOrderId,
    deliveryAddress: contextAddress,
    setDeliveryAddress: setContextAddress,
    userProfile,
    setIsOffersModalOpen,
    settings,
  } = useApp();

  // Recipient & Delivery address state
  const [customerName, setCustomerName] = useState(userProfile?.name || 'Aarav Sharma');
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || 'aarav.sharma@example.com');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState(
    contextAddress || 'Flat 402, Royale Crest, Indiranagar, Bengaluru, 560038'
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Delivery instructions & notes
  const [notes, setNotes] = useState('');
  const [selectedInstructionTags, setSelectedInstructionTags] = useState<string[]>([]);
  const [noCutlery, setNoCutlery] = useState(true);

  // Barista tip state
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customTipActive, setCustomTipActive] = useState(false);
  const [customTipInput, setCustomTipInput] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderResult, setPlacedOrderResult] = useState<any | null>(null);

  // Horizontal slider ref
  const sliderRef = useRef<HTMLDivElement>(null);

  const currencySymbol = settings?.currencySymbol || '₹';

  // Calculate discount & totals
  const isFreeDelivery = cartSubtotal >= 500;
  const deliveryCharge = isFreeDelivery ? 0 : cartDeliveryFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalGrandTotal = Math.max(0, cartSubtotal + cartTax + deliveryCharge + tipAmount - discountAmount);
  const totalSavings = discountAmount + (isFreeDelivery ? cartDeliveryFee : 0);

  // Scroll horizontal slider
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollOffset = direction === 'left' ? -280 : 280;
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  // Toggle delivery instructions chip
  const toggleInstructionTag = (tag: string) => {
    setSelectedInstructionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Select tip amount
  const handleSelectTip = (amount: number) => {
    if (tipAmount === amount) {
      setTipAmount(0);
      setCustomTipActive(false);
    } else {
      setTipAmount(amount);
      setCustomTipActive(false);
    }
  };

  const handleApplyCustomTip = () => {
    const val = parseInt(customTipInput, 10);
    if (!isNaN(val) && val > 0) {
      setTipAmount(val);
      setCustomTipActive(false);
      setCustomTipInput('');
      showToast(`Added ₹${val} Barista & Delivery tip`, 'success');
    }
  };

  // Coupon handlers
  const handleApplyCoupon = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const code = (customCode || couponCode).trim().toUpperCase();
    if (!code) return;

    if (code === 'SECRET10') {
      const disc = Math.round(cartSubtotal * 0.1);
      setAppliedCoupon({ code: 'SECRET10', discount: disc });
      showToast('Coupon SECRET10 applied! 10% discount', 'success');
    } else if (code === 'WELCOME50') {
      const disc = Math.min(50, Math.round(cartSubtotal * 0.5));
      setAppliedCoupon({ code: 'WELCOME50', discount: disc });
      showToast('Coupon WELCOME50 applied! ₹50 discount', 'success');
    } else {
      showToast('Invalid or expired coupon code', 'error');
    }
    setCouponCode('');
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      showToast('Please provide your name, phone number, and delivery address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedNotes = [
        notes.trim(),
        selectedInstructionTags.length > 0
          ? `Delivery preferences: ${selectedInstructionTags.join(', ')}`
          : '',
        noCutlery ? 'No cutlery requested (eco-friendly zero waste)' : '',
        tipAmount > 0 ? `Barista tip included: ₹${tipAmount}` : '',
        paymentMethod === 'upi' ? `Paid via UPI (${upiApp.toUpperCase()})` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        notes: combinedNotes,
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
        deliveryFee: deliveryCharge,
        total: finalGrandTotal,
        paymentMethod: paymentMethod === 'netbanking' ? 'card' : paymentMethod,
      };

      const newOrder = await api.createOrder(orderData);
      setActiveOrder(newOrder);
      setTrackingOrderId(newOrder.id);
      clearCart();
      setPlacedOrderResult(newOrder);
      showToast('Order confirmed! Atelier is preparing your brew.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recommended pairings for horizontal slider
  const cartProductIds = new Set(cart.map((i) => i.product.id));
  const recommendedProducts = products
    .filter((p) => p.isVisible && !cartProductIds.has(p.id))
    .slice(0, 8);

  // UPI apps list with symbols and names
  const upiApps = [
    {
      id: 'gpay',
      name: 'Google Pay',
      subtitle: 'Fast, secure UPI checkout',
      icon: <GooglePayIcon />,
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      subtitle: 'Instant Pay via PhonePe UPI',
      icon: <PhonePeIcon />,
    },
    {
      id: 'paytm',
      name: 'Paytm',
      subtitle: 'Paytm UPI & Wallet payments',
      icon: <PaytmIcon />,
    },
    {
      id: 'other',
      name: 'Other UPI Apps',
      subtitle: 'BHIM, CRED, or Any UPI ID',
      icon: <OtherUpiIcon />,
    },
  ];

  // ORDER CONFIRMATION SCREEN
  if (placedOrderResult) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#140F0B] pt-24 sm:pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E8DFD1] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C89B63] font-semibold">
              SECRETpresso Atelier
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#140F0B] mt-1">
              Order Confirmed!
            </h2>
            <p className="text-xs text-[#7A6E64] mt-1.5 leading-relaxed">
              Your specialty roasts and surprise collectibles are being handcrafted with care.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E8DFD1] text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Order ID:</span>
              <span className="font-mono font-semibold text-[#140F0B]">{placedOrderResult.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Recipient:</span>
              <span className="text-[#140F0B] font-medium">{placedOrderResult.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Estimated Dispatch:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> 18–25 mins
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A6E64]">Address:</span>
              <span className="text-[#140F0B] font-medium text-right truncate max-w-[210px]">
                {placedOrderResult.deliveryAddress}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#E8DFD1] pt-2.5 mt-2">
              <span className="text-[#140F0B] font-semibold">Total Paid:</span>
              <span className="font-serif font-bold text-base text-[#140F0B]">
                {currencySymbol}{placedOrderResult.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => setCurrentView('track-order')}
              className="flex-1 py-3.5 rounded-full bg-[#140F0B] hover:bg-[#2A1F17] text-white text-xs font-semibold tracking-wide transition-colors shadow-md active:scale-98 cursor-pointer"
            >
              Track Live Order
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="flex-1 py-3.5 rounded-full bg-[#FAF5EE] hover:bg-[#F2ECE1] text-[#140F0B] border border-[#D5CCC0] text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#140F0B] pt-20 sm:pt-24 pb-32 sm:pb-20 px-3 sm:px-6 selection:bg-[#C89B63] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="flex items-center justify-between py-2 border-b border-[#ECE3D5]/80">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-xs font-semibold text-[#140F0B] hover:text-[#C89B63] transition-colors py-1 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white border border-[#E5DBCC] flex items-center justify-center text-[#140F0B] group-hover:border-[#C89B63] transition-colors shadow-2xs">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium">Menu</span>
          </button>

          <div className="text-center">
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#140F0B] leading-tight">
              SECRETpresso Atelier
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7A6E64]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Indiranagar Flagship</span>
              <span>•</span>
              <span className="font-medium text-[#B08A4A] flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-[#B08A4A]" /> 20–25 mins
              </span>
            </div>
          </div>

          <div className="text-xs text-[#7A6E64] font-medium">
            {cart.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5DBCC] text-[11px] font-semibold text-[#140F0B]">
                {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>

        {/* EMPTY CART STATE */}
        {cart.length === 0 ? (
          <div className="py-20 text-center space-y-5 bg-white border border-[#EAE3D7] rounded-3xl p-8 shadow-xs max-w-lg mx-auto animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-[#FAF5EE] border border-[#E2D8C9] flex items-center justify-center mx-auto text-[#B08A4A]">
              <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-bold text-[#140F0B]">Your Secret Bag is empty</h2>
              <p className="text-xs text-[#7A6E64] max-w-xs mx-auto leading-relaxed">
                Explore our signature single-origin espresso roasts, velvet desserts, and mystery collectible toys.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-7 py-3.5 rounded-full bg-[#140F0B] hover:bg-[#2A1F17] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Explore Atelier Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN: 
                1. Delivery Address 
                2. Offer / Savings 
                3. Cart Items 
                4. Add More Items 
                5. Kitchen Note 
                6. Complete Your Brew (HORIZONTAL SLIDER)
            */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* 1. DELIVERY ADDRESS */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#E2D8C9] flex items-center justify-center text-[#B08A4A] shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#140F0B] uppercase tracking-wide">
                          Delivery at Home
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-[#F4EDE2] text-[#9A7036]">
                          20–25 MINS
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6E64] mt-0.5 leading-snug line-clamp-2">
                        {deliveryAddress}
                      </p>
                      <p className="text-[11px] text-[#9A7036] font-medium mt-1">
                        {customerName} • {customerPhone}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingAddress((prev) => !prev)}
                    className="text-xs font-semibold text-[#140F0B] hover:text-[#B08A4A] px-2.5 py-1 rounded-lg border border-[#E2D8C9] hover:border-[#140F0B] bg-[#FAF7F2] transition-colors shrink-0 cursor-pointer"
                  >
                    {isEditingAddress ? 'Done' : 'Change'}
                  </button>
                </div>

                {/* Inline Address Editor */}
                {isEditingAddress && (
                  <div className="mt-4 pt-3.5 border-t border-[#F0EAE1] space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-[#7A6E64] font-bold uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD3C4] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#7A6E64] font-bold uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD3C4] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                          placeholder="+91 Mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7A6E64] font-bold uppercase tracking-wider">
                        Delivery Address
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          setContextAddress(e.target.value);
                        }}
                        rows={2}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD3C4] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                        placeholder="House / Flat / Street / Landmark..."
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-1.5 rounded-lg bg-[#140F0B] text-white text-xs font-semibold hover:bg-[#2A1F17] cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. OFFER / SAVINGS BANNER */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF5EE] via-[#F6ECE0] to-[#FAF5EE] border border-[#E8DFD1] text-xs text-[#140F0B] shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#140F0B] text-[#C89B63] flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-[#C89B63]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] sm:text-xs text-[#140F0B] truncate">
                      {isFreeDelivery
                        ? '🎉 Free Atelier Delivery Unlocked!'
                        : `Add ₹${Math.max(0, 500 - cartSubtotal)} more for FREE Delivery`}
                    </div>
                    <div className="text-[10px] text-[#7A6E64] truncate">
                      Use code <span className="font-bold text-[#140F0B]">SECRET10</span> for 10% off artisanal brews
                    </div>
                  </div>
                </div>

                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(undefined, 'SECRET10')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD3C4] hover:border-[#140F0B] text-[10px] font-bold text-[#140F0B] shrink-0 transition-colors cursor-pointer"
                  >
                    Apply 10%
                  </button>
                )}
              </div>

              {/* 3. CART ITEMS */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-[#B08A4A]" />
                    <h2 className="font-serif text-sm sm:text-base font-bold text-[#140F0B]">
                      Order Items ({cart.reduce((s, i) => s + i.quantity, 0)})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[11px] text-[#8C7A6B] hover:text-rose-600 transition-colors font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#F2ECE1]">
                  {cart.map((item) => {
                    const itemImg = resolveImage(item.product.image);
                    const hasCustomizations =
                      item.selectedCustomizations && item.selectedCustomizations.length > 0;

                    return (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 sm:gap-4">
                        {/* Veg / Artisanal symbol & Image */}
                        <div className="relative shrink-0">
                          <img
                            src={itemImg}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover bg-[#FAF5EE] border border-[#E2D8C9]"
                          />
                          {/* Veg dot badge */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded bg-white border border-[#2E7D32] flex items-center justify-center shadow-2xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                          </div>
                        </div>

                        {/* Title, Details, Customization triggers */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-[#140F0B] leading-snug">
                              {item.product.name}
                            </h3>
                            <span className="font-serif font-bold text-xs sm:text-sm text-[#140F0B] shrink-0">
                              {currencySymbol}{item.totalPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Surprise collectible badge */}
                          {item.product.surpriseToyNote && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF5EE] border border-[#E8DFD1] text-[10px] text-[#9A7036] font-medium">
                              <Gift className="w-2.5 h-2.5 shrink-0 text-[#9A7036]" />
                              <span className="truncate">{item.product.surpriseToyNote}</span>
                            </div>
                          )}

                          {/* Customizations summary */}
                          {hasCustomizations && (
                            <div className="text-[10.5px] text-[#7A6E64] flex flex-wrap items-center gap-1 leading-tight pt-0.5">
                              {item.selectedCustomizations.map((c, i) => (
                                <span key={i} className="inline-flex items-center">
                                  <span>{c.optionName}</span>
                                  {c.priceAdjustment > 0 && (
                                    <span className="text-[#9A7036] font-semibold ml-0.5">
                                      (+{currencySymbol}{c.priceAdjustment})
                                    </span>
                                  )}
                                  {i < item.selectedCustomizations.length - 1 && <span className="mx-1">•</span>}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Special notes on item */}
                          {item.specialInstructions && (
                            <p className="text-[10px] text-[#7A6E64] italic bg-[#FAF7F2] px-2 py-1 rounded border border-[#EAE3D7]">
                              &ldquo;{item.specialInstructions}&rdquo;
                            </p>
                          )}

                          {/* Bottom Row: Customise link & Stepper */}
                          <div className="flex items-center justify-between pt-1.5">
                            <button
                              type="button"
                              onClick={() => openCustomizationModal(item.product, item)}
                              className="text-[11px] font-semibold text-[#9A7036] hover:text-[#140F0B] transition-colors flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Customise</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            {/* Stepper */}
                            <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#DDD3C4] rounded-lg px-2 py-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-[#7A6E64] hover:text-[#140F0B] p-0.5 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="w-3 h-3 text-rose-500 hover:text-rose-700" />
                                ) : (
                                  <Minus className="w-3 h-3 stroke-[2.5]" />
                                )}
                              </button>
                              <span className="text-xs font-bold text-[#140F0B] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-[#7A6E64] hover:text-[#140F0B] p-0.5 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. ADD MORE ITEMS */}
              <div>
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="w-full py-3 rounded-2xl border border-dashed border-[#DDD3C4] hover:border-[#140F0B] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#140F0B] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer group"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B08A4A] group-hover:scale-110 transition-transform" />
                  <span>Add more items from Menu</span>
                </button>
              </div>

              {/* 5. KITCHEN NOTE */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B08A4A]" />
                  <h3 className="text-xs font-bold text-[#140F0B] uppercase tracking-wide">
                    Kitchen & Barista Request
                  </h3>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2D8C9]">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write instructions for the barista (e.g. extra hot, less sweet, no ice)..."
                    className="w-full text-xs text-[#140F0B] placeholder-[#8C7A6B] bg-transparent focus:outline-none"
                  />
                  {notes && (
                    <button
                      type="button"
                      onClick={() => setNotes('')}
                      className="text-[#8C7A6B] hover:text-[#140F0B] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Quick note suggestion chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {['Extra hot', 'Less sweet', 'No sugar', 'Extra cup', 'Pack separately'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setNotes((prev) => (prev ? `${prev}, ${chip}` : chip));
                      }}
                      className="text-[10.5px] px-2 py-0.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E2D8C9] text-[#7A6E64] hover:text-[#140F0B] transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. COMPLETE YOUR BREW — HORIZONTAL SLIDER */}
              {recommendedProducts.length > 0 && (
                <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B08A4A]" />
                      <div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#140F0B]">
                          Complete Your Brew
                        </h3>
                        <p className="text-[10px] text-[#7A6E64]">
                          Swipe or scroll to explore artisanal pairings
                        </p>
                      </div>
                    </div>

                    {/* Desktop & Tablet Navigation Arrows */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollSlider('left')}
                        className="w-7 h-7 rounded-full bg-[#FAF7F2] hover:bg-[#140F0B] hover:text-white border border-[#E2D8C9] flex items-center justify-center text-[#140F0B] transition-colors cursor-pointer"
                        aria-label="Previous recommended items"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollSlider('right')}
                        className="w-7 h-7 rounded-full bg-[#FAF7F2] hover:bg-[#140F0B] hover:text-white border border-[#E2D8C9] flex items-center justify-center text-[#140F0B] transition-colors cursor-pointer"
                        aria-label="Next recommended items"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Scrolling Track — Single row, swipeable on mobile/tablet, draggable/scrollable */}
                  <div
                    ref={sliderRef}
                    className="flex flex-row flex-nowrap items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-0.5"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    {recommendedProducts.map((prod) => {
                      const prodImg = resolveImage(prod.image);
                      return (
                        <div
                          key={prod.id}
                          className="w-[140px] sm:w-[155px] md:w-[150px] lg:w-[155px] shrink-0 snap-start p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] hover:border-[#C89B63] transition-all flex flex-col justify-between group shadow-2xs"
                        >
                          <div className="space-y-1.5">
                            <div className="relative overflow-hidden rounded-lg bg-white border border-[#E0D6C6]">
                              <img
                                src={prodImg}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-22 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {prod.productType && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8.5px] uppercase font-bold text-white tracking-wider">
                                  {prod.productType}
                                </span>
                              )}
                            </div>
                            <h4 className="text-[11px] sm:text-xs font-bold text-[#140F0B] line-clamp-1 group-hover:text-[#9A7036] transition-colors">
                              {prod.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-bold text-[#140F0B]">
                                {currencySymbol}{prod.salePrice ?? prod.price}
                              </span>
                              {prod.salePrice && (
                                <span className="text-[10px] text-[#8C7A6B] line-through">
                                  {currencySymbol}{prod.price}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openCustomizationModal(prod)}
                            className="mt-2.5 w-full py-1.5 rounded-lg bg-white hover:bg-[#140F0B] hover:text-white border border-[#DDD3C4] text-[#140F0B] text-[11px] font-bold tracking-wide transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: 
                7. Coupons / Savings 
                8. Delivery Information 
                9. Bill Summary 
                10. Payment Method (GPay, PhonePe, Paytm symbols + text) 
                11. Place Order
            */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 7. COUPONS / SAVINGS */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#B08A4A]" />
                    <h3 className="font-serif text-sm font-bold text-[#140F0B]">
                      Offers & Coupons
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOffersModalOpen(true)}
                    className="text-[11px] font-semibold text-[#9A7036] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span> applied!
                        <p className="text-[10px] text-emerald-700">
                          Saved {currencySymbol}{appliedCoupon.discount} on your order.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-800 hover:text-rose-600 font-semibold text-[11px] px-2 py-1 rounded bg-white/80 border border-emerald-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <form onSubmit={(e) => handleApplyCoupon(e)} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD3C4] text-xs text-[#140F0B] uppercase placeholder:normal-case focus:outline-none focus:border-[#140F0B]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#140F0B] hover:bg-[#2A1F17] text-white text-xs font-bold tracking-wide transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>

                    {/* Quick promo pills */}
                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(undefined, 'SECRET10')}
                        className="flex-1 p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE0] border border-[#E2D8C9] text-left transition-all group cursor-pointer"
                      >
                        <div className="text-[10px] font-bold text-[#140F0B] group-hover:text-[#9A7036]">
                          SECRET10
                        </div>
                        <div className="text-[9.5px] text-[#7A6E64]">10% OFF roasts</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(undefined, 'WELCOME50')}
                        className="flex-1 p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE0] border border-[#E2D8C9] text-left transition-all group cursor-pointer"
                      >
                        <div className="text-[10px] font-bold text-[#140F0B] group-hover:text-[#9A7036]">
                          WELCOME50
                        </div>
                        <div className="text-[9.5px] text-[#7A6E64]">Flat ₹50 OFF</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 8. DELIVERY INFORMATION & PREFERENCES */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0EAE1]">
                  <Clock className="w-4 h-4 text-[#B08A4A]" />
                  <h3 className="font-serif text-sm font-bold text-[#140F0B]">
                    Delivery Information & Eco Choice
                  </h3>
                </div>

                {/* Zero-waste cutlery toggle */}
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#140F0B]">
                        Don&apos;t send plastic cutlery or straws
                      </h4>
                      <p className="text-[10px] text-[#7A6E64]">
                        Help us brew sustainably and reduce waste
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={noCutlery}
                    onChange={(e) => setNoCutlery(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#140F0B] cursor-pointer"
                  />
                </div>

                {/* Delivery instructions chips */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider">
                    Quick Delivery Instructions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Leave at door',
                      'Avoid ringing bell',
                      'Leave with security',
                      'Call upon arrival',
                    ].map((tag) => {
                      const isSelected = selectedInstructionTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInstructionTag(tag)}
                          className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#140F0B] text-white border-[#140F0B] font-medium'
                              : 'bg-[#FAF7F2] text-[#7A6E64] border-[#E2D8C9] hover:border-[#140F0B]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#C89B63]" />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fresh extraction assurance policy */}
                <div className="pt-2 border-t border-[#F0EAE1] flex items-start gap-2 text-[10.5px] text-[#7A6E64]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A7036] shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Orders cannot be cancelled once preparation begins at our atelier to maintain fresh extraction standards.
                  </p>
                </div>
              </div>

              {/* 9. BILL SUMMARY */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#140F0B] pb-2 border-b border-[#F0EAE1]">
                  Bill Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#7A6E64]">
                    <span>Item Total</span>
                    <span className="font-medium text-[#140F0B]">
                      {currencySymbol}{cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#7A6E64]">
                    <div className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      {isFreeDelivery && (
                        <span className="text-[9px] uppercase px-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Free
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-[#140F0B]">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-semibold">FREE</span>
                      ) : (
                        `${currencySymbol}${deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#7A6E64]">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-medium text-[#140F0B]">
                      {currencySymbol}{cartTax.toFixed(2)}
                    </span>
                  </div>

                  {tipAmount > 0 && (
                    <div className="flex justify-between text-[#7A6E64]">
                      <span>Barista & Delivery Tip</span>
                      <span className="font-medium text-[#140F0B]">
                        {currencySymbol}{tipAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{currencySymbol}{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Grand Total Row */}
                  <div className="flex justify-between pt-3 border-t border-[#F0EAE1] font-serif text-base font-bold text-[#140F0B]">
                    <span>Grand Total</span>
                    <span className="text-[#140F0B]">
                      {currencySymbol}{finalGrandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Total Savings Pill */}
                {totalSavings > 0 && (
                  <div className="p-2 rounded-xl bg-[#FAF5EE] border border-[#E5DBCC] text-[11px] text-[#9A7036] font-semibold text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 fill-[#9A7036]" />
                    <span>You saved {currencySymbol}{totalSavings.toFixed(2)} on this order!</span>
                  </div>
                )}

                {/* Tip Barista options */}
                <div className="pt-2 border-t border-[#F0EAE1] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7A6E64] flex items-center gap-1 font-medium">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      Tip Barista & Partner
                    </span>
                    {tipAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => setTipAmount(0)}
                        className="text-[10px] text-[#8C7A6B] hover:text-rose-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[20, 30, 50].map((amt) => {
                      const isSelected = tipAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleSelectTip(amt)}
                          className={`flex-1 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#140F0B] text-white border-[#140F0B]'
                              : 'bg-[#FAF7F2] text-[#140F0B] border-[#DDD3C4] hover:border-[#140F0B]'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setCustomTipActive((prev) => !prev)}
                      className={`flex-1 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        customTipActive || (tipAmount > 0 && ![20, 30, 50].includes(tipAmount))
                          ? 'bg-[#140F0B] text-white border-[#140F0B]'
                          : 'bg-[#FAF7F2] text-[#7A6E64] border-[#DDD3C4] hover:border-[#140F0B]'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {customTipActive && (
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="number"
                        value={customTipInput}
                        onChange={(e) => setCustomTipInput(e.target.value)}
                        placeholder="Tip (₹)"
                        className="flex-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DDD3C4] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomTip}
                        className="px-3 py-1 rounded-lg bg-[#140F0B] text-white text-xs font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 10. PAYMENT METHOD — UPI WITH RECOGNIZABLE APP SYMBOLS + TEXT */}
              <div className="bg-white border border-[#EAE3D7] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0EAE1]">
                  <CreditCard className="w-4 h-4 text-[#B08A4A]" />
                  <h3 className="font-serif text-sm font-bold text-[#140F0B]">
                    Payment Method
                  </h3>
                </div>

                {/* UPI Header Tab */}
                <div className="space-y-2">
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-[#FAF5EE] border-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-[#B08A4A]" />
                        <span className="font-bold text-xs text-[#140F0B]">UPI Instant Pay</span>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="accent-[#140F0B] cursor-pointer"
                      />
                    </div>

                    {/* UPI Apps list with BOTH App Symbol and App Name */}
                    {paymentMethod === 'upi' && (
                      <div className="mt-3 pt-3 border-t border-[#E8DFD1] space-y-2 animate-in fade-in duration-200">
                        <div className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider px-0.5">
                          Pay Using
                        </div>

                        {upiApps.map((app) => {
                          const isSelected = paymentMethod === 'upi' && upiApp === app.id;
                          return (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentMethod('upi');
                                setUpiApp(app.id as any);
                              }}
                              className={`w-full p-2.5 sm:p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-white border-[#140F0B] ring-1.5 ring-[#140F0B] shadow-2xs'
                                  : 'bg-[#FAF7F2] border-[#E2D8C9] hover:border-[#140F0B]/40'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {app.icon}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#140F0B] truncate">
                                    {app.name}
                                  </div>
                                  <div className="text-[10px] text-[#7A6E64] truncate">
                                    {app.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                  isSelected
                                    ? 'border-[#140F0B] bg-[#140F0B]'
                                    : 'border-[#DDD3C4] bg-white'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Credit / Debit Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#FAF5EE] border-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[#B08A4A]" />
                      <span className="font-bold text-xs text-[#140F0B]">Credit / Debit Card</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#140F0B] cursor-pointer"
                    />
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#FAF5EE] border-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#B08A4A]" />
                      <span className="font-bold text-xs text-[#140F0B]">Net Banking</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="accent-[#140F0B] cursor-pointer"
                    />
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-[#FAF5EE] border-[#140F0B]'
                        : 'bg-white border-[#E5DBCC] hover:border-[#D5CCC0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-[#B08A4A]" />
                      <span className="font-bold text-xs text-[#140F0B]">Cash on Delivery (COD)</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#140F0B] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 11. PLACE ORDER BUTTON (DESKTOP) */}
              <div className="hidden lg:block pt-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 rounded-2xl bg-[#140F0B] hover:bg-[#2A1F17] text-white font-serif font-bold text-base tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 cursor-pointer active:scale-99"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Order to Atelier...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order • {currencySymbol}{finalGrandTotal.toFixed(2)}</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY CHECKOUT BOTTOM BAR (Fixed at bottom on mobile) */}
      {cart.length > 0 && !placedOrderResult && (
        <div
          className="lg:hidden fixed z-40 left-0 right-0 bg-white/98 backdrop-blur-md border-t border-[#EAE3D7] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-2 duration-200"
          style={{
            bottom: '0px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
          }}
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {/* Left: Selected Payment & Grand Total */}
            <div className="min-w-0">
              <div className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider flex items-center gap-1">
                <span>PAY USING</span>
                <span className="text-[#140F0B] uppercase font-bold truncate">
                  {paymentMethod === 'upi' ? `${upiApps.find((a) => a.id === upiApp)?.name || 'UPI'}` : paymentMethod}
                </span>
              </div>
              <div className="font-serif font-bold text-lg text-[#140F0B] leading-tight">
                {currencySymbol}{finalGrandTotal.toFixed(2)}
              </div>
            </div>

            {/* Right: Place Order CTA */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="flex-1 max-w-[220px] py-3 px-4 rounded-full bg-[#140F0B] hover:bg-[#2A1F17] text-white font-serif font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
