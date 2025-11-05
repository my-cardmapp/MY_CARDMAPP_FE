'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { initMocks } = await import('@/mocks');
          await initMocks();
          console.log('[MSWProvider] MSW initialized successfully');
        } catch (error) {
          console.error('[MSWProvider] Failed to initialize MSW:', error);
        }
      }
      setMswReady(true);
    };

    initMSW();
  }, []);

  // 개발 환경에서 MSW가 준비될 때까지 대기
  if (process.env.NODE_ENV === 'development' && !mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Mock Service Worker 초기화 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}