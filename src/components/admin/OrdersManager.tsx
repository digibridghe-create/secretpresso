import React, { useState } from 'react';
import { Package, Clock, Phone, MapPin, Check, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';

export const OrdersManager: React.FC = () => {
  const { orders, refreshData, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses: { key: OrderStatus; label: string }[] = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing & Brewing' },
    { key: 'out_for_delivery', label: 'Out For Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await refreshData();
      showToast(`Order #${orderId} marked as ${newStatus.replace(/_/g, ' ')}`, 'success');
    } catch {
      showToast(`Failed to update order status`, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Concierge Order Dispatch
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Orders ({orders.length})
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Manage incoming drink orders, update live preparation status, and verify collectible toys allocated.
          </p>
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8e7c6d]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c140f] border border-[#3e2c1e] text-xs text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
          >
            <option value="all">All Orders ({orders.length})</option>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({orders.filter((o) => o.status === s.key).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-[#8e7c6d] border border-dashed border-[#312217] rounded-2xl">
          <Package className="w-10 h-10 mx-auto stroke-[1.2] mb-2 text-[#463426]" />
          <p className="text-sm font-serif text-[#d6c4b2]">No orders matching this status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] hover:border-[#4d3625] space-y-4 transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#261c14]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-medium text-[#fbf7f2]">
                      Order #{order.id}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#251a13] text-[#e0bb87] border border-[#3c2a1c]">
                      {order.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e7c6d] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-[#c89b63]" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#9d8977]">Status:</span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#1f1610] border border-[#3e2c1e] text-xs font-semibold text-emerald-400 focus:outline-none focus:border-[#c89b63]"
                  >
                    {statuses.map((s) => (
                      <option key={s.key} value={s.key} className="text-[#f5f0eb] bg-[#140e0b]">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {updatingId === order.id && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c89b63]" />}
                </div>
              </div>

              {/* Items in Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-[#1c140f] border border-[#2b1f16]"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-contain bg-[#221812] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold text-[#f5f0eb] leading-tight">
                            {item.name}
                          </p>
                          <span className="text-[11px] font-semibold text-[#c89b63] shrink-0 tabular-nums">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8e7c6d] mt-0.5">
                          Qty: <span className="text-[#f5f0eb] font-bold">{item.quantity}</span> · ₹{item.price} each
                        </p>
                        {item.surpriseToyNote && (
                          <p className="text-[9px] text-[#dfb780] flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{item.surpriseToyNote}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customizations breakdown for Barista / Chef */}
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <div className="pt-2 border-t border-[#261c14] space-y-0.5 text-[10.5px]">
                        <p className="text-[9.5px] uppercase font-bold tracking-wider text-[#9d8977]">
                          Customization:
                        </p>
                        {item.selectedCustomizations.map((c, i) => (
                          <div key={i} className="flex justify-between text-[#d6c9ba]">
                            <span>
                              <span className="text-[#8c7969]">{c.groupName}:</span> {c.optionName}
                            </span>
                            {c.priceAdjustment > 0 && (
                              <span className="text-[#c89b63] text-[9.5px]">
                                +₹{c.priceAdjustment}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special preparation note */}
                    {item.specialInstructions && (
                      <div className="pt-1.5 border-t border-[#261c14]">
                        <p className="text-[9.5px] uppercase font-bold tracking-wider text-[#dfb780]">
                          Special Instructions:
                        </p>
                        <p className="text-[10px] text-[#f5f0eb] bg-[#120c08] p-1.5 rounded border border-[#2b1f16] italic mt-0.5">
                          &ldquo;{item.specialInstructions}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Customer & Total Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#261c14] text-xs text-[#a49180]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#cfbeae]">
                    <span className="font-semibold text-[#f5f0eb]">{order.customerName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#c89b63]" />
                      <span>{order.customerPhone}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#8e7c6d]">
                    <MapPin className="w-3 h-3 text-[#c89b63] shrink-0" />
                    <span className="truncate max-w-md">{order.deliveryAddress}</span>
                  </div>
                  {order.notes && (
                    <p className="text-[10px] text-[#dfb780]">Note: {order.notes}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#8e7c6d]">Order Total</span>
                  <p className="text-base font-semibold text-[#dfb780] tabular-nums">
                    ₹{order.total?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
