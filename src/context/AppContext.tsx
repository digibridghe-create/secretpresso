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

export type AppView = 'home' | 'our-brew' | 'my-secret' | 'our-story' | 'track-order' | 'cart' | 'admin';

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
}

const AppContext = createContext<AppContextType | null>(null);

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

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
  const openCustomizationModal = useCallback((product: Product, existingItem: CartItem | null = null) => {
    setCustomizingProduct(product);
    setEditingCartItem(existingItem);
    setIsCustomizationOpen(true);
  }, []);

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

        // Check if an item with the EXACT same customizations already exists
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
        toasts,
        showToast,
        dismissToast,
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
