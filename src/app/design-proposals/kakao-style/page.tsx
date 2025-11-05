'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function KakaoStyleDesign() {
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const cardTypes = [
    { id: 'child-meal', name: '아동급식카드', icon: '🍱', bgColor: 'bg-red-50', borderColor: 'border-red-400', textColor: 'text-red-700', activeColor: 'bg-red-500', count: 1234 },
    { id: 'culture', name: '문화누리카드', icon: '🎭', bgColor: 'bg-teal-50', borderColor: 'border-teal-400', textColor: 'text-teal-700', activeColor: 'bg-teal-500', count: 856 },
    { id: 'local', name: '지역사랑상품권', icon: '💳', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-400', textColor: 'text-yellow-700', activeColor: 'bg-yellow-500', count: 2341 }
  ]

  const categories = [
    { icon: '🍴', name: '음식점' },
    { icon: '☕', name: '카페' },
    { icon: '🏪', name: '편의점' },
    { icon: '🏦', name: '은행' },
    { icon: '🏨', name: '숙박' },
    { icon: '🚌', name: '버스' },
    { icon: '🚇', name: '지하철' }
  ]

  const myPlaces = [
    { icon: '🏠', label: '집', placeholder: '주소를 등록하세요.' },
    { icon: '🏢', label: '회사/학교', placeholder: '주소를 등록하세요.' },
    { icon: '⭐', label: '자주 가는 장소', placeholder: '주소를 등록하세요. (최대 5개)' }
  ]

  return (
    <div className="h-screen flex bg-white">
      {/* Fixed Sidebar - 320px */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">kakaomap</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="지도 검색"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-yellow-400 rounded">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Location & Weather */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">현재위치</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-900 font-medium">고양시 덕양구 화정1동</span>
              <Link href="#" className="text-xs text-blue-600 hover:underline">오류신고</Link>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">☀️</span>
                <span className="font-medium text-gray-900">28°</span>
              </div>
              <span className="text-gray-500">미세 좋음</span>
              <span className="text-gray-500">초미세 좋음</span>
            </div>
          </div>

          {/* Card Type Section - Visual Cards */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">복지카드 선택</h3>
            <div className="space-y-2">
              {cardTypes.map((card) => {
                const isSelected = selectedCards.includes(card.id)
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      setSelectedCards(prev =>
                        prev.includes(card.id) ? prev.filter(c => c !== card.id) : [...prev, card.id]
                      )
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `${card.activeColor} text-white border-transparent shadow-lg transform scale-105`
                        : `${card.bgColor} ${card.borderColor} ${card.textColor} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{card.icon}</span>
                        <div className="text-left">
                          <div className="font-bold">{card.name}</div>
                          <div className={`text-sm ${isSelected ? 'text-white opacity-90' : 'opacity-70'}`}>
                            {card.count.toLocaleString()}개 가맹점
                          </div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'bg-white border-white' : `${card.borderColor}`
                      }`}>
                        {isSelected && <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Around Search */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">주변 탐색</h3>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* My Places */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">내 장소</h3>
            <div className="space-y-2">
              {myPlaces.map((place) => (
                <button
                  key={place.label}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-2xl">{place.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500">{place.label}</div>
                    <div className="text-sm text-gray-600 truncate">{place.placeholder}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">즐겨찾기</h3>
            <div className="text-center py-6 text-sm text-gray-500">
              <p>저장한 즐겨찾기에 대해</p>
              <p>'홈 목록 추가'한 장소가 나옵니다.</p>
              <p className="mt-2 text-gray-600">자주 쓰는 즐겨찾기를 더 빠르게 사용해 보세요.</p>
            </div>
          </div>

          {/* New Place */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">새로운 장소</h3>
            <p className="text-xs text-gray-600 mb-3">
              새로운 수정된 장소를 알고 계세요?<br />
              장소 제안은 지도 품질 향상에 큰 도움이 됩니다.
            </p>
            <button className="w-full py-2 bg-yellow-400 text-white font-medium rounded hover:bg-yellow-500 transition-colors">
              신규 장소 등록
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-5 text-center text-xs">
            <button className="py-3 flex flex-col items-center gap-1 bg-yellow-50 border-t-2 border-yellow-400 text-yellow-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">검색</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1 text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>길찾기</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1 text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>버스</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1 text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>지하철</span>
            </button>
            <button className="py-3 flex flex-col items-center gap-1 text-gray-500 hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>MY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="#" className="hover:text-gray-900">경기도</Link>
            <span>›</span>
            <Link href="#" className="hover:text-gray-900">고양시 덕양구</Link>
            <span>›</span>
            <Link href="#" className="font-medium text-gray-900">화정1동</Link>
            <div className="ml-3 flex items-center gap-1">
              <span>☀️</span>
              <span className="font-medium">28℃</span>
            </div>
          </div>

          <Link
            href="/design-proposals"
            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            ← 돌아가기
          </Link>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Mock Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-600 font-medium">지도 영역</p>
              <p className="text-sm text-gray-500 mt-2">카카오 맵 스타일</p>
            </div>
          </div>

          {/* Map Type Toggle */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button className="px-4 py-2 bg-white rounded shadow border-b-2 border-yellow-400 font-medium text-sm">
              지도
            </button>
            <button className="px-4 py-2 bg-white rounded shadow text-gray-600 hover:bg-gray-50 text-sm">
              스카이뷰
            </button>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="bg-white rounded shadow border border-gray-200">
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

            {/* Current Location */}
            <button className="p-3 bg-white rounded shadow border border-gray-200 hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </button>
          </div>

          {/* Scale Bar */}
          <div className="absolute bottom-6 left-6 bg-white px-3 py-1 rounded shadow text-xs font-medium text-gray-700 border border-gray-200">
            50m
          </div>

          {/* Kakao Logo */}
          <div className="absolute bottom-2 right-2 opacity-50">
            <span className="text-xs text-gray-500">kakao</span>
          </div>
        </div>
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50">
        시안 2: 카카오형 고정 패널
      </div>
    </div>
  )
}
