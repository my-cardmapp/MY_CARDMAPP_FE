import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClusterManager } from './ClusterManager'
import type { Merchant } from '@/types'

// Mock supercluster
vi.mock('supercluster', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      load: vi.fn(),
      getClusters: vi.fn().mockReturnValue([]),
      getChildren: vi.fn().mockReturnValue([]),
      getLeaves: vi.fn().mockReturnValue([]),
      getClusterExpansionZoom: vi.fn().mockReturnValue(15),
      destroy: vi.fn()
    }))
  }
})

describe('ClusterManager', () => {
  let clusterManager: ClusterManager

  const mockMerchants: Merchant[] = [
    {
      id: 1,
      name: 'Test Merchant 1',
      address: '서울시 강남구',
      location: { lat: 37.5665, lng: 126.9780 },
      cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B', iconUrl: null }],
      category: { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
      businessHours: null,
      phone: '02-1234-5678',
      isVerified: true
    },
    {
      id: 2,
      name: 'Test Merchant 2',
      address: '서울시 강남구',
      location: { lat: 37.5666, lng: 126.9781 },
      cards: [{ id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#4ECDC4', iconUrl: null }],
      category: { id: 2, code: 'CAFE', name: '카페', icon: '☕' },
      businessHours: null,
      phone: '02-2345-6789',
      isVerified: false
    },
    {
      id: 3,
      name: 'Test Merchant 3',
      address: '서울시 서초구',
      location: { lat: 37.4837, lng: 127.0324 },
      cards: [{ id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B', iconUrl: null }],
      category: { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
      businessHours: null,
      phone: '02-3456-7890',
      isVerified: true
    }
  ]

  // Generate large dataset for performance testing
  const generateLargeMerchantDataset = (count: number): Merchant[] => {
    const merchants: Merchant[] = []
    for (let i = 0; i < count; i++) {
      merchants.push({
        id: i + 100,
        name: `Merchant ${i + 100}`,
        address: `Address ${i + 100}`,
        location: {
          lat: 37.5 + (Math.random() - 0.5) * 0.2,
          lng: 127.0 + (Math.random() - 0.5) * 0.2
        },
        cards: [{ 
          id: 1, 
          code: i % 2 === 0 ? 'CHILD_MEAL' : 'CULTURE_NURI', 
          name: i % 2 === 0 ? '아동급식카드' : '문화누리카드',
          colorHex: i % 2 === 0 ? '#FF6B6B' : '#4ECDC4',
          iconUrl: null
        }],
        category: { 
          id: 1, 
          code: 'RESTAURANT', 
          name: '음식점', 
          icon: '🍽️' 
        },
        businessHours: null,
        phone: `02-${String(i).padStart(4, '0')}-${String(i % 10000).padStart(4, '0')}`,
        isVerified: i % 3 === 0
      })
    }
    return merchants
  }

  beforeEach(() => {
    clusterManager = new ClusterManager()
  })

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(clusterManager).toBeDefined()
      expect(clusterManager.getOptions()).toEqual({
        radius: 40,
        maxZoom: 16,
        minPoints: 2,
        nodeSize: 64
      })
    })

    it('should accept custom options', () => {
      const customManager = new ClusterManager({
        radius: 60,
        maxZoom: 18,
        minPoints: 3
      })
      
      expect(customManager.getOptions()).toMatchObject({
        radius: 60,
        maxZoom: 18,
        minPoints: 3
      })
    })
  })

  describe('Loading Merchants', () => {
    it('should load merchants into cluster', () => {
      clusterManager.load(mockMerchants)
      expect(clusterManager.getMerchantCount()).toBe(3)
    })

    it('should handle empty merchant array', () => {
      clusterManager.load([])
      expect(clusterManager.getMerchantCount()).toBe(0)
    })

    it('should update existing merchants when loading new data', () => {
      clusterManager.load(mockMerchants)
      expect(clusterManager.getMerchantCount()).toBe(3)
      
      const newMerchants = mockMerchants.slice(0, 2)
      clusterManager.load(newMerchants)
      expect(clusterManager.getMerchantCount()).toBe(2)
    })

    it('should handle merchants with invalid coordinates', () => {
      const invalidMerchants: Merchant[] = [
        ...mockMerchants,
        {
          id: 999,
          name: 'Invalid Merchant',
          address: 'Invalid',
          location: { lat: NaN, lng: NaN },
          cards: [],
          category: { id: 1, code: 'TEST', name: 'Test', icon: '🔧' },
          businessHours: null,
          phone: null,
          isVerified: false
        }
      ]
      
      clusterManager.load(invalidMerchants)
      // Should only load valid merchants
      expect(clusterManager.getMerchantCount()).toBe(3)
    })
  })

  describe('Cluster Formation', () => {
    beforeEach(() => {
      clusterManager.load(mockMerchants)
    })

    it('should create clusters at low zoom levels', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 10
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      
      // At low zoom, nearby points should be clustered
      expect(clusters.length).toBeLessThan(mockMerchants.length)
      
      // Check cluster properties
      const cluster = clusters.find(c => c.properties?.cluster === true)
      if (cluster) {
        expect(cluster.properties?.point_count).toBeGreaterThan(1)
        expect(cluster.properties?.cluster_id).toBeDefined()
      }
    })

    it('should show individual markers at high zoom levels', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 18 // Very high zoom
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      
      // At high zoom, points should not be clustered
      const individualMarkers = clusters.filter(c => !c.properties?.cluster)
      expect(individualMarkers.length).toBe(mockMerchants.length)
    })

    it('should respect minPoints option', () => {
      const customManager = new ClusterManager({ minPoints: 3 })
      customManager.load(mockMerchants.slice(0, 2)) // Only 2 merchants
      
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 10
      
      const clusters = customManager.getClusters(bounds, zoom)
      
      // With minPoints=3 and only 2 merchants, no clusters should form
      const clusteredPoints = clusters.filter(c => c.properties?.cluster === true)
      expect(clusteredPoints.length).toBe(0)
    })

    it('should handle viewport bounds correctly', () => {
      const bounds = { west: 126.97, east: 126.98, south: 37.56, north: 37.57 }
      const zoom = 15
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      
      // Should only return clusters/points within bounds
      clusters.forEach(cluster => {
        const [lng, lat] = cluster.geometry.coordinates
        expect(lng).toBeGreaterThanOrEqual(bounds.west)
        expect(lng).toBeLessThanOrEqual(bounds.east)
        expect(lat).toBeGreaterThanOrEqual(bounds.south)
        expect(lat).toBeLessThanOrEqual(bounds.north)
      })
    })
  })

  describe('Cluster Styling', () => {
    beforeEach(() => {
      const largeMerchants = generateLargeMerchantDataset(100)
      clusterManager.load(largeMerchants)
    })

    it('should categorize clusters by size', () => {
      const bounds = { west: 126.8, east: 127.2, south: 37.3, north: 37.7 }
      const zoom = 12
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      const clusteredPoints = clusters.filter(c => c.properties?.cluster === true)
      
      clusteredPoints.forEach(cluster => {
        const count = cluster.properties?.point_count || 0
        const style = clusterManager.getClusterStyle(count)
        
        if (count <= 10) {
          expect(style.category).toBe('small')
        } else if (count <= 50) {
          expect(style.category).toBe('medium')
        } else {
          expect(style.category).toBe('large')
        }
      })
    })

    it('should provide appropriate styles for different cluster sizes', () => {
      const smallStyle = clusterManager.getClusterStyle(5)
      expect(smallStyle).toMatchObject({
        category: 'small',
        size: 40,
        fontSize: 14,
        backgroundColor: expect.any(String),
        borderColor: expect.any(String),
        textColor: expect.any(String)
      })

      const mediumStyle = clusterManager.getClusterStyle(25)
      expect(mediumStyle.size).toBeGreaterThan(smallStyle.size)
      expect(mediumStyle.category).toBe('medium')

      const largeStyle = clusterManager.getClusterStyle(100)
      expect(largeStyle.size).toBeGreaterThan(mediumStyle.size)
      expect(largeStyle.category).toBe('large')
    })
  })

  describe('Cluster Interactions', () => {
    beforeEach(() => {
      clusterManager.load(mockMerchants)
    })

    it('should get expansion zoom for a cluster', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 10
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      const cluster = clusters.find(c => c.properties?.cluster === true)
      
      if (cluster && cluster.properties?.cluster_id !== undefined) {
        const expansionZoom = clusterManager.getClusterExpansionZoom(
          cluster.properties.cluster_id
        )
        
        expect(expansionZoom).toBeGreaterThan(zoom)
        expect(expansionZoom).toBeLessThanOrEqual(clusterManager.getOptions().maxZoom)
      }
    })

    it('should get children of a cluster', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 10
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      const cluster = clusters.find(c => c.properties?.cluster === true)
      
      if (cluster && cluster.properties?.cluster_id !== undefined) {
        const children = clusterManager.getClusterChildren(
          cluster.properties.cluster_id
        )
        
        expect(Array.isArray(children)).toBe(true)
        expect(children.length).toBeGreaterThan(0)
      }
    })

    it('should get all leaves (merchants) in a cluster', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 10
      
      const clusters = clusterManager.getClusters(bounds, zoom)
      const cluster = clusters.find(c => c.properties?.cluster === true)
      
      if (cluster && cluster.properties?.cluster_id !== undefined) {
        const leaves = clusterManager.getClusterLeaves(
          cluster.properties.cluster_id,
          10 // limit
        )
        
        expect(Array.isArray(leaves)).toBe(true)
        leaves.forEach(leaf => {
          expect(leaf.properties?.merchant).toBeDefined()
          expect(leaf.properties?.cluster).toBeUndefined()
        })
      }
    })
  })

  describe('Filter Integration', () => {
    beforeEach(() => {
      clusterManager.load(mockMerchants)
    })

    it('should filter clusters by card type', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 18 // High zoom to see individual markers
      
      // Filter for CHILD_MEAL only
      clusterManager.setFilter(['CHILD_MEAL'])
      const filteredClusters = clusterManager.getClusters(bounds, zoom)
      
      const childMealMerchants = filteredClusters.filter(c => {
        return c.properties?.merchant?.cards.some(
          (card: any) => card.code === 'CHILD_MEAL'
        )
      })
      
      expect(childMealMerchants.length).toBe(2) // Only merchants 1 and 3
    })

    it('should clear filters', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 18
      
      clusterManager.setFilter(['CHILD_MEAL'])
      let clusters = clusterManager.getClusters(bounds, zoom)
      expect(clusters.length).toBe(2)
      
      clusterManager.clearFilter()
      clusters = clusterManager.getClusters(bounds, zoom)
      expect(clusters.length).toBe(3)
    })

    it('should handle multiple card type filters', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const zoom = 18
      
      clusterManager.setFilter(['CHILD_MEAL', 'CULTURE_NURI'])
      const clusters = clusterManager.getClusters(bounds, zoom)
      
      expect(clusters.length).toBe(3) // All merchants match
    })
  })

  describe('Performance', () => {
    it('should handle 10,000+ merchants efficiently', () => {
      const largeMerchants = generateLargeMerchantDataset(10000)
      
      const startLoad = performance.now()
      clusterManager.load(largeMerchants)
      const loadTime = performance.now() - startLoad
      
      // Loading should be fast
      expect(loadTime).toBeLessThan(1000) // Less than 1 second
      expect(clusterManager.getMerchantCount()).toBe(10000)
      
      // Clustering should be fast
      const bounds = { west: 126.8, east: 127.2, south: 37.3, north: 37.7 }
      const zoom = 12
      
      const startCluster = performance.now()
      const clusters = clusterManager.getClusters(bounds, zoom)
      const clusterTime = performance.now() - startCluster
      
      expect(clusterTime).toBeLessThan(100) // Less than 100ms
      expect(clusters.length).toBeGreaterThan(0)
    })

    it('should maintain 60fps performance during clustering', () => {
      const largeMerchants = generateLargeMerchantDataset(5000)
      clusterManager.load(largeMerchants)
      
      const bounds = { west: 126.8, east: 127.2, south: 37.3, north: 37.7 }
      
      // Simulate rapid zoom changes (60fps = ~16.67ms per frame)
      const frameTimes: number[] = []
      
      for (let zoom = 10; zoom <= 18; zoom++) {
        const start = performance.now()
        clusterManager.getClusters(bounds, zoom)
        const frameTime = performance.now() - start
        frameTimes.push(frameTime)
      }
      
      // Average frame time should be less than 16.67ms for 60fps
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      expect(avgFrameTime).toBeLessThan(16.67)
    })
  })

  describe('Memory Management', () => {
    it('should clean up resources on destroy', () => {
      clusterManager.load(mockMerchants)
      expect(clusterManager.getMerchantCount()).toBe(3)
      
      clusterManager.destroy()
      expect(clusterManager.getMerchantCount()).toBe(0)
      
      // Should be able to load new data after destroy
      clusterManager.load(mockMerchants.slice(0, 1))
      expect(clusterManager.getMerchantCount()).toBe(1)
    })

    it('should update options dynamically', () => {
      clusterManager.load(mockMerchants)
      
      const initialOptions = clusterManager.getOptions()
      expect(initialOptions.radius).toBe(40)
      
      clusterManager.updateOptions({ radius: 60 })
      
      const updatedOptions = clusterManager.getOptions()
      expect(updatedOptions.radius).toBe(60)
      
      // Should re-cluster with new options
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      const clusters = clusterManager.getClusters(bounds, 12)
      expect(clusters).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle merchants at exact same location', () => {
      const sameLoc: Merchant[] = [
        { ...mockMerchants[0], id: 101, location: { lat: 37.5665, lng: 126.9780 } },
        { ...mockMerchants[0], id: 102, location: { lat: 37.5665, lng: 126.9780 } },
        { ...mockMerchants[0], id: 103, location: { lat: 37.5665, lng: 126.9780 } }
      ]
      
      clusterManager.load(sameLoc)
      
      const bounds = { west: 126.9, east: 127.1, south: 37.5, north: 37.6 }
      const clusters = clusterManager.getClusters(bounds, 18) // Max zoom
      
      // Should still cluster points at same location
      expect(clusters.length).toBe(1)
      const cluster = clusters[0]
      
      if (cluster.properties?.cluster) {
        expect(cluster.properties.point_count).toBe(3)
      }
    })

    it('should handle bounds crossing date line', () => {
      const crossDateLine = { west: 170, east: -170, south: -10, north: 10 }
      
      // Should not throw error
      expect(() => {
        clusterManager.getClusters(crossDateLine, 10)
      }).not.toThrow()
    })

    it('should handle invalid zoom levels', () => {
      const bounds = { west: 126.9, east: 127.1, south: 37.4, north: 37.6 }
      
      // Negative zoom
      const negativeZoom = clusterManager.getClusters(bounds, -1)
      expect(negativeZoom).toBeDefined()
      
      // Very high zoom
      const highZoom = clusterManager.getClusters(bounds, 25)
      expect(highZoom).toBeDefined()
    })
  })
})