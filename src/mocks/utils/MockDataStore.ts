/**
 * MockDataStore - localStorage persistence layer for mock data
 * Mock 데이터를 위한 localStorage 영속성 레이어
 */

import type { Merchant, Location } from '@/types/api';

interface RouteHistoryItem {
  id: string;
  origin: Location;
  destination: Location;
  waypoints: Location[];
  distance: number;
  duration: number;
  timestamp: string;
}

interface SearchHistoryItem {
  query: string;
  timestamp: string;
}

interface UserPreferences {
  selectedCards?: string[];
  mapSettings?: {
    defaultZoom?: number;
    clusteringEnabled?: boolean;
    showMyLocation?: boolean;
  };
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en';
}

interface MockDataStoreV2 {
  version: 2;
  data: {
    favoriteMerchants: Merchant[];
    routeHistory: RouteHistoryItem[];
    searchHistory: SearchHistoryItem[];
    userPreferences: UserPreferences;
  };
}

const STORAGE_KEY = 'mockDataStore';
const CURRENT_VERSION = 2;
const MAX_ROUTE_HISTORY = 50;
const MAX_SEARCH_HISTORY = 30;
const SEARCH_HISTORY_DAYS = 30;
const ROUTE_HISTORY_DAYS = 30;

export class MockDataStore {
  private data: MockDataStoreV2['data'];

  constructor() {
    this.data = this.loadData();
    this.migrate();
  }

  /**
   * Load data from localStorage
   */
  private loadData(): MockDataStoreV2['data'] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return this.getDefaultData();
      }

      const parsed = JSON.parse(stored);
      
      // Check version and migrate if needed
      if (parsed.version !== CURRENT_VERSION) {
        return this.migrateData(parsed);
      }

      return parsed.data || this.getDefaultData();
    } catch (error) {
      console.error('Failed to load MockDataStore:', error);
      return this.getDefaultData();
    }
  }

  /**
   * Get default data structure
   */
  private getDefaultData(): MockDataStoreV2['data'] {
    return {
      favoriteMerchants: [],
      routeHistory: [],
      searchHistory: [],
      userPreferences: {
        selectedCards: [],
        mapSettings: {
          defaultZoom: 14,
          clusteringEnabled: true,
          showMyLocation: false
        },
        theme: 'light',
        language: 'ko'
      }
    };
  }

  /**
   * Save data to localStorage
   */
  private saveData(): boolean {
    try {
      const storeData: MockDataStoreV2 = {
        version: CURRENT_VERSION,
        data: this.data
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup...');
        this.cleanupForQuota();
        
        // Try again after cleanup
        try {
          const storeData: MockDataStoreV2 = {
            version: CURRENT_VERSION,
            data: this.data
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
          return true;
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError);
          return false;
        }
      }
      
      console.error('Failed to save MockDataStore:', error);
      return false;
    }
  }

  /**
   * Migrate data from older versions
   */
  private migrateData(oldData: any): MockDataStoreV2['data'] {
    // Migration from v1 to v2
    if (oldData.version === 1) {
      return {
        favoriteMerchants: oldData.favorites || [],
        routeHistory: oldData.routes || [],
        searchHistory: (oldData.searches || []).map((query: string) => ({
          query,
          timestamp: new Date().toISOString()
        })),
        userPreferences: oldData.preferences || this.getDefaultData().userPreferences
      };
    }

    // Unknown version, return default
    return this.getDefaultData();
  }

  /**
   * Run migrations
   */
  private migrate(): void {
    // Clean up old data on startup
    this.cleanupOldSearchHistory();
    this.clearOldRouteHistory();
  }

  // === Favorite Merchants ===

  saveFavoriteMerchant(merchant: Merchant): boolean {
    // Check if already exists
    if (!this.data.favoriteMerchants.find(m => m.id === merchant.id)) {
      this.data.favoriteMerchants.push(merchant);
      return this.saveData();
    }
    return true;
  }

  removeFavoriteMerchant(merchantId: number): boolean {
    const index = this.data.favoriteMerchants.findIndex(m => m.id === merchantId);
    if (index !== -1) {
      this.data.favoriteMerchants.splice(index, 1);
      return this.saveData();
    }
    return false;
  }

  getFavoriteMerchants(): Merchant[] {
    return [...this.data.favoriteMerchants];
  }

  isFavorite(merchantId: number): boolean {
    return this.data.favoriteMerchants.some(m => m.id === merchantId);
  }

  // === Route History ===

  saveRouteHistory(route: RouteHistoryItem): boolean {
    // Add to beginning of array (most recent first)
    this.data.routeHistory.unshift(route);
    
    // Limit history size
    if (this.data.routeHistory.length > MAX_ROUTE_HISTORY) {
      this.data.routeHistory = this.data.routeHistory.slice(0, MAX_ROUTE_HISTORY);
    }
    
    return this.saveData();
  }

  getRouteHistory(limit?: number): RouteHistoryItem[] {
    const history = [...this.data.routeHistory];
    return limit ? history.slice(0, limit) : history;
  }

  clearOldRouteHistory(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ROUTE_HISTORY_DAYS);
    
    this.data.routeHistory = this.data.routeHistory.filter(route => {
      const routeDate = new Date(route.timestamp);
      return routeDate > cutoffDate;
    });
    
    this.saveData();
  }

  // === Search History ===

  saveSearchQuery(query: string): boolean {
    // Remove if exists (to move to front)
    this.data.searchHistory = this.data.searchHistory.filter(s => s.query !== query);
    
    // Add to beginning
    this.data.searchHistory.unshift({
      query,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size
    if (this.data.searchHistory.length > MAX_SEARCH_HISTORY) {
      this.data.searchHistory = this.data.searchHistory.slice(0, MAX_SEARCH_HISTORY);
    }
    
    // Clean up old searches
    this.cleanupOldSearchHistory();
    
    return this.saveData();
  }

  getSearchHistory(): string[] {
    return this.data.searchHistory.map(s => s.query);
  }

  getSearchHistoryWithTimestamps(): SearchHistoryItem[] {
    return [...this.data.searchHistory];
  }

  clearSearchHistory(): void {
    this.data.searchHistory = [];
    this.saveData();
  }

  private cleanupOldSearchHistory(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SEARCH_HISTORY_DAYS);
    
    this.data.searchHistory = this.data.searchHistory.filter(search => {
      const searchDate = new Date(search.timestamp);
      return searchDate > cutoffDate;
    });
  }

  // === User Preferences ===

  saveUserPreferences(preferences: UserPreferences): boolean {
    this.data.userPreferences = {
      ...this.data.userPreferences,
      ...preferences
    };
    return this.saveData();
  }

  getUserPreferences(): UserPreferences {
    return { ...this.data.userPreferences };
  }

  // === Export/Import ===

  exportData(): string {
    const exportData: MockDataStoreV2 = {
      version: CURRENT_VERSION,
      data: this.data
    };
    return JSON.stringify(exportData, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      
      // Validate version
      if (imported.version !== CURRENT_VERSION) {
        console.error('Invalid data version:', imported.version);
        return false;
      }
      
      // Validate structure
      if (!imported.data || 
          !Array.isArray(imported.data.favoriteMerchants) ||
          !Array.isArray(imported.data.routeHistory) ||
          !Array.isArray(imported.data.searchHistory)) {
        console.error('Invalid data structure');
        return false;
      }
      
      // Import data
      this.data = imported.data;
      return this.saveData();
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // === Storage Management ===

  getStorageSize(): number {
    const data = localStorage.getItem(STORAGE_KEY) || '';
    return new Blob([data]).size;
  }

  cleanupForQuota(): void {
    // Remove old search history first
    this.cleanupOldSearchHistory();
    
    // Limit route history to 20 items
    if (this.data.routeHistory.length > 20) {
      this.data.routeHistory = this.data.routeHistory.slice(0, 20);
    }
    
    // Limit search history to 10 items
    if (this.data.searchHistory.length > 10) {
      this.data.searchHistory = this.data.searchHistory.slice(0, 10);
    }
    
    this.saveData();
  }

  /**
   * Clear all data and reset to defaults
   */
  reset(): void {
    this.data = this.getDefaultData();
    this.saveData();
  }
}