'use client'

import Link from 'next/link'
import { useState } from 'react'

type SheetState = 'mini' | 'medium' | 'full'

export default function MobileFirstDesign() {
  const [sheetState, setSheetState] = useState<SheetState>('medium')
  const [activeTab, setActiveTab] = useState<'list' | 'route'>('list')

  const merchants = [
    { id: 1, name: '행복한 식당', address: '서울시 강남구 테헤란로 123', cards: ['아동급식'], distance: '350m' },
    { id: 2, name: '든든한 분식', address: '서울시 강남구 역삼동 456', cards: ['아동급식', '문화누리'], distance: '520m' },
    { id: 3, name: '맛있는 카페', address: '서울시 강남구 선릉역 789', cards: ['문화누리'], distance: '890m' }
  ]

  const getSheetHeight = () => {
    switch (sheetState) {
      case 'mini':
        return 'h-20'
      case 'medium':
        return 'h-96'
      case 'full':
        return 'h-[calc(100%-4rem)]'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 px-4 py-3">
            <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="가맹점 검색..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-500"
            />
            <Link
              href="/design-proposals"
              className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              돌아가기
            </Link>
          </div>
        </div>
      </div>

      {/* Map Area - Full Screen */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {/* Mock Map */}
        <div className="absolute inset-0 flex items-center justify-center pb-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 font-medium">지도 영역</p>
            <p className="text-sm text-gray-500 mt-2">모바일 퍼스트 스타일</p>
          </div>
        </div>

        {/* Map Controls - Right Side */}
        <div className="absolute top-24 right-4 flex flex-col gap-2 z-20">
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Current Location Button */}
        <div className="absolute bottom-[26rem] right-4 z-20">
          <button className="p-4 bg-purple-500 text-white rounded-full shadow-2xl hover:bg-purple-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </button>
        </div>

        {/* Bottom Sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${getSheetHeight()} z-40`}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <button
              onClick={() => {
                if (sheetState === 'mini') setSheetState('medium')
                else if (sheetState === 'medium') setSheetState('full')
                else setSheetState('mini')
              }}
              className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* Sheet Header */}
          <div className="px-4 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">📍 가맹점 {merchants.length}개</h2>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-full font-medium">
                  아동급식
                </button>
                <button className="px-3 py-1.5 bg-teal-500 text-white text-sm rounded-full font-medium">
                  문화누리
                </button>
                <button className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Size Toggle Buttons */}
            {sheetState !== 'mini' && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setSheetState('mini')}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  최소화
                </button>
                <button
                  onClick={() => setSheetState('medium')}
                  className={`px-2 py-1 rounded ${sheetState === 'medium' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  중간
                </button>
                <button
                  onClick={() => setSheetState('full')}
                  className={`px-2 py-1 rounded ${sheetState === 'full' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  전체
                </button>
              </div>
            )}
          </div>

          {/* Sheet Content - Only show if not mini */}
          {sheetState !== 'mini' && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'list'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  가맹점 목록
                </button>
                <button
                  onClick={() => setActiveTab('route')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'route'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  경로 계획
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'list' ? (
                  /* Merchant List */
                  <div>
                    {merchants.map((merchant) => (
                      <button
                        key={merchant.id}
                        className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{merchant.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{merchant.address}</p>
                            <div className="flex gap-2">
                              {merchant.cards.map((card) => (
                                <span
                                  key={card}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                                >
                                  {card}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-3 text-right">
                            <div className="text-2xl mb-1">🍴</div>
                            <div className="text-sm text-gray-500">{merchant.distance}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600">
                            길찾기
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                            상세
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Route Planning */
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">출발지</label>
                        <input
                          type="text"
                          placeholder="현재 위치"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">도착지</label>
                        <input
                          type="text"
                          placeholder="도착지를 입력하세요"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Transport Mode */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">이동 수단</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button className="flex flex-col items-center gap-2 py-3 bg-purple-500 text-white rounded-lg font-medium">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm">도보</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                            <span className="text-sm">대중교통</span>
                          </button>
                          <button className="flex flex-col items-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            <span className="text-sm">자동차</span>
                          </button>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors shadow-lg">
                        경로 검색
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Design Info Badge */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50">
        시안 4: 모바일 퍼스트 바텀 시트
      </div>
    </div>
  )
}
