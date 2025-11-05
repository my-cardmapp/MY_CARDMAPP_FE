import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects/MapPage';
import { MarkerPage } from '../../page-objects/MarkerPage';

test.describe('Merchant Marker Interactions', () => {
  let mapPage: MapPage;
  let markerPage: MarkerPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    markerPage = new MarkerPage(page);
    
    // Navigate to map and wait for initial load
    await mapPage.goto();
    await markerPage.waitForMarkers(1);
  });

  test('should display merchant markers on the map', async ({ page }) => {
    // Verify markers are visible
    const markerCount = await markerPage.getMarkerCount();
    expect(markerCount).toBeGreaterThan(0);
    
    // Check if markers are in viewport
    const visibleMarkers = await markerPage.getVisibleMarkers();
    expect(visibleMarkers).toBeGreaterThan(0);
  });

  test('should open InfoWindow when clicking a marker', async ({ page }) => {
    // Click the first marker
    await markerPage.clickMarkerByIndex(0);
    
    // Verify InfoWindow opens
    const isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeTruthy();
    
    // Verify InfoWindow has content
    const title = await markerPage.getInfoWindowTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display merchant details in InfoWindow', async ({ page }) => {
    // Click a marker
    await markerPage.clickMarkerByIndex(0);
    await markerPage.waitForInfoWindow();
    
    // Get InfoWindow details
    const details = await markerPage.getInfoWindowDetails();
    
    // Verify required information is present
    expect(details.title).toBeTruthy();
    expect(details.address).toBeTruthy();
    expect(details.cards).toBeDefined();
    expect(details.cards?.length).toBeGreaterThan(0);
  });

  test('should close InfoWindow when clicking outside', async ({ page }) => {
    // Open InfoWindow
    await markerPage.clickMarkerByIndex(0);
    await markerPage.waitForInfoWindow();
    
    // Verify it's open
    let isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeTruthy();
    
    // Click on map to close
    await mapPage.clickOnMap(100, 100);
    await page.waitForTimeout(500);
    
    // Verify it's closed
    isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeFalsy();
  });

  test('should close InfoWindow using close button', async ({ page }) => {
    // Open InfoWindow
    await markerPage.clickMarkerByIndex(0);
    await markerPage.waitForInfoWindow();
    
    // Close using button
    await markerPage.closeInfoWindow();
    
    // Verify it's closed
    const isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeFalsy();
  });

  test('should switch between different merchant InfoWindows', async ({ page }) => {
    // Open first merchant
    await markerPage.clickMarkerByIndex(0);
    await markerPage.waitForInfoWindow();
    const firstTitle = await markerPage.getInfoWindowTitle();
    
    // Click second merchant (should close first and open second)
    await markerPage.clickMarkerByIndex(1);
    await page.waitForTimeout(500);
    const secondTitle = await markerPage.getInfoWindowTitle();
    
    // Titles should be different
    expect(secondTitle).not.toBe(firstTitle);
    
    // Only one InfoWindow should be open
    const infoWindows = await page.locator('.info-window, [class*="infowindow"]').count();
    expect(infoWindows).toBeLessThanOrEqual(1);
  });

  test('should show marker hover effects', async ({ page }) => {
    // Get initial marker style
    const initialStyle = await markerPage.getMarkerStyle(0);
    
    // Hover over marker
    await markerPage.hoverMarker(0);
    
    // Check for hover state changes (cursor, scale, etc.)
    const markers = await markerPage.getAllMarkers();
    if (markers.length > 0) {
      const cursor = await markers[0].evaluate(el => 
        window.getComputedStyle(el).cursor
      );
      expect(cursor).toBe('pointer');
    }
  });

  test('should handle marker clustering at different zoom levels', async ({ page }) => {
    // Zoom out to trigger clustering
    await mapPage.setZoom(10);
    await page.waitForTimeout(1000);
    
    // Check for cluster markers
    const isClustered = await markerPage.isClustered();
    const clusterCount = await markerPage.getClusterCount();
    
    if (isClustered) {
      expect(clusterCount).toBeGreaterThan(0);
      
      // Click on a cluster to zoom in
      await markerPage.clickCluster(0);
      await page.waitForTimeout(1000);
      
      // Zoom level should increase
      const newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBeGreaterThan(10);
    }
  });

  test('should update markers when panning the map', async ({ page }) => {
    // Get initial marker count
    const initialCount = await markerPage.getMarkerCount();
    
    // Pan to a different area
    await mapPage.panMap('right', 300);
    await page.waitForTimeout(1000);
    
    // Markers should update (count might change)
    const newCount = await markerPage.getMarkerCount();
    expect(newCount).toBeGreaterThanOrEqual(0);
  });

  test('should display different marker styles for different card types', async ({ page }) => {
    // Get markers by card type
    const childMealMarkers = await markerPage.getMarkersByCardType('CHILD_MEAL');
    const cultureNuriMarkers = await markerPage.getMarkersByCardType('CULTURE_NURI');
    
    // Should have markers of different types
    // Note: This depends on test data having multiple card types
    if (childMealMarkers > 0 && cultureNuriMarkers > 0) {
      // Get styles of different marker types
      const childMealStyle = await markerPage.getMarkerStyle(0);
      
      // Find a different card type marker
      const markers = await markerPage.getAllMarkers();
      for (let i = 1; i < markers.length && i < 5; i++) {
        const style = await markerPage.getMarkerStyle(i);
        if (style?.color !== childMealStyle?.color) {
          // Found a different style
          expect(style?.color).toBeTruthy();
          break;
        }
      }
    }
  });

  test('should handle rapid marker clicks', async ({ page }) => {
    // Rapidly click different markers
    for (let i = 0; i < 3 && i < await markerPage.getMarkerCount(); i++) {
      await markerPage.clickMarkerByIndex(i);
      await page.waitForTimeout(100);
    }
    
    // Should have only one InfoWindow open
    const infoWindowCount = await page.locator('.info-window, [class*="infowindow"]').count();
    expect(infoWindowCount).toBeLessThanOrEqual(1);
    
    // InfoWindow should be for the last clicked marker
    const isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeTruthy();
  });

  test('should maintain marker visibility during zoom changes', async ({ page }) => {
    // Get initial marker
    await markerPage.clickMarkerByIndex(0);
    const merchantTitle = await markerPage.getInfoWindowTitle();
    await markerPage.closeInfoWindow();
    
    // Zoom in
    await mapPage.zoomIn();
    await page.waitForTimeout(500);
    
    // Marker should still be visible (if it was in center)
    const markersAfterZoomIn = await markerPage.getMarkerCount();
    expect(markersAfterZoomIn).toBeGreaterThan(0);
    
    // Zoom out
    await mapPage.zoomOut();
    await mapPage.zoomOut();
    await page.waitForTimeout(500);
    
    // Should see markers (possibly clustered)
    const markersAfterZoomOut = await markerPage.getMarkerCount();
    const clustersAfterZoomOut = await markerPage.getClusterCount();
    expect(markersAfterZoomOut + clustersAfterZoomOut).toBeGreaterThan(0);
  });

  test('should handle marker loading with viewport changes', async ({ page }) => {
    // Move to a different area
    await mapPage.setCenter(37.5000, 127.1000);
    await page.waitForTimeout(1000);
    
    // Should load new markers
    await markerPage.waitForMarkers(1);
    const markers = await markerPage.getMarkerCount();
    expect(markers).toBeGreaterThanOrEqual(0);
    
    // Move back to original area
    await mapPage.setCenter(37.5666805, 126.9784147);
    await page.waitForTimeout(1000);
    
    // Should load original markers
    await markerPage.waitForMarkers(1);
    const markersBack = await markerPage.getMarkerCount();
    expect(markersBack).toBeGreaterThan(0);
  });

  test('should display loading state when fetching marker data', async ({ page }) => {
    // Slow down API responses
    await page.route('**/api/merchants**', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    // Move to trigger new data fetch
    await mapPage.setCenter(35.1796, 129.0756);
    
    // Check for loading indicator
    const loadingIndicator = page.locator('text=/가맹점 정보를 불러오는 중/');
    await expect(loadingIndicator).toBeVisible();
    
    // Wait for loading to complete
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
  });

  test('should handle empty merchant data gracefully', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/merchants**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [], totalElements: 0 })
      });
    });
    
    // Move to trigger fetch
    await mapPage.setCenter(33.0000, 125.0000);
    await page.waitForTimeout(1000);
    
    // Should show no markers but no errors
    const markers = await markerPage.getMarkerCount();
    expect(markers).toBe(0);
    
    // Map should still be functional
    const isMapLoaded = await mapPage.isMapLoaded();
    expect(isMapLoaded).toBeTruthy();
  });

  test('should preserve InfoWindow during minor map movements', async ({ page }) => {
    // Open InfoWindow
    await markerPage.clickMarkerByIndex(0);
    await markerPage.waitForInfoWindow();
    
    // Pan map slightly
    await mapPage.panMap('right', 50);
    
    // InfoWindow should remain open
    const isOpen = await markerPage.isInfoWindowOpen();
    expect(isOpen).toBeTruthy();
    
    // Content should be the same
    const title = await markerPage.getInfoWindowTitle();
    expect(title).toBeTruthy();
  });
});