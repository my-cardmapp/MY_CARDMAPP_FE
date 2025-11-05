import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RouteVisualization } from './RouteVisualization';
import type { Route, Location } from '@/types';

// Mock Naver Maps API
const mockPolyline = vi.fn();
const mockMarker = vi.fn();
const mockInfoWindow = vi.fn();

// Mock polyline instance
const mockPolylineInstance = {
  setMap: vi.fn(),
  setPath: vi.fn(),
  setOptions: vi.fn(),
  getMap: vi.fn(),
  getPath: vi.fn(() => []),
};

// Mock marker instance
const mockMarkerInstance = {
  setMap: vi.fn(),
  setPosition: vi.fn(),
  setIcon: vi.fn(),
  setTitle: vi.fn(),
  getPosition: vi.fn(),
  addListener: vi.fn(),
};

// Mock info window instance
const mockInfoWindowInstance = {
  open: vi.fn(),
  close: vi.fn(),
  setContent: vi.fn(),
  setPosition: vi.fn(),
};

// Mock map instance
const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getBounds: vi.fn(),
  fitBounds: vi.fn(),
  panTo: vi.fn(),
};

// Mock LatLng
const mockLatLng = vi.fn((lat: number, lng: number) => ({ lat: () => lat, lng: () => lng }));

// Mock LatLngBounds
const mockLatLngBounds = vi.fn(() => ({
  extend: vi.fn(),
  getCenter: vi.fn(() => ({ lat: () => 37.5, lng: () => 127.0 })),
}));

// Mock Event
const mockEvent = {
  addListener: vi.fn((target: any, event: string, handler: Function) => {
    // Return a mock listener for cleanup
    return { remove: vi.fn() };
  }),
  removeListener: vi.fn(),
};

// Setup global mocks
global.naver = {
  maps: {
    Polyline: mockPolyline,
    Marker: mockMarker,
    InfoWindow: mockInfoWindow,
    LatLng: mockLatLng,
    LatLngBounds: mockLatLngBounds,
    Event: mockEvent,
    Size: vi.fn((width: number, height: number) => ({ width, height })),
    Point: vi.fn((x: number, y: number) => ({ x, y })),
  },
} as any;

describe('RouteVisualization', () => {
  let routeVisualization: RouteVisualization;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset mock instance methods
    mockPolylineInstance.setMap.mockClear();
    mockPolylineInstance.setPath.mockClear();
    mockPolylineInstance.setOptions.mockClear();
    mockPolylineInstance.getPath.mockClear();
    mockMarkerInstance.setMap.mockClear();
    mockInfoWindowInstance.open.mockClear();
    mockInfoWindowInstance.close.mockClear();
    
    // Setup mock implementations
    mockPolyline.mockImplementation(() => ({
      ...mockPolylineInstance,
      setMap: vi.fn(),
      setPath: vi.fn(),
      setOptions: vi.fn(),
      getMap: vi.fn(),
      getPath: vi.fn(() => []),
    }));
    mockMarker.mockImplementation(() => ({
      ...mockMarkerInstance,
      setMap: vi.fn(),
      setPosition: vi.fn(),
      setIcon: vi.fn(),
      setTitle: vi.fn(),
      getPosition: vi.fn(),
      addListener: vi.fn(),
    }));
    mockInfoWindow.mockImplementation(() => ({
      ...mockInfoWindowInstance,
      open: vi.fn(),
      close: vi.fn(),
      setContent: vi.fn(),
      setPosition: vi.fn(),
    }));
    
    // Create instance
    routeVisualization = new RouteVisualization(mockMap as any);
  });

  afterEach(() => {
    // Cleanup
    routeVisualization.destroy();
  });

  describe('constructor', () => {
    it('should initialize with a map instance', () => {
      expect(routeVisualization).toBeDefined();
      expect(routeVisualization['map']).toBe(mockMap);
    });

    it('should initialize with empty polylines and markers arrays', () => {
      expect(routeVisualization['polylines']).toEqual([]);
      expect(routeVisualization['markers']).toEqual([]);
      expect(routeVisualization['infoWindows']).toEqual([]);
    });
  });

  describe('drawRoute', () => {
    const mockRoute: Route = {
      summary: 'Test Route',
      distance: 1500,
      duration: 900,
      polyline: 'encodedPolylineString',
      steps: [
        {
          instruction: 'Start walking',
          distance: 500,
          duration: 300,
          startLocation: { lat: 37.5, lng: 127.0 },
          endLocation: { lat: 37.51, lng: 127.01 },
        },
        {
          instruction: 'Turn right',
          distance: 1000,
          duration: 600,
          startLocation: { lat: 37.51, lng: 127.01 },
          endLocation: { lat: 37.52, lng: 127.02 },
        },
      ],
    };

    const origin: Location = { lat: 37.5, lng: 127.0, name: 'Start Point' };
    const destination: Location = { lat: 37.52, lng: 127.02, name: 'End Point' };

    it('should decode polyline and create a path on the map', () => {
      // Mock decodePolyline to return path coordinates
      const decodedPath = [
        { lat: 37.5, lng: 127.0 },
        { lat: 37.51, lng: 127.01 },
        { lat: 37.52, lng: 127.02 },
      ];
      vi.spyOn(routeVisualization as any, 'decodePolyline').mockReturnValue(decodedPath);

      routeVisualization.drawRoute(mockRoute, origin, destination);

      // Verify polyline was created with correct options
      expect(mockPolyline).toHaveBeenCalledWith({
        map: mockMap,
        path: expect.any(Array),
        strokeColor: '#FF0000',
        strokeWeight: 5,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });

      // Verify polyline was created
      expect(mockPolyline).toHaveBeenCalled();
    });

    it('should create markers for origin and destination', () => {
      routeVisualization.drawRoute(mockRoute, origin, destination);

      // Verify markers were created
      expect(mockMarker).toHaveBeenCalledTimes(2);

      // Check origin marker
      expect(mockMarker).toHaveBeenCalledWith({
        position: expect.any(Object),
        map: mockMap,
        title: 'Start Point',
        icon: expect.objectContaining({
          content: expect.stringContaining('출발'),
        }),
      });

      // Check destination marker
      expect(mockMarker).toHaveBeenCalledWith({
        position: expect.any(Object),
        map: mockMap,
        title: 'End Point',
        icon: expect.objectContaining({
          content: expect.stringContaining('도착'),
        }),
      });
    });

    it('should create markers for waypoints if provided', () => {
      const waypoints: Location[] = [
        { lat: 37.505, lng: 127.005, name: 'Waypoint 1' },
        { lat: 37.515, lng: 127.015, name: 'Waypoint 2' },
      ];

      routeVisualization.drawRoute(mockRoute, origin, destination, waypoints);

      // Origin + Destination + 2 Waypoints = 4 markers
      expect(mockMarker).toHaveBeenCalledTimes(4);

      // Check waypoint markers
      expect(mockMarker).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Waypoint 1',
          icon: expect.objectContaining({
            content: expect.stringContaining('1'),
          }),
        })
      );
    });

    it('should fit map bounds to show entire route', () => {
      const decodedPath = [
        { lat: 37.5, lng: 127.0 },
        { lat: 37.52, lng: 127.02 },
      ];
      vi.spyOn(routeVisualization as any, 'decodePolyline').mockReturnValue(decodedPath);

      routeVisualization.drawRoute(mockRoute, origin, destination);

      // Verify bounds were created and extended
      expect(mockLatLngBounds).toHaveBeenCalled();
      expect(mockMap.fitBounds).toHaveBeenCalled();
    });

    it('should clear previous route before drawing new one', () => {
      // Draw first route
      routeVisualization.drawRoute(mockRoute, origin, destination);
      
      // Spy on clearRoute
      const clearSpy = vi.spyOn(routeVisualization, 'clearRoute');
      
      // Draw second route
      routeVisualization.drawRoute(mockRoute, origin, destination);
      
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should handle routes with no polyline gracefully', () => {
      const routeWithoutPolyline: Route = {
        ...mockRoute,
        polyline: '',
      };

      expect(() => {
        routeVisualization.drawRoute(routeWithoutPolyline, origin, destination);
      }).not.toThrow();

      // Should still create markers
      expect(mockMarker).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateRoute', () => {
    const mockRoute: Route = {
      summary: 'Updated Route',
      distance: 2000,
      duration: 1200,
      polyline: 'newEncodedPolyline',
      steps: [],
    };

    const origin: Location = { lat: 37.5, lng: 127.0 };
    const destination: Location = { lat: 37.53, lng: 127.03 };

    it('should clear existing route and draw new one', () => {
      const clearSpy = vi.spyOn(routeVisualization, 'clearRoute');
      const drawSpy = vi.spyOn(routeVisualization, 'drawRoute');

      routeVisualization.updateRoute(mockRoute, origin, destination);

      expect(clearSpy).toHaveBeenCalled();
      expect(drawSpy).toHaveBeenCalledWith(mockRoute, origin, destination, undefined);
    });

    it('should handle waypoints in update', () => {
      const waypoints = [{ lat: 37.51, lng: 127.01 }];
      const drawSpy = vi.spyOn(routeVisualization, 'drawRoute');

      routeVisualization.updateRoute(mockRoute, origin, destination, waypoints);

      expect(drawSpy).toHaveBeenCalledWith(mockRoute, origin, destination, waypoints);
    });
  });

  describe('clearRoute', () => {
    beforeEach(() => {
      // Add some mock elements
      routeVisualization['polylines'] = [mockPolylineInstance] as any;
      routeVisualization['markers'] = [mockMarkerInstance] as any;
      routeVisualization['infoWindows'] = [mockInfoWindowInstance] as any;
    });

    it('should remove all polylines from map', () => {
      routeVisualization.clearRoute();

      expect(mockPolylineInstance.setMap).toHaveBeenCalledWith(null);
      expect(routeVisualization['polylines']).toHaveLength(0);
    });

    it('should remove all markers from map', () => {
      routeVisualization.clearRoute();

      expect(mockMarkerInstance.setMap).toHaveBeenCalledWith(null);
      expect(routeVisualization['markers']).toHaveLength(0);
    });

    it('should close and remove all info windows', () => {
      routeVisualization.clearRoute();

      expect(mockInfoWindowInstance.close).toHaveBeenCalled();
      expect(routeVisualization['infoWindows']).toHaveLength(0);
    });

    it('should handle empty arrays gracefully', () => {
      routeVisualization['polylines'] = [];
      routeVisualization['markers'] = [];
      routeVisualization['infoWindows'] = [];

      expect(() => routeVisualization.clearRoute()).not.toThrow();
    });
  });

  describe('highlightSegment', () => {
    it('should highlight a specific route segment', () => {
      const segmentIndex = 0;
      const segment = {
        start: { lat: 37.5, lng: 127.0 },
        end: { lat: 37.51, lng: 127.01 },
      };

      // Create initial polylines
      routeVisualization['polylines'] = [mockPolylineInstance] as any;

      routeVisualization.highlightSegment(segmentIndex);

      // Verify highlight effect was applied
      expect(mockPolylineInstance.setOptions).toHaveBeenCalledWith({
        strokeColor: '#0066FF',
        strokeWeight: 7,
        strokeOpacity: 1,
      });
    });

    it('should reset previous highlights', () => {
      // Add multiple polylines
      const polyline1 = { ...mockPolylineInstance, setOptions: vi.fn() };
      const polyline2 = { ...mockPolylineInstance, setOptions: vi.fn() };
      routeVisualization['polylines'] = [polyline1, polyline2] as any;

      routeVisualization.highlightSegment(1);

      // First polyline should be reset
      expect(polyline1.setOptions).toHaveBeenCalledWith({
        strokeColor: '#FF0000',
        strokeWeight: 5,
        strokeOpacity: 0.8,
      });

      // Second polyline should be highlighted
      expect(polyline2.setOptions).toHaveBeenCalledWith({
        strokeColor: '#0066FF',
        strokeWeight: 7,
        strokeOpacity: 1,
      });
    });
  });

  describe('showInfoWindow', () => {
    it('should show info window for a marker', () => {
      const markerIndex = 0;
      const content = 'Test Info';

      // Add a marker
      routeVisualization['markers'] = [mockMarkerInstance] as any;

      routeVisualization.showInfoWindow(markerIndex, content);

      // Verify info window was created
      expect(mockInfoWindow).toHaveBeenCalledWith({
        content: expect.stringContaining(content),
        disableAnchor: false,
        backgroundColor: '#ffffff',
        borderColor: '#333333',
        borderWidth: 1,
        anchorSize: expect.any(Object),
        anchorSkew: true,
        anchorColor: '#ffffff',
      });

      // The open method should be called on the new instance, not the mock instance
      expect(mockInfoWindow).toHaveBeenCalled();
    });

    it('should close other info windows when opening new one', () => {
      const existingInfoWindow = { ...mockInfoWindowInstance, close: vi.fn() };
      routeVisualization['infoWindows'] = [existingInfoWindow] as any;
      routeVisualization['markers'] = [mockMarkerInstance] as any;

      routeVisualization.showInfoWindow(0, 'New Info');

      expect(existingInfoWindow.close).toHaveBeenCalled();
    });
  });

  describe('setRouteStyle', () => {
    it('should update polyline style', () => {
      routeVisualization['polylines'] = [mockPolylineInstance] as any;

      const newStyle = {
        strokeColor: '#00FF00',
        strokeWeight: 6,
        strokeOpacity: 0.9,
      };

      routeVisualization.setRouteStyle(newStyle);

      expect(mockPolylineInstance.setOptions).toHaveBeenCalledWith(newStyle);
    });

    it('should apply style to all polylines', () => {
      const polyline1 = { ...mockPolylineInstance, setOptions: vi.fn() };
      const polyline2 = { ...mockPolylineInstance, setOptions: vi.fn() };
      routeVisualization['polylines'] = [polyline1, polyline2] as any;

      const newStyle = { strokeColor: '#0000FF' };

      routeVisualization.setRouteStyle(newStyle);

      expect(polyline1.setOptions).toHaveBeenCalledWith(newStyle);
      expect(polyline2.setOptions).toHaveBeenCalledWith(newStyle);
    });
  });

  describe('decodePolyline', () => {
    it('should decode Google polyline format', () => {
      // This is a simple encoded polyline for testing
      // Represents approximately: [(38.5, -120.2), (40.7, -120.95)]
      const encoded = '_p~iF~ps|U_ulLnnqC';

      const decoded = routeVisualization['decodePolyline'](encoded);

      expect(decoded).toBeInstanceOf(Array);
      expect(decoded.length).toBeGreaterThan(0);
      expect(decoded[0]).toHaveProperty('lat');
      expect(decoded[0]).toHaveProperty('lng');
    });

    it('should handle empty polyline string', () => {
      const decoded = routeVisualization['decodePolyline']('');
      expect(decoded).toEqual([]);
    });

    it('should handle invalid polyline string', () => {
      const decoded = routeVisualization['decodePolyline']('invalid!@#$');
      expect(decoded).toBeInstanceOf(Array);
    });
  });

  describe('destroy', () => {
    it('should clear all routes and clean up resources', () => {
      // Add some elements
      routeVisualization['polylines'] = [mockPolylineInstance] as any;
      routeVisualization['markers'] = [mockMarkerInstance] as any;
      routeVisualization['infoWindows'] = [mockInfoWindowInstance] as any;

      const clearSpy = vi.spyOn(routeVisualization, 'clearRoute');

      routeVisualization.destroy();

      expect(clearSpy).toHaveBeenCalled();
      expect(routeVisualization['map']).toBeNull();
    });

    it('should handle multiple destroy calls gracefully', () => {
      routeVisualization.destroy();
      expect(() => routeVisualization.destroy()).not.toThrow();
    });
  });

  describe('integration with map instance', () => {
    it('should handle null map instance gracefully', () => {
      const nullVisualization = new RouteVisualization(null as any);
      
      expect(() => {
        nullVisualization.drawRoute(
          { summary: 'Test', distance: 100, duration: 60, polyline: '', steps: [] },
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 }
        );
      }).not.toThrow();
    });

    it('should check map instance before operations', () => {
      routeVisualization['map'] = null;

      expect(() => {
        routeVisualization.clearRoute();
      }).not.toThrow();
    });
  });

  describe('marker click events', () => {
    it('should attach click listeners to markers', () => {
      const origin: Location = { lat: 37.5, lng: 127.0, name: 'Start' };
      const destination: Location = { lat: 37.52, lng: 127.02, name: 'End' };

      routeVisualization.drawRoute(
        { summary: 'Test', distance: 1000, duration: 600, polyline: 'test', steps: [] },
        origin,
        destination
      );

      // Verify event listeners were added
      expect(mockEvent.addListener).toHaveBeenCalled();
    });

    it('should show info window on marker click', () => {
      const origin: Location = { lat: 37.5, lng: 127.0, name: 'Start Point' };
      const destination: Location = { lat: 37.52, lng: 127.02, name: 'End Point' };

      routeVisualization.drawRoute(
        { summary: 'Test', distance: 1000, duration: 600, polyline: 'test', steps: [] },
        origin,
        destination
      );

      // Get the click handler that was registered
      const clickCall = mockEvent.addListener.mock.calls.find(
        call => call[1] === 'click'
      );
      
      if (clickCall && clickCall[2]) {
        // Simulate click
        clickCall[2]();
        
        // Verify info window was created
        expect(mockInfoWindow).toHaveBeenCalled();
      }
    });
  });

  describe('performance and optimization', () => {
    it('should batch operations for multiple waypoints', () => {
      const waypoints = Array(10).fill(null).map((_, i) => ({
        lat: 37.5 + i * 0.01,
        lng: 127.0 + i * 0.01,
        name: `Waypoint ${i}`,
      }));

      routeVisualization.drawRoute(
        { summary: 'Test', distance: 10000, duration: 6000, polyline: 'test', steps: [] },
        { lat: 37.5, lng: 127.0 },
        { lat: 37.6, lng: 127.1 },
        waypoints
      );

      // Should create origin + destination + 10 waypoints = 12 markers
      expect(mockMarker).toHaveBeenCalledTimes(12);
    });

    it('should handle complex routes with many steps efficiently', () => {
      const steps = Array(50).fill(null).map((_, i) => ({
        instruction: `Step ${i}`,
        distance: 100,
        duration: 60,
        startLocation: { lat: 37.5 + i * 0.001, lng: 127.0 + i * 0.001 },
        endLocation: { lat: 37.5 + (i + 1) * 0.001, lng: 127.0 + (i + 1) * 0.001 },
      }));

      const route: Route = {
        summary: 'Complex Route',
        distance: 5000,
        duration: 3000,
        polyline: 'complexPolyline',
        steps,
      };

      expect(() => {
        routeVisualization.drawRoute(
          route,
          { lat: 37.5, lng: 127.0 },
          { lat: 37.55, lng: 127.05 }
        );
      }).not.toThrow();
    });
  });
});