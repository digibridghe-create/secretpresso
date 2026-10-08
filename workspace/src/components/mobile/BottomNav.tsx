import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Home,
  Coffee,
  Mic,
  MicOff,
  X,
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
        } catch {}
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
      {showResults && (
        <div
          className="md:hidden fixed inset-0 bg-transparent z-40"
          onClick={() => setShowResults(false)}
        />
      )}

      {showResults && (
        <div
          className="md:hidden fixed z-50 rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.18)] border border-[#E5DBCC] p-3 sm:p-4 overflow-hidden flex flex-col text-[#140F0B] animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            backgroundColor: '#FFFFFF',
            left: 'max(14px, env(safe-area-inset-left, 14px))',
            right: 'max(14px, env(safe-area-inset-right, 14px))',
            bottom: '72px',
            maxHeight: 'calc(100vh - 160px)',
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0E6D8]">
            <span className="text-[11px] font-semibold tracking-wider text-[#8C7A6B] uppercase">
              Instant Search Results ({searchResults.length})
            </span>
            <button
              onClick={() => setShowResults(false)}
              className="text-[#8C7A6B] hover:text-[#140F0B] p-1 rounded-full hover:bg-[#F8F4EC] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.query)}
                className="px-3 py-1 rounded-full bg-[#F5EFE6] hover:bg-[#EBDDCB] text-[#5A4A3E] text-[11px] font-medium transition-colors shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-[#8C7A6B]">No menu items matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              searchResults.map((item) => {
                const itemPrice = item.salePrice || item.price;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowResults(false);
                      setCurrentView('home');
                      setTimeout(() => {
                        const target = document.getElementById(item.sectionId || 'coffee-flavours');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                    className="flex items-center justify-between p-2 rounded-2xl bg-[#FAFAFA] hover:bg-[#F3EFEA] border border-[#EFE7DE] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={resolveImage(item.image)}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 object-cover rounded-xl bg-[#EFE6DB] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#140F0B] truncate group-hover:text-[#B08A4A] transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#8C7A6B] truncate">
                          {currencySymbol}{itemPrice} · {item.productType}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="h-8 px-3 rounded-full bg-[#140F0B] hover:bg-[#B08A4A] text-white hover:text-[#100C08] text-[11px] font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#FFFFFF]/95 backdrop-blur-xl border border-[#E5DBCC] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3 py-2 flex items-center justify-between gap-2 max-w-lg mx-auto"
      >
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-0 relative flex items-center mr-1"
        >
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#8C7A6B] pointer-events-none shrink-0 z-10" />

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

        <button
          type="button"
          onClick={() => handleNav('home')}
          className={`shrink-0 flex flex-col items-center justify-center py-0.5 px-3 rounded-full transition-all min-w-[52px] ${
            isHomeActive
              ? 'text-[#140F0B] font-semibold'
              : 'text-[#7A6E64] hover:text-[#140F0B]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-4.5 h-4.5 ${isHomeActive ? 'stroke-[2.2] text-[#140F0B]' : 'stroke-[1.8]'}`} />
          <span className="text-[9px] tracking-tight leading-tight mt-0.5">Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNav('menu')}
          className="shrink-0 flex flex-col items-center justify-center py-0.5 px-3 rounded-full text-[#7A6E64] hover:text-[#140F0B] transition-all min-w-[52px]"
          aria-label="Menu"
        >
          <Coffee className="w-4.5 h-4.5 stroke-[1.8]" />
          <span className="text-[9px] tracking-tight leading-tight mt-0.5">Menu</span>
        </button>
      </nav>
    </>
  );
};
