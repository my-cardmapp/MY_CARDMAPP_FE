import { http, HttpResponse, delay } from 'msw';
import { generateMerchants } from '../generators/merchants';
import { 
  applyNetworkConditions, 
  createNetworkDelay,
  isErrorTrigger,
  getErrorResponse,
  NetworkErrorType 
} from '../utils/network';
import type { 
  Merchant, 
  MerchantListResponse, 
  MerchantDetailResponse,
  NearbyMerchantsResponse,
  MerchantSearchResponse,
  MerchantWithDistance,
  Review
} from '@/types/api';

// 한국 가맹점 데이터 생성 (캐싱)
let cachedMerchants: Merchant[] | null = null;

function getMerchants(): Merchant[] {
  if (!cachedMerchants) {
    cachedMerchants = generateMerchants(100);
  }
  return cachedMerchants;
}

// Haversine 거리 계산 (미터 단위)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 초성 추출 함수
function getInitialConsonants(str: string): string {
  const initialConsonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  let result = '';
  
  for (const char of str) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) { // 한글 범위
      const unicode = code - 0xAC00;
      const initialIndex = Math.floor(unicode / 588);
      result += initialConsonants[initialIndex];
    }
  }
  
  return result;
}

// 초성 검색 매칭
function matchesInitialConsonants(text: string, query: string): boolean {
  const textInitials = getInitialConsonants(text);
  return textInitials.includes(query);
}

// 리뷰 생성
function generateReviews(merchantId: number): Review[] {
  const reviewCount = Math.floor(Math.random() * 5) + 1;
  const reviews: Review[] = [];
  
  const reviewTexts = [
    '아동급식카드 사용 가능해서 좋아요!',
    '친절하고 음식도 맛있어요',
    '가격대비 양이 많아요',
    '자주 이용하는 곳입니다',
    '카드 결제가 편리해요',
    '위치가 좋아서 접근성이 좋습니다',
    '메뉴가 다양해요',
    '청결하고 깔끔합니다'
  ];
  
  for (let i = 0; i < reviewCount; i++) {
    reviews.push({
      id: merchantId * 100 + i,
      userId: Math.floor(Math.random() * 1000) + 1,
      userName: `사용자${Math.floor(Math.random() * 1000)}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5점
      comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      images: Math.random() > 0.7 ? [`/images/review-${i}.jpg`] : undefined
    });
  }
  
  return reviews;
}

export const merchantHandlers = [
  // GET /api/v1/merchants/nearby - 근처 가맹점 조회 (더 구체적인 경로를 먼저)
  http.get('*/api/v1/merchants/nearby', async ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '37.5665');
    const lng = parseFloat(url.searchParams.get('lng') || '126.9780');
    const radius = parseInt(url.searchParams.get('radius') || '500');
    const cardTypes = url.searchParams.get('cardTypes')?.split(',') || [];
    const categories = url.searchParams.get('categories')?.split(',') || [];
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Apply network conditions
    const error = await applyNetworkConditions('GET', request.url);
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    
    let merchants = getMerchants();
    
    // 카드 타입 필터링
    if (cardTypes.length > 0) {
      merchants = merchants.filter(m => 
        m.cards.some(c => cardTypes.includes(c.code))
      );
    }
    
    // 카테고리 필터링
    if (categories.length > 0) {
      merchants = merchants.filter(m => 
        categories.includes(m.category.code)
      );
    }
    
    // 거리 계산 및 필터링
    const nearbyMerchants: MerchantWithDistance[] = merchants
      .map(merchant => {
        const distance = calculateDistance(
          lat, lng,
          merchant.location.lat, merchant.location.lng
        );
        const walkingTime = Math.ceil(distance / 66.67); // 4km/h = 66.67m/min
        
        return {
          ...merchant,
          distance,
          walkingTime
        };
      })
      .filter(m => m.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    const response: NearbyMerchantsResponse = {
      merchants: nearbyMerchants,
      center: { lat, lng },
      radius
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants/search - 가맹점 검색 (더 구체적인 경로)
  http.get('*/api/v1/merchants/search', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const cardTypes = url.searchParams.get('cardTypes')?.split(',') || [];
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    
    // Check for error trigger
    if (isErrorTrigger('search', query)) {
      await createNetworkDelay(200);
      const error = getErrorResponse(NetworkErrorType.SERVER_ERROR, request.url);
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Apply network conditions
    const error = await applyNetworkConditions('GET', request.url, { query });
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    
    let merchants = getMerchants();
    
    // 텍스트 검색
    if (query) {
      // 초성 검색 확인
      const isInitialConsonant = /^[ㄱ-ㅎ]+$/.test(query);
      
      merchants = merchants.filter(m => {
        if (isInitialConsonant) {
          return matchesInitialConsonants(m.name, query);
        } else {
          const lowerQuery = query.toLowerCase();
          return m.name.toLowerCase().includes(lowerQuery) ||
                 m.address.toLowerCase().includes(lowerQuery) ||
                 m.category.name.toLowerCase().includes(lowerQuery);
        }
      });
    }
    
    // 카드 타입 필터링
    if (cardTypes.length > 0) {
      merchants = merchants.filter(m => 
        m.cards.some(c => cardTypes.includes(c.code))
      );
    }
    
    // 검색 제안 생성
    const suggestions: string[] = [];
    if (query) {
      if (query.includes('편의')) {
        suggestions.push('편의점', '편의시설', 'CU 편의점', 'GS25 편의점');
      } else if (query.includes('김밥')) {
        suggestions.push('김밥천국', '김밥나라', '김밥집');
      } else if (query.includes('치킨')) {
        suggestions.push('BBQ 치킨', '교촌치킨', '네네치킨', '굽네치킨');
      } else if (query.includes('커피')) {
        suggestions.push('스타벅스', '투썸플레이스', '이디야커피', '메가커피');
      }
    }
    
    // 페이징
    const totalElements = merchants.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const content = merchants.slice(start, end);
    
    const response: MerchantSearchResponse = {
      content,
      query,
      suggestions,
      pageable: {
        page,
        size,
        sort: []
      },
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants - 가맹점 목록 조회 (페이징, 필터링, 정렬)
  http.get('*/api/v1/merchants', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const cardTypes = url.searchParams.get('cardTypes')?.split(',') || [];
    const categories = url.searchParams.get('categories')?.split(',') || [];
    const sort = url.searchParams.get('sort')?.split(',') || [];
    
    // Apply network conditions
    const error = await applyNetworkConditions('GET', request.url);
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    
    let merchants = getMerchants();
    
    // 카드 타입 필터링
    if (cardTypes.length > 0) {
      merchants = merchants.filter(m => 
        m.cards.some(c => cardTypes.includes(c.code))
      );
    }
    
    // 카테고리 필터링
    if (categories.length > 0) {
      merchants = merchants.filter(m => 
        categories.includes(m.category.code)
      );
    }
    
    // 정렬
    if (sort.length >= 1) {
      const [field, direction = 'asc'] = sort;
      merchants.sort((a, b) => {
        let aVal: any = a[field as keyof Merchant];
        let bVal: any = b[field as keyof Merchant];
        
        if (field === 'name' || field === 'address') {
          aVal = aVal || '';
          bVal = bVal || '';
        }
        
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    // 페이징
    const totalElements = merchants.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const content = merchants.slice(start, end);
    
    const response: MerchantListResponse = {
      content,
      pageable: {
        page,
        size,
        sort: sort
      },
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants/:id - 가맹점 상세 조회
  http.get('*/api/v1/merchants/:id', async ({ params, request }) => {
    const merchantId = Number(params.id);
    
    // 404 에러 시뮬레이션
    if (isErrorTrigger('merchant', merchantId)) {
      await createNetworkDelay(100);
      const error = getErrorResponse(NetworkErrorType.NOT_FOUND, request.url);
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Apply network conditions
    const error = await applyNetworkConditions('GET', request.url);
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    
    const merchants = getMerchants();
    const merchant = merchants.find(m => m.id === merchantId) || merchants[0];
    
    const reviews = generateReviews(merchantId);
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const response: MerchantDetailResponse = {
      ...merchant,
      id: merchantId,
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
      businessHours: {
        mon: ['09:00', '22:00'],
        tue: ['09:00', '22:00'],
        wed: ['09:00', '22:00'],
        thu: ['09:00', '22:00'],
        fri: ['09:00', '23:00'],
        sat: ['10:00', '23:00'],
        sun: ['10:00', '21:00']
      }
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  })
];