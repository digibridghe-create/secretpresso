import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, RefreshCw, X, Image as ImageIcon, Sparkles, Filter, Sliders, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Product, CustomizationGroup, CustomizationOption } from '../../types';
import { MediaLibrary } from './MediaLibrary';

export const ProductManager: React.FC = () => {
  const { products, sections, categories, refreshData, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(149);
  const [salePrice, setSalePrice] = useState<string>('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [productType, setProductType] = useState<'coffee' | 'food' | 'merch' | 'surprise'>('coffee');
  const [availability, setAvailability] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(true);
  const [badge, setBadge] = useState('');
  const [surpriseToyNote, setSurpriseToyNote] = useState('');
  const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>([]);

  // Filters
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(149);
    setSalePrice('');
    setImage('/uploads/hero_secretpresso_banner_1791216817348.jpg');
    setCategoryId(categories[0]?.id || 'cat-espresso');
    setSectionId(sections[0]?.id || 'sec-coffee-flavours');
    setProductType('coffee');
    setAvailability(true);
    const nextOrder = products.length > 0 ? Math.max(...products.map((p) => p.displayOrder)) + 1 : 1;
    setDisplayOrder(nextOrder);
    setIsVisible(true);
    setBadge('Surprise Included');
    setSurpriseToyNote('Series 1 Collectible Figurine inside');
    setCustomizationGroups([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setSalePrice(prod.salePrice ? String(prod.salePrice) : '');
    setImage(prod.image);
    setCategoryId(prod.categoryId);
    setSectionId(prod.sectionId);
    setProductType(prod.productType);
    setAvailability(prod.availability);
    setDisplayOrder(prod.displayOrder);
    setIsVisible(prod.isVisible);
    setBadge(prod.badge || '');
    setSurpriseToyNote(prod.surpriseToyNote || '');
    setCustomizationGroups(prod.customizationGroups ? JSON.parse(JSON.stringify(prod.customizationGroups)) : []);
    setIsModalOpen(true);
  };

  const addCustomizationGroup = () => {
    const newGroup: CustomizationGroup = {
      id: `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: 'Customization Group',
      type: 'single',
      required: false,
      options: [
        {
          id: `opt-${Date.now()}-1`,
          name: 'Regular',
          detail: '',
          priceAdjustment: 0,
          isDefault: true,
        },
      ],
    };
    setCustomizationGroups((prev) => [...prev, newGroup]);
  };

  const updateGroup = (groupId: string, updates: Partial<CustomizationGroup>) => {
    setCustomizationGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  const removeGroup = (groupId: string) => {
    setCustomizationGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const addOptionToGroup = (groupId: string) => {
    setCustomizationGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newOpt: CustomizationOption = {
            id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: 'New Option',
            detail: '',
            priceAdjustment: 15,
            isDefault: false,
          };
          return { ...g, options: [...g.options, newOpt] };
        }
        return g;
      })
    );
  };

  const updateOption = (groupId: string, optionId: string, updates: Partial<CustomizationOption>) => {
    setCustomizationGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
          };
        }
        return g;
      })
    );
  };

  const removeOptionFromGroup = (groupId: string, optionId: string) => {
    setCustomizationGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter((o) => o.id !== optionId),
          };
        }
        return g;
      })
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    setSaveStatus('saving');
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        image: image || '/uploads/hero_secretpresso_banner_1791216817348.jpg',
        categoryId: categoryId || categories[0]?.id,
        sectionId: sectionId || sections[0]?.id,
        productType,
        availability,
        displayOrder: Number(displayOrder),
        isVisible,
        badge: badge.trim(),
        surpriseToyNote: surpriseToyNote.trim(),
        customizationGroups,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Product "${name}" updated successfully`, 'success');
      } else {
        await api.createProduct(payload);
        showToast(`Product "${name}" added to menu`, 'success');
      }

      await refreshData();
      setSaveStatus('saved');
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus('idle');
      }, 700);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Permanently delete "${prod.name}" from catalog?`)) return;

    setDeletingId(prod.id);
    try {
      await api.deleteProduct(prod.id);
      await refreshData();
      showToast(`Product removed`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterSection !== 'all' && p.sectionId !== filterSection) return false;
    if (filterType !== 'all' && p.productType !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Menu Catalog & Products
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Products ({products.length})
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Add coffee roasts, artisan patisserie, savoury kitchen items, and assign them directly to any section.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-[#17110c] border border-[#2e2016] text-xs">
        <div className="flex items-center gap-1.5 text-[#8e7c6d]">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter by Section:</span>
        </div>
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#1f1610] border border-[#3b2a1e] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
        >
          <option value="all">All Sections ({products.length})</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({products.filter((p) => p.sectionId === s.id).length})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 text-[#8e7c6d] ml-2">
          <span>Type:</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-[#1f1610] border border-[#3b2a1e] text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
        >
          <option value="all">All Types</option>
          <option value="coffee">Coffee</option>
          <option value="food">Food & Sweets</option>
          <option value="merch">Merchandise</option>
          <option value="surprise">Surprise Collectibles</option>
        </select>
      </div>

      {/* Product Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const sectionName = sections.find((s) => s.id === prod.sectionId)?.name || 'Unassigned';
          const catName = categories.find((c) => c.id === prod.categoryId)?.name || 'General';

          return (
            <div
              key={prod.id}
              className="flex gap-3.5 p-3.5 rounded-xl bg-[#17110c] border border-[#2e2016] hover:border-[#4d3625] transition-all"
            >
              <img
                src={prod.image}
                alt={prod.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-lg object-contain bg-[#0f0b08] p-1 border border-[#2b1f16] shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-serif text-sm font-medium text-[#f5f0eb] truncate">
                      {prod.name}
                    </h3>
                    <span className="text-xs font-semibold tabular-nums text-[#dfb780]">
                      ₹{prod.salePrice ?? prod.price}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8e7c6d] line-clamp-1 mt-0.5">
                    {prod.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-[#201711] text-[#c9b8a8] border border-[#38281b]">
                      {sectionName}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-[#201711] text-[#a49180]">
                      {catName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#261b13]">
                  <span className={`text-[10px] ${prod.availability ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {prod.availability ? 'In Stock' : 'Out of Stock'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1 rounded bg-[#221710] hover:bg-[#342419] text-[#cfbeae] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod)}
                      disabled={deletingId === prod.id}
                      className="p-1 rounded bg-[#221710] hover:bg-rose-950/60 text-[#8e7c6d] hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#140e0b] border border-[#3c2a1c] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b1f16]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
                  {editingProduct ? 'Edit Catalog Item' : 'New Menu Addition'}
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#fbf7f2]">
                  {editingProduct ? editingProduct.name : 'Add Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8e7c6d] hover:text-[#f5f0eb] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vanilla Latte or Chocolate Mousse"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Product Type *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  >
                    <option value="coffee">Coffee</option>
                    <option value="food">Food & Sweets</option>
                    <option value="merch">Merchandise</option>
                    <option value="surprise">Collectible Toy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on flavor notes, ingredients, craftsmanship..."
                  className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none resize-none"
                />
              </div>

              {/* Section Assignment & Category Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">
                    Assign to Section *
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.displayStyle})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#8e7c6d] mt-1">
                    Directly controls which homepage section this item appears in.
                  </p>
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">
                    Assign Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">
                    Sale / Promotional Price (₹, optional)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Leave empty for regular price"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL with Media Picker */}
              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">
                  Product Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/uploads/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-[#271b12] hover:bg-[#3a291c] text-[#dfb780] border border-[#483424] font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose from Media</span>
                  </button>
                </div>
              </div>

              {/* Badges & Collectibles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">
                    Promotional Tag (optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Surprise Included, Chef Signature"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">
                    Collectible Toy Note
                  </label>
                  <input
                    type="text"
                    value={surpriseToyNote}
                    onChange={(e) => setSurpriseToyNote(e.target.value)}
                    placeholder="e.g. Mystery Barista Bear included"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    className="rounded bg-[#1c140f] border-[#3b2b1d] text-[#c89b63] focus:ring-0"
                  />
                  <span className="text-[#cfbeae]">Available for ordering</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded bg-[#1c140f] border-[#3b2b1d] text-[#c89b63] focus:ring-0"
                  />
                  <span className="text-[#cfbeae]">Visible on public website</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#261c14] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#221811] text-[#cfbeae] text-xs font-medium hover:text-[#f5f0eb]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] disabled:bg-[#3d2f23] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
                  <span>
                    {saveStatus === 'saving'
                      ? 'Saving to Database...'
                      : saveStatus === 'saved'
                      ? 'Saved ✓'
                      : saveStatus === 'error'
                      ? 'Save Failed - Retry'
                      : 'Save Product'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#140e0b] border border-[#3e2c1e] rounded-2xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#281c13] mb-4">
              <h3 className="font-serif text-lg text-[#fbf7f2]">
                Select Image From Server Media
              </h3>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-[#9e8b7b] hover:text-[#f5f0eb]"
              >
                ✕
              </button>
            </div>
            <MediaLibrary
              onSelectImage={(url) => {
                setImage(url);
                setIsMediaPickerOpen(false);
              }}
              isModal
              onClose={() => setIsMediaPickerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
