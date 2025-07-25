import { useEffect, useState } from 'react'

interface UseNaverMapScriptReturn {
  isLoading: boolean
  isError: boolean
  isLoaded: boolean
}

const NAVER_MAP_SCRIPT_ID = 'naver-map-script'
const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'test_client_id'

export function useNaverMapScript(): UseNaverMapScriptReturn {
  const [state, setState] = useState<UseNaverMapScriptReturn>({
    isLoading: true,
    isError: false,
    isLoaded: false,
  })

  useEffect(() => {
    // Check if naver.maps is already available
    if (typeof window !== 'undefined' && window.naver?.maps) {
      setState({
        isLoading: false,
        isError: false,
        isLoaded: true,
      })
      return
    }

    // Check if script is already added
    const existingScript = document.getElementById(NAVER_MAP_SCRIPT_ID)
    if (existingScript) {
      return
    }

    // Create and add script
    const script = document.createElement('script')
    script.id = NAVER_MAP_SCRIPT_ID
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.defer = true

    const handleLoad = () => {
      setState({
        isLoading: false,
        isError: false,
        isLoaded: true,
      })
    }

    const handleError = () => {
      setState({
        isLoading: false,
        isError: true,
        isLoaded: false,
      })
    }

    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)

    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }
  }, [])

  return state
}

// Export for reuse in other hooks/components
export const isNaverMapLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.naver?.maps
}