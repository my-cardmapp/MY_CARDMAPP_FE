import { http, HttpResponse } from 'msw';
import { createNetworkDelay } from '../utils/network';
import { MockDataStore } from '../utils/MockDataStore';

// Initialize store
const store = new MockDataStore();

// Korean location database
const locations = {
  popular: ['강남역', '명동', '홍대', '이태원', '건대입구', '종로', '신촌', '잠실', '여의도', '성수동'],
  gangnam: ['강남역', '강남구청', '강남대로', '역삼역', '선릉역', '삼성역', '논현역', '신논현역'],
  myeongdong: ['명동', '명동역', '명동성당', '명동쇼핑거리', '을지로입구역'],
  hongdae: ['홍대입구역', '홍대거리', '홍익대학교', '상수역', '합정역'],
  itaewon: ['이태원역', '이태원로', '한남동', '녹사평역', '경리단길'],
  konkuk: ['건대입구역', '건국대학교', '뚝섬유원지', '성수역', '구의역']
};

// Category suggestions
const categories = {
  food: ['음식점', '한식', '중식', '일식', '양식', '분식', '패스트푸드', '치킨', '피자'],
  convenience: ['편의점', 'CU 편의점', 'GS25 편의점', '세븐일레븐', '이마트24', '미니스톱'],
  cafe: ['카페', '스타벅스', '투썸플레이스', '이디야커피', '메가커피', '빽다방', '공차', '스무디킹'],
  mart: ['마트', '이마트', '홈플러스', '롯데마트', '하나로마트', 'GS더프레시'],
  pharmacy: ['약국', '온누리약국', '365약국', '웰빙약국'],
  bakery: ['베이커리', '파리바게뜨', '뚜레쥬르', '성심당', '던킨도너츠']
};

// Restaurant chains
const restaurants = {
  kimbap: ['김밥천국', '김밥나라', '고봉민김밥', '김선생', '바르다김선생'],
  chicken: ['BBQ 치킨', '교촌치킨', '네네치킨', '굽네치킨', 'BHC', '페리카나'],
  burger: ['맥도날드', '버거킹', '롯데리아', 'KFC', '맘스터치', '노브랜드버거'],
  pizza: ['피자헛', '도미노피자', '파파존스', '피자스쿨', '반올림피자샵'],
  coffee: ['스타벅스', '투썸플레이스', '이디야커피', '메가커피', '빽다방', '커피빈', '폴바셋']
};

// Typo corrections
const typoCorrections: Record<string, string> = {
  '스타법스': '스타벅스',
  '스타복스': '스타벅스',
  '간남': '강남',
  '홍때': '홍대',
  '먕동': '명동',
  '건때': '건대',
  '김밥천곡': '김밥천국',
  '편이점': '편의점'
};

/**
 * Convert jamo to Hangul
 */
function jamoToHangul(jamo: string): string {
  // Simple jamo composition (incomplete but works for basic cases)
  const jamoMap: Record<string, string> = {
    'ㄱㅏㅇㄴㅏㅁ': '강남',
    'ㅁㅕㅇㄷㅗㅇ': '명동',
    'ㅎㅗㅇㄷㅐ': '홍대',
    'ㄱㅓㄴㄷㅐ': '건대',
    'ㅅㅣㄴㅊㅗㄴ': '신촌',
    'ㅈㅗㅇㄹㅗ': '종로'
  };
  
  return jamoMap[jamo] || jamo;
}

/**
 * Get initial consonants from Korean text
 */
function getInitialConsonants(text: string): string {
  const chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  let result = '';
  
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const unicode = code - 0xAC00;
      const chosungIndex = Math.floor(unicode / 588);
      result += chosung[chosungIndex];
    }
  }
  
  return result;
}

/**
 * Match by initial consonants
 */
function matchInitialConsonants(query: string, text: string): boolean {
  const textInitials = getInitialConsonants(text);
  return textInitials.startsWith(query);
}

/**
 * Get search suggestions
 */
function getSearchSuggestions(query: string, cardType?: string, nearLocation?: string): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Empty query - return popular locations
  if (!query) {
    return locations.popular.slice(0, 10);
  }
  
  // Check for typos
  const correctedQuery = typoCorrections[query] || query;
  
  // Check if it's jamo
  const hangulQuery = jamoToHangul(query);
  const searchQuery = hangulQuery !== query ? hangulQuery : correctedQuery;
  
  // Check if it's initial consonants only
  const isInitialConsonant = /^[ㄱ-ㅎ]+$/.test(query);
  
  // Location suggestions
  Object.values(locations).flat().forEach(location => {
    if (isInitialConsonant) {
      if (matchInitialConsonants(query, location)) {
        suggestions.push(location);
      }
    } else if (location.includes(searchQuery)) {
      suggestions.push(location);
    }
  });
  
  // Category suggestions
  Object.values(categories).flat().forEach(category => {
    if (isInitialConsonant) {
      if (matchInitialConsonants(query, category)) {
        suggestions.push(category);
      }
    } else if (category.includes(searchQuery)) {
      suggestions.push(category);
    }
  });
  
  // Restaurant suggestions
  Object.values(restaurants).flat().forEach(restaurant => {
    if (isInitialConsonant) {
      if (matchInitialConsonants(query, restaurant)) {
        suggestions.push(restaurant);
      }
    } else if (restaurant.includes(searchQuery)) {
      suggestions.push(restaurant);
    }
  });
  
  // Card type specific suggestions
  if (cardType === 'CHILD_MEAL' && query.includes('급식')) {
    suggestions.unshift('아동급식카드 가맹점');
    suggestions.push('아동급식 사용가능 매장');
  }
  
  // Near location context
  if (nearLocation) {
    const nearbyLocations = locations[nearLocation.replace('역', '').toLowerCase() as keyof typeof locations];
    if (nearbyLocations) {
      nearbyLocations.forEach(loc => {
        if (!suggestions.includes(loc)) {
          suggestions.push(loc);
        }
      });
    }
  }
  
  // Remove duplicates and limit to 10
  return [...new Set(suggestions)].slice(0, 10);
}

export const suggestionHandlers = [
  // GET /api/v1/suggestions/search - 검색 제안
  http.get('*/api/v1/suggestions/search', async ({ request }) => {
    await createNetworkDelay(50); // Fast response for autocomplete
    
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const cardType = url.searchParams.get('cardType') || undefined;
    const nearLocation = url.searchParams.get('nearLocation') || undefined;
    const save = url.searchParams.get('save') === 'true';
    
    // Save to search history if requested
    if (save && query) {
      store.saveSearchQuery(query);
    }
    
    const suggestions = getSearchSuggestions(query, cardType, nearLocation);
    
    // Check for typo correction
    const correctedQuery = typoCorrections[query] || undefined;
    
    return HttpResponse.json({
      query,
      suggestions,
      correctedQuery
    });
  }),
  
  // GET /api/v1/suggestions/recent - 최근 검색어
  http.get('*/api/v1/suggestions/recent', async () => {
    await createNetworkDelay(50);
    
    const recent = store.getSearchHistory().slice(0, 10);
    
    return HttpResponse.json({
      recent
    });
  }),
  
  // GET /api/v1/suggestions/categories - 카테고리 제안
  http.get('*/api/v1/suggestions/categories', async ({ request }) => {
    await createNetworkDelay(50);
    
    const url = new URL(request.url);
    const withCodes = url.searchParams.get('withCodes') === 'true';
    
    if (withCodes) {
      const categoriesWithCodes = [
        { code: 'FOOD', name: '음식점', icon: '🍽️' },
        { code: 'CONVENIENCE', name: '편의점', icon: '🏪' },
        { code: 'CAFE', name: '카페', icon: '☕' },
        { code: 'MART', name: '마트', icon: '🛒' },
        { code: 'PHARMACY', name: '약국', icon: '💊' },
        { code: 'BAKERY', name: '베이커리', icon: '🥐' },
        { code: 'FASTFOOD', name: '패스트푸드', icon: '🍔' },
        { code: 'CHICKEN', name: '치킨', icon: '🍗' },
        { code: 'PIZZA', name: '피자', icon: '🍕' }
      ];
      
      return HttpResponse.json({
        categories: categoriesWithCodes
      });
    }
    
    const categoryList = [
      '음식점', '편의점', '카페', '마트', '약국', '베이커리',
      '패스트푸드', '치킨', '피자', '한식', '중식', '일식'
    ];
    
    return HttpResponse.json({
      categories: categoryList
    });
  })
];