import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { merchantHandlers } from './merchants';

// MSW 서버 설정
const server = setupServer(...merchantHandlers);

// Base URL for API calls
const BASE_URL = 'http://localhost';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Merchant API Handlers', () => {
  describe('GET /api/v1/merchants', () => {
    it('should return paginated merchant list', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('content');
      expect(data).toHaveProperty('pageable');
      expect(data).toHaveProperty('totalElements');
      expect(Array.isArray(data.content)).toBe(true);
    });

    it('should filter by card types', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants?cardTypes=CHILD_MEAL,CULTURE_NURI`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.content.length > 0) {
        const merchant = data.content[0];
        const cardCodes = merchant.cards.map((c: any) => c.code);
        expect(cardCodes.some(code => ['CHILD_MEAL', 'CULTURE_NURI'].includes(code))).toBe(true);
      }
    });

    it('should filter by categories', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants?categories=RESTAURANT,CAFE`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.content.length > 0) {
        const merchant = data.content[0];
        expect(['RESTAURANT', 'CAFE']).toContain(merchant.category.code);
      }
    });

    it('should handle pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants?page=1&size=10`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.pageable.page).toBe(1);
      expect(data.pageable.size).toBe(10);
      expect(data.content.length).toBeLessThanOrEqual(10);
    });

    it('should sort merchants', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants?sort=name,asc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.content.length > 1) {
        const names = data.content.map((m: any) => m.name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      }
    });
  });

  describe('GET /api/v1/merchants/:id', () => {
    it('should return merchant details with reviews', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/1`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(1);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('address');
      expect(data).toHaveProperty('reviews');
      expect(data).toHaveProperty('averageRating');
      expect(data).toHaveProperty('reviewCount');
    });

    it('should return 404 for non-existent merchant', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/99999`);
      
      expect(response.status).toBe(404);
    });

    it('should include business hours', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/1`);
      const data = await response.json();
      
      expect(data).toHaveProperty('businessHours');
      if (data.businessHours) {
        expect(data.businessHours).toHaveProperty('mon');
        expect(Array.isArray(data.businessHours.mon)).toBe(true);
      }
    });
  });

  describe('GET /api/v1/merchants/nearby', () => {
    it('should return nearby merchants with distance', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/nearby?lat=37.5665&lng=126.9780&radius=1000`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('merchants');
      expect(data).toHaveProperty('center');
      expect(data).toHaveProperty('radius');
      
      if (data.merchants.length > 0) {
        const merchant = data.merchants[0];
        expect(merchant).toHaveProperty('distance');
        expect(merchant).toHaveProperty('walkingTime');
        expect(merchant.distance).toBeLessThanOrEqual(1000);
      }
    });

    it('should calculate haversine distance correctly', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/nearby?lat=37.5665&lng=126.9780&radius=500`);
      const data = await response.json();
      
      if (data.merchants.length > 0) {
        data.merchants.forEach((merchant: any) => {
          expect(merchant.distance).toBeGreaterThanOrEqual(0);
          expect(merchant.distance).toBeLessThanOrEqual(500);
          // Walking time: approximately 4km/h = 66.67m/min
          const expectedTime = Math.ceil(merchant.distance / 66.67);
          expect(merchant.walkingTime).toBeCloseTo(expectedTime, 0);
        });
      }
    });

    it('should filter by card types', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/nearby?lat=37.5665&lng=126.9780&radius=1000&cardTypes=CHILD_MEAL`);
      const data = await response.json();
      
      if (data.merchants.length > 0) {
        const merchant = data.merchants[0];
        const cardCodes = merchant.cards.map((c: any) => c.code);
        expect(cardCodes).toContain('CHILD_MEAL');
      }
    });

    it('should limit results', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/nearby?lat=37.5665&lng=126.9780&radius=5000&limit=5`);
      const data = await response.json();
      
      expect(data.merchants.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/v1/merchants/search', () => {
    it('should search merchants by Korean text', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=김밥천국`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.query).toBe('김밥천국');
      
      if (data.content.length > 0) {
        const merchant = data.content[0];
        expect(merchant.name.toLowerCase()).toContain('김밥');
      }
    });

    it('should support 초성 검색 (initial consonant search)', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=ㄱㅂㅊㄱ`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // Should match merchants like "김밥천국"
      if (data.content.length > 0) {
        expect(data.suggestions).toBeDefined();
      }
    });

    it('should provide search suggestions', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=편의`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.suggestions).toBeDefined();
      expect(Array.isArray(data.suggestions)).toBe(true);
      
      if (data.suggestions.length > 0) {
        expect(data.suggestions[0]).toContain('편의점');
      }
    });

    it('should filter search results by card types', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=식당&cardTypes=CHILD_MEAL`);
      const data = await response.json();
      
      if (data.content.length > 0) {
        const merchant = data.content[0];
        const cardCodes = merchant.cards.map((c: any) => c.code);
        expect(cardCodes).toContain('CHILD_MEAL');
      }
    });

    it('should handle empty search results', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=없는가맹점이름`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.content).toEqual([]);
      expect(data.totalElements).toBe(0);
    });
  });
});