import { http, HttpResponse } from 'msw';
import { generateMerchants } from '../generators/merchants';
import type {
  CardDetail,
  CardListResponse,
  CardDetailResponse,
  Category,
  Merchant
} from '@/types/api';

// 한국 복지카드 정의
const KOREAN_CARDS: CardDetail[] = [
  {
    id: 1,
    code: 'CHILD_MEAL',
    name: '아동급식카드',
    colorHex: '#FFB800',
    iconUrl: '/icons/child-meal-card.svg',
    description: '결식 우려가 있는 아동에게 급식을 지원하는 카드입니다.',
    benefits: [
      '1일 1만원 한도 내 자유롭게 사용',
      '편의점, 음식점 등에서 사용 가능',
      '주말 및 공휴일에도 사용 가능',
      '미사용 금액 이월 불가'
    ],
    restrictions: [
      '1일 사용 한도: 10,000원',
      '주류, 담배 구매 불가',
      '현금 인출 불가',
      '온라인 결제 불가',
      '사용 시간 제한 없음'
    ],
    issuer: '보건복지부',
    merchantCount: 15234,
    popularCategories: [
      { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
      { id: 2, code: 'CONVENIENCE', name: '편의점', icon: '🏪' },
      { id: 3, code: 'CAFE', name: '카페', icon: '☕' }
    ]
  },
  {
    id: 2,
    code: 'CULTURE_NURI',
    name: '문화누리카드',
    colorHex: '#00A651',
    iconUrl: '/icons/culture-nuri-card.svg',
    description: '문화 소외계층의 문화예술, 국내여행, 체육활동을 지원하는 카드입니다.',
    benefits: [
      '연간 11만원 지원',
      '문화예술, 국내여행, 체육활동 이용',
      '온라인 및 오프라인 사용 가능',
      '잔액 자동 이월 (최대 2년)'
    ],
    restrictions: [
      '연간 사용 한도: 110,000원',
      '유흥업소 사용 불가',
      '현금 인출 불가',
      '해외 사용 불가',
      '지원금 소진 시까지 사용 가능'
    ],
    issuer: '문화체육관광부',
    merchantCount: 8956,
    popularCategories: [
      { id: 4, code: 'BOOKSTORE', name: '서점', icon: '📚' },
      { id: 5, code: 'CULTURE', name: '문화시설', icon: '🎭' },
      { id: 6, code: 'TRAVEL', name: '여행', icon: '✈️' }
    ]
  },
  {
    id: 3,
    code: 'LOCAL_LOVE',
    name: '지역사랑상품권',
    colorHex: '#FF6B6B',
    iconUrl: '/icons/local-love-card.svg',
    description: '지역 경제 활성화를 위한 지역화폐입니다.',
    benefits: [
      '구매 시 10% 할인',
      '소득공제 30% (연 최대 100만원)',
      '지역 내 가맹점에서 사용',
      '모바일 및 카드형 선택 가능'
    ],
    restrictions: [
      '월 구매 한도: 50만원',
      '대형마트, 백화점 사용 불가',
      '온라인 쇼핑몰 사용 불가',
      '타 지역 사용 불가',
      '유흥업소 사용 불가'
    ],
    issuer: '행정안전부',
    merchantCount: 23567,
    popularCategories: [
      { id: 7, code: 'MARKET', name: '전통시장', icon: '🏪' },
      { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
      { id: 8, code: 'PHARMACY', name: '약국', icon: '💊' }
    ]
  },
  {
    id: 4,
    code: 'SENIOR_WELFARE',
    name: '어르신 복지카드',
    colorHex: '#9B59B6',
    iconUrl: '/icons/senior-welfare-card.svg',
    description: '65세 이상 어르신을 위한 복지 지원 카드입니다.',
    benefits: [
      '대중교통 무료 이용',
      '문화시설 할인',
      '의료비 지원',
      '복지관 프로그램 이용'
    ],
    restrictions: [
      '만 65세 이상만 발급 가능',
      '본인만 사용 가능',
      '타인 양도 불가',
      '분실 시 재발급 수수료 발생'
    ],
    issuer: '보건복지부',
    merchantCount: 5678,
    popularCategories: [
      { id: 9, code: 'HOSPITAL', name: '병원', icon: '🏥' },
      { id: 8, code: 'PHARMACY', name: '약국', icon: '💊' },
      { id: 5, code: 'CULTURE', name: '문화시설', icon: '🎭' }
    ]
  }
];

// 카테고리별 가맹점 수 계산
function calculateMerchantsByCategory(cardCode: string): { [key: string]: number } {
  const merchants = generateMerchants(100);
  const stats: { [key: string]: number } = {};
  
  merchants.forEach(merchant => {
    if (merchant.cards.some(c => c.code === cardCode)) {
      const categoryCode = merchant.category.code;
      stats[categoryCode] = (stats[categoryCode] || 0) + 1;
    }
  });
  
  return stats;
}

// 최근 가맹점 가져오기
function getRecentMerchants(cardCode: string, limit: number = 10): Merchant[] {
  const merchants = generateMerchants(50);
  return merchants
    .filter(m => m.cards.some(c => c.code === cardCode))
    .slice(0, limit)
    .map(m => ({
      ...m,
      // 최근 추가된 것처럼 보이게 수정
      isVerified: true
    }));
}

export const cardHandlers = [
  // GET /api/v1/cards - 카드 목록 조회
  http.get('*/api/v1/cards', () => {
    const response: CardListResponse = {
      cards: KOREAN_CARDS
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/cards/:code - 카드 상세 조회
  http.get('*/api/v1/cards/:code', ({ params }) => {
    const { code } = params;
    const card = KOREAN_CARDS.find(c => c.code === code);
    
    if (!card) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 404,
          error: 'Not Found',
          message: `Card with code ${code} not found`,
          path: `/api/v1/cards/${code}`
        },
        { status: 404 }
      );
    }
    
    const recentMerchants = getRecentMerchants(card.code, 10);
    const merchantsByCategory = calculateMerchantsByCategory(card.code);
    const totalMerchants = Object.values(merchantsByCategory).reduce((sum, count) => sum + count, 0);
    
    const response: CardDetailResponse = {
      ...card,
      recentMerchants,
      statistics: {
        totalMerchants,
        merchantsByCategory
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