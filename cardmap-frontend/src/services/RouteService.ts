import type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  OptimizeRouteResponse,
  Location,
  ErrorResponse
} from '@/types/api';

interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  cache?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

type RequestInterceptor = (config: RequestInit & { headers: Record<string, string> }) => RequestInit & { headers: Record<string, string> };
type ResponseInterceptor<T> = (response: T) => T;

export class RouteService {
  private baseUrl: string;
  private cache: Map<string, CacheEntry<any>>;
  private defaultCacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private requestInterceptor?: RequestInterceptor;
  private responseInterceptor?: ResponseInterceptor<any>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  /**
   * Calculate a route between origin and destination with optional waypoints
   */
  async calculateRoute(
    request: RouteCalculateRequest,
    options: RequestOptions = {}
  ): Promise<RouteCalculateResponse> {
    // Validate coordinates
    this.validateLocation(request.origin);
    this.validateLocation(request.destination);
    request.waypoints?.forEach(wp => this.validateLocation(wp));

    const cacheKey = this.getCacheKey('calculate', request);
    
    // Check cache if enabled
    if (options.cache !== false) {
      const cached = this.getFromCache<RouteCalculateResponse>(cacheKey);
      if (cached) return cached;
    }

    const url = `${this.baseUrl}/api/v1/routes/calculate`;
    const config = this.prepareRequestConfig('POST', request, options);

    try {
      const response = await this.fetchWithRetry(url, config, options.retries);
      const data = await this.handleResponse<RouteCalculateResponse>(response);
      
      // Apply response interceptor if set
      const finalData = this.responseInterceptor ? this.responseInterceptor(data) : data;
      
      // Cache successful response
      if (options.cache !== false) {
        this.setCache(cacheKey, finalData);
      }
      
      return finalData;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Optimize the order of waypoints for the shortest route
   */
  async optimizeRoute(
    params: {
      origin: Location;
      waypoints: Location[];
      mode?: 'walking' | 'transit' | 'driving';
    },
    options: RequestOptions = {}
  ): Promise<OptimizeRouteResponse> {
    // Validate input
    if (!params.waypoints || params.waypoints.length === 0) {
      throw new Error('At least one waypoint is required');
    }

    this.validateLocation(params.origin);
    params.waypoints.forEach(wp => this.validateLocation(wp));

    // Format URL parameters
    const queryParams = new URLSearchParams({
      origin: `${params.origin.lat},${params.origin.lng}`,
      waypoints: params.waypoints
        .map(wp => `${wp.lat},${wp.lng}`)
        .join(';'),
      mode: params.mode || 'walking'
    });

    const url = `${this.baseUrl}/api/v1/routes/optimize?${queryParams}`;
    const config = this.prepareRequestConfig('GET', null, options);

    const response = await this.fetchWithRetry(url, config, options.retries);
    const data = await this.handleResponse<OptimizeRouteResponse>(response);
    
    return this.responseInterceptor ? this.responseInterceptor(data) : data;
  }

  /**
   * Set a request interceptor to modify requests before sending
   */
  setRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptor = interceptor;
  }

  /**
   * Set a response interceptor to modify responses after receiving
   */
  setResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptor = interceptor;
  }

  /**
   * Clear the route cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Validate location coordinates
   */
  private validateLocation(location: Location): void {
    if (location.lat < -90 || location.lat > 90) {
      throw new Error('Invalid coordinates: latitude must be between -90 and 90');
    }
    if (location.lng < -180 || location.lng > 180) {
      throw new Error('Invalid coordinates: longitude must be between -180 and 180');
    }
  }

  /**
   * Prepare request configuration
   */
  private prepareRequestConfig(
    method: string,
    body: any,
    options: RequestOptions
  ): RequestInit & { headers: Record<string, string> } {
    let config: RequestInit & { headers: Record<string, string> } = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    // Apply request interceptor if set
    if (this.requestInterceptor) {
      config = this.requestInterceptor(config);
    }

    // Add timeout if specified
    if (options.timeout) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), options.timeout);
      config.signal = controller.signal;
    }

    return config;
  }

  /**
   * Fetch with retry logic for transient errors
   */
  private async fetchWithRetry(
    url: string,
    config: RequestInit,
    retries: number = 0
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        // Retry on 503 Service Unavailable
        if (response.status === 503 && attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        // Retry on network errors
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }
      }
    }
    
    throw lastError || new Error('Request failed');
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * Generate cache key for a request
   */
  private getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultCacheTTL
    });
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}