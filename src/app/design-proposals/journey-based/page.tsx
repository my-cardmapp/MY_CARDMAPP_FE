'use client'

import Link from 'next/link'
import { useState } from 'react'

type JourneyStep = 'meal' | 'culture' | 'shopping' | 'complete'

export default function JourneyBasedDesign() {
  const [currentStep, setCurrentStep] = useState<JourneyStep>('meal')
  const [selectedPlaces, setSelectedPlaces] = useState<{[key: string]: any}>({})

  const journey = [
    {
      id: 'meal',
      title: '식사하기',
      icon: '🍱',
      card: '아동급식카드',
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      description: '맛있는 식사로 하루를 시작해요',
      suggestions: [
        { name: '행복한 식당', type: '한식', distance: '350m', rating: 4.5 },
        { name: '든든한 분식', type: '분식', distance: '520m', rating: 4.7 },
        { name: '건강한 밥상', type: '가정식', distance: '890m', rating: 4.3 }
      ]
    },
    {
      id: 'culture',
      title: '문화 즐기기',
      icon: '🎭',
      card: '문화누리카드',
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      description: '식사 후 문화생활을 즐겨요',
      suggestions: [
        { name: 'CGV 강남점', type: '영화관', distance: '1.2km', rating: 4.6 },
        { name: '교보문고', type: '서점', distance: '1.5km', rating: 4.8 },
        { name: '예술의전당', type: '공연장', distance: '2.1km', rating: 4.9 }
      ]
    },
    {
      id: 'shopping',
      title: '장보기',
      icon: '🛒',
      card: '지역사랑상품권',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      description: '필요한 물건을 구매해요',
      suggestions: [
        { name: '로컬마트', type: '마트', distance: '600m', rating: 4.4 },
        { name: '우리동네슈퍼', type: '슈퍼', distance: '450m', rating: 4.5 },
        { name: '편의점24', type: '편의점', distance: '200m', rating: 4.2 }
      ]
    }
  ]

  const getCurrentJourney = () => journey.find(j => j.id === currentStep)
  const getStepIndex = () => journey.findIndex(j => j.id === currentStep)
  const isComplete = currentStep === 'complete'

  const handleSelectPlace = (place: any) => {
    setSelectedPlaces(prev => ({
      ...prev,
      [currentStep]: place
    }))
  }

  const handleNext = () => {
    const currentIndex = getStepIndex()
    if (currentIndex < journey.length - 1) {
      setCurrentStep(journey[currentIndex + 1].id as JourneyStep)
    } else {
      setCurrentStep('complete')
    }
  }

  const handleBack = () => {
    const currentIndex = getStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(journey[currentIndex - 1].id as JourneyStep)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-200 relative z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Card-Map Journey
            </h1>
            <p className="text-sm text-slate-600">오늘의 여정을 계획해보세요</p>
          </div>
          <Link
            href="/design-proposals"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            {journey.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`relative flex flex-col items-center ${index < journey.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      selectedPlaces[step.id]
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                        : currentStep === step.id
                        ? `bg-white border-4 border-purple-500`
                        : 'bg-gray-200'
                    }`}
                  >
                    {selectedPlaces[step.id] ? '✓' : step.icon}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    currentStep === step.id ? 'text-purple-600' : 'text-slate-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < journey.length - 1 && (
                  <div className="flex-1 h-1 mx-2 mb-6 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${
                        selectedPlaces[step.id] ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {!isComplete ? (
          <>
            {/* Left Panel - Journey Step Details */}
            <div className="w-96 bg-white border-r border-purple-200 flex flex-col">
              {/* Step Header */}
              <div className={`p-6 bg-gradient-to-r ${getCurrentJourney()?.color} text-white`}>
                <div className="text-5xl mb-3">{getCurrentJourney()?.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{getCurrentJourney()?.title}</h2>
                <p className="text-sm opacity-90 mb-3">{getCurrentJourney()?.description}</p>
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {getCurrentJourney()?.card}
                </div>
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 bg-purple-50 border-b border-purple-100">
                  <h3 className="font-semibold text-slate-900">추천 장소</h3>
                  <p className="text-sm text-slate-600">마음에 드는 곳을 선택하세요</p>
                </div>

                {getCurrentJourney()?.suggestions.map((place, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectPlace(place)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-all ${
                      selectedPlaces[currentStep]?.name === place.name
                        ? `${getCurrentJourney()?.bgColor} border-l-4 border-l-purple-500`
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{place.name}</h4>
                        <p className="text-sm text-slate-600 mb-2">{place.type}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {place.rating}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-purple-600 font-medium">{place.distance}</span>
                        </div>
                      </div>
                      {selectedPlaces[currentStep]?.name === place.name && (
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  {getStepIndex() > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      ← 이전
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!selectedPlaces[currentStep]}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      selectedPlaces[currentStep]
                        ? `bg-gradient-to-r ${getCurrentJourney()?.color} text-white hover:opacity-90`
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {getStepIndex() === journey.length - 1 ? '완료하기' : '다음 →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{getCurrentJourney()?.icon}</div>
                  <p className="text-slate-600 font-medium">{getCurrentJourney()?.title} 지도</p>
                  <p className="text-sm text-slate-500 mt-2">{getCurrentJourney()?.card}</p>
                </div>
              </div>

              {/* Selected Journey Timeline */}
              {Object.keys(selectedPlaces).length > 0 && (
                <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">선택한 여정</h4>
                  <div className="space-y-2">
                    {journey.map((step, index) => (
                      selectedPlaces[step.id] && (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{selectedPlaces[step.id].name}</div>
                            <div className="text-xs text-slate-600">{step.title}</div>
                          </div>
                          <div className="text-sm text-purple-600 font-medium">
                            {selectedPlaces[step.id].distance}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

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
            </div>
          </>
        ) : (
          /* Complete Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                여정 계획 완료!
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                총 {Object.keys(selectedPlaces).length}개의 장소를 선택하셨습니다
              </p>

              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="font-bold text-xl text-slate-900 mb-6">나의 여정 요약</h3>
                <div className="space-y-4">
                  {journey.map((step, index) => (
                    selectedPlaces[step.id] && (
                      <div key={step.id} className={`flex items-center gap-4 p-4 rounded-xl ${step.bgColor}`}>
                        <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-slate-900">{selectedPlaces[step.id].name}</div>
                          <div className="text-sm text-slate-600">{step.title} · {selectedPlaces[step.id].type}</div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          {selectedPlaces[step.id].distance}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCurrentStep('meal')
                    setSelectedPlaces({})
                  }}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  새로운 여정 시작
                </button>
                <button className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                  경로 안내 시작
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Design Info Badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50">
        시안 7: 스토리 기반 여정 (Journey)
      </div>
    </div>
  )
}
