import { supabase, uploadToSupabaseStorage } from '../lib/supabase';
import {
  Section,
  Product,
  Category,
  Banner,
  MediaItem,
  Order,
  WebsiteSettings,
  BootstrapResponse,
  CartItem,
} from '../types';

// Detect if Supabase table is accessible
async function canQueryTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName as any).select('id').limit(1);
    if (!error) return true;
    if (error.code === 'PGRST205') {
      // Table not yet created in Supabase schema cache
      return false;
    }
    // Other errors (e.g., empty or auth) mean the table exists
    return true;
  } catch {
    return false;
  }
}

export const supabaseService = {
  // Check if Supabase cloud tables are online
  async checkConnection(): Promise<{ connected: boolean; tablesExist: boolean }> {
    try {
      const { data, error } = await supabase.from('products' as any).select('id').limit(1);
      if (error && error.code === 'PGRST205') {
        return { connected: true, tablesExist: false };
      }
      return { connected: true, tablesExist: true };
    } catch {
      return { connected: false, tablesExist: false };
    }
  },

  // -------------------------------------------------------------
  // BOOTSTRAP / INITIAL LOAD
  // -------------------------------------------------------------
  async getBootstrap(): Promise<BootstrapResponse> {
    const hasProducts = await canQueryTable('products');

    if (hasProducts) {
      try {
        const [
          sectionsRes,
          categoriesRes,
          productsRes,
          bannersRes,
          mediaRes,
          ordersRes,
          settingsRes,
        ] = await Promise.all([
          this.getSections(),
          this.getCategories(),
          this.getProducts(),
          this.getBanners(),
          this.getMedia(),
          this.getOrders(),
          this.getSettings(),
        ]);

        return {
          sections: sectionsRes,
          categories: categoriesRes,
          products: productsRes,
          banners: bannersRes,
          media: mediaRes,
          orders: ordersRes,
          settings: settingsRes,
        };
      } catch (err) {
        console.warn('Falling back to local API bootstrap:', err);
      }
    }

    // Fallback to local server API if cloud tables are initializing
    const res = await fetch('/api/bootstrap');
    const json = await res.json();
    return json.data;
  },

  // -------------------------------------------------------------
  // SECTIONS
  // -------------------------------------------------------------
  async getSections(): Promise<Section[]> {
    const isReady = await canQueryTable('sections');
    if (isReady) {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((s) => ({
          id: s.id,
          name: s.name,
          subtitle: s.subtitle || '',
          description: s.description || '',
          image: s.image_url,
          displayStyle: s.layout_type,
          displayOrder: s.display_order,
          isVisible: s.is_active,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
        }));
      }
    }

    const res = await fetch('/api/sections');
    const json = await res.json();
    return json.data;
  },

  async createSection(sectionData: Partial<Section>): Promise<Section> {
    const isReady = await canQueryTable('sections');
    if (isReady) {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          name: sectionData.name || 'New Section',
          subtitle: sectionData.subtitle || '',
          description: sectionData.description || '',
          image_url: sectionData.image || null,
          display_order: sectionData.displayOrder || 1,
          layout_type: sectionData.displayStyle || 'horizontal_slider',
          is_active: sectionData.isVisible ?? true,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          subtitle: data.subtitle || '',
          description: data.description || '',
          image: data.image_url,
          displayStyle: data.layout_type,
          displayOrder: data.display_order,
          isVisible: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData),
    });
    const json = await res.json();
    return json.data;
  },

  async updateSection(id: string, updates: Partial<Section>): Promise<Section> {
    const isReady = await canQueryTable('sections');
    if (isReady) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.displayStyle !== undefined) payload.layout_type = updates.displayStyle;
      if (updates.isVisible !== undefined) payload.is_active = updates.isVisible;

      const { data, error } = await supabase
        .from('sections')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          subtitle: data.subtitle || '',
          description: data.description || '',
          image: data.image_url,
          displayStyle: data.layout_type,
          displayOrder: data.display_order,
          isVisible: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch(`/api/sections/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteSection(id: string): Promise<void> {
    const isReady = await canQueryTable('sections');
    if (isReady) {
      await supabase.from('sections').delete().eq('id', id);
    }
    await fetch(`/api/sections/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async reorderSections(orderedIds: string[]): Promise<Section[]> {
    const isReady = await canQueryTable('sections');
    if (isReady) {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('sections')
          .update({ display_order: i + 1, updated_at: new Date().toISOString() })
          .eq('id', orderedIds[i]);
      }
      return this.getSections();
    }

    const res = await fetch('/api/sections/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();
    return json.data;
  },

  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  async getProducts(): Promise<Product[]> {
    const isReady = await canQueryTable('products');
    if (isReady) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: Number(p.price),
          salePrice: p.discounted_price ? Number(p.discounted_price) : null,
          image: p.image_url,
          additionalImages: p.additional_images || [],
          categoryId: p.category_id || '',
          sectionId: p.section_id || '',
          productType: p.product_type,
          availability: p.is_available,
          displayOrder: p.display_order,
          isVisible: p.is_visible,
          badge: p.badge || undefined,
          surpriseToyNote: p.surprise_toy_note || undefined,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
      }
    }

    const res = await fetch('/api/products');
    const json = await res.json();
    return json.data;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const isReady = await canQueryTable('products');
    if (isReady) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name || 'New Brew',
          description: productData.description || '',
          price: Number(productData.price) || 0,
          discounted_price: productData.salePrice ? Number(productData.salePrice) : null,
          image_url: productData.image || '',
          additional_images: productData.additionalImages || [],
          category_id: productData.categoryId || null,
          section_id: productData.sectionId || null,
          product_type: productData.productType || 'coffee',
          is_available: productData.availability ?? true,
          is_visible: productData.isVisible ?? true,
          display_order: productData.displayOrder || 1,
          badge: productData.badge || null,
          surprise_toy_note: productData.surpriseToyNote || null,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: Number(data.price),
          salePrice: data.discounted_price ? Number(data.discounted_price) : null,
          image: data.image_url,
          additionalImages: data.additional_images || [],
          categoryId: data.category_id || '',
          sectionId: data.section_id || '',
          productType: data.product_type,
          availability: data.is_available,
          displayOrder: data.display_order,
          isVisible: data.is_visible,
          badge: data.badge || undefined,
          surpriseToyNote: data.surprise_toy_note || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    return json.data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const isReady = await canQueryTable('products');
    if (isReady) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.price !== undefined) payload.price = Number(updates.price);
      if (updates.salePrice !== undefined)
        payload.discounted_price = updates.salePrice ? Number(updates.salePrice) : null;
      if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.categoryId !== undefined) payload.category_id = updates.categoryId || null;
      if (updates.sectionId !== undefined) payload.section_id = updates.sectionId || null;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.availability !== undefined) payload.is_available = updates.availability;
      if (updates.isVisible !== undefined) payload.is_visible = updates.isVisible;
      if (updates.badge !== undefined) payload.badge = updates.badge;

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: Number(data.price),
          salePrice: data.discounted_price ? Number(data.discounted_price) : null,
          image: data.image_url,
          additionalImages: data.additional_images || [],
          categoryId: data.category_id || '',
          sectionId: data.section_id || '',
          productType: data.product_type,
          availability: data.is_available,
          displayOrder: data.display_order,
          isVisible: data.is_visible,
          badge: data.badge || undefined,
          surpriseToyNote: data.surprise_toy_note || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteProduct(id: string): Promise<void> {
    const isReady = await canQueryTable('products');
    if (isReady) {
      await supabase.from('products').delete().eq('id', id);
    }
    await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------
  async getCategories(): Promise<Category[]> {
    const isReady = await canQueryTable('categories');
    if (isReady) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          image: c.image_url,
          displayOrder: c.display_order,
          isVisible: c.is_active,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
      }
    }

    const res = await fetch('/api/categories');
    const json = await res.json();
    return json.data;
  },

  async createCategory(catData: Partial<Category>): Promise<Category> {
    const isReady = await canQueryTable('categories');
    if (isReady) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: catData.name || 'New Category',
          description: catData.description || '',
          image_url: catData.image || null,
          display_order: catData.displayOrder || 1,
          is_active: catData.isVisible ?? true,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          image: data.image_url,
          displayOrder: data.display_order,
          isVisible: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData),
    });
    const json = await res.json();
    return json.data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const isReady = await canQueryTable('categories');
    if (isReady) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.isVisible !== undefined) payload.is_active = updates.isVisible;

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          image: data.image_url,
          displayOrder: data.display_order,
          isVisible: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const isReady = await canQueryTable('categories');
    if (isReady) {
      await supabase.from('categories').delete().eq('id', id);
    }
    await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // -------------------------------------------------------------
  // BANNERS
  // -------------------------------------------------------------
  async getBanners(): Promise<Banner[]> {
    const isReady = await canQueryTable('banners');
    if (isReady) {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((b) => ({
          id: b.id,
          name: b.title,
          bannerType: b.banner_type,
          image: b.image_url,
          heading: b.heading || '',
          subtitle: b.subtitle || '',
          description: b.description || '',
          ctaText: b.cta_text || '',
          ctaLink: b.cta_link || '',
          displayOrder: b.display_order,
          isVisible: b.is_active,
          slideDuration: b.auto_slide_duration || 5,
          textPositions: b.text_positions || {
            desktop: { x: 8, y: 25, fontSize: 48, alignment: 'left', color: '#ffffff', visible: true },
          },
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }));
      }
    }

    const res = await fetch('/api/banners');
    const json = await res.json();
    return json.data;
  },

  async createBanner(bannerData: Partial<Banner>): Promise<Banner> {
    const isReady = await canQueryTable('banners');
    if (isReady) {
      const { data, error } = await supabase
        .from('banners')
        .insert({
          title: bannerData.name || 'New Banner',
          banner_type: bannerData.bannerType || 'hero',
          image_url: bannerData.image || '',
          heading: bannerData.heading || '',
          subtitle: bannerData.subtitle || '',
          description: bannerData.description || '',
          cta_text: bannerData.ctaText || '',
          cta_link: bannerData.ctaLink || '',
          display_order: bannerData.displayOrder || 1,
          is_active: bannerData.isVisible ?? true,
          auto_slide_duration: bannerData.slideDuration || 5,
          text_positions: bannerData.textPositions || {},
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.title,
          bannerType: data.banner_type,
          image: data.image_url,
          heading: data.heading || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          ctaText: data.cta_text || '',
          ctaLink: data.cta_link || '',
          displayOrder: data.display_order,
          isVisible: data.is_active,
          slideDuration: data.auto_slide_duration,
          textPositions: data.text_positions,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerData),
    });
    const json = await res.json();
    return json.data;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    const isReady = await canQueryTable('banners');
    if (isReady) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.title = updates.name;
      if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.heading !== undefined) payload.heading = updates.heading;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.ctaText !== undefined) payload.cta_text = updates.ctaText;
      if (updates.ctaLink !== undefined) payload.cta_link = updates.ctaLink;
      if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
      if (updates.isVisible !== undefined) payload.is_active = updates.isVisible;
      if (updates.slideDuration !== undefined) payload.auto_slide_duration = updates.slideDuration;
      if (updates.textPositions !== undefined) payload.text_positions = updates.textPositions;

      const { data, error } = await supabase
        .from('banners')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.title,
          bannerType: data.banner_type,
          image: data.image_url,
          heading: data.heading || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          ctaText: data.cta_text || '',
          ctaLink: data.cta_link || '',
          displayOrder: data.display_order,
          isVisible: data.is_active,
          slideDuration: data.auto_slide_duration,
          textPositions: data.text_positions,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteBanner(id: string): Promise<void> {
    const isReady = await canQueryTable('banners');
    if (isReady) {
      await supabase.from('banners').delete().eq('id', id);
    }
    await fetch(`/api/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // -------------------------------------------------------------
  // MEDIA LIBRARY & UPLOADS
  // -------------------------------------------------------------
  async getMedia(): Promise<MediaItem[]> {
    const isReady = await canQueryTable('media');
    if (isReady) {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((m) => ({
          id: m.id,
          name: m.name,
          url: m.url,
          category: m.category as any,
          size: m.size || 0,
          mimeType: m.mime_type || 'image/jpeg',
          createdAt: m.created_at,
          updatedAt: m.updated_at,
        }));
      }
    }

    const res = await fetch('/api/media');
    const json = await res.json();
    return json.data;
  },

  async uploadMedia(file: File, name?: string, category: string = 'other'): Promise<MediaItem> {
    // Try uploading to Supabase Storage first
    try {
      const bucket =
        category === 'hero' || category === 'banners'
          ? 'banners'
          : category === 'coffee' || category === 'food'
          ? 'products'
          : 'other-media';

      const uploadResult = await uploadToSupabaseStorage(bucket as any, file, name);

      // Record in media table if table exists
      const isReady = await canQueryTable('media');
      if (isReady) {
        const { data, error } = await supabase
          .from('media')
          .insert({
            name: name || file.name,
            url: uploadResult.url,
            storage_path: uploadResult.path,
            category: category,
            size: file.size,
            mime_type: file.type,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            url: data.url,
            category: data.category as any,
            size: data.size || 0,
            mimeType: data.mime_type || file.type,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      }

      return {
        id: `med-${Date.now()}`,
        name: name || file.name,
        url: uploadResult.url,
        category: category as any,
        size: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      };
    } catch (storageErr) {
      console.warn('Supabase storage upload fallback to local API:', storageErr);
    }

    // Fallback to local server upload
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    formData.append('category', category);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image file');
    const json = await res.json();
    return json.data;
  },

  async deleteMedia(id: string): Promise<void> {
    const isReady = await canQueryTable('media');
    if (isReady) {
      await supabase.from('media').delete().eq('id', id);
    }
    await fetch(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  // -------------------------------------------------------------
  // ORDERS & CHECKOUT
  // -------------------------------------------------------------
  async getOrders(): Promise<Order[]> {
    const isReady = await canQueryTable('orders');
    if (isReady) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((o) => ({
          id: o.order_number || o.id,
          customerName: o.customer_name || 'Guest',
          customerEmail: o.customer_email || '',
          customerPhone: o.customer_phone || '',
          deliveryAddress: o.delivery_address,
          notes: o.customer_note || undefined,
          items: [], // loaded separately or cached
          subtotal: Number(o.subtotal),
          tax: Number(o.gst),
          deliveryFee: Number(o.delivery_fee),
          total: Number(o.grand_total),
          status: o.status as any,
          paymentMethod: o.payment_method,
          createdAt: o.created_at,
          updatedAt: o.updated_at,
        }));
      }
    }

    const res = await fetch('/api/orders');
    const json = await res.json();
    return json.data;
  },

  async getOrder(id: string): Promise<Order> {
    const isReady = await canQueryTable('orders');
    if (isReady) {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id},order_number.eq.${id}`)
        .maybeSingle();

      if (!error && orderData) {
        // Fetch order items snapshots
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);

        return {
          id: orderData.order_number || orderData.id,
          customerName: orderData.customer_name || 'Customer',
          customerEmail: orderData.customer_email || '',
          customerPhone: orderData.customer_phone || '',
          deliveryAddress: orderData.delivery_address,
          notes: orderData.customer_note || undefined,
          items: (itemsData || []).map((it) => ({
            productId: it.product_id || '',
            name: it.product_name_snapshot,
            price: Number(it.unit_price),
            quantity: it.quantity,
            image: it.product_image_snapshot || '',
            selectedCustomizations: it.selected_options_snapshot || [],
            specialInstructions: it.special_instructions || undefined,
          })),
          subtotal: Number(orderData.subtotal),
          tax: Number(orderData.gst),
          deliveryFee: Number(orderData.delivery_fee),
          total: Number(orderData.grand_total),
          status: orderData.status as any,
          paymentMethod: orderData.payment_method,
          createdAt: orderData.created_at,
          updatedAt: orderData.updated_at,
        };
      }
    }

    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Order not found');
    const json = await res.json();
    return json.data;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const isReady = await canQueryTable('orders');
    if (isReady) {
      const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: createdOrder, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          order_number: orderNumber,
          status: 'preparing',
          subtotal: Number(orderData.subtotal) || 0,
          discount: 0,
          coupon_discount: 0,
          delivery_fee: Number(orderData.deliveryFee) || 0,
          gst: Number(orderData.tax) || 0,
          grand_total: Number(orderData.total) || 0,
          payment_method: orderData.paymentMethod || 'cod',
          payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
          delivery_address: orderData.deliveryAddress || 'Bengaluru, India',
          customer_name: orderData.customerName || 'Customer',
          customer_email: orderData.customerEmail || '',
          customer_phone: orderData.customerPhone || '',
          customer_note: orderData.notes || '',
        })
        .select()
        .single();

      if (!error && createdOrder) {
        // Insert order items snapshots
        if (orderData.items && orderData.items.length > 0) {
          const orderItemsPayload = orderData.items.map((it) => ({
            order_id: createdOrder.id,
            product_id: it.productId || null,
            product_name_snapshot: it.name,
            product_image_snapshot: it.image,
            quantity: it.quantity,
            unit_price: Number(it.price),
            customization_snapshot: it.selectedCustomizations || [],
            selected_options_snapshot: it.selectedCustomizations || [],
            special_instructions: it.specialInstructions || null,
            item_total: Number(it.price) * it.quantity,
          }));

          await supabase.from('order_items').insert(orderItemsPayload);
        }

        return {
          id: createdOrder.order_number,
          customerName: createdOrder.customer_name || 'Customer',
          customerEmail: createdOrder.customer_email || '',
          customerPhone: createdOrder.customer_phone || '',
          deliveryAddress: createdOrder.delivery_address,
          notes: createdOrder.customer_note || undefined,
          items: orderData.items || [],
          subtotal: Number(createdOrder.subtotal),
          tax: Number(createdOrder.gst),
          deliveryFee: Number(createdOrder.delivery_fee),
          total: Number(createdOrder.grand_total),
          status: 'preparing',
          paymentMethod: createdOrder.payment_method,
          createdAt: createdOrder.created_at,
          updatedAt: createdOrder.updated_at,
        };
      }
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const json = await res.json();
    return json.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const isReady = await canQueryTable('orders');
    if (isReady) {
      await supabase
        .from('orders')
        .update({ status: status as any, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},order_number.eq.${id}`);
    }

    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const json = await res.json();
    return json.data;
  },

  // -------------------------------------------------------------
  // WEBSITE SETTINGS
  // -------------------------------------------------------------
  async getSettings(): Promise<WebsiteSettings> {
    const isReady = await canQueryTable('website_settings');
    if (isReady) {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          brandName: data.brand_name,
          tagline: data.tagline || 'Good Coffee. Great Surprise.',
          announcement: data.announcement || '',
          currencySymbol: data.currency_symbol || '₹',
          phone: data.phone || '+91 98200 45678',
          email: data.email || 'concierge@secretpresso.coffee',
          address: data.address || 'Indiranagar, Bangalore',
          socialLinks: data.social_links || {},
          mobileSearchSuggestions: data.mobile_search_suggestions || [],
          updatedAt: data.updated_at,
        };
      }
    }

    const res = await fetch('/api/settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const isReady = await canQueryTable('website_settings');
    if (isReady) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (settings.brandName !== undefined) payload.brand_name = settings.brandName;
      if (settings.tagline !== undefined) payload.tagline = settings.tagline;
      if (settings.announcement !== undefined) payload.announcement = settings.announcement;
      if (settings.currencySymbol !== undefined) payload.currency_symbol = settings.currencySymbol;
      if (settings.phone !== undefined) payload.phone = settings.phone;
      if (settings.email !== undefined) payload.email = settings.email;
      if (settings.address !== undefined) payload.address = settings.address;
      if (settings.socialLinks !== undefined) payload.social_links = settings.socialLinks;
      if (settings.mobileSearchSuggestions !== undefined)
        payload.mobile_search_suggestions = settings.mobileSearchSuggestions;

      await supabase.from('website_settings').update(payload).neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    return json.data;
  },

  // -------------------------------------------------------------
  // CUSTOMER ADDRESSES
  // -------------------------------------------------------------
  async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) return [];
    return data;
  },

  async saveAddress(userId: string, addressData: any) {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        label: addressData.label || 'Home',
        full_address: addressData.fullAddress,
        landmark: addressData.landmark || null,
        city: addressData.city || 'Bengaluru',
        state: addressData.state || 'Karnataka',
        postal_code: addressData.postalCode || null,
        is_default: addressData.isDefault || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
