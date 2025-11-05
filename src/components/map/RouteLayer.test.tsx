import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { RouteLayer } from './RouteLayer';
import { RouteVisualization } from '@/services/RouteVisualization';
import { useMapContext } from '@/contexts/MapContext';
import type { Route, Location } from '@/types';

// Mock the RouteVisualization service
vi.mock('@/services/RouteVisualization', () => ({
  RouteVisualization: vi.fn().mockImplementation(() => ({
    drawRoute: vi.fn(),
    updateRoute: vi.fn(),
    clearRoute: vi.fn(),
    highlightSegment: vi.fn(),
    setRouteStyle: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock the MapContext
vi.mock('@/contexts/MapContext', () => ({
  useMapContext: vi.fn(),
}));

describe('RouteLayer', () => {
  const mockMap = {
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    fitBounds: vi.fn(),
  };

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
    ],
  };

  const mockOrigin: Location = { lat: 37.5, lng: 127.0, name: 'Start' };
  const mockDestination: Location = { lat: 37.52, lng: 127.02, name: 'End' };

  let mockVisualizationInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock visualization instance
    mockVisualizationInstance = {
      drawRoute: vi.fn(),
      updateRoute: vi.fn(),
      clearRoute: vi.fn(),
      highlightSegment: vi.fn(),
      setRouteStyle: vi.fn(),
      destroy: vi.fn(),
    };
    
    (RouteVisualization as any).mockImplementation(() => mockVisualizationInstance);
    
    // Setup map context mock
    (useMapContext as any).mockReturnValue({
      map: mockMap,
      isMapReady: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <RouteLayer />
      );
      
      expect(container).toBeDefined();
    });

    it('should not create visualization when map is not ready', () => {
      (useMapContext as any).mockReturnValue({
        map: null,
        isMapReady: false,
      });

      render(<RouteLayer />);

      expect(RouteVisualization).not.toHaveBeenCalled();
    });

    it('should create visualization when map is ready', async () => {
      render(<RouteLayer />);

      await waitFor(() => {
        expect(RouteVisualization).toHaveBeenCalledWith(mockMap);
      });
    });
  });

  describe('route drawing', () => {
    it('should draw route when route prop is provided', async () => {
      const { rerender } = render(
        <RouteLayer />
      );

      await waitFor(() => {
        expect(RouteVisualization).toHaveBeenCalled();
      });

      rerender(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.drawRoute).toHaveBeenCalledWith(
          mockRoute,
          mockOrigin,
          mockDestination,
          undefined
        );
      });
    });

    it('should include waypoints when provided', async () => {
      const waypoints = [
        { lat: 37.51, lng: 127.01, name: 'Waypoint 1' },
      ];

      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          waypoints={waypoints}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.drawRoute).toHaveBeenCalledWith(
          mockRoute,
          mockOrigin,
          mockDestination,
          waypoints
        );
      });
    });

    it('should update route when route prop changes', async () => {
      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
        />
      );

      const newRoute = { ...mockRoute, distance: 2000 };

      rerender(
        <RouteLayer
          route={newRoute}
          origin={mockOrigin}
          destination={mockDestination}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.updateRoute).toHaveBeenCalledWith(
          newRoute,
          mockOrigin,
          mockDestination,
          undefined
        );
      });
    });

    it('should clear route when route prop is removed', async () => {
      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
        />
      );

      rerender(<RouteLayer />);

      await waitFor(() => {
        expect(mockVisualizationInstance.clearRoute).toHaveBeenCalled();
      });
    });

    it('should not draw route without origin and destination', () => {
      render(
        <RouteLayer
          route={mockRoute}
        />
      );

      expect(mockVisualizationInstance.drawRoute).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should apply custom route style when provided', async () => {
      const customStyle = {
        strokeColor: '#0000FF',
        strokeWeight: 6,
        strokeOpacity: 0.9,
      };

      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          routeStyle={customStyle}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.setRouteStyle).toHaveBeenCalledWith(customStyle);
      });
    });

    it('should update style when routeStyle prop changes', async () => {
      const initialStyle = { strokeColor: '#FF0000' };
      const newStyle = { strokeColor: '#00FF00' };

      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          routeStyle={initialStyle}
        />
      );

      rerender(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          routeStyle={newStyle}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.setRouteStyle).toHaveBeenCalledWith(newStyle);
      });
    });
  });

  describe('highlighting', () => {
    it('should highlight segment when highlightedSegment prop is set', async () => {
      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          highlightedSegment={0}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.highlightSegment).toHaveBeenCalledWith(0);
      });
    });

    it('should update highlight when highlightedSegment changes', async () => {
      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          highlightedSegment={0}
        />
      );

      rerender(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          highlightedSegment={1}
        />
      );

      await waitFor(() => {
        expect(mockVisualizationInstance.highlightSegment).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('callbacks', () => {
    it('should call onRouteDrawn callback after drawing route', async () => {
      const onRouteDrawn = vi.fn();

      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          onRouteDrawn={onRouteDrawn}
        />
      );

      await waitFor(() => {
        expect(onRouteDrawn).toHaveBeenCalled();
      });
    });

    it('should call onRouteCleared callback after clearing route', async () => {
      const onRouteCleared = vi.fn();

      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          onRouteCleared={onRouteCleared}
        />
      );

      rerender(
        <RouteLayer
          onRouteCleared={onRouteCleared}
        />
      );

      await waitFor(() => {
        expect(onRouteCleared).toHaveBeenCalled();
      });
    });
  });

  describe('cleanup', () => {
    it('should destroy visualization on unmount', async () => {
      const { unmount } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
        />
      );

      unmount();

      await waitFor(() => {
        expect(mockVisualizationInstance.destroy).toHaveBeenCalled();
      });
    });

    it('should recreate visualization when map changes', async () => {
      const { rerender } = render(<RouteLayer />);

      const newMap = { ...mockMap };
      (useMapContext as any).mockReturnValue({
        map: newMap,
        isMapReady: true,
      });

      rerender(<RouteLayer />);

      await waitFor(() => {
        expect(RouteVisualization).toHaveBeenCalledTimes(2);
        expect(mockVisualizationInstance.destroy).toHaveBeenCalled();
      });
    });
  });

  describe('auto clear', () => {
    it('should auto clear route after specified duration', async () => {
      vi.useFakeTimers();

      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          autoClearAfter={3000}
        />
      );

      // Wait for initial render
      await vi.runOnlyPendingTimersAsync();
      
      // Advance by the auto clear duration
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockVisualizationInstance.clearRoute).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should cancel auto clear when component unmounts', () => {
      vi.useFakeTimers();

      const { unmount } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          autoClearAfter={3000}
        />
      );

      unmount();
      vi.advanceTimersByTime(3000);

      // clearRoute should not be called after unmount
      expect(mockVisualizationInstance.clearRoute).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle visualization errors gracefully', async () => {
      mockVisualizationInstance.drawRoute.mockImplementation(() => {
        throw new Error('Draw failed');
      });

      const onError = vi.fn();

      render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should continue working after error recovery', async () => {
      // First call throws error, but component doesn't set previousRouteRef on error
      mockVisualizationInstance.drawRoute.mockImplementationOnce(() => {
        throw new Error('First draw failed');
      });

      const onError = vi.fn();

      const { rerender } = render(
        <RouteLayer
          route={mockRoute}
          origin={mockOrigin}
          destination={mockDestination}
          onError={onError}
        />
      );

      // Wait for error to be handled
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });

      // Reset the mock to not throw
      mockVisualizationInstance.drawRoute.mockImplementation(() => {});
      mockVisualizationInstance.updateRoute.mockImplementation(() => {});

      // Clear route first (to reset state)
      rerender(
        <RouteLayer
          onError={onError}
        />
      );

      // Now draw a new route - should call drawRoute since previous failed
      const newRoute = { ...mockRoute, distance: 2000 };
      rerender(
        <RouteLayer
          route={newRoute}
          origin={mockOrigin}
          destination={mockDestination}
          onError={onError}
        />
      );

      await waitFor(() => {
        // After error recovery, should call drawRoute (not updateRoute) since previous failed
        expect(mockVisualizationInstance.drawRoute).toHaveBeenCalledWith(
          newRoute,
          mockOrigin,
          mockDestination,
          undefined
        );
      });
    });
  });
});