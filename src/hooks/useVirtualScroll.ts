import { useVirtualizer, VirtualizerOptions } from '@tanstack/react-virtual';
import { useRef, useCallback, useEffect } from 'react';

interface UseVirtualScrollOptions<T> {
  items: T[];
  parentRef: React.RefObject<HTMLElement>;
  estimateSize?: (index: number) => number;
  overscan?: number;
  horizontal?: boolean;
  smoothScroll?: boolean;
  onScrollDirectionChange?: (direction: 'up' | 'down') => void;
}

interface UseVirtualScrollReturn {
  virtualItems: any[];
  totalSize: number;
  scrollToIndex: (index: number, options?: any) => void;
  scrollToOffset: (offset: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  measureElement: (element: HTMLElement | null) => void;
  visibleRange: {
    startIndex: number;
    endIndex: number;
  };
  scrollOffset: number;
}

/**
 * 가상 스크롤링을 위한 커스텀 훅
 * 대량의 데이터를 효율적으로 렌더링하기 위해 @tanstack/react-virtual을 래핑
 */
export function useVirtualScroll<T>({
  items,
  parentRef,
  estimateSize = () => 80,
  overscan = 5,
  horizontal = false,
  smoothScroll = false,
  onScrollDirectionChange
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn {
  const lastScrollOffset = useRef(0);

  // Virtualizer 초기화
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
    horizontal,
    onChange: (instance) => {
      // 스크롤 방향 감지
      if (onScrollDirectionChange) {
        const currentOffset = instance.scrollOffset || 0;
        if (currentOffset > lastScrollOffset.current) {
          onScrollDirectionChange('down');
        } else if (currentOffset < lastScrollOffset.current) {
          onScrollDirectionChange('up');
        }
        lastScrollOffset.current = currentOffset;
      }
    }
  } as VirtualizerOptions<HTMLElement, HTMLElement>);

  // 특정 인덱스로 스크롤
  const scrollToIndex = useCallback((index: number, options?: any) => {
    virtualizer.scrollToIndex(index, {
      align: options?.align || 'start',
      behavior: smoothScroll || options?.smooth ? 'smooth' : 'auto',
      ...options
    });
  }, [virtualizer, smoothScroll]);

  // 특정 오프셋으로 스크롤
  const scrollToOffset = useCallback((offset: number) => {
    virtualizer.scrollToOffset(offset);
  }, [virtualizer]);

  // 맨 위로 스크롤
  const scrollToTop = useCallback(() => {
    scrollToOffset(0);
  }, [scrollToOffset]);

  // 맨 아래로 스크롤
  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1, { align: 'end' });
  }, [scrollToIndex, items.length]);

  // 요소 측정
  const measureElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      virtualizer.measureElement(element);
    }
  }, [virtualizer]);

  // 가시 범위 계산
  const visibleRange = {
    startIndex: virtualizer.range?.startIndex || 0,
    endIndex: virtualizer.range?.endIndex || 0
  };

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
    scrollToOffset,
    scrollToTop,
    scrollToBottom,
    measureElement,
    visibleRange,
    scrollOffset: virtualizer.scrollOffset || 0
  };
}