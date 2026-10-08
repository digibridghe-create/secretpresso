import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Home,
  Coffee,
  Mic,
  MicOff,
  X,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resolveImage } from '../../utils/imageResolver';

export const BottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    products,
    categories,
    settings,
    addToCart,
    showToast,
  } = useApp();

  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Rotating placeholder suggestions
  const defaultSuggestions = [
    'Search coffee, burgers, desserts...',
    'Search for tiramisu...',
    'Search for cold brew...',
    'Search for burgers...',
    'Search for brownies...',
    'Search for fries...',
    'Search for sandwiches...',
  ];

  const suggestions =
    settings?.mobileSearchSuggestions && settings.mobileSearchSuggestions.length > 0
      ? settings.mobileSearchSuggestions
      : defaultSuggestions;

  useEffect(() => {
    if (isFocused || searchQuery.trim().length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % suggestions.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isFocused, searchQuery, suggestions.length]);

  // Voice Search setup using Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening for search query...', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          setShowResults(true);
          showToast(`Searched for: "${transcript}"`, 'success');
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          showToast('Could not recognize voice. Please type your search.', 'info');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [setSearchQuery, showToast]);

  const toggleVoiceSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recognitionRef.current) {
      showToast('Voice search not supported on this device browser.', 'info');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Filter products by search query
  const trimmed = searchQuery.trim().toLowerCase();
  const searchResults = trimmed
    ? products.filter((p) => {
        const cat = categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
        return (
          p.isVisible &&
          (p.name.toLowerCase().includes(trimmed) ||
            p.description.toLowerCase().includes(trimmed) ||
            p.productType.toLowerCase().includes(trimmed) ||
            cat.includes(trimmed))
        );
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    if (searchResults.length > 0) {
      setCurrentView('home');
      setShowResults(false);
      const targetId = searchResults[0].sectionId || 'coffee-flavours';
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleNav = (target: 'home' | 'menu') => {
    setShowResults(false);
    if (target === 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'menu') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('coffee-flavours');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const isHomeActive = currentView === 'home' && !showResults;
  const currencySymbol = settings?.currencySymbol || '₹';

  const quickChips = [
    { label: 'Coffee', query: 'coffee' },
    { label: 'Burgers', query: 'burger' },
    { label: 'Sweets', query: 'sweet' },
    { label: 'Tiramisu', query: 'tiramisu' },
    { label: 'Fries', query: 'fries' },
    { label: 'Iced', query: 'cold' },
  ];

  return (
    <>
      {/* Search Results Backdrop Overlay (Clean transparent dismiss layer, no dark overlay) */}
      {showResults && (
        <div
          className="md:hidden fixed inset-0 bg-transparent z-40"
          onClick={() => setShowResults(false)}
        />
      )}

      {/* Search Results Floating Card (Opens directly above the floating bottom nav with PURE WHITE BACKGROUND) */}
      {showResults && (
        <div
          className="md:hidden fixed z-50 rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.18)] border border-[#E5DBCC] p-3 sm:p-4 overflow-hidden flex flex-col text-[#140F0B] animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            backgroundColor: '#FFFFFF',
            left: 'max(14px, env(safe-area-inset-left, 14px))',
            right: 'max(14px, env(safe-area-inset-right, 14px))',
            bottom: 'max(76px, calc(env(safe-area-inset-bottom, 0px) + 72px))',
            maxWidth: '520px',
            margin: '0 auto',
            maxHeight: '68vh',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#F0EBE1] shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C89B63]" />
              <span className="text-xs uppercase tracking-wider text-[#7A6E64] font-bold">
                {trimmed ? `Results (${searchResults.length})` : 'Popular Searches'}
              </span>
            </div>
            <button
              onClick={() => setShowResults(false)}
              className="p-1 rounded-full text-[#7A6E64] hover:text-[#140F0B] hover:bg-[#FAF5EE] transition-colors"
              aria-label="Close search results"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 shrink-0">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setSearchQuery(chip.query);
                  setShowResults(true);
                }}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  trimmed === chip.query
                    ? 'bg-[#140F0B] text-white font-bold shadow-xs'
                    : 'bg-[#FAF5EE] border border-[#E5DBCC] text-[#4A3E36] hover:border-[#140F0B]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pt-1 pb-2">
            {trimmed && searchResults.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Coffee className="w-8 h-8 text-[#C89B63] mx-auto opacity-80" />
                <p className="text-xs text-[#7A6E64]">
                  No brews or bites found for &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery('coffee')}
                  className="px-3.5 py-1.5 rounded-full bg-[#140F0B] text-white text-[11px] font-semibold"
                >
                  Show All Coffee
                </button>
              </div>
            ) : trimmed ? (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setShowResults(false);
                    setCurrentView('home');
                    setTimeout(() => {
                      const el = document.getElementById(product.sectionId || 'coffee-flavours');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF5EE] border border-[#EAE2D5] hover:border-[#C89B63] transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <img
                      src={resolveImage(product.image)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-[#DDD3C4]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#140F0B] truncate group-hover:text-[#B08A4A]">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-[#7A6E64] truncate">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-[#140F0B]">
                          {currencySymbol}
                          {product.salePrice ?? product.price}
                        </span>
                        {product.salePrice && (
                          <span className="text-[10px] text-[#8C7A6B] line-through">
                            {currencySymbol}
                            {product.price}
                          </span>
                        )}
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-[#7A6E64] border border-[#E5DBCC]">
                          {product.productType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#140F0B] hover:bg-[#2A1F17] text-white text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-xs"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </div>
              ))
            ) : (
              // Empty search trending recommendations
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[#7A6E64] font-bold px-1">
                  Trending Brews & Treats
                </p>
                {products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setShowResults(false);
                      setCurrentView('home');
                      setTimeout(() => {
                        const el = document.getElementById(product.sectionId || 'coffee-flavours');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF5EE] border border-[#EAE2D5] hover:border-[#C89B63] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <img
                        src={resolveImage(product.image)}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-[#DDD3C4]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-xs font-bold text-[#140F0B] truncate group-hover:text-[#B08A4A]">
                          {product.name}
                        </h4>
                        <span className="text-xs font-bold text-[#140F0B]">
                          {currencySymbol}
                          {product.salePrice ?? product.price}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#140F0B] text-white text-[10px] font-bold shrink-0 hover:bg-[#2A1F17]"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE PREMIUM FLOATING NAVIGATION BAR */}
      <nav
        className="md:hidden fixed z-40 bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E5DBCC]/90 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-2.5 py-1.5 flex items-center justify-between gap-1 transition-all"
        style={{
          position: 'fixed',
          left: 'max(14px, env(safe-area-inset-left, 14px))',
          right: 'max(14px, env(safe-area-inset-right, 14px))',
          bottom: 'max(16px, calc(env(safe-area-inset-bottom, 0px) + 12px))',
          maxWidth: '520px',
          margin: '0 auto',
        }}
        aria-label="Mobile Floating Navigation"
      >
        {/* 1. REAL SEARCH BAR (LEFT SIDE — OCCUPIES MOST WIDTH) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-0 relative flex items-center mr-1"
        >
          {/* Small search icon on left side */}
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#8C7A6B] pointer-events-none shrink-0 z-10" />

          {/* Compact horizontal rounded search input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowResults(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? 'Search coffee, burgers, desserts...' : suggestions[placeholderIndex]}
            aria-label="Search coffee, burgers, desserts"
            className="w-full h-9 pl-8 pr-7 sm:pr-8 rounded-full bg-white border border-[#E0D5C5] focus:border-[#B08A4A] focus:ring-1 focus:ring-[#B08A4A]/25 text-[11px] sm:text-xs text-[#140F0B] placeholder-[#8C7A6B] shadow-2xs transition-all selection:bg-[#C89B63] selection:text-[#100C08]"
          />

          {/* Right actions inside search bar: Clear & Microphone */}
          <div className="absolute right-1.5 flex items-center gap-0.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-[#8C7A6B] hover:text-[#140F0B] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-1 rounded-full transition-all ${
                isListening
                  ? 'text-rose-600 bg-rose-100 animate-pulse'
                  : 'text-[#8C7A6B] hover:text-[#B08A4A]'
              }`}
              aria-label={isListening ? 'Listening' : 'Voice Search'}
              title="Voice Search"
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>

        {/* 2. HOME */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className={`shrink-0 flex flex-col items-center justify-center py-0.5 px-2 rounded-full transition-all min-w-[42px] ${
            isHomeActive
              ? 'text-[#140F0B] font-semibold'
              : 'text-[#7A6E64] hover:text-[#140F0B]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-4.5 h-4.5 ${isHomeActive ? 'stroke-[2.2] text-[#140F0B]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight leading-tight mt-0.5">Home</span>
        </button>

        {/* 3. MENU */}
        <button
          type="button"
          onClick={() => handleNav('menu')}
          className="shrink-0 flex flex-col items-center justify-center py-0.5 px-2 rounded-full text-[#7A6E64] hover:text-[#140F0B] transition-all min-w-[42px]"
          aria-label="Menu"
        >
          <Coffee className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[9px] tracking-tight leading-tight mt-0.5">Menu</span>
        </button>


      </nav>
    </>
  );
};
