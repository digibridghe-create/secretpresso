import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Category,
  Section,
  Product,
  Banner,
  MediaItem,
  Order,
  WebsiteSettings,
  CartItem,
  SelectedCustomizationOption,
} from '../types';
import { api } from '../services/api';

export type AppView = 'home' | 'our-brew' | 'our-story' | 'track-order' | 'cart' | 'admin';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Store data from DB
  categories: Category[];
  sections: Section[];
  products: Product[];
  banners: Banner[];
  media: MediaItem[];
  orders: Order[];
  settings: WebsiteSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addCustomizedToCart: (
    product: Product,
    selectedCustomizations: SelectedCustomizationOption[],
    specialInstructions: string,
    quantity: number,
    existingCartItemId?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartDeliveryFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Customization Modal State
  customizingProduct: Product | null;
  editingCartItem: CartItem | null;
  isCustomizationOpen: boolean;
  openCustomizationModal: (product: Product, existingCartItem?: CartItem | null) => void;
  closeCustomizationModal: () => void;

  // Active Order & Tracking
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;

  // View / Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;

  // Feedback Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Delivery Address
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;

  // Modals
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;
  isOffersModalOpen: boolean;
  setIsOffersModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const CART_STORAGE_KEY = 'secretpresso_cart';
const ADDRESS_STORAGE_KEY = 'secretpresso_address';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart Persistent State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved cart from localStorage:', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (e) {
      console.warn('Could not write cart to localStorage:', e);
    }
  }, [cart]);

  // Customization Modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // Active Order Tracking
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Navigation
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');

  // Delivery Address
  const [deliveryAddress, setDeliveryAddressState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
        if (saved) return saved;
      }
    } catch (e) {
      console.warn('Could not read address from localStorage:', e);
    }
    return 'Home • 135/10 Vivekanand College, Bengaluru';
  });

  const setDeliveryAddress = useCallback((addr: string) => {
    setDeliveryAddressState(addr);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADDRESS_STORAGE_KEY, addr);
      }
    } catch (e) {
      console.warn('Could not save address to localStorage:', e);
    }
  }, []);

  // Fetch initial data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [cats, secs, prods, bans, meds, ords, sets] = await Promise.all([
        api.getCategories(),
        api.getSections(),
        api.getProducts(),
        api.getBanners(),
        api.getMedia(),
        api.getOrders(),
        api.getSettings(),
      ]);
      setCategories(cats);
      setSections(secs);
      setProducts(prods);
      setBanners(bans);
      setMedia(meds);
      setOrders(ords);
      setSettings(sets);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Cart actions
  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && (!item.customizations || item.customizations.length === 0)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { id: `cart-${Date.now()}-${Math.random()}`, product, quantity, customizations: [], specialInstructions: '' }];
    });
    showToast(`Added ${product.name} to bag`, 'success');
  }, []);

  const addCustomizedToCart = useCallback(
    (
      product: Product,
      selectedCustomizations: SelectedCustomizationOption[],
      specialInstructions: string,
      quantity: number,
      existingCartItemId?: string
    ) => {
      setCart((prev) => {
        if (existingCartItemId) {
          return prev.map((item) =>
            item.id === existingCartItemId
              ? { ...item, product, customizations: selectedCustomizations, specialInstructions, quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random()}`,
            product,
            quantity,
            customizations: selectedCustomizations,
            specialInstructions,
          },
        ];
      });
      showToast(`Added ${product.name} to bag`, 'success');
    },
    []
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Removed item from bag', 'info');
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Cart calculations
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const base = item.product.salePrice || item.product.price;
      const customTotal = item.customizations?.reduce((cSum, c) => cSum + (c.priceModifier || 0), 0) || 0;
      return sum + (base + customTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const cartTax = useMemo(() => Math.round(cartSubtotal * 0.05), [cartSubtotal]);
  const cartDeliveryFee = useMemo(() => (cartSubtotal > 499 ? 0 : 49), [cartSubtotal]);
  const cartTotal = useMemo(() => cartSubtotal + cartTax + cartDeliveryFee, [cartSubtotal, cartTax, cartDeliveryFee]);

  // Customization modal actions
  const openCustomizationModal = useCallback((product: Product, existingCartItem: CartItem | null = null) => {
    setCustomizingProduct(product);
    setEditingCartItem(existingCartItem);
    setIsCustomizationOpen(true);
  }, []);

  const closeCustomizationModal = useCallback(() => {
    setCustomizingProduct(null);
    setEditingCartItem(null);
    setIsCustomizationOpen(false);
  }, []);

  // Modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories,
      sections,
      products,
      banners,
      media,
      orders,
      settings,
      isLoading,
      error,
      refreshData,
      cart,
      addToCart,
      addCustomizedToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      cartTax,
      cartDeliveryFee,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      customizingProduct,
      editingCartItem,
      isCustomizationOpen,
      openCustomizationModal,
      closeCustomizationModal,
      activeOrder,
      setActiveOrder,
      trackingOrderId,
      setTrackingOrderId,
      currentView,
      setCurrentView,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      toasts,
      showToast,
      dismissToast,
      deliveryAddress,
      setDeliveryAddress,
      isAddressModalOpen,
      setIsAddressModalOpen,
      isOffersModalOpen,
      setIsOffersModalOpen,
    }),
    [
      categories,
      sections,
      products,
      banners,
      media,
      orders,
      settings,
      isLoading,
      error,
      refreshData,
      cart,
      addToCart,
      addCustomizedToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      cartTax,
      cartDeliveryFee,
      cartTotal,
      isCartOpen,
      isCheckoutOpen,
      customizingProduct,
      editingCartItem,
      isCustomizationOpen,
      openCustomizationModal,
      closeCustomizationModal,
      activeOrder,
      trackingOrderId,
      currentView,
      searchQuery,
      selectedCategory,
      toasts,
      showToast,
      dismissToast,
      deliveryAddress,
      setDeliveryAddress,
      isAddressModalOpen,
      isOffersModalOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
