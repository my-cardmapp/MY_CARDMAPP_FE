'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Route, RouteStep } from '@/types/route';

interface DirectionsListProps {
  route: Route | null;
  initialCollapsed?: boolean;
  onStepClick?: (step: RouteStep, index: number) => void;
  onClose?: () => void;
  isLoading?: boolean;
  error?: string | null;
  currentStepIndex?: number;
}

export function DirectionsList({
  route,
  initialCollapsed = false,
  onStepClick,
  onClose,
  isLoading = false,
  error = null,
  currentStepIndex
}: DirectionsListProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLLIElement>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mq = window.matchMedia('(max-width: 640px)');
      setIsMobile(mq.matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentStepIndex !== undefined && currentStepRef.current) {
      currentStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentStepIndex]);

  // Update collapsed state when prop changes
  useEffect(() => {
    setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  // Format distance
  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }, []);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds === 0) {
      return '';
    }
    if (seconds < 60) {
      return '1분'; // Always return 1분 for less than 60 seconds
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }
    return `${minutes}분`;
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }, []);

  // Get icon for instruction type
  const getDirectionIcon = useCallback((instruction: string, hasTransit?: boolean): string => {
    if (hasTransit) {
      return 'subway';
    }
    
    if (instruction.includes('도보') || instruction.includes('걷')) {
      return 'walk';
    }
    if (instruction.includes('우회전') || instruction.includes('오른쪽')) {
      return 'turn-right';
    }
    if (instruction.includes('좌회전') || instruction.includes('왼쪽')) {
      return 'turn-left';
    }
    if (instruction.includes('직진') || instruction.includes('북쪽') || instruction.includes('남쪽') || instruction.includes('동쪽') || instruction.includes('서쪽')) {
      return 'straight';
    }
    if (instruction.includes('환승')) {
      return 'transfer';
    }
    if (instruction.includes('도착') || instruction.includes('목적지')) {
      return 'arrival';
    }
    
    return 'straight';
  }, []);

  // Toggle collapse state
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Handle step click
  const handleStepClick = useCallback((step: RouteStep, index: number) => {
    if (onStepClick) {
      onStepClick(step, index);
    }
  }, [onStepClick]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center py-8">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">경로 계산 중...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-red-600 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (!route) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-gray-500 text-center py-8">
          경로를 계산하려면 출발지와 도착지를 선택하세요
        </div>
      </div>
    );
  }

  // No steps state
  if (!route.steps || route.steps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="text-gray-500 text-center py-8">
          경로 정보가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div 
      data-testid="directions-container"
      className={`bg-white rounded-lg shadow-lg ${isMobile ? 'mobile' : ''}`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleToggleCollapse}
            className="flex items-center justify-between flex-1"
            aria-label="경로 안내 토글"
          >
            <h3 className="text-lg font-semibold">경로 안내</h3>
            <svg
              data-testid="chevron-icon"
              className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <ul 
        role="list"
        aria-label="경로 안내 목록"
        className={`${isCollapsed ? 'collapsed hidden' : ''}`}
      >
        {/* Summary */}
        <li className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">{route.summary}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span>{formatDistance(route.distance)}</span>
                <span className="mx-2">•</span>
                <span>{formatDuration(route.duration)}</span>
                {route.fare && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{formatCurrency(route.fare)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </li>

        {/* Steps */}
        <div
          ref={scrollContainerRef}
          data-testid="directions-scroll-container"
          className="overflow-y-auto max-h-96"
        >
          {route.steps.map((step, index) => {
            const icon = getDirectionIcon(step.instruction, !!step.transitDetails);
            const isCurrentStep = currentStepIndex === index;
            
            return (
              <li
                key={index}
                ref={isCurrentStep ? currentStepRef : null}
                className={`
                  p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                  ${step.transitDetails ? 'transit-step bg-blue-50' : ''}
                  ${isCurrentStep ? 'current-step bg-yellow-50 border-l-4 border-yellow-400' : ''}
                `}
                onClick={() => handleStepClick(step, index)}
                aria-label={`${index + 1}단계: ${step.instruction}`}
              >
                <div className="flex items-start">
                  {/* Step number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 ml-3 mt-1">
                    <DirectionIcon type={icon} />
                  </div>
                  
                  {/* Content */}
                  <div className="ml-3 flex-1">
                    <div className="font-medium">{step.instruction}</div>
                    
                    {/* Transit details */}
                    {step.transitDetails && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <div className="text-sm">
                          <div className="font-semibold text-blue-600">
                            {step.transitDetails.line}
                          </div>
                          <div className="text-gray-600">
                            {step.transitDetails.departure} → {step.transitDetails.arrival}
                          </div>
                          <div className="text-gray-500">
                            {step.transitDetails.numStops} 정거장
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Distance and duration */}
                    {(step.distance > 0 || step.duration > 0) && (
                      <div className="text-sm text-gray-600 mt-1">
                        {step.distance > 0 && <span>{formatDistance(step.distance)}</span>}
                        {step.distance > 0 && step.duration > 0 && <span className="mx-1">•</span>}
                        {step.duration > 0 && <span>{formatDuration(step.duration)}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </div>
      </ul>
    </div>
  );
}

// Direction icon component
function DirectionIcon({ type }: { type: string }) {
  const iconProps = {
    className: "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    'data-testid': `icon-${type}`
  };

  switch (type) {
    case 'walk':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    
    case 'turn-right':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      );
    
    case 'turn-left':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      );
    
    case 'straight':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7l4-4m0 0l4 4m-4-4v18" />
        </svg>
      );
    
    case 'subway':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    
    case 'transfer':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    
    case 'arrival':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    
    default:
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      );
  }
}