'use client'

import React, { useEffect, useRef } from 'react'
import { useNaverMapScript } from '@/hooks/useNaverMapScript'
import { useMapContext } from '@/contexts/MapContext'
import { useMarkers } from '@/hooks/useMarkers'
import { MapSkeleton } from './MapSkeleton'
import type { Merchant } from '@/types/merchant'

interface MapContainerProps {
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  merchants?: Merchant[]
  onMarkerClick?: (merchant: Merchant) => void
  enableClustering?: boolean
  activeCardTypes?: string[]
}

const MapContainer: React.FC<MapContainerProps> = ({
  center = { lat: 37.5666805, lng: 126.9784147 }, // Seoul City Hall
  zoom = 15,
  className = '',
  merchants = [],
  onMarkerClick,
  enableClustering = true,
  activeCardTypes,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const { isLoading, isError, isLoaded } = useNaverMapScript()
  const { map, setMap } = useMapContext()
  
  // Use markers hook
  const {
    addMerchants,
    filterByCardType,
    clearFilter,
    setOnMarkerClick,
  } = useMarkers(map, {
    enableClustering,
    onMarkerClick,
  })

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    // Initialize map
    const mapOptions: naver.maps.MapOptions = {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.ControlPosition.TOP_RIGHT,
      },
      mapTypeControl: true,
      scaleControl: true,
      logoControl: true,
      mapDataControl: true,
    }

    const newMap = new naver.maps.Map(mapRef.current, mapOptions)
    setMap(newMap)

    // Cleanup
    return () => {
      newMap.destroy()
      setMap(null)
    }
  }, [isLoaded, center.lat, center.lng, zoom, setMap])

  // Add merchants when they change
  useEffect(() => {
    if (!map || merchants.length === 0) return
    
    addMerchants(merchants)
  }, [map, merchants, addMerchants])

  // Handle card type filtering
  useEffect(() => {
    if (!map) return
    
    if (activeCardTypes && activeCardTypes.length > 0) {
      filterByCardType(activeCardTypes)
    } else {
      clearFilter()
    }
  }, [map, activeCardTypes, filterByCardType, clearFilter])

  // Update marker click handler
  useEffect(() => {
    if (onMarkerClick) {
      setOnMarkerClick(onMarkerClick)
    }
  }, [onMarkerClick, setOnMarkerClick])

  if (isLoading) {
    return <MapSkeleton />
  }

  if (isError) {
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
    <div
      ref={mapRef}
      data-testid="map-container"
      className={`w-full h-full ${className}`}
    />
  )
}

export default MapContainer