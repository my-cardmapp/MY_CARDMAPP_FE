import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSprite, useSpritePreload, useSpriteMetrics } from './useSprite';
import * as spriteUtils from '@/utils/spriteUtils';

// Mock sprite utils
vi.mock('@/utils/spriteUtils', () => ({
  preloadSpriteSheets: vi.fn().mockResolvedValue([true]),
  isSpriteLoaded: vi.fn().mockReturnValue(false),
  getSpriteMetrics: vi.fn().mockReturnValue({
    totalIcons: 20,
    spriteWidth: 480,
    spriteHeight: 96,
    fileSize: 50,
    compressionRatio: 0.15,
  }),
  calculateNetworkSavings: vi.fn().mockReturnValue({
    requests: 19,
    bandwidth: 30,
    percentage: 60,
  }),
}));

describe('useSprite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSprite', () => {
    it('should return sprite configuration and loading state', () => {
      const { result } = renderHook(() => useSprite('cards', 'CHILD_MEAL'));

      expect(result.current).toHaveProperty('position');
      expect(result.current).toHaveProperty('url');
      expect(result.current).toHaveProperty('size');
      expect(result.current).toHaveProperty('isLoaded');
      expect(result.current).toHaveProperty('error');
    });

    it('should preload sprite on mount', async () => {
      const { result } = renderHook(() => useSprite('categories', 'restaurant'));

      expect(result.current.isLoaded).toBe(false);

      await waitFor(() => {
        expect(spriteUtils.preloadSpriteSheets).toHaveBeenCalledWith(['categories']);
      });
    });

    it('should not reload already loaded sprites', () => {
      vi.mocked(spriteUtils.isSpriteLoaded).mockReturnValue(true);

      const { result } = renderHook(() => useSprite('ui', 'search'));

      expect(result.current.isLoaded).toBe(true);
      expect(spriteUtils.preloadSpriteSheets).not.toHaveBeenCalled();
    });

    it('should handle loading errors', async () => {
      vi.mocked(spriteUtils.isSpriteLoaded).mockReturnValue(false);
      vi.mocked(spriteUtils.preloadSpriteSheets).mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useSprite('cards', 'CULTURE_NURI'));

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toBe('Load failed');
      }, { timeout: 2000 });
    });

    it('should calculate correct sprite position', () => {
      const { result } = renderHook(() => useSprite('cards', 'CHILD_MEAL'));

      expect(result.current.position).toEqual({ x: -0, y: -0 });
    });

    it('should return sprite URL', () => {
      const { result } = renderHook(() => useSprite('categories', 'cafe'));

      expect(result.current.url).toBe('/sprites/categories-sprite@2x.png');
    });

    it('should return icon size', () => {
      const { result } = renderHook(() => useSprite('ui', 'close'));

      expect(result.current.size).toEqual({ width: 24, height: 24 });
    });
  });

  describe('useSpritePreload', () => {
    it('should preload multiple sprite sheets', async () => {
      const { result } = renderHook(() => 
        useSpritePreload(['cards', 'categories', 'ui'])
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.loaded).toEqual({
          cards: true,
          categories: true,
          ui: true,
        });
      }, { timeout: 2000 });
    });

    it('should handle partial loading failure', async () => {
      vi.mocked(spriteUtils.preloadSpriteSheets).mockResolvedValue([true, false, true]);

      const { result } = renderHook(() => 
        useSpritePreload(['cards', 'categories', 'ui'])
      );

      await waitFor(() => {
        expect(result.current.loaded).toEqual({
          cards: true,
          categories: false,
          ui: true,
        });
      });
    });

    it('should not reload on re-render with same sheets', () => {
      const sheets = ['cards', 'ui'];
      const { rerender } = renderHook(
        (props) => useSpritePreload(props),
        { initialProps: sheets }
      );

      rerender(sheets);

      expect(spriteUtils.preloadSpriteSheets).toHaveBeenCalledTimes(1);
    });

    it('should reload when sheets change', () => {
      const { rerender } = renderHook(
        (props) => useSpritePreload(props),
        { initialProps: ['cards'] }
      );

      rerender(['cards', 'ui']);

      expect(spriteUtils.preloadSpriteSheets).toHaveBeenCalledTimes(2);
    });
  });

  describe('useSpriteMetrics', () => {
    it('should return sprite metrics', () => {
      const { result } = renderHook(() => useSpriteMetrics('cards'));

      expect(result.current.metrics).toEqual({
        totalIcons: 20,
        spriteWidth: 480,
        spriteHeight: 96,
        fileSize: 50,
        compressionRatio: 0.15,
      });
    });

    it('should calculate network savings', () => {
      const { result } = renderHook(() => useSpriteMetrics('categories'));

      expect(result.current.savings).toEqual({
        requests: 19,
        bandwidth: 30,
        percentage: 60,
      });
    });

    it('should handle metrics calculation error', () => {
      vi.mocked(spriteUtils.getSpriteMetrics).mockImplementation(() => {
        throw new Error('Invalid sprite type');
      });

      const { result } = renderHook(() => useSpriteMetrics('invalid'));

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Invalid sprite type');
    });

    it('should update metrics when sprite type changes', () => {
      const { result, rerender } = renderHook(
        (type) => useSpriteMetrics(type),
        { initialProps: 'cards' }
      );

      const initialMetrics = result.current.metrics;

      vi.mocked(spriteUtils.getSpriteMetrics).mockReturnValue({
        totalIcons: 15,
        spriteWidth: 320,
        spriteHeight: 96,
        fileSize: 35,
        compressionRatio: 0.12,
      });

      rerender('ui');

      expect(result.current.metrics).not.toEqual(initialMetrics);
      expect(result.current.metrics?.totalIcons).toBe(15);
    });
  });
});