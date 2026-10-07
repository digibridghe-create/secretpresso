import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Category } from '../../types';

export const CategoryManager: React.FC = () => {
  const { categories, products, refreshData, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(true);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.displayOrder)) + 1 : 1;
    setDisplayOrder(nextOrder);
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setDisplayOrder(cat.displayOrder);
    setIsVisible(cat.isVisible);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setSaveStatus('saving');
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          displayOrder: Number(displayOrder),
          isVisible,
        });
        showToast(`Category "${name}" updated`, 'success');
      } else {
        await api.createCategory({
          name: name.trim(),
          description: description.trim(),
          displayOrder: Number(displayOrder),
          isVisible,
        });
        showToast(`New category "${name}" created`, 'success');
      }

      await refreshData();
      setSaveStatus('saved');
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus('idle');
      }, 700);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.id === 'cat-all') {
      showToast('Cannot delete the root "All Brews" category filter', 'error');
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"? Products in this category will remain intact.`)) return;

    setDeletingId(cat.id);
    try {
      await api.deleteCategory(cat.id);
      await refreshData();
      showToast(`Category deleted`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Product Taxonomy
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Categories ({categories.length})
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Organize brews and treats into easily browsable customer filter tabs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-4 rounded-xl bg-[#17110c] border border-[#2e2016] hover:border-[#4d3625] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-medium text-[#f5f0eb]">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8a7767]">
                    [{cat.id}]
                  </span>
                </div>
                <p className="text-xs text-[#9d8977] mt-1 line-clamp-2">
                  {cat.description || 'No description provided'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#261b13]">
                <span className="text-xs text-[#a49180] bg-[#1f1610] px-2 py-0.5 rounded border border-[#35261b]">
                  {count} Products
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1 rounded bg-[#221710] hover:bg-[#342419] text-[#cfbeae] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {cat.id !== 'cat-all' && (
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="p-1 rounded bg-[#221710] hover:bg-rose-950/60 text-[#8e7c6d] hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#140e0b] border border-[#3c2a1c] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b1f16]">
              <h3 className="font-serif text-xl font-medium text-[#fbf7f2]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8e7c6d] hover:text-[#f5f0eb] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Signature Infusions"
                  className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for collection..."
                  className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded bg-[#1c140f] border-[#3b2b1d] text-[#c89b63] focus:ring-0"
                    />
                    <span className="text-[#cfbeae]">Visible</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-[#261c14] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#221811] text-[#cfbeae] text-xs font-medium"
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
                      ? 'Saving...'
                      : saveStatus === 'saved'
                      ? 'Saved ✓'
                      : saveStatus === 'error'
                      ? 'Save Failed'
                      : 'Save Category'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
