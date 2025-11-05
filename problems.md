# Card-Map 프로젝트 이슈 트래킹

## 현재 이슈 목록

### 1. 테스트 실패 이슈 (Priority: High)
**발생일**: 2025-09-24
**상태**: 진행중
**Task**: Task 6 - Frontend Testing Infrastructure

#### ClusterManager 테스트 실패 (6개)
- **파일**: `src/services/ClusterManager.test.ts`
- **실패 테스트**:
  1. "should show individual markers at high zoom levels" - expected 0 to be 3
  2. "should filter clusters by card type" - expected 0 to be 2
  3. "should clear filters" - expected 0 to be 2
  4. "should handle multiple card type filters" - expected 0 to be 3
  5. "should handle 10,000+ merchants efficiently" - expected 0 to be greater than 0
  6. "should handle merchants at exact same location" - expected 0 to be 1

**원인 분석**:
- 클러스터링 알고리즘이 예상대로 동작하지 않음
- 필터링 로직이 테스트 환경에서 제대로 적용되지 않음
- Mock 데이터 설정 문제 가능성

#### ViewportMarkerRenderer 초기화 오류
- **파일**: `src/services/ViewportMarkerRenderer.test.ts`
- **오류**: "Failed to create marker for pool: Error: Marker creation failed"
- **원인**: Naver Maps API Mock이 테스트 환경에서 제대로 설정되지 않음

### 2. 지도 렌더링 이슈 (Priority: Medium)
**발생일**: 2025-09-22
**상태**: 부분 해결

#### 사이드바 토글 시 지도 회색 영역
- **현상**: 사이드바를 닫을 때 지도 일부가 회색으로 표시
- **임시 해결**: ResizeObserver 적용 및 다중 refresh 호출
- **근본 해결 필요**: Naver Maps API의 resize 이벤트 처리 최적화 필요

### 3. 성능 이슈 (Priority: Low)
**발생일**: 2025-09-20
**상태**: 모니터링 중

#### 초기 로딩 지연
- **현상**: 간헐적으로 지도 초기 로딩이 지연됨
- **원인**: Naver Maps SDK 스크립트 로딩 타이밍
- **현재 대응**: 15초 타임아웃 설정

## 해결된 이슈

### ~~무한 렌더링 루프~~ (Resolved: 2025-09-10)
- **해결**: MapContext에서 useRef 패턴 적용으로 해결
- **관련 Task**: Task 4, Task 10

### ~~10,000+ 마커 성능 문제~~ (Resolved: 2025-08-10)
- **해결**: ViewportMarkerRenderer + ClusterManager 구현
- **관련 Task**: Task 4

## 개선 제안

1. **테스트 환경 개선**
   - Naver Maps API Mock 개선
   - 테스트용 fixture 데이터 표준화
   - E2E 테스트 확대 (현재 10개 → 목표 20개)

2. **성능 최적화**
   - 지도 초기화 로직 개선
   - 번들 크기 최적화 (현재 분석 필요)
   - 이미지 최적화 (WebP 변환)

3. **사용자 경험**
   - 로딩 상태 UI 개선
   - 오프라인 지원 추가 (PWA)
   - 모바일 최적화 강화

## 참고 링크
- [TaskMaster Tasks](/.taskmaster/tasks/tasks.json)
- [테스트 커버리지 리포트](/coverage/index.html)
- [E2E 테스트 리포트](/playwright-report/index.html)