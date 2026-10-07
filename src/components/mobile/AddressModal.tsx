import React, { useState } from 'react';
import { X, MapPin, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [addresses, setAddresses] = useState([
    { id: '1', title: 'Home', address: '135/10 Vivekanand College, Ranganathpur Colony, Bengaluru', isDefault: true },
    { id: '2', title: 'Work', address: '7th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru', isDefault: false },
  ]);
  const [selectedId, setSelectedId] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');

  if (!isOpen) return null;

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAddress.trim()) {
      showToast('Please enter address title and details', 'error');
      return;
    }
    const newEntry = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      address: newAddress.trim(),
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newEntry]);
    setSelectedId(newEntry.id);
    setNewTitle('');
    setNewAddress('');
    setIsAdding(false);
    showToast('Delivery address saved successfully', 'success');
  };

  const handleDelete = (id: string) => {
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
          <button onClick={onClose} className="p-1 rounded-full text-[#7A6E64] hover:bg-[#FAF5EE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdding ? (
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#7A6E64]">Address Label (e.g. Home, Office)</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Home"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#7A6E64]">Complete Address & Landmark</label>
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Street name, building, apartment number..."
                rows={3}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 rounded-full bg-[#FAF5EE] text-[#140F0B] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {addresses.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  selectedId === item.id
                    ? 'border-[#140F0B] bg-[#FAF5EE]'
                    : 'border-[#E5DBCC] bg-white hover:border-[#D5CCC0]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${selectedId === item.id ? 'text-[#C89B63]' : 'text-[#8C7A6B]'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-[#140F0B]">{item.title}</h4>
                    <p className="text-[11px] text-[#7A6E64] mt-0.5 leading-relaxed">{item.address}</p>
                  </div>
                </div>
                {selectedId === item.id && <Check className="w-4 h-4 text-[#C89B63] shrink-0 mt-0.5" />}
              </div>
            ))}

            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#D5CCC0] text-[#140F0B] text-xs font-semibold flex items-center justify-center gap-2 hover:border-[#140F0B] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide shadow-md"
        >
          Confirm Address
        </button>
      </div>
    </div>
  );
};
