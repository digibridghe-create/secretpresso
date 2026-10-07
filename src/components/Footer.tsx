import React, { useState } from 'react';
import { ArrowRight, Instagram, Facebook, Twitter, Mail, MapPin, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, settings, showToast } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
    showToast('Welcome to the Secret Collector circle!', 'success');
    setEmailInput('');
  };

  const navigateTo = (view: 'home' | 'our-brew' | 'our-story' | 'track-order' | 'admin', anchorId?: string) => {
    if (view === 'our-brew') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(anchorId || 'coffee-flavours');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0a0705] text-[#f5f0eb] border-t border-[#1f1712] pt-16 pb-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#221811]">
          {/* Column 1 & 2: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-start">
              <span className="text-2xl font-serif tracking-widest text-[#fbf7f2] font-semibold">
                SECRETPRESSO
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#d6b07c] uppercase">
                Sip · Discover · Collect
              </span>
            </div>

            <p className="text-xs text-[#a49180] leading-relaxed max-w-sm font-light">
              Premium specialty coffee combined with collectible designer figurines. Small-batch ethical roasts, artisanal pastries, and a little moment of joy in every cup.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href={settings?.socialLinks?.instagram || 'https://instagram.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#18110c] hover:bg-[#c89b63] hover:text-[#100c08] border border-[#35251a] flex items-center justify-center text-[#c9b8a8] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#18110c] hover:bg-[#c89b63] hover:text-[#100c08] border border-[#35251a] flex items-center justify-center text-[#c9b8a8] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks?.twitter || 'https://twitter.com'}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-[#18110c] hover:bg-[#c89b63] hover:text-[#100c08] border border-[#35251a] flex items-center justify-center text-[#c9b8a8] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d6b07c]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#b8a798]">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-[#fbf7f2] transition-colors"
                >
                  Brew Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('our-brew', 'coffee-flavours')}
                  className="hover:text-[#fbf7f2] transition-colors"
                >
                  Our Brew
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('track-order')}
                  className="hover:text-[#fbf7f2] transition-colors"
                >
                  My Secret (Orders & Vault)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('our-story')}
                  className="hover:text-[#fbf7f2] transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-[#c89b63] hover:text-[#dfb780] transition-colors font-medium"
                >
                  CMS Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d6b07c]">
              Contact Concierge
            </h4>
            <div className="space-y-2.5 text-xs text-[#b8a798]">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c89b63] mt-0.5 shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'concierge@secretpresso.coffee'}`}
                  className="hover:text-[#fbf7f2] transition-colors break-all"
                >
                  {settings?.email || 'concierge@secretpresso.coffee'}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#c89b63] mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  {settings?.address || 'SECRETpresso Atelier, 12 Kensington Blvd, Indiranagar'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 5: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d6b07c]">
              Stay In The Loop
            </h4>
            <p className="text-xs text-[#a49180] leading-relaxed">
              Be the first to learn about seasonal roast releases, rare gold figurines, and member tastings.
            </p>

            <form onSubmit={handleSubscribe} className="pt-1">
              <div className="flex items-center bg-[#150f0b] border border-[#3b2a1e] focus-within:border-[#c89b63] rounded-full p-1 transition-colors">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent text-xs text-[#f5f0eb] placeholder-[#7d6b5b] px-3 py-1.5 focus:outline-none w-full"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-7 h-7 rounded-full bg-[#c89b63] hover:bg-[#dfb780] text-[#100c08] flex items-center justify-center shrink-0 transition-colors"
                >
                  {isSubscribed ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#786657]">
          <p>© {new Date().getFullYear()} SECRETpresso Coffee Co. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-[#b8a798] transition-colors">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#terms" className="hover:text-[#b8a798] transition-colors">
              Terms & Conditions
            </a>
            <span>·</span>
            <button
              onClick={() => navigateTo('admin')}
              className="hover:text-[#dfb780] transition-colors font-medium"
            >
              Admin CMS
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
