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
import { auth, db, onAuthStateChanged, doc, getDoc, User } from '../lib/firebase';

export type AppView = 'home' | 'our-brew' | 'my-secret' | 'our-story' | 'track-order' | 'cart' | 'admin';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role?: 'customer' | 'admin';
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

  // Delivery Address & User Profile
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  currentUser: User | null;

  // Modals
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: (open: boolean) => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
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

  // Cart Persistent State (survives refresh, navigation, and reopening)
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

  // Sync cart to localStorage whenever it changes
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

  // Delivery Address & User Profile
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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'customers', user.uid));
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            setUserProfile({
              id: user.uid,
              name: user.displayName || 'Secretpresso Customer',
              email: user.email || '',
              phone: user.phoneNumber || '',
              avatarUrl: user.photoURL || '',
              role: 'customer',
            });
          }
        } catch (e) {
          console.warn('Error fetching customer profile (fallback active):', e);
          setUserProfile({
            id: user.uid,
            name: user.displayName || 'Secretpresso Customer',
            email: user.email || '',
            phone: user.phoneNumber || '',
            avatarUrl: user.photoURL || '',
            role: 'customer',
          });
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Modals
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
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

  // Fetch Database Data
  const refreshData = useCallback(async () => {
    try {
      const data = await api.getBootstrap();
      setCategories(data.categories.sort((a, b) => a.displayOrder - b.displayOrder));
      setSections(data.sections.sort((a, b) => a.displayOrder - b.displayOrder));
      setProducts(data.products.sort((a, b) => a.displayOrder - b.displayOrder));
      setBanners(data.banners.sort((a, b) => a.displayOrder - b.displayOrder));
      setMedia(data.media);
      setOrders(data.orders);
      setSettings(data.settings);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bootstrap data:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Open Customization Modal
  const openCustomizationModal = useCallback(
    (product: Product, existingItem: CartItem | null = null) => {
      setCustomizingProduct(product);
      setEditingCartItem(existingItem);
      setIsCustomizationOpen(true);
    },
    []
  );

  const closeCustomizationModal = useCallback(() => {
    setIsCustomizationOpen(false);
    setCustomizingProduct(null);
    setEditingCartItem(null);
  }, []);

  // Intercept generic "Add to Cart" to open the Customization Modal
  const addToCart = useCallback(
    (product: Product) => {
      openCustomizationModal(product);
    },
    [openCustomizationModal]
  );

  // Add or update customized product in cart
  const addCustomizedToCart = useCallback(
    (
      product: Product,
      selectedCustomizations: SelectedCustomizationOption[],
      specialInstructions: string,
      quantity: number,
      existingCartItemId?: string
    ) => {
      const basePrice = product.salePrice ?? product.price;
      const customizationExtra = selectedCustomizations.reduce(
        (sum, item) => sum + item.priceAdjustment,
        0
      );
      const unitPrice = basePrice + customizationExtra;
      const totalPrice = unitPrice * quantity;

      setCart((prev) => {
        // If editing an existing cart item:
        if (existingCartItemId) {
          return prev.map((item) => {
            if (item.id === existingCartItemId) {
              return {
                ...item,
                selectedCustomizations,
                specialInstructions,
                quantity,
                unitPrice,
                totalPrice,
              };
            }
            return item;
          });
        }

        // Distinct line item logic: different customizations are separate items
        const signature = `${product.id}-${selectedCustomizations
          .map((c) => c.optionId)
          .sort()
          .join(',')}-${specialInstructions.trim().toLowerCase()}`;

        const existingIndex = prev.findIndex((item) => {
          const itemSig = `${item.product.id}-${item.selectedCustomizations
            .map((c) => c.optionId)
            .sort()
            .join(',')}-${(item.specialInstructions || '').trim().toLowerCase()}`;
          return itemSig === signature;
        });

        if (existingIndex !== -1) {
          const updated = [...prev];
          const found = updated[existingIndex];
          const newQty = found.quantity + quantity;
          updated[existingIndex] = {
            ...found,
            quantity: newQty,
            totalPrice: found.unitPrice * newQty,
          };
          return updated;
        }

        // Add as a new distinct cart item
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          product,
          quantity,
          selectedCustomizations,
          specialInstructions,
          unitPrice,
          totalPrice,
        };
        return [...prev, newItem];
      });

      if (existingCartItemId) {
        showToast(`Updated ${product.name} in your bag`, 'success');
      } else {
        showToast(`Added ${product.name} to your secret bag`, 'success');
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(cartItemId);
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          if (item.id === cartItemId) {
            return {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Cart Financials
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  const cartTax = useMemo(() => {
    return Math.round(cartSubtotal * 0.05 * 100) / 100; // 5% GST
  }, [cartSubtotal]);

  const cartDeliveryFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 499 ? 0 : 40; // Free delivery over ₹499
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTax + cartDeliveryFee;
  }, [cartSubtotal, cartTax, cartDeliveryFee]);

  return (
    <AppContext.Provider
      value={{
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
        deliveryAddress,
        setDeliveryAddress,
        userProfile,
        setUserProfile,
        currentUser,
        toasts,
        showToast,
        dismissToast,
        isAddressModalOpen,
        setIsAddressModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOffersModalOpen,
        setIsOffersModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
