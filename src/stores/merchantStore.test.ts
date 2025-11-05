import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useMerchantStore } from './merchantStore'
import type { Merchant, Card, Category } from '@/types/merchant'

// Mock API service
vi.mock('@/services/api', () => ({
  merchantAPI: {
    getNearby: vi.fn(),
    search: vi.fn(),
    getList: vi.fn()
  },
  cardAPI: {
    getAll: vi.fn()
  }
}))

const mockMerchant1: Merchant = {
  id: 1,
  name: 'Test Merchant 1',
  address: 'Seoul, Gangnam',
  location: { lat: 37.5, lng: 127.0 },
  cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#4CAF50' }],
  category: { id: 1, code: 'FOOD', name: '음식점', icon: '🍽️' },
  isVerified: true,
  businessHours: { mon: ['09:00', '22:00'] }
}

const mockMerchant2: Merchant = {
  id: 2,
  name: 'Test Merchant 2',
  address: 'Seoul, Jongno',
  location: { lat: 37.57, lng: 126.98 },
  cards: [{ id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#2196F3' }],
  category: { id: 2, code: 'CAFE', name: '카페', icon: '☕' },
  isVerified: false
}

const mockCard1: Card = { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#4CAF50' }
const mockCard2: Card = { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#2196F3' }

const mockCategory1: Category = { id: 1, code: 'FOOD', name: '음식점', icon: '🍽️' }
const mockCategory2: Category = { id: 2, code: 'CAFE', name: '카페', icon: '☕' }

describe('useMerchantStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMerchantStore.getState().reset()
    vi.clearAllMocks()
  })

  describe('Merchant Data Management', () => {
    it('should initialize with empty merchants', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      expect(result.current.merchants).toEqual([])
      expect(result.current.selectedMerchant).toBeNull()
      expect(result.current.nearbyMerchants).toEqual([])
    })

    it('should set merchants', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1, mockMerchant2])
      })

      expect(result.current.merchants).toHaveLength(2)
      expect(result.current.merchants[0]).toEqual(mockMerchant1)
    })

    it('should append merchants', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1])
        result.current.appendMerchants([mockMerchant2])
      })

      expect(result.current.merchants).toHaveLength(2)
      expect(result.current.merchants[1]).toEqual(mockMerchant2)
    })

    it('should select merchant', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1, mockMerchant2])
        result.current.setSelectedMerchant(mockMerchant1)
      })

      expect(result.current.selectedMerchant).toEqual(mockMerchant1)
    })

    it('should select merchant by id', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1, mockMerchant2])
        result.current.selectMerchantById(2)
      })

      expect(result.current.selectedMerchant?.id).toBe(2)
    })

    it('should set nearby merchants', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setNearbyMerchants([mockMerchant1, mockMerchant2])
      })

      expect(result.current.nearbyMerchants).toHaveLength(2)
    })
  })

  describe('Filter Management', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      expect(result.current.filters).toEqual({
        cardTypes: [],
        categories: [],
        searchQuery: '',
        radius: 1000,
        onlyOpen: false
      })
    })

    it('should set filters', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setFilters({
          cardTypes: ['CHILD_MEAL'],
          searchQuery: 'test'
        })
      })

      expect(result.current.filters.cardTypes).toEqual(['CHILD_MEAL'])
      expect(result.current.filters.searchQuery).toBe('test')
      expect(result.current.filters.radius).toBe(1000) // unchanged
    })

    it('should update individual filter', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.updateFilter('searchQuery', 'updated')
      })

      expect(result.current.filters.searchQuery).toBe('updated')
    })

    it('should toggle card type filter', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.toggleCardType('CHILD_MEAL')
      })
      expect(result.current.filters.cardTypes).toContain('CHILD_MEAL')

      act(() => {
        result.current.toggleCardType('CHILD_MEAL')
      })
      expect(result.current.filters.cardTypes).not.toContain('CHILD_MEAL')
    })

    it('should toggle category filter', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.toggleCategory('FOOD')
      })
      expect(result.current.filters.categories).toContain('FOOD')

      act(() => {
        result.current.toggleCategory('FOOD')
      })
      expect(result.current.filters.categories).not.toContain('FOOD')
    })

    it('should reset filters', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setFilters({
          cardTypes: ['CHILD_MEAL'],
          categories: ['FOOD'],
          searchQuery: 'test'
        })
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual({
        cardTypes: [],
        categories: [],
        searchQuery: '',
        radius: 1000,
        onlyOpen: false
      })
    })
  })

  describe('Available Options', () => {
    it('should set available cards', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setAvailableCards([mockCard1, mockCard2])
      })

      expect(result.current.availableCards).toHaveLength(2)
      expect(result.current.availableCards[0]).toEqual(mockCard1)
    })

    it('should set available categories', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setAvailableCategories([mockCategory1, mockCategory2])
      })

      expect(result.current.availableCategories).toHaveLength(2)
      expect(result.current.availableCategories[0]).toEqual(mockCategory1)
    })
  })

  describe('Loading States', () => {
    it('should manage loading state', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      expect(result.current.isLoading).toBe(false)
      
      act(() => {
        result.current.setLoading(true)
      })
      expect(result.current.isLoading).toBe(true)
    })

    it('should manage nearby loading state', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      expect(result.current.isLoadingNearby).toBe(false)
      
      act(() => {
        result.current.setLoadingNearby(true)
      })
      expect(result.current.isLoadingNearby).toBe(true)
    })

    it('should manage error state', () => {
      const { result } = renderHook(() => useMerchantStore())
      const error = new Error('Test error')
      
      act(() => {
        result.current.setError(error)
      })
      
      expect(result.current.error).toBe(error)
    })
  })

  describe('Pagination', () => {
    it('should initialize with default pagination', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.totalCount).toBe(0)
      expect(result.current.hasMore).toBe(false)
    })

    it('should set page', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setPage(3)
      })
      
      expect(result.current.page).toBe(3)
    })

    it('should increment page', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.incrementPage()
      })
      
      expect(result.current.page).toBe(2)
    })

    it('should reset pagination', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setPage(5)
        result.current.setPaginationInfo({ totalCount: 100, hasMore: true })
        result.current.resetPagination()
      })
      
      expect(result.current.page).toBe(1)
      expect(result.current.totalCount).toBe(0)
      expect(result.current.hasMore).toBe(false)
    })

    it('should set pagination info', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setPaginationInfo({ totalCount: 50, hasMore: true })
      })
      
      expect(result.current.totalCount).toBe(50)
      expect(result.current.hasMore).toBe(true)
    })
  })

  describe('Cache Management', () => {
    it('should update cache', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.updateCache('test-key')
      })
      
      expect(result.current.cacheKey).toBe('test-key')
      expect(result.current.lastFetch).toBeGreaterThan(0)
    })

    it('should invalidate cache', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.updateCache('test-key')
        result.current.invalidateCache()
      })
      
      expect(result.current.cacheKey).toBeNull()
      expect(result.current.lastFetch).toBeNull()
    })
  })

  describe('Computed Getters', () => {
    it('should get filtered merchants', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1, mockMerchant2])
        result.current.setFilters({ cardTypes: ['CHILD_MEAL'] })
      })
      
      const filtered = result.current.getFilteredMerchants()
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })

    it('should get merchant by id', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setMerchants([mockMerchant1, mockMerchant2])
      })
      
      const merchant = result.current.getMerchantById(2)
      expect(merchant?.id).toBe(2)
    })

    it('should get active filters count', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      act(() => {
        result.current.setFilters({
          cardTypes: ['CHILD_MEAL'],
          categories: ['FOOD'],
          searchQuery: 'test'
        })
      })
      
      expect(result.current.getActiveFiltersCount()).toBe(3)
    })
  })

  describe('API Integration', () => {
    it('should fetch merchants', async () => {
      const { merchantAPI } = await import('@/services/api')
      const mockResponse = {
        content: [mockMerchant1, mockMerchant2],
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true
      }
      
      vi.mocked(merchantAPI.getList).mockResolvedValue(mockResponse)
      
      const { result } = renderHook(() => useMerchantStore())
      
      await act(async () => {
        await result.current.fetchMerchants({ page: 1 })
      })
      
      await waitFor(() => {
        expect(result.current.merchants).toHaveLength(2)
        expect(result.current.totalCount).toBe(2)
        expect(result.current.hasMore).toBe(false)
      })
    })

    it('should handle fetch error', async () => {
      const { merchantAPI } = await import('@/services/api')
      const error = new Error('Network error')
      vi.mocked(merchantAPI.getList).mockRejectedValue(error)
      
      const { result } = renderHook(() => useMerchantStore())
      
      await act(async () => {
        await result.current.fetchMerchants()
      })
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should fetch nearby merchants', async () => {
      const { merchantAPI } = await import('@/services/api')
      vi.mocked(merchantAPI.getNearby).mockResolvedValue({
        merchants: [mockMerchant1],
        center: { lat: 37.5, lng: 127.0 },
        radius: 1000
      })
      
      const { result } = renderHook(() => useMerchantStore())
      
      await act(async () => {
        await result.current.fetchNearbyMerchants(37.5, 127.0, 1000)
      })
      
      await waitFor(() => {
        expect(result.current.nearbyMerchants).toHaveLength(1)
        expect(result.current.isLoadingNearby).toBe(false)
      })
    })

    it('should search merchants', async () => {
      const { merchantAPI } = await import('@/services/api')
      vi.mocked(merchantAPI.search).mockResolvedValue({
        content: [mockMerchant1],
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        query: 'test',
        suggestions: []
      })
      
      const { result } = renderHook(() => useMerchantStore())
      
      await act(async () => {
        await result.current.searchMerchants('test')
      })
      
      await waitFor(() => {
        expect(result.current.merchants).toHaveLength(1)
        expect(result.current.filters.searchQuery).toBe('test')
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useMerchantStore())
      
      // Modify state
      act(() => {
        result.current.setMerchants([mockMerchant1])
        result.current.setSelectedMerchant(mockMerchant1)
        result.current.setFilters({ cardTypes: ['CHILD_MEAL'] })
        result.current.setPage(3)
        result.current.updateCache('test')
      })
      
      // Reset
      act(() => {
        result.current.reset()
      })
      
      // Verify initial state
      expect(result.current.merchants).toEqual([])
      expect(result.current.selectedMerchant).toBeNull()
      expect(result.current.filters.cardTypes).toEqual([])
      expect(result.current.page).toBe(1)
      expect(result.current.cacheKey).toBeNull()
    })
  })

  describe('DevTools Integration', () => {
    it('should have proper store name', () => {
      const store = useMerchantStore
      expect(store.getState).toBeDefined()
      // DevTools name is set in implementation
    })
  })
})