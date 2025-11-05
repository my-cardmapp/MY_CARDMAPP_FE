'use client'

import Link from 'next/link'
import { useState } from 'react'

type CardType = 'child-meal' | 'culture' | 'local' | null

export default function CardFirstDesign() {
  const [selectedCard, setSelectedCard] = useState<CardType>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const cards = [
    {
      id: 'child-meal' as const,
      name: '아동급식카드',
      icon: '🍱',
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      description: '끼니 걱정 없이',
      count: 1234,
      categories: ['음식점', '카페', '편의점', '제과점']
    },
    {
      id: 'culture' as const,
      name: '문화누리카드',
      icon: '🎭',
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      description: '문화생활 즐기기',
      count: 856,
      categories: ['영화관', '공연장', '서점', '미술관', '박물관']
    },
    {
      id: 'local' as const,
      name: '지역사랑상품권',
      icon: '💳',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      description: '우리 동네 살리기',
      count: 2341,
      categories: ['식당', '마트', '의류', '문구', '가전']
    }
  ]

  const getSelectedCardData = () => cards.find(c => c.id === selectedCard)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 relative z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Card-Map</h1>
            <p className="text-sm text-slate-600">어떤 카드를 사용하시나요?</p>
          </div>
          <Link
            href="/design-proposals"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Card Selection Panel - Left */}
        {!selectedCard ? (
          /* Card Selection Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                  사용하실 카드를 선택해주세요
                </h2>
                <p className="text-lg text-slate-600">
                  선택한 카드로 사용 가능한 가맹점만 지도에 표시됩니다
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(card.id)}
                    className="group relative"
                  >
                    {/* Card */}
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="text-6xl mb-4">{card.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {card.name}
                        </h3>
                        <p className="text-white/90 mb-4">{card.description}</p>
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm">가맹점</span>
                          <span className="text-2xl font-bold">{card.count.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Hologram Effect */}
                      <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    </div>

                    {/* Hover Text */}
                    <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium text-slate-600">
                        클릭하여 선택 →
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Tip</h4>
                    <p className="text-sm text-blue-800">
                      카드를 선택하면 해당 카드로 사용 가능한 가맹점만 필터링되어 지도에 표시됩니다.
                      여러 카드를 비교하고 싶다면 상단의 카드 전환 버튼을 이용하세요!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Map View with Selected Card */
          <>
            {/* Left Sidebar - Category & List */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
              {/* Selected Card Header */}
              <div className={`p-4 bg-gradient-to-r ${getSelectedCardData()?.color}`}>
                <div className="flex items-center justify-between text-white mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getSelectedCardData()?.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{getSelectedCardData()?.name}</h3>
                      <p className="text-sm opacity-90">{getSelectedCardData()?.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Card Switcher */}
                <div className="flex gap-2">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCard === card.id
                          ? 'bg-white text-slate-900 shadow-md'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <span className="text-lg mr-1">{card.icon}</span>
                      <span className="hidden sm:inline">{card.name.split('카드')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="가맹점 검색..."
                    className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Selection */}
              <div className="p-4 border-b border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">카테고리</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getSelectedCardData()?.categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? `${getSelectedCardData()?.bgColor} ${getSelectedCardData()?.textColor} border-2 border-current`
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="mt-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    전체 보기
                  </button>
                )}
              </div>

              {/* Merchant List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {selectedCategory || '전체'} 가맹점
                    </span>
                    <span className="text-sm text-slate-600">123곳</span>
                  </div>
                </div>

                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900 mb-1">가맹점 이름 {i + 1}</h4>
                    <p className="text-sm text-slate-600 mb-2">서울시 강남구 테헤란로 123</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 ${getSelectedCardData()?.bgColor} ${getSelectedCardData()?.textColor} rounded-full font-medium`}>
                        {getSelectedCardData()?.name}
                      </span>
                      <span className="text-sm text-slate-500">{(i + 1) * 150}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Map */}
            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{getSelectedCardData()?.icon}</div>
                  <p className="text-slate-600 font-medium">
                    {getSelectedCardData()?.name} 가맹점 지도
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    {selectedCategory ? `${selectedCategory} 카테고리` : '전체 가맹점'}
                  </p>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="bg-white rounded-lg shadow-md">
                  <button className="p-3 border-b border-slate-200 hover:bg-slate-50">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button className="p-3 hover:bg-slate-50">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getSelectedCardData()?.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {getSelectedCardData()?.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{getSelectedCardData()?.count.toLocaleString()}</div>
                    <div className="text-xs text-slate-600">이용 가능 가맹점</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50">
        시안 6: 카드 중심 대시보드 (Card-First)
      </div>
    </div>
  )
}
