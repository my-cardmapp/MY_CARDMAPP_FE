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

### 5.2 GraphQL 고려사항 (Phase 3+)
- 복잡한 쿼리 최적화
- 클라이언트별 필드 선택
- 실시간 구독 (가맹점 업데이트)

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

### 9.2 코드 품질
- **테스트 커버리지**: 80% 이상
- **정적 분석**: ESLint + Prettier
- **타입 안정성**: TypeScript strict mode

### 9.3 배포 전략
- **Phase 1-2**: Blue-Green
- **Phase 3+**: Canary Deployment
- **Rollback**: 자동화된 롤백

## 10. 예상 비용 및 ROI

### 10.1 인프라 비용 (월간)
- **서버**: ₩200,000 (AWS t3.large x2)
- **DB**: ₩150,000 (RDS + ElastiCache)
- **AI API**: ₩300,000 (OpenAI, 캐싱 적용)
- **지도 API**: ₩100,000 (Naver)
- **총계**: ₩750,000/월

### 10.2 비용 최적화
- **서버리스 전환**: Lambda + RDS Proxy (-30%)
- **Reserved Instances**: 1년 약정 (-40%)
- **AI 캐싱 강화**: 히트율 80% 목표 (-60%)

### 10.3 수익 모델 (Phase 4+)
- **B2B**: 카드사 제휴 (가맹점 추천)
- **B2C**: 프리미엄 기능 (광고 제거, 고급 경로)
- **B2G**: 정부/지자체 라이선스

## 11. 리스크 관리

### 11.1 기술적 리스크
- **데이터 정확성**: 정기적 검증 시스템
- **AI 의존성**: Fallback 로직 구현
- **확장성**: 모듈화 설계

### 11.2 사업적 리스크
- **경쟁자 진입**: 빠른 MVP 출시
- **규제 변화**: 유연한 아키텍처
- **사용자 획득**: SEO + 바이럴 마케팅

## 12. 성공 지표 (KPI)

### 12.1 Phase 1 (2개월)
- MAU: 1,000명
- 검색 정확도: 95%
- 페이지 로드: < 2초

### 12.2 Phase 2 (3개월)
- MAU: 5,000명
- 경로 사용률: 30%
- 앱 설치: 1,000건

### 12.3 Phase 3 (4.5개월)
- MAU: 20,000명
- AI 사용률: 50%
- NPS: 40+

### 12.4 Phase 4 (5.5개월)
- MAU: 50,000명
- 유료 전환: 5%
- 제휴 가맹점: 100개

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
