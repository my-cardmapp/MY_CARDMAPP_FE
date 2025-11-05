'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AIPoweredDesign() {
  const [currentTime, setCurrentTime] = useState('12:30')
  const [aiRecommending, setAiRecommending] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setAiRecommending(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const aiRecommendations = [
    {
      id: 1,
      title: '점심 식사 추천',
      icon: '🍱',
      reason: '현재 시각 12:30 PM, 식사 시간입니다',
      card: '아동급식카드',
      color: 'from-red-400 to-red-600',
      places: [
        { name: '행복한 식당', type: '한식', distance: '250m', score: 98, reason: '가깝고 평점이 높아요' },
        { name: '건강한 밥상', type: '가정식', distance: '380m', score: 95, reason: '영양가 있는 메뉴' },
        { name: '맛있는 분식', type: '분식', distance: '420m', score: 92, reason: '합리적인 가격' }
      ]
    },
    {
      id: 2,
      title: '오후 문화 활동',
      icon: '🎭',
      reason: '식사 후 문화생활 어떠세요?',
      card: '문화누리카드',
      color: 'from-teal-400 to-teal-600',
      places: [
        { name: '영화관 CGV', type: '영화', distance: '1.2km', score: 96, reason: '신작 상영 중' },
        { name: '교보문고', type: '서점', distance: '890m', score: 94, reason: '독서하기 좋은 날' },
        { name: '작은 갤러리', type: '미술', distance: '650m', score: 91, reason: '특별 전시 중' }
      ]
    },
    {
      id: 3,
      title: '귀가 전 장보기',
      icon: '🛒',
      reason: '집 근처에서 필요한 물건 구매',
      card: '지역사랑상품권',
      color: 'from-yellow-400 to-yellow-600',
      places: [
        { name: '우리동네마트', type: '마트', distance: '180m', score: 97, reason: '집에서 가장 가까워요' },
        { name: '편의점24', type: '편의점', distance: '90m', score: 93, reason: '간편 쇼핑' },
        { name: '로컬슈퍼', type: '슈퍼', distance: '320m', score: 89, reason: '신선한 식재료' }
      ]
    }
  ]

  const [selectedRecommendation, setSelectedRecommendation] = useState(aiRecommendations[0])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header with AI Status */}
      <header className="bg-white shadow-sm border-b border-purple-200 relative z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Card Assistant
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${aiRecommending ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></span>
                {aiRecommending ? 'AI가 분석중입니다...' : '추천 준비 완료'}
              </p>
            </div>
          </div>
          <Link
            href="/design-proposals"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>

        {/* Context Bar */}
        <div className="px-6 pb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-purple-900">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="font-medium text-blue-900">강남구 역삼동</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-medium text-green-900">3장 보유</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI Recommendations */}
        <div className="w-96 bg-white border-r border-purple-200 flex flex-col">
          <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="font-bold text-slate-900 mb-1">AI 맞춤 추천</h2>
            <p className="text-sm text-slate-600">현재 상황에 맞는 장소를 추천해드려요</p>
          </div>

          {/* Recommendation Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiRecommendations.map((rec, index) => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecommendation(rec)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedRecommendation.id === rec.id
                    ? 'bg-gradient-to-r ' + rec.color + ' text-white shadow-xl transform scale-105'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`text-3xl ${selectedRecommendation.id === rec.id ? '' : 'opacity-70'}`}>
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${selectedRecommendation.id === rec.id ? 'text-white' : 'text-slate-900'}`}>
                      {rec.title}
                    </h3>
                    <p className={`text-sm ${selectedRecommendation.id === rec.id ? 'text-white/90' : 'text-slate-600'}`}>
                      {rec.reason}
                    </p>
                  </div>
                  {selectedRecommendation.id === rec.id && (
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-xs ${selectedRecommendation.id === rec.id ? 'text-white/80' : 'text-slate-500'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{rec.card} 사용 가능</span>
                </div>
              </button>
            ))}
          </div>

          {/* AI Insight */}
          <div className="p-4 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">AI 인사이트</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  오늘은 점심 후 문화 활동, 귀가 전 장보기 순서로 이동하시면
                  총 이동 거리를 30% 줄일 수 있어요!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Details & Map */}
        <div className="flex-1 flex flex-col">
          {/* Selected Recommendation Header */}
          <div className={`p-6 bg-gradient-to-r ${selectedRecommendation.color} text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedRecommendation.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedRecommendation.title}</h2>
                  <p className="text-sm opacity-90">{selectedRecommendation.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-75">추천 장소</div>
                <div className="text-3xl font-bold">{selectedRecommendation.places.length}</div>
              </div>
            </div>

            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {selectedRecommendation.card} 사용
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedRecommendation.icon}</div>
                <p className="text-slate-600 font-medium">AI 추천 지도</p>
                <p className="text-sm text-slate-500 mt-2">
                  {selectedRecommendation.places.length}개 장소가 표시됩니다
                </p>
              </div>
            </div>

            {/* AI Score Badges on Map */}
            {selectedRecommendation.places.slice(0, 3).map((place, index) => (
              <div
                key={index}
                className="absolute bg-white rounded-lg shadow-xl p-3 animate-bounce-in"
                style={{
                  top: `${30 + index * 20}%`,
                  left: `${30 + index * 15}%`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{place.name}</div>
                    <div className="text-xs text-green-600 font-medium">AI 점수: {place.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Places List */}
          <div className="border-t border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">AI 추천 순위</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {selectedRecommendation.places.map((place, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="text-xs font-medium text-slate-600">순위</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">AI 점수</div>
                      <div className="text-2xl font-bold text-green-600">{place.score}</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-1">{place.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{place.type}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-600 font-medium">{place.distance}</span>
                    <span className="text-slate-500">{place.reason}</span>
                  </div>

                  <button className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    길찾기 시작
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50 flex items-center gap-2">
        <span className="animate-pulse">🤖</span>
        시안 10: AI 기반 위치 추천 (AI-Powered)
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
}
