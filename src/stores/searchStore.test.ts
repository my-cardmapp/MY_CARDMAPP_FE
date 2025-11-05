import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSearchStore } from './searchStore';
import type { Merchant, CardDetail, Category } from '@/types/api';

// Mock data
const mockMerchants: Merchant[] = [
  {
    id: 1,
    name: '김밥천국',
    address: '서울시 강남구 역삼동 123-45',
    location: { lat: 37.5665, lng: 126.9780 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B', iconUrl: '' }
    ],
    category: { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
    businessHours: { mon: ['09:00', '22:00'] },
    phone: '02-1234-5678',
    isVerified: true
  },
  {
    id: 2,
    name: 'GS25',
    address: '서울시 강남구 삼성동 456-78',
    location: { lat: 37.5123, lng: 127.0521 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B', iconUrl: '' },
      { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#4ECDC4', iconUrl: '' }
    ],
    category: { id: 2, code: 'CONVENIENCE', name: '편의점', icon: '🏪' },
    businessHours: { mon: ['00:00', '23:59'] },
    phone: '02-9876-5432',
    isVerified: true
  }
];

const mockCardTypes: CardDetail[] = [
  {
    id: 1,
    code: 'CHILD_MEAL',
    name: '아동급식카드',
    colorHex: '#FF6B6B',
    description: '결식아동 급식 지원',
    benefits: ['1일 1만원 한도'],
    restrictions: ['주류, 담배 구매 불가'],
    issuer: '서울시',
    merchantCount: 15000
  },
  {
    id: 2,
    code: 'CULTURE_NURI',
    name: '문화누리카드',
    colorHex: '#4ECDC4',
    description: '문화생활 지원',
    benefits: ['연 10만원 지원'],
    restrictions: ['문화시설 전용'],
    issuer: '문화체육관광부',
    merchantCount: 5000
  }
];

const mockCategories: Category[] = [
  { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
  { id: 2, code: 'CONVENIENCE', name: '편의점', icon: '🏪' },
  { id: 3, code: 'CAFE', name: '카페', icon: '☕' }
];

describe('searchStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useSearchStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.query).toBe('');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeCardTypes).toEqual([]);
      expect(result.current.activeCategories).toEqual([]);
      expect(result.current.viewMode).toBe('map');
      expect(result.current.merchants).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.page).toBe(0);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.totalResults).toBe(0);
    });
  });

  describe('Search Query Actions', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery('김밥천국');
      });

      expect(result.current.query).toBe('김밥천국');
    });

    it('should clear search query', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery('김밥천국');
        result.current.clearQuery();
      });

      expect(result.current.query).toBe('');
    });

    it('should update suggestions', () => {
      const { result } = renderHook(() => useSearchStore());
      const suggestions = ['김밥천국', '김가네', '김선생'];

      act(() => {
        result.current.setSuggestions(suggestions);
      });

      expect(result.current.suggestions).toEqual(suggestions);
    });
  });

  describe('Filter Actions', () => {
    it('should toggle card type filter', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
      });

      expect(result.current.activeCardTypes).toContain('CHILD_MEAL');

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
      });

      expect(result.current.activeCardTypes).not.toContain('CHILD_MEAL');
    });

    it('should add multiple card types', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCardType('CULTURE_NURI');
      });

      expect(result.current.activeCardTypes).toEqual(['CHILD_MEAL', 'CULTURE_NURI']);
    });

    it('should toggle category filter', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCategory('RESTAURANT');
      });

      expect(result.current.activeCategories).toContain('RESTAURANT');

      act(() => {
        result.current.toggleCategory('RESTAURANT');
      });

      expect(result.current.activeCategories).not.toContain('RESTAURANT');
    });

    it('should set card types directly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setCardTypes(['CHILD_MEAL', 'CULTURE_NURI']);
      });

      expect(result.current.activeCardTypes).toEqual(['CHILD_MEAL', 'CULTURE_NURI']);
    });

    it('should set categories directly', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setCategories(['RESTAURANT', 'CAFE']);
      });

      expect(result.current.activeCategories).toEqual(['RESTAURANT', 'CAFE']);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
        result.current.clearFilters();
      });

      expect(result.current.activeCardTypes).toEqual([]);
      expect(result.current.activeCategories).toEqual([]);
    });

    it('should clear only card type filters', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
        result.current.clearCardTypes();
      });

      expect(result.current.activeCardTypes).toEqual([]);
      expect(result.current.activeCategories).toContain('RESTAURANT');
    });

    it('should clear only category filters', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
        result.current.clearCategories();
      });

      expect(result.current.activeCardTypes).toContain('CHILD_MEAL');
      expect(result.current.activeCategories).toEqual([]);
    });
  });

  describe('View Mode', () => {
    it('should toggle view mode between list and map', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.viewMode).toBe('map');

      act(() => {
        result.current.setViewMode('list');
      });

      expect(result.current.viewMode).toBe('list');

      act(() => {
        result.current.toggleViewMode();
      });

      expect(result.current.viewMode).toBe('map');
    });
  });

  describe('Results Management', () => {
    it('should set merchants', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setMerchants(mockMerchants);
      });

      expect(result.current.merchants).toEqual(mockMerchants);
    });

    it('should handle loading state', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error state', () => {
      const { result } = renderHook(() => useSearchStore());
      const errorMessage = 'Failed to fetch merchants';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should update pagination info', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setPagination({
          page: 2,
          totalPages: 10,
          totalResults: 100
        });
      });

      expect(result.current.page).toBe(2);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.totalResults).toBe(100);
    });
  });

  describe('Computed Values', () => {
    it('should calculate active filter count', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCardType('CULTURE_NURI');
        result.current.toggleCategory('RESTAURANT');
      });

      expect(result.current.activeFilterCount()).toBe(3);
    });

    it('should check if filters are active', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.hasActiveFilters()).toBe(false);

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
      });

      expect(result.current.hasActiveFilters()).toBe(true);
    });

    it('should get formatted filter string', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
      });

      const filterString = result.current.getFilterString();
      expect(filterString).toContain('CHILD_MEAL');
      expect(filterString).toContain('RESTAURANT');
    });

    it('should check if specific card type is active', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
      });

      expect(result.current.isCardTypeActive('CHILD_MEAL')).toBe(true);
      expect(result.current.isCardTypeActive('CULTURE_NURI')).toBe(false);
    });

    it('should check if specific category is active', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCategory('RESTAURANT');
      });

      expect(result.current.isCategoryActive('RESTAURANT')).toBe(true);
      expect(result.current.isCategoryActive('CAFE')).toBe(false);
    });
  });

  describe('Batch Updates', () => {
    it('should handle batch state updates efficiently', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.batchUpdate({
          query: '검색어',
          activeCardTypes: ['CHILD_MEAL'],
          activeCategories: ['RESTAURANT', 'CAFE'],
          viewMode: 'list',
          merchants: mockMerchants,
          page: 1,
          totalPages: 5,
          totalResults: 50
        });
      });

      expect(result.current.query).toBe('검색어');
      expect(result.current.activeCardTypes).toEqual(['CHILD_MEAL']);
      expect(result.current.activeCategories).toEqual(['RESTAURANT', 'CAFE']);
      expect(result.current.viewMode).toBe('list');
      expect(result.current.merchants).toEqual(mockMerchants);
      expect(result.current.page).toBe(1);
      expect(result.current.totalPages).toBe(5);
      expect(result.current.totalResults).toBe(50);
    });
  });

  describe('Store Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery('검색어');
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
        result.current.setViewMode('list');
        result.current.setMerchants(mockMerchants);
        result.current.setError('Error occurred');
        result.current.reset();
      });

      expect(result.current.query).toBe('');
      expect(result.current.activeCardTypes).toEqual([]);
      expect(result.current.activeCategories).toEqual([]);
      expect(result.current.viewMode).toBe('map');
      expect(result.current.merchants).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('URL Synchronization Preparation', () => {
    it('should serialize state to URL params', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setQuery('김밥');
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCardType('CULTURE_NURI');
        result.current.toggleCategory('RESTAURANT');
        result.current.setViewMode('list');
      });

      const urlParams = result.current.toURLParams();
      expect(urlParams.get('q')).toBe('김밥');
      expect(urlParams.get('cards')).toBe('CHILD_MEAL,CULTURE_NURI');
      expect(urlParams.get('categories')).toBe('RESTAURANT');
      expect(urlParams.get('view')).toBe('list');
    });

    it('should deserialize state from URL params', () => {
      const { result } = renderHook(() => useSearchStore());
      
      const urlParams = new URLSearchParams({
        q: '편의점',
        cards: 'CHILD_MEAL,CULTURE_NURI',
        categories: 'CONVENIENCE,CAFE',
        view: 'list'
      });

      act(() => {
        result.current.fromURLParams(urlParams);
      });

      expect(result.current.query).toBe('편의점');
      expect(result.current.activeCardTypes).toEqual(['CHILD_MEAL', 'CULTURE_NURI']);
      expect(result.current.activeCategories).toEqual(['CONVENIENCE', 'CAFE']);
      expect(result.current.viewMode).toBe('list');
    });

    it('should handle empty URL params gracefully', () => {
      const { result } = renderHook(() => useSearchStore());
      
      const urlParams = new URLSearchParams();

      act(() => {
        result.current.fromURLParams(urlParams);
      });

      expect(result.current.query).toBe('');
      expect(result.current.activeCardTypes).toEqual([]);
      expect(result.current.activeCategories).toEqual([]);
      expect(result.current.viewMode).toBe('map');
    });
  });

  describe('Performance Optimizations', () => {
    it('should use shallow comparison for arrays', () => {
      const { result } = renderHook(() => useSearchStore());
      
      const cardTypes = ['CHILD_MEAL'];
      act(() => {
        result.current.setCardTypes(cardTypes);
      });

      const firstCardTypes = result.current.activeCardTypes;
      
      // Setting the same array should not create a new reference
      act(() => {
        result.current.setCardTypes(cardTypes);
      });

      expect(result.current.activeCardTypes).toBe(firstCardTypes);
    });

    it('should prevent unnecessary re-renders with same values', () => {
      const { result } = renderHook(() => useSearchStore());
      
      act(() => {
        result.current.setQuery('test');
      });

      const renderCount = vi.fn();
      result.current.subscribe(renderCount);

      // Setting the same value should not trigger a re-render
      act(() => {
        result.current.setQuery('test');
      });

      expect(renderCount).not.toHaveBeenCalled();
    });
  });

  describe('Filter State Interface', () => {
    it('should export filter state in correct format', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
      });

      const filterState = result.current.getFilterState();
      expect(filterState).toEqual({
        cardTypes: ['CHILD_MEAL'],
        categories: ['RESTAURANT']
      });
    });

    it('should import filter state correctly', () => {
      const { result } = renderHook(() => useSearchStore());

      const filterState = {
        cardTypes: ['CULTURE_NURI'],
        categories: ['CAFE', 'CONVENIENCE']
      };

      act(() => {
        result.current.setFilterState(filterState);
      });

      expect(result.current.activeCardTypes).toEqual(['CULTURE_NURI']);
      expect(result.current.activeCategories).toEqual(['CAFE', 'CONVENIENCE']);
    });
  });

  describe('Search Execution', () => {
    it('should trigger search with current state', async () => {
      const { result } = renderHook(() => useSearchStore());
      const searchSpy = vi.fn();

      act(() => {
        result.current.setQuery('김밥');
        result.current.toggleCardType('CHILD_MEAL');
        result.current.toggleCategory('RESTAURANT');
      });

      await act(async () => {
        await result.current.executeSearch(searchSpy);
      });

      expect(searchSpy).toHaveBeenCalledWith({
        query: '김밥',
        cardTypes: ['CHILD_MEAL'],
        categories: ['RESTAURANT'],
        page: 0
      });
    });

    it('should handle search errors gracefully', async () => {
      const { result } = renderHook(() => useSearchStore());
      const searchSpy = vi.fn().mockRejectedValue(new Error('Search failed'));

      await act(async () => {
        await result.current.executeSearch(searchSpy);
      });

      expect(result.current.error).toBe('Search failed');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('DevTools Support', () => {
    it('should have devtools name', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.$storeName).toBe('searchStore');
    });
  });
});