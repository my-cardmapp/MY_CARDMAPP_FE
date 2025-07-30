# Card-Map 프로젝트 기획서 (개선판)

## 1. 프로젝트 개요

Card-Map은 한국의 복지카드 및 지역화폐 사용자들이 가맹점을 쉽게 찾고, 자연어로 경로를 계획할 수 있도록 돕는 웹 애플리케이션입니다.

### 핵심 가치 제안
- **문제**: 복지카드 사용자들이 가맹점을 찾기 어려움 (특히 아동급식카드)
- **해결**: 전국 가맹점 데이터를 지도에 표시하고, AI 기반 자연어 검색 제공
- **차별점**: 다중 카드 지원, 경로 최적화, 음성 검색

### 목표 사용자
- 주 타겟: 아동급식카드 사용 청소년 (13-18세)
- 부 타겟: 문화누리카드, 지역사랑상품권 사용자
- 확장 타겟: 복지카드 발급 가족, 사회복지사

## 2. MVP 단계별 구현 전략

### Phase 1: Core Features (2개월)
**목표**: 기본적인 가맹점 검색 및 지도 표시

**기능**:
- 지도 기반 가맹점 표시
- 카드별/카테고리별 필터링
- 기본 검색 (가맹점명, 주소)
p
- 반응형 웹 디자인

**기술**:
- Spring Boot 모놀리스
- PostgreSQL + PostGIS
- Next.js 14 + Naver Map API
- Docker Compose 개발환경

### Phase 2: Route Planning (1개월)
**목표**: 다중 경유지 경로 계획

**기능**:
- 현재 위치 기반 경로 탐색
- 다중 경유지 최적화
- 대중교통/도보 경로 지원
- 경로 저장/공유

**기술**:
- Naver Directions API 통합
- Redis 캐싱 레이어
- 경로 최적화 알고리즘

### Phase 3: AI Integration (1.5개월)
**목표**: 자연어 검색 및 추천

**기능**:
- 자연어 질의 처리
- 음성 검색
- 개인화 추천
- 챗봇 인터페이스

**기술**:
- LangChain4j + OpenAI API
- 의도 분류기 (간단한 쿼리 필터링)
- Semantic caching
- Web Speech API

### Phase 4: User Features (1개월)
**목표**: 사용자 경험 향상

**기능**:
- 소셜 로그인
- 즐겨찾기/리뷰
- 오프라인 지원 (PWA)
- 실시간 알림

**기술**:
- OAuth2 (Kakao, Naver)
- Service Worker
- Push Notifications
- 사용자 분석 도구

## 3. 기술 아키텍처

### 3.1 시스템 아키텍처 진화 전략

```
[ Phase 1-2: 모놀리스 ]
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Spring Boot App │
│  ┌──────────┐   │
│  │ Search   │   │
│  │ Route    │   │
│  │ Auth     │   │
│  └──────────┘   │
└────────┬────────┘
         │
┌────────▼────────┐     ┌─────────┐
│   PostgreSQL    │────►│  Redis  │
└─────────────────┘     └─────────┘

[ Phase 3+: 마이크로서비스 분리 ]
AI Service 분리 → Search Service 분리 → Route Service 분리
```

### 3.2 기술 스택 상세

**Backend**
- **Framework**: Spring Boot 3.2
- **Language**: Java 21 (Virtual Threads 활용)
- **Database**: PostgreSQL 16 + PostGIS 3.5
- **Cache**: Redis 7 + Spring Cache
- **Search**: PostgreSQL Full-Text Search → Elasticsearch (확장시)
- **AI**: LangChain4j 0.26 + OpenAI API
- **API Docs**: SpringDoc OpenAPI 3.0
- **Testing**: JUnit 5 + Testcontainers

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **State**: Zustand (경량화)
- **Map**: Naver Map SDK v3
- **Styling**: Tailwind CSS + Shadcn/ui
- **Testing**: Vitest + React Testing Library

**DevOps**
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Spring Actuator + Prometheus + Grafana
- **Logging**: SLF4J + Logback + ELK Stack (확장시)
- **APM**: OpenTelemetry (확장시)

## 4. 데이터베이스 설계 (개선)

### 4.1 핵심 테이블

```sql
-- 카드 정보
CREATE TABLE card (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'CHILD_MEAL', 'CULTURE_NURI'
    name VARCHAR(100) NOT NULL,
    issuer VARCHAR(100),
    color_hex VARCHAR(7),
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_card_code (code)
);

-- 가맹점 정보
CREATE TABLE merchant (
    id BIGSERIAL PRIMARY KEY,
    merchant_code VARCHAR(100) UNIQUE,  -- 외부 시스템 연동용
    name VARCHAR(200) NOT NULL,
    category_id BIGINT REFERENCES category(id),
    address VARCHAR(500),
    location GEOGRAPHY(POINT, 4326),  -- PostGIS
    phone VARCHAR(20),
    business_hours JSONB,  -- {"mon": ["09:00", "22:00"], ...}
    is_verified BOOLEAN DEFAULT false,
    search_vector tsvector,  -- Full-text search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_merchant_location (location),
    INDEX idx_merchant_search (search_vector) USING GIN
);

-- 가맹점-카드 연결 (시간대별 사용 가능 정보 추가)
CREATE TABLE merchant_card (
    merchant_id BIGINT REFERENCES merchant(id),
    card_id BIGINT REFERENCES card(id),
    is_active BOOLEAN DEFAULT true,
    usage_restriction JSONB,  -- {"min_amount": 10000, "time_slots": [...]}
    last_verified_at TIMESTAMP,
    PRIMARY KEY (merchant_id, card_id)
);
```

### 4.2 캐싱 전략

```sql
-- 경로 캐시 (지역별 파티셔닝)
CREATE TABLE route_cache (
    cache_key VARCHAR(255) PRIMARY KEY,  -- MD5(origin+dest+waypoints)
    origin GEOGRAPHY(POINT, 4326),
    destination GEOGRAPHY(POINT, 4326),
    waypoints JSONB,
    route_data JSONB,  -- {distance, duration, polyline, steps}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count INT DEFAULT 0
) PARTITION BY RANGE (created_at);

-- AI 쿼리 캐시 (Semantic)
CREATE TABLE ai_query_cache (
    id BIGSERIAL PRIMARY KEY,
    query_embedding vector(1536),  -- pgvector
    query_hash VARCHAR(64),
    normalized_query TEXT,
    response JSONB,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ttl_hours INT DEFAULT 24,
    INDEX idx_embedding (query_embedding) USING ivfflat
);
```

## 5. API 설계

### 5.1 RESTful API 구조

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

### 5.2 API 엔드포인트 상세 명세

#### 인증 API

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

#### 가맹점 API

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

#### 카드 API

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

#### 경로 API

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

#### AI/자연어 API

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

#### 에러 응답 형식

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

#### HTTP 상태 코드 규칙

- `200 OK`: 성공적인 GET, PUT 요청
- `201 Created`: 성공적인 POST 요청으로 리소스 생성
- `204 No Content`: 성공적인 DELETE 요청
- `400 Bad Request`: 잘못된 요청 형식
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 리소스 충돌
- `422 Unprocessable Entity`: 유효성 검사 실패
- `429 Too Many Requests`: Rate limit 초과
- `500 Internal Server Error`: 서버 오류
- `503 Service Unavailable`: 일시적 서비스 중단

### 5.3 API 타입 정의

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

## 6. 보안 전략

### 6.1 인증/인가
- **Phase 1**: Session 기반 인증
- **Phase 2+**: JWT + Refresh Token
- **소셜 로그인**: OAuth2 (Kakao, Naver)
- **권한 관리**: Spring Security + @PreAuthorize

### 6.2 API 보안
- **Rate Limiting**: Bucket4j
- **CORS**: 화이트리스트 기반
- **Input Validation**: Bean Validation + 커스텀 검증
- **SQL Injection**: Prepared Statements
- **XSS**: Content Security Policy

### 6.3 데이터 보안
- **개인정보 암호화**: AES-256
- **비밀번호**: BCrypt (강도 12)
- **통신**: HTTPS only
- **로그**: 개인정보 마스킹

## 7. 성능 최적화 전략

### 7.1 목표 메트릭
- **검색 응답**: p95 < 300ms
- **경로 계산**: p95 < 500ms
- **AI 응답**: p95 < 2s (캐시 미스)
- **동시 사용자**: 10,000+ 지원

### 7.2 최적화 기법

**Database**
- Connection Pooling (HikariCP)
- 읽기 전용 복제본
- 인덱스 최적화
- Query 실행계획 분석

**Caching**
- Spring Cache (Method Level)
- Redis (Session, Route)
- CDN (정적 자원)
- Browser Cache (PWA)

**Application**
- Virtual Threads (Java 21)
- 비동기 처리 (@Async)
- Lazy Loading
- Response 압축 (Gzip)

**AI Cost Optimization**
```java
@Component
public class AIQueryOptimizer {
    // 1. 의도 분류기로 간단한 쿼리 필터
    public boolean requiresAI(String query) {
        return !isSimpleLocationQuery(query) 
            && !isSimpleFilterQuery(query);
    }
    
    // 2. Semantic 캐싱으로 유사 쿼리 재사용
    public Optional<String> findSimilarQuery(String query) {
        var embedding = embedQuery(query);
        return semanticSearch(embedding, 0.95); // 95% 유사도
    }
    
    // 3. 모델 선택 (복잡도에 따라)
    public String selectModel(QueryComplexity complexity) {
        return switch(complexity) {
            case SIMPLE -> "gpt-3.5-turbo";
            case MEDIUM -> "gpt-4o-mini";
            case COMPLEX -> "gpt-4o";
        };
    }
}
```

## 8. 모니터링 및 운영

### 8.1 로깅 전략
- **구조화 로깅**: JSON 형식
- **로그 레벨**: 환경별 설정
- **중앙 집중**: ELK Stack (확장시)
- **보안 로그**: 별도 저장

### 8.2 메트릭 수집
- **Application**: Micrometer
- **System**: Node Exporter
- **Database**: pg_stat_statements
- **Custom**: 비즈니스 메트릭

### 8.3 알림 정책
- **Error Rate**: > 1% 
- **Response Time**: p95 > SLA
- **AI Cost**: 일일 예산 80% 초과
- **Security**: 비정상 접근 패턴

## 9. 개발 프로세스

### 9.1 Card-Map 개발 워크플로우

#### Task Master 중심 워크플로우
1. **작업 시작**: `task-master next`로 다음 작업 확인
2. **복잡도 확인**: complexity ≥ 7인 task는 반드시 subtask로 분해
   ```bash
   task-master expand --id=<task-id> --num=5
   ```
3. **작업 상태 관리**:
   - 시작: `task-master set-status --id=<id> --status=in-progress`
   - 완료: `task-master set-status --id=<id> --status=done`
4. **구현 기록**: `task-master update-subtask --id=<id> --prompt="구현 내용"`

#### Git 워크플로우
- **브랜치 전략**:
  - main 브랜치 직접 작업 금지
  - feature/[기능명] 브랜치 생성하여 작업
- **커밋 규칙**:
  - gitmoji 사용 필수
  - 제목만 작성 (본문 없음)
  - 기능 단위 atomic 커밋
  - 예: `✨ Initialize Next.js project`

#### TDD(Test-Driven Development)
1. 테스트 파일 먼저 작성 (.test.tsx, .test.ts)
2. 테스트 실패 확인
3. 최소한의 코드로 테스트 통과
4. 리팩토링

#### 라이브러리 사용법 조회
1. 사용법이 불확실한 라이브러리는 Context7 MCP를 활용하여 최신 문서 확인
2. `mcp__Context7__resolve-library-id`로 라이브러리 ID 검색
3. `mcp__Context7__get-library-docs`로 상세 문서 조회
4. 예시: Next.js, React, Tailwind CSS, Naver Maps API 등
5. 공식 문서 기반으로 정확한 구현 진행

#### Naver Maps API 사용 가이드라인
1. **커스텀 컨트롤 추가 방법**
   ```typescript
   // ❌ 잘못된 방법 (작동하지 않음)
   map.controls[naver.maps.Position.TOP_LEFT].push(control)
   
   // ✅ 올바른 방법
   const customControl = new naver.maps.CustomControl('<div>HTML</div>', {
     position: naver.maps.Position.TOP_LEFT
   })
   customControl.setMap(map)
   ```

2. **InfoWindow 생성 시 주요 옵션**
   - `content`: HTML 문자열 또는 HTMLElement
   - `anchorSkew`: 말풍선 꼬리 기울임 효과 (boolean)
   - `anchorSize`: 말풍선 꼬리 크기 (기본값: width 20, height 24)
   - `anchorColor`: 말풍선 꼬리 색상 (기본값: "#fff")
   - `backgroundColor`: 배경색 (기본값: "#fff")
   - `borderColor`: 테두리 색상 (기본값: "#333")
   - `borderWidth`: 테두리 두께 (기본값: 1)

3. **자주 하는 실수**
   - map.controls는 KVOArray 타입이므로 직접 push() 사용 불가
   - CustomControl은 HTML 문자열을 받음 (HTMLElement가 아님)
   - InfoWindow의 close 이벤트는 직접 구현해야 함

#### E2E 테스트
1. 각 task 완료 전 Playwright MCP를 사용하여 E2E 테스트 수행
2. 주요 사용자 시나리오 자동화 테스트
3. 크로스 브라우저 테스트 (Chrome, Firefox, Safari)
4. 모바일 뷰포트 테스트
5. E2E 테스트 통과 후 task를 완료 상태로 변경

### 9.2 코드 품질
- **테스트 커버리지**: 80% 이상
- **정적 분석**: ESLint + Prettier
- **타입 안정성**: TypeScript strict mode

### 9.3 코드 스타일 가이드라인

#### Import/Export 패턴
1. **상수 Export 규칙**
   ```typescript
   // ✅ 상수는 UPPER_SNAKE_CASE로 export
   export const CARD_STYLES = {
     CHILD_MEAL: { ... }
   }
   
   // ✅ Named import 사용
   import { CARD_STYLES } from '@/constants/cardStyles'
   
   // ❌ Default export 사용 금지 (상수의 경우)
   export default CARD_STYLES  // 금지
   ```

2. **컴포넌트 Export 규칙**
   ```typescript
   // ✅ React 컴포넌트는 default export
   export default function MapContainer() { ... }
   
   // ✅ 타입은 named export
   export interface MapContainerProps { ... }
   ```

3. **테스트 Mock 일관성**
   - Mock 데이터의 export 이름은 실제 코드와 동일하게 유지
   - 예: `CARD_STYLES`로 export했다면 mock도 `CARD_STYLES`로

#### 타입 정의 규칙
1. 외부 라이브러리 타입이 불완전한 경우 즉시 `.d.ts` 파일 업데이트
2. 타입 정의 시 주석으로 기본값 명시
3. 선택적 프로퍼티는 용도와 기본값 주석 추가

### 9.4 배포 전략
- **Phase 1-2**: Blue-Green
- **Phase 3+**: Canary Deployment
- **Rollback**: 자동화된 롤백
---

## 부록: 주요 명령어 및 설정

### 개발 환경 설정
```bash
# 프로젝트 실행
./gradlew bootRun

# 테스트 실행
./gradlew test

# 빌드
./gradlew build

# Docker 환경 실행
docker-compose up -d

# 데이터베이스 마이그레이션
./gradlew flywayMigrate
```

### 주요 환경 변수
```properties
# application.yml
spring.profiles.active=${SPRING_PROFILE:local}
naver.map.client-id=${NAVER_MAP_CLIENT_ID}
openai.api-key=${OPENAI_API_KEY}
redis.host=${REDIS_HOST:localhost}
```

이 기획서는 실제 개발 진행에 따라 지속적으로 업데이트됩니다.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
