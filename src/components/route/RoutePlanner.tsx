'use client';

import { useState, useCallback, useEffect } from 'react';
import { AutocompleteDropdown } from '@/components/search/AutocompleteDropdown';
import { useRouteApi } from '@/hooks/useRouteApi';
import { useRouteSharing } from '@/hooks/useRouteSharing';
import { ShareRouteButton } from './ShareRouteButton';
import { SavedRoutesList } from './SavedRoutesList';
import { RouteMode, RouteCalculateRequest, Route } from '@/types/route';
import { Merchant } from '@/types/merchant';

interface LocationData {
  id: number;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface RoutePlannerProps {
  onRouteCalculated?: (
    route: Route,
    origin: LocationData,
    destination: LocationData,
    waypoints?: LocationData[]
  ) => void;
  onRouteClear?: () => void;
  showSavedRoutes?: boolean;
}

export function RoutePlanner({ onRouteCalculated, onRouteClear, showSavedRoutes = true }: RoutePlannerProps) {
  // State for inputs
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<LocationData | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<LocationData | null>(null);
  const [mode, setMode] = useState<RouteMode>('walking');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [routeName, setRouteName] = useState('');
  
  // State for results
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { calculateRoute } = useRouteApi();
  const { saveRoute, addToHistory, initialRouteData } = useRouteSharing();
  
  // Handle location selection
  const handleOriginSelect = useCallback((item: Merchant | LocationData) => {
    const locationData: LocationData = {
      id: item.id,
      name: item.name,
      address: item.address,
      location: item.location,
    };
    setSelectedOrigin(locationData);
    setOriginQuery(item.name);
    setError(null);
  }, []);
  
  const handleDestinationSelect = useCallback((item: Merchant | LocationData) => {
    const locationData: LocationData = {
      id: item.id,
      name: item.name,
      address: item.address,
      location: item.location,
    };
    setSelectedDestination(locationData);
    setDestinationQuery(item.name);
    setError(null);
  }, []);
  
  // Calculate route
  const handleCalculateRoute = useCallback(async () => {
    if (!selectedOrigin || !selectedDestination) {
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const request: RouteCalculateRequest = {
        origin: selectedOrigin.location,
        destination: selectedDestination.location,
        mode,
      };
      
      const response = await calculateRoute(request);
      
      if (response.data?.routes && response.data.routes.length > 0) {
        setRoutes(response.data.routes);
        
        // Add to history
        addToHistory({
          route: response.data.routes[0],
          origin: selectedOrigin,
          destination: selectedDestination,
          mode,
        });
        
        // Call the callback with the first route
        onRouteCalculated?.(
          response.data.routes[0],
          selectedOrigin,
          selectedDestination,
          [] // TODO: Add waypoint support
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '경로를 계산할 수 없습니다');
      setRoutes([]);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedOrigin, selectedDestination, mode, calculateRoute, onRouteCalculated, addToHistory]);
  
  // Clear form
  const handleClear = useCallback(() => {
    setOriginQuery('');
    setDestinationQuery('');
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setRoutes([]);
    setError(null);
    setMode('walking');
    onRouteClear?.();
  }, [onRouteClear]);
  
  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      const km = meters / 1000;
      // If it's exactly 1km or a whole number, don't show decimal
      if (km === Math.floor(km)) {
        return `${km}km`;
      }
      // For values over 10km, don't show decimal
      if (km >= 10) {
        return `${Math.round(km)}km`;
      }
      // Otherwise show 1 decimal place
      return `${km.toFixed(1)}km`;
    }
    return `${meters}m`;
  };
  
  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}`.trim();
    }
    return `${minutes}분`;
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };
  
  // Save current route
  const handleSaveRoute = useCallback(() => {
    if (!routes.length || !selectedOrigin || !selectedDestination) return;
    
    saveRoute({
      name: routeName || `${selectedOrigin.name} → ${selectedDestination.name}`,
      route: routes[0],
      origin: selectedOrigin,
      destination: selectedDestination,
      mode,
    });
    
    setShowSaveDialog(false);
    setRouteName('');
  }, [routes, selectedOrigin, selectedDestination, mode, routeName, saveRoute]);
  
  // Load saved route
  const handleLoadRoute = useCallback((
    origin: LocationData,
    destination: LocationData,
    waypoints?: LocationData[],
    routeMode?: RouteMode
  ) => {
    setSelectedOrigin(origin);
    setSelectedDestination(destination);
    setOriginQuery(origin.name);
    setDestinationQuery(destination.name);
    if (routeMode) {
      setMode(routeMode);
    }
    // TODO: Handle waypoints when supported
  }, []);
  
  // Load from URL on mount
  useEffect(() => {
    if (initialRouteData) {
      const { origin, destination, waypoints, mode: urlMode } = initialRouteData;
      
      // Create LocationData from parsed URL data
      const originData: LocationData = {
        id: Date.now(),
        name: origin.name,
        address: '',
        location: { lat: origin.lat, lng: origin.lng },
      };
      
      const destData: LocationData = {
        id: Date.now() + 1,
        name: destination.name,
        address: '',
        location: { lat: destination.lat, lng: destination.lng },
      };
      
      handleLoadRoute(originData, destData, undefined, urlMode);
      
      // Auto-calculate route after loading from URL
      setTimeout(() => {
        const button = document.querySelector('[data-testid="calculate-route-button"]') as HTMLButtonElement;
        button?.click();
      }, 500);
    }
  }, [initialRouteData, handleLoadRoute]);
  
  const isCalculateDisabled = !selectedOrigin || !selectedDestination || isCalculating;
  
  return (
    <div
      data-testid="route-planner"
      className="flex flex-col gap-5"
    >
      <div className="space-y-4 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        {/* Origin Input */}
        <AutocompleteDropdown
          value={originQuery}
          onChange={setOriginQuery}
          onSelect={handleOriginSelect}
          placeholder="출발지를 입력하세요"
          label="출발지"
          data-testid="route-origin"
          error={error && !selectedOrigin ? '출발지를 선택해주세요' : undefined}
        />
        
        {/* Destination Input */}
        <AutocompleteDropdown
          value={destinationQuery}
          onChange={setDestinationQuery}
          onSelect={handleDestinationSelect}
          placeholder="도착지를 입력하세요"
          label="도착지"
          data-testid="route-destination"
          error={error && !selectedDestination ? '도착지를 선택해주세요' : undefined}
        />
        
        {/* Mode Selector */}
        <fieldset role="group" aria-label="이동 수단" className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <legend className="text-sm font-semibold text-gray-900 mb-3 px-1">
            이동 수단
          </legend>
          <div className="flex gap-2">
            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
              mode === 'walking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}>
              <input
                type="radio"
                name="mode"
                value="walking"
                checked={mode === 'walking'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="sr-only"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">도보</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
              mode === 'transit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}>
              <input
                type="radio"
                name="mode"
                value="transit"
                checked={mode === 'transit'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="sr-only"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="font-medium">대중교통</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all ${
              mode === 'driving'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}>
              <input
                type="radio"
                name="mode"
                value="driving"
                checked={mode === 'driving'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="sr-only"
              />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-medium">자동차</span>
            </label>
          </div>
        </fieldset>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCalculateRoute}
            disabled={isCalculateDisabled}
            data-testid="calculate-route-button"
            className={`
              flex-1 px-4 py-3 rounded-lg font-semibold transition-all shadow-sm
              ${isCalculateDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow'
              }
            `}
          >
            {isCalculating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                계산 중...
              </span>
            ) : '경로 계산'}
          </button>
          {routes.length > 0 && (
            <>
              <ShareRouteButton
                route={routes[0]}
                origin={selectedOrigin!}
                destination={selectedDestination!}
                mode={mode}
                className="flex-shrink-0 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all shadow-sm"
              />
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm"
                title="경로 저장"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </button>
            </>
          )}
          {(routes.length > 0 || error) && (
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-lg font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              초기화
            </button>
          )}
        </div>
        
        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="경로 이름 (선택사항)"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={handleSaveRoute}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-sm"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setRouteName('');
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors shadow-sm"
              >
                취소
              </button>
            </div>
            <p className="text-sm text-gray-600">
              이름을 입력하지 않으면 자동으로 생성됩니다
            </p>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div role="alert" className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex-shrink-0 w-5 h-5 text-red-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-5">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">경로 결과</h3>
          </div>
          {routes.map((route, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              {route.summary && (
                <h4 className="font-semibold text-gray-900 mb-3">{route.summary}</h4>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">거리</div>
                    <div className="font-semibold text-gray-900">{formatDistance(route.distance)}</div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">시간</div>
                    <div className="font-semibold text-gray-900">{formatDuration(route.duration)}</div>
                  </div>
                </div>
                {route.fare !== undefined && (
                  <div className="col-span-2 flex gap-2 items-center">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">요금</div>
                      <div className="font-semibold text-gray-900">{formatCurrency(route.fare)}</div>
                    </div>
                  </div>
                )}
              </div>
              {route.steps && route.steps.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      상세 경로 보기
                    </summary>
                    <ol className="mt-3 space-y-2">
                      {route.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-gray-700 pl-6 flex gap-2">
                          <span className="font-semibold text-blue-600 flex-shrink-0">{stepIndex + 1}.</span>
                          <span>{step.instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Saved Routes List */}
      {showSavedRoutes && (
        <div className="mt-4">
          <SavedRoutesList
            onRouteLoad={handleLoadRoute}
            showHistory={true}
          />
        </div>
      )}
    </div>
  );
}