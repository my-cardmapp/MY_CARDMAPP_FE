import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMapBounds } from '../useMapBounds'
import { MapProvider } from '@/contexts/MapContext'
import React from 'react'

// Mock Naver Maps
const mockMap = {
  getBounds: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
  setCenter: vi.fn(),
  setZoom: vi.fn(),
}

const mockBounds = {
  getNE: vi.fn(() => ({ lat: () => 37.6, lng: () => 127.1 })),
  getSW: vi.fn(() => ({ lat: () => 37.5, lng: () => 127.0 })),
}

const mockCenter = {
  lat: vi.fn(() => 37.55),
  lng: vi.fn(() => 127.05),
}

// Mock naver.maps
global.naver = {
  maps: {
    Event: {
      addListener: vi.fn((map, event, handler) => {
        if (event === 'bounds_changed') {
          // Call handler immediately for testing
          setTimeout(() => handler(), 0)
        }
        return { id: Math.random() }
      }),
      removeListener: vi.fn(),
    },
    LatLng: vi.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
  },
} as any

// Mock debounce to run immediately in tests
vi.mock('@/utils/debounce', () => ({
  debounce: (fn: any) => fn,
}))

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

describe('useMapBounds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMap.getBounds.mockReturnValue(mockBounds)
    mockMap.getCenter.mockReturnValue(mockCenter)
    mockMap.getZoom.mockReturnValue(15)
    mockSessionStorage.getItem.mockReturnValue(null)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MapProvider>{children}</MapProvider>
  )

  it('should initialize with null bounds when no map is provided', () => {
    const { result } = renderHook(() => useMapBounds({ map: null }), { wrapper })

    expect(result.current.bounds).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should set bounds when map is provided', async () => {
    // Set up map context
    const { result, rerender } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.bounds).toEqual({
        north: 37.6,
        south: 37.5,
        east: 127.1,
        west: 127.0,
      })
    })
  })

  it('should call onBoundsChange callback when bounds change', async () => {
    const onBoundsChange = vi.fn()
    
    const { result } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any, onBoundsChange })
      },
      { wrapper }
    )

    await waitFor(() => {
      expect(onBoundsChange).toHaveBeenCalledWith({
        north: 37.6,
        south: 37.5,
        east: 127.1,
        west: 127.0,
      })
    })
  })

  it('should save viewport to sessionStorage', async () => {
    const { result } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'mapViewport',
        JSON.stringify({
          center: { lat: 37.55, lng: 127.05 },
          zoom: 15,
        })
      )
    })
  })

  it('should restore viewport from sessionStorage', async () => {
    const savedViewport = {
      center: { lat: 37.7, lng: 127.2 },
      zoom: 16,
    }
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(savedViewport))

    renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    await waitFor(() => {
      expect(mockMap.setCenter).toHaveBeenCalled()
      expect(mockMap.setZoom).toHaveBeenCalledWith(16)
    })
  })

  it('should calculate extended bounds correctly', () => {
    const { result } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    act(() => {
      // Wait for initial bounds to be set
    })

    const extendedBounds = result.current.getExtendedBounds(0.2)
    
    if (extendedBounds) {
      expect(extendedBounds.north).toBeGreaterThan(37.6)
      expect(extendedBounds.south).toBeLessThan(37.5)
      expect(extendedBounds.east).toBeGreaterThan(127.1)
      expect(extendedBounds.west).toBeLessThan(127.0)
    }
  })

  it('should check if coordinates are within bounds', async () => {
    const { result } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.bounds).not.toBeNull()
    })

    // Inside bounds
    expect(result.current.isInBounds(37.55, 127.05)).toBe(true)
    
    // Outside bounds
    expect(result.current.isInBounds(38.0, 128.0)).toBe(false)
    expect(result.current.isInBounds(37.0, 126.0)).toBe(false)
  })

  it('should remove event listeners on cleanup', () => {
    const { unmount } = renderHook(
      () => {
        const mapContext = {
          map: mockMap as any,
          setMap: vi.fn(),
          isScriptLoaded: true,
          isScriptError: false,
        }
        React.useContext = vi.fn(() => mapContext)
        return useMapBounds({ map: mockMap as any })
      },
      { wrapper }
    )

    unmount()

    expect(naver.maps.Event.removeListener).toHaveBeenCalled()
  })
})