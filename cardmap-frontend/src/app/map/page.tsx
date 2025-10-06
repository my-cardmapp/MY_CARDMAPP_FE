'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapProvider } from '@/contexts/MapContext'
import MapContainer from '@/components/map/MapContainer'
import MerchantList from '@/components/merchant/MerchantList'
import { SearchBar } from '@/components/search/SearchBar'
import { RoutePlanner } from '@/components/route/RoutePlanner'
import { RouteLayer } from '@/components/map/RouteLayer'
import { sampleMerchants as MOCK_MERCHANTS } from '@/data/sampleMerchants'
import type { Merchant } from '@/types/merchant'
import type { MapBounds } from '@/hooks/useMapBounds'
import type { Route, Location } from '@/types'

// 전체 카드 타입 정의
const ALL_CARD_TYPES = ['CHILD_MEAL', 'CULTURE_NURI', 'LOCAL_CURRENCY'] as const

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [activeCardTypes, setActiveCardTypes] = useState<string[]>([])
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showRoutePlanner, setShowRoutePlanner] = useState(false)
  
  // Route visualization state
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [routeOrigin, setRouteOrigin] = useState<Location | null>(null)
  const [routeDestination, setRouteDestination] = useState<Location | null>(null)
  const [routeWaypoints, setRouteWaypoints] = useState<Location[]>([])

  console.log('MapPage - activeCardTypes state:', activeCardTypes)

  // Initialize filters from URL on page load
  useEffect(() => {
    const cardTypesParam = searchParams.get('cardTypes')
    if (cardTypesParam) {
      const cardTypesFromUrl = cardTypesParam.split(',').filter(type => 
        ALL_CARD_TYPES.includes(type as any)
      )
      if (cardTypesFromUrl.length > 0) {
        console.log('Restoring card types from URL:', cardTypesFromUrl)
        setActiveCardTypes(cardTypesFromUrl)
      }
    }
  }, [searchParams])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (activeCardTypes.length > 0) {
      params.set('cardTypes', activeCardTypes.join(','))
    } else {
      params.delete('cardTypes')
    }
    
    const newUrl = `/map${params.toString() ? `?${params.toString()}` : ''}`
    
    // Only update URL if it's different from current
    if (newUrl !== window.location.pathname + window.location.search) {
      console.log('Updating URL with filters:', newUrl)
      router.replace(newUrl)
    }
  }, [activeCardTypes, router, searchParams])

  const handleMarkerClick = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    // 실제로는 API 호출로 추가 데이터 로드
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoadingMore(false)
    
    // 데모용: 500개 이상이면 더 이상 로드하지 않음
    if (MOCK_MERCHANTS.length >= 500) {
      setHasMore(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    // Trigger map refresh after sidebar animation completes
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 350) // After CSS transition (300ms)
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
  
  // Handle route calculation from RoutePlanner
  const handleRouteCalculated = useCallback((
    route: Route,
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ) => {
    console.log('Route calculated:', route)
    setCurrentRoute(route)
    setRouteOrigin(origin)
    setRouteDestination(destination)
    setRouteWaypoints(waypoints || [])
  }, [])
  
  // Handle route clear
  const handleRouteClear = useCallback(() => {
    console.log('Route cleared')
    setCurrentRoute(null)
    setRouteOrigin(null)
    setRouteDestination(null)
    setRouteWaypoints([])
  }, [])

  // 필터링된 가맹점 목록
  const filteredMerchants = activeCardTypes.length === 0 
    ? MOCK_MERCHANTS 
    : MOCK_MERCHANTS.filter(merchant =>
        merchant.cards.some(card => activeCardTypes.includes(card.code))
      )

  return (
    <MapProvider>
      <div className="h-screen flex flex-col">
        <header className="bg-white shadow-sm z-10 relative">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Card-Map</h1>
                  <p className="text-sm text-gray-600">복지카드 가맹점 지도</p>
                </div>
                {/* 사이드바 토글 버튼 */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sidebarOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* 카드 타입 필터 및 경로 계획 버튼 */}
              <div className="flex gap-2 items-center">
                {/* 경로 계획 버튼 */}
                <button
                  onClick={() => setShowRoutePlanner(!showRoutePlanner)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    showRoutePlanner 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  경로 계획
                </button>
                
                {/* 활성 필터 수 뱃지 */}
                <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-300">
                  <span 
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium"
                    data-testid="active-filter-count"
                  >
                    {activeCardTypes.length}
                  </span>
                  {activeCardTypes.length > 0 && (
                    <span 
                      className="text-sm text-gray-600"
                      data-testid="filter-summary"
                    >
                      {activeCardTypes.map(type => {
                        switch (type) {
                          case 'CHILD_MEAL': return '아동급식카드'
                          case 'CULTURE_NURI': return '문화누리카드'
                          case 'LOCAL_CURRENCY': return '지역사랑상품권'
                          default: return type
                        }
                      }).join(', ')} 적용됨
                    </span>
                  )}
                </div>
                
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
        
        <main className="flex-1 flex relative overflow-hidden">
          {/* 사이드바 - 가맹점 목록 또는 경로 계획 */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'w-96' : 'w-0'} overflow-hidden border-r border-gray-200 bg-white`}>
            {sidebarOpen && (
              <div className="h-full flex flex-col">
                {showRoutePlanner ? (
                  /* 경로 계획 패널 */
                  <div className="h-full overflow-auto">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">경로 계획</h3>
                    </div>
                    <div className="p-4">
                      <RoutePlanner 
                        onRouteCalculated={handleRouteCalculated}
                        onRouteClear={handleRouteClear}
                      />
                    </div>
                  </div>
                ) : (
                  /* 가맹점 목록 */
                  <>
                    {/* Search Bar */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <SearchBar 
                        placeholder="가맹점 검색..."
                        className="mb-3"
                      />
                    </div>
                    
                    {/* 목록 헤더 */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        검색 결과: {filteredMerchants.length}개
                      </h3>
                      {activeCardTypes.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          필터 적용됨
                        </p>
                      )}
                    </div>
                    
                    {/* 가맹점 목록 */}
                    <div className="flex-1 overflow-hidden">
                      <MerchantList
                        merchants={filteredMerchants}
                        onItemClick={handleMarkerClick}
                        onLoadMore={handleLoadMore}
                        isLoading={false}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        selectedMerchantId={selectedMerchant?.id}
                        filterKey={activeCardTypes.join(',')}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 지도 영역 */}
          <div className="flex-1 relative">
            <MapContainer 
              merchants={filteredMerchants}
              activeCardTypes={activeCardTypes}
              onMarkerClick={handleMarkerClick}
              onMapReady={handleMapReady}
            />
            
            {/* Route visualization layer */}
            <RouteLayer
              route={currentRoute}
              origin={routeOrigin}
              destination={routeDestination}
              waypoints={routeWaypoints}
              routeStyle={{
                strokeColor: '#FF0000',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              }}
            />
          
          {/* 선택된 가맹점 정보 */}
          {selectedMerchant && (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 animate-in slide-in-from-bottom duration-200">
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
          </div>
        </main>
      </div>
    </MapProvider>
  )
}