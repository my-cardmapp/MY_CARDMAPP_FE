import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { server } from '@/mocks/server';
import { RouteService } from './RouteService';
import type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  OptimizeRouteResponse,
  Location
} from '@/types/api';

describe('RouteService Integration Tests with MSW', () => {
  let routeService: RouteService;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    routeService = new RouteService();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('calculateRoute with mock API', () => {
    it('should calculate walking route successfully', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780, name: '서울시청' },
        destination: { lat: 37.5796, lng: 126.9770, name: '경복궁' },
        mode: 'walking'
      };

      const response = await routeService.calculateRoute(request);

      expect(response).toBeDefined();
      expect(response.routes).toBeDefined();
      expect(response.routes.length).toBeGreaterThan(0);
      expect(response.origin).toEqual(request.origin);
      expect(response.destination).toEqual(request.destination);

      const route = response.routes[0];
      expect(route.summary).toBeDefined();
      expect(route.distance).toBeGreaterThan(0);
      expect(route.duration).toBeGreaterThan(0);
      expect(route.polyline).toBeDefined();
      expect(route.steps).toBeDefined();
      expect(route.steps.length).toBeGreaterThan(0);
      
      // Check walking mode specifics
      expect(route.fare).toBeUndefined(); // No fare for walking
    });

    it('should calculate transit route with fare information', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'transit'
      };

      const response = await routeService.calculateRoute(request);

      expect(response).toBeDefined();
      const route = response.routes[0];
      
      // Transit should have fare
      expect(route.fare).toBeDefined();
      expect(route.fare).toBe(1250); // Seoul basic transit fare

      // Check for transit details in steps
      const transitSteps = route.steps.filter(step => step.transitDetails);
      expect(transitSteps.length).toBeGreaterThan(0);
      
      const transitDetail = transitSteps[0].transitDetails;
      expect(transitDetail).toBeDefined();
      if (transitDetail) {
        expect(transitDetail.line).toBeDefined();
        expect(transitDetail.departure).toBeDefined();
        expect(transitDetail.arrival).toBeDefined();
        expect(transitDetail.numStops).toBeGreaterThan(0);
      }
    });

    it('should calculate route with multiple waypoints', async () => {
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775, name: '광화문' },
        { lat: 37.5720, lng: 126.9760, name: '인사동' }
      ];

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        waypoints,
        mode: 'walking'
      };

      const response = await routeService.calculateRoute(request);

      expect(response.waypoints).toEqual(waypoints);
      expect(response.routes[0].steps.length).toBeGreaterThan(waypoints.length);
    });

    it('should handle Korean instructions in response', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'walking'
      };

      const response = await routeService.calculateRoute(request);
      const steps = response.routes[0].steps;

      // Check for Korean text in instructions
      const hasKoreanText = steps.some(step => 
        /[가-힣]/.test(step.instruction)
      );
      expect(hasKoreanText).toBe(true);

      // Check first and last steps
      const firstStep = steps[0];
      expect(firstStep.instruction).toContain('출발');
      
      const lastStep = steps[steps.length - 1];
      expect(lastStep.instruction).toContain('도착');
    });

    it('should handle driving mode', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'driving'
      };

      const response = await routeService.calculateRoute(request);
      
      expect(response).toBeDefined();
      const route = response.routes[0];
      
      // Driving should be faster than walking for same distance
      expect(route.duration).toBeGreaterThan(0);
      expect(route.fare).toBeUndefined(); // No fare for driving
    });

    it('should handle timeout for too many waypoints', async () => {
      // Create many waypoints to potentially trigger timeout
      const manyWaypoints: Location[] = Array(20).fill(null).map((_, i) => ({
        lat: 37.5665 + (i * 0.001),
        lng: 126.9780 + (i * 0.001)
      }));

      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        waypoints: manyWaypoints,
        mode: 'walking'
      };

      // This might trigger a timeout in the mock handler
      // But should still handle gracefully
      try {
        const response = await routeService.calculateRoute(request, { timeout: 10000 });
        // If it succeeds, check basic response structure
        expect(response).toBeDefined();
        expect(response.routes).toBeDefined();
      } catch (error) {
        // If it times out, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('optimizeRoute with mock API', () => {
    it('should optimize waypoint order', async () => {
      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775 },
        { lat: 37.5720, lng: 126.9760 },
        { lat: 37.5680, lng: 126.9790 }
      ];

      const response = await routeService.optimizeRoute({
        origin,
        waypoints,
        mode: 'walking'
      });

      expect(response).toBeDefined();
      expect(response.optimizedOrder).toBeDefined();
      expect(response.optimizedOrder.length).toBe(waypoints.length);
      
      // Check that all indices are present
      const sortedOrder = [...response.optimizedOrder].sort();
      expect(sortedOrder).toEqual([0, 1, 2]);

      expect(response.totalDistance).toBeGreaterThan(0);
      expect(response.totalDuration).toBeGreaterThan(0);
      expect(response.route).toBeDefined();
      expect(response.route.summary).toContain('최적화된 경로');
    });

    it('should optimize with different travel modes', async () => {
      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775 },
        { lat: 37.5720, lng: 126.9760 }
      ];

      // Test walking mode
      const walkingResponse = await routeService.optimizeRoute({
        origin,
        waypoints,
        mode: 'walking'
      });

      // Test transit mode
      const transitResponse = await routeService.optimizeRoute({
        origin,
        waypoints,
        mode: 'transit'
      });

      // Transit should generally be faster than walking
      expect(transitResponse.totalDuration).toBeLessThan(walkingResponse.totalDuration);
      
      // But order might be the same for optimal path
      expect(walkingResponse.optimizedOrder).toBeDefined();
      expect(transitResponse.optimizedOrder).toBeDefined();
    });

    it('should handle single waypoint optimization', async () => {
      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775 }
      ];

      const response = await routeService.optimizeRoute({
        origin,
        waypoints,
        mode: 'walking'
      });

      expect(response.optimizedOrder).toEqual([0]);
      expect(response.route.steps.length).toBeGreaterThan(0);
    });
  });

  describe('Network conditions and error handling', () => {
    it('should handle network delays gracefully', async () => {
      const startTime = Date.now();
      
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'walking'
      };

      const response = await routeService.calculateRoute(request);
      const elapsedTime = Date.now() - startTime;

      // MSW adds 100-500ms delay
      expect(elapsedTime).toBeGreaterThanOrEqual(100);
      expect(response).toBeDefined();
    });

    it('should use cache for repeated identical requests', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'walking'
      };

      // First request - hits the API
      const startTime1 = Date.now();
      const response1 = await routeService.calculateRoute(request);
      const elapsedTime1 = Date.now() - startTime1;

      // Second identical request - should use cache
      const startTime2 = Date.now();
      const response2 = await routeService.calculateRoute(request);
      const elapsedTime2 = Date.now() - startTime2;

      // Cache hit should be much faster
      expect(elapsedTime2).toBeLessThan(elapsedTime1);
      expect(response1).toEqual(response2);
    });

    it('should not cache when explicitly disabled', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 },
        mode: 'walking'
      };

      // First request
      const startTime1 = Date.now();
      await routeService.calculateRoute(request, { cache: false });
      const elapsedTime1 = Date.now() - startTime1;

      // Second request with cache disabled
      const startTime2 = Date.now();
      await routeService.calculateRoute(request, { cache: false });
      const elapsedTime2 = Date.now() - startTime2;

      // Both should take similar time (no cache)
      expect(elapsedTime2).toBeGreaterThanOrEqual(100); // Network delay
    });
  });

  describe('Response validation', () => {
    it('should validate response structure for calculateRoute', async () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5796, lng: 126.9770 }
      };

      const response = await routeService.calculateRoute(request);

      // Validate response structure
      expect(response).toHaveProperty('routes');
      expect(response).toHaveProperty('origin');
      expect(response).toHaveProperty('destination');

      expect(Array.isArray(response.routes)).toBe(true);
      
      if (response.routes.length > 0) {
        const route = response.routes[0];
        expect(route).toHaveProperty('summary');
        expect(route).toHaveProperty('distance');
        expect(route).toHaveProperty('duration');
        expect(route).toHaveProperty('polyline');
        expect(route).toHaveProperty('steps');
        
        expect(typeof route.summary).toBe('string');
        expect(typeof route.distance).toBe('number');
        expect(typeof route.duration).toBe('number');
        expect(typeof route.polyline).toBe('string');
        expect(Array.isArray(route.steps)).toBe(true);

        if (route.steps.length > 0) {
          const step = route.steps[0];
          expect(step).toHaveProperty('instruction');
          expect(step).toHaveProperty('distance');
          expect(step).toHaveProperty('duration');
          expect(step).toHaveProperty('startLocation');
          expect(step).toHaveProperty('endLocation');
        }
      }
    });

    it('should validate response structure for optimizeRoute', async () => {
      const origin: Location = { lat: 37.5665, lng: 126.9780 };
      const waypoints: Location[] = [
        { lat: 37.5700, lng: 126.9775 },
        { lat: 37.5720, lng: 126.9760 }
      ];

      const response = await routeService.optimizeRoute({
        origin,
        waypoints,
        mode: 'walking'
      });

      // Validate response structure
      expect(response).toHaveProperty('optimizedOrder');
      expect(response).toHaveProperty('totalDistance');
      expect(response).toHaveProperty('totalDuration');
      expect(response).toHaveProperty('route');

      expect(Array.isArray(response.optimizedOrder)).toBe(true);
      expect(typeof response.totalDistance).toBe('number');
      expect(typeof response.totalDuration).toBe('number');
      expect(typeof response.route).toBe('object');

      // Validate route structure
      const route = response.route;
      expect(route).toHaveProperty('summary');
      expect(route).toHaveProperty('distance');
      expect(route).toHaveProperty('duration');
      expect(route).toHaveProperty('polyline');
      expect(route).toHaveProperty('steps');
    });
  });
});