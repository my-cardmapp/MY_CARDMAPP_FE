import React from 'react'

export const MapSkeleton: React.FC = () => {
  return (
    <div
      data-testid="map-skeleton"
      className="w-full h-full bg-gray-200 animate-pulse relative"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    </div>
  )
}