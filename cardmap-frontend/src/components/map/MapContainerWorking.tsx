'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMapContext } from '@/contexts/MapContext'
import { MapSkeleton } from './MapSkeleton'
import MapControls from './MapControls'
import type { Merchant } from '@/types'

interface MapContainerWorkingProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  merchants?: Merchant[]
  onMarkerClick?: (merchant: Merchant) => void
  onMapReady?: (map: naver.maps.Map) => void
}

const MapContainerWorking: React.FC<MapContainerWorkingProps> = ({
  center = { lat: 37.5666805, lng: 126.9784147 },
  zoom = 15,
  className = '',
  merchants = [],
  onMarkerClick,
  onMapReady,
}) => {
  console.log('MapContainerWorking rendered with merchants:', merchants.length)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const { map, setMap, isScriptLoaded, isScriptError } = useMapContext()
  const [isDragging, setIsDragging] = useState(false)
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const markersRef = useRef<naver.maps.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current || map) return

    console.log('MapContainerWorking - Creating map...')
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
    
    setMap(newMap)
    
    // Map event listeners
    if (newMap) {
      // Click event
      naver.maps.Event.addListener(newMap, 'click', (e: any) => {
        console.log('Map clicked at:', e.coord)
      })
      
      // Drag events
      naver.maps.Event.addListener(newMap, 'dragstart', () => {
        setIsDragging(true)
      })
      
      naver.maps.Event.addListener(newMap, 'dragend', () => {
        setIsDragging(false)
      })
      
      // Zoom event
      naver.maps.Event.addListener(newMap, 'zoom_changed', () => {
        console.log('Zoom changed to:', newMap.getZoom())
      })
      
      // Bounds changed with debouncing
      let boundsTimeout: NodeJS.Timeout
      naver.maps.Event.addListener(newMap, 'bounds_changed', () => {
        clearTimeout(boundsTimeout)
        boundsTimeout = setTimeout(() => {
          const bounds = (newMap as any).getBounds()
          if (bounds) {
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
      
      // Call onMapReady callback
      onMapReady?.(newMap)
    }

    return () => {
      if (newMap) {
        newMap.destroy()
        setMap(null)
      }
    }
  }, [isScriptLoaded, center.lat, center.lng, zoom, setMap, onMapReady])

  // Add markers for merchants
  useEffect(() => {
    console.log('MapContainerWorking - Merchants:', merchants.length, 'Map:', !!map)
    if (!map || !merchants.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    console.log('Adding markers for', merchants.length, 'merchants')
    // Add new markers
    merchants.forEach(merchant => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(merchant.location.lat, merchant.location.lng),
        map: map,
        title: merchant.name,
        icon: {
          content: `
            <div style="
              background-color: ${merchant.cards[0]?.colorHex || '#FF0000'}; 
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 14px;
            ">
              ${merchant.cards[0]?.name.charAt(0) || '가'}
            </div>
          `,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16)
        }
      })

      // Add click event
      const listener = naver.maps.Event.addListener(marker, 'click', () => {
        console.log('Marker clicked:', merchant.name)
        onMarkerClick?.(merchant)
      })
      console.log('Click listener added for:', merchant.name, 'listener:', listener)

      markersRef.current.push(marker)
    })
  }, [map, merchants, onMarkerClick])

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
}

export default MapContainerWorking