import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2, Truck, Coffee, Sparkles, MapPin, Phone, User, Package, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Order } from '../types';

export const TrackOrderView: React.FC = () => {
  const {
    activeOrder,
    trackingOrderId,
    setTrackingOrderId,
    setCurrentView,
    orders,
  } = useApp();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(activeOrder);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with activeOrder or search when trackingOrderId changes
  useEffect(() => {
    if (trackingOrderId) {
      const found = orders.find((o) => o.id.toLowerCase() === trackingOrderId.toLowerCase());
      if (found) {
        setCurrentOrder(found);
      } else {
        // Try fetching from API
        api.getOrder(trackingOrderId)
          .then((o) => {
            setCurrentOrder(o);
            setErrorMsg(null);
          })
          .catch(() => {
            setErrorMsg(`Order #${trackingOrderId} not found.`);
          });
      }
    } else if (activeOrder) {
      setCurrentOrder(activeOrder);
    }
  }, [trackingOrderId, activeOrder, orders]);

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    try {
      const order = await api.getOrder(searchInput.trim());
      setCurrentOrder(order);
      setTrackingOrderId(order.id);
    } catch {
      setErrorMsg(`No active order found with ID "${searchInput}". Please verify the order number.`);
    } finally {
      setIsSearching(false);
    }
  };

  const getStepActive = (stepKey: string, status: string) => {
    const steps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = steps.indexOf(status);
    const stepIndex = steps.indexOf(stepKey);
    return stepIndex <= currentIndex;
  };

  return (
    <div className="min-h-screen bg-[#0d0a08] text-[#f5f0eb] pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#251d16]">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-xs sm:text-sm text-[#bcaaa0] hover:text-[#e4be88] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brew Home</span>
          </button>

          <div className="flex items-center gap-4 text-xs text-[#8e7c6d]">
            <button
              onClick={() => {
                setCurrentView('home');
                setTimeout(() => {
                  const el = document.getElementById('coffee-flavours');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="hover:text-[#f5f0eb] transition-colors"
            >
              Our Brew
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('our-story')}
              className="hover:text-[#f5f0eb] transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Search Order Bar if user wants to look up past order */}
        <div className="mb-8 p-4 rounded-2xl bg-[#140e0b] border border-[#2b1f16] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-medium text-[#fbf7f2]">
              Track Your Specialty Brew
            </h2>
            <p className="text-xs text-[#9d8977] mt-0.5">
              Enter your Order Number to check preparation status and secret toy allocation.
            </p>
          </div>

          <form onSubmit={handleSearchOrder} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. ORD-1024"
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3e2c1e] text-xs text-[#f5f0eb] placeholder-[#7d6b5c] focus:outline-none focus:border-[#c89b63]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-lg bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs text-center mb-6">
            {errorMsg}
          </div>
        )}

        {currentOrder ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Order Status Header */}
            <div className="p-6 rounded-2xl bg-[#15100c] border border-[#302217] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#d6b07c] font-semibold">
                    Order In Progress
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#fbf7f2] mt-0.5">
                    Order #{currentOrder.id}
                  </h1>
                  <p className="text-xs text-[#a49180] mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#c89b63]" />
                    <span>Placed on {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-[#9d8977]">Status</span>
                  <span className="text-sm font-semibold text-emerald-400 capitalize flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {currentOrder.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-[#7d6b5c] mt-0.5">
                    Estimated Delivery: 25–35 Mins
                  </span>
                </div>
              </div>

              {/* Progress Milestones Tracker */}
              <div className="relative py-4 border-t border-[#261c14]">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors ${
                        getStepActive('placed', currentOrder.status)
                          ? 'bg-[#c89b63] text-[#100c08] shadow-lg'
                          : 'bg-[#221811] text-[#715f50] border border-[#3a2c20]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#e4dbcf]">Order Placed</span>
                    <span className="text-[9px] text-[#8e7c6d] hidden sm:inline">Received</span>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors ${
                        getStepActive('confirmed', currentOrder.status)
                          ? 'bg-[#c89b63] text-[#100c08] shadow-lg'
                          : 'bg-[#221811] text-[#715f50] border border-[#3a2c20]'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#e4dbcf]">Confirmed</span>
                    <span className="text-[9px] text-[#8e7c6d] hidden sm:inline">Barista Assigned</span>
                  </div>

                  {/* Step 3: Preparing & Brewing */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors ${
                        getStepActive('preparing', currentOrder.status)
                          ? 'bg-[#c89b63] text-[#100c08] shadow-lg'
                          : 'bg-[#221811] text-[#715f50] border border-[#3a2c20]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#e4dbcf]">Brewing</span>
                    <span className="text-[9px] text-[#8e7c6d] hidden sm:inline">Sealing Toy</span>
                  </div>

                  {/* Step 4: Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold mb-2 transition-colors ${
                        getStepActive('out_for_delivery', currentOrder.status)
                          ? 'bg-[#c89b63] text-[#100c08] shadow-lg'
                          : 'bg-[#221811] text-[#715f50] border border-[#3a2c20]'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium text-[#e4dbcf]">Out for Delivery</span>
                    <span className="text-[9px] text-[#8e7c6d] hidden sm:inline">On the Way</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details & Delivery Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ordered Items */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-[#15100c] border border-[#302217] space-y-4">
                <h3 className="font-serif text-lg font-medium text-[#fbf7f2] pb-2 border-b border-[#261c14] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#c89b63]" />
                  <span>Items in This Order ({currentOrder.items.length})</span>
                </h3>

                <div className="space-y-3">
                  {currentOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1c1510] border border-[#2b1f16]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-contain bg-[#221812]"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#f5f0eb]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#9d8977]">
                            Qty: {item.quantity} · ₹{item.price} each
                          </p>

                          {/* Item Customizations */}
                          {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                            <div className="text-[10.5px] text-[#a99888] space-y-0.5 mt-1">
                              {item.selectedCustomizations.map((c, i) => (
                                <p key={i}>
                                  <span className="text-[#8c7a6b] font-medium">{c.groupName}:</span>{' '}
                                  <span className="text-[#d8cdbf]">{c.optionName}</span>
                                  {c.priceAdjustment > 0 && (
                                    <span className="text-[#c89b63] text-[9.5px]"> (+₹{c.priceAdjustment})</span>
                                  )}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Special Instructions */}
                          {item.specialInstructions && (
                            <p className="text-[10px] text-[#c4b5a5] italic mt-1 bg-[#140e0a] p-1.5 rounded border border-[#2b1f16] max-w-sm">
                              Note: &ldquo;{item.specialInstructions}&rdquo;
                            </p>
                          )}

                          {item.surpriseToyNote && (
                            <p className="text-[10px] text-[#e0bb87] flex items-center gap-1 mt-1">
                              <Sparkles className="w-2.5 h-2.5 text-[#e0bb87]" />
                              <span>{item.surpriseToyNote}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-semibold tabular-nums text-[#f5f0eb] self-start pt-1">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal breakdown */}
                <div className="pt-3 border-t border-[#261c14] space-y-1.5 text-xs text-[#9d8977]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-[#e8ded3]">₹{currentOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (GST 5%)</span>
                    <span className="tabular-nums text-[#e8ded3]">₹{currentOrder.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="tabular-nums text-[#e8ded3]">
                      {currentOrder.deliveryFee === 0 ? 'FREE' : `₹${currentOrder.deliveryFee?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-semibold text-[#fbf7f2] pt-2 border-t border-[#2c1f16]">
                    <span>Total Paid</span>
                    <span className="text-[#dfb780] tabular-nums">₹{currentOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Customer Info */}
              <div className="p-6 rounded-2xl bg-[#15100c] border border-[#302217] space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-medium text-[#fbf7f2] pb-2 border-b border-[#261c14] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#c89b63]" />
                    <span>Destination</span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2 text-[#cfbeae]">
                      <User className="w-3.5 h-3.5 mt-0.5 text-[#c89b63] shrink-0" />
                      <div>
                        <span className="font-semibold text-[#f5f0eb]">{currentOrder.customerName}</span>
                        {currentOrder.customerEmail && (
                          <p className="text-[11px] text-[#8e7c6d]">{currentOrder.customerEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[#cfbeae]">
                      <Phone className="w-3.5 h-3.5 mt-0.5 text-[#c89b63] shrink-0" />
                      <span>{currentOrder.customerPhone}</span>
                    </div>

                    <div className="flex items-start gap-2 text-[#cfbeae]">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-[#c89b63] shrink-0" />
                      <span className="leading-relaxed">{currentOrder.deliveryAddress}</span>
                    </div>

                    {currentOrder.notes && (
                      <div className="p-2.5 rounded-lg bg-[#1f1610] border border-[#36271a] text-[11px] text-[#e0bb87]">
                        <span className="font-medium text-[#f5f0eb]">Note: </span>
                        {currentOrder.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#261c14]">
                  <p className="text-[11px] text-[#8a7767] text-center mb-3">
                    Need assistance with your brew or collectible?
                  </p>
                  <a
                    href="tel:+919820045678"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#221811] hover:bg-[#322318] text-[#e4be88] border border-[#443123] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Concierge</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-[#8e7c6d]">
            <Package className="w-12 h-12 mx-auto stroke-[1.2] mb-3 text-[#443325]" />
            <p className="text-base font-serif text-[#d6c4b2]">No Active Order Selected</p>
            <p className="text-xs mt-1">Enter your order ID above or explore our freshly roasted beans.</p>
            <button
              onClick={() => setCurrentView('home')}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#c89b63] text-[#100c08] font-medium text-xs transition-colors"
            >
              Explore Coffee Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
