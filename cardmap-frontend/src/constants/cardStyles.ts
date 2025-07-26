export const CARD_STYLES = {
  CHILD_MEAL: {
    code: 'CHILD_MEAL',
    name: '아동급식카드',
    color: '#FF6B6B', // 따뜻한 빨간색
    backgroundColor: '#FFE3E3',
    icon: '🍔',
    markerIcon: {
      content: '<div style="width: 24px; height: 24px; background-color: #FF6B6B; border: 2px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>',
      size: { width: 24, height: 24 },
      anchor: { x: 12, y: 24 },
    },
  },
  CULTURE_NURI: {
    code: 'CULTURE_NURI',
    name: '문화누리카드',
    color: '#4ECDC4', // 청록색
    backgroundColor: '#E3F9F6',
    icon: '🎭',
    markerIcon: {
      content: '<div style="width: 24px; height: 24px; background-color: #4ECDC4; border: 2px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>',
      size: { width: 24, height: 24 },
      anchor: { x: 12, y: 24 },
    },
  },
  LOCAL_CURRENCY: {
    code: 'LOCAL_CURRENCY',
    name: '지역사랑상품권',
    color: '#FFE66D', // 노란색
    backgroundColor: '#FFFAE3',
    icon: '💳',
    markerIcon: {
      content: '<div style="width: 24px; height: 24px; background-color: #FFE66D; border: 2px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>',
      size: { width: 24, height: 24 },
      anchor: { x: 12, y: 24 },
    },
  },
  DEFAULT: {
    code: 'DEFAULT',
    name: '기타 카드',
    color: '#95A5A6', // 회색
    backgroundColor: '#ECEFF1',
    icon: '💰',
    markerIcon: {
      content: '<div style="width: 24px; height: 24px; background-color: #95A5A6; border: 2px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>',
      size: { width: 24, height: 24 },
      anchor: { x: 12, y: 24 },
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