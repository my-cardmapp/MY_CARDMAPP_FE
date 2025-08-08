import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MapControls from './MapControls'

// Mock naver maps
const mockZoomControl = {}
const mockScaleControl = {}
const mockLogoControl = {}
const mockMarker = {}

const mockMapControls = {
  [1]: { push: vi.fn(), clear: vi.fn() }, // TOP_LEFT
  [12]: { push: vi.fn(), clear: vi.fn() }, // BOTTOM_RIGHT
  [10]: { push: vi.fn(), clear: vi.fn() }, // BOTTOM_LEFT
}

const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getElement: vi.fn(() => document.createElement('div')),
  controls: mockMapControls,
}

global.naver = {
  maps: {
    ZoomControl: vi.fn(() => mockZoomControl),
    ScaleControl: vi.fn(() => mockScaleControl),
    LogoControl: vi.fn(() => mockLogoControl),
    Marker: vi.fn(() => mockMarker),
    LatLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
    Point: vi.fn((x: number, y: number) => ({ x, y })),
    Size: vi.fn((width: number, height: number) => ({ width, height })),
    Position: {
      TOP_LEFT: 1,
      BOTTOM_RIGHT: 12,
      BOTTOM_LEFT: 10,
    },
    ZoomControlStyle: {
      SMALL: 1,
    },
  },
} as any

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

// Mock document.fullscreenElement
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  configurable: true,
  value: null,
})

describe('MapControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders control buttons', () => {
    render(<MapControls map={mockMap as any} />)

    expect(screen.getByTitle('내 위치')).toBeInTheDocument()
    expect(screen.getByTitle('전체 화면')).toBeInTheDocument()
  })

  it('does not add native controls to the map (handled by MapOptions)', () => {
    render(<MapControls map={mockMap as any} />)

    // Native controls are set in MapOptions, not in MapControls
    expect(naver.maps.ZoomControl).not.toHaveBeenCalled()
    expect(naver.maps.ScaleControl).not.toHaveBeenCalled()
    expect(naver.maps.LogoControl).not.toHaveBeenCalled()
    
    // No controls should be pushed to the map
    expect(mockMapControls[1].push).not.toHaveBeenCalled()
    expect(mockMapControls[12].push).not.toHaveBeenCalled()
    expect(mockMapControls[10].push).not.toHaveBeenCalled()
  })

  it('handles location permission success', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 37.5666805,
          longitude: 126.9784147,
        },
      })
    })

    render(<MapControls map={mockMap as any} />)

    const locationButton = screen.getByTitle('내 위치')
    fireEvent.click(locationButton)

    await waitFor(() => {
      expect(mockMap.setCenter).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 37.5666805,
          lng: 126.9784147,
        })
      )
      expect(mockMap.setZoom).toHaveBeenCalledWith(16)
    })

    // Check that a location marker was created
    expect(naver.maps.Marker).toHaveBeenCalled()
  })

  it('handles location permission denied', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        PERMISSION_DENIED: 1,
      })
    })

    render(<MapControls map={mockMap as any} />)

    const locationButton = screen.getByTitle('내 위치')
    fireEvent.click(locationButton)

    await waitFor(() => {
      expect(screen.getByText('위치 권한이 거부되었습니다.')).toBeInTheDocument()
    })
  })

  it('shows loading state while getting location', async () => {
    let resolveLocation: any
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      resolveLocation = success
    })

    render(<MapControls map={mockMap as any} />)

    const locationButton = screen.getByTitle('내 위치')
    fireEvent.click(locationButton)

    // Check for spinner
    expect(locationButton.querySelector('.animate-spin')).toBeInTheDocument()
    expect(locationButton).toBeDisabled()

    // Resolve location
    resolveLocation({
      coords: {
        latitude: 37.5666805,
        longitude: 126.9784147,
      },
    })

    await waitFor(() => {
      expect(locationButton.querySelector('.animate-spin')).not.toBeInTheDocument()
      expect(locationButton).not.toBeDisabled()
    })
  })

  it('handles fullscreen toggle', () => {
    const mockElement = document.createElement('div')
    mockElement.requestFullscreen = vi.fn().mockResolvedValue(undefined)
    mockMap.getElement.mockReturnValue(mockElement)

    render(<MapControls map={mockMap as any} />)

    const fullscreenButton = screen.getByTitle('전체 화면')
    fireEvent.click(fullscreenButton)

    expect(mockElement.requestFullscreen).toHaveBeenCalled()
  })

  it('exits fullscreen when already in fullscreen', () => {
    document.exitFullscreen = vi.fn()
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true,
    })

    render(<MapControls map={mockMap as any} />)

    const fullscreenButton = screen.getByTitle('전체 화면')
    fireEvent.click(fullscreenButton)

    expect(document.exitFullscreen).toHaveBeenCalled()

    // Reset
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    })
  })

  it('unmounts cleanly without clearing controls (no controls added)', () => {
    const { unmount } = render(<MapControls map={mockMap as any} />)

    unmount()

    // Since MapControls doesn't add native controls, nothing should be cleared
    expect(mockMapControls[1].clear).not.toHaveBeenCalled()
    expect(mockMapControls[12].clear).not.toHaveBeenCalled()
    expect(mockMapControls[10].clear).not.toHaveBeenCalled()
  })
})