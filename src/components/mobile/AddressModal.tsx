import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

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
  const { showToast, setDeliveryAddress, userProfile } = useApp();
  const [addresses, setAddresses] = useState<AddressItem[]>([
    { id: '1', title: 'Home', address: '135/10 Vivekanand College, Bengaluru', isDefault: true },
    { id: '2', title: 'Work', address: '7th Floor, Prestige Tech Park, Bengaluru', isDefault: false },
  ]);
  const [selectedId, setSelectedId] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load addresses from Supabase if authenticated
  useEffect(() => {
    if (!isOpen || !userProfile?.id) return;

    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('is_default', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const loaded: AddressItem[] = data.map((a) => ({
            id: a.id,
            title: a.label,
            address: a.full_address,
            isDefault: a.is_default,
          }));
          setAddresses(loaded);
          const def = loaded.find((a) => a.isDefault) || loaded[0];
          setSelectedId(def.id);
        }
      });
  }, [isOpen, userProfile?.id]);

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

    // Save to Supabase if authenticated
    if (userProfile?.id) {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: userProfile.id,
            label: newEntry.title,
            full_address: newEntry.address,
            is_default: newEntry.isDefault,
          })
          .select()
          .single();

        if (!error && data) {
          newEntry.id = data.id;
        }
      } catch (err) {
        console.warn('Could not save address to Supabase:', err);
      }
    }

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
    if (userProfile?.id) {
      try {
        await supabase.from('addresses').delete().eq('id', id);
      } catch (err) {
        console.warn('Could not delete address from Supabase:', err);
      }
    }
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
              <label className="text-xs font-semibold text-[#7A6E64]">Full Street Address</label>
              <textarea
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Flat 204, Secret Roastery Street, Indiranagar, Bengaluru"
                rows={3}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B] resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5CCC0] text-xs font-semibold text-[#7A6E64] hover:bg-[#FAF5EE] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#140F0B] text-white text-xs font-semibold hover:bg-[#251B14] cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save to Supabase'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {addresses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    selectedId === item.id
                      ? 'border-[#C89B63] bg-[#FAF5EE]'
                      : 'border-[#E5DBCC] bg-white hover:border-[#C89B63]/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        selectedId === item.id
                          ? 'border-[#C89B63] bg-[#C89B63] text-white'
                          : 'border-[#D5CCC0]'
                      }`}
                    >
                      {selectedId === item.id && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#140F0B]">{item.title}</span>
                        {item.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#140F0B] text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7A6E64] mt-0.5 leading-snug line-clamp-2">
                        {item.address}
                      </p>
                    </div>
                  </div>
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="text-[#A89C8F] hover:text-rose-600 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-full border border-dashed border-[#C89B63] bg-[#FAF5EE]/50 hover:bg-[#FAF5EE] text-[#140F0B] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C89B63]" />
              <span>Add New Delivery Address</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
