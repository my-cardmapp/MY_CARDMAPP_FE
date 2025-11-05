import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestDeduplicator } from './requestDeduplicator';

describe('RequestDeduplicator', () => {
  let deduplicator: RequestDeduplicator;

  beforeEach(() => {
    vi.useFakeTimers();
    deduplicator = new RequestDeduplicator();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    deduplicator.clear();
  });

  describe('deduplicate', () => {
    it('should execute request for new key', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      
      const promise = deduplicator.deduplicate('key1', mockRequest);
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      const result = await promise;
      expect(result).toBe('result');
    });

    it('should return same promise for duplicate requests', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      
      const promise1 = deduplicator.deduplicate('key1', mockRequest);
      const promise2 = deduplicator.deduplicate('key1', mockRequest);
      const promise3 = deduplicator.deduplicate('key1', mockRequest);
      
      // Request should only be called once
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      // All promises should be the same
      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
      
      const results = await Promise.all([promise1, promise2, promise3]);
      expect(results).toEqual(['result', 'result', 'result']);
    });

    it('should handle different keys independently', async () => {
      const mockRequest1 = vi.fn().mockResolvedValue('result1');
      const mockRequest2 = vi.fn().mockResolvedValue('result2');
      
      const promise1 = deduplicator.deduplicate('key1', mockRequest1);
      const promise2 = deduplicator.deduplicate('key2', mockRequest2);
      
      expect(mockRequest1).toHaveBeenCalledTimes(1);
      expect(mockRequest2).toHaveBeenCalledTimes(1);
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
    });

    it('should handle request failures', async () => {
      const mockError = new Error('Request failed');
      const mockRequest = vi.fn().mockRejectedValue(mockError);
      
      const promise1 = deduplicator.deduplicate('key1', mockRequest);
      const promise2 = deduplicator.deduplicate('key1', mockRequest);
      
      // Request should only be called once
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      // Both promises should reject with the same error
      await expect(promise1).rejects.toThrow('Request failed');
      await expect(promise2).rejects.toThrow('Request failed');
    });

    it('should allow new request after previous completes', async () => {
      const mockRequest = vi.fn()
        .mockResolvedValueOnce('result1')
        .mockResolvedValueOnce('result2');
      
      const promise1 = deduplicator.deduplicate('key1', mockRequest);
      await promise1;
      
      const promise2 = deduplicator.deduplicate('key1', mockRequest);
      await promise2;
      
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle TTL expiration', async () => {
      const ttl = 1000; // 1 second
      const deduplicatorWithTTL = new RequestDeduplicator(ttl);
      const mockRequest = vi.fn().mockResolvedValue('result');
      
      await deduplicatorWithTTL.deduplicate('key1', mockRequest);
      
      // First call should execute
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      // Advance time past TTL
      vi.advanceTimersByTime(ttl + 1);
      
      // Should allow new request after TTL
      await deduplicatorWithTTL.deduplicate('key1', mockRequest);
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('abort', () => {
    it('should abort pending request', async () => {
      const abortController = new AbortController();
      const mockRequest = vi.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          abortController.signal.addEventListener('abort', () => {
            reject(new Error('Aborted'));
          });
        });
      });
      
      const promise = deduplicator.deduplicate('key1', mockRequest, abortController);
      
      // Abort the request
      deduplicator.abort('key1');
      abortController.abort();
      
      await expect(promise).rejects.toThrow('Aborted');
    });

    it('should not affect completed requests', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      
      const promise = deduplicator.deduplicate('key1', mockRequest);
      const result = await promise;
      
      // Aborting after completion should not throw
      expect(() => deduplicator.abort('key1')).not.toThrow();
      expect(result).toBe('result');
    });

    it('should handle aborting non-existent keys', () => {
      expect(() => deduplicator.abort('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all pending requests', async () => {
      const mockRequest1 = vi.fn().mockResolvedValue('result1');
      const mockRequest2 = vi.fn().mockResolvedValue('result2');
      
      await deduplicator.deduplicate('key1', mockRequest1);
      await deduplicator.deduplicate('key2', mockRequest2);
      
      deduplicator.clear();
      
      // New requests should execute
      await deduplicator.deduplicate('key1', mockRequest1);
      await deduplicator.deduplicate('key2', mockRequest2);
      
      expect(mockRequest1).toHaveBeenCalledTimes(2);
      expect(mockRequest2).toHaveBeenCalledTimes(2);
    });
  });

  describe('has', () => {
    it('should check if key exists', async () => {
      const mockRequest = vi.fn().mockResolvedValue('result');
      
      expect(deduplicator.has('key1')).toBe(false);
      
      const promise = deduplicator.deduplicate('key1', mockRequest);
      expect(deduplicator.has('key1')).toBe(true);
      
      await promise;
      expect(deduplicator.has('key1')).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should handle concurrent requests with same key', async () => {
      let resolveRequest: ((value: string) => void) | null = null;
      const mockRequest = vi.fn().mockImplementation(() => {
        return new Promise<string>((resolve) => {
          resolveRequest = resolve;
        });
      });
      
      const promises = [
        deduplicator.deduplicate('key1', mockRequest),
        deduplicator.deduplicate('key1', mockRequest),
        deduplicator.deduplicate('key1', mockRequest)
      ];
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      // Resolve the request
      resolveRequest!('result');
      
      const results = await Promise.all(promises);
      expect(results).toEqual(['result', 'result', 'result']);
    });

    it('should handle mixed success and failure scenarios', async () => {
      const mockRequest1 = vi.fn().mockResolvedValue('success');
      const mockRequest2 = vi.fn().mockRejectedValue(new Error('failure'));
      
      const promise1 = deduplicator.deduplicate('key1', mockRequest1);
      const promise2 = deduplicator.deduplicate('key2', mockRequest2);
      
      const result1 = await promise1;
      expect(result1).toBe('success');
      
      await expect(promise2).rejects.toThrow('failure');
      
      // Keys should be cleared after completion
      expect(deduplicator.has('key1')).toBe(false);
      expect(deduplicator.has('key2')).toBe(false);
    });

    it('should generate cache key from object parameters', () => {
      const params1 = { lat: 37.5665, lng: 126.9780, zoom: 10 };
      const params2 = { lat: 37.5665, lng: 126.9780, zoom: 10 };
      const params3 = { lat: 37.5666, lng: 126.9780, zoom: 10 };
      
      const key1 = RequestDeduplicator.generateKey(params1);
      const key2 = RequestDeduplicator.generateKey(params2);
      const key3 = RequestDeduplicator.generateKey(params3);
      
      // Same parameters should generate same key
      expect(key1).toBe(key2);
      // Different parameters should generate different key
      expect(key1).not.toBe(key3);
    });

    it('should handle cache key generation for various types', () => {
      expect(RequestDeduplicator.generateKey('string')).toBe('string');
      expect(RequestDeduplicator.generateKey(123)).toBe('123');
      expect(RequestDeduplicator.generateKey(true)).toBe('true');
      expect(RequestDeduplicator.generateKey(null)).toBe('null');
      expect(RequestDeduplicator.generateKey(undefined)).toBe('undefined');
      expect(RequestDeduplicator.generateKey(['a', 'b'])).toBe('["a","b"]');
    });
  });
});