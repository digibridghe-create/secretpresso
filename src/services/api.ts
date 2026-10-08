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

export const api = {
  async getBootstrap(): Promise<BootstrapResponse> {
    const res = await fetch('/api/bootstrap');
    const json = await res.json();
    if (!json.success) throw new Error('Failed to load store data');
    return json.data;
  },

  async getSections(): Promise<Section[]> {
    const res = await fetch('/api/sections');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createSection(data: Partial<Section>): Promise<Section> {
    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create section');
    return json.data;
  },

  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    const res = await fetch(`/api/sections/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update section');
    return json.data;
  },

  async reorderSections(orderedIds: string[]): Promise<Section[]> {
    const res = await fetch('/api/sections/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to reorder sections');
    return json.data;
  },

  async deleteSection(id: string): Promise<void> {
    const res = await fetch(`/api/sections/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete section');
  },

  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create product');
    return json.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update product');
    return json.data;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete product');
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create category');
    return json.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update category');
    return json.data;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete category');
  },

  async getBanners(): Promise<Banner[]> {
    const res = await fetch('/api/banners');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create banner');
    return json.data;
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update banner');
    return json.data;
  },

  async deleteBanner(id: string): Promise<void> {
    const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete banner');
  },

  async getMedia(): Promise<MediaItem[]> {
    const res = await fetch('/api/media');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async uploadMedia(file: File, name?: string, category: string = 'other'): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    formData.append('category', category);

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to upload media');
    return json.data;
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`/api/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete media');
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) throw new Error('Order not found');
    return json.data;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to place order');
    return json.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update order status');
    return json.data;
  },

  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (!json.success) throw new Error('Failed to load settings');
    return json.data;
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update settings');
    return json.data;
  },

  async getBackups(): Promise<{ backups: any[]; auditLogs: any[] }> {
    const res = await fetch('/api/backups');
    const json = await res.json();
    if (!json.success) throw new Error('Failed to load backups');
    return { backups: json.backups || [], auditLogs: json.auditLogs || [] };
  },

  async createBackup(type: string = 'Manual'): Promise<any> {
    const res = await fetch('/api/backups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create backup');
    return json.data;
  },

  async restoreBackup(backupId: string): Promise<any> {
    const res = await fetch('/api/backups/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to restore backup');
    return json;
  },

  async importBackup(backupData: any): Promise<any> {
    const res = await fetch('/api/backups/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to import backup');
    return json;
  },
};
