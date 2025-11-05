/**
 * Enhanced Map Store with DevTools, Logging, and Persistence
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import type { MapStore, MapViewport, MapControls, MarkerData } from '../types'
import { createDevToolsConfig, devtoolsEnhanced } from '../middleware/devtools'
import { createLogger } from '../middleware/logger'
import { persist, createSessionPersist } from '../middleware/persist'

// Default values
const DEFAULT_VIEWPORT: MapViewport = {
  center: { lat: 37.5665, lng: 126.9780 }, // Seoul City Hall
  zoom: 13
}

const DEFAULT_CONTROLS: MapControls = {
  draggable: true,
  scrollWheel: true,
  disableDoubleClickZoom: false,
  disableKineticPan: false
}

// Create enhanced store with all middleware
export const useMapStoreEnhanced = create<MapStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        createLogger({
          name: 'MapStore',
          collapsed: true,
          diff: true,
          filter: (action) => !action.includes('setResizing') // Don't log resize events
        })(
          (set, get) => ({
            // Initial state
            map: null,
            isScriptLoaded: false,
            isScriptLoading: false,
            scriptError: null,
            viewport: DEFAULT_VIEWPORT,
            controls: DEFAULT_CONTROLS,
            markers: new Map(),
            visibleMarkerIds: new Set(),
            clustersEnabled: false,
            isMapReady: false,
            isResizing: false,

            // Map instance actions with enhanced logging
            setMap: (map) => set(
              (state) => ({
                map,
                isMapReady: map !== null
              }), 
              false, 
              'setMap'
            ),

            // Script loading actions
            setScriptLoaded: (loaded) => set({ 
              isScriptLoaded: loaded 
            }, false, 'setScriptLoaded'),

            setScriptLoading: (loading) => set({ 
              isScriptLoading: loading 
            }, false, 'setScriptLoading'),

            setScriptError: (error) => set({ 
              scriptError: error,
              isScriptLoaded: false
            }, false, 'setScriptError'),

            // Viewport actions with optimistic updates
            setViewport: (viewport) => set((state) => {
              const newViewport = { ...state.viewport, ...viewport }
              
              // Optimistic update - update UI immediately
              if (state.map && viewport.center && typeof naver !== 'undefined') {
                // Defer map update to avoid blocking UI
                requestAnimationFrame(() => {
                  state.map!.setCenter(new naver.maps.LatLng(viewport.center!.lat, viewport.center!.lng))
                })
              }
              if (state.map && viewport.zoom !== undefined) {
                requestAnimationFrame(() => {
                  state.map!.setZoom(viewport.zoom!)
                })
              }
              
              return { viewport: newViewport }
            }, false, 'setViewport'),

            updateViewport: (updates) => {
              const state = get()
              state.setViewport(updates)
            },

            fitBounds: (bounds) => set((state) => {
              if (state.map && bounds && typeof naver !== 'undefined') {
                const navBounds = new naver.maps.LatLngBounds(
                  new naver.maps.LatLng(bounds.south, bounds.west),
                  new naver.maps.LatLng(bounds.north, bounds.east)
                )
                
                // Optimistic bounds update
                requestAnimationFrame(() => {
                  state.map!.fitBounds(navBounds)
                })
              }
              
              return {
                viewport: {
                  ...state.viewport,
                  bounds
                }
              }
            }, false, 'fitBounds'),

            // Controls actions
            setControls: (controls) => set((state) => {
              const newControls = { ...state.controls, ...controls }
              
              // Apply to map if available
              if (state.map) {
                requestAnimationFrame(() => {
                  state.map!.setOptions(controls)
                })
              }
              
              return { controls: newControls }
            }, false, 'setControls'),

            toggleControl: (control) => set((state) => {
              const newValue = !state.controls[control]
              const update = { [control]: newValue }
              
              // Apply to map if available
              if (state.map) {
                requestAnimationFrame(() => {
                  state.map!.setOptions(update)
                })
              }
              
              return {
                controls: {
                  ...state.controls,
                  ...update
                }
              }
            }, false, 'toggleControl'),

            // Markers actions with batch updates
            setMarkers: (markers) => set(() => {
              const markersMap = new Map<string, MarkerData>()
              
              // Batch marker creation
              requestAnimationFrame(() => {
                markers.forEach((marker) => {
                  markersMap.set(marker.id, marker)
                })
              })
              
              return { markers: markersMap }
            }, false, 'setMarkers'),

            addMarker: (marker) => set((state) => {
              const newMarkers = new Map(state.markers)
              newMarkers.set(marker.id, marker)
              return { markers: newMarkers }
            }, false, 'addMarker'),

            removeMarker: (id) => set((state) => {
              const newMarkers = new Map(state.markers)
              newMarkers.delete(id)
              
              const newVisible = new Set(state.visibleMarkerIds)
              newVisible.delete(id)
              
              return {
                markers: newMarkers,
                visibleMarkerIds: newVisible
              }
            }, false, 'removeMarker'),

            clearMarkers: () => set({
              markers: new Map(),
              visibleMarkerIds: new Set()
            }, false, 'clearMarkers'),

            updateVisibleMarkers: (ids) => set({
              visibleMarkerIds: new Set(ids)
            }, false, 'updateVisibleMarkers'),

            toggleClustering: () => set((state) => ({
              clustersEnabled: !state.clustersEnabled
            }), false, 'toggleClustering'),

            // UI State actions
            setMapReady: (ready) => set({ 
              isMapReady: ready 
            }, false, 'setMapReady'),

            setResizing: (resizing) => set({ 
              isResizing: resizing 
            }, false, 'setResizing'),

            // Reset with confirmation
            reset: () => {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[MapStore] Resetting store to initial state')
              }
              
              set({
                map: null,
                isScriptLoaded: false,
                isScriptLoading: false,
                scriptError: null,
                viewport: DEFAULT_VIEWPORT,
                controls: DEFAULT_CONTROLS,
                markers: new Map(),
                visibleMarkerIds: new Set(),
                clustersEnabled: false,
                isMapReady: false,
                isResizing: false
              }, false, 'reset')
            }
          })
        ),
        {
          name: 'map-store',
          partialize: (state) => ({
            viewport: state.viewport,
            controls: state.controls,
            clustersEnabled: state.clustersEnabled
          }),
          version: 1,
          migrate: (persistedState: any, version: number) => {
            if (version === 0) {
              // Migration from version 0 to 1
              return {
                ...persistedState,
                clustersEnabled: persistedState.clustersEnabled ?? false
              }
            }
            return persistedState
          }
        }
      )
    ),
    createDevToolsConfig('MapStore')
  )
)

// Export selectors with performance optimization
export const useMapInstance = () => useMapStoreEnhanced((state) => state.map)
export const useMapViewport = () => useMapStoreEnhanced((state) => state.viewport, shallow)
export const useMapControls = () => useMapStoreEnhanced((state) => state.controls, shallow)
export const useMapMarkers = () => useMapStoreEnhanced((state) => state.markers)
export const useMapLoadingState = () => useMapStoreEnhanced(
  (state) => ({
    isScriptLoaded: state.isScriptLoaded,
    isScriptLoading: state.isScriptLoading,
    scriptError: state.scriptError,
    isMapReady: state.isMapReady
  }),
  shallow
)

// Development helpers
if (process.env.NODE_ENV === 'development') {
  ;(window as any).__MAP_STORE__ = useMapStoreEnhanced
}