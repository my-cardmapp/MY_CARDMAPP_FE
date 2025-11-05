import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ViewportMarkerRenderer } from './ViewportMarkerRenderer'
import type { Merchant } from '@/types'
import type { MapBounds } from '@/hooks/useMapBounds'

// Mock the cardStyles import
vi.mock('@/constants/cardStyles', () => ({
  getCardStyle: vi.fn(() => ({
    markerIcon: {
      content: '<div>mock marker</div>',
      size: { width: 24, height: 24 },
      anchor: { x: 12, y: 24 },
    }
  }))
}))

// Simple mock setup
const createMockMarker = () => ({
  setMap: vi.fn(),
  setVisible: vi.fn(),
  setPosition: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
})

const mockMarkerConstructor = vi.fn(() => createMockMarker())
const mockEvent = {
  addListener: vi.fn(() => ({ id: 'mock-listener' })),
  removeListener: vi.fn(),
}

const mockMap = {
  getBounds: vi.fn(),
} as unknown as naver.maps.Map

global.naver = {
  maps: {
    Marker: mockMarkerConstructor,
    LatLng: vi.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
    Size: vi.fn((width, height) => ({ width, height })),
    Point: vi.fn((x, y) => ({ x, y })),
    Event: mockEvent,
  },
} as any

const createTestMerchant = (id: number, lat: number, lng: number): Merchant => ({
  id,
  name: `Merchant ${id}`,
  location: { lat, lng },
  address: `Address ${id}`,
  cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF0000' }],
  category: { id: 1, code: 'CONVENIENCE', name: '편의점' },
  phone: '010-1234-5678',
  businessHours: {},
  isVerified: true,
})

const testBounds: MapBounds = {
  north: 37.57,
  south: 37.56,
  east: 126.99,
  west: 126.97,
}

describe('ViewportMarkerRenderer - Core Functionality', () => {
  let renderer: ViewportMarkerRenderer
  let testMerchants: Merchant[]

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new ViewportMarkerRenderer(mockMap)
    
    testMerchants = [
      createTestMerchant(1, 37.565, 126.975), // Inside viewport
      createTestMerchant(2, 37.569, 126.985), // Inside viewport  
      createTestMerchant(3, 37.55, 126.96),   // Outside viewport
      createTestMerchant(4, 37.58, 127.01),   // Outside viewport
      createTestMerchant(5, 37.567, 126.982), // Inside viewport
    ]
  })

  afterEach(() => {
    renderer.destroy()
  })

  describe('Basic functionality', () => {
    it('should initialize correctly', () => {
      expect(renderer.getTotalMarkerCount()).toBe(0)
      expect(renderer.getVisibleMarkerCount()).toBe(0)
      expect(mockEvent.addListener).toHaveBeenCalled()
    })

    it('should load merchants into spatial index', () => {
      renderer.updateMerchants(testMerchants)
      expect(renderer.getTotalMarkerCount()).toBe(testMerchants.length)
    })

    it('should calculate extended bounds correctly', () => {
      const extendedBounds = renderer.getExtendedBounds(testBounds, 0.2)
      
      const latExtension = (testBounds.north - testBounds.south) * 0.2
      const lngExtension = (testBounds.east - testBounds.west) * 0.2

      expect(extendedBounds.north).toBe(testBounds.north + latExtension)
      expect(extendedBounds.south).toBe(testBounds.south - latExtension)
      expect(extendedBounds.east).toBe(testBounds.east + lngExtension)
      expect(extendedBounds.west).toBe(testBounds.west - lngExtension)
    })

    it('should find merchants in bounds', () => {
      renderer.updateMerchants(testMerchants)
      const merchantsInBounds = renderer.getMerchantsInBounds(testBounds)
      
      // Should find merchants within the test bounds
      expect(merchantsInBounds.length).toBeGreaterThan(0)
      expect(merchantsInBounds.length).toBeLessThanOrEqual(testMerchants.length)
      
      // Verify that found merchants are actually within bounds
      merchantsInBounds.forEach(merchant => {
        expect(merchant.location.lat).toBeGreaterThanOrEqual(testBounds.south)
        expect(merchant.location.lat).toBeLessThanOrEqual(testBounds.north)
        expect(merchant.location.lng).toBeGreaterThanOrEqual(testBounds.west)
        expect(merchant.location.lng).toBeLessThanOrEqual(testBounds.east)
      })
    })

    it('should handle viewport updates', () => {
      renderer.updateMerchants(testMerchants)
      
      // This should not throw an error
      expect(() => {
        renderer.updateViewport(testBounds)
      }).not.toThrow()
    })

    it('should filter by card type', () => {
      const mixedMerchants = [
        { ...createTestMerchant(1, 37.565, 126.975), cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF0000' }] },
        { ...createTestMerchant(2, 37.569, 126.985), cards: [{ id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#00FF00' }] },
      ]
      
      renderer.updateMerchants(mixedMerchants)
      
      // Should not throw error
      expect(() => {
        renderer.filterByCardType(['CHILD_MEAL'])
      }).not.toThrow()
    })

    it('should handle large datasets efficiently', () => {
      const largeMerchantSet = Array.from({ length: 1000 }, (_, i) =>
        createTestMerchant(
          i + 1,
          37.5 + (Math.random() - 0.5) * 0.2,
          126.9 + (Math.random() - 0.5) * 0.2
        )
      )
      
      const startTime = performance.now()
      renderer.updateMerchants(largeMerchantSet)
      renderer.updateViewport(testBounds)
      const endTime = performance.now()
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(500) // 500ms for 1000 merchants
      expect(renderer.getTotalMarkerCount()).toBe(1000)
    })

    it('should clean up properly', () => {
      renderer.updateMerchants(testMerchants)
      renderer.updateViewport(testBounds)
      
      expect(() => renderer.destroy()).not.toThrow()
      expect(renderer.getTotalMarkerCount()).toBe(0)
      expect(renderer.getVisibleMarkerCount()).toBe(0)
    })
  })

  describe('Performance metrics', () => {
    it('should provide performance metrics', () => {
      renderer.updateMerchants(testMerchants)
      renderer.updateViewport(testBounds)
      
      const metrics = renderer.getPerformanceMetrics()
      
      expect(typeof metrics.lastUpdateTime).toBe('number')
      expect(typeof metrics.poolSize).toBe('number')
      expect(typeof metrics.inUseCount).toBe('number')
      expect(metrics.lastUpdateTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Error handling', () => {
    it('should handle invalid merchant data', () => {
      const invalidMerchants = [
        { ...createTestMerchant(1, NaN, 126.975) },
        { ...createTestMerchant(2, 37.569, Infinity) },
        { ...createTestMerchant(3, 37.567, 126.982), location: null as any },
      ]
      
      expect(() => {
        renderer.updateMerchants(invalidMerchants)
      }).not.toThrow()
      
      // Should filter out invalid merchants
      expect(renderer.getTotalMarkerCount()).toBe(0)
    })

    it('should handle null map gracefully', () => {
      const nullMapRenderer = new ViewportMarkerRenderer(null as any)
      
      expect(() => {
        nullMapRenderer.updateMerchants(testMerchants)
        nullMapRenderer.updateViewport(testBounds)
        nullMapRenderer.destroy()
      }).not.toThrow()
    })
  })
})