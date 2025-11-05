'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'
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
  const timeoutRef = useRef<NodeJS.Timeout>()
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || ''

  // Set timeout for script loading (15 seconds)
  useEffect(() => {
    if (!isScriptLoaded && !isScriptError) {
      timeoutRef.current = setTimeout(() => {
        if (!isScriptLoaded) {
          console.error('MapProvider: Script loading timeout after 15 seconds')
          setIsScriptError(true)
        }
      }, 15000)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isScriptLoaded, isScriptError])

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsScriptLoaded(true)
    setIsScriptError(false)
  }, [])

  const handleScriptError = useCallback(() => {
    console.error('MapProvider: Script error')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsScriptError(true)
    setIsScriptLoaded(false)
  }, [])

  // Create context value with proper state updates
  const contextValue = React.useMemo<MapContextType>(() => ({
    get map() { return mapRef.current },
    isMapReady,
    isScriptLoaded,
    isScriptError,
    setMap,
    getMap,
  }), [isMapReady, isScriptLoaded, isScriptError, setMap, getMap])

  return (
    <>
      <NaverMapScript 
        clientId={naverMapClientId}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <MapContext.Provider value={contextValue}>
        {children}
      </MapContext.Provider>
    </>
  )
}