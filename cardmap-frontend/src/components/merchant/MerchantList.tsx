import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import MerchantListItem from './MerchantListItem';
import type { Merchant } from '@/types';

interface MerchantListProps {
  merchants: Merchant[];
  onItemClick: (merchant: Merchant) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  selectedMerchantId?: number;
  emptyMessage?: string;
  headerContent?: React.ReactNode;
  filterKey?: string;
}

/**
 * 가상 스크롤링을 적용한 가맹점 목록 컴포넌트
 * 대량의 가맹점 데이터를 효율적으로 렌더링
 */
const MerchantList = memo(function MerchantList({
  merchants,
  onItemClick,
  onLoadMore,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  selectedMerchantId,
  emptyMessage = '가맹점이 없습니다.',
  headerContent,
  filterKey
}: MerchantListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prevFilterKey = useRef(filterKey);
  const loadMoreTriggerRef = useRef<NodeJS.Timeout | null>(null);

  // 가상 스크롤 훅 사용
  const {
    virtualItems,
    totalSize,
    scrollToTop,
    scrollOffset,
    measureElement
  } = useVirtualScroll({
    items: merchants,
    parentRef,
    estimateSize: () => 80, // 예상 아이템 높이
    overscan: 5 // 추가로 렌더링할 아이템 수
  });

  // 필터 변경 시 스크롤 리셋
  useEffect(() => {
    if (filterKey !== prevFilterKey.current) {
      scrollToTop();
      prevFilterKey.current = filterKey;
    }
  }, [filterKey, scrollToTop]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const container = parentRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // 스크롤이 90% 이상 도달했을 때 더 불러오기
    if (scrollPercentage > 0.9) {
      // 디바운싱을 위한 타이머
      if (loadMoreTriggerRef.current) {
        clearTimeout(loadMoreTriggerRef.current);
      }

      loadMoreTriggerRef.current = setTimeout(() => {
        onLoadMore();
      }, 100);
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = parentRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (loadMoreTriggerRef.current) {
        clearTimeout(loadMoreTriggerRef.current);
      }
    };
  }, [handleScroll]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">가맹점을 불러오는 중...</p>
      </div>
    );
  }

  // 빈 상태
  if (merchants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 콘텐츠 */}
      {headerContent && (
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          {headerContent}
        </div>
      )}

      {/* 가상 스크롤 컨테이너 */}
      <div
        ref={parentRef}
        data-testid="merchant-list-container"
        className="flex-1 overflow-auto"
        style={{ position: 'relative' }}
      >
        {/* 가상 스크롤 높이 유지용 */}
        <div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>
          {/* 가상 아이템 렌더링 */}
          {virtualItems.map((virtualItem) => {
            const merchant = merchants[virtualItem.index];
            if (!merchant) return null;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <MerchantListItem
                  merchant={merchant}
                  onClick={onItemClick}
                  isSelected={merchant.id === selectedMerchantId}
                />
              </div>
            );
          })}
        </div>

        {/* 로딩 더보기 표시 */}
        {isLoadingMore && (
          <div className="p-4 text-center border-t border-gray-200">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">추가 가맹점을 불러오는 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MerchantList;