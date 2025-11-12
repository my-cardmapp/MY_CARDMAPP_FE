import { NextRequest, NextResponse } from 'next/server'
import type {
  GooglePlacesTextSearchRequest,
  GooglePlacesTextSearchResponse,
  GooglePlacesErrorResponse,
} from '@/types/googlePlaces'
import { isOriginAllowed, createForbiddenResponse } from '@/lib/api-security'

/**
 * Google Places API (New) - Text Search
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */

const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText'
const API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * POST /api/google/places/text-search
 *
 * Google Places Text Search API 프록시 엔드포인트
 * 클라이언트에서 직접 API를 호출하지 않고 백엔드를 통해 프록시합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // Origin 검증
    if (!isOriginAllowed(request)) {
      return createForbiddenResponse()
    }

    // API 키 검증
    if (!API_KEY) {
      console.error('❌ Google Places API Key is not configured')
      return NextResponse.json(
        { error: 'Google Places API is not configured' },
        { status: 500 }
      )
    }

    // 요청 바디 파싱
    const body: GooglePlacesTextSearchRequest = await request.json()
    const { textQuery, languageCode = 'ko', pageSize = 10, locationBias, includedType } = body

    // 필수 파라미터 검증
    if (!textQuery || textQuery.trim().length === 0) {
      return NextResponse.json(
        { error: 'textQuery is required' },
        { status: 400 }
      )
    }

    // 필드 마스크 정의 (요청할 데이터 필드 지정)
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.types',
    ].join(',')

    // Google Places API 요청 바디 생성
    const requestBody: Record<string, unknown> = {
      textQuery,
      languageCode,
      pageSize,
    }

    // 선택적 파라미터 추가
    if (locationBias) {
      requestBody.locationBias = locationBias
    }
    if (includedType) {
      requestBody.includedType = includedType
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 [Google Places Text Search Request]')
    console.log('Query:', textQuery)
    console.log('Language:', languageCode)
    console.log('Page Size:', pageSize)
    if (locationBias) {
      console.log('Location Bias:', locationBias)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Google Places API 호출
    const response = await fetch(GOOGLE_PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
      // Next.js 캐싱 설정: 24시간 동안 캐시
      next: {
        revalidate: 86400, // 24시간 (초 단위)
      },
    })

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
    const data: GooglePlacesTextSearchResponse = await response.json()

    console.log('✅ [Google Places Text Search Response]')
    console.log('Total results:', data.places?.length || 0)
    if (data.places && data.places.length > 0) {
      console.log('First result:', {
        id: data.places[0].id,
        name: data.places[0].displayName?.text,
        address: data.places[0].formattedAddress,
      })
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 클라이언트에 응답 반환
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
      },
    })
  } catch (error) {
    console.error('❌ [Text Search API Error]', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
