'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSearchStore } from '@/stores/searchStore';

/**
 * Map position parameters for URL synchronization
 */
export interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Options for URL synchronization hook
 */
export interface UseURLSyncOptions {
  /** Debounce delay in milliseconds for URL updates (default: 300) */
  debounceMs?: number;
  /** Whether to replace history instead of pushing (default: true) */
  replaceHistory?: boolean;
  /** Whether to include map position in URL (default: false) */
  includeMapPosition?: boolean;
}

/**
 * Return type for URL synchronization hook
 */
export interface UseURLSyncReturn {
  /** Sync current state to URL */
  syncToURL: (mapPosition?: MapPosition) => void;
  /** Sync from URL to state */
  syncFromURL: () => void;
  /** Get shareable URL with current state */
  getShareableURL: () => string;
  /** Whether URL is currently synced with state */
  isURLSynced: boolean;
  /** Get map position from URL (if includeMapPosition is true) */
  getMapPosition: () => MapPosition | null;
}

/**
 * Custom hook for bidirectional URL parameter synchronization
 * Syncs search store state with URL parameters for shareability
 */
export function useURLSync(options: UseURLSyncOptions = {}): UseURLSyncReturn {
  const {
    debounceMs = 300,
    replaceHistory = true,
    includeMapPosition = false,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isURLSynced, setIsURLSynced] = useState(false); // Start as false, will be set true after initial sync
  const lastURLRef = useRef<string>('');
  const isSyncingRef = useRef(false);

  // Get store state and actions
  const store = useSearchStore();
  const { query, activeCardTypes, activeCategories, viewMode, page, batchUpdate } = store;

  /**
   * Sanitize and validate string input
   */
  const sanitizeString = (value: string, maxLength = 200): string => {
    if (!value) return '';
    // Remove potential XSS attempts
    return value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .substring(0, maxLength) // Limit length
      .trim();
  };

  /**
   * Parse and validate integer from string
   */
  const parseIntSafe = (value: string | null, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
  };

  /**
   * Parse and validate float from string
   */
  const parseFloatSafe = (value: string | null): number | null => {
    if (!value) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  /**
   * Build URL search params from current state
   */
  const buildURLParams = useCallback((mapPosition?: MapPosition): URLSearchParams => {
    const params = new URLSearchParams();

    // Add search query (already encoded by URLSearchParams)
    if (query) {
      params.set('q', query);
    }

    // Add card types
    if (activeCardTypes.length > 0) {
      params.set('cards', activeCardTypes.join(','));
    }

    // Add categories (URLSearchParams will handle encoding)
    if (activeCategories.length > 0) {
      params.set('categories', activeCategories.join(','));
    }

    // Add view mode (only if not default)
    if (viewMode !== 'map') {
      params.set('view', viewMode);
    }

    // Add page (only if not first page)
    if (page > 0) {
      params.set('page', page.toString());
    }

    // Add map position if provided and enabled
    if (includeMapPosition && mapPosition) {
      if (mapPosition.lat >= -90 && mapPosition.lat <= 90) {
        params.set('lat', mapPosition.lat.toString());
      }
      if (mapPosition.lng >= -180 && mapPosition.lng <= 180) {
        params.set('lng', mapPosition.lng.toString());
      }
      if (mapPosition.zoom > 0 && mapPosition.zoom <= 21) {
        params.set('zoom', mapPosition.zoom.toString());
      }
    }

    return params;
  }, [query, activeCardTypes, activeCategories, viewMode, page, includeMapPosition]);

  /**
   * Parse URL params and return state object
   */
  const parseURLParams = useCallback((params: URLSearchParams | null) => {
    if (!params) return null;

    // Parse query (URLSearchParams already decodes)
    const queryParam = params.get('q');
    const parsedQuery = queryParam ? sanitizeString(queryParam) : '';

    // Parse card types
    const cardsParam = params.get('cards');
    let parsedCardTypes: string[] = [];
    if (cardsParam !== null && cardsParam !== '') {
      parsedCardTypes = cardsParam.split(',').filter(Boolean).map(c => sanitizeString(c, 50));
    }

    // Parse categories
    const categoriesParam = params.get('categories');
    let parsedCategories: string[] = [];
    if (categoriesParam !== null && categoriesParam !== '') {
      parsedCategories = categoriesParam.split(',').filter(Boolean).map(c => sanitizeString(c, 50));
    }

    // Parse view mode
    const viewParam = params.get('view');
    const parsedViewMode = viewParam === 'list' ? 'list' : 'map';

    // Parse page
    const pageParam = params.get('page');
    const parsedPage = parseIntSafe(pageParam, 0);

    return {
      query: parsedQuery,
      activeCardTypes: parsedCardTypes,
      activeCategories: parsedCategories,
      viewMode: parsedViewMode as 'list' | 'map',
      page: parsedPage,
    };
  }, []);

  /**
   * Sync state to URL (raw function without debounce)
   */
  const syncToURLRaw = useCallback((mapPosition?: MapPosition) => {
    if (isSyncingRef.current) return;
    if (!pathname) return;

    const params = buildURLParams(mapPosition);
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    // Check if URL actually changed
    if (newURL === lastURLRef.current) {
      return;
    }

    isSyncingRef.current = true;
    lastURLRef.current = newURL;

    try {
      if (replaceHistory) {
        router.replace(newURL);
      } else {
        router.push(newURL);
      }
      setIsURLSynced(true);
    } catch (error) {
      console.error('Failed to update URL:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [pathname, buildURLParams, replaceHistory, router]);

  // Create debounced version of syncToURL
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const syncToURL = useCallback((mapPosition?: MapPosition) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(() => {
        syncToURLRaw(mapPosition);
        timeoutRef.current = null;
      }, debounceMs);
    } else {
      syncToURLRaw(mapPosition);
    }
  }, [syncToURLRaw, debounceMs]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Sync from URL to state
   */
  const syncFromURL = useCallback(() => {
    if (isSyncingRef.current) return;
    if (!searchParams) return;

    const parsedParams = parseURLParams(searchParams);
    if (!parsedParams) return;

    // Only update if there are actual params to sync
    const hasParams = searchParams.toString().length > 0;
    if (!hasParams) return;

    isSyncingRef.current = true;
    batchUpdate(parsedParams);
    setIsURLSynced(true);
    isSyncingRef.current = false;
  }, [searchParams, parseURLParams, batchUpdate]);

  /**
   * Get shareable URL with current state
   */
  const getShareableURL = useCallback((): string => {
    const params = buildURLParams();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = pathname || '/map';
    const queryString = params.toString();
    return queryString ? `${origin}${path}?${queryString}` : `${origin}${path}`;
  }, [buildURLParams, pathname]);

  /**
   * Get map position from URL
   */
  const getMapPosition = useCallback((): MapPosition | null => {
    if (!includeMapPosition || !searchParams) return null;

    const lat = parseFloatSafe(searchParams.get('lat'));
    const lng = parseFloatSafe(searchParams.get('lng'));
    const zoom = parseFloatSafe(searchParams.get('zoom'));

    // Validate coordinates
    if (lat === null || lng === null || zoom === null) return null;
    if (lat < -90 || lat > 90) return null;
    if (lng < -180 || lng > 180) return null;
    if (zoom < 1 || zoom > 21) return null;

    return { lat, lng, zoom };
  }, [includeMapPosition, searchParams]);

  // Sync from URL on mount
  useEffect(() => {
    syncFromURL();
  }, []); // Only on mount

  // Track URL for change detection
  useEffect(() => {
    if (pathname && searchParams) {
      const currentURL = searchParams.toString() 
        ? `${pathname}?${searchParams.toString()}` 
        : pathname;
      lastURLRef.current = currentURL;
    }
  }, [pathname, searchParams]);

  return {
    syncToURL,
    syncFromURL,
    getShareableURL,
    isURLSynced,
    getMapPosition,
  };
}