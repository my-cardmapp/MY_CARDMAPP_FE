import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  SkeletonCard,
  SkeletonList,
  LoadingSpinner,
  LoadingOverlay
} from './LoadingStates';

describe('LoadingStates', () => {
  describe('SkeletonCard', () => {
    it('should render skeleton card with animation classes', () => {
      render(<SkeletonCard />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should have proper structure for merchant card', () => {
      render(<SkeletonCard />);
      
      // Should have image placeholder
      const imagePlaceholder = screen.getByTestId('skeleton-image');
      expect(imagePlaceholder).toBeInTheDocument();
      
      // Should have title placeholder
      const titlePlaceholder = screen.getByTestId('skeleton-title');
      expect(titlePlaceholder).toBeInTheDocument();
      
      // Should have description placeholders
      const descriptionLines = screen.getAllByTestId(/skeleton-description-/);
      expect(descriptionLines.length).toBeGreaterThan(0);
      
      // Should have footer placeholder
      const footerPlaceholder = screen.getByTestId('skeleton-footer');
      expect(footerPlaceholder).toBeInTheDocument();
    });

    it('should apply custom className if provided', () => {
      render(<SkeletonCard className="custom-class" />);
      const skeleton = screen.getByTestId('skeleton-card');
      expect(skeleton).toHaveClass('custom-class');
    });
  });

  describe('SkeletonList', () => {
    it('should render default number of skeleton cards', () => {
      render(<SkeletonList />);
      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(3); // default count
    });

    it('should render specified number of skeleton cards', () => {
      render(<SkeletonList count={5} />);
      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(5);
    });

    it('should apply custom className to container', () => {
      render(<SkeletonList className="custom-list-class" />);
      const container = screen.getByTestId('skeleton-list');
      expect(container).toHaveClass('custom-list-class');
    });

    it('should handle count of 0', () => {
      render(<SkeletonList count={0} />);
      const container = screen.getByTestId('skeleton-list');
      expect(container).toBeInTheDocument();
      const skeletons = screen.queryAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('LoadingSpinner', () => {
    it('should render spinner with default size', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('h-8', 'w-8'); // default medium size
    });

    it('should render spinner with small size', () => {
      render(<LoadingSpinner size="small" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should render spinner with large size', () => {
      render(<LoadingSpinner size="large" />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });

    it('should render message when provided', () => {
      render(<LoadingSpinner message="Loading merchants..." />);
      expect(screen.getByText('Loading merchants...')).toBeInTheDocument();
    });

    it('should not render message container when message is not provided', () => {
      render(<LoadingSpinner />);
      const message = screen.queryByTestId('loading-message');
      expect(message).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);
      const container = screen.getByTestId('loading-spinner-container');
      expect(container).toHaveClass('custom-spinner');
    });

    it('should have spinning animation', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('LoadingOverlay', () => {
    it('should render fullscreen overlay', () => {
      render(<LoadingOverlay />);
      const overlay = screen.getByTestId('loading-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('fixed', 'inset-0');
    });

    it('should have backdrop blur effect', () => {
      render(<LoadingOverlay />);
      const backdrop = screen.getByTestId('loading-backdrop');
      expect(backdrop).toHaveClass('backdrop-blur-sm');
    });

    it('should render spinner in overlay', () => {
      render(<LoadingOverlay />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should render message when provided', () => {
      render(<LoadingOverlay message="Updating filters..." />);
      expect(screen.getByText('Updating filters...')).toBeInTheDocument();
    });

    it('should have high z-index for overlay', () => {
      render(<LoadingOverlay />);
      const overlay = screen.getByTestId('loading-overlay');
      expect(overlay).toHaveClass('z-50');
    });

    it('should center content in overlay', () => {
      render(<LoadingOverlay />);
      const content = screen.getByTestId('loading-overlay-content');
      expect(content).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should be accessible with role and aria-label', () => {
      render(<LoadingOverlay message="Loading..." />);
      const overlay = screen.getByTestId('loading-overlay');
      expect(overlay).toHaveAttribute('role', 'status');
      expect(overlay).toHaveAttribute('aria-label', 'Loading...');
    });
  });
});