// API 응답 타입 정의

// 기본 타입
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface Card {
  id: number;
  code: string;
  name: string;
  colorHex: string;
  iconUrl?: string;
}

export interface CardDetail extends Card {
  description: string;
  benefits: string[];
  restrictions: string[];
  issuer: string;
  merchantCount: number;
  popularCategories?: Category[];
}

export interface Category {
  id: number;
  code: string;
  name: string;
  icon?: string;
}

export interface BusinessHours {
  [key: string]: string[]; // { "mon": ["09:00", "22:00"], ... }
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  images?: string[];
}

// 가맹점 관련 타입
export interface Merchant {
  id: number;
  name: string;
  address: string;
  location: Location;
  cards: Card[];
  category: Category;
  businessHours?: BusinessHours;
  phone?: string;
  isVerified: boolean;
}

export interface MerchantWithDistance extends Merchant {
  distance: number; // 미터 단위
  walkingTime?: number; // 분 단위
}

export interface MerchantDetailResponse extends Merchant {
  distance?: number;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

// 페이징 관련 타입
export interface Pageable {
  page: number;
  size: number;
  sort: string[];
}

export interface PageResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// API 응답 타입
export interface MerchantListResponse extends PageResponse<Merchant> {}

export interface MerchantSearchResponse extends PageResponse<Merchant> {
  query: string;
  suggestions?: string[];
}

export interface NearbyMerchantsRequest {
  lat: number;
  lng: number;
  radius?: number; // 기본값: 500m
  cardTypes?: string[];
  categories?: string[];
  limit?: number; // 기본값: 20
}

export interface NearbyMerchantsResponse {
  merchants: MerchantWithDistance[];
  center: Location;
  radius: number;
}

// 카드 API 타입
export interface CardListResponse {
  cards: CardDetail[];
}

export interface CardDetailResponse extends CardDetail {
  recentMerchants: Merchant[];
  statistics: {
    totalMerchants: number;
    merchantsByCategory: { [key: string]: number };
  };
}

// 경로 API 타입
export interface RouteCalculateRequest {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  mode: 'walking' | 'transit' | 'driving';
  departureTime?: string; // ISO 8601
  avoidTolls?: boolean;
}

export interface RouteCalculateResponse {
  routes: Route[];
  origin: Location;
  destination: Location;
  waypoints?: Location[];
}

export interface Route {
  summary: string;
  distance: number; // 미터
  duration: number; // 초
  fare?: number; // 대중교통 요금
  polyline: string; // 인코딩된 경로
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Location;
  endLocation: Location;
  transitDetails?: TransitDetails;
}

export interface TransitDetails {
  line: string;
  departure: string;
  arrival: string;
  numStops: number;
}

export interface OptimizeRouteRequest {
  origin: string; // "lat,lng"
  waypoints: string; // "lat1,lng1;lat2,lng2"
  mode: string;
}

export interface OptimizeRouteResponse {
  optimizedOrder: number[];
  totalDistance: number;
  totalDuration: number;
  route: Route;
}

// 인증 API 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// AI/자연어 API 타입
export interface ChatRequest {
  message: string;
  context?: {
    location?: Location;
    previousQueries?: string[];
    cardTypes?: string[];
  };
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  intent: 'search' | 'route' | 'info' | 'general';
  entities?: {
    cardTypes?: string[];
    categories?: string[];
    location?: string;
    merchants?: Merchant[];
  };
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'show_merchants' | 'calculate_route' | 'filter_results';
  data: any;
}

export interface IntentRequest {
  query: string;
  context?: any;
}

export interface IntentResponse {
  intent: string;
  confidence: number;
  entities: { [key: string]: any };
  requiresAI: boolean;
}

// 에러 응답 타입
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  requestId?: string;
  details?: { [key: string]: any };
}