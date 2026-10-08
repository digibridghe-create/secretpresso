import React, { useState } from 'react';
import {
  X,
  User,
  LogOut,
  Package,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddress: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onOpenAddress }) => {
  const { orders, setCurrentView, showToast, userProfile, setUserProfile } = useApp();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const isAdmin = email.toLowerCase().includes('admin');
      const profile = {
        name: isAdmin ? 'Master Roaster Admin' : fullName || email.split('@')[0] || 'Customer',
        email: email.trim(),
        phone: phone || '+91 98765 43210',
        role: isAdmin ? ('admin' as const) : ('customer' as const),
      };
      setUserProfile(profile);
      try {
        localStorage.setItem('secretpresso_user', JSON.stringify(profile));
      } catch {}
      showToast('Signed in to SECRETpresso successfully', 'success');
      onClose();
    }, 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setAuthError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const profile = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98765 43210',
        role: 'customer' as const,
      };
      setUserProfile(profile);
      try {
        localStorage.setItem('secretpresso_user', JSON.stringify(profile));
      } catch {}
      showToast('Account created successfully!', 'success');
      onClose();
    }, 500);
  };

  const handleDemoSignIn = (role: 'customer' | 'admin' = 'customer') => {
    const profile = {
      name: role === 'admin' ? 'Master Roaster Admin' : 'Aarav Sharma',
      email: role === 'admin' ? 'admin@secretpresso.coffee' : 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      role,
    };
    setUserProfile(profile);
    try {
      localStorage.setItem('secretpresso_user', JSON.stringify(profile));
    } catch {}
    showToast(`Signed in as ${role === 'admin' ? 'Admin' : 'Customer'}`, 'success');
    onClose();
  };

  const handleSignOut = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('secretpresso_user');
    } catch {}
    showToast('Signed out successfully', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 z-10 animate-in fade-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DA]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C89B63]" />
            <h3 className="font-serif text-lg font-bold text-[#140F0B]">My Secret Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A6E64] hover:bg-[#FAF5EE] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {userProfile ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF5EE] border border-[#E5DBCC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C89B63]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#140F0B] text-white font-serif font-bold text-lg flex items-center justify-center">
                    {userProfile.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#140F0B] flex items-center gap-2">
                    {userProfile.name}
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                        userProfile.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#E5DBCC] text-[#4A3E34]'
                      }`}
                    >
                      {userProfile.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#7A6E64]">
                    {userProfile.email} {userProfile.phone ? `• ${userProfile.phone}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {userProfile.role === 'admin' && (
                <button
                  onClick={() => {
                    onClose();
                    setCurrentView('admin');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-[#140F0B] text-white flex items-center justify-between hover:bg-[#251B14] transition-colors cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-[#C89B63]" />
                    <span className="text-xs font-semibold">CMS & Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C89B63]" />
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  setCurrentView('track-order');
                }}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E5DBCC] flex items-center justify-between hover:bg-[#FAF5EE] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#C89B63]" />
                  <span className="text-xs font-semibold text-[#140F0B]">
                    Order History ({orders.length})
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddress();
                }}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#E5DBCC] flex items-center justify-between hover:bg-[#FAF5EE] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#C89B63]" />
                  <span className="text-xs font-semibold text-[#140F0B]">Saved Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-3.5 rounded-full bg-[#FAF5EE] hover:bg-[#F0EBE1] text-rose-700 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex p-1 rounded-2xl bg-[#FAF5EE] border border-[#E8DFD1]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#140F0B] shadow-xs'
                    : 'text-[#7A6E64] hover:text-[#140F0B]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#140F0B] shadow-xs'
                    : 'text-[#7A6E64] hover:text-[#140F0B]'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {authError}
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-xs focus:outline-none focus:border-[#C89B63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-xs focus:outline-none focus:border-[#C89B63]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#140F0B] text-white text-xs font-semibold hover:bg-[#251B14] transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aarav Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-xs focus:outline-none focus:border-[#C89B63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-xs focus:outline-none focus:border-[#C89B63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DA] text-xs focus:outline-none focus:border-[#C89B63]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#C89B63] text-white text-xs font-semibold hover:bg-[#B78A52] transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-[#EFE7DA] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FAF5EE] hover:bg-[#F0EBE1] text-[#4A3E34] text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C89B63]" />
                <span>Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#140F0B] hover:bg-[#251B14] text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C89B63]" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
