import { http, HttpResponse } from 'msw';
import { merchantHandlers } from './handlers/merchants';

// 기본 API 핸들러들 (merchant 핸들러는 별도 파일로 분리)
export const handlers = [
  // Merchant 관련 핸들러는 merchantHandlers에서 가져옴
  ...merchantHandlers,

  // GET /api/v1/cards - 카드 목록 조회
  http.get('/api/v1/cards', () => {
    return HttpResponse.json({
      cards: [
        {
          id: 1,
          code: 'CHILD_MEAL',
          name: '아동급식카드',
          colorHex: '#FFB800',
          description: '아동 급식 지원 카드',
          benefits: ['급식비 지원'],
          restrictions: ['일일 한도 있음'],
          issuer: '보건복지부',
          merchantCount: 0
        },
        {
          id: 2,
          code: 'CULTURE_NURI',
          name: '문화누리카드',
          colorHex: '#00A651',
          description: '문화 생활 지원 카드',
          benefits: ['문화생활 지원'],
          restrictions: ['연간 한도 있음'],
          issuer: '문화체육관광부',
          merchantCount: 0
        }
      ]
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // POST /api/v1/routes/calculate - 경로 계산
  http.post('/api/v1/routes/calculate', async ({ request }) => {
    const body = await request.json() as any;

    return HttpResponse.json({
      routes: [{
        summary: '최단 경로',
        distance: 1000,
        duration: 600,
        polyline: 'encodedPolylineString',
        steps: []
      }],
      origin: body.origin,
      destination: body.destination,
      waypoints: body.waypoints || []
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/routes/optimize - 경로 최적화
  http.get('/api/v1/routes/optimize', ({ request }) => {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');
    const waypoints = url.searchParams.get('waypoints');

    return HttpResponse.json({
      optimizedOrder: [0, 1, 2],
      totalDistance: 2500,
      totalDuration: 1500,
      route: {
        summary: '최적화된 경로',
        distance: 2500,
        duration: 1500,
        polyline: 'encodedPolylineString',
        steps: []
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // POST /api/v1/auth/login - 로그인
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as any;

    return HttpResponse.json({
      accessToken: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      user: {
        id: 1,
        email: body.email,
        name: '테스트 사용자',
        role: 'user'
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // POST /api/v1/auth/refresh - 토큰 갱신
  http.post('/api/v1/auth/refresh', async ({ request }) => {
    return HttpResponse.json({
      accessToken: 'new-mock-jwt-token',
      expiresIn: 3600
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // POST /api/v1/auth/logout - 로그아웃
  http.post('/api/v1/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  })
];