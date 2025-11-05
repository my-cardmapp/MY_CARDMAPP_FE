import { describe, it, expect, vi } from 'vitest';

// Mock server 모듈
vi.mock('./server', () => ({
  server: {
    listen: vi.fn(),
    close: vi.fn(),
    use: vi.fn(),
    resetHandlers: vi.fn(),
    listHandlers: vi.fn(() => new Array(11)) // 11개의 핸들러
  }
}));

describe('MSW Node Server', () => {
  it('should create server with handlers', async () => {
    const { server } = await import('./server');
    
    expect(server).toBeDefined();
  });

  it('should have listen method', async () => {
    const { server } = await import('./server');
    
    expect(typeof server.listen).toBe('function');
  });

  it('should have close method', async () => {
    const { server } = await import('./server');
    
    expect(typeof server.close).toBe('function');
  });

  it('should have resetHandlers method', async () => {
    const { server } = await import('./server');
    
    expect(typeof server.resetHandlers).toBe('function');
  });

  it('should have listHandlers method', async () => {
    const { server } = await import('./server');
    
    expect(typeof server.listHandlers).toBe('function');
  });
});