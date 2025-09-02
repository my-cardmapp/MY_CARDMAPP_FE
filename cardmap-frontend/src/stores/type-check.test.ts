import { describe, it, expect } from 'vitest'
import type { MapStore, MerchantStore } from './types'
import { useMapStore } from './mapStore'
import { useMerchantStore } from './merchantStore'

describe('TypeScript Type Safety', () => {
  it('should enforce correct types for MapStore', () => {
    const store = useMapStore.getState()
    
    // Type assertions to verify correct typing
    const viewport: MapStore['viewport'] = store.viewport
    expect(viewport).toHaveProperty('center')
    expect(viewport).toHaveProperty('zoom')
    expect(typeof viewport.center.lat).toBe('number')
    expect(typeof viewport.center.lng).toBe('number')
    expect(typeof viewport.zoom).toBe('number')
    
    // Test method signatures
    const setMap: MapStore['setMap'] = store.setMap
    expect(typeof setMap).toBe('function')
    
    const setViewport: MapStore['setViewport'] = store.setViewport
    expect(typeof setViewport).toBe('function')
    
    // Test Map type
    const markers: MapStore['markers'] = store.markers
    expect(markers instanceof Map).toBe(true)
    
    // Test Set type
    const visibleIds: MapStore['visibleMarkerIds'] = store.visibleMarkerIds
    expect(visibleIds instanceof Set).toBe(true)
  })

  it('should enforce correct types for MerchantStore', () => {
    const store = useMerchantStore.getState()
    
    // Type assertions to verify correct typing
    const merchants: MerchantStore['merchants'] = store.merchants
    expect(Array.isArray(merchants)).toBe(true)
    
    const filters: MerchantStore['filters'] = store.filters
    expect(filters).toHaveProperty('cardTypes')
    expect(filters).toHaveProperty('categories')
    expect(filters).toHaveProperty('searchQuery')
    expect(filters).toHaveProperty('radius')
    expect(filters).toHaveProperty('onlyOpen')
    
    expect(Array.isArray(filters.cardTypes)).toBe(true)
    expect(Array.isArray(filters.categories)).toBe(true)
    expect(typeof filters.searchQuery).toBe('string')
    expect(typeof filters.radius).toBe('number')
    expect(typeof filters.onlyOpen).toBe('boolean')
    
    // Test method signatures
    const setMerchants: MerchantStore['setMerchants'] = store.setMerchants
    expect(typeof setMerchants).toBe('function')
    
    const getFilteredMerchants: MerchantStore['getFilteredMerchants'] = store.getFilteredMerchants
    expect(typeof getFilteredMerchants).toBe('function')
    
    // Test pagination types
    const page: MerchantStore['page'] = store.page
    const pageSize: MerchantStore['pageSize'] = store.pageSize
    const totalCount: MerchantStore['totalCount'] = store.totalCount
    const hasMore: MerchantStore['hasMore'] = store.hasMore
    
    expect(typeof page).toBe('number')
    expect(typeof pageSize).toBe('number')
    expect(typeof totalCount).toBe('number')
    expect(typeof hasMore).toBe('boolean')
    
    // Test async methods
    const fetchMerchants: MerchantStore['fetchMerchants'] = store.fetchMerchants
    expect(typeof fetchMerchants).toBe('function')
    
    const fetchNearbyMerchants: MerchantStore['fetchNearbyMerchants'] = store.fetchNearbyMerchants
    expect(typeof fetchNearbyMerchants).toBe('function')
  })

  it('should properly type selector hooks', async () => {
    // These would normally be used in components
    const { useMapViewport, useMapControls, useMapLoadingState } = await import('./mapStore')
    const { useMerchantFilters, useMerchantLoadingState, useMerchantPagination } = await import('./merchantStore')
    
    expect(typeof useMapViewport).toBe('function')
    expect(typeof useMapControls).toBe('function')
    expect(typeof useMapLoadingState).toBe('function')
    expect(typeof useMerchantFilters).toBe('function')
    expect(typeof useMerchantLoadingState).toBe('function')
    expect(typeof useMerchantPagination).toBe('function')
  })

  it('should handle optional and required fields correctly', () => {
    const mapStore = useMapStore.getState()
    const merchantStore = useMerchantStore.getState()
    
    // Required fields should exist
    expect(mapStore.map !== undefined).toBe(true)
    expect(mapStore.viewport !== undefined).toBe(true)
    expect(mapStore.markers !== undefined).toBe(true)
    
    expect(merchantStore.merchants !== undefined).toBe(true)
    expect(merchantStore.filters !== undefined).toBe(true)
    expect(merchantStore.page !== undefined).toBe(true)
    
    // Nullable fields
    expect(mapStore.map === null || mapStore.map !== undefined).toBe(true)
    expect(merchantStore.selectedMerchant === null || merchantStore.selectedMerchant !== undefined).toBe(true)
    expect(merchantStore.error === null || merchantStore.error instanceof Error).toBe(true)
  })
})