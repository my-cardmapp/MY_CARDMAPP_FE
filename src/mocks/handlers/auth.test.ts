import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from './auth';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '@/types/api';

const server = setupServer(...authHandlers);

describe('Auth API Handlers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  beforeEach(() => server.resetHandlers());

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate valid test users', async () => {
      const validUsers = [
        { email: 'test@example.com', password: 'password123' },
        { email: 'admin@example.com', password: 'admin123' },
        { email: 'user@example.com', password: 'user123' }
      ];

      for (const user of validUsers) {
        const response = await fetch('http://localhost/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        // Debug logging
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not OK:', response.status, errorText);
        }

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);
        const data: LoginResponse = await response.json();
        
        expect(data.accessToken).toBeDefined();
        expect(data.refreshToken).toBeDefined();
        expect(data.expiresIn).toBe(3600);
        expect(data.user.email).toBe(user.email);
        expect(data.user.id).toBeGreaterThan(0);
      }
    });

    it('should return admin role for admin user', async () => {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });

      const data: LoginResponse = await response.json();
      expect(data.user.role).toBe('ADMIN');
    });

    it('should return user role for regular user', async () => {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'user123'
        })
      });

      const data: LoginResponse = await response.json();
      expect(data.user.role).toBe('USER');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      const error = await response.json();
      expect(error.error).toBe('Unauthorized');
      expect(error.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
    });

    it('should return 400 for missing fields', async () => {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
          // Missing password
        })
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBe('Bad Request');
    });

    it('should generate valid JWT tokens', async () => {
      const response = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      expect(response.ok).toBe(true);
      const data: LoginResponse = await response.json();
      
      // JWT format: header.payload.signature
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.accessToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+$/);
      expect(data.refreshToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+$/);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const loginData: LoginResponse = await loginResponse.json();

      // Use refresh token
      const response = await fetch('http://localhost/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginData.refreshToken
        })
      });

      expect(response.ok).toBe(true);
      const data: RefreshTokenResponse = await response.json();
      
      expect(data.accessToken).toBeDefined();
      expect(data.expiresIn).toBe(3600);
      // New access token should be different
      expect(data.accessToken).not.toBe(loginData.accessToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await fetch('http://localhost/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-token'
        })
      });

      expect(response.status).toBe(401);
      const error = await response.json();
      expect(error.message).toContain('토큰');
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await fetch('http://localhost/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout with valid token', async () => {
      // First login
      const loginResponse = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const loginData: LoginResponse = await loginResponse.json();

      // Logout
      const response = await fetch('http://localhost/api/v1/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });

      expect(response.status).toBe(204);
      expect(response.body).toBe(null);
    });

    it('should return 401 without token', async () => {
      const response = await fetch('http://localhost/api/v1/auth/logout', {
        method: 'POST'
      });

      expect(response.status).toBe(401);
    });

    it('should invalidate token after logout', async () => {
      // First login
      const loginResponse = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const loginData: LoginResponse = await loginResponse.json();

      // Logout
      await fetch('http://localhost/api/v1/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });

      // Try to use the same token again
      const response = await fetch('http://localhost/api/v1/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${loginData.accessToken}`
        }
      });

      expect(response.status).toBe(401);
    });
  });

  describe('OAuth Endpoints', () => {
    describe('GET /api/v1/auth/oauth/kakao', () => {
      it('should redirect to Kakao OAuth', async () => {
        const response = await fetch('http://localhost/api/v1/auth/oauth/kakao', {
          redirect: 'manual'
        });

        expect(response.status).toBe(302);
        const location = response.headers.get('Location');
        expect(location).toContain('kauth.kakao.com');
        expect(location).toContain('client_id=mock-kakao-client-id');
        expect(location).toContain('redirect_uri');
      });
    });

    describe('GET /api/v1/auth/oauth/kakao/callback', () => {
      it('should handle Kakao OAuth callback', async () => {
        const response = await fetch('http://localhost/api/v1/auth/oauth/kakao/callback?code=mock-auth-code');

        expect(response.ok).toBe(true);
        const data = await response.json();
        
        expect(data.accessToken).toBeDefined();
        expect(data.user.email).toContain('@kakao.com');
      });

      it('should return error for missing code', async () => {
        const response = await fetch('http://localhost/api/v1/auth/oauth/kakao/callback');

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/v1/auth/oauth/naver', () => {
      it('should redirect to Naver OAuth', async () => {
        const response = await fetch('http://localhost/api/v1/auth/oauth/naver', {
          redirect: 'manual'
        });

        expect(response.status).toBe(302);
        const location = response.headers.get('Location');
        expect(location).toContain('nid.naver.com');
        expect(location).toContain('client_id=mock-naver-client-id');
      });
    });

    describe('GET /api/v1/auth/oauth/naver/callback', () => {
      it('should handle Naver OAuth callback', async () => {
        const response = await fetch('http://localhost/api/v1/auth/oauth/naver/callback?code=mock-auth-code&state=mock-state');

        expect(response.ok).toBe(true);
        const data = await response.json();
        
        expect(data.accessToken).toBeDefined();
        expect(data.user.email).toContain('@naver.com');
      });
    });
  });

  describe('Role-based responses', () => {
    it('should return more data for admin users', async () => {
      // Login as admin
      const adminLogin = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      });
      const adminData: LoginResponse = await adminLogin.json();

      // Make authenticated request as admin
      const response = await fetch('http://localhost/api/v1/auth/user/profile', {
        headers: { 
          'Authorization': `Bearer ${adminData.accessToken}`
        }
      });

      const profile = await response.json();
      expect(profile.permissions).toContain('MANAGE_USERS');
      expect(profile.permissions).toContain('MANAGE_MERCHANTS');
    });

    it('should return limited data for regular users', async () => {
      // Login as regular user
      const userLogin = await fetch('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'user123'
        })
      });
      const userData: LoginResponse = await userLogin.json();

      // Make authenticated request as user
      const response = await fetch('http://localhost/api/v1/auth/user/profile', {
        headers: { 
          'Authorization': `Bearer ${userData.accessToken}`
        }
      });

      const profile = await response.json();
      expect(profile.permissions).toEqual(['VIEW_OWN_DATA']);
    });
  });
});