-- =====================================================================
-- SECRETpresso — COMPLETE PRODUCTION SUPABASE DATABASE MIGRATION
-- Project: ifarrpgcdutjzfprwksi (https://ifarrpgcdutjzfprwksi.supabase.co)
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. PROFILES TABLE & AUTH TRIGGER
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on email & role for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Function to handle new user signup from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Customer'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================================
-- 3. ADDRESSES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    full_address TEXT NOT NULL,
    landmark TEXT,
    city TEXT DEFAULT 'Bengaluru',
    state TEXT DEFAULT 'Karnataka',
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- =====================================================================
-- 4. SECTIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    layout_type TEXT NOT NULL DEFAULT 'horizontal_slider' CHECK (layout_type IN ('grid', 'horizontal_slider')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sections_order ON public.sections(display_order);

-- =====================================================================
-- 5. CATEGORIES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories(display_order);

-- =====================================================================
-- 6. PRODUCTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}',
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discounted_price NUMERIC(10,2),
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    product_type TEXT NOT NULL DEFAULT 'coffee' CHECK (product_type IN ('coffee', 'food', 'merch', 'surprise')),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    badge TEXT,
    surprise_toy_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_section ON public.products(section_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_order ON public.products(display_order);

-- =====================================================================
-- 7. PRODUCT OPTION GROUPS & OPTIONS (CUSTOMIZATION)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.product_option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
    required BOOLEAN NOT NULL DEFAULT false,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    detail TEXT,
    price_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_option_groups_product ON public.product_option_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_options_group ON public.product_options(option_group_id);

-- =====================================================================
-- 8. BANNERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    banner_type TEXT NOT NULL DEFAULT 'hero' CHECK (banner_type IN ('hero', 'promo', 'section')),
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    desktop_image_url TEXT,
    heading TEXT,
    subtitle TEXT,
    description TEXT,
    cta_text TEXT,
    cta_link TEXT,
    link_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    auto_slide_duration INT NOT NULL DEFAULT 5,
    text_positions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_order ON public.banners(display_order);

-- =====================================================================
-- 9. MEDIA STORAGE TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('hero', 'banners', 'coffee', 'food', 'collections', 'promotions', 'avatars', 'other')),
    size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 10. CARTS & CART ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    customization JSONB DEFAULT '[]'::jsonb,
    selected_options JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    calculated_item_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

-- =====================================================================
-- 11. ORDERS & ORDER ITEMS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    coupon_discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    gst NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'card', 'upi')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    delivery_address TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_note TEXT,
    estimated_delivery_minutes INT DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    product_image_snapshot TEXT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    customization_snapshot JSONB DEFAULT '[]'::jsonb,
    selected_options_snapshot JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    item_total NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =====================================================================
-- 12. COUPONS & USAGE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10,2) NOT NULL,
    minimum_order_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    maximum_discount NUMERIC(10,2),
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    usage_limit INT,
    per_user_limit INT DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 13. OFFERS & PROMOTIONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    banner_image_url TEXT,
    discount_percentage NUMERIC(5,2),
    code TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 14. PAYMENT METHODS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon_url TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 15. WEBSITE SETTINGS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL DEFAULT 'SECRETpresso',
    tagline TEXT DEFAULT 'Good Coffee. Great Surprise.',
    announcement TEXT DEFAULT 'Complimentary Secret Collectible Toy with every Specialty Brew order today!',
    currency_symbol TEXT DEFAULT '₹',
    phone TEXT DEFAULT '+91 98200 45678',
    email TEXT DEFAULT 'concierge@secretpresso.coffee',
    address TEXT DEFAULT 'SECRETpresso Atelier & Roastery, 12 Kensington Boulevard, Bangalore, India',
    social_links JSONB DEFAULT '{"instagram": "https://instagram.com", "facebook": "https://facebook.com", "twitter": "https://twitter.com"}'::jsonb,
    mobile_search_suggestions JSONB DEFAULT '["Search for coffee...", "Search for burgers...", "Search for desserts...", "Search for tiramisu..."]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Profiles are viewable by owner" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be updated by owner" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- ADDRESSES Policies
CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- PUBLIC CATALOG READ POLICIES (Sections, Categories, Products, Options, Banners, Offers, Coupons, Settings, Payment Methods)
CREATE POLICY "Public read active sections" ON public.sections
    FOR SELECT USING (true);
CREATE POLICY "Admin write sections" ON public.sections
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read active categories" ON public.categories
    FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON public.products
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read option groups" ON public.product_option_groups
    FOR SELECT USING (true);
CREATE POLICY "Admin write option groups" ON public.product_option_groups
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read options" ON public.product_options
    FOR SELECT USING (true);
CREATE POLICY "Admin write options" ON public.product_options
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read banners" ON public.banners
    FOR SELECT USING (true);
CREATE POLICY "Admin write banners" ON public.banners
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read media" ON public.media
    FOR SELECT USING (true);
CREATE POLICY "Admin write media" ON public.media
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read coupons" ON public.coupons
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write coupons" ON public.coupons
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read offers" ON public.offers
    FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin write offers" ON public.offers
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read payment methods" ON public.payment_methods
    FOR SELECT USING (true);
CREATE POLICY "Admin write payment methods" ON public.payment_methods
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read website settings" ON public.website_settings
    FOR SELECT USING (true);
CREATE POLICY "Admin write website settings" ON public.website_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CARTS & CART ITEMS Policies
CREATE POLICY "Users can manage own cart" ON public.carts
    FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL)
    WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage own cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL))
    );

-- ORDERS & ORDER ITEMS Policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR user_id IS NULL);

CREATE POLICY "Anyone can create an order" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Users can view order items for their orders" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin() OR orders.user_id IS NULL))
    );

CREATE POLICY "Anyone can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- =====================================================================
-- 17. SUPABASE STORAGE BUCKETS SETUP
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('banners', 'banners', true),
    ('products', 'products', true),
    ('categories', 'categories', true),
    ('sections', 'sections', true),
    ('promotions', 'promotions', true),
    ('avatars', 'avatars', true),
    ('other-media', 'other-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public can view storage objects" ON storage.objects;
CREATE POLICY "Public can view storage objects" ON storage.objects
    FOR SELECT USING (bucket_id IN ('banners', 'products', 'categories', 'sections', 'promotions', 'avatars', 'other-media'));

DROP POLICY IF EXISTS "Authenticated and Admin can upload images" ON storage.objects;
CREATE POLICY "Authenticated and Admin can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('banners', 'products', 'categories', 'sections', 'promotions', 'avatars', 'other-media'));

DROP POLICY IF EXISTS "Authenticated and Admin can update images" ON storage.objects;
CREATE POLICY "Authenticated and Admin can update images" ON storage.objects
    FOR UPDATE USING (bucket_id IN ('banners', 'products', 'categories', 'sections', 'promotions', 'avatars', 'other-media'));

DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;
CREATE POLICY "Admin can delete images" ON storage.objects
    FOR DELETE USING (bucket_id IN ('banners', 'products', 'categories', 'sections', 'promotions', 'avatars', 'other-media'));

-- =====================================================================
-- 18. REALTIME REPLICATION SETUP
-- =====================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================================
-- 19. SEED INITIAL DATA (All 23 Products, 6 Sections, 5 Categories, Banners, Settings)
-- =====================================================================

-- Settings Seed
INSERT INTO public.website_settings (brand_name, tagline, announcement, currency_symbol, phone, email, address)
VALUES (
    'SECRETpresso',
    'Good Coffee. Great Surprise.',
    'Complimentary Secret Collectible Toy with every Specialty Brew order today!',
    '₹',
    '+91 98200 45678',
    'concierge@secretpresso.coffee',
    'SECRETpresso Atelier & Roastery, 12 Kensington Boulevard, Bangalore, India'
)
ON CONFLICT DO NOTHING;

-- Categories Seed
INSERT INTO public.categories (id, slug, name, description, display_order, is_active)
VALUES
    ('c1111111-0000-0000-0000-000000000001', 'all-brews', 'All Brews', 'Complete coffee catalogue', 1, true),
    ('c1111111-0000-0000-0000-000000000002', 'espresso-hot', 'Espresso & Hot', 'Intense extractions and velvety steamed milk', 2, true),
    ('c1111111-0000-0000-0000-000000000003', 'iced-cold-brew', 'Iced & Cold Brew', 'Steeped for 18 hours, crisp & refreshing', 3, true),
    ('c1111111-0000-0000-0000-000000000004', 'signature-infusions', 'Signature Infusions', 'Specialty house concoctions with surprise toys', 4, true),
    ('c1111111-0000-0000-0000-000000000005', 'beans-roast', 'Beans & Roast', 'Whole-bean single origin and reserve blends', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Sections Seed
INSERT INTO public.sections (id, slug, name, subtitle, description, display_order, layout_type, is_active)
VALUES
    ('s1111111-0000-0000-0000-000000000001', 'coffee-flavours', 'Coffee Flavours', 'From classic favourites to exciting new blends, choose your perfect cup. Each one comes with a surprise inside.', 'The foundation of SECRETpresso. Pure Arabica, small-batch roasted.', 1, 'grid', true),
    ('s1111111-0000-0000-0000-000000000002', 'velvet-sweets', 'Velvet Sweets', 'Delicate layers, rich textures and little moments of indulgence.', 'Handcrafted desserts created to pair seamlessly with our dark roasts.', 2, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000003', 'chocolate-atelier', 'Chocolate Atelier', 'Deep cocoa, decadent textures and handcrafted sweetness.', 'Single-origin chocolates crafted with precision and passion.', 3, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000004', 'glazed-moments', 'Glazed Moments', 'Freshly glazed, beautifully indulgent.', 'Fluffy brioche dough proofed overnight and finished with artisanal glazes.', 4, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000005', 'from-the-kitchen', 'From The Kitchen', 'Warm, comforting bites made to pair perfectly with your coffee.', 'Savoury delights, toasted breads, and gourmet sandwiches.', 5, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000006', 'crisp-and-golden', 'Crisp & Golden', 'Golden, crispy sides made for every coffee break.', 'Crisped to perfection with house rosemary & smoked salt.', 6, 'horizontal_slider', true)
ON CONFLICT (id) DO NOTHING;

-- Products Seed
INSERT INTO public.products (id, name, slug, description, price, discounted_price, image_url, category_id, section_id, product_type, display_order, badge, surprise_toy_note, is_available)
VALUES
    ('p1111111-0000-0000-0000-000000000001', 'Classic Americano', 'classic-americano', 'Bold · Smooth · Timeless. Two ristretto shots topped with hot mineral water.', 149.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'coffee', 1, 'Surprise Included', 'Series 1 Barista Bear figurine included', true),
    ('p1111111-0000-0000-0000-000000000002', 'Vanilla Latte', 'vanilla-latte', 'Creamy · Sweet · Classic. Madagascar vanilla bean syrup folded into microfoam.', 179.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'coffee', 2, 'Bestseller', 'Mystery Coffee Capsule with collectible keychain', true),
    ('p1111111-0000-0000-0000-000000000003', 'Caramel Latte', 'caramel-latte', 'Rich · Buttery · Indulgent. Slow-cooked salted caramel with dark espresso.', 189.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'coffee', 3, 'Popular', 'Limited edition golden bear charm', true),
    ('p1111111-0000-0000-0000-000000000004', 'Mocha', 'mocha', 'Chocolatey · Bold · Cozy. Dutch cocoa melted into double espresso & whole milk.', 179.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'coffee', 4, 'Surprise Inside', 'Mini espresso tamper figurine', true),
    ('p1111111-0000-0000-0000-000000000005', 'Hazelnut Latte', 'hazelnut-latte', 'Nutty · Smooth · Aromatic. Roasted Piedmont hazelnut paste with velvety steamed milk.', 189.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'coffee', 5, 'Favorite', 'Barista cat with mini portafilter', true),
    ('p1111111-0000-0000-0000-000000000006', 'SECRET Cold Brew Reserve', 'secret-cold-brew-reserve', 'Steeped for 20 hours over Ethiopian beans. Notes of stone fruit and raw honey.', 199.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000003', 's1111111-0000-0000-0000-000000000001', 'coffee', 6, 'Exclusive', 'Cold brew dropper miniature', true),
    ('p1111111-0000-0000-0000-000000000007', 'Our Signature Tiramisu', 'our-signature-tiramisu', 'Layers of rich mascarpone, coffee-soaked biscuits and a hint of cocoa. A timeless classic.', 249.00, 229.00, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000002', 'food', 1, 'Chef Signature', NULL, true),
    ('p1111111-0000-0000-0000-000000000008', 'Espresso Panna Cotta', 'espresso-panna-cotta', 'Silky cream infused with vanilla bean and topped with a glistening espresso jelly gelee.', 219.00, NULL, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000002', 'food', 2, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000009', 'Sicilian Espresso Cannoli', 'sicilian-espresso-cannoli', 'Crisp pastry shell piped with sweetened ricotta, mini chocolate chips and orange zest.', 189.00, NULL, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000002', 'food', 3, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000010', '70% Dark Chocolate Mousse', '70-dark-chocolate-mousse', 'Airy, rich Guanaja dark chocolate mousse with Maldon sea salt and cocoa nib crisp.', 229.00, NULL, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000003', 'food', 1, 'Decadent', NULL, true),
    ('p1111111-0000-0000-0000-000000000011', 'Fudge Walnut Brownie', 'fudge-walnut-brownie', 'Ultra-fudgy warm brownie with roasted walnuts and dark chocolate drizzle.', 199.00, NULL, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000003', 'food', 2, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000012', 'Espresso Ganache Truffles', 'espresso-ganache-truffles', 'Trio of hand-rolled dark truffles dusted in roasted single-origin cocoa powder.', 169.00, NULL, '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000003', 'food', 3, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000013', 'Classic Honey-Vanilla Glazed Donut', 'classic-honey-vanilla-glazed-donut', 'Feather-light yeast donut with pure clover honey and Tahitian vanilla glaze.', 129.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000004', 'food', 1, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000014', 'Pistachio Crumble Glazed Donut', 'pistachio-crumble-glazed-donut', 'Brioche ring dipped in pistachio white chocolate glaze and crushed roasted kernels.', 149.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000004', 'food', 2, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000015', 'Cinnamon Caramel Beignets (3 pcs)', 'cinnamon-caramel-beignets', 'Pillow-soft golden beignets tossed in cinnamon sugar with salted caramel dip.', 169.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000004', 'food', 3, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000016', 'Artisan Toasted Garlic Bread', 'artisan-toasted-garlic-bread', 'Crisp sourdough baguette smothered in confit garlic butter and fresh garden herbs.', 159.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000005', 'food', 1, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000017', 'Truffle Mushroom Melt Sandwich', 'truffle-mushroom-melt-sandwich', 'Pan-seared forest mushrooms, aged gruyère, and truffle aioli on toasted brioche.', 249.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000005', 'food', 2, 'Popular', NULL, true),
    ('p1111111-0000-0000-0000-000000000018', 'Gourmet Cafe Burger', 'gourmet-cafe-burger', 'Charred patty, caramelized onions, smoked cheddar and secret burger sauce.', 289.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000005', 'food', 3, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000019', 'Herb Grilled Chicken Sandwich', 'herb-grilled-chicken-sandwich', 'Rosemary-marinated chicken breast, sun-dried tomatoes and basil pesto on ciabatta.', 269.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000005', 'food', 4, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000020', 'Sea Salt French Fries', 'sea-salt-french-fries', 'Thin-cut golden fries tossed in coarse sea salt and served with smoked paprika dip.', 139.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000006', 'food', 1, NULL, NULL, true),
    ('p1111111-0000-0000-0000-000000000021', 'Truffle & Parmesan Fries', 'truffle-parmesan-fries', 'Hand-cut russet fries drizzled with white truffle oil and grated 24-month Parmigiano.', 189.00, NULL, '/uploads/hero_latte_collectible_1791216830274.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000006', 'food', 2, 'Best Pairing', NULL, true),
    ('p1111111-0000-0000-0000-000000000022', 'Spiced Crispy Potato Wedges', 'spiced-crispy-potato-wedges', 'Seasoned rustic potato wedges with garlic sour cream and fresh chives.', 159.00, NULL, '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'c1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000006', 'food', 3, NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Banners Seed
INSERT INTO public.banners (id, title, banner_type, image_url, heading, subtitle, description, cta_text, cta_link, display_order, is_active, auto_slide_duration)
VALUES
    ('b1111111-0000-0000-0000-000000000001', 'Main Hero — Good Coffee, Great Surprise', 'hero', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 'Good Coffee.\nGreat Surprise.', 'MORE THAN JUST COFFEE', 'Every cup is a new adventure. Enjoy premium specialty coffee and discover a collectible toy hidden inside.', 'Explore Our Menu', '#coffee-flavours', 1, true, 5),
    ('b1111111-0000-0000-0000-000000000002', 'Second Hero — Handcrafted Roasts & Collectibles', 'hero', '/uploads/hero_latte_collectible_1791216830274.jpg', 'Handcrafted Roasts.\nLittle Treasures.', 'THE SECRET COLLECTION', 'Artisanal espresso paired with exclusive limited edition figurines. Collect them all with every brew.', 'Discover The Surprise', '#sec-velvet-sweets', 2, true, 5),
    ('b1111111-0000-0000-0000-000000000003', 'What''s Inside Collectible Showcase Banner', 'promo', '/uploads/promo_collectible_toys_1791216844306.jpg', 'What''s Inside?', 'THE SURPRISE EXPERIENCE', 'Every cup hides a collectible toy or mini figurine. From cute barista animal characters to rare season editions — collect them all!', 'Discover The Collection', '#coffee-flavours', 1, true, 6)
ON CONFLICT (id) DO NOTHING;

-- Coupons Seed
INSERT INTO public.coupons (code, title, description, discount_type, discount_value, minimum_order_value, maximum_discount, is_active)
VALUES
    ('SECRET10', '10% Instant Secret Discount', 'Save 10% on all specialty brews and pairings', 'percentage', 10.00, 199.00, 100.00, true),
    ('WELCOME50', 'Flat ₹50 Off Welcome Treat', 'Flat ₹50 savings on your first secret order', 'flat', 50.00, 249.00, 50.00, true),
    ('FREESHIP', 'Free Secret Delivery', 'Free artisanal dispatch on orders above ₹399', 'flat', 40.00, 399.00, 40.00, true)
ON CONFLICT (code) DO NOTHING;

-- Payment Methods Seed
INSERT INTO public.payment_methods (code, name, icon_url, display_order, is_enabled)
VALUES
    ('upi_gpay', 'Google Pay', 'gpay', 1, true),
    ('upi_phonepe', 'PhonePe', 'phonepe', 2, true),
    ('upi_paytm', 'Paytm', 'paytm', 3, true),
    ('upi_other', 'Other UPI Apps', 'upi', 4, true),
    ('card', 'Credit / Debit Card', 'card', 5, true),
    ('cod', 'Cash on Delivery', 'cash', 6, true)
ON CONFLICT (code) DO NOTHING;
