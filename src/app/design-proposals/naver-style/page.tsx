'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function NaverStyleDesign() {
  const [activeTab, setActiveTab] = useState<'search' | 'explore' | 'route' | 'saved'>('search')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const cardTypes = [
    { id: 'child-meal', name: '아동급식카드', color: 'bg-red-500', count: 1234 },
    { id: 'culture', name: '문화누리카드', color: 'bg-teal-500', count: 856 },
    { id: 'local', name: '지역사랑상품권', color: 'bg-yellow-500', count: 2341 }
  ]

  const categories = [
    { icon: '🍴', name: '음식점', count: 892 },
    { icon: '☕', name: '카페', count: 234 },
    { icon: '🏪', name: '편의점', count: 456 },
    { icon: '🎭', name: '문화시설', count: 123 },
    { icon: '🏨', name: '숙박', count: 78 }
  ]

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header - Simplified */}
      <header className="bg-white border-b border-gray-200 relative z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Card-Map</h1>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="장소, 버스, 지하철, 도로 검색"
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <Link
            href="/design-proposals"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            ← 돌아가기
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Tabs */}
        <div
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarOpen ? 'w-96' : 'w-0'
          } flex overflow-hidden`}
        >
          {sidebarOpen && (
            <>
              {/* Tab Navigation */}
              <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col py-4">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex flex-col items-center gap-2 py-4 px-2 ${
                    activeTab === 'search' ? 'bg-white border-r-2 border-green-500 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs font-medium">검색</span>
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  className={`flex flex-col items-center gap-2 py-4 px-2 ${
                    activeTab === 'explore' ? 'bg-white border-r-2 border-green-500 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-xs font-medium">탐색</span>
                </button>

                <button
                  onClick={() => setActiveTab('route')}
                  className={`flex flex-col items-center gap-2 py-4 px-2 ${
                    activeTab === 'route' ? 'bg-white border-r-2 border-green-500 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-xs font-medium">경로</span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex flex-col items-center gap-2 py-4 px-2 ${
                    activeTab === 'saved' ? 'bg-white border-r-2 border-green-500 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-xs font-medium">저장</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search Tab */}
                {activeTab === 'search' && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900">검색 결과</h2>
                      <p className="text-sm text-gray-600 mt-1">전체 4,431개</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-semibold text-gray-900">가맹점 이름 {i + 1}</h3>
                          <p className="text-sm text-gray-600 mt-1">서울시 강남구 테헤란로 123</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">아동급식</span>
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">문화누리</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explore Tab */}
                {activeTab === 'explore' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900">주변 탐색</h2>
                      <p className="text-sm text-gray-600 mt-1">카드 타입과 카테고리로 필터링</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {/* Card Type Filters */}
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">복지카드 선택</h3>
                        <div className="space-y-2">
                          {cardTypes.map((card) => (
                            <button
                              key={card.id}
                              onClick={() => {
                                setSelectedFilters(prev =>
                                  prev.includes(card.id) ? prev.filter(f => f !== card.id) : [...prev, card.id]
                                )
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                selectedFilters.includes(card.id)
                                  ? `${card.color} text-white border-transparent`
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="font-medium">{card.name}</span>
                              <span className="text-sm opacity-90">{card.count.toLocaleString()}개</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category Filters */}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">카테고리</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.name}
                              className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                            >
                              <span className="text-2xl">{cat.icon}</span>
                              <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                              <span className="text-xs text-gray-500">{cat.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Route Tab */}
                {activeTab === 'route' && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900">길찾기</h2>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">출발</label>
                        <input
                          type="text"
                          placeholder="출발지를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">도착</label>
                        <input
                          type="text"
                          placeholder="도착지를 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button className="w-full py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
                        경로 검색
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Tab */}
                {activeTab === 'saved' && (
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900">저장한 장소</h2>
                      <p className="text-sm text-gray-600 mt-1">즐겨찾기 및 최근 검색</p>
                    </div>
                    <div className="p-4 text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p>저장된 장소가 없습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Mock Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium">지도 영역</p>
              <p className="text-sm text-gray-500 mt-2">네이버 지도 스타일</p>
            </div>
          </div>

          {/* Map Controls - Naver Style */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <button className="px-3 py-2 hover:bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">일반지도</button>
              <button className="px-3 py-2 hover:bg-gray-50 border-b border-gray-200 text-sm text-gray-600">위성지도</button>
              <button className="px-3 py-2 hover:bg-gray-50 text-sm text-gray-600">지형지도</button>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <button className="p-3 border-b border-gray-200 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button className="p-3 hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Current Location Button */}
          <div className="absolute bottom-4 left-4">
            <button className="p-3 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
        시안 1: 네이버형 통합 워크스페이스
      </div>
    </div>
  )
}
