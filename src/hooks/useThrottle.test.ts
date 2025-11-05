import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('should throttle value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 }
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'first', delay: 100 });
    
    // Should update immediately on first change
    expect(result.current).toBe('first');

    // Try to change again immediately
    rerender({ value: 'second', delay: 100 });
    
    // Should not update immediately
    expect(result.current).toBe('first');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Now should have the latest value
    expect(result.current).toBe('second');
  });

  it('should handle rapid changes and only emit at throttle intervals', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: 0, delay: 100 }
      }
    );

    const values: number[] = [];
    
    // Simulate rapid changes
    for (let i = 1; i <= 10; i++) {
      rerender({ value: i, delay: 100 });
      values.push(result.current);
      
      act(() => {
        vi.advanceTimersByTime(20); // 20ms between changes
      });
    }

    // Should have emitted values at throttle intervals
    // First value should be immediate, then throttled
    expect(values[0]).toBe(1); // First change is immediate
    
    // Count distinct values (should be less than total changes due to throttling)
    const distinctValues = [...new Set(values)];
    expect(distinctValues.length).toBeLessThan(10);
  });

  it('should use requestAnimationFrame when useRAF is true', () => {
    const rafSpy = vi.spyOn(global, 'requestAnimationFrame');
    
    const { rerender } = renderHook(
      ({ value, delay, useRAF }) => useThrottle(value, delay, useRAF),
      {
        initialProps: { value: 'initial', delay: 100, useRAF: true }
      }
    );

    // First change is immediate, so need another change to trigger RAF
    rerender({ value: 'first', delay: 100, useRAF: true });
    rerender({ value: 'second', delay: 100, useRAF: true });
    
    // requestAnimationFrame should have been called for the second change
    expect(rafSpy).toHaveBeenCalled();
    
    rafSpy.mockRestore();
  });

  it('should cleanup on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');
    
    const { unmount, rerender } = renderHook(
      ({ value, delay, useRAF }) => useThrottle(value, delay, useRAF),
      {
        initialProps: { value: 'initial', delay: 100, useRAF: false }
      }
    );

    // First change is immediate, second will trigger timer
    rerender({ value: 'first', delay: 100, useRAF: false });
    rerender({ value: 'second', delay: 100, useRAF: false });
    
    // Unmount while timer is active
    unmount();
    
    // Cleanup should have been called for the pending timer
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });

  it('should handle object values', () => {
    const initialObject = { zoom: 10 };
    const updatedObject = { zoom: 15 };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: initialObject, delay: 100 }
      }
    );

    expect(result.current).toEqual(initialObject);

    rerender({ value: updatedObject, delay: 100 });
    
    expect(result.current).toEqual(updatedObject);
  });

  it('should emit trailing value after throttle period', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: 0, delay: 100 }
      }
    );

    // Make rapid changes
    rerender({ value: 1, delay: 100 });
    expect(result.current).toBe(1); // First is immediate

    rerender({ value: 2, delay: 100 });
    rerender({ value: 3, delay: 100 });
    rerender({ value: 4, delay: 100 });
    
    // Should still be 1 (throttled)
    expect(result.current).toBe(1);

    // Wait for throttle period
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Should now have the trailing value
    expect(result.current).toBe(4);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: null as string | null, delay: 100 }
      }
    );

    expect(result.current).toBe(null);

    rerender({ value: 'value', delay: 100 });
    expect(result.current).toBe('value');

    rerender({ value: undefined as string | undefined, delay: 100 });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current).toBe(undefined);
  });

  it('should handle immediate updates when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    );

    rerender({ value: 'updated', delay: 0 });
    expect(result.current).toBe('updated');

    rerender({ value: 'another', delay: 0 });
    expect(result.current).toBe('another');
  });
});