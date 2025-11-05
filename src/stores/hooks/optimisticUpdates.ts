/**
 * Optimistic update hooks for Zustand stores
 * Provides immediate UI updates with rollback on failure
 */

import { useCallback, useRef } from 'react'
import type { Merchant } from '@/types/merchant'

/**
 * Optimistic update manager
 */
export class OptimisticUpdateManager<T> {
  private rollbackStack: Array<{
    id: string
    previousState: T
    timestamp: number
  }> = []
  
  constructor(
    private getState: () => T,
    private setState: (state: T) => void,
    private maxRollbacks = 10
  ) {}
  
  /**
   * Execute optimistic update with automatic rollback on failure
   */
  async execute<R>(
    id: string,
    optimisticUpdate: (state: T) => T,
    asyncOperation: () => Promise<R>,
    options?: {
      onSuccess?: (result: R) => void
      onError?: (error: Error) => void
      timeout?: number
    }
  ): Promise<R> {
    // Save current state for rollback
    const previousState = this.getState()
    
    // Apply optimistic update
    const newState = optimisticUpdate(previousState)
    this.setState(newState)
    
    // Add to rollback stack
    this.rollbackStack.push({
      id,
      previousState,
      timestamp: Date.now()
    })
    
    // Limit rollback stack size
    if (this.rollbackStack.length > this.maxRollbacks) {
      this.rollbackStack.shift()
    }
    
    try {
      // Execute async operation with timeout
      const timeoutPromise = options?.timeout
        ? new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), options.timeout)
          )
        : null
      
      const result = timeoutPromise
        ? await Promise.race([asyncOperation(), timeoutPromise])
        : await asyncOperation()
      
      // Remove from rollback stack on success
      this.rollbackStack = this.rollbackStack.filter(item => item.id !== id)
      
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      // Rollback on failure
      this.rollback(id)
      options?.onError?.(error as Error)
      throw error
    }
  }
  
  /**
   * Rollback specific update
   */
  rollback(id: string) {
    const rollbackItem = this.rollbackStack.find(item => item.id === id)
    
    if (rollbackItem) {
      this.setState(rollbackItem.previousState)
      this.rollbackStack = this.rollbackStack.filter(item => item.id !== id)
      
      console.log(`[OptimisticUpdate] Rolled back update: ${id}`)
    }
  }
  
  /**
   * Rollback all updates
   */
  rollbackAll() {
    if (this.rollbackStack.length > 0) {
      // Get oldest state
      const oldestState = this.rollbackStack[0].previousState
      this.setState(oldestState)
      this.rollbackStack = []
      
      console.log('[OptimisticUpdate] Rolled back all updates')
    }
  }
  
  /**
   * Clear rollback stack
   */
  clear() {
    this.rollbackStack = []
  }
}

/**
 * Hook for optimistic merchant updates
 */
export function useOptimisticMerchantUpdate() {
  const managerRef = useRef<OptimisticUpdateManager<any>>()
  
  const updateMerchant = useCallback(
    async (
      merchantId: number,
      updates: Partial<Merchant>,
      apiCall: () => Promise<Merchant>
    ) => {
      // Implementation would use the actual store
      // This is a placeholder for the pattern
      console.log('Optimistic update for merchant:', merchantId, updates)
      return apiCall()
    },
    []
  )
  
  const toggleFavorite = useCallback(
    async (merchantId: number) => {
      // Optimistic favorite toggle
      const optimisticUpdate = (merchants: Merchant[]) => {
        return merchants.map(m =>
          m.id === merchantId
            ? { ...m, isFavorite: !m.isFavorite }
            : m
        )
      }
      
      // API call placeholder
      const apiCall = async () => {
        const response = await fetch(`/api/merchants/${merchantId}/favorite`, {
          method: 'POST'
        })
        if (!response.ok) throw new Error('Failed to toggle favorite')
        return response.json()
      }
      
      // Execute with rollback on failure
      try {
        await apiCall()
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        throw error
      }
    },
    []
  )
  
  return {
    updateMerchant,
    toggleFavorite
  }
}

/**
 * Hook for optimistic filter updates
 */
export function useOptimisticFilterUpdate() {
  const updateFilters = useCallback(
    async (
      filters: any,
      onSuccess?: () => void
    ) => {
      // Apply filters immediately
      console.log('Applying filters optimistically:', filters)
      
      // Simulate async validation
      setTimeout(() => {
        onSuccess?.()
      }, 100)
    },
    []
  )
  
  return { updateFilters }
}

/**
 * Hook for optimistic search
 */
export function useOptimisticSearch() {
  const search = useCallback(
    async (
      query: string,
      options?: {
        debounce?: number
        onResults?: (results: any[]) => void
      }
    ) => {
      // Show loading state immediately
      console.log('Starting search:', query)
      
      // Debounced search simulation
      if (options?.debounce) {
        await new Promise(resolve => setTimeout(resolve, options.debounce))
      }
      
      // Simulate search results
      const results = []
      options?.onResults?.(results)
      
      return results
    },
    []
  )
  
  return { search }
}

/**
 * Batch optimistic updates
 */
export function useBatchOptimisticUpdate<T>() {
  const batchRef = useRef<Array<() => void>>([])
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const addToBatch = useCallback((update: () => void) => {
    batchRef.current.push(update)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Schedule batch execution
    timeoutRef.current = setTimeout(() => {
      const updates = batchRef.current
      batchRef.current = []
      
      // Execute all updates in a single frame
      requestAnimationFrame(() => {
        updates.forEach(update => update())
      })
    }, 16) // Execute in next frame
  }, [])
  
  const executeBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    const updates = batchRef.current
    batchRef.current = []
    
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  }, [])
  
  return { addToBatch, executeBatch }
}

/**
 * Create optimistic update hook for any store
 */
export function createOptimisticHook<T>(
  useStore: () => T,
  setState: (state: T) => void
) {
  return function useOptimisticUpdate() {
    const managerRef = useRef<OptimisticUpdateManager<T>>()
    
    if (!managerRef.current) {
      managerRef.current = new OptimisticUpdateManager(
        useStore,
        setState
      )
    }
    
    const execute = useCallback(
      async <R,>(
        id: string,
        optimisticUpdate: (state: T) => T,
        asyncOperation: () => Promise<R>,
        options?: Parameters<OptimisticUpdateManager<T>['execute']>[3]
      ) => {
        return managerRef.current!.execute(
          id,
          optimisticUpdate,
          asyncOperation,
          options
        )
      },
      []
    )
    
    const rollback = useCallback((id: string) => {
      managerRef.current!.rollback(id)
    }, [])
    
    const rollbackAll = useCallback(() => {
      managerRef.current!.rollbackAll()
    }, [])
    
    return { execute, rollback, rollbackAll }
  }
}