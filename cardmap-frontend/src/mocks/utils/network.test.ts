import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createNetworkDelay, 
  shouldTriggerError, 
  getErrorResponse,
  NetworkErrorType,
  isErrorTrigger 
} from './network';

describe('Network Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset random to predictable state for testing
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createNetworkDelay', () => {
    it('should create delay within specified range', async () => {
      const startTime = Date.now();
      await createNetworkDelay();
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Should be between 100-700ms (base 100-500 + jitter 0-200)
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow small variance
      expect(elapsed).toBeLessThanOrEqual(750);
    });

    it('should use custom base delay', async () => {
      const startTime = Date.now();
      await createNetworkDelay(1000);
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Should be between 1000-1200ms (base 1000 + jitter 0-200)
      // Adding some tolerance for system delays
      expect(elapsed).toBeGreaterThanOrEqual(900);
      expect(elapsed).toBeLessThanOrEqual(1300);
    });

    it('should apply jitter randomly', async () => {
      const delays: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await createNetworkDelay(100);
        const endTime = Date.now();
        delays.push(endTime - startTime);
      }
      
      // Not all delays should be exactly the same
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe('isErrorTrigger', () => {
    it('should detect 404 trigger for merchant ID > 10000', () => {
      expect(isErrorTrigger('merchant', 10001)).toBe(true);
      expect(isErrorTrigger('merchant', 10000)).toBe(false);
      expect(isErrorTrigger('merchant', 9999)).toBe(false);
    });

    it('should detect 500 trigger for error search terms', () => {
      expect(isErrorTrigger('search', 'error')).toBe(true);
      expect(isErrorTrigger('search', '오류')).toBe(true);
      expect(isErrorTrigger('search', 'normal search')).toBe(false);
      expect(isErrorTrigger('search', '편의점')).toBe(false);
    });

    it('should detect 401 trigger for auth without token', () => {
      expect(isErrorTrigger('auth', null)).toBe(true);
      expect(isErrorTrigger('auth', undefined)).toBe(true);
      expect(isErrorTrigger('auth', 'Bearer token123')).toBe(false);
    });

    it('should detect timeout trigger for long routes', () => {
      const longRoute = {
        waypoints: Array(10).fill({ lat: 37.5, lng: 127.0 })
      };
      expect(isErrorTrigger('route', longRoute)).toBe(true);
      
      const shortRoute = {
        waypoints: Array(3).fill({ lat: 37.5, lng: 127.0 })
      };
      expect(isErrorTrigger('route', shortRoute)).toBe(false);
    });
  });

  describe('shouldTriggerError', () => {
    it('should trigger random errors based on probability', () => {
      const results: boolean[] = [];
      
      // Mock Math.random to test probability
      let callCount = 0;
      (Math.random as any).mockImplementation(() => {
        const values = [0.01, 0.04, 0.06, 0.10, 0.15]; // Mix of values
        return values[callCount++ % values.length];
      });
      
      // Test with 5% error rate
      for (let i = 0; i < 5; i++) {
        results.push(shouldTriggerError('GET', 0.05));
      }
      
      // Should have some true and some false
      expect(results.filter(r => r).length).toBeGreaterThan(0);
      expect(results.filter(r => !r).length).toBeGreaterThan(0);
    });

    it('should not trigger errors for non-GET requests by default', () => {
      (Math.random as any).mockReturnValue(0.01); // Would trigger for GET
      
      expect(shouldTriggerError('POST', 0.05)).toBe(false);
      expect(shouldTriggerError('PUT', 0.05)).toBe(false);
      expect(shouldTriggerError('DELETE', 0.05)).toBe(false);
    });

    it('should respect error rate parameter', () => {
      (Math.random as any).mockReturnValue(0.08);
      
      expect(shouldTriggerError('GET', 0.05)).toBe(false); // 8% > 5%
      expect(shouldTriggerError('GET', 0.10)).toBe(true);  // 8% < 10%
    });
  });

  describe('getErrorResponse', () => {
    it('should return 404 error response', () => {
      const error = getErrorResponse(NetworkErrorType.NOT_FOUND, '/api/v1/merchants/10001');
      
      expect(error.status).toBe(404);
      expect(error.error).toBe('Not Found');
      expect(error.message).toContain('찾을 수 없습니다');
      expect(error.path).toBe('/api/v1/merchants/10001');
      expect(error.timestamp).toBeDefined();
      expect(error.requestId).toBeDefined();
    });

    it('should return 500 error response', () => {
      const error = getErrorResponse(NetworkErrorType.SERVER_ERROR, '/api/v1/merchants/search');
      
      expect(error.status).toBe(500);
      expect(error.error).toBe('Internal Server Error');
      expect(error.message).toContain('서버 오류');
      expect(error.path).toBe('/api/v1/merchants/search');
    });

    it('should return 401 error response', () => {
      const error = getErrorResponse(NetworkErrorType.UNAUTHORIZED, '/api/v1/auth/refresh');
      
      expect(error.status).toBe(401);
      expect(error.error).toBe('Unauthorized');
      expect(error.message).toContain('인증');
      expect(error.path).toBe('/api/v1/auth/refresh');
    });

    it('should return 408 timeout error response', () => {
      const error = getErrorResponse(NetworkErrorType.TIMEOUT, '/api/v1/routes/calculate');
      
      expect(error.status).toBe(408);
      expect(error.error).toBe('Request Timeout');
      expect(error.message).toContain('시간 초과');
      expect(error.path).toBe('/api/v1/routes/calculate');
    });

    it('should return 503 service unavailable error', () => {
      const error = getErrorResponse(NetworkErrorType.SERVICE_UNAVAILABLE, '/api/v1/merchants');
      
      expect(error.status).toBe(503);
      expect(error.error).toBe('Service Unavailable');
      expect(error.message).toContain('일시적으로 사용할 수 없습니다');
      expect(error.path).toBe('/api/v1/merchants');
    });

    it('should include custom details when provided', () => {
      const details = { field: 'email', reason: '잘못된 형식' };
      const error = getErrorResponse(
        NetworkErrorType.BAD_REQUEST, 
        '/api/v1/auth/login',
        details
      );
      
      expect(error.status).toBe(400);
      expect(error.details).toEqual(details);
    });

    it('should generate unique request IDs', () => {
      const error1 = getErrorResponse(NetworkErrorType.NOT_FOUND, '/api/v1/test');
      const error2 = getErrorResponse(NetworkErrorType.NOT_FOUND, '/api/v1/test');
      
      expect(error1.requestId).not.toBe(error2.requestId);
    });
  });

  describe('Integration with MSW handlers', () => {
    it('should handle merchant 404 scenario', () => {
      const merchantId = 10001;
      const trigger = isErrorTrigger('merchant', merchantId);
      expect(trigger).toBe(true);
      
      if (trigger) {
        const error = getErrorResponse(NetworkErrorType.NOT_FOUND, `/api/v1/merchants/${merchantId}`);
        expect(error.status).toBe(404);
      }
    });

    it('should handle search 500 scenario', () => {
      const searchTerm = '오류';
      const trigger = isErrorTrigger('search', searchTerm);
      expect(trigger).toBe(true);
      
      if (trigger) {
        const error = getErrorResponse(NetworkErrorType.SERVER_ERROR, '/api/v1/merchants/search');
        expect(error.status).toBe(500);
      }
    });

    it('should handle auth 401 scenario', () => {
      const token = null;
      const trigger = isErrorTrigger('auth', token);
      expect(trigger).toBe(true);
      
      if (trigger) {
        const error = getErrorResponse(NetworkErrorType.UNAUTHORIZED, '/api/v1/auth/refresh');
        expect(error.status).toBe(401);
      }
    });

    it('should handle route timeout scenario', () => {
      const routeData = {
        waypoints: Array(10).fill({ lat: 37.5, lng: 127.0 })
      };
      const trigger = isErrorTrigger('route', routeData);
      expect(trigger).toBe(true);
      
      if (trigger) {
        const error = getErrorResponse(NetworkErrorType.TIMEOUT, '/api/v1/routes/calculate');
        expect(error.status).toBe(408);
      }
    });
  });
});