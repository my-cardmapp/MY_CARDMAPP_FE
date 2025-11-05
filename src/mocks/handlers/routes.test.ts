import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { routeHandlers } from './routes';

const server = setupServer(...routeHandlers);
const BASE_URL = 'http://localhost';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Route API Handlers', () => {
  describe('POST /api/v1/routes/calculate', () => {
    it('should calculate route with Korean coordinates', async () => {
      const request = {
        origin: { lat: 37.5665, lng: 126.9780 }, // 서울시청
        destination: { lat: 37.5172, lng: 127.0473 }, // 강남역
        waypoints: [
          { lat: 37.5551, lng: 126.9707 } // 서울역
        ],
        mode: 'walking' as const,
        departureTime: new Date().toISOString()
      };

      const response = await fetch(`${BASE_URL}/api/v1/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('routes');
      expect(data.routes.length).toBeGreaterThan(0);
      
      const route = data.routes[0];
      expect(route).toHaveProperty('summary');
      expect(route).toHaveProperty('distance');
      expect(route).toHaveProperty('duration');
      expect(route).toHaveProperty('polyline');
      expect(route).toHaveProperty('steps');
      expect(route.distance).toBeGreaterThan(0);
      expect(route.duration).toBeGreaterThan(0);
    });

    it('should generate Korean turn-by-turn directions', async () => {
      const request = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5172, lng: 127.0473 },
        mode: 'walking' as const
      };

      const response = await fetch(`${BASE_URL}/api/v1/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      const steps = data.routes[0].steps;
      expect(steps.length).toBeGreaterThan(0);
      
      // 한국어 지시사항 확인
      const koreanDirections = ['직진', '우회전', '좌회전', '유턴', '출발', '도착'];
      steps.forEach((step: any) => {
        expect(step).toHaveProperty('instruction');
        expect(step).toHaveProperty('distance');
        expect(step).toHaveProperty('duration');
        
        // 최소한 하나의 한국어 방향 단어를 포함해야 함
        const hasKoreanDirection = koreanDirections.some(dir => 
          step.instruction.includes(dir)
        );
        expect(hasKoreanDirection).toBe(true);
      });
    });

    it('should calculate realistic travel times', async () => {
      const request = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5172, lng: 127.0473 }, // 약 7km 거리
        mode: 'walking' as const
      };

      const response = await fetch(`${BASE_URL}/api/v1/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      const route = data.routes[0];
      
      // 도보: 4km/h = 66.67m/min
      const expectedWalkingTime = Math.ceil(route.distance / 66.67);
      expect(route.duration / 60).toBeCloseTo(expectedWalkingTime, -1); // 10분 단위 근사
    });

    it('should handle transit mode with Korean transit details', async () => {
      const request = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5172, lng: 127.0473 },
        mode: 'transit' as const
      };

      const response = await fetch(`${BASE_URL}/api/v1/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      const route = data.routes[0];
      
      // 대중교통: 평균 25km/h
      const transitSteps = route.steps.filter((s: any) => s.transitDetails);
      if (transitSteps.length > 0) {
        const transitStep = transitSteps[0];
        expect(transitStep.transitDetails).toHaveProperty('line');
        expect(transitStep.transitDetails).toHaveProperty('departure');
        expect(transitStep.transitDetails).toHaveProperty('arrival');
        expect(transitStep.transitDetails).toHaveProperty('numStops');
        
        // 한국 지하철/버스 노선명 확인
        const koreanTransitLines = ['호선', '버스', '광역', '지선', '간선'];
        const hasKoreanLine = koreanTransitLines.some(line => 
          transitStep.transitDetails.line.includes(line)
        );
        expect(hasKoreanLine).toBe(true);
      }
    });

    it('should generate realistic polyline for Korean coordinates', async () => {
      const request = {
        origin: { lat: 37.5665, lng: 126.9780 },
        destination: { lat: 37.5172, lng: 127.0473 },
        mode: 'walking' as const
      };

      const response = await fetch(`${BASE_URL}/api/v1/routes/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      
      const polyline = data.routes[0].polyline;
      expect(polyline).toBeTruthy();
      expect(polyline.length).toBeGreaterThan(20); // Encoded polyline should be substantial
    });
  });

  describe('GET /api/v1/routes/optimize', () => {
    it('should optimize waypoint order', async () => {
      const origin = '37.5665,126.9780';
      const waypoints = '37.5551,126.9707;37.5172,127.0473;37.5797,126.9770';
      
      const response = await fetch(
        `${BASE_URL}/api/v1/routes/optimize?origin=${origin}&waypoints=${waypoints}&mode=walking`
      );
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('optimizedOrder');
      expect(data).toHaveProperty('totalDistance');
      expect(data).toHaveProperty('totalDuration');
      expect(data).toHaveProperty('route');
      
      // 최적화된 순서는 waypoint 개수와 같아야 함
      expect(data.optimizedOrder.length).toBe(3);
      
      // 순서는 0부터 시작하는 인덱스 배열
      data.optimizedOrder.forEach((index: number) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(3);
      });
    });

    it('should calculate total distance and duration', async () => {
      const origin = '37.5665,126.9780';
      const waypoints = '37.5551,126.9707;37.5172,127.0473';
      
      const response = await fetch(
        `${BASE_URL}/api/v1/routes/optimize?origin=${origin}&waypoints=${waypoints}&mode=walking`
      );
      const data = await response.json();
      
      expect(data.totalDistance).toBeGreaterThan(0);
      expect(data.totalDuration).toBeGreaterThan(0);
      
      // 전체 거리는 개별 구간 거리의 합과 비슷해야 함
      const routeDistance = data.route.distance;
      expect(data.totalDistance).toBeCloseTo(routeDistance, -2); // 100m 단위 근사
    });

    it('should return optimized route with steps', async () => {
      const origin = '37.5665,126.9780';
      const waypoints = '37.5551,126.9707';
      
      const response = await fetch(
        `${BASE_URL}/api/v1/routes/optimize?origin=${origin}&waypoints=${waypoints}&mode=walking`
      );
      const data = await response.json();
      
      expect(data.route).toHaveProperty('summary');
      expect(data.route).toHaveProperty('steps');
      expect(data.route.steps.length).toBeGreaterThan(0);
    });
  });
});