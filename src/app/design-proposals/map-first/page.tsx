'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MapFirstDesign() {
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const filters = [
    { id: 'child-meal', name: '아동급식', icon: '🍱', color: 'bg-red-500' },
    { id: 'culture', name: '문화누리', icon: '🎭', color: 'bg-teal-500' },
    { id: 'local', name: '지역사랑', icon: '💳', color: 'bg-yellow-500' }
  ]

  return (
    <div className="h-screen relative bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🗺️</div>
          <p className="text-2xl font-bold text-slate-700 mb-2">전체 화면 지도</p>
          <p className="text-slate-500">필요한 정보만 플로팅 패널로 표시</p>
        </div>
      </div>

      {/* Floating Search Bar - Top */}
      <div className="absolute top-6 left-6 right-6 z-30">
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl transition-all duration-300 ${
          showSearch ? 'ring-4 ring-blue-500/50' : ''
        }`}>
          <div className="flex items-center gap-3 px-6 py-4">
            <svg className="w-6 h-6 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="가맹점, 주소, 카테고리 검색..."
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="flex-1 text-lg outline-none bg-transparent placeholder-slate-400"
            />
            <Link
              href="/design-proposals"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm whitespace-nowrap"
            >
              ← 돌아가기
            </Link>
          </div>

          {/* Search Autocomplete */}
          {showSearch && (
            <div className="border-t border-slate-200 p-2">
              {[...Array(4)].map((_, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xl">
                    🍴
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">검색 결과 {i + 1}</div>
                    <div className="text-sm text-slate-600">서울시 강남구 · {(i + 1) * 200}m</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Filter Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl hover:bg-white transition-all ${
            showFilters ? 'ring-4 ring-purple-500/50' : ''
          }`}
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Floating Filter Panel */}
      {showFilters && (
        <div className="absolute top-24 right-6 z-20 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900">복지카드 필터</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilters(prev =>
                    prev.includes(filter.id)
                      ? prev.filter(f => f !== filter.id)
                      : [...prev, filter.id]
                  )
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                  activeFilters.includes(filter.id)
                    ? `${filter.color} text-white shadow-lg transform scale-105`
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{filter.icon}</span>
                <span className="flex-1 font-medium text-left">{filter.name}</span>
                {activeFilters.includes(filter.id) && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="w-full mt-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              전체 해제
            </button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="absolute top-24 left-6 z-20 flex gap-2">
          {activeFilters.map((filterId) => {
            const filter = filters.find(f => f.id === filterId)
            return (
              <div
                key={filterId}
                className={`${filter?.color} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-lg`}
              >
                <span>{filter?.icon}</span>
                <span className="font-medium">{filter?.name}</span>
                <button
                  onClick={() => setActiveFilters(prev => prev.filter(f => f !== filterId))}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating Quick Actions - Left */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button
          className="group p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          title="내 위치"
        >
          <svg className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </button>
        <button
          className="group p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          title="경로 찾기"
        >
          <svg className="w-6 h-6 text-slate-700 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
        <button
          className="group p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          title="저장"
        >
          <svg className="w-6 h-6 text-slate-700 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Floating Map Controls - Right */}
      <div className="absolute right-6 bottom-32 z-20 flex flex-col gap-3">
        <button className="p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="p-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-110">
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Floating Details Card - Bottom */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        {!showDetails ? (
          /* Minimized Bar */
          <button
            onClick={() => setShowDetails(true)}
            className="w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 hover:shadow-3xl transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                🍱
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">가맹점 123개</div>
                <div className="text-sm text-slate-600">주변 가맹점을 확인하세요</div>
              </div>
            </div>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        ) : (
          /* Expanded Details */
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-h-96 overflow-hidden flex flex-col animate-slide-up">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">주변 가맹점</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      🍱
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">가맹점 이름 {i + 1}</h4>
                      <p className="text-sm text-slate-600 mb-2">서울시 강남구 테헤란로 123</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          아동급식
                        </span>
                        <span className="text-sm text-slate-500">{(i + 1) * 150}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mini Stats */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-3">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
          <div className="text-xs text-slate-600">현재 위치</div>
          <div className="font-bold text-slate-900">강남구</div>
        </div>
        {activeFilters.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
            <div className="text-xs text-slate-600">필터 적용</div>
            <div className="font-bold text-slate-900">{activeFilters.length}개</div>
          </div>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed top-1/2 -right-12 -rotate-90 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-t-2xl shadow-2xl text-sm font-bold z-50">
        시안 8: 지도 우선 오버레이 (Map-First)
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
