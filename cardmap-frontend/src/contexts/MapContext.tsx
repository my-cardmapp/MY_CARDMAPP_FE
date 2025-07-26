'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { NaverMapScript } from '@/components/map/NaverMapScript'

interface MapContextType {
  map: naver.maps.Map | null
  isMapReady: boolean
  isScriptLoaded: boolean
  isScriptError: boolean
  setMap: (map: naver.maps.Map | null) => void
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
  const [map, setMapState] = useState<naver.maps.Map | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isScriptError, setIsScriptError] = useState(false)

  const setMap = useCallback((newMap: naver.maps.Map | null) => {
    setMapState(newMap)
    setIsMapReady(!!newMap)
  }, [])

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

  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || ''

  return (
    <>
      <NaverMapScript 
        clientId={naverMapClientId}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <MapContext.Provider value={{ 
        map, 
        isMapReady, 
        isScriptLoaded,
        isScriptError,
        setMap 
      }}>
        {children}
      </MapContext.Provider>
    </>
  )
}