import Supercluster from 'supercluster'
import type { Merchant } from '@/types'

export interface ClusterManagerOptions {
  radius?: number       // Cluster radius in pixels (default: 40)
  maxZoom?: number      // Max zoom to cluster (default: 16)
  minPoints?: number    // Min points to form cluster (default: 2)
  nodeSize?: number     // Size of KD-tree leaf node (default: 64)
}

export interface ClusterStyle {
  category: 'small' | 'medium' | 'large'
  size: number
  fontSize: number
  backgroundColor: string
  borderColor: string
  textColor: string
}

export interface ClusterBounds {
  west: number
  east: number
  south: number
  north: number
}

// GeoJSON types for supercluster
export type PointFeature = GeoJSON.Feature<GeoJSON.Point, {
  merchant: Merchant
  cluster?: boolean
  cluster_id?: number
  point_count?: number
  point_count_abbreviated?: string
}>

export type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
}>

export type Feature = PointFeature | ClusterFeature

export class ClusterManager {
  private supercluster: Supercluster<{
    merchant: Merchant
  }, {
    cluster?: boolean
    cluster_id?: number
    point_count?: number
    point_count_abbreviated?: string
    merchant?: Merchant
  }>
  
  private merchants: Merchant[] = []
  private options: Required<ClusterManagerOptions>
  private activeFilter: string[] | null = null
  private features: PointFeature[] = []

  constructor(options: ClusterManagerOptions = {}) {
    this.options = {
      radius: options.radius ?? 40,
      maxZoom: options.maxZoom ?? 16,
      minPoints: options.minPoints ?? 2,
      nodeSize: options.nodeSize ?? 64
    }

    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minPoints: this.options.minPoints,
      nodeSize: this.options.nodeSize,
      map: (props) => ({ merchant: props.merchant }),
      reduce: (accumulated, props) => {
        // Can aggregate properties here if needed
      }
    })
  }

  /**
   * Load merchants into the cluster manager
   */
  load(merchants: Merchant[]): void {
    // Filter out invalid merchants
    this.merchants = merchants.filter(merchant => 
      this.isValidMerchant(merchant)
    )

    // Convert to GeoJSON features
    this.features = this.merchants.map(merchant => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [merchant.location.lng, merchant.location.lat]
      },
      properties: {
        merchant
      }
    }))

    // Apply filter if active
    const featuresToLoad = this.activeFilter 
      ? this.features.filter(f => this.matchesFilter(f.properties.merchant))
      : this.features

    // Load into supercluster
    this.supercluster.load(featuresToLoad)
  }

  /**
   * Get clusters for given bounds and zoom
   */
  getClusters(bounds: ClusterBounds, zoom: number): Feature[] {
    // Normalize zoom to valid range
    const normalizedZoom = Math.max(0, Math.min(25, zoom))
    
    // Handle date line crossing
    const bbox: [number, number, number, number] = [
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north
    ]

    try {
      return this.supercluster.getClusters(bbox, Math.floor(normalizedZoom))
    } catch (error) {
      console.warn('Error getting clusters:', error)
      return []
    }
  }

  /**
   * Get cluster style based on point count
   */
  getClusterStyle(count: number): ClusterStyle {
    let category: 'small' | 'medium' | 'large'
    let size: number
    let fontSize: number
    let backgroundColor: string
    let borderColor: string

    if (count <= 10) {
      category = 'small'
      size = 40
      fontSize = 14
      backgroundColor = '#51D88A'
      borderColor = '#47C27D'
    } else if (count <= 50) {
      category = 'medium'
      size = 50
      fontSize = 16
      backgroundColor = '#FFA500'
      borderColor = '#FF8C00'
    } else {
      category = 'large'
      size = 60
      fontSize = 18
      backgroundColor = '#FF6B6B'
      borderColor = '#FF5252'
    }

    return {
      category,
      size,
      fontSize,
      backgroundColor,
      borderColor,
      textColor: '#FFFFFF'
    }
  }

  /**
   * Get zoom level to expand a cluster
   */
  getClusterExpansionZoom(clusterId: number): number {
    try {
      return Math.min(
        this.supercluster.getClusterExpansionZoom(clusterId),
        this.options.maxZoom
      )
    } catch (error) {
      console.warn('Error getting expansion zoom:', error)
      return this.options.maxZoom
    }
  }

  /**
   * Get children of a cluster
   */
  getClusterChildren(clusterId: number): Feature[] {
    try {
      return this.supercluster.getChildren(clusterId)
    } catch (error) {
      console.warn('Error getting cluster children:', error)
      return []
    }
  }

  /**
   * Get all leaves (original points) in a cluster
   */
  getClusterLeaves(clusterId: number, limit: number = 100): PointFeature[] {
    try {
      return this.supercluster.getLeaves(clusterId, limit) as PointFeature[]
    } catch (error) {
      console.warn('Error getting cluster leaves:', error)
      return []
    }
  }

  /**
   * Set card type filter
   */
  setFilter(cardTypes: string[]): void {
    this.activeFilter = cardTypes
    this.reload()
  }

  /**
   * Clear filter
   */
  clearFilter(): void {
    this.activeFilter = null
    this.reload()
  }

  /**
   * Update clustering options
   */
  updateOptions(options: Partial<ClusterManagerOptions>): void {
    this.options = {
      ...this.options,
      ...options
    }

    // Recreate supercluster with new options
    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minPoints: this.options.minPoints,
      nodeSize: this.options.nodeSize,
      map: (props) => ({ merchant: props.merchant }),
      reduce: (accumulated, props) => {}
    })

    this.reload()
  }

  /**
   * Get current options
   */
  getOptions(): Required<ClusterManagerOptions> {
    return { ...this.options }
  }

  /**
   * Get merchant count
   */
  getMerchantCount(): number {
    return this.merchants.length
  }

  /**
   * Get cluster feature for a specific location
   */
  getClusterForLocation(lat: number, lng: number, zoom: number): Feature | null {
    const buffer = 0.001 // Small buffer around point
    const bounds = {
      west: lng - buffer,
      east: lng + buffer,
      south: lat - buffer,
      north: lat + buffer
    }

    const clusters = this.getClusters(bounds, zoom)
    
    // Find closest cluster/point
    let closest: Feature | null = null
    let minDistance = Infinity

    clusters.forEach(cluster => {
      const [clusterLng, clusterLat] = cluster.geometry.coordinates
      const distance = Math.sqrt(
        Math.pow(clusterLng - lng, 2) + Math.pow(clusterLat - lat, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closest = cluster
      }
    })

    return closest
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.merchants = []
    this.features = []
    this.activeFilter = null
    // Supercluster doesn't have a destroy method, just clear the data
    this.supercluster.load([])
  }

  /**
   * Private helper methods
   */
  
  private isValidMerchant(merchant: Merchant): boolean {
    return !!(
      merchant &&
      merchant.location &&
      typeof merchant.location.lat === 'number' &&
      typeof merchant.location.lng === 'number' &&
      !isNaN(merchant.location.lat) &&
      !isNaN(merchant.location.lng) &&
      isFinite(merchant.location.lat) &&
      isFinite(merchant.location.lng) &&
      merchant.location.lat >= -90 &&
      merchant.location.lat <= 90 &&
      merchant.location.lng >= -180 &&
      merchant.location.lng <= 180
    )
  }

  private matchesFilter(merchant: Merchant): boolean {
    if (!this.activeFilter || this.activeFilter.length === 0) {
      return true
    }

    return merchant.cards.some(card => 
      this.activeFilter!.includes(card.code)
    )
  }

  private reload(): void {
    if (this.merchants.length > 0) {
      this.load(this.merchants)
    }
  }
}