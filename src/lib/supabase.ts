import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables safely
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  'https://ifarrpgcdutjzfprwksi.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' &&
    (process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY)) ||
  'sb_publishable_oNHI9Mmzf-0w6Tuhf-q81w_AZyN5pUr';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_address: string;
          landmark: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          full_address: string;
          landmark?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label?: string;
          full_address?: string;
          landmark?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          slug: string | null;
          name: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          display_order: number;
          layout_type: 'grid' | 'horizontal_slider';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          name: string;
          subtitle?: string | null;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          layout_type?: 'grid' | 'horizontal_slider';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string | null;
          name?: string;
          subtitle?: string | null;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          layout_type?: 'grid' | 'horizontal_slider';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          name: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string | null;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          section_id: string | null;
          slug: string | null;
          name: string;
          description: string | null;
          short_description: string | null;
          image_url: string;
          additional_images: string[] | null;
          price: number;
          discounted_price: number | null;
          gst_percentage: number;
          product_type: 'coffee' | 'food' | 'merch' | 'surprise';
          is_available: boolean;
          is_visible: boolean;
          display_order: number;
          badge: string | null;
          surprise_toy_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          section_id?: string | null;
          slug?: string | null;
          name: string;
          description?: string | null;
          short_description?: string | null;
          image_url: string;
          additional_images?: string[] | null;
          price: number;
          discounted_price?: number | null;
          gst_percentage?: number;
          product_type?: 'coffee' | 'food' | 'merch' | 'surprise';
          is_available?: boolean;
          is_visible?: boolean;
          display_order?: number;
          badge?: string | null;
          surprise_toy_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          section_id?: string | null;
          slug?: string | null;
          name?: string;
          description?: string | null;
          short_description?: string | null;
          image_url?: string;
          additional_images?: string[] | null;
          price?: number;
          discounted_price?: number | null;
          gst_percentage?: number;
          product_type?: 'coffee' | 'food' | 'merch' | 'surprise';
          is_available?: boolean;
          is_visible?: boolean;
          display_order?: number;
          badge?: string | null;
          surprise_toy_note?: string | null;
          updated_at?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string;
          banner_type: 'hero' | 'promo' | 'section';
          image_url: string;
          mobile_image_url: string | null;
          desktop_image_url: string | null;
          heading: string | null;
          subtitle: string | null;
          description: string | null;
          cta_text: string | null;
          cta_link: string | null;
          link_url: string | null;
          display_order: number;
          is_active: boolean;
          auto_slide_duration: number;
          text_positions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          banner_type?: 'hero' | 'promo' | 'section';
          image_url: string;
          mobile_image_url?: string | null;
          desktop_image_url?: string | null;
          heading?: string | null;
          subtitle?: string | null;
          description?: string | null;
          cta_text?: string | null;
          cta_link?: string | null;
          link_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          auto_slide_duration?: number;
          text_positions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          banner_type?: 'hero' | 'promo' | 'section';
          image_url?: string;
          mobile_image_url?: string | null;
          desktop_image_url?: string | null;
          heading?: string | null;
          subtitle?: string | null;
          description?: string | null;
          cta_text?: string | null;
          cta_link?: string | null;
          link_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          auto_slide_duration?: number;
          text_positions?: any;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          name: string;
          url: string;
          storage_path: string | null;
          category: string;
          size: number | null;
          mime_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          storage_path?: string | null;
          category?: string;
          size?: number | null;
          mime_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          url?: string;
          storage_path?: string | null;
          category?: string;
          size?: number | null;
          mime_type?: string | null;
          updated_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          customization: any;
          selected_options: any;
          special_instructions: string | null;
          calculated_item_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity?: number;
          unit_price: number;
          customization?: any;
          selected_options?: any;
          special_instructions?: string | null;
          calculated_item_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          customization?: any;
          selected_options?: any;
          special_instructions?: string | null;
          calculated_item_price?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          discount: number;
          coupon_discount: number;
          delivery_fee: number;
          gst: number;
          grand_total: number;
          payment_method: 'cod' | 'card' | 'upi';
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_address: string;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          customer_note: string | null;
          estimated_delivery_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number: string;
          status?: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          discount?: number;
          coupon_discount?: number;
          delivery_fee?: number;
          gst?: number;
          grand_total: number;
          payment_method?: 'cod' | 'card' | 'upi';
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          delivery_address: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_note?: string | null;
          estimated_delivery_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          product_image_snapshot: string | null;
          quantity: number;
          unit_price: number;
          customization_snapshot: any;
          selected_options_snapshot: any;
          special_instructions: string | null;
          item_total: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          product_image_snapshot?: string | null;
          quantity?: number;
          unit_price: number;
          customization_snapshot?: any;
          selected_options_snapshot?: any;
          special_instructions?: string | null;
          item_total: number;
        };
        Update: {
          quantity?: number;
          item_total?: number;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          discount_type: 'percentage' | 'flat';
          discount_value: number;
          minimum_order_value: number;
          maximum_discount: number | null;
          valid_from: string | null;
          valid_until: string | null;
          usage_limit: number | null;
          per_user_limit: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          discount_type: 'percentage' | 'flat';
          discount_value: number;
          minimum_order_value?: number;
          maximum_discount?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
          usage_limit?: number | null;
          per_user_limit?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          title?: string;
          description?: string | null;
          discount_type?: 'percentage' | 'flat';
          discount_value?: number;
          minimum_order_value?: number;
          maximum_discount?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          banner_image_url: string | null;
          discount_percentage: number | null;
          code: string | null;
          is_active: boolean;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          banner_image_url?: string | null;
          discount_percentage?: number | null;
          code?: string | null;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          banner_image_url?: string | null;
          discount_percentage?: number | null;
          code?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          code: string;
          name: string;
          icon_url: string | null;
          is_enabled: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          icon_url?: string | null;
          is_enabled?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon_url?: string | null;
          is_enabled?: boolean;
          display_order?: number;
        };
      };
      website_settings: {
        Row: {
          id: string;
          brand_name: string;
          tagline: string | null;
          announcement: string | null;
          currency_symbol: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          social_links: any;
          mobile_search_suggestions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_name: string;
          tagline?: string | null;
          announcement?: string | null;
          currency_symbol?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          social_links?: any;
          mobile_search_suggestions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          brand_name?: string;
          tagline?: string | null;
          announcement?: string | null;
          currency_symbol?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          social_links?: any;
          mobile_search_suggestions?: any;
          updated_at?: string;
        };
      };
    };
  };
}

// Single reusable Supabase Client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PROJECT_URL = supabaseUrl;
export const SUPABASE_PROJECT_REF = 'ifarrpgcdutjzfprwksi';

// -------------------------------------------------------------
// Storage Upload with 8-Step Safe Upload Flow
// -------------------------------------------------------------
export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
}

export async function uploadToSupabaseStorage(
  bucket: 'banners' | 'products' | 'categories' | 'sections' | 'promotions' | 'avatars' | 'other-media',
  file: File,
  customName?: string
): Promise<UploadResult> {
  // Step 2: Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WEBP, GIF, or SVG image.');
  }

  // Step 3: Validate file size (max 20MB)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds the 20MB limit. Please compress or select a smaller image.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBaseName = (customName || file.name)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);
  const filePath = `${Date.now()}_${cleanBaseName}.${fileExt}`;

  // Step 5: Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.warn(`Supabase Storage upload to bucket "${bucket}" error:`, error.message);
    throw new Error(`Upload to storage failed: ${error.message}`);
  }

  // Step 6: Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
    bucket,
  };
}

// -------------------------------------------------------------
// Realtime Order Subscription Helper
// -------------------------------------------------------------
export function subscribeToSupabaseOrder(
  orderId: string,
  onStatusChange: (status: string, updatedOrder?: any) => void
) {
  const isUuid = orderId.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  const filter = isUuid ? `id=eq.${orderId}` : `order_number=eq.${orderId}`;

  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter,
      },
      (payload) => {
        if (payload.new && (payload.new as any).status) {
          onStatusChange((payload.new as any).status, payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
