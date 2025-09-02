import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import type { MerchantStore, MerchantFilters } from './types'
import type { Merchant } from '@/types/merchant'
import { merchantAPI } from '@/services/api'

// Default values
const DEFAULT_FILTERS: MerchantFilters = {
  cardTypes: [],
  categories: [],
  searchQuery: '',
  radius: 1000,
  onlyOpen: false
}

// Create store
export const useMerchantStore = create<MerchantStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      merchants: [],
      selectedMerchant: null,
      nearbyMerchants: [],
      filters: DEFAULT_FILTERS,
      availableCards: [],
      availableCategories: [],
      isLoading: false,
      isLoadingNearby: false,
      error: null,
      page: 1,
      pageSize: 20,
      totalCount: 0,
      hasMore: false,
      lastFetch: null,
      cacheKey: null,

      // Data operations
      setMerchants: (merchants) => set({ 
        merchants 
      }, false, 'setMerchants'),

      appendMerchants: (merchants) => set((state) => ({
        merchants: [...state.merchants, ...merchants]
      }), false, 'appendMerchants'),

      setSelectedMerchant: (merchant) => set({ 
        selectedMerchant: merchant 
      }, false, 'setSelectedMerchant'),

      selectMerchantById: (id) => set((state) => ({
        selectedMerchant: state.merchants.find((m) => m.id === id) || null
      }), false, 'selectMerchantById'),

      setNearbyMerchants: (merchants) => set({ 
        nearbyMerchants: merchants 
      }, false, 'setNearbyMerchants'),

      // Filter operations
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      }), false, 'setFilters'),

      updateFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      }), false, 'updateFilter'),

      resetFilters: () => set({ 
        filters: DEFAULT_FILTERS 
      }, false, 'resetFilters'),

      toggleCardType: (cardType) => set((state) => {
        const cardTypes = state.filters.cardTypes.includes(cardType)
          ? state.filters.cardTypes.filter((ct) => ct !== cardType)
          : [...state.filters.cardTypes, cardType]
        
        return {
          filters: { ...state.filters, cardTypes }
        }
      }, false, 'toggleCardType'),

      toggleCategory: (category) => set((state) => {
        const categories = state.filters.categories.includes(category)
          ? state.filters.categories.filter((c) => c !== category)
          : [...state.filters.categories, category]
        
        return {
          filters: { ...state.filters, categories }
        }
      }, false, 'toggleCategory'),

      // Available options
      setAvailableCards: (cards) => set({ 
        availableCards: cards 
      }, false, 'setAvailableCards'),

      setAvailableCategories: (categories) => set({ 
        availableCategories: categories 
      }, false, 'setAvailableCategories'),

      // Loading states
      setLoading: (loading) => set({ 
        isLoading: loading 
      }, false, 'setLoading'),

      setLoadingNearby: (loading) => set({ 
        isLoadingNearby: loading 
      }, false, 'setLoadingNearby'),

      setError: (error) => set({ 
        error 
      }, false, 'setError'),

      // Pagination
      setPage: (page) => set({ 
        page 
      }, false, 'setPage'),

      incrementPage: () => set((state) => ({ 
        page: state.page + 1 
      }), false, 'incrementPage'),

      resetPagination: () => set({ 
        page: 1,
        totalCount: 0,
        hasMore: false
      }, false, 'resetPagination'),

      setPaginationInfo: (info) => set({ 
        totalCount: info.totalCount,
        hasMore: info.hasMore
      }, false, 'setPaginationInfo'),

      // Cache
      updateCache: (key) => set({ 
        cacheKey: key,
        lastFetch: Date.now()
      }, false, 'updateCache'),

      invalidateCache: () => set({ 
        cacheKey: null,
        lastFetch: null
      }, false, 'invalidateCache'),

      // Computed getters
      getFilteredMerchants: () => {
        const state = get()
        let filtered = [...state.merchants]

        // Filter by card types
        if (state.filters.cardTypes.length > 0) {
          filtered = filtered.filter((merchant) =>
            merchant.cards.some((card) =>
              state.filters.cardTypes.includes(card.code)
            )
          )
        }

        // Filter by categories
        if (state.filters.categories.length > 0) {
          filtered = filtered.filter((merchant) =>
            state.filters.categories.includes(merchant.category.code)
          )
        }

        // Filter by search query
        if (state.filters.searchQuery) {
          const query = state.filters.searchQuery.toLowerCase()
          filtered = filtered.filter((merchant) =>
            merchant.name.toLowerCase().includes(query) ||
            merchant.address.toLowerCase().includes(query)
          )
        }

        // Filter by open status
        if (state.filters.onlyOpen && typeof window !== 'undefined') {
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

      getMerchantById: (id) => {
        const state = get()
        return state.merchants.find((m) => m.id === id)
      },

      getActiveFiltersCount: () => {
        const state = get()
        let count = 0
        
        if (state.filters.cardTypes.length > 0) count += state.filters.cardTypes.length
        if (state.filters.categories.length > 0) count += state.filters.categories.length
        if (state.filters.searchQuery) count += 1
        if (state.filters.onlyOpen) count += 1
        
        return count
      },

      // API integration
      fetchMerchants: async (params) => {
        const state = get()
        
        set({ isLoading: true, error: null }, false, 'fetchMerchants:start')
        
        try {
          const response = await merchantAPI.getList({
            page: params?.page || state.page,
            size: state.pageSize,
            cardTypes: state.filters.cardTypes,
            categories: state.filters.categories,
            ...params
          })

          set({
            merchants: params?.page === 1 ? response.content : [...state.merchants, ...response.content],
            totalCount: response.totalElements,
            hasMore: !response.last,
            isLoading: false
          }, false, 'fetchMerchants:success')

          // Update cache
          const cacheKey = JSON.stringify({ params, filters: state.filters })
          state.updateCache(cacheKey)
        } catch (error) {
          set({
            error: error as Error,
            isLoading: false
          }, false, 'fetchMerchants:error')
        }
      },

      fetchNearbyMerchants: async (lat, lng, radius) => {
        set({ isLoadingNearby: true, error: null }, false, 'fetchNearbyMerchants:start')
        
        try {
          const response = await merchantAPI.getNearby({
            lat,
            lng,
            radius: radius || get().filters.radius,
            cardTypes: get().filters.cardTypes,
            categories: get().filters.categories
          })

          set({
            nearbyMerchants: response.merchants,
            isLoadingNearby: false
          }, false, 'fetchNearbyMerchants:success')
        } catch (error) {
          set({
            error: error as Error,
            isLoadingNearby: false
          }, false, 'fetchNearbyMerchants:error')
        }
      },

      searchMerchants: async (query) => {
        set({ 
          isLoading: true,
          error: null,
          filters: { ...get().filters, searchQuery: query }
        }, false, 'searchMerchants:start')
        
        try {
          const response = await merchantAPI.search({
            query,
            cardTypes: get().filters.cardTypes,
            page: 1,
            size: get().pageSize
          })

          set({
            merchants: response.content,
            totalCount: response.totalElements,
            hasMore: response.totalPages > 1,
            page: 1,
            isLoading: false
          }, false, 'searchMerchants:success')
        } catch (error) {
          set({
            error: error as Error,
            isLoading: false
          }, false, 'searchMerchants:error')
        }
      },

      // Reset
      reset: () => set({
        merchants: [],
        selectedMerchant: null,
        nearbyMerchants: [],
        filters: DEFAULT_FILTERS,
        availableCards: [],
        availableCategories: [],
        isLoading: false,
        isLoadingNearby: false,
        error: null,
        page: 1,
        pageSize: 20,
        totalCount: 0,
        hasMore: false,
        lastFetch: null,
        cacheKey: null
      }, false, 'reset')
    }),
    {
      name: 'merchant-store'
    }
  )
)

// Selectors for shallow equality checks
export const useMerchantList = () => useMerchantStore((state) => state.merchants)
export const useSelectedMerchant = () => useMerchantStore((state) => state.selectedMerchant)
export const useMerchantFilters = () => useMerchantStore((state) => state.filters, shallow)
export const useMerchantLoadingState = () => useMerchantStore(
  (state) => ({
    isLoading: state.isLoading,
    isLoadingNearby: state.isLoadingNearby,
    error: state.error
  }),
  shallow
)
export const useMerchantPagination = () => useMerchantStore(
  (state) => ({
    page: state.page,
    pageSize: state.pageSize,
    totalCount: state.totalCount,
    hasMore: state.hasMore
  }),
  shallow
)