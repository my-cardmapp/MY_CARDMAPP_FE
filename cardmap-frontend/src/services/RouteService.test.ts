import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RouteService } from './RouteService';
import type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  OptimizeRouteResponse,
  Location,
  ErrorResponse,
  Route,
  RouteStep,
  TransitDetails
} from '@/types/api';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RouteService', () => {
  let routeService: RouteService;

  beforeEach(() => {
    routeService = new RouteService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateRoute', () => {
    const mockOrigin: Location = {
      lat: 37.5665,
      lng: 126.9780,
      name: '서울시청'
    };

    const mockDestination: Location = {
      lat: 37.5796,
      lng: 126.9770,
      name: '경복궁'
    };

    const mockWaypoints: Location[] = [
      { lat: 37.5700, lng: 126.9775, name: '광화문' }
    ];

    const mockRouteResponse: RouteCalculateResponse = {
      routes: [{
        summary: '서울시청에서 경복궁까지',
        distance: 1500,
        duration: 900,
        polyline: 'encoded_polyline_string',
        steps: [
          {
            instruction: '출발: 서울시청에서 북쪽으로 이동하세요',
            distance: 500,
            duration: 300,
            startLocation: mockOrigin,
            endLocation: { lat: 37.5700, lng: 126.9775 }
          },
          {
            instruction: '도착: 목적지에 도착했습니다',
            distance: 0,
            duration: 0,
            startLocation: mockDestination,
            endLocation: mockDestination
          }
        ]
      }],
      origin: mockOrigin,
      destination: mockDestination,
      waypoints: mockWaypoints
    };

    it('should calculate route successfully with default walking mode', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRouteResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination
      };

      const result = await routeService.calculateRoute(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/routes/calculate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(request)
        })
      );

      expect(result).toEqual(mockRouteResponse);
      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].distance).toBe(1500);
      expect(result.routes[0].duration).toBe(900);
    });

    it('should calculate route with waypoints', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRouteResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination,
        waypoints: mockWaypoints,
        mode: 'walking'
      };

      const result = await routeService.calculateRoute(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/routes/calculate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );

      expect(result.waypoints).toEqual(mockWaypoints);
    });

    it('should calculate route with transit mode', async () => {
      const transitResponse: RouteCalculateResponse = {
        ...mockRouteResponse,
        routes: [{
          ...mockRouteResponse.routes[0],
          fare: 1250,
          steps: [
            {
              instruction: '2호선을(를) 타고 시청역에서 을지로입구역까지 2개 정류장 이동',
              distance: 800,
              duration: 180,
              startLocation: mockOrigin,
              endLocation: { lat: 37.5660, lng: 126.9826 },
              transitDetails: {
                line: '2호선',
                departure: '시청역',
                arrival: '을지로입구역',
                numStops: 2
              }
            }
          ]
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => transitResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination,
        mode: 'transit'
      };

      const result = await routeService.calculateRoute(request);

      expect(result.routes[0].fare).toBe(1250);
      expect(result.routes[0].steps[0].transitDetails).toBeDefined();
      expect(result.routes[0].steps[0].transitDetails?.line).toBe('2호선');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination
      };

      await expect(routeService.calculateRoute(request)).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      const errorResponse: ErrorResponse = {
        timestamp: new Date().toISOString(),
        status: 500,
        error: 'Internal Server Error',
        message: 'Route calculation failed',
        path: '/api/v1/routes/calculate'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => errorResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination
      };

      await expect(routeService.calculateRoute(request)).rejects.toThrow('Route calculation failed');
    });

    it('should handle timeout errors', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);

      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Request timeout'));
          }, 200);
        });
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination,
        waypoints: Array(10).fill(mockWaypoints[0]) // Many waypoints to trigger timeout
      };

      await expect(routeService.calculateRoute(request, { timeout: 100 }))
        .rejects.toThrow('Request timeout');
    });

    it('should validate request parameters', async () => {
      const invalidRequest = {
        origin: { lat: 91, lng: 126.9780 }, // Invalid latitude
        destination: mockDestination
      } as RouteCalculateRequest;

      await expect(routeService.calculateRoute(invalidRequest))
        .rejects.toThrow('Invalid coordinates: latitude must be between -90 and 90');
    });

    it('should handle empty route response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [],
          origin: mockOrigin,
          destination: mockDestination
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: mockOrigin,
        destination: mockDestination
      };

      const result = await routeService.calculateRoute(request);
      expect(result.routes).toHaveLength(0);
    });
  });

  describe('optimizeRoute', () => {
    const mockOrigin: Location = {
      lat: 37.5665,
      lng: 126.9780
    };

    const mockWaypoints: Location[] = [
      { lat: 37.5700, lng: 126.9775 },
      { lat: 37.5720, lng: 126.9760 },
      { lat: 37.5680, lng: 126.9790 }
    ];

    const mockOptimizeResponse: OptimizeRouteResponse = {
      optimizedOrder: [2, 0, 1],
      totalDistance: 2500,
      totalDuration: 1500,
      route: {
        summary: '최적화된 경로 (3개 경유지)',
        distance: 2500,
        duration: 1500,
        polyline: 'optimized_polyline',
        steps: []
      }
    };

    it('should optimize route successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizeResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const result = await routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'walking'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/routes/optimize'),
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockOptimizeResponse);
      expect(result.optimizedOrder).toEqual([2, 0, 1]);
      expect(result.totalDistance).toBe(2500);
    });

    it('should handle empty waypoints', async () => {
      await expect(routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: [],
        mode: 'walking'
      })).rejects.toThrow('At least one waypoint is required');
    });

    it('should format URL parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizeResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      await routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'transit'
      });

      const callArgs = mockFetch.mock.calls[0];
      const url = new URL(callArgs[0]);
      
      expect(url.searchParams.get('origin')).toBe('37.5665,126.978');
      expect(url.searchParams.get('waypoints')).toBe('37.57,126.9775;37.572,126.976;37.568,126.979');
      expect(url.searchParams.get('mode')).toBe('transit');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'walking'
      })).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      const errorResponse: ErrorResponse = {
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: 'Invalid waypoints',
        path: '/api/v1/routes/optimize'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      await expect(routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'walking'
      })).rejects.toThrow('Invalid waypoints');
    });

    it('should apply retry logic on transient errors', async () => {
      // First call fails with 503
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          timestamp: new Date().toISOString(),
          status: 503,
          error: 'Service Unavailable',
          message: 'Service temporarily unavailable',
          path: '/api/v1/routes/optimize'
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOptimizeResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const result = await routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'walking'
      }, { retries: 1 });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockOptimizeResponse);
    });

    it('should respect max retry attempts', async () => {
      // All calls fail
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({
            timestamp: new Date().toISOString(),
            status: 503,
            error: 'Service Unavailable',
            message: 'Service temporarily unavailable',
            path: '/api/v1/routes/optimize'
          }),
          headers: new Headers({ 'Content-Type': 'application/json' })
        });
      }

      await expect(routeService.optimizeRoute({
        origin: mockOrigin,
        waypoints: mockWaypoints,
        mode: 'walking'
      }, { retries: 2 })).rejects.toThrow('Service temporarily unavailable');

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('caching', () => {
    it('should cache successful route calculations', async () => {
      const mockResponse: RouteCalculateResponse = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // First call - should hit the API
      const result1 = await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with same params - should use cache
      const result2 = await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2

      expect(result1).toEqual(result2);
    });

    it('should not cache failed requests', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [],
          origin: { lat: 37.5665, lng: 126.9780 },
          destination: { lat: 37.5796, lng: 126.9770 }
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // First call fails
      await expect(routeService.calculateRoute(request)).rejects.toThrow('Network error');

      // Second call should try again, not use cache
      await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache after TTL expires', async () => {
      vi.useFakeTimers();

      const mockResponse: RouteCalculateResponse = {
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // First call
      await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time past cache TTL (default 5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Second call should hit API again
      await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('should clear cache on demand', async () => {
      const mockResponse: RouteCalculateResponse = {
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      // First call
      await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache
      routeService.clearCache();

      // Second call should hit API again
      await routeService.calculateRoute(request);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('request options', () => {
    it('should apply custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [],
          origin: { lat: 37.5665, lng: 126.9780 },
          destination: { lat: 37.5796, lng: 126.9770 }
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      await routeService.calculateRoute(request, {
        headers: {
          'X-Custom-Header': 'test-value'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value'
          })
        })
      );
    });

    it('should apply request interceptor', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          routes: [],
          origin: { lat: 37.5665, lng: 126.9780 },
          destination: { lat: 37.5796, lng: 126.9770 }
        }),
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const interceptor = vi.fn((config) => {
        config.headers['X-Intercepted'] = 'true';
        return config;
      });

      routeService.setRequestInterceptor(interceptor);

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      await routeService.calculateRoute(request);

      expect(interceptor).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Intercepted': 'true'
          })
        })
      );
    });

    it('should apply response interceptor', async () => {
      const originalResponse: RouteCalculateResponse = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => originalResponse,
        headers: new Headers({ 'Content-Type': 'application/json' })
      });

      const interceptor = vi.fn((response: RouteCalculateResponse) => {
        response.routes[0].distance = 2000; // Modify response
        return response;
      });

      routeService.setResponseInterceptor(interceptor);

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      const result = await routeService.calculateRoute(request);

      expect(interceptor).toHaveBeenCalled();
      expect(result.routes[0].distance).toBe(2000); // Modified value
    });
  });
});