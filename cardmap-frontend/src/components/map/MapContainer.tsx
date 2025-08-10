'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { MapSkeleton } from './MapSkeleton'
import MapControls from './MapControls'
import { ViewportMarkerRenderer } from '@/services/ViewportMarkerRenderer'
import type { Merchant } from '@/types'

interface MapContainerProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  merchants?: Merchant[]
  activeCardTypes?: string[]
  onMarkerClick?: (merchant: Merchant) => void
  onMapReady?: (map: naver.maps.Map) => void
  enableClustering?: boolean
  clusterOptions?: {
    radius?: number
    maxZoom?: number
    minPoints?: number
  }
}

const MapContainer: React.FC<MapContainerProps> = React.memo(({
  center = { lat: 37.5666805, lng: 126.9784147 },
  zoom = 15,
  className = '',
  merchants = [],
  activeCardTypes = [],
  onMarkerClick,
  onMapReady,
  enableClustering = true,
  clusterOptions = {},
}) => {
  console.log('MapContainer rendered with merchants:', merchants.length)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const { map, setMap, isScriptLoaded, isScriptError } = useMapContext()
  const [isDragging, setIsDragging] = useState(false)
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const viewportRendererRef = useRef<ViewportMarkerRenderer | null>(null)

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return

    // Get current map instance and check if already initialized
    const currentMap = map
    if (currentMap) return

    console.log('MapContainer - Creating map...')
    const newMap = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_LEFT,
      },
      mapTypeControl: false,
      scaleControl: true,
      logoControl: true,
      mapDataControl: false,
    })
    
    // Store event listener references for cleanup
    const eventListeners = new Set<any>()
    
    // Map event listeners
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'click', (e: any) => {
        console.log('Map clicked at:', e.coord)
      })
    )
    
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'dragstart', () => {
        setIsDragging(true)
      })
    )
    
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'dragend', () => {
        setIsDragging(false)
      })
    )
    
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'zoom_changed', () => {
        console.log('Zoom changed:', newMap.getZoom())
      })
    )
    
    // Bounds changed with proper debouncing
    let boundsTimeout: NodeJS.Timeout | null = null
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'bounds_changed', () => {
        if (boundsTimeout) clearTimeout(boundsTimeout)
        boundsTimeout = setTimeout(() => {
          const bounds = (newMap as any).getBounds()
          if (bounds && newMap === map) { // Check if map is still current
            const boundsData = {
              north: bounds.getNE().lat(),
              south: bounds.getSW().lat(),
              east: bounds.getNE().lng(),
              west: bounds.getSW().lng(),
            }
            console.log('Bounds changed:', boundsData)
            setCurrentBounds(boundsData)
            
            // Save viewport to sessionStorage
            const center = newMap.getCenter()
            const zoom = newMap.getZoom()
            sessionStorage.setItem('mapViewport', JSON.stringify({
              center: { lat: center.lat(), lng: center.lng() },
              zoom
            }))
            
            // Simulate loading for demonstration
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 300)
          }
        }, 500)
      })
    )
    
    // Restore viewport from sessionStorage
    const savedViewport = sessionStorage.getItem('mapViewport')
    if (savedViewport) {
      try {
        const { center: savedCenter, zoom: savedZoom } = JSON.parse(savedViewport)
        newMap.setCenter(new naver.maps.LatLng(savedCenter.lat, savedCenter.lng))
        newMap.setZoom(savedZoom)
      } catch (error) {
        console.error('Failed to restore viewport:', error)
      }
    }
    
    // Initialize ViewportMarkerRenderer
    viewportRendererRef.current = new ViewportMarkerRenderer(newMap)
    
    // Enable clustering if requested
    if (enableClustering) {
      viewportRendererRef.current.enableClustering(clusterOptions)
    }
    
    // Set map in context after all setup is complete
    setMap(newMap)
    
    // Call onMapReady callback
    onMapReady?.(newMap)

    return () => {
      // Cleanup ViewportMarkerRenderer
      if (viewportRendererRef.current) {
        viewportRendererRef.current.destroy()
        viewportRendererRef.current = null
      }
      
      // Cleanup event listeners
      eventListeners.forEach(listener => {
        naver.maps.Event.removeListener(listener)
      })
      eventListeners.clear()
      
      if (boundsTimeout) {
        clearTimeout(boundsTimeout)
      }
      
      if (newMap) {
        newMap.destroy()
      }
    }
  }, [isScriptLoaded, enableClustering]) // Remove dependencies that cause re-initialization

  // Update merchants in ViewportMarkerRenderer
  useEffect(() => {
    console.log('MapContainer - Merchants:', merchants.length, 'Renderer:', !!viewportRendererRef.current, 'Active filters:', activeCardTypes)
    
    if (!viewportRendererRef.current) return

    // Update merchants in renderer
    viewportRendererRef.current.updateMerchants(merchants)
    
    // Apply card type filter
    if (activeCardTypes.length > 0) {
      viewportRendererRef.current.filterByCardType(activeCardTypes)
    } else {
      viewportRendererRef.current.clearFilter()
    }
  }, [merchants, activeCardTypes])

  // Handle marker click events
  useEffect(() => {
    if (!onMarkerClick) return

    const handleMarkerClick = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.merchant) {
        onMarkerClick(event.detail.merchant)
      }
    }

    // Listen for marker click events from ViewportMarkerRenderer
    window.addEventListener('markerClick', handleMarkerClick)

    return () => {
      window.removeEventListener('markerClick', handleMarkerClick)
    }
  }, [onMarkerClick])

  if (!isScriptLoaded && !isScriptError) {
    return <MapSkeleton />
  }

  if (isScriptError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            지도를 불러오는데 실패했습니다
          </h3>
          <p className="text-gray-600">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        data-testid="map-container"
        className={`w-full h-full ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">가맹점 정보를 불러오는 중...</span>
          </div>
        </div>
      )}
      
      {/* Dragging indicator */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
            <span className="text-sm">지도를 이동하는 중...</span>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      {map && <MapControls map={map} />}
      
      {/* Bounds display (for debugging) */}
      {currentBounds && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg text-xs max-w-xs">
          <div className="font-bold mb-1">Viewport Bounds</div>
          <div>North: {currentBounds.north.toFixed(6)}</div>
          <div>South: {currentBounds.south.toFixed(6)}</div>
          <div>East: {currentBounds.east.toFixed(6)}</div>
          <div>West: {currentBounds.west.toFixed(6)}</div>
        </div>
      )}
    </div>
  )
})

MapContainer.displayName = 'MapContainer'

export default MapContainer