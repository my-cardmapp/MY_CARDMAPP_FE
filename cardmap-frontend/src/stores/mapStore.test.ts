import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useMapStore } from './mapStore'
import type { MarkerData } from './types'

// Mock naver global
global.naver = {
  maps: {
    LatLng: vi.fn((lat, lng) => ({ lat, lng })),
    LatLngBounds: vi.fn((sw, ne) => ({ sw, ne }))
  }
} as any

// Mock naver.maps
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  fitBounds: vi.fn(),
  setOptions: vi.fn(),
  getBounds: vi.fn(() => ({
    getNE: () => ({ lat: () => 37.6, lng: () => 127.1 }),
    getSW: () => ({ lat: () => 37.4, lng: () => 126.9 })
  }))
} as any

describe('useMapStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.getState().reset()
    vi.clearAllMocks()
  })

  describe('Map Instance Management', () => {
    it('should initialize with null map', () => {
      const { result } = renderHook(() => useMapStore())
      expect(result.current.map).toBeNull()
      expect(result.current.isMapReady).toBe(false)
    })

    it('should set map instance', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMap(mockMap)
      })

      expect(result.current.map).toBe(mockMap)
      expect(result.current.isMapReady).toBe(true)
    })

    it('should clear map instance on reset', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMap(mockMap)
        result.current.reset()
      })

      expect(result.current.map).toBeNull()
      expect(result.current.isMapReady).toBe(false)
    })
  })

  describe('Script Loading States', () => {
    it('should manage script loading states', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.isScriptLoaded).toBe(false)
      expect(result.current.isScriptLoading).toBe(false)
      expect(result.current.scriptError).toBeNull()

      // Start loading
      act(() => {
        result.current.setScriptLoading(true)
      })
      expect(result.current.isScriptLoading).toBe(true)

      // Complete loading
      act(() => {
        result.current.setScriptLoading(false)
        result.current.setScriptLoaded(true)
      })
      expect(result.current.isScriptLoading).toBe(false)
      expect(result.current.isScriptLoaded).toBe(true)
    })

    it('should handle script loading error', () => {
      const { result } = renderHook(() => useMapStore())
      const error = new Error('Failed to load script')
      
      act(() => {
        result.current.setScriptError(error)
      })

      expect(result.current.scriptError).toBe(error)
      expect(result.current.isScriptLoaded).toBe(false)
    })
  })

  describe('Viewport Management', () => {
    it('should initialize with default viewport', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.viewport).toEqual({
        center: { lat: 37.5665, lng: 126.9780 },
        zoom: 13
      })
    })

    it('should set viewport completely', () => {
      const { result } = renderHook(() => useMapStore())
      const newViewport = {
        center: { lat: 37.5, lng: 127.0 },
        zoom: 15,
        bounds: {
          north: 37.6,
          south: 37.4,
          east: 127.1,
          west: 126.9
        }
      }
      
      act(() => {
        result.current.setViewport(newViewport)
      })

      expect(result.current.viewport).toEqual(newViewport)
    })

    it('should update viewport partially', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.updateViewport({ zoom: 14 })
      })

      expect(result.current.viewport.zoom).toBe(14)
      expect(result.current.viewport.center).toEqual({ lat: 37.5665, lng: 126.9780 })
    })

    it('should fit bounds on map', () => {
      const { result } = renderHook(() => useMapStore())
      const bounds = {
        north: 37.6,
        south: 37.4,
        east: 127.1,
        west: 126.9
      }
      
      act(() => {
        result.current.setMap(mockMap)
        result.current.fitBounds(bounds)
      })

      expect(mockMap.fitBounds).toHaveBeenCalledWith(expect.any(Object))
      expect(result.current.viewport.bounds).toEqual(bounds)
    })
  })

  describe('Map Controls', () => {
    it('should initialize with default controls', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.controls).toEqual({
        draggable: true,
        scrollWheel: true,
        disableDoubleClickZoom: false,
        disableKineticPan: false
      })
    })

    it('should set controls', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setControls({ draggable: false })
      })

      expect(result.current.controls.draggable).toBe(false)
      expect(result.current.controls.scrollWheel).toBe(true)
    })

    it('should toggle individual control', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.toggleControl('draggable')
      })

      expect(result.current.controls.draggable).toBe(false)

      act(() => {
        result.current.toggleControl('draggable')
      })

      expect(result.current.controls.draggable).toBe(true)
    })

    it('should apply controls to map instance', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMap(mockMap)
        result.current.setControls({ draggable: false })
      })

      expect(mockMap.setOptions).toHaveBeenCalledWith({ draggable: false })
    })
  })

  describe('Marker Management', () => {
    const mockMarker1: MarkerData = {
      id: '1',
      position: { lat: 37.5, lng: 127.0 },
      merchant: {
        id: 1,
        name: 'Test Merchant 1',
        address: 'Test Address',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점', icon: '🍽️' },
        isVerified: false
      }
    }

    const mockMarker2: MarkerData = {
      id: '2',
      position: { lat: 37.51, lng: 127.01 },
      merchant: {
        id: 2,
        name: 'Test Merchant 2',
        address: 'Test Address 2',
        location: { lat: 37.51, lng: 127.01 },
        cards: [],
        category: { id: 2, code: 'CAFE', name: '카페', icon: '☕' },
        isVerified: false
      }
    }

    it('should initialize with empty markers', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.markers.size).toBe(0)
      expect(result.current.visibleMarkerIds.size).toBe(0)
    })

    it('should set multiple markers', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMarkers([mockMarker1, mockMarker2])
      })

      expect(result.current.markers.size).toBe(2)
      expect(result.current.markers.get('1')).toEqual(mockMarker1)
      expect(result.current.markers.get('2')).toEqual(mockMarker2)
    })

    it('should add single marker', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.addMarker(mockMarker1)
      })

      expect(result.current.markers.size).toBe(1)
      expect(result.current.markers.get('1')).toEqual(mockMarker1)
    })

    it('should remove marker by id', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMarkers([mockMarker1, mockMarker2])
        result.current.removeMarker('1')
      })

      expect(result.current.markers.size).toBe(1)
      expect(result.current.markers.has('1')).toBe(false)
      expect(result.current.markers.has('2')).toBe(true)
    })

    it('should clear all markers', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMarkers([mockMarker1, mockMarker2])
        result.current.clearMarkers()
      })

      expect(result.current.markers.size).toBe(0)
      expect(result.current.visibleMarkerIds.size).toBe(0)
    })

    it('should update visible markers', () => {
      const { result } = renderHook(() => useMapStore())
      
      act(() => {
        result.current.setMarkers([mockMarker1, mockMarker2])
        result.current.updateVisibleMarkers(['1'])
      })

      expect(result.current.visibleMarkerIds.size).toBe(1)
      expect(result.current.visibleMarkerIds.has('1')).toBe(true)
      expect(result.current.visibleMarkerIds.has('2')).toBe(false)
    })

    it('should toggle clustering', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.clustersEnabled).toBe(false)
      
      act(() => {
        result.current.toggleClustering()
      })

      expect(result.current.clustersEnabled).toBe(true)
    })
  })

  describe('UI State Management', () => {
    it('should manage resizing state', () => {
      const { result } = renderHook(() => useMapStore())
      
      expect(result.current.isResizing).toBe(false)
      
      act(() => {
        result.current.setResizing(true)
      })

      expect(result.current.isResizing).toBe(true)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useMapStore())
      
      // Modify state
      act(() => {
        result.current.setMap(mockMap)
        result.current.setScriptLoaded(true)
        result.current.setViewport({ zoom: 15 })
        result.current.addMarker({
          id: '1',
          position: { lat: 37.5, lng: 127.0 },
          merchant: {} as any
        })
        result.current.toggleClustering()
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      // Verify initial state
      expect(result.current.map).toBeNull()
      expect(result.current.isScriptLoaded).toBe(false)
      expect(result.current.viewport.zoom).toBe(13)
      expect(result.current.markers.size).toBe(0)
      expect(result.current.clustersEnabled).toBe(false)
    })
  })

  describe('DevTools Integration', () => {
    it('should have proper store name', () => {
      const store = useMapStore
      expect(store.getState).toBeDefined()
      // DevTools name is set in implementation
    })
  })
})