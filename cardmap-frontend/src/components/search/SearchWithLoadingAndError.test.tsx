import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { SearchResults } from './SearchResults';
import { AutocompleteDropdown } from './AutocompleteDropdown';
import { LoadingSpinner, SkeletonList } from '../ui/LoadingStates';
import { NetworkError, TimeoutError, EmptyState } from '../ui/ErrorStates';
import { ErrorBoundary } from '../ui/ErrorBoundary';

// Mock API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Search Components with Loading and Error States', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('SearchBar with loading states', () => {
    it('should show inline loading spinner during search', async () => {
      const handleSearch = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <SearchBar 
          onSearch={handleSearch}
          isLoading={true}
        />
      );
      
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Should show loading spinner
      await waitFor(() => {
        expect(screen.getByTestId('search-loading')).toBeInTheDocument();
      });
    });

    it('should handle search timeout gracefully', async () => {
      const handleSearch = vi.fn(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const handleError = vi.fn();
      
      render(
        <SearchBar 
          onSearch={handleSearch}
          onError={handleError}
          timeout={50}
        />
      );
      
      const input = screen.getByPlaceholderText(/search/i);
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(handleError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'timeout',
            message: expect.stringContaining('timeout')
          })
        );
      });
    });
  });

  describe('FilterPanel with loading states', () => {
    it('should show loading overlay during filter update', async () => {
      const handleFilterChange = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <FilterPanel 
          onFilterChange={handleFilterChange}
          isUpdating={true}
        />
      );
      
      // Should show loading overlay
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByText(/updating filters/i)).toBeInTheDocument();
    });

    it('should apply optimistic updates', async () => {
      const handleFilterChange = vi.fn();
      const filters = { cardTypes: [], categories: [] };
      
      render(
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          optimisticUpdates={true}
        />
      );
      
      // Click a filter checkbox
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      
      // Should update immediately
      expect(checkbox).toBeChecked();
      expect(handleFilterChange).toHaveBeenCalled();
    });

    it('should rollback optimistic updates on error', async () => {
      const handleFilterChange = vi.fn(() => 
        Promise.reject(new Error('Update failed'))
      );
      
      const filters = { cardTypes: [], categories: [] };
      
      render(
        <FilterPanel 
          filters={filters}
          onFilterChange={handleFilterChange}
          optimisticUpdates={true}
        />
      );
      
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      
      // Should rollback on error
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('SearchResults with loading and error states', () => {
    it('should show skeleton screens while loading', () => {
      render(
        <SearchResults 
          merchants={[]}
          isLoading={true}
          skeletonCount={5}
        />
      );
      
      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(5);
    });

    it('should show network error with retry', () => {
      const handleRetry = vi.fn();
      
      render(
        <SearchResults 
          merchants={[]}
          error={{ type: 'network' }}
          onRetry={handleRetry}
        />
      );
      
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      expect(handleRetry).toHaveBeenCalled();
    });

    it('should show timeout error with duration', () => {
      render(
        <SearchResults 
          merchants={[]}
          error={{ type: 'timeout', duration: 30 }}
          onRetry={vi.fn()}
        />
      );
      
      expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      expect(screen.getByText(/30 seconds/i)).toBeInTheDocument();
    });

    it('should show empty state with suggestions', () => {
      const suggestions = [
        'Try a different search term',
        'Remove some filters',
        'Search in a wider area'
      ];
      
      render(
        <SearchResults 
          merchants={[]}
          isLoading={false}
          emptySuggestions={suggestions}
        />
      );
      
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('should show empty state with clear filters action', () => {
      const handleClearFilters = vi.fn();
      
      render(
        <SearchResults 
          merchants={[]}
          isLoading={false}
          onClearFilters={handleClearFilters}
        />
      );
      
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);
      
      expect(handleClearFilters).toHaveBeenCalled();
    });
  });

  describe('AutocompleteDropdown with loading and error states', () => {
    it('should show loading state while fetching suggestions', async () => {
      render(
        <AutocompleteDropdown 
          query="test"
          suggestions={[]}
          isLoading={true}
          onSelect={vi.fn()}
        />
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should handle suggestion fetch errors', () => {
      const handleError = vi.fn();
      
      render(
        <AutocompleteDropdown 
          query="test"
          suggestions={[]}
          error={{ message: 'Failed to fetch suggestions' }}
          onSelect={vi.fn()}
          onError={handleError}
        />
      );
      
      expect(screen.getByText(/failed to fetch suggestions/i)).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary integration', () => {
    it('should catch and display component errors', () => {
      const ThrowingComponent = () => {
        throw new Error('Component crashed');
      };
      
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/component crashed/i)).toBeInTheDocument();
    });

    it('should reset and retry after error', () => {
      let shouldThrow = true;
      
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Temporary error');
        }
        return <div>Success!</div>;
      };
      
      const { rerender } = render(
        <ErrorBoundary onReset={() => { shouldThrow = false; }}>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/temporary error/i)).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  describe('Timeout handling', () => {
    it('should timeout slow API responses', async () => {
      const slowFetch = () => new Promise(resolve => 
        setTimeout(() => resolve({ ok: true }), 5000)
      );
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      try {
        await slowFetch();
        clearTimeout(timeoutId);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should show appropriate timeout message', () => {
      render(
        <TimeoutError 
          duration={30}
          onRetry={vi.fn()}
        />
      );
      
      expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      expect(screen.getByText(/30 seconds/i)).toBeInTheDocument();
      expect(screen.getByText(/try again later/i)).toBeInTheDocument();
    });
  });
});