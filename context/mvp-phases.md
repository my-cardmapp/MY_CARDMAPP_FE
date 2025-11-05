# Card-Map MVP 단계별 구현 전략

## Phase 1: Core Features
**목표**: 기본적인 가맹점 검색 및 지도 표시

**기능**:
- 지도 기반 가맹점 표시
- 카드별/카테고리별 필터링
- 기본 검색 (가맹점명, 주소)
- 반응형 웹 디자인

**기술**:
- Spring Boot 모놀리스
- PostgreSQL + PostGIS
- Next.js 14 + Naver Map API
- Docker Compose 개발환경

## Phase 2: Route Planning
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

## Phase 3: AI Integration
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

## Phase 4: User Features
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

## 배포 전략
- **Phase 1-2**: Blue-Green
- **Phase 3+**: Canary Deployment
- **Rollback**: 자동화된 롤백