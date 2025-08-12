import { faker } from '@faker-js/faker';
import type { Merchant, Card, Category } from '@/types';

// 한국 비즈니스 이름 패턴
export const BUSINESS_NAME_PATTERNS = {
  RESTAURANT: [
    '김밥천국', '김가네', '명동칼국수', '육대장', '본죽', '죽이야기',
    '한솥도시락', '토마토도시락', '매머드커피', '백종원의 원조쌈밥집',
    '놀부부대찌개', '신선설농탕', '순대국밥', '감자탕', '해장국',
    '돈까스클럽', '경양카츠', '미소야', '스시로', '역전우동',
    '맘스터치', '롯데리아', '버거킹', 'KFC', '맥도날드',
    '이디야커피', '메가커피', '컴포즈커피', '빽다방', '커피베이'
  ],
  CONVENIENCE: [
    'GS25', 'CU', '세븐일레븐', '이마트24', '미니스톱',
    'GS25 ', 'CU ', '세븐일레븐 ', '이마트24 ', // 지점명 추가용
  ],
  CAFE: [
    '스타벅스', '투썸플레이스', '이디야커피', '메가커피', '컴포즈커피',
    '빽다방', '커피베이', '할리스', '탐앤탐스', '커피빈',
    '파스쿠찌', '드롭탑', '폴바셋', '블루보틀', '앤젤리너스',
    '더벤티', '요거프레소', '커피나무', '만랩커피', '커피명가'
  ],
  BOOKSTORE: [
    '교보문고', '영풍문고', '알라딘', '예스24', '반디앤루니스',
    '종로서적', '대교문고', '서울문고', '한양문고', '을지서적'
  ],
  CULTURE: [
    'CGV', '롯데시네마', '메가박스', '아트하우스모모', 'KU시네마테크',
    '국립극장', '예술의전당', '세종문화회관', '블루스퀘어', '대학로극장'
  ],
  PHARMACY: [
    '온누리약국', '365약국', '우리약국', '행복한약국', '건강약국',
    '서울약국', '중앙약국', '한빛약국', '새봄약국', '미래약국'
  ],
  MARKET: [
    '이마트', '홈플러스', '롯데마트', '코스트코', '트레이더스',
    '농협하나로마트', 'GS더프레시', '킴스클럽', '메가마트', 'VIC마켓'
  ]
};

// 한국 지역구
export const KOREAN_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구'
];

// 한국 동 이름
const KOREAN_DONG = [
  '역삼동', '삼성동', '청담동', '논현동', '신사동',
  '압구정동', '대치동', '도곡동', '개포동', '일원동',
  '수서동', '세곡동', '신촌동', '홍대', '이태원동',
  '한남동', '성수동', '왕십리', '건대입구', '강남역',
  '선릉', '삼성역', '을지로', '명동', '종로',
  '광화문', '시청', '충무로', '동대문', '신림동'
];

// 한국 도로명
const KOREAN_ROAD = [
  '테헤란로', '강남대로', '봉은사로', '논현로', '언주로',
  '삼성로', '영동대로', '도산대로', '압구정로', '남부순환로',
  '올림픽대로', '한강대로', '서초대로', '반포대로', '사평대로',
  '양재대로', '송파대로', '위례대로', '천호대로', '광진로'
];

// 카테고리 정의
export const CATEGORY_NAMES: Record<string, string> = {
  RESTAURANT: '음식점',
  CONVENIENCE: '편의점',
  CAFE: '카페',
  BOOKSTORE: '서점',
  CULTURE: '문화시설',
  PHARMACY: '약국',
  MARKET: '마트'
};

// 카드 타입 정의
const CARD_TYPES: Card[] = [
  { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FFB800' },
  { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#00A651' },
  { id: 3, code: 'LOCAL_LOVE', name: '지역사랑상품권', colorHex: '#FF6B6B' }
];

// 한국 비즈니스 이름 생성
export function generateKoreanBusinessName(category: string): string {
  const patterns = BUSINESS_NAME_PATTERNS[category as keyof typeof BUSINESS_NAME_PATTERNS] 
    || BUSINESS_NAME_PATTERNS.RESTAURANT;
  
  const baseName = faker.helpers.arrayElement(patterns);
  
  // 편의점과 카페는 지점명 추가
  if (category === 'CONVENIENCE' || category === 'CAFE') {
    const dongName = faker.helpers.arrayElement(KOREAN_DONG);
    const suffix = faker.helpers.arrayElement(['점', '']);
    return `${baseName}${dongName}${suffix}`.trim();
  }
  
  // 기타 업종은 간혹 지점 번호 추가
  if (faker.datatype.boolean({ probability: 0.3 })) {
    const branchNumber = faker.number.int({ min: 1, max: 10 });
    return `${baseName} ${branchNumber}호점`;
  }
  
  return baseName;
}

// 한국 주소 생성
export function generateKoreanAddress(): string {
  const city = faker.helpers.arrayElement(['서울특별시', '경기도 성남시', '경기도 수원시', '인천광역시']);
  const district = faker.helpers.arrayElement(KOREAN_DISTRICTS);
  const dong = faker.helpers.arrayElement(KOREAN_DONG);
  const road = faker.helpers.arrayElement(KOREAN_ROAD);
  const buildingNumber = faker.number.int({ min: 1, max: 500 });
  
  return `${city} ${district} ${dong} ${road} ${buildingNumber}`;
}

// 한국 전화번호 생성
export function generateKoreanPhoneNumber(): string {
  const isMobile = faker.datatype.boolean({ probability: 0.6 });
  
  if (isMobile) {
    // 휴대폰 번호
    const prefix = '010';
    const middle = faker.number.int({ min: 1000, max: 9999 });
    const last = faker.number.int({ min: 1000, max: 9999 });
    return `${prefix}-${middle}-${last}`;
  } else {
    // 지역 전화번호
    const areaCodes = ['02', '031', '032', '033', '041', '042', '043', 
                      '051', '052', '053', '054', '055', '061', '062', 
                      '063', '064'];
    const areaCode = faker.helpers.arrayElement(areaCodes);
    
    if (areaCode === '02') {
      // 서울은 번호가 다름
      const middle = faker.number.int({ min: 100, max: 9999 });
      const last = faker.number.int({ min: 1000, max: 9999 });
      return `${areaCode}-${middle}-${last}`;
    } else {
      const middle = faker.number.int({ min: 100, max: 999 });
      const last = faker.number.int({ min: 1000, max: 9999 });
      return `${areaCode}-${middle}-${last}`;
    }
  }
}

// 영업시간 생성
export function generateBusinessHours(category: string): Record<string, any> {
  // 편의점은 24시간 영업 가능성 높음
  if (category === 'CONVENIENCE' && faker.datatype.boolean({ probability: 0.7 })) {
    return { '24/7': true };
  }
  
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const hours: Record<string, string[]> = {};
  
  // 평일 영업시간
  const weekdayOpen = faker.helpers.arrayElement(['07:00', '08:00', '09:00', '10:00', '11:00']);
  const weekdayClose = faker.helpers.arrayElement(['20:00', '21:00', '22:00', '23:00']);
  
  // 주말 영업시간 (조금 다를 수 있음)
  const weekendOpen = faker.helpers.arrayElement(['09:00', '10:00', '11:00']);
  const weekendClose = faker.helpers.arrayElement(['20:00', '21:00', '22:00']);
  
  days.forEach(day => {
    // 일부 요일은 휴무
    if (faker.datatype.boolean({ probability: 0.9 })) {
      if (day === 'sat' || day === 'sun') {
        hours[day] = [weekendOpen, weekendClose];
      } else {
        hours[day] = [weekdayOpen, weekdayClose];
      }
    }
  });
  
  return hours;
}

// 카테고리별 카드 할당
function assignCardsByCategory(category: string): Card[] {
  const cards: Card[] = [];
  
  switch (category) {
    case 'RESTAURANT':
    case 'CONVENIENCE':
      // 음식점과 편의점은 아동급식카드 높은 확률
      if (faker.datatype.boolean({ probability: 0.8 })) {
        cards.push(CARD_TYPES[0]); // CHILD_MEAL
      }
      if (faker.datatype.boolean({ probability: 0.3 })) {
        cards.push(CARD_TYPES[2]); // LOCAL_LOVE
      }
      break;
      
    case 'BOOKSTORE':
    case 'CULTURE':
      // 서점과 문화시설은 문화누리카드
      if (faker.datatype.boolean({ probability: 0.9 })) {
        cards.push(CARD_TYPES[1]); // CULTURE_NURI
      }
      break;
      
    case 'CAFE':
      // 카페는 낮은 확률로 아동급식카드
      if (faker.datatype.boolean({ probability: 0.2 })) {
        cards.push(CARD_TYPES[0]); // CHILD_MEAL
      }
      if (faker.datatype.boolean({ probability: 0.4 })) {
        cards.push(CARD_TYPES[2]); // LOCAL_LOVE
      }
      break;
      
    case 'MARKET':
    case 'PHARMACY':
      // 마트와 약국은 지역사랑상품권
      if (faker.datatype.boolean({ probability: 0.7 })) {
        cards.push(CARD_TYPES[2]); // LOCAL_LOVE
      }
      break;
      
    default:
      // 기본적으로 무작위 할당
      if (faker.datatype.boolean({ probability: 0.5 })) {
        cards.push(faker.helpers.arrayElement(CARD_TYPES));
      }
  }
  
  return cards;
}

// 단일 가맹점 생성
export function generateMerchant(id: number): Merchant {
  const categories = Object.keys(CATEGORY_NAMES);
  const categoryCode = faker.helpers.arrayElement(categories);
  const categoryName = CATEGORY_NAMES[categoryCode];
  
  // 한국 좌표 범위 (대략적인 범위)
  // 위도: 33.0 ~ 38.6 (제주도 ~ 북한 접경)
  // 경도: 124.6 ~ 131.9 (서해 ~ 동해)
  // 서울 중심부 근처로 집중
  const baseLat = 37.5665; // 서울 시청
  const baseLng = 126.9780;
  
  // 서울 및 수도권 범위 내에서 랜덤 생성 (약 50km 반경)
  const lat = baseLat + (faker.number.float({ min: -0.5, max: 0.5 }));
  const lng = baseLng + (faker.number.float({ min: -0.5, max: 0.5 }));
  
  return {
    id,
    name: generateKoreanBusinessName(categoryCode),
    address: generateKoreanAddress(),
    location: { lat, lng },
    cards: assignCardsByCategory(categoryCode),
    category: {
      id: categories.indexOf(categoryCode) + 1,
      code: categoryCode,
      name: categoryName
    },
    phone: generateKoreanPhoneNumber(),
    businessHours: generateBusinessHours(categoryCode),
    isVerified: faker.datatype.boolean({ probability: 0.7 }),
    distance: undefined,
    reviews: [],
    averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 })
  };
}

// 여러 가맹점 생성
export function generateMerchants(count: number): Merchant[] {
  return Array.from({ length: count }, (_, index) => 
    generateMerchant(index + 1)
  );
}

// 검색용 가맹점 생성 (특정 쿼리에 매칭)
export function generateSearchMerchants(query: string, count: number): Merchant[] {
  const merchants = generateMerchants(count);
  
  // 검색어를 이름이나 주소에 포함시킴
  return merchants.map(merchant => ({
    ...merchant,
    name: faker.datatype.boolean({ probability: 0.5 }) 
      ? `${query} ${merchant.name}` 
      : merchant.name,
    address: faker.datatype.boolean({ probability: 0.3 })
      ? merchant.address.replace(KOREAN_DONG[0], query)
      : merchant.address
  }));
}

// 근처 가맹점 생성 (특정 좌표 근처)
export function generateNearbyMerchants(
  centerLat: number, 
  centerLng: number, 
  radius: number, 
  count: number
): Merchant[] {
  return Array.from({ length: count }, (_, index) => {
    // 반경 내에서 랜덤 위치 생성
    const angle = faker.number.float({ min: 0, max: 2 * Math.PI });
    const distance = faker.number.float({ min: 0, max: radius });
    
    // 미터를 도(degree)로 변환 (대략적)
    const latOffset = (distance * Math.cos(angle)) / 111000;
    const lngOffset = (distance * Math.sin(angle)) / (111000 * Math.cos(centerLat * Math.PI / 180));
    
    const merchant = generateMerchant(index + 1);
    
    return {
      ...merchant,
      location: {
        lat: centerLat + latOffset,
        lng: centerLng + lngOffset
      },
      distance: Math.round(distance)
    };
  });
}