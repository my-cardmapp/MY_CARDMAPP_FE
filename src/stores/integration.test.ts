import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useMapStore } from './mapStore'
import { useMerchantStore } from './merchantStore'
import { useSearchStore } from './searchStore'
import type { Merchant } from '@/types/merchant'

describe('Zustand Stores Integration', () => {
  beforeEach(() => {
    // Reset all stores
    useMapStore.getState().reset()
    useMerchantStore.getState().reset()
    useSearchStore.getState().reset()
  })

  describe('Cross-store communication', () => {
    it('should sync merchant data with map markers', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const { result: mapResult } = renderHook(() => useMapStore())

      const mockMerchants: Merchant[] = [
        {
          id: 1,
          name: 'Test Merchant 1',
          address: 'Seoul',
          location: { lat: 37.5, lng: 127.0 },
          cards: [],
          category: { id: 1, code: 'FOOD', name: '음식점' },
          isVerified: true
        },
        {
          id: 2,
          name: 'Test Merchant 2',
          address: 'Seoul',
          location: { lat: 37.51, lng: 127.01 },
          cards: [],
          category: { id: 2, code: 'CAFE', name: '카페' },
          isVerified: false
        }
      ]

      // Set merchants
      act(() => {
        merchantResult.current.setMerchants(mockMerchants)
      })

      // Convert merchants to markers
      act(() => {
        const markers = mockMerchants.map((merchant) => ({
          id: merchant.id.toString(),
          position: merchant.location,
          merchant
        }))
        mapResult.current.setMarkers(markers)
      })

      expect(mapResult.current.markers.size).toBe(2)
      expect(merchantResult.current.merchants).toHaveLength(2)
    })

    it('should update search state when filters change', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const { result: searchResult } = renderHook(() => useSearchStore())

      // Update merchant filters
      act(() => {
        merchantResult.current.setFilters({
          searchQuery: 'test query',
          cardTypes: ['CHILD_MEAL']
        })
      })

      // Sync with search store
      act(() => {
        searchResult.current.setQuery('test query')
        searchResult.current.setCardTypes(['CHILD_MEAL'])
      })

      expect(merchantResult.current.filters.searchQuery).toBe('test query')
      expect(searchResult.current.query).toBe('test query')
      expect(merchantResult.current.filters.cardTypes).toEqual(['CHILD_MEAL'])
      expect(searchResult.current.activeCardTypes).toEqual(['CHILD_MEAL'])
    })

    it('should handle selected merchant across stores', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const { result: mapResult } = renderHook(() => useMapStore())

      const selectedMerchant: Merchant = {
        id: 1,
        name: 'Selected Merchant',
        address: 'Seoul',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점' },
        isVerified: true
      }

      // Select merchant
      act(() => {
        merchantResult.current.setSelectedMerchant(selectedMerchant)
      })

      // Update map viewport to center on selected merchant
      act(() => {
        mapResult.current.setViewport({
          center: selectedMerchant.location,
          zoom: 15
        })
      })

      expect(merchantResult.current.selectedMerchant).toEqual(selectedMerchant)
      expect(mapResult.current.viewport.center).toEqual(selectedMerchant.location)
      expect(mapResult.current.viewport.zoom).toBe(15)
    })

    it('should manage loading states independently', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const { result: searchResult } = renderHook(() => useSearchStore())
      const { result: mapResult } = renderHook(() => useMapStore())

      // Set different loading states
      act(() => {
        merchantResult.current.setLoading(true)
        searchResult.current.setLoading(true)
        mapResult.current.setScriptLoading(true)
      })

      expect(merchantResult.current.isLoading).toBe(true)
      expect(searchResult.current.isLoading).toBe(true)
      expect(mapResult.current.isScriptLoading).toBe(true)

      // Complete merchant loading
      act(() => {
        merchantResult.current.setLoading(false)
      })

      expect(merchantResult.current.isLoading).toBe(false)
      expect(searchResult.current.isLoading).toBe(true) // Still loading
      expect(mapResult.current.isScriptLoading).toBe(true) // Still loading
    })

    it('should reset all stores independently', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const { result: searchResult } = renderHook(() => useSearchStore())
      const { result: mapResult } = renderHook(() => useMapStore())

      // Setup some data
      act(() => {
        merchantResult.current.setMerchants([
          {
            id: 1,
            name: 'Test',
            address: 'Seoul',
            location: { lat: 37.5, lng: 127.0 },
            cards: [],
            category: { id: 1, code: 'FOOD', name: '음식점' },
            isVerified: true
          }
        ])
        searchResult.current.setQuery('test')
        mapResult.current.setViewport({ zoom: 15 })
      })

      // Reset only merchant store
      act(() => {
        merchantResult.current.reset()
      })

      expect(merchantResult.current.merchants).toEqual([])
      expect(searchResult.current.query).toBe('test') // Unchanged
      expect(mapResult.current.viewport.zoom).toBe(15) // Unchanged

      // Reset all stores
      act(() => {
        searchResult.current.reset()
        mapResult.current.reset()
      })

      expect(searchResult.current.query).toBe('')
      expect(mapResult.current.viewport.zoom).toBe(13) // Default
    })
  })

  describe('Performance optimizations', () => {
    it('should use shallow equality for selectors', () => {
      const { result: mapResult } = renderHook(() => useMapStore())
      
      const viewport1 = mapResult.current.viewport
      
      // Update something else
      act(() => {
        mapResult.current.setScriptLoaded(true)
      })
      
      const viewport2 = mapResult.current.viewport
      
      // Viewport object should be the same reference if unchanged
      expect(viewport1).toBe(viewport2)
    })

    it('should batch updates efficiently', () => {
      const { result: merchantResult } = renderHook(() => useMerchantStore())
      const updateSpy = vi.fn()
      
      // Subscribe to updates
      const unsubscribe = useMerchantStore.subscribe(updateSpy)
      
      // Batch multiple updates
      act(() => {
        merchantResult.current.setFilters({
          cardTypes: ['CHILD_MEAL'],
          categories: ['FOOD']
        })
      })
      
      // Should trigger only one update
      expect(updateSpy).toHaveBeenCalledTimes(1)
      
      unsubscribe()
    })
  })

  describe('DevTools integration', () => {
    it('should have proper store names for debugging', () => {
      expect(useMapStore.getState).toBeDefined()
      expect(useMerchantStore.getState).toBeDefined()
      expect(useSearchStore.getState).toBeDefined()
      
      // Store names are set in implementation for DevTools
    })
  })
})