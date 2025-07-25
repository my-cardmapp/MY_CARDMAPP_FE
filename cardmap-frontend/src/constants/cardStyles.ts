export const CARD_STYLES = {
  CHILD_MEAL: {
    code: 'CHILD_MEAL',
    name: '아동급식카드',
    color: '#FF6B6B', // 따뜻한 빨간색
    backgroundColor: '#FFE3E3',
    icon: '🍔',
    markerIcon: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      scale: 1.5,
      fillColor: '#FF6B6B',
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    },
  },
  CULTURE_NURI: {
    code: 'CULTURE_NURI',
    name: '문화누리카드',
    color: '#4ECDC4', // 청록색
    backgroundColor: '#E3F9F6',
    icon: '🎭',
    markerIcon: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      scale: 1.5,
      fillColor: '#4ECDC4',
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    },
  },
  LOCAL_CURRENCY: {
    code: 'LOCAL_CURRENCY',
    name: '지역사랑상품권',
    color: '#FFE66D', // 노란색
    backgroundColor: '#FFFAE3',
    icon: '💳',
    markerIcon: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      scale: 1.5,
      fillColor: '#FFE66D',
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    },
  },
  DEFAULT: {
    code: 'DEFAULT',
    name: '기타 카드',
    color: '#95A5A6', // 회색
    backgroundColor: '#ECEFF1',
    icon: '💰',
    markerIcon: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      scale: 1.5,
      fillColor: '#95A5A6',
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    },
  },
} as const

export type CardType = keyof typeof CARD_STYLES

export const getCardStyle = (cardCode: string) => {
  return CARD_STYLES[cardCode as CardType] || CARD_STYLES.DEFAULT
}

// 클러스터 스타일 정의
export const CLUSTER_STYLES = {
  small: {
    size: 40,
    fontSize: 14,
    backgroundColor: '#FF6B6B',
    borderColor: '#FFFFFF',
    textColor: '#FFFFFF',
  },
  medium: {
    size: 50,
    fontSize: 16,
    backgroundColor: '#FF5252',
    borderColor: '#FFFFFF',
    textColor: '#FFFFFF',
  },
  large: {
    size: 60,
    fontSize: 18,
    backgroundColor: '#FF1744',
    borderColor: '#FFFFFF',
    textColor: '#FFFFFF',
  },
}

export const getClusterStyle = (count: number) => {
  if (count < 10) return CLUSTER_STYLES.small
  if (count < 100) return CLUSTER_STYLES.medium
  return CLUSTER_STYLES.large
}