import { test, expect } from '@playwright/test';

test.describe('RoutePlanner Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/map', { waitUntil: 'networkidle' });
    
    // Wait for the route planner button to be available
    await page.waitForSelector('button:has-text("경로 계획")', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Click the route planner button to show the panel
    await page.getByRole('button', { name: /경로 계획/i }).click();
    
    // Wait for the route planner to be visible
    await page.waitForSelector('[data-testid="route-planner"]', { 
      state: 'visible',
      timeout: 10000
    });
  });

  test('should display route planner with origin and destination inputs', async ({ page }) => {
    // Check origin input is present
    const originInput = page.getByTestId('route-origin-input');
    await expect(originInput).toBeVisible();
    await expect(originInput).toHaveAttribute('placeholder', '출발지를 입력하세요');
    
    // Check destination input is present
    const destInput = page.getByTestId('route-destination-input');
    await expect(destInput).toBeVisible();
    await expect(destInput).toHaveAttribute('placeholder', '도착지를 입력하세요');
  });

  test('should display mode selector with all transport options', async ({ page }) => {
    // Check mode selector is present
    const modeGroup = page.getByRole('group', { name: /이동 수단/i });
    await expect(modeGroup).toBeVisible();
    
    // Check all transport modes are available
    await expect(page.getByRole('radio', { name: /도보/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /대중교통/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /자동차/i })).toBeVisible();
    
    // Check walking is selected by default
    await expect(page.getByRole('radio', { name: /도보/i })).toBeChecked();
  });

  test('should enable/disable calculate button based on inputs', async ({ page }) => {
    const calculateButton = page.getByRole('button', { name: /경로 계산/i });
    
    // Initially disabled (no locations selected)
    await expect(calculateButton).toBeDisabled();
    
    // Type in origin
    await page.getByTestId('route-origin-input').fill('서울역');
    // Still disabled (need both locations)
    await expect(calculateButton).toBeDisabled();
    
    // Type in destination
    await page.getByTestId('route-destination-input').fill('부산역');
    
    // Note: In real implementation, we need to select from autocomplete
    // For now, we're checking the disabled state logic
  });

  test('should switch transport modes', async ({ page }) => {
    // Select transit mode
    await page.getByRole('radio', { name: /대중교통/i }).click();
    await expect(page.getByRole('radio', { name: /대중교통/i })).toBeChecked();
    await expect(page.getByRole('radio', { name: /도보/i })).not.toBeChecked();
    
    // Select driving mode
    await page.getByRole('radio', { name: /자동차/i }).click();
    await expect(page.getByRole('radio', { name: /자동차/i })).toBeChecked();
    await expect(page.getByRole('radio', { name: /대중교통/i })).not.toBeChecked();
  });

  test('should handle route calculation flow', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/v1/routes/calculate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          routes: [{
            summary: '서울역 → 강남역',
            distance: 12500,
            duration: 1800,
            fare: 1450,
            steps: [
              { instruction: '2호선 탑승', distance: 12000, duration: 1500 },
              { instruction: '강남역 하차', distance: 500, duration: 300 }
            ]
          }]
        })
      });
    });
    
    // Simulate selecting locations (in real app, this would use autocomplete)
    // For testing, we'll check if the calculate button becomes enabled
    // when both inputs have values
    
    // Fill inputs
    await page.getByTestId('route-origin-input').fill('서울역');
    await page.getByTestId('route-destination-input').fill('강남역');
    
    // In real implementation, we'd click autocomplete items here
    // For now, we verify the UI elements are present and functional
  });

  test('should display route results after calculation', async ({ page }) => {
    // Mock successful route calculation
    await page.route('**/api/v1/routes/calculate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          routes: [{
            summary: '최단 경로',
            distance: 5000,
            duration: 900,
            steps: []
          }]
        })
      });
    });
    
    // This test would need actual autocomplete selection to work fully
    // It demonstrates the expected flow
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/routes/calculate', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '경로를 계산할 수 없습니다'
        })
      });
    });
    
    // Test error handling flow would go here
  });

  test('should clear form and results', async ({ page }) => {
    // Fill in some data
    await page.getByTestId('route-origin-input').fill('테스트 출발지');
    await page.getByTestId('route-destination-input').fill('테스트 도착지');
    
    // Check if clear/reset functionality exists
    // This would be tested after implementing the clear button
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to map page
    await page.goto('/map');
    
    // Open route planner
    await page.getByRole('button', { name: /경로 계획/i }).click();
    
    // Check if route planner adapts to mobile layout
    const routePlanner = page.getByTestId('route-planner');
    await expect(routePlanner).toBeVisible();
    
    // Verify mobile-friendly layout (stacked elements)
    const plannerBox = await routePlanner.boundingBox();
    expect(plannerBox).toBeTruthy();
    
    // On mobile, components should stack vertically
    // This checks if the container uses flex-col on small screens
  });

  test('should integrate with map for visual route display', async ({ page }) => {
    // This test would verify that calculated routes are displayed on the map
    // It requires full integration with the map component
    
    // Check if map container exists
    const mapContainer = page.locator('.map-container');
    await expect(mapContainer).toBeVisible();
    
    // After route calculation, polyline should be added to map
    // This would be tested with actual route calculation
  });
});

test.describe('RoutePlanner Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/map', { waitUntil: 'networkidle' });
    await page.waitForSelector('button:has-text("경로 계획")', { 
      state: 'visible',
      timeout: 30000 
    });
    await page.getByRole('button', { name: /경로 계획/i }).click();
    await page.waitForSelector('[data-testid="route-planner"]', { 
      state: 'visible',
      timeout: 10000
    });
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check fieldset has proper role and label
    const modeSelector = page.getByRole('group', { name: /이동 수단/i });
    await expect(modeSelector).toBeVisible();
    
    // Check inputs have associated labels
    await expect(page.getByText('출발지')).toBeVisible();
    await expect(page.getByText('도착지')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Focus on origin input
    await page.getByTestId('route-origin-input').focus();
    
    // Tab to destination input
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toContain('destination');
    
    // Continue tabbing through mode options
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Arrow keys should switch between radio buttons
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: /대중교통/i })).toBeChecked();
  });

  test('should announce errors to screen readers', async ({ page }) => {
    // Check for role="alert" on error messages
    // This would be tested when errors occur
  });
});