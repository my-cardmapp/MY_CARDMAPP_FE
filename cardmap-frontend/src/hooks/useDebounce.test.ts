import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 }
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 299ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    
    // Value should still not have changed
    expect(result.current).toBe('initial');

    // Fast-forward time by 1ms more (total 300ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    
    // Now value should have changed
    expect(result.current).toBe('updated');
  });

  it('should cancel previous debounce when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 }
      }
    );

    // Change value multiple times rapidly
    rerender({ value: 'first', delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    rerender({ value: 'second', delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    rerender({ value: 'third', delay: 300 });
    
    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast-forward time by 300ms from last change
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should only have the last value
    expect(result.current).toBe('third');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 }
      }
    );

    rerender({ value: 'updated', delay: 100 });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current).toBe('updated');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 }
      }
    );

    // Trigger a debounce
    rerender({ value: 'updated', delay: 300 });
    
    // Unmount before timeout completes
    unmount();
    
    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle object values', () => {
    const initialObject = { lat: 37.5665, lng: 126.9780 };
    const updatedObject = { lat: 37.5666, lng: 126.9781 };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObject, delay: 300 }
      }
    );

    expect(result.current).toEqual(initialObject);

    rerender({ value: updatedObject, delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toEqual(updatedObject);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: null as string | null, delay: 300 }
      }
    );

    expect(result.current).toBe(null);

    rerender({ value: 'value', delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe('value');

    rerender({ value: undefined as string | undefined, delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(undefined);
  });

  it('should immediately update if delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    );

    rerender({ value: 'updated', delay: 0 });
    
    // Should update immediately without waiting
    expect(result.current).toBe('updated');
  });
});