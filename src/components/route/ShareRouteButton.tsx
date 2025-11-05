'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouteSharing } from '@/hooks/useRouteSharing';
import type { Route, RouteMode } from '@/types/route';

interface LocationData {
  id?: number;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface ShareRouteButtonProps {
  route: Route | null;
  origin: LocationData;
  destination: LocationData;
  waypoints?: LocationData[];
  mode: RouteMode;
  className?: string;
  onShare?: () => void;
}

export function ShareRouteButton({
  route,
  origin,
  destination,
  waypoints,
  mode,
  className = '',
  onShare,
}: ShareRouteButtonProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const { copyShareableURL } = useRouteSharing();

  // Reset message after timeout
  useEffect(() => {
    if (copyStatus !== 'idle') {
      const timer = setTimeout(() => {
        setCopyStatus('idle');
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  const handleShare = useCallback(async () => {
    if (!route) return;

    try {
      const success = await copyShareableURL({
        route,
        origin,
        destination,
        waypoints,
        mode,
      });

      if (success) {
        setCopyStatus('success');
        setMessage('링크가 복사되었습니다');
        onShare?.();
      } else {
        setCopyStatus('error');
        setMessage('복사 실패: 클립보드를 사용할 수 없습니다');
      }
    } catch (error) {
      setCopyStatus('error');
      setMessage('복사 실패');
      console.error('Share error:', error);
    }
  }, [route, origin, destination, waypoints, mode, copyShareableURL, onShare]);

  const isDisabled = !route;

  // Icon based on status
  const getIcon = () => {
    switch (copyStatus) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '🔗';
    }
  };

  const baseClasses = `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
    transition-all duration-200 relative
  `;

  const stateClasses = isDisabled
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : copyStatus === 'success'
    ? 'bg-green-500 text-white hover:bg-green-600'
    : copyStatus === 'error'
    ? 'bg-red-500 text-white hover:bg-red-600'
    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95';

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        disabled={isDisabled}
        className={`${baseClasses} ${stateClasses} ${className}`}
        aria-label="경로 공유하기"
        title={isDisabled ? '경로를 먼저 계산해주세요' : '클립보드에 공유 링크 복사'}
      >
        <span className="text-lg">{getIcon()}</span>
        <span>
          {copyStatus === 'success' ? '복사됨!' : copyStatus === 'error' ? '실패' : '공유'}
        </span>
      </button>

      {/* Tooltip message */}
      {message && (
        <div
          className={`
            absolute top-full left-1/2 transform -translate-x-1/2 mt-2
            px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10
            text-sm font-medium animate-fade-in
            ${
              copyStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }
          `}
          role="status"
          aria-live="polite"
        >
          {message}
          <div
            className={`
              absolute -top-1 left-1/2 transform -translate-x-1/2
              w-2 h-2 rotate-45
              ${copyStatus === 'success' ? 'bg-green-600' : 'bg-red-600'}
            `}
          />
        </div>
      )}
    </div>
  );
}