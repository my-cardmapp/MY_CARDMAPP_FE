import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ErrorMessage,
  NetworkError,
  EmptyState,
  TimeoutError
} from './ErrorStates';

describe('ErrorStates', () => {
  describe('ErrorMessage', () => {
    it('should render error message', () => {
      render(<ErrorMessage message="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render default error icon', () => {
      render(<ErrorMessage message="Error" />);
      const icon = screen.getByTestId('error-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      const handleRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={handleRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn();
      render(<ErrorMessage message="Error" onRetry={handleRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="Error" />);
      const retryButton = screen.queryByRole('button', { name: /retry/i });
      expect(retryButton).not.toBeInTheDocument();
    });

    it('should apply error styling', () => {
      render(<ErrorMessage message="Error" />);
      const container = screen.getByTestId('error-message-container');
      expect(container).toHaveClass('text-red-600');
    });

    it('should apply custom className', () => {
      render(<ErrorMessage message="Error" className="custom-error" />);
      const container = screen.getByTestId('error-message-container');
      expect(container).toHaveClass('custom-error');
    });
  });

  describe('NetworkError', () => {
    it('should render network error message', () => {
      render(<NetworkError onRetry={vi.fn()} />);
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('should render helpful description', () => {
      render(<NetworkError onRetry={vi.fn()} />);
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });

    it('should render retry button', () => {
      render(<NetworkError onRetry={vi.fn()} />);
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn();
      render(<NetworkError onRetry={handleRetry} />);
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should render network icon', () => {
      render(<NetworkError onRetry={vi.fn()} />);
      const icon = screen.getByTestId('network-error-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<NetworkError onRetry={vi.fn()} />);
      const container = screen.getByRole('alert');
      expect(container).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('should render empty state message', () => {
      render(<EmptyState />);
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });

    it('should render custom message when provided', () => {
      render(<EmptyState message="No merchants found" />);
      expect(screen.getByText('No merchants found')).toBeInTheDocument();
    });

    it('should render suggestions when provided', () => {
      const suggestions = ['Try a different search', 'Remove some filters'];
      render(<EmptyState suggestions={suggestions} />);
      
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('should render action button when provided', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState 
          action={{ label: 'Clear filters', onClick: handleAction }}
        />
      );
      const actionButton = screen.getByRole('button', { name: 'Clear filters' });
      expect(actionButton).toBeInTheDocument();
    });

    it('should call action onClick when button is clicked', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState 
          action={{ label: 'Clear filters', onClick: handleAction }}
        />
      );
      const actionButton = screen.getByRole('button', { name: 'Clear filters' });
      fireEvent.click(actionButton);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should render empty state icon', () => {
      render(<EmptyState />);
      const icon = screen.getByTestId('empty-state-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<EmptyState className="custom-empty" />);
      const container = screen.getByTestId('empty-state-container');
      expect(container).toHaveClass('custom-empty');
    });
  });

  describe('TimeoutError', () => {
    it('should render timeout error message', () => {
      render(<TimeoutError onRetry={vi.fn()} />);
      expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
    });

    it('should display timeout duration when provided', () => {
      render(<TimeoutError duration={30} onRetry={vi.fn()} />);
      expect(screen.getByText(/30 seconds/i)).toBeInTheDocument();
    });

    it('should render retry button', () => {
      render(<TimeoutError onRetry={vi.fn()} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const handleRetry = vi.fn();
      render(<TimeoutError onRetry={handleRetry} />);
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should render timeout icon', () => {
      render(<TimeoutError onRetry={vi.fn()} />);
      const icon = screen.getByTestId('timeout-error-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should suggest trying again later', () => {
      render(<TimeoutError onRetry={vi.fn()} />);
      expect(screen.getByText(/try again later/i)).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<TimeoutError onRetry={vi.fn()} />);
      const container = screen.getByRole('alert');
      expect(container).toBeInTheDocument();
    });
  });
});