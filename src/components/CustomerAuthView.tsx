import React, { useState } from 'react';
import {
  User,
  LogOut,
  Package,
  MapPin,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  Coffee,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import heroLatteImage from '../assets/images/hero_latte_collectible_1791216830274.jpg';

export const CustomerAuthView: React.FC = () => {
  const {
    userProfile,
    setUserProfile,
    orders,
    setCurrentView,
    showToast,
    setIsAddressModalOpen,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your email address and password.');
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
      showToast('Signed in successfully', 'success');
      setCurrentView('home');
    }, 600);
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
      setCurrentView('home');
    }, 600);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setResetSent(true);
      showToast('Password reset link sent to your email.', 'success');
    }, 600);
  };

  const handleSignOut = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('secretpresso_user');
    } catch {}
    showToast('Signed out successfully', 'info');
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#fdf9f4] text-[#2c1d11] flex flex-col justify-between selection:bg-[#c89b63] selection:text-[#fdf9f4]">
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-xs font-semibold text-[#5a4a3e] hover:text-[#2c1d11] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#c89b63]" />
          <span>Return to Storefront</span>
        </button>

        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-[#c89b63]" />
          <span className="font-serif font-bold tracking-[0.16em] text-[#2c1d11] text-sm">
            SECRETPRESSO
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-[#efe6db] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#1b140f] text-[#fbf7f2] overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src={heroLatteImage}
                alt="Secretpresso Atelier"
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100c08] via-[#15100c]/80 to-transparent" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#c89b63]/20 border border-[#c89b63]/40 flex items-center justify-center text-[#c89b63]">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-[10px] tracking-[0.25em] font-semibold uppercase text-[#c89b63]">
                The Secret Collection
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#fbf7f2]">
                Sip. Discover. Collect.
              </h2>
            </div>

            <div className="relative z-10 space-y-4 pt-12">
              <blockquote className="font-serif italic text-sm text-[#e8ded3] leading-relaxed">
                "Every cup of specialty roast hides a secret treasure. Sign in to track your orders, manage saved delivery addresses, and unlock exclusive roaster reserves."
              </blockquote>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-2 h-2 rounded-full bg-[#c89b63]" />
                <span className="text-[11px] font-mono text-[#a49180]">
                  SECRETpresso Atelier & Roastery
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
            {userProfile ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider text-[#c89b63] uppercase">
                    Member Lounge
                  </span>
                  <h1 className="font-serif text-3xl font-medium text-[#2c1d11]">
                    Welcome, {userProfile.name}
                  </h1>
                  <p className="text-xs text-[#7d6b5b]">
                    Manage your profile, saved addresses, and active orders.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fdf9f4] border border-[#efe6db] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#2c1d11]">{userProfile.name}</p>
                      <p className="text-[11px] text-[#7d6b5b]">{userProfile.email}</p>
                    </div>
                    <span className="text-[10px] uppercase px-2.5 py-1 rounded-full bg-[#c89b63]/20 text-[#8c6530] font-semibold border border-[#c89b63]/40">
                      {userProfile.role === 'admin' ? 'Master Admin' : 'Secret Member'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {userProfile.role === 'admin' && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="w-full p-3.5 rounded-2xl bg-[#2c1d11] text-[#fbf7f2] flex items-center justify-between hover:bg-[#3d2818] transition-colors cursor-pointer text-xs font-semibold shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4 text-[#c89b63]" />
                        <span>CMS & Admin Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#c89b63]" />
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentView('track-order')}
                    className="w-full p-3.5 rounded-2xl bg-[#fdfaf6] hover:bg-[#f7f0e6] border border-[#efe6db] flex items-center justify-between transition-colors cursor-pointer text-xs font-semibold text-[#2c1d11]"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-[#c89b63]" />
                      <span>My Orders & Tracking ({orders.length})</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8c6530]" />
                  </button>

                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="w-full p-3.5 rounded-2xl bg-[#fdfaf6] hover:bg-[#f7f0e6] border border-[#efe6db] flex items-center justify-between transition-colors cursor-pointer text-xs font-semibold text-[#2c1d11]"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#c89b63]" />
                      <span>Saved Delivery Addresses</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8c6530]" />
                  </button>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full py-3.5 rounded-full bg-[#f9f2eb] hover:bg-[#f0e4d6] text-rose-800 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h1 className="font-serif text-3xl font-medium text-[#2c1d11]">
                    {authMode === 'forgot'
                      ? 'Reset Password'
                      : authMode === 'signup'
                      ? 'Create Account'
                      : 'Welcome Back'}
                  </h1>
                  <p className="text-xs text-[#7d6b5b]">
                    {authMode === 'forgot'
                      ? 'Enter your email to receive a password reset link.'
                      : authMode === 'signup'
                      ? 'Register to start collecting secret figurines with every brew.'
                      : 'Sign in to continue your Secretpresso experience.'}
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {resetSent ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                      ✓
                    </div>
                    <p className="font-serif text-lg font-medium">Check your email for a password reset link.</p>
                    <button
                      onClick={() => {
                        setResetSent(false);
                        setAuthMode('signin');
                      }}
                      className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : authMode === 'forgot' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-[#2c1d11] hover:bg-[#3d2818] text-[#fbf7f2] text-xs font-semibold tracking-wide transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setAuthError(null);
                        }}
                        className="text-xs text-[#c89b63] hover:underline font-semibold cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : authMode === 'signup' ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-[#a49180] hover:text-[#2c1d11]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-[#2c1d11] hover:bg-[#3d2818] text-[#fbf7f2] text-xs font-semibold tracking-wide transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="text-center pt-2 text-xs text-[#7d6b5b]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setAuthError(null);
                        }}
                        className="text-[#c89b63] font-semibold hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5a4a3e] block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-[#5a4a3e]">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setAuthError(null);
                          }}
                          className="text-[11px] font-semibold text-[#c89b63] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#a49180] absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#d5ccc0] text-xs text-[#2c1d11] placeholder-[#a49180] focus:outline-none focus:border-[#2c1d11] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-[#a49180] hover:text-[#2c1d11]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-full bg-[#2c1d11] hover:bg-[#3d2818] text-[#fbf7f2] text-xs font-semibold tracking-wide transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="text-center pt-2 text-xs text-[#7d6b5b]">
                      New to Secretpresso?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthError(null);
                        }}
                        className="text-[#c89b63] font-semibold hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
