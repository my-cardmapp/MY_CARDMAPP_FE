/**
 * Request deduplicator to prevent concurrent identical requests
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>>;
  private requestTimestamps: Map<string, number>;
  private ttl: number;

  constructor(ttl: number = 5000) {
    this.pendingRequests = new Map();
    this.requestTimestamps = new Map();
    this.ttl = ttl;
  }

  /**
   * Deduplicate a request - returns existing promise if same request is in flight
   * @param key - Unique key for the request
   * @param requestFn - Function that returns a promise
   * @param abortController - Optional abort controller for cancellation
   * @returns Promise with the request result
   */
  deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    abortController?: AbortController
  ): Promise<T> {
    // Check if we have a pending request for this key
    const existingPromise = this.pendingRequests.get(key);
    
    // Check if the existing request is still valid (within TTL)
    const timestamp = this.requestTimestamps.get(key);
    if (existingPromise && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.ttl) {
        return existingPromise;
      }
    }

    // Create new request promise
    const promise = requestFn()
      .then((result) => {
        // Clean up after successful completion
        this.pendingRequests.delete(key);
        this.requestTimestamps.delete(key);
        return result;
      })
      .catch((error) => {
        // Clean up after error
        this.pendingRequests.delete(key);
        this.requestTimestamps.delete(key);
        throw error;
      });

    // Store the promise and timestamp
    this.pendingRequests.set(key, promise);
    this.requestTimestamps.set(key, Date.now());

    return promise;
  }

  /**
   * Abort a pending request
   * @param key - Key of the request to abort
   */
  abort(key: string): void {
    this.pendingRequests.delete(key);
    this.requestTimestamps.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
    this.requestTimestamps.clear();
  }

  /**
   * Check if a request is pending
   * @param key - Key to check
   * @returns True if request is pending
   */
  has(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * Generate a cache key from request parameters
   * @param params - Request parameters
   * @returns String key
   */
  static generateKey(params: any): string {
    if (typeof params === 'string') {
      return params;
    }
    if (params === null) {
      return 'null';
    }
    if (params === undefined) {
      return 'undefined';
    }
    if (typeof params === 'object') {
      return JSON.stringify(params);
    }
    return String(params);
  }
}

/**
 * Batch updates using setTimeout with 16ms delay (60fps target)
 */
export class BatchUpdater<T> {
  private pending: Map<string, T>;
  private timeoutId: NodeJS.Timeout | null;
  private callback: (updates: Map<string, T>) => void;
  private delay: number;

  constructor(callback: (updates: Map<string, T>) => void, delay: number = 16) {
    this.pending = new Map();
    this.timeoutId = null;
    this.callback = callback;
    this.delay = delay;
  }

  /**
   * Add an update to the batch
   * @param key - Unique key for the update
   * @param value - Value to update
   */
  add(key: string, value: T): void {
    this.pending.set(key, value);

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  /**
   * Flush all pending updates immediately
   */
  flush(): void {
    if (this.pending.size > 0) {
      const updates = new Map(this.pending);
      this.pending.clear();
      this.callback(updates);
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Clear all pending updates without executing
   */
  clear(): void {
    this.pending.clear();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Get the number of pending updates
   */
  get size(): number {
    return this.pending.size;
  }
}

/**
 * Create an abortable fetch wrapper
 */
export function createAbortableFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>
): {
  fetch: () => Promise<T>;
  abort: () => void;
} {
  let abortController: AbortController | null = null;

  return {
    fetch: () => {
      // Abort any existing request
      if (abortController) {
        abortController.abort();
      }

      // Create new abort controller
      abortController = new AbortController();

      return fetchFn(abortController.signal)
        .finally(() => {
          abortController = null;
        });
    },
    abort: () => {
      if (abortController) {
        abortController.abort();
        abortController = null;
      }
    }
  };
}