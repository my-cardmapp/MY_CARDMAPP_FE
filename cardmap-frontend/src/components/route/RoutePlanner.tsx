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
      className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm"
    >
      <div className="flex-1 space-y-4">
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
        <fieldset role="group" aria-label="이동 수단">
          <legend className="text-sm font-medium text-gray-700 mb-2">
            이동 수단
          </legend>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="walking"
                checked={mode === 'walking'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="mr-2"
              />
              <span>도보</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="transit"
                checked={mode === 'transit'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="mr-2"
              />
              <span>대중교통</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="driving"
                checked={mode === 'driving'}
                onChange={(e) => setMode(e.target.value as RouteMode)}
                className="mr-2"
              />
              <span>자동차</span>
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
              flex-1 px-4 py-2 rounded-lg font-medium transition-colors
              ${isCalculateDisabled 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isCalculating ? '계산 중...' : '경로 계산'}
          </button>
          {routes.length > 0 && (
            <>
              <ShareRouteButton
                route={routes[0]}
                origin={selectedOrigin!}
                destination={selectedDestination!}
                mode={mode}
                className="flex-shrink-0"
              />
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                title="경로 저장"
              >
                💾 저장
              </button>
            </>
          )}
          {(routes.length > 0 || error) && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSaveRoute}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setRouteName('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
      
      {/* Results Display */}
      {routes.length > 0 && (
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">경로 결과</h3>
          {routes.map((route, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              {route.summary && (
                <h4 className="font-medium text-gray-900 mb-2">{route.summary}</h4>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">거리: </span>
                  <span className="font-medium">{formatDistance(route.distance)}</span>
                </div>
                <div>
                  <span className="text-gray-600">시간: </span>
                  <span className="font-medium">{formatDuration(route.duration)}</span>
                </div>
                {route.fare !== undefined && (
                  <div className="col-span-2">
                    <span className="text-gray-600">요금: </span>
                    <span className="font-medium">{formatCurrency(route.fare)}</span>
                  </div>
                )}
              </div>
              {route.steps && route.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-600 hover:text-gray-800">
                      상세 경로 보기
                    </summary>
                    <ol className="mt-2 space-y-1">
                      {route.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm text-gray-700 pl-4">
                          {stepIndex + 1}. {step.instruction}
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