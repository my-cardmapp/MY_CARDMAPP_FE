/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useURLSync } from './useURLSync';
import { useSearchStore } from '@/stores/searchStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock search store
vi.mock('@/stores/searchStore', () => ({
  useSearchStore: vi.fn(),
}));

describe('useURLSync', () => {
  let mockRouter: any;
  let mockSearchParams: URLSearchParams;
  let mockStoreState: any;
  let mockStoreActions: any;
  let mockPathname: string;

  beforeEach(() => {
    // Setup mock router
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
    
    // Setup mock search params
    mockSearchParams = new URLSearchParams();
    
    // Setup mock pathname
    mockPathname = '/map';
    
    // Setup mock store state and actions
    mockStoreState = {
      query: '',
      activeCardTypes: [],
      activeCategories: [],
      viewMode: 'map' as const,
      page: 0,
    };
    
    mockStoreActions = {
      setQuery: vi.fn(),
      setCardTypes: vi.fn(),
      setCategories: vi.fn(),
      setViewMode: vi.fn(),
      setPagination: vi.fn(),
      batchUpdate: vi.fn(),
    };
    
    // Setup mocks
    (useRouter as any).mockReturnValue(mockRouter);
    (useSearchParams as any).mockReturnValue(mockSearchParams);
    (usePathname as any).mockReturnValue(mockPathname);
    (useSearchStore as any).mockReturnValue({
      ...mockStoreState,
      ...mockStoreActions,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/map',
        origin: 'http://localhost:3000',
        pathname: '/map',
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('URL to State Synchronization', () => {
    it('should initialize state from URL parameters on mount', () => {
      // Setup URL with parameters
      mockSearchParams = new URLSearchParams('q=편의점&cards=CHILD_MEAL,CULTURE_NURI&categories=FOOD,CAFE&view=list&page=2');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      // Render hook
      renderHook(() => useURLSync());

      // Verify state was updated from URL
      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith({
        query: '편의점',
        activeCardTypes: ['CHILD_MEAL', 'CULTURE_NURI'],
        activeCategories: ['FOOD', 'CAFE'],
        viewMode: 'list',
        page: 2,
      });
    });

    it('should handle missing URL parameters gracefully', () => {
      // Empty URL params
      mockSearchParams = new URLSearchParams();
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      // Render hook
      renderHook(() => useURLSync());

      // Should not update state when no params
      expect(mockStoreActions.batchUpdate).not.toHaveBeenCalled();
    });

    it('should decode Korean text properly', () => {
      mockSearchParams = new URLSearchParams('q=' + encodeURIComponent('김밥천국'));
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          query: '김밥천국',
        })
      );
    });

    it('should handle malformed URL parameters', () => {
      mockSearchParams = new URLSearchParams('page=invalid&view=unknown');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      // Should use defaults for invalid values
      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0, // default
          viewMode: 'map', // default
        })
      );
    });

    it('should parse arrays from comma-separated values', () => {
      mockSearchParams = new URLSearchParams('cards=A,B,C&categories=X,Y,Z');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          activeCardTypes: ['A', 'B', 'C'],
          activeCategories: ['X', 'Y', 'Z'],
        })
      );
    });

    it('should handle empty array parameters', () => {
      mockSearchParams = new URLSearchParams('cards=&categories=');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          activeCardTypes: [],
          activeCategories: [],
        })
      );
    });
  });

  describe('State to URL Synchronization', () => {
    it('should update URL when search query changes', async () => {
      const { result } = renderHook(() => useURLSync());

      // Update store state
      mockStoreState.query = '편의점';
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      // Trigger sync
      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('q=' + encodeURIComponent('편의점'))
        );
      });
    });

    it('should update URL when filters change', async () => {
      const { result } = renderHook(() => useURLSync());

      // Update store state
      mockStoreState.activeCardTypes = ['CHILD_MEAL', 'CULTURE_NURI'];
      mockStoreState.activeCategories = ['FOOD', 'CAFE'];
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      // Trigger sync
      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('cards=CHILD_MEAL,CULTURE_NURI')
        );
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('categories=FOOD,CAFE')
        );
      });
    });

    it('should update URL when view mode changes', async () => {
      const { result } = renderHook(() => useURLSync());

      mockStoreState.viewMode = 'list';
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('view=list')
        );
      });
    });

    it('should update URL when page changes', async () => {
      const { result } = renderHook(() => useURLSync());

      mockStoreState.page = 3;
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('page=3')
        );
      });
    });

    it('should remove parameters when values are default', async () => {
      const { result } = renderHook(() => useURLSync());

      // Set to defaults
      mockStoreState.query = '';
      mockStoreState.activeCardTypes = [];
      mockStoreState.activeCategories = [];
      mockStoreState.viewMode = 'map';
      mockStoreState.page = 0;
      
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        // Should replace with pathname only (no params)
        expect(mockRouter.replace).toHaveBeenCalledWith('/map');
      });
    });

    it('should debounce rapid URL updates', async () => {
      const { result } = renderHook(() => useURLSync({ debounceMs: 300 }));

      // Trigger multiple syncs rapidly
      act(() => {
        result.current.syncToURL();
        result.current.syncToURL();
        result.current.syncToURL();
      });

      // Should not call immediately
      expect(mockRouter.replace).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      }, { timeout: 400 });
    });

    it('should use push instead of replace when specified', async () => {
      const { result } = renderHook(() => useURLSync({ replaceHistory: false }));

      mockStoreState.query = 'test';
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalled();
        expect(mockRouter.replace).not.toHaveBeenCalled();
      });
    });
  });

  describe('Shareable URL Generation', () => {
    it('should generate a complete shareable URL', () => {
      mockStoreState.query = '편의점';
      mockStoreState.activeCardTypes = ['CHILD_MEAL'];
      mockStoreState.activeCategories = ['FOOD'];
      mockStoreState.viewMode = 'list';
      mockStoreState.page = 2;
      
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      const { result } = renderHook(() => useURLSync());
      const shareableURL = result.current.getShareableURL();

      expect(shareableURL).toContain('q=' + encodeURIComponent('편의점'));
      expect(shareableURL).toContain('cards=CHILD_MEAL');
      expect(shareableURL).toContain('categories=FOOD');
      expect(shareableURL).toContain('view=list');
      expect(shareableURL).toContain('page=2');
      expect(shareableURL).toContain('http://localhost:3000/map');
    });

    it('should exclude default values from shareable URL', () => {
      // All default values
      mockStoreState.query = '';
      mockStoreState.activeCardTypes = [];
      mockStoreState.activeCategories = [];
      mockStoreState.viewMode = 'map';
      mockStoreState.page = 0;
      
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      const { result } = renderHook(() => useURLSync());
      const shareableURL = result.current.getShareableURL();

      expect(shareableURL).toBe('http://localhost:3000/map');
    });

    it('should properly encode special characters', () => {
      mockStoreState.query = 'GS25 & CU';
      mockStoreState.activeCategories = ['음식/카페'];
      
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      const { result } = renderHook(() => useURLSync());
      const shareableURL = result.current.getShareableURL();

      expect(shareableURL).toContain(encodeURIComponent('GS25 & CU'));
      expect(shareableURL).toContain(encodeURIComponent('음식/카페'));
    });
  });

  describe('Bidirectional Synchronization', () => {
    it('should sync from URL on mount and to URL on state change', async () => {
      // Initial URL params
      mockSearchParams = new URLSearchParams('q=initial');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      const { result, rerender } = renderHook(() => useURLSync());

      // Should sync from URL on mount
      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'initial' })
      );

      // Change store state
      mockStoreState.query = 'updated';
      (useSearchStore as any).mockReturnValue({
        ...mockStoreState,
        ...mockStoreActions,
      });

      // Trigger sync
      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('q=updated')
        );
      });
    });

    it('should track sync status', () => {
      const { result } = renderHook(() => useURLSync());

      // Initially not synced
      expect(result.current.isURLSynced).toBe(false);

      // After sync
      act(() => {
        result.current.syncToURL();
      });

      expect(result.current.isURLSynced).toBe(true);
    });

    it('should handle browser back/forward navigation', () => {
      const { result } = renderHook(() => useURLSync());

      // Simulate browser back with new params
      mockSearchParams = new URLSearchParams('q=back&cards=CHILD_MEAL');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      // Manual sync from URL (would be triggered by navigation event)
      act(() => {
        result.current.syncFromURL();
      });

      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith({
        query: 'back',
        activeCardTypes: ['CHILD_MEAL'],
        activeCategories: [],
        viewMode: 'map',
        page: 0,
      });
    });
  });

  describe('Map Position Parameters', () => {
    it('should include map position in URL when provided', async () => {
      const { result } = renderHook(() => useURLSync({
        includeMapPosition: true,
      }));

      // Mock map position
      const mapPosition = {
        lat: 37.5665,
        lng: 126.9780,
        zoom: 15,
      };

      act(() => {
        result.current.syncToURL(mapPosition);
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('lat=37.5665')
        );
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('lng=126.978')
        );
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining('zoom=15')
        );
      });
    });

    it('should parse map position from URL', () => {
      mockSearchParams = new URLSearchParams('lat=37.5665&lng=126.9780&zoom=15');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useURLSync({
        includeMapPosition: true,
      }));

      const mapPosition = result.current.getMapPosition();
      
      expect(mapPosition).toEqual({
        lat: 37.5665,
        lng: 126.9780,
        zoom: 15,
      });
    });

    it('should validate map position parameters', () => {
      mockSearchParams = new URLSearchParams('lat=invalid&lng=200&zoom=-1');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      const { result } = renderHook(() => useURLSync({
        includeMapPosition: true,
      }));

      const mapPosition = result.current.getMapPosition();
      
      // Should return null for invalid position
      expect(mapPosition).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle rapid filter changes efficiently', async () => {
      const { result } = renderHook(() => useURLSync({ debounceMs: 100 }));

      // Simulate rapid filter changes
      for (let i = 0; i < 10; i++) {
        mockStoreState.activeCardTypes = [`CARD_${i}`];
        (useSearchStore as any).mockReturnValue({
          ...mockStoreState,
          ...mockStoreActions,
        });

        act(() => {
          result.current.syncToURL();
        });
      }

      // Should only update URL once after debounce
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      }, { timeout: 200 });
    });

    it('should not update URL if state has not changed', async () => {
      const { result } = renderHook(() => useURLSync());

      // First sync
      act(() => {
        result.current.syncToURL();
      });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      });

      // Second sync with same state
      act(() => {
        result.current.syncToURL();
      });

      // Should not call replace again
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined pathname gracefully', () => {
      (usePathname as any).mockReturnValue(undefined);
      
      const { result } = renderHook(() => useURLSync());
      
      // Should not throw
      expect(() => result.current.syncToURL()).not.toThrow();
    });

    it('should handle null search params gracefully', () => {
      (useSearchParams as any).mockReturnValue(null);
      
      const { result } = renderHook(() => useURLSync());
      
      // Should not throw
      expect(() => result.current.syncFromURL()).not.toThrow();
    });

    it('should sanitize XSS attempts in URL parameters', () => {
      mockSearchParams = new URLSearchParams('q=<script>alert("xss")</script>');
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      // Should sanitize the input
      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.stringContaining('<script>'),
        })
      );
    });

    it('should handle very long parameter values', () => {
      const longString = 'a'.repeat(1000);
      mockSearchParams = new URLSearchParams(`q=${longString}`);
      (useSearchParams as any).mockReturnValue(mockSearchParams);

      renderHook(() => useURLSync());

      // Should truncate long values
      expect(mockStoreActions.batchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringMatching(/^a{0,200}$/), // Max 200 chars
        })
      );
    });

    it('should handle concurrent sync operations', async () => {
      const { result } = renderHook(() => useURLSync());

      // Trigger multiple concurrent syncs
      const promises = [
        act(() => result.current.syncToURL()),
        act(() => result.current.syncFromURL()),
        act(() => result.current.syncToURL()),
      ];

      await Promise.all(promises);

      // Should handle without errors
      expect(result.current.isURLSynced).toBeDefined();
    });
  });
});