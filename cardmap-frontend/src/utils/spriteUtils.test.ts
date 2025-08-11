import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  preloadSpriteSheets,
  generateSpriteSheet,
  optimizeSpriteSize,
  calculateOptimalLayout,
  isSpriteLoaded,
  clearSpriteCache,
  getSpriteMetrics,
  type SpriteLayout,
  type SpriteMetrics
} from './spriteUtils';

describe('spriteUtils', () => {
  beforeEach(() => {
    clearSpriteCache();
  });

  describe('preloadSpriteSheets', () => {
    it('should preload all sprite sheets', async () => {
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      
      vi.spyOn(window, 'Image').mockImplementation(() => {
        // Use Promise to ensure async behavior
        Promise.resolve().then(() => mockImage.onload?.());
        return mockImage as any;
      });

      const sheets = ['cards', 'categories', 'ui'];
      const results = await preloadSpriteSheets(sheets);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBe(true);
      });
    }, 10000);

    it('should handle failed sprite loading', async () => {
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      
      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => mockImage.onerror?.(), 0);
        return mockImage as any;
      });

      const sheets = ['cards'];
      const results = await preloadSpriteSheets(sheets);
      
      expect(results[0]).toBe(false);
    });

    it('should cache loaded sprites', async () => {
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      
      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => mockImage.onload?.(), 0);
        return mockImage as any;
      });

      await preloadSpriteSheets(['cards']);
      expect(isSpriteLoaded('cards')).toBe(true);
      expect(isSpriteLoaded('categories')).toBe(false);
    });
  });

  describe('calculateOptimalLayout', () => {
    it('should calculate optimal grid layout for icons', () => {
      const iconCount = 25;
      const iconSize = { width: 48, height: 48 };
      
      const layout = calculateOptimalLayout(iconCount, iconSize);
      
      expect(layout.columns).toBe(5);
      expect(layout.rows).toBe(5);
      expect(layout.totalWidth).toBe(240);
      expect(layout.totalHeight).toBe(240);
    });

    it('should handle rectangular layouts', () => {
      const iconCount = 20;
      const iconSize = { width: 32, height: 32 };
      
      const layout = calculateOptimalLayout(iconCount, iconSize);
      
      expect(layout.columns * layout.rows).toBeGreaterThanOrEqual(iconCount);
      expect(layout.totalWidth).toBe(layout.columns * 32);
      expect(layout.totalHeight).toBe(layout.rows * 32);
    });

    it('should respect max width constraint', () => {
      const iconCount = 200;
      const iconSize = { width: 48, height: 48 };
      const maxWidth = 480;
      
      const layout = calculateOptimalLayout(iconCount, iconSize, maxWidth);
      
      expect(layout.totalWidth).toBeLessThanOrEqual(maxWidth);
      expect(layout.columns).toBeLessThanOrEqual(10);
    });

    it('should handle single icon', () => {
      const layout = calculateOptimalLayout(1, { width: 48, height: 48 });
      
      expect(layout.columns).toBe(1);
      expect(layout.rows).toBe(1);
      expect(layout.totalWidth).toBe(48);
      expect(layout.totalHeight).toBe(48);
    });
  });

  describe('optimizeSpriteSize', () => {
    it('should optimize sprite dimensions for power of 2', () => {
      const size = optimizeSpriteSize(250, 250);
      
      expect(size.width).toBe(256);
      expect(size.height).toBe(256);
    });

    it('should not exceed maximum size', () => {
      const size = optimizeSpriteSize(5000, 5000);
      
      expect(size.width).toBe(4096);
      expect(size.height).toBe(4096);
    });

    it('should handle rectangular sprites', () => {
      const size = optimizeSpriteSize(500, 200);
      
      expect(size.width).toBe(512);
      expect(size.height).toBe(256);
    });

    it('should handle exact power of 2', () => {
      const size = optimizeSpriteSize(512, 1024);
      
      expect(size.width).toBe(512);
      expect(size.height).toBe(1024);
    });
  });

  describe('getSpriteMetrics', () => {
    it('should calculate sprite metrics', () => {
      const metrics = getSpriteMetrics('cards');
      
      expect(metrics).toHaveProperty('totalIcons');
      expect(metrics).toHaveProperty('spriteWidth');
      expect(metrics).toHaveProperty('spriteHeight');
      expect(metrics).toHaveProperty('fileSize');
      expect(metrics).toHaveProperty('compressionRatio');
    });

    it('should calculate compression ratio', () => {
      const metrics = getSpriteMetrics('ui');
      
      // Compression ratio should be between 0 and 1
      expect(metrics.compressionRatio).toBeGreaterThan(0);
      expect(metrics.compressionRatio).toBeLessThanOrEqual(1);
    });

    it('should estimate file size', () => {
      const metrics = getSpriteMetrics('categories');
      
      // File size should be reasonable (in KB)
      expect(metrics.fileSize).toBeGreaterThan(0);
      expect(metrics.fileSize).toBeLessThan(5000); // Less than 5MB
    });
  });

  describe('generateSpriteSheet', () => {
    it('should generate CSS for sprite sheet', () => {
      const icons = [
        { name: 'icon1', index: 0 },
        { name: 'icon2', index: 1 },
        { name: 'icon3', index: 2 },
      ];
      
      const css = generateSpriteSheet(
        icons,
        { width: 32, height: 32 },
        { columns: 3, rows: 1, totalWidth: 96, totalHeight: 32 },
        'test-sprite'
      );
      
      expect(css).toContain('.sprite-test-sprite');
      expect(css).toContain('background-image: url');
      expect(css).toContain('.sprite-test-sprite-icon1');
      expect(css).toContain('background-position: 0px 0px');
      expect(css).toContain('.sprite-test-sprite-icon2');
      expect(css).toContain('background-position: -32px 0px');
    });

    it('should handle multiple rows', () => {
      const icons = Array.from({ length: 10 }, (_, i) => ({
        name: `icon${i}`,
        index: i,
      }));
      
      const css = generateSpriteSheet(
        icons,
        { width: 24, height: 24 },
        { columns: 5, rows: 2, totalWidth: 120, totalHeight: 48 },
        'ui-sprite'
      );
      
      // First row
      expect(css).toContain('background-position: 0px 0px');
      expect(css).toContain('background-position: -24px 0px');
      
      // Second row
      expect(css).toContain('background-position: 0px -24px');
      expect(css).toContain('background-position: -24px -24px');
    });

    it('should include retina support', () => {
      const icons = [{ name: 'icon1', index: 0 }];
      
      const css = generateSpriteSheet(
        icons,
        { width: 48, height: 48 },
        { columns: 1, rows: 1, totalWidth: 48, totalHeight: 48 },
        'retina-sprite',
        true
      );
      
      expect(css).toContain('@media');
      expect(css).toContain('(-webkit-min-device-pixel-ratio: 2)');
      expect(css).toContain('background-size:');
    });
  });

  describe('clearSpriteCache', () => {
    it('should clear all cached sprites', async () => {
      const mockImage = {
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      
      vi.spyOn(window, 'Image').mockImplementation(() => {
        Promise.resolve().then(() => mockImage.onload?.());
        return mockImage as any;
      });

      await preloadSpriteSheets(['cards', 'ui']);
      expect(isSpriteLoaded('cards')).toBe(true);
      expect(isSpriteLoaded('ui')).toBe(true);
      
      clearSpriteCache();
      
      expect(isSpriteLoaded('cards')).toBe(false);
      expect(isSpriteLoaded('ui')).toBe(false);
    }, 10000);
  });
});