import { test, expect } from '@playwright/test'

test.describe('Merchant Detail with POI Data', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page
    await page.goto('/map')

    // Wait for MSW to initialize
    await page.waitForTimeout(2000)

    // Wait for map to load
    await expect(page.getByRole('heading', { name: 'Card-Map' })).toBeVisible()
  })

  test('should display InfoWindow with POI data when merchant is clicked', async ({ page }) => {
    // Find and click a merchant from the list
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await expect(merchantButton).toBeVisible()
    await merchantButton.click()

    // Wait for InfoWindow to appear and API call to complete
    await page.waitForTimeout(3000)

    // Check if Naver attribution is displayed (confirms POI data loaded)
    await expect(page.getByText('네이버 지역 검색 정보')).toBeVisible({ timeout: 10000 })

    // Check if essential merchant info is displayed
    await expect(page.getByText('사용 가능한 카드')).toBeVisible()
    await expect(page.getByText('영업시간')).toBeVisible()
  })

  test('should handle API call for POI data', async ({ page }) => {
    // Set up a promise to wait for the API call to our Next.js API route
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/naver/local-search') && response.status() === 200,
      { timeout: 10000 }
    )

    // Click on a merchant
    const merchantButton = page.getByRole('button', { name: /CGV 피카디리1958/ })
    await expect(merchantButton).toBeVisible()
    await merchantButton.click()

    // Wait for the API call to complete
    const response = await apiPromise

    // Verify the response
    expect(response.status()).toBe(200)

    // Verify response body has Naver API structure
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('items')
    expect(responseBody).toHaveProperty('total')
    expect(responseBody).toHaveProperty('display')
    expect(responseBody).toHaveProperty('start')
  })
})
