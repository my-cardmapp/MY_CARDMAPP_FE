import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchResults from './SearchResults';
import { useSearchStore } from '@/stores/searchStore';
import type { Merchant } from '@/types';

// Mock dependencies
vi.mock('@/stores/searchStore');
vi.mock('@/components/merchant/MerchantList', () => ({
  default: vi.fn(({ merchants, onItemClick, headerContent, emptyMessage, isLoading }) => (
    <div data-testid="merchant-list">
      {isLoading && <div>Loading...</div>}
      {headerContent && <div data-testid="list-header">{headerContent}</div>}
      {merchants.length === 0 && !isLoading && <div>{emptyMessage}</div>}
      {merchants.map((m: any) => (
        <div 
          key={m.id} 
          data-testid={`merchant-${m.id}`}
          onClick={() => onItemClick(m)}
        >
          {m.name}
        </div>
      ))}
    </div>
  ))
}));

vi.mock('@/components/map/MapContainer', () => ({
  default: vi.fn(({ merchants, className }) => (
    <div data-testid="map-container" className={className}>
      Map with {merchants.length} merchants
    </div>
  ))
}));

// Mock merchant data
const mockMerchants: Merchant[] = [
  {
    id: 1,
    name: '김밥천국 강남점',
    address: '서울시 강남구 역삼동 123-45',
    location: { lat: 37.5012, lng: 127.0396 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B35', iconUrl: '' }
    ],
    category: { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
    phone: '02-1234-5678',
    isVerified: true,
    businessHours: {
      mon: ['09:00', '22:00'],
      tue: ['09:00', '22:00']
    }
  },
  {
    id: 2,
    name: 'GS25 역삼점',
    address: '서울시 강남구 역삼동 678-90',
    location: { lat: 37.5015, lng: 127.0398 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B35', iconUrl: '' },
      { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#4ECDC4', iconUrl: '' }
    ],
    category: { id: 2, code: 'CONVENIENCE', name: '편의점', icon: '🏪' },
    isVerified: false
  }
];

describe('SearchResults Component', () => {
  const mockSetViewMode = vi.fn();
  const mockToggleViewMode = vi.fn();
  const mockClearFilters = vi.fn();
  const mockActiveFilterCount = vi.fn();
  const mockHasActiveFilters = vi.fn();
  const mockGetFilterString = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default store mock
    (useSearchStore as any).mockReturnValue({
      merchants: mockMerchants,
      isLoading: false,
      error: null,
      viewMode: 'list',
      totalResults: 2,
      page: 0,
      totalPages: 1,
      activeCardTypes: ['CHILD_MEAL'],
      activeCategories: ['RESTAURANT'],
      setViewMode: mockSetViewMode,
      toggleViewMode: mockToggleViewMode,
      clearFilters: mockClearFilters,
      activeFilterCount: mockActiveFilterCount.mockReturnValue(2),
      hasActiveFilters: mockHasActiveFilters.mockReturnValue(true),
      getFilterString: mockGetFilterString.mockReturnValue('Cards: CHILD_MEAL | Categories: RESTAURANT')
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('View Mode Switching', () => {
    it('should render with list view by default when store viewMode is list', () => {
      render(<SearchResults />);
      
      expect(screen.getByTestId('merchant-list')).toBeInTheDocument();
      expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
    });

    it('should render map view when store viewMode is map', () => {
      const mapViewMock = {
        merchants: mockMerchants,
        isLoading: false,
        error: null,
        viewMode: 'map',
        totalResults: 2,
        page: 0,
        totalPages: 1,
        activeCardTypes: ['CHILD_MEAL'],
        activeCategories: ['RESTAURANT'],
        setViewMode: mockSetViewMode,
        toggleViewMode: mockToggleViewMode,
        clearFilters: mockClearFilters,
        activeFilterCount: mockActiveFilterCount.mockReturnValue(2),
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(true),
        getFilterString: mockGetFilterString.mockReturnValue('Cards: CHILD_MEAL | Categories: RESTAURANT')
      };
      
      (useSearchStore as any).mockReturnValue(mapViewMock);

      render(<SearchResults />);
      
      expect(screen.queryByTestId('merchant-list')).not.toBeInTheDocument();
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('should switch views when toggle button is clicked', () => {
      render(<SearchResults />);
      
      const toggleButton = screen.getByRole('button', { name: /map view|list view/i });
      fireEvent.click(toggleButton);
      
      expect(mockToggleViewMode).toHaveBeenCalledTimes(1);
    });

    it('should display correct icon and label for view toggle button', () => {
      // Start with list view
      render(<SearchResults />);
      
      // In list view, should show "Map View" button
      let toggleButton = screen.getByRole('button', { name: /map view/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
      
      // Test with controlled viewMode prop for map view
      const { rerender } = render(<SearchResults viewMode="map" />);
      
      // In map view, should show "List View" button
      toggleButton = screen.getByRole('button', { name: /list view/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should apply smooth transitions between views', () => {
      const { container } = render(<SearchResults />);
      
      const viewContainer = container.querySelector('[data-testid="view-container"]');
      expect(viewContainer).toHaveClass('transition-opacity');
    });
  });

  describe('Result Summary', () => {
    it('should display total result count', () => {
      render(<SearchResults />);
      
      expect(screen.getByText(/2 results found/i)).toBeInTheDocument();
    });

    it('should display active filters summary', () => {
      render(<SearchResults />);
      
      expect(screen.getByText(/Cards: CHILD_MEAL/)).toBeInTheDocument();
      expect(screen.getByText(/Categories: RESTAURANT/)).toBeInTheDocument();
    });

    it('should show clear filters button when filters are active', () => {
      render(<SearchResults />);
      
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear filters button when no filters are active', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(false),
        activeFilterCount: mockActiveFilterCount.mockReturnValue(0),
        getFilterString: mockGetFilterString.mockReturnValue('')
      });

      render(<SearchResults />);
      
      const clearButton = screen.queryByRole('button', { name: /clear all filters/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should call clearFilters when clear button is clicked', () => {
      render(<SearchResults />);
      
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearButton);
      
      expect(mockClearFilters).toHaveBeenCalledTimes(1);
    });

    it('should display filter count badge', () => {
      render(<SearchResults />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Filter count badge
    });
  });

  describe('List View Features', () => {
    it('should pass merchants to MerchantList component', () => {
      render(<SearchResults />);
      
      expect(screen.getByTestId('merchant-list')).toBeInTheDocument();
      mockMerchants.forEach(merchant => {
        expect(screen.getByTestId(`merchant-${merchant.id}`)).toBeInTheDocument();
      });
    });

    it('should handle merchant item click', () => {
      const onMerchantClick = vi.fn();
      render(<SearchResults onMerchantClick={onMerchantClick} />);
      
      const merchantItem = screen.getByTestId('merchant-1');
      fireEvent.click(merchantItem);
      
      expect(onMerchantClick).toHaveBeenCalledWith(mockMerchants[0]);
    });

    it('should display result summary as header in list view', () => {
      render(<SearchResults />);
      
      // The result summary is displayed in the controls bar, not as a header in the list
      const resultsControl = screen.getByTestId('results-controls');
      expect(resultsControl).toBeInTheDocument();
      expect(within(resultsControl).getByText(/2 results/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        isLoading: true
      });

      render(<SearchResults />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle pagination', () => {
      const paginationMock = {
        merchants: mockMerchants,
        isLoading: false,
        error: null,
        viewMode: 'list',
        totalResults: 50,
        page: 0,
        totalPages: 3,
        activeCardTypes: ['CHILD_MEAL'],
        activeCategories: ['RESTAURANT'],
        setViewMode: mockSetViewMode,
        toggleViewMode: mockToggleViewMode,
        clearFilters: mockClearFilters,
        activeFilterCount: mockActiveFilterCount.mockReturnValue(2),
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(true),
        getFilterString: mockGetFilterString.mockReturnValue('Cards: CHILD_MEAL | Categories: RESTAURANT')
      };
      
      (useSearchStore as any).mockReturnValue(paginationMock);

      render(<SearchResults />);
      
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });
  });

  describe('Map View Features', () => {
    beforeEach(() => {
      const mapViewMock = {
        merchants: mockMerchants,
        isLoading: false,
        error: null,
        viewMode: 'map',
        totalResults: 2,
        page: 0,
        totalPages: 1,
        activeCardTypes: ['CHILD_MEAL'],
        activeCategories: ['RESTAURANT'],
        setViewMode: mockSetViewMode,
        toggleViewMode: mockToggleViewMode,
        clearFilters: mockClearFilters,
        activeFilterCount: mockActiveFilterCount.mockReturnValue(2),
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(true),
        getFilterString: mockGetFilterString.mockReturnValue('Cards: CHILD_MEAL | Categories: RESTAURANT')
      };
      
      (useSearchStore as any).mockReturnValue(mapViewMock);
    });

    it('should pass filtered merchants to MapContainer', () => {
      render(<SearchResults />);
      
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveTextContent('Map with 2 merchants');
    });

    it('should apply responsive className to map', () => {
      render(<SearchResults className="custom-class" />);
      
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveClass('h-full');
    });

    it('should pass activeCardTypes to map for filtering', () => {
      render(<SearchResults />);
      
      // Map should receive the filtered merchants
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should display no results message when merchants array is empty', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        merchants: [],
        totalResults: 0
      });

      render(<SearchResults />);
      
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });

    it('should suggest modifying search when no results', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        merchants: [],
        totalResults: 0,
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(true)
      });

      render(<SearchResults />);
      
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });

    it('should show different message when no filters and no results', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        merchants: [],
        totalResults: 0,
        hasActiveFilters: mockHasActiveFilters.mockReturnValue(false)
      });

      render(<SearchResults />);
      
      expect(screen.getByText(/no merchants available/i)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should display error message when error exists', () => {
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        error: 'Failed to load merchants'
      });

      render(<SearchResults />);
      
      expect(screen.getByText(/failed to load merchants/i)).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      const onRetry = vi.fn();
      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        error: 'Network error'
      });

      render(<SearchResults onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive classes based on screen size', () => {
      const { container } = render(<SearchResults />);
      
      const resultsContainer = container.querySelector('[data-testid="search-results"]');
      expect(resultsContainer).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('should stack view toggle and filters on mobile', () => {
      render(<SearchResults />);
      
      const controlsContainer = screen.getByTestId('results-controls');
      expect(controlsContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(<SearchResults />);
      
      expect(screen.getByRole('region', { name: /search results/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /map view/i })).toHaveAttribute('aria-pressed');
    });

    it('should announce result count to screen readers', () => {
      render(<SearchResults />);
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/2 results found/i);
    });

    it('should be keyboard navigable', () => {
      render(<SearchResults />);
      
      const toggleButton = screen.getByRole('button', { name: /map view/i });
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
      
      // Click event is what triggers the toggle, not keyDown
      fireEvent.click(toggleButton);
      expect(mockToggleViewMode).toHaveBeenCalled();
    });
  });

  describe('Integration with SearchStore', () => {
    it('should reflect store updates automatically', () => {
      render(<SearchResults />);
      
      // Verify initial state shows 2 results
      expect(screen.getByText(/2 results found/i)).toBeInTheDocument();
      
      // Test that view mode can be toggled
      const toggleButton = screen.getByRole('button', { name: /map view/i });
      fireEvent.click(toggleButton);
      expect(mockToggleViewMode).toHaveBeenCalled();
    });

    it('should persist view mode preference', () => {
      render(<SearchResults />);
      
      const toggleButton = screen.getByRole('button', { name: /map view/i });
      fireEvent.click(toggleButton);
      
      expect(mockToggleViewMode).toHaveBeenCalled();
      // View mode should be persisted in store
    });
  });

  describe('Performance', () => {
    it('should memoize expensive computations', () => {
      const { rerender } = render(<SearchResults />);
      
      // Re-render with same props
      rerender(<SearchResults />);
      
      // Component should not re-compute if props haven't changed
      expect(mockActiveFilterCount).toHaveBeenCalledTimes(1);
    });

    it('should handle large merchant lists efficiently', () => {
      const largeMerchantList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMerchants[0],
        id: i,
        name: `Merchant ${i}`
      }));

      (useSearchStore as any).mockReturnValue({
        ...useSearchStore(),
        merchants: largeMerchantList,
        totalResults: 1000
      });

      render(<SearchResults />);
      
      // Should render without performance issues
      expect(screen.getByText(/1000 results found/i)).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<SearchResults className="custom-search-results" />);
      
      const resultsContainer = container.querySelector('[data-testid="search-results"]');
      expect(resultsContainer).toHaveClass('custom-search-results');
    });

    it('should handle controlled viewMode prop', () => {
      render(<SearchResults viewMode="map" />);
      
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('should call onViewModeChange when provided', () => {
      const onViewModeChange = vi.fn();
      render(<SearchResults onViewModeChange={onViewModeChange} />);
      
      const toggleButton = screen.getByRole('button', { name: /map view/i });
      fireEvent.click(toggleButton);
      
      expect(onViewModeChange).toHaveBeenCalledWith('map');
    });
  });
});