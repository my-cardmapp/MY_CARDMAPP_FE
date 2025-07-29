import { useEffect, useRef, useState, useCallback } from 'react'
import { debounce } from '@/utils/debounce'

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface UseMapBoundsOptions {
  map: naver.maps.Map | null
  debounceDelay?: number
  onBoundsChange?: (bounds: MapBounds) => void
}

export function useMapBounds(options: UseMapBoundsOptions) {
  const { map, debounceDelay = 500, onBoundsChange } = options
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use refs to avoid dependencies
  const mapRef = useRef(map)
  const onBoundsChangeRef = useRef(onBoundsChange)
  const previousBoundsRef = useRef<MapBounds | null>(null)
  
  // Update refs when values change
  useEffect(() => {
    mapRef.current = map
  }, [map])
  
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
  }, [onBoundsChange])

  // sessionStorage에서 마지막 viewport 복원
  useEffect(() => {
    if (!map) return

    const savedViewport = sessionStorage.getItem('mapViewport')
    if (savedViewport) {
      try {
        const { center, zoom } = JSON.parse(savedViewport)
        map.setCenter(new naver.maps.LatLng(center.lat, center.lng))
        map.setZoom(zoom)
      } catch (error) {
        console.error('Failed to restore viewport:', error)
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) return

    let isUnmounted = false
    let debouncedHandler: (() => void) | null = null

    // bounds_changed 이벤트 핸들러
    const handleBoundsChange = () => {
      if (isUnmounted) return
      
      const mapBounds = map.getBounds()
      if (!mapBounds) return

      const newBounds: MapBounds = {
        north: mapBounds.getNE().lat(),
        south: mapBounds.getSW().lat(),
        east: mapBounds.getNE().lng(),
        west: mapBounds.getSW().lng(),
      }

      // 이전 bounds와 비교하여 실제로 변경되었을 때만 업데이트
      const prev = previousBoundsRef.current
      if (
        prev &&
        Math.abs(prev.north - newBounds.north) < 0.0001 &&
        Math.abs(prev.south - newBounds.south) < 0.0001 &&
        Math.abs(prev.east - newBounds.east) < 0.0001 &&
        Math.abs(prev.west - newBounds.west) < 0.0001
      ) {
        return
      }

      previousBoundsRef.current = newBounds
      setBounds(newBounds)
      
      // viewport를 sessionStorage에 저장
      const center = map.getCenter()
      const zoom = map.getZoom()
      sessionStorage.setItem('mapViewport', JSON.stringify({
        center: { lat: center.lat(), lng: center.lng() },
        zoom
      }))

      // 콜백 호출 (비동기로 처리하여 무한 루프 방지)
      if (onBoundsChangeRef.current) {
        setIsLoading(true)
        setTimeout(() => {
          if (!isUnmounted && onBoundsChangeRef.current) {
            onBoundsChangeRef.current(newBounds)
            setIsLoading(false)
          }
        }, 0)
      }
    }

    // Debounced handler 생성
    debouncedHandler = debounce(handleBoundsChange, debounceDelay)

    // 이벤트 리스너 등록
    const boundsListener = naver.maps.Event.addListener(map, 'bounds_changed', debouncedHandler)

    // 초기 bounds 설정 (지도가 완전히 로드된 후)
    let idleListener: any = null
    const handleIdle = () => {
      if (!isUnmounted) {
        handleBoundsChange()
        // Remove listener after first call
        if (idleListener) {
          naver.maps.Event.removeListener(idleListener)
          idleListener = null
        }
      }
    }
    idleListener = naver.maps.Event.addListener(map, 'idle', handleIdle)

    // 클린업
    return () => {
      isUnmounted = true
      naver.maps.Event.removeListener(boundsListener)
      if (idleListener) {
        naver.maps.Event.removeListener(idleListener)
      }
    }
  }, [map, debounceDelay]) // onBoundsChange는 ref에 저장하여 안정성 보장

  // 확장된 bounds 계산 (viewport 외곽 영역 포함)
  const getExtendedBounds = useCallback((extensionRatio: number = 0.2): MapBounds | null => {
    if (!bounds) return null

    const latExtension = (bounds.north - bounds.south) * extensionRatio
    const lngExtension = (bounds.east - bounds.west) * extensionRatio

    return {
      north: bounds.north + latExtension,
      south: bounds.south - latExtension,
      east: bounds.east + lngExtension,
      west: bounds.west - lngExtension,
    }
  }, [bounds])

  // bounds 내에 좌표가 있는지 확인
  const isInBounds = useCallback((lat: number, lng: number, usedBounds?: MapBounds): boolean => {
    const checkBounds = usedBounds || bounds
    if (!checkBounds) return false

    return (
      lat >= checkBounds.south &&
      lat <= checkBounds.north &&
      lng >= checkBounds.west &&
      lng <= checkBounds.east
    )
  }, [bounds])

  return {
    bounds,
    isLoading,
    getExtendedBounds,
    isInBounds,
  }
}