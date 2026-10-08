import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Coffee,
  Package,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  X,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    products,
    categories,
    addToCart,
    cartCount,
    setIsCartOpen,
    activeOrder,
    userProfile,
    setIsAccountModalOpen,
  } = useApp();

  const [isSecretMenuOpen, setIsSecretMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Track scroll position for smooth sticky glass navigation without page jump
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsSecretMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products by search query
  const searchResults = searchQuery.trim()
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          const cat = categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.productType.toLowerCase().includes(q) ||
            cat.includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleNavClick = (
    view: 'home' | 'our-brew' | 'our-story' | 'track-order' | 'admin',
    anchorId?: string
  ) => {
    setIsSecretMenuOpen(false);
    if (view === 'our-brew') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(anchorId || 'coffee-flavours');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setCurrentView(view);
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="hidden md:block fixed top-0 left-0 right-0 z-50 w-full bg-transparent backdrop-blur-[2px] border-b border-white/5 py-3 sm:py-4 px-4 sm:px-8 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: Logo with coffee cup icon outline button matching reference */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/35 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white group-hover:border-white/80 transition-colors shrink-0">
            <Coffee className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg md:text-xl font-serif font-bold tracking-[0.18em] text-white group-hover:text-[#e4be88] transition-colors leading-tight">
              SECRETPRESSO
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.24em] font-medium text-white/75 uppercase mt-0.5">
              SIP. DISCOVER. COLLECT.
            </span>
          </div>
        </button>

        {/* CENTER: Navigation Links (BREW HOME, OUR BREW, MY SECRET ⌵) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[12px] lg:text-[13px] tracking-[0.14em] uppercase font-semibold text-white/90">
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'home' ? 'text-white' : 'text-white/80'
            }`}
          >
            Brew Home
          </button>

          <button
            onClick={() => handleNavClick('our-brew', 'coffee-flavours')}
            className="hover:text-white transition-colors py-1 text-white/80"
          >
            Our Brew
          </button>

          {/* My Secret Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsSecretMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 hover:text-white transition-colors py-1 text-white/80 focus:outline-none"
            >
              <span>My Secret</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isSecretMenuOpen ? 'rotate-180 text-white' : 'text-white/70'
                }`}
              />
            </button>

            {isSecretMenuOpen && (
              <div className="absolute top-full left-0 mt-3 w-64 bg-[#18130f]/95 backdrop-blur-md border border-[#3e3126]/60 rounded-xl shadow-2xl py-2 z-50 text-xs text-[#e8ded3] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#2d231b] mb-1">
                  <p className="text-[11px] uppercase tracking-wider text-[#9d8975] font-semibold">
                    Secret Member Lounge
                  </p>
                  <p className="text-[12px] text-[#f5f0eb] font-medium mt-0.5">
                    {activeOrder ? 'Welcome Back!' : 'Collector & Coffee Connoisseur'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsSecretMenuOpen(false);
                    setIsAccountModalOpen(true);
                  }}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#251e18] hover:text-[#e4be88] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#c59c6b]" />
                    <span>{userProfile ? `Account (${userProfile.name})` : 'Sign In / Register'}</span>
                  </div>
                  {userProfile && (
                    <span className="text-[10px] text-[#e0b985] font-medium bg-[#3a2c20] px-1.5 py-0.5 rounded">
                      {userProfile.role}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('track-order')}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#251e18] hover:text-[#e4be88] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#c59c6b]" />
                    <span>Track Active Order</span>
                  </div>
                  {activeOrder && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('track-order')}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-[#251e18] hover:text-[#e4be88] transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-[#c59c6b]" />
                  <span>My Collectible Toy Vault</span>
                </button>

                <button
                  onClick={() => handleNavClick('our-story')}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-[#251e18] hover:text-[#e4be88] transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 text-[#c59c6b]" />
                  <span>Our Story & Philosophy</span>
                </button>

                <div className="border-t border-[#2d231b] my-1" />

                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-[#c89b63] hover:bg-[#251e18] transition-colors text-left font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>CMS Admin Panel</span>
                  </div>
                  <span className="text-[10px] bg-[#3a2c20] text-[#e0b985] px-1.5 py-0.5 rounded">
                    Manage
                  </span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT: Search brews... input + Bag Icon + Admin button matching reference */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pill Search Input */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/20 hover:border-white/40 focus-within:border-white/70 rounded-full px-3.5 py-1.5 transition-all w-32 sm:w-44 md:w-56">
              <Search className="w-3.5 h-3.5 text-white/70 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search brews..."
                className="bg-transparent border-none text-xs text-white placeholder-white/50 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white/60 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Live Search Results Popup */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-84 bg-[#17120e]/95 backdrop-blur-md border border-[#3e3025] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <p className="text-[11px] uppercase tracking-wider text-[#9d8975] px-3 py-1 font-semibold">
                  Search Results ({searchResults.length})
                </p>
                {searchResults.length === 0 ? (
                  <p className="text-xs text-[#b8a798] px-3 py-3 text-center">
                    No flavours matching &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="space-y-1 mt-1 max-h-72 overflow-y-auto no-scrollbar">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#251e18] transition-colors group cursor-pointer"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentView('home');
                          const target = document.getElementById(item.sectionId);
                          if (target) target.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-md bg-[#251e17]"
                          />
                          <div>
                            <p className="text-xs font-medium text-[#f5f0eb] group-hover:text-[#dfb780] transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-[#a49180]">
                              ₹{item.salePrice || item.price} · {item.productType}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="px-2.5 py-1 text-[11px] rounded bg-[#33261c] hover:bg-[#c89b63] hover:text-[#120d09] text-[#e8ded3] font-medium transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bag / Cart Icon Outline Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            title="View Bag"
            className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl border border-white/30 hover:border-white bg-white/5 backdrop-blur-sm flex items-center justify-center text-white transition-colors relative focus:outline-none shrink-0"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c89b63] text-[#120d09] text-[9px] font-bold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Button */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            title={userProfile ? `Account: ${userProfile.name}` : 'Sign In / Register'}
            className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl border border-white/30 hover:border-white bg-white/5 backdrop-blur-sm flex items-center justify-center text-white transition-colors relative focus:outline-none shrink-0"
          >
            <User className="w-4 h-4 stroke-[1.8]" />
            {userProfile && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#100c08]" />
            )}
          </button>

          {/* Admin Outline Button matching reference */}
          <button
            onClick={() => handleNavClick('admin')}
            title="Open Admin CMS"
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/30 hover:border-white bg-white/5 backdrop-blur-sm text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white transition-colors focus:outline-none shrink-0"
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
