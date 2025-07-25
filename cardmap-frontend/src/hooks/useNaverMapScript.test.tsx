import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNaverMapScript } from './useNaverMapScript'

// Mock environment variable
vi.stubGlobal('process', {
  env: {
    NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: 'test_client_id'
  }
})

describe('useNaverMapScript', () => {
  beforeEach(() => {
    // Clean up any existing scripts
    document.querySelectorAll('script').forEach(el => el.remove())
    // Reset window.naver
    ;(window as any).naver = undefined
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useNaverMapScript())
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.isLoaded).toBe(false)
  })

  it('should load script with correct src', () => {
    renderHook(() => useNaverMapScript())
    
    const script = document.querySelector('script[src*="openapi.map.naver.com"]')
    expect(script).toBeTruthy()
    expect(script?.getAttribute('src')).toContain('test_client_id')
  })

  it('should not add duplicate scripts', () => {
    renderHook(() => useNaverMapScript())
    renderHook(() => useNaverMapScript())
    
    const scripts = document.querySelectorAll('script[src*="openapi.map.naver.com"]')
    expect(scripts.length).toBe(1)
  })

  it('should return loaded state when naver.maps is available', async () => {
    // Mock naver.maps
    ;(window as any).naver = {
      maps: {
        Map: vi.fn(),
        Marker: vi.fn(),
      }
    }

    const { result } = renderHook(() => useNaverMapScript())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isLoaded).toBe(true)
  })

  it('should handle script loading error', async () => {
    const { result } = renderHook(() => useNaverMapScript())
    
    // Simulate script error
    const script = document.querySelector('script[src*="openapi.map.naver.com"]') as HTMLScriptElement
    script?.dispatchEvent(new Event('error'))
    
    // Wait for state update
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(true)
      expect(result.current.isLoaded).toBe(false)
    })
  })
})