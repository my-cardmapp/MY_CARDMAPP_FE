import type { Merchant } from '@/types'
import type { MapBounds } from '@/hooks/useMapBounds'
import { debounce } from '@/utils/debounce'
import { getCardStyle } from '@/constants/cardStyles'
import { ClusterManager, type Feature } from './ClusterManager'

interface MarkerData {
  merchant: Merchant
  marker: naver.maps.Marker | null
  isVisible: boolean
  isInBounds: boolean
}

interface SpatialNode {
  bounds: MapBounds
  merchants: Merchant[]
  children: SpatialNode[]
  isLeaf: boolean
}

interface MarkerPool {
  available: naver.maps.Marker[]
  inUse: Map<number, naver.maps.Marker>
}

export class ViewportMarkerRenderer {
  private map: naver.maps.Map
  private spatialIndex: SpatialNode | null = null
  private markerData: Map<number, MarkerData> = new Map()
  private markerPool: MarkerPool = { available: [], inUse: new Map() }
  private activeFilter: string[] | null = null
  private currentBounds: MapBounds | null = null
  private bufferRatio: number = 0.2
  private eventListeners: any[] = []
  private isClusteringEnabled: boolean = false
  private clusterManager: ClusterManager | null = null
  private clusterMarkers: Map<string, naver.maps.Marker> = new Map()
  
  // Performance tracking
  private lastUpdateTime: number = 0
  private frameRequestId: number | null = null
  
  // Constants
  private readonly MAX_MARKERS_PER_NODE = 50
  private readonly MAX_TREE_DEPTH = 8
  private readonly MARKER_POOL_SIZE = 500
  private readonly UPDATE_DEBOUNCE_DELAY = 16 // ~60fps

  constructor(map: naver.maps.Map) {
    this.map = map
    this.initializeViewportListener()
    this.initializeMarkerPool()
  }

  private initializeViewportListener(): void {
    if (!this.map) return

    const debouncedUpdate = debounce(() => {
      this.handleViewportChange()
    }, this.UPDATE_DEBOUNCE_DELAY)

    const listener = naver.maps.Event.addListener(this.map, 'bounds_changed', debouncedUpdate)
    this.eventListeners.push(listener)
  }

  private initializeMarkerPool(): void {
    // Pre-create marker pool for better performance
    for (let i = 0; i < this.MARKER_POOL_SIZE; i++) {
      try {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(37.5666805, 126.9784147),
          map: null, // Not added to map initially
          visible: false,
        })
        this.markerPool.available.push(marker)
      } catch (error) {
        console.warn('Failed to create marker for pool:', error)
        break // Stop creating if there are errors
      }
    }
  }

  private handleViewportChange(): void {
    if (!this.map) return

    try {
      const bounds = this.map.getBounds()
      if (!bounds) return

      const newBounds: MapBounds = {
        north: bounds.getNE().lat(),
        south: bounds.getSW().lat(),
        east: bounds.getNE().lng(),
        west: bounds.getSW().lng(),
      }

      // Only update if bounds actually changed
      if (this.currentBounds && this.boundsEqual(this.currentBounds, newBounds)) {
        return
      }

      this.currentBounds = newBounds
      this.updateViewport(newBounds, this.bufferRatio)
    } catch (error) {
      console.error('Error handling viewport change:', error)
    }
  }

  private boundsEqual(bounds1: MapBounds, bounds2: MapBounds, tolerance: number = 0.0001): boolean {
    return (
      Math.abs(bounds1.north - bounds2.north) < tolerance &&
      Math.abs(bounds1.south - bounds2.south) < tolerance &&
      Math.abs(bounds1.east - bounds2.east) < tolerance &&
      Math.abs(bounds1.west - bounds2.west) < tolerance
    )
  }

  updateMerchants(merchants: Merchant[]): void {
    // Clear existing data
    this.clearAllMarkers()
    this.markerData.clear()

    // Filter valid merchants
    const validMerchants = merchants.filter(merchant => 
      merchant && 
      merchant.location && 
      typeof merchant.location.lat === 'number' && 
      typeof merchant.location.lng === 'number' &&
      !isNaN(merchant.location.lat) && 
      !isNaN(merchant.location.lng) &&
      isFinite(merchant.location.lat) && 
      isFinite(merchant.location.lng)
    )

    // Initialize marker data
    validMerchants.forEach(merchant => {
      this.markerData.set(merchant.id, {
        merchant,
        marker: null,
        isVisible: false,
        isInBounds: false,
      })
    })

    // Update cluster manager if enabled
    if (this.isClusteringEnabled && this.clusterManager) {
      this.clusterManager.load(validMerchants)
      if (this.activeFilter) {
        this.clusterManager.setFilter(this.activeFilter)
      }
    }

    // Build spatial index for non-clustered mode
    this.buildSpatialIndex(validMerchants)

    // Update viewport if we have current bounds
    if (this.currentBounds) {
      this.updateViewport(this.currentBounds, this.bufferRatio)
    }
  }

  private buildSpatialIndex(merchants: Merchant[]): void {
    if (merchants.length === 0) {
      this.spatialIndex = null
      return
    }

    // Calculate overall bounds
    const bounds = this.calculateMerchantsBounds(merchants)
    
    // Create root node
    this.spatialIndex = {
      bounds,
      merchants: [],
      children: [],
      isLeaf: true,
    }

    // Insert all merchants
    merchants.forEach(merchant => {
      this.insertMerchantIntoIndex(merchant, this.spatialIndex!, 0)
    })
  }

  private calculateMerchantsBounds(merchants: Merchant[]): MapBounds {
    if (merchants.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 }
    }

    let north = -90, south = 90, east = -180, west = 180

    merchants.forEach(merchant => {
      const { lat, lng } = merchant.location
      if (lat > north) north = lat
      if (lat < south) south = lat
      if (lng > east) east = lng
      if (lng < west) west = lng
    })

    return { north, south, east, west }
  }

  private insertMerchantIntoIndex(merchant: Merchant, node: SpatialNode, depth: number): void {
    // Check if the point is within the node bounds  
    if (!this.isPointInBounds(merchant.location.lat, merchant.location.lng, node.bounds)) {
      return
    }

    if (node.isLeaf) {
      node.merchants.push(merchant)
      
      // Split node if it's too full and not at max depth
      if (node.merchants.length > this.MAX_MARKERS_PER_NODE && depth < this.MAX_TREE_DEPTH) {
        this.splitNode(node, depth)
      }
    } else {
      // Insert into appropriate child nodes
      node.children.forEach(child => {
        this.insertMerchantIntoIndex(merchant, child, depth + 1)
      })
    }
  }

  private splitNode(node: SpatialNode, depth: number): void {
    if (!node.isLeaf) return

    const bounds = node.bounds
    const midLat = (bounds.north + bounds.south) / 2
    const midLng = (bounds.east + bounds.west) / 2

    // Create 4 quadrants
    const quadrants: MapBounds[] = [
      { north: bounds.north, south: midLat, east: bounds.east, west: midLng }, // NE
      { north: bounds.north, south: midLat, east: midLng, west: bounds.west }, // NW
      { north: midLat, south: bounds.south, east: bounds.east, west: midLng }, // SE
      { north: midLat, south: bounds.south, east: midLng, west: bounds.west }, // SW
    ]

    node.children = quadrants.map(quadBounds => ({
      bounds: quadBounds,
      merchants: [],
      children: [],
      isLeaf: true,
    }))

    // Redistribute merchants to children
    const merchants = [...node.merchants]
    node.merchants = []
    node.isLeaf = false

    merchants.forEach(merchant => {
      node.children.forEach(child => {
        this.insertMerchantIntoIndex(merchant, child, depth + 1)
      })
    })
  }

  updateViewport(bounds: MapBounds, bufferRatio: number = 0.2): void {
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId)
    }

    this.frameRequestId = requestAnimationFrame(() => {
      this.performViewportUpdate(bounds, bufferRatio)
    })
  }

  private performViewportUpdate(bounds: MapBounds, bufferRatio: number): void {
    const startTime = performance.now()
    
    if (this.isClusteringEnabled && this.clusterManager) {
      // Use ClusterManager for clustering
      this.updateClusters(bounds)
    } else {
      // Original viewport-based rendering
      const extendedBounds = this.getExtendedBounds(bounds, bufferRatio)
      const visibleMerchants = this.getMerchantsInBounds(extendedBounds)

      // Update marker visibility
      this.markerData.forEach((data, merchantId) => {
        const shouldBeVisible = visibleMerchants.some(m => m.id === merchantId) && 
                                 this.shouldShowMarker(data.merchant)
        
        if (shouldBeVisible && !data.isVisible) {
          this.showMarker(data)
        } else if (!shouldBeVisible && data.isVisible) {
          this.hideMarker(data)
        }
        
        // Update bounds tracking
        data.isInBounds = visibleMerchants.some(m => m.id === merchantId)
      })
    }

    this.lastUpdateTime = performance.now() - startTime
  }

  private updateClusters(bounds: MapBounds): void {
    if (!this.clusterManager || !this.map) return

    // Get current zoom level
    const zoom = this.map.getZoom()

    // Get clusters for current viewport
    const clusters = this.clusterManager.getClusters(
      { 
        west: bounds.west, 
        east: bounds.east, 
        south: bounds.south, 
        north: bounds.north 
      },
      zoom
    )

    // Track which markers should be visible
    const visibleClusterIds = new Set<string>()
    const visibleMerchantIds = new Set<number>()

    clusters.forEach(cluster => {
      if (cluster.properties?.cluster) {
        // It's a cluster
        const clusterId = `cluster-${cluster.properties.cluster_id}`
        visibleClusterIds.add(clusterId)
        this.showClusterMarker(cluster)
      } else if (cluster.properties?.merchant) {
        // It's an individual merchant
        const merchant = cluster.properties.merchant
        visibleMerchantIds.add(merchant.id)
        const data = this.markerData.get(merchant.id)
        if (data) {
          data.isInBounds = true
          if (!data.isVisible) {
            this.showMarker(data)
          }
        }
      }
    })

    // Hide markers that shouldn't be visible
    this.markerData.forEach((data, merchantId) => {
      if (!visibleMerchantIds.has(merchantId) && data.isVisible) {
        this.hideMarker(data)
        data.isInBounds = false
      }
    })

    // Hide cluster markers that shouldn't be visible
    this.clusterMarkers.forEach((marker, clusterId) => {
      if (!visibleClusterIds.has(clusterId)) {
        marker.setMap(null)
        this.clusterMarkers.delete(clusterId)
      }
    })
  }

  private showClusterMarker(cluster: Feature): void {
    if (!cluster.properties?.cluster || !this.map) return

    const clusterId = `cluster-${cluster.properties.cluster_id}`
    const [lng, lat] = cluster.geometry.coordinates
    const count = cluster.properties.point_count || 0

    // Get or create cluster marker
    let marker = this.clusterMarkers.get(clusterId)
    
    if (!marker) {
      // Get cluster style
      const style = this.clusterManager!.getClusterStyle(count)

      // Create new cluster marker
      marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: this.map,
        icon: {
          content: `
            <div style="
              width: ${style.size}px;
              height: ${style.size}px;
              background-color: ${style.backgroundColor};
              border: 2px solid ${style.borderColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${style.textColor};
              font-size: ${style.fontSize}px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              transition: transform 0.2s;
            " 
            onmouseover="this.style.transform='scale(1.1)'"
            onmouseout="this.style.transform='scale(1)'"
            aria-label="Cluster with ${count} merchants">
              ${cluster.properties.point_count_abbreviated || count}
            </div>
          `,
          size: new naver.maps.Size(style.size, style.size),
          anchor: new naver.maps.Point(style.size / 2, style.size / 2)
        } as naver.maps.HtmlIcon,
        zIndex: 100 + count, // Higher z-index for larger clusters
        clickable: true
      })

      // Add click handler for cluster expansion
      naver.maps.Event.addListener(marker, 'click', () => {
        this.handleClusterClick(cluster)
      })

      this.clusterMarkers.set(clusterId, marker)
    } else {
      // Update position if needed
      marker.setPosition(new naver.maps.LatLng(lat, lng))
      marker.setMap(this.map)
    }
  }

  private handleClusterClick(cluster: Feature): void {
    if (!cluster.properties?.cluster_id || !this.clusterManager || !this.map) return

    // Get expansion zoom level
    const expansionZoom = this.clusterManager.getClusterExpansionZoom(
      cluster.properties.cluster_id
    )

    // Get cluster center
    const [lng, lat] = cluster.geometry.coordinates

    // Zoom to expand cluster
    this.map.morph(
      new naver.maps.LatLng(lat, lng),
      expansionZoom,
      { duration: 300, easing: 'easeOutCubic' }
    )
  }

  private showMarker(data: MarkerData): void {
    if (data.isVisible) return

    try {
      // Get or create marker
      if (!data.marker) {
        data.marker = this.getMarkerFromPool(data.merchant)
        
        // Add click handler
        if (data.marker) {
          naver.maps.Event.addListener(data.marker, 'click', () => {
            // Emit custom event for marker click
            const event = new CustomEvent('markerClick', {
              detail: { merchant: data.merchant }
            })
            window.dispatchEvent(event)
          })
        }
      }

      if (data.marker && this.map) {
        data.marker.setMap(this.map)
        data.marker.setVisible(true)
        data.isVisible = true
      }
    } catch (error) {
      console.error('Error showing marker:', error)
    }
  }

  private hideMarker(data: MarkerData): void {
    if (!data.isVisible || !data.marker) return

    try {
      data.marker.setMap(null)
      data.marker.setVisible(false)
      data.isVisible = false
      
      // Return marker to pool
      this.returnMarkerToPool(data.marker, data.merchant.id)
      data.marker = null
    } catch (error) {
      console.error('Error hiding marker:', error)
    }
  }

  private getMarkerFromPool(merchant: Merchant): naver.maps.Marker {
    let marker = this.markerPool.available.pop()
    
    if (!marker) {
      // Create new marker if pool is empty
      marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(merchant.location.lat, merchant.location.lng),
        map: null,
        visible: false,
      })
    } else {
      // Update position for reused marker
      marker.setPosition(new naver.maps.LatLng(merchant.location.lat, merchant.location.lng))
    }

    // Update marker appearance
    this.updateMarkerAppearance(marker, merchant)
    this.markerPool.inUse.set(merchant.id, marker)
    
    return marker
  }

  private returnMarkerToPool(marker: naver.maps.Marker, merchantId: number): void {
    this.markerPool.inUse.delete(merchantId)
    
    if (this.markerPool.available.length < this.MARKER_POOL_SIZE) {
      this.markerPool.available.push(marker)
    } else {
      // Pool is full, destroy marker
      try {
        marker.setMap(null)
      } catch (error) {
        console.warn('Error destroying marker:', error)
      }
    }
  }

  private updateMarkerAppearance(marker: naver.maps.Marker, merchant: Merchant): void {
    const cardCode = merchant.cards[0]?.code || 'DEFAULT'
    const cardStyle = getCardStyle(cardCode)
    
    try {
      marker.setIcon({
        content: cardStyle.markerIcon.content.replace(
          /aria-label="[^"]*"/,
          `aria-label="가맹점: ${merchant.name}"`
        ).replace(
          /data-merchant-id="[^"]*"/,
          `data-merchant-id="${merchant.id}"`
        ),
        size: new naver.maps.Size(
          cardStyle.markerIcon.size.width,
          cardStyle.markerIcon.size.height
        ),
        anchor: new naver.maps.Point(
          cardStyle.markerIcon.anchor.x,
          cardStyle.markerIcon.anchor.y
        ),
      } as naver.maps.HtmlIcon)

      marker.setTitle(merchant.name)
    } catch (error) {
      console.error('Error updating marker appearance:', error)
    }
  }

  getMerchantsInBounds(bounds: MapBounds): Merchant[] {
    if (!this.spatialIndex) return []
    
    const result: Merchant[] = []
    this.queryIndex(this.spatialIndex, bounds, result)
    return result
  }

  private queryIndex(node: SpatialNode, bounds: MapBounds, result: Merchant[]): void {
    // Check if node bounds intersect with query bounds
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return
    }

    if (node.isLeaf) {
      // Add merchants that are within bounds
      node.merchants.forEach(merchant => {
        if (this.isPointInBounds(merchant.location.lat, merchant.location.lng, bounds)) {
          result.push(merchant)
        }
      })
    } else {
      // Recursively query children
      node.children.forEach(child => {
        this.queryIndex(child, bounds, result)
      })
    }
  }

  private boundsIntersect(bounds1: MapBounds, bounds2: MapBounds): boolean {
    return !(
      bounds1.east < bounds2.west ||
      bounds1.west > bounds2.east ||
      bounds1.north < bounds2.south ||
      bounds1.south > bounds2.north
    )
  }

  private isPointInBounds(lat: number, lng: number, bounds: MapBounds): boolean {
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    )
  }

  getExtendedBounds(bounds: MapBounds, extensionRatio: number): MapBounds {
    const latExtension = (bounds.north - bounds.south) * extensionRatio
    const lngExtension = (bounds.east - bounds.west) * extensionRatio

    return {
      north: bounds.north + latExtension,
      south: bounds.south - latExtension,
      east: bounds.east + lngExtension,
      west: bounds.west - lngExtension,
    }
  }

  private shouldShowMarker(merchant: Merchant): boolean {
    if (!this.activeFilter || this.activeFilter.length === 0) {
      return true
    }

    return merchant.cards.some(card => this.activeFilter!.includes(card.code))
  }

  filterByCardType(cardTypes: string[]): void {
    this.activeFilter = cardTypes
    
    // Update cluster manager filter if enabled
    if (this.isClusteringEnabled && this.clusterManager) {
      this.clusterManager.setFilter(cardTypes)
    }
    
    // Update visibility for all current markers
    if (this.currentBounds) {
      this.updateViewport(this.currentBounds, this.bufferRatio)
    }
  }

  clearFilter(): void {
    this.activeFilter = null
    
    // Clear cluster manager filter if enabled
    if (this.isClusteringEnabled && this.clusterManager) {
      this.clusterManager.clearFilter()
    }
    
    if (this.currentBounds) {
      this.updateViewport(this.currentBounds, this.bufferRatio)
    }
  }

  enableClustering(options?: { radius?: number; maxZoom?: number; minPoints?: number }): void {
    if (this.isClusteringEnabled || !this.map) return

    try {
      // Initialize ClusterManager with options
      this.clusterManager = new ClusterManager({
        radius: options?.radius ?? 40,
        maxZoom: options?.maxZoom ?? 16,
        minPoints: options?.minPoints ?? 2
      })

      // Load current merchants into cluster manager
      const merchants = Array.from(this.markerData.values()).map(data => data.merchant)
      this.clusterManager.load(merchants)

      // Apply current filter if any
      if (this.activeFilter) {
        this.clusterManager.setFilter(this.activeFilter)
      }

      this.isClusteringEnabled = true

      // Update viewport to show clusters
      if (this.currentBounds) {
        this.updateViewport(this.currentBounds, this.bufferRatio)
      }
    } catch (error) {
      console.error('Error enabling clustering:', error)
    }
  }

  disableClustering(): void {
    if (!this.isClusteringEnabled || !this.clusterManager) return

    try {
      // Clear cluster markers
      this.clusterMarkers.forEach(marker => {
        marker.setMap(null)
      })
      this.clusterMarkers.clear()

      // Destroy cluster manager
      this.clusterManager.destroy()
      this.clusterManager = null
      this.isClusteringEnabled = false

      // Show individual markers
      if (this.currentBounds) {
        this.updateViewport(this.currentBounds, this.bufferRatio)
      }
    } catch (error) {
      console.error('Error disabling clustering:', error)
    }
  }

  private clearAllMarkers(): void {
    this.markerData.forEach(data => {
      if (data.marker) {
        this.hideMarker(data)
      }
    })
  }

  // Public getters for testing and debugging
  getTotalMarkerCount(): number {
    return this.markerData.size
  }

  getVisibleMarkerCount(): number {
    return Array.from(this.markerData.values()).filter(data => data.isVisible).length
  }

  getClusteringStatus(): boolean {
    return this.isClusteringEnabled
  }

  getPerformanceMetrics(): { lastUpdateTime: number; poolSize: number; inUseCount: number } {
    return {
      lastUpdateTime: this.lastUpdateTime,
      poolSize: this.markerPool.available.length,
      inUseCount: this.markerPool.inUse.size,
    }
  }

  destroy(): void {
    // Cancel any pending updates
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId)
    }

    // Clear all markers
    this.clearAllMarkers()

    // Remove event listeners
    this.eventListeners.forEach(listener => {
      try {
        naver.maps.Event.removeListener(listener)
      } catch (error) {
        console.warn('Error removing event listener:', error)
      }
    })
    this.eventListeners = []

    // Disable clustering
    this.disableClustering()

    // Clear cluster markers
    this.clusterMarkers.forEach(marker => {
      try {
        marker.setMap(null)
      } catch (error) {
        console.warn('Error cleaning up cluster marker:', error)
      }
    })
    this.clusterMarkers.clear()

    // Clear marker pool
    const allMarkers = this.markerPool.available.concat(Array.from(this.markerPool.inUse.values()))
    allMarkers.forEach(marker => {
      try {
        marker.setMap(null)
      } catch (error) {
        console.warn('Error cleaning up marker:', error)
      }
    })

    // Clear all data
    this.markerData.clear()
    this.markerPool.available = []
    this.markerPool.inUse.clear()
    this.spatialIndex = null
  }
}