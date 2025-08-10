import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that throttles a value
 * @param value - The value to throttle
 * @param delay - The throttle delay in milliseconds
 * @param useRAF - Whether to use requestAnimationFrame for throttling (good for animations)
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, delay: number, useRAF = false): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingValueRef = useRef<T | null>(null);
  const isFirstChangeRef = useRef(true);

  useEffect(() => {
    // Handle delay of 0 - always update immediately
    if (delay === 0) {
      setThrottledValue(value);
      return;
    }

    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    // First change after mount should be immediate
    if (isFirstChangeRef.current && value !== throttledValue) {
      isFirstChangeRef.current = false;
      lastExecutedRef.current = now;
      setThrottledValue(value);
      return;
    }

    // If enough time has passed, update immediately
    if (timeSinceLastExecution >= delay) {
      lastExecutedRef.current = now;
      setThrottledValue(value);
      pendingValueRef.current = null;
      return;
    }

    // Store pending value for trailing call
    pendingValueRef.current = value;

    // Clear any existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (rafRef.current && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update
    const remainingTime = delay - timeSinceLastExecution;
    
    if (useRAF && typeof requestAnimationFrame !== 'undefined') {
      // Use requestAnimationFrame for smooth animations
      const scheduleRAF = () => {
        rafRef.current = requestAnimationFrame(() => {
          const currentTime = Date.now();
          if (currentTime - lastExecutedRef.current >= delay) {
            lastExecutedRef.current = currentTime;
            if (pendingValueRef.current !== null) {
              setThrottledValue(pendingValueRef.current);
              pendingValueRef.current = null;
            }
            rafRef.current = null;
          } else {
            scheduleRAF();
          }
        });
      };
      scheduleRAF();
    } else {
      // Use setTimeout for regular throttling
      timeoutRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        if (pendingValueRef.current !== null) {
          setThrottledValue(pendingValueRef.current);
          pendingValueRef.current = null;
        }
        timeoutRef.current = null;
      }, remainingTime);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, delay, useRAF]);

  return throttledValue;
}

/**
 * Custom hook that returns a throttled callback function
 * @param callback - The function to throttle
 * @param delay - The throttle delay in milliseconds
 * @param useRAF - Whether to use requestAnimationFrame
 * @returns A throttled version of the callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  useRAF = false
): (...args: Parameters<T>) => void {
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingArgsRef = useRef<Parameters<T> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current && typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    // If delay is 0 or enough time has passed, execute immediately
    if (delay === 0 || timeSinceLastExecution >= delay) {
      lastExecutedRef.current = now;
      callbackRef.current(...args);
      return;
    }

    // Store pending args for trailing call
    pendingArgsRef.current = args;

    // Clear any existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (rafRef.current && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule trailing call
    const remainingTime = delay - timeSinceLastExecution;
    
    if (useRAF && typeof requestAnimationFrame !== 'undefined') {
      const scheduleRAF = () => {
        rafRef.current = requestAnimationFrame(() => {
          const currentTime = Date.now();
          if (currentTime - lastExecutedRef.current >= delay) {
            lastExecutedRef.current = currentTime;
            if (pendingArgsRef.current) {
              callbackRef.current(...pendingArgsRef.current);
              pendingArgsRef.current = null;
            }
            rafRef.current = null;
          } else {
            scheduleRAF();
          }
        });
      };
      scheduleRAF();
    } else {
      timeoutRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        if (pendingArgsRef.current) {
          callbackRef.current(...pendingArgsRef.current);
          pendingArgsRef.current = null;
        }
        timeoutRef.current = null;
      }, remainingTime);
    }
  }, [delay, useRAF]);
}