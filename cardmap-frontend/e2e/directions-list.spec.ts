import { test, expect } from '@playwright/test';

test.describe('DirectionsList Component E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/test-directions');
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("DirectionsList Component Test")');
  });

  test('should display empty state initially', async ({ page }) => {
    // Check that the empty state message is displayed
    await expect(page.locator('text=경로를 계산하려면 출발지와 도착지를 선택하세요')).toBeVisible();
  });

  test('should show walking route when button is clicked', async ({ page }) => {
    // Click the walking route button
    await page.click('button:has-text("Show Walking Route")');
    
    // Check that the route is displayed
    await expect(page.locator('h3:has-text("경로 안내")')).toBeVisible();
    await expect(page.locator('text=도보 15분')).toBeVisible();
    await expect(page.locator('text=1.2km')).toBeVisible();
    
    // Check that steps are displayed
    await expect(page.locator('text=북쪽으로 100m 이동')).toBeVisible();
    await expect(page.locator('text=우회전 후 200m 이동')).toBeVisible();
    await expect(page.locator('text=좌회전 후 150m 이동')).toBeVisible();
    await expect(page.locator('text=목적지 도착')).toBeVisible();
  });

  test('should show transit route with transit details', async ({ page }) => {
    // Click the transit route button
    await page.click('button:has-text("Show Transit Route")');
    
    // Check that the route is displayed
    await expect(page.locator('h3:has-text("경로 안내")')).toBeVisible();
    await expect(page.locator('text=대중교통 25분')).toBeVisible();
    await expect(page.locator('text=3.5km')).toBeVisible();
    await expect(page.locator('text=₩1,250')).toBeVisible();
    
    // Check transit details
    await expect(page.locator('text=4호선')).toBeVisible();
    await expect(page.locator('text=서울역 → 명동')).toBeVisible();
    await expect(page.locator('text=2 정거장')).toBeVisible();
    
    await expect(page.locator('text=2호선')).toBeVisible();
    await expect(page.locator('text=을지로4가 → 을지로3가')).toBeVisible();
  });

  test('should toggle collapse state when header is clicked', async ({ page }) => {
    // Show a route first
    await page.click('button:has-text("Show Walking Route")');
    
    // Get the list element
    const routeList = page.locator('ul[aria-label="경로 안내 목록"]');
    
    // Check it's visible initially
    await expect(routeList).toBeVisible();
    
    // Click the toggle button
    await page.click('button[aria-label="경로 안내 토글"]');
    
    // Check it's hidden
    await expect(routeList).toBeHidden();
    
    // Click again to expand
    await page.click('button[aria-label="경로 안내 토글"]');
    
    // Check it's visible again
    await expect(routeList).toBeVisible();
  });

  test('should close directions list when close button is clicked', async ({ page }) => {
    // Show a route first
    await page.click('button:has-text("Show Walking Route")');
    
    // Check that the route is displayed
    await expect(page.locator('h3:has-text("경로 안내")')).toBeVisible();
    
    // Click the close button
    await page.click('button[aria-label="닫기"]');
    
    // Check that it shows empty state again
    await expect(page.locator('text=경로를 계산하려면 출발지와 도착지를 선택하세요')).toBeVisible();
  });

  test('should highlight current step when clicking steps', async ({ page }) => {
    // Show a route first
    await page.click('button:has-text("Show Walking Route")');
    
    // Click on a step
    await page.click('li[aria-label="2단계: 우회전 후 200m 이동"]');
    
    // Click next step button to advance
    await page.click('button:has-text("Next Step")');
    
    // Check that current step indicator is shown
    await expect(page.locator('text=Current Step: 1')).toBeVisible();
    
    // Click next step again
    await page.click('button:has-text("Next Step")');
    await expect(page.locator('text=Current Step: 2')).toBeVisible();
  });

  test('should show different icons for different step types', async ({ page }) => {
    // Show transit route for variety of icons
    await page.click('button:has-text("Show Transit Route")');
    
    // Check for different icon types
    await expect(page.locator('[data-testid="icon-walk"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="icon-subway"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="icon-transfer"]')).toBeVisible();
  });

  test('should handle clearing route', async ({ page }) => {
    // Show a route first
    await page.click('button:has-text("Show Walking Route")');
    
    // Check that the route is displayed
    await expect(page.locator('h3:has-text("경로 안내")')).toBeVisible();
    
    // Clear the route
    await page.click('button:has-text("Clear Route")');
    
    // Check that it shows empty state
    await expect(page.locator('text=경로를 계산하려면 출발지와 도착지를 선택하세요')).toBeVisible();
  });

  test('should display step numbers correctly', async ({ page }) => {
    // Show a route
    await page.click('button:has-text("Show Walking Route")');
    
    // Check that step numbers are displayed
    for (let i = 1; i <= 4; i++) {
      const stepNumber = page.locator(`.bg-blue-500.text-white.rounded-full:has-text("${i}")`);
      await expect(stepNumber).toBeVisible();
    }
  });

  test('should be scrollable for long routes', async ({ page }) => {
    // Show transit route (has more steps)
    await page.click('button:has-text("Show Transit Route")');
    
    // Check that the scroll container exists
    const scrollContainer = page.locator('[data-testid="directions-scroll-container"]');
    await expect(scrollContainer).toBeVisible();
    
    // Check it has the correct classes
    await expect(scrollContainer).toHaveClass(/overflow-y-auto/);
    await expect(scrollContainer).toHaveClass(/max-h-96/);
  });

  test('should display transit steps with different styling', async ({ page }) => {
    // Show transit route
    await page.click('button:has-text("Show Transit Route")');
    
    // Check that transit steps have special styling
    const transitStep = page.locator('li.transit-step').first();
    await expect(transitStep).toBeVisible();
    await expect(transitStep).toHaveClass(/bg-blue-50/);
  });

  test('should format distances and durations correctly', async ({ page }) => {
    // Show walking route
    await page.click('button:has-text("Show Walking Route")');
    
    // Check distance formatting
    await expect(page.locator('text=100m')).toBeVisible();
    await expect(page.locator('text=200m')).toBeVisible();
    await expect(page.locator('text=150m')).toBeVisible();
    
    // Check duration formatting
    await expect(page.locator('text=1분').first()).toBeVisible();
    await expect(page.locator('text=2분')).toBeVisible();
    await expect(page.locator('text=15분')).toBeVisible();
  });
});