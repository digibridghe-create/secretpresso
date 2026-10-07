import React, { useState, useEffect } from 'react';
import { Save, Check, RefreshCw, Sliders, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { WebsiteSettings } from '../../types';

export const SettingsManager: React.FC = () => {
  const { settings, refreshData, showToast } = useApp();

  const [formData, setFormData] = useState<Partial<WebsiteSettings>>({
    brandName: 'SECRETpresso',
    tagline: 'Good Coffee. Great Surprise.',
    announcement: 'Complimentary Secret Collectible Toy with every Specialty Brew order today!',
    currencySymbol: '₹',
    phone: '+91 98200 45678',
    email: 'concierge@secretpresso.coffee',
    address: 'SECRETpresso Atelier & Roastery, 12 Kensington Boulevard, Bangalore, India',
    socialLinks: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
    },
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await api.updateSettings(formData);
      await refreshData();
      setSaveStatus('saved');
      showToast('Website settings saved to database', 'success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err.message || 'Failed to save settings', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-4 border-b border-[#2b1f16]">
        <span className="text-[10px] uppercase tracking-wider text-[#d6b07c] font-semibold">
          Configuration & Identity
        </span>
        <h2 className="font-serif text-2xl font-medium text-[#fbf7f2]">
          Website Brand Settings
        </h2>
        <p className="text-xs text-[#a49180] mt-0.5">
          Update your store identity, announcement bar, concierge contacts, and footer information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-4">
          <h3 className="font-serif text-base font-medium text-[#fbf7f2] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#c89b63]" />
            <span>Store Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Brand Name</label>
              <input
                type="text"
                value={formData.brandName || ''}
                onChange={(e) => setFormData((p) => ({ ...p, brandName: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol || '₹'}
                onChange={(e) => setFormData((p) => ({ ...p, currencySymbol: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#cfbeae] mb-1 font-medium">Brand Tagline</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#cfbeae] mb-1 font-medium">Global Announcement Banner</label>
            <input
              type="text"
              value={formData.announcement || ''}
              onChange={(e) => setFormData((p) => ({ ...p, announcement: e.target.value }))}
              placeholder="Notice shown to visitors..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Concierge Information */}
        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-4">
          <h3 className="font-serif text-base font-medium text-[#fbf7f2] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#c89b63]" />
            <span>Concierge Contacts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Customer Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Concierge Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#cfbeae] mb-1 font-medium">Atelier / Physical Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="p-5 rounded-2xl bg-[#17110c] border border-[#2e2016] space-y-4">
          <h3 className="font-serif text-base font-medium text-[#fbf7f2]">
            Social Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Instagram URL</label>
              <input
                type="text"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, instagram: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Facebook URL</label>
              <input
                type="text"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, facebook: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#cfbeae] mb-1 font-medium">Twitter / X URL</label>
              <input
                type="text"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    socialLinks: { ...p.socialLinks, twitter: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 rounded-lg bg-[#1c140f] border border-[#3b2b1d] focus:border-[#c89b63] text-[#f5f0eb] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-6 py-3 rounded-xl bg-[#c89b63] hover:bg-[#dfb780] disabled:bg-[#3d2f23] text-[#100c08] font-semibold text-xs flex items-center gap-2 transition-colors shadow-lg"
          >
            {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
            {saveStatus === 'idle' && <Save className="w-3.5 h-3.5" />}
            <span>
              {saveStatus === 'saving'
                ? 'Saving Settings...'
                : saveStatus === 'saved'
                ? 'Saved ✓'
                : saveStatus === 'error'
                ? 'Save Failed - Retry'
                : 'Save Website Settings'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
