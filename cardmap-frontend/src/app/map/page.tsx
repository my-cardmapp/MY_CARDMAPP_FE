'use client'

import { useState } from 'react'
import { MapContainer, MapProvider } from '@/components/map'
import { sampleMerchants } from '@/data/sampleMerchants'
import type { Merchant } from '@/types/merchant'

export default function MapPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [activeCardTypes, setActiveCardTypes] = useState<string[]>([])

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
              <div className="flex gap-2">
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
            merchants={sampleMerchants}
            onMarkerClick={handleMarkerClick}
            activeCardTypes={activeCardTypes}
          />
          
          {/* 선택된 가맹점 정보 (임시) */}
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
        </main>
      </div>
    </MapProvider>
  )
}