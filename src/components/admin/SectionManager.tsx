import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LayoutGrid, Sliders, Check, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Section, DisplayStyle } from '../../types';

export const SectionManager: React.FC = () => {
  const { sections, products, refreshData, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('horizontal_slider');
  const [isVisible, setIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSection(null);
    setName('');
    setSubtitle('');
    setDescription('');
    setDisplayStyle('horizontal_slider');
    setIsVisible(true);
    const nextOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.displayOrder)) + 1 : 1;
    setDisplayOrder(nextOrder);
    setIsModalOpen(true);
  };

  const openEditModal = (sec: Section) => {
    setEditingSection(sec);
    setName(sec.name);
    setSubtitle(sec.subtitle);
    setDescription(sec.description);
    setDisplayStyle(sec.displayStyle);
    setIsVisible(sec.isVisible);
    setDisplayOrder(sec.displayOrder);
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Section name is required', 'error');
      return;
    }

    setSaveStatus('saving');
    try {
      if (editingSection) {
        // Safe edit: only touches editingSection.id
        await api.updateSection(editingSection.id, {
          name: name.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          displayStyle,
          isVisible,
          displayOrder: Number(displayOrder),
        });
        showToast(`Section "${name}" updated successfully`, 'success');
      } else {
        // Safe create: generates unique ID in backend and appends to db
        await api.createSection({
          name: name.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          displayStyle,
          isVisible,
          displayOrder: Number(displayOrder),
        });
        showToast(`New section "${name}" created successfully`, 'success');
      }

      await refreshData();
      setSaveStatus('saved');
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus('idle');
      }, 800);
    } catch (err: any) {
      console.error('Section save failed:', err);
      setSaveStatus('error');
      showToast(err.message || 'Failed to save section', 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const orderedIds = newSections.map((s) => s.id);

    try {
      await api.reorderSections(orderedIds);
      await refreshData();
      showToast('Section order permanently updated', 'success');
    } catch {
      showToast('Failed to update section order', 'error');
    }
  };

  const handleDeleteSection = async (sec: Section) => {
    const assignedProductsCount = products.filter((p) => p.sectionId === sec.id).length;
    const confirmText = assignedProductsCount > 0
      ? `Delete section "${sec.name}"? Note: ${assignedProductsCount} products inside it will NOT be deleted, but will become "Unassigned".`
      : `Delete section "${sec.name}"?`;

    if (!window.confirm(confirmText)) return;

    setDeletingId(sec.id);
    try {
      await api.deleteSection(sec.id);
      await refreshData();
      showToast(`Section "${sec.name}" removed safely`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete section', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Section Architecture & Layout
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Website Sections ({sections.length})
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Every section below is rendered independently on the customer website. Adding or editing never replaces existing sections.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Section</span>
        </button>
      </div>

      {/* Sections Table / Cards */}
      <div className="space-y-3">
        {sections.map((sec, idx) => {
          const count = products.filter((p) => p.sectionId === sec.id).length;
          return (
            <div
              key={sec.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#17110c] border border-[#2e2016] hover:border-[#4d3625] gap-4 transition-colors"
            >
              {/* Order Controls & Info */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveOrder(idx, 'up')}
                    disabled={idx === 0}
                    title="Move section up"
                    className="p-1 rounded bg-[#1e150f] hover:bg-[#2e2016] text-[#a49180] hover:text-[#f5f0eb] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    title="Move section down"
                    className="p-1 rounded bg-[#1e150f] hover:bg-[#2e2016] text-[#a49180] hover:text-[#f5f0eb] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-7 h-7 rounded-lg bg-[#221812] border border-[#3b2a1e] flex items-center justify-center font-bold text-xs text-[#dfb780]">
                  {sec.displayOrder || idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-medium text-[#f5f0eb]">
                      {sec.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8a7767]">
                      [{sec.id}]
                    </span>
                  </div>

                  <p className="text-xs text-[#9d8977] line-clamp-1 max-w-md">
                    {sec.subtitle || sec.description || 'No subtitle configured'}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-center">
                <span className="text-xs text-[#a49180] bg-[#1f1610] px-2.5 py-1 rounded border border-[#36271c]">
                  {count} Products
                </span>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border ${
                    sec.displayStyle === 'grid'
                      ? 'border-amber-700/50 bg-amber-950/40 text-amber-300'
                      : 'border-blue-700/50 bg-blue-950/40 text-blue-300'
                  }`}
                >
                  {sec.displayStyle === 'grid' ? (
                    <LayoutGrid className="w-3 h-3" />
                  ) : (
                    <Sliders className="w-3 h-3" />
                  )}
                  <span className="capitalize">{sec.displayStyle.replace('_', ' ')}</span>
                </span>

                <div className="flex items-center gap-1.5 border-l border-[#2e2016] pl-3">
                  <button
                    onClick={() => openEditModal(sec)}
                    title="Edit Section"
                    className="p-1.5 rounded-lg bg-[#1e150f] hover:bg-[#2e2016] text-[#cfbeae] hover:text-[#f5f0eb] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSection(sec)}
                    disabled={deletingId === sec.id}
                    title="Delete Section Safely"
                    className="p-1.5 rounded-lg bg-[#1e150f] hover:bg-rose-950/60 text-[#8e7c6d] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#140e0b] border border-[#3c2a1c] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b1f16]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
                  {editingSection ? 'Modify Existing Section' : 'Create New Independent Section'}
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#fbf7f2]">
                  {editingSection ? editingSection.name : 'Add New Section'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8e7c6d] hover:text-[#f5f0eb] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Section Name * (e.g. &ldquo;Velvet Sweets&rdquo; or &ldquo;Artisan Roasts&rdquo;)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Velvet Sweets"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Delicate layers, rich textures and little moments of indulgence."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed notes for customers or internal cataloguing..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] placeholder-[#796758] focus:outline-none resize-none"
                />
              </div>

              {/* Display Style Choice (CRITICAL) */}
              <div>
                <label className="block text-xs font-medium text-[#cfbeae] mb-1.5">
                  Display Style * (Choose between Grid or Horizontal Slider)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDisplayStyle('horizontal_slider')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      displayStyle === 'horizontal_slider'
                        ? 'border-[#c89b63] bg-[#291f16] text-[#dfb780]'
                        : 'border-[#38281b] bg-[#1a120d] text-[#a99888] hover:text-[#f5f0eb]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      <Sliders className="w-4 h-4" />
                      <span>Horizontal Slider</span>
                    </div>
                    <p className="text-[10px] text-[#8e7c6d] leading-tight">
                      Smooth swipeable product carousel with arrow controls.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayStyle('grid')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      displayStyle === 'grid'
                        ? 'border-[#c89b63] bg-[#291f16] text-[#dfb780]'
                        : 'border-[#38281b] bg-[#1a120d] text-[#a99888] hover:text-[#f5f0eb]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                      <LayoutGrid className="w-4 h-4" />
                      <span>Grid</span>
                    </div>
                    <p className="text-[10px] text-[#8e7c6d] leading-tight">
                      Multi-column desktop grid (4–5 items across).
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#cfbeae] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-xs text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs text-[#cfbeae] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded bg-[#1c140f] border-[#3b2b1d] text-[#c89b63] focus:ring-0"
                    />
                    <span>Visible on Website</span>
                  </label>
                </div>
              </div>

              {/* Save Button with Real Backend Verification */}
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
                      : 'Save Section'}
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
