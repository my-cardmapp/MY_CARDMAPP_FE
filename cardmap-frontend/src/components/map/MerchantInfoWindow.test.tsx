import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import MerchantInfoWindow from './MerchantInfoWindow'
import { Merchant } from '@/types'

// Mock cardStyles
vi.mock('@/constants/cardStyles', () => ({
  CARD_STYLES: {
    CHILD_MEAL: {
      color: '#FF6B6B',
      markerIcon: {
        content: '<div></div>',
        size: { width: 24, height: 24 },
        anchor: { x: 12, y: 24 },
      },
    },
  },
}))

// Mock naver maps
const mockInfoWindow = {
  open: vi.fn(),
  close: vi.fn(),
  setContent: vi.fn(),
}

const mockMap = {
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  getCenter: vi.fn(),
  getZoom: vi.fn(),
}

const mockLatLng = vi.fn((lat: number, lng: number) => ({ lat, lng }))

global.naver = {
  maps: {
    InfoWindow: vi.fn(() => mockInfoWindow),
    LatLng: mockLatLng,
    Point: vi.fn((x: number, y: number) => ({ x, y })),
    Size: vi.fn((width: number, height: number) => ({ width, height })),
    Event: {
      addListener: vi.fn((instance, event, handler) => ({ 
        eventName: event, 
        listener: handler,
        target: instance 
      })),
      removeListener: vi.fn(),
    },
  },
} as any

describe('MerchantInfoWindow', () => {
  const mockMerchant: Merchant = {
    id: 1,
    name: 'Test Merchant',
    address: '서울시 중구 테스트로 123',
    location: { lat: 37.5666805, lng: 126.9784147 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B', iconUrl: '' }
    ],
    category: { id: 1, code: 'RESTAURANT', name: '음식점', icon: '🍽️' },
    phone: '02-1234-5678',
    businessHours: {
      mon: ['09:00', '22:00'],
      tue: ['09:00', '22:00'],
    },
    isVerified: true,
  }

  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing visually but manages InfoWindow', () => {
    const { container } = render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('creates and opens InfoWindow when merchant is provided', () => {
    render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    expect(naver.maps.InfoWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        maxWidth: 350,
        backgroundColor: '#ffffff',
        borderColor: '#e9ecef',
      })
    )

    expect(mockInfoWindow.open).toHaveBeenCalledWith(
      mockMap,
      expect.objectContaining({
        lat: 37.5666805,
        lng: 126.9784147,
      })
    )
  })

  it('closes InfoWindow when merchant is null', () => {
    const { rerender } = render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    rerender(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={null}
        onClose={mockOnClose}
      />
    )

    expect(mockInfoWindow.close).toHaveBeenCalled()
  })

  it('includes business hours in content when available', () => {
    render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    const content = (naver.maps.InfoWindow as any).mock.calls[0][0].content
    expect(content).toContain('영업시간')
    expect(content).toContain('mon: 09:00 - 22:00')
  })

  it('includes phone number when available', () => {
    render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    const content = (naver.maps.InfoWindow as any).mock.calls[0][0].content
    expect(content).toContain('📞 02-1234-5678')
  })

  it('adds event listener for map click to close InfoWindow', () => {
    render(
      <MerchantInfoWindow 
        map={mockMap as any}
        merchant={mockMerchant}
        onClose={mockOnClose}
      />
    )

    expect(naver.maps.Event.addListener).toHaveBeenCalledWith(
      mockMap,
      'click',
      expect.any(Function)
    )

    // Simulate map click
    const mapClickHandler = (naver.maps.Event.addListener as any).mock.calls
      .find((call: any) => call[1] === 'click')[2]
    mapClickHandler()

    expect(mockOnClose).toHaveBeenCalled()
  })
})