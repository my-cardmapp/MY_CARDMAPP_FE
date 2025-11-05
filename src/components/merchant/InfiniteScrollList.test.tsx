import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InfiniteScrollList } from './InfiniteScrollList';

// Mock the useInfiniteScroll hook
vi.mock('@/hooks/useLazyLoad', () => ({
  useInfiniteScroll: vi.fn((callback) => ({
    ref: vi.fn(),
    isIntersecting: false,
    hasBeenVisible: false,
  })),
}));

describe('InfiniteScrollList Component', () => {
  const mockLoadMore = vi.fn();
  const mockRenderItem = vi.fn((item) => <div key={item.id}>{item.name}</div>);
  
  const defaultItems = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render items', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should call renderItem for each item', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
      />
    );

    expect(mockRenderItem).toHaveBeenCalledTimes(3);
    expect(mockRenderItem).toHaveBeenCalledWith(defaultItems[0], 0);
    expect(mockRenderItem).toHaveBeenCalledWith(defaultItems[1], 1);
    expect(mockRenderItem).toHaveBeenCalledWith(defaultItems[2], 2);
  });

  it('should show loading indicator when isLoading is true', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should show custom loading component', () => {
    const CustomLoader = () => <div>Custom Loading...</div>;
    
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        isLoading={true}
        loadingComponent={<CustomLoader />}
      />
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
  });

  it('should show end message when hasMore is false', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={false}
        endMessage="No more items"
      />
    );

    expect(screen.getByText('No more items')).toBeInTheDocument();
  });

  it('should not show trigger element when hasMore is false', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={false}
      />
    );

    expect(screen.queryByTestId('infinite-scroll-trigger')).not.toBeInTheDocument();
  });

  it('should show empty state when items array is empty', () => {
    render(
      <InfiniteScrollList
        items={[]}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={false}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should show custom empty component', () => {
    const EmptyComponent = () => <div>Custom empty state</div>;
    
    render(
      <InfiniteScrollList
        items={[]}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={false}
        emptyComponent={<EmptyComponent />}
      />
    );

    expect(screen.getByText('Custom empty state')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        className="custom-list-class"
      />
    );

    const container = screen.getByTestId('infinite-scroll-container');
    expect(container).toHaveClass('custom-list-class');
  });

  it('should handle error state', () => {
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        error="Failed to load items"
      />
    );

    expect(screen.getByText('Failed to load items')).toBeInTheDocument();
  });

  it('should show retry button on error', () => {
    const mockRetry = vi.fn();
    
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        error="Failed to load items"
        onRetry={mockRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    retryButton.click();
    expect(mockRetry).toHaveBeenCalled();
  });

  it('should handle rootMargin option', () => {
    const { useInfiniteScroll } = vi.mocked(await import('@/hooks/useLazyLoad'));
    
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        rootMargin="200px"
      />
    );

    expect(useInfiniteScroll).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ rootMargin: '200px' })
    );
  });

  it('should handle threshold option', () => {
    const { useInfiniteScroll } = vi.mocked(await import('@/hooks/useLazyLoad'));
    
    render(
      <InfiniteScrollList
        items={defaultItems}
        renderItem={mockRenderItem}
        loadMore={mockLoadMore}
        hasMore={true}
        threshold={0.5}
      />
    );

    expect(useInfiniteScroll).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5 })
    );
  });
});