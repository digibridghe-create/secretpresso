import { BootstrapResponse, Section, Product, Category, Banner, MediaItem, Order, WebsiteSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Bootstrap all data in a single clean call
  async getBootstrap(): Promise<BootstrapResponse> {
    const res = await fetch(`${API_BASE}/bootstrap`);
    if (!res.ok) throw new Error('Failed to load application data');
    const json = await res.json();
    return json.data;
  },

  // Sections
  async getSections(): Promise<Section[]> {
    const res = await fetch(`${API_BASE}/sections`);
    if (!res.ok) throw new Error('Failed to load sections');
    const json = await res.json();
    return json.data;
  },

  async createSection(data: Partial<Section>): Promise<Section> {
    const res = await fetch(`${API_BASE}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create section');
    const json = await res.json();
    return json.data;
  },

  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    const res = await fetch(`${API_BASE}/sections/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update section');
    const json = await res.json();
    return json.data;
  },

  async reorderSections(orderedIds: string[]): Promise<Section[]> {
    const res = await fetch(`${API_BASE}/sections/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder sections');
    const json = await res.json();
    return json.data;
  },

  async deleteSection(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sections/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete section');
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to load products');
    const json = await res.json();
    return json.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    const json = await res.json();
    return json.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    const json = await res.json();
    return json.data;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    const json = await res.json();
    return json.data;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    const json = await res.json();
    return json.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update category');
    const json = await res.json();
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  // Banners
  async getBanners(): Promise<Banner[]> {
    const res = await fetch(`${API_BASE}/banners`);
    if (!res.ok) throw new Error('Failed to load banners');
    const json = await res.json();
    return json.data;
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create banner');
    const json = await res.json();
    return json.data;
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`${API_BASE}/banners/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update banner');
    const json = await res.json();
    return json.data;
  },

  async deleteBanner(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/banners/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete banner');
  },

  // Media Library
  async getMedia(): Promise<MediaItem[]> {
    const res = await fetch(`${API_BASE}/media`);
    if (!res.ok) throw new Error('Failed to load media');
    const json = await res.json();
    return json.data;
  },

  async uploadMedia(file: File, name?: string, category: string = 'other'): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    formData.append('category', category);

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload media file');
    const json = await res.json();
    return json.data;
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete media');
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to load orders');
    const json = await res.json();
    return json.data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Order not found');
    const json = await res.json();
    return json.data;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to place order');
    const json = await res.json();
    return json.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const json = await res.json();
    return json.data;
  },

  // Settings
  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load website settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save website settings');
    const json = await res.json();
    return json.data;
  },
};
