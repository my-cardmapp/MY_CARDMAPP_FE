'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { 
  getSpritePosition, 
  getSpriteUrl, 
  getIconSize,
  hasIcon,
  type SpriteType,
  type IconName 
} from '@/constants/spriteConfig';
import { 
  preloadSpriteSheets, 
  isSpriteLoaded, 
  getSpriteMetrics,
  calculateNetworkSavings 
} from '@/utils/spriteUtils';

interface SpriteData {
  position: { x: number; y: number };
  url: string;
  size: { width: number; height: number };
  isLoaded: boolean;
  error: Error | null;
}

/**
 * Hook to manage sprite loading and configuration
 */
export function useSprite(type: SpriteType, name: IconName): SpriteData {
  const [isLoaded, setIsLoaded] = useState(() => isSpriteLoaded(type));
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(false);

  // Validate and get sprite data
  const spriteData = useMemo(() => {
    try {
      if (!hasIcon(type, name)) {
        throw new Error(`Icon ${name} not found in ${type} sprite`);
      }

      return {
        position: getSpritePosition(type, name),
        url: getSpriteUrl(type),
        size: getIconSize(type),
      };
    } catch (err) {
      setError(err as Error);
      return {
        position: { x: 0, y: 0 },
        url: '',
        size: { width: 0, height: 0 },
      };
    }
  }, [type, name]);

  // Preload sprite if needed
  useEffect(() => {
    if (isLoaded || loadingRef.current || error) return;

    const loadSprite = async () => {
      loadingRef.current = true;
      try {
        const results = await preloadSpriteSheets([type]);
        if (results[0]) {
          setIsLoaded(true);
        } else {
          setError(new Error(`Failed to load sprite sheet: ${type}`));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        loadingRef.current = false;
      }
    };

    loadSprite();
  }, [type, isLoaded, error]);

  return {
    ...spriteData,
    isLoaded,
    error,
  };
}

/**
 * Hook to preload multiple sprite sheets
 */
export function useSpritePreload(sheets: string[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Error | null>(null);
  const prevSheetsRef = useRef<string[]>([]);

  useEffect(() => {
    // Check if sheets have changed
    const sheetsChanged = 
      sheets.length !== prevSheetsRef.current.length ||
      sheets.some((sheet, i) => sheet !== prevSheetsRef.current[i]);

    if (!sheetsChanged) return;

    prevSheetsRef.current = sheets;

    const preload = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await preloadSpriteSheets(sheets);
        const loadedMap: Record<string, boolean> = {};
        
        sheets.forEach((sheet, index) => {
          loadedMap[sheet] = results[index];
        });

        setLoaded(loadedMap);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    preload();
  }, [sheets]);

  return {
    isLoading,
    loaded,
    error,
  };
}

/**
 * Hook to get sprite metrics and network savings
 */
export function useSpriteMetrics(type: string) {
  const [metrics, setMetrics] = useState<ReturnType<typeof getSpriteMetrics> | null>(null);
  const [savings, setSavings] = useState<ReturnType<typeof calculateNetworkSavings> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const spriteMetrics = getSpriteMetrics(type);
      setMetrics(spriteMetrics);

      // Calculate network savings
      const networkSavings = calculateNetworkSavings(
        spriteMetrics.totalIcons,
        2, // Average 2KB per icon
        spriteMetrics.fileSize
      );
      setSavings(networkSavings);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setMetrics(null);
      setSavings(null);
    }
  }, [type]);

  return {
    metrics,
    savings,
    error,
  };
}

/**
 * Hook for responsive sprite sizing
 */
export function useResponsiveSprite(
  baseSize: number,
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }
) {
  const [size, setSize] = useState(baseSize);

  useEffect(() => {
    if (!breakpoints) return;

    const updateSize = () => {
      const width = window.innerWidth;
      
      if (width >= 1280 && breakpoints.xl) {
        setSize(breakpoints.xl);
      } else if (width >= 1024 && breakpoints.lg) {
        setSize(breakpoints.lg);
      } else if (width >= 768 && breakpoints.md) {
        setSize(breakpoints.md);
      } else if (width >= 640 && breakpoints.sm) {
        setSize(breakpoints.sm);
      } else {
        setSize(baseSize);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [baseSize, breakpoints]);

  return size;
}

/**
 * Hook for lazy loading sprites with Intersection Observer
 */
export function useLazySprite(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        ...options,
      }
    );

    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref, options]);

  return isVisible;
}