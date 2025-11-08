import React, { memo } from 'react';
import type { Merchant } from '@/types';
import { CARD_STYLES } from '@/constants/cardStyles';
import { LazyImage } from '@/components/common/LazyImage';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface MerchantListItemProps {
  merchant: Merchant;
  onClick: (merchant: Merchant) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  lazyLoadImages?: boolean;
}

/**
 * 가맹점 목록 아이템 컴포넌트
 * 가상 스크롤링과 함께 사용되며 메모이제이션으로 최적화됨
 */
const MerchantListItem = memo(function MerchantListItem({
  merchant,
  onClick,
  isSelected = false,
  isLoading = false,
  lazyLoadImages = true
}: MerchantListItemProps) {
  // Lazy load the entire item for better performance
  const { ref, hasBeenVisible } = useLazyLoad({
    rootMargin: '100px',
    threshold: 0.1,
    once: true
  });
  // 거리 포맷팅
  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    if (distance < 1000) {
      return `${distance}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // 카드 스타일 가져오기
  const getCardStyle = (code: string) => {
    const style = CARD_STYLES[code as keyof typeof CARD_STYLES] || CARD_STYLES.DEFAULT;
    return {
      name: style.name === '아동급식카드' ? '아동급식' : 
            style.name === '문화누리카드' ? '문화누리' :
            style.name === '지역사랑상품권' ? '지역사랑' : 
            style.name,
      bgColor: style.backgroundColor,
      textColor: style.color,
      borderColor: style.color
    };
  };

  const handleClick = () => {
    if (!isLoading) {
      onClick(merchant);
    }
  };

  // Skeleton for items not yet visible
  if (!hasBeenVisible && lazyLoadImages) {
    return (
      <div 
        ref={ref as any}
        className="w-full p-4 border-b border-gray-200 animate-pulse"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="flex gap-1">
              <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="flex flex-col items-end ml-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-1"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      ref={ref as any}
      role="button"
      onClick={handleClick}
      data-selected={isSelected}
      className={`
        w-full p-4 text-left border-b border-gray-200 
        hover:bg-gray-50 transition-colors cursor-pointer
        ${isSelected ? 'bg-blue-50 border-blue-500' : ''}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* 가맹점 이름과 인증 배지 */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {merchant.name}
            </h3>
            {merchant.isVerified && (
              <span 
                className="text-blue-500 text-sm"
                title="인증된 가맹점"
              >
                ✓
              </span>
            )}
          </div>
          
          {/* 주소 */}
          <p className="text-sm text-gray-600 truncate mb-2">
            {merchant.address}
          </p>
          
          {/* 카드 배지 */}
          <div className="flex flex-wrap gap-1">
            {merchant.cards.map((card) => {
              const style = getCardStyle(card.code);
              return (
                <span
                  key={card.id}
                  className="inline-block px-2 py-0.5 text-xs rounded-full border"
                  style={{
                    backgroundColor: style.bgColor,
                    color: style.textColor,
                    borderColor: style.borderColor
                  }}
                >
                  {style.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* 오른쪽 정보 */}
        <div className="flex flex-col items-end ml-3">
          {/* 거리 */}
          {merchant.distance && (
            <span className="text-sm text-gray-500">
              {formatDistance(merchant.distance)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default MerchantListItem;