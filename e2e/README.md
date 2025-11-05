# Card-Map E2E 테스트 가이드

## 개요
이 폴더는 Card-Map 프로젝트의 E2E(End-to-End) 테스트를 위한 Playwright 설정을 포함합니다.

## 폴더 구조
```
e2e/
├── tests/          # 실제 테스트 파일들 (.spec.ts)
├── fixtures/       # 테스트용 데이터
├── helpers/        # 재사용 가능한 헬퍼 함수들
└── config/         # 테스트 환경 설정
```

## 테스트 실행 방법

### 브라우저 설치 (최초 1회)
```bash
npm run playwright:install
```

### 모든 테스트 실행
```bash
npm run test:e2e
```

### UI 모드로 테스트 실행 (권장)
```bash
npm run test:e2e:ui
```

### 특정 브라우저에서만 테스트
```bash
npm run test:e2e:chromium  # Chrome
npm run test:e2e:firefox   # Firefox
npm run test:e2e:webkit    # Safari
```

### 모바일 테스트
```bash
npm run test:e2e:mobile
```

### 디버그 모드
```bash
npm run test:e2e:debug
```

### 테스트 리포트 보기
```bash
npm run test:e2e:report
```

## 테스트 작성 가이드

### 기본 테스트 구조
```typescript
import { test, expect } from '@playwright/test';

test.describe('기능명', () => {
  test('테스트 케이스 설명', async ({ page }) => {
    // 페이지 이동
    await page.goto('/');
    
    // 요소 찾기 및 상호작용
    await page.click('button');
    
    // 검증
    await expect(page).toHaveURL('/expected-url');
  });
});
```

### 헬퍼 함수 사용
```typescript
import { MapHelpers } from '../helpers/map-helpers';

test('지도 테스트', async ({ page }) => {
  const mapHelper = new MapHelpers(page);
  
  await page.goto('/map');
  await mapHelper.waitForMapLoad();
  await mapHelper.moveToLocation(37.5, 127.0);
});
```

### 테스트 데이터 사용
```typescript
import merchants from '../fixtures/merchants.json';

test('가맹점 표시', async ({ page }) => {
  const testMerchant = merchants.testMerchants[0];
  // 테스트 로직
});
```

## 베스트 프랙티스

1. **페이지 객체 패턴 사용**: 재사용 가능한 페이지 객체를 만들어 유지보수성 향상
2. **명확한 선택자 사용**: data-testid 속성을 활용한 안정적인 선택자
3. **대기 전략**: 명시적 대기(waitFor) 사용
4. **격리된 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
5. **의미있는 테스트 이름**: 테스트가 검증하는 내용을 명확히 표현

## 문제 해결

### 테스트가 실패하는 경우
1. 스크린샷 확인: `e2e/screenshots/`
2. 비디오 확인: `e2e/videos/`
3. 트레이스 확인: `npx playwright show-trace trace.zip`

### 로컬 환경과 CI 환경의 차이
- CI 환경에서는 헤드리스 모드로 실행됨
- 타임아웃 설정이 다를 수 있음
- 환경 변수 확인 필요

## 추가 리소스
- [Playwright 공식 문서](https://playwright.dev/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)