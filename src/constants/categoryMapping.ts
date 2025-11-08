/**
 * Google Places Types → 프로젝트 카테고리 매핑 테이블
 *
 * Google Places API의 place types를 프로젝트의 카테고리로 매핑합니다.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-types
 */

import type { Category } from '@/types/api'

/**
 * Google Places Type → Category 매핑
 */
export const GOOGLE_PLACES_CATEGORY_MAP: Record<string, Category> = {
  // 음식 & 음료
  restaurant: { id: 1, code: 'FOOD', name: '음식점', icon: '🍽️' },
  cafe: { id: 2, code: 'CAFE', name: '카페', icon: '☕' },
  bar: { id: 3, code: 'BAR', name: '주점', icon: '🍺' },
  bakery: { id: 6, code: 'BAKERY', name: '빵집', icon: '🥖' },
  fast_food_restaurant: { id: 11, code: 'FASTFOOD', name: '패스트푸드', icon: '🍔' },
  meal_delivery: { id: 12, code: 'DELIVERY', name: '배달음식', icon: '🛵' },
  meal_takeaway: { id: 13, code: 'TAKEOUT', name: '테이크아웃', icon: '🥡' },

  // 쇼핑
  convenience_store: { id: 4, code: 'STORE', name: '편의점', icon: '🏪' },
  supermarket: { id: 5, code: 'MART', name: '마트', icon: '🛒' },
  grocery_store: { id: 14, code: 'GROCERY', name: '식료품점', icon: '🛍️' },
  department_store: { id: 15, code: 'DEPARTMENT', name: '백화점', icon: '🏬' },
  shopping_mall: { id: 16, code: 'MALL', name: '쇼핑몰', icon: '🛍️' },
  clothing_store: { id: 17, code: 'CLOTHING', name: '의류', icon: '👔' },
  shoe_store: { id: 18, code: 'SHOES', name: '신발', icon: '👞' },
  book_store: { id: 19, code: 'BOOKS', name: '서점', icon: '📚' },
  electronics_store: { id: 20, code: 'ELECTRONICS', name: '전자제품', icon: '📱' },
  furniture_store: { id: 21, code: 'FURNITURE', name: '가구', icon: '🛋️' },
  home_goods_store: { id: 22, code: 'HOMEGOODS', name: '생활용품', icon: '🏠' },
  pet_store: { id: 23, code: 'PETSTORE', name: '애완용품', icon: '🐾' },

  // 의료 & 건강
  hospital: { id: 8, code: 'HOSPITAL', name: '병원', icon: '🏥' },
  pharmacy: { id: 7, code: 'PHARMACY', name: '약국', icon: '💊' },
  dentist: { id: 24, code: 'DENTIST', name: '치과', icon: '🦷' },
  doctor: { id: 25, code: 'DOCTOR', name: '의원', icon: '👨‍⚕️' },
  veterinary_care: { id: 26, code: 'VETERINARY', name: '동물병원', icon: '🐕' },

  // 금융
  bank: { id: 9, code: 'BANK', name: '은행', icon: '🏦' },
  atm: { id: 27, code: 'ATM', name: 'ATM', icon: '💳' },

  // 자동차 & 교통
  gas_station: { id: 10, code: 'GAS', name: '주유소', icon: '⛽' },
  parking: { id: 28, code: 'PARKING', name: '주차장', icon: '🅿️' },
  car_wash: { id: 29, code: 'CARWASH', name: '세차장', icon: '🚗' },
  car_repair: { id: 30, code: 'CARREPAIR', name: '정비소', icon: '🔧' },
  car_rental: { id: 31, code: 'CARRENTAL', name: '렌터카', icon: '🚙' },
  taxi_stand: { id: 32, code: 'TAXI', name: '택시', icon: '🚕' },
  bus_station: { id: 33, code: 'BUS', name: '버스정류장', icon: '🚌' },
  subway_station: { id: 34, code: 'SUBWAY', name: '지하철역', icon: '🚇' },
  train_station: { id: 35, code: 'TRAIN', name: '기차역', icon: '🚄' },

  // 숙박
  lodging: { id: 36, code: 'LODGING', name: '숙박', icon: '🏨' },
  hotel: { id: 37, code: 'HOTEL', name: '호텔', icon: '🏨' },
  motel: { id: 38, code: 'MOTEL', name: '모텔', icon: '🛏️' },

  // 오락 & 문화
  movie_theater: { id: 39, code: 'MOVIE', name: '영화관', icon: '🎬' },
  museum: { id: 40, code: 'MUSEUM', name: '박물관', icon: '🏛️' },
  art_gallery: { id: 41, code: 'GALLERY', name: '미술관', icon: '🎨' },
  library: { id: 42, code: 'LIBRARY', name: '도서관', icon: '📚' },
  amusement_park: { id: 43, code: 'AMUSEMENT', name: '놀이공원', icon: '🎡' },
  zoo: { id: 44, code: 'ZOO', name: '동물원', icon: '🦁' },
  aquarium: { id: 45, code: 'AQUARIUM', name: '수족관', icon: '🐠' },

  // 스포츠 & 헬스
  gym: { id: 46, code: 'GYM', name: '헬스장', icon: '🏋️' },
  spa: { id: 47, code: 'SPA', name: '스파', icon: '💆' },
  beauty_salon: { id: 48, code: 'SALON', name: '미용실', icon: '💇' },
  hair_salon: { id: 49, code: 'HAIR', name: '헤어샵', icon: '✂️' },
  nail_salon: { id: 50, code: 'NAILS', name: '네일샵', icon: '💅' },

  // 교육
  school: { id: 51, code: 'SCHOOL', name: '학교', icon: '🏫' },
  university: { id: 52, code: 'UNIVERSITY', name: '대학교', icon: '🎓' },
  preschool: { id: 53, code: 'PRESCHOOL', name: '유치원', icon: '🧒' },

  // 정부 & 공공시설
  post_office: { id: 54, code: 'POST', name: '우체국', icon: '📮' },
  police: { id: 55, code: 'POLICE', name: '경찰서', icon: '👮' },
  fire_station: { id: 56, code: 'FIRE', name: '소방서', icon: '🚒' },
  city_hall: { id: 57, code: 'CITYHALL', name: '시청', icon: '🏛️' },
  courthouse: { id: 58, code: 'COURT', name: '법원', icon: '⚖️' },

  // 기타
  laundry: { id: 59, code: 'LAUNDRY', name: '세탁소', icon: '🧺' },
  florist: { id: 60, code: 'FLORIST', name: '꽃집', icon: '💐' },
  hardware_store: { id: 61, code: 'HARDWARE', name: '철물점', icon: '🔨' },
  liquor_store: { id: 62, code: 'LIQUOR', name: '주류점', icon: '🍷' },
  jewelry_store: { id: 63, code: 'JEWELRY', name: '보석점', icon: '💎' },
}

/**
 * Google Place Type을 프로젝트 카테고리로 변환
 *
 * @param placeType - Google Place Type (예: "restaurant", "cafe")
 * @returns Category 객체
 */
export function mapPlaceTypeToCategory(placeType: string): Category {
  // 매핑 테이블에서 카테고리 검색
  const category = GOOGLE_PLACES_CATEGORY_MAP[placeType]

  // 매핑된 카테고리가 없으면 기본 카테고리 반환
  if (!category) {
    return {
      id: 99,
      code: 'OTHER',
      name: '기타',
      icon: '📍',
    }
  }

  return category
}

/**
 * 여러 Place Types 중 가장 우선순위가 높은 카테고리 선택
 *
 * @param placeTypes - Google Place Types 배열
 * @returns Category 객체
 */
export function selectPrimaryCategory(placeTypes: string[]): Category {
  // 우선순위 순서: 음식 > 쇼핑 > 의료 > 교통 > 기타
  const priorityOrder = [
    'restaurant',
    'cafe',
    'bar',
    'bakery',
    'fast_food_restaurant',
    'convenience_store',
    'supermarket',
    'pharmacy',
    'hospital',
    'bank',
    'gas_station',
  ]

  // 우선순위에 따라 카테고리 선택
  for (const priority of priorityOrder) {
    if (placeTypes.includes(priority)) {
      return mapPlaceTypeToCategory(priority)
    }
  }

  // 우선순위에 없으면 첫 번째 타입 사용
  if (placeTypes.length > 0) {
    return mapPlaceTypeToCategory(placeTypes[0])
  }

  // 타입이 없으면 기본 카테고리
  return {
    id: 99,
    code: 'OTHER',
    name: '기타',
    icon: '📍',
  }
}
