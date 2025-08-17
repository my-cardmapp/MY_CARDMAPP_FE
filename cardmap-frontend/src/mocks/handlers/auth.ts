import { http, HttpResponse } from 'msw';
import { createNetworkDelay, getErrorResponse, NetworkErrorType } from '../utils/network';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ErrorResponse
} from '@/types/api';

// Mock user database
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
    role: 'USER'
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123',
    name: '관리자',
    role: 'ADMIN'
  },
  {
    id: 3,
    email: 'user@example.com',
    password: 'user123',
    name: '일반 사용자',
    role: 'USER'
  }
];

// Store for invalidated tokens
const invalidatedTokens = new Set<string>();

/**
 * Generate mock JWT token
 */
function generateMockJWT(payload: Record<string, any>): string {
  // Base64URL encode function (Node.js compatible)
  const base64urlEncode = (str: string): string => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }));
  const signature = base64urlEncode(Math.random().toString(36).substring(2));
  
  return `${header}.${body}.${signature}`;
}

/**
 * Validate JWT token
 */
function validateToken(token: string): boolean {
  if (!token || invalidatedTokens.has(token)) {
    return false;
  }
  
  try {
    const [, payload] = token.split('.');
    // Base64URL decode function (Node.js compatible)
    const base64urlDecode = (str: string): string => {
      // Add padding if necessary
      const padded = str + '='.repeat((4 - str.length % 4) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    };
    
    const decoded = JSON.parse(base64urlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    
    return decoded.exp > now;
  } catch {
    return false;
  }
}

/**
 * Extract user from token
 */
function getUserFromToken(token: string): any {
  try {
    const [, payload] = token.split('.');
    // Base64URL decode function (Node.js compatible)
    const base64urlDecode = (str: string): string => {
      // Add padding if necessary
      const padded = str + '='.repeat((4 - str.length % 4) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    };
    
    const decoded = JSON.parse(base64urlDecode(payload));
    return decoded.user;
  } catch {
    return null;
  }
}

export const authHandlers = [
  // POST /api/v1/auth/login - 로그인
  http.post('*/api/v1/auth/login', async ({ request }) => {
    await createNetworkDelay();
    
    const body = await request.json() as LoginRequest;
    
    // Validate request
    if (!body.email || !body.password) {
      const error = getErrorResponse(
        NetworkErrorType.BAD_REQUEST,
        request.url,
        { 
          email: body.email ? undefined : '이메일은 필수입니다',
          password: body.password ? undefined : '비밀번호는 필수입니다'
        }
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Find user
    const user = mockUsers.find(
      u => u.email === body.email && u.password === body.password
    );
    
    if (!user) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      error.message = '이메일 또는 비밀번호가 올바르지 않습니다.';
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Generate tokens
    const accessToken = generateMockJWT({
      sub: user.id,
      email: user.email,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
    const refreshToken = generateMockJWT({
      sub: user.id,
      type: 'refresh'
    });
    
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
    
    return HttpResponse.json(response);
  }),
  
  // POST /api/v1/auth/refresh - 토큰 갱신
  http.post('*/api/v1/auth/refresh', async ({ request }) => {
    await createNetworkDelay();
    
    const body = await request.json() as RefreshTokenRequest;
    
    if (!body.refreshToken || !validateToken(body.refreshToken)) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      error.message = '유효하지 않은 리프레시 토큰입니다.';
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Generate new access token
    const newAccessToken = generateMockJWT({
      sub: 1,
      email: 'refreshed@example.com',
      role: 'USER',
      user: {
        id: 1,
        email: 'refreshed@example.com',
        name: '갱신된 사용자',
        role: 'USER'
      }
    });
    
    const response: RefreshTokenResponse = {
      accessToken: newAccessToken,
      expiresIn: 3600
    };
    
    return HttpResponse.json(response);
  }),
  
  // POST /api/v1/auth/logout - 로그아웃
  http.post('*/api/v1/auth/logout', async ({ request }) => {
    await createNetworkDelay();
    
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    const token = authHeader.substring(7);
    
    if (!validateToken(token)) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Invalidate token
    invalidatedTokens.add(token);
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // GET /api/v1/auth/oauth/kakao - Kakao OAuth 시작
  http.get('*/api/v1/auth/oauth/kakao', async () => {
    const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
    kakaoAuthUrl.searchParams.set('client_id', 'mock-kakao-client-id');
    kakaoAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/v1/auth/oauth/kakao/callback');
    kakaoAuthUrl.searchParams.set('response_type', 'code');
    
    return new HttpResponse(null, {
      status: 302,
      headers: {
        'Location': kakaoAuthUrl.toString()
      }
    });
  }),
  
  // GET /api/v1/auth/oauth/kakao/callback - Kakao OAuth 콜백
  http.get('*/api/v1/auth/oauth/kakao/callback', async ({ request }) => {
    await createNetworkDelay();
    
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      const error = getErrorResponse(
        NetworkErrorType.BAD_REQUEST,
        request.url,
        { code: '인증 코드가 필요합니다' }
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Mock Kakao user
    const kakaoUser = {
      id: 10001,
      email: `kakao_${Date.now()}@kakao.com`,
      name: '카카오 사용자',
      role: 'USER'
    };
    
    const accessToken = generateMockJWT({
      sub: kakaoUser.id,
      email: kakaoUser.email,
      role: kakaoUser.role,
      provider: 'kakao',
      user: kakaoUser
    });
    
    const refreshToken = generateMockJWT({
      sub: kakaoUser.id,
      type: 'refresh',
      provider: 'kakao'
    });
    
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: kakaoUser
    };
    
    return HttpResponse.json(response);
  }),
  
  // GET /api/v1/auth/oauth/naver - Naver OAuth 시작
  http.get('*/api/v1/auth/oauth/naver', async () => {
    const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
    naverAuthUrl.searchParams.set('client_id', 'mock-naver-client-id');
    naverAuthUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/v1/auth/oauth/naver/callback');
    naverAuthUrl.searchParams.set('response_type', 'code');
    naverAuthUrl.searchParams.set('state', 'mock-state-' + Math.random().toString(36).substring(7));
    
    return new HttpResponse(null, {
      status: 302,
      headers: {
        'Location': naverAuthUrl.toString()
      }
    });
  }),
  
  // GET /api/v1/auth/oauth/naver/callback - Naver OAuth 콜백
  http.get('*/api/v1/auth/oauth/naver/callback', async ({ request }) => {
    await createNetworkDelay();
    
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code || !state) {
      const error = getErrorResponse(
        NetworkErrorType.BAD_REQUEST,
        request.url,
        { 
          code: !code ? '인증 코드가 필요합니다' : undefined,
          state: !state ? 'State 값이 필요합니다' : undefined
        }
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    // Mock Naver user
    const naverUser = {
      id: 20001,
      email: `naver_${Date.now()}@naver.com`,
      name: '네이버 사용자',
      role: 'USER'
    };
    
    const accessToken = generateMockJWT({
      sub: naverUser.id,
      email: naverUser.email,
      role: naverUser.role,
      provider: 'naver',
      user: naverUser
    });
    
    const refreshToken = generateMockJWT({
      sub: naverUser.id,
      type: 'refresh',
      provider: 'naver'
    });
    
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: naverUser
    };
    
    return HttpResponse.json(response);
  }),
  
  // GET /api/v1/auth/user/profile - 사용자 프로필 (역할 기반 응답)
  http.get('*/api/v1/auth/user/profile', async ({ request }) => {
    await createNetworkDelay();
    
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    const token = authHeader.substring(7);
    
    if (!validateToken(token)) {
      const error = getErrorResponse(
        NetworkErrorType.UNAUTHORIZED,
        request.url
      );
      return HttpResponse.json(error, { status: error.status });
    }
    
    const user = getUserFromToken(token);
    
    // Role-based response
    const profile = {
      ...user,
      permissions: user?.role === 'ADMIN' 
        ? ['MANAGE_USERS', 'MANAGE_MERCHANTS', 'VIEW_ALL_DATA', 'EXPORT_DATA']
        : ['VIEW_OWN_DATA'],
      additionalData: user?.role === 'ADMIN'
        ? {
            totalUsers: 1234,
            totalMerchants: 5678,
            systemHealth: 'good',
            lastBackup: new Date().toISOString()
          }
        : undefined
    };
    
    return HttpResponse.json(profile);
  })
];