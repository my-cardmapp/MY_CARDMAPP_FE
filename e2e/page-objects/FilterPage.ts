import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Filter Page Object Model
 * Handles card type and category filtering interactions
 */
export class FilterPage extends BasePage {
  // Locators
  readonly filterPanel: Locator;
  readonly cardTypeFilters: Locator;
  readonly categoryFilters: Locator;
  readonly selectAllButton: Locator;
  readonly deselectAllButton: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly activeFilterBadge: Locator;
  readonly filterToggleButton: Locator;

  // Specific card type filters
  readonly childMealFilter: Locator;
  readonly cultureNuriFilter: Locator;
  readonly localCurrencyFilter: Locator;

  constructor(page: Page) {
    super(page);
    
    // Main filter elements - in our app, filters are in the header, always visible
    this.filterPanel = page.locator('header'); // The header contains all filters
    this.filterToggleButton = page.locator('button:has-text("필터")'); // This doesn't exist in our current design
    
    // Card type filters - use actual button selectors from our implementation
    this.cardTypeFilters = page.locator('header .flex.gap-2'); // The container with filter buttons
    this.childMealFilter = page.locator('button:has-text("아동급식카드")');
    this.cultureNuriFilter = page.locator('button:has-text("문화누리카드")');
    this.localCurrencyFilter = page.locator('button:has-text("지역사랑상품권")');
    
    // Category filters
    this.categoryFilters = page.locator('[data-testid="category-filters"], .category-filters');
    
    // Control buttons
    this.selectAllButton = page.locator('button[title="모두 선택"]');
    this.deselectAllButton = page.locator('button[title="모두 해제"]');
    this.applyFiltersButton = page.locator('button:has-text("필터 적용")');
    this.clearFiltersButton = page.locator('button:has-text("필터 초기화")');
    
    // Filter status
    this.activeFilterBadge = page.locator('[data-testid="active-filter-count"], .filter-badge');
  }

  /**
   * Open filter panel - in our implementation, filters are always visible
   */
  async openFilterPanel() {
    // Filters are always visible in the header, so just wait for them to be visible
    await this.filterPanel.waitFor({ state: 'visible' });
  }

  /**
   * Close filter panel - in our implementation, filters are always visible
   */
  async closeFilterPanel() {
    // Filters are always visible, can't be closed
    // This is a no-op for our current implementation
  }

  /**
   * Select a specific card type
   */
  async selectCardType(cardType: 'CHILD_MEAL' | 'CULTURE_NURI' | 'LOCAL_CURRENCY') {
    await this.openFilterPanel();
    
    let filter: Locator;
    switch (cardType) {
      case 'CHILD_MEAL':
        filter = this.childMealFilter;
        break;
      case 'CULTURE_NURI':
        filter = this.cultureNuriFilter;
        break;
      case 'LOCAL_CURRENCY':
        filter = this.localCurrencyFilter;
        break;
    }
    
    // In our implementation, buttons toggle their state
    // Check if already selected by looking for active class/styling
    const isActive = await filter.evaluate(button => {
      const classes = button.className;
      return classes.includes('bg-red-500') || classes.includes('bg-teal-500') || classes.includes('bg-yellow-500');
    });
    
    if (!isActive) {
      await filter.click();
      // Wait for state change
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Deselect a specific card type
   */
  async deselectCardType(cardType: 'CHILD_MEAL' | 'CULTURE_NURI' | 'LOCAL_CURRENCY') {
    await this.openFilterPanel();
    
    let filter: Locator;
    switch (cardType) {
      case 'CHILD_MEAL':
        filter = this.childMealFilter;
        break;
      case 'CULTURE_NURI':
        filter = this.cultureNuriFilter;
        break;
      case 'LOCAL_CURRENCY':
        filter = this.localCurrencyFilter;
        break;
    }
    
    // Click if currently selected
    const checkbox = filter.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await filter.click();
    }
  }

  /**
   * Select all card types
   */
  async selectAllCardTypes() {
    await this.openFilterPanel();
    await this.selectAllButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Deselect all card types
   */
  async deselectAllCardTypes() {
    await this.openFilterPanel();
    await this.deselectAllButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get selected card types
   */
  async getSelectedCardTypes(): Promise<string[]> {
    await this.openFilterPanel();
    
    const selectedTypes: string[] = [];
    
    // Check each card type by looking for active button styles
    const childMealActive = await this.childMealFilter.evaluate(button => {
      const classes = button.className;
      return classes.includes('bg-red-500');
    });
    const cultureNuriActive = await this.cultureNuriFilter.evaluate(button => {
      const classes = button.className;
      return classes.includes('bg-teal-500');
    });
    const localCurrencyActive = await this.localCurrencyFilter.evaluate(button => {
      const classes = button.className;
      return classes.includes('bg-yellow-500');
    });
    
    if (childMealActive) selectedTypes.push('CHILD_MEAL');
    if (cultureNuriActive) selectedTypes.push('CULTURE_NURI');
    if (localCurrencyActive) selectedTypes.push('LOCAL_CURRENCY');
    
    return selectedTypes;
  }

  /**
   * Select a category
   */
  async selectCategory(category: string) {
    await this.openFilterPanel();
    const categoryFilter = this.page.locator(`label:has-text("${category}")`);
    
    const checkbox = categoryFilter.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await categoryFilter.click();
    }
  }

  /**
   * Deselect a category
   */
  async deselectCategory(category: string) {
    await this.openFilterPanel();
    const categoryFilter = this.page.locator(`label:has-text("${category}")`);
    
    const checkbox = categoryFilter.locator('input[type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await categoryFilter.click();
    }
  }

  /**
   * Get selected categories
   */
  async getSelectedCategories(): Promise<string[]> {
    await this.openFilterPanel();
    
    const categories = await this.categoryFilters.locator('input[type="checkbox"]:checked').all();
    const selectedCategories: string[] = [];
    
    for (const checkbox of categories) {
      const label = await checkbox.locator('..').textContent();
      if (label) selectedCategories.push(label.trim());
    }
    
    return selectedCategories;
  }

  /**
   * Apply filters - in our implementation, filters are applied immediately
   */
  async applyFilters() {
    // In our implementation, filters are applied immediately when clicked
    // Just wait a moment for any debounced updates
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear all filters
   */
  async clearAllFilters() {
    await this.openFilterPanel();
    // Use the "deselect all" button instead of a clear filters button
    await this.deselectAllButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get active filter count
   */
  async getActiveFilterCount(): Promise<number> {
    const isVisible = await this.activeFilterBadge.isVisible();
    console.log('Active filter badge visible:', isVisible);
    if (isVisible) {
      const text = await this.activeFilterBadge.textContent() || '0';
      console.log('Active filter badge text:', text);
      return parseInt(text, 10);
    }
    return 0;
  }

  /**
   * Check if filter panel is open
   */
  async isFilterPanelOpen(): Promise<boolean> {
    return await this.filterPanel.isVisible();
  }

  /**
   * Set multiple filters at once
   */
  async setFilters(options: {
    cardTypes?: ('CHILD_MEAL' | 'CULTURE_NURI' | 'LOCAL_CURRENCY')[];
    categories?: string[];
  }) {
    await this.openFilterPanel();
    
    // Clear existing filters first
    await this.clearAllFilters();
    
    // Set card types
    if (options.cardTypes) {
      for (const cardType of options.cardTypes) {
        await this.selectCardType(cardType);
      }
    }
    
    // Set categories
    if (options.categories) {
      for (const category of options.categories) {
        await this.selectCategory(category);
      }
    }
    
    // Apply filters
    await this.applyFilters();
  }

  /**
   * Verify filter results match expected
   */
  async verifyFilterResults(expectedCount?: number) {
    // Wait for filter to be applied
    await this.page.waitForTimeout(1000);
    
    // Check if result count is displayed
    const resultCount = this.page.locator('[data-testid="result-count"], .result-count');
    if (await resultCount.isVisible()) {
      const text = await resultCount.textContent() || '';
      const match = text.match(/\d+/);
      if (match && expectedCount !== undefined) {
        const actualCount = parseInt(match[0], 10);
        expect(actualCount).toBe(expectedCount);
      }
    }
  }

  /**
   * Check if no results message is shown
   */
  async hasNoResults(): Promise<boolean> {
    const noResults = this.page.locator('text=/검색 결과가 없습니다|결과 없음/');
    return await noResults.isVisible();
  }

  /**
   * Get filter state from URL
   */
  async getFilterStateFromUrl(): Promise<{ cardTypes?: string[]; categories?: string[] }> {
    const url = new URL(this.page.url());
    const params = url.searchParams;
    
    const cardTypes = params.get('cardTypes')?.split(',').filter(Boolean);
    const categories = params.get('categories')?.split(',').filter(Boolean);
    
    return { cardTypes, categories };
  }

  /**
   * Wait for filters to be applied
   */
  async waitForFiltersApplied() {
    // Wait for loading indicator to appear and disappear
    const loading = this.page.locator('[data-testid="loading"], .loading');
    await loading.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    await loading.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Additional wait for markers to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle a card type filter quickly
   */
  async toggleCardType(cardType: 'CHILD_MEAL' | 'CULTURE_NURI' | 'LOCAL_CURRENCY') {
    await this.openFilterPanel();
    
    let filter: Locator;
    switch (cardType) {
      case 'CHILD_MEAL':
        filter = this.childMealFilter;
        break;
      case 'CULTURE_NURI':
        filter = this.cultureNuriFilter;
        break;
      case 'LOCAL_CURRENCY':
        filter = this.localCurrencyFilter;
        break;
    }
    
    await filter.click();
    await this.applyFilters();
    await this.waitForFiltersApplied();
  }

  /**
   * Get filter summary text
   */
  async getFilterSummary(): Promise<string> {
    const summary = this.page.locator('[data-testid="filter-summary"], .filter-summary');
    if (await summary.isVisible()) {
      return await summary.textContent() || '';
    }
    return '';
  }
}