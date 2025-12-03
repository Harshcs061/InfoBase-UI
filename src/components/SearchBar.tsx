import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Question, SearchBarProps } from '../redux/types';


export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search questions...",
  showRecentSearches = true,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    const updated = [
      trimmedQuery,
      ...recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }

    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    handleSearch(search);
  };

  const handleClearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const popularSearches = [
    'React hooks',
    'Redux best practices',
    'TypeScript generics',
    'Authentication JWT',
    'Performance optimization',
  ];

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-gray-100 rounded-2xl px-4 py-2 pl-11 pr-10 outline-none text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isFocused && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>Recent Searches</span>
                </div>
                <button
                  onClick={handleClearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
              <TrendingUp className="w-4 h-4" />
              <span>Popular Searches</span>
            </div>
            <div className="space-y-1">
              {popularSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {query.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd> to search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
