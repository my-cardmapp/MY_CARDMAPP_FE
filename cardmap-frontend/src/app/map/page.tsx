'use client'

import { useState, useCallback } from 'react'
import { MapProvider } from '@/contexts/MapContext'
import MapContainer from '@/components/map/MapContainer'
import { sampleMerchants as MOCK_MERCHANTS } from '@/data/sampleMerchants'
import type { Merchant } from '@/types/merchant'
import type { MapBounds } from '@/hooks/useMapBounds'

// 전체 카드 타입 정의
const ALL_CARD_TYPES = ['CHILD_MEAL', 'CULTURE_NURI', 'LOCAL_CURRENCY'] as const

export default function MapPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [activeCardTypes, setActiveCardTypes] = useState<string[]>([])
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)

  const handleMarkerClick = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
  }

  const handleCardTypeFilter = (cardType: string) => {
    setActiveCardTypes(prev => {
      if (prev.includes(cardType)) {
        return prev.filter(type => type !== cardType)
      } else {
        return [...prev, cardType]
      }
    })
  }

  const handleSelectAll = () => {
    setActiveCardTypes([...ALL_CARD_TYPES])
  }

  const handleDeselectAll = () => {
    setActiveCardTypes([])
  }

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    console.log('Map bounds changed:', bounds)
    setCurrentBounds(bounds)
    // Here you would typically fetch merchants for the new bounds
    // For now, we're using mock data
  }, [])

  const handleMapReady = useCallback((map: naver.maps.Map) => {
    console.log('Map is ready:', map)
  }, [])

  return (
    <MapProvider>
      <div className="h-screen flex flex-col">
        <header className="bg-white shadow-sm z-10 relative">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Card-Map</h1>
                <p className="text-sm text-gray-600">복지카드 가맹점 지도</p>
              </div>
              
              {/* 카드 타입 필터 */}
              <div className="flex gap-2 items-center">
                {/* 전체 선택/해제 버튼 */}
                <div className="flex gap-1 mr-2 pr-2 border-r border-gray-300">
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title="모두 선택"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-1 rounded text-sm bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                    title="모두 해제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* 개별 카드 필터 버튼 */}
                <button
                  onClick={() => handleCardTypeFilter('CHILD_MEAL')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeCardTypes.includes('CHILD_MEAL')
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  아동급식카드
                </button>
                <button
                  onClick={() => handleCardTypeFilter('CULTURE_NURI')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeCardTypes.includes('CULTURE_NURI')
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  문화누리카드
                </button>
                <button
                  onClick={() => handleCardTypeFilter('LOCAL_CURRENCY')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeCardTypes.includes('LOCAL_CURRENCY')
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  지역사랑상품권
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 relative">
          <MapContainer 
            merchants={MOCK_MERCHANTS}
            activeCardTypes={activeCardTypes}
            onMarkerClick={handleMarkerClick}
            onMapReady={handleMapReady}
          />
          
          {/* 선택된 가맹점 정보 */}
          {selectedMerchant && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white rounded-lg shadow-lg p-4 max-w-md animate-in slide-in-from-bottom duration-200">
              <button
                onClick={() => setSelectedMerchant(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h3 className="font-bold text-lg pr-8">{selectedMerchant.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{selectedMerchant.address}</p>
              
              <div className="flex gap-2 mt-3">
                {selectedMerchant.cards.map(card => (
                  <span 
                    key={card.code}
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{ 
                      backgroundColor: card.colorHex + '20',
                      color: card.colorHex 
                    }}
                  >
                    {card.name}
                  </span>
                ))}
              </div>
              
              {selectedMerchant.phone && (
                <p className="text-sm text-gray-600 mt-3">
                  📞 {selectedMerchant.phone}
                </p>
              )}
            </div>
          )}

          {/* Bounds info (debug) */}
          {currentBounds && (
            <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow text-xs max-w-xs">
              <div className="font-semibold mb-1">Viewport Bounds</div>
              <div>North: {currentBounds.north.toFixed(6)}</div>
              <div>South: {currentBounds.south.toFixed(6)}</div>
              <div>East: {currentBounds.east.toFixed(6)}</div>
              <div>West: {currentBounds.west.toFixed(6)}</div>
            </div>
          )}
        </main>
      </div>
    </MapProvider>
  )
}