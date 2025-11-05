/**
 * Optimized selectors for Map Store
 * Using shallow equality and memoization for performance
 */

import { useMapStore } from '../mapStore'
import type { MapStore } from '../types'
import { 
  shallow, 
  createShallowSelector,
  createMemoizedComputation 
} from '../utils/performance'

// Viewport selectors with shallow equality
export const useMapViewportOptimized = () => {
  return useMapStore(
    createShallowSelector<MapStore, 'viewport'>(['viewport']),
    shallow
  )
}

// Combined loading state selector
export const useMapLoadingStateOptimized = () => {
  return useMapStore(
    (state) => ({
      isScriptLoaded: state.isScriptLoaded,
      isScriptLoading: state.isScriptLoading,
      scriptError: state.scriptError,
      isMapReady: state.isMapReady,
      isResizing: state.isResizing
    }),
    shallow
  )
}

// Controls selector with shallow equality
export const useMapControlsOptimized = () => {
  return useMapStore(
    createShallowSelector<MapStore, 'controls'>(['controls']),
    shallow
  )
}

// Memoized visible markers selector
const getVisibleMarkersSelector = createMemoizedComputation<MapStore, Array<any>>(
  (state) => {
    const visibleMarkers = []
    for (const [id, marker] of state.markers) {
      if (state.visibleMarkerIds.has(id)) {
        visibleMarkers.push(marker)
      }
    }
    return visibleMarkers
  },
  ['markers', 'visibleMarkerIds']
)

export const useVisibleMarkers = () => {
  return useMapStore(getVisibleMarkersSelector)
}

// Memoized marker count selectors
const getMarkerStatsSelector = createMemoizedComputation<MapStore, { total: number; visible: number; clustered: number }>(
  (state) => {
    let clustered = 0
    for (const marker of state.markers.values()) {
      if (marker.isCluster) clustered++
    }
    
    return {
      total: state.markers.size,
      visible: state.visibleMarkerIds.size,
      clustered
    }
  },
  ['markers', 'visibleMarkerIds']
)

export const useMarkerStats = () => {
  return useMapStore(getMarkerStatsSelector)
}

// Map bounds selector with optimization
export const useMapBounds = () => {
  return useMapStore(
    (state) => state.viewport?.bounds,
    (a, b) => {
      if (!a && !b) return true
      if (!a || !b) return false
      return (
        a.north === b.north &&
        a.south === b.south &&
        a.east === b.east &&
        a.west === b.west
      )
    }
  )
}

// Combined map state for components that need multiple values
export const useMapStateOptimized = () => {
  return useMapStore(
    (state) => ({
      map: state.map,
      isReady: state.isMapReady,
      viewport: state.viewport,
      markers: state.markers,
      clustersEnabled: state.clustersEnabled
    }),
    shallow
  )
}

// Actions selector (these don't cause re-renders)
export const useMapActions = () => {
  return useMapStore(
    (state) => ({
      setMap: state.setMap,
      setViewport: state.setViewport,
      updateViewport: state.updateViewport,
      fitBounds: state.fitBounds,
      setMarkers: state.setMarkers,
      addMarker: state.addMarker,
      removeMarker: state.removeMarker,
      clearMarkers: state.clearMarkers,
      updateVisibleMarkers: state.updateVisibleMarkers,
      toggleClustering: state.toggleClustering
    }),
    shallow
  )
}

// Performance-critical selector for map operations
export const useMapOperations = () => {
  const map = useMapStore((state) => state.map)
  const isReady = useMapStore((state) => state.isMapReady)
  const setViewport = useMapStore((state) => state.setViewport)
  const fitBounds = useMapStore((state) => state.fitBounds)
  
  return {
    map,
    isReady,
    setViewport,
    fitBounds
  }
}

// Selector for script loading status only
export const useScriptStatus = () => {
  return useMapStore(
    (state) => ({
      loaded: state.isScriptLoaded,
      loading: state.isScriptLoading,
      error: state.scriptError
    }),
    shallow
  )
}