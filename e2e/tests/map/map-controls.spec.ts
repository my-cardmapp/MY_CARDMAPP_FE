import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects/MapPage';

test.describe('Map Controls', () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    await mapPage.goto();
  });

  test.describe('Zoom Controls', () => {
    test('should zoom in using zoom control button', async ({ page }) => {
      // Verify zoom in button is visible and clickable
      await expect(mapPage.zoomInButton).toBeVisible();
      
      // Click the zoom in button - this includes verification in the method
      await mapPage.zoomIn();
      
      // Verify the button is still functional after click
      await expect(mapPage.zoomInButton).toBeVisible();
    });

    test('should zoom out using zoom control button', async ({ page }) => {
      // Verify zoom out button is visible and clickable
      await expect(mapPage.zoomOutButton).toBeVisible();
      
      // Click the zoom out button - this includes verification in the method
      await mapPage.zoomOut();
      
      // Verify the button is still functional after click
      await expect(mapPage.zoomOutButton).toBeVisible();
    });

    test('should zoom in with double click', async ({ page }) => {
      const initialZoom = await mapPage.getZoomLevel();
      
      // Double click on map center
      const box = await mapPage.mapCanvas.boundingBox();
      if (box) {
        await mapPage.doubleClickOnMap(box.width / 2, box.height / 2);
      }
      
      const newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBeGreaterThan(initialZoom);
    });

    test('should zoom with mouse wheel', async ({ page }) => {
      const initialZoom = await mapPage.getZoomLevel();
      
      // Zoom in with wheel
      await mapPage.wheelZoom(-100);
      let newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBeGreaterThan(initialZoom);
      
      // Zoom out with wheel
      await mapPage.wheelZoom(100);
      newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBeLessThanOrEqual(initialZoom + 1);
    });

    test('should respect min/max zoom levels', async ({ page }) => {
      // Zoom to maximum
      for (let i = 0; i < 10; i++) {
        await mapPage.zoomIn();
        await page.waitForTimeout(100);
      }
      
      const maxZoom = await mapPage.getZoomLevel();
      await mapPage.zoomIn();
      const stillMaxZoom = await mapPage.getZoomLevel();
      expect(stillMaxZoom).toBe(maxZoom);
      
      // Zoom to minimum
      for (let i = 0; i < 20; i++) {
        await mapPage.zoomOut();
        await page.waitForTimeout(100);
      }
      
      const minZoom = await mapPage.getZoomLevel();
      await mapPage.zoomOut();
      const stillMinZoom = await mapPage.getZoomLevel();
      expect(stillMinZoom).toBe(minZoom);
    });

    test('should maintain center position during zoom', async ({ page }) => {
      const initialCenter = await mapPage.getCenter();
      
      await mapPage.zoomIn();
      await mapPage.zoomIn();
      
      const centerAfterZoom = await mapPage.getCenter();
      expect(centerAfterZoom?.lat).toBeCloseTo(initialCenter?.lat || 0, 4);
      expect(centerAfterZoom?.lng).toBeCloseTo(initialCenter?.lng || 0, 4);
    });
  });

  test.describe('Location Controls', () => {
    test('should get current location when clicking location button', async ({ page, context }) => {
      // Grant location permission
      await context.grantPermissions(['geolocation']);
      
      // Mock geolocation
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success) => {
          success({
            coords: {
              latitude: 37.5000,
              longitude: 127.0000,
              accuracy: 50,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          });
        };
      });
      
      await mapPage.getCurrentLocation();
      
      // Map should center on the mocked location
      const center = await mapPage.getCenter();
      expect(center?.lat).toBeCloseTo(37.5000, 3);
      expect(center?.lng).toBeCloseTo(127.0000, 3);
      
      // Zoom should increase to show detailed location
      const zoom = await mapPage.getZoomLevel();
      expect(zoom).toBeGreaterThanOrEqual(16);
    });

    test('should show loading state while getting location', async ({ page, context }) => {
      await context.grantPermissions(['geolocation']);
      
      // Mock slow geolocation
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success) => {
          setTimeout(() => {
            success({
              coords: {
                latitude: 37.5000,
                longitude: 127.0000,
                accuracy: 50,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null
              },
              timestamp: Date.now()
            });
          }, 1000);
        };
      });
      
      // Click location button
      const locationButton = mapPage.locationButton;
      await locationButton.click();
      
      // Check for loading indicator (spinner)
      const spinner = locationButton.locator('.animate-spin, [class*="spin"]');
      await expect(spinner).toBeVisible();
      
      // Wait for location to be set
      await page.waitForTimeout(1500);
      
      // Loading should be complete
      await expect(spinner).toBeHidden();
    });

    test('should handle location permission denial', async ({ page, context }) => {
      // Deny location permission
      await context.clearPermissions();
      
      // Mock permission denied
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success, error) => {
          if (error) {
            error({
              code: 1,
              message: 'User denied Geolocation',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3
            });
          }
        };
      });
      
      await mapPage.locationButton.click();
      await page.waitForTimeout(500);
      
      // Should show error message
      const errorMessage = page.locator('text=/위치 권한이 거부되었습니다/');
      await expect(errorMessage).toBeVisible();
    });

    test('should show location marker after getting position', async ({ page, context }) => {
      await context.grantPermissions(['geolocation']);
      
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success) => {
          success({
            coords: {
              latitude: 37.5000,
              longitude: 127.0000,
              accuracy: 50,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          });
        };
      });
      
      // Get marker count before
      const markersBefore = await mapPage.getVisibleMarkers();
      
      await mapPage.getCurrentLocation();
      
      // Should add a location marker
      const markersAfter = await mapPage.getVisibleMarkers();
      expect(markersAfter).toBeGreaterThan(markersBefore);
      
      // Look for location marker (usually has different style)
      const locationMarker = page.locator('[class*="location-marker"], [aria-label*="현재 위치"]');
      const hasLocationMarker = await locationMarker.count() > 0;
      
      // Either marker count increased or specific location marker exists
      expect(markersAfter > markersBefore || hasLocationMarker).toBeTruthy();
    });
  });

  test.describe('Fullscreen Controls', () => {
    test('should enter fullscreen mode', async ({ page }) => {
      // Mock fullscreen API
      await page.addInitScript(() => {
        HTMLElement.prototype.requestFullscreen = function() {
          document.dispatchEvent(new Event('fullscreenchange'));
          Object.defineProperty(document, 'fullscreenElement', {
            value: this,
            configurable: true
          });
          return Promise.resolve();
        };
      });
      
      await mapPage.toggleFullscreen();
      
      const isFullscreen = await mapPage.isFullscreen();
      expect(isFullscreen).toBeTruthy();
    });

    test('should exit fullscreen mode', async ({ page }) => {
      // Mock fullscreen API
      await page.addInitScript(() => {
        HTMLElement.prototype.requestFullscreen = function() {
          Object.defineProperty(document, 'fullscreenElement', {
            value: this,
            configurable: true
          });
          return Promise.resolve();
        };
        
        document.exitFullscreen = function() {
          document.dispatchEvent(new Event('fullscreenchange'));
          Object.defineProperty(document, 'fullscreenElement', {
            value: null,
            configurable: true
          });
          return Promise.resolve();
        };
      });
      
      // Enter fullscreen
      await mapPage.toggleFullscreen();
      let isFullscreen = await mapPage.isFullscreen();
      expect(isFullscreen).toBeTruthy();
      
      // Exit fullscreen
      await mapPage.toggleFullscreen();
      isFullscreen = await mapPage.isFullscreen();
      expect(isFullscreen).toBeFalsy();
    });

    test('should handle fullscreen API unavailability', async ({ page }) => {
      // Remove fullscreen API
      await page.addInitScript(() => {
        delete (HTMLElement.prototype as any).requestFullscreen;
        delete (document as any).exitFullscreen;
      });
      
      // Try to toggle fullscreen
      await mapPage.fullscreenButton.click();
      
      // Should handle gracefully (no errors)
      const isFullscreen = await mapPage.isFullscreen();
      expect(isFullscreen).toBeFalsy();
    });
  });

  test.describe('Pan Controls', () => {
    test('should pan map by dragging', async ({ page }) => {
      const initialCenter = await mapPage.getCenter();
      
      await mapPage.panMap('right', 200);
      
      const newCenter = await mapPage.getCenter();
      expect(newCenter?.lng).toBeLessThan(initialCenter?.lng || 0);
    });

    test('should pan map in all directions', async ({ page }) => {
      const initialCenter = await mapPage.getCenter();
      
      // Pan right
      await mapPage.panMap('right', 100);
      let center = await mapPage.getCenter();
      expect(center?.lng).toBeLessThan(initialCenter?.lng || 0);
      
      // Pan left
      await mapPage.panMap('left', 200);
      center = await mapPage.getCenter();
      expect(center?.lng).toBeGreaterThan(initialCenter?.lng || 0);
      
      // Pan up
      await mapPage.panMap('up', 100);
      center = await mapPage.getCenter();
      expect(center?.lat).toBeLessThan(initialCenter?.lat || 0);
      
      // Pan down
      await mapPage.panMap('down', 200);
      center = await mapPage.getCenter();
      expect(center?.lat).toBeGreaterThan(initialCenter?.lat || 0);
    });

    test('should update bounds after panning', async ({ page }) => {
      const initialBounds = await mapPage.getBounds();
      
      await mapPage.panMap('right', 300);
      
      const newBounds = await mapPage.getBounds();
      expect(newBounds?.west).toBeLessThan(initialBounds?.west || 0);
      expect(newBounds?.east).toBeLessThan(initialBounds?.east || 0);
    });

    test('should handle rapid panning', async ({ page }) => {
      // Perform rapid panning
      await mapPage.panMap('right', 50);
      await mapPage.panMap('left', 50);
      await mapPage.panMap('up', 50);
      await mapPage.panMap('down', 50);
      
      // Map should still be functional
      const isLoaded = await mapPage.isMapLoaded();
      expect(isLoaded).toBeTruthy();
      
      // Should be able to get center
      const center = await mapPage.getCenter();
      expect(center).toBeTruthy();
    });
  });

  test.describe('Control Visibility', () => {
    test('should show all controls on desktop', async ({ page }) => {
      await mapPage.setViewportSize(1920, 1080);
      await page.reload();
      await mapPage.waitForMapLoad();
      
      const controlsVisible = await mapPage.areControlsVisible();
      expect(controlsVisible).toBeTruthy();
      
      await expect(mapPage.locationButton).toBeVisible();
      await expect(mapPage.fullscreenButton).toBeVisible();
    });

    test('should adapt controls for mobile', async ({ page }) => {
      await mapPage.setViewportSize(375, 667);
      await page.reload();
      await mapPage.waitForMapLoad();
      
      // Controls should still be visible but may be repositioned
      const controlsVisible = await mapPage.areControlsVisible();
      expect(controlsVisible).toBeTruthy();
      
      // Check if controls are accessible
      await expect(mapPage.locationButton).toBeVisible();
      await expect(mapPage.fullscreenButton).toBeVisible();
    });

    test('should maintain control functionality after viewport resize', async ({ page }) => {
      // Start with desktop
      await mapPage.setViewportSize(1920, 1080);
      
      // Test zoom
      const initialZoom = await mapPage.getZoomLevel();
      await mapPage.zoomIn();
      expect(await mapPage.getZoomLevel()).toBe(initialZoom + 1);
      
      // Resize to mobile
      await mapPage.setViewportSize(375, 667);
      await page.waitForTimeout(500);
      
      // Test zoom again
      await mapPage.zoomOut();
      expect(await mapPage.getZoomLevel()).toBe(initialZoom);
    });
  });

  test.describe('Keyboard Controls', () => {
    test('should zoom with keyboard shortcuts', async ({ page }) => {
      const initialZoom = await mapPage.getZoomLevel();
      
      // Focus on map
      await mapPage.mapContainer.focus();
      
      // Zoom in with +
      await page.keyboard.press('+');
      await page.waitForTimeout(500);
      let newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBeGreaterThan(initialZoom);
      
      // Zoom out with -
      await page.keyboard.press('-');
      await page.waitForTimeout(500);
      newZoom = await mapPage.getZoomLevel();
      expect(newZoom).toBe(initialZoom);
    });

    test('should pan with arrow keys', async ({ page }) => {
      const initialCenter = await mapPage.getCenter();
      
      // Focus on map
      await mapPage.mapContainer.focus();
      
      // Pan with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      
      const newCenter = await mapPage.getCenter();
      // Arrow right should move map east (increase longitude)
      expect(newCenter?.lng).toBeGreaterThan(initialCenter?.lng || 0);
    });
  });
});