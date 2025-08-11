import { describe, it, expect } from 'vitest';
import {
  SPRITE_CONFIG,
  getSpritePosition,
  getSpriteUrl,
  getSpriteBackground,
  SPRITE_SHEETS,
  type SpriteType,
  type IconName
} from './spriteConfig';

describe('spriteConfig', () => {
  describe('SPRITE_CONFIG', () => {
    it('should have valid configuration for all sprite types', () => {
      expect(SPRITE_CONFIG).toBeDefined();
      expect(SPRITE_CONFIG.cards).toBeDefined();
      expect(SPRITE_CONFIG.categories).toBeDefined();
      expect(SPRITE_CONFIG.ui).toBeDefined();
    });

    it('should have correct sprite sheet references', () => {
      expect(SPRITE_CONFIG.cards.sheet).toBe('cards');
      expect(SPRITE_CONFIG.categories.sheet).toBe('categories');
      expect(SPRITE_CONFIG.ui.sheet).toBe('ui');
    });

    it('should have valid icon size configurations', () => {
      // Cards sprite
      expect(SPRITE_CONFIG.cards.iconSize).toEqual({ width: 48, height: 48 });
      expect(SPRITE_CONFIG.cards.columns).toBe(10);
      
      // Categories sprite
      expect(SPRITE_CONFIG.categories.iconSize).toEqual({ width: 32, height: 32 });
      expect(SPRITE_CONFIG.categories.columns).toBe(10);
      
      // UI sprite
      expect(SPRITE_CONFIG.ui.iconSize).toEqual({ width: 24, height: 24 });
      expect(SPRITE_CONFIG.ui.columns).toBe(20);
    });

    it('should have icon mappings', () => {
      // Cards icons
      expect(SPRITE_CONFIG.cards.icons).toHaveProperty('CHILD_MEAL');
      expect(SPRITE_CONFIG.cards.icons).toHaveProperty('CULTURE_NURI');
      expect(SPRITE_CONFIG.cards.icons).toHaveProperty('LOCAL_LOVE');
      
      // Categories icons
      expect(SPRITE_CONFIG.categories.icons).toHaveProperty('restaurant');
      expect(SPRITE_CONFIG.categories.icons).toHaveProperty('convenience');
      expect(SPRITE_CONFIG.categories.icons).toHaveProperty('cafe');
      
      // UI icons
      expect(SPRITE_CONFIG.ui.icons).toHaveProperty('close');
      expect(SPRITE_CONFIG.ui.icons).toHaveProperty('search');
      expect(SPRITE_CONFIG.ui.icons).toHaveProperty('location');
    });
  });

  describe('SPRITE_SHEETS', () => {
    it('should have URLs for all sprite sheets', () => {
      expect(SPRITE_SHEETS.cards).toMatch(/^\/sprites\//);
      expect(SPRITE_SHEETS.categories).toMatch(/^\/sprites\//);
      expect(SPRITE_SHEETS.ui).toMatch(/^\/sprites\//);
    });

    it('should support retina displays', () => {
      expect(SPRITE_SHEETS.cards).toContain('@2x');
      expect(SPRITE_SHEETS.categories).toContain('@2x');
      expect(SPRITE_SHEETS.ui).toContain('@2x');
    });
  });

  describe('getSpritePosition', () => {
    it('should calculate correct position for first icon', () => {
      const position = getSpritePosition('cards', 'CHILD_MEAL' as IconName);
      expect(position).toEqual({ x: -0, y: -0 });
    });

    it('should calculate correct position for icons in first row', () => {
      const position = getSpritePosition('cards', 'CULTURE_NURI' as IconName);
      expect(position).toEqual({ x: -48, y: -0 });
    });

    it('should calculate correct position for icons in second row', () => {
      // Assuming we have more than 10 card icons
      const mockIcon = Object.keys(SPRITE_CONFIG.cards.icons)[10] as IconName;
      if (mockIcon) {
        const position = getSpritePosition('cards', mockIcon);
        expect(position.y).toBe(-48);
      }
    });

    it('should handle different sprite types', () => {
      const categoryPos = getSpritePosition('categories', 'restaurant' as IconName);
      expect(categoryPos).toBeDefined();
      expect(typeof categoryPos.x).toBe('number');
      expect(typeof categoryPos.y).toBe('number');

      const uiPos = getSpritePosition('ui', 'close' as IconName);
      expect(uiPos).toBeDefined();
      expect(typeof uiPos.x).toBe('number');
      expect(typeof uiPos.y).toBe('number');
    });

    it('should throw error for invalid icon name', () => {
      expect(() => getSpritePosition('cards', 'INVALID_ICON' as IconName))
        .toThrow('Icon INVALID_ICON not found in cards sprite');
    });
  });

  describe('getSpriteUrl', () => {
    it('should return correct URL for sprite sheet', () => {
      const url = getSpriteUrl('cards');
      expect(url).toBe(SPRITE_SHEETS.cards);
    });

    it('should return correct URLs for all sprite types', () => {
      expect(getSpriteUrl('cards')).toBe('/sprites/cards-sprite@2x.png');
      expect(getSpriteUrl('categories')).toBe('/sprites/categories-sprite@2x.png');
      expect(getSpriteUrl('ui')).toBe('/sprites/ui-sprite@2x.png');
    });
  });

  describe('getSpriteBackground', () => {
    it('should return correct background CSS for icon', () => {
      const bg = getSpriteBackground('cards', 'CHILD_MEAL' as IconName);
      expect(bg).toContain('url(/sprites/cards-sprite@2x.png)');
      expect(bg).toContain('0px 0px');
      expect(bg).toContain('no-repeat');
    });

    it('should calculate correct background position', () => {
      const bg = getSpriteBackground('cards', 'CULTURE_NURI' as IconName);
      expect(bg).toContain('-48px 0px');
    });

    it('should include background size for retina support', () => {
      const bg = getSpriteBackground('cards', 'CHILD_MEAL' as IconName, true);
      expect(bg).toMatch(/background-size:\s*\d+px\s+\d+px/);
    });

    it('should handle custom size parameter', () => {
      const customSize = { width: 24, height: 24 };
      const bg = getSpriteBackground('cards', 'CHILD_MEAL' as IconName, true, customSize);
      expect(bg).toContain('background-size: 240px');
    });
  });
});