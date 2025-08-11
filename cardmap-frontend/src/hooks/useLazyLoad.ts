import { useEffect, useRef, useState, useCallback, MutableRefObject } from 'react';

interface UseLazyLoadOptions extends IntersectionObserverInit {
  once?: boolean; // Unobserve after first intersection
  onIntersect?: (isIntersecting: boolean) => void;
}

interface UseLazyLoadReturn {
  ref: MutableRefObject<Element | null>;
  isIntersecting: boolean;
  hasBeenVisible: boolean;
}

/**
 * Custom hook for lazy loading using Intersection Observer API
 * @param options - IntersectionObserver options and custom behavior
 * @returns Object containing ref and visibility states
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}): UseLazyLoadReturn {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    once = false,
    onIntersect,
    root = null,
    rootMargin = '50px',
    threshold = 0,
    ...observerOptions
  } = options;

  useEffect(() => {
    // Check for IntersectionObserver support
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: treat as always visible
      setIsIntersecting(true);
      setHasBeenVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const intersecting = entry.isIntersecting;
          
          setIsIntersecting(intersecting);
          
          if (intersecting) {
            setHasBeenVisible(true);
            
            // Unobserve if once option is true
            if (once && observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          }
          
          // Call callback if provided
          onIntersect?.(intersecting);
        });
      },
      {
        root,
        rootMargin,
        threshold,
        ...observerOptions,
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [ref.current, once, onIntersect, root, rootMargin, threshold]);

  return {
    ref,
    isIntersecting,
    hasBeenVisible,
  };
}

/**
 * Hook for implementing infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  options: UseLazyLoadOptions = {}
): UseLazyLoadReturn {
  const [isLoading, setIsLoading] = useState(false);

  const handleIntersect = useCallback(
    (isIntersecting: boolean) => {
      if (isIntersecting && !isLoading) {
        setIsLoading(true);
        Promise.resolve(callback()).finally(() => {
          setIsLoading(false);
        });
      }
    },
    [callback, isLoading]
  );

  return useLazyLoad({
    rootMargin: '100px',
    ...options,
    onIntersect: handleIntersect,
  });
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(
  src: string,
  options: UseLazyLoadOptions = {}
): {
  imgRef: MutableRefObject<Element | null>;
  imgSrc: string | undefined;
  isLoaded: boolean;
  isError: boolean;
} {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const { ref: imgRef, hasBeenVisible } = useLazyLoad({
    once: true,
    ...options,
  });

  useEffect(() => {
    if (!hasBeenVisible || !src) return;

    // Preload image
    const img = new Image();
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasBeenVisible, src]);

  return {
    imgRef,
    imgSrc,
    isLoaded,
    isError,
  };
}