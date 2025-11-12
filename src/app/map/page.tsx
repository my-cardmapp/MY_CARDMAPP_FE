'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapProvider, useMapContext } from '@/contexts/MapContext'
import MapContainer from '@/components/map/MapContainer'
import MerchantList from '@/components/merchant/MerchantList'
import { SearchBar } from '@/components/search/SearchBar'
import { RoutePlanner } from '@/components/route/RoutePlanner'
import { RouteLayer } from '@/components/map/RouteLayer'
import MerchantDetailPanel from '@/components/merchant/MerchantDetailPanel'
import { useSearchStore } from '@/stores/searchStore'
import { useMerchantStore } from '@/stores/merchantStore'
import type { Merchant } from '@/types/merchant'
import type { MapBounds } from '@/hooks/useMapBounds'
import type { Route, Location } from '@/types'

// 전체 카드 타입 정의
const ALL_CARD_TYPES = ['CHILD_MEAL', 'CULTURE_NURI', 'LOCAL_CURRENCY'] as const


function MapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get search state from store
  const searchQuery = useSearchStore(state => state.query)
  const searchMerchants = useSearchStore(state => state.merchants)

  // Get merchant store state
  const merchants = useMerchantStore(state => state.merchants)
  const isLoading = useMerchantStore(state => state.isLoading)
  const error = useMerchantStore(state => state.error)
  const hasMoreFromStore = useMerchantStore(state => state.hasMore)
  const fetchMerchants = useMerchantStore(state => state.fetchMerchants)
  const incrementPage = useMerchantStore(state => state.incrementPage)

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [activeCardTypes, setActiveCardTypes] = useState<string[]>([])
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showRoutePlanner, setShowRoutePlanner] = useState(false)

  // Route visualization state
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [routeOrigin, setRouteOrigin] = useState<Location | null>(null)
  const [routeDestination, setRouteDestination] = useState<Location | null>(null)
  const [routeWaypoints, setRouteWaypoints] = useState<Location[]>([])

  console.log('MapPage - activeCardTypes state:', activeCardTypes)

  // Fetch merchants on initial load
  useEffect(() => {
    fetchMerchants({ page: 0 })
  }, [fetchMerchants])

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
    if (isLoadingMore || !hasMoreFromStore) return

    setIsLoadingMore(true)
    try {
      incrementPage()
      await fetchMerchants()
    } catch (error) {
      console.error('Failed to load more merchants:', error)
    } finally {
      setIsLoadingMore(false)
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
  // Use search results if there's a search query, otherwise use merchants from store
  const baseMerchants = searchQuery ? searchMerchants : merchants

  const filteredMerchants = activeCardTypes.length === 0
    ? baseMerchants
    : baseMerchants.filter(merchant =>
        merchant.cards.some(card => activeCardTypes.includes(card.code))
      )

  return (
    <MapProvider>
      <div className="h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 z-10 relative">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* 로고 및 사이드바 토글 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Card-Map</h1>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2">
                {/* 경로 계획 버튼 */}
                <button
                  onClick={() => setShowRoutePlanner(!showRoutePlanner)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                    showRoutePlanner
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="hidden md:inline">경로 계획</span>
                </button>

                {/* 필터 버튼 */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">필터</span>
                    {activeCardTypes.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {activeCardTypes.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
                    <button
                      onClick={handleSelectAll}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="모두 선택"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="모두 해제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
                    <button
                      onClick={() => handleCardTypeFilter('CHILD_MEAL')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeCardTypes.includes('CHILD_MEAL')
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                      }`}
                    >
                      급식
                    </button>
                    <button
                      onClick={() => handleCardTypeFilter('CULTURE_NURI')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeCardTypes.includes('CULTURE_NURI')
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      문화
                    </button>
                    <button
                      onClick={() => handleCardTypeFilter('LOCAL_CURRENCY')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        activeCardTypes.includes('LOCAL_CURRENCY')
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                      }`}
                    >
                      상품권
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 flex relative overflow-hidden">
          {/* 사이드바 - 가맹점 목록 또는 경로 계획 */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden border-r border-gray-200 bg-white`}>
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

                    {/* 에러 메시지 */}
                    {error && (
                      <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                        <div className="flex items-center gap-2 text-red-800">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">데이터를 불러오는 중 오류가 발생했습니다</span>
                        </div>
                        <button
                          onClick={() => fetchMerchants({ page: 1 })}
                          className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                        >
                          다시 시도
                        </button>
                      </div>
                    )}

                    {/* 가맹점 목록 */}
                    <div className="flex-1 overflow-hidden">
                      <MerchantList
                        merchants={filteredMerchants}
                        onItemClick={handleMarkerClick}
                        onLoadMore={handleLoadMore}
                        isLoading={isLoading}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMoreFromStore}
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

            {/* Unified Merchant Detail Panel */}
            <MerchantDetailPanel
              merchant={selectedMerchant}
              onClose={() => setSelectedMerchant(null)}
            />
          </div>
        </main>
      </div>
    </MapProvider>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  )
}