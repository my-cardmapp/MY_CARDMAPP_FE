'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { MapSkeleton } from './MapSkeleton'
import MapControls from './MapControls'
import { ViewportMarkerRenderer } from '@/services/ViewportMarkerRenderer'
import { useMapBounds } from '@/hooks/useMapBounds'
import type { Merchant } from '@/types'

interface ViewportMapContainerProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  merchants?: Merchant[]
  activeCardTypes?: string[]
  onMarkerClick?: (merchant: Merchant) => void
  onMapReady?: (map: naver.maps.Map) => void
}

const ViewportMapContainer: React.FC<ViewportMapContainerProps> = React.memo(({
  center = { lat: 37.5666805, lng: 126.9784147 },
  zoom = 15,
  className = '',
  merchants = [],
  activeCardTypes = [],
  onMarkerClick,
  onMapReady,
}) => {
  console.log('ViewportMapContainer rendered with merchants:', merchants.length)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const { map, setMap, isScriptLoaded, isScriptError } = useMapContext()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Viewport-based marker renderer
  const markerRendererRef = useRef<ViewportMarkerRenderer | null>(null)
  
  // Handle bounds changes for viewport-based rendering
  const handleBoundsChange = useCallback((bounds: any) => {
    if (!markerRendererRef.current) return
    
    setIsLoading(true)
    
    // Update viewport with debouncing
    markerRendererRef.current.updateViewport(bounds, 0.2) // 20% buffer zone
    
    setTimeout(() => setIsLoading(false), 200)
  }, [])

  const { bounds } = useMapBounds({
    map,
    debounceDelay: 300,
    onBoundsChange: handleBoundsChange,
  })

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || map) return

    console.log('ViewportMapContainer - Creating map...')
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
      naver.maps.Event.addListener(newMap, 'dragstart', () => {
        setIsDragging(true)
      })
    )
    
    eventListeners.add(
      naver.maps.Event.addListener(newMap, 'dragend', () => {
        setIsDragging(false)
      })
    )
    
    // Initialize viewport-based marker renderer
    markerRendererRef.current = new ViewportMarkerRenderer(newMap)
    
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
    
    // Set map in context after all setup is complete
    setMap(newMap)
    
    // Call onMapReady callback
    onMapReady?.(newMap)

    return () => {
      // Cleanup event listeners
      eventListeners.forEach(listener => {
        naver.maps.Event.removeListener(listener)
      })
      eventListeners.clear()
      
      // Cleanup marker renderer
      if (markerRendererRef.current) {
        markerRendererRef.current.destroy()
        markerRendererRef.current = null
      }
      
      if (newMap) {
        newMap.destroy()
      }
    }
  }, [isScriptLoaded]) // Remove dependencies that cause re-initialization

  // Update merchants in viewport renderer
  useEffect(() => {
    if (!markerRendererRef.current) return

    console.log('ViewportMapContainer - Updating merchants:', merchants.length)
    markerRendererRef.current.updateMerchants(merchants)
    
    // Update viewport if we have current bounds
    if (bounds) {
      markerRendererRef.current.updateViewport(bounds, 0.2)
    }
  }, [merchants, bounds])

  // Update card type filter
  useEffect(() => {
    if (!markerRendererRef.current) return

    if (activeCardTypes.length > 0) {
      markerRendererRef.current.filterByCardType(activeCardTypes)
    } else {
      markerRendererRef.current.clearFilter()
    }
  }, [activeCardTypes])

  // Handle marker click events
  useEffect(() => {
    const handleMarkerClick = (event: CustomEvent) => {
      const { merchant } = event.detail
      console.log('Viewport marker clicked:', merchant.name)
      onMarkerClick?.(merchant)
    }

    window.addEventListener('markerClick', handleMarkerClick as EventListener)
    
    return () => {
      window.removeEventListener('markerClick', handleMarkerClick as EventListener)
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

  const performanceMetrics = markerRendererRef.current?.getPerformanceMetrics()

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        data-testid="viewport-map-container"
        className={`w-full h-full ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">가맹점 정보를 업데이트 중...</span>
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
      
      {/* Performance info (for debugging) */}
      {performanceMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg text-xs max-w-xs">
          <div className="font-bold mb-1">Viewport Renderer Performance</div>
          <div>Total Markers: {markerRendererRef.current?.getTotalMarkerCount()}</div>
          <div>Visible: {markerRendererRef.current?.getVisibleMarkerCount()}</div>
          <div>Pool Size: {performanceMetrics.poolSize}</div>
          <div>In Use: {performanceMetrics.inUseCount}</div>
          <div>Last Update: {performanceMetrics.lastUpdateTime.toFixed(2)}ms</div>
        </div>
      )}
      
      {/* Bounds display (for debugging) */}
      {bounds && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg text-xs max-w-xs">
          <div className="font-bold mb-1">Current Viewport</div>
          <div>North: {bounds.north.toFixed(6)}</div>
          <div>South: {bounds.south.toFixed(6)}</div>
          <div>East: {bounds.east.toFixed(6)}</div>
          <div>West: {bounds.west.toFixed(6)}</div>
        </div>
      )}
    </div>
  )
})

ViewportMapContainer.displayName = 'ViewportMapContainer'

export default ViewportMapContainer