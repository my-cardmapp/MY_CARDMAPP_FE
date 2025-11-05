import type { Merchant } from '@/types/merchant'

export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 1,
    name: '편의점 GS25 강남점',
    address: '서울시 강남구 테헤란로 123',
    location: { lat: 37.55, lng: 127.05 },
    cards: [
      {
        id: 1,
        code: 'CHILD_MEAL',
        name: '아동급식카드',
        colorHex: '#FF6B6B',
      },
    ],
    category: {
      id: 1,
      code: 'convenience',
      name: '편의점',
    },
    businessHours: {
      mon: ['00:00', '24:00'],
      tue: ['00:00', '24:00'],
      wed: ['00:00', '24:00'],
      thu: ['00:00', '24:00'],
      fri: ['00:00', '24:00'],
      sat: ['00:00', '24:00'],
      sun: ['00:00', '24:00'],
    },
    phone: '02-1234-5678',
    isVerified: true,
  },
  {
    id: 2,
    name: '김밥천국 역삼점',
    address: '서울시 강남구 역삼동 456',
    location: { lat: 37.52, lng: 127.03 },
    cards: [
      {
        id: 1,
        code: 'CHILD_MEAL',
        name: '아동급식카드',
        colorHex: '#FF6B6B',
      },
      {
        id: 2,
        code: 'CULTURE_NURI',
        name: '문화누리카드',
        colorHex: '#4ECDC4',
      },
    ],
    category: {
      id: 2,
      code: 'restaurant',
      name: '음식점',
    },
    businessHours: {
      mon: ['09:00', '22:00'],
      tue: ['09:00', '22:00'],
      wed: ['09:00', '22:00'],
      thu: ['09:00', '22:00'],
      fri: ['09:00', '22:00'],
      sat: ['09:00', '22:00'],
      sun: ['09:00', '22:00'],
    },
    phone: '02-2345-6789',
    isVerified: true,
  },
  {
    id: 3,
    name: '서울문고 강남점',
    address: '서울시 강남구 강남대로 789',
    location: { lat: 37.51, lng: 127.02 },
    cards: [
      {
        id: 2,
        code: 'CULTURE_NURI',
        name: '문화누리카드',
        colorHex: '#4ECDC4',
      },
    ],
    category: {
      id: 3,
      code: 'bookstore',
      name: '서점',
    },
    businessHours: {
      mon: ['10:00', '21:00'],
      tue: ['10:00', '21:00'],
      wed: ['10:00', '21:00'],
      thu: ['10:00', '21:00'],
      fri: ['10:00', '21:00'],
      sat: ['10:00', '21:00'],
      sun: ['10:00', '21:00'],
    },
    phone: '02-3456-7890',
    isVerified: true,
  },
  // Out of bounds merchant for testing
  {
    id: 4,
    name: '파리바게뜨 서초점',
    address: '서울시 서초구 서초대로 123',
    location: { lat: 37.65, lng: 127.15 }, // Out of bounds
    cards: [
      {
        id: 1,
        code: 'CHILD_MEAL',
        name: '아동급식카드',
        colorHex: '#FF6B6B',
      },
    ],
    category: {
      id: 4,
      code: 'bakery',
      name: '베이커리',
    },
    businessHours: {
      mon: ['07:00', '22:00'],
      tue: ['07:00', '22:00'],
      wed: ['07:00', '22:00'],
      thu: ['07:00', '22:00'],
      fri: ['07:00', '22:00'],
      sat: ['07:00', '22:00'],
      sun: ['07:00', '22:00'],
    },
    phone: '02-4567-8901',
    isVerified: true,
  },
]