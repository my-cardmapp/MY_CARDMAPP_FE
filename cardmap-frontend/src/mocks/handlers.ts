import { http, HttpResponse } from 'msw';
import { merchantHandlers } from './handlers/merchants';
import { routeHandlers } from './handlers/routes';
import { cardHandlers } from './handlers/cards';

// 기본 API 핸들러들 (각 도메인별로 분리)
export const handlers = [
  // Merchant 관련 핸들러
  ...merchantHandlers,
  
  // Route 관련 핸들러
  ...routeHandlers,
  
  // Card 관련 핸들러
  ...cardHandlers,

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