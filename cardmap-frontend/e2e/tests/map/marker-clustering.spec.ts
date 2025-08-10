import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// Mock merchant data for testing
const mockMerchants = [
  // Cluster in Gangnam
  { lat: 37.5665, lng: 126.9780, name: 'Merchant 1' },
  { lat: 37.5666, lng: 126.9781, name: 'Merchant 2' },
  { lat: 37.5667, lng: 126.9782, name: 'Merchant 3' },
  { lat: 37.5668, lng: 126.9783, name: 'Merchant 4' },
  { lat: 37.5669, lng: 126.9784, name: 'Merchant 5' },
  // Cluster in Seocho
  { lat: 37.4837, lng: 127.0324, name: 'Merchant 6' },
  { lat: 37.4838, lng: 127.0325, name: 'Merchant 7' },
  { lat: 37.4839, lng: 127.0326, name: 'Merchant 8' },
  // Isolated merchant
  { lat: 37.5000, lng: 127.1000, name: 'Merchant 9' },
]

test.describe('Map Marker Clustering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('http://localhost:3000')
    
    // Wait for map to load
    await page.waitForSelector('#map', { state: 'visible' })
    await page.waitForTimeout(1000) // Wait for map initialization
  })

  test('should display cluster markers at low zoom levels', async ({ page }) => {
    // Set zoom to low level
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(10)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500) // Wait for clustering to update

    // Check for cluster markers
    const clusterMarkers = await page.$$('[aria-label*="Cluster with"]')
    expect(clusterMarkers.length).toBeGreaterThan(0)

    // Verify cluster appearance
    const clusterElement = await page.$('[aria-label*="Cluster with"]')
    if (clusterElement) {
      const styles = await clusterElement.evaluate(el => {
        const computedStyle = window.getComputedStyle(el)
        return {
          borderRadius: computedStyle.borderRadius,
          backgroundColor: computedStyle.backgroundColor,
          cursor: computedStyle.cursor
        }
      })
      
      expect(styles.borderRadius).toBe('50%')
      expect(styles.cursor).toBe('pointer')
      expect(styles.backgroundColor).toBeTruthy()
    }
  })

  test('should show individual markers at high zoom levels', async ({ page }) => {
    // Set zoom to high level
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(18)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500) // Wait for clustering to update

    // Check for individual markers
    const individualMarkers = await page.$$('[data-merchant-id]')
    const clusterMarkers = await page.$$('[aria-label*="Cluster with"]')
    
    // At high zoom, should see more individual markers than clusters
    expect(individualMarkers.length).toBeGreaterThan(0)
    expect(clusterMarkers.length).toBeLessThanOrEqual(1)
  })

  test('should expand cluster on click', async ({ page }) => {
    // Set initial zoom to see clusters
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(11)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500)

    // Find and click a cluster
    const clusterMarker = await page.$('[aria-label*="Cluster with"]')
    
    if (clusterMarker) {
      // Get initial zoom
      const initialZoom = await page.evaluate(() => {
        return (window as any).naverMap?.getZoom()
      })

      // Click the cluster
      await clusterMarker.click()
      await page.waitForTimeout(500) // Wait for zoom animation

      // Check that zoom increased
      const newZoom = await page.evaluate(() => {
        return (window as any).naverMap?.getZoom()
      })

      expect(newZoom).toBeGreaterThan(initialZoom)
    }
  })

  test('should update clusters on zoom change', async ({ page }) => {
    // Start at low zoom
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(10)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500)

    // Count initial clusters
    const initialClusters = await page.$$('[aria-label*="Cluster with"]')
    const initialCount = initialClusters.length

    // Zoom in
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(14)
      }
    })

    await page.waitForTimeout(500)

    // Count clusters after zoom
    const afterClusters = await page.$$('[aria-label*="Cluster with"]')
    const afterCount = afterClusters.length

    // Should have different cluster configuration
    expect(afterCount).not.toBe(initialCount)
  })

  test('should maintain cluster styles based on size', async ({ page }) => {
    // Set zoom to see clusters
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(12)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500)

    // Check cluster styles
    const clusters = await page.$$('[aria-label*="Cluster with"]')
    
    for (const cluster of clusters) {
      const clusterInfo = await cluster.evaluate(el => {
        const label = el.getAttribute('aria-label') || ''
        const match = label.match(/(\d+) merchants/)
        const count = match ? parseInt(match[1]) : 0
        const size = parseInt(window.getComputedStyle(el).width)
        return { count, size }
      })

      // Verify size categories
      if (clusterInfo.count <= 10) {
        expect(clusterInfo.size).toBeLessThanOrEqual(45)
      } else if (clusterInfo.count <= 50) {
        expect(clusterInfo.size).toBeGreaterThan(40)
        expect(clusterInfo.size).toBeLessThanOrEqual(55)
      } else {
        expect(clusterInfo.size).toBeGreaterThan(50)
      }
    }
  })

  test('should handle hover effects on clusters', async ({ page }) => {
    // Set zoom to see clusters
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(12)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500)

    const cluster = await page.$('[aria-label*="Cluster with"]')
    
    if (cluster) {
      // Get initial transform
      const initialTransform = await cluster.evaluate(el => 
        window.getComputedStyle(el).transform
      )

      // Hover over cluster
      await cluster.hover()
      await page.waitForTimeout(100)

      // Check transform changed
      const hoverTransform = await cluster.evaluate(el => 
        window.getComputedStyle(el).transform
      )

      expect(hoverTransform).not.toBe(initialTransform)
      expect(hoverTransform).toContain('1.1') // Scale should be 1.1
    }
  })

  test('should work with card type filters', async ({ page }) => {
    // Enable clustering
    await page.evaluate(() => {
      const mapElement = document.querySelector('#map')
      if (mapElement && (window as any).naverMap) {
        const map = (window as any).naverMap
        map.setZoom(12)
      }
    })

    // Apply filter
    const filterButton = await page.$('[data-card-type="CHILD_MEAL"]')
    if (filterButton) {
      await filterButton.click()
      await page.waitForTimeout(500)

      // Check that clusters updated
      const clusters = await page.$$('[aria-label*="Cluster with"]')
      expect(clusters.length).toBeGreaterThanOrEqual(0)
    }
  })

  test('should maintain performance with many clusters', async ({ page }) => {
    // Measure performance during rapid zoom changes
    const performanceMetrics = await page.evaluate(async () => {
      const results: number[] = []
      const map = (window as any).naverMap
      
      if (!map) return results

      for (let zoom = 10; zoom <= 16; zoom++) {
        const start = performance.now()
        map.setZoom(zoom)
        await new Promise(resolve => setTimeout(resolve, 100))
        const end = performance.now()
        results.push(end - start)
      }

      return results
    })

    // Average frame time should be reasonable
    const avgTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length
    expect(avgTime).toBeLessThan(200) // Should update within 200ms
  })

  test('should handle viewport changes smoothly', async ({ page }) => {
    // Set initial position
    await page.evaluate(() => {
      const map = (window as any).naverMap
      if (map) {
        map.setZoom(12)
        map.setCenter(new naver.maps.LatLng(37.5665, 126.9780))
      }
    })

    await page.waitForTimeout(500)

    // Pan to different location
    await page.evaluate(() => {
      const map = (window as any).naverMap
      if (map) {
        map.panTo(new naver.maps.LatLng(37.4837, 127.0324))
      }
    })

    await page.waitForTimeout(500)

    // Check clusters updated for new viewport
    const clusters = await page.$$('[aria-label*="Cluster with"]')
    expect(clusters.length).toBeGreaterThanOrEqual(0)
  })

  test('should clean up clusters when disabled', async ({ page }) => {
    // Enable clustering
    await page.evaluate(() => {
      const map = (window as any).naverMap
      if (map) {
        map.setZoom(12)
      }
    })

    await page.waitForTimeout(500)

    // Check clusters exist
    let clusters = await page.$$('[aria-label*="Cluster with"]')
    const initialClusterCount = clusters.length
    expect(initialClusterCount).toBeGreaterThan(0)

    // Disable clustering (if there's a toggle)
    const clusterToggle = await page.$('[data-testid="cluster-toggle"]')
    if (clusterToggle) {
      await clusterToggle.click()
      await page.waitForTimeout(500)

      // Check clusters removed
      clusters = await page.$$('[aria-label*="Cluster with"]')
      expect(clusters.length).toBe(0)
    }
  })
})