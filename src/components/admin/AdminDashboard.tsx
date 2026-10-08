import React, { useState } from 'react';
import {
  Layers,
  Coffee,
  Tag,
  Image as ImageIcon,
  Sliders,
  ShoppingBag,
  Settings,
  ArrowLeft,
  Sparkles,
  BarChart3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SectionManager } from './SectionManager';
import { ProductManager } from './ProductManager';
import { CategoryManager } from './CategoryManager';
import { BannerManager } from './BannerManager';
import { MediaLibrary } from './MediaLibrary';
import { OrdersManager } from './OrdersManager';
import { SettingsManager } from './SettingsManager';
import { BackupManager } from './BackupManager';

type AdminTab =
  | 'overview'
  | 'sections'
  | 'products'
  | 'categories'
  | 'banners'
  | 'media'
  | 'orders'
  | 'settings'
  | 'backup';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    sections,
    categories,
    banners,
    media,
    orders,
    setCurrentView,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-[#0e0a07] text-[#f5f0eb] flex flex-col md:flex-row">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#130d09] border-r border-[#2b1f16] flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-[#241a12]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-widest text-[#f5f0eb]">
                SECRETPRESSO
              </span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-[#c89b63] font-semibold mt-0.5">
              Production CMS Control Center
            </p>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" />
                <span>Sections</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201711] text-[#dfb780]">
                {sections.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Coffee className="w-4 h-4" />
                <span>Products & Brews</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201711] text-[#dfb780]">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4" />
                <span>Categories</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201711] text-[#dfb780]">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'banners'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" />
                <span>Banners & Carousels</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201711] text-[#dfb780]">
                {banners.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'media'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>Media Storage</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#201711] text-[#dfb780]">
                {media.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Orders</span>
              </div>
              {activeOrdersCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 font-medium transition-colors ${
                activeTab === 'backup'
                  ? 'bg-[#c89b63] text-[#100c08] shadow-md'
                  : 'text-[#cfbeae] hover:bg-[#20160f] hover:text-[#f5f0eb]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Backup & Recovery</span>
            </button>
          </nav>
        </div>

        {/* Bottom Exit to Customer Website */}
        <div className="p-4 border-t border-[#241a12] space-y-2">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#221811] hover:bg-[#2f2117] text-[#e8ded3] hover:text-[#f5f0eb] border border-[#3f2c1d] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Customer Website</span>
          </button>

          <p className="text-[10px] text-[#7d6b5b] text-center">
            Database Sync: Connected ✓
          </p>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {activeTab === 'overview' && (
          <div className="space-y-8 max-w-6xl">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
                  Admin Control Panel
                </span>
                <h1 className="font-serif text-3xl font-medium text-[#fbf7f2]">
                  Store & Content Overview
                </h1>
                <p className="text-xs text-[#a49180] mt-0.5">
                  Welcome back. The persistent store database is actively serving real customers.
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Preview Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>



            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
                <span className="text-[11px] text-[#8e7c6d]">Active Sections</span>
                <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{sections.length}</p>
                <p className="text-[10px] text-[#dfb780]">Rendered independently</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
                <span className="text-[11px] text-[#8e7c6d]">Catalog Products</span>
                <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{products.length}</p>
                <p className="text-[10px] text-[#dfb780]">Brews & artisan snacks</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
                <span className="text-[11px] text-[#8e7c6d]">Total Orders</span>
                <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{orders.length}</p>
                <p className="text-[10px] text-emerald-400">₹{totalRevenue.toFixed(0)} Volume</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-1">
                <span className="text-[11px] text-[#8e7c6d]">Server Media Files</span>
                <p className="text-2xl font-serif font-semibold text-[#f5f0eb]">{media.length}</p>
                <p className="text-[10px] text-[#dfb780]">Permanent disk assets</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-[#15100c] border border-[#2e2016] space-y-4">
              <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">
                Quick Management Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('sections')}
                  className="p-4 rounded-xl bg-[#1c140f] hover:bg-[#281d16] border border-[#342418] text-left transition-colors"
                >
                  <Layers className="w-5 h-5 text-[#c89b63] mb-1.5" />
                  <p className="font-medium text-xs text-[#f5f0eb]">+ Add / Reorder Sections</p>
                  <p className="text-[10px] text-[#8e7c6d] mt-0.5">Choose Grid or Horizontal Slider for any new collection.</p>
                </button>

                <button
                  onClick={() => setActiveTab('banners')}
                  className="p-4 rounded-xl bg-[#1c140f] hover:bg-[#281d16] border border-[#342418] text-left transition-colors"
                >
                  <Sliders className="w-5 h-5 text-[#c89b63] mb-1.5" />
                  <p className="font-medium text-xs text-[#f5f0eb]">Drag-and-Drop Banner Text</p>
                  <p className="text-[10px] text-[#8e7c6d] mt-0.5">Click & drag headings directly over live campaign photos.</p>
                </button>

                <button
                  onClick={() => setActiveTab('media')}
                  className="p-4 rounded-xl bg-[#1c140f] hover:bg-[#281d16] border border-[#342418] text-left transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-[#c89b63] mb-1.5" />
                  <p className="font-medium text-xs text-[#f5f0eb]">Upload Media to Disk</p>
                  <p className="text-[10px] text-[#8e7c6d] mt-0.5">Upload photography that never disappears after refresh.</p>
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-2xl bg-[#15100c] border border-[#2e2016] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#251b14]">
                <h3 className="font-serif text-lg font-medium text-[#fbf7f2]">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#c89b63] hover:text-[#dfb780] font-medium"
                >
                  View All ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-[#8e7c6d] py-4 text-center">No orders placed yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1b140f] border border-[#281b13] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-semibold text-[#f5f0eb]">#{ord.id}</span>
                        <span className="text-[#a49180]">{ord.customerName}</span>
                        <span className="text-[11px] text-[#8e7c6d]">({ord.items.length} items)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 capitalize font-medium">{ord.status}</span>
                        <span className="font-semibold tabular-nums text-[#dfb780]">₹{ord.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sections' && <SectionManager />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'banners' && <BannerManager />}
        {activeTab === 'media' && <MediaLibrary />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'backup' && <BackupManager />}
      </main>
    </div>
  );
};
