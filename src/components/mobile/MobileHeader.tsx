import React, { useState, useEffect } from 'react';
import { MapPin, Search, User, ChevronDown, X, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileHeaderProps {
  onOpenAddress: () => void;
  onOpenAccount: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenAddress, onOpenAccount }) => {
  const {
    searchQuery,
    setSearchQuery,
    products,
    categories,
    openCustomizationModal,
    settings,
  } = useApp();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedAddress] = useState(
    'Home • 135/10 Vivekanand College, Ranganathpur Colony'
  );

  // Rotating search placeholder
  const suggestions =
    settings?.mobileSearchSuggestions && settings.mobileSearchSuggestions.length > 0
      ? settings.mobileSearchSuggestions
      : [
          'Search for coffee...',
          'Search for burgers...',
          'Search for desserts...',
          'Search for tiramisu...',
          'Search for brownies...',
          'Search for iced coffee...',
          'Search for fries...',
          'Search for sandwiches...',
          'Search for donuts...',
        ];

  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderFade, setPlaceholderFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderFade(false);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % suggestions.length);
        setPlaceholderFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  // Voice Search handler
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search isn't supported on this browser. Please type your search.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setSearchQuery(speechResult);
        setIsSearchActive(true);
      };

      recognition.onerror = () => {
        alert('Voice recognition error. Please type your search.');
      };

      recognition.start();
    } catch {
      alert("Voice search isn't supported on this browser. Please type your search.");
    }
  };

  // Filter search results
  const searchResults = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q) ||
          cat.includes(q)
        );
      })
    : [];

  return (
    <div className="md:hidden sticky top-0 left-0 right-0 z-40 bg-[#FAF7F2] border-b border-[#EFE7DA] px-3 py-2.5 shadow-xs space-y-2">
      {/* Top Compact Row: Completely Transparent Location Bar (Left) + Profile Avatar (Right) */}
      <div className="flex items-center justify-between gap-3">
        {/* Fully Transparent Location Bar */}
        <button
          onClick={onOpenAddress}
          style={{
            background: 'transparent',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            boxShadow: 'none',
            border: 'none',
          }}
          className="flex-1 flex items-center justify-between text-left py-1 px-0 min-w-0 cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-[#C89B63] shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#140F0B] truncate">
                  {selectedAddress.split('•')[0].trim()}
                </span>
                <ChevronDown className="w-3 h-3 text-[#7A6E64] shrink-0" />
              </div>
              <p className="text-[10px] text-[#7A6E64] truncate max-w-[220px]">
                {selectedAddress.split('•')[1] || selectedAddress}
              </p>
            </div>
          </div>
        </button>

        {/* Profile Avatar (Icon Only, No text) */}
        <button
          onClick={onOpenAccount}
          className="w-10 h-10 rounded-full bg-[#140F0B] text-white font-serif font-bold text-xs flex items-center justify-center border-2 border-[#C89B63] shadow-md active:scale-95 transition-transform shrink-0 overflow-hidden"
          aria-label="My Secret Account"
        >
          <div className="w-full h-full flex items-center justify-center bg-[#140F0B] text-white">
            <User className="w-4 h-4 text-[#C89B63]" />
          </div>
        </button>
      </div>

      {/* Search Bar with Rotating Placeholder & Microphone Voice Search */}
      <div className="relative">
        <div className="flex items-center gap-2 w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5DBCC] shadow-2xs">
          <Search className="w-4 h-4 text-[#8C7A6B] shrink-0" />
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchActive(true);
              }}
              onFocus={() => setIsSearchActive(true)}
              className="w-full bg-transparent text-xs text-[#140F0B] focus:outline-none relative z-10"
            />
            {!searchQuery && (
              <span
                className={`absolute inset-0 text-xs text-[#A49180] pointer-events-none truncate flex items-center transition-opacity duration-300 ${
                  placeholderFade ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {suggestions[placeholderIdx]}
              </span>
            )}
          </div>

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchActive(false);
              }}
              className="text-[#8C7A6B] hover:text-[#140F0B] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleVoiceSearch}
              className="text-[#C89B63] hover:text-[#140F0B] shrink-0 p-1"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchActive && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5DBCC] rounded-2xl shadow-xl max-h-72 overflow-y-auto z-50 p-2 space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-[#8C7A6B] border-b border-[#F0EBE1]">
              <span>Search Results ({searchResults.length})</span>
              <button
                onClick={() => setIsSearchActive(false)}
                className="hover:text-[#140F0B]"
              >
                Close
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8C7A6B]">
                No matching products found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    openCustomizationModal(prod);
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF5EE] cursor-pointer transition-colors"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-[#EFE8DD] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#140F0B] truncate">{prod.name}</h4>
                    <p className="text-[10px] text-[#7A6E64] truncate">{prod.description}</p>
                  </div>
                  <span className="font-serif text-xs font-semibold text-[#140F0B] shrink-0">
                    ₹{prod.salePrice ?? prod.price}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
