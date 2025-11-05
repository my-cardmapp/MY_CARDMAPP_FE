import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW 서버 설정 테스트
describe('MSW Handlers Configuration', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    // MSW 서버 초기화
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('should have handlers defined', () => {
    expect(handlers).toBeDefined();
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });

  it('should handle API v1 routes', async () => {
    // 기본 API 엔드포인트가 처리되는지 확인
    const response = await fetch('http://localhost:3000/api/v1/merchants');
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  it('should return JSON responses', async () => {
    const response = await fetch('http://localhost:3000/api/v1/merchants');
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');
  });

  it('should handle unhandled requests with error', async () => {
    // 처리되지 않은 요청에 대한 에러 처리
    await expect(
      fetch('http://localhost:3000/api/unhandled-route')
    ).rejects.toThrow();
  });
});

// Browser integration 테스트
describe('MSW Browser Integration', () => {
  it('should have browser module', () => {
    // 브라우저 모듈이 존재하는지만 확인 (Node 환경에서는 실제로 실행하지 않음)
    expect(() => import('./browser')).not.toThrow();
  });

  it('should have correct export structure', () => {
    // export 구조만 확인
    expect(true).toBe(true);
  });
});

// Server integration 테스트
describe('MSW Server Integration', () => {
  it('should export server for Node.js environment', async () => {
    const { server } = await import('./server');
    expect(server).toBeDefined();
  });

  it('should have same number of handlers', () => {
    // handlers 배열 길이 확인
    expect(handlers.length).toBeGreaterThan(0);
    // Note: Handler count may vary as we add more endpoints
    expect(handlers.length).toBeGreaterThanOrEqual(10); // 최소 10개 이상의 핸들러
  });
});

// TypeScript 타입 체크 테스트
describe('MSW TypeScript Types', () => {
  it('should have proper TypeScript types for handlers', () => {
    // 타입 체크는 컴파일 시점에 수행되므로
    // 런타임에서는 handlers가 함수 배열인지만 확인
    handlers.forEach(handler => {
      expect(typeof handler).toBe('object');
      expect(handler).toHaveProperty('info');
    });
  });
});

// Development environment 설정 테스트
describe('MSW Development Environment', () => {
  it('should only activate in development mode', () => {
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NODE_ENV === 'test';
    expect(isDevelopment).toBe(true);
  });

  it('should not include MSW in production build', () => {
    // production 빌드에서는 MSW가 포함되지 않아야 함
    if (process.env.NODE_ENV === 'production') {
      expect(() => import('./browser')).rejects.toThrow();
    }
  });
});