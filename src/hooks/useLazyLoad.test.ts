import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLazyLoad, useInfiniteScroll, useLazyImage } from './useLazyLoad';

// Mock Intersection Observer
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Set<Element> = new Set();
  options: IntersectionObserverInit | undefined;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Helper method for testing
  triggerIntersect(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 0,
      intersectionRect: {} as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: null,
      target: document.createElement('div'),
      time: Date.now(),
      ...entry,
    })) as IntersectionObserverEntry[];
    
    this.callback(fullEntries, this as any);
  }
}

describe('useLazyLoad Hook', () => {
  let mockObservers: MockIntersectionObserver[] = [];
  
  beforeEach(() => {
    mockObservers = [];
    // Setup IntersectionObserver mock
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      const observer = new MockIntersectionObserver(callback, options);
      mockObservers.push(observer);
      return observer;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockObservers = [];
  });

  it('should initialize with isIntersecting as false', () => {
    const { result } = renderHook(() => useLazyLoad());
    
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasBeenVisible).toBe(false);
  });

  it('should create observer with custom options', async () => {
    const options = {
      rootMargin: '100px',
      threshold: 0.5,
    };
    
    const { result } = renderHook(() => useLazyLoad(options));
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });

    // Force re-render to trigger effect
    const { rerender } = renderHook(() => useLazyLoad(options));
    rerender();
    
    await waitFor(() => {
      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining(options)
      );
    });
  });

  it('should observe element when ref is set', async () => {
    const { result, rerender } = renderHook(() => useLazyLoad());
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
      const observer = mockObservers[0];
      expect(observer.elements.has(element)).toBe(true);
    });
  });

  it('should update isIntersecting when element enters viewport', async () => {
    const { result, rerender } = renderHook(() => useLazyLoad());
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasBeenVisible).toBe(true);
  });

  it('should maintain hasBeenVisible even when element leaves viewport', async () => {
    const { result, rerender } = renderHook(() => useLazyLoad());
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    // Element enters viewport
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    expect(result.current.hasBeenVisible).toBe(true);
    
    // Element leaves viewport
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: false, intersectionRatio: 0 }
      ]);
    });
    
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasBeenVisible).toBe(true); // Should remain true
  });

  it('should call onIntersect callback when provided', async () => {
    const onIntersect = vi.fn();
    const { result, rerender } = renderHook(() => useLazyLoad({ onIntersect }));
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    expect(onIntersect).toHaveBeenCalledWith(true);
  });

  it('should unobserve element when once option is true and element has been visible', async () => {
    const { result, rerender } = renderHook(() => useLazyLoad({ once: true }));
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    const observer = mockObservers[0];
    const unobserveSpy = vi.spyOn(observer, 'unobserve');
    
    act(() => {
      observer.triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    expect(unobserveSpy).toHaveBeenCalledWith(element);
  });

  it('should cleanup observer on unmount', async () => {
    const { result, rerender, unmount } = renderHook(() => useLazyLoad());
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    const observer = mockObservers[0];
    const disconnectSpy = vi.spyOn(observer, 'disconnect');
    
    unmount();
    
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should handle ref with null', () => {
    const { result } = renderHook(() => useLazyLoad());
    
    expect(() => {
      act(() => {
        result.current.ref.current = null;
      });
    }).not.toThrow();
  });

  it('should work without IntersectionObserver support', () => {
    // Remove IntersectionObserver
    const originalIO = (global as any).IntersectionObserver;
    delete (global as any).IntersectionObserver;
    
    const { result } = renderHook(() => useLazyLoad());
    
    // Should fallback to visible state
    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasBeenVisible).toBe(true);
    
    // Restore
    (global as any).IntersectionObserver = originalIO;
  });
});

describe('useInfiniteScroll Hook', () => {
  let mockObservers: MockIntersectionObserver[] = [];
  
  beforeEach(() => {
    mockObservers = [];
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      const observer = new MockIntersectionObserver(callback, options);
      mockObservers.push(observer);
      return observer;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call callback when intersecting', async () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useInfiniteScroll(callback));
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });
  });

  it('should not call callback multiple times while loading', async () => {
    const callback = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const { result, rerender } = renderHook(() => useInfiniteScroll(callback));
    const element = document.createElement('div');
    
    act(() => {
      result.current.ref.current = element;
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockObservers.length).toBeGreaterThan(0);
    });
    
    // Trigger intersection multiple times
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    act(() => {
      mockObservers[0].triggerIntersect([
        { target: element, isIntersecting: true, intersectionRatio: 1 }
      ]);
    });
    
    // Should only be called once due to loading state
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useLazyImage Hook', () => {
  beforeEach(() => {
    (global as any).IntersectionObserver = vi.fn((callback, options) => {
      return new MockIntersectionObserver(callback, options);
    });
    
    // Mock Image constructor
    (global as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      
      constructor() {
        setTimeout(() => {
          if (this.src && this.onload) {
            this.onload();
          }
        }, 0);
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not load image until visible', () => {
    const { result } = renderHook(() => useLazyImage('/test.jpg'));
    
    expect(result.current.imgSrc).toBeUndefined();
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should load image when hasBeenVisible becomes true', async () => {
    // Mock IntersectionObserver to immediately mark as visible
    (global as any).IntersectionObserver = undefined;
    
    const { result } = renderHook(() => useLazyImage('/test.jpg'));
    
    await waitFor(() => {
      expect(result.current.imgSrc).toBe('/test.jpg');
      expect(result.current.isLoaded).toBe(true);
    });
  });

  it('should handle image loading error', async () => {
    // Mock Image to trigger error
    (global as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      
      constructor() {
        setTimeout(() => {
          if (this.src && this.onerror) {
            this.onerror();
          }
        }, 0);
      }
    };
    
    // Mock IntersectionObserver to immediately mark as visible
    (global as any).IntersectionObserver = undefined;
    
    const { result } = renderHook(() => useLazyImage('/test.jpg'));
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.isLoaded).toBe(false);
    });
  });
});