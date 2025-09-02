/**
 * Enhanced Redux DevTools configuration for Zustand stores
 * Provides detailed debugging capabilities in development
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

// DevTools configuration type
interface DevToolsConfig {
  name: string
  enabled?: boolean
  anonymize?: boolean
  serialize?: {
    options?: {
      undefined?: boolean
      map?: boolean
      set?: boolean
      symbol?: boolean
      error?: boolean
      function?: boolean
      date?: boolean
      regex?: boolean
    }
    replacer?: (key: string, value: any) => any
  }
  trace?: boolean
  traceLimit?: number
  features?: {
    pause?: boolean
    lock?: boolean
    persist?: boolean
    export?: boolean | 'custom'
    import?: boolean | 'custom'
    jump?: boolean
    skip?: boolean
    reorder?: boolean
    dispatch?: boolean
    test?: boolean
  }
  actionSanitizer?: (action: any, id: number) => any
  stateSanitizer?: (state: any, index: number) => any
  actionsBlacklist?: string[]
  actionsWhitelist?: string[]
  actionCreators?: Record<string, Function>
  latency?: number
  maxAge?: number
  autoPause?: boolean
}

/**
 * Create enhanced DevTools configuration
 */
export function createDevToolsConfig(storeName: string): DevToolsConfig {
  return {
    name: `Zustand: ${storeName}`,
    enabled: process.env.NODE_ENV === 'development',
    trace: true,
    traceLimit: 25,
    maxAge: 50, // Keep last 50 actions
    serialize: {
      options: {
        undefined: true,
        function: false,
        symbol: true,
        map: true,
        set: true,
        error: true,
        date: true,
        regex: true
      },
      // Custom serializer for complex objects
      replacer: (key, value) => {
        // Handle Naver Maps objects
        if (value && typeof value === 'object') {
          if (value.constructor?.name === 'Map' && value instanceof window.naver?.maps?.Map) {
            return {
              _type: 'NaverMap',
              center: value.getCenter?.(),
              zoom: value.getZoom?.(),
              bounds: value.getBounds?.()
            }
          }
          
          // Handle Map data structure
          if (value instanceof Map) {
            return {
              _type: 'Map',
              size: value.size,
              entries: Array.from(value.entries())
            }
          }
          
          // Handle Set data structure
          if (value instanceof Set) {
            return {
              _type: 'Set',
              size: value.size,
              values: Array.from(value.values())
            }
          }
        }
        
        // Handle functions (show function name only)
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`
        }
        
        return value
      }
    },
    features: {
      pause: true,        // Pause/resume actions
      lock: true,         // Lock/unlock state changes
      persist: true,      // Persist state across reloads
      export: true,       // Export state/actions
      import: 'custom',   // Import state with validation
      jump: true,         // Jump to any action
      skip: true,         // Skip actions
      reorder: true,      // Reorder actions
      dispatch: true,     // Dispatch custom actions
      test: true          // Generate tests from actions
    },
    // Sanitize actions for better readability
    actionSanitizer: (action, id) => {
      // Add timestamp to actions
      return {
        ...action,
        timestamp: Date.now(),
        actionId: id
      }
    },
    // Sanitize state to hide sensitive data
    stateSanitizer: (state) => {
      // Remove sensitive data in production-like builds
      if (process.env.NEXT_PUBLIC_HIDE_SENSITIVE_DATA === 'true') {
        const sanitized = { ...state }
        // Add any sensitive field sanitization here
        return sanitized
      }
      return state
    },
    // Actions to ignore in DevTools
    actionsBlacklist: ['@@INIT'],
    // Auto-pause when error occurs
    autoPause: true
  }
}

/**
 * Action logger for development
 */
export function createActionLogger(storeName: string) {
  if (process.env.NODE_ENV !== 'development') {
    return {
      log: () => {},
      logAction: () => {},
      logState: () => {},
      logError: () => {},
      logPerformance: () => {}
    }
  }
  
  const prefix = `[${storeName}]`
  const styles = {
    action: 'color: #03A9F4; font-weight: bold;',
    state: 'color: #4CAF50;',
    error: 'color: #F44336; font-weight: bold;',
    performance: 'color: #FF9800;',
    timestamp: 'color: #9E9E9E; font-size: 0.9em;'
  }
  
  return {
    log: (message: string, data?: any) => {
      console.log(`${prefix} ${message}`, data)
    },
    
    logAction: (actionName: string, payload?: any) => {
      const timestamp = new Date().toLocaleTimeString()
      console.groupCollapsed(
        `%c${prefix} Action: ${actionName} %c@ ${timestamp}`,
        styles.action,
        styles.timestamp
      )
      if (payload !== undefined) {
        console.log('Payload:', payload)
      }
      console.trace('Call Stack')
      console.groupEnd()
    },
    
    logState: (stateName: string, state: any) => {
      console.log(`%c${prefix} State [${stateName}]:`, styles.state, state)
    },
    
    logError: (error: Error, context?: string) => {
      console.error(`%c${prefix} Error${context ? ` in ${context}` : ''}:`, styles.error, error)
    },
    
    logPerformance: (actionName: string, duration: number) => {
      const slow = duration > 16 // Longer than one frame
      console.log(
        `%c${prefix} Performance: ${actionName} took ${duration.toFixed(2)}ms${slow ? ' ⚠️' : ''}`,
        slow ? styles.error : styles.performance
      )
    }
  }
}

/**
 * Time travel debugging helper
 */
export class TimeTravelDebugger<T> {
  private history: T[] = []
  private currentIndex = -1
  private maxHistory = 50
  
  constructor(private storeName: string, private setState: (state: T) => void) {}
  
  recordState(state: T) {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }
    
    // Add new state
    this.history.push(structuredClone(state))
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }
  
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
  
  undo() {
    if (this.canUndo()) {
      this.currentIndex--
      this.setState(structuredClone(this.history[this.currentIndex]))
      console.log(`[${this.storeName}] Undo to state ${this.currentIndex}`)
    }
  }
  
  redo() {
    if (this.canRedo()) {
      this.currentIndex++
      this.setState(structuredClone(this.history[this.currentIndex]))
      console.log(`[${this.storeName}] Redo to state ${this.currentIndex}`)
    }
  }
  
  jumpTo(index: number) {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index
      this.setState(structuredClone(this.history[index]))
      console.log(`[${this.storeName}] Jump to state ${index}`)
    }
  }
  
  getHistory() {
    return this.history.map((state, index) => ({
      state,
      index,
      isCurrent: index === this.currentIndex
    }))
  }
  
  clear() {
    this.history = []
    this.currentIndex = -1
  }
}

/**
 * State snapshot manager for debugging
 */
export class StateSnapshotManager<T> {
  private snapshots = new Map<string, T>()
  
  constructor(private storeName: string) {}
  
  save(name: string, state: T) {
    this.snapshots.set(name, structuredClone(state))
    console.log(`[${this.storeName}] Snapshot saved: ${name}`)
  }
  
  load(name: string): T | undefined {
    const snapshot = this.snapshots.get(name)
    if (snapshot) {
      console.log(`[${this.storeName}] Snapshot loaded: ${name}`)
      return structuredClone(snapshot)
    }
    console.warn(`[${this.storeName}] Snapshot not found: ${name}`)
    return undefined
  }
  
  list(): string[] {
    return Array.from(this.snapshots.keys())
  }
  
  delete(name: string) {
    this.snapshots.delete(name)
    console.log(`[${this.storeName}] Snapshot deleted: ${name}`)
  }
  
  clear() {
    this.snapshots.clear()
    console.log(`[${this.storeName}] All snapshots cleared`)
  }
  
  export(): Record<string, T> {
    const exported: Record<string, T> = {}
    this.snapshots.forEach((value, key) => {
      exported[key] = structuredClone(value)
    })
    return exported
  }
  
  import(snapshots: Record<string, T>) {
    Object.entries(snapshots).forEach(([key, value]) => {
      this.snapshots.set(key, structuredClone(value))
    })
    console.log(`[${this.storeName}] Imported ${Object.keys(snapshots).length} snapshots`)
  }
}

/**
 * Create enhanced devtools middleware
 */
export const devtoolsEnhanced = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs, T>,
  options: DevToolsConfig
): StateCreator<T, Mps, Mcs, T> => {
  return (set, get, api) => {
    const logger = createActionLogger(options.name)
    const timeTravel = new TimeTravelDebugger<T>(options.name, (state) => set(state as any))
    const snapshots = new StateSnapshotManager<T>(options.name)
    
    // Enhanced set function with logging and DevTools integration
    const enhancedSet: typeof set = (partial, replace, action) => {
      const startTime = performance.now()
      const actionName = action || 'unknown'
      
      // Log action start
      logger.logAction(actionName as string, partial)
      
      // Call original set
      set(partial, replace, action)
      
      // Record state for time travel
      timeTravel.recordState(get())
      
      // Log performance
      const duration = performance.now() - startTime
      logger.logPerformance(actionName as string, duration)
      
      // Log new state (only in verbose mode)
      if (process.env.NEXT_PUBLIC_VERBOSE_LOGGING === 'true') {
        logger.logState('after ' + actionName, get())
      }
    }
    
    // Expose debugging utilities in development
    if (process.env.NODE_ENV === 'development') {
      ;(window as any).__ZUSTAND_DEVTOOLS__ = (window as any).__ZUSTAND_DEVTOOLS__ || {}
      ;(window as any).__ZUSTAND_DEVTOOLS__[options.name] = {
        getState: get,
        setState: set,
        timeTravel,
        snapshots,
        logger
      }
    }
    
    return config(enhancedSet, get, api)
  }
}

// Type helper for devtools
export type WithDevtools<T> = T & {
  _devtools?: {
    timeTravel: TimeTravelDebugger<T>
    snapshots: StateSnapshotManager<T>
    logger: ReturnType<typeof createActionLogger>
  }
}