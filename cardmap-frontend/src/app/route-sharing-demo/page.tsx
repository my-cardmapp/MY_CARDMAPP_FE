'use client';

import { useState } from 'react';
import { RoutePlanner } from '@/components/route';
import type { Route } from '@/types/route';

interface LocationData {
  id: number;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function RouteSharingDemoPage() {
  const [calculatedRoute, setCalculatedRoute] = useState<{
    route: Route;
    origin: LocationData;
    destination: LocationData;
    waypoints?: LocationData[];
  } | null>(null);

  const handleRouteCalculated = (
    route: Route,
    origin: LocationData,
    destination: LocationData,
    waypoints?: LocationData[]
  ) => {
    setCalculatedRoute({ route, origin, destination, waypoints });
  };

  const handleRouteClear = () => {
    setCalculatedRoute(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            경로 공유 및 저장 데모
          </h1>
          <p className="text-gray-600">
            경로를 계산하고, 공유 링크를 생성하거나 저장할 수 있습니다.
            URL 파라미터를 통해 경로를 공유하고 불러올 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Route Planner with Sharing */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              경로 계획 및 공유
            </h2>
            <RoutePlanner
              onRouteCalculated={handleRouteCalculated}
              onRouteClear={handleRouteClear}
              showSavedRoutes={true}
            />
          </div>

          {/* Route Information Display */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              계산된 경로 정보
            </h2>
            {calculatedRoute ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">출발지</h3>
                    <p className="text-lg">{calculatedRoute.origin.name}</p>
                    <p className="text-sm text-gray-500">
                      {calculatedRoute.origin.address}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">도착지</h3>
                    <p className="text-lg">{calculatedRoute.destination.name}</p>
                    <p className="text-sm text-gray-500">
                      {calculatedRoute.destination.address}
                    </p>
                  </div>

                  {calculatedRoute.waypoints && calculatedRoute.waypoints.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700">경유지</h3>
                      {calculatedRoute.waypoints.map((waypoint, index) => (
                        <div key={index} className="mt-2">
                          <p className="text-lg">{waypoint.name}</p>
                          <p className="text-sm text-gray-500">{waypoint.address}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-gray-700 mb-2">경로 요약</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">거리: </span>
                        <span className="font-medium">
                          {(calculatedRoute.route.distance / 1000).toFixed(1)}km
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">시간: </span>
                        <span className="font-medium">
                          {Math.round(calculatedRoute.route.duration / 60)}분
                        </span>
                      </div>
                      {calculatedRoute.route.fare !== undefined && (
                        <div className="col-span-2">
                          <span className="text-gray-600">요금: </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('ko-KR').format(
                              calculatedRoute.route.fare
                            )}
                            원
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                <div className="text-5xl mb-4">🗺️</div>
                <p>경로를 계산하면 여기에 정보가 표시됩니다.</p>
                <p className="text-sm mt-2">
                  계산된 경로는 자동으로 히스토리에 저장됩니다.
                </p>
              </div>
            )}

            {/* Features Description */}
            <div className="mt-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">주요 기능</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">📎</span>
                  <span>
                    공유 버튼을 통해 URL을 클립보드에 복사하여 다른 사람과 경로를 공유할 수
                    있습니다.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💾</span>
                  <span>
                    저장 버튼을 통해 자주 사용하는 경로를 이름과 함께 저장할 수 있습니다.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📜</span>
                  <span>
                    최근 계산한 경로는 자동으로 히스토리에 저장되며, 최대 5개까지
                    보관됩니다.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔗</span>
                  <span>
                    URL 파라미터를 통해 경로를 공유받으면 자동으로 해당 경로가 로드됩니다.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🗄️</span>
                  <span>
                    모든 저장된 경로와 히스토리는 브라우저의 localStorage에 안전하게
                    보관됩니다.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* URL Sharing Example */}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">URL 공유 예시</h3>
          <p className="text-sm text-gray-600 mb-3">
            경로를 계산한 후 생성되는 공유 URL 형식:
          </p>
          <code className="block bg-white p-3 rounded text-xs text-gray-700 overflow-x-auto">
            {typeof window !== 'undefined' ? window.location.origin : ''}/route-sharing-demo?origin=37.5547,126.9707,Seoul+Station&destination=37.4979,127.0276,Gangnam+Station&mode=transit
          </code>
          <p className="text-sm text-gray-600 mt-3">
            이 URL을 통해 출발지, 도착지, 경유지, 이동 수단 정보를 전달할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}