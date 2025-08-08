import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects/MapPage';

test.describe('Map Initialization and Loading', () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
  });

  test('should load map successfully with default settings', async ({ page }) => {
    // Navigate to map page
    await mapPage.goto();
    
    // Verify map is loaded
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Verify map container is visible
    await expect(mapPage.mapContainer).toBeVisible();
    
    // Verify canvas element exists
    await expect(mapPage.mapCanvas).toBeVisible();
    
    // Verify default zoom level (should be 15 based on code)
    const zoomLevel = await mapPage.getZoomLevel();
    expect(zoomLevel).toBe(15);
    
    // Verify default center (Seoul City Hall coordinates)
    const center = await mapPage.getCenter();
    expect(center).toBeTruthy();
    expect(center?.lat).toBeCloseTo(37.5666805, 4);
    expect(center?.lng).toBeCloseTo(126.9784147, 4);
  });

  test('should show loading skeleton while map loads', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/*', async route => {
      await page.waitForTimeout(100);
      await route.continue();
    });
    
    // Start navigation
    const navigationPromise = mapPage.navigate('/map');
    
    // Check for skeleton loader
    const isLoading = await mapPage.isLoading();
    
    // Wait for navigation to complete
    await navigationPromise;
    await mapPage.waitForMapLoad();
    
    // Skeleton should be hidden after load
    const isLoadingAfter = await mapPage.isLoading();
    expect(isLoadingAfter).toBeFalsy();
  });

  test('should handle map loading errors gracefully', async ({ page }) => {
    // Block Naver Maps script
    await page.route('**/maps.js**', route => route.abort());
    
    // Navigate to map
    await mapPage.navigate('/map');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error message
    const hasError = await mapPage.hasError();
    expect(hasError).toBeTruthy();
    
    // Verify error message text
    const errorText = await page.locator('text=/지도를 불러오는데 실패했습니다/').textContent();
    expect(errorText).toContain('지도를 불러오는데 실패했습니다');
  });

  test('should maintain map state across page refreshes', async ({ page }) => {
    await mapPage.goto();
    
    // Change zoom and center
    await mapPage.setZoom(17);
    await mapPage.setCenter(37.5700, 127.0000);
    
    // Wait for changes to be saved
    await page.waitForTimeout(500);
    
    // Get current state
    const zoomBefore = await mapPage.getZoomLevel();
    const centerBefore = await mapPage.getCenter();
    
    // Refresh page
    await mapPage.reload();
    await mapPage.waitForMapLoad();
    
    // Verify state is restored
    const zoomAfter = await mapPage.getZoomLevel();
    const centerAfter = await mapPage.getCenter();
    
    expect(zoomAfter).toBe(zoomBefore);
    expect(centerAfter?.lat).toBeCloseTo(centerBefore?.lat || 0, 4);
    expect(centerAfter?.lng).toBeCloseTo(centerBefore?.lng || 0, 4);
  });

  test('should load map controls', async ({ page }) => {
    await mapPage.goto();
    
    // Check if controls are visible
    const controlsVisible = await mapPage.areControlsVisible();
    expect(controlsVisible).toBeTruthy();
    
    // Verify individual controls
    await expect(mapPage.locationButton).toBeVisible();
    await expect(mapPage.fullscreenButton).toBeVisible();
    
    // Check for zoom controls
    const zoomControls = page.locator('.zoom-control, [class*="zoom"]');
    await expect(zoomControls).toBeVisible();
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test desktop viewport
    await mapPage.setViewportSize(1920, 1080);
    await mapPage.goto();
    
    let isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Test tablet viewport
    await mapPage.setViewportSize(768, 1024);
    await page.waitForTimeout(500);
    
    isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Test mobile viewport
    await mapPage.setViewportSize(375, 667);
    await page.waitForTimeout(500);
    
    isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Verify map adjusts to viewport
    const isMobile = mapPage.isMobile();
    expect(isMobile).toBeTruthy();
  });

  test('should load map with custom initial position from URL params', async ({ page }) => {
    // Navigate with custom coordinates
    await mapPage.navigate('/map?lat=35.1796&lng=129.0756&zoom=12');
    await mapPage.waitForMapLoad();
    
    // Verify custom position is applied
    const center = await mapPage.getCenter();
    const zoom = await mapPage.getZoomLevel();
    
    expect(center?.lat).toBeCloseTo(35.1796, 3);
    expect(center?.lng).toBeCloseTo(129.0756, 3);
    expect(zoom).toBe(12);
  });

  test('should handle rapid navigation between pages', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    
    // Quickly navigate to map
    await page.goto('/map');
    await mapPage.waitForMapLoad();
    
    // Quickly go back
    await page.goBack();
    await page.waitForTimeout(100);
    
    // Quickly go forward
    await page.goForward();
    await mapPage.waitForMapLoad();
    
    // Map should still be functional
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should properly clean up resources on unmount', async ({ page }) => {
    await mapPage.goto();
    
    // Set up console listener for cleanup logs
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });
    
    // Navigate away from map
    await page.goto('/');
    
    // Check for cleanup (no memory leaks)
    // This is a basic check - in real scenarios, you'd use memory profiling
    const hasCleanupMessage = consoleMessages.some(msg => 
      msg.includes('cleanup') || msg.includes('destroy') || msg.includes('unmount')
    );
    
    // Navigate back to ensure map can be re-initialized
    await page.goto('/map');
    await mapPage.waitForMapLoad();
    
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should show loading indicator for merchant data', async ({ page }) => {
    // Slow down API calls
    await page.route('**/api/**', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    await mapPage.goto();
    
    // Check for loading indicator
    const loadingIndicator = page.locator('text=/가맹점 정보를 불러오는 중/');
    await expect(loadingIndicator).toBeVisible();
    
    // Wait for loading to complete
    await mapPage.waitForLoadingComplete();
    
    // Loading indicator should be hidden
    await expect(loadingIndicator).toBeHidden();
  });

  test('should handle map bounds correctly', async ({ page }) => {
    await mapPage.goto();
    
    // Get initial bounds
    const bounds = await mapPage.getBounds();
    expect(bounds).toBeTruthy();
    expect(bounds?.north).toBeGreaterThan(bounds?.south || 0);
    expect(bounds?.east).toBeGreaterThan(bounds?.west || 0);
    
    // Pan the map
    await mapPage.panMap('right', 200);
    
    // Get new bounds
    const newBounds = await mapPage.getBounds();
    expect(newBounds).toBeTruthy();
    
    // Bounds should have changed
    expect(newBounds?.west).not.toBeCloseTo(bounds?.west || 0, 4);
  });

  test('should handle network interruption gracefully', async ({ page, context }) => {
    await mapPage.goto();
    
    // Go offline
    await context.setOffline(true);
    
    // Try to pan map (should still work with cached tiles)
    await mapPage.panMap('left', 100);
    
    // Map should still be visible
    const isVisible = await mapPage.mapContainer.isVisible();
    expect(isVisible).toBeTruthy();
    
    // Go back online
    await context.setOffline(false);
    
    // Map should recover
    await page.waitForTimeout(1000);
    const isLoaded = await mapPage.isMapLoaded();
    expect(isLoaded).toBeTruthy();
  });
});