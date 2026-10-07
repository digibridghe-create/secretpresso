# SECRETpresso Supabase Database Setup & Schema

## Project Details
- **Project Ref ID:** `ifarrpgcdutjzfprwksi`
- **Project URL:** `https://ifarrpgcdutjzfprwksi.supabase.co`
- **Publishable Key:** `sb_publishable_oNHI9Mmzf-0w6Tuhf-q81w_AZyN5pUr`

## Applying Schema Migration
To apply the database schema:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/ifarrpgcdutjzfprwksi).
2. Go to the **SQL Editor**.
3. Open `supabase/migrations/20261007_secretpresso_schema.sql`.
4. Paste and click **Run**.

## Tables Created
1. `profiles` — Linked to Supabase Auth `auth.users` with automatic sign-up trigger and `customer`/`admin` roles.
2. `addresses` — Customer delivery addresses with default selection.
3. `sections` — Homepage dynamic sections with layout type (`grid`, `horizontal_slider`).
4. `categories` — Coffee & food categories.
5. `products` — Complete 23-product catalogue with pricing, surprise toy notes, and badges.
6. `product_option_groups` & `product_options` — Artisanal customization (size, milk choice, sugar level, ice level, toppings, extras).
7. `banners` — Dynamic hero & promo banners with responsive text coordinates.
8. `media` — Media library with Storage links.
9. `carts` & `cart_items` — Persistent carts across navigation, refresh, and login.
10. `orders` & `order_items` — Historical snapshots of orders, live status, and UPI/COD/Card payment records.
11. `coupons` & `coupon_usages` — Server/database coupon discounts.
12. `offers` — Promotions & seasonal specials.
13. `payment_methods` — UPI (Google Pay, PhonePe, Paytm, Other UPI), Card, Cash on Delivery.
14. `website_settings` — Brand details, announcement banner, contact info, search suggestions.

## Storage Buckets
- `banners`, `products`, `categories`, `sections`, `promotions`, `avatars`, `other-media`

## Row Level Security (RLS)
- Enabled on all tables.
- Public read access for active catalogue items.
- Strict user isolation for private customer profiles, addresses, carts, and orders (`auth.uid() = user_id`).
- Admin write permissions protected by `is_admin()` function.
