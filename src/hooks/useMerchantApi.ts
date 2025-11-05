import { useEffect, useRef, useCallback } from 'react'
import { RequestDeduplicator, createAbortableFetch } from '@/utils/requestDeduplicator'
import type { Merchant } from '@/types'

interface UseMerchantApiOptions {
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  cardTypes?: string[]
  enabled?: boolean
}

interface MerchantApiResult {
  merchants: Merchant[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// Singleton request deduplicator for merchant API
const merchantRequestDeduplicator = new RequestDeduplicator(5000) // 5 second TTL

/**
 * Hook for fetching merchants with request deduplication and abort control
 */
export function useMerchantApi({
  bounds,
  cardTypes = [],
  enabled = true
}: UseMerchantApiOptions): MerchantApiResult {
  const abortControllerRef = useRef<AbortController | null>(null)
  const merchantsRef = useRef<Merchant[]>([])
  const isLoadingRef = useRef(false)
  const errorRef = useRef<Error | null>(null)

  const fetchMerchants = useCallback(async () => {
    if (!bounds || !enabled) return

    // Generate cache key from request parameters
    const cacheKey = RequestDeduplicator.generateKey({
      bounds,
      cardTypes: cardTypes.sort() // Sort for consistent key
    })

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      isLoadingRef.current = true
      errorRef.current = null

      // Deduplicate the request
      const merchants = await merchantRequestDeduplicator.deduplicate(
        cacheKey,
        async () => {
          // Build query parameters
          const params = new URLSearchParams()
          params.append('north', bounds.north.toString())
          params.append('south', bounds.south.toString())
          params.append('east', bounds.east.toString())
          params.append('west', bounds.west.toString())
          
          if (cardTypes.length > 0) {
            cardTypes.forEach(type => params.append('cardTypes', type))
          }

          // Fetch merchants from API
          const response = await fetch(
            `/api/merchants/nearby?${params.toString()}`,
            {
              signal: abortControllerRef.current!.signal,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch merchants: ${response.statusText}`)
          }

          const data = await response.json()
          return data.merchants || []
        },
        abortControllerRef.current
      )

      merchantsRef.current = merchants
      isLoadingRef.current = false
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching merchants:', error)
        errorRef.current = error
      }
      isLoadingRef.current = false
    }
  }, [bounds, cardTypes, enabled])

  // Fetch merchants when dependencies change
  useEffect(() => {
    fetchMerchants()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchMerchants])

  return {
    merchants: merchantsRef.current,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
    refetch: fetchMerchants
  }
}

/**
 * Hook for fetching a single merchant with caching
 */
export function useMerchantDetail(merchantId: number | null) {
  const abortControllerRef = useRef<AbortController | null>(null)
  const merchantRef = useRef<Merchant | null>(null)
  const isLoadingRef = useRef(false)
  const errorRef = useRef<Error | null>(null)

  const fetchMerchant = useCallback(async () => {
    if (!merchantId) return

    const cacheKey = `merchant-${merchantId}`

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      isLoadingRef.current = true
      errorRef.current = null

      // Deduplicate the request
      const merchant = await merchantRequestDeduplicator.deduplicate(
        cacheKey,
        async () => {
          const response = await fetch(
            `/api/merchants/${merchantId}`,
            {
              signal: abortControllerRef.current!.signal,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch merchant: ${response.statusText}`)
          }

          return await response.json()
        },
        abortControllerRef.current
      )

      merchantRef.current = merchant
      isLoadingRef.current = false
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching merchant:', error)
        errorRef.current = error
      }
      isLoadingRef.current = false
    }
  }, [merchantId])

  // Fetch merchant when ID changes
  useEffect(() => {
    fetchMerchant()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchMerchant])

  return {
    merchant: merchantRef.current,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
    refetch: fetchMerchant
  }
}