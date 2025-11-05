'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GoogleStyleDesign() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<number | null>(null)

  const categories = [
    { icon: '🍴', name: '음식점', active: false },
    { icon: '☕', name: '카페', active: false },
    { icon: '🏪', name: '편의점', active: false },
    { icon: '🍱', name: '아동급식', active: true, highlight: true },
    { icon: '🎭', name: '문화누리', active: false, highlight: true },
    { icon: '💳', name: '지역사랑', active: false, highlight: true }
  ]

  const merchants = [
    { id: 1, name: '행복한 식당', address: '서울시 강남구 테헤란로 123', cards: ['아동급식'], rating: 4.5, distance: '350m' },
    { id: 2, name: '든든한 분식', address: '서울시 강남구 역삼동 456', cards: ['아동급식', '문화누리'], rating: 4.7, distance: '520m' },
    { id: 3, name: '맛있는 카페', address: '서울시 강남구 선릉역 789', cards: ['문화누리'], rating: 4.3, distance: '890m' }
  ]

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Floating Header */}
      <header className="relative z-30 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Menu Button */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar - Centered & Large */}
          <div className="flex-1 max-w-3xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="Google 지도 검색"
                className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:shadow-lg transition-shadow"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setShowResults(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Directions Button */}
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            경로
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/design-proposals"
              className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              ← 돌아가기
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                U
              </div>
            </button>
          </div>
        </div>

        {/* Category Bar */}
        <div className="px-4 py-2 border-t border-gray-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
                  cat.active
                    ? cat.highlight
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Sliding Results Panel */}
        {showResults && (
          <div className="absolute left-0 top-0 bottom-0 w-96 bg-white shadow-xl z-20 animate-slide-in">
            <div className="h-full flex flex-col">
              {/* Results Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">검색 결과</h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600">아동급식카드 가맹점 {merchants.length}곳</p>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto">
                {merchants.map((merchant, index) => (
                  <button
                    key={merchant.id}
                    onClick={() => setSelectedMerchant(merchant.id)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedMerchant === merchant.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 font-medium">{String.fromCharCode(65 + index)}</span>
                          <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {merchant.rating}
                          </span>
                          <span>·</span>
                          <span>{merchant.distance}</span>
                        </div>
                        <p className="text-sm text-gray-600">{merchant.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {merchant.cards.map((card) => (
                        <span
                          key={card}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          {card}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 relative">
          {/* Mock Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium">지도 영역</p>
              <p className="text-sm text-gray-500 mt-2">구글 맵 스타일</p>
            </div>
          </div>

          {/* Map Markers (Mock) */}
          <div className="absolute top-1/4 left-1/3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
            A
          </div>
          <div className="absolute top-1/3 left-1/2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
            B
          </div>
          <div className="absolute top-1/2 left-2/3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
            C
          </div>

          {/* Zoom Controls - Right Side */}
          <div className="absolute bottom-32 right-4 flex flex-col gap-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button className="p-3 hover:bg-gray-50 border-b border-gray-200">
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

          {/* Street View */}
          <div className="absolute bottom-24 right-4">
            <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Current Location */}
          <div className="absolute bottom-4 right-4">
            <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </button>
          </div>

          {/* Layer Toggle */}
          <div className="absolute bottom-4 left-4">
            <button className="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 font-medium text-sm text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M layers" />
              </svg>
              레이어
            </button>
          </div>

          {/* Google Logo */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-sm text-gray-500 font-medium">Google</span>
          </div>
        </div>

        {/* Bottom Detail Sheet (when merchant selected) */}
        {selectedMerchant && (
          <div className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-3xl z-30 animate-slide-up">
            <div className="p-6">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

              {merchants.filter(m => m.id === selectedMerchant).map((merchant) => (
                <div key={merchant.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{merchant.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {merchant.rating}
                        </span>
                        <span>·</span>
                        <span>{merchant.distance}</span>
                      </div>
                      <p className="text-gray-600">{merchant.address}</p>
                    </div>
                    <button
                      onClick={() => setSelectedMerchant(null)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-3 mb-6">
                    {merchant.cards.map((card) => (
                      <span
                        key={card}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-full font-medium"
                      >
                        {card}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm font-medium">길찾기</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">저장</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">공유</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50">
        시안 3: 구글형 검색 중심
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
