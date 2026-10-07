import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure public/uploads mirror also exists for Vite bundle compatibility
const PUBLIC_UPLOADS = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(PUBLIC_UPLOADS)) {
  fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });
}

// Serve uploaded files statically with cache headers
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(PUBLIC_UPLOADS));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer storage for persistent media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Database Interface & Atomic Write
interface DatabaseSchema {
  categories: any[];
  sections: any[];
  products: any[];
  banners: any[];
  media: any[];
  orders: any[];
  settings: any;
}

function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database, fallback to initial:', err);
  }
  return getInitialDatabase();
}

function writeDatabase(data: DatabaseSchema): boolean {
  try {
    const tempFile = `${DB_FILE}.tmp.${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// Helper to seed initial data with reference images
function getInitialDatabase(): DatabaseSchema {
  const now = new Date().toISOString();
  
  // Permanent persistent uploads
  const heroImage1 = '/uploads/hero_secretpresso_banner_1791216817348.jpg';
  const heroImage2 = '/uploads/hero_latte_collectible_1791216830274.jpg';
  const promoImage = '/uploads/promo_collectible_toys_1791216844306.jpg';
  const tiramisuImage = '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg';

  const categories = [
    { id: 'cat-all', name: 'All Brews', description: 'Complete coffee catalogue', displayOrder: 1, isVisible: true, createdAt: now, updatedAt: now },
    { id: 'cat-espresso', name: 'Espresso & Hot', description: 'Intense extractions and velvety steamed milk', displayOrder: 2, isVisible: true, createdAt: now, updatedAt: now },
    { id: 'cat-iced', name: 'Iced & Cold Brew', description: 'Steeped for 18 hours, crisp & refreshing', displayOrder: 3, isVisible: true, createdAt: now, updatedAt: now },
    { id: 'cat-signature', name: 'Signature Infusions', description: 'Specialty house concoctions with surprise toys', displayOrder: 4, isVisible: true, createdAt: now, updatedAt: now },
    { id: 'cat-beans', name: 'Beans & Roast', description: 'Whole-bean single origin and reserve blends', displayOrder: 5, isVisible: true, createdAt: now, updatedAt: now },
  ];

  const sections = [
    {
      id: 'sec-coffee-flavours',
      name: 'Coffee Flavours',
      subtitle: 'From classic favourites to exciting new blends, choose your perfect cup. Each one comes with a surprise inside.',
      description: 'The foundation of SECRETpresso. Pure Arabica, small-batch roasted.',
      displayStyle: 'grid',
      displayOrder: 1,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sec-velvet-sweets',
      name: 'Velvet Sweets',
      subtitle: 'Delicate layers, rich textures and little moments of indulgence.',
      description: 'Handcrafted desserts created to pair seamlessly with our dark roasts.',
      displayStyle: 'horizontal_slider',
      displayOrder: 2,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sec-chocolate-atelier',
      name: 'Chocolate Atelier',
      subtitle: 'Deep cocoa, decadent textures and handcrafted sweetness.',
      description: 'Single-origin chocolates crafted with precision and passion.',
      displayStyle: 'horizontal_slider',
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sec-glazed-moments',
      name: 'Glazed Moments',
      subtitle: 'Freshly glazed, beautifully indulgent.',
      description: 'Fluffy brioche dough proofed overnight and finished with artisanal glazes.',
      displayStyle: 'horizontal_slider',
      displayOrder: 4,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sec-from-the-kitchen',
      name: 'From The Kitchen',
      subtitle: 'Warm, comforting bites made to pair perfectly with your coffee.',
      description: 'Savoury delights, toasted breads, and gourmet sandwiches.',
      displayStyle: 'horizontal_slider',
      displayOrder: 5,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sec-crisp-and-golden',
      name: 'Crisp & Golden',
      subtitle: 'Golden, crispy sides made for every coffee break.',
      description: 'Crisped to perfection with house rosemary & smoked salt.',
      displayStyle: 'horizontal_slider',
      displayOrder: 6,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const products = [
    // Coffee Flavours (Grid section)
    {
      id: 'prod-americano',
      name: 'Classic Americano',
      description: 'Bold · Smooth · Timeless. Two ristretto shots topped with hot mineral water.',
      price: 149,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-espresso',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      badge: 'Surprise Included',
      surpriseToyNote: 'Series 1 Barista Bear figurine included',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-vanilla-latte',
      name: 'Vanilla Latte',
      description: 'Creamy · Sweet · Classic. Madagascar vanilla bean syrup folded into microfoam.',
      price: 179,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-espresso',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      badge: 'Bestseller',
      surpriseToyNote: 'Mystery Coffee Capsule with collectible keychain',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-caramel-latte',
      name: 'Caramel Latte',
      description: 'Rich · Buttery · Indulgent. Slow-cooked salted caramel with dark espresso.',
      price: 189,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-espresso',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      badge: 'Popular',
      surpriseToyNote: 'Limited edition golden bear charm',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-mocha',
      name: 'Mocha',
      description: 'Chocolatey · Bold · Cozy. Dutch cocoa melted into double espresso & whole milk.',
      price: 179,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-espresso',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 4,
      isVisible: true,
      badge: 'Surprise Inside',
      surpriseToyNote: 'Mini espresso tamper figurine',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-hazelnut-latte',
      name: 'Hazelnut Latte',
      description: 'Nutty · Smooth · Aromatic. Roasted Piedmont hazelnut paste with velvety steamed milk.',
      price: 189,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-espresso',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 5,
      isVisible: true,
      badge: 'Favorite',
      surpriseToyNote: 'Barista cat with mini portafilter',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-signature-coldbrew',
      name: 'SECRET Cold Brew Reserve',
      description: 'Steeped for 20 hours over Ethiopian beans. Notes of stone fruit and raw honey.',
      price: 199,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-iced',
      sectionId: 'sec-coffee-flavours',
      productType: 'coffee',
      availability: true,
      displayOrder: 6,
      isVisible: true,
      badge: 'Exclusive',
      surpriseToyNote: 'Cold brew dropper miniature',
      createdAt: now,
      updatedAt: now,
    },

    // Velvet Sweets
    {
      id: 'prod-tiramisu',
      name: 'Our Signature Tiramisu',
      description: 'Layers of rich mascarpone, coffee-soaked biscuits and a hint of cocoa. A timeless classic.',
      price: 249,
      salePrice: 229,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-velvet-sweets',
      productType: 'food',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      badge: 'Chef Signature',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-espresso-pannacotta',
      name: 'Espresso Panna Cotta',
      description: 'Silky cream infused with vanilla bean and topped with a glistening espresso jelly gelee.',
      price: 219,
      salePrice: null,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-velvet-sweets',
      productType: 'food',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-cannoli',
      name: 'Sicilian Espresso Cannoli',
      description: 'Crisp pastry shell piped with sweetened ricotta, mini chocolate chips and orange zest.',
      price: 189,
      salePrice: null,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-velvet-sweets',
      productType: 'food',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },

    // Chocolate Atelier
    {
      id: 'prod-chocolate-mousse',
      name: '70% Dark Chocolate Mousse',
      description: 'Airy, rich Guanaja dark chocolate mousse with Maldon sea salt and cocoa nib crisp.',
      price: 229,
      salePrice: null,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-chocolate-atelier',
      productType: 'food',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      badge: 'Decadent',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-chocolate-brownie',
      name: 'Fudge Walnut Brownie',
      description: 'Ultra-fudgy warm brownie with roasted walnuts and dark chocolate drizzle.',
      price: 199,
      salePrice: null,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-chocolate-atelier',
      productType: 'food',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-cocoa-truffles',
      name: 'Espresso Ganache Truffles',
      description: 'Trio of hand-rolled dark truffles dusted in roasted single-origin cocoa powder.',
      price: 169,
      salePrice: null,
      image: tiramisuImage,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-chocolate-atelier',
      productType: 'food',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },

    // Glazed Moments
    {
      id: 'prod-artisanal-donuts',
      name: 'Classic Honey-Vanilla Glazed Donut',
      description: 'Feather-light yeast donut with pure clover honey and Tahitian vanilla glaze.',
      price: 129,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-glazed-moments',
      productType: 'food',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-pistachio-donut',
      name: 'Pistachio Crumble Glazed Donut',
      description: 'Brioche ring dipped in pistachio white chocolate glaze and crushed roasted kernels.',
      price: 149,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-glazed-moments',
      productType: 'food',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-caramel-beignets',
      name: 'Cinnamon Caramel Beignets (3 pcs)',
      description: 'Pillow-soft golden beignets tossed in cinnamon sugar with salted caramel dip.',
      price: 169,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-glazed-moments',
      productType: 'food',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },

    // From The Kitchen
    {
      id: 'prod-garlic-bread',
      name: 'Artisan Toasted Garlic Bread',
      description: 'Crisp sourdough baguette smothered in confit garlic butter and fresh garden herbs.',
      price: 159,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-from-the-kitchen',
      productType: 'food',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-truffle-sandwich',
      name: 'Truffle Mushroom Melt Sandwich',
      description: 'Pan-seared forest mushrooms, aged gruyère, and truffle aioli on toasted brioche.',
      price: 249,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-from-the-kitchen',
      productType: 'food',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      badge: 'Popular',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-brioche-burger',
      name: 'Gourmet Cafe Burger',
      description: 'Charred patty, caramelized onions, smoked cheddar and secret burger sauce.',
      price: 289,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-from-the-kitchen',
      productType: 'food',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-chicken-sandwich',
      name: 'Herb Grilled Chicken Sandwich',
      description: 'Rosemary-marinated chicken breast, sun-dried tomatoes and basil pesto on ciabatta.',
      price: 269,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-from-the-kitchen',
      productType: 'food',
      availability: true,
      displayOrder: 4,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },

    // Crisp & Golden
    {
      id: 'prod-french-fries',
      name: 'Sea Salt French Fries',
      description: 'Thin-cut golden fries tossed in coarse sea salt and served with smoked paprika dip.',
      price: 139,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-crisp-and-golden',
      productType: 'food',
      availability: true,
      displayOrder: 1,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-truffle-parmesan-fries',
      name: 'Truffle & Parmesan Fries',
      description: 'Hand-cut russet fries drizzled with white truffle oil and grated 24-month Parmigiano.',
      price: 189,
      salePrice: null,
      image: heroImage2,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-crisp-and-golden',
      productType: 'food',
      availability: true,
      displayOrder: 2,
      isVisible: true,
      badge: 'Best Pairing',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prod-crispy-potato-wedges',
      name: 'Spiced Crispy Potato Wedges',
      description: 'Seasoned rustic potato wedges with garlic sour cream and fresh chives.',
      price: 159,
      salePrice: null,
      image: heroImage1,
      additionalImages: [],
      categoryId: 'cat-signature',
      sectionId: 'sec-crisp-and-golden',
      productType: 'food',
      availability: true,
      displayOrder: 3,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const banners = [
    {
      id: 'ban-hero-1',
      name: 'Main Hero — Good Coffee, Great Surprise',
      bannerType: 'hero',
      image: heroImage1,
      heading: 'Good Coffee.\nGreat Surprise.',
      subtitle: 'MORE THAN JUST COFFEE',
      description: 'Every cup is a new adventure. Enjoy premium specialty coffee and discover a collectible toy hidden inside.',
      ctaText: 'Explore Our Menu',
      ctaLink: '#coffee-flavours',
      displayOrder: 1,
      isVisible: true,
      slideDuration: 5,
      textPositions: {
        desktop: {
          x: 8,
          y: 26,
          fontSize: 52,
          lineHeight: 1.15,
          letterSpacing: -0.02,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 620,
          visible: true,
        },
        tablet: {
          x: 6,
          y: 22,
          fontSize: 38,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 500,
          visible: true,
        },
        mobile: {
          x: 5,
          y: 18,
          fontSize: 28,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 340,
          visible: true,
        },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ban-hero-2',
      name: 'Second Hero — Handcrafted Roasts & Collectibles',
      bannerType: 'hero',
      image: heroImage2,
      heading: 'Handcrafted Roasts.\nLittle Treasures.',
      subtitle: 'THE SECRET COLLECTION',
      description: 'Artisanal espresso paired with exclusive limited edition figurines. Collect them all with every brew.',
      ctaText: 'Discover The Surprise',
      ctaLink: '#sec-velvet-sweets',
      displayOrder: 2,
      isVisible: true,
      slideDuration: 5,
      textPositions: {
        desktop: {
          x: 8,
          y: 28,
          fontSize: 48,
          lineHeight: 1.15,
          letterSpacing: -0.02,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 600,
          visible: true,
        },
        tablet: {
          x: 6,
          y: 24,
          fontSize: 36,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 480,
          visible: true,
        },
        mobile: {
          x: 5,
          y: 20,
          fontSize: 26,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 320,
          visible: true,
        },
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ban-promo-1',
      name: 'What\'s Inside Collectible Showcase Banner',
      bannerType: 'promo',
      image: promoImage,
      heading: "What's Inside?",
      subtitle: 'THE SURPRISE EXPERIENCE',
      description: 'Every cup hides a collectible toy or mini figurine. From cute barista animal characters to rare season editions — collect them all!',
      ctaText: 'Discover The Collection',
      ctaLink: '#coffee-flavours',
      displayOrder: 1,
      isVisible: true,
      slideDuration: 6,
      textPositions: {
        desktop: {
          x: 52,
          y: 26,
          fontSize: 44,
          lineHeight: 1.2,
          letterSpacing: -0.01,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 540,
          visible: true,
        },
        tablet: {
          x: 48,
          y: 20,
          fontSize: 32,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 420,
          visible: true,
        },
        mobile: {
          x: 6,
          y: 16,
          fontSize: 26,
          alignment: 'left',
          color: '#ffffff',
          maxWidth: 320,
          visible: true,
        },
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  const media = [
    { id: 'med-1', name: 'Hero Main Advertising', url: heroImage1, category: 'hero', size: 142000, mimeType: 'image/jpeg', createdAt: now, updatedAt: now },
    { id: 'med-2', name: 'Latte & Mini Figurines', url: heroImage2, category: 'hero', size: 138000, mimeType: 'image/jpeg', createdAt: now, updatedAt: now },
    { id: 'med-3', name: 'Collectible Figurine Lineup', url: promoImage, category: 'banners', size: 154000, mimeType: 'image/jpeg', createdAt: now, updatedAt: now },
    { id: 'med-4', name: 'Signature Tiramisu', url: tiramisuImage, category: 'food', size: 148000, mimeType: 'image/jpeg', createdAt: now, updatedAt: now },
  ];

  const orders = [
    {
      id: 'ORD-1024',
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav.sharma@example.com',
      customerPhone: '+91 98765 43210',
      deliveryAddress: 'Flat 402, Royale Crest, Indiranagar, Bengaluru, 560038',
      notes: 'Please leave with reception if unavailable.',
      items: [
        {
          productId: 'prod-vanilla-latte',
          name: 'Vanilla Latte',
          price: 179,
          quantity: 2,
          image: heroImage2,
          surpriseToyNote: 'Mystery Coffee Capsule with collectible keychain',
        },
        {
          productId: 'prod-tiramisu',
          name: 'Our Signature Tiramisu',
          price: 229,
          quantity: 1,
          image: tiramisuImage,
        },
      ],
      subtotal: 587,
      tax: 29.35,
      deliveryFee: 40,
      total: 656.35,
      status: 'preparing',
      paymentMethod: 'upi',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ];

  const settings = {
    brandName: 'SECRETpresso',
    tagline: 'Good Coffee. Great Surprise.',
    announcement: 'Complimentary Secret Collectible Toy with every Specialty Brew order today!',
    currencySymbol: '₹',
    phone: '+91 98200 45678',
    email: 'concierge@secretpresso.coffee',
    address: 'SECRETpresso Atelier & Roastery, 12 Kensington Boulevard, Bangalore, India',
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
    },
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
    updatedAt: now,
  };

  return { categories, sections, products, banners, media, orders, settings };
}

// Ensure database file exists on startup
if (!fs.existsSync(DB_FILE)) {
  const initial = getInitialDatabase();
  writeDatabase(initial);
  console.log('Seeded initial database to', DB_FILE);
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Bootstrap state for fast single-roundtrip load
app.get('/api/bootstrap', (_req, res) => {
  const db = readDatabase();
  res.json({
    success: true,
    data: db,
  });
});

// Settings API
app.get('/api/settings', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  const db = readDatabase();
  db.settings = { ...db.settings, ...req.body, updatedAt: new Date().toISOString() };
  writeDatabase(db);
  res.json({ success: true, data: db.settings });
});

// Sections API
app.get('/api/sections', (_req, res) => {
  const db = readDatabase();
  const sorted = [...db.sections].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  res.json({ success: true, data: sorted });
});

app.post('/api/sections', (req, res) => {
  const db = readDatabase();
  const now = new Date().toISOString();
  const nextOrder = db.sections.length > 0 ? Math.max(...db.sections.map((s) => s.displayOrder || 0)) + 1 : 1;
  const newSection = {
    id: `sec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: req.body.name || 'New Section',
    subtitle: req.body.subtitle || '',
    description: req.body.description || '',
    image: req.body.image || null,
    displayStyle: req.body.displayStyle || 'horizontal_slider', // 'grid' | 'horizontal_slider'
    displayOrder: req.body.displayOrder ?? nextOrder,
    isVisible: req.body.isVisible ?? true,
    createdAt: now,
    updatedAt: now,
  };

  db.sections.push(newSection);
  writeDatabase(db);
  res.status(201).json({ success: true, data: newSection, allSections: db.sections });
});

app.put('/api/sections/:id', (req, res) => {
  const db = readDatabase();
  const index = db.sections.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Section not found' });
  }

  db.sections[index] = {
    ...db.sections[index],
    ...req.body,
    id: req.params.id, // Immutable ID
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(db);
  res.json({ success: true, data: db.sections[index] });
});

app.post('/api/sections/reorder', (req, res) => {
  const db = readDatabase();
  const { orderedIds } = req.body; // array of IDs in desired order
  if (Array.isArray(orderedIds)) {
    db.sections.forEach((sec) => {
      const idx = orderedIds.indexOf(sec.id);
      if (idx !== -1) {
        sec.displayOrder = idx + 1;
        sec.updatedAt = new Date().toISOString();
      }
    });
    writeDatabase(db);
  }
  const sorted = [...db.sections].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true, data: sorted });
});

app.delete('/api/sections/:id', (req, res) => {
  const db = readDatabase();
  const targetId = req.params.id;
  const targetIndex = db.sections.findIndex((s) => s.id === targetId);
  if (targetIndex === -1) {
    return res.status(404).json({ success: false, error: 'Section not found' });
  }

  // Safe delete: do NOT delete products, mark them unassigned
  db.products.forEach((p) => {
    if (p.sectionId === targetId) {
      p.sectionId = '';
      p.updatedAt = new Date().toISOString();
    }
  });

  db.sections.splice(targetIndex, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Section removed safely. Products remain intact.' });
});

// Products API
app.get('/api/products', (_req, res) => {
  const db = readDatabase();
  const sorted = [...db.products].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  res.json({ success: true, data: sorted });
});

app.post('/api/products', (req, res) => {
  const db = readDatabase();
  const now = new Date().toISOString();
  const nextOrder = db.products.length > 0 ? Math.max(...db.products.map((p) => p.displayOrder || 0)) + 1 : 1;
  const newProduct = {
    id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: req.body.name || 'New Product',
    description: req.body.description || '',
    price: Number(req.body.price) || 0,
    salePrice: req.body.salePrice ? Number(req.body.salePrice) : null,
    image: req.body.image || '',
    additionalImages: req.body.additionalImages || [],
    categoryId: req.body.categoryId || (db.categories[0]?.id || ''),
    sectionId: req.body.sectionId || (db.sections[0]?.id || ''),
    productType: req.body.productType || 'coffee',
    availability: req.body.availability ?? true,
    displayOrder: req.body.displayOrder ?? nextOrder,
    isVisible: req.body.isVisible ?? true,
    badge: req.body.badge || '',
    customizationGroups: req.body.customizationGroups || [],
    createdAt: now,
    updatedAt: now,
  };

  db.products.push(newProduct);
  writeDatabase(db);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const db = readDatabase();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: req.params.id,
    price: Number(req.body.price ?? db.products[index].price),
    salePrice: req.body.salePrice !== undefined ? (req.body.salePrice ? Number(req.body.salePrice) : null) : db.products[index].salePrice,
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(db);
  res.json({ success: true, data: db.products[index] });
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDatabase();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  db.products.splice(index, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Product deleted' });
});

// Categories API
app.get('/api/categories', (_req, res) => {
  const db = readDatabase();
  const sorted = [...db.categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  res.json({ success: true, data: sorted });
});

app.post('/api/categories', (req, res) => {
  const db = readDatabase();
  const now = new Date().toISOString();
  const nextOrder = db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.displayOrder || 0)) + 1 : 1;
  const newCat = {
    id: `cat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: req.body.name || 'New Category',
    description: req.body.description || '',
    image: req.body.image || null,
    displayOrder: req.body.displayOrder ?? nextOrder,
    isVisible: req.body.isVisible ?? true,
    createdAt: now,
    updatedAt: now,
  };

  db.categories.push(newCat);
  writeDatabase(db);
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  const db = readDatabase();
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  db.categories[index] = {
    ...db.categories[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(db);
  res.json({ success: true, data: db.categories[index] });
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readDatabase();
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }

  db.categories.splice(index, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Category deleted' });
});

// Banners API
app.get('/api/banners', (_req, res) => {
  const db = readDatabase();
  const sorted = [...db.banners].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  res.json({ success: true, data: sorted });
});

app.post('/api/banners', (req, res) => {
  const db = readDatabase();
  const now = new Date().toISOString();
  const nextOrder = db.banners.length > 0 ? Math.max(...db.banners.map((b) => b.displayOrder || 0)) + 1 : 1;
  const newBanner = {
    id: `ban-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: req.body.name || 'New Banner',
    bannerType: req.body.bannerType || 'hero', // 'hero' | 'promo' | 'section'
    image: req.body.image || '',
    heading: req.body.heading || 'Specialty Coffee & Secrets',
    subtitle: req.body.subtitle || 'EXCLUSIVE COLLECTION',
    description: req.body.description || 'Artisanal roasts crafted for discerning tastes.',
    ctaText: req.body.ctaText || 'Discover Now',
    ctaLink: req.body.ctaLink || '#coffee-flavours',
    displayOrder: req.body.displayOrder ?? nextOrder,
    isVisible: req.body.isVisible ?? true,
    slideDuration: Number(req.body.slideDuration) || 5,
    textPositions: req.body.textPositions || {
      desktop: { x: 8, y: 25, fontSize: 48, lineHeight: 1.15, alignment: 'left', color: '#ffffff', visible: true },
      tablet: { x: 6, y: 20, fontSize: 36, alignment: 'left', color: '#ffffff', visible: true },
      mobile: { x: 5, y: 16, fontSize: 26, alignment: 'left', color: '#ffffff', visible: true },
    },
    createdAt: now,
    updatedAt: now,
  };

  db.banners.push(newBanner);
  writeDatabase(db);
  res.status(201).json({ success: true, data: newBanner });
});

app.put('/api/banners/:id', (req, res) => {
  const db = readDatabase();
  const index = db.banners.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Banner not found' });
  }

  db.banners[index] = {
    ...db.banners[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(db);
  res.json({ success: true, data: db.banners[index] });
});

app.delete('/api/banners/:id', (req, res) => {
  const db = readDatabase();
  const index = db.banners.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Banner not found' });
  }

  db.banners.splice(index, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Banner deleted' });
});

// Media Library API
app.get('/api/media', (_req, res) => {
  const db = readDatabase();
  res.json({ success: true, data: db.media });
});

app.post('/api/media/upload', upload.single('file') as any, (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const db = readDatabase();
  const now = new Date().toISOString();
  const publicUrl = `/uploads/${req.file.filename}`;
  const mediaItem = {
    id: `med-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: req.body.name || req.file.originalname,
    url: publicUrl,
    category: req.body.category || 'other',
    size: req.file.size,
    mimeType: req.file.mimetype,
    createdAt: now,
    updatedAt: now,
  };

  db.media.unshift(mediaItem);
  writeDatabase(db);

  res.status(201).json({
    success: true,
    data: mediaItem,
    url: publicUrl,
  });
});

app.delete('/api/media/:id', (req, res) => {
  const db = readDatabase();
  const index = db.media.findIndex((m) => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Media not found' });
  }

  const mediaItem = db.media[index];
  // Attempt to delete physical file if inside UPLOADS_DIR
  if (mediaItem.url && mediaItem.url.startsWith('/uploads/')) {
    const filename = path.basename(mediaItem.url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete disk file:', e);
      }
    }
  }

  db.media.splice(index, 1);
  writeDatabase(db);
  res.json({ success: true, message: 'Media permanently deleted from disk and database' });
});

// Orders & Checkout API
app.get('/api/orders', (_req, res) => {
  const db = readDatabase();
  const sorted = [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, data: sorted });
});

app.get('/api/orders/:id', (req, res) => {
  const db = readDatabase();
  const order = db.orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

app.post('/api/orders', (req, res) => {
  const db = readDatabase();
  const now = new Date().toISOString();
  const orderNumber = 1000 + db.orders.length + 1;
  const newOrder = {
    id: `ORD-${orderNumber}`,
    customerName: req.body.customerName || 'Guest Customer',
    customerEmail: req.body.customerEmail || '',
    customerPhone: req.body.customerPhone || '',
    deliveryAddress: req.body.deliveryAddress || '',
    notes: req.body.notes || '',
    items: req.body.items || [],
    subtotal: Number(req.body.subtotal) || 0,
    tax: Number(req.body.tax) || 0,
    deliveryFee: Number(req.body.deliveryFee) || 0,
    total: Number(req.body.total) || 0,
    status: 'preparing',
    paymentMethod: req.body.paymentMethod || 'cod',
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(newOrder);
  writeDatabase(db);
  res.status(201).json({ success: true, data: newOrder });
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDatabase();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  order.status = req.body.status || order.status;
  order.updatedAt = new Date().toISOString();
  writeDatabase(db);
  res.json({ success: true, data: order });
});

// Vite Middleware integration for development
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SECRETpresso server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
