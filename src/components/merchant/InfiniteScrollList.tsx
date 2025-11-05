import React, { ReactNode } from 'react';
import { useInfiniteScroll } from '@/hooks/useLazyLoad';
import { cn } from '@/lib/utils';

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  emptyMessage?: string;
  endMessage?: string;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Generic infinite scroll list component
 * Automatically loads more items when the user scrolls near the bottom
 */
export function InfiniteScrollList<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading = false,
  error = null,
  onRetry,
  className,
  loadingComponent,
  emptyComponent,
  emptyMessage = 'No items to display',
  endMessage = 'No more items',
  rootMargin = '100px',
  threshold = 0.1,
}: InfiniteScrollListProps<T>) {
  const { ref } = useInfiniteScroll(loadMore, {
    rootMargin,
    threshold,
  });

  // Empty state
  if (items.length === 0 && !isLoading && !error) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      data-testid="infinite-scroll-container"
      className={cn('relative', className)}
    >
      {/* Items list */}
      <div className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <div key={index} className="animate-fadeIn">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="w-12 h-12 text-red-500 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div data-testid="loading-indicator" className="py-8">
          {loadingComponent || (
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !isLoading && !error && (
        <div
          ref={ref as any}
          data-testid="infinite-scroll-trigger"
          className="h-20 flex items-center justify-center"
        >
          <div className="text-sm text-gray-500 animate-pulse">
            Loading more...
          </div>
        </div>
      )}

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center text-gray-500">
          {endMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Specialized infinite scroll for merchant list
 */
interface MerchantInfiniteScrollProps<T> extends Omit<InfiniteScrollListProps<T>, 'renderItem'> {
  renderMerchant: (merchant: T, index: number) => ReactNode;
}

export function MerchantInfiniteScroll<T>({
  items,
  renderMerchant,
  ...props
}: MerchantInfiniteScrollProps<T>) {
  return (
    <InfiniteScrollList
      items={items}
      renderItem={renderMerchant}
      emptyMessage="No merchants found in this area"
      endMessage="All merchants loaded"
      {...props}
    />
  );
}