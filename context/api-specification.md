# Card-Map API 명세

## 1. RESTful API 구조

```
/api/v1/
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   └── POST   /refresh
├── /merchants
│   ├── GET    /             # 목록 조회 (필터, 페이징)
│   ├── GET    /{id}         # 상세 조회
│   ├── GET    /nearby       # 위치 기반 조회
│   └── GET    /search       # 텍스트 검색
├── /cards
│   ├── GET    /             # 카드 목록
│   └── GET    /{code}       # 카드 상세
├── /routes
│   ├── POST   /calculate    # 경로 계산
│   └── GET    /optimize     # 경로 최적화
└── /ai
    ├── POST   /chat         # 자연어 질의
    └── POST   /intent       # 의도 분석
```

## 2. API 엔드포인트 상세 명세

### 인증 API

```typescript
// POST /api/v1/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
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

// POST /api/v1/auth/refresh
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// POST /api/v1/auth/logout
// Header: Authorization: Bearer {token}
// Response: 204 No Content
```

### 가맹점 API

```typescript
// GET /api/v1/merchants
// Query params: ?cardTypes=CHILD_MEAL,CULTURE_NURI&lat=37.5666805&lng=126.9784147&radius=1000
interface MerchantListResponse {
  content: Merchant[];
  pageable: {
    page: number;
    size: number;
    sort: string[];
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// GET /api/v1/merchants/{id}
interface MerchantDetailResponse extends Merchant {
  distance?: number; // 현재 위치에서의 거리 (미터)
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

// GET /api/v1/merchants/nearby
// Query params: ?lat=37.5666805&lng=126.9784147&radius=500&cardTypes=CHILD_MEAL
interface NearbyMerchantsRequest {
  lat: number;
  lng: number;
  radius?: number; // 기본값: 500m
  cardTypes?: string[];
  categories?: string[];
  limit?: number; // 기본값: 20
}

interface NearbyMerchantsResponse {
  merchants: MerchantWithDistance[];
  center: { lat: number; lng: number };
  radius: number;
}

interface MerchantWithDistance extends Merchant {
  distance: number; // 미터 단위
  walkingTime?: number; // 분 단위
}

// GET /api/v1/merchants/search
// Query params: ?query=편의점&cardTypes=CHILD_MEAL
interface MerchantSearchResponse extends MerchantListResponse {
  query: string;
  suggestions?: string[]; // 검색어 제안
}
```

### 카드 API

```typescript
// GET /api/v1/cards
interface CardListResponse {
  cards: CardDetail[];
}

interface CardDetail extends Card {
  description: string;
  benefits: string[];
  restrictions: string[];
  issuer: string;
  merchantCount: number;
  popularCategories: Category[];
}

// GET /api/v1/cards/{code}
interface CardDetailResponse extends CardDetail {
  recentMerchants: Merchant[]; // 최근 추가된 가맹점
  statistics: {
    totalMerchants: number;
    merchantsByCategory: { [key: string]: number };
  };
}
```

### 경로 API

```typescript
// POST /api/v1/routes/calculate
interface RouteCalculateRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
  mode: 'walking' | 'transit' | 'driving';
  departureTime?: string; // ISO 8601
  avoidTolls?: boolean;
}

interface RouteCalculateResponse {
  routes: Route[];
  origin: Location;
  destination: Location;
  waypoints?: Location[];
}

interface Route {
  summary: string;
  distance: number; // 미터
  duration: number; // 초
  fare?: number; // 대중교통 요금
  polyline: string; // 인코딩된 경로
  steps: RouteStep[];
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  transitDetails?: TransitDetails;
}

interface TransitDetails {
  line: string;
  departure: string;
  arrival: string;
  numStops: number;
}

// GET /api/v1/routes/optimize
// Query params: ?origin=37.5,126.9&waypoints=37.51,126.91;37.52,126.92&mode=walking
interface OptimizeRouteRequest {
  origin: string; // "lat,lng"
  waypoints: string; // "lat1,lng1;lat2,lng2"
  mode: string;
}

interface OptimizeRouteResponse {
  optimizedOrder: number[];
  totalDistance: number;
  totalDuration: number;
  route: Route;
}
```

### AI/자연어 API

```typescript
// POST /api/v1/ai/chat
interface ChatRequest {
  message: string;
  context?: {
    location?: { lat: number; lng: number };
    previousQueries?: string[];
    cardTypes?: string[];
  };
  sessionId?: string;
}

interface ChatResponse {
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

interface ChatAction {
  type: 'show_merchants' | 'calculate_route' | 'filter_results';
  data: any;
}

// POST /api/v1/ai/intent
interface IntentRequest {
  query: string;
  context?: any;
}

interface IntentResponse {
  intent: string;
  confidence: number;
  entities: { [key: string]: any };
  requiresAI: boolean;
}
```

### 에러 응답 형식

```typescript
interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  requestId?: string;
  details?: { [key: string]: any };
}

// 예시
{
  "timestamp": "2024-07-25T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid coordinates provided",
  "path": "/api/v1/merchants/nearby",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "lat": "Latitude must be between -90 and 90",
    "lng": "Longitude must be between -180 and 180"
  }
}
```

## 3. API 타입 정의

```typescript
// 가맹점 검색
interface MerchantSearchRequest {
  query?: string;
  cardTypes?: string[];
  categories?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  size?: number;
}

interface MerchantSearchResponse {
  content: Merchant[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

// 가맹점 상세
interface Merchant {
  id: number;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  cards: Card[];
  category: Category;
  businessHours?: BusinessHours;
  phone?: string;
  isVerified: boolean;
}

// 카드 정보
interface Card {
  id: number;
  code: string;
  name: string;
  colorHex: string;
  iconUrl?: string;
}

// 카테고리 정보
interface Category {
  id: number;
  code: string;
  name: string;
  icon?: string;
}

// 영업시간
interface BusinessHours {
  [key: string]: string[]; // { "mon": ["09:00", "22:00"], ... }
}

// 위치 정보
interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

// 리뷰 정보
interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  images?: string[];
}
```

## 4. Mock API Service (MSW) 구현 현황

### 구현된 엔드포인트 (10개)
- GET /api/v1/merchants - 가맹점 목록 (페이징, 필터링)
- GET /api/v1/merchants/:id - 가맹점 상세
- GET /api/v1/merchants/nearby - 위치 기반 검색
- GET /api/v1/merchants/search - 텍스트 검색
- GET /api/v1/cards - 카드 타입 목록
- POST /api/v1/routes/calculate - 경로 계산
- GET /api/v1/routes/optimize - 경로 최적화
- POST /api/v1/auth/login - 로그인
- POST /api/v1/auth/refresh - 토큰 갱신
- POST /api/v1/auth/logout - 로그아웃

### Mock 데이터 특징
- 한국어 비즈니스 이름 생성 (김밥천국, GS25 등)
- 실제 서울 주소 체계 (25개 구, 30개 동)
- 카테고리별 영업시간 패턴
- 카드 타입별 가맹점 분포 (CHILD_MEAL 80% 확률)
- 100-500ms 네트워크 지연 시뮬레이션
- localStorage 기반 상태 영속성