# Technical Implementation Plan: Zustand Migration

## Overview

This document provides the detailed technical implementation for migrating from React Context API to Zustand, including code interfaces, store structures, and migration patterns.

## Store Architecture

### 1. Map Store Implementation

```typescript
// src/stores/mapStore.ts
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface MapState {
  // Core state
  map: naver.maps.Map | null
  isMapReady: boolean
  isScriptLoaded: boolean
  isScriptError: boolean
  scriptErrorMessage: string | null
  
  // Map properties
  center: { lat: number; lng: number }
  zoom: number
  bounds: naver.maps.Bounds | null
  
  // Map interaction state
  isDragging: boolean
  isZooming: boolean
  
  // Viewport state (for session persistence)
  viewport: {
    center: { lat: number; lng: number }
    zoom: number
    bounds: naver.maps.Bounds | null
  } | null
  
  // Metadata
  $storeName: string
}

interface MapActions {
  // Map instance management
  setMap: (map: naver.maps.Map | null) => void
  getMap: () => naver.maps.Map | null
  
  // Script state management
  setScriptLoaded: (loaded: boolean) => void
  setScriptError: (error: boolean, message?: string) => void
  
  // Map property updates
  setCenter: (center: { lat: number; lng: number }) => void
  setZoom: (zoom: number) => void
  setBounds: (bounds: naver.maps.Bounds | null) => void
  updateViewport: (viewport: Partial<MapState['viewport']>) => void
  
  // Interaction state
  setDragging: (dragging: boolean) => void
  setZooming: (zooming: boolean) => void
  
  // Utility actions
  panTo: (location: { lat: number; lng: number }, animation?: boolean) => void
  zoomTo: (level: number, animation?: boolean) => void
  fitBounds: (bounds: naver.maps.Bounds, padding?: number) => void
  refresh: (force?: boolean) => void
  
  // Session management
  saveViewport: () => void
  restoreViewport: () => void
  
  // Reset
  reset: () => void
  
  // Subscriptions
  subscribe: (listener: () => void) => () => void
}

export type MapStore = MapState & MapActions
```

### 2. Merchant Store Implementation

```typescript
// src/stores/merchantStore.ts
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { Merchant } from '@/types/api'

interface MerchantState {
  // Data
  merchants: Merchant[]
  selectedMerchant: Merchant | null
  merchantDetail: Merchant | null
  
  // Loading states
  isLoading: boolean
  isDetailLoading: boolean
  
  // Error handling
  error: string | null
  detailError: string | null
  
  // Viewport & filtering
  viewportBounds: {
    north: number
    south: number
    east: number
    west: number
  } | null
  activeCardTypes: string[]
  
  // Caching
  lastFetchTime: number | null
  cacheKey: string | null
  
  // Pagination
  page: number
  totalPages: number
  totalMerchants: number
  
  // Metadata
  $storeName: string
}

interface MerchantActions {
  // Data operations
  setMerchants: (merchants: Merchant[]) => void
  addMerchants: (merchants: Merchant[]) => void
  updateMerchant: (id: number, updates: Partial<Merchant>) => void
  removeMerchant: (id: number) => void
  
  // Selection
  selectMerchant: (merchant: Merchant | null) => void
  setMerchantDetail: (merchant: Merchant | null) => void
  
  // Fetching
  fetchMerchantsByBounds: (bounds: MerchantState['viewportBounds'], cardTypes?: string[]) => Promise<void>
  fetchMerchantDetail: (id: number) => Promise<void>
  fetchNearbyMerchants: (lat: number, lng: number, radius?: number) => Promise<void>
  
  // Viewport management
  setViewportBounds: (bounds: MerchantState['viewportBounds']) => void
  setActiveCardTypes: (types: string[]) => void
  
  // Loading & error states
  setLoading: (loading: boolean) => void
  setDetailLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDetailError: (error: string | null) => void
  
  // Caching
  invalidateCache: () => void
  shouldRefetch: (bounds: MerchantState['viewportBounds'], cardTypes?: string[]) => boolean
  
  // Pagination
  setPagination: (page: number, totalPages: number, total: number) => void
  nextPage: () => void
  previousPage: () => void
  
  // Computed getters
  getMerchantById: (id: number) => Merchant | undefined
  getMerchantsByCardType: (cardType: string) => Merchant[]
  getVisibleMerchants: () => Merchant[]
  
  // Reset
  reset: () => void
  clearError: () => void
  
  // Subscriptions
  subscribe: (listener: () => void) => () => void
}

export type MerchantStore = MerchantState & MerchantActions
```

## Migration Adapters

### Compatibility Layer for Gradual Migration

```typescript
// src/stores/migration/mapContextAdapter.ts

/**
 * Adapter hook to maintain backward compatibility during migration
 * This allows components to use the old API while internally using Zustand
 */
export function useMapContextAdapter() {
  const map = useMapStore(state => state.map)
  const isMapReady = useMapStore(state => state.isMapReady)
  const isScriptLoaded = useMapStore(state => state.isScriptLoaded)
  const isScriptError = useMapStore(state => state.isScriptError)
  const setMap = useMapStore(state => state.setMap)
  const getMap = useMapStore(state => state.getMap)
  
  // Mimic the old Context API interface
  return {
    map,
    isMapReady,
    isScriptLoaded,
    isScriptError,
    setMap,
    getMap
  }
}

// Temporary alias during migration
export const useMapContext = useMapContextAdapter
```

### Provider Removal Strategy

```typescript
// src/stores/migration/StoreInitializer.tsx

/**
 * Initialize stores at app root without Provider wrapper
 * This component handles store setup and hydration
 */
export function StoreInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize map store
    const mapStore = useMapStore.getState()
    mapStore.restoreViewport()
    
    // Initialize merchant store
    const merchantStore = useMerchantStore.getState()
    
    // Set up store persistence
    const unsubscribeMap = useMapStore.subscribe(
      state => state.viewport,
      viewport => {
        if (viewport) {
          sessionStorage.setItem('map-viewport', JSON.stringify(viewport))
        }
      }
    )
    
    return () => {
      unsubscribeMap()
    }
  }, [])
  
  return <>{children}</>
}
```

## TypeScript Definitions

### Shared Types

```typescript
// src/types/stores.ts

import type { StateCreator } from 'zustand'

// Slice pattern for store composition
export type StoreSlice<T> = StateCreator<
  T,
  [['zustand/devtools', never], ['zustand/subscribeWithSelector', never]],
  [],
  T
>

// Common store metadata
export interface StoreMetadata {
  $storeName: string
  $version?: string
}

// Subscription types
export type StoreSubscriber = () => void
export type Unsubscribe = () => void

// Selector types
export type StoreSelector<T, U> = (state: T) => U
export type EqualityFn<T> = (a: T, b: T) => boolean
```

### Store Utilities

```typescript
// src/stores/utils/storeHelpers.ts

import { shallow } from 'zustand/shallow'

/**
 * Create a selector with shallow equality check
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
 * Batch update helper
 */
export function batchUpdate<T>(
  set: (fn: (state: T) => void) => void,
  updates: Partial<T>
) {
  set((state) => {
    Object.assign(state, updates)
  })
}

/**
 * Create a computed getter
 */
export function createComputed<T, R>(
  selector: (state: T) => R,
  deps: Array<keyof T>
): (state: T) => R {
  let lastDeps: any[] = []
  let lastResult: R
  
  return (state) => {
    const currentDeps = deps.map(dep => state[dep])
    
    if (!shallow(lastDeps, currentDeps)) {
      lastResult = selector(state)
      lastDeps = currentDeps
    }
    
    return lastResult
  }
}
```

## Testing Strategy

### Store Testing Pattern

```typescript
// src/stores/__tests__/mapStore.test.ts

import { renderHook, act } from '@testing-library/react'
import { useMapStore } from '../mapStore'

describe('MapStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState(useMapStore.getInitialState())
  })
  
  it('should set map instance', () => {
    const { result } = renderHook(() => useMapStore())
    
    const mockMap = { id: 'mock-map' } as any
    
    act(() => {
      result.current.setMap(mockMap)
    })
    
    expect(result.current.map).toBe(mockMap)
    expect(result.current.isMapReady).toBe(true)
  })
  
  it('should handle script loading states', () => {
    const { result } = renderHook(() => useMapStore())
    
    act(() => {
      result.current.setScriptLoaded(true)
    })
    
    expect(result.current.isScriptLoaded).toBe(true)
    expect(result.current.isScriptError).toBe(false)
  })
})
```

### Component Testing with Stores

```typescript
// Example component test with store
import { render, screen } from '@testing-library/react'
import { useMapStore } from '@/stores/mapStore'
import MapContainer from '@/components/map/MapContainer'

describe('MapContainer with Zustand', () => {
  beforeEach(() => {
    // Reset stores
    useMapStore.setState(useMapStore.getInitialState())
  })
  
  it('should render with store state', () => {
    // Set initial state
    useMapStore.setState({
      isScriptLoaded: true,
      isMapReady: false
    })
    
    render(<MapContainer />)
    
    // Component should reflect store state
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })
})
```

## Performance Optimization

### Selector Optimization

```typescript
// Use specific selectors to prevent unnecessary re-renders
const map = useMapStore(state => state.map)
const isReady = useMapStore(state => state.isMapReady)

// For multiple values, use shallow equality
const { center, zoom } = useMapStore(
  state => ({ center: state.center, zoom: state.zoom }),
  shallow
)

// Create reusable selectors
const mapPropertiesSelector = (state: MapStore) => ({
  center: state.center,
  zoom: state.zoom,
  bounds: state.bounds
})

// Use in component
const mapProperties = useMapStore(mapPropertiesSelector, shallow)
```

### Subscription Patterns

```typescript
// Subscribe to specific state changes
useEffect(() => {
  const unsubscribe = useMapStore.subscribe(
    state => state.bounds,
    (bounds) => {
      // Only runs when bounds change
      console.log('Bounds updated:', bounds)
    }
  )
  
  return unsubscribe
}, [])

// Subscribe with selector
useEffect(() => {
  const unsubscribe = useMapStore.subscribe(
    state => state.viewport,
    (viewport, previousViewport) => {
      if (viewport?.zoom !== previousViewport?.zoom) {
        console.log('Zoom changed')
      }
    }
  )
  
  return unsubscribe
}, [])
```

## Middleware Configuration

### DevTools Setup

```typescript
// Enhanced DevTools configuration
const devtoolsConfig = {
  name: 'MapStore',
  serialize: {
    options: {
      map: (value: any) => {
        // Custom serialization for map instance
        return value ? { id: value.id, center: value.getCenter() } : null
      }
    }
  },
  trace: true, // Enable action tracing
  traceLimit: 25 // Limit trace stack
}
```

### Persist Middleware

```typescript
import { persist } from 'zustand/middleware'

// Add persistence for selected state slices
const persistConfig = {
  name: 'map-storage',
  partialize: (state: MapStore) => ({
    center: state.center,
    zoom: state.zoom,
    viewport: state.viewport
  }),
  storage: {
    getItem: (name) => {
      const str = sessionStorage.getItem(name)
      return str ? JSON.parse(str) : null
    },
    setItem: (name, value) => {
      sessionStorage.setItem(name, JSON.stringify(value))
    },
    removeItem: (name) => {
      sessionStorage.removeItem(name)
    }
  }
}
```

## Migration Sequence

### Phase 1: Store Creation
1. Implement mapStore with all functionality
2. Implement merchantStore with data management
3. Add middleware and DevTools
4. Create comprehensive tests

### Phase 2: Adapter Implementation
1. Create useMapContextAdapter
2. Add backward compatibility
3. Test adapter with existing components
4. Verify no breaking changes

### Phase 3: Component Migration
```typescript
// Migration order based on dependencies
const migrationOrder = [
  'MapContainer',        // Core component, migrate first
  'ViewportMapContainer', // Depends on MapContainer
  'RouteLayer',          // Uses map instance
  'MapControls',         // Minimal dependencies
  'Test files'           // Update after components
]
```

### Phase 4: Cleanup
1. Remove MapContext.tsx
2. Remove MapProvider from app
3. Remove adapter hooks
4. Update imports globally

## Common Patterns & Best Practices

### 1. Async Actions Pattern

```typescript
const fetchMerchantsByBounds = async (bounds, cardTypes) => {
  const { setLoading, setError, setMerchants } = useMerchantStore.getState()
  
  setLoading(true)
  setError(null)
  
  try {
    const response = await fetch('/api/merchants/nearby', {
      method: 'POST',
      body: JSON.stringify({ bounds, cardTypes })
    })
    
    if (!response.ok) throw new Error('Failed to fetch')
    
    const data = await response.json()
    setMerchants(data.merchants)
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

### 2. Computed Values Pattern

```typescript
// Store implementation
const store = create((set, get) => ({
  // ... state ...
  
  // Computed getter
  getVisibleMerchants: () => {
    const { merchants, activeCardTypes } = get()
    
    if (activeCardTypes.length === 0) return merchants
    
    return merchants.filter(m => 
      m.cards.some(c => activeCardTypes.includes(c.code))
    )
  }
}))
```

### 3. Store Composition Pattern

```typescript
// Compose multiple store slices
const createMapSlice: StoreSlice<MapStore> = (set, get) => ({
  // Map state and actions
})

const createViewportSlice: StoreSlice<ViewportStore> = (set, get) => ({
  // Viewport state and actions
})

const useComposedStore = create<MapStore & ViewportStore>()(
  devtools(
    subscribeWithSelector((...args) => ({
      ...createMapSlice(...args),
      ...createViewportSlice(...args)
    }))
  )
)
```

## Monitoring & Metrics

### Performance Tracking

```typescript
// Add performance monitoring
const performanceMiddleware = (config) => (set, get, api) => {
  const trackedSet = (...args) => {
    const start = performance.now()
    set(...args)
    const duration = performance.now() - start
    
    if (duration > 16) { // Longer than one frame
      console.warn(`Slow state update: ${duration.toFixed(2)}ms`)
    }
  }
  
  return config(trackedSet, get, api)
}
```

### Debug Logging

```typescript
// Development-only logging
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Previous state:', get())
        set(...args)
        console.log('New state:', get())
      } else {
        set(...args)
      }
    },
    get,
    api
  )
```

## Troubleshooting Guide

### Common Issues & Solutions

1. **Issue**: Components not re-rendering after state change
   - **Solution**: Check selector usage, ensure shallow equality for objects

2. **Issue**: Infinite re-render loops
   - **Solution**: Memoize selectors, check useEffect dependencies

3. **Issue**: State not persisting
   - **Solution**: Verify persist middleware configuration

4. **Issue**: DevTools not showing state
   - **Solution**: Check devtools middleware is first in chain

5. **Issue**: TypeScript errors with selectors
   - **Solution**: Ensure proper type inference with selector functions

## Success Metrics

### Technical Metrics
- [ ] All tests passing (100% coverage maintained)
- [ ] No console errors or warnings
- [ ] DevTools integration working
- [ ] Performance benchmarks met

### Code Quality Metrics
- [ ] Reduced component complexity
- [ ] Eliminated prop drilling
- [ ] Consistent state patterns
- [ ] Improved TypeScript coverage

### Performance Metrics
- [ ] 50% reduction in unnecessary re-renders
- [ ] Faster initial load time
- [ ] Reduced memory footprint
- [ ] Better time-to-interactive

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-01-28  
**Technical Lead**: Frontend Team  
**Review Status**: Ready for Implementation