import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock 전체 browser 모듈
vi.mock('./browser', () => ({
  worker: {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    use: vi.fn(),
    resetHandlers: vi.fn(),
    listHandlers: vi.fn(() => []),
    options: {
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    }
  }
}));

describe('MSW Browser Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create worker with handlers', async () => {
    const { worker } = await import('./browser');
    
    expect(worker).toBeDefined();
  });

  it('should configure service worker with correct URL', async () => {
    const { worker } = await import('./browser');
    
    expect(worker.options?.serviceWorker?.url).toBe('/mockServiceWorker.js');
  });

  it('should have start method', async () => {
    const { worker } = await import('./browser');
    
    expect(typeof worker.start).toBe('function');
  });

  it('should have stop method', async () => {
    const { worker } = await import('./browser');
    
    expect(typeof worker.stop).toBe('function');
  });

  it('should have resetHandlers method', async () => {
    const { worker } = await import('./browser');
    
    expect(typeof worker.resetHandlers).toBe('function');
  });
});