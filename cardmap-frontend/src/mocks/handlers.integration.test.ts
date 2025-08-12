import { describe, it, expect, beforeAll } from 'vitest';
import { handlers } from './handlers';
import { rest } from 'msw';

describe('MSW Handlers Integration', () => {
  describe('Handler Groups', () => {
    it('should include merchant handlers', () => {
      const merchantEndpoints = [
        '/api/v1/merchants',
        '/api/v1/merchants/nearby',
        '/api/v1/merchants/search',
        '/api/v1/merchants/:id'
      ];

      merchantEndpoints.forEach(endpoint => {
        const hasHandler = handlers.some(handler => {
          if ('info' in handler && handler.info.path) {
            const path = handler.info.path;
            // Remove wildcard prefix for comparison
            const cleanPath = path.startsWith('*') ? path.substring(1) : path;
            // Check exact match or pattern match
            return cleanPath === endpoint || 
                   (endpoint.includes(':id') && cleanPath.includes(':id'));
          }
          return false;
        });
        expect(hasHandler, `Missing handler for ${endpoint}`).toBe(true);
      });
    });

    it('should include route handlers', () => {
      const routeEndpoints = [
        '/api/v1/routes/calculate',
        '/api/v1/routes/optimize'
      ];

      routeEndpoints.forEach(endpoint => {
        const hasHandler = handlers.some(handler => {
          if ('info' in handler && handler.info.path) {
            const path = handler.info.path;
            const cleanPath = path.startsWith('*') ? path.substring(1) : path;
            return cleanPath === endpoint;
          }
          return false;
        });
        expect(hasHandler, `Missing handler for ${endpoint}`).toBe(true);
      });
    });

    it('should include card handlers', () => {
      const cardEndpoints = [
        '/api/v1/cards',
        '/api/v1/cards/:code'
      ];

      cardEndpoints.forEach(endpoint => {
        const hasHandler = handlers.some(handler => {
          if ('info' in handler && handler.info.path) {
            const path = handler.info.path;
            const cleanPath = path.startsWith('*') ? path.substring(1) : path;
            return cleanPath === endpoint || 
                   (endpoint.includes(':code') && cleanPath.includes(':code'));
          }
          return false;
        });
        expect(hasHandler, `Missing handler for ${endpoint}`).toBe(true);
      });
    });

    it('should include auth handlers', () => {
      const authEndpoints = [
        '/api/v1/auth/login',
        '/api/v1/auth/logout',
        '/api/v1/auth/refresh'
      ];

      authEndpoints.forEach(endpoint => {
        const hasHandler = handlers.some(handler => {
          if ('info' in handler && handler.info.path) {
            const path = handler.info.path;
            const cleanPath = path.startsWith('*') ? path.substring(1) : path;
            return cleanPath === endpoint;
          }
          return false;
        });
        expect(hasHandler, `Missing handler for ${endpoint}`).toBe(true);
      });
    });

    it('should include suggestion handlers', () => {
      const suggestionEndpoints = [
        '/api/v1/suggestions/search',
        '/api/v1/suggestions/recent',
        '/api/v1/suggestions/categories'
      ];

      suggestionEndpoints.forEach(endpoint => {
        const hasHandler = handlers.some(handler => {
          if ('info' in handler && handler.info.path) {
            const path = handler.info.path;
            const cleanPath = path.startsWith('*') ? path.substring(1) : path;
            return cleanPath === endpoint;
          }
          return false;
        });
        expect(hasHandler, `Missing handler for ${endpoint}`).toBe(true);
      });
    });
  });

  describe('Handler Count', () => {
    it('should have the expected number of handlers', () => {
      // Expected handlers:
      // Merchants: 4 (list, nearby, search, detail)
      // Routes: 2 (calculate, optimize)
      // Cards: 2 (list, detail)
      // Auth: 3 (login, logout, refresh)
      // Suggestions: 3 (search, recent, categories)
      // Total: 14
      expect(handlers.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Handler Methods', () => {
    it('should have correct HTTP methods for auth endpoints', () => {
      const authLoginHandler = handlers.find(handler => {
        if ('info' in handler && handler.info.path) {
          const path = handler.info.path;
          const cleanPath = path.startsWith('*') ? path.substring(1) : path;
          return cleanPath === '/api/v1/auth/login';
        }
        return false;
      });
      
      expect(authLoginHandler).toBeDefined();
      if (authLoginHandler && 'info' in authLoginHandler) {
        expect(authLoginHandler.info.method).toBe('POST');
      }
    });

    it('should have correct HTTP methods for route endpoints', () => {
      const calculateHandler = handlers.find(handler => {
        if ('info' in handler && handler.info.path) {
          const path = handler.info.path;
          const cleanPath = path.startsWith('*') ? path.substring(1) : path;
          return cleanPath === '/api/v1/routes/calculate';
        }
        return false;
      });
      
      expect(calculateHandler).toBeDefined();
      if (calculateHandler && 'info' in calculateHandler) {
        expect(calculateHandler.info.method).toBe('POST');
      }
    });
  });

  describe('No Duplicate Handlers', () => {
    it('should not have duplicate handlers for the same endpoint', () => {
      const endpointMap = new Map<string, number>();
      
      handlers.forEach(handler => {
        if ('info' in handler && handler.info.path) {
          const path = handler.info.path;
          const cleanPath = path.startsWith('*') ? path.substring(1) : path;
          const key = `${handler.info.method} ${cleanPath}`;
          const count = endpointMap.get(key) || 0;
          endpointMap.set(key, count + 1);
        }
      });

      endpointMap.forEach((count, endpoint) => {
        expect(count, `Duplicate handler found for ${endpoint}`).toBe(1);
      });
    });
  });
});