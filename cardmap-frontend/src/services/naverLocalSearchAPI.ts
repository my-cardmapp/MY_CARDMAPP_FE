/**
 * Naver Local Search API Service
 * 네이버 지역 검색 API를 사용하여 POI 데이터 조회
 *
 * API 문서: https://developers.naver.com/docs/serviceapi/search/local/local.md
 */

import type { Merchant, Category } from '@/types'

// Naver Local Search API 응답 타입
export interface NaverLocalSearchItem {
  title: string          // 장소명 (HTML 태그 포함 가능)
  link: string           // 네이버 지역 정보 URL
  category: string       // 카테고리 (예: "음식점>한식")
  description: string    // 설명
  telephone: string      // 전화번호
  address: string        // 지번 주소
  roadAddress: string    // 도로명 주소
  mapx: string          // X 좌표 (네이버 좌표계)
  mapy: string          // Y 좌표 (네이버 좌표계)
}

export interface NaverLocalSearchResponse {
  lastBuildDate: string  // 검색 결과 생성 시간
  total: number          // 총 검색 결과 수
  start: number          // 검색 시작 위치
  display: number        // 한 번에 표시할 검색 결과 수
  items: NaverLocalSearchItem[]
}

export interface SearchOptions {
  display?: number       // 검색 결과 출력 건수 (기본값: 10, 최대: 5)
  start?: number         // 검색 시작 위치 (기본값: 1, 최대: 100)
  sort?: 'random' | 'comment'  // 정렬 옵션
}

export interface CoordinateSearchOptions extends SearchOptions {
  radius?: number        // 검색 반경 (미터)
}

// API 설정
const NAVER_LOCAL_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json'
const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || ''
const CLIENT_SECRET = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET || ''

/**
 * 네이버 좌표계를 WGS84 (위도/경도)로 변환
 * 네이버 API는 KATEC 좌표계를 10^7 배한 값을 반환
 */
function convertNaverCoordinates(mapx: string, mapy: string): { lat: number; lng: number } {
  // 네이버 좌표계 (KATEC) -> WGS84 변환
  // 간단한 변환: mapx/mapy는 이미 WGS84에 가까운 값을 10^7 배한 형태
  const lng = Number(mapx) / 10000000
  const lat = Number(mapy) / 10000000

  return { lat, lng }
}

/**
 * HTML 태그 제거 및 디코딩
 */
function sanitizeTitle(title: string): string {
  return title
    .replace(/<\/?b>/g, '')  // <b> 태그 제거
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

/**
 * 카테고리 문자열을 Category 객체로 변환
 */
function parseCategory(categoryStr: string): Category {
  const parts = categoryStr.split('>')
  const mainCategory = parts[0] || '기타'
  const subCategory = parts[1] || ''

  return {
    id: Math.floor(Math.random() * 1000000), // 임시 ID
    code: mainCategory.replace(/\s/g, '_').toUpperCase(),
    name: subCategory || mainCategory,
    icon: getCategoryIcon(mainCategory)
  }
}

/**
 * 카테고리에 따른 아이콘 반환
 */
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    '음식점': '🍽️',
    '카페': '☕',
    '편의점': '🏪',
    '병원': '🏥',
    '약국': '💊',
    '학교': '🏫',
    '서점': '📚',
    '마트': '🛒',
  }

  return iconMap[category] || '📍'
}

/**
 * Naver API 응답 아이템을 Merchant 타입으로 변환
 */
function convertToMerchant(item: NaverLocalSearchItem, index: number): Merchant {
  const { lat, lng } = convertNaverCoordinates(item.mapx, item.mapy)

  return {
    id: Math.floor(Math.random() * 1000000000), // 임시 ID (실제로는 서버에서 할당)
    name: sanitizeTitle(item.title),
    address: item.roadAddress || item.address,
    location: {
      lat,
      lng,
      address: item.roadAddress || item.address,
      name: sanitizeTitle(item.title)
    },
    cards: [], // POI 데이터에는 카드 정보가 없으므로 빈 배열
    category: parseCategory(item.category),
    phone: item.telephone || undefined,
    isVerified: false, // POI 데이터는 미검증
    businessHours: undefined, // POI 데이터에는 영업시간 정보가 없음
  }
}

/**
 * Naver Local Search API
 */
export const naverLocalSearchAPI = {
  /**
   * 키워드로 장소 검색
   */
  async searchByQuery(
    query: string,
    options: SearchOptions = {}
  ): Promise<NaverLocalSearchResponse> {
    const { display = 10, start = 1, sort } = options

    const params = new URLSearchParams({
      query,
      display: display.toString(),
      start: start.toString(),
    })

    if (sort) {
      params.append('sort', sort)
    }

    const response = await fetch(`${NAVER_LOCAL_SEARCH_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
      },
    })

    if (!response.ok) {
      throw new Error(`Naver API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * 좌표 기반으로 근처 장소 검색
   * 네이버 API는 좌표 기반 검색을 직접 지원하지 않으므로,
   * 해당 좌표의 주소를 먼저 조회한 후 검색
   */
  async searchByCoordinates(
    lat: number,
    lng: number,
    options: CoordinateSearchOptions = {}
  ): Promise<NaverLocalSearchResponse> {
    // 실제 구현에서는 Reverse Geocoding API를 먼저 호출하여 주소를 얻어야 함
    // 여기서는 임시로 빈 결과 반환
    // TODO: Reverse Geocoding API 연동

    return {
      lastBuildDate: new Date().toISOString(),
      total: 0,
      start: 1,
      display: options.display || 10,
      items: []
    }
  },

  /**
   * Naver API 응답을 Merchant 배열로 변환
   */
  convertToMerchants(response: NaverLocalSearchResponse): Merchant[] {
    return response.items.map((item, index) => convertToMerchant(item, index))
  },

  /**
   * 단일 아이템을 Merchant로 변환 (테스트용)
   */
  convertToMerchant,

  /**
   * 네이버 좌표계를 WGS84로 변환 (테스트용)
   */
  convertNaverCoordinates,
}
