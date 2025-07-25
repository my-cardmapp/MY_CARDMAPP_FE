'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface MapContextType {
  map: naver.maps.Map | null
  isMapReady: boolean
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

  const setMap = useCallback((newMap: naver.maps.Map | null) => {
    setMapState(newMap)
    setIsMapReady(!!newMap)
  }, [])

  return (
    <MapContext.Provider value={{ map, isMapReady, setMap }}>
      {children}
    </MapContext.Provider>
  )
}