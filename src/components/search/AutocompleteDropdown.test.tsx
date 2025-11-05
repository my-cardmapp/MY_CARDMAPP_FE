import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutocompleteDropdown } from './AutocompleteDropdown';

describe('AutocompleteDropdown', () => {
  const defaultProps = {
    suggestions: [],
    isOpen: false,
    selectedIndex: -1,
    onSelect: vi.fn(),
    onClose: vi.fn(),
    query: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<AutocompleteDropdown {...defaultProps} />);
      const dropdown = screen.queryByRole('listbox');
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<AutocompleteDropdown {...defaultProps} isOpen={true} />);
      const dropdown = screen.getByTestId('autocomplete-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    it('should render suggestions', () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
        />
      );
      
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          loading={true} 
        />
      );
      
      expect(screen.getByTestId('autocomplete-loading')).toBeInTheDocument();
      expect(screen.getByText('검색 중...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      const errorMessage = '검색 중 오류가 발생했습니다';
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          error={errorMessage} 
        />
      );
      
      expect(screen.getByTestId('autocomplete-error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show no results message when suggestions is empty', () => {
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={[]} 
          query="존재하지않는검색어"
        />
      );
      
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight matching text in suggestions', () => {
      const query = '강남';
      const suggestions = ['강남역', '강남구청', '서울 강남대로'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          query={query}
        />
      );
      
      // Check for highlighted elements
      const highlightedElements = screen.getAllByTestId('highlight-match');
      expect(highlightedElements).toHaveLength(3);
      highlightedElements.forEach(element => {
        expect(element).toHaveTextContent(query);
        expect(element).toHaveClass('font-semibold');
      });
    });

    it('should handle case-insensitive highlighting', () => {
      const query = 'GS';
      const suggestions = ['GS25 강남점', 'gs25 역삼점'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          query={query}
        />
      );
      
      const highlightedElements = screen.getAllByTestId('highlight-match');
      expect(highlightedElements).toHaveLength(2);
    });

    it('should not highlight when query is empty', () => {
      const suggestions = ['강남역', '강남구청'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          query=""
        />
      );
      
      const highlightedElements = screen.queryAllByTestId('highlight-match');
      expect(highlightedElements).toHaveLength(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should highlight selected item based on selectedIndex', () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={1}
        />
      );
      
      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveClass('bg-gray-100');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('should handle Enter key to select suggestion', () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      const onSelect = vi.fn();
      
      const { container } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={1}
          onSelect={onSelect}
        />
      );
      
      // Simulate Enter key press
      fireEvent.keyDown(container.firstChild!, { key: 'Enter' });
      
      expect(onSelect).toHaveBeenCalledWith('강남구청');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should handle Escape key to close dropdown', () => {
      const suggestions = ['강남역', '강남구청'];
      const onClose = vi.fn();
      
      const { container } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          onClose={onClose}
        />
      );
      
      // Simulate Escape key press
      fireEvent.keyDown(container.firstChild!, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not select when Enter is pressed with no selection', () => {
      const suggestions = ['강남역', '강남구청'];
      const onSelect = vi.fn();
      
      const { container } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={-1}
          onSelect={onSelect}
        />
      );
      
      fireEvent.keyDown(container.firstChild!, { key: 'Enter' });
      
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('should select suggestion on click', async () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      const onSelect = vi.fn();
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          onSelect={onSelect}
        />
      );
      
      const option = screen.getByText('강남구청');
      await userEvent.click(option);
      
      expect(onSelect).toHaveBeenCalledWith('강남구청');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should highlight on mouse hover', async () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={0}
        />
      );
      
      const option = screen.getByText('강남구청');
      await userEvent.hover(option);
      
      // Visual feedback on hover
      expect(option.parentElement).toHaveClass('bg-gray-50');
    });

    it('should handle click outside to close', async () => {
      const onClose = vi.fn();
      
      render(
        <>
          <div data-testid="outside">Outside Element</div>
          <AutocompleteDropdown 
            {...defaultProps} 
            isOpen={true} 
            suggestions={['강남역']} 
            onClose={onClose}
          />
        </>
      );
      
      const outsideElement = screen.getByTestId('outside');
      await userEvent.click(outsideElement);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const suggestions = ['강남역', '강남구청'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={0}
        />
      );
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Search suggestions');
      
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('should have unique IDs for each option', () => {
      const suggestions = ['강남역', '강남구청', '강남대로'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
        />
      );
      
      const options = screen.getAllByRole('option');
      const ids = options.map(option => option.getAttribute('id'));
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(suggestions.length);
      ids.forEach(id => {
        expect(id).toMatch(/^autocomplete-option-\d+$/);
      });
    });

    it('should support screen reader announcements', () => {
      const suggestions = ['강남역', '강남구청'];
      
      const { rerender } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={-1}
        />
      );
      
      // When selection changes
      rerender(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          selectedIndex={0}
        />
      );
      
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveTextContent('강남역 선택됨');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestions gracefully', () => {
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={[]} 
        />
      );
      
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });

    it('should handle very long suggestion text', () => {
      const longText = '매우 긴 가맹점 이름입니다 '.repeat(10);
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={[longText]} 
        />
      );
      
      const option = screen.getByRole('option');
      expect(option).toHaveClass('truncate');
    });

    it('should handle special characters in query', () => {
      const query = '(강남)';
      const suggestions = ['(강남)역', '서울(강남)'];
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
          query={query}
        />
      );
      
      // Should not throw error with special regex characters
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveTextContent('(강남)역');
      expect(options[1]).toHaveTextContent('서울(강남)');
    });

    it('should prevent XSS attacks in suggestions', () => {
      const maliciousSuggestion = '<script>alert("XSS")</script>';
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={[maliciousSuggestion]} 
        />
      );
      
      // Text should be escaped, not executed
      const option = screen.getByRole('option');
      expect(option.innerHTML).not.toContain('<script>');
      expect(option.textContent).toBe(maliciousSuggestion);
    });
  });

  describe('Performance', () => {
    it('should handle large number of suggestions', () => {
      const suggestions = Array.from({ length: 100 }, (_, i) => `Suggestion ${i}`);
      
      render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={suggestions} 
        />
      );
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(100);
    });

    it('should update efficiently when suggestions change', () => {
      const { rerender } = render(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={['강남역']} 
        />
      );
      
      expect(screen.getByText('강남역')).toBeInTheDocument();
      
      rerender(
        <AutocompleteDropdown 
          {...defaultProps} 
          isOpen={true} 
          suggestions={['강남구청', '강남대로']} 
        />
      );
      
      expect(screen.queryByText('강남역')).not.toBeInTheDocument();
      expect(screen.getByText('강남구청')).toBeInTheDocument();
      expect(screen.getByText('강남대로')).toBeInTheDocument();
    });
  });
});