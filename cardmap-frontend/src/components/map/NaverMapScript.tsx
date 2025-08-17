'use client'

import Script from 'next/script'
import { useCallback, useRef, useEffect } from 'react'

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
  const timeoutRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)
  const loadedRef = useRef(false)
  
  // Check if script already loaded on mount
  useEffect(() => {
    if (window.naver?.maps && !loadedRef.current) {
      console.log('✅ Naver Map SDK already loaded')
      loadedRef.current = true
      onLoad?.()
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  const handleScriptLoad = useCallback(() => {
    // Prevent multiple calls
    if (loadedRef.current) return
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 인증 실패 핸들러 설정
    window.navermap_authFailure = () => {
      console.error('❌ Naver Map authentication failed')
      loadedRef.current = false
      onError?.()
    }
    
    // Function to check if maps are available
    const checkMapsAvailable = () => {
      if (window.naver?.maps) {
        console.log('✅ Naver Map SDK loaded successfully')
        loadedRef.current = true
        onLoad?.()
        return true
      }
      return false
    }
    
    // Try immediately
    if (checkMapsAvailable()) return
    
    // Retry logic with exponential backoff
    const retryLoad = () => {
      retryCountRef.current++
      
      if (retryCountRef.current > 5) {
        console.error('❌ Naver Map SDK failed to initialize after 5 retries')
        onError?.()
        return
      }
      
      console.warn(`⚠️ Script loaded but naver.maps not available, retry ${retryCountRef.current}/5`)
      
      if (checkMapsAvailable()) return
      
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
      const delay = 100 * Math.pow(2, retryCountRef.current - 1)
      timeoutRef.current = setTimeout(retryLoad, delay)
    }
    
    // Start retry process
    timeoutRef.current = setTimeout(retryLoad, 100)
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