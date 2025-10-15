import { test, expect } from '@playwright/test'

test.describe('Unified Merchant Detail Panel with POI Data', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page
    await page.goto('/map')

    // Wait for MSW to initialize
    await page.waitForTimeout(2000)

    // Wait for map to load
    await expect(page.getByRole('heading', { name: 'Card-Map' })).toBeVisible()
  })

  test('should display unified detail panel when merchant is clicked', async ({ page }) => {
    // Find and click a merchant from the list
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await expect(merchantButton).toBeVisible()
    await merchantButton.click()

    // Wait for detail panel to appear
    await page.waitForTimeout(1000)

    // Check if panel header shows merchant name
    const panelHeading = page.getByRole('heading', { name: '김밥천국 시청점', level: 2 })
    await expect(panelHeading).toBeVisible({ timeout: 5000 })

    // Check if tabs are visible
    await expect(page.getByRole('button', { name: '홈', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '정보', exact: true })).toBeVisible()

    // Check if Naver attribution is displayed (confirms POI data loaded)
    await expect(page.getByText('네이버 지역 검색 정보')).toBeVisible({ timeout: 10000 })

    // Check if essential merchant info sections are displayed
    await expect(page.getByText('사용 가능한 카드')).toBeVisible()
    await expect(page.getByText('영업시간')).toBeVisible()
    await expect(page.getByText('주소')).toBeVisible()
    await expect(page.getByText('전화번호')).toBeVisible()
  })

  test('should switch between tabs in detail panel', async ({ page }) => {
    // Click on a merchant
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await merchantButton.click()

    // Wait for panel to appear
    await page.waitForTimeout(1000)

    // Verify we're on 홈 tab by default (check for home tab content)
    await expect(page.getByText('주소')).toBeVisible()
    await expect(page.getByText('사용 가능한 카드')).toBeVisible()

    // Click on 정보 tab
    await page.getByRole('button', { name: '정보', exact: true }).click()

    // Verify 정보 tab content
    await expect(page.getByText('카테고리')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('검증 상태')).toBeVisible()
    await expect(page.getByText('좌표')).toBeVisible()

    // Switch back to 홈 tab
    await page.getByRole('button', { name: '홈', exact: true }).click()

    // Verify 홈 tab content is back
    await expect(page.getByText('주소')).toBeVisible({ timeout: 3000 })
  })

  test('should close detail panel when close button is clicked', async ({ page }) => {
    // Click on a merchant
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await merchantButton.click()

    // Wait for panel to appear
    await page.waitForTimeout(1000)

    // Verify panel is visible
    const panelHeading = page.getByRole('heading', { name: '김밥천국 시청점', level: 2 })
    await expect(panelHeading).toBeVisible()

    // Click close button (in the panel header)
    const closeButton = page.getByRole('button', { name: '닫기', exact: true })
    await closeButton.click()

    // Verify panel is closed
    await expect(panelHeading).not.toBeVisible({ timeout: 3000 })
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

  test('should display category badge and verification status', async ({ page }) => {
    // Click on a merchant
    const merchantButton = page.getByRole('button', { name: /김밥천국 시청점/ })
    await merchantButton.click()

    // Wait for panel to appear
    await page.waitForTimeout(1000)

    // Check for category badge (should show "음식점" in the panel)
    await expect(page.getByText('음식점')).toBeVisible()

    // Check for verification badge
    await expect(page.getByText('인증')).toBeVisible()
  })
})
