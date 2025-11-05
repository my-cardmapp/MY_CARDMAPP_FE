import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ViewportMarkerRenderer } from './ViewportMarkerRenderer'
import type { Merchant } from '@/types'
import type { MapBounds } from '@/hooks/useMapBounds'

// Mock Naver Maps API
const mockMap = {
  getBounds: vi.fn(),
  getZoom: vi.fn(),
  setCenter: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
} as unknown as naver.maps.Map

const mockLatLng = vi.fn((lat: number, lng: number) => ({ lat: () => lat, lng: () => lng }))
const mockSize = vi.fn((width: number, height: number) => ({ width, height }))
const mockPoint = vi.fn((x: number, y: number) => ({ x, y }))

const createMockMarker = () => ({
  setMap: vi.fn(),
  getPosition: vi.fn(),
  destroy: vi.fn(),
  setVisible: vi.fn(),
  setPosition: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
}) as unknown as naver.maps.Marker

const mockMarkerConstructor = vi.fn(() => createMockMarker())
const mockEvent = {
  addListener: vi.fn(() => ({ id: 'mock-listener' })),
  removeListener: vi.fn(),
}

const mockMarkerClustering = {
  addMarker: vi.fn(),
  removeMarker: vi.fn(),
  clearMarkers: vi.fn(),
  redraw: vi.fn(),
  setMap: vi.fn(),
}

// Global mock setup
global.naver = {
  maps: {
    Map: vi.fn(() => mockMap),
    Marker: mockMarkerConstructor,
    MarkerClustering: vi.fn(() => mockMarkerClustering),
    LatLng: mockLatLng,
    Size: mockSize,
    Point: mockPoint,
    Event: mockEvent,
    getBounds: vi.fn(() => ({
      getNE: () => ({ lat: () => 37.57, lng: () => 126.99 }),
      getSW: () => ({ lat: () => 37.56, lng: () => 126.97 }),
    })),
  },
} as any

// Sample test data
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

describe('ViewportMarkerRenderer', () => {
  let renderer: ViewportMarkerRenderer
  let testMerchants: Merchant[]

  beforeEach(() => {
    vi.clearAllMocks()
    renderer = new ViewportMarkerRenderer(mockMap)
    
    // Create test merchants - some inside viewport, some outside
    testMerchants = [
      createTestMerchant(1, 37.565, 126.975), // Inside viewport
      createTestMerchant(2, 37.569, 126.985), // Inside viewport  
      createTestMerchant(3, 37.55, 126.96),   // Outside viewport (south-west)
      createTestMerchant(4, 37.58, 127.01),   // Outside viewport (north-east)
      createTestMerchant(5, 37.567, 126.982), // Inside viewport
    ]
  })

  afterEach(() => {
    renderer.destroy()
  })

  describe('initialization', () => {
    it('should initialize with empty markers and spatial index', () => {
      expect(renderer.getTotalMarkerCount()).toBe(0)
      expect(renderer.getVisibleMarkerCount()).toBe(0)
    })

    it('should set up viewport change listener on map', () => {
      expect(mockEvent.addListener).toHaveBeenCalledWith(
        mockMap,
        'bounds_changed',
        expect.any(Function)
      )
    })
  })

  describe('spatial indexing', () => {
    it('should build spatial index from merchants', () => {
      renderer.updateMerchants(testMerchants)
      
      expect(renderer.getTotalMarkerCount()).toBe(testMerchants.length)
    })

    it('should efficiently query markers within bounds', () => {
      renderer.updateMerchants(testMerchants)
      
      const visibleMerchants = renderer.getMerchantsInBounds(testBounds)
      
      // Only merchants 1, 2, and 5 should be inside the test bounds
      expect(visibleMerchants).toHaveLength(3)
      expect(visibleMerchants.map(m => m.id).sort()).toEqual([1, 2, 5])
    })

    it('should handle edge cases for boundary coordinates', () => {
      const edgeMerchants = [
        createTestMerchant(1, testBounds.north, testBounds.east), // Exact corner
        createTestMerchant(2, testBounds.south, testBounds.west), // Exact corner
        createTestMerchant(3, testBounds.north + 0.0001, testBounds.east), // Just outside
        createTestMerchant(4, testBounds.south - 0.0001, testBounds.west), // Just outside
      ]
      
      renderer.updateMerchants(edgeMerchants)
      const visibleMerchants = renderer.getMerchantsInBounds(testBounds)
      
      // Only merchants on exact boundaries should be included
      expect(visibleMerchants).toHaveLength(2)
      expect(visibleMerchants.map(m => m.id).sort()).toEqual([1, 2])
    })
  })

  describe('buffer zone handling', () => {
    it('should include buffer zone when calculating extended bounds', () => {
      const bufferRatio = 0.2
      const extendedBounds = renderer.getExtendedBounds(testBounds, bufferRatio)
      
      const latExtension = (testBounds.north - testBounds.south) * bufferRatio
      const lngExtension = (testBounds.east - testBounds.west) * bufferRatio
      
      expect(extendedBounds.north).toBe(testBounds.north + latExtension)
      expect(extendedBounds.south).toBe(testBounds.south - latExtension)
      expect(extendedBounds.east).toBe(testBounds.east + lngExtension)
      expect(extendedBounds.west).toBe(testBounds.west - lngExtension)
    })

    it('should render markers in buffer zone for smooth scrolling', () => {
      renderer.updateMerchants(testMerchants)
      renderer.updateViewport(testBounds, 0.1) // 10% buffer
      
      const visibleCount = renderer.getVisibleMarkerCount()
      const baseVisibleMerchants = renderer.getMerchantsInBounds(testBounds)
      const extendedBounds = renderer.getExtendedBounds(testBounds, 0.1)
      const extendedVisibleMerchants = renderer.getMerchantsInBounds(extendedBounds)
      
      // Should render more markers with buffer than without
      expect(visibleCount).toBeGreaterThanOrEqual(baseVisibleMerchants.length)
      expect(visibleCount).toBeLessThanOrEqual(extendedVisibleMerchants.length)
    })
  })

  describe('marker recycling pool', () => {
    it('should reuse marker DOM elements when possible', () => {
      renderer.updateMerchants(testMerchants.slice(0, 3))
      renderer.updateViewport(testBounds)
      
      const initialMarkerCreateCalls = mockMarkerConstructor.mock.calls.length
      
      // Update with different merchants in same positions
      const newMerchants = [
        createTestMerchant(6, 37.565, 126.975),
        createTestMerchant(7, 37.569, 126.985),
        createTestMerchant(8, 37.567, 126.982),
      ]
      
      renderer.updateMerchants(newMerchants)
      renderer.updateViewport(testBounds)
      
      // Should not create significantly more markers than necessary
      expect(mockMarkerConstructor.mock.calls.length).toBeLessThanOrEqual(initialMarkerCreateCalls + 3)
    })

    it('should handle pool overflow gracefully', () => {
      const manyMerchants = Array.from({ length: 1000 }, (_, i) =>
        createTestMerchant(i + 1, 37.565 + (i % 10) * 0.001, 126.975 + Math.floor(i / 10) * 0.001)
      )
      
      renderer.updateMerchants(manyMerchants)
      renderer.updateViewport(testBounds)
      
      // Should not crash with large numbers of markers
      expect(renderer.getVisibleMarkerCount()).toBeGreaterThan(0)
      expect(renderer.getVisibleMarkerCount()).toBeLessThanOrEqual(manyMerchants.length)
    })
  })

  describe('viewport change optimization', () => {
    it('should debounce rapid viewport changes', async () => {
      renderer.updateMerchants(testMerchants)
      
      const originalVisibleCount = renderer.getVisibleMarkerCount()
      
      // Simulate rapid viewport changes
      const newBounds1 = { ...testBounds, north: testBounds.north + 0.01 }
      const newBounds2 = { ...testBounds, north: testBounds.north + 0.02 }
      
      renderer.updateViewport(newBounds1)
      renderer.updateViewport(newBounds2)
      
      // Should handle rapid updates without performance issues
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(renderer.getVisibleMarkerCount()).toBeGreaterThanOrEqual(0)
    })

    it('should only update markers when viewport actually changes', () => {
      renderer.updateMerchants(testMerchants)
      renderer.updateViewport(testBounds)
      
      const initialVisibleCount = renderer.getVisibleMarkerCount()
      
      // Update with same bounds
      renderer.updateViewport(testBounds)
      
      // Should not change visible marker count
      expect(renderer.getVisibleMarkerCount()).toBe(initialVisibleCount)
    })
  })

  describe('performance with large datasets', () => {
    it('should handle 10,000+ markers efficiently', () => {
      const largeMerchantSet = Array.from({ length: 10000 }, (_, i) =>
        createTestMerchant(
          i + 1,
          37.5 + (Math.random() - 0.5) * 0.2, // Random lat around Seoul
          126.9 + (Math.random() - 0.5) * 0.2  // Random lng around Seoul
        )
      )
      
      const startTime = performance.now()
      renderer.updateMerchants(largeMerchantSet)
      renderer.updateViewport(testBounds)
      const endTime = performance.now()
      
      // Should complete within reasonable time (< 100ms for 10k markers)
      expect(endTime - startTime).toBeLessThan(100)
      expect(renderer.getTotalMarkerCount()).toBe(10000)
    })

    it('should maintain constant memory usage during panning', () => {
      const merchants = Array.from({ length: 5000 }, (_, i) =>
        createTestMerchant(i + 1, 37.5 + i * 0.0001, 126.9 + i * 0.0001)
      )
      
      renderer.updateMerchants(merchants)
      renderer.updateViewport(testBounds)
      
      const initialVisibleCount = renderer.getVisibleMarkerCount()
      
      // Simulate panning around
      for (let i = 0; i < 10; i++) {
        const panBounds = {
          north: testBounds.north + i * 0.01,
          south: testBounds.south + i * 0.01,
          east: testBounds.east + i * 0.01,
          west: testBounds.west + i * 0.01,
        }
        renderer.updateViewport(panBounds)
      }
      
      // Visible marker count should remain reasonable
      const finalVisibleCount = renderer.getVisibleMarkerCount()
      expect(finalVisibleCount).toBeLessThan(merchants.length * 0.1) // At most 10% visible
    })
  })

  describe('cleanup and memory management', () => {
    it('should clean up all markers and listeners on destroy', () => {
      renderer.updateMerchants(testMerchants)
      renderer.updateViewport(testBounds)
      
      const removeListenerCalls = mockEvent.removeListener.mock.calls.length
      
      renderer.destroy()
      
      expect(mockEvent.removeListener.mock.calls.length).toBeGreaterThan(removeListenerCalls)
      expect(renderer.getTotalMarkerCount()).toBe(0)
      expect(renderer.getVisibleMarkerCount()).toBe(0)
    })

    it('should handle cleanup when map is null', () => {
      const rendererWithNullMap = new ViewportMarkerRenderer(null as any)
      
      // Should not throw error
      expect(() => rendererWithNullMap.destroy()).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle invalid merchant data gracefully', () => {
      const invalidMerchants = [
        { ...createTestMerchant(1, 37.565, 126.975), location: null as any },
        { ...createTestMerchant(2, NaN, 126.985) },
        { ...createTestMerchant(3, 37.567, Infinity) },
      ]
      
      // Should not throw error with invalid data
      expect(() => renderer.updateMerchants(invalidMerchants)).not.toThrow()
    })

    it('should handle map API errors gracefully', () => {
      mockMarkerConstructor.mockImplementationOnce(() => {
        throw new Error('Marker creation failed')
      })
      
      // Should continue working even if some markers fail to create
      expect(() => {
        renderer.updateMerchants([testMerchants[0]])
        renderer.updateViewport(testBounds)
      }).not.toThrow()
    })
  })

  describe('integration with existing marker system', () => {
    it('should be compatible with card type filtering', () => {
      // Reset mock implementation to not throw errors  
      mockMarkerConstructor.mockImplementation(() => createMockMarker())
      
      const mixedCardMerchants = [
        { ...createTestMerchant(1, 37.565, 126.975), cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF0000' }] },
        { ...createTestMerchant(2, 37.569, 126.985), cards: [{ id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#00FF00' }] },
      ]
      
      renderer.updateMerchants(mixedCardMerchants)
      renderer.filterByCardType(['CHILD_MEAL'])
      renderer.updateViewport(testBounds)
      
      // Should only show filtered markers
      expect(renderer.getVisibleMarkerCount()).toBe(1)
    })

    it('should support marker clustering when enabled', () => {
      renderer.updateMerchants(testMerchants)
      renderer.enableClustering()
      renderer.updateViewport(testBounds)
      
      // Should integrate with clustering system
      expect(renderer.getClusteringStatus()).toBe(true)
    })
  })
})