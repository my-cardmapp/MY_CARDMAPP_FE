import { http, HttpResponse } from 'msw';

// 기본 API 핸들러들
export const handlers = [
  // GET /api/v1/merchants - 가맹점 목록 조회
  http.get('/api/v1/merchants', () => {
    return HttpResponse.json({
      content: [],
      pageable: {
        page: 0,
        size: 20,
        sort: []
      },
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants/:id - 가맹점 상세 조회
  http.get('/api/v1/merchants/:id', ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      id: Number(id),
      name: `가맹점 ${id}`,
      address: '서울특별시 강남구 테헤란로 123',
      location: { lat: 37.5665, lng: 126.9780 },
      cards: [],
      category: { id: 1, code: 'RESTAURANT', name: '음식점' },
      isVerified: true
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants/nearby - 근처 가맹점 조회
  http.get('/api/v1/merchants/nearby', ({ request }) => {
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const radius = url.searchParams.get('radius') || '500';

    return HttpResponse.json({
      merchants: [],
      center: { 
        lat: lat ? parseFloat(lat) : 37.5665, 
        lng: lng ? parseFloat(lng) : 126.9780 
      },
      radius: parseInt(radius)
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/merchants/search - 가맹점 검색
  http.get('/api/v1/merchants/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';

    return HttpResponse.json({
      content: [],
      query,
      suggestions: [],
      pageable: {
        page: 0,
        size: 20,
        sort: []
      },
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

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