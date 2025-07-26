import { useEffect, useState, useRef, useCallback } from 'react'
import { MarkerManager } from '@/services/MarkerManager'
import type { Merchant } from '@/types/merchant'

interface UseMarkersOptions {
  enableClustering?: boolean
  onMarkerClick?: (merchant: Merchant) => void
}

export function useMarkers(
  map: naver.maps.Map | null,
  options: UseMarkersOptions = {}
) {
  const [markerManager, setMarkerManager] = useState<MarkerManager | null>(null)
  const [isClusteringEnabled, setIsClusteringEnabled] = useState(options.enableClustering ?? true)
  const zoomListenerRef = useRef<naver.maps.MapEventListener | null>(null)
  const markerClickHandlerRef = useRef<((e: Event) => void) | null>(null)

  // Initialize MarkerManager
  useEffect(() => {
    if (!map) return

    const manager = new MarkerManager(map)
    setMarkerManager(manager)

    // Enable clustering only if explicitly enabled
    if (options.enableClustering === true) {
      // TODO: Load MarkerClustering script first
      // manager.enableClustering()
    }

    return () => {
      manager.destroy()
      setMarkerManager(null)
    }
  }, [map, options.enableClustering])

  // Handle clustering toggle
  useEffect(() => {
    if (!markerManager) return

    if (isClusteringEnabled) {
      // TODO: Load MarkerClustering script first
      // markerManager.enableClustering()
    } else {
      markerManager.disableClustering()
    }
  }, [markerManager, isClusteringEnabled])

  // Handle zoom changes for marker sizing
  useEffect(() => {
    if (!map || !markerManager) return

    const handleZoomChange = () => {
      const zoom = map.getZoom()
      markerManager.updateMarkerSize(zoom)
    }

    zoomListenerRef.current = naver.maps.Event.addListener(
      map,
      'zoom_changed',
      handleZoomChange
    )

    return () => {
      if (zoomListenerRef.current) {
        naver.maps.Event.removeListener(zoomListenerRef.current)
      }
    }
  }, [map, markerManager])

  // Handle marker click events
  useEffect(() => {
    const handleMarkerClick = (event: Event) => {
      if (event instanceof CustomEvent && options.onMarkerClick) {
        options.onMarkerClick(event.detail.merchant)
      }
    }

    markerClickHandlerRef.current = handleMarkerClick
    window.addEventListener('markerClick', handleMarkerClick)

    return () => {
      window.removeEventListener('markerClick', handleMarkerClick)
    }
  }, [options.onMarkerClick])

  // API methods
  const addMerchants = useCallback((merchants: Merchant[]) => {
    if (!markerManager) return
    markerManager.addMerchants(merchants)
  }, [markerManager])

  const removeMarker = useCallback((merchantId: number) => {
    if (!markerManager) return
    markerManager.removeMarker(merchantId)
  }, [markerManager])

  const clearMarkers = useCallback(() => {
    if (!markerManager) return
    markerManager.clearMarkers()
  }, [markerManager])

  const filterByCardType = useCallback((cardTypes: string[]) => {
    if (!markerManager) return
    markerManager.filterByCardType(cardTypes)
  }, [markerManager])

  const clearFilter = useCallback(() => {
    if (!markerManager) return
    markerManager.clearFilter()
  }, [markerManager])

  const setClusteringEnabled = useCallback((enabled: boolean) => {
    setIsClusteringEnabled(enabled)
  }, [])

  const setOnMarkerClick = useCallback((handler: (merchant: Merchant) => void) => {
    // Remove old listener
    if (markerClickHandlerRef.current) {
      window.removeEventListener('markerClick', markerClickHandlerRef.current)
    }

    // Add new listener
    const handleMarkerClick = (event: Event) => {
      if (event instanceof CustomEvent) {
        handler(event.detail.merchant)
      }
    }

    markerClickHandlerRef.current = handleMarkerClick
    window.addEventListener('markerClick', handleMarkerClick)
  }, [])

  return {
    markerManager,
    addMerchants,
    removeMarker,
    clearMarkers,
    filterByCardType,
    clearFilter,
    isClusteringEnabled,
    setClusteringEnabled,
    setOnMarkerClick,
  }
}