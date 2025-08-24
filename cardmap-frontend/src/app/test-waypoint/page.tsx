'use client';

import { useState, useEffect } from 'react';
import { WaypointList, Waypoint } from '@/components/route';

export default function TestWaypointPage() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Add event listener for E2E testing
  useEffect(() => {
    const handleTestAddWaypoint = (event: CustomEvent) => {
      const waypoint = event.detail as Waypoint;
      setWaypoints(prev => [...prev, waypoint]);
    };

    window.addEventListener('test-add-waypoint', handleTestAddWaypoint as EventListener);
    
    return () => {
      window.removeEventListener('test-add-waypoint', handleTestAddWaypoint as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          WaypointList Component Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <WaypointList
            waypoints={waypoints}
            onWaypointsChange={setWaypoints}
            maxWaypoints={5}
          />
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Current Waypoints (Debug):</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(waypoints, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}