import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouteApi } from './useRouteApi';
import type { RouteCalculateRequest, Location } from '@/types/api';

// Create mock functions
const mockCalculateRoute = vi.fn();
const mockOptimizeRoute = vi.fn();
const mockClearCache = vi.fn();

// Mock the RouteService
vi.mock('@/services/RouteService', () => {
  return {
    RouteService: vi.fn().mockImplementation(() => ({
      calculateRoute: mockCalculateRoute,
      optimizeRoute: mockOptimizeRoute,
      clearCache: mockClearCache
    }))
  };
});

describe('useRouteApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculateRoute.mockClear();
    mockOptimizeRoute.mockClear();
    mockClearCache.mockClear();
  });

  describe('calculateRoute', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useRouteApi());

      expect(result.current.routeData).toBeNull();
      expect(result.current.optimizedData).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should calculate route successfully', async () => {
      const mockRouteResponse = {
        routes: [{
          summary: 'Test route',
          distance: 1000,
          duration: 600,
          polyline: 'test_polyline',
          steps: []
        }],
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      mockCalculateRoute.mockResolvedValue(mockRouteResponse);

      const { result } = renderHook(() => useRouteApi());

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      await act(async () => {
        await result.current.calculateRoute(request);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.routeData).toEqual(mockRouteResponse);
      expect(result.current.error).toBeNull();
      expect(mockCalculateRoute).toHaveBeenCalledWith(request, expect.any(Object));
    });

    it('should handle route calculation error', async () => {
      mockCalculateRoute.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRouteApi());

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      await act(async () => {
        await result.current.calculateRoute(request);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.routeData).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should set loading state during calculation', async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockCalculateRoute.mockReturnValue(delayedPromise);

      const { result } = renderHook(() => useRouteApi());

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // Start the async operation without awaiting
      act(() => {
        result.current.calculateRoute(request);
      });

      // Check loading state immediately
      expect(result.current.isLoading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ routes: [] });
        await delayedPromise;
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('optimizeRoute', () => {
    it('should optimize route successfully', async () => {
      const mockOptimizeResponse = {
        optimizedOrder: [2, 0, 1],
        totalDistance: 2500,
        totalDuration: 1500,
        route: {
          summary: 'Optimized route',
          distance: 2500,
          duration: 1500,
          polyline: 'optimized_polyline',
          steps: []
        }
      };

      mockOptimizeRoute.mockResolvedValue(mockOptimizeResponse);

      const { result } = renderHook(() => useRouteApi());

      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775 },
        { lat: 37.5720, lng: 126.9760 },
        { lat: 37.5680, lng: 126.9790 }
      ];

      await act(async () => {
        await result.current.optimizeRoute({
          origin,
          waypoints,
          mode: 'walking'
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.optimizedData).toEqual(mockOptimizeResponse);
      expect(result.current.error).toBeNull();
      expect(mockOptimizeRoute).toHaveBeenCalledWith(
        { origin, waypoints, mode: 'walking' },
        expect.any(Object)
      );
    });

    it('should handle optimization error', async () => {
      mockOptimizeRoute.mockRejectedValue(new Error('Invalid waypoints'));

      const { result } = renderHook(() => useRouteApi());

      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [];

      await act(async () => {
        await result.current.optimizeRoute({
          origin,
          waypoints,
          mode: 'walking'
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.optimizedData).toBeNull();
      expect(result.current.error).toBe('Invalid waypoints');
    });
  });

  describe('clearRoute', () => {
    it('should clear route data', async () => {
      const mockRouteResponse = {
        routes: [{
          summary: 'Test route',
          distance: 1000,
          duration: 600,
          polyline: 'test_polyline',
          steps: []
        }],
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      mockCalculateRoute.mockResolvedValue(mockRouteResponse);

      const { result } = renderHook(() => useRouteApi());

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      await act(async () => {
        await result.current.calculateRoute(request);
      });

      expect(result.current.routeData).toEqual(mockRouteResponse);

      // Clear the route
      act(() => {
        result.current.clearRoute();
      });

      expect(result.current.routeData).toBeNull();
      expect(result.current.optimizedData).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should call service clearCache method', () => {
      const { result } = renderHook(() => useRouteApi());

      act(() => {
        result.current.clearCache();
      });

      expect(mockClearCache).toHaveBeenCalled();
    });
  });

  describe('abort functionality', () => {
    it('should handle abort signal', async () => {
      // Create a promise that will be aborted
      mockCalculateRoute.mockImplementation(() => 
        Promise.reject(new Error('Aborted'))
      );

      const { result } = renderHook(() => useRouteApi());

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // Start calculation
      await act(async () => {
        await result.current.calculateRoute(request);
      });

      // Check that error was set correctly
      expect(result.current.error).toBe('Route calculation aborted');
    });

    it('should abort ongoing request when new request starts', async () => {
      const mockRouteResponse = {
        routes: [{
          summary: 'Test route',
          distance: 1000,
          duration: 600,
          polyline: 'test_polyline',
          steps: []
        }],
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      mockCalculateRoute.mockResolvedValue(mockRouteResponse);

      const { result } = renderHook(() => useRouteApi());

      const request1: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      const request2: RouteCalculateRequest = {
        origin: { lat: 37.5700, lng: 126.9775 },
        destination: { lat: 37.5720, lng: 126.9760 }
      };

      // Start first calculation
      await act(async () => {
        await result.current.calculateRoute(request1);
      });

      // Start second calculation (should abort first)
      await act(async () => {
        await result.current.calculateRoute(request2);
      });

      // Should have called twice
      expect(mockCalculateRoute).toHaveBeenCalledTimes(2);
    });
  });
});