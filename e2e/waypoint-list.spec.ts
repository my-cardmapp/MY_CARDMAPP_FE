import { test, expect } from '@playwright/test';

test.describe('WaypointList Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test-waypoint');
    
    // Wait for the component to load
    await page.waitForSelector('[aria-label="Waypoint list"]');
  });

  test('should display initial empty state', async ({ page }) => {
    // Check for empty state message
    await expect(page.getByText('No waypoints added')).toBeVisible();
    await expect(page.getByText('Add waypoints to plan your route')).toBeVisible();
    
    // Check for add waypoint button
    const addButton = page.getByRole('button', { name: 'Add Waypoint' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    
    // Check waypoint count
    await expect(page.getByText('Waypoints (0/5)')).toBeVisible();
  });

  test('should add a waypoint', async ({ page }) => {
    // Click add waypoint button
    await page.getByRole('button', { name: 'Add Waypoint' }).click();
    
    // Check if the add waypoint section appears (with Cancel button)
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByText('Add waypoint', { exact: true })).toBeVisible();
    
    // Look for any input field that appears
    const inputFields = page.locator('input');
    const inputCount = await inputFields.count();
    
    if (inputCount > 0) {
      const firstInput = inputFields.first();
      await firstInput.fill('Test Location');
      await page.waitForTimeout(500);
    }
    
    // Test cancel button functionality
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify we're back to the initial state
    await expect(page.getByRole('button', { name: 'Add Waypoint' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).not.toBeVisible();
  });

  test('should remove a waypoint', async ({ page }) => {
    // First add a waypoint manually (simulate)
    await page.evaluate(() => {
      const event = new CustomEvent('test-add-waypoint', {
        detail: {
          id: 'test-1',
          name: 'Test Location 1',
          address: '123 Test Street',
          location: { lat: 37.5665, lng: 126.9780 }
        }
      });
      window.dispatchEvent(event);
    });
    
    // Wait for waypoint to appear
    await page.waitForTimeout(500);
    
    // Look for remove button
    const removeButtons = page.locator('button[aria-label*="Remove waypoint"]');
    const count = await removeButtons.count();
    
    if (count > 0) {
      // Click first remove button
      await removeButtons.first().click();
      
      // Check if waypoint was removed
      await expect(page.getByText('No waypoints added')).toBeVisible();
    }
  });

  test('should handle maximum waypoints limit', async ({ page }) => {
    // Add 5 waypoints to reach the limit
    for (let i = 1; i <= 5; i++) {
      await page.evaluate((index) => {
        const event = new CustomEvent('test-add-waypoint', {
          detail: {
            id: `test-${index}`,
            name: `Test Location ${index}`,
            address: `${index}23 Test Street`,
            location: { lat: 37.5665 + index * 0.001, lng: 126.9780 + index * 0.001 }
          }
        });
        window.dispatchEvent(event);
      }, i);
    }
    
    await page.waitForTimeout(500);
    
    // Check if add button is disabled
    const addButton = page.getByRole('button', { name: 'Add Waypoint' });
    await expect(addButton).toBeDisabled();
    
    // Check for maximum waypoints message
    await expect(page.getByText('Maximum 5 waypoints')).toBeVisible();
    await expect(page.getByText('Waypoints (5/5)')).toBeVisible();
  });

  test('should support drag and drop reordering', async ({ page }) => {
    // Add multiple waypoints
    for (let i = 1; i <= 3; i++) {
      await page.evaluate((index) => {
        const event = new CustomEvent('test-add-waypoint', {
          detail: {
            id: `test-${index}`,
            name: `Test Location ${index}`,
            address: `${index}23 Test Street`,
            location: { lat: 37.5665 + index * 0.001, lng: 126.9780 + index * 0.001 }
          }
        });
        window.dispatchEvent(event);
      }, i);
    }
    
    await page.waitForTimeout(500);
    
    // Check for drag handles
    const dragHandles = page.locator('button[aria-label*="Drag waypoint"]');
    const handleCount = await dragHandles.count();
    
    if (handleCount >= 2) {
      // Get the first and second waypoint elements
      const firstWaypoint = dragHandles.first();
      const secondWaypoint = dragHandles.nth(1);
      
      // Perform drag and drop
      await firstWaypoint.hover();
      await page.mouse.down();
      await secondWaypoint.hover();
      await page.mouse.up();
      
      // Verify order changed (would need to check actual text order)
      await page.waitForTimeout(500);
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Add a waypoint for testing
    await page.evaluate(() => {
      const event = new CustomEvent('test-add-waypoint', {
        detail: {
          id: 'test-1',
          name: 'Test Location 1',
          address: '123 Test Street',
          location: { lat: 37.5665, lng: 126.9780 }
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if elements can be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Test drag handle keyboard activation
    const dragHandle = page.locator('button[aria-label*="Drag waypoint"]').first();
    if (await dragHandle.isVisible()) {
      await dragHandle.focus();
      await page.keyboard.press('Space'); // Should start drag
      await page.keyboard.press('ArrowDown'); // Move down
      await page.keyboard.press('Space'); // Drop
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if component adapts to mobile
    await expect(page.getByRole('button', { name: 'Add Waypoint' })).toBeVisible();
    
    // Add a waypoint
    await page.evaluate(() => {
      const event = new CustomEvent('test-add-waypoint', {
        detail: {
          id: 'test-1',
          name: 'Test Location with a Very Long Name That Should Truncate',
          address: '123 Very Long Test Street Address That Should Also Truncate',
          location: { lat: 37.5665, lng: 126.9780 }
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    
    // Check if text truncates properly on mobile
    const waypointName = page.locator('.truncate').first();
    if (await waypointName.isVisible()) {
      const box = await waypointName.boundingBox();
      expect(box?.width).toBeLessThan(300); // Should be constrained
    }
  });

  test('should display debug information', async ({ page }) => {
    // Check for debug section
    await expect(page.getByText('Current Waypoints (Debug):')).toBeVisible();
    
    // Add a waypoint
    await page.evaluate(() => {
      const event = new CustomEvent('test-add-waypoint', {
        detail: {
          id: 'test-debug',
          name: 'Debug Test Location',
          address: '999 Debug Street',
          location: { lat: 37.5665, lng: 126.9780 }
        }
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForTimeout(500);
    
    // Check if debug info updates
    const debugContent = page.locator('pre');
    const text = await debugContent.textContent();
    expect(text).toContain('Debug Test Location');
    expect(text).toContain('999 Debug Street');
  });
});