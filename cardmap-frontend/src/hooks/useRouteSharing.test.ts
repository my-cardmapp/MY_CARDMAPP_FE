import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouteSharing } from './useRouteSharing';
import type { Route, RouteMode } from '@/types/route';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock clipboard API
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: clipboardMock,
  writable: true,
});

describe('useRouteSharing', () => {
  const mockRoute: Route = {
    summary: 'Test Route',
    distance: 1500,
    duration: 900,
    fare: 1200,
    polyline: 'encoded_polyline_string',
    steps: [
      {
        instruction: 'Start walking',
        distance: 100,
        duration: 60,
        startLocation: { lat: 37.5665, lng: 126.9780 },
        endLocation: { lat: 37.5670, lng: 126.9785 },
      },
    ],
  };

  const mockOrigin = {
    id: 1,
    name: 'Seoul Station',
    address: '서울역',
    location: { lat: 37.5547, lng: 126.9707 },
  };

  const mockDestination = {
    id: 2,
    name: 'Gangnam Station',
    address: '강남역',
    location: { lat: 37.4979, lng: 127.0276 },
  };

  const mockWaypoints = [
    {
      id: 3,
      name: 'Myeongdong',
      address: '명동',
      location: { lat: 37.5636, lng: 126.9869 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset URL
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Generation and Parsing', () => {
    it('should generate shareable URL from route data', () => {
      const { result } = renderHook(() => useRouteSharing());

      const url = result.current.generateShareableURL({
        route: mockRoute,
        origin: mockOrigin,
        destination: mockDestination,
        waypoints: mockWaypoints,
        mode: 'walking',
      });

      // URLSearchParams encodes spaces as + and commas as %2C
      expect(url).toContain('origin=37.5547%2C126.9707%2CSeoul+Station');
      expect(url).toContain('destination=37.4979%2C127.0276%2CGangnam+Station');
      expect(url).toContain('waypoints=');
      expect(url).toContain('mode=walking');
    });

    it('should generate URL without waypoints', () => {
      const { result } = renderHook(() => useRouteSharing());

      const url = result.current.generateShareableURL({
        route: mockRoute,
        origin: mockOrigin,
        destination: mockDestination,
        mode: 'transit',
      });

      expect(url).toContain('origin=');
      expect(url).toContain('destination=');
      expect(url).not.toContain('waypoints=');
      expect(url).toContain('mode=transit');
    });

    it('should parse route data from URL parameters', () => {
      const url = '?origin=37.5547,126.9707,Seoul%20Station&destination=37.4979,127.0276,Gangnam%20Station&mode=walking';
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());
      const routeData = result.current.parseURLToRoute();

      expect(routeData).toEqual({
        origin: {
          lat: 37.5547,
          lng: 126.9707,
          name: 'Seoul Station',
        },
        destination: {
          lat: 37.4979,
          lng: 127.0276,
          name: 'Gangnam Station',
        },
        waypoints: [],
        mode: 'walking',
      });
    });

    it('should parse waypoints from URL', () => {
      const waypointStr = encodeURIComponent(
        JSON.stringify([
          { lat: 37.5636, lng: 126.9869, name: 'Myeongdong' },
        ])
      );
      const url = `?origin=37.5547,126.9707,Seoul%20Station&destination=37.4979,127.0276,Gangnam%20Station&waypoints=${waypointStr}&mode=transit`;
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());
      const routeData = result.current.parseURLToRoute();

      expect(routeData?.waypoints).toHaveLength(1);
      expect(routeData?.waypoints?.[0]).toEqual({
        lat: 37.5636,
        lng: 126.9869,
        name: 'Myeongdong',
      });
    });

    it('should handle invalid URL parameters gracefully', () => {
      const url = '?origin=invalid&destination=also_invalid';
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());
      const routeData = result.current.parseURLToRoute();

      expect(routeData).toBeNull();
    });

    it('should handle missing required parameters', () => {
      const url = '?origin=37.5547,126.9707,Seoul%20Station';
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());
      const routeData = result.current.parseURLToRoute();

      expect(routeData).toBeNull();
    });
  });

  describe('LocalStorage Save/Load', () => {
    it('should save route to localStorage', () => {
      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.saveRoute({
          name: 'My Daily Commute',
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          waypoints: mockWaypoints,
          mode: 'transit',
        });
      });

      const savedRoutes = JSON.parse(localStorageMock.getItem('savedRoutes') || '[]');
      expect(savedRoutes).toHaveLength(1);
      expect(savedRoutes[0].name).toBe('My Daily Commute');
      expect(savedRoutes[0].origin).toEqual(mockOrigin);
      expect(savedRoutes[0].timestamp).toBeDefined();
    });

    it('should generate auto name if not provided', () => {
      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.saveRoute({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      const savedRoutes = JSON.parse(localStorageMock.getItem('savedRoutes') || '[]');
      expect(savedRoutes[0].name).toBe('Seoul Station → Gangnam Station');
    });

    it('should load saved routes from localStorage', () => {
      const savedData = [
        {
          id: 'route-1',
          name: 'Test Route',
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
          timestamp: Date.now(),
        },
      ];
      localStorageMock.setItem('savedRoutes', JSON.stringify(savedData));

      const { result } = renderHook(() => useRouteSharing());

      expect(result.current.savedRoutes).toHaveLength(1);
      expect(result.current.savedRoutes[0].name).toBe('Test Route');
    });

    it('should delete saved route', () => {
      const savedData = [
        {
          id: 'route-1',
          name: 'Route 1',
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
          timestamp: Date.now(),
        },
        {
          id: 'route-2',
          name: 'Route 2',
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'transit',
          timestamp: Date.now(),
        },
      ];
      localStorageMock.setItem('savedRoutes', JSON.stringify(savedData));

      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.deleteRoute('route-1');
      });

      expect(result.current.savedRoutes).toHaveLength(1);
      expect(result.current.savedRoutes[0].id).toBe('route-2');
    });

    it('should clear all saved routes', () => {
      const savedData = [
        {
          id: 'route-1',
          name: 'Route 1',
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
          timestamp: Date.now(),
        },
      ];
      localStorageMock.setItem('savedRoutes', JSON.stringify(savedData));

      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.clearAllRoutes();
      });

      expect(result.current.savedRoutes).toHaveLength(0);
      expect(localStorageMock.getItem('savedRoutes')).toBe('[]');
    });
  });

  describe('Route History', () => {
    it('should add route to history', () => {
      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.addToHistory({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(result.current.routeHistory).toHaveLength(1);
      expect(result.current.routeHistory[0].origin).toEqual(mockOrigin);
    });

    it('should limit history to 5 most recent routes', () => {
      const { result } = renderHook(() => useRouteSharing());

      // Add 7 routes with different destinations to avoid duplicate detection
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.addToHistory({
            route: { ...mockRoute, summary: `Route ${i}` },
            origin: { ...mockOrigin, name: `Origin ${i}` },
            destination: { ...mockDestination, name: `Dest ${i}` },
            mode: 'walking',
          });
        }
      });

      expect(result.current.routeHistory).toHaveLength(5);
      expect(result.current.routeHistory[0].route.summary).toBe('Route 6'); // Most recent
      expect(result.current.routeHistory[4].route.summary).toBe('Route 2'); // Oldest kept
    });

    it('should avoid duplicate consecutive routes in history', () => {
      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.addToHistory({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      act(() => {
        result.current.addToHistory({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(result.current.routeHistory).toHaveLength(1);
    });

    it('should clear route history', () => {
      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.addToHistory({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.routeHistory).toHaveLength(0);
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy shareable URL to clipboard', async () => {
      const { result } = renderHook(() => useRouteSharing());

      const success = await act(async () => {
        return await result.current.copyShareableURL({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('origin=37.5547%2C126.9707')
      );
    });

    it('should handle clipboard API failure', async () => {
      clipboardMock.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      const { result } = renderHook(() => useRouteSharing());

      const success = await act(async () => {
        return await result.current.copyShareableURL({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(success).toBe(false);
    });

    it('should fallback when clipboard API is not available', async () => {
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      const { result } = renderHook(() => useRouteSharing());

      const success = await act(async () => {
        return await result.current.copyShareableURL({
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(success).toBe(false);

      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('savedRoutes', 'invalid json {]');

      const { result } = renderHook(() => useRouteSharing());

      expect(result.current.savedRoutes).toEqual([]);
    });

    it('should handle routes with special characters in names', () => {
      const { result } = renderHook(() => useRouteSharing());

      const specialOrigin = {
        ...mockOrigin,
        name: 'Seoul & Station / Special #1',
      };

      const url = result.current.generateShareableURL({
        route: mockRoute,
        origin: specialOrigin,
        destination: mockDestination,
        mode: 'walking',
      });

      expect(url).toBeDefined();
      // Check the URL contains the name with proper URL encoding
      // The ampersand & is encoded as %26, slash / as %2F, and # as %23
      expect(url).toContain('Seoul+%26+Station+%2F+Special+%231');
    });

    it('should validate route mode', () => {
      const url = '?origin=37.5547,126.9707,Seoul&destination=37.4979,127.0276,Gangnam&mode=invalid';
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());
      const routeData = result.current.parseURLToRoute();

      expect(routeData?.mode).toBe('walking'); // Should default to walking
    });

    it('should handle very long route names', () => {
      const { result } = renderHook(() => useRouteSharing());

      const longName = 'A'.repeat(200);
      act(() => {
        result.current.saveRoute({
          name: longName,
          route: mockRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      const savedRoutes = result.current.savedRoutes;
      expect(savedRoutes[0].name.length).toBeLessThanOrEqual(100); // Should truncate
    });

    it('should handle routes without optional fields', () => {
      const minimalRoute: Route = {
        summary: '',
        distance: 0,
        duration: 0,
        polyline: '',
        steps: [],
      };

      const { result } = renderHook(() => useRouteSharing());

      act(() => {
        result.current.saveRoute({
          route: minimalRoute,
          origin: mockOrigin,
          destination: mockDestination,
          mode: 'walking',
        });
      });

      expect(result.current.savedRoutes).toHaveLength(1);
    });
  });

  describe('Load on Mount', () => {
    it('should load route from URL on mount', () => {
      const url = '?origin=37.5547,126.9707,Seoul%20Station&destination=37.4979,127.0276,Gangnam%20Station&mode=walking';
      window.history.pushState({}, '', url);

      const { result } = renderHook(() => useRouteSharing());

      expect(result.current.initialRouteData).toBeDefined();
      expect(result.current.initialRouteData?.origin.name).toBe('Seoul Station');
    });

    it('should not have initial route data without URL params', () => {
      window.history.pushState({}, '', '/');

      const { result } = renderHook(() => useRouteSharing());

      expect(result.current.initialRouteData).toBeNull();
    });
  });
});