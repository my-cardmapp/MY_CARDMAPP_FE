import { useState, useEffect, useCallback } from 'react';
import type { Route, RouteMode } from '@/types/route';

interface LocationData {
  id?: number;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface RouteData {
  route: Route;
  origin: LocationData;
  destination: LocationData;
  waypoints?: LocationData[];
  mode: RouteMode;
  name?: string;
}

interface SavedRoute extends RouteData {
  id: string;
  name: string;
  timestamp: number;
}

interface ParsedRouteData {
  origin: {
    lat: number;
    lng: number;
    name: string;
  };
  destination: {
    lat: number;
    lng: number;
    name: string;
  };
  waypoints: Array<{
    lat: number;
    lng: number;
    name: string;
  }>;
  mode: RouteMode;
}

const STORAGE_KEYS = {
  SAVED_ROUTES: 'savedRoutes',
  ROUTE_HISTORY: 'routeHistory',
} as const;

const MAX_HISTORY_ITEMS = 5;
const MAX_NAME_LENGTH = 100;

export function useRouteSharing() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routeHistory, setRouteHistory] = useState<SavedRoute[]>([]);
  const [initialRouteData, setInitialRouteData] = useState<ParsedRouteData | null>(null);

  // Load saved routes and history from localStorage on mount
  useEffect(() => {
    try {
      const savedRoutesData = localStorage.getItem(STORAGE_KEYS.SAVED_ROUTES);
      if (savedRoutesData) {
        const parsed = JSON.parse(savedRoutesData);
        if (Array.isArray(parsed)) {
          setSavedRoutes(parsed);
        }
      }

      const historyData = localStorage.getItem(STORAGE_KEYS.ROUTE_HISTORY);
      if (historyData) {
        const parsed = JSON.parse(historyData);
        if (Array.isArray(parsed)) {
          setRouteHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading route data from localStorage:', error);
      setSavedRoutes([]);
      setRouteHistory([]);
    }

    // Load initial route from URL
    const routeData = parseURLToRoute();
    if (routeData) {
      setInitialRouteData(routeData);
    }
  }, []);

  // Generate shareable URL from route data
  const generateShareableURL = useCallback((routeData: RouteData): string => {
    const params = new URLSearchParams();
    
    // Add origin - don't double encode the name
    const originStr = `${routeData.origin.location.lat},${routeData.origin.location.lng},${routeData.origin.name}`;
    params.set('origin', originStr);
    
    // Add destination - don't double encode the name
    const destStr = `${routeData.destination.location.lat},${routeData.destination.location.lng},${routeData.destination.name}`;
    params.set('destination', destStr);
    
    // Add waypoints if present
    if (routeData.waypoints && routeData.waypoints.length > 0) {
      const waypointData = routeData.waypoints.map(wp => ({
        lat: wp.location.lat,
        lng: wp.location.lng,
        name: wp.name,
      }));
      params.set('waypoints', JSON.stringify(waypointData));
    }
    
    // Add mode
    params.set('mode', routeData.mode);
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    return `${baseUrl}?${params.toString()}`;
  }, []);

  // Parse URL parameters to route data
  const parseURLToRoute = useCallback((): ParsedRouteData | null => {
    if (typeof window === 'undefined') return null;
    
    const params = new URLSearchParams(window.location.search);
    const originParam = params.get('origin');
    const destParam = params.get('destination');
    
    if (!originParam || !destParam) return null;
    
    try {
      // Parse origin
      const originParts = originParam.split(',');
      if (originParts.length < 3) return null;
      
      const originLat = parseFloat(originParts[0]);
      const originLng = parseFloat(originParts[1]);
      const originName = decodeURIComponent(originParts.slice(2).join(','));
      
      if (isNaN(originLat) || isNaN(originLng)) return null;
      
      // Parse destination
      const destParts = destParam.split(',');
      if (destParts.length < 3) return null;
      
      const destLat = parseFloat(destParts[0]);
      const destLng = parseFloat(destParts[1]);
      const destName = decodeURIComponent(destParts.slice(2).join(','));
      
      if (isNaN(destLat) || isNaN(destLng)) return null;
      
      // Parse waypoints
      let waypoints: ParsedRouteData['waypoints'] = [];
      const waypointsParam = params.get('waypoints');
      if (waypointsParam) {
        try {
          // No need to decode because URLSearchParams already decodes
          const parsed = JSON.parse(waypointsParam);
          if (Array.isArray(parsed)) {
            waypoints = parsed;
          }
        } catch (e) {
          // Invalid waypoints, continue without them
        }
      }
      
      // Parse mode
      const modeParam = params.get('mode') as RouteMode | null;
      const validModes: RouteMode[] = ['walking', 'transit', 'driving'];
      const mode = modeParam && validModes.includes(modeParam) ? modeParam : 'walking';
      
      return {
        origin: {
          lat: originLat,
          lng: originLng,
          name: originName,
        },
        destination: {
          lat: destLat,
          lng: destLng,
          name: destName,
        },
        waypoints,
        mode,
      };
    } catch (error) {
      console.error('Error parsing route from URL:', error);
      return null;
    }
  }, []);

  // Save route to localStorage
  const saveRoute = useCallback((routeData: RouteData) => {
    const routeName = routeData.name || `${routeData.origin.name} → ${routeData.destination.name}`;
    const truncatedName = routeName.length > MAX_NAME_LENGTH 
      ? routeName.substring(0, MAX_NAME_LENGTH) 
      : routeName;
    
    const savedRoute: SavedRoute = {
      ...routeData,
      id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: truncatedName,
      timestamp: Date.now(),
    };
    
    const updatedRoutes = [savedRoute, ...savedRoutes];
    setSavedRoutes(updatedRoutes);
    
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(updatedRoutes));
    } catch (error) {
      console.error('Error saving route to localStorage:', error);
    }
  }, [savedRoutes]);

  // Delete saved route
  const deleteRoute = useCallback((routeId: string) => {
    const updatedRoutes = savedRoutes.filter(route => route.id !== routeId);
    setSavedRoutes(updatedRoutes);
    
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, JSON.stringify(updatedRoutes));
    } catch (error) {
      console.error('Error updating saved routes:', error);
    }
  }, [savedRoutes]);

  // Clear all saved routes
  const clearAllRoutes = useCallback(() => {
    setSavedRoutes([]);
    
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_ROUTES, '[]');
    } catch (error) {
      console.error('Error clearing saved routes:', error);
    }
  }, []);

  // Add route to history
  const addToHistory = useCallback((routeData: RouteData) => {
    setRouteHistory(currentHistory => {
      // Check if the same route is already the most recent in history
      if (currentHistory.length > 0) {
        const mostRecent = currentHistory[0];
        if (
          mostRecent.origin.name === routeData.origin.name &&
          mostRecent.destination.name === routeData.destination.name &&
          mostRecent.mode === routeData.mode
        ) {
          // Skip adding duplicate
          return currentHistory;
        }
      }
      
      const historyRoute: SavedRoute = {
        ...routeData,
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: routeData.name || `${routeData.origin.name} → ${routeData.destination.name}`,
        timestamp: Date.now(),
      };
      
      const updatedHistory = [historyRoute, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTE_HISTORY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error saving route history:', error);
      }
      
      return updatedHistory;
    });
  }, []);

  // Clear route history
  const clearHistory = useCallback(() => {
    setRouteHistory([]);
    
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTE_HISTORY, '[]');
    } catch (error) {
      console.error('Error clearing route history:', error);
    }
  }, []);

  // Copy shareable URL to clipboard
  const copyShareableURL = useCallback(async (routeData: RouteData): Promise<boolean> => {
    try {
      if (!navigator.clipboard) {
        console.warn('Clipboard API not available');
        return false;
      }
      
      const url = generateShareableURL(routeData);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }, [generateShareableURL]);

  return {
    // State
    savedRoutes,
    routeHistory,
    initialRouteData,
    
    // URL operations
    generateShareableURL,
    parseURLToRoute,
    copyShareableURL,
    
    // Storage operations
    saveRoute,
    deleteRoute,
    clearAllRoutes,
    
    // History operations
    addToHistory,
    clearHistory,
  };
}