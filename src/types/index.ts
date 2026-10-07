export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DisplayStyle = 'grid' | 'horizontal_slider';

export interface Section {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image?: string | null;
  displayStyle: DisplayStyle;
  displayOrder: number;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  detail?: string; // e.g. "(200 ml)", "(350 ml)", "(500 ml)"
  priceAdjustment: number;
  isDefault?: boolean;
}

export interface CustomizationGroup {
  id: string;
  name: string; // e.g. "Size", "Milk", "Add Ons", "Toppings"
  type: 'single' | 'multiple';
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: CustomizationOption[];
}

export interface SelectedCustomizationOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  image: string;
  additionalImages?: string[];
  categoryId: string;
  sectionId: string;
  productType: 'coffee' | 'food' | 'merch' | 'surprise';
  availability: boolean;
  displayOrder: number;
  isVisible: boolean;
  badge?: string;
  surpriseToyNote?: string;
  customizationGroups?: CustomizationGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerTextProps {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number; // in pixels
  lineHeight?: number;
  letterSpacing?: number;
  alignment: 'left' | 'center' | 'right';
  color: string;
  maxWidth?: number;
  visible: boolean;
}

export interface Banner {
  id: string;
  name: string;
  bannerType: 'hero' | 'promo' | 'section';
  image: string;
  heading: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  displayOrder: number;
  isVisible: boolean;
  slideDuration: number;
  textPositions: {
    desktop: BannerTextProps;
    tablet?: BannerTextProps;
    mobile?: BannerTextProps;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'hero' | 'banners' | 'coffee' | 'food' | 'collections' | 'other';
  size: number;
  mimeType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // Unique id for each customized instance
  product: Product;
  quantity: number;
  selectedCustomizations: SelectedCustomizationOption[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number; // final unit price
  basePrice?: number;
  quantity: number;
  image: string;
  surpriseToyNote?: string;
  selectedCustomizations?: SelectedCustomizationOption[];
  specialInstructions?: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'card' | 'upi';
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  announcement: string;
  currencySymbol: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  updatedAt?: string;
}

export interface BootstrapResponse {
  categories: Category[];
  sections: Section[];
  products: Product[];
  banners: Banner[];
  media: MediaItem[];
  orders: Order[];
  settings: WebsiteSettings;
}
