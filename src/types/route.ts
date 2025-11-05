/**
 * Route-specific types
 * These are re-exported from api.d.ts for convenience
 */

export type RouteMode = 'walking' | 'transit' | 'driving';

// Re-export route types from api.d.ts
export type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  Route,
  RouteStep,
  TransitDetails,
  OptimizeRouteRequest,
  OptimizeRouteResponse,
} from './api';