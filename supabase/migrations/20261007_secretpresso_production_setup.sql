-- =====================================================================
-- SECRETpresso — PRODUCTION SUPABASE SQL SETUP
-- Project Reference: ifarrpgcdutjzfprwksi
-- Project URL: https://ifarrpgcdutjzfprwksi.supabase.co
--
-- Instructions:
-- 1. Open Supabase Dashboard -> SQL Editor -> New Query
-- 2. Paste this entire script
-- 3. Click "Run"
-- =====================================================================

-- -------------------------------------------------------------
-- 1. EXTENSIONS
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- 2. CORE HELPER FUNCTIONS
-- -------------------------------------------------------------

-- 2.1 Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Order number auto-generator (e.g. SP-261007-4921)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_order_number TEXT;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        new_order_number := 'SP-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
        IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number) THEN
            is_unique := TRUE;
        END IF;
    END LOOP;
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- -------------------------------------------------------------
-- 3. TABLES CREATION
-- -------------------------------------------------------------

-- 3.1 PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin check helper function (SECURITY DEFINER to prevent recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$;

-- Automatically create profile on new user registration in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, email, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Customer'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        'customer',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.2 ADDRESSES (Saved delivery locations per user)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    full_address TEXT NOT NULL,
    landmark TEXT,
    city TEXT DEFAULT 'Bengaluru',
    state TEXT DEFAULT 'Karnataka',
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.3 SECTIONS (Storefront Section Manager)
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    layout_type TEXT NOT NULL DEFAULT 'horizontal_slider' CHECK (layout_type IN ('grid', 'horizontal_slider')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_sections_updated_at ON public.sections;
CREATE TRIGGER trg_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.4 CATEGORIES (Custom category names)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.5 PRODUCTS (No inventory management system, controlled via is_available)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    short_description TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discounted_price NUMERIC(10,2),
    gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.6 PRODUCT CUSTOMIZATION: OPTION GROUPS & OPTIONS
CREATE TABLE IF NOT EXISTS public.product_option_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    min_selections INT NOT NULL DEFAULT 0,
    max_selections INT NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_product_option_groups_updated_at ON public.product_option_groups;
CREATE TRIGGER trg_product_option_groups_updated_at
    BEFORE UPDATE ON public.product_option_groups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_group_id UUID NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_product_options_updated_at ON public.product_options;
CREATE TRIGGER trg_product_options_updated_at
    BEFORE UPDATE ON public.product_options
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.7 BANNERS (Storefront Hero Carousel & Promo Banners)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    link_url TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    text_position_x NUMERIC(5,2) DEFAULT 8.00,
    text_position_y NUMERIC(5,2) DEFAULT 25.00,
    mobile_text_position_x NUMERIC(5,2) DEFAULT 5.00,
    mobile_text_position_y NUMERIC(5,2) DEFAULT 16.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_banners_updated_at ON public.banners;
CREATE TRIGGER trg_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.8 CARTS & CART ITEMS (Supports separate items with different customizations)
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    customization_data JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.9 COUPONS / OFFERS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    minimum_order_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    maximum_discount NUMERIC(10,2),
    usage_limit INT,
    per_user_limit INT DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.10 ORDERS (Live customer orders & admin fulfillment)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL DEFAULT public.generate_order_number(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    coupon_discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cod_pending')),
    customer_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.11 ORDER ITEMS (Preserves immutable historical snapshots)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    product_image_snapshot TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    customization_data JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.12 ORDER STATUS HISTORY (Live customer order tracking)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-log history whenever order status updates
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_status_history (order_id, status, note)
        VALUES (
            NEW.id,
            NEW.status,
            CASE
                WHEN TG_OP = 'INSERT' THEN 'Order placed successfully'
                WHEN NEW.status = 'confirmed' THEN 'Order confirmed by roastery'
                WHEN NEW.status = 'preparing' THEN 'Barista is crafting your artisanal brew'
                WHEN NEW.status = 'ready' THEN 'Packed and ready for delivery partner'
                WHEN NEW.status = 'out_for_delivery' THEN 'Partner is on the way to your location'
                WHEN NEW.status = 'delivered' THEN 'Order successfully handed over'
                WHEN NEW.status = 'cancelled' THEN 'Order has been cancelled'
                ELSE 'Status updated to ' || NEW.status
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_orders_status_history ON public.orders;
CREATE TRIGGER trg_orders_status_history
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- 3.13 PAYMENT METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon_url TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER trg_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.14 WEBSITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.15 SEARCH PLACEHOLDERS
CREATE TABLE IF NOT EXISTS public.search_placeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phrase TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_search_placeholders_updated_at ON public.search_placeholders;
CREATE TRIGGER trg_search_placeholders_updated_at
    BEFORE UPDATE ON public.search_placeholders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3.16 ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_section_id ON public.products(section_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);

CREATE INDEX IF NOT EXISTS idx_sections_display_order ON public.sections(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON public.banners(display_order);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_search_placeholders_display_order ON public.search_placeholders(display_order);

-- -------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- -------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_placeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 6. ROW LEVEL SECURITY POLICIES
-- -------------------------------------------------------------

-- 6.1 Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- 6.2 Addresses Policies
DROP POLICY IF EXISTS "addresses_all_policy" ON public.addresses;
CREATE POLICY "addresses_all_policy" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 6.3 Sections Policies
DROP POLICY IF EXISTS "sections_select_policy" ON public.sections;
CREATE POLICY "sections_select_policy" ON public.sections
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "sections_admin_policy" ON public.sections;
CREATE POLICY "sections_admin_policy" ON public.sections
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.4 Categories Policies
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "categories_admin_policy" ON public.categories;
CREATE POLICY "categories_admin_policy" ON public.categories
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.5 Products Policies
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (is_available = true OR public.is_admin());

DROP POLICY IF EXISTS "products_admin_policy" ON public.products;
CREATE POLICY "products_admin_policy" ON public.products
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.6 Product Option Groups & Options Policies
DROP POLICY IF EXISTS "option_groups_select_policy" ON public.product_option_groups;
CREATE POLICY "option_groups_select_policy" ON public.product_option_groups
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "option_groups_admin_policy" ON public.product_option_groups;
CREATE POLICY "option_groups_admin_policy" ON public.product_option_groups
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "options_select_policy" ON public.product_options;
CREATE POLICY "options_select_policy" ON public.product_options
    FOR SELECT USING (is_available = true OR public.is_admin());

DROP POLICY IF EXISTS "options_admin_policy" ON public.product_options;
CREATE POLICY "options_admin_policy" ON public.product_options
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.7 Banners Policies
DROP POLICY IF EXISTS "banners_select_policy" ON public.banners;
CREATE POLICY "banners_select_policy" ON public.banners
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "banners_admin_policy" ON public.banners;
CREATE POLICY "banners_admin_policy" ON public.banners
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.8 Coupons Policies
DROP POLICY IF EXISTS "coupons_select_policy" ON public.coupons;
CREATE POLICY "coupons_select_policy" ON public.coupons
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "coupons_admin_policy" ON public.coupons;
CREATE POLICY "coupons_admin_policy" ON public.coupons
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.9 Payment Methods Policies
DROP POLICY IF EXISTS "payment_methods_select_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_select_policy" ON public.payment_methods
    FOR SELECT USING (is_enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "payment_methods_admin_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_admin_policy" ON public.payment_methods
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.10 Site Settings Policies
DROP POLICY IF EXISTS "site_settings_select_policy" ON public.site_settings;
CREATE POLICY "site_settings_select_policy" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_admin_policy" ON public.site_settings;
CREATE POLICY "site_settings_admin_policy" ON public.site_settings
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.11 Search Placeholders Policies
DROP POLICY IF EXISTS "search_placeholders_select_policy" ON public.search_placeholders;
CREATE POLICY "search_placeholders_select_policy" ON public.search_placeholders
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "search_placeholders_admin_policy" ON public.search_placeholders;
CREATE POLICY "search_placeholders_admin_policy" ON public.search_placeholders
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.12 Cart Policies
DROP POLICY IF EXISTS "carts_policy" ON public.carts;
CREATE POLICY "carts_policy" ON public.carts
    FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL)
    WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "cart_items_policy" ON public.cart_items;
CREATE POLICY "cart_items_policy" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
            AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
        )
    );

-- 6.13 Orders Policies
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR user_id IS NULL);

DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6.14 Order Items Policies
DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin() OR orders.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "order_items_insert_policy" ON public.order_items;
CREATE POLICY "order_items_insert_policy" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- 6.15 Order Status History Policies
DROP POLICY IF EXISTS "order_status_history_select_policy" ON public.order_status_history;
CREATE POLICY "order_status_history_select_policy" ON public.order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin() OR orders.user_id IS NULL)
        )
    );

-- 6.16 Admin Activity Logs Policies
DROP POLICY IF EXISTS "admin_activity_logs_policy" ON public.admin_activity_logs;
CREATE POLICY "admin_activity_logs_policy" ON public.admin_activity_logs
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- -------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKETS & POLICIES
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('category-images', 'category-images', true),
    ('section-images', 'section-images', true),
    ('banners', 'banners', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    -- Public Read
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Secretpresso Storage'
    ) THEN
        CREATE POLICY "Public Access Secretpresso Storage" ON storage.objects
            FOR SELECT USING (bucket_id IN ('product-images', 'category-images', 'section-images', 'banners', 'avatars'));
    END IF;

    -- Authenticated & Admin Upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Upload Secretpresso Storage'
    ) THEN
        CREATE POLICY "Upload Secretpresso Storage" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id IN ('product-images', 'category-images', 'section-images', 'banners', 'avatars')
                AND (auth.role() = 'authenticated' OR public.is_admin())
            );
    END IF;

    -- Admin Update
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update Secretpresso Storage'
    ) THEN
        CREATE POLICY "Update Secretpresso Storage" ON storage.objects
            FOR UPDATE USING (public.is_admin());
    END IF;

    -- Admin Delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete Secretpresso Storage'
    ) THEN
        CREATE POLICY "Delete Secretpresso Storage" ON storage.objects
            FOR DELETE USING (public.is_admin());
    END IF;
END $$;

-- -------------------------------------------------------------
-- 8. REALTIME REPLICATION SETUP
-- -------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'order_status_history') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'banners') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sections') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.sections;
        END IF;
    END IF;
END $$;

-- -------------------------------------------------------------
-- 9. INITIAL SEED DATA
-- -------------------------------------------------------------

-- 9.1 Site Settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES 
    ('brand_info', '{"brand_name": "SECRETpresso", "tagline": "Good Coffee. Great Surprise.", "phone": "+91 98200 45678", "email": "concierge@secretpresso.coffee", "address": "Indiranagar, Bangalore"}'::jsonb),
    ('store_status', '{"is_open": true, "notice": "Open for artisanal delivery & pickup"}'::jsonb),
    ('order_rules', '{"delivery_charge": 40.00, "free_delivery_threshold": 499.00, "gst_percentage": 5.00, "minimum_order_value": 99.00}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- 9.2 Search Placeholders
INSERT INTO public.search_placeholders (phrase, display_order, is_active)
VALUES
    ('Search for coffee...', 1, true),
    ('Search for burgers...', 2, true),
    ('Search for desserts...', 3, true),
    ('Search for tiramisu...', 4, true),
    ('Search for brownies...', 5, true),
    ('Search for iced coffee...', 6, true),
    ('Search for fries...', 7, true),
    ('Search for sandwiches...', 8, true),
    ('Search for donuts...', 9, true)
ON CONFLICT DO NOTHING;

-- 9.3 Payment Methods
INSERT INTO public.payment_methods (name, type, icon_url, display_order, is_enabled)
VALUES
    ('Google Pay', 'upi', 'gpay', 1, true),
    ('PhonePe', 'upi', 'phonepe', 2, true),
    ('Paytm', 'upi', 'paytm', 3, true),
    ('Other UPI Apps', 'upi', 'upi', 4, true),
    ('Credit / Debit Card', 'card', 'card', 5, true),
    ('Cash on Delivery', 'cash', 'cash', 6, true)
ON CONFLICT DO NOTHING;

-- 9.4 Categories (5 Categories)
INSERT INTO public.categories (id, name, slug, description, display_order, is_active)
VALUES
    ('c1111111-0000-0000-0000-000000000001', 'All Brews', 'all-brews', 'Complete coffee catalogue', 1, true),
    ('c1111111-0000-0000-0000-000000000002', 'Espresso & Hot', 'espresso-hot', 'Intense extractions and velvety steamed milk', 2, true),
    ('c1111111-0000-0000-0000-000000000003', 'Iced & Cold Brew', 'iced-cold-brew', 'Steeped for 18 hours, crisp & refreshing', 3, true),
    ('c1111111-0000-0000-0000-000000000004', 'Signature Infusions', 'signature-infusions', 'Specialty house concoctions with surprise toys', 4, true),
    ('c1111111-0000-0000-0000-000000000005', 'Beans & Roast', 'beans-roast', 'Whole-bean single origin and reserve blends', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 9.5 Sections (6 Sections)
INSERT INTO public.sections (id, name, slug, description, display_order, layout_type, is_active)
VALUES
    ('s1111111-0000-0000-0000-000000000001', 'Coffee Flavours', 'coffee-flavours', 'The foundation of SECRETpresso. Pure Arabica, small-batch roasted.', 1, 'grid', true),
    ('s1111111-0000-0000-0000-000000000002', 'Velvet Sweets', 'velvet-sweets', 'Handcrafted desserts created to pair seamlessly with our dark roasts.', 2, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000003', 'Chocolate Atelier', 'chocolate-atelier', 'Single-origin chocolates crafted with precision and passion.', 3, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000004', 'Glazed Moments', 'glazed-moments', 'Fluffy brioche dough proofed overnight and finished with artisanal glazes.', 4, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000005', 'From The Kitchen', 'from-the-kitchen', 'Savoury delights, toasted breads, and gourmet sandwiches.', 5, 'horizontal_slider', true),
    ('s1111111-0000-0000-0000-000000000006', 'Crisp & Golden', 'crisp-and-golden', 'Crisped to perfection with house rosemary & smoked salt.', 6, 'horizontal_slider', true)
ON CONFLICT (id) DO NOTHING;

-- 9.6 Products (All 22 Unique Products with verified unique UUIDs)
INSERT INTO public.products (id, section_id, category_id, name, slug, short_description, description, image_url, price, discounted_price, gst_percentage, is_available, display_order, is_featured)
VALUES
    -- Coffee Flavours (Grid Section)
    ('p1111111-0000-0000-0000-000000000001', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000002', 'Classic Americano', 'classic-americano', 'Bold · Smooth · Timeless', 'Two ristretto shots topped with hot mineral water. Includes surprise figurine.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 149.00, NULL, 5.00, true, 1, true),
    ('p1111111-0000-0000-0000-000000000002', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000002', 'Vanilla Latte', 'vanilla-latte', 'Creamy · Sweet · Classic', 'Madagascar vanilla bean syrup folded into microfoam. Includes collectible keychain.', '/uploads/hero_latte_collectible_1791216830274.jpg', 179.00, NULL, 5.00, true, 2, true),
    ('p1111111-0000-0000-0000-000000000003', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000002', 'Caramel Latte', 'caramel-latte', 'Rich · Buttery · Indulgent', 'Slow-cooked salted caramel with dark espresso and steamed whole milk.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 189.00, NULL, 5.00, true, 3, false),
    ('p1111111-0000-0000-0000-000000000004', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000002', 'Mocha', 'mocha', 'Chocolatey · Bold · Cozy', 'Dutch cocoa melted into double espresso & whole milk.', '/uploads/hero_latte_collectible_1791216830274.jpg', 179.00, NULL, 5.00, true, 4, false),
    ('p1111111-0000-0000-0000-000000000005', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000002', 'Hazelnut Latte', 'hazelnut-latte', 'Nutty · Smooth · Aromatic', 'Roasted Piedmont hazelnut paste with velvety steamed milk.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 189.00, NULL, 5.00, true, 5, false),
    ('p1111111-0000-0000-0000-000000000006', 's1111111-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000003', 'SECRET Cold Brew Reserve', 'secret-cold-brew-reserve', 'Crisp · Floral · Refreshing', 'Steeped for 20 hours over Ethiopian beans. Notes of stone fruit and raw honey.', '/uploads/hero_latte_collectible_1791216830274.jpg', 199.00, NULL, 5.00, true, 6, true),

    -- Velvet Sweets (Horizontal Slider)
    ('p1111111-0000-0000-0000-000000000007', 's1111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000004', 'Our Signature Tiramisu', 'our-signature-tiramisu', 'Classic Italian Indulgence', 'Layers of rich mascarpone, espresso-soaked ladyfingers and dusting of cocoa.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 249.00, 229.00, 5.00, true, 1, true),
    ('p1111111-0000-0000-0000-000000000008', 's1111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000004', 'Espresso Panna Cotta', 'espresso-panna-cotta', 'Silky · Vanilla · Gelee', 'Silky cream infused with vanilla bean and topped with an espresso jelly.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 219.00, NULL, 5.00, true, 2, false),
    ('p1111111-0000-0000-0000-000000000009', 's1111111-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000004', 'Sicilian Espresso Cannoli', 'sicilian-espresso-cannoli', 'Crisp Pastry · Ricotta', 'Crisp pastry shell piped with sweetened ricotta, mini chocolate chips and orange zest.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 189.00, NULL, 5.00, true, 3, false),

    -- Chocolate Atelier (Horizontal Slider)
    ('p1111111-0000-0000-0000-000000000010', 's1111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000004', '70% Dark Chocolate Mousse', '70-dark-chocolate-mousse', 'Decadent · Airy · Guanaja', 'Airy Guanaja dark chocolate mousse with Maldon sea salt and cocoa nib crisp.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 229.00, NULL, 5.00, true, 1, false),
    ('p1111111-0000-0000-0000-000000000011', 's1111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000004', 'Fudge Walnut Brownie', 'fudge-walnut-brownie', 'Fudgy · Roasted Walnuts', 'Ultra-fudgy warm brownie with roasted walnuts and dark chocolate drizzle.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 199.00, NULL, 5.00, true, 2, false),
    ('p1111111-0000-0000-0000-000000000012', 's1111111-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000004', 'Espresso Ganache Truffles', 'espresso-ganache-truffles', 'Trio of Hand-Rolled Truffles', 'Trio of hand-rolled dark truffles dusted in roasted single-origin cocoa powder.', '/uploads/tiramisu_sweet_indulgence_1791216856815.jpg', 169.00, NULL, 5.00, true, 3, false),

    -- Glazed Moments (Horizontal Slider)
    ('p1111111-0000-0000-0000-000000000013', 's1111111-0000-0000-0000-000000000004', 'c1111111-0000-0000-0000-000000000004', 'Classic Honey-Vanilla Glazed Donut', 'classic-honey-vanilla-glazed-donut', 'Feather-Light Donut', 'Feather-light yeast donut with pure clover honey and Tahitian vanilla glaze.', '/uploads/hero_latte_collectible_1791216830274.jpg', 129.00, NULL, 5.00, true, 1, false),
    ('p1111111-0000-0000-0000-000000000014', 's1111111-0000-0000-0000-000000000004', 'c1111111-0000-0000-0000-000000000004', 'Pistachio Crumble Glazed Donut', 'pistachio-crumble-glazed-donut', 'Brioche · Pistachio Glaze', 'Brioche ring dipped in pistachio white chocolate glaze and crushed roasted kernels.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 149.00, NULL, 5.00, true, 2, false),
    ('p1111111-0000-0000-0000-000000000015', 's1111111-0000-0000-0000-000000000004', 'c1111111-0000-0000-0000-000000000004', 'Cinnamon Caramel Beignets (3 pcs)', 'cinnamon-caramel-beignets', 'Pillow-Soft Beignets', 'Pillow-soft golden beignets tossed in cinnamon sugar with salted caramel dip.', '/uploads/hero_latte_collectible_1791216830274.jpg', 169.00, NULL, 5.00, true, 3, false),

    -- From The Kitchen (Horizontal Slider)
    ('p1111111-0000-0000-0000-000000000016', 's1111111-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000004', 'Artisan Toasted Garlic Bread', 'artisan-toasted-garlic-bread', 'Sourdough · Confit Butter', 'Crisp sourdough baguette smothered in confit garlic butter and fresh garden herbs.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 159.00, NULL, 5.00, true, 1, false),
    ('p1111111-0000-0000-0000-000000000017', 's1111111-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000004', 'Truffle Mushroom Melt Sandwich', 'truffle-mushroom-melt-sandwich', 'Forest Mushrooms · Gruyere', 'Pan-seared forest mushrooms, aged gruyere, and truffle aioli on toasted brioche.', '/uploads/hero_latte_collectible_1791216830274.jpg', 249.00, NULL, 5.00, true, 2, true),
    ('p1111111-0000-0000-0000-000000000018', 's1111111-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000004', 'Gourmet Cafe Burger', 'gourmet-cafe-burger', 'Charred Patty · Secret Sauce', 'Charred patty, caramelized onions, smoked cheddar and secret burger sauce.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 289.00, NULL, 5.00, true, 3, false),
    ('p1111111-0000-0000-0000-000000000019', 's1111111-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000004', 'Herb Grilled Chicken Sandwich', 'herb-grilled-chicken-sandwich', 'Rosemary Chicken · Pesto', 'Rosemary-marinated chicken breast, sun-dried tomatoes and basil pesto on ciabatta.', '/uploads/hero_latte_collectible_1791216830274.jpg', 269.00, NULL, 5.00, true, 4, false),

    -- Crisp & Golden (Horizontal Slider)
    ('p1111111-0000-0000-0000-000000000020', 's1111111-0000-0000-0000-000000000006', 'c1111111-0000-0000-0000-000000000004', 'Sea Salt French Fries', 'sea-salt-french-fries', 'Thin-Cut Golden Fries', 'Thin-cut golden fries tossed in coarse sea salt and served with smoked paprika dip.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 139.00, NULL, 5.00, true, 1, false),
    ('p1111111-0000-0000-0000-000000000021', 's1111111-0000-0000-0000-000000000006', 'c1111111-0000-0000-0000-000000000004', 'Truffle & Parmesan Fries', 'truffle-parmesan-fries', 'White Truffle Oil · Parmigiano', 'Hand-cut russet fries drizzled with white truffle oil and grated 24-month Parmigiano.', '/uploads/hero_latte_collectible_1791216830274.jpg', 189.00, NULL, 5.00, true, 2, true),
    ('p1111111-0000-0000-0000-000000000022', 's1111111-0000-0000-0000-000000000006', 'c1111111-0000-0000-0000-000000000004', 'Spiced Crispy Potato Wedges', 'spiced-crispy-potato-wedges', 'Rustic Wedges · Sour Cream', 'Seasoned rustic potato wedges with garlic sour cream and fresh chives.', '/uploads/hero_secretpresso_banner_1791216817348.jpg', 159.00, NULL, 5.00, true, 3, false)
ON CONFLICT (id) DO NOTHING;

-- 9.7 Customization Options for Classic Americano
INSERT INTO public.product_option_groups (id, product_id, name, description, is_required, min_selections, max_selections, display_order)
VALUES
    ('g1111111-0000-0000-0000-000000000001', 'p1111111-0000-0000-0000-000000000001', 'Cup Size', 'Select your brew portion', true, 1, 1, 1),
    ('g1111111-0000-0000-0000-000000000002', 'p1111111-0000-0000-0000-000000000001', 'Milk Choice', 'Choose your dairy or plant base', false, 0, 1, 2),
    ('g1111111-0000-0000-0000-000000000003', 'p1111111-0000-0000-0000-000000000001', 'Extra Shots & Add-ons', 'Enhance your extraction', false, 0, 3, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_options (id, option_group_id, name, price, is_available, display_order)
VALUES
    ('o1111111-0000-0000-0000-000000000001', 'g1111111-0000-0000-0000-000000000001', 'Regular (240 ml)', 0.00, true, 1),
    ('o1111111-0000-0000-0000-000000000002', 'g1111111-0000-0000-0000-000000000001', 'Large (360 ml)', 40.00, true, 2),
    ('o1111111-0000-0000-0000-000000000003', 'g1111111-0000-0000-0000-000000000002', 'Full Cream Milk', 0.00, true, 1),
    ('o1111111-0000-0000-0000-000000000004', 'g1111111-0000-0000-0000-000000000002', 'Oat Milk (Barista Blend)', 35.00, true, 2),
    ('o1111111-0000-0000-0000-000000000005', 'g1111111-0000-0000-0000-000000000002', 'Almond Milk', 35.00, true, 3),
    ('o1111111-0000-0000-0000-000000000006', 'g1111111-0000-0000-0000-000000000003', 'Extra Ristretto Shot', 30.00, true, 1),
    ('o1111111-0000-0000-0000-000000000007', 'g1111111-0000-0000-0000-000000000003', 'Madagascar Vanilla Syrup', 25.00, true, 2)
ON CONFLICT (id) DO NOTHING;

-- 9.8 Banners
INSERT INTO public.banners (id, title, subtitle, image_url, link_url, display_order, is_active, text_position_x, text_position_y, mobile_text_position_x, mobile_text_position_y)
VALUES
    ('b1111111-0000-0000-0000-000000000001', 'Good Coffee. Great Surprise.', 'MORE THAN JUST COFFEE', '/uploads/hero_secretpresso_banner_1791216817348.jpg', '#coffee-flavours', 1, true, 8.00, 26.00, 5.00, 18.00),
    ('b1111111-0000-0000-0000-000000000002', 'Handcrafted Roasts. Little Treasures.', 'THE SECRET COLLECTION', '/uploads/hero_latte_collectible_1791216830274.jpg', '#sec-velvet-sweets', 2, true, 8.00, 28.00, 5.00, 20.00),
    ('b1111111-0000-0000-0000-000000000003', 'What''s Inside?', 'THE SURPRISE EXPERIENCE', '/uploads/promo_collectible_toys_1791216844306.jpg', '#coffee-flavours', 3, true, 52.00, 26.00, 6.00, 16.00)
ON CONFLICT (id) DO NOTHING;

-- 9.9 Coupons
INSERT INTO public.coupons (code, title, description, discount_type, discount_value, minimum_order_value, maximum_discount, is_active)
VALUES
    ('SECRET10', '10% Instant Secret Discount', 'Save 10% on all specialty brews and pairings', 'percentage', 10.00, 199.00, 100.00, true),
    ('WELCOME50', 'Flat ₹50 Off Welcome Treat', 'Flat ₹50 savings on your first secret order', 'fixed', 50.00, 249.00, 50.00, true),
    ('FREESHIP', 'Free Secret Delivery', 'Free artisanal dispatch on orders above ₹399', 'fixed', 40.00, 399.00, 40.00, true)
ON CONFLICT (code) DO NOTHING;
