import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MerchantListItem from './MerchantListItem';
import type { Merchant } from '@/types/merchant';
import { CARD_STYLES } from '@/constants/cardStyles';

// Mock data
const mockMerchant: Merchant = {
  id: 1,
  name: '테스트 가맹점',
  address: '서울시 강남구 테헤란로 123',
  location: { lat: 37.5656, lng: 127.0062 },
  cards: [
    { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#4CAF50', iconUrl: null },
    { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#2196F3', iconUrl: null }
  ],
  category: { id: 1, code: 'FOOD', name: '음식점', icon: '🍽️' },
  businessHours: {
    mon: ['09:00', '22:00'],
    tue: ['09:00', '22:00'],
    wed: ['09:00', '22:00'],
    thu: ['09:00', '22:00'],
    fri: ['09:00', '22:00'],
    sat: ['10:00', '21:00'],
    sun: ['10:00', '21:00']
  },
  phone: '02-1234-5678',
  isVerified: true,
  distance: 150
};

describe('MerchantListItem', () => {
  it('가맹점 정보를 정확히 표시한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} />);
    
    // 기본 정보 표시 확인
    expect(screen.getByText('테스트 가맹점')).toBeInTheDocument();
    expect(screen.getByText('서울시 강남구 테헤란로 123')).toBeInTheDocument();
    expect(screen.getByText('150m')).toBeInTheDocument();
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  it('지원하는 카드 배지를 표시한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} />);
    
    // 카드 배지 확인
    expect(screen.getByText('아동급식')).toBeInTheDocument();
    expect(screen.getByText('문화누리')).toBeInTheDocument();
  });

  it('인증된 가맹점에 인증 배지를 표시한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} />);
    
    // 인증 배지 확인
    expect(screen.getByTitle('인증된 가맹점')).toBeInTheDocument();
  });

  it('거리가 없을 때 거리를 표시하지 않는다', () => {
    const onClick = vi.fn();
    const merchantWithoutDistance = { ...mockMerchant, distance: undefined };
    render(<MerchantListItem merchant={merchantWithoutDistance} onClick={onClick} />);
    
    // 거리 표시가 없어야 함
    expect(screen.queryByText(/\d+m/)).not.toBeInTheDocument();
  });

  it('클릭하면 onClick 핸들러를 호출한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} />);
    
    const item = screen.getByRole('button');
    fireEvent.click(item);
    
    expect(onClick).toHaveBeenCalledWith(mockMerchant);
  });

  it('호버 시 배경색이 변경된다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveClass('hover:bg-gray-50');
  });

  it('거리에 따라 적절한 단위를 표시한다', () => {
    const onClick = vi.fn();
    
    // 1km 미만
    const { rerender } = render(
      <MerchantListItem merchant={{ ...mockMerchant, distance: 850 }} onClick={onClick} />
    );
    expect(screen.getByText('850m')).toBeInTheDocument();
    
    // 1km 이상
    rerender(
      <MerchantListItem merchant={{ ...mockMerchant, distance: 2500 }} onClick={onClick} />
    );
    expect(screen.getByText('2.5km')).toBeInTheDocument();
  });

  it('선택된 상태를 표시한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} isSelected />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('로딩 상태를 표시한다', () => {
    const onClick = vi.fn();
    render(<MerchantListItem merchant={mockMerchant} onClick={onClick} isLoading />);
    
    const item = screen.getByRole('button');
    expect(item).toHaveClass('opacity-50', 'pointer-events-none');
  });

  it('카테고리 아이콘이 없을 때 기본 아이콘을 표시한다', () => {
    const onClick = vi.fn();
    const merchantWithoutIcon = {
      ...mockMerchant,
      category: { ...mockMerchant.category, icon: undefined }
    };
    render(<MerchantListItem merchant={merchantWithoutIcon} onClick={onClick} />);
    
    expect(screen.getByText('📍')).toBeInTheDocument();
  });
});