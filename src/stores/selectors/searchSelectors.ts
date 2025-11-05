/**
 * Optimized selectors for Search Store
 * Using shallow equality and memoization for performance
 */

import { useSearchStore } from '../searchStore'
import type { SearchStore } from '../searchStore'
import { 
  shallow, 
  createShallowSelector,
  createMemoizedComputation,
  createDebouncedSelector 
} from '../utils/performance'

// Optimized filter state selector
export const useSearchFiltersOptimized = () => {
  return useSearchStore(
    (state) => ({
      activeCardTypes: state.activeCardTypes,
      activeCategories: state.activeCategories,
      filterCount: state.activeFilterCount()
    }),
    shallow
  )
}

// Debounced search query selector (prevents too many updates)
const getDebouncedQuery = createDebouncedSelector<SearchStore, string>(
  (state) => state.query,
  300 // 300ms debounce
)

export const useDebouncedSearchQuery = () => {
  return useSearchStore(getDebouncedQuery)
}

// Memoized filter summary
const getFilterSummary = createMemoizedComputation<SearchStore, {
  activeFilters: string[]
  filterString: string
  hasFilters: boolean
  totalCount: number
}>(
  (state) => {
    const activeFilters: string[] = []
    
    state.activeCardTypes.forEach(card => {
      activeFilters.push(`card:${card}`)
    })
    
    state.activeCategories.forEach(category => {
      activeFilters.push(`category:${category}`)
    })
    
    return {
      activeFilters,
      filterString: state.getFilterString(),
      hasFilters: state.hasActiveFilters(),
      totalCount: state.activeFilterCount()
    }
  },
  ['activeCardTypes', 'activeCategories']
)

export const useFilterSummary = () => {
  return useSearchStore(getFilterSummary)
}

// Combined search state
export const useSearchStateOptimized = () => {
  return useSearchStore(
    (state) => ({
      query: state.query,
      suggestions: state.suggestions,
      viewMode: state.viewMode,
      isLoading: state.isLoading,
      error: state.error,
      merchantCount: state.merchants.length
    }),
    shallow
  )
}

// Pagination state optimized
export const useSearchPaginationOptimized = () => {
  return useSearchStore(
    (state) => ({
      page: state.page,
      totalPages: state.totalPages,
      totalResults: state.totalResults,
      hasMore: state.page < state.totalPages
    }),
    shallow
  )
}

// Results selector with shallow equality
export const useSearchResultsOptimized = () => {
  return useSearchStore(
    (state) => state.merchants,
    shallow
  )
}

// URL sync state selector
export const useURLSyncState = () => {
  return useSearchStore(
    (state) => ({
      params: state.toURLParams(),
      query: state.query,
      cardTypes: state.activeCardTypes,
      categories: state.activeCategories,
      viewMode: state.viewMode
    }),
    shallow
  )
}

// Actions selector (doesn't cause re-renders)
export const useSearchActions = () => {
  return useSearchStore(
    (state) => ({
      setQuery: state.setQuery,
      clearQuery: state.clearQuery,
      setSuggestions: state.setSuggestions,
      toggleCardType: state.toggleCardType,
      toggleCategory: state.toggleCategory,
      setCardTypes: state.setCardTypes,
      setCategories: state.setCategories,
      clearFilters: state.clearFilters,
      setViewMode: state.setViewMode,
      toggleViewMode: state.toggleViewMode,
      executeSearch: state.executeSearch,
      batchUpdate: state.batchUpdate,
      reset: state.reset
    }),
    shallow
  )
}

// Memoized active filter checks
const createFilterChecker = (type: 'card' | 'category') => 
  createMemoizedComputation<SearchStore, (value: string) => boolean>(
    (state) => {
      const activeList = type === 'card' ? state.activeCardTypes : state.activeCategories
      const set = new Set(activeList)
      return (value: string) => set.has(value)
    },
    [type === 'card' ? 'activeCardTypes' : 'activeCategories']
  )

const cardTypeChecker = createFilterChecker('card')
const categoryChecker = createFilterChecker('category')

export const useIsCardTypeActive = () => {
  const checker = useSearchStore(cardTypeChecker)
  return checker
}

export const useIsCategoryActive = () => {
  const checker = useSearchStore(categoryChecker)
  return checker
}

// Suggestions with optimization
export const useSuggestionsOptimized = () => {
  return useSearchStore(
    (state) => state.suggestions,
    shallow
  )
}

// Error state selector
export const useSearchError = () => {
  return useSearchStore(
    (state) => ({
      hasError: state.error !== null,
      error: state.error
    }),
    shallow
  )
}

// Combined filter and search for components
export const useSearchAndFilter = () => {
  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore(
    (state) => ({
      cardTypes: state.activeCardTypes,
      categories: state.activeCategories
    }),
    shallow
  )
  const executeSearch = useSearchStore((state) => state.executeSearch)
  
  return {
    query,
    filters,
    executeSearch
  }
}

// View mode selector
export const useViewMode = () => {
  return useSearchStore((state) => state.viewMode)
}

// Loading state selector
export const useIsSearching = () => {
  return useSearchStore((state) => state.isLoading)
}