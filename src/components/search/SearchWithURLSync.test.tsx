/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import SearchWithURLSync from './SearchWithURLSync';
import { useURLSync } from '@/hooks/useURLSync';
import { useSearchStore } from '@/stores/searchStore';

// Mock the hooks
vi.mock('@/hooks/useURLSync');
vi.mock('@/stores/searchStore');

// Mock SearchWithFilters component
vi.mock('./SearchWithFilters', () => ({
  default: () => <div data-testid="search-with-filters">Search Component</div>
}));

describe('SearchWithURLSync', () => {
  let mockSyncToURL: any;
  let mockSyncFromURL: any;
  let mockSubscribe: any;
  let mockUnsubscribe: any;

  beforeEach(() => {
    mockSyncToURL = vi.fn();
    mockSyncFromURL = vi.fn();
    mockUnsubscribe = vi.fn();
    mockSubscribe = vi.fn(() => mockUnsubscribe);

    (useURLSync as any).mockReturnValue({
      syncToURL: mockSyncToURL,
      syncFromURL: mockSyncFromURL,
      getShareableURL: vi.fn(),
      isURLSynced: true,
      getMapPosition: vi.fn(),
    });

    (useSearchStore as any).mockReturnValue({
      query: '',
      activeCardTypes: [],
      activeCategories: [],
      viewMode: 'map',
      page: 0,
    });

    (useSearchStore as any).subscribe = mockSubscribe;
  });

  it('should render SearchWithFilters component', () => {
    const { getByTestId } = render(<SearchWithURLSync />);
    expect(getByTestId('search-with-filters')).toBeInTheDocument();
  });

  it('should initialize URL sync with proper options', () => {
    render(<SearchWithURLSync />);
    
    expect(useURLSync).toHaveBeenCalledWith({
      debounceMs: 500,
      replaceHistory: true,
    });
  });

  it('should subscribe to store changes on mount', () => {
    render(<SearchWithURLSync />);
    
    expect(mockSubscribe).toHaveBeenCalled();
    
    // Check if the subscription includes the right state selector
    const [selector] = mockSubscribe.mock.calls[0];
    const selectedState = selector({
      query: 'test',
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['FOOD'],
      viewMode: 'list',
      page: 2,
      // Other state properties that aren't selected
      isLoading: false,
      merchants: [],
    });
    
    expect(selectedState).toEqual({
      query: 'test',
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['FOOD'],
      viewMode: 'list',
      page: 2,
    });
  });

  it('should call syncToURL when store state changes', () => {
    render(<SearchWithURLSync />);
    
    // Get the callback function passed to subscribe
    const [, callback] = mockSubscribe.mock.calls[0];
    
    // Simulate store state change
    callback();
    
    expect(mockSyncToURL).toHaveBeenCalled();
  });

  it('should use equality function to prevent unnecessary syncs', () => {
    render(<SearchWithURLSync />);
    
    // Get the equality function from the options
    const [, , options] = mockSubscribe.mock.calls[0];
    const { equalityFn } = options;
    
    const state1 = {
      query: 'test',
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['FOOD'],
      viewMode: 'list' as const,
      page: 1,
    };
    
    const state2 = {
      query: 'test',
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['FOOD'],
      viewMode: 'list' as const,
      page: 1,
    };
    
    const state3 = {
      query: 'different',
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['FOOD'],
      viewMode: 'list' as const,
      page: 1,
    };
    
    // Same state should return true
    expect(equalityFn(state1, state2)).toBe(true);
    
    // Different state should return false
    expect(equalityFn(state1, state3)).toBe(false);
  });

  it('should unsubscribe from store on unmount', () => {
    const { unmount } = render(<SearchWithURLSync />);
    
    expect(mockUnsubscribe).not.toHaveBeenCalled();
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});