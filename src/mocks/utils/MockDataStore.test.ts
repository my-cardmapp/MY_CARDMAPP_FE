import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockDataStore } from './MockDataStore';
import type { Merchant } from '@/types/api';

describe('MockDataStore', () => {
  let store: MockDataStore;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset date mocks
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Create new store instance
    store = new MockDataStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('Favorite Merchants', () => {
    const mockMerchant: Merchant = {
      id: 1,
      name: '김밥천국',
      address: '서울시 강남구',
      location: { lat: 37.5, lng: 127.0 },
      cards: [],
      category: { id: 1, code: 'FOOD', name: '음식점' },
      isVerified: true
    };

    it('should save favorite merchant', () => {
      const result = store.saveFavoriteMerchant(mockMerchant);
      
      expect(result).toBe(true);
      const favorites = store.getFavoriteMerchants();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMerchant);
    });

    it('should not duplicate favorite merchants', () => {
      store.saveFavoriteMerchant(mockMerchant);
      store.saveFavoriteMerchant(mockMerchant);
      
      const favorites = store.getFavoriteMerchants();
      expect(favorites).toHaveLength(1);
    });

    it('should remove favorite merchant', () => {
      store.saveFavoriteMerchant(mockMerchant);
      const result = store.removeFavoriteMerchant(1);
      
      expect(result).toBe(true);
      const favorites = store.getFavoriteMerchants();
      expect(favorites).toHaveLength(0);
    });

    it('should check if merchant is favorite', () => {
      store.saveFavoriteMerchant(mockMerchant);
      
      expect(store.isFavorite(1)).toBe(true);
      expect(store.isFavorite(2)).toBe(false);
    });

    it('should persist favorites across instances', () => {
      store.saveFavoriteMerchant(mockMerchant);
      
      const newStore = new MockDataStore();
      const favorites = newStore.getFavoriteMerchants();
      
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMerchant);
    });
  });

  describe('Route History', () => {
    const mockRoute = {
      id: 'route-1',
      origin: { lat: 37.5, lng: 127.0, name: '출발지' },
      destination: { lat: 37.6, lng: 127.1, name: '도착지' },
      waypoints: [],
      distance: 1500,
      duration: 1200,
      timestamp: new Date().toISOString()
    };

    it('should save route to history', () => {
      const result = store.saveRouteHistory(mockRoute);
      
      expect(result).toBe(true);
      const history = store.getRouteHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        origin: mockRoute.origin,
        destination: mockRoute.destination
      });
    });

    it('should limit route history to 50 items', () => {
      // Save 60 routes
      for (let i = 0; i < 60; i++) {
        store.saveRouteHistory({
          ...mockRoute,
          id: `route-${i}`,
          timestamp: new Date(2024, 0, i + 1).toISOString()
        });
      }
      
      const history = store.getRouteHistory();
      expect(history).toHaveLength(50);
      // Should keep the most recent ones
      expect(history[0].id).toBe('route-59');
      expect(history[49].id).toBe('route-10');
    });

    it('should get route history with limit', () => {
      for (let i = 0; i < 10; i++) {
        store.saveRouteHistory({
          ...mockRoute,
          id: `route-${i}`
        });
      }
      
      const history = store.getRouteHistory(5);
      expect(history).toHaveLength(5);
    });

    it('should clear old route history', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 days ago
      
      store.saveRouteHistory({
        ...mockRoute,
        id: 'old-route',
        timestamp: oldDate.toISOString()
      });
      
      store.saveRouteHistory({
        ...mockRoute,
        id: 'recent-route',
        timestamp: new Date().toISOString()
      });
      
      store.clearOldRouteHistory();
      
      const history = store.getRouteHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('recent-route');
    });
  });

  describe('Search History', () => {
    it('should save search query', () => {
      const result = store.saveSearchQuery('김밥천국');
      
      expect(result).toBe(true);
      const history = store.getSearchHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toBe('김밥천국');
    });

    it('should not duplicate recent searches', () => {
      store.saveSearchQuery('김밥천국');
      store.saveSearchQuery('편의점');
      store.saveSearchQuery('김밥천국'); // Duplicate
      
      const history = store.getSearchHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toBe('김밥천국'); // Most recent first
      expect(history[1]).toBe('편의점');
    });

    it('should limit search history to 30 items', () => {
      for (let i = 0; i < 40; i++) {
        store.saveSearchQuery(`검색어${i}`);
      }
      
      const history = store.getSearchHistory();
      expect(history).toHaveLength(30);
    });

    it('should clear search history', () => {
      store.saveSearchQuery('김밥천국');
      store.saveSearchQuery('편의점');
      
      store.clearSearchHistory();
      
      const history = store.getSearchHistory();
      expect(history).toHaveLength(0);
    });

    it('should auto-cleanup old searches after 30 days', () => {
      const now = new Date('2024-07-25');
      vi.setSystemTime(now);
      
      // Save old search
      store.saveSearchQuery('old-search');
      
      // Move forward 31 days
      vi.setSystemTime(new Date('2024-08-26'));
      
      // Save new search (triggers cleanup)
      store.saveSearchQuery('new-search');
      
      const history = store.getSearchHistory();
      const rawData = store.getSearchHistoryWithTimestamps();
      
      expect(history).toHaveLength(1);
      expect(history[0]).toBe('new-search');
      expect(rawData.find(s => s.query === 'old-search')).toBeUndefined();
    });
  });

  describe('User Preferences', () => {
    it('should save user preferences', () => {
      const preferences = {
        selectedCards: ['CHILD_MEAL', 'CULTURE_NURI'],
        mapSettings: {
          defaultZoom: 15,
          clusteringEnabled: true,
          showMyLocation: true
        },
        theme: 'light' as const,
        language: 'ko' as const
      };
      
      const result = store.saveUserPreferences(preferences);
      
      expect(result).toBe(true);
      const saved = store.getUserPreferences();
      expect(saved).toEqual(preferences);
    });

    it('should merge partial preferences', () => {
      const initial = {
        selectedCards: ['CHILD_MEAL'],
        mapSettings: {
          defaultZoom: 15,
          clusteringEnabled: true,
          showMyLocation: true
        }
      };
      
      store.saveUserPreferences(initial);
      
      const update = {
        selectedCards: ['CULTURE_NURI'],
        theme: 'dark' as const
      };
      
      store.saveUserPreferences(update);
      
      const saved = store.getUserPreferences();
      expect(saved).toEqual({
        selectedCards: ['CULTURE_NURI'],
        mapSettings: initial.mapSettings,
        theme: 'dark',
        language: 'ko' // Default language is included
      });
    });

    it('should return default preferences if none saved', () => {
      const preferences = store.getUserPreferences();
      
      expect(preferences).toEqual({
        selectedCards: [],
        mapSettings: {
          defaultZoom: 14,
          clusteringEnabled: true,
          showMyLocation: false
        },
        theme: 'light',
        language: 'ko'
      });
    });
  });

  describe('Data Migration', () => {
    it('should migrate v1 to v2 schema', () => {
      // Save data in v1 format
      localStorage.setItem('mockDataStore', JSON.stringify({
        version: 1,
        favorites: [{ id: 1, name: 'Old Format' }],
        routes: [],
        searches: ['test']
      }));
      
      const newStore = new MockDataStore();
      
      // Should migrate to v2 format
      const data = JSON.parse(localStorage.getItem('mockDataStore') || '{}');
      expect(data.version).toBe(2);
      expect(data.data.favoriteMerchants).toBeDefined();
      expect(data.data.routeHistory).toBeDefined();
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('mockDataStore', 'corrupted-data');
      
      const newStore = new MockDataStore();
      
      // Should initialize with default data
      const favorites = newStore.getFavoriteMerchants();
      expect(favorites).toEqual([]);
    });
  });

  describe('Export/Import', () => {
    it('should export all data', () => {
      const merchant: Merchant = {
        id: 1,
        name: '테스트',
        address: '주소',
        location: { lat: 0, lng: 0 },
        cards: [],
        category: { id: 1, code: 'TEST', name: '테스트' },
        isVerified: true
      };
      
      store.saveFavoriteMerchant(merchant);
      store.saveSearchQuery('검색어');
      store.saveUserPreferences({ theme: 'dark' });
      
      const exported = store.exportData();
      
      expect(exported).toContain('"version": 2');
      expect(exported).toContain('"favoriteMerchants"');
      expect(exported).toContain('"searchHistory"');
      expect(exported).toContain('"userPreferences"');
    });

    it('should import data', () => {
      const data = {
        version: 2,
        data: {
          favoriteMerchants: [{
            id: 1,
            name: 'Imported',
            address: '주소',
            location: { lat: 0, lng: 0 },
            cards: [],
            category: { id: 1, code: 'TEST', name: '테스트' },
            isVerified: true
          }],
          routeHistory: [],
          searchHistory: [
            { query: 'imported-search', timestamp: new Date().toISOString() }
          ],
          userPreferences: {
            theme: 'dark'
          }
        }
      };
      
      const result = store.importData(JSON.stringify(data));
      
      expect(result).toBe(true);
      expect(store.getFavoriteMerchants()).toHaveLength(1);
      expect(store.getSearchHistory()).toContain('imported-search');
    });

    it('should validate imported data', () => {
      const invalidData = '{"version": 999}';
      
      const result = store.importData(invalidData);
      
      expect(result).toBe(false);
    });
  });

  describe('Storage Quota Handling', () => {
    it('should handle localStorage quota exceeded', () => {
      // Fill localStorage to simulate quota exceeded
      const largeData = 'x'.repeat(1024 * 1024); // 1MB string
      
      try {
        for (let i = 0; i < 10; i++) {
          localStorage.setItem(`test-${i}`, largeData);
        }
      } catch (e) {
        // Expected to fail
      }
      
      // Should handle gracefully
      const result = store.saveFavoriteMerchant({
        id: 1,
        name: 'Test',
        address: '주소',
        location: { lat: 0, lng: 0 },
        cards: [],
        category: { id: 1, code: 'TEST', name: '테스트' },
        isVerified: true
      });
      
      // Might fail but shouldn't throw
      expect(typeof result).toBe('boolean');
    });

    it('should calculate storage size', () => {
      store.saveFavoriteMerchant({
        id: 1,
        name: '김밥천국',
        address: '서울시 강남구',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점' },
        isVerified: true
      });
      
      const size = store.getStorageSize();
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should clean up when approaching quota', () => {
      // Add many items
      for (let i = 0; i < 100; i++) {
        store.saveSearchQuery(`search-${i}`);
        store.saveRouteHistory({
          id: `route-${i}`,
          origin: { lat: 37.5, lng: 127.0 },
          destination: { lat: 37.6, lng: 127.1 },
          waypoints: [],
          distance: 1000,
          duration: 600,
          timestamp: new Date().toISOString()
        });
      }
      
      store.cleanupForQuota();
      
      // Should keep favorites and preferences, but reduce history
      const searches = store.getSearchHistory();
      const routes = store.getRouteHistory();
      
      expect(searches.length).toBeLessThanOrEqual(30);
      expect(routes.length).toBeLessThanOrEqual(50);
    });
  });
});