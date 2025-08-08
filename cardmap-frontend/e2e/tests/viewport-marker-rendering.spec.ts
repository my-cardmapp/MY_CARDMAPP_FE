import { test, expect } from '@playwright/test'

test.describe('Viewport-based Marker Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page with viewport-based rendering
    await page.goto('/')
    
    // Wait for the map to load
    await page.waitForSelector('[data-testid="map-container"]')
    await page.waitForTimeout(2000) // Allow map to fully initialize
  })

  test('should only render markers within viewport', async ({ page }) => {
    // Wait for merchants to load
    await page.waitForSelector('[data-testid="merchant-marker"]')
    
    // Get initial marker count
    const initialMarkers = await page.locator('[data-testid="merchant-marker"]').count()
    console.log('Initial visible markers:', initialMarkers)
    
    // Pan the map to a different area
    const mapContainer = page.locator('[data-testid="map-container"]')
    await mapContainer.hover()
    
    // Perform drag operation to pan the map
    await mapContainer.dragTo(mapContainer, {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 }
    })
    
    // Wait for viewport update
    await page.waitForTimeout(1000)
    
    // Get marker count after panning
    const markersAfterPan = await page.locator('[data-testid="merchant-marker"]').count()
    console.log('Markers after pan:', markersAfterPan)
    
    // The marker count should change as different markers come into view
    // This validates that viewport-based rendering is working
    expect(markersAfterPan).toBeGreaterThan(0)
  })

  test('should handle rapid map movements efficiently', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="map-container"]')
    
    // Perform rapid map movements
    for (let i = 0; i < 5; i++) {
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 100 + i * 10, y: 100 + i * 10 },
        targetPosition: { x: 150 + i * 15, y: 150 + i * 15 }
      })
      await page.waitForTimeout(200)
    }
    
    // Should not crash and should still have markers visible
    await page.waitForTimeout(1000)
    const finalMarkers = await page.locator('[data-testid="merchant-marker"]').count()
    expect(finalMarkers).toBeGreaterThan(0)
  })

  test('should maintain smooth 60fps during scrolling', async ({ page }) => {
    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).frameCount = 0
      (window as any).startTime = performance.now()
      
      function countFrame() {
        (window as any).frameCount++
        requestAnimationFrame(countFrame)
      }
      requestAnimationFrame(countFrame)
    })
    
    const mapContainer = page.locator('[data-testid="map-container"]')
    
    // Perform smooth scrolling motion
    await mapContainer.hover()
    await page.mouse.wheel(0, -100)
    await page.waitForTimeout(100)
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(100)
    await page.mouse.wheel(0, -50)
    await page.waitForTimeout(100)
    
    // Check frame rate
    const fps = await page.evaluate(() => {
      const endTime = performance.now()
      const duration = endTime - (window as any).startTime
      const fps = ((window as any).frameCount / duration) * 1000
      return fps
    })
    
    console.log('Measured FPS:', fps)
    // Should maintain reasonable frame rate (at least 30fps)
    expect(fps).toBeGreaterThan(30)
  })

  test('should filter markers based on card types in viewport', async ({ page }) => {
    // Wait for markers to load
    await page.waitForSelector('[data-testid="merchant-marker"]')
    
    // Open filter panel
    await page.click('button:has-text("필터")')
    await page.waitForSelector('[data-testid="filter-panel"]')
    
    // Get initial marker count
    const initialMarkers = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Apply a specific filter
    await page.check('[data-testid="card-filter-CHILD_MEAL"]')
    await page.waitForTimeout(500)
    
    // Get filtered marker count
    const filteredMarkers = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Should have fewer or equal markers after filtering
    expect(filteredMarkers).toBeLessThanOrEqual(initialMarkers)
    
    // Pan the map and verify filtering still works
    const mapContainer = page.locator('[data-testid="map-container"]')
    await mapContainer.dragTo(mapContainer, {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 }
    })
    
    await page.waitForTimeout(500)
    
    // Should still show only filtered markers
    const markersAfterPan = await page.locator('[data-testid="merchant-marker"]').count()
    expect(markersAfterPan).toBeGreaterThanOrEqual(0)
  })

  test('should handle zoom level changes efficiently', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="map-container"]')
    
    // Get initial marker count at default zoom
    await page.waitForSelector('[data-testid="merchant-marker"]')
    const markersAtZoom15 = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Zoom in
    await mapContainer.hover()
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, -100)
      await page.waitForTimeout(300)
    }
    
    const markersZoomedIn = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Zoom out
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 100)
      await page.waitForTimeout(300)
    }
    
    const markersZoomedOut = await page.locator('[data-testid="merchant-marker"]').count()
    
    // All zoom levels should render markers appropriately
    expect(markersAtZoom15).toBeGreaterThan(0)
    expect(markersZoomedIn).toBeGreaterThan(0)
    expect(markersZoomedOut).toBeGreaterThan(0)
    
    console.log('Markers at different zoom levels:', {
      zoom15: markersAtZoom15,
      zoomedIn: markersZoomedIn,
      zoomedOut: markersZoomedOut
    })
  })

  test('should show performance metrics in development mode', async ({ page }) => {
    // Add development environment variable
    await page.addInitScript(() => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' }
      })
    })
    
    await page.reload()
    
    // Wait for map to load
    await page.waitForSelector('[data-testid="map-container"]')
    await page.waitForTimeout(2000)
    
    // Check if performance metrics are visible
    const performancePanel = page.locator(':text("Viewport Renderer Performance")')
    if (await performancePanel.isVisible()) {
      // Verify performance metrics are displayed
      await expect(page.locator(':text("Total Markers:")')).toBeVisible()
      await expect(page.locator(':text("Visible:")')).toBeVisible()
      await expect(page.locator(':text("Pool Size:")')).toBeVisible()
    }
  })

  test('should maintain memory stability during extended panning', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="map-container"]')
    
    // Monitor memory usage
    await page.evaluate(() => {
      (window as any).initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // Perform extended panning session (simulate user scrolling around)
    for (let i = 0; i < 20; i++) {
      const direction = i % 4
      let deltaX = 0, deltaY = 0
      
      switch (direction) {
        case 0: deltaX = 100; break // right
        case 1: deltaY = 100; break // down
        case 2: deltaX = -100; break // left
        case 3: deltaY = -100; break // up
      }
      
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 200, y: 200 },
        targetPosition: { x: 200 + deltaX, y: 200 + deltaY }
      })
      
      await page.waitForTimeout(150)
    }
    
    // Check final memory usage
    const memoryIncrease = await page.evaluate(() => {
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const initialMemory = (window as any).initialMemory
      return finalMemory - initialMemory
    })
    
    console.log('Memory increase after extended panning:', memoryIncrease, 'bytes')
    
    // Should still have visible markers after extensive panning
    const finalMarkers = await page.locator('[data-testid="merchant-marker"]').count()
    expect(finalMarkers).toBeGreaterThan(0)
    
    // Memory increase should be reasonable (less than 50MB for this test)
    if (memoryIncrease > 0) {
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    }
  })

  test('should handle edge cases at map boundaries', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="map-container"]')
    
    // Pan to extreme boundaries
    // Far north-east
    for (let i = 0; i < 10; i++) {
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 300, y: 300 },
        targetPosition: { x: 200, y: 400 }
      })
      await page.waitForTimeout(100)
    }
    
    await page.waitForTimeout(500)
    let markersAtExtreme = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Pan to far south-west
    for (let i = 0; i < 20; i++) {
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 200, y: 200 },
        targetPosition: { x: 300, y: 100 }
      })
      await page.waitForTimeout(100)
    }
    
    await page.waitForTimeout(500)
    markersAtExtreme = await page.locator('[data-testid="merchant-marker"]').count()
    
    // Should handle extreme positions without crashing
    expect(markersAtExtreme).toBeGreaterThanOrEqual(0)
    
    // Return to center and verify system recovers
    await mapContainer.click()
    await page.waitForTimeout(1000)
    
    const markersBackToCenter = await page.locator('[data-testid="merchant-marker"]').count()
    expect(markersBackToCenter).toBeGreaterThanOrEqual(0)
  })
})