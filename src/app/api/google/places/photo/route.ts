import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Places API (New) - Photo
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY

/**
 * GET /api/google/places/photo?name={photoName}&maxWidth={maxWidth}
 *
 * Google Places Photo API 프록시 엔드포인트
 * 사진을 서버에서 가져와 클라이언트에 전달합니다.
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
    const photoName = searchParams.get('name')
    const maxWidth = searchParams.get('maxWidth') || '800'

    // 필수 파라미터 검증
    if (!photoName) {
      return NextResponse.json(
        { error: 'name parameter is required' },
        { status: 400 }
      )
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📸 [Google Places Photo Request]')
    console.log('Photo Name:', photoName)
    console.log('Max Width:', maxWidth)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Google Places Photo API 호출
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`

    const response = await fetch(photoUrl, {
      method: 'GET',
      // Next.js 캐싱 설정: 7일 동안 캐시 (사진은 거의 변경되지 않음)
      next: {
        revalidate: 604800, // 7일 (초 단위)
      },
    })

    // 에러 응답 처리
    if (!response.ok) {
      console.error('❌ [Google Places Photo API Error]', response.status)
      return NextResponse.json(
        { error: `Photo request failed (${response.status})` },
        { status: response.status }
      )
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('✅ [Photo Retrieved]')
    console.log('Content-Type:', contentType)
    console.log('Size:', imageBuffer.byteLength, 'bytes')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 이미지를 클라이언트에 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=1209600', // 7일 캐시, 14일 stale
      },
    })
  } catch (error) {
    console.error('❌ [Photo API Error]', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
