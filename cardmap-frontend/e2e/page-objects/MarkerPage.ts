import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Marker and InfoWindow Page Object Model
 * Handles all marker and InfoWindow related interactions
 */
export class MarkerPage extends BasePage {
  // Locators
  readonly markers: Locator;
  readonly clusterMarkers: Locator;
  readonly infoWindow: Locator;
  readonly infoWindowTitle: Locator;
  readonly infoWindowContent: Locator;
  readonly infoWindowCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Marker locators
    this.markers = page.locator('[data-testid="merchant-marker"]');
    this.clusterMarkers = page.locator('[class*="cluster"]');
    
    // InfoWindow locators
    this.infoWindow = page.locator('.info-window, [class*="infowindow"]');
    this.infoWindowTitle = page.locator('.info-window__title, [class*="infowindow"] h3');
    this.infoWindowContent = page.locator('.info-window__content, [class*="infowindow"] .content');
    this.infoWindowCloseButton = page.locator('.info-window__close, [class*="infowindow"] button[aria-label="닫기"]');
  }

  /**
   * Get all visible markers
   */
  async getAllMarkers(): Promise<Locator[]> {
    const count = await this.markers.count();
    const markers: Locator[] = [];
    for (let i = 0; i < count; i++) {
      markers.push(this.markers.nth(i));
    }
    return markers;
  }

  /**
   * Get marker count
   */
  async getMarkerCount(): Promise<number> {
    const markerCount = await this.page.evaluate(() => {
      const markers = document.querySelectorAll('[data-testid="merchant-marker"]');
      return markers.length;
    });
    return markerCount;
  }

  /**
   * Click on a specific marker by index
   */
  async clickMarkerByIndex(index: number) {
    const markers = await this.getAllMarkers();
    if (index >= markers.length) {
      throw new Error(`Marker index ${index} out of bounds. Total markers: ${markers.length}`);
    }
    await markers[index].click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Click on a marker by merchant name
   */
  async clickMarkerByName(merchantName: string) {
    const marker = this.page.locator(`[aria-label*="${merchantName}"]`).first();
    await marker.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get markers by card type
   */
  async getMarkersByCardType(cardType: string): Promise<number> {
    return await this.page.evaluate((type) => {
      const markers = document.querySelectorAll(`[data-card-type="${type}"], [class*="${type.toLowerCase()}"]`);
      return markers.length;
    }, cardType);
  }

  /**
   * Check if InfoWindow is open
   */
  async isInfoWindowOpen(): Promise<boolean> {
    return await this.infoWindow.isVisible();
  }

  /**
   * Wait for InfoWindow to open
   */
  async waitForInfoWindow() {
    await this.infoWindow.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get InfoWindow title
   */
  async getInfoWindowTitle(): Promise<string> {
    await this.waitForInfoWindow();
    return await this.infoWindowTitle.textContent() || '';
  }

  /**
   * Get InfoWindow content
   */
  async getInfoWindowContent(): Promise<string> {
    await this.waitForInfoWindow();
    return await this.infoWindowContent.textContent() || '';
  }

  /**
   * Close InfoWindow
   */
  async closeInfoWindow() {
    if (await this.isInfoWindowOpen()) {
      // Try close button first
      if (await this.infoWindowCloseButton.isVisible()) {
        await this.infoWindowCloseButton.click();
      } else {
        // Click outside InfoWindow
        await this.page.click('body', { position: { x: 10, y: 10 } });
      }
      await this.infoWindow.waitFor({ state: 'hidden' });
    }
  }

  /**
   * Check if InfoWindow contains specific text
   */
  async infoWindowContainsText(text: string): Promise<boolean> {
    if (!await this.isInfoWindowOpen()) {
      return false;
    }
    const content = await this.getInfoWindowContent();
    return content.includes(text);
  }

  /**
   * Get InfoWindow details
   */
  async getInfoWindowDetails(): Promise<{
    title: string;
    address?: string;
    cards?: string[];
    phone?: string;
    hours?: string;
  }> {
    await this.waitForInfoWindow();
    
    return await this.page.evaluate(() => {
      const infoWindow = document.querySelector('.info-window, [class*="infowindow"]');
      if (!infoWindow) return { title: '' };
      
      const title = infoWindow.querySelector('h3, .title')?.textContent || '';
      const address = infoWindow.querySelector('.address, [class*="address"]')?.textContent || undefined;
      const cardElements = infoWindow.querySelectorAll('.card-badge, [class*="card"]');
      const cards = Array.from(cardElements).map(el => el.textContent || '');
      const phone = infoWindow.querySelector('.phone, [class*="phone"]')?.textContent || undefined;
      const hours = infoWindow.querySelector('.hours, [class*="hours"]')?.textContent || undefined;
      
      return { title, address, cards, phone, hours };
    });
  }

  /**
   * Get cluster marker count
   */
  async getClusterCount(): Promise<number> {
    return await this.clusterMarkers.count();
  }

  /**
   * Click on a cluster marker
   */
  async clickCluster(index: number = 0) {
    const cluster = this.clusterMarkers.nth(index);
    await cluster.click();
    await this.page.waitForTimeout(1000); // Wait for zoom animation
  }

  /**
   * Get cluster size (number shown on cluster)
   */
  async getClusterSize(index: number = 0): Promise<number> {
    const cluster = this.clusterMarkers.nth(index);
    const text = await cluster.textContent() || '0';
    return parseInt(text, 10);
  }

  /**
   * Check if markers are clustered
   */
  async isClustered(): Promise<boolean> {
    const clusterCount = await this.getClusterCount();
    return clusterCount > 0;
  }

  /**
   * Hover over a marker
   */
  async hoverMarker(index: number = 0) {
    const markers = await this.getAllMarkers();
    if (index < markers.length) {
      await markers[index].hover();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Get marker position on screen
   */
  async getMarkerPosition(index: number = 0): Promise<{ x: number; y: number } | null> {
    const markers = await this.getAllMarkers();
    if (index >= markers.length) return null;
    
    const box = await markers[index].boundingBox();
    if (!box) return null;
    
    return {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };
  }

  /**
   * Check if marker is visible in viewport
   */
  async isMarkerInViewport(index: number = 0): Promise<boolean> {
    const markers = await this.getAllMarkers();
    if (index >= markers.length) return false;
    
    return await markers[index].isInViewport();
  }

  /**
   * Wait for markers to load
   */
  async waitForMarkers(minCount: number = 1) {
    await this.page.waitForFunction(
      (min) => {
        const markers = document.querySelectorAll('[data-testid="merchant-marker"]');
        return markers.length >= min;
      },
      minCount,
      { timeout: 10000 }
    );
  }

  /**
   * Get marker color/style by index
   */
  async getMarkerStyle(index: number = 0): Promise<{ color?: string; icon?: string } | null> {
    const markers = await this.getAllMarkers();
    if (index >= markers.length) return null;
    
    return await markers[index].evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      const backgroundImage = computedStyle.backgroundImage;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Try to extract color from inline styles or classes
      const fillColor = (el as HTMLElement).style.fill || 
                       (el.querySelector('path') as SVGPathElement)?.style.fill ||
                       (el.querySelector('[fill]') as SVGElement)?.getAttribute('fill');
      
      return {
        color: fillColor || backgroundColor || undefined,
        icon: backgroundImage !== 'none' ? backgroundImage : undefined
      };
    });
  }

  /**
   * Filter markers by visibility
   */
  async getVisibleMarkers(): Promise<number> {
    return await this.page.evaluate(() => {
      const markers = document.querySelectorAll('[role="button"][aria-label*="가맹점"], [class*="marker"]');
      let visibleCount = 0;
      
      markers.forEach((marker) => {
        const rect = marker.getBoundingClientRect();
        const isVisible = rect.width > 0 && 
                         rect.height > 0 && 
                         rect.top < window.innerHeight && 
                         rect.bottom > 0 &&
                         rect.left < window.innerWidth &&
                         rect.right > 0;
        if (isVisible) visibleCount++;
      });
      
      return visibleCount;
    });
  }
}