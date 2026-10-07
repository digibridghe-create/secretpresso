import React, { useState } from 'react';
import { X, User, LogOut, Package, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddress: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onOpenAddress }) => {
  const { orders, setCurrentView, showToast } = useApp();
  const [isSignedIn, setIsSignedIn] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 z-10 animate-in fade-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DA]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C89B63]" />
            <h3 className="font-serif text-lg font-bold text-[#140F0B]">My Secret Account</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-[#7A6E64] hover:bg-[#FAF5EE]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSignedIn ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5DBCC] flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#140F0B] text-white font-serif font-bold text-lg flex items-center justify-center">
                AS
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#140F0B]">Aarav Sharma</h4>
                <p className="text-[11px] text-[#7A6E64]">aarav.sharma@example.com • +91 98765 43210</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose();
                  setCurrentView('track-order');
                }}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E5DBCC] flex items-center justify-between hover:bg-[#FAF5EE] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#C89B63]" />
                  <span className="text-xs font-semibold text-[#140F0B]">Order History ({orders.length})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddress();
                }}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E5DBCC] flex items-center justify-between hover:bg-[#FAF5EE] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#C89B63]" />
                  <span className="text-xs font-semibold text-[#140F0B]">Saved Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
              </button>
            </div>

            <button
              onClick={() => {
                setIsSignedIn(false);
                showToast('Signed out successfully', 'info');
              }}
              className="w-full py-3.5 rounded-full bg-[#FAF5EE] hover:bg-[#F0EBE1] text-rose-700 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EE] border border-[#E5DBCC] flex items-center justify-center mx-auto text-[#C89B63]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-[#140F0B]">Sign In to Secretpresso</h4>
            <p className="text-xs text-[#7A6E64] max-w-xs mx-auto">
              Access your saved addresses, order history, and collect secret figurine surprises with every order.
            </p>
            <button
              onClick={() => {
                setIsSignedIn(true);
                showToast('Signed in successfully as Aarav Sharma', 'success');
              }}
              className="w-full py-3.5 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide shadow-md"
            >
              Sign In (Demo Account)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
