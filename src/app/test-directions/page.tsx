'use client';

import { useState } from 'react';
import { DirectionsList } from '@/components/route/DirectionsList';
import type { Route, RouteStep } from '@/types/route';

export default function TestDirectionsPage() {
  const [selectedRoute, setSelectedRoute] = useState<'walking' | 'transit' | null>('walking');
  const [currentStep, setCurrentStep] = useState<number | undefined>(undefined);

  const walkingRoute: Route = {
    summary: '도보 15분',
    distance: 1200,
    duration: 900,
    polyline: 'encoded_polyline_string',
    steps: [
      {
        instruction: '북쪽으로 100m 이동',
        distance: 100,
        duration: 60,
        startLocation: { lat: 37.5665, lng: 126.9780 },
        endLocation: { lat: 37.5675, lng: 126.9780 }
      },
      {
        instruction: '우회전 후 200m 이동',
        distance: 200,
        duration: 120,
        startLocation: { lat: 37.5675, lng: 126.9780 },
        endLocation: { lat: 37.5675, lng: 126.9800 }
      },
      {
        instruction: '좌회전 후 150m 이동',
        distance: 150,
        duration: 90,
        startLocation: { lat: 37.5675, lng: 126.9800 },
        endLocation: { lat: 37.5690, lng: 126.9800 }
      },
      {
        instruction: '목적지 도착',
        distance: 0,
        duration: 0,
        startLocation: { lat: 37.5690, lng: 126.9800 },
        endLocation: { lat: 37.5690, lng: 126.9800 }
      }
    ]
  };

  const transitRoute: Route = {
    summary: '대중교통 25분',
    distance: 3500,
    duration: 1500,
    fare: 1250,
    polyline: 'encoded_polyline_string',
    steps: [
      {
        instruction: '서울역까지 도보 5분',
        distance: 400,
        duration: 300,
        startLocation: { lat: 37.5540, lng: 126.9706 },
        endLocation: { lat: 37.5550, lng: 126.9720 }
      },
      {
        instruction: '4호선 승차 - 명동 방면',
        distance: 2000,
        duration: 600,
        startLocation: { lat: 37.5550, lng: 126.9720 },
        endLocation: { lat: 37.5600, lng: 126.9850 },
        transitDetails: {
          line: '4호선',
          departure: '서울역',
          arrival: '명동',
          numStops: 2
        }
      },
      {
        instruction: '2호선으로 환승',
        distance: 100,
        duration: 180,
        startLocation: { lat: 37.5600, lng: 126.9850 },
        endLocation: { lat: 37.5600, lng: 126.9855 }
      },
      {
        instruction: '2호선 승차 - 을지로3가 방면',
        distance: 800,
        duration: 240,
        startLocation: { lat: 37.5600, lng: 126.9855 },
        endLocation: { lat: 37.5660, lng: 126.9920 },
        transitDetails: {
          line: '2호선',
          departure: '을지로4가',
          arrival: '을지로3가',
          numStops: 1
        }
      },
      {
        instruction: '목적지까지 도보 3분',
        distance: 200,
        duration: 180,
        startLocation: { lat: 37.5660, lng: 126.9920 },
        endLocation: { lat: 37.5665, lng: 126.9940 }
      }
    ]
  };

  const handleStepClick = (step: RouteStep, index: number) => {
    console.log('Step clicked:', step, index);
    setCurrentStep(index);
  };

  const handleClose = () => {
    console.log('DirectionsList closed');
    setSelectedRoute(null);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">DirectionsList Component Test</h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={() => {
            setSelectedRoute('walking');
            setCurrentStep(undefined);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Walking Route
        </button>
        <button
          onClick={() => {
            setSelectedRoute('transit');
            setCurrentStep(undefined);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show Transit Route
        </button>
        <button
          onClick={() => {
            setSelectedRoute(null);
            setCurrentStep(undefined);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Route
        </button>
        {selectedRoute && (
          <button
            onClick={() => setCurrentStep(currentStep === undefined ? 0 : (currentStep + 1) % (selectedRoute === 'walking' ? walkingRoute.steps.length : transitRoute.steps.length))}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Next Step
          </button>
        )}
      </div>

      <div className="max-w-md">
        <DirectionsList
          route={
            selectedRoute === 'walking' ? walkingRoute :
            selectedRoute === 'transit' ? transitRoute :
            null
          }
          onStepClick={handleStepClick}
          onClose={handleClose}
          currentStepIndex={currentStep}
        />
      </div>

      {currentStep !== undefined && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <h3 className="font-semibold">Current Step: {currentStep + 1}</h3>
        </div>
      )}
    </div>
  );
}