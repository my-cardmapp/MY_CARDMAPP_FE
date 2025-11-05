import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MerchantDetailPanel from './MerchantDetailPanel'
import type { Merchant } from '@/types'
import * as naverLocalSearchAPI from '@/services/naverLocalSearchAPI'

// Mock Naver Local Search API
vi.mock('@/services/naverLocalSearchAPI')

const mockMerchant: Merchant = {
  id: 1,
  name: '김밥천국 시청점',
  address: '서울특별시 중구 세종대로 110',
  location: { lat: 37.5656, lng: 126.9769 },
  cards: [
    { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#4CAF50' },
    { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#2196F3' }
  ],
  category: { id: 1, code: 'FOOD', name: '한식', icon: '🍽️' },
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
  isVerified: true
}

const mockPOIResponse = {
  lastBuildDate: '2025-01-15',
  total: 1,
  start: 1,
  display: 1,
  items: [
    {
      title: '김밥천국 시청점',
      link: 'https://map.naver.com/...',
      category: '음식점>한식',
      description: '김밥 전문점',
      telephone: '02-1234-5678',
      address: '서울특별시 중구 세종대로 110',
      roadAddress: '서울특별시 중구 세종대로 110',
      mapx: '1269769000',
      mapy: '375656000'
    }
  ]
}

describe('MerchantDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(naverLocalSearchAPI.naverLocalSearchAPI.searchByQuery).mockResolvedValue(mockPOIResponse)
  })

  it('merchant가 null이면 아무것도 렌더링하지 않는다', () => {
    const onClose = vi.fn()
    const { container } = render(<MerchantDetailPanel merchant={null} onClose={onClose} />)

    expect(container.firstChild).toBeNull()
  })

  it('merchant가 있으면 패널을 표시한다', () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    expect(screen.getByText('김밥천국 시청점')).toBeInTheDocument()
  })

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: /닫기/i })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('가맹점 기본 정보를 표시한다', () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    expect(screen.getByText('김밥천국 시청점')).toBeInTheDocument()
    expect(screen.getByText(/서울특별시 중구 세종대로 110/)).toBeInTheDocument()
    expect(screen.getByText('02-1234-5678')).toBeInTheDocument()
  })

  it('카드 정보를 표시한다', () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    expect(screen.getByText(/아동급식카드/)).toBeInTheDocument()
    expect(screen.getByText(/문화누리카드/)).toBeInTheDocument()
  })

  it('영업시간 정보를 표시한다', () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    expect(screen.getByText(/영업시간/i)).toBeInTheDocument()
  })

  it('POI 데이터를 가져와서 네이버 정보를 표시한다', async () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    await waitFor(() => {
      expect(naverLocalSearchAPI.naverLocalSearchAPI.searchByQuery).toHaveBeenCalledWith(
        mockMerchant.name,
        expect.any(Object)
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/네이버 지역 검색 정보/i)).toBeInTheDocument()
    })
  })

  it('탭 전환이 동작한다', async () => {
    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    const infoTab = screen.getByRole('button', { name: /정보/i })
    fireEvent.click(infoTab)

    // 정보 탭의 콘텐츠가 표시되어야 함
    expect(screen.getByText(/카테고리/i)).toBeInTheDocument()
  })

  it('API 호출 실패 시 에러를 처리한다', async () => {
    vi.mocked(naverLocalSearchAPI.naverLocalSearchAPI.searchByQuery).mockRejectedValue(
      new Error('API Error')
    )

    const onClose = vi.fn()
    render(<MerchantDetailPanel merchant={mockMerchant} onClose={onClose} />)

    // 기본 정보는 여전히 표시되어야 함
    expect(screen.getByText('김밥천국 시청점')).toBeInTheDocument()

    // POI 정보는 표시되지 않아야 함
    await waitFor(() => {
      expect(screen.queryByText(/네이버 지역 검색 정보/i)).not.toBeInTheDocument()
    })
  })
})
