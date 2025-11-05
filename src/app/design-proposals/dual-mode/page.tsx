'use client'

import Link from 'next/link'
import { useState } from 'react'

type Mode = 'explore' | 'route'

export default function DualModeDesign() {
  const [mode, setMode] = useState<Mode>('explore')

  const merchants = [
    { id: 1, name: '행복한 식당', address: '서울시 강남구 테헤란로 123', cards: ['아동급식'], distance: '350m', category: '🍴' },
    { id: 2, name: '든든한 분식', address: '서울시 강남구 역삼동 456', cards: ['아동급식', '문화누리'], distance: '520m', category: '🍴' },
    { id: 3, name: '맛있는 카페', address: '서울시 강남구 선릉역 789', cards: ['문화누리'], distance: '890m', category: '☕' },
    { id: 4, name: '문화센터', address: '서울시 강남구 강남대로 234', cards: ['문화누리'], distance: '1.2km', category: '🎭' },
    { id: 5, name: '편의점 24', address: '서울시 강남구 테헤란로 567', cards: ['아동급식', '지역사랑'], distance: '1.5km', category: '🏪' }
  ]

  const routes = [
    { id: 1, name: '경로 1 - 최단거리', distance: '1.2km', duration: '15분', type: '도보' },
    { id: 2, name: '경로 2 - 추천', distance: '1.5km', duration: '18분', type: '도보' },
    { id: 3, name: '경로 3 - 대중교통', distance: '2.1km', duration: '12분', type: '버스', fare: '1,400원' }
  ]

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header with Mode Toggle */}
      <header className="bg-gradient-to-r from-pink-500 to-red-500 text-white relative z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Card-Map</h1>
            <Link
              href="/design-proposals"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              ← 돌아가기
            </Link>
          </div>

          {/* Mode Switcher */}
          <div className="flex gap-4">
            <button
              onClick={() => setMode('explore')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === 'explore'
                  ? 'bg-white text-pink-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>탐색 모드</span>
              </div>
            </button>
            <button
              onClick={() => setMode('route')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                mode === 'route'
                  ? 'bg-white text-pink-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>경로 모드</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split View 50:50 */}
      <div className="flex-1 flex overflow-hidden">
        {mode === 'explore' ? (
          /* Explore Mode Layout */
          <>
            {/* Left Panel - Merchant List */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col bg-white">
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="가맹점 검색..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Card Filters */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium shadow-md">
                    🍱 아동급식
                  </button>
                  <button className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium shadow-md">
                    🎭 문화누리
                  </button>
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium shadow-md">
                    💳 지역사랑
                  </button>
                </div>
              </div>

              {/* List Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">가맹점 {merchants.length}곳</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                      거리순
                    </button>
                    <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                      평점순
                    </button>
                  </div>
                </div>
              </div>

              {/* Merchant List */}
              <div className="flex-1 overflow-y-auto">
                {merchants.map((merchant, index) => (
                  <div
                    key={merchant.id}
                    className="p-4 border-b border-gray-100 hover:bg-pink-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex gap-4">
                      {/* Index Number */}
                      <div className="flex-shrink-0 w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold group-hover:bg-pink-600">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{merchant.name}</h3>
                            <p className="text-sm text-gray-600">{merchant.address}</p>
                          </div>
                          <div className="ml-3 text-right">
                            <div className="text-2xl mb-1">{merchant.category}</div>
                            <div className="text-sm font-medium text-pink-600">{merchant.distance}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-3">
                          {merchant.cards.map((card) => (
                            <span
                              key={card}
                              className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium"
                            >
                              {card}
                            </span>
                          ))}
                        </div>

                        <button className="w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors">
                          지도에서 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600 font-medium">지도 + 마커</p>
                  <p className="text-sm text-gray-500 mt-2">탐색 모드</p>
                </div>
              </div>

              {/* Map Markers */}
              {merchants.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className="absolute bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg cursor-pointer hover:bg-pink-600"
                  style={{
                    top: `${30 + index * 15}%`,
                    left: `${40 + index * 10}%`
                  }}
                >
                  {index + 1}
                </div>
              ))}

              {/* Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="bg-white rounded-lg shadow-md">
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
            </div>
          </>
        ) : (
          /* Route Mode Layout */
          <>
            {/* Left Panel - Route Planning */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col bg-white">
              {/* Route Input */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">출발</label>
                  <input
                    type="text"
                    placeholder="출발지를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">도착</label>
                  <input
                    type="text"
                    placeholder="도착지를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Transport Mode */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium">
                    🚶 도보
                  </button>
                  <button className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    🚌 대중교통
                  </button>
                  <button className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    🚗 자동차
                  </button>
                </div>

                <button className="w-full py-3 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 transition-colors shadow-md">
                  경로 검색
                </button>
              </div>

              {/* Route Results Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">추천 경로 {routes.length}개</h2>
              </div>

              {/* Route List */}
              <div className="flex-1 overflow-y-auto">
                {routes.map((route, index) => (
                  <div
                    key={route.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      index === 0 ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Route Number */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Route Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{route.name}</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">거리: </span>
                            <span className="font-medium text-gray-900">{route.distance}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">시간: </span>
                            <span className="font-medium text-gray-900">{route.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">수단: </span>
                            <span className="font-medium text-gray-900">{route.type}</span>
                          </div>
                          {route.fare && (
                            <div>
                              <span className="text-gray-600">요금: </span>
                              <span className="font-medium text-gray-900">{route.fare}</span>
                            </div>
                          )}
                        </div>

                        {index === 0 && (
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600">
                              이 경로 선택
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                              공유
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Map with Route */}
            <div className="w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="text-gray-600 font-medium">지도 + 경로선</p>
                  <p className="text-sm text-gray-500 mt-2">경로 모드</p>
                </div>
              </div>

              {/* Route Line Visualization (Mock) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 100 100 Q 300 200 500 150 T 700 300"
                  stroke="#ec4899"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="10,5"
                />
              </svg>

              {/* Start & End Markers */}
              <div className="absolute top-[15%] left-[15%] bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg">
                A
              </div>
              <div className="absolute bottom-[25%] right-[20%] bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg">
                B
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="bg-white rounded-lg shadow-md">
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
            </div>
          </>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50">
        시안 5: 듀얼 모드 스플릿뷰 ({mode === 'explore' ? '탐색' : '경로'} 모드)
      </div>
    </div>
  )
}
