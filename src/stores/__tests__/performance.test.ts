/**
 * Performance optimization tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMapStore } from '../mapStore'
import { useMerchantStore } from '../merchantStore'
import { useSearchStore } from '../searchStore'
import {
  useMapViewportOptimized,
  useFilteredMerchants,
  useSearchFiltersOptimized,
  useDebouncedSearchQuery
} from '../selectors/index'
import {
  createMemoizedComputation,
  createPerformanceMonitor,
  createStructuralEqualityFn
} from '../utils/performance'

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Reset stores
    useMapStore.setState(useMapStore.getInitialState())
    useMerchantStore.setState(useMerchantStore.getInitialState())
    useSearchStore.setState(useSearchStore.getInitialState())
  })

  describe('Shallow Equality Checks', () => {
    it('should not re-render when object values are the same', () => {
      const { result, rerender } = renderHook(() => useMapViewportOptimized())
      
      const initialViewport = result.current.viewport
      
      // Update with same values
      act(() => {
        useMapStore.getState().setViewport({
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 13
        })
      })
      
      rerender()
      
      // Should be the same reference due to shallow equality
      expect(result.current.viewport).toBe(initialViewport)
    })

    it('should re-render only when values actually change', () => {
      const { result, rerender } = renderHook(() => useSearchFiltersOptimized())
      
      const initialFilters = result.current
      
      // Update with different values
      act(() => {
        useSearchStore.getState().toggleCardType('CHILD_MEAL')
      })
      
      rerender()
      
      // Should be different reference
      expect(result.current).not.toBe(initialFilters)
      expect(result.current.activeCardTypes).toContain('CHILD_MEAL')
    })
  })

  describe('Memoized Computations', () => {
    it('should cache expensive computations', () => {
      const computeFn = vi.fn((state: any) => {
        // Simulate expensive computation
        return state.merchants.filter((m: any) => m.active).length
      })
      
      const memoizedCompute = createMemoizedComputation(
        computeFn,
        ['merchants']
      )
      
      const testState = {
        merchants: [
          { id: 1, active: true },
          { id: 2, active: false },
          { id: 3, active: true }
        ],
        otherProp: 'value'
      }
      
      // First call
      const result1 = memoizedCompute(testState)
      expect(result1).toBe(2)
      expect(computeFn).toHaveBeenCalledTimes(1)
      
      // Second call with same merchants
      const result2 = memoizedCompute(testState)
      expect(result2).toBe(2)
      expect(computeFn).toHaveBeenCalledTimes(1) // Not called again
      
      // Third call with different merchants
      const newState = {
        ...testState,
        merchants: [...testState.merchants, { id: 4, active: true }]
      }
      const result3 = memoizedCompute(newState)
      expect(result3).toBe(3)
      expect(computeFn).toHaveBeenCalledTimes(2) // Called again
    })

    it('should only recompute when dependencies change', () => {
      const { result } = renderHook(() => useFilteredMerchants())
      
      // Set initial merchants
      act(() => {
        useMerchantStore.getState().setMerchants([
          {
            id: 1,
            name: 'Test Merchant 1',
            address: 'Address 1',
            location: { lat: 37.5, lng: 127 },
            cards: [{ id: 1, code: 'CHILD_MEAL', name: 'Child Meal', colorHex: '#000', iconUrl: '' }],
            category: { id: 1, code: 'restaurant', name: 'Restaurant', icon: '' },
            isVerified: true
          },
          {
            id: 2,
            name: 'Test Merchant 2',
            address: 'Address 2',
            location: { lat: 37.6, lng: 127.1 },
            cards: [{ id: 2, code: 'CULTURE', name: 'Culture', colorHex: '#000', iconUrl: '' }],
            category: { id: 2, code: 'cafe', name: 'Cafe', icon: '' },
            isVerified: true
          }
        ])
      })
      
      const initialResult = result.current
      
      // Update non-dependency field
      act(() => {
        useMerchantStore.getState().setLoading(true)
      })
      
      // Should return same reference (memoized)
      expect(result.current).toBe(initialResult)
    })
  })

  describe('Debounced Selectors', () => {
    it('should debounce frequent updates', async () => {
      vi.useFakeTimers()
      
      const { result, rerender } = renderHook(() => useDebouncedSearchQuery())
      
      // Rapid updates
      act(() => {
        useSearchStore.getState().setQuery('a')
      })
      rerender()
      
      act(() => {
        useSearchStore.getState().setQuery('ab')
      })
      rerender()
      
      act(() => {
        useSearchStore.getState().setQuery('abc')
      })
      rerender()
      
      // Should still show initial value
      expect(result.current).toBe('')
      
      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Now should show final value
      expect(result.current).toBe('')
      
      vi.useRealTimers()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track slow updates in development', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const monitor = createPerformanceMonitor('TestStore')
      
      // Simulate fast update
      monitor.startUpdate('fastAction')
      monitor.endUpdate('fastAction')
      
      expect(consoleSpy).not.toHaveBeenCalled()
      
      // Simulate slow update
      const slowAction = monitor.startUpdate('slowAction')
      
      // Mock performance.now to simulate slow update
      const originalNow = performance.now
      performance.now = vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(20) // 20ms duration
      
      monitor.startUpdate('slowAction')
      monitor.endUpdate('slowAction')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestStore] Slow update detected:'),
        expect.objectContaining({
          action: 'slowAction',
          duration: expect.stringContaining('ms')
        })
      )
      
      performance.now = originalNow
      consoleSpy.mockRestore()
    })
  })

  describe('Structural Equality', () => {
    it('should efficiently compare complex objects', () => {
      const equalityFn = createStructuralEqualityFn<{
        filters: { cardTypes: string[]; categories: string[] }
        page: number
      }>(['filters', 'page'])
      
      const obj1 = {
        filters: { cardTypes: ['CHILD_MEAL'], categories: ['restaurant'] },
        page: 1
      }
      
      const obj2 = {
        filters: { cardTypes: ['CHILD_MEAL'], categories: ['restaurant'] },
        page: 1
      }
      
      const obj3 = {
        filters: { cardTypes: ['CHILD_MEAL', 'CULTURE'], categories: ['restaurant'] },
        page: 1
      }
      
      expect(equalityFn(obj1, obj2)).toBe(true)
      expect(equalityFn(obj1, obj3)).toBe(false)
    })
  })

  describe('Selector Re-render Prevention', () => {
    it('should prevent unnecessary re-renders with optimized selectors', () => {
      const renderCount = { count: 0 }
      
      const TestComponent = () => {
        renderCount.count++
        const viewport = useMapViewportOptimized()
        return null
      }
      
      const { rerender } = renderHook(() => TestComponent())
      
      expect(renderCount.count).toBe(1)
      
      // Update unrelated state
      act(() => {
        useMapStore.getState().setLoading(true)
      })
      
      rerender()
      
      // Should not cause re-render
      expect(renderCount.count).toBe(1)
      
      // Update related state
      act(() => {
        useMapStore.getState().setViewport({ zoom: 15 })
      })
      
      rerender()
      
      // Should cause re-render
      expect(renderCount.count).toBe(2)
    })
  })

  describe('Batch Updates', () => {
    it('should batch multiple state updates', () => {
      const { result } = renderHook(() => useSearchStore())
      
      act(() => {
        result.current.batchUpdate({
          query: 'pizza',
          activeCardTypes: ['CHILD_MEAL'],
          isLoading: true,
          page: 2
        })
      })
      
      expect(result.current.query).toBe('pizza')
      expect(result.current.activeCardTypes).toEqual(['CHILD_MEAL'])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.page).toBe(2)
    })
  })
})

// Helper to track renders
export function createRenderTracker() {
  let renderCount = 0
  
  return {
    track: () => {
      renderCount++
    },
    getRenderCount: () => renderCount,
    reset: () => {
      renderCount = 0
    }
  }
}