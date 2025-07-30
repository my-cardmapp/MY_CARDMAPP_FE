'use client'

import Script from 'next/script'
import { useCallback, useState } from 'react'

interface NaverMapScriptProps {
  clientId: string
  onLoad?: () => void
  onError?: () => void
}

export function NaverMapScript({ 
  clientId, 
  onLoad, 
  onError 
}: NaverMapScriptProps) {
  // Removed internal state to avoid re-render issues
  const handleScriptLoad = useCallback(() => {
    // 인증 실패 핸들러 설정
    window.navermap_authFailure = () => {
      console.error('❌ Naver Map authentication failed')
      onError?.()
    }
    
    // Script 태그는 로드되었지만 실제 naver.maps 객체가 사용 가능한지 확인
    if (window.naver?.maps) {
      console.log('✅ Naver Map SDK loaded successfully')
      onLoad?.()
    } else {
      console.warn('⚠️ Script loaded but naver.maps not available')
      // Retry after a short delay
      setTimeout(() => {
        if (window.naver?.maps) {
          console.log('✅ Naver Map SDK available after retry')
          onLoad?.()
        } else {
          console.error('❌ Naver Map SDK failed to initialize')
          onError?.()
        }
      }, 100)
    }
  }, [onLoad, onError])

  const handleScriptError = useCallback(() => {
    console.error('❌ Failed to load Naver Map script')
    onError?.()
  }, [onError])

  return (
    <Script
      id="naver-map-script"
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
      strategy="afterInteractive"
      onLoad={handleScriptLoad}
      onError={handleScriptError}
      onReady={() => {
        console.log('🔄 Script ready for interaction')
      }}
    />
  )
}