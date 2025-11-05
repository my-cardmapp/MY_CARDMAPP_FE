import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { cardHandlers } from './cards';

const server = setupServer(...cardHandlers);
const BASE_URL = 'http://localhost';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Card API Handlers', () => {
  describe('GET /api/v1/cards', () => {
    it('should return list of card types with metadata', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('cards');
      expect(Array.isArray(data.cards)).toBe(true);
      expect(data.cards.length).toBeGreaterThan(0);
      
      const card = data.cards[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('code');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('colorHex');
      expect(card).toHaveProperty('description');
      expect(card).toHaveProperty('benefits');
      expect(card).toHaveProperty('restrictions');
      expect(card).toHaveProperty('issuer');
      expect(card).toHaveProperty('merchantCount');
    });

    it('should include Korean card types', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards`);
      const data = await response.json();
      
      const cardCodes = data.cards.map((c: any) => c.code);
      expect(cardCodes).toContain('CHILD_MEAL');
      expect(cardCodes).toContain('CULTURE_NURI');
      expect(cardCodes).toContain('LOCAL_LOVE');
      
      const childMealCard = data.cards.find((c: any) => c.code === 'CHILD_MEAL');
      expect(childMealCard.name).toBe('아동급식카드');
      expect(childMealCard.issuer).toContain('보건복지부');
    });

    it('should include popular categories for each card', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards`);
      const data = await response.json();
      
      const childMealCard = data.cards.find((c: any) => c.code === 'CHILD_MEAL');
      if (childMealCard.popularCategories) {
        expect(Array.isArray(childMealCard.popularCategories)).toBe(true);
        childMealCard.popularCategories.forEach((category: any) => {
          expect(category).toHaveProperty('id');
          expect(category).toHaveProperty('code');
          expect(category).toHaveProperty('name');
        });
      }
    });
  });

  describe('GET /api/v1/cards/:code', () => {
    it('should return detailed card information', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards/CHILD_MEAL`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.code).toBe('CHILD_MEAL');
      expect(data.name).toBe('아동급식카드');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('benefits');
      expect(data).toHaveProperty('restrictions');
      expect(data).toHaveProperty('recentMerchants');
      expect(data).toHaveProperty('statistics');
    });

    it('should include recent merchants for the card', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards/CHILD_MEAL`);
      const data = await response.json();
      
      expect(Array.isArray(data.recentMerchants)).toBe(true);
      if (data.recentMerchants.length > 0) {
        const merchant = data.recentMerchants[0];
        expect(merchant).toHaveProperty('id');
        expect(merchant).toHaveProperty('name');
        expect(merchant).toHaveProperty('address');
        expect(merchant).toHaveProperty('category');
        
        // 해당 카드를 지원하는 가맹점이어야 함
        const supportedCards = merchant.cards.map((c: any) => c.code);
        expect(supportedCards).toContain('CHILD_MEAL');
      }
    });

    it('should include statistics by category', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards/CULTURE_NURI`);
      const data = await response.json();
      
      expect(data.statistics).toHaveProperty('totalMerchants');
      expect(data.statistics).toHaveProperty('merchantsByCategory');
      expect(data.statistics.totalMerchants).toBeGreaterThanOrEqual(0);
      
      if (data.statistics.merchantsByCategory) {
        const categories = Object.keys(data.statistics.merchantsByCategory);
        categories.forEach(category => {
          const count = data.statistics.merchantsByCategory[category];
          expect(typeof count).toBe('number');
          expect(count).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should return 404 for non-existent card code', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards/INVALID_CARD`);
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
    });

    it('should have proper Korean benefits and restrictions', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/cards/CHILD_MEAL`);
      const data = await response.json();
      
      // 아동급식카드 특성
      expect(data.benefits.some((b: string) => b.includes('1일') || b.includes('사용'))).toBe(true);
      expect(data.restrictions).toContainEqual(expect.stringContaining('한도'));
      
      // 적절한 가맹점 수
      expect(data.merchantCount).toBeGreaterThan(0);
    });
  });
});