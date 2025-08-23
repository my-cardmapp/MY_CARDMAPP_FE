'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

export interface AutocompleteDropdownProps {
  suggestions: string[];
  isOpen: boolean;
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  query: string;
  loading?: boolean;
  error?: string;
}

export function AutocompleteDropdown({
  suggestions,
  isOpen,
  selectedIndex,
  onSelect,
  onClose,
  query,
  loading = false,
  error
}: AutocompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSelect(suggestions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, suggestions, onSelect, onClose]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Delay to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Announce selection changes for screen readers
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length && announcementRef.current) {
      announcementRef.current.textContent = `${suggestions[selectedIndex]} 선택됨`;
    }
  }, [selectedIndex, suggestions]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // Highlight matching text
  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query) return <span>{text}</span>;

    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;
    
    // Find all matches
    const regex = new RegExp(escapedQuery, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add non-matching part before the match
      if (match.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.index), isMatch: false });
      }
      // Add matching part
      parts.push({ text: match[0], isMatch: true });
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining non-matching part
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isMatch: false });
    }
    
    // If no matches found, return the entire text
    if (parts.length === 0) {
      return <span>{text}</span>;
    }

    return (
      <>
        {parts.map((part, index) => 
          part.isMatch ? (
            <span
              key={index}
              data-testid="highlight-match"
              className="font-semibold text-blue-600"
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}
      </>
    );
  }, []);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
      data-testid="autocomplete-dropdown"
    >
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Loading state */}
      {loading && (
        <div
          data-testid="autocomplete-loading"
          className="p-4 text-center text-gray-500"
        >
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2" />
          검색 중...
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          data-testid="autocomplete-error"
          className="p-4 text-center text-red-600"
        >
          {error}
        </div>
      )}

      {/* Suggestions list */}
      {!loading && !error && (
        <>
          {suggestions.length > 0 ? (
            <ul
              ref={listRef}
              role="listbox"
              aria-label="Search suggestions"
              className="max-h-80 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  id={`autocomplete-option-${index}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`
                    px-4 py-2 cursor-pointer truncate transition-colors
                    ${selectedIndex === index 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onSelect(suggestion)}
                  onMouseEnter={(e) => {
                    // Add hover effect
                    if (selectedIndex !== index) {
                      e.currentTarget.classList.add('bg-gray-50');
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Remove hover effect
                    if (selectedIndex !== index) {
                      e.currentTarget.classList.remove('bg-gray-50');
                    }
                  }}
                >
                  {highlightMatch(suggestion, query)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </>
      )}
    </div>
  );
}