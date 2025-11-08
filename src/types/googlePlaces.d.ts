/**
 * Google Places API (New) Type Definitions
 * @see https://developers.google.com/maps/documentation/places/web-service
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Text Search API 요청 바디
 */
export interface GooglePlacesTextSearchRequest {
  /** 검색 쿼리 문자열 (예: "스타벅스 강남") */
  textQuery: string;
  /** 검색 결과 언어 (예: "ko", "en") */
  languageCode?: string;
  /** 최대 결과 수 (기본: 20) */
  pageSize?: number;
  /** 위치 바이어스 (검색 중심점) */
  locationBias?: LocationBias;
  /** 포함할 장소 타입 (예: "restaurant") */
  includedType?: string;
}

/**
 * 위치 바이어스 (검색 중심점 지정)
 */
export interface LocationBias {
  circle?: {
    center: {
      latitude: number;
      longitude: number;
    };
    /** 반경 (미터) */
    radius: number;
  };
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Text Search API 응답
 */
export interface GooglePlacesTextSearchResponse {
  /** 검색된 장소 목록 */
  places: GooglePlace[];
  /** 다음 페이지 토큰 (페이지네이션용) */
  nextPageToken?: string;
}

/**
 * Place Details API 응답
 */
export interface GooglePlaceDetailsResponse extends GooglePlace {}

/**
 * Google Place 객체 (장소 정보)
 */
export interface GooglePlace {
  /** Place ID (고유 식별자) */
  id: string;
  /** 장소명 */
  displayName?: LocalizedText;
  /** 주소 */
  formattedAddress?: string;
  /** 위치 (위도/경도) */
  location?: LatLng;
  /** 국제 전화번호 */
  internationalPhoneNumber?: string;
  /** 현재 영업시간 */
  currentOpeningHours?: OpeningHours;
  /** 평점 (0.0 ~ 5.0) */
  rating?: number;
  /** 리뷰 수 */
  userRatingCount?: number;
  /** 리뷰 목록 */
  reviews?: Review[];
  /** 사진 목록 */
  photos?: Photo[];
  /** 장소 타입 목록 (예: ["restaurant", "food"]) */
  types?: string[];
  /** 웹사이트 URI */
  websiteUri?: string;
  /** Google Maps URI */
  googleMapsUri?: string;
  /** 가격 수준 (0-4: FREE, INEXPENSIVE, MODERATE, EXPENSIVE, VERY_EXPENSIVE) */
  priceLevel?: 'PRICE_LEVEL_UNSPECIFIED' | 'PRICE_LEVEL_FREE' | 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE';
  /** 배송 여부 */
  delivery?: boolean;
  /** 매장 픽업 여부 */
  takeout?: boolean;
  /** 좌석 예약 가능 여부 */
  reservable?: boolean;
}

/**
 * 다국어 텍스트
 */
export interface LocalizedText {
  /** 텍스트 내용 */
  text: string;
  /** 언어 코드 (예: "ko", "en") */
  languageCode?: string;
}

/**
 * 위도/경도
 */
export interface LatLng {
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
}

/**
 * 영업시간 정보
 */
export interface OpeningHours {
  /** 현재 영업 중 여부 */
  openNow?: boolean;
  /** 요일별 영업시간 설명 (예: ["Monday: 9:00 AM – 5:00 PM"]) */
  weekdayDescriptions?: string[];
  /** 기간별 영업시간 */
  periods?: Period[];
}

/**
 * 영업시간 기간
 */
export interface Period {
  /** 영업 시작 */
  open?: TimeOfDay;
  /** 영업 종료 */
  close?: TimeOfDay;
}

/**
 * 시간 정보
 */
export interface TimeOfDay {
  /** 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일) */
  day?: number;
  /** 시간 (0-23) */
  hour?: number;
  /** 분 (0-59) */
  minute?: number;
}

/**
 * 리뷰 정보
 */
export interface Review {
  /** 리뷰 작성자 이름 */
  authorAttribution?: AuthorAttribution;
  /** 평점 (1-5) */
  rating?: number;
  /** 리뷰 텍스트 */
  text?: LocalizedText;
  /** 원본 텍스트 (번역되지 않은 원문) */
  originalText?: LocalizedText;
  /** 상대적 게시 시간 (예: "2 weeks ago") */
  relativePublishTimeDescription?: string;
  /** 게시 시간 (ISO 8601 포맷) */
  publishTime?: string;
}

/**
 * 작성자 정보
 */
export interface AuthorAttribution {
  /** 작성자 이름 */
  displayName?: string;
  /** 작성자 프로필 URI */
  uri?: string;
  /** 작성자 프로필 사진 URI */
  photoUri?: string;
}

/**
 * 사진 정보
 */
export interface Photo {
  /** 사진 리소스 이름 (예: "places/PLACE_ID/photos/PHOTO_ID") */
  name: string;
  /** 사진 너비 (픽셀) */
  widthPx?: number;
  /** 사진 높이 (픽셀) */
  heightPx?: number;
  /** 사진 제공자 정보 */
  authorAttributions?: AuthorAttribution[];
}

// ============================================================================
// API Error Types
// ============================================================================

/**
 * Google Places API 에러 응답
 */
export interface GooglePlacesErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: unknown[];
  };
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Field Mask 타입 (요청 시 반환할 필드 지정)
 */
export type PlaceField =
  | 'id'
  | 'displayName'
  | 'formattedAddress'
  | 'location'
  | 'internationalPhoneNumber'
  | 'currentOpeningHours'
  | 'rating'
  | 'userRatingCount'
  | 'reviews'
  | 'photos'
  | 'types'
  | 'websiteUri'
  | 'googleMapsUri'
  | 'priceLevel'
  | 'delivery'
  | 'takeout'
  | 'reservable';

/**
 * Text Search 시 사용할 필드 마스크
 */
export const TEXT_SEARCH_FIELD_MASK: PlaceField[] = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'types',
];

/**
 * Place Details 시 사용할 필드 마스크
 */
export const PLACE_DETAILS_FIELD_MASK: PlaceField[] = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'internationalPhoneNumber',
  'currentOpeningHours',
  'rating',
  'userRatingCount',
  'reviews',
  'photos',
  'types',
  'websiteUri',
  'googleMapsUri',
  'priceLevel',
];
