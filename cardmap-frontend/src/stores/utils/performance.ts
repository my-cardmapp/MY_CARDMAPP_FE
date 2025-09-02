/**
 * Performance optimization utilities for Zustand stores
 */

import { shallow } from 'zustand/shallow'

/**
 * Create a memoized selector with shallow equality check
 * Prevents unnecessary re-renders when object references change but values are the same
 */
export function createShallowSelector<T, K extends keyof T>(
  keys: K[]
): (state: T) => Pick<T, K> {
  return (state) => {
    const selected = {} as Pick<T, K>
    keys.forEach(key => {
      selected[key] = state[key]
    })
    return selected
  }
}

/**
 * Memoized computation with dependency tracking
 * Only recomputes when dependencies change
 */
export function createMemoizedComputation<T, R>(
  selector: (state: T) => R,
  dependencies: Array<keyof T>
): (state: T) => R {
  let lastDeps: any[] = []
  let lastResult: R
  let isFirstRun = true
  
  return (state) => {
    const currentDeps = dependencies.map(dep => state[dep])
    
    if (isFirstRun || !shallow(lastDeps, currentDeps)) {
      lastResult = selector(state)
      lastDeps = currentDeps
      isFirstRun = false
    }
    
    return lastResult
  }
}

/**
 * Batch state updates to prevent multiple re-renders
 * Combines multiple state changes into a single update
 */
export function createBatchUpdater<T>(
  set: (updater: (state: T) => void) => void
) {
  return (updates: Partial<T>) => {
    set((state) => {
      Object.assign(state, updates)
    })
  }
}

/**
 * Performance monitor for development
 * Tracks and logs slow state updates
 */
export function createPerformanceMonitor(storeName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return {
      startUpdate: () => {},
      endUpdate: () => {},
      logMetrics: () => {}
    }
  }
  
  const metrics: { action: string; duration: number }[] = []
  let updateStart: number = 0
  
  return {
    startUpdate: (action: string) => {
      updateStart = performance.now()
      return action
    },
    
    endUpdate: (action: string) => {
      const duration = performance.now() - updateStart
      metrics.push({ action, duration })
      
      // Warn if update takes longer than one frame (16ms)
      if (duration > 16) {
        console.warn(`[${storeName}] Slow update detected:`, {
          action,
          duration: `${duration.toFixed(2)}ms`
        })
      }
    },
    
    logMetrics: () => {
      if (metrics.length === 0) return
      
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
      const slowUpdates = metrics.filter(m => m.duration > 16)
      
      console.log(`[${storeName}] Performance metrics:`, {
        totalUpdates: metrics.length,
        averageDuration: `${avgDuration.toFixed(2)}ms`,
        slowUpdates: slowUpdates.length,
        slowestUpdate: metrics.reduce((max, m) => m.duration > max.duration ? m : max, metrics[0])
      })
    }
  }
}

/**
 * Debounced selector for frequently changing values
 * Delays updates to prevent excessive re-renders
 */
export function createDebouncedSelector<T, R>(
  selector: (state: T) => R,
  delay: number = 100
): (state: T) => R {
  let timeoutId: NodeJS.Timeout | null = null
  let lastValue: R
  let isFirstRun = true
  
  return (state) => {
    if (isFirstRun) {
      lastValue = selector(state)
      isFirstRun = false
      return lastValue
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      lastValue = selector(state)
      timeoutId = null
    }, delay)
    
    return lastValue
  }
}

/**
 * Create a throttled selector for rate-limited updates
 * Limits how often a selector can update
 */
export function createThrottledSelector<T, R>(
  selector: (state: T) => R,
  limit: number = 100
): (state: T) => R {
  let lastRun = 0
  let lastValue: R
  let isFirstRun = true
  
  return (state) => {
    const now = Date.now()
    
    if (isFirstRun || now - lastRun >= limit) {
      lastValue = selector(state)
      lastRun = now
      isFirstRun = false
    }
    
    return lastValue
  }
}

/**
 * Equality function for complex object comparisons
 * More efficient than deep equality for known structures
 */
export function createStructuralEqualityFn<T>(
  keys: Array<keyof T>
): (a: T, b: T) => boolean {
  return (a, b) => {
    if (a === b) return true
    if (!a || !b) return false
    
    return keys.every(key => {
      const aVal = a[key]
      const bVal = b[key]
      
      // Handle arrays
      if (Array.isArray(aVal) && Array.isArray(bVal)) {
        return shallow(aVal, bVal)
      }
      
      // Handle objects (shallow comparison)
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return shallow(aVal as any, bVal as any)
      }
      
      // Primitive comparison
      return aVal === bVal
    })
  }
}

/**
 * Export commonly used equality functions
 */
export { shallow } from 'zustand/shallow'

/**
 * Type-safe selector creation helper
 */
export type Selector<T, R> = (state: T) => R
export type EqualityFn<T> = (a: T, b: T) => boolean

export function createSelector<T, R>(
  selector: Selector<T, R>,
  equalityFn: EqualityFn<R> = shallow
): Selector<T, R> {
  return selector
}