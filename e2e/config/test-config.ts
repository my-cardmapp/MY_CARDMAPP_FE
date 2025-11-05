/**
 * E2E 테스트 환경 설정
 */
export const testConfig = {
  // 테스트 환경별 URL
  urls: {
    local: 'http://localhost:3000',
    staging: process.env.STAGING_URL || '',
    production: process.env.PRODUCTION_URL || ''
  },

  // 테스트 타임아웃 설정 (밀리초)
  timeouts: {
    navigation: 30000,
    action: 10000,
    assertion: 5000
  },

  // 테스트 계정 정보 (필요시)
  testUsers: {
    regular: {
      email: 'test@example.com',
      password: 'test123'
    },
    admin: {
      email: 'admin@example.com',
      password: 'admin123'
    }
  },

  // 네이버 지도 테스트용 좌표
  testLocations: {
    seoul: { lat: 37.5666805, lng: 126.9784147 },
    gangnam: { lat: 37.4979, lng: 127.0276 },
    busan: { lat: 35.1795543, lng: 129.0756416 }
  },

  // 테스트용 카드 타입
  cardTypes: {
    CHILD_MEAL: '아동급식카드',
    CULTURE_NURI: '문화누리카드',
    LOCAL_LOVE: '지역사랑상품권'
  },

  // 브라우저 뷰포트 크기
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 }
  }
};