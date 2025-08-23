import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import { useSearchStore } from '@/stores/searchStore';
import { useDebounce } from '@/hooks/useDebounce';

// Mock the search store
vi.mock('@/stores/searchStore', () => ({
  useSearchStore: vi.fn()
}));

// Mock the debounce hook
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value: string) => value)
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SearchBar', () => {
  const mockSetQuery = vi.fn();
  const mockClearQuery = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();
  const mockSetMerchants = vi.fn();
  const mockSetSuggestions = vi.fn();
  const mockOnSearch = vi.fn();

  const defaultStoreState = {
    query: '',
    isLoading: false,
    error: null,
    setQuery: mockSetQuery,
    clearQuery: mockClearQuery,
    setLoading: mockSetLoading,
    setError: mockSetError,
    setMerchants: mockSetMerchants,
    setSuggestions: mockSetSuggestions
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useSearchStore as any).mockReturnValue(defaultStoreState);
    (useDebounce as any).mockImplementation((value: string) => value);
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0
      })
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input with default placeholder', () => {
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', '가맹점 검색...');
    });

    it('should render search input with custom placeholder', () => {
      render(<SearchBar placeholder="Search merchants..." />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('placeholder', 'Search merchants...');
    });

    it('should render search icon', () => {
      render(<SearchBar />);
      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should not render clear button when input is empty', () => {
      render(<SearchBar />);
      const clearButton = screen.queryByTestId('clear-button');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should render clear button when input has value', async () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        query: 'test query'
      });
      
      render(<SearchBar />);
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeInTheDocument();
    });

    it('should render loading spinner when searching', () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });
      
      render(<SearchBar />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<SearchBar className="custom-class" />);
      const container = screen.getByTestId('search-bar-container');
      expect(container).toHaveClass('custom-class');
    });

    it('should autofocus when autoFocus prop is true', () => {
      render(<SearchBar autoFocus />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Debouncing', () => {
    it('should use debounce hook with 300ms delay', async () => {
      const user = userEvent.setup({ delay: null });
      const mockDebouncedValue = 'debounced value';
      (useDebounce as any).mockReturnValue(mockDebouncedValue);
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      
      expect(useDebounce).toHaveBeenCalledWith('test', 300);
    });

    it('should trigger search after debounce delay', async () => {
      const user = userEvent.setup({ delay: null });
      (useDebounce as any).mockReturnValue('test query');
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test query');
      
      // Value should be set immediately in store
      expect(mockSetQuery).toHaveBeenCalledWith('test query');
      
      // Wait for effect to run
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(true);
      });
    });

    it('should cancel previous search when typing continues', async () => {
      const user = userEvent.setup({ delay: null });
      
      // Mock debounce to return different values
      let callCount = 0;
      (useDebounce as any).mockImplementation((value: string) => {
        callCount++;
        // Only return debounced value after multiple calls
        return callCount > 2 ? value : '';
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      await user.type(input, ' query');
      
      // Should trigger search after the final debounce
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('User Interactions', () => {
    it('should update query in store when typing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test query');
      
      expect(mockSetQuery).toHaveBeenCalledWith('test query');
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        query: 'test query'
      });
      
      render(<SearchBar />);
      const clearButton = screen.getByTestId('clear-button');
      
      await user.click(clearButton);
      
      expect(mockClearQuery).toHaveBeenCalled();
    });

    it('should clear input when Escape key is pressed', async () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        query: 'test query'
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      expect(mockClearQuery).toHaveBeenCalled();
    });

    it('should trigger immediate search when Enter key is pressed', async () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        query: 'test query'
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(true);
      });
    });

    it('should call onSearch callback if provided', async () => {
      const user = userEvent.setup({ delay: null });
      (useDebounce as any).mockReturnValue('test');
      
      render(<SearchBar onSearch={mockOnSearch} />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      });
    });
  });

  describe('API Integration', () => {
    it('should make API call after debounce', async () => {
      const user = userEvent.setup({ delay: null });
      (useDebounce as any).mockReturnValue('test');

      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/merchants/search?query=test'),
          expect.any(Object)
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup({ delay: null });
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      (useDebounce as any).mockReturnValue('test');
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      
      await waitFor(() => {
        expect(mockSetError).toHaveBeenCalledWith('Network error');
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });

    it('should not make API call for empty query', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      await user.clear(input);
      
      // Debounce returns empty string for empty input
      (useDebounce as any).mockReturnValue('');
      
      // Force re-render with empty debounced value
      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    it('should update merchants in store on successful search', async () => {
      const user = userEvent.setup({ delay: null });
      const mockMerchants = [
        { id: 1, name: 'Test Merchant 1' },
        { id: 2, name: 'Test Merchant 2' }
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: mockMerchants,
          totalElements: 2,
          totalPages: 1,
          currentPage: 0
        })
      });
      
      (useDebounce as any).mockReturnValue('test');
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'test');
      
      await waitFor(() => {
        expect(mockSetMerchants).toHaveBeenCalledWith(mockMerchants);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      expect(input).toHaveAttribute('aria-label', 'Search merchants');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should have loading state announced', () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        isLoading: true
      });
      
      render(<SearchBar />);
      const loadingText = screen.getByText('검색 중...');
      expect(loadingText).toHaveAttribute('aria-live', 'polite');
    });

    it('should have error state announced', () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        error: 'Search failed'
      });
      
      render(<SearchBar />);
      const errorText = screen.getByText('Search failed');
      expect(errorText).toHaveAttribute('role', 'alert');
    });

    it('should have clear button with accessible label', () => {
      (useSearchStore as any).mockReturnValue({
        ...defaultStoreState,
        query: 'test'
      });
      
      render(<SearchBar />);
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });

  describe('Responsive Design', () => {
    it('should have full width on mobile', () => {
      render(<SearchBar />);
      const container = screen.getByTestId('search-bar-container');
      expect(container).toHaveClass('w-full');
    });

    it('should have proper spacing and sizing', () => {
      render(<SearchBar />);
      const inputContainer = screen.getByTestId('search-input-container');
      expect(inputContainer).toHaveClass('relative');
      
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('pl-10'); // Space for search icon
      expect(input).toHaveClass('pr-10'); // Space for clear button
    });
  });

  describe('Autocomplete Integration', () => {
    it('should fetch suggestions when typing', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/suggestions/search?query=강남'),
          expect.any(Object)
        );
      });
    });

    it('should show autocomplete dropdown with suggestions', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        const dropdown = screen.getByTestId('autocomplete-dropdown');
        expect(dropdown).toBeInTheDocument();
      });
      
      // Check suggestions are displayed
      expect(screen.getByText('강남역')).toBeInTheDocument();
      expect(screen.getByText('강남구청')).toBeInTheDocument();
      expect(screen.getByText('강남대로')).toBeInTheDocument();
    });

    it('should handle keyboard navigation in dropdown', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
      });
      
      // Navigate down
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      let options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      
      // Navigate down again
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      
      // Navigate up
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('should select suggestion on Enter key', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
      });
      
      // Navigate to first suggestion and select
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      // Query should be updated to selected suggestion
      expect(mockSetQuery).toHaveBeenCalledWith('강남역');
      
      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      // Dropdown should close but query should remain
      await waitFor(() => {
        expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should handle suggestion click', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['강남역', '강남구청', '강남대로'],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '강남');
      
      await waitFor(() => {
        expect(screen.getByTestId('autocomplete-dropdown')).toBeInTheDocument();
      });
      
      // Click on suggestion
      const suggestion = screen.getByText('강남구청');
      await user.click(suggestion);
      
      // Query should be updated
      expect(mockSetQuery).toHaveBeenCalledWith('강남구청');
      
      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should show corrected query suggestion', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: ['스타벅스 강남점', '스타벅스 역삼점'],
          correctedQuery: '스타벅스'
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '스타법스');
      
      await waitFor(() => {
        const dropdown = screen.getByTestId('autocomplete-dropdown');
        expect(dropdown).toBeInTheDocument();
        // Should show corrected query
        expect(screen.getByText(/스타벅스/)).toBeInTheDocument();
      });
    });

    it('should not show dropdown when no suggestions', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suggestions: [],
          correctedQuery: undefined
        })
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'zzzzzz');
      
      // Wait a bit to ensure no dropdown appears
      await waitFor(() => {
        expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
      });
    });

    it('should debounce suggestion fetching', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      // Type quickly
      await user.type(input, 'ㄱ');
      await user.type(input, 'ㅏ');
      await user.type(input, 'ㅇ');
      
      // Should not make multiple calls immediately
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Mock debounce returning final value
      (useDebounce as any).mockReturnValue('강');
      
      // Force re-render
      await waitFor(() => {
        // Should make single call after debounce
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid input changes', async () => {
      const user = userEvent.setup({ delay: null });
      
      // Mock debounce to only return value after all typing
      let callCount = 0;
      (useDebounce as any).mockImplementation((value: string) => {
        callCount++;
        return callCount > 2 ? value : '';
      });
      
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      // Rapid typing
      await user.type(input, 'abc');
      
      // Should update query for each character
      expect(mockSetQuery).toHaveBeenCalledTimes(3);
      
      // Should trigger search only once after debounce returns value
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle special characters in search query', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SearchBar />);
      const input = screen.getByRole('searchbox');
      
      await user.type(input, '김밥천국 & GS25');
      
      expect(mockSetQuery).toHaveBeenCalledWith('김밥천국 & GS25');
    });

    it('should prevent default form submission', async () => {
      const mockSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={mockSubmit}>
          <SearchBar />
        </form>
      );
      
      const input = screen.getByRole('searchbox');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      // Form submission should be prevented by the component
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });
});