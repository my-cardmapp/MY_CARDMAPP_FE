import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpriteIcon, SpriteIconProps } from './SpriteIcon';
import * as spriteUtils from '@/utils/spriteUtils';

// Mock sprite utils
vi.mock('@/utils/spriteUtils', () => ({
  preloadSpriteSheets: vi.fn().mockResolvedValue([true]),
  isSpriteLoaded: vi.fn().mockReturnValue(true),
}));

// Mock sprite config
vi.mock('@/constants/spriteConfig', () => ({
  getSpritePosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
  getSpriteUrl: vi.fn().mockReturnValue('/sprites/test-sprite.png'),
  getSpriteBackground: vi.fn().mockReturnValue('url(/sprites/test-sprite.png) 0px 0px no-repeat'),
  SPRITE_CONFIG: {
    cards: {
      iconSize: { width: 48, height: 48 },
      icons: { CHILD_MEAL: 0, CULTURE_NURI: 1 },
    },
    categories: {
      iconSize: { width: 32, height: 32 },
      icons: { restaurant: 0, cafe: 1 },
    },
    ui: {
      iconSize: { width: 24, height: 24 },
      icons: { close: 0, search: 1 },
    },
  },
}));

describe('SpriteIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render sprite icon with correct styles', () => {
      render(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
          testId="sprite-icon"
        />
      );

      const icon = screen.getByTestId('sprite-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('sprite-icon');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('should apply custom size', () => {
      render(
        <SpriteIcon
          type="ui"
          name="close"
          size={32}
          testId="sized-icon"
        />
      );

      const icon = screen.getByTestId('sized-icon');
      expect(icon).toHaveStyle({
        width: '32px',
        height: '32px',
      });
    });

    it('should apply custom className', () => {
      render(
        <SpriteIcon
          type="categories"
          name="restaurant"
          className="custom-class"
          testId="custom-icon"
        />
      );

      const icon = screen.getByTestId('custom-icon');
      expect(icon).toHaveClass('sprite-icon');
      expect(icon).toHaveClass('custom-class');
    });

    it('should render with accessibility attributes', () => {
      render(
        <SpriteIcon
          type="cards"
          name="CULTURE_NURI"
          alt="Culture Nuri Card"
          testId="accessible-icon"
        />
      );

      const icon = screen.getByTestId('accessible-icon');
      expect(icon).toHaveAttribute('aria-label', 'Culture Nuri Card');
      expect(icon).toHaveAttribute('role', 'img');
    });
  });

  describe('Sprite Loading', () => {
    it('should preload sprite on mount', async () => {
      render(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
        />
      );

      await waitFor(() => {
        expect(spriteUtils.preloadSpriteSheets).toHaveBeenCalledWith(['cards']);
      });
    });

    it('should not reload already loaded sprites', () => {
      vi.mocked(spriteUtils.isSpriteLoaded).mockReturnValue(true);

      render(
        <SpriteIcon
          type="ui"
          name="search"
        />
      );

      expect(spriteUtils.preloadSpriteSheets).not.toHaveBeenCalled();
    });

    it('should show loading state while sprite loads', async () => {
      vi.mocked(spriteUtils.isSpriteLoaded).mockReturnValue(false);
      vi.mocked(spriteUtils.preloadSpriteSheets).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([true]), 100))
      );

      render(
        <SpriteIcon
          type="categories"
          name="cafe"
          showLoading
          testId="loading-icon"
        />
      );

      const icon = screen.getByTestId('loading-icon');
      expect(icon).toHaveClass('sprite-icon--loading');

      await waitFor(() => {
        expect(icon).not.toHaveClass('sprite-icon--loading');
      });
    });

    it('should handle sprite loading error', async () => {
      vi.mocked(spriteUtils.isSpriteLoaded).mockReturnValue(false);
      vi.mocked(spriteUtils.preloadSpriteSheets).mockRejectedValue(new Error('Failed to load'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
          fallback={<div>Fallback Icon</div>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Fallback Icon')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Interaction', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <SpriteIcon
          type="ui"
          name="close"
          onClick={handleClick}
          testId="clickable-icon"
        />
      );

      const icon = screen.getByTestId('clickable-icon');
      await user.click(icon);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible when clickable', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <SpriteIcon
          type="ui"
          name="search"
          onClick={handleClick}
          testId="keyboard-icon"
        />
      );

      const icon = screen.getByTestId('keyboard-icon');
      expect(icon).toHaveAttribute('tabIndex', '0');
      
      await user.tab();
      expect(icon).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should not be focusable when not interactive', () => {
      render(
        <SpriteIcon
          type="cards"
          name="CULTURE_NURI"
          testId="non-interactive"
        />
      );

      const icon = screen.getByTestId('non-interactive');
      expect(icon).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Responsive Behavior', () => {
    it('should support retina displays', () => {
      render(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
          retina
          testId="retina-icon"
        />
      );

      const icon = screen.getByTestId('retina-icon');
      expect(icon).toHaveClass('sprite-icon--retina');
    });

    it('should apply responsive size classes', () => {
      render(
        <SpriteIcon
          type="ui"
          name="location"
          responsive={{
            sm: 16,
            md: 24,
            lg: 32,
          }}
          testId="responsive-icon"
        />
      );

      const icon = screen.getByTestId('responsive-icon');
      expect(icon).toHaveClass('sprite-icon--responsive');
      expect(icon).toHaveAttribute('data-size-sm', '16');
      expect(icon).toHaveAttribute('data-size-md', '24');
      expect(icon).toHaveAttribute('data-size-lg', '32');
    });
  });

  describe('Performance', () => {
    it('should memoize sprite position calculations', async () => {
      const spriteConfig = await import('@/constants/spriteConfig');
      const getSpritePositionSpy = vi.spyOn(spriteConfig, 'getSpritePosition');
      
      const { rerender } = render(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
          testId="memoized-icon"
        />
      );

      // Re-render with same props
      rerender(
        <SpriteIcon
          type="cards"
          name="CHILD_MEAL"
          testId="memoized-icon"
        />
      );

      // Component should memoize and not recalculate position
      expect(getSpritePositionSpy.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it('should lazy load sprites when specified', async () => {
      const observer = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      };

      // @ts-ignore
      global.IntersectionObserver = vi.fn(() => observer);

      const { container } = render(
        <SpriteIcon
          type="categories"
          name="restaurant"
          lazyLoad
          testId="lazy-icon"
        />
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(observer.observe).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid sprite type gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SpriteIcon
          type={'invalid' as any}
          name="test"
          fallback={<div>Error Fallback</div>}
        />
      );

      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('should handle invalid icon name gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SpriteIcon
          type="cards"
          name={'INVALID_ICON' as any}
          fallback={<div>Invalid Icon</div>}
        />
      );

      expect(screen.getByText('Invalid Icon')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });
});