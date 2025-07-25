import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarkerManager } from './MarkerManager'
import { CARD_STYLES } from '@/constants/cardStyles'

// Mock naver.maps
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
}

const mockMarker = {
  setMap: vi.fn(),
  setPosition: vi.fn(),
  getPosition: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
}

const mockInfoWindow = {
  open: vi.fn(),
  close: vi.fn(),
  setContent: vi.fn(),
}

const mockMarkerClustering = {
  setMap: vi.fn(),
  addMarker: vi.fn(),
  addMarkers: vi.fn(),
  removeMarker: vi.fn(),
  removeMarkers: vi.fn(),
  clearMarkers: vi.fn(),
  redraw: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  
  ;(window as any).naver = {
    maps: {
      Map: vi.fn(() => mockMap),
      Marker: vi.fn(() => mockMarker),
      LatLng: vi.fn((lat, lng) => ({ lat, lng })),
      Point: vi.fn((x, y) => ({ x, y })),
      InfoWindow: vi.fn(() => mockInfoWindow),
      MarkerClustering: vi.fn(() => mockMarkerClustering),
      SymbolPath: {
        CIRCLE: 3,
      },
      Event: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  }
})

describe('MarkerManager', () => {
  let markerManager: MarkerManager

  beforeEach(() => {
    markerManager = new MarkerManager(mockMap as any)
  })

  it('should initialize with empty markers', () => {
    expect(markerManager.getMarkers()).toHaveLength(0)
  })

  it('should add merchant markers', () => {
    const merchants = [
      {
        id: 1,
        name: 'Test Merchant 1',
        location: { lat: 37.5, lng: 127.0 },
        cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
      },
      {
        id: 2,
        name: 'Test Merchant 2',
        location: { lat: 37.51, lng: 127.01 },
        cards: [{ code: 'CULTURE_NURI', name: '문화누리카드' }],
      },
    ]

    markerManager.addMerchants(merchants as any)

    expect(window.naver.maps.Marker).toHaveBeenCalledTimes(2)
    expect(markerManager.getMarkers()).toHaveLength(2)
  })

  it('should apply correct marker styles based on card type', () => {
    const merchant = {
      id: 1,
      name: 'Test Merchant',
      location: { lat: 37.5, lng: 127.0 },
      cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
    }

    markerManager.addMerchants([merchant] as any)

    expect(window.naver.maps.Marker).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.objectContaining({
          path: expect.any(String),
          fillColor: CARD_STYLES.CHILD_MEAL.color,
        }),
      })
    )
  })

  it('should handle merchants with multiple cards', () => {
    const merchant = {
      id: 1,
      name: 'Multi-card Merchant',
      location: { lat: 37.5, lng: 127.0 },
      cards: [
        { code: 'CHILD_MEAL', name: '아동급식카드' },
        { code: 'CULTURE_NURI', name: '문화누리카드' },
      ],
    }

    markerManager.addMerchants([merchant] as any)

    // Should use first card's style
    expect(window.naver.maps.Marker).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.objectContaining({
          fillColor: CARD_STYLES.CHILD_MEAL.color,
        }),
      })
    )
  })

  it('should remove specific marker', () => {
    const merchants = [
      {
        id: 1,
        name: 'Test Merchant 1',
        location: { lat: 37.5, lng: 127.0 },
        cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
      },
    ]

    markerManager.addMerchants(merchants as any)
    markerManager.removeMarker(1)

    expect(mockMarker.setMap).toHaveBeenCalledWith(null)
    expect(markerManager.getMarkers()).toHaveLength(0)
  })

  it('should clear all markers', () => {
    const merchants = [
      {
        id: 1,
        name: 'Test Merchant 1',
        location: { lat: 37.5, lng: 127.0 },
        cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
      },
      {
        id: 2,
        name: 'Test Merchant 2',
        location: { lat: 37.51, lng: 127.01 },
        cards: [{ code: 'CULTURE_NURI', name: '문화누리카드' }],
      },
    ]

    markerManager.addMerchants(merchants as any)
    markerManager.clearMarkers()

    expect(mockMarker.setMap).toHaveBeenCalledWith(null)
    expect(mockMarker.setMap).toHaveBeenCalledTimes(2)
    expect(markerManager.getMarkers()).toHaveLength(0)
  })

  it('should enable clustering when adding many markers', () => {
    const merchants = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Merchant ${i + 1}`,
      location: { lat: 37.5 + i * 0.001, lng: 127.0 + i * 0.001 },
      cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
    }))

    markerManager.addMerchants(merchants as any)
    markerManager.enableClustering()

    expect(window.naver.maps.MarkerClustering).toHaveBeenCalledWith(
      expect.objectContaining({
        map: mockMap,
        markers: expect.any(Array),
      })
    )
  })

  it('should disable clustering', () => {
    const merchants = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Merchant ${i + 1}`,
      location: { lat: 37.5 + i * 0.001, lng: 127.0 + i * 0.001 },
      cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
    }))

    markerManager.addMerchants(merchants as any)
    markerManager.enableClustering()
    markerManager.disableClustering()

    expect(mockMarkerClustering.setMap).toHaveBeenCalledWith(null)
  })

  it('should filter markers by card type', () => {
    const merchants = [
      {
        id: 1,
        name: 'Child Meal Merchant',
        location: { lat: 37.5, lng: 127.0 },
        cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
      },
      {
        id: 2,
        name: 'Culture Merchant',
        location: { lat: 37.51, lng: 127.01 },
        cards: [{ code: 'CULTURE_NURI', name: '문화누리카드' }],
      },
    ]

    markerManager.addMerchants(merchants as any)
    markerManager.filterByCardType(['CHILD_MEAL'])

    // Culture merchant marker should be hidden
    expect(mockMarker.setMap).toHaveBeenCalledWith(null)
  })

  it('should show all markers when filter is cleared', () => {
    const merchants = [
      {
        id: 1,
        name: 'Child Meal Merchant',
        location: { lat: 37.5, lng: 127.0 },
        cards: [{ code: 'CHILD_MEAL', name: '아동급식카드' }],
      },
      {
        id: 2,
        name: 'Culture Merchant',
        location: { lat: 37.51, lng: 127.01 },
        cards: [{ code: 'CULTURE_NURI', name: '문화누리카드' }],
      },
    ]

    markerManager.addMerchants(merchants as any)
    markerManager.filterByCardType(['CHILD_MEAL'])
    markerManager.clearFilter()

    // All markers should be visible
    expect(mockMarker.setMap).toHaveBeenLastCalledWith(mockMap)
  })
})