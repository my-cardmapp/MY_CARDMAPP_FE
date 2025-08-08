'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react'
import { NaverMapScript } from '@/components/map/NaverMapScript'

interface MapContextType {
  map: naver.maps.Map | null
  isMapReady: boolean
  isScriptLoaded: boolean
  isScriptError: boolean
  setMap: (map: naver.maps.Map | null) => void
  getMap: () => naver.maps.Map | null
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider')
  }
  return context
}

interface MapProviderProps {
  children: ReactNode
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  // Use ref to store map instance to prevent re-renders
  const mapRef = useRef<naver.maps.Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isScriptError, setIsScriptError] = useState(false)
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || ''

  // Memoized setMap to prevent recreation on each render
  const setMap = useCallback((newMap: naver.maps.Map | null) => {
    // Only update if actually different
    if (mapRef.current === newMap) return
    
    mapRef.current = newMap
    setIsMapReady(!!newMap)
  }, [])

  // Stable getter function for accessing current map instance
  const getMap = useCallback(() => mapRef.current, [])

  const handleScriptLoad = useCallback(() => {
    console.log('MapProvider: Script loaded')
    setIsScriptLoaded(true)
    setIsScriptError(false)
  }, [])

  const handleScriptError = useCallback(() => {
    console.error('MapProvider: Script error')
    setIsScriptError(true)
    setIsScriptLoaded(false)
  }, [])

  // Create stable context value to prevent unnecessary re-renders
  const contextValue = useRef<MapContextType>({
    get map() { return mapRef.current },
    isMapReady,
    isScriptLoaded,
    isScriptError,
    setMap,
    getMap,
  })

  // Update only the properties that can change
  contextValue.current.isMapReady = isMapReady
  contextValue.current.isScriptLoaded = isScriptLoaded
  contextValue.current.isScriptError = isScriptError

  return (
    <>
      <NaverMapScript 
        clientId={naverMapClientId}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <MapContext.Provider value={contextValue.current}>
        {children}
      </MapContext.Provider>
    </>
  )
}