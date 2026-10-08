import React, { useState } from 'react';
import { X, MapPin, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddressItem {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { showToast, setDeliveryAddress } = useApp();
  const [addresses, setAddresses] = useState<AddressItem[]>([
    { id: '1', title: 'Home', address: '135/10 Vivekanand College, Bengaluru', isDefault: true },
    { id: '2', title: 'Work', address: '7th Floor, Prestige Tech Park, Bengaluru', isDefault: false },
  ]);
  const [selectedId, setSelectedId] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (item: AddressItem) => {
    setSelectedId(item.id);
    setDeliveryAddress(`${item.title} • ${item.address}`);
    showToast(`Delivery location set to ${item.title}`, 'success');
    onClose();
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAddress.trim()) {
      showToast('Please enter address title and details', 'error');
      return;
    }

    setIsSaving(true);
    const newEntry: AddressItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      address: newAddress.trim(),
      isDefault: addresses.length === 0,
    };

    setAddresses((prev) => [...prev, newEntry]);
    setSelectedId(newEntry.id);
    setDeliveryAddress(`${newEntry.title} • ${newEntry.address}`);
    setNewTitle('');
    setNewAddress('');
    setIsAdding(false);
    setIsSaving(false);
    showToast('Delivery address saved successfully', 'success');
  };

  const handleDelete = async (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address removed', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DA]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C89B63]" />
            <h3 className="font-serif text-lg font-bold text-[#140F0B]">Select Delivery Address</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A6E64] hover:bg-[#FAF5EE] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdding ? (
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A4E44] mb-1">Address Label (e.g., Home, Office)</label>
              <input
                type="text"
                placeholder="Home, Office, etc."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-sm focus:outline-none focus:border-[#C89B63]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A4E44] mb-1">Full Delivery Address</label>
              <textarea
                placeholder="Street, area, landmark, pincode..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-sm focus:outline-none focus:border-[#C89B63] resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EFE7DA] text-xs font-semibold text-[#5A4E44] hover:bg-[#FAF5EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#2C1D11] text-[#FDF9F4] text-xs font-semibold hover:bg-[#3D2819] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {addresses.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#C89B63] bg-[#FAF5EE]/80 shadow-xs'
                        : 'border-[#EFE7DA] hover:border-[#D8C7B5] bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#C89B63] text-white' : 'bg-[#FAF5EE] text-[#7A6E64]'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#140F0B]">{item.title}</span>
                          {item.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C89B63]/15 text-[#8C5E28] font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A6E64] mt-1 leading-relaxed">{item.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 text-[#C89B63] shrink-0 mt-1" />}
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-[#C89B63]/60 text-[#C89B63] hover:bg-[#FAF5EE] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Delivery Address</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
