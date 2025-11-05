/**
 * Shared types for Zustand stores
 */

import type { Merchant, Card, Category } from '@/types/merchant'

// Map Store Types
export interface MapViewport {
  center: { lat: number; lng: number }
  zoom: number
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

export interface MapControls {
  draggable: boolean
  scrollWheel: boolean
  disableDoubleClickZoom: boolean
  disableKineticPan: boolean
}

export interface MarkerData {
  id: string
  position: { lat: number; lng: number }
  merchant: Merchant
  isCluster?: boolean
  count?: number
}

export interface MapState {
  // Map instance
  map: naver.maps.Map | null
  
  // Script loading
  isScriptLoaded: boolean
  isScriptLoading: boolean
  scriptError: Error | null
  
  // Viewport
  viewport: MapViewport
  
  // Controls
  controls: MapControls
  
  // Markers
  markers: Map<string, MarkerData>
  visibleMarkerIds: Set<string>
  clustersEnabled: boolean
  
  // UI State
  isMapReady: boolean
  isResizing: boolean
}

export interface MapActions {
  // Map instance
  setMap: (map: naver.maps.Map | null) => void
  
  // Script loading
  setScriptLoaded: (loaded: boolean) => void
  setScriptLoading: (loading: boolean) => void
  setScriptError: (error: Error | null) => void
  
  // Viewport
  setViewport: (viewport: Partial<MapViewport>) => void
  updateViewport: (updates: Partial<MapViewport>) => void
  fitBounds: (bounds: MapViewport['bounds']) => void
  
  // Controls
  setControls: (controls: Partial<MapControls>) => void
  toggleControl: (control: keyof MapControls) => void
  
  // Markers
  setMarkers: (markers: MarkerData[]) => void
  addMarker: (marker: MarkerData) => void
  removeMarker: (id: string) => void
  clearMarkers: () => void
  updateVisibleMarkers: (ids: string[]) => void
  toggleClustering: () => void
  
  // UI State
  setMapReady: (ready: boolean) => void
  setResizing: (resizing: boolean) => void
  
  // Utils
  reset: () => void
}

// Merchant Store Types
export interface MerchantFilters {
  cardTypes: string[]
  categories: string[]
  searchQuery: string
  radius: number
  onlyOpen: boolean
}

export interface MerchantState {
  // Data
  merchants: Merchant[]
  selectedMerchant: Merchant | null
  nearbyMerchants: Merchant[]
  
  // Filters
  filters: MerchantFilters
  availableCards: Card[]
  availableCategories: Category[]
  
  // Loading states
  isLoading: boolean
  isLoadingNearby: boolean
  error: Error | null
  
  // Pagination
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
  
  // Cache
  lastFetch: number | null
  cacheKey: string | null
}

export interface MerchantActions {
  // Data operations
  setMerchants: (merchants: Merchant[]) => void
  appendMerchants: (merchants: Merchant[]) => void
  setSelectedMerchant: (merchant: Merchant | null) => void
  selectMerchantById: (id: number) => void
  setNearbyMerchants: (merchants: Merchant[]) => void
  
  // Filter operations
  setFilters: (filters: Partial<MerchantFilters>) => void
  updateFilter: <K extends keyof MerchantFilters>(key: K, value: MerchantFilters[K]) => void
  resetFilters: () => void
  toggleCardType: (cardType: string) => void
  toggleCategory: (category: string) => void
  
  // Available options
  setAvailableCards: (cards: Card[]) => void
  setAvailableCategories: (categories: Category[]) => void
  
  // Loading states
  setLoading: (loading: boolean) => void
  setLoadingNearby: (loading: boolean) => void
  setError: (error: Error | null) => void
  
  // Pagination
  setPage: (page: number) => void
  incrementPage: () => void
  resetPagination: () => void
  setPaginationInfo: (info: { totalCount: number; hasMore: boolean }) => void
  
  // Cache
  updateCache: (key: string) => void
  invalidateCache: () => void
  
  // Computed getters
  getFilteredMerchants: () => Merchant[]
  getMerchantById: (id: number) => Merchant | undefined
  getActiveFiltersCount: () => number
  
  // API integration
  fetchMerchants: (params?: any) => Promise<void>
  fetchNearbyMerchants: (lat: number, lng: number, radius?: number) => Promise<void>
  searchMerchants: (query: string) => Promise<void>
  
  // Utils
  reset: () => void
}

// Store types
export type MapStore = MapState & MapActions
export type MerchantStore = MerchantState & MerchantActions