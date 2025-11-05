'use client'

import { useState, useEffect } from 'react'
import type { Merchant } from '@/types'
import { naverLocalSearchAPI, type NaverLocalSearchResponse } from '@/services/naverLocalSearchAPI'
import { CARD_STYLES } from '@/constants/cardStyles'

interface MerchantDetailPanelProps {
  merchant: Merchant | null
  onClose: () => void
}

type TabType = 'home' | 'info'

export default function MerchantDetailPanel({ merchant, onClose }: MerchantDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [poiData, setPoiData] = useState<NaverLocalSearchResponse | null>(null)
  const [isLoadingPOI, setIsLoadingPOI] = useState(false)
  const [poiError, setPoiError] = useState<string | null>(null)

  // Fetch POI data when merchant changes
  useEffect(() => {
    if (!merchant) {
      setPoiData(null)
      setPoiError(null)
      return
    }

    const fetchPOIData = async () => {
      try {
        setIsLoadingPOI(true)
        setPoiError(null)
        const data = await naverLocalSearchAPI.searchByQuery(merchant.name, { display: 1 })
        setPoiData(data)
      } catch (error) {
        console.error('Failed to fetch POI data:', error)
        setPoiError('POI 정보를 불러오는데 실패했습니다')
      } finally {
        setIsLoadingPOI(false)
      }
    }

    fetchPOIData()
  }, [merchant])

  if (!merchant) return null

  const poiItem = poiData?.items[0]
  const hasPOIData = !!poiItem

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">
            {merchant.name}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Merchant Info */}
        <div className="px-4 py-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            {merchant.category.icon && (
              <span className="text-2xl">{merchant.category.icon}</span>
            )}
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {merchant.category.name}
            </span>
            {merchant.isVerified && (
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                인증
              </span>
            )}
          </div>

          {/* POI Data Indicator */}
          {isLoadingPOI && (
            <div className="text-sm text-gray-500 mb-3">네이버 정보 로딩 중...</div>
          )}
          {hasPOIData && (
            <div className="text-xs text-blue-600 mb-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              네이버 지역 검색 정보
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              홈
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              정보
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-4">
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Address Section */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">주소</div>
                  <div className="text-sm text-gray-600">{merchant.address}</div>
                </div>
              </div>

              {/* Phone Section */}
              {merchant.phone && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">전화번호</div>
                    <div className="text-sm text-gray-600">{merchant.phone}</div>
                  </div>
                </div>
              )}

              {/* Business Hours Section */}
              {merchant.businessHours && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-2">영업시간</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {Object.entries(merchant.businessHours).slice(0, 3).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-gray-500">{day}:</span>
                          <span>{hours.join(' - ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Section */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-2">사용 가능한 카드</div>
                  <div className="flex flex-wrap gap-2">
                    {merchant.cards.map((card) => (
                      <span
                        key={card.id}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${card.colorHex}20`,
                          color: card.colorHex,
                          border: `1px solid ${card.colorHex}40`
                        }}
                      >
                        {card.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* POI Link */}
              {hasPOIData && poiItem.link && (
                <div>
                  <a
                    href={poiItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>네이버 지도에서 보기</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Category Info */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">카테고리</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  {merchant.category.icon && <span className="text-xl">{merchant.category.icon}</span>}
                  <span>{merchant.category.name}</span>
                  {poiItem?.category && <span className="text-gray-400">({poiItem.category})</span>}
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">검증 상태</div>
                <div className="text-sm text-gray-600">
                  {merchant.isVerified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      인증된 가맹점
                    </span>
                  ) : (
                    <span className="text-gray-500">미인증</span>
                  )}
                </div>
              </div>

              {/* Location Coordinates */}
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">좌표</div>
                <div className="text-sm text-gray-600">
                  위도: {merchant.location.lat.toFixed(6)}, 경도: {merchant.location.lng.toFixed(6)}
                </div>
              </div>

              {/* POI Description */}
              {poiItem?.description && (
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">설명</div>
                  <div className="text-sm text-gray-600">{poiItem.description}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
