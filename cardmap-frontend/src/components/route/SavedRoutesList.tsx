'use client';

import { useState } from 'react';
import { useRouteSharing } from '@/hooks/useRouteSharing';
import type { RouteMode } from '@/types/route';

interface LocationData {
  id?: number;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface SavedRoutesListProps {
  onRouteLoad?: (
    origin: LocationData,
    destination: LocationData,
    waypoints?: LocationData[],
    mode?: RouteMode
  ) => void;
  showHistory?: boolean;
  className?: string;
}

export function SavedRoutesList({
  onRouteLoad,
  showHistory = true,
  className = '',
}: SavedRoutesListProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const {
    savedRoutes,
    routeHistory,
    deleteRoute,
    clearAllRoutes,
    clearHistory,
  } = useRouteSharing();

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  // Get mode label
  const getModeLabel = (mode: RouteMode): string => {
    switch (mode) {
      case 'walking':
        return '도보';
      case 'transit':
        return '대중교통';
      case 'driving':
        return '자동차';
      default:
        return mode;
    }
  };

  const handleRouteClick = (route: typeof savedRoutes[0]) => {
    onRouteLoad?.(
      route.origin,
      route.destination,
      route.waypoints,
      route.mode
    );
  };

  const handleDelete = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation(); // Prevent route from loading when clicking delete
    deleteRoute(routeId);
  };

  const displayRoutes = activeTab === 'saved' ? savedRoutes : routeHistory;
  const isHistoryTab = activeTab === 'history';

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Tabs */}
      {showHistory && (
        <div className="flex border-b">
          <button
            role="tab"
            aria-selected={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === 'saved'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            저장된 경로 ({savedRoutes.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            최근 경로 ({routeHistory.length})
          </button>
        </div>
      )}

      {/* Header with clear button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium text-gray-900">
          {isHistoryTab ? '최근 이용한 경로' : '저장된 경로'}
        </h3>
        {displayRoutes.length > 0 && (
          <button
            onClick={isHistoryTab ? clearHistory : clearAllRoutes}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
            aria-label={isHistoryTab ? '기록 삭제' : '모두 삭제'}
          >
            {isHistoryTab ? '기록 삭제' : '모두 삭제'}
          </button>
        )}
      </div>

      {/* Routes list */}
      <div className="max-h-96 overflow-y-auto">
        {displayRoutes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📍</div>
            <p>{isHistoryTab ? '최근 경로가 없습니다' : '저장된 경로가 없습니다'}</p>
          </div>
        ) : (
          <div className="divide-y">
            {displayRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => handleRouteClick(route)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {route.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {route.origin.name} → {route.destination.name}
                      {route.waypoints && route.waypoints.length > 0 && (
                        <span className="text-gray-400">
                          {' '}(경유 {route.waypoints.length}곳)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span>🚶</span>
                        <span>{getModeLabel(route.mode)}</span>
                      </span>
                      <span>{formatRelativeTime(route.timestamp)}</span>
                    </div>
                  </div>
                  {!isHistoryTab && (
                    <button
                      onClick={(e) => handleDelete(e, route.id)}
                      className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="삭제"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}