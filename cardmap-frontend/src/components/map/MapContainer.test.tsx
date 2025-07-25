import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MapContainer from './MapContainer'
import { MapProvider } from '@/contexts/MapContext'
import { useNaverMapScript } from '@/hooks/useNaverMapScript'

// Mock the useNaverMapScript hook
vi.mock('@/hooks/useNaverMapScript')

// Mock naver.maps
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
  destroy: vi.fn(),
}

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks()
  
  // Default mock for useNaverMapScript
  vi.mocked(useNaverMapScript).mockReturnValue({
    isLoading: false,
    isError: false,
    isLoaded: true,
  })
  
  // Mock naver.maps.Map constructor
  ;(window as any).naver = {
    maps: {
      Map: vi.fn(() => mockMap),
      LatLng: vi.fn((lat, lng) => ({ lat, lng })),
      ControlPosition: {
        TOP_RIGHT: 3,
      },
    },
  }
})

describe('MapContainer', () => {
  it('should render loading skeleton while map is loading', () => {
    vi.mocked(useNaverMapScript).mockReturnValue({
      isLoading: true,
      isError: false,
      isLoaded: false,
    })

    render(
      <MapProvider>
        <MapContainer />
      </MapProvider>
    )

    expect(screen.getByTestId('map-skeleton')).toBeInTheDocument()
  })

  it('should render error message when map loading fails', () => {
    vi.mocked(useNaverMapScript).mockReturnValue({
      isLoading: false,
      isError: true,
      isLoaded: false,
    })

    render(
      <MapProvider>
        <MapContainer />
      </MapProvider>
    )

    expect(screen.getByText(/지도를 불러오는데 실패했습니다/)).toBeInTheDocument()
  })

  it('should render map container when loaded', async () => {
    render(
      <MapProvider>
        <MapContainer />
      </MapProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })
  })

  it('should initialize map with default center and zoom', async () => {
    render(
      <MapProvider>
        <MapContainer />
      </MapProvider>
    )

    await waitFor(() => {
      expect(window.naver.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: expect.objectContaining({ lat: 37.5666805, lng: 126.9784147 }),
          zoom: 15,
        })
      )
    })
  })

  it('should apply custom center and zoom props', async () => {
    const customCenter = { lat: 35.1796, lng: 129.0756 }
    const customZoom = 12

    render(
      <MapProvider>
        <MapContainer center={customCenter} zoom={customZoom} />
      </MapProvider>
    )

    await waitFor(() => {
      expect(window.naver.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: expect.objectContaining(customCenter),
          zoom: customZoom,
        })
      )
    })
  })

  it('should clean up map on unmount', async () => {
    const { unmount } = render(
      <MapProvider>
        <MapContainer />
      </MapProvider>
    )

    await waitFor(() => {
      expect(window.naver.maps.Map).toHaveBeenCalled()
    })

    unmount()

    expect(mockMap.destroy).toHaveBeenCalled()
  })

  it('should be responsive', () => {
    render(
      <MapProvider>
        <MapContainer className="custom-class" />
      </MapProvider>
    )

    const container = screen.getByTestId('map-container')
    expect(container).toHaveClass('custom-class')
    expect(container).toHaveClass('w-full')
    expect(container).toHaveClass('h-full')
  })
})