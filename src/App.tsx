import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { CoffeeFlavoursGrid } from './components/CoffeeFlavoursGrid';
import { DynamicSection } from './components/DynamicSection';
import { PromotionalBanner } from './components/PromotionalBanner';
import { Footer } from './components/Footer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FloatingOrderBar } from './components/FloatingOrderBar';
import { TrackOrderView } from './components/TrackOrderView';
import { OurStoryView } from './components/OurStoryView';
import { CartView } from './components/CartView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductCustomizationModal } from './components/ProductCustomizationModal';
import { FixedMobileTopControls } from './components/mobile/FixedMobileTopControls';
import { MobileSearchBar } from './components/mobile/MobileSearchBar';
import { BottomNav } from './components/mobile/BottomNav';
import { AddressModal } from './components/mobile/AddressModal';
import { OffersModal } from './components/mobile/OffersModal';
import { AccountModal } from './components/mobile/AccountModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const {
    currentView,
    sections,
    products,
    isLoading,
    error,
    refreshData,
    toasts,
    dismissToast,
    settings,
    customizingProduct,
    editingCartItem,
    isCustomizationOpen,
    closeCustomizationModal,
  } = useApp();

  // Mobile modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex flex-col items-center justify-center text-[#f5f0eb] space-y-4">
        <div className="w-10 h-10 border-2 border-[#c89b63] border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-lg tracking-wider text-[#d6b07c]">SECRETPRESSO</p>
        <p className="text-xs text-[#8e7c6d]">Connecting to Roastery & Store Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0a08] flex flex-col items-center justify-center text-[#f5f0eb] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl text-[#fbf7f2]">Server Connection Error</h2>
        <p className="text-xs text-[#a49180] max-w-md">{error}</p>
        <button
          onClick={() => refreshData()}
          className="px-6 py-2.5 rounded-full bg-[#c89b63] text-[#100c08] text-xs font-semibold hover:bg-[#dfb780] transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Admin View
  if (currentView === 'admin') {
    return (
      <>
        <AdminDashboard />
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </>
    );
  }

  // Cart View
  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#140F0B] relative pb-20">
        <Navbar />
        <FixedMobileTopControls
          onOpenAddress={() => setIsAddressModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
        <CartView />
        <Footer />
        <CartDrawer />
        <FloatingCartBar />
        <BottomNav onOpenOffers={() => setIsOffersModalOpen(true)} />
        <ProductCustomizationModal
          product={customizingProduct}
          existingCartItem={editingCartItem}
          isOpen={isCustomizationOpen}
          onClose={closeCustomizationModal}
        />
        <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
        <OffersModal isOpen={isOffersModalOpen} onClose={() => setIsOffersModalOpen(false)} />
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onOpenAddress={() => setIsAddressModalOpen(true)}
        />
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </div>
    );
  }

  // Track Order View
  if (currentView === 'track-order') {
    return (
      <div className="min-h-screen bg-[#0d0a08] text-[#f5f0eb] relative pb-20">
        <Navbar />
        <FixedMobileTopControls
          onOpenAddress={() => setIsAddressModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
        <TrackOrderView />
        <Footer />
        <FloatingCartBar />
        <CartDrawer />
        <CheckoutModal />
        <BottomNav onOpenOffers={() => setIsOffersModalOpen(true)} />
        <ProductCustomizationModal
          product={customizingProduct}
          existingCartItem={editingCartItem}
          isOpen={isCustomizationOpen}
          onClose={closeCustomizationModal}
        />
        <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
        <OffersModal isOpen={isOffersModalOpen} onClose={() => setIsOffersModalOpen(false)} />
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onOpenAddress={() => setIsAddressModalOpen(true)}
        />
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </div>
    );
  }

  // Our Story View
  if (currentView === 'our-story') {
    return (
      <div className="min-h-screen bg-[#0d0a08] text-[#f5f0eb] relative pb-20">
        <Navbar />
        <FixedMobileTopControls
          onOpenAddress={() => setIsAddressModalOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
        />
        <OurStoryView />
        <Footer />
        <FloatingCartBar />
        <CartDrawer />
        <CheckoutModal />
        <FloatingOrderBar />
        <BottomNav onOpenOffers={() => setIsOffersModalOpen(true)} />
        <ProductCustomizationModal
          product={customizingProduct}
          existingCartItem={editingCartItem}
          isOpen={isCustomizationOpen}
          onClose={closeCustomizationModal}
        />
        <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
        <OffersModal isOpen={isOffersModalOpen} onClose={() => setIsOffersModalOpen(false)} />
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onOpenAddress={() => setIsAddressModalOpen(true)}
        />
        <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      </div>
    );
  }

  // Homepage View
  const visibleNonCoffeeSections = sections
    .filter((sec) => sec.isVisible && sec.id !== 'sec-coffee-flavours')
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const initialFoodSections = visibleNonCoffeeSections.filter(
    (sec) => (sec.displayOrder ?? 0) <= 6
  );
  const futureAdminSections = visibleNonCoffeeSections.filter(
    (sec) => (sec.displayOrder ?? 0) > 6
  );

  return (
    <div className="min-h-screen bg-[#0d0a08] text-[#f5f0eb] relative selection:bg-[#c89b63] selection:text-[#100c08] pb-20">
      {/* Desktop Navbar */}
      <Navbar />

      {/* Fixed Mobile Top Controls (Location + Account) */}
      <FixedMobileTopControls
        onOpenAddress={() => setIsAddressModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {/* Mobile Search Bar in Normal Flow */}
      <MobileSearchBar />

      {/* Auto-sliding Hero Banner Carousel */}
      <HeroCarousel />

      {/* Coffee Flavours (GRID) */}
      <CoffeeFlavoursGrid />

      {/* Initial Food Sections */}
      {initialFoodSections.map((sec) => {
        const secProducts = products.filter((p) => p.isVisible && p.sectionId === sec.id);
        return <DynamicSection key={sec.id} section={sec} products={secProducts} />;
      })}

      {/* Premium Full-Width Promotional Banner */}
      <PromotionalBanner />

      {/* Future Admin Sections */}
      {futureAdminSections.map((sec) => {
        const secProducts = products.filter((p) => p.isVisible && p.sectionId === sec.id);
        return <DynamicSection key={sec.id} section={sec} products={secProducts} />;
      })}

      {/* Luxury Editorial Dark Footer */}
      <Footer />

      {/* Floating Components */}
      <FloatingCartBar />
      <CartDrawer />
      <CheckoutModal />
      <FloatingOrderBar />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenOffers={() => setIsOffersModalOpen(true)} />

      {/* Modals */}
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
      <OffersModal isOpen={isOffersModalOpen} onClose={() => setIsOffersModalOpen(false)} />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onOpenAddress={() => setIsAddressModalOpen(true)}
      />

      {/* Product Customization Modal */}
      <ProductCustomizationModal
        product={customizingProduct}
        existingCartItem={editingCartItem}
        isOpen={isCustomizationOpen}
        onClose={closeCustomizationModal}
      />

      {/* Global Notification Toasts */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
};

// Toast notification component
const ToastContainer: React.FC<{
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  dismissToast: (id: string) => void;
}> = ({ toasts, dismissToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#151c14]/95 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-[#221010]/95 border-rose-500/40 text-rose-200'
              : 'bg-[#18130f]/95 border-[#443325] text-[#f5f0eb]'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-[#c89b63] shrink-0" />}
          <span className="leading-tight">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-0.5 hover:text-white ml-1 text-[#8e7c6d]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
}
