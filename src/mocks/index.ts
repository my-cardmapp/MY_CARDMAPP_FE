// MSW 초기화 파일
export async function initMocks() {
  if (typeof window === 'undefined') {
    // Node.js 환경 (SSR, 테스트)
    const { server } = await import('./server');
    server.listen({ onUnhandledRequest: 'warn' });
  } else {
    // 브라우저 환경
    if (process.env.NODE_ENV === 'development') {
      const { worker } = await import('./browser');
      
      // Service Worker 시작 옵션
      await worker.start({
        serviceWorker: {
          url: '/mockServiceWorker.js'
        },
        onUnhandledRequest: 'warn',
        quiet: false // 개발 중에는 로그 표시
      });
      
      console.log('[MSW] Mock Service Worker가 시작되었습니다.');
    }
  }
}

// 개발 환경에서만 MSW 활성화
export function shouldEnableMocking() {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}