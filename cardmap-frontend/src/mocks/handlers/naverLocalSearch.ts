import { http, HttpResponse } from 'msw'
import type { NaverLocalSearchResponse, NaverLocalSearchItem } from '@/services/naverLocalSearchAPI'

// Mock POI 데이터
const MOCK_POI_DATA: NaverLocalSearchItem[] = [
  {
    title: '스타벅스 강남점',
    link: 'https://search.naver.com/...',
    category: '음식점>카페',
    description: '커피 전문점',
    telephone: '02-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    mapx: '1270000000',  // 127.0 * 10^7
    mapy: '375000000'    // 37.5 * 10^7
  },
  {
    title: '김밥천국 역삼점',
    link: 'https://search.naver.com/...',
    category: '음식점>한식',
    description: '한식 김밥 전문점',
    telephone: '02-2345-6789',
    address: '서울특별시 강남구 역삼동 456',
    roadAddress: '서울특별시 강남구 테헤란로 456',
    mapx: '1270050000',
    mapy: '375050000'
  },
  {
    title: 'CU 편의점 선릉점',
    link: 'https://search.naver.com/...',
    category: '편의점',
    description: '24시간 편의점',
    telephone: '02-3456-7890',
    address: '서울특별시 강남구 선릉로 789',
    roadAddress: '서울특별시 강남구 선릉로 789',
    mapx: '1270100000',
    mapy: '375100000'
  },
  {
    title: '맘스터치 역삼점',
    link: 'https://search.naver.com/...',
    category: '음식점>패스트푸드',
    description: '햄버거 전문점',
    telephone: '02-4567-8901',
    address: '서울특별시 강남구 역삼동 321',
    roadAddress: '서울특별시 강남구 강남대로 321',
    mapx: '1270080000',
    mapy: '375080000'
  },
  {
    title: '올리브영 강남점',
    link: 'https://search.naver.com/...',
    category: '쇼핑>화장품',
    description: '뷰티 전문점',
    telephone: '02-5678-9012',
    address: '서울특별시 강남구 강남대로 654',
    roadAddress: '서울특별시 강남구 강남대로 654',
    mapx: '1270120000',
    mapy: '375120000'
  }
]

export const naverLocalSearchHandlers = [
  // GET Naver Local Search API
  http.get('https://openapi.naver.com/v1/search/local.json', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query') || ''
    const display = parseInt(url.searchParams.get('display') || '10')
    const start = parseInt(url.searchParams.get('start') || '1')
    const sort = url.searchParams.get('sort') || 'random'

    // 검색어로 필터링
    let filteredItems = MOCK_POI_DATA.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.address.toLowerCase().includes(query.toLowerCase())
    )

    // 정렬
    if (sort === 'random') {
      filteredItems = filteredItems.sort(() => Math.random() - 0.5)
    }

    // 페이지네이션
    const total = filteredItems.length
    const startIndex = start - 1
    const endIndex = startIndex + display
    const items = filteredItems.slice(startIndex, endIndex)

    const response: NaverLocalSearchResponse = {
      lastBuildDate: new Date().toISOString(),
      total,
      start,
      display,
      items
    }

    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  })
]
