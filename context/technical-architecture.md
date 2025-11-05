# Card-Map 기술 아키텍처

## 시스템 아키텍처 진화 전략

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

## 기술 스택 상세

### Backend
- **Framework**: Spring Boot 3.2
- **Language**: Java 21 (Virtual Threads 활용)
- **Database**: PostgreSQL 16 + PostGIS 3.5
- **Cache**: Redis 7 + Spring Cache
- **Search**: PostgreSQL Full-Text Search → Elasticsearch (확장시)
- **AI**: LangChain4j 0.26 + OpenAI API
- **API Docs**: SpringDoc OpenAPI 3.0
- **Testing**: JUnit 5 + Testcontainers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **State**: Zustand (경량화)
- **Map**: Naver Map SDK v3
- **Styling**: Tailwind CSS + Shadcn/ui
- **Testing**: Vitest + React Testing Library + playwright (e2e test)

### DevOps
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Spring Actuator + Prometheus + Grafana
- **Logging**: SLF4J + Logback + ELK Stack (확장시)
- **APM**: OpenTelemetry (확장시)

## 보안 전략

### 인증/인가
- **Phase 1**: Session 기반 인증
- **Phase 2+**: JWT + Refresh Token
- **소셜 로그인**: OAuth2 (Kakao, Naver)
- **권한 관리**: Spring Security + @PreAuthorize

### API 보안
- **Rate Limiting**: Bucket4j
- **CORS**: 화이트리스트 기반
- **Input Validation**: Bean Validation + 커스텀 검증
- **SQL Injection**: Prepared Statements
- **XSS**: Content Security Policy

## 최적화 기법

### Database
- Connection Pooling (HikariCP)
- 읽기 전용 복제본
- 인덱스 최적화
- Query 실행계획 분석

### Caching
- Spring Cache (Method Level)
- Redis (Session, Route)
- CDN (정적 자원)
- Browser Cache (PWA)

### Application
- Virtual Threads (Java 21)
- 비동기 처리 (@Async)
- Lazy Loading
- Response 압축 (Gzip)

### AI Cost Optimization

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

## 모니터링 및 운영

### 로깅 전략
- **구조화 로깅**: JSON 형식
- **로그 레벨**: 환경별 설정
- **중앙 집중**: ELK Stack (확장시)
- **보안 로그**: 별도 저장

### 메트릭 수집
- **Application**: Micrometer
- **System**: Node Exporter
- **Database**: pg_stat_statements
- **Custom**: 비즈니스 메트릭

### 알림 정책
- **Error Rate**: > 1%
- **Response Time**: p95 > SLA
- **AI Cost**: 일일 예산 80% 초과
- **Security**: 비정상 접근 패턴

## 개발 환경 설정

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

## 주요 환경 변수

```properties
# application.yml
spring.profiles.active=${SPRING_PROFILE:local}
naver.map.client-id=${NAVER_MAP_CLIENT_ID}
openai.api-key=${OPENAI_API_KEY}
redis.host=${REDIS_HOST:localhost}
```