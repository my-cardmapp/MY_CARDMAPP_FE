'use client'

import React, { useEffect, useState, useCallback, memo } from 'react'

interface MapControlsProps {
  map: naver.maps.Map
}

const MapControls = memo(({ map }: MapControlsProps) => {
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (!map) return

    // Naver Maps의 기본 컨트롤은 MapOptions에서 설정됨
    // 커스텀 컨트롤만 추가 가능

    return () => {
      // 클린업 필요시 추가
    }
  }, [map])

  // 현재 위치로 이동 - useCallback으로 메모이제이션
  const handleLocationClick = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('브라우저가 위치 서비스를 지원하지 않습니다.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = new naver.maps.LatLng(latitude, longitude)
        
        // 지도 중심 이동 및 줌 레벨 설정
        map.setCenter(location)
        map.setZoom(16)
        
        // 현재 위치 마커 추가
        new naver.maps.Marker({
          position: location,
          map,
          icon: {
            content: `
              <div style="
                width: 20px;
                height: 20px;
                background-color: #4285F4;
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              "></div>
            `,
            size: new naver.maps.Size(20, 20),
            anchor: new naver.maps.Point(10, 10)
          } as naver.maps.HtmlIcon
        })
        
        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('위치 권한이 거부되었습니다.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('위치 정보를 사용할 수 없습니다.')
            break
          case error.TIMEOUT:
            setLocationError('위치 요청 시간이 초과되었습니다.')
            break
          default:
            setLocationError('알 수 없는 오류가 발생했습니다.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [map])

  // 전체 화면 토글 - useCallback으로 메모이제이션
  const handleFullscreenClick = useCallback(() => {
    const mapElement = map.getElement()
    
    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch((err) => {
        console.error('전체 화면 전환 실패:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }, [map])

  return (
    <>
      {/* 커스텀 컨트롤 컨테이너 */}
      <div className="absolute top-20 right-4 flex flex-col gap-2 z-10">
        {/* 현재 위치 버튼 */}
        <button
          onClick={handleLocationClick}
          disabled={isLocating}
          className="bg-white rounded-lg shadow-md p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="내 위치"
        >
          {isLocating ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        {/* 전체 화면 버튼 */}
        <button
          onClick={handleFullscreenClick}
          className="bg-white rounded-lg shadow-md p-3 hover:bg-gray-50 transition-colors"
          title="전체 화면"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* 위치 오류 메시지 */}
      {locationError && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-20">
          {locationError}
        </div>
      )}
    </>
  )
})

MapControls.displayName = 'MapControls'

export default MapControls