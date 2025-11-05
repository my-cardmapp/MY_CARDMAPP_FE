# Card-Map 프로젝트

## 1. 프로젝트 개요

Card-Map은 한국의 복지카드 및 지역화폐 사용자들이 가맹점을 쉽게 찾고, 자연어로 경로를 계획할 수 있도록 돕는 웹 애플리케이션입니다.

### 핵심 가치 제안
- **문제**: 복지카드 사용자들이 가맹점을 찾기 어려움 (특히 아동급식카드)
- **해결**: 전국 가맹점 데이터를 지도에 표시하고, AI 기반 자연어 검색 제공
- **차별점**: 다중 카드 지원, 경로 최적화, 음성 검색

## 2. 현재 구현 상태

### 기술 스택
- **Frontend Framework**: Next.js 15.4.4, React 19.1.0
- **상태관리**: Zustand 5.0.7 (Context API에서 마이그레이션 완료)
- **스타일링**: Tailwind CSS 4.0
- **테스팅**: Vitest 3.2.4, Playwright 1.54.1
- **Mock API**: MSW 2.10.4

### Frontend 구현 완료된 컴포넌트

#### 지도 관련
- **MapContainer**: 네이버 지도 메인 컨테이너 (ViewportMarkerRenderer 통합)
- **NaverMapScript**: 네이버 지도 SDK 로딩 관리
- **MapContext**: 전역 지도 상태 관리 (useRef 패턴 적용)
- **ViewportMarkerRenderer**: 뷰포트 기반 마커 렌더링 (10,000+ 마커 처리)
- **ClusterManager**: Supercluster 기반 마커 클러스터링
- **MapControls**: 지도 컨트롤 UI
- **RouteLayer**: 경로 시각화 레이어
- **MerchantInfoWindow**: 가맹점 정보 팝업

#### 검색 및 필터
- **SearchBar**: 디바운싱 적용 검색창
- **AutocompleteDropdown**: 자동완성 드롭다운 (키보드 네비게이션)
- **FilterPanel**: 카드타입/카테고리 필터 패널
- **SearchResults**: 검색 결과 표시 컴포넌트

#### 경로 계획
- **RoutePlanner**: 경로 계획 메인 컴포넌트
- **WaypointList**: 드래그앤드롭 경유지 관리
- **DirectionsList**: 턴바이턴 방향 안내
- **ShareRouteButton**: 경로 공유 기능
- **SavedRoutesList**: 저장된 경로 목록

#### 가맹점 관련
- **MerchantList**: 가상 스크롤링 적용 가맹점 목록
- **MerchantCard**: 개별 가맹점 카드 컴포넌트

### 상태 관리 (Zustand)
- **mapStore**: 지도 인스턴스, 뷰포트, 마커 관리
- **merchantStore**: 가맹점 데이터, 필터링, 페이지네이션
- **searchStore**: 검색 쿼리, 자동완성, 검색 결과

### Mock API 구현 (MSW)
- `/api/v1/merchants`: 가맹점 목록 조회
- `/api/v1/merchants/nearby`: 근처 가맹점 검색
- `/api/v1/merchants/search`: 가맹점 검색
- `/api/v1/cards`: 카드 정보 조회
- `/api/v1/routes/calculate`: 경로 계산
- `/api/v1/suggestions/search`: 검색 자동완성
- `/api/v1/suggestions/categories`: 카테고리 목록

### 테스트 현황
- **단위 테스트**: 82개 (일부 실패 존재)
- **E2E 테스트**: 10개 (Playwright)
- **주요 테스트 실패**:
  - ClusterManager 일부 테스트 (6개)
  - ViewportMarkerRenderer 마커 풀 초기화

### 알려진 이슈
1. **테스트 환경 이슈**: ClusterManager 테스트 6개 실패
2. **지도 초기화 타이밍**: 간헐적 로딩 지연
3. **사이드바 토글 렌더링**: ResizeObserver로 개선했으나 완벽하지 않음

## 3. 개발 프로세스 (중요)
1. task master mcp로 어떤 작업을 해야 할지 파악한다. (단, 사용자가 task master로 진행하고 했을 때로 한정한다.)
2. 코드 구현 전에 구현할 기능과 관련된 코드들을 읽어보며 프로젝트를 이해한다.
3. tdd 워크플로우를 진행한다.
4. e2e 워크플로우를 진행한다.
5. 모든 기능이 정상 동작한다면 git 워크플로우를 적용한다.


### Task Master 중심 워크플로우
1. **작업 시작**: `mcp task-master next`로 다음 작업 확인
2. **복잡도 확인**: complexity ≥ 7인 task는 반드시 subtask로 분해
3. **작업 상태 관리**:
   - 시작: `mcp task-master set-status --id=<id> --status=in-progress`
   - 완료: `mcp task-master set-status --id=<id> --status=done`
4. **구현 기록**: `mcp task-master update-subtask --id=<id> --prompt="구현 내용"`

### Git 워크플로우
- **브랜치 전략**: main 브랜치 직접 작업 금지, feature/[기능명] 브랜치 사용
- **커밋 규칙**: gitmoji 사용 필수, 제목만 작성, 기능 단위 atomic 커밋

### TDD(Test-Driven Development)
1. 테스트 파일 먼저 작성
2. 테스트 실패 확인
3. 최소한의 코드로 테스트 통과
4. 리팩토링

### e2e test flow
모든 작업의 마지막은 e2e 테스트를 진행한다. 
1. 기본적으로는 playwright mcp를 사용하여 구현한 기능들에 대해 정상 동작 여부를 테스트한다.
2. 만약 e2e 테스트를 통과였다면 e2e 테스트 자동화를 위해 playwright test 코드를 작성한다.
3. 만약 e2e 테스트 실패 하였다면 이를 고치기 위해 코드를 수정한다.

### 라이브러리 사용법 조회
Context7 MCP를 활용하여 최신 문서 확인:
1. `mcp__Context7__resolve-library-id`로 라이브러리 ID 검색
2. `mcp__Context7__get-library-docs`로 상세 문서 조회

## 4. Naver Maps API 사용 가이드라인

### 커스텀 컨트롤 추가
```typescript
// ✅ 올바른 방법
const customControl = new naver.maps.CustomControl('<div>HTML</div>', {
  position: naver.maps.Position.TOP_LEFT
})
customControl.setMap(map)

// ❌ 잘못된 방법
map.controls[naver.maps.Position.TOP_LEFT].push(control)
```

### InfoWindow 주요 옵션
- `content`: HTML 문자열 또는 HTMLElement
- `anchorSkew`: 말풍선 꼬리 기울임 효과
- `backgroundColor`: 배경색 (기본: "#fff")
- `borderColor`: 테두리 색상 (기본: "#333")

## 5. 코드 스타일 가이드라인

### Import/Export 패턴
```typescript
// ✅ 상수는 UPPER_SNAKE_CASE로 export
export const CARD_STYLES = { ... }

// ✅ React 컴포넌트는 default export
export default function MapContainer() { ... }

// ✅ 타입은 named export
export interface MapContainerProps { ... }
```

## 6. 중요 명령어 사용 주의사항

1. **npm run dev는 항상 백그라운드에서 실행**
   - `npm run dev &` 사용
   - 시작 후 2-3분 대기 필요
   - 포트 충돌시 `ss -nltp | grep 3000`으로 PID 확인 후 `kill` 사용
   - 3000 포트를 사용하지 않으면 naver api 인증 실패 문제 발생하니 반드시 3000번 사용할 것

2. **vitest는 package.json 스크립트 사용**
   - `npm test` 또는 `npm run test:*` 명령 사용

3. **2>&1 사용 금지** (필터 오류 발생)

## 7. 외부 문서 참조

### 기술 상세 문서
해당 정보가 필요한 경우에 찾아 읽어라 (각 md 파일에는 제목과 관련된 세부사항이 들이 적혀 있다)
- **API 명세**: context/api-specification.md
- **데이터베이스 설계**: context/database-design.md
- **기술 아키텍처**: context/technical-architecture.md
- **MVP 단계별 전략**: context/mvp-phases.md

## 8. Task Master AI Instructions
./.taskmaster/CLAUDE.md