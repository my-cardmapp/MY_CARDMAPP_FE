'use client'

import { useState, useEffect } from 'react'
import type { Merchant } from '@/types'
import { googlePlacesAPI } from '@/services/googlePlacesAPI'
import type { GooglePlace } from '@/types/googlePlaces'

interface MerchantDetailPanelProps {
  merchant: Merchant | null
  onClose: () => void
}

type TabType = 'home' | 'info' | 'reviews'

export default function MerchantDetailPanel({ merchant, onClose }: MerchantDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [placeDetails, setPlaceDetails] = useState<GooglePlace | null>(null)
  const [isLoadingPlace, setIsLoadingPlace] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)

  // Fetch Google Place details when merchant changes
  useEffect(() => {
    if (!merchant) {
      setPlaceDetails(null)
      setPlaceError(null)
      return
    }

    const fetchPlaceDetails = async () => {
      try {
        setIsLoadingPlace(true)
        setPlaceError(null)

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🏪 [Fetching Google Place Details]')
        console.log('Merchant:', merchant.name)
        console.log('Google Place ID:', merchant.googlePlaceId)

        // Google Place ID가 있으면 상세 정보 조회
        if (merchant.googlePlaceId) {
          const details = await googlePlacesAPI.getPlaceDetails(merchant.googlePlaceId)
          console.log('✅ [Place Details Fetched]')
          console.log('Place:', details)
          setPlaceDetails(details)
        } else {
          // Google Place ID가 없으면 검색으로 조회
          console.log('⚠️ No Google Place ID, searching by name...')
          const results = await googlePlacesAPI.searchByText(merchant.name, {
            pageSize: 1,
            locationBias: {
              lat: merchant.location.lat,
              lng: merchant.location.lng,
              radius: 100, // 100m 반경
            },
          })

          if (results && results.length > 0) {
            const place = results[0]
            console.log('✅ [Place Found via Search]')
            console.log('Place ID:', place.id)

            // Place ID로 상세 정보 다시 조회
            console.log('🔍 [Fetching Full Place Details with Place ID]')
            const details = await googlePlacesAPI.getPlaceDetails(place.id)
            console.log('✅ [Full Place Details Fetched]')
            console.log('Details:', details)
            setPlaceDetails(details)
          } else {
            console.log('⚠️ No place found for:', merchant.name)
          }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      } catch (error) {
        console.error('❌ Failed to fetch place details:', error)
        setPlaceError('장소 정보를 불러오는데 실패했습니다')
      } finally {
        setIsLoadingPlace(false)
      }
    }

    fetchPlaceDetails()
  }, [merchant])

  if (!merchant) return null

  const hasPlaceDetails = !!placeDetails

  // 데이터 우선순위: placeDetails 우선 사용
  const displayName = placeDetails?.displayName?.text || merchant.name
  const displayAddress = placeDetails?.formattedAddress || merchant.address
  const displayPhone = placeDetails?.internationalPhoneNumber || merchant.phone
  const displayRating = placeDetails?.rating || merchant.rating
  const displayReviewCount = placeDetails?.userRatingCount || merchant.userRatingCount
  const displayReviews = placeDetails?.reviews || merchant.reviews
  const displayPhoto = placeDetails?.photos?.[0]
  const displayWebsite = placeDetails?.websiteUri || merchant.websiteUri
  const displayGoogleMaps = placeDetails?.googleMapsUri || merchant.googleMapsUri

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* Panel */}
      <div className="absolute top-0 right-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* 대표 사진 */}
        {displayPhoto && (
          <div className="relative w-full h-56 bg-gray-200 flex-shrink-0">
            <img
              src={googlePlacesAPI.getPhotoUrl(displayPhoto, 800)}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패시 placeholder 표시
                e.currentTarget.style.display = 'none'
              }}
            />
            {/* 닫기 버튼 - 사진 위에 오버레이 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
              aria-label="닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Header - 사진이 없을 때만 표시 */}
        {!displayPhoto && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">
              {displayName}
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
        )}

        {/* Merchant Info */}
        <div className="px-5 py-5 flex-shrink-0">
          {/* 사진이 있으면 제목 표시 */}
          {displayPhoto && (
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {displayName}
            </h2>
          )}

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            {merchant.category.icon && (
              <span className="text-2xl">{merchant.category.icon}</span>
            )}
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
              {merchant.category.name}
            </span>
            {merchant.isVerified && (
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                인증
              </span>
            )}
          </div>

          {/* Google Places Data Indicator */}
          {isLoadingPlace && (
            <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Google 정보 로딩 중...
            </div>
          )}
          {hasPlaceDetails && (
            <div className="text-xs text-blue-600 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Google Places 정보
            </div>
          )}

          {/* Rating Display */}
          {displayRating && (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="text-2xl font-bold text-gray-900">
                  {displayRating.toFixed(1)}
                </span>
              </div>
              {displayReviewCount && (
                <span className="text-sm text-gray-600">
                  ({displayReviewCount.toLocaleString()}개의 리뷰)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex px-5">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'home'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              홈
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              정보
            </button>
            {displayReviews && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                리뷰 {displayReviewCount && `(${displayReviewCount})`}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5">
            {activeTab === 'home' && (
              <div className="space-y-5">
                {/* Address Section */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-1.5">주소</div>
                    <div className="text-sm text-gray-700 leading-relaxed">{displayAddress}</div>
                  </div>
                </div>

                {/* Phone Section */}
                {displayPhone && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-11 h-11 bg-green-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1.5">전화번호</div>
                      <a
                        href={`tel:${displayPhone}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {displayPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Business Hours Section */}
                {merchant.businessHours && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-2">영업시간</div>
                      <div className="text-sm text-gray-700 space-y-1.5">
                        {Object.entries(merchant.businessHours).slice(0, 3).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="text-gray-600 font-medium">{day}:</span>
                            <span>{hours.join(' - ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cards Section */}
                {merchant.cards.length > 0 && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-2">사용 가능한 카드</div>
                      <div className="flex flex-wrap gap-2">
                        {merchant.cards.map((card) => (
                          <span
                            key={card.id}
                            className="px-3 py-1.5 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: `${card.colorHex}20`,
                              color: card.colorHex,
                              border: `1.5px solid ${card.colorHex}40`
                            }}
                          >
                            {card.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                {(displayGoogleMaps || displayWebsite) && (
                  <div className="border-t border-gray-200 pt-4 mt-2" />
                )}

                {/* External Links */}
                <div className="space-y-3">
                  {/* Google Maps Link */}
                  {displayGoogleMaps && (
                    <a
                      href={displayGoogleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Google 지도에서 보기
                        </div>
                        <div className="text-xs text-gray-500">길찾기 및 상세정보</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}

                  {/* Website Link */}
                  {displayWebsite && (
                    <a
                      href={displayWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          웹사이트 방문
                        </div>
                        <div className="text-xs text-gray-500">공식 홈페이지</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-5">
                {/* Category Info */}
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">카테고리</div>
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    {merchant.category.icon && <span className="text-xl">{merchant.category.icon}</span>}
                    <span className="font-medium">{merchant.category.name}</span>
                    {placeDetails?.types && placeDetails.types.length > 0 && (
                      <span className="text-gray-500">({placeDetails.types[0]})</span>
                    )}
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">검증 상태</div>
                  <div className="text-sm">
                    {merchant.isVerified ? (
                      <span className="text-green-600 flex items-center gap-1.5 font-medium">
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
                  <div className="text-sm font-semibold text-gray-900 mb-2">좌표</div>
                  <div className="text-sm text-gray-700 font-mono">
                    위도: {merchant.location.lat.toFixed(6)}, 경도: {merchant.location.lng.toFixed(6)}
                  </div>
                </div>

                {/* Google Place ID */}
                {merchant.googlePlaceId && (
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">Google Place ID</div>
                    <div className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-3 rounded-lg">
                      {merchant.googlePlaceId}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {displayReviews && displayReviews.length > 0 ? (
                  displayReviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      {/* Reviewer Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-base font-bold">
                            {review.authorAttribution?.displayName?.[0] || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {review.authorAttribution?.displayName || '익명'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {review.relativePublishTimeDescription}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      {review.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-base ${i < review.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Review Text */}
                      {review.text?.text && (
                        <div className="text-sm text-gray-800 leading-relaxed">{review.text.text}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-sm">리뷰가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
