/**
 * Central export for all optimized store selectors
 * Import from here to use performance-optimized selectors
 */

// Map Store Selectors
export {
  useMapViewportOptimized,
  useMapLoadingStateOptimized,
  useMapControlsOptimized,
  useVisibleMarkers,
  useMarkerStats,
  useMapBounds,
  useMapStateOptimized,
  useMapActions,
  useMapOperations,
  useScriptStatus
} from './mapSelectors'

// Merchant Store Selectors
export {
  useMerchantFiltersOptimized,
  useFilteredMerchants,
  useMerchantStats,
  useMerchantLoadingOptimized,
  useMerchantPaginationOptimized,
  useSelectedMerchantOptimized,
  useNearbyMerchantsOptimized,
  useAvailableOptions,
  useMerchantActions,
  useCacheStatus,
  useMerchantsByCardType,
  useMerchantSearch
} from './merchantSelectors'

// Search Store Selectors
export {
  useSearchFiltersOptimized,
  useDebouncedSearchQuery,
  useFilterSummary,
  useSearchStateOptimized,
  useSearchPaginationOptimized,
  useSearchResultsOptimized,
  useURLSyncState,
  useSearchActions,
  useIsCardTypeActive,
  useIsCategoryActive,
  useSuggestionsOptimized,
  useSearchError,
  useSearchAndFilter,
  useViewMode,
  useIsSearching
} from './searchSelectors'

// Re-export performance utilities for custom selector creation
export {
  shallow,
  createShallowSelector,
  createMemoizedComputation,
  createBatchUpdater,
  createPerformanceMonitor,
  createDebouncedSelector,
  createThrottledSelector,
  createStructuralEqualityFn,
  createSelector,
  type Selector,
  type EqualityFn
} from '../utils/performance'