import React, { useState, useRef } from 'react';
import { Upload, Trash2, Check, RefreshCw, Image as ImageIcon, Copy, ExternalLink, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { MediaItem } from '../../types';

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelectImage, isModal, onClose }) => {
  const { media, refreshData, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('hero');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = selectedCategory === 'all'
    ? media
    : media.filter((m) => m.category === selectedCategory);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newMedia = await api.uploadMedia(file, file.name, uploadCategory);
      await refreshData();
      showToast(`Image "${file.name}" saved to server disk & cataloged permanently!`, 'success');
      if (onSelectImage) {
        onSelectImage(newMedia.url);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(err.message || 'Upload failed. Please try a different image.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePermanent = async (item: MediaItem) => {
    if (!window.confirm(`Permanently delete "${item.name}" from server storage and database? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      await api.deleteMedia(item.id);
      await refreshData();
      showToast(`Image deleted permanently`, 'success');
      if (previewMedia?.id === item.id) setPreviewMedia(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete media', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Image URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`space-y-6 ${isModal ? 'p-6 bg-[#140e0b] text-[#f5f0eb]' : ''}`}>
      {/* Header & Upload Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2b1f16]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
            Server Disk Storage & Asset Registry
          </span>
          <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
            Permanent Media Library
          </h2>
          <p className="text-xs text-[#a49180] mt-0.5">
            Images uploaded here are stored directly on the persistent server disk and survive all reloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c140f] border border-[#3e2c1e] text-xs text-[#f5f0eb] focus:outline-none focus:border-[#c89b63]"
          >
            <option value="hero">Hero Category</option>
            <option value="banners">Banners Category</option>
            <option value="coffee">Coffee Products</option>
            <option value="food">Food Products</option>
            <option value="collections">Collections</option>
            <option value="other">Other Assets</option>
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Uploading to Disk...' : '+ Upload New Image'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-[#8e7c6d] flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {[
          { key: 'all', label: 'All Media' },
          { key: 'hero', label: 'Hero Banners' },
          { key: 'banners', label: 'Promotional' },
          { key: 'coffee', label: 'Coffee Products' },
          { key: 'food', label: 'Food & Sweets' },
          { key: 'collections', label: 'Collections' },
          { key: 'other', label: 'Other' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat.key
                ? 'bg-[#c89b63] text-[#100c08]'
                : 'bg-[#1b140f] text-[#c4b3a3] hover:text-[#f5f0eb] border border-[#37271b]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="py-16 text-center text-[#8e7c6d] border border-dashed border-[#342418] rounded-2xl">
          <ImageIcon className="w-10 h-10 mx-auto stroke-[1.2] mb-2 text-[#463426]" />
          <p className="text-sm font-serif text-[#d6c4b2]">No media found in this category</p>
          <p className="text-xs mt-1">Upload a high-resolution photo using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between bg-[#17110c] border border-[#2e2016] hover:border-[#5a4230] rounded-xl overflow-hidden p-2 transition-all hover:shadow-xl"
            >
              {/* Media Thumbnail with Aspect Preservation */}
              <div
                onClick={() => {
                  if (onSelectImage) {
                    onSelectImage(item.url);
                    if (onClose) onClose();
                  } else {
                    setPreviewMedia(item);
                  }
                }}
                className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#0d0907] flex items-center justify-center cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                />

                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-black/75 text-[#e0bb87] border border-[#443122]">
                  {item.category}
                </span>
              </div>

              {/* Media Info & Actions */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-[#f5f0eb] truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-[#8e7c6d] truncate">
                  {item.url}
                </p>

                <div className="flex items-center justify-between pt-1.5 border-t border-[#261b13]">
                  {onSelectImage ? (
                    <button
                      onClick={() => {
                        onSelectImage(item.url);
                        if (onClose) onClose();
                      }}
                      className="w-full py-1 text-center text-xs font-semibold text-[#100c08] bg-[#c89b63] hover:bg-[#dfb780] rounded transition-colors"
                    >
                      Use This Image
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        title="Copy Image URL"
                        className="text-[#9e8b7b] hover:text-[#f5f0eb] p-1 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => handleDeletePermanent(item)}
                        disabled={deletingId === item.id}
                        title="Delete Permanently from Disk"
                        className="text-[#8e7c6d] hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#15100c] border border-[#3e2c1e] rounded-2xl p-6 text-[#f5f0eb] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#281c13]">
              <h3 className="font-serif text-lg text-[#fbf7f2] truncate">
                {previewMedia.name}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-[#9e8b7b] hover:text-[#f5f0eb] p-1"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-80 bg-[#0d0907] rounded-xl overflow-hidden flex items-center justify-center p-4">
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#a49180] pt-2">
              <span>Category: {previewMedia.category}</span>
              <span>URL: {previewMedia.url}</span>
              <a
                href={previewMedia.url}
                target="_blank"
                rel="noreferrer"
                className="text-[#c89b63] hover:underline flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
