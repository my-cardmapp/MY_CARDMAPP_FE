import { test, expect } from '@playwright/test'

test.describe('Merchant Detail with POI Data', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page
    await page.goto('/map')

    // Wait for MSW to initialize
    await page.waitForTimeout(2000)

    // Wait for map to load
    await expect(page.locator('text=Card-Map')).toBeVisible()
  })

  test('should display InfoWindow with POI data when merchant is clicked', async ({ page }) => {
    // Find and click a merchant from the list
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await expect(merchantButton).toBeVisible()
    await merchantButton.click()

    // Wait for InfoWindow to appear
    await page.waitForTimeout(1000)

    // Check if InfoWindow is displayed on the map
    const infoWindowHeading = page.locator('text=김밥천국 시청점').first()
    await expect(infoWindowHeading).toBeVisible()

    // Check if address is displayed
    await expect(page.locator('text=서울특별시 중구 세종대로 110')).toBeVisible()

    // Check if phone number is displayed
    await expect(page.locator('text=02-1234-5678')).toBeVisible()

    // Check if card information is displayed
    await expect(page.locator('text=사용 가능한 카드')).toBeVisible()
    await expect(page.locator('text=아동급식카드')).toBeVisible()

    // Check if business hours are displayed
    await expect(page.locator('text=영업시간')).toBeVisible()
  })

  test('should handle API call for POI data', async ({ page }) => {
    // Set up a promise to wait for the API call
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/v1/search/local.json') && response.status() === 200,
      { timeout: 5000 }
    )

    // Click on a merchant
    const merchantButton = page.getByRole('button', { name: /CGV 피카디리1958/ })
    await expect(merchantButton).toBeVisible()
    await merchantButton.click()

    // Wait for the API call to complete
    const response = await apiPromise

    // Verify the response
    expect(response.status()).toBe(200)

    // Verify response body
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('items')
    expect(responseBody).toHaveProperty('total')
  })
})
