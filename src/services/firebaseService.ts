import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updatedoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, uploadToFirebaseStorage } from '../lib/firebase';
import {
  Section,
  Product,
  Category,
  Banner,
  MediaItem,
  Order,
  WebsiteSettings,
  BootstrapResponse,
} from '../types';

// Initial Seed Data for Firestore when empty
const initialCategories = [
  { id: 'cat-all', name: 'All Brews', description: 'Complete coffee catalogue', displayOrder: 1, isVisible: true },
  { id: 'cat-espresso', name: 'Espresso & Hot', description: 'Intense extractions and velvety steamed milk', displayOrder: 2, isVisible: true },
  { id: 'cat-iced', name: 'Iced & Cold Brew', description: 'Steeped for 18 hours, crisp & refreshing', displayOrder: 3, isVisible: true },
  { id: 'cat-signature', name: 'Signature Infusions', description: 'Specialty house concoctions with surprise toys', displayOrder: 4, isVisible: true },
  { id: 'cat-beans', name: 'Beans & Roast', description: 'Whole-bean single origin and reserve blends', displayOrder: 5, isVisible: true },
];

const initialSections = [
  { id: 'sec-coffee-flavours', name: 'Coffee Flavours', subtitle: 'From classic favourites to exciting new blends, choose your perfect cup. Each one comes with a surprise inside.', description: 'The foundation of SECRETpresso. Pure Arabica, small-batch roasted.', displayStyle: 'grid', displayOrder: 1, isVisible: true },
  { id: 'sec-velvet-sweets', name: 'Velvet Sweets', subtitle: 'Delicate layers, rich textures and little moments of indulgence.', description: 'Handcrafted desserts created to pair seamlessly with our dark roasts.', displayStyle: 'horizontal_slider', displayOrder: 2, isVisible: true },
  { id: 'sec-chocolate-atelier', name: 'Chocolate Atelier', subtitle: 'Deep cocoa, decadent textures and handcrafted sweetness.', description: 'Single-origin chocolates crafted with precision and passion.', displayStyle: 'horizontal_slider', displayOrder: 3, isVisible: true },
  { id: 'sec-glazed-moments', name: 'Glazed Moments', subtitle: 'Freshly glazed, beautifully indulgent.', description: 'Fluffy brioche dough proofed overnight and finished with artisanal glazes.', displayStyle: 'horizontal_slider', displayOrder: 4, isVisible: true },
  { id: 'sec-from-the-kitchen', name: 'From The Kitchen', subtitle: 'Warm, comforting bites made to pair perfectly with your coffee.', description: 'Savoury delights, toasted breads, and gourmet sandwiches.', displayStyle: 'horizontal_slider', displayOrder: 5, isVisible: true },
  { id: 'sec-crisp-and-golden', name: 'Crisp & Golden', subtitle: 'Golden, crispy sides made for every coffee break.', description: 'Crisped to perfection with house rosemary & smoked salt.', displayStyle: 'horizontal_slider', displayOrder: 6, isVisible: true },
];

const initialProducts = [
  { id: 'prod-americano', name: 'Classic Americano', description: 'Bold · Smooth · Timeless. Two ristretto shots topped with hot mineral water.', price: 149, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-espresso', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 1, isVisible: true, badge: 'Surprise Included', surpriseToyNote: 'Series 1 Barista Bear figurine included' },
  { id: 'prod-vanilla-latte', name: 'Vanilla Latte', description: 'Creamy · Sweet · Classic. Madagascar vanilla bean syrup folded into microfoam.', price: 179, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-espresso', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 2, isVisible: true, badge: 'Bestseller', surpriseToyNote: 'Mystery Coffee Capsule with collectible keychain' },
  { id: 'prod-caramel-latte', name: 'Caramel Latte', description: 'Rich · Buttery · Indulgent. Slow-cooked salted caramel with dark espresso.', price: 189, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-espresso', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 3, isVisible: true, badge: 'Popular', surpriseToyNote: 'Limited edition golden bear charm' },
  { id: 'prod-mocha', name: 'Mocha', description: 'Chocolatey · Bold · Cozy. Dutch cocoa melted into double espresso & whole milk.', price: 179, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-espresso', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 4, isVisible: true, badge: 'Surprise Inside', surpriseToyNote: 'Mini espresso tamper figurine' },
  { id: 'prod-hazelnut-latte', name: 'Hazelnut Latte', description: 'Nutty · Smooth · Aromatic. Roasted Piedmont hazelnut paste with velvety steamed milk.', price: 189, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-espresso', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 5, isVisible: true, badge: 'Favorite', surpriseToyNote: 'Barista cat with mini portafilter' },
  { id: 'prod-signature-coldbrew', name: 'SECRET Cold Brew Reserve', description: 'Steeped for 20 hours over Ethiopian beans. Notes of stone fruit and raw honey.', price: 199, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-iced', sectionId: 'sec-coffee-flavours', productType: 'coffee', availability: true, displayOrder: 6, isVisible: true, badge: 'Exclusive', surpriseToyNote: 'Cold brew dropper miniature' },
  { id: 'prod-tiramisu', name: 'Our Signature Tiramisu', description: 'Layers of rich mascarpone, coffee-soaked biscuits and a hint of cocoa.', price: 249, salePrice: 229, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-velvet-sweets', productType: 'food', availability: true, displayOrder: 1, isVisible: true, badge: 'Chef Signature' },
  { id: 'prod-espresso-pannacotta', name: 'Espresso Panna Cotta', description: 'Silky cream infused with vanilla bean and topped with a glistening espresso jelly gelee.', price: 219, salePrice: null, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-velvet-sweets', productType: 'food', availability: true, displayOrder: 2, isVisible: true },
  { id: 'prod-cannoli', name: 'Sicilian Espresso Cannoli', description: 'Crisp pastry shell piped with sweetened ricotta, mini chocolate chips and orange zest.', price: 189, salePrice: null, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-velvet-sweets', productType: 'food', availability: true, displayOrder: 3, isVisible: true },
  { id: 'prod-chocolate-mousse', name: '70% Dark Chocolate Mousse', description: 'Airy, rich Guanaja dark chocolate mousse with Maldon sea salt and cocoa nib crisp.', price: 229, salePrice: null, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-chocolate-atelier', productType: 'food', availability: true, displayOrder: 1, isVisible: true, badge: 'Decadent' },
  { id: 'prod-chocolate-brownie', name: 'Fudge Walnut Brownie', description: 'Ultra-fudgy warm brownie with roasted walnuts and dark chocolate drizzle.', price: 199, salePrice: null, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-chocolate-atelier', productType: 'food', availability: true, displayOrder: 2, isVisible: true },
  { id: 'prod-cocoa-truffles', name: 'Espresso Ganache Truffles', description: 'Trio of hand-rolled dark truffles dusted in roasted single-origin cocoa powder.', price: 169, salePrice: null, image: '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-chocolate-atelier', productType: 'food', availability: true, displayOrder: 3, isVisible: true },
  { id: 'prod-artisanal-donuts', name: 'Classic Honey-Vanilla Glazed Donut', description: 'Feather-light yeast donut with pure clover honey and Tahitian vanilla glaze.', price: 129, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-glazed-moments', productType: 'food', availability: true, displayOrder: 1, isVisible: true },
  { id: 'prod-pistachio-donut', name: 'Pistachio Crumble Glazed Donut', description: 'Brioche ring dipped in pistachio white chocolate glaze and crushed roasted kernels.', price: 149, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-glazed-moments', productType: 'food', availability: true, displayOrder: 2, isVisible: true },
  { id: 'prod-caramel-beignets', name: 'Cinnamon Caramel Beignets (3 pcs)', description: 'Pillow-soft golden beignets tossed in cinnamon sugar with salted caramel dip.', price: 169, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-glazed-moments', productType: 'food', availability: true, displayOrder: 3, isVisible: true },
  { id: 'prod-garlic-bread', name: 'Artisan Toasted Garlic Bread', description: 'Crisp sourdough baguette smothered in confit garlic butter and fresh garden herbs.', price: 159, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-from-the-kitchen', productType: 'food', availability: true, displayOrder: 1, isVisible: true },
  { id: 'prod-truffle-sandwich', name: 'Truffle Mushroom Melt Sandwich', description: 'Pan-seared forest mushrooms, aged gruyère, and truffle aioli on toasted brioche.', price: 249, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-from-the-kitchen', productType: 'food', availability: true, displayOrder: 2, isVisible: true, badge: 'Popular' },
  { id: 'prod-brioche-burger', name: 'Gourmet Cafe Burger', description: 'Charred patty, caramelized onions, smoked cheddar and secret burger sauce.', price: 289, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-from-the-kitchen', productType: 'food', availability: true, displayOrder: 3, isVisible: true },
  { id: 'prod-chicken-sandwich', name: 'Herb Grilled Chicken Sandwich', description: 'Rosemary-marinated chicken breast, sun-dried tomatoes and basil pesto on ciabatta.', price: 269, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-from-the-kitchen', productType: 'food', availability: true, displayOrder: 4, isVisible: true },
  { id: 'prod-french-fries', name: 'Sea Salt French Fries', description: 'Thin-cut golden fries tossed in coarse sea salt and served with smoked paprika dip.', price: 139, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-crisp-and-golden', productType: 'food', availability: true, displayOrder: 1, isVisible: true },
  { id: 'prod-truffle-parmesan-fries', name: 'Truffle & Parmesan Fries', description: 'Hand-cut russet fries drizzled with white truffle oil and grated 24-month Parmigiano.', price: 189, salePrice: null, image: '/uploads/hero_latte_collectible_1791216830274.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-crisp-and-golden', productType: 'food', availability: true, displayOrder: 2, isVisible: true, badge: 'Best Pairing' },
  { id: 'prod-crispy-potato-wedges', name: 'Spiced Crispy Potato Wedges', description: 'Seasoned rustic potato wedges with garlic sour cream and fresh chives.', price: 159, salePrice: null, image: '/uploads/hero_secretpresso_banner_1791216817348.jpg', additionalImages: [], categoryId: 'cat-signature', sectionId: 'sec-crisp-and-golden', productType: 'food', availability: true, displayOrder: 3, isVisible: true },
];

const initialBanners = [
  {
    id: 'ban-hero-1',
    name: 'Main Hero — Good Coffee, Great Surprise',
    bannerType: 'hero',
    image: '/uploads/hero_secretpresso_banner_1791216817348.jpg',
    heading: 'Good Coffee.\nGreat Surprise.',
    subtitle: 'MORE THAN JUST COFFEE',
    description: 'Every cup is a new adventure. Enjoy premium specialty coffee and discover a collectible toy hidden inside.',
    ctaText: 'Explore Our Menu',
    ctaLink: '#coffee-flavours',
    displayOrder: 1,
    isVisible: true,
    slideDuration: 5,
    textPositions: {
      desktop: { x: 8, y: 26, fontSize: 52, lineHeight: 1.15, alignment: 'left', color: '#ffffff', visible: true },
      tablet: { x: 6, y: 22, fontSize: 38, alignment: 'left', color: '#ffffff', visible: true },
      mobile: { x: 5, y: 18, fontSize: 28, alignment: 'left', color: '#ffffff', visible: true },
    },
  },
  {
    id: 'ban-hero-2',
    name: 'Second Hero — Handcrafted Roasts & Collectibles',
    bannerType: 'hero',
    image: '/uploads/hero_latte_collectible_1791216830274.jpg',
    heading: 'Handcrafted Roasts.\nLittle Treasures.',
    subtitle: 'THE SECRET COLLECTION',
    description: 'Artisanal espresso paired with exclusive limited edition figurines. Collect them all with every brew.',
    ctaText: 'Discover The Surprise',
    ctaLink: '#sec-velvet-sweets',
    displayOrder: 2,
    isVisible: true,
    slideDuration: 5,
    textPositions: {
      desktop: { x: 8, y: 28, fontSize: 48, lineHeight: 1.15, alignment: 'left', color: '#ffffff', visible: true },
      tablet: { x: 6, y: 24, fontSize: 36, alignment: 'left', color: '#ffffff', visible: true },
      mobile: { x: 5, y: 20, fontSize: 26, alignment: 'left', color: '#ffffff', visible: true },
    },
  },
  {
    id: 'ban-promo-1',
    name: "What's Inside Collectible Showcase Banner",
    bannerType: 'promo',
    image: '/uploads/promo_collectible_toys_1791216844306.jpg',
    heading: "What's Inside?",
    subtitle: 'THE SURPRISE EXPERIENCE',
    description: 'Every cup hides a collectible toy or mini figurine. From cute barista animal characters to rare season editions — collect them all!',
    ctaText: 'Discover The Collection',
    ctaLink: '#coffee-flavours',
    displayOrder: 1,
    isVisible: true,
    slideDuration: 6,
    textPositions: {
      desktop: { x: 52, y: 26, fontSize: 44, lineHeight: 1.2, alignment: 'left', color: '#ffffff', visible: true },
      tablet: { x: 48, y: 20, fontSize: 32, alignment: 'left', color: '#ffffff', visible: true },
      mobile: { x: 6, y: 16, fontSize: 26, alignment: 'left', color: '#ffffff', visible: true },
    },
  },
];

const initialSettings = {
  brandName: 'SECRETpresso',
  tagline: 'Good Coffee. Great Surprise.',
  announcement: 'Complimentary Secret Collectible Toy with every Specialty Brew order today!',
  currencySymbol: '₹',
  phone: '+91 98200 45678',
  email: 'concierge@secretpresso.coffee',
  address: 'SECRETpresso Atelier & Roastery, 12 Kensington Boulevard, Bangalore, India',
  socialLinks: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', twitter: 'https://twitter.com' },
  mobileSearchSuggestions: [
    'Search for coffee...',
    'Search for burgers...',
    'Search for desserts...',
    'Search for tiramisu...',
    'Search for brownies...',
    'Search for iced coffee...',
    'Search for fries...',
    'Search for sandwiches...',
    'Search for donuts...',
  ],
};

async function ensureSeededCollection(colName: string, items: any[]) {
  const colRef = collection(db, colName);
  const snap = await getDocs(colRef);
  if (snap.empty) {
    for (const item of items) {
      const { id, ...data } = item;
      await setDoc(doc(db, colName, id), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export const firebaseService = {
  async checkConnection(): Promise<{ connected: boolean; tablesExist: boolean }> {
    try {
      const snap = await getDocs(query(collection(db, 'products'), limit(1)));
      return { connected: true, tablesExist: true };
    } catch (err) {
      console.warn('Firestore connection check notice:', err);
      return { connected: false, tablesExist: false };
    }
  },

  async getBootstrap(): Promise<BootstrapResponse> {
    try {
      await Promise.all([
        ensureSeededCollection('categories', initialCategories),
        ensureSeededCollection('sections', initialSections),
        ensureSeededCollection('products', initialProducts),
        ensureSeededCollection('banners', initialBanners),
      ]);

      const [sections, categories, products, banners, media, orders] = await Promise.all([
        this.getSections(),
        this.getCategories(),
        this.getProducts(),
        this.getBanners(),
        this.getMedia(),
        this.getOrders(),
      ]);

      // Get settings
      let settings = initialSettings;
      const setDocRef = doc(db, 'settings', 'website');
      const setSnap = await getDoc(setDocRef);
      if (setSnap.exists()) {
        settings = setSnap.data() as WebsiteSettings;
      } else {
        await setDoc(setDocRef, initialSettings);
      }

      return {
        sections,
        categories,
        products,
        banners,
        media,
        orders,
        settings,
      };
    } catch (err) {
      console.error('Firestore bootstrap error:', err);
      // Fallback response with initial data
      return {
        sections: initialSections as any[],
        categories: initialCategories as any[],
        products: initialProducts as any[],
        banners: initialBanners as any[],
        media: [],
        orders: [],
        settings: initialSettings,
      };
    }
  },

  // ---------------- SECTIONS ----------------
  async getSections(): Promise<Section[]> {
    const snap = await getDocs(collection(db, 'sections'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  async createSection(data: Partial<Section>): Promise<Section> {
    const id = `sec-${Date.now()}`;
    const newSec = {
      name: data.name || 'New Section',
      subtitle: data.subtitle || '',
      description: data.description || '',
      image: data.image || null,
      displayStyle: data.displayStyle || 'horizontal_slider',
      displayOrder: data.displayOrder || 1,
      isVisible: data.isVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'sections', id), newSec);
    return { id, ...newSec };
  },

  async updateSection(id: string, updates: Partial<Section>): Promise<Section> {
    const ref = doc(db, 'sections', id);
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return { id, ...snap.data() } as Section;
  },

  async deleteSection(id: string): Promise<void> {
    await deleteDoc(doc(db, 'sections', id));
  },

  async reorderSections(orderedIds: string[]): Promise<Section[]> {
    for (let i = 0; i < orderedIds.length; i++) {
      await updateDoc(doc(db, 'sections', orderedIds[i]), { displayOrder: i + 1, updatedAt: new Date().toISOString() });
    }
    return this.getSections();
  },

  // ---------------- PRODUCTS ----------------
  async getProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(db, 'products'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const id = `prod-${Date.now()}`;
    const newProd = {
      name: data.name || 'New Brew',
      description: data.description || '',
      price: Number(data.price) || 0,
      salePrice: data.salePrice ? Number(data.salePrice) : null,
      image: data.image || '',
      additionalImages: data.additionalImages || [],
      categoryId: data.categoryId || '',
      sectionId: data.sectionId || '',
      productType: data.productType || 'coffee',
      availability: data.availability ?? true,
      displayOrder: data.displayOrder || 1,
      isVisible: data.isVisible ?? true,
      badge: data.badge || '',
      surpriseToyNote: data.surpriseToyNote || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'products', id), newProd);
    return { id, ...newProd };
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const ref = doc(db, 'products', id);
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return { id, ...snap.data() } as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, 'products', id));
  },

  // ---------------- CATEGORIES ----------------
  async getCategories(): Promise<Category[]> {
    const snap = await getDocs(collection(db, 'categories'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const id = `cat-${Date.now()}`;
    const newCat = {
      name: data.name || 'New Category',
      description: data.description || '',
      image: data.image || null,
      displayOrder: data.displayOrder || 1,
      isVisible: data.isVisible ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'categories', id), newCat);
    return { id, ...newCat };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const ref = doc(db, 'categories', id);
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return { id, ...snap.data() } as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', id));
  },

  // ---------------- BANNERS ----------------
  async getBanners(): Promise<Banner[]> {
    const snap = await getDocs(collection(db, 'banners'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const id = `ban-${Date.now()}`;
    const newBan = {
      name: data.name || 'New Banner',
      bannerType: data.bannerType || 'hero',
      image: data.image || '',
      heading: data.heading || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      ctaText: data.ctaText || '',
      ctaLink: data.ctaLink || '',
      displayOrder: data.displayOrder || 1,
      isVisible: data.isVisible ?? true,
      slideDuration: data.slideDuration || 5,
      textPositions: data.textPositions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'banners', id), newBan);
    return { id, ...newBan };
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    const ref = doc(db, 'banners', id);
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(ref, payload);
    const snap = await getDoc(ref);
    return { id, ...snap.data() } as Banner;
  },

  async deleteBanner(id: string): Promise<void> {
    await deleteDoc(doc(db, 'banners', id));
  },

  // ---------------- MEDIA ----------------
  async getMedia(): Promise<MediaItem[]> {
    const snap = await getDocs(collection(db, 'media'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MediaItem[];
  },

  async uploadMedia(file: File, name?: string, category: string = 'other'): Promise<MediaItem> {
    const folder = category === 'hero' || category === 'banners' ? 'banners' : 'products';
    const uploadRes = await uploadToFirebaseStorage(folder, file, name);

    const id = `med-${Date.now()}`;
    const mediaItem: MediaItem = {
      id,
      name: name || file.name,
      url: uploadRes.url,
      category: category as any,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'media', id), mediaItem);
    return mediaItem;
  },

  async deleteMedia(id: string): Promise<void> {
    await deleteDoc(doc(db, 'media', id));
  },

  // ---------------- ORDERS ----------------
  async getOrders(): Promise<Order[]> {
    const snap = await getDocs(collection(db, 'orders'));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrder(id: string): Promise<Order> {
    const ref = doc(db, 'orders', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Order not found');
    return { id: snap.id, ...snap.data() } as Order;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const id = `ORD-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newOrder: Order = {
      id,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      deliveryAddress: orderData.deliveryAddress || 'Bengaluru, India',
      notes: orderData.notes,
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      tax: Number(orderData.tax) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      total: Number(orderData.total) || 0,
      status: 'preparing',
      paymentMethod: orderData.paymentMethod || 'cod',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'orders', id), newOrder);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const ref = doc(db, 'orders', id);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
    const snap = await getDoc(ref);
    return { id: snap.id, ...snap.data() } as Order;
  },

  // ---------------- SETTINGS ----------------
  async getSettings(): Promise<WebsiteSettings> {
    const snap = await getDoc(doc(db, 'settings', 'website'));
    if (!snap.exists()) return initialSettings as WebsiteSettings;
    return snap.data() as WebsiteSettings;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const ref = doc(db, 'settings', 'website');
    await setDoc(ref, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    const snap = await getDoc(ref);
    return snap.data() as WebsiteSettings;
  },
};
