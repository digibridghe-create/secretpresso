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
    const queryPromise = supabase.from(tableName as any).select('id').limit(1);
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timeout')), 3000)
    );
    const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
    if (!error && Array.isArray(data)) return true;
    return false;
  } catch {
    return false;
  }
}

function parseCustomerDetails(orderRow: any) {
  let name = orderRow.customer_name || '';
  let phone = orderRow.customer_phone || '';
  let email = orderRow.customer_email || '';
  let address = orderRow.delivery_address || '';
  let notes = '';

  if (orderRow.customer_note && typeof orderRow.customer_note === 'string') {
    const parts = orderRow.customer_note.split(' | ');
    const noteParts: string[] = [];
    for (const part of parts) {
      if (part.startsWith('Customer: ') && !name) {
        name = part.replace('Customer: ', '').trim();
      } else if (part.startsWith('Phone: ') && !phone) {
        phone = part.replace('Phone: ', '').trim();
      } else if (part.startsWith('Email: ') && !email) {
        email = part.replace('Email: ', '').trim();
      } else if (part.startsWith('Address: ') && !address) {
        address = part.replace('Address: ', '').trim();
      } else if (part.startsWith('Note: ')) {
        noteParts.push(part.replace('Note: ', '').trim());
      } else {
        noteParts.push(part.trim());
      }
    }
    notes = noteParts.join(' | ');
  } else if (orderRow.customer_note) {
    notes = String(orderRow.customer_note);
  }

  return {
    name: name || 'Customer',
    phone: phone || '',
    email: email || '',
    address: address || 'Bengaluru, India',
    notes: notes || undefined,
  };
}

export const supabaseService = {
  // Check if Supabase cloud tables are online
  async checkConnection(): Promise<{ connected: boolean; tablesExist: boolean }> {
    try {
      const queryPromise = supabase.from('products' as any).select('id').limit(1);
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase request timeout')), 1200)
      );
      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
      if (error && error.code === 'PGRST205') {
        return { connected: true, tablesExist: false };
      }
      if (!error && Array.isArray(data)) {
        return { connected: true, tablesExist: true };
      }
      return { connected: false, tablesExist: false };
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
        return data.map((o) => {
          const cust = parseCustomerDetails(o);
          return {
            id: o.order_number || o.id,
            customerName: cust.name,
            customerEmail: cust.email,
            customerPhone: cust.phone,
            deliveryAddress: cust.address,
            notes: cust.notes,
            items: [], // loaded individually when querying single order
            subtotal: Number(o.subtotal || 0),
            tax: Number(o.gst_amount ?? o.gst ?? 0),
            deliveryFee: Number(o.delivery_charge ?? o.delivery_fee ?? 0),
            total: Number(o.total_amount ?? o.grand_total ?? 0),
            status: o.status as any,
            paymentMethod: o.payment_method,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
          };
        });
      }
    }

    const res = await fetch('/api/orders');
    const json = await res.json();
    return json.data;
  },

  async getOrder(id: string): Promise<Order> {
    const isReady = await canQueryTable('orders');
    if (isReady) {
      const isUuid = id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const query = isUuid
        ? supabase.from('orders').select('*').eq('id', id).maybeSingle()
        : supabase.from('orders').select('*').eq('order_number', id).maybeSingle();

      const { data: orderData, error } = await query;

      if (!error && orderData) {
        const cust = parseCustomerDetails(orderData);
        // Fetch order items snapshots
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);

        return {
          id: orderData.order_number || orderData.id,
          customerName: cust.name,
          customerEmail: cust.email,
          customerPhone: cust.phone,
          deliveryAddress: cust.address,
          notes: cust.notes,
          items: (itemsData || []).map((it) => ({
            productId: it.product_id || '',
            name: it.product_name_snapshot,
            price: Number(it.unit_price),
            quantity: it.quantity,
            image: it.product_image_snapshot || '',
            selectedCustomizations: it.customization_data || it.selected_options_snapshot || [],
            specialInstructions: it.special_instructions || undefined,
          })),
          subtotal: Number(orderData.subtotal || 0),
          tax: Number(orderData.gst_amount ?? orderData.gst ?? 0),
          deliveryFee: Number(orderData.delivery_charge ?? orderData.delivery_fee ?? 0),
          total: Number(orderData.total_amount ?? orderData.grand_total ?? 0),
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
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const customerName = orderData.customerName || 'Customer';
        const customerPhone = orderData.customerPhone || '';
        const customerEmail = orderData.customerEmail || '';
        const deliveryAddress = orderData.deliveryAddress || 'Bengaluru, India';
        const rawNotes = orderData.notes || '';

        const fullNote = [
          `Customer: ${customerName}`,
          customerPhone ? `Phone: ${customerPhone}` : '',
          customerEmail ? `Email: ${customerEmail}` : '',
          deliveryAddress ? `Address: ${deliveryAddress}` : '',
          rawNotes ? `Note: ${rawNotes}` : '',
        ]
          .filter(Boolean)
          .join(' | ');

        // If customer is signed in, save/link their address in addresses table and update profile
        let linkedAddressId: string | null = null;
        if (user?.id && deliveryAddress) {
          try {
            const { data: addrData } = await supabase
              .from('addresses')
              .insert({
                user_id: user.id,
                label: 'Order Delivery Address',
                full_address: deliveryAddress,
                is_default: true,
              })
              .select('id')
              .single();
            if (addrData?.id) {
              linkedAddressId = addrData.id;
            }
          } catch (addrErr) {
            console.warn('Addresses sync notice:', addrErr);
          }
        }

        if (user?.id) {
          try {
            await supabase
              .from('profiles')
              .update({
                full_name: customerName,
                phone: customerPhone || undefined,
                email: customerEmail || undefined,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);
          } catch (profileErr) {
            console.warn('Profile sync on order notice:', profileErr);
          }
        }

        const paymentMethodStr =
          orderData.paymentMethod === 'upi'
            ? 'UPI'
            : orderData.paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : 'Cash on Delivery';

        const paymentStatusStr = orderData.paymentMethod === 'cod' ? 'pending' : 'paid';

        // Primary insert matching live Supabase backend schema
        const orderPayload: any = {
          user_id: user?.id || null,
          address_id: linkedAddressId,
          status: 'preparing',
          subtotal: Number(orderData.subtotal) || 0,
          discount_amount: Number((orderData as any).discount || 0),
          coupon_discount: Number((orderData as any).couponDiscount || 0),
          delivery_charge: Number(orderData.deliveryFee) || 0,
          gst_amount: Number(orderData.tax) || 0,
          total_amount: Number(orderData.total) || 0,
          payment_method: paymentMethodStr,
          payment_status: paymentStatusStr,
          customer_note: fullNote,
        };

        let createdOrder: any = null;
        const { data: inserted, error: orderError } = await supabase
          .from('orders')
          .insert(orderPayload)
          .select()
          .single();

        if (orderError) {
          console.warn('Supabase order creation primary schema error, trying alternate schema:', orderError.message);
          // Fallback schema if table has alternative column names
          const altPayload: any = {
            user_id: user?.id || null,
            order_number: `ORD-${Date.now().toString().slice(-4)}`,
            status: 'preparing',
            subtotal: Number(orderData.subtotal) || 0,
            discount: 0,
            coupon_discount: 0,
            delivery_fee: Number(orderData.deliveryFee) || 0,
            gst: Number(orderData.tax) || 0,
            grand_total: Number(orderData.total) || 0,
            payment_method: orderData.paymentMethod || 'cod',
            payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
            delivery_address: deliveryAddress,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            customer_note: rawNotes,
          };
          const { data: altInserted } = await supabase
            .from('orders')
            .insert(altPayload)
            .select()
            .single();

          if (altInserted) {
            createdOrder = altInserted;
          }
        } else {
          createdOrder = inserted;
        }

        if (createdOrder) {
          // Insert order items snapshots
          if (orderData.items && orderData.items.length > 0) {
            const itemsPayload = orderData.items.map((it) => ({
              order_id: createdOrder.id,
              product_id: it.productId?.length === 36 ? it.productId : null,
              product_name_snapshot: it.name,
              product_image_snapshot: it.image || null,
              quantity: it.quantity,
              unit_price: Number(it.price),
              total_price: Number(it.price) * it.quantity,
              customization_data: it.selectedCustomizations || [],
              special_instructions: it.specialInstructions || null,
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
            if (itemsError) {
              console.warn('Could not insert order_items to Supabase:', itemsError.message);
            }
          }

          // If customer is signed in, also save/link their address in addresses table
          if (user?.id && deliveryAddress) {
            supabase
              .from('addresses')
              .insert({
                user_id: user.id,
                label: 'Recent Delivery Address',
                full_address: deliveryAddress,
                is_default: true,
              })
              .then(() => {})
              .catch(() => {});
          }

          // Mirror order to local server as backup
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderData,
              id: createdOrder.order_number,
            }),
          }).catch(() => {});

          return {
            id: createdOrder.order_number || createdOrder.id,
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            notes: rawNotes || undefined,
            items: orderData.items || [],
            subtotal: Number(createdOrder.subtotal || orderData.subtotal || 0),
            tax: Number(createdOrder.gst_amount ?? createdOrder.gst ?? orderData.tax ?? 0),
            deliveryFee: Number(createdOrder.delivery_charge ?? createdOrder.delivery_fee ?? orderData.deliveryFee ?? 0),
            total: Number(createdOrder.total_amount ?? createdOrder.grand_total ?? orderData.total ?? 0),
            status: createdOrder.status as any,
            paymentMethod: createdOrder.payment_method || orderData.paymentMethod || 'cod',
            createdAt: createdOrder.created_at,
            updatedAt: createdOrder.updated_at,
          };
        }
      } catch (err) {
        console.error('Supabase createOrder error, falling back to local server:', err);
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
      const isUuid = id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('orders')
          .update({ status: status as any, updated_at: new Date().toISOString() })
          .eq('id', id);
      } else {
        await supabase
          .from('orders')
          .update({ status: status as any, updated_at: new Date().toISOString() })
          .eq('order_number', id);
      }
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
