import React, { useMemo, useCallback, memo } from 'react';
import { useSearchStore } from '@/stores/searchStore';
import MerchantList from '@/components/merchant/MerchantList';
import MapContainer from '@/components/map/MapContainer';
import type { Merchant } from '@/types';
import { MapIcon, ListBulletIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { SkeletonList } from '../ui/LoadingStates';
import { NetworkError, TimeoutError, EmptyState } from '../ui/ErrorStates';

interface SearchResultsProps {
  viewMode?: 'list' | 'map';
  onViewModeChange?: (mode: 'list' | 'map') => void;
  className?: string;
  onMerchantClick?: (merchant: Merchant) => void;
  onRetry?: () => void;
  onClearFilters?: () => void;
  merchants?: Merchant[];
  isLoading?: boolean;
  error?: { type: string; message?: string; duration?: number };
  skeletonCount?: number;
  emptySuggestions?: string[];
}

/**
 * SearchResults Component
 * Displays filtered merchant data with list/map view toggle
 */
const SearchResults = memo(function SearchResults({
  viewMode: controlledViewMode,
  onViewModeChange,
  className = '',
  onMerchantClick,
  onRetry,
  onClearFilters,
  merchants: propMerchants,
  isLoading: propIsLoading,
  error: propError,
  skeletonCount = 10,
  emptySuggestions
}: SearchResultsProps) {
  // Get state from search store
  const {
    merchants: storeMerchants,
    isLoading: storeIsLoading,
    error: storeError,
    viewMode: storeViewMode,
    totalResults,
    page,
    totalPages,
    activeCardTypes,
    activeCategories,
    setViewMode,
    toggleViewMode,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    getFilterString
  } = useSearchStore();
  
  // Use prop values if provided, otherwise use store values
  const merchants = propMerchants ?? storeMerchants;
  const isLoading = propIsLoading ?? storeIsLoading;
  const error = propError ?? (storeError ? { type: 'network', message: storeError } : null);

  // Determine which view mode to use (controlled or from store)
  const currentViewMode = controlledViewMode ?? storeViewMode;

  // Memoize filter information
  const filterInfo = useMemo(() => ({
    count: activeFilterCount(),
    hasFilters: hasActiveFilters(),
    filterString: getFilterString()
  }), [activeFilterCount, hasActiveFilters, getFilterString, activeCardTypes, activeCategories]);

  // Handle view mode toggle
  const handleViewModeToggle = useCallback(() => {
    const newMode = currentViewMode === 'list' ? 'map' : 'list';
    
    if (onViewModeChange) {
      onViewModeChange(newMode);
    } else {
      toggleViewMode();
    }
  }, [currentViewMode, onViewModeChange, toggleViewMode]);

  // Handle merchant click
  const handleMerchantClick = useCallback((merchant: Merchant) => {
    if (onMerchantClick) {
      onMerchantClick(merchant);
    }
  }, [onMerchantClick]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Result summary component
  const ResultSummary = useMemo(() => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span 
          role="status"
          className="text-sm font-medium text-gray-700"
        >
          {totalResults} {totalResults === 1 ? 'result' : 'results'} found
        </span>
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            (Page {page + 1} of {totalPages})
          </span>
        )}
      </div>
      
      {filterInfo.hasFilters && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {filterInfo.filterString}
            </span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full">
              {filterInfo.count}
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  ), [totalResults, totalPages, page, filterInfo, handleClearFilters]);

  // Loading state with skeleton screens
  if (isLoading && merchants.length === 0) {
    return (
      <div 
        data-testid="search-results"
        className={`${className}`}
      >
        <SkeletonList count={skeletonCount} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        data-testid="search-results"
        className={`${className}`}
      >
        {error.type === 'network' && (
          <NetworkError onRetry={onRetry || (() => {})} />
        )}
        {error.type === 'timeout' && (
          <TimeoutError 
            duration={error.duration}
            onRetry={onRetry || (() => {})} 
          />
        )}
        {error.type !== 'network' && error.type !== 'timeout' && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error.message || 'An error occurred'}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (!isLoading && merchants.length === 0) {
    const clearFiltersAction = onClearFilters || (filterInfo.hasFilters ? handleClearFilters : undefined);
    
    return (
      <div 
        data-testid="search-results"
        className={`${className}`}
      >
        <EmptyState
          message="No results found"
          suggestions={emptySuggestions || (filterInfo.hasFilters ? [
            'Try adjusting your filters',
            'Search for different keywords',
            'Check your spelling'
          ] : undefined)}
          action={clearFiltersAction ? {
            label: 'Clear filters',
            onClick: clearFiltersAction
          } : undefined}
        />
      </div>
    );
  }

  // Partial loading state (loading more results)
  // We'll continue showing existing results with a loading indicator in the main view

  return (
    <div 
      data-testid="search-results"
      className={`flex flex-col h-full ${className}`}
      role="region"
      aria-label="Search results"
    >
      {/* Controls Bar */}
      <div 
        data-testid="results-controls"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-b border-gray-200 gap-3"
      >
        {/* Result Summary */}
        <div className="flex-1">
          {ResultSummary}
        </div>

        {/* View Toggle Button */}
        <button
          onClick={handleViewModeToggle}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border
            transition-colors font-medium text-sm
            bg-white border-gray-300 hover:bg-gray-50
          `}
          aria-label={currentViewMode === 'list' ? 'Map View' : 'List View'}
          aria-pressed={currentViewMode === 'map'}
        >
          {currentViewMode === 'list' ? (
            <>
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </>
          ) : (
            <>
              <ListBulletIcon className="w-4 h-4" />
              <span>List View</span>
            </>
          )}
        </button>
      </div>

      {/* View Container with transition */}
      <div 
        data-testid="view-container"
        className="flex-1 overflow-hidden transition-opacity duration-200"
      >
        {currentViewMode === 'list' ? (
          <MerchantList
            merchants={merchants}
            onItemClick={handleMerchantClick}
            isLoading={isLoading}
            headerContent={null}
            emptyMessage="No merchants found"
          />
        ) : (
          <MapContainer
            merchants={merchants}
            activeCardTypes={activeCardTypes}
            onMarkerClick={handleMerchantClick}
            className="h-full w-full"
            enableClustering={true}
          />
        )}
      </div>
    </div>
  );
});

export default SearchResults;