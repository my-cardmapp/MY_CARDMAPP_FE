/**
 * Development-only state logger middleware
 * Provides detailed logging of state changes and actions
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

export interface LoggerConfig {
  name: string
  enabled?: boolean
  collapsed?: boolean
  timestamp?: boolean
  duration?: boolean
  diff?: boolean
  colors?: {
    title?: string
    prevState?: string
    action?: string
    nextState?: string
    error?: string
    diff?: {
      add?: string
      delete?: string
      change?: string
    }
  }
  filter?: (action: string) => boolean
  actionTransformer?: (action: any) => any
  stateTransformer?: (state: any) => any
  errorTransformer?: (error: any) => any
  predicate?: (getState: () => any, action: any) => boolean
  diffPredicate?: (getState: () => any, action: any) => boolean
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  name: 'Store',
  enabled: process.env.NODE_ENV === 'development',
  collapsed: true,
  timestamp: true,
  duration: true,
  diff: true,
  colors: {
    title: '#764ABC',
    prevState: '#9E9E9E',
    action: '#03A9F4',
    nextState: '#4CAF50',
    error: '#F44336',
    diff: {
      add: '#4CAF50',
      delete: '#F44336',
      change: '#FF9800'
    }
  }
}

/**
 * Calculate diff between two objects
 */
function calculateDiff(prev: any, next: any): any {
  const diff: any = {}
  
  // Check for added/changed keys
  Object.keys(next).forEach(key => {
    if (!(key in prev)) {
      diff[`+${key}`] = next[key]
    } else if (prev[key] !== next[key]) {
      diff[`~${key}`] = {
        from: prev[key],
        to: next[key]
      }
    }
  })
  
  // Check for deleted keys
  Object.keys(prev).forEach(key => {
    if (!(key in next)) {
      diff[`-${key}`] = prev[key]
    }
  })
  
  return Object.keys(diff).length > 0 ? diff : null
}

/**
 * Format timestamp
 */
function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${
    date.getMinutes().toString().padStart(2, '0')}:${
    date.getSeconds().toString().padStart(2, '0')}.${
    date.getMilliseconds().toString().padStart(3, '0')}`
}

/**
 * Create state logger middleware
 */
export const createLogger = <T>(config: Partial<LoggerConfig> = {}) => {
  const options = { ...defaultConfig, ...config }
  
  return <
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    storeCreator: StateCreator<T, Mps, Mcs, T>
  ): StateCreator<T, Mps, Mcs, T> => {
    return (set, get, api) => {
      const loggedSet: typeof set = (partial, replace, action) => {
        if (!options.enabled) {
          return set(partial, replace, action)
        }
        
        const actionName = action || 'anonymous'
        
        // Check filter
        if (options.filter && !options.filter(actionName as string)) {
          return set(partial, replace, action)
        }
        
        // Get previous state
        const prevState = get()
        const startTime = performance.now()
        
        // Check predicate
        if (options.predicate && !options.predicate(() => prevState, action)) {
          return set(partial, replace, action)
        }
        
        // Transform for logging
        const transformedPrevState = options.stateTransformer 
          ? options.stateTransformer(prevState) 
          : prevState
        
        const transformedAction = options.actionTransformer
          ? options.actionTransformer(action)
          : action
        
        // Create log group
        const groupMethod = options.collapsed ? console.groupCollapsed : console.group
        
        try {
          // Log header
          const timestamp = options.timestamp ? ` @ ${formatTime(new Date())}` : ''
          const title = `%c${options.name} → ${actionName}${timestamp}`
          
          groupMethod(title, `color: ${options.colors?.title}; font-weight: bold;`)
          
          // Log previous state
          console.log('%cprev state', `color: ${options.colors?.prevState}; font-weight: bold;`, transformedPrevState)
          
          // Log action
          console.log('%caction    ', `color: ${options.colors?.action}; font-weight: bold;`, transformedAction)
          
          // Execute the actual state update
          set(partial, replace, action)
          
          // Get next state
          const nextState = get()
          const transformedNextState = options.stateTransformer 
            ? options.stateTransformer(nextState) 
            : nextState
          
          // Log next state
          console.log('%cnext state', `color: ${options.colors?.nextState}; font-weight: bold;`, transformedNextState)
          
          // Log diff if enabled
          if (options.diff) {
            const shouldShowDiff = !options.diffPredicate || options.diffPredicate(() => prevState, action)
            
            if (shouldShowDiff) {
              const diff = calculateDiff(transformedPrevState, transformedNextState)
              if (diff) {
                console.log('%cdiff      ', `color: ${options.colors?.diff?.change}; font-weight: bold;`, diff)
              }
            }
          }
          
          // Log duration if enabled
          if (options.duration) {
            const duration = performance.now() - startTime
            console.log(`%cduration  `, `color: ${options.colors?.title}; font-weight: bold;`, `${duration.toFixed(2)}ms`)
          }
          
        } catch (error) {
          // Log error
          const transformedError = options.errorTransformer
            ? options.errorTransformer(error)
            : error
            
          console.log('%cerror     ', `color: ${options.colors?.error}; font-weight: bold;`, transformedError)
          
          // Re-throw error
          throw error
        } finally {
          console.groupEnd()
        }
      }
      
      return storeCreator(loggedSet, get, api)
    }
  }
}

/**
 * Create action-specific logger
 */
export function createActionLogger(storeName: string, actionName: string) {
  const startTime = performance.now()
  let logged = false
  
  return {
    log: (message: string, data?: any) => {
      if (!logged) {
        console.group(`%c[${storeName}] ${actionName}`, 'color: #03A9F4; font-weight: bold;')
        logged = true
      }
      if (data !== undefined) {
        console.log(message, data)
      } else {
        console.log(message)
      }
    },
    
    error: (message: string, error?: any) => {
      if (!logged) {
        console.group(`%c[${storeName}] ${actionName}`, 'color: #03A9F4; font-weight: bold;')
        logged = true
      }
      console.error(`%c${message}`, 'color: #F44336; font-weight: bold;', error)
    },
    
    end: (state?: any) => {
      if (!logged) {
        console.group(`%c[${storeName}] ${actionName}`, 'color: #03A9F4; font-weight: bold;')
        logged = true
      }
      
      const duration = performance.now() - startTime
      console.log(`Duration: ${duration.toFixed(2)}ms`)
      
      if (state) {
        console.log('Final state:', state)
      }
      
      console.groupEnd()
    }
  }
}

/**
 * Simple development logger
 */
export const logger = process.env.NODE_ENV === 'development'
  ? {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
      group: console.group.bind(console),
      groupCollapsed: console.groupCollapsed.bind(console),
      groupEnd: console.groupEnd.bind(console),
      table: console.table.bind(console),
      time: console.time.bind(console),
      timeEnd: console.timeEnd.bind(console)
    }
  : {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {},
      group: () => {},
      groupCollapsed: () => {},
      groupEnd: () => {},
      table: () => {},
      time: () => {},
      timeEnd: () => {}
    }