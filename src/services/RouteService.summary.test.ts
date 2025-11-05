import { describe, it, expect } from 'vitest';
import { RouteService } from './RouteService';
import { server } from '@/mocks/server';
import type { RouteCalculateRequest, Location } from '@/types/api';

describe('RouteService - API Integration Summary', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  it('should successfully integrate with mock route endpoints', async () => {
    const service = new RouteService();
    
    // Test calculateRoute endpoint
    const calculateRequest: RouteCalculateRequest = {
      origin: { lat: 37.5665, lng: 126.9780, name: '서울시청' },
      destination: { lat: 37.5796, lng: 126.9770, name: '경복궁' },
      mode: 'walking'
    };
    
    const routeResponse = await service.calculateRoute(calculateRequest);
    
    expect(routeResponse).toBeDefined();
    expect(routeResponse.routes).toBeDefined();
    expect(routeResponse.routes.length).toBeGreaterThan(0);
    expect(routeResponse.origin).toEqual(calculateRequest.origin);
    expect(routeResponse.destination).toEqual(calculateRequest.destination);
    
    // Test optimizeRoute endpoint
    const optimizeParams = {
      origin: { lat: 37.5665, lng: 126.9780 } as Location,
      waypoints: [
        { lat: 37.5700, lng: 126.9775 },
        { lat: 37.5720, lng: 126.9760 }
      ] as Location[],
      mode: 'walking' as const
    };
    
    const optimizeResponse = await service.optimizeRoute(optimizeParams);
    
    expect(optimizeResponse).toBeDefined();
    expect(optimizeResponse.optimizedOrder).toBeDefined();
    expect(optimizeResponse.totalDistance).toBeGreaterThan(0);
    expect(optimizeResponse.totalDuration).toBeGreaterThan(0);
    expect(optimizeResponse.route).toBeDefined();
  });

  it('should handle Korean language in route instructions', async () => {
    const service = new RouteService();
    
    const request: RouteCalculateRequest = {
      origin: { lat: 37.5665, lng: 126.9780 },
      destination: { lat: 37.5796, lng: 126.9770 },
      mode: 'transit'
    };
    
    const response = await service.calculateRoute(request);
    const steps = response.routes[0].steps;
    
    // Check for Korean text
    const hasKoreanInstructions = steps.some(step => 
      /[가-힣]/.test(step.instruction)
    );
    
    expect(hasKoreanInstructions).toBe(true);
    
    // Check transit details
    const transitSteps = steps.filter(step => step.transitDetails);
    expect(transitSteps.length).toBeGreaterThan(0);
    
    if (transitSteps.length > 0) {
      const transitDetail = transitSteps[0].transitDetails!;
      expect(/[가-힣]/.test(transitDetail.line)).toBe(true); // Korean transit line
      expect(/[가-힣]/.test(transitDetail.departure)).toBe(true); // Korean station name
    }
  });

  it('should validate the mock API response structure', async () => {
    const service = new RouteService();
    
    const request: RouteCalculateRequest = {
      origin: { lat: 37.5665, lng: 126.9780 },
      destination: { lat: 37.5796, lng: 126.9770 },
      waypoints: [{ lat: 37.5700, lng: 126.9775 }],
      mode: 'walking'
    };
    
    const response = await service.calculateRoute(request);
    
    // Validate complete response structure
    expect(response).toHaveProperty('routes');
    expect(response).toHaveProperty('origin');
    expect(response).toHaveProperty('destination');
    expect(response).toHaveProperty('waypoints');
    
    const route = response.routes[0];
    expect(route).toHaveProperty('summary');
    expect(route).toHaveProperty('distance');
    expect(route).toHaveProperty('duration');
    expect(route).toHaveProperty('polyline');
    expect(route).toHaveProperty('steps');
    
    // Validate step structure
    const step = route.steps[0];
    expect(step).toHaveProperty('instruction');
    expect(step).toHaveProperty('distance');
    expect(step).toHaveProperty('duration');
    expect(step).toHaveProperty('startLocation');
    expect(step).toHaveProperty('endLocation');
    
    // Validate types
    expect(typeof route.distance).toBe('number');
    expect(typeof route.duration).toBe('number');
    expect(typeof route.polyline).toBe('string');
    expect(Array.isArray(route.steps)).toBe(true);
  });
});