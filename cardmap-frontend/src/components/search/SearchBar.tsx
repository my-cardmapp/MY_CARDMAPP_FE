'use client';

import React, { useEffect, useCallback, useRef, KeyboardEvent, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchStore } from '@/stores/searchStore';
import { AutocompleteDropdown } from './AutocompleteDropdown';

export interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  onError?: (error: { type: string; message: string }) => void;
  className?: string;
  timeout?: number;
  isLoading?: boolean;
}

export function SearchBar({
  placeholder = '가맹점 검색...',
  autoFocus = false,
  onSearch,
  onError,
  className = '',
  timeout = 30000,
  isLoading: externalIsLoading
}: SearchBarProps) {
  const {
    query,
    isLoading,
    error,
    setQuery,
    clearQuery,
    setLoading,
    setError,
    setMerchants,
    setSuggestions
  } = useSearchStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const lastSearchedQuery = useRef<string>('');
  
  // Autocomplete state
  const [suggestions, setLocalSuggestions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [correctedQuery, setCorrectedQuery] = useState<string | undefined>(undefined);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setLocalSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }

      setSuggestionsLoading(true);
      setSuggestionsError(null);

      try {
        const response = await fetch(
          `/api/v1/suggestions/search?query=${encodeURIComponent(debouncedQuery)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
        }

        const data = await response.json();
        setLocalSuggestions(data.suggestions || []);
        setCorrectedQuery(data.correctedQuery);
        setSuggestions(data.suggestions || []); // Update store
        setIsDropdownOpen(data.suggestions && data.suggestions.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
        setSuggestionsError(errorMessage);
        setLocalSuggestions([]);
        setIsDropdownOpen(false);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, setSuggestions]);

  // Execute search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      // Skip if query is empty or same as last searched
      if (!debouncedQuery || debouncedQuery === lastSearchedQuery.current) {
        return;
      }

      lastSearchedQuery.current = debouncedQuery;
      setLoading(true);
      setError(null);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(
          `/api/v1/merchants/search?query=${encodeURIComponent(debouncedQuery)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        setMerchants(data.content || []);
        
        // Call optional onSearch callback
        if (onSearch) {
          onSearch(debouncedQuery);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            const timeoutError = { type: 'timeout', message: `Request timed out after ${timeout / 1000} seconds` };
            setError(timeoutError.message);
            if (onError) {
              onError(timeoutError);
            }
          } else {
            const errorObj = { type: 'network', message: err.message };
            setError(err.message);
            if (onError) {
              onError(errorObj);
            }
          }
        } else {
          const errorMessage = 'Search failed';
          setError(errorMessage);
          if (onError) {
            onError({ type: 'unknown', message: errorMessage });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, setLoading, setError, setMerchants, onSearch, onError, timeout]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // Reset last searched query if input is cleared
    if (!newValue) {
      lastSearchedQuery.current = '';
    }
  };

  // Handle clear button click
  const handleClear = () => {
    clearQuery();
    lastSearchedQuery.current = '';
    setLocalSuggestions([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    lastSearchedQuery.current = '';
    // Trigger immediate search for the selected suggestion
    performImmediateSearchForQuery(suggestion);
  };

  // Handle dropdown close
  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle dropdown navigation
    if (isDropdownOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        return;
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
        return;
      }
    }

    // Regular keyboard handling
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isDropdownOpen) {
        handleCloseDropdown();
      } else {
        handleClear();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Close dropdown if open
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
      // Trigger immediate search by setting last searched to empty
      if (query && query !== lastSearchedQuery.current) {
        lastSearchedQuery.current = '';
        performImmediateSearch();
      }
    }
  };

  // Perform immediate search (for Enter key)
  const performImmediateSearch = async () => {
    if (!query) return;

    lastSearchedQuery.current = query;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/merchants/search?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setMerchants(data.content || []);
      
      if (onSearch) {
        onSearch(query);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Perform immediate search for a specific query
  const performImmediateSearchForQuery = async (searchQuery: string) => {
    if (!searchQuery) return;

    lastSearchedQuery.current = searchQuery;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/merchants/search?query=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setMerchants(data.content || []);
      
      if (onSearch) {
        onSearch(searchQuery);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      data-testid="search-bar-container" 
      className={`w-full ${className}`}
    >
      <div 
        data-testid="search-input-container"
        className="relative"
      >
        {/* Search Icon */}
        <div 
          data-testid="search-icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search merchants"
          aria-autocomplete="list"
          aria-controls={isDropdownOpen ? "autocomplete-listbox" : undefined}
          aria-expanded={isDropdownOpen}
          aria-activedescendant={
            isDropdownOpen && selectedIndex >= 0
              ? `autocomplete-option-${selectedIndex}`
              : undefined
          }
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-10 py-2 
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${isLoading ? 'bg-gray-50' : 'bg-white'}
          `}
        />

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            data-testid="clear-button"
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading Spinner */}
        {(isLoading || externalIsLoading) && (
          <div 
            data-testid="search-loading"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Searching..."
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Autocomplete Dropdown */}
        <AutocompleteDropdown
          suggestions={suggestions}
          isOpen={isDropdownOpen}
          selectedIndex={selectedIndex}
          onSelect={handleSelectSuggestion}
          onClose={handleCloseDropdown}
          query={query}
          loading={suggestionsLoading}
          error={suggestionsError || undefined}
        />
      </div>

      {/* Loading Text (for screen readers) */}
      {isLoading && (
        <div 
          className="sr-only" 
          aria-live="polite"
        >
          검색 중...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          role="alert"
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </div>
      )}
    </div>
  );
}