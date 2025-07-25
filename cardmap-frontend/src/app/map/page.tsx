'use client'

import { MapContainer, MapProvider } from '@/components/map'

export default function MapPage() {
  return (
    <MapProvider>
      <div className="h-screen flex flex-col">
        <header className="bg-white shadow-sm z-10 relative">
          <div className="px-4 py-3">
            <h1 className="text-2xl font-bold text-gray-900">Card-Map</h1>
            <p className="text-sm text-gray-600">복지카드 가맹점 지도</p>
          </div>
        </header>
        <main className="flex-1 relative">
          <MapContainer />
        </main>
      </div>
    </MapProvider>
  )
}