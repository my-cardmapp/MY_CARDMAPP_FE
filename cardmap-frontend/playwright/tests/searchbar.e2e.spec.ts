import { test, expect } from '@playwright/test';

test.describe('SearchBar E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('http://localhost:3000/map');
    
    // Wait for the page to fully load
    await page.waitForSelector('[data-testid="search-bar-container"]', { 
      timeout: 30000,
      state: 'visible' 
    });
  });

  test('should display SearchBar component', async ({ page }) => {
    // Check if search input is visible
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    
    // Check placeholder text
    await expect(searchInput).toHaveAttribute('placeholder', '가맹점 검색...');
    
    // Check for search icon
    const searchIcon = page.locator('[data-testid="search-icon"]');
    await expect(searchIcon).toBeVisible();
  });

  test('should show clear button when typing', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type in the search box
    await searchInput.fill('김밥천국');
    
    // Check if clear button appears
    const clearButton = page.locator('[data-testid="clear-button"]');
    await expect(clearButton).toBeVisible();
  });

  test('should clear input when clear button is clicked', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type in the search box
    await searchInput.fill('GS25');
    
    // Click clear button
    const clearButton = page.locator('[data-testid="clear-button"]');
    await clearButton.click();
    
    // Check if input is cleared
    await expect(searchInput).toHaveValue('');
    
    // Clear button should disappear
    await expect(clearButton).not.toBeVisible();
  });

  test('should clear input when Escape key is pressed', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type in the search box
    await searchInput.fill('편의점');
    
    // Press Escape key
    await searchInput.press('Escape');
    
    // Check if input is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should trigger search after debounce delay', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Listen for network requests
    const searchRequest = page.waitForRequest(
      request => request.url().includes('/api/v1/merchants/search') && 
                 request.url().includes('query='),
      { timeout: 5000 }
    );
    
    // Type in the search box
    await searchInput.fill('파리바게뜨');
    
    // Wait for the debounced search request
    const request = await searchRequest;
    expect(request.url()).toContain('query=%ED%8C%8C%EB%A6%AC%EB%B0%94%EA%B2%8C%EB%9C%A8');
  });

  test('should trigger immediate search on Enter key', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Listen for network requests
    const searchRequest = page.waitForRequest(
      request => request.url().includes('/api/v1/merchants/search'),
      { timeout: 2000 }
    );
    
    // Type and press Enter
    await searchInput.fill('롯데마트');
    await searchInput.press('Enter');
    
    // Should trigger search immediately
    const request = await searchRequest;
    expect(request.url()).toContain('query=%EB%A1%AF%EB%8D%B0%EB%A7%88%ED%8A%B8');
  });

  test('should show loading spinner during search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Add delay to API response to see spinner
    await page.route('**/api/v1/merchants/search*', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    // Type in search box
    await searchInput.fill('맘스터치');
    
    // Wait for spinner to appear
    const spinner = page.locator('[data-testid="loading-spinner"]');
    await expect(spinner).toBeVisible({ timeout: 2000 });
    
    // Wait for spinner to disappear after search completes
    await expect(spinner).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type Korean and special characters
    await searchInput.fill('김밥천국 & GS25');
    
    // Check if value is correctly set
    await expect(searchInput).toHaveValue('김밥천국 & GS25');
    
    // Listen for search request
    const searchRequest = page.waitForRequest(
      request => request.url().includes('/api/v1/merchants/search'),
      { timeout: 5000 }
    );
    
    // Wait for debounced search
    const request = await searchRequest;
    expect(request.url()).toContain('query=');
  });

  test('should be accessible with ARIA attributes', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Check ARIA attributes
    await expect(searchInput).toHaveAttribute('aria-label', 'Search merchants');
    await expect(searchInput).toHaveAttribute('role', 'searchbox');
    
    // Check clear button accessibility
    await searchInput.fill('test');
    const clearButton = page.locator('[data-testid="clear-button"]');
    await expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
  });

  test('should integrate with merchant list results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search for a specific merchant
    await searchInput.fill('김밥천국');
    
    // Wait for search to complete
    await page.waitForResponse(
      response => response.url().includes('/api/v1/merchants/search'),
      { timeout: 5000 }
    );
    
    // Check if results are updated (assuming merchant list shows results)
    // This would need to be adjusted based on actual implementation
    await page.waitForTimeout(500); // Give UI time to update
    
    // Verify search was performed
    const searchRequest = await page.waitForRequest(
      request => request.url().includes('query=%EA%B9%80%EB%B0%A5%EC%B2%9C%EA%B5%AD'),
      { timeout: 1000 }
    ).catch(() => null);
    
    expect(searchRequest).toBeTruthy();
  });
});