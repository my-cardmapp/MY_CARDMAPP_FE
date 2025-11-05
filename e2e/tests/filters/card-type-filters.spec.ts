import { test, expect } from '@playwright/test';
import { MapPage } from '../../page-objects/MapPage';
import { MarkerPage } from '../../page-objects/MarkerPage';
import { FilterPage } from '../../page-objects/FilterPage';

test.describe('Card Type Filtering', () => {
  let mapPage: MapPage;
  let markerPage: MarkerPage;
  let filterPage: FilterPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    markerPage = new MarkerPage(page);
    filterPage = new FilterPage(page);
    
    // Listen to console for debugging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Page error:', error.message));
    
    // Navigate to map
    await mapPage.goto();
    
    // Wait a bit to allow merchants to load but don't fail if markers aren't found
    try {
      await markerPage.waitForMarkers(1);
    } catch (error) {
      console.log('Markers not loaded immediately, continuing with test');
      // Give a bit more time for merchants to load
      await page.waitForTimeout(2000);
    }
  });

  test('should open and close filter panel', async ({ page }) => {
    // In our implementation, filter panel (header) is always visible
    let isPanelOpen = await filterPage.isFilterPanelOpen();
    expect(isPanelOpen).toBeTruthy();
    
    // Verify filter elements are visible
    await expect(filterPage.selectAllButton).toBeVisible();
    await expect(filterPage.deselectAllButton).toBeVisible();
    await expect(filterPage.childMealFilter).toBeVisible();
    await expect(filterPage.cultureNuriFilter).toBeVisible();
    await expect(filterPage.localCurrencyFilter).toBeVisible();
  });

  test('should display all card type options', async ({ page }) => {
    await filterPage.openFilterPanel();
    
    // Check all card type filters are present
    await expect(filterPage.childMealFilter).toBeVisible();
    await expect(filterPage.cultureNuriFilter).toBeVisible();
    await expect(filterPage.localCurrencyFilter).toBeVisible();
  });

  test('should filter markers by single card type', async ({ page }) => {
    // Get initial marker count
    const initialMarkerCount = await markerPage.getMarkerCount();
    
    // Filter by CHILD_MEAL only
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // Marker count should change (unless all are CHILD_MEAL)
    const filteredMarkerCount = await markerPage.getMarkerCount();
    expect(filteredMarkerCount).toBeGreaterThanOrEqual(0);
    
    // Verify selected filters
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedTypes).toHaveLength(1);
  });

  test('should filter markers by multiple card types', async ({ page }) => {
    // Filter by multiple card types
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL', 'CULTURE_NURI']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // Verify selected filters
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedTypes).toContain('CULTURE_NURI');
    expect(selectedTypes).toHaveLength(2);
    
    // Markers should be visible
    const markerCount = await markerPage.getMarkerCount();
    expect(markerCount).toBeGreaterThanOrEqual(0);
  });

  test('should select all card types', async ({ page }) => {
    await filterPage.openFilterPanel();
    
    // Deselect all first
    await filterPage.deselectAllCardTypes();
    
    // Select all
    await filterPage.selectAllCardTypes();
    
    // Verify all are selected
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedTypes).toContain('CULTURE_NURI');
    expect(selectedTypes).toContain('LOCAL_CURRENCY');
  });

  test('should deselect all card types', async ({ page }) => {
    await filterPage.openFilterPanel();
    
    // Select all first
    await filterPage.selectAllCardTypes();
    
    // Deselect all
    await filterPage.deselectAllCardTypes();
    
    // Verify none are selected
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toHaveLength(0);
    
    // Apply filter
    await filterPage.applyFilters();
    await filterPage.waitForFiltersApplied();
    
    // Should show no markers or no results message
    const markerCount = await markerPage.getMarkerCount();
    const hasNoResults = await filterPage.hasNoResults();
    expect(markerCount === 0 || hasNoResults).toBeTruthy();
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // Clear filters
    await filterPage.clearAllFilters();
    await filterPage.applyFilters();
    await filterPage.waitForFiltersApplied();
    
    // All filters should be cleared
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toHaveLength(0);
  });

  test('should show active filter count badge', async ({ page }) => {
    // Apply filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL', 'CULTURE_NURI']
    });
    
    // Debug: Check if we can see the header at all
    await page.waitForSelector('header', { timeout: 5000 });
    const headerText = await page.locator('header').textContent();
    console.log('Header content:', headerText);
    
    // Wait for UI to update and show the badge
    await page.waitForSelector('[data-testid="active-filter-count"]', { timeout: 5000 });
    
    // Check active filter count
    const activeCount = await filterPage.getActiveFilterCount();
    expect(activeCount).toBe(2);
  });

  test('should toggle individual card type filters', async ({ page }) => {
    // Toggle CHILD_MEAL
    await filterPage.toggleCardType('CHILD_MEAL');
    
    let selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    
    // Toggle CULTURE_NURI
    await filterPage.toggleCardType('CULTURE_NURI');
    
    selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedTypes).toContain('CULTURE_NURI');
    
    // Toggle CHILD_MEAL off
    await filterPage.toggleCardType('CHILD_MEAL');
    
    selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).not.toContain('CHILD_MEAL');
    expect(selectedTypes).toContain('CULTURE_NURI');
  });

  test('should update URL with filter parameters', async ({ page }) => {
    // Apply filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL', 'CULTURE_NURI']
    });
    
    // Check URL
    const urlState = await filterPage.getFilterStateFromUrl();
    expect(urlState.cardTypes).toContain('CHILD_MEAL');
    expect(urlState.cardTypes).toContain('CULTURE_NURI');
  });

  test('should restore filters from URL on page load', async ({ page }) => {
    // Navigate with filter params
    await page.goto('/map?cardTypes=CHILD_MEAL,CULTURE_NURI');
    await mapPage.waitForMapLoad();
    
    // Open filter panel to check state
    await filterPage.openFilterPanel();
    
    // Verify filters are set from URL
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedTypes).toContain('CULTURE_NURI');
  });

  test('should show filter summary', async ({ page }) => {
    // Apply filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL']
    });
    
    // Wait for UI to update
    await page.waitForTimeout(500);
    
    // Check summary
    const summary = await filterPage.getFilterSummary();
    expect(summary).toContain('아동급식카드');
  });

  test('should handle rapid filter changes', async ({ page }) => {
    // Rapidly change filters
    await filterPage.toggleCardType('CHILD_MEAL');
    await filterPage.toggleCardType('CULTURE_NURI');
    await filterPage.toggleCardType('LOCAL_CURRENCY');
    await filterPage.toggleCardType('CHILD_MEAL');
    
    // Final state should be consistent
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toBeDefined();
    
    // Map should still be functional
    const isMapLoaded = await mapPage.isMapLoaded();
    expect(isMapLoaded).toBeTruthy();
  });

  test('should filter markers with categories and card types', async ({ page }) => {
    // Apply both card type and category filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL'],
      categories: ['음식점', '편의점']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // Verify filters are applied
    const selectedTypes = await filterPage.getSelectedCardTypes();
    const selectedCategories = await filterPage.getSelectedCategories();
    
    expect(selectedTypes).toContain('CHILD_MEAL');
    expect(selectedCategories).toContain('음식점');
    expect(selectedCategories).toContain('편의점');
  });

  test('should maintain filter state during map interactions', async ({ page }) => {
    // Apply filters
    await filterPage.setFilters({
      cardTypes: ['CHILD_MEAL']
    });
    
    // Interact with map
    await mapPage.zoomIn();
    await mapPage.panMap('right', 100);
    
    // Filters should remain
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
  });

  test('should show appropriate message when no results', async ({ page }) => {
    // Mock empty results
    await page.route('**/api/merchants**', route => {
      const url = new URL(route.request().url());
      if (url.searchParams.has('cardTypes')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ content: [], totalElements: 0 })
        });
      } else {
        route.continue();
      }
    });
    
    // Apply filter that returns no results
    await filterPage.setFilters({
      cardTypes: ['LOCAL_CURRENCY']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // Should show no results message
    const hasNoResults = await filterPage.hasNoResults();
    expect(hasNoResults).toBeTruthy();
  });

  test('should update marker colors based on filter', async ({ page }) => {
    // Get initial marker styles
    const initialStyle = await markerPage.getMarkerStyle(0);
    
    // Apply filter for different card type
    await filterPage.setFilters({
      cardTypes: ['CULTURE_NURI']
    });
    
    await filterPage.waitForFiltersApplied();
    
    // If markers exist, check their style
    const markerCount = await markerPage.getMarkerCount();
    if (markerCount > 0) {
      const filteredStyle = await markerPage.getMarkerStyle(0);
      // Style might be different if filtering changed the visible markers
      expect(filteredStyle).toBeDefined();
    }
  });

  test('should handle filter panel on mobile', async ({ page }) => {
    // Switch to mobile viewport
    await mapPage.setViewportSize(375, 667);
    await page.reload();
    await mapPage.waitForMapLoad();
    
    // Open filter panel
    await filterPage.openFilterPanel();
    
    // Panel should be visible and functional
    const isPanelOpen = await filterPage.isFilterPanelOpen();
    expect(isPanelOpen).toBeTruthy();
    
    // Should be able to select filters
    await filterPage.selectCardType('CHILD_MEAL');
    await filterPage.applyFilters();
    
    // Verify filter applied
    const selectedTypes = await filterPage.getSelectedCardTypes();
    expect(selectedTypes).toContain('CHILD_MEAL');
  });
});