import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileSearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    products,
    categories,
    openCustomizationModal,
    settings,
  } = useApp();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatusText, setVoiceStatusText] = useState('');
  const recognitionRef = useRef<any>(null);

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

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatusText("Voice search isn't supported on this browser.");
      setTimeout(() => setVoiceStatusText(''), 4000);
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setVoiceStatusText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusText('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setSearchQuery(speechResult);
        setIsSearchActive(true);
        setIsListening(false);
        setVoiceStatusText('');
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceStatusText('Microphone access denied. Please allow in browser settings.');
        } else {
          setVoiceStatusText("Couldn't hear that. Please try again.");
        }
        setTimeout(() => setVoiceStatusText(''), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatusText("Voice search isn't supported on this browser.");
      setTimeout(() => setVoiceStatusText(''), 4000);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

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
    <div className="md:hidden px-3 pt-14 pb-2 relative z-20">
      <div className="relative">
        <div className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#E5DBCC] shadow-md">
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
              className="w-full bg-transparent text-xs text-[#140F0B] font-medium focus:outline-none relative z-10"
            />
            {!searchQuery && (
              <span
                className={`absolute inset-0 text-xs text-[#A49180] font-normal pointer-events-none truncate flex items-center transition-opacity duration-300 ${
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
              className="text-[#8C7A6B] hover:text-[#140F0B] shrink-0 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVoiceSearch}
              className={`shrink-0 p-1 transition-transform ${
                isListening ? 'text-red-500 animate-pulse scale-110' : 'text-[#C89B63] hover:text-[#140F0B]'
              }`}
              title="Voice Search"
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : ''}`} />
            </button>
          )}
        </div>

        {voiceStatusText && (
          <div className="mt-1 px-3 py-1 text-[11px] text-white bg-black/80 backdrop-blur-xs rounded-lg shadow-md animate-fade-in flex items-center justify-between">
            <span>{voiceStatusText}</span>
            {isListening && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </div>
        )}

        {/* Live Search Results Dropdown */}
        {isSearchActive && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5DBCC] rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-2 space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-[#8C7A6B] border-b border-[#F0EBE1]">
              <span>Search Results ({searchResults.length})</span>
              <button
                onClick={() => setIsSearchActive(false)}
                className="hover:text-[#140F0B] font-medium"
              >
                Close
              </button>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    openCustomizationModal(product);
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                >
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200'}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0 border border-[#E5DBCC]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#140F0B] truncate">{product.name}</p>
                    <p className="text-[10px] text-[#8C7A6B] truncate">{product.description}</p>
                  </div>
                  <span className="text-xs font-bold text-[#C89B63] shrink-0">
                    ₹{product.price}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#8C7A6B]">
                No matching brews or treats found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
