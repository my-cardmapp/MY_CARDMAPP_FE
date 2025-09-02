/**
 * Optimized selectors for Merchant Store
 * Using shallow equality and memoization for performance
 */

import { useMerchantStore } from '../merchantStore'
import type { MerchantStore } from '../types'
import type { Merchant } from '@/types/merchant'
import { 
  shallow, 
  createShallowSelector,
  createMemoizedComputation 
} from '../utils/performance'

// Optimized filters selector
export const useMerchantFiltersOptimized = () => {
  return useMerchantStore(
    createShallowSelector<MerchantStore, 'filters'>(['filters']),
    shallow
  )
}

// Memoized filtered merchants with performance tracking
const getFilteredMerchantsOptimized = createMemoizedComputation<MerchantStore, Merchant[]>(
  (state) => {
    let filtered = [...state.merchants]
    const { cardTypes, categories, searchQuery, onlyOpen } = state.filters

    // Filter by card types
    if (cardTypes.length > 0) {
      filtered = filtered.filter((merchant) =>
        merchant.cards.some((card) => cardTypes.includes(card.code))
      )
    }

    // Filter by categories
    if (categories.length > 0) {
      filtered = filtered.filter((merchant) =>
        categories.includes(merchant.category.code)
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((merchant) =>
        merchant.name.toLowerCase().includes(query) ||
        merchant.address.toLowerCase().includes(query)
      )
    }

    // Filter by open status
    if (onlyOpen && typeof window !== 'undefined') {
      const now = new Date()
      const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()]
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      filtered = filtered.filter((merchant) => {
        const hours = merchant.businessHours?.[day]
        if (!hours || hours.length !== 2) return false
        return currentTime >= hours[0] && currentTime <= hours[1]
      })
    }

    return filtered
  },
  ['merchants', 'filters']
)

export const useFilteredMerchants = () => {
  return useMerchantStore(getFilteredMerchantsOptimized)
}

// Memoized merchant statistics
const getMerchantStats = createMemoizedComputation<MerchantStore, {
  total: number
  filtered: number
  nearby: number
  byCardType: Record<string, number>
  byCategory: Record<string, number>
}>(
  (state) => {
    const byCardType: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    
    state.merchants.forEach((merchant) => {
      // Count by card type
      merchant.cards.forEach((card) => {
        byCardType[card.code] = (byCardType[card.code] || 0) + 1
      })
      
      // Count by category
      const categoryCode = merchant.category.code
      byCategory[categoryCode] = (byCategory[categoryCode] || 0) + 1
    })
    
    const filtered = state.getFilteredMerchants()
    
    return {
      total: state.merchants.length,
      filtered: filtered.length,
      nearby: state.nearbyMerchants.length,
      byCardType,
      byCategory
    }
  },
  ['merchants', 'nearbyMerchants', 'filters']
)

export const useMerchantStats = () => {
  return useMerchantStore(getMerchantStats)
}

// Combined loading states
export const useMerchantLoadingOptimized = () => {
  return useMerchantStore(
    (state) => ({
      isLoading: state.isLoading,
      isLoadingNearby: state.isLoadingNearby,
      error: state.error,
      lastFetch: state.lastFetch
    }),
    shallow
  )
}

// Pagination state with shallow equality
export const useMerchantPaginationOptimized = () => {
  return useMerchantStore(
    (state) => ({
      page: state.page,
      pageSize: state.pageSize,
      totalCount: state.totalCount,
      hasMore: state.hasMore
    }),
    shallow
  )
}

// Selected merchant with optimization
export const useSelectedMerchantOptimized = () => {
  return useMerchantStore(
    (state) => state.selectedMerchant,
    (a, b) => {
      if (!a && !b) return true
      if (!a || !b) return false
      return a.id === b.id
    }
  )
}

// Nearby merchants selector
export const useNearbyMerchantsOptimized = () => {
  return useMerchantStore(
    (state) => state.nearbyMerchants,
    shallow
  )
}

// Available options selectors
export const useAvailableOptions = () => {
  return useMerchantStore(
    (state) => ({
      cards: state.availableCards,
      categories: state.availableCategories
    }),
    shallow
  )
}

// Actions selector (doesn't cause re-renders)
export const useMerchantActions = () => {
  return useMerchantStore(
    (state) => ({
      setMerchants: state.setMerchants,
      appendMerchants: state.appendMerchants,
      setSelectedMerchant: state.setSelectedMerchant,
      selectMerchantById: state.selectMerchantById,
      setFilters: state.setFilters,
      updateFilter: state.updateFilter,
      resetFilters: state.resetFilters,
      toggleCardType: state.toggleCardType,
      toggleCategory: state.toggleCategory,
      fetchMerchants: state.fetchMerchants,
      fetchNearbyMerchants: state.fetchNearbyMerchants,
      searchMerchants: state.searchMerchants
    }),
    shallow
  )
}

// Cache status selector
export const useCacheStatus = () => {
  return useMerchantStore(
    (state) => ({
      cacheKey: state.cacheKey,
      lastFetch: state.lastFetch,
      isStale: state.lastFetch ? Date.now() - state.lastFetch > 5 * 60 * 1000 : true // 5 minutes
    }),
    shallow
  )
}

// Memoized selector for merchants by card type
const getMerchantsByCardType = (cardType: string) => 
  createMemoizedComputation<MerchantStore, Merchant[]>(
    (state) => state.merchants.filter((merchant) =>
      merchant.cards.some((card) => card.code === cardType)
    ),
    ['merchants']
  )

export const useMerchantsByCardType = (cardType: string) => {
  return useMerchantStore(getMerchantsByCardType(cardType))
}

// Optimized selector for merchant search
export const useMerchantSearch = () => {
  const merchants = useMerchantStore((state) => state.merchants)
  const filters = useMerchantStore((state) => state.filters, shallow)
  const searchMerchants = useMerchantStore((state) => state.searchMerchants)
  
  return {
    merchants,
    filters,
    searchMerchants
  }
}