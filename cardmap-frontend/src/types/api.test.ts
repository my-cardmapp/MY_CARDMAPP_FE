import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  // Merchant types
  Merchant,
  MerchantListResponse,
  MerchantDetailResponse,
  NearbyMerchantsRequest,
  NearbyMerchantsResponse,
  MerchantSearchRequest,
  MerchantSearchResponse,
  MerchantWithDistance,
  
  // Card types
  Card,
  CardDetail,
  CardListResponse,
  CardDetailResponse,
  
  // Route types
  RouteCalculateRequest,
  RouteCalculateResponse,
  Route,
  RouteStep,
  TransitDetails,
  OptimizeRouteRequest,
  OptimizeRouteResponse,
  
  // AI/Chat types
  ChatRequest,
  ChatResponse,
  ChatAction,
  IntentRequest,
  IntentResponse,
  
  // Common types
  Location,
  Category,
  BusinessHours,
  Review,
  ErrorResponse,
  
  // Auth types
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from './api';

describe('API TypeScript Types', () => {
  describe('Merchant Types', () => {
    it('should have correct Merchant type structure', () => {
      const merchant: Merchant = {
        id: 1,
        name: '김밥천국',
        address: '서울시 강남구',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점' },
        businessHours: { mon: ['09:00', '22:00'] },
        phone: '02-123-4567',
        isVerified: true
      };
      
      expectTypeOf(merchant).toMatchTypeOf<Merchant>();
      expectTypeOf(merchant.id).toBeNumber();
      expectTypeOf(merchant.name).toBeString();
      expectTypeOf(merchant.location).toHaveProperty('lat');
      expectTypeOf(merchant.location).toHaveProperty('lng');
    });

    it('should have correct MerchantListResponse type', () => {
      const response: MerchantListResponse = {
        content: [],
        pageable: { page: 0, size: 20, sort: [] },
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: false
      };
      
      expectTypeOf(response).toMatchTypeOf<MerchantListResponse>();
      expectTypeOf(response.content).toBeArray();
      expectTypeOf(response.totalElements).toBeNumber();
    });

    it('should have correct MerchantDetailResponse type', () => {
      const response: MerchantDetailResponse = {
        id: 1,
        name: '김밥천국',
        address: '서울시 강남구',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점' },
        isVerified: true,
        reviews: [],
        averageRating: 4.5,
        reviewCount: 10,
        distance: 500
      };
      
      expectTypeOf(response).toMatchTypeOf<MerchantDetailResponse>();
      expectTypeOf(response.reviews).toBeArray();
      expectTypeOf(response.averageRating).toEqualTypeOf<number | undefined>();
    });

    it('should have correct NearbyMerchantsRequest type', () => {
      const request: NearbyMerchantsRequest = {
        lat: 37.5,
        lng: 127.0,
        radius: 500,
        cardTypes: ['CHILD_MEAL'],
        categories: ['FOOD'],
        limit: 20
      };
      
      expectTypeOf(request).toMatchTypeOf<NearbyMerchantsRequest>();
      expectTypeOf(request.lat).toBeNumber();
      expectTypeOf(request.radius).toEqualTypeOf<number | undefined>();
    });

    it('should have correct MerchantWithDistance type', () => {
      const merchant: MerchantWithDistance = {
        id: 1,
        name: '김밥천국',
        address: '서울시',
        location: { lat: 37.5, lng: 127.0 },
        cards: [],
        category: { id: 1, code: 'FOOD', name: '음식점' },
        isVerified: true,
        distance: 500,
        walkingTime: 10
      };
      
      expectTypeOf(merchant).toMatchTypeOf<MerchantWithDistance>();
      expectTypeOf(merchant.distance).toBeNumber();
      expectTypeOf(merchant.walkingTime).toEqualTypeOf<number | undefined>();
    });
  });

  describe('Card Types', () => {
    it('should have correct Card type', () => {
      const card: Card = {
        id: 1,
        code: 'CHILD_MEAL',
        name: '아동급식카드',
        colorHex: '#FF5733',
        iconUrl: '/icons/child-meal.png'
      };
      
      expectTypeOf(card).toMatchTypeOf<Card>();
      expectTypeOf(card.code).toBeString();
      expectTypeOf(card.iconUrl).toEqualTypeOf<string | undefined>();
    });

    it('should have correct CardDetail type', () => {
      const cardDetail: CardDetail = {
        id: 1,
        code: 'CHILD_MEAL',
        name: '아동급식카드',
        colorHex: '#FF5733',
        description: '아동 급식 지원 카드',
        benefits: ['하루 1만원 지원'],
        restrictions: ['주류 구매 불가'],
        issuer: '서울시',
        merchantCount: 1000,
        popularCategories: []
      };
      
      expectTypeOf(cardDetail).toMatchTypeOf<CardDetail>();
      expectTypeOf(cardDetail.benefits).toBeArray();
      expectTypeOf(cardDetail.merchantCount).toBeNumber();
    });
  });

  describe('Route Types', () => {
    it('should have correct RouteCalculateRequest type', () => {
      const request: RouteCalculateRequest = {
        origin: { lat: 37.5, lng: 127.0 },
        destination: { lat: 37.6, lng: 127.1 },
        waypoints: [],
        mode: 'walking',
        departureTime: '2024-01-01T10:00:00Z',
        avoidTolls: false
      };
      
      expectTypeOf(request).toMatchTypeOf<RouteCalculateRequest>();
      expectTypeOf(request.origin).toHaveProperty('lat');
      expectTypeOf(request.mode).toEqualTypeOf<'walking' | 'transit' | 'driving' | undefined>();
    });

    it('should have correct Route type', () => {
      const route: Route = {
        summary: '도보 10분',
        distance: 500,
        duration: 600,
        polyline: 'encoded_polyline_string',
        steps: [],
        fare: 1250
      };
      
      expectTypeOf(route).toMatchTypeOf<Route>();
      expectTypeOf(route.distance).toBeNumber();
      expectTypeOf(route.fare).toEqualTypeOf<number | undefined>();
    });

    it('should have correct TransitDetails type', () => {
      const transit: TransitDetails = {
        line: '2호선',
        departure: '강남역',
        arrival: '역삼역',
        numStops: 1
      };
      
      expectTypeOf(transit).toMatchTypeOf<TransitDetails>();
      expectTypeOf(transit.line).toBeString();
      expectTypeOf(transit.numStops).toBeNumber();
    });
  });

  describe('AI/Chat Types', () => {
    it('should have correct ChatRequest type', () => {
      const request: ChatRequest = {
        message: '근처 김밥집 찾아줘',
        context: {
          location: { lat: 37.5, lng: 127.0 },
          previousQueries: ['편의점 찾기'],
          cardTypes: ['CHILD_MEAL']
        },
        sessionId: 'session123'
      };
      
      expectTypeOf(request).toMatchTypeOf<ChatRequest>();
      expectTypeOf(request.message).toBeString();
      expectTypeOf(request.context).toEqualTypeOf<ChatRequest['context']>();
    });

    it('should have correct ChatResponse type', () => {
      const response: ChatResponse = {
        reply: '근처에 김밥천국이 있습니다.',
        intent: 'search',
        entities: {
          cardTypes: ['CHILD_MEAL'],
          categories: ['FOOD'],
          location: '강남역',
          merchants: []
        },
        suggestions: ['김밥천국 가는 길'],
        actions: []
      };
      
      expectTypeOf(response).toMatchTypeOf<ChatResponse>();
      expectTypeOf(response.intent).toEqualTypeOf<'search' | 'route' | 'info' | 'general'>();
      expectTypeOf(response.actions).toEqualTypeOf<ChatAction[] | undefined>();
    });

    it('should have correct ChatAction type', () => {
      const action: ChatAction = {
        type: 'show_merchants',
        data: { merchantIds: [1, 2, 3] }
      };
      
      expectTypeOf(action).toMatchTypeOf<ChatAction>();
      expectTypeOf(action.type).toEqualTypeOf<'show_merchants' | 'calculate_route' | 'filter_results'>();
      expectTypeOf(action.data).toBeAny();
    });
  });

  describe('Common Types', () => {
    it('should have correct Location type', () => {
      const location: Location = {
        lat: 37.5,
        lng: 127.0,
        address: '서울시 강남구',
        name: '강남역'
      };
      
      expectTypeOf(location).toMatchTypeOf<Location>();
      expectTypeOf(location.lat).toBeNumber();
      expectTypeOf(location.address).toEqualTypeOf<string | undefined>();
    });

    it('should have correct BusinessHours type', () => {
      const hours: BusinessHours = {
        mon: ['09:00', '22:00'],
        tue: ['09:00', '22:00'],
        wed: ['09:00', '22:00'],
        thu: ['09:00', '22:00'],
        fri: ['09:00', '23:00'],
        sat: ['10:00', '23:00'],
        sun: ['10:00', '21:00']
      };
      
      expectTypeOf(hours).toMatchTypeOf<BusinessHours>();
      expectTypeOf(hours.mon).toEqualTypeOf<string[] | undefined>();
    });

    it('should have correct Review type', () => {
      const review: Review = {
        id: 1,
        userId: 100,
        userName: '사용자1',
        rating: 5,
        comment: '맛있어요',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-02T10:00:00Z',
        images: ['/images/review1.jpg']
      };
      
      expectTypeOf(review).toMatchTypeOf<Review>();
      expectTypeOf(review.rating).toBeNumber();
      expectTypeOf(review.images).toEqualTypeOf<string[] | undefined>();
    });

    it('should have correct ErrorResponse type', () => {
      const error: ErrorResponse = {
        timestamp: '2024-01-01T10:00:00Z',
        status: 404,
        error: 'Not Found',
        message: '리소스를 찾을 수 없습니다',
        path: '/api/v1/merchants/999',
        requestId: 'req123',
        details: { field: 'id', reason: 'invalid' }
      };
      
      expectTypeOf(error).toMatchTypeOf<ErrorResponse>();
      expectTypeOf(error.status).toBeNumber();
      expectTypeOf(error.details).toEqualTypeOf<Record<string, any> | undefined>();
    });
  });

  describe('Auth Types', () => {
    it('should have correct LoginRequest type', () => {
      const request: LoginRequest = {
        email: 'user@example.com',
        password: 'password123'
      };
      
      expectTypeOf(request).toMatchTypeOf<LoginRequest>();
      expectTypeOf(request.email).toBeString();
      expectTypeOf(request.password).toBeString();
    });

    it('should have correct LoginResponse type', () => {
      const response: LoginResponse = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        user: {
          id: 1,
          email: 'user@example.com',
          name: '홍길동',
          role: 'USER'
        }
      };
      
      expectTypeOf(response).toMatchTypeOf<LoginResponse>();
      expectTypeOf(response.accessToken).toBeString();
      expectTypeOf(response.user).toHaveProperty('id');
    });

    it('should have correct RefreshTokenRequest type', () => {
      const request: RefreshTokenRequest = {
        refreshToken: 'refresh123'
      };
      
      expectTypeOf(request).toMatchTypeOf<RefreshTokenRequest>();
      expectTypeOf(request.refreshToken).toBeString();
    });

    it('should have correct RefreshTokenResponse type', () => {
      const response: RefreshTokenResponse = {
        accessToken: 'newtoken123',
        expiresIn: 3600
      };
      
      expectTypeOf(response).toMatchTypeOf<RefreshTokenResponse>();
      expectTypeOf(response.accessToken).toBeString();
      expectTypeOf(response.expiresIn).toBeNumber();
    });
  });

  describe('Type Safety', () => {
    it('should not allow any types in strict mode', () => {
      // This test ensures we're not using 'any' types
      const testStrictTypes = () => {
        const merchant: Merchant = {
          id: 1,
          name: '테스트',
          address: '주소',
          location: { lat: 0, lng: 0 },
          cards: [],
          category: { id: 1, code: 'TEST', name: '테스트' },
          isVerified: true
        };
        
        // TypeScript should enforce these types
        expectTypeOf(merchant).not.toBeAny();
        expectTypeOf(merchant.id).not.toBeAny();
        expectTypeOf(merchant.location).not.toBeAny();
      };
      
      expect(testStrictTypes).not.toThrow();
    });

    it('should enforce required vs optional properties', () => {
      // Test that required properties are enforced
      const validMerchant: Merchant = {
        id: 1,
        name: '테스트',
        address: '주소',
        location: { lat: 0, lng: 0 },
        cards: [],
        category: { id: 1, code: 'TEST', name: '테스트' },
        isVerified: true
        // phone is optional, so this is valid
      };
      
      expect(validMerchant).toBeDefined();
    });
  });
});