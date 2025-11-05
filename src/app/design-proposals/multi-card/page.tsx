'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MultiCardDesign() {
  const [selectedCards, setSelectedCards] = useState<string[]>(['child-meal', 'culture'])
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split')

  const cards = [
    { id: 'child-meal', name: '아동급식', icon: '🍱', color: 'bg-red-500', lightColor: 'bg-red-100', count: 1234 },
    { id: 'culture', name: '문화누리', icon: '🎭', color: 'bg-teal-500', lightColor: 'bg-teal-100', count: 856 },
    { id: 'local', name: '지역사랑', icon: '💳', color: 'bg-yellow-500', lightColor: 'bg-yellow-100', count: 2341 }
  ]

  const toggleCard = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : prev.length < 2
        ? [...prev, cardId]
        : [prev[1], cardId] // Keep only 2 cards, replace the first one
    )
  }

  const getSelectedCardData = (cardId: string) => cards.find(c => c.id === cardId)

  const sharedMerchants = 23 // Mock: merchants that accept both cards

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 relative z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Card-Map Compare</h1>
              <p className="text-sm text-slate-600">여러 카드를 동시에 비교하세요</p>
            </div>
            <Link
              href="/design-proposals"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              ← 돌아가기
            </Link>
          </div>

          {/* Card Selection */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">비교할 카드 (최대 2개):</span>
            <div className="flex gap-2 flex-1">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCards.includes(card.id)
                      ? `${card.color} text-white shadow-lg transform scale-105`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{card.icon}</span>
                  <span>{card.name}</span>
                  {selectedCards.includes(card.id) && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {selectedCards.indexOf(card.id) + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                }`}
              >
                분할
              </button>
              <button
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'overlay' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                }`}
              >
                겹침
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'split' ? (
          /* Split View Mode */
          <>
            {selectedCards.map((cardId, index) => {
              const card = getSelectedCardData(cardId)
              return (
                <div
                  key={cardId}
                  className={`${selectedCards.length === 1 ? 'w-full' : 'w-1/2'} flex flex-col border-r border-slate-200 last:border-r-0`}
                >
                  {/* Card Header */}
                  <div className={`${card?.color} text-white p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{card?.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold">{card?.name}카드</h3>
                          <p className="text-sm opacity-90">{card?.count.toLocaleString()}개 가맹점</p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold opacity-20">{index + 1}</div>
                    </div>
                  </div>

                  {/* Map Area */}
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{card?.icon}</div>
                        <p className="text-slate-600 font-medium">{card?.name} 가맹점 지도</p>
                        <p className="text-sm text-slate-500 mt-2">분할 뷰 모드</p>
                      </div>
                    </div>

                    {/* Stats Overlay */}
                    <div className={`absolute top-4 left-4 ${card?.lightColor} p-4 rounded-xl shadow-lg`}>
                      <div className="text-2xl font-bold text-slate-900">{card?.count}</div>
                      <div className="text-xs text-slate-600">이용 가능</div>
                    </div>
                  </div>

                  {/* Merchant List */}
                  <div className="h-48 overflow-y-auto border-t border-slate-200">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{card?.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-slate-900">가맹점 {i + 1}</div>
                            <div className="text-xs text-slate-600">{(i + 1) * 150}m</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          /* Overlay View Mode */
          <div className="flex-1 flex flex-col">
            {/* Merged Map */}
            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex gap-4 mb-4 text-6xl">
                    {selectedCards.map(cardId => (
                      <span key={cardId}>{getSelectedCardData(cardId)?.icon}</span>
                    ))}
                  </div>
                  <p className="text-slate-600 font-medium">통합 지도 뷰</p>
                  <p className="text-sm text-slate-500 mt-2">모든 가맹점이 색상으로 구분되어 표시됩니다</p>
                </div>
              </div>

              {/* Venn Diagram Visualization */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-64 h-64">
                  {/* Circle 1 */}
                  <div className={`absolute w-48 h-48 ${getSelectedCardData(selectedCards[0])?.color} opacity-30 rounded-full left-0 top-8`}></div>
                  {/* Circle 2 */}
                  <div className={`absolute w-48 h-48 ${getSelectedCardData(selectedCards[1])?.color} opacity-30 rounded-full right-0 top-8`}></div>
                  {/* Intersection */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="font-bold text-xl text-slate-900">{sharedMerchants}</div>
                      <div className="text-xs text-slate-600">공통</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg">
                <h4 className="font-bold text-sm text-slate-900 mb-3">범례</h4>
                <div className="space-y-2">
                  {selectedCards.map(cardId => {
                    const card = getSelectedCardData(cardId)
                    return (
                      <div key={cardId} className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${card?.color} rounded-full`}></div>
                        <span className="text-sm text-slate-700">{card?.name}</span>
                        <span className="text-xs text-slate-500 ml-auto">{card?.count}</span>
                      </div>
                    )
                  })}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-900">공통</span>
                    <span className="text-xs text-slate-500 ml-auto">{sharedMerchants}</span>
                  </div>
                </div>
              </div>

              {/* Comparison Stats */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-3">카드 비교 통계</h4>
                <div className="grid grid-cols-3 gap-4">
                  {selectedCards.map(cardId => {
                    const card = getSelectedCardData(cardId)
                    return (
                      <div key={cardId} className={`${card?.lightColor} p-3 rounded-lg`}>
                        <div className="text-lg font-bold text-slate-900">{card?.count}</div>
                        <div className="text-xs text-slate-600">{card?.name} 전용</div>
                      </div>
                    )
                  })}
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">{sharedMerchants}</div>
                    <div className="text-xs text-slate-600">공통 사용 가능</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison List */}
            <div className="h-56 border-t border-slate-200 bg-white overflow-hidden">
              <div className="h-full overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">가맹점</th>
                      {selectedCards.map(cardId => {
                        const card = getSelectedCardData(cardId)
                        return (
                          <th key={cardId} className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                            {card?.icon} {card?.name}
                          </th>
                        )
                      })}
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">거리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">가맹점 이름 {i + 1}</td>
                        {selectedCards.map(cardId => (
                          <td key={cardId} className="px-4 py-3 text-center">
                            {Math.random() > 0.3 ? (
                              <span className="inline-block w-5 h-5 bg-green-500 rounded-full">
                                <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-block w-5 h-5 bg-slate-200 rounded-full">
                                <svg className="w-full h-full text-slate-400 p-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">{(i + 1) * 120}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50">
        시안 9: 멀티 카드 비교 (Multi-Card) - {viewMode === 'split' ? '분할' : '겹침'} 모드
      </div>
    </div>
  )
}
