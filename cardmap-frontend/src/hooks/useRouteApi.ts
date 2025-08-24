import { useState, useCallback, useRef } from 'react';
import { RouteService } from '@/services/RouteService';
import type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  OptimizeRouteResponse,
  Location
} from '@/types/api';

interface UseRouteApiReturn {
  // Data
  routeData: RouteCalculateResponse | null;
  optimizedData: OptimizeRouteResponse | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Methods
  calculateRoute: (request: RouteCalculateRequest) => Promise<void>;
  optimizeRoute: (params: {
    origin: Location;
    waypoints: Location[];
    mode?: 'walking' | 'transit' | 'driving';
  }) => Promise<void>;
  clearRoute: () => void;
  clearCache: () => void;
  abort: () => void;
}

export function useRouteApi(): UseRouteApiReturn {
  const [routeData, setRouteData] = useState<RouteCalculateResponse | null>(null);
  const [optimizedData, setOptimizedData] = useState<OptimizeRouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const serviceRef = useRef<RouteService>();
  const abortControllerRef = useRef<AbortController>();
  
  // Get or create service instance
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new RouteService();
    }
    return serviceRef.current;
  }, []);
  
  // Calculate route
  const calculateRoute = useCallback(async (request: RouteCalculateRequest) => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const service = getService();
      const response = await service.calculateRoute(request, {
        signal: abortControllerRef.current.signal as any
      });
      
      setRouteData(response);
      setOptimizedData(null); // Clear optimized data when calculating new route
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message === 'Aborted') {
          setError('Route calculation aborted');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
      setRouteData(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = undefined;
    }
  }, [getService]);
  
  // Optimize route
  const optimizeRoute = useCallback(async (params: {
    origin: Location;
    waypoints: Location[];
    mode?: 'walking' | 'transit' | 'driving';
  }) => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const service = getService();
      const response = await service.optimizeRoute(params, {
        signal: abortControllerRef.current.signal as any
      });
      
      setOptimizedData(response);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message === 'Aborted') {
          setError('Route optimization aborted');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
      setOptimizedData(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = undefined;
    }
  }, [getService]);
  
  // Clear route data
  const clearRoute = useCallback(() => {
    setRouteData(null);
    setOptimizedData(null);
    setError(null);
  }, []);
  
  // Clear cache
  const clearCache = useCallback(() => {
    const service = getService();
    service.clearCache();
  }, [getService]);
  
  // Abort ongoing request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  }, []);
  
  return {
    routeData,
    optimizedData,
    isLoading,
    error,
    calculateRoute,
    optimizeRoute,
    clearRoute,
    clearCache,
    abort
  };
}