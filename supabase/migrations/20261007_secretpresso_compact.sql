CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'SP-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 1. PROFILES
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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, email, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Valued Customer'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
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
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ADDRESSES
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
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. SECTIONS
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
CREATE TRIGGER trg_sections_updated_at BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. CATEGORIES
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
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. PRODUCTS
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
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. PRODUCT OPTION GROUPS
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
CREATE TRIGGER trg_product_option_groups_updated_at BEFORE UPDATE ON public.product_option_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. PRODUCT OPTIONS
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
CREATE TRIGGER trg_product_options_updated_at BEFORE UPDATE ON public.product_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. BANNERS
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
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. CARTS
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. CART ITEMS
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
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. COUPONS
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
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. ORDERS
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
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. ORDER ITEMS
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

-- 14. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_status_history (order_id, status, note)
        VALUES (NEW.id, NEW.status, 'Order status: ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_orders_status_history ON public.orders;
CREATE TRIGGER trg_orders_status_history AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- 15. PAYMENT METHODS
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
CREATE TRIGGER trg_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. SEARCH PLACEHOLDERS
CREATE TABLE IF NOT EXISTS public.search_placeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phrase TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_search_placeholders_updated_at ON public.search_placeholders;
CREATE TRIGGER trg_search_placeholders_updated_at BEFORE UPDATE ON public.search_placeholders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 18. ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_section_id ON public.products(section_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ENABLE ROW LEVEL SECURITY
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

-- POLICIES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_all" ON public.addresses;
CREATE POLICY "addresses_all" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "public_read_sections" ON public.sections;
CREATE POLICY "public_read_sections" ON public.sections FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_sections" ON public.sections;
CREATE POLICY "admin_manage_sections" ON public.sections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_categories" ON public.categories;
CREATE POLICY "admin_manage_categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products FOR SELECT USING (is_available = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_products" ON public.products;
CREATE POLICY "admin_manage_products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_option_groups" ON public.product_option_groups;
CREATE POLICY "public_read_option_groups" ON public.product_option_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_manage_option_groups" ON public.product_option_groups;
CREATE POLICY "admin_manage_option_groups" ON public.product_option_groups FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_options" ON public.product_options;
CREATE POLICY "public_read_options" ON public.product_options FOR SELECT USING (is_available = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_options" ON public.product_options;
CREATE POLICY "admin_manage_options" ON public.product_options FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_banners" ON public.banners;
CREATE POLICY "public_read_banners" ON public.banners FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_banners" ON public.banners;
CREATE POLICY "admin_manage_banners" ON public.banners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
CREATE POLICY "public_read_coupons" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_coupons" ON public.coupons;
CREATE POLICY "admin_manage_coupons" ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_payment_methods" ON public.payment_methods;
CREATE POLICY "public_read_payment_methods" ON public.payment_methods FOR SELECT USING (is_enabled = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_payment_methods" ON public.payment_methods;
CREATE POLICY "admin_manage_payment_methods" ON public.payment_methods FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin_manage_site_settings" ON public.site_settings;
CREATE POLICY "admin_manage_site_settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "public_read_search_placeholders" ON public.search_placeholders;
CREATE POLICY "public_read_search_placeholders" ON public.search_placeholders FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "admin_manage_search_placeholders" ON public.search_placeholders;
CREATE POLICY "admin_manage_search_placeholders" ON public.search_placeholders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "carts_all" ON public.carts;
CREATE POLICY "carts_all" ON public.carts FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL) WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "cart_items_all" ON public.cart_items;
CREATE POLICY "cart_items_all" ON public.cart_items FOR ALL 
USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)))
WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)));

DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin() OR user_id IS NULL);
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "orders_update" ON public.orders;
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin() OR orders.user_id IS NULL)));
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "order_status_history_select" ON public.order_status_history;
CREATE POLICY "order_status_history_select" ON public.order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND (orders.user_id = auth.uid() OR public.is_admin() OR orders.user_id IS NULL)));

DROP POLICY IF EXISTS "admin_logs_manage" ON public.admin_activity_logs;
CREATE POLICY "admin_logs_manage" ON public.admin_activity_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
