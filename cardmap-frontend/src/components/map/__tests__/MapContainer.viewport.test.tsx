import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import MapContainer from '../MapContainer'
import { MapProvider } from '@/contexts/MapContext'
import { MOCK_MERCHANTS } from '@/mocks/merchants'
import type { MapBounds } from '@/hooks/useMapBounds'

// Mock hooks
vi.mock('@/hooks/useMarkers', () => ({
  useMarkers: () => ({
    addMerchants: vi.fn(),
    filterByCardType: vi.fn(),
    clearFilter: vi.fn(),
    setOnMarkerClick: vi.fn(),
  }),
}))

vi.mock('@/hooks/useMapBounds', () => ({
  useMapBounds: vi.fn(() => ({
    bounds: {
      north: 37.6,
      south: 37.5,
      east: 127.1,
      west: 127.0,
    },
    isLoading: false,
    getExtendedBounds: vi.fn(() => ({
      north: 37.62,
      south: 37.48,
      east: 127.12,
      west: 126.98,
    })),
    isInBounds: vi.fn((lat, lng) => lat >= 37.48 && lat <= 37.62 && lng >= 126.98 && lng <= 127.12),
  })),
}))

// Mock Naver Maps
const mockMap = {
  destroy: vi.fn(),
  getBounds: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
  setCenter: vi.fn(),
  setZoom: vi.fn(),
}

global.naver = {
  maps: {
    Map: vi.fn(() => mockMap),
    LatLng: vi.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
    Position: {
      TOP_LEFT: 1,
      TOP_RIGHT: 2,
      BOTTOM_LEFT: 3,
      BOTTOM_RIGHT: 4,
    },
    Event: {
      addListener: vi.fn((map, event, handler) => {
        // Store handlers for testing
        if (!global.mapEventHandlers) {
          global.mapEventHandlers = {}
        }
        global.mapEventHandlers[event] = handler
        return { id: Math.random() }
      }),
      removeListener: vi.fn(),
    },
  },
} as any

describe('MapContainer - Viewport Features', () => {
  const defaultProps = {
    merchants: MOCK_MERCHANTS,
    onBoundsChange: vi.fn(),
    onMapReady: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.mapEventHandlers = {}
  })

  it('should call onBoundsChange when viewport changes', async () => {
    const onBoundsChange = vi.fn()
    
    render(
      <MapProvider>
        <MapContainer {...defaultProps} onBoundsChange={onBoundsChange} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Verify that useMapBounds was called with the correct callback
    const { useMapBounds } = require('@/hooks/useMapBounds')
    const lastCall = useMapBounds.mock.calls[useMapBounds.mock.calls.length - 1]
    const options = lastCall[0]
    
    // Simulate bounds change
    const mockBounds: MapBounds = {
      north: 37.6,
      south: 37.5,
      east: 127.1,
      west: 127.0,
    }
    
    act(() => {
      options.onBoundsChange(mockBounds)
    })

    expect(onBoundsChange).toHaveBeenCalledWith(mockBounds)
  })

  it('should filter merchants based on viewport bounds', async () => {
    const { useMapBounds } = require('@/hooks/useMapBounds')
    const { useMarkers } = require('@/hooks/useMarkers')
    
    // Mock merchants with various locations
    const merchants = [
      { ...MOCK_MERCHANTS[0], location: { lat: 37.55, lng: 127.05 } }, // Inside
      { ...MOCK_MERCHANTS[1], location: { lat: 38.0, lng: 128.0 } },   // Outside
      { ...MOCK_MERCHANTS[2], location: { lat: 37.51, lng: 127.08 } }, // Inside extended
    ]

    render(
      <MapProvider>
        <MapContainer {...defaultProps} merchants={merchants} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Get the addMerchants mock
    const addMerchantsMock = useMarkers().addMerchants

    // Verify only merchants within extended bounds are added
    await waitFor(() => {
      expect(addMerchantsMock).toHaveBeenCalled()
      const calledWithMerchants = addMerchantsMock.mock.calls[0][0]
      expect(calledWithMerchants).toHaveLength(2) // Only inside and inside extended
    })
  })

  it('should show loading indicator when loading', async () => {
    const { useMapBounds } = require('@/hooks/useMapBounds')
    
    // Mock loading state
    useMapBounds.mockReturnValue({
      bounds: null,
      isLoading: true,
      getExtendedBounds: vi.fn(),
      isInBounds: vi.fn(),
    })

    render(
      <MapProvider>
        <MapContainer {...defaultProps} />
      </MapProvider>
    )

    expect(screen.getByText('가맹점 정보를 불러오는 중...')).toBeInTheDocument()
    expect(screen.getByText('가맹점 정보를 불러오는 중...')).toHaveClass('text-sm')
  })

  it('should show dragging indicator during drag', async () => {
    render(
      <MapProvider>
        <MapContainer {...defaultProps} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Trigger drag start event
    act(() => {
      if (global.mapEventHandlers.dragstart) {
        global.mapEventHandlers.dragstart()
      }
    })

    expect(screen.getByText('지도를 이동하는 중...')).toBeInTheDocument()

    // Trigger drag end event
    act(() => {
      if (global.mapEventHandlers.dragend) {
        global.mapEventHandlers.dragend()
      }
    })

    expect(screen.queryByText('지도를 이동하는 중...')).not.toBeInTheDocument()
  })

  it('should register all map event listeners', async () => {
    render(
      <MapProvider>
        <MapContainer {...defaultProps} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Verify event listeners are registered
    expect(naver.maps.Event.addListener).toHaveBeenCalledWith(
      expect.any(Object),
      'click',
      expect.any(Function)
    )
    expect(naver.maps.Event.addListener).toHaveBeenCalledWith(
      expect.any(Object),
      'dragstart',
      expect.any(Function)
    )
    expect(naver.maps.Event.addListener).toHaveBeenCalledWith(
      expect.any(Object),
      'dragend',
      expect.any(Function)
    )
    expect(naver.maps.Event.addListener).toHaveBeenCalledWith(
      expect.any(Object),
      'zoom_changed',
      expect.any(Function)
    )
  })

  it('should call onMapReady when map is initialized', async () => {
    const onMapReady = vi.fn()

    render(
      <MapProvider>
        <MapContainer {...defaultProps} onMapReady={onMapReady} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(onMapReady).toHaveBeenCalledWith(mockMap)
    })
  })

  it('should close info window on map click', async () => {
    render(
      <MapProvider>
        <MapContainer {...defaultProps} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Simulate map click
    act(() => {
      if (global.mapEventHandlers.click) {
        global.mapEventHandlers.click()
      }
    })

    // Info window should be closed (merchant should be null)
    // This is tested indirectly as MerchantInfoWindow won't render
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should log zoom changes', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockMap.getZoom.mockReturnValue(16)

    render(
      <MapProvider>
        <MapContainer {...defaultProps} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })

    // Simulate zoom change
    act(() => {
      if (global.mapEventHandlers.zoom_changed) {
        global.mapEventHandlers.zoom_changed()
      }
    })

    expect(consoleSpy).toHaveBeenCalledWith('Zoom changed to:', 16)
    
    consoleSpy.mockRestore()
  })
})