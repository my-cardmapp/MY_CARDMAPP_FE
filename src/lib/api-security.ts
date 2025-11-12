import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route 보안을 위한 유틸리티 함수
 */

/**
 * 허용된 Origin 목록을 반환
 */
function getAllowedOrigins(): string[] {
  const allowedOrigins = [
    'http://localhost:3000', // 로컬 개발 환경
    'https://my-cardmapp-fe.vercel.app', // 배포 환경
  ]

  return allowedOrigins
}

/**
 * Origin 검증
 *
 * @param request - NextRequest 객체
 * @returns origin이 허용되면 true, 아니면 false
 */
export function isOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const allowedOrigins = getAllowedOrigins()

  // Origin 헤더가 있는 경우
  if (origin) {
    return allowedOrigins.includes(origin)
  }

  // Origin이 없지만 Referer가 있는 경우 (일부 브라우저/상황)
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      return allowedOrigins.includes(refererOrigin)
    } catch {
      return false
    }
  }

  // 서버 사이드 렌더링이나 API 테스트 등의 경우 허용
  // (Origin과 Referer가 모두 없는 경우)
  return false
}

/**
 * Origin 검증 실패 시 반환할 응답
 */
export function createForbiddenResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'Forbidden',
      message: 'This API endpoint can only be accessed from authorized origins'
    },
    { status: 403 }
  )
}

/**
 * Origin 검증 미들웨어 래퍼
 *
 * @param handler - 실제 API 핸들러 함수
 * @returns 보호된 핸들러 함수
 */
export function withOriginCheck(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!isOriginAllowed(request)) {
      console.warn('🚫 [Forbidden] Unauthorized origin:', {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        url: request.url,
      })
      return createForbiddenResponse()
    }

    return handler(request)
  }
}
