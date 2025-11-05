import { test, expect } from '@playwright/test';

// 예시 테스트 - 실제 테스트 작성 시 이 파일을 참고하세요
test.describe('Card-Map 기본 동작', () => {
  test('홈페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Card-Map/);
    
    // 메인 콘텐츠가 표시되는지 확인
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('지도 페이지로 이동할 수 있어야 한다', async ({ page }) => {
    await page.goto('/');
    
    // 지도 링크가 로드될 때까지 대기
    await page.waitForSelector('text=지도 보기');
    
    // 지도 링크 클릭
    await page.click('text=지도 보기');
    
    // URL이 변경되었는지 확인 (더 긴 timeout)
    await expect(page).toHaveURL(/.*\/map/, { timeout: 10000 });
    
    // 지도 컨테이너가 로드되었는지 확인
    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
    
    // 지도가 완전히 로드될 때까지 대기 (Naver Maps controls)
    // Naver Maps의 줌 컨트롤이 로드될 때까지 기다림
    await page.waitForSelector('img[alt="지도 확대"]', { timeout: 15000 });
    
    // 추가적으로 custom map controls 확인
    await expect(page.locator('button[title="내 위치"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[title="전체 화면"]')).toBeVisible({ timeout: 5000 });
  });
});