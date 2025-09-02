/**
 * State persistence middleware for Zustand
 * Handles localStorage/sessionStorage persistence with versioning and migration
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

export interface PersistConfig<T> {
  name: string
  storage?: Storage
  partialize?: (state: T) => Partial<T>
  onRehydrateStorage?: (state: T) => ((state?: T, error?: unknown) => void) | void
  version?: number
  migrate?: (persistedState: any, version: number) => T
  merge?: (persistedState: any, currentState: T) => T
  skipHydration?: boolean
  whitelist?: Array<keyof T>
  blacklist?: Array<keyof T>
}

/**
 * Storage wrapper with error handling
 */
class StorageWrapper {
  constructor(private storage: Storage) {}
  
  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key)
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error)
      return null
    }
  }
  
  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value)
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error)
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        this.clearOldData()
        try {
          this.storage.setItem(key, value)
        } catch (retryError) {
          console.error('Failed to set item after clearing old data', retryError)
        }
      }
    }
  }
  
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error)
    }
  }
  
  private clearOldData(): void {
    // Clear old/expired data to make room
    const now = Date.now()
    const keysToRemove: string[] = []
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (!key) continue
      
      try {
        const item = this.storage.getItem(key)
        if (!item) continue
        
        const data = JSON.parse(item)
        if (data._timestamp && now - data._timestamp > 7 * 24 * 60 * 60 * 1000) { // 7 days
          keysToRemove.push(key)
        }
      } catch {
        // Skip invalid items
      }
    }
    
    keysToRemove.forEach(key => this.removeItem(key))
  }
}

/**
 * Create persistence configuration
 */
export function createPersistConfig<T>(
  name: string,
  options?: Partial<PersistConfig<T>>
): PersistConfig<T> {
  return {
    name,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    version: 1,
    ...options
  }
}

/**
 * State migration helper
 */
export function createMigration<T>(
  migrations: Record<number, (state: any) => any>
) {
  return (persistedState: any, version: number): T => {
    let migratedState = persistedState
    
    // Apply migrations sequentially
    const versions = Object.keys(migrations)
      .map(Number)
      .sort((a, b) => a - b)
    
    for (const migrationVersion of versions) {
      if (migrationVersion > version) {
        migratedState = migrations[migrationVersion](migratedState)
      }
    }
    
    return migratedState
  }
}

/**
 * Persist middleware implementation
 */
export const persist = <T>(
  config: PersistConfig<T>
) => <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  storeCreator: StateCreator<T, Mps, Mcs, T>
): StateCreator<T, Mps, Mcs, T> => {
  return (set, get, api) => {
    const storage = config.storage ? new StorageWrapper(config.storage) : null
    const storageKey = `zustand-${config.name}`
    
    // Load persisted state
    const loadPersistedState = (): Partial<T> | null => {
      if (!storage) return null
      
      try {
        const item = storage.getItem(storageKey)
        if (!item) return null
        
        const { state, version = 0, _timestamp } = JSON.parse(item)
        
        // Check if state is expired (optional)
        if (_timestamp) {
          const age = Date.now() - _timestamp
          const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
          if (age > maxAge) {
            storage.removeItem(storageKey)
            return null
          }
        }
        
        // Migrate if needed
        if (config.migrate && version !== config.version) {
          return config.migrate(state, version)
        }
        
        return state
      } catch (error) {
        console.error('Failed to load persisted state', error)
        storage.removeItem(storageKey)
        return null
      }
    }
    
    // Save state to storage
    const saveState = (state: T) => {
      if (!storage) return
      
      try {
        const stateToSave = config.partialize ? config.partialize(state) : state
        
        // Apply whitelist/blacklist
        let finalState = { ...stateToSave } as any
        
        if (config.whitelist) {
          finalState = {}
          config.whitelist.forEach(key => {
            finalState[key] = (stateToSave as any)[key]
          })
        }
        
        if (config.blacklist) {
          config.blacklist.forEach(key => {
            delete finalState[key]
          })
        }
        
        const data = {
          state: finalState,
          version: config.version,
          _timestamp: Date.now()
        }
        
        storage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save state', error)
      }
    }
    
    // Enhanced set function with persistence
    const persistentSet: typeof set = (partial, replace, action) => {
      set(partial, replace, action)
      saveState(get())
    }
    
    // Create store with persistent set
    const store = storeCreator(persistentSet, get, api)
    
    // Hydrate on mount (if not skipped)
    if (!config.skipHydration && typeof window !== 'undefined') {
      const persistedState = loadPersistedState()
      
      if (persistedState) {
        const rehydrateCallback = config.onRehydrateStorage?.(get())
        
        try {
          const hydratedState = config.merge
            ? config.merge(persistedState, get())
            : { ...get(), ...persistedState }
          
          set(hydratedState as T)
          rehydrateCallback?.(hydratedState as T)
        } catch (error) {
          rehydrateCallback?.(undefined, error)
        }
      }
    }
    
    return store
  }
}

/**
 * Create SSR-safe persistence
 */
export function createSSRSafePersist<T>(
  name: string,
  options?: Partial<PersistConfig<T>>
) {
  return persist<T>({
    name,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    skipHydration: typeof window === 'undefined',
    ...options
  })
}

/**
 * Session storage persistence
 */
export function createSessionPersist<T>(
  name: string,
  options?: Partial<PersistConfig<T>>
) {
  return persist<T>({
    name,
    storage: typeof window !== 'undefined' ? sessionStorage : undefined,
    ...options
  })
}

/**
 * Memory storage for testing
 */
export class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  
  get length() {
    return this.store.size
  }
  
  clear(): void {
    this.store.clear()
  }
  
  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }
  
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
  
  removeItem(key: string): void {
    this.store.delete(key)
  }
  
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
}