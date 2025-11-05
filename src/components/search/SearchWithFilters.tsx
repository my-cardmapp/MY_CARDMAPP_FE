import React, { useEffect } from 'react';
import { FilterPanel } from './FilterPanel';
import { useSearchStore } from '@/stores/searchStore';
import type { Merchant } from '@/types/api';

/**
 * Example component demonstrating the integration of FilterPanel with searchStore
 * This shows how to use the centralized state management for search and filters
 */
export const SearchWithFilters: React.FC = () => {
  const {
    query,
    setQuery,
    activeCardTypes,
    activeCategories,
    merchants,
    isLoading,
    error,
    viewMode,
    toggleViewMode,
    activeFilterCount,
    hasActiveFilters,
    clearFilters,
    setMerchants,
    setLoading,
    setError,
    toURLParams,
    fromURLParams,
  } = useSearchStore();

  // Load initial state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString()) {
      fromURLParams(params);
    }
  }, [fromURLParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = toURLParams();
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  }, [query, activeCardTypes, activeCategories, viewMode, toURLParams]);

  // Fetch merchants when filters change
  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (activeCardTypes.length > 0) {
          params.set('cardTypes', activeCardTypes.join(','));
        }
        if (activeCategories.length > 0) {
          params.set('categories', activeCategories.join(','));
        }

        const response = await fetch(`/api/v1/merchants/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch merchants');
        }

        const data = await response.json();
        setMerchants(data.content || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, [query, activeCardTypes, activeCategories, setMerchants, setLoading, setError]);

  return (
    <div className="flex h-screen">
      {/* Sidebar with search and filters */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="가맹점 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Panel with store integration */}
        <FilterPanel useStore={true} className="border-0 shadow-none rounded-none" />

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                활성 필터: {activeFilterCount()}개
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                모두 해제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeCardTypes.map((cardType) => (
                <span
                  key={cardType}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {cardType}
                </span>
              ))}
              {activeCategories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with view toggle */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              검색 결과 ({merchants.length}개)
            </h2>
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'map' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  목록 보기
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  지도 보기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">가맹점을 검색하는 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-red-600">{error}</p>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="p-4 space-y-4">
              {merchants.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
              {merchants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">지도 뷰는 구현 예정입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple merchant card component
const MerchantCard: React.FC<{ merchant: Merchant }> = ({ merchant }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{merchant.address}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {merchant.cards.map((card) => (
              <span
                key={card.code}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: `${card.colorHex}20`,
                  color: card.colorHex,
                  border: `1px solid ${card.colorHex}40`
                }}
              >
                {card.name}
              </span>
            ))}
          </div>
        </div>
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {merchant.category.name}
        </span>
      </div>
    </div>
  );
};