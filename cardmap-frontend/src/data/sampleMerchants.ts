import type { Merchant } from '@/types/merchant'

export const sampleMerchants: Merchant[] = [
  // 서울시청 주변 아동급식카드 가맹점
  {
    id: 1,
    name: '김밥천국 시청점',
    address: '서울특별시 중구 세종대로 110',
    location: { lat: 37.5665, lng: 126.9780 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 1, code: 'restaurant', name: '음식점', icon: '🍽️' },
    phone: '02-1234-5678',
    businessHours: {
      mon: ['09:00', '22:00'],
      tue: ['09:00', '22:00'],
      wed: ['09:00', '22:00'],
      thu: ['09:00', '22:00'],
      fri: ['09:00', '22:00'],
      sat: ['09:00', '22:00'],
      sun: ['09:00', '22:00'],
    },
    isVerified: true,
  },
  {
    id: 2,
    name: 'GS25 시청역점',
    address: '서울특별시 중구 서소문로 124',
    location: { lat: 37.5657, lng: 126.9769 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 2, code: 'convenience', name: '편의점', icon: '🏪' },
    phone: '02-2234-5678',
    isVerified: true,
  },
  {
    id: 3,
    name: '파리바게뜨 덕수궁점',
    address: '서울특별시 중구 덕수궁길 15',
    location: { lat: 37.5658, lng: 126.9751 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 3, code: 'bakery', name: '베이커리', icon: '🥐' },
    phone: '02-3234-5678',
    isVerified: true,
  },
  // 문화누리카드 가맹점
  {
    id: 4,
    name: '교보문고 광화문점',
    address: '서울특별시 종로구 종로 1',
    location: { lat: 37.5709, lng: 126.9817 },
    cards: [
      { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#4ECDC4' }
    ],
    category: { id: 4, code: 'bookstore', name: '서점', icon: '📚' },
    phone: '02-4234-5678',
    businessHours: {
      mon: ['09:30', '22:00'],
      tue: ['09:30', '22:00'],
      wed: ['09:30', '22:00'],
      thu: ['09:30', '22:00'],
      fri: ['09:30', '22:00'],
      sat: ['09:30', '22:00'],
      sun: ['09:30', '22:00'],
    },
    isVerified: true,
  },
  {
    id: 5,
    name: 'CGV 피카디리1958',
    address: '서울특별시 종로구 돈화문로 13',
    location: { lat: 37.5713, lng: 126.9881 },
    cards: [
      { id: 2, code: 'CULTURE_NURI', name: '문화누리카드', colorHex: '#4ECDC4' }
    ],
    category: { id: 5, code: 'cinema', name: '영화관', icon: '🎬' },
    phone: '02-5234-5678',
    isVerified: true,
  },
  // 복수 카드 지원 가맹점
  {
    id: 6,
    name: '롯데마트 서울역점',
    address: '서울특별시 용산구 한강대로 405',
    location: { lat: 37.5547, lng: 126.9707 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' },
      { id: 3, code: 'LOCAL_CURRENCY', name: '지역사랑상품권', colorHex: '#FFE66D' }
    ],
    category: { id: 6, code: 'mart', name: '마트', icon: '🛒' },
    phone: '02-6234-5678',
    businessHours: {
      mon: ['10:00', '23:00'],
      tue: ['10:00', '23:00'],
      wed: ['10:00', '23:00'],
      thu: ['10:00', '23:00'],
      fri: ['10:00', '23:00'],
      sat: ['10:00', '23:00'],
      sun: ['10:00', '23:00'],
    },
    isVerified: true,
  },
  // 지역사랑상품권 가맹점
  {
    id: 7,
    name: '남대문시장 왕만두',
    address: '서울특별시 중구 남대문시장4길 21',
    location: { lat: 37.5590, lng: 126.9773 },
    cards: [
      { id: 3, code: 'LOCAL_CURRENCY', name: '지역사랑상품권', colorHex: '#FFE66D' }
    ],
    category: { id: 7, code: 'market', name: '전통시장', icon: '🏪' },
    phone: '02-7234-5678',
    isVerified: true,
  },
  // 추가 아동급식카드 가맹점 (클러스터링 테스트용)
  {
    id: 8,
    name: '맘스터치 시청역점',
    address: '서울특별시 중구 서소문로 100',
    location: { lat: 37.5650, lng: 126.9772 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 8, code: 'fastfood', name: '패스트푸드', icon: '🍔' },
    isVerified: true,
  },
  {
    id: 9,
    name: '이삭토스트 덕수궁점',
    address: '서울특별시 중구 정동길 5',
    location: { lat: 37.5655, lng: 126.9755 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 1, code: 'restaurant', name: '음식점', icon: '🍽️' },
    isVerified: true,
  },
  {
    id: 10,
    name: 'CU 시청광장점',
    address: '서울특별시 중구 세종대로 99',
    location: { lat: 37.5661, lng: 126.9785 },
    cards: [
      { id: 1, code: 'CHILD_MEAL', name: '아동급식카드', colorHex: '#FF6B6B' }
    ],
    category: { id: 2, code: 'convenience', name: '편의점', icon: '🏪' },
    isVerified: true,
  },
]