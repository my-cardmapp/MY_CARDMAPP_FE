import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MapProvider, useMapContext } from './MapContext'

// Mock naver maps
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('@/hooks/useNaverMapScript', () => ({
  isNaverMapLoaded: () => true,
}))

// Test component that uses the map context
const TestComponent = () => {
  const { map, isMapReady } = useMapContext()
  return (
    <div>
      <div data-testid="map-ready">{isMapReady ? 'ready' : 'not-ready'}</div>
      <div data-testid="map-instance">{map ? 'map-exists' : 'no-map'}</div>
    </div>
  )
}

describe('MapContext', () => {
  it('should provide map context', () => {
    render(
      <MapProvider>
        <TestComponent />
      </MapProvider>
    )
    
    expect(screen.getByTestId('map-ready')).toHaveTextContent('not-ready')
    expect(screen.getByTestId('map-instance')).toHaveTextContent('no-map')
  })

  it('should throw error when useMapContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useMapContext must be used within a MapProvider')
    
    consoleSpy.mockRestore()
  })

  it('should update context when map is set', () => {
    const { rerender } = render(
      <MapProvider>
        <TestComponent />
      </MapProvider>
    )
    
    // Initially not ready
    expect(screen.getByTestId('map-ready')).toHaveTextContent('not-ready')
    
    // TODO: Test map initialization after MapContainer is implemented
  })
})