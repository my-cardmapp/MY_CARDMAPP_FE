import { NextRequest, NextResponse } from 'next/server'
import type {
  GooglePlaceDetailsResponse,
  GooglePlacesErrorResponse,
} from '@/types/googlePlaces'

/**
 * Google Places API (New) - Place Details
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */

const GOOGLE_PLACES_API_BASE_URL = 'https://places.googleapis.com/v1'
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * GET /api/google/places/details?placeId={placeId}
 *
 * Google Places Place Details API 프록시 엔드포인트
 * Place ID를 받아 상세 정보를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // API 키 검증
    if (!API_KEY) {
      console.error('❌ Google Places API Key is not configured')
      return NextResponse.json(
        { error: 'Google Places API is not configured' },
        { status: 500 }
      )
    }

    // Query 파라미터 추출
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')
    const languageCode = searchParams.get('languageCode') || 'ko'

    // 필수 파라미터 검증
    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId is required' },
        { status: 400 }
      )
    }

    // 필드 마스크 정의 (모든 상세 정보 요청)
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'internationalPhoneNumber',
      'currentOpeningHours',
      'rating',
      'userRatingCount',
      'reviews',
      'photos',
      'types',
      'websiteUri',
      'googleMapsUri',
      'priceLevel',
    ].join(',')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 [Google Places Details Request]')
    console.log('Place ID:', placeId)
    console.log('Language:', languageCode)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Google Places API 호출
    const response = await fetch(
      `${GOOGLE_PLACES_API_BASE_URL}/places/${placeId}?languageCode=${languageCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
        // Next.js 캐싱 설정: 24시간 동안 캐시
        next: {
          revalidate: 86400, // 24시간 (초 단위)
        },
      }
    )

    // 에러 응답 처리
    if (!response.ok) {
      let errorData: GooglePlacesErrorResponse | null = null

      try {
        const text = await response.text()
        if (text) {
          errorData = JSON.parse(text)
        }
      } catch (parseError) {
        console.error('❌ [Failed to parse error response]', parseError)
      }

      console.error('❌ [Google Places API Error]', errorData)

      return NextResponse.json(
        {
          error: errorData?.error?.message || `Google Places API request failed (${response.status})`,
          details: errorData?.error,
        },
        { status: response.status }
      )
    }

    // 성공 응답 파싱
    const data: GooglePlaceDetailsResponse = await response.json()

    // 사진은 대표 사진 1장만 반환 (비용 절감 및 성능 최적화)
    if (data.photos && data.photos.length > 0) {
      data.photos = [data.photos[0]]
    }

    console.log('✅ [Google Places Details Response]')
    console.log('Place:', {
      id: data.id,
      name: data.displayName?.text,
      address: data.formattedAddress,
      rating: data.rating,
      reviewCount: data.userRatingCount,
      photosCount: data.photos?.length || 0,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 클라이언트에 응답 반환
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    })
  } catch (error) {
    console.error('❌ [Place Details API Error]', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
