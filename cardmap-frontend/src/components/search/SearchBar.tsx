'use client';

import React, { useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchStore } from '@/stores/searchStore';

export interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = '가맹점 검색...',
  autoFocus = false,
  onSearch,
  className = ''
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

      try {
        const response = await fetch(
          `/api/v1/merchants/search?query=${encodeURIComponent(debouncedQuery)}`,
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
        
        // Call optional onSearch callback
        if (onSearch) {
          onSearch(debouncedQuery);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, setLoading, setError, setMerchants, onSearch]);

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
    inputRef.current?.focus();
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter') {
      e.preventDefault();
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
        {query && (
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
        {isLoading && (
          <div 
            data-testid="loading-spinner"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
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