'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMapContext } from '@/contexts/MapContext';
import { RouteVisualization } from '@/services/RouteVisualization';
import type { Route, Location } from '@/types';

interface RouteStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'shortdashdotdot' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot' | 'longdashdotdot';
}

interface RouteLayerProps {
  /** The route data to display */
  route?: Route | null;
  /** Origin location */
  origin?: Location | null;
  /** Destination location */
  destination?: Location | null;
  /** Optional waypoints */
  waypoints?: Location[];
  /** Custom route styling */
  routeStyle?: RouteStyle;
  /** Highlighted segment index */
  highlightedSegment?: number;
  /** Auto clear route after specified milliseconds */
  autoClearAfter?: number;
  /** Callback when route is drawn */
  onRouteDrawn?: () => void;
  /** Callback when route is cleared */
  onRouteCleared?: () => void;
  /** Error handler */
  onError?: (error: Error) => void;
}

/**
 * RouteLayer Component
 * Manages route visualization on the map
 */
export function RouteLayer({
  route,
  origin,
  destination,
  waypoints,
  routeStyle,
  highlightedSegment,
  autoClearAfter,
  onRouteDrawn,
  onRouteCleared,
  onError,
}: RouteLayerProps) {
  const { map, isMapReady } = useMapContext();
  const visualizationRef = useRef<RouteVisualization | null>(null);
  const autoClearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousRouteRef = useRef<Route | null>(null);

  // Initialize visualization when map is ready
  useEffect(() => {
    if (!isMapReady || !map) {
      return;
    }

    // Create new visualization instance
    visualizationRef.current = new RouteVisualization(map);

    return () => {
      // Cleanup on unmount or when map changes
      if (visualizationRef.current) {
        visualizationRef.current.destroy();
        visualizationRef.current = null;
      }
    };
  }, [map, isMapReady]);

  // Clear auto-clear timer
  const clearAutoClearTimer = useCallback(() => {
    if (autoClearTimerRef.current) {
      clearTimeout(autoClearTimerRef.current);
      autoClearTimerRef.current = null;
    }
  }, []);

  // Handle route drawing/updating
  useEffect(() => {
    if (!visualizationRef.current) {
      return;
    }

    // Clear any existing auto-clear timer
    clearAutoClearTimer();

    try {
      if (route && origin && destination) {
        // Check if this is an update to existing route
        if (previousRouteRef.current) {
          visualizationRef.current.updateRoute(route, origin, destination, waypoints);
        } else {
          visualizationRef.current.drawRoute(route, origin, destination, waypoints);
        }
        
        previousRouteRef.current = route;
        
        // Call onRouteDrawn callback
        onRouteDrawn?.();

        // Set up auto-clear if specified
        if (autoClearAfter && autoClearAfter > 0) {
          autoClearTimerRef.current = setTimeout(() => {
            if (visualizationRef.current) {
              visualizationRef.current.clearRoute();
              previousRouteRef.current = null;
              onRouteCleared?.();
            }
          }, autoClearAfter);
        }
      } else {
        // Clear route if no route data
        if (previousRouteRef.current) {
          visualizationRef.current.clearRoute();
          previousRouteRef.current = null;
          onRouteCleared?.();
        }
      }
    } catch (error) {
      console.error('Error managing route visualization:', error);
      onError?.(error as Error);
    }

    return () => {
      clearAutoClearTimer();
    };
  }, [route, origin, destination, waypoints, autoClearAfter, onRouteDrawn, onRouteCleared, onError, clearAutoClearTimer]);

  // Handle route styling
  useEffect(() => {
    if (!visualizationRef.current || !routeStyle) {
      return;
    }

    try {
      visualizationRef.current.setRouteStyle(routeStyle);
    } catch (error) {
      console.error('Error setting route style:', error);
      onError?.(error as Error);
    }
  }, [routeStyle, onError]);

  // Handle segment highlighting
  useEffect(() => {
    if (!visualizationRef.current || highlightedSegment === undefined) {
      return;
    }

    try {
      visualizationRef.current.highlightSegment(highlightedSegment);
    } catch (error) {
      console.error('Error highlighting segment:', error);
      onError?.(error as Error);
    }
  }, [highlightedSegment, onError]);

  // This component doesn't render any DOM elements
  return null;
}

// Default export for convenience
export default RouteLayer;