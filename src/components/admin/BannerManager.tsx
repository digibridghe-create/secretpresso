import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Move, Check, RefreshCw, X, Image as ImageIcon, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Banner } from '../../types';
import { BannerTextEditor } from './BannerTextEditor';
import { MediaLibrary } from './MediaLibrary';

export const BannerManager: React.FC = () => {
  const { banners, refreshData, showToast } = useApp();

  const [activeTextEditorBanner, setActiveTextEditorBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [bannerType, setBannerType] = useState<'hero' | 'promo' | 'section'>('hero');
  const [image, setImage] = useState('');
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Explore Our Menu');
  const [ctaLink, setCtaLink] = useState('#coffee-flavours');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [slideDuration, setSlideDuration] = useState<number>(5);
  const [isVisible, setIsVisible] = useState(true);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBanner(null);
    setName('');
    setBannerType('hero');
    setImage('/uploads/hero_secretpresso_banner_1791216817348.jpg');
    setHeading('Good Coffee.\nGreat Surprise.');
    setSubtitle('MORE THAN JUST COFFEE');
    setDescription('Every cup is a new adventure with collectible toys.');
    setCtaText('Explore Menu');
    setCtaLink('#coffee-flavours');
    const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.displayOrder)) + 1 : 1;
    setDisplayOrder(nextOrder);
    setSlideDuration(5);
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setName(b.name);
    setBannerType(b.bannerType);
    setImage(b.image);
    setHeading(b.heading);
    setSubtitle(b.subtitle);
    setDescription(b.description);
    setCtaText(b.ctaText);
    setCtaLink(b.ctaLink);
    setDisplayOrder(b.displayOrder);
    setSlideDuration(b.slideDuration || 5);
    setIsVisible(b.isVisible);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Banner name is required', 'error');
      return;
    }

    setSaveStatus('saving');
    try {
      const payload: Partial<Banner> = {
        name: name.trim(),
        bannerType,
        image,
        heading,
        subtitle,
        description,
        ctaText,
        ctaLink,
        displayOrder: Number(displayOrder),
        slideDuration: Number(slideDuration),
        isVisible,
      };

      if (editingBanner) {
        await api.updateBanner(editingBanner.id, payload);
        showToast(`Banner "${name}" updated`, 'success');
      } else {
        await api.createBanner(payload);
        showToast(`New banner "${name}" created`, 'success');
      }

      await refreshData();
      setSaveStatus('saved');
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus('idle');
      }, 700);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err.message || 'Failed to save banner', 'error');
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm(`Delete banner "${b.name}"?`)) return;

    setDeletingId(b.id);
    try {
      await api.deleteBanner(b.id);
      await refreshData();
      showToast('Banner removed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete banner', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Visual Campaigns & Carousels
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Banners & Hero Carousels ({banners.length})
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Full-width advertising banners. Never cropped, with interactive drag-and-drop text positioning.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between rounded-2xl bg-[#17110c] border border-[#2e2016] overflow-hidden hover:border-[#523d2d] transition-all"
          >
            {/* Banner Full-Image Preview Container */}
            <div className="relative w-full h-52 bg-[#0c0907] flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xl scale-110"
                style={{ backgroundImage: `url(${b.image})` }}
              />
              <img
                src={b.image}
                alt={b.name}
                referrerPolicy="no-referrer"
                className="relative z-10 w-full h-full object-contain max-h-52"
              />

              <div className="absolute top-2.5 left-2.5 z-20 flex gap-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-black/80 text-[#dfb780] border border-[#443324]">
                  {b.bannerType.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] bg-black/80 text-[#cfbeae]">
                  {b.slideDuration || 5}s slide
                </span>
              </div>
            </div>

            {/* Banner Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-medium text-[#f5f0eb]">
                    {b.name}
                  </h3>
                  <span className="text-xs text-[#a49180] font-semibold">
                    Order: #{b.displayOrder}
                  </span>
                </div>

                <p className="text-xs text-[#d6b07c] font-medium mt-1">
                  &ldquo;{b.heading.replace(/\n/g, ' ')}&rdquo;
                </p>

                <p className="text-[11px] text-[#8e7c6d] line-clamp-1 mt-0.5">
                  CTA: {b.ctaText} → {b.ctaLink}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#261b13]">
                {/* Drag-and-drop text positioning button */}
                <button
                  onClick={() => setActiveTextEditorBanner(b)}
                  className="px-3 py-1.5 rounded-lg bg-[#271b12] hover:bg-[#c89b63] text-[#dfb780] hover:text-[#100c08] border border-[#483323] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Drag & Position Text</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg bg-[#201610] hover:bg-[#322319] text-[#cfbeae] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    disabled={deletingId === b.id}
                    className="p-1.5 rounded-lg bg-[#201610] hover:bg-rose-950/60 text-[#8e7c6d] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#140e0b] border border-[#3c2a1c] rounded-2xl shadow-2xl p-6 text-[#f5f0eb] space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b1f16]">
              <h3 className="font-serif text-xl font-medium text-[#fbf7f2]">
                {editingBanner ? 'Edit Banner Configuration' : 'Add New Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8e7c6d] hover:text-[#f5f0eb] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Banner Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Main Hero Campaign"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Banner Type *</label>
                  <select
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  >
                    <option value="hero">Hero Banner (Top Carousel)</option>
                    <option value="promo">Promotional Banner (After Food)</option>
                    <option value="section">Section Banner</option>
                  </select>
                </div>
              </div>

              {/* Image Input with Media Library Chooser */}
              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Banner Image URL *</label>
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
                    <span>Browse Media</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#cfbeae] mb-1 font-medium">Heading</label>
                <textarea
                  rows={2}
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Good Coffee. Great Surprise."
                  className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Subtitle</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. MORE THAN JUST COFFEE"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Slide Duration (seconds)</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={slideDuration}
                    onChange={(e) => setSlideDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Explore Our Menu"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">CTA Button Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="#coffee-flavours"
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#cfbeae] mb-1 font-medium">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded bg-[#1c140f] border-[#3b2b1d] text-[#c89b63] focus:ring-0"
                    />
                    <span className="text-[#cfbeae]">Visible on Website</span>
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
                      : 'Save Banner'}
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
                Select Banner Image From Server Media
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

      {/* Interactive Live Drag-and-Drop Text Position Editor */}
      {activeTextEditorBanner && (
        <BannerTextEditor
          banner={activeTextEditorBanner}
          onSave={async (updated) => {
            await api.updateBanner(updated.id, updated);
            await refreshData();
            showToast('Banner text position permanently saved', 'success');
          }}
          onClose={() => setActiveTextEditorBanner(null)}
        />
      )}
    </div>
  );
};
