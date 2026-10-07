import { supabaseService } from './supabaseService';
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
  // Bootstrap all data in a single clean call
  getBootstrap(): Promise<BootstrapResponse> {
    return supabaseService.getBootstrap();
  },

  // Sections
  getSections(): Promise<Section[]> {
    return supabaseService.getSections();
  },

  createSection(data: Partial<Section>): Promise<Section> {
    return supabaseService.createSection(data);
  },

  updateSection(id: string, data: Partial<Section>): Promise<Section> {
    return supabaseService.updateSection(id, data);
  },

  reorderSections(orderedIds: string[]): Promise<Section[]> {
    return supabaseService.reorderSections(orderedIds);
  },

  deleteSection(id: string): Promise<void> {
    return supabaseService.deleteSection(id);
  },

  // Products
  getProducts(): Promise<Product[]> {
    return supabaseService.getProducts();
  },

  createProduct(data: Partial<Product>): Promise<Product> {
    return supabaseService.createProduct(data);
  },

  updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return supabaseService.updateProduct(id, data);
  },

  deleteProduct(id: string): Promise<void> {
    return supabaseService.deleteProduct(id);
  },

  // Categories
  getCategories(): Promise<Category[]> {
    return supabaseService.getCategories();
  },

  createCategory(data: Partial<Category>): Promise<Category> {
    return supabaseService.createCategory(data);
  },

  updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return supabaseService.updateCategory(id, data);
  },

  deleteCategory(id: string): Promise<void> {
    return supabaseService.deleteCategory(id);
  },

  // Banners
  getBanners(): Promise<Banner[]> {
    return supabaseService.getBanners();
  },

  createBanner(data: Partial<Banner>): Promise<Banner> {
    return supabaseService.createBanner(data);
  },

  updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    return supabaseService.updateBanner(id, data);
  },

  deleteBanner(id: string): Promise<void> {
    return supabaseService.deleteBanner(id);
  },

  // Media Library
  getMedia(): Promise<MediaItem[]> {
    return supabaseService.getMedia();
  },

  uploadMedia(file: File, name?: string, category: string = 'other'): Promise<MediaItem> {
    return supabaseService.uploadMedia(file, name, category);
  },

  deleteMedia(id: string): Promise<void> {
    return supabaseService.deleteMedia(id);
  },

  // Orders
  getOrders(): Promise<Order[]> {
    return supabaseService.getOrders();
  },

  getOrder(id: string): Promise<Order> {
    return supabaseService.getOrder(id);
  },

  createOrder(orderData: Partial<Order>): Promise<Order> {
    return supabaseService.createOrder(orderData);
  },

  updateOrderStatus(id: string, status: string): Promise<Order> {
    return supabaseService.updateOrderStatus(id, status);
  },

  // Settings
  getSettings(): Promise<WebsiteSettings> {
    return supabaseService.getSettings();
  },

  updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    return supabaseService.updateSettings(settings);
  },
};
