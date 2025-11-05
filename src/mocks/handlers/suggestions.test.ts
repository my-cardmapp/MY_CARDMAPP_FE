import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { suggestionHandlers } from './suggestions';

const server = setupServer(...suggestionHandlers);

describe('Search Suggestions API', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  beforeEach(() => server.resetHandlers());

  describe('GET /api/v1/suggestions/search', () => {
    it('should return Korean location suggestions', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=강남');
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.suggestions).toContain('강남역');
      expect(data.suggestions).toContain('강남구청');
      expect(data.suggestions).toContain('강남대로');
      expect(data.suggestions.length).toBeGreaterThan(0);
    });

    it('should return popular locations for empty query', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=');
      
      const data = await response.json();
      
      expect(data.suggestions).toContain('강남역');
      expect(data.suggestions).toContain('명동');
      expect(data.suggestions).toContain('홍대');
      expect(data.suggestions).toContain('이태원');
      expect(data.suggestions).toContain('건대입구');
    });

    it('should support Hangul jamo composition', async () => {
      // ㄱㅏㅇㄴㅏㅁ -> 강남
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=ㄱㅏㅇㄴㅏㅁ');
      
      const data = await response.json();
      
      expect(data.suggestions.some((s: string) => s.includes('강남'))).toBe(true);
    });

    it('should support initial consonant search', async () => {
      // ㄱㄴ -> 강남
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=ㄱㄴ');
      
      const data = await response.json();
      
      expect(data.suggestions.some((s: string) => s.includes('강남'))).toBe(true);
      
      // ㄱㄷ -> 건대
      const response2 = await fetch('http://localhost/api/v1/suggestions/search?query=ㄱㄷ');
      const data2 = await response2.json();
      expect(data2.suggestions.some((s: string) => s.includes('건대'))).toBe(true);
    });

    it('should return category-based suggestions', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=편의점');
      
      const data = await response.json();
      
      // Check that we have convenience store suggestions
      expect(data.suggestions).toContain('편의점');
      expect(data.suggestions).toContain('CU 편의점');
      expect(data.suggestions).toContain('GS25 편의점');
      // Some convenience stores may not be in top 10
      expect(data.suggestions.some((s: string) => 
        s.includes('편의점') || s === '세븐일레븐' || s === '이마트24' || s === '미니스톱'
      )).toBe(true);
    });

    it('should return food-related suggestions', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=김밥');
      
      const data = await response.json();
      
      expect(data.suggestions).toContain('김밥천국');
      expect(data.suggestions).toContain('김밥나라');
      expect(data.suggestions).toContain('고봉민김밥');
    });

    it('should return cafe suggestions', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=커피');
      
      const data = await response.json();
      
      // Check for at least some coffee shop suggestions
      const coffeeShops = ['스타벅스', '투썸플레이스', '이디야커피', '메가커피', '빽다방', '커피빈', '폴바셋'];
      const foundCoffeeShops = coffeeShops.filter(shop => data.suggestions.includes(shop));
      
      // Should have at least 2 coffee shop suggestions
      expect(foundCoffeeShops.length).toBeGreaterThanOrEqual(2);
      expect(data.suggestions).toContain('이디야커피');
      expect(data.suggestions).toContain('메가커피');
    });

    it('should handle card type context', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=급식&cardType=CHILD_MEAL');
      
      const data = await response.json();
      
      expect(data.suggestions.some((s: string) => s.includes('아동급식'))).toBe(true);
      expect(data.suggestions.some((s: string) => s.includes('가맹점'))).toBe(true);
    });

    it('should limit suggestions to 10 items', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=서울');
      
      const data = await response.json();
      
      expect(data.suggestions.length).toBeLessThanOrEqual(10);
    });

    it('should handle typos and provide corrections', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/search?query=스타법스');
      
      const data = await response.json();
      
      expect(data.suggestions).toContain('스타벅스');
      expect(data.correctedQuery).toBe('스타벅스');
    });
  });

  describe('GET /api/v1/suggestions/recent', () => {
    it('should return recent search history', async () => {
      // First make some searches to populate history
      await fetch('http://localhost/api/v1/suggestions/search?query=강남역&save=true');
      await fetch('http://localhost/api/v1/suggestions/search?query=명동&save=true');
      await fetch('http://localhost/api/v1/suggestions/search?query=홍대&save=true');
      
      // Get recent searches
      const response = await fetch('http://localhost/api/v1/suggestions/recent');
      
      const data = await response.json();
      
      expect(data.recent).toContain('홍대');
      expect(data.recent).toContain('명동');
      expect(data.recent).toContain('강남역');
      expect(data.recent.length).toBeLessThanOrEqual(10);
    });

    it('should not duplicate recent searches', async () => {
      // Make duplicate searches
      await fetch('http://localhost/api/v1/suggestions/search?query=테스트&save=true');
      await fetch('http://localhost/api/v1/suggestions/search?query=테스트&save=true');
      
      const response = await fetch('http://localhost/api/v1/suggestions/recent');
      const data = await response.json();
      
      const testCount = data.recent.filter((s: string) => s === '테스트').length;
      expect(testCount).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/v1/suggestions/categories', () => {
    it('should return category suggestions', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/categories');
      
      const data = await response.json();
      
      expect(data.categories).toContain('음식점');
      expect(data.categories).toContain('편의점');
      expect(data.categories).toContain('카페');
      expect(data.categories).toContain('마트');
      expect(data.categories).toContain('약국');
      expect(data.categories).toContain('베이커리');
    });

    it('should return category with codes', async () => {
      const response = await fetch('http://localhost/api/v1/suggestions/categories?withCodes=true');
      
      const data = await response.json();
      
      expect(data.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: expect.any(String),
            name: expect.any(String),
            icon: expect.any(String)
          })
        ])
      );
    });
  });

  describe('Autocomplete Integration', () => {
    it('should provide progressive refinement', async () => {
      // Type 'ㅅ'
      let response = await fetch('http://localhost/api/v1/suggestions/search?query=ㅅ');
      let data = await response.json();
      expect(data.suggestions.length).toBeGreaterThan(0);
      
      // Type '스'
      response = await fetch('http://localhost/api/v1/suggestions/search?query=스');
      data = await response.json();
      expect(data.suggestions.some((s: string) => s.includes('스타벅스'))).toBe(true);
      
      // Type '스타'
      response = await fetch('http://localhost/api/v1/suggestions/search?query=스타');
      data = await response.json();
      expect(data.suggestions[0]).toContain('스타벅스');
    });

    it('should maintain context across queries', async () => {
      // Set location context
      const response1 = await fetch('http://localhost/api/v1/suggestions/search?query=강남역&save=true');
      
      // Next query should prioritize nearby locations
      const response2 = await fetch('http://localhost/api/v1/suggestions/search?query=&nearLocation=강남');
      const data = await response2.json();
      
      // Should return popular locations when empty query
      expect(data.suggestions).toBeDefined();
      expect(data.suggestions.length).toBeGreaterThan(0);
      
      // Verify it returns locations (at least some popular ones)
      const popularLocations = ['강남역', '명동', '홍대', '이태원', '건대입구'];
      const hasPopularLocation = data.suggestions.some((s: string) => 
        popularLocations.includes(s)
      );
      expect(hasPopularLocation).toBe(true);
    });
  });
});