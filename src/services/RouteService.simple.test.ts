import { describe, it, expect } from 'vitest';
import { RouteService } from './RouteService';

describe('RouteService - Simple Test', () => {
  it('should create RouteService instance', () => {
    const service = new RouteService();
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(RouteService);
  });

  it('should validate invalid coordinates', async () => {
    const service = new RouteService();
    
    await expect(
      service.calculateRoute({
        origin: { lat: 91, lng: 126.9780 }, // Invalid latitude
        destination: { lat: 37.5796, lng: 126.9770 }
      })
    ).rejects.toThrow('Invalid coordinates');
  });
});