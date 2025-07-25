import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMarkers } from './useMarkers'
import { MapProvider } from '@/contexts/MapContext'
import React from 'react'

// Mock MarkerManager
vi.mock('@/services/MarkerManager', () => ({
  MarkerManager: vi.fn().mockImplementation(() => ({
    addMerchants: vi.fn(),
    removeMarker: vi.fn(),
    clearMarkers: vi.fn(),
    filterByCardType: vi.fn(),
    clearFilter: vi.fn(),
    enableClustering: vi.fn(),
    disableClustering: vi.fn(),
    getMarkers: vi.fn(() => []),
    getVisibleMarkers: vi.fn(() => []),
    updateMarkerSize: vi.fn(),
    destroy: vi.fn(),
  })),
}))

const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(() => 15),
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MapProvider>
    {children}
  </MapProvider>
)

describe('useMarkers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.naver
    ;(window as any).naver = {
      maps: {
        Event: {
          addListener: vi.fn((target, event, handler) => {
            // Simulate immediate zoom_changed event
            if (event === 'zoom_changed') {
              setTimeout(() => handler(), 0)
            }
          }),
          removeListener: vi.fn(),
        },
      },
    }
  })

  it('should initialize MarkerManager when map is provided', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    expect(result.current.markerManager).toBeDefined()
  })

  it('should add merchants to the map', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })
    
    const merchants = [
      {
        id: 1,
        name: 'Test Merchant',
        location: { lat: 37.5, lng: 127.0 },
        address: 'Test Address',
        cards: [{ 
          id: 1,
          code: 'CHILD_MEAL', 
          name: '아동급식카드',
          colorHex: '#FF6B6B' 
        }],
        category: { id: 1, code: 'food', name: '음식점' },
        isVerified: true,
      },
    ]

    act(() => {
      result.current.addMerchants(merchants)
    })

    expect(result.current.markerManager?.addMerchants).toHaveBeenCalledWith(merchants)
  })

  it('should filter markers by card type', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    act(() => {
      result.current.filterByCardType(['CHILD_MEAL'])
    })

    expect(result.current.markerManager?.filterByCardType).toHaveBeenCalledWith(['CHILD_MEAL'])
  })

  it('should clear filter', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    act(() => {
      result.current.clearFilter()
    })

    expect(result.current.markerManager?.clearFilter).toHaveBeenCalled()
  })

  it('should toggle clustering', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    // Enable clustering
    act(() => {
      result.current.setClusteringEnabled(true)
    })

    expect(result.current.markerManager?.enableClustering).toHaveBeenCalled()
    expect(result.current.isClusteringEnabled).toBe(true)

    // Disable clustering
    act(() => {
      result.current.setClusteringEnabled(false)
    })

    expect(result.current.markerManager?.disableClustering).toHaveBeenCalled()
    expect(result.current.isClusteringEnabled).toBe(false)
  })

  it('should handle zoom changes', async () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    // Wait for zoom_changed event to be triggered
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })

    expect(result.current.markerManager?.updateMarkerSize).toHaveBeenCalledWith(15)
  })

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => useMarkers(mockMap as any), { wrapper })

    unmount()

    expect(result.current.markerManager?.destroy).toHaveBeenCalled()
    expect(window.naver.maps.Event.removeListener).toHaveBeenCalled()
  })

  it('should handle marker click events', () => {
    const { result } = renderHook(() => useMarkers(mockMap as any), { wrapper })
    const onMarkerClick = vi.fn()

    // Set click handler
    act(() => {
      result.current.setOnMarkerClick(onMarkerClick)
    })

    // Simulate marker click event
    const mockMerchant = { id: 1, name: 'Test' }
    const event = new CustomEvent('markerClick', { 
      detail: { merchant: mockMerchant } 
    })
    
    act(() => {
      window.dispatchEvent(event)
    })

    expect(onMarkerClick).toHaveBeenCalledWith(mockMerchant)
  })
})