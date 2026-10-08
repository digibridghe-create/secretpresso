import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Coffee,
  LogOut,
  Package,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useApp, UserProfile } from '../context/AppContext';
import {
  auth,
  db,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, setUserProfile, showToast, setCurrentView } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Helper to sync or create customer document in Firestore
  const syncCustomerProfile = async (
    uid: string,
    email: string,
    name: string,
    photo?: string | null,
    providerStr: string = 'password'
  ) => {
    try {
      const ref = doc(db, 'customers', uid);
      const snap = await getDoc(ref);
      const now = new Date().toISOString();

      if (!snap.exists()) {
        const newProfile: UserProfile = {
          id: uid,
          name: name || 'Secretpresso Customer',
          email: email || '',
          phone: phone || '',
          avatarUrl: photo || '',
          role: 'customer',
        };
        await setDoc(ref, {
          ...newProfile,
          provider: providerStr,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        });
        setUserProfile(newProfile);
      } else {
        const existing = snap.data();
        const updated: UserProfile = {
          id: uid,
          name: name || existing.name || 'Secretpresso Customer',
          email: email || existing.email || '',
          phone: existing.phone || phone || '',
          avatarUrl: photo || existing.avatarUrl || '',
          role: 'customer',
        };
        await updateDoc(ref, {
          ...existing,
          ...updated,
          lastLoginAt: now,
          updatedAt: now,
        });
        setUserProfile(updated);
      }
    } catch (err) {
      console.warn('Error syncing customer profile to Firestore (using local state fallback):', err);
      setUserProfile({
        id: uid,
        name: name || 'Secretpresso Customer',
        email: email || '',
        phone: phone || '',
        avatarUrl: photo || '',
        role: 'customer',
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await syncCustomerProfile(cred.user.uid, email, fullName, cred.user.photoURL, 'password');
        showToast('Account created successfully! Welcome to Secretpresso.', 'success');
        onClose();
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await syncCustomerProfile(
          cred.user.uid,
          cred.user.email || email,
          cred.user.displayName || fullName || 'Secretpresso Customer',
          cred.user.photoURL,
          'password'
        );
        showToast('Successfully signed in!', 'success');
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Something went wrong. Please try again.';
      const code = err?.code || '';
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        msg = 'Email or password is incorrect.';
      } else if (code.includes('email-already-in-use')) {
        msg = 'An account with this email already exists.';
      } else if (code.includes('weak-password')) {
        msg = 'Password must be at least 6 characters.';
      } else if (code.includes('invalid-email')) {
        msg = 'Please enter a valid email address.';
      } else if (code.includes('unauthorized-domain')) {
        msg = `Domain '${currentHostname}' is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.`;
      } else if (code.includes('operation-not-allowed')) {
        msg = 'Email/Password sign-in is not enabled in Firebase Console.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await syncCustomerProfile(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || 'Google Customer',
        cred.user.photoURL,
        'google'
      );
      showToast('Successfully signed in with Google!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg('Google sign-in was cancelled.');
      } else if (code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMsg(`Domain '${currentHostname}' is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.`);
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg('Google sign-in provider is not enabled in Firebase Console.');
      } else {
        setErrorMsg(`Domain '${currentHostname}' must be authorized in Firebase Console under Authentication > Settings > Authorized domains.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const cred = await signInWithPopup(auth, provider);
      await syncCustomerProfile(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || 'Apple Customer',
        cred.user.photoURL,
        'apple'
      );
      showToast('Successfully signed in with Apple!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Apple auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg('Apple sign-in was cancelled.');
      } else if (code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMsg(`Domain '${currentHostname}' is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.`);
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg('Apple sign-in provider is not enabled in Firebase Console.');
      } else {
        setErrorMsg(`Domain '${currentHostname}' must be authorized in Firebase Console under Authentication > Settings > Authorized domains.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address first.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Reset error:', err);
      setErrorMsg('Could not send password reset email. Please verify the email address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out successfully.', 'info');
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#e8dfd1] overflow-hidden flex flex-col"
        style={{ backgroundColor: '#fcf8f2', color: '#140f0b' }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eae2d5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#140f0b] text-[#fcf8f2] flex items-center justify-center">
              <Coffee className="w-4 h-4 text-[#c89b63]" />
            </div>
            <span className="font-serif text-lg font-bold tracking-[0.16em] text-[#140f0b]">
              SECRET<span className="text-[#c89b63]">presso</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7a6e64] hover:text-[#140f0b] hover:bg-[#f0ebe1] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[82vh] no-scrollbar">
          {currentUser ? (
            // Authenticated Account View
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#140f0b] text-[#c89b63] flex items-center justify-center text-2xl font-serif font-bold shadow-md border-2 border-[#c89b63]">
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    (userProfile?.name || currentUser.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#140f0b]">
                  {userProfile?.name || 'Valued Collector'}
                </h3>
                <p className="text-xs text-[#7a6e64]">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c89b63]/20 text-[#8c6534] border border-[#c89b63]/30 uppercase tracking-wider">
                  Verified Member
                </span>
              </div>

              {/* Quick Actions / Links */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setCurrentView('track-order');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#e5dbcc] hover:border-[#c89b63] transition-colors text-xs font-semibold text-[#140f0b]"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#c89b63]" />
                    <span>Track Active Order & Collectible Vault</span>
                  </div>
                  <span className="text-[#7a6e64]">→</span>
                </button>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full py-3.5 rounded-2xl bg-[#140f0b] hover:bg-[#2a1f17] text-[#fcf8f2] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-[#c89b63]" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : mode === 'forgot' ? (
            // Forgot Password View
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-[#140f0b]">Reset Password</h3>
                <p className="text-xs text-[#7a6e64]">
                  Enter your email address and we will send you a link to reset your password.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4a3e36]">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#8c7a6b]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#e0d5c5] focus:border-[#c89b63] focus:ring-1 focus:ring-[#c89b63]/30 text-xs text-[#140f0b] placeholder-[#8c7a6b] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#140f0b] hover:bg-[#2a1f17] text-[#fcf8f2] text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#8c6534] hover:text-[#140f0b] pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          ) : (
            // Sign In / Sign Up View
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#140f0b]">
                  {mode === 'signup' ? 'Create Account' : 'Sign in'}
                </h3>
                <p className="text-xs text-[#7a6e64]">
                  {mode === 'signup'
                    ? 'Join Secretpresso to collect secret figurines & enjoy specialty brews'
                    : 'Welcome back to your Secretpresso experience'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4a3e36]">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-[#8c7a6b]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#e0d5c5] focus:border-[#c89b63] focus:ring-1 focus:ring-[#c89b63]/30 text-xs text-[#140f0b] placeholder-[#8c7a6b] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4a3e36]">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#8c7a6b]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#e0d5c5] focus:border-[#c89b63] focus:ring-1 focus:ring-[#c89b63]/30 text-xs text-[#140f0b] placeholder-[#8c7a6b] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4a3e36]">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] font-semibold text-[#8c6534] hover:text-[#140f0b]"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#8c7a6b]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full h-11 pl-10 pr-12 rounded-xl bg-white border border-[#e0d5c5] focus:border-[#c89b63] focus:ring-1 focus:ring-[#c89b63]/30 text-xs text-[#140f0b] placeholder-[#8c7a6b] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 text-[11px] font-bold text-[#8c7a6b] hover:text-[#140f0b]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4a3e36]">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-[#8c7a6b]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#e0d5c5] focus:border-[#c89b63] focus:ring-1 focus:ring-[#c89b63]/30 text-xs text-[#140f0b] placeholder-[#8c7a6b] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-[#140f0b] hover:bg-[#2a1f17] text-[#fcf8f2] text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#c89b63] border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span>{mode === 'signup' ? 'Create Account' : 'Sign in'}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2d6c6]" />
                </div>
                <span className="relative px-3 bg-[#fcf8f2] text-[11px] uppercase tracking-wider font-bold text-[#8c7a6b]">
                  OR
                </span>
              </div>

              {/* Social Auth Buttons — ALWAYS VISIBLY RENDERED */}
              <div className="space-y-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-xl bg-white hover:bg-[#faf5ee] border border-[#e0d5c5] text-[#140f0b] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.14v3.15C3.15 21.32 7.23 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.14C.41 8.12 0 9.81 0 12s.41 3.88 1.14 5.4l4.14-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.15 2.68 1.14 6.6l4.14 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={handleAppleAuth}
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-xl bg-white hover:bg-[#faf5ee] border border-[#e0d5c5] text-[#140f0b] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-[#140f0b]" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.44-.61.7-1.14 1.81-1 2.91 1.08.08 2.19-.57 2.85-1.36z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>

              {/* Mode Toggle Footer */}
              <div className="pt-2 text-center">
                {mode === 'signup' ? (
                  <p className="text-xs text-[#7a6e64]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMsg(null);
                      }}
                      className="font-bold text-[#8c6534] hover:text-[#140f0b] underline"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-[#7a6e64]">
                    New to Secretpresso?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMsg(null);
                      }}
                      className="font-bold text-[#8c6534] hover:text-[#140f0b] underline"
                    >
                      Create Account
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
