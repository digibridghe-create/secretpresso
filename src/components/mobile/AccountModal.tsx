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
import { supabase } from '../../lib/supabase';

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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        // If unconfirmed or invalid credentials
        setAuthError(error.message);
        showToast(error.message, 'error');
        return;
      }

      if (data.user) {
        try {
          const { data: p } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (p) {
            setUserProfile({
              id: p.id,
              name: p.full_name || data.user.email?.split('@')[0] || 'Customer',
              email: p.email || data.user.email || '',
              phone: p.phone || '',
              avatarUrl: p.avatar_url || '',
              role: p.role || 'customer',
            });
          } else {
            const fallbackName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Customer';
            const fallbackPhone = data.user.user_metadata?.phone || '';
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fallbackName,
              email: data.user.email || '',
              phone: fallbackPhone,
              role: 'customer',
              is_active: true,
              updated_at: new Date().toISOString(),
            });

            setUserProfile({
              id: data.user.id,
              name: fallbackName,
              email: data.user.email || '',
              phone: fallbackPhone,
              role: (data.user.user_metadata?.role as any) || 'customer',
            });
          }
        } catch {
          // Metadata fallback
        }
        showToast('Signed in to SECRETpresso', 'success');
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        showToast(error.message, 'error');
        return;
      }

      if (data.user) {
        // Ensure customer record is saved in public.profiles table
        try {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              role: 'customer',
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id);

          if (updateErr) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              role: 'customer',
              is_active: true,
              updated_at: new Date().toISOString(),
            });
          }
        } catch (profileErr) {
          console.warn('Profile sync notice:', profileErr);
        }

        showToast('Account created successfully!', 'success');
        setUserProfile({
          id: data.user.id,
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: 'customer',
        });
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        // Fallback demo for preview environment
        setUserProfile({
          name: 'Aarav Sharma',
          email: 'aarav.sharma@gmail.com',
          phone: '+91 98765 43210',
          avatarUrl:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          role: 'customer',
        });
        showToast('Signed in with Google', 'success');
        onClose();
      }
    } catch {
      showToast('Google OAuth redirected', 'info');
    }
  };

  const handleDemoSignIn = (role: 'customer' | 'admin' = 'customer') => {
    setUserProfile({
      name: role === 'admin' ? 'Master Roaster Admin' : 'Aarav Sharma',
      email: role === 'admin' ? 'admin@secretpresso.coffee' : 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      role,
    });
    showToast(`Signed in as ${role === 'admin' ? 'Admin' : 'Customer'}`, 'success');
    onClose();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
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
              {/* If Admin, show Admin Control Center button */}
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
            {/* Auth Mode Toggle */}
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
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide hover:bg-[#251B14] transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In with Supabase Auth'}
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
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
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#7A6E64] block mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#A89C8F] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D5CCC0] text-xs text-[#140F0B] focus:outline-none focus:border-[#140F0B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#140F0B] text-white text-xs font-semibold tracking-wide hover:bg-[#251B14] transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Supabase Profile'}
                </button>
              </form>
            )}

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E8DFD1]"></div>
              <span className="flex-shrink mx-3 text-[10px] text-[#A89C8F] uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-[#E8DFD1]"></div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-full bg-white border border-[#D5CCC0] hover:bg-[#FAF5EE] text-[#140F0B] text-xs font-semibold tracking-wide shadow-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('customer')}
                  className="flex-1 py-2 rounded-xl bg-[#FAF5EE] border border-[#E5DBCC] text-[#140F0B] text-[11px] font-semibold hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                >
                  Demo Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('admin')}
                  className="flex-1 py-2 rounded-xl bg-[#FAF5EE] border border-[#E5DBCC] text-[#C89B63] text-[11px] font-semibold hover:bg-[#F2ECE1] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#C89B63]" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
