import { http, HttpResponse } from 'msw';
import { 
  applyNetworkConditions,
  createNetworkDelay,
  isErrorTrigger,
  getErrorResponse,
  NetworkErrorType,
  simulateTimeout
} from '../utils/network';
import type {
  RouteCalculateRequest,
  RouteCalculateResponse,
  Route,
  RouteStep,
  OptimizeRouteResponse,
  Location,
  TransitDetails
} from '@/types/api';

// Haversine 거리 계산 (미터 단위)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// 방향 계산
function getDirection(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  const dLng = toLng - fromLng;
  const y = Math.sin(dLng * Math.PI / 180) * Math.cos(toLat * Math.PI / 180);
  const x = Math.cos(fromLat * Math.PI / 180) * Math.sin(toLat * Math.PI / 180) -
    Math.sin(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.cos(dLng * Math.PI / 180);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  const normalizedBearing = (bearing + 360) % 360;

  if (normalizedBearing < 45 || normalizedBearing >= 315) return '북쪽';
  if (normalizedBearing < 135) return '동쪽';
  if (normalizedBearing < 225) return '남쪽';
  return '서쪽';
}

// 한국어 방향 지시 생성
function generateKoreanInstruction(
  stepIndex: number,
  totalSteps: number,
  direction: string,
  streetName?: string,
  distance?: number
): string {
  if (stepIndex === 0) {
    return `출발: ${streetName || '현재 위치'}에서 ${direction}으로 이동하세요`;
  }
  
  if (stepIndex === totalSteps - 1) {
    return '도착: 목적지에 도착했습니다';
  }
  
  const distanceText = distance ? `${distance}m` : '';
  const turnInstructions = [
    `${distanceText} 직진하세요`,
    `${distanceText} 후 우회전하세요`,
    `${distanceText} 후 좌회전하세요`,
    `${distanceText} 후 유턴하세요`
  ];
  
  return turnInstructions[Math.floor(Math.random() * turnInstructions.length)];
}

// 폴리라인 인코딩 (간단한 버전)
function encodePolyline(points: Array<{ lat: number; lng: number }>): string {
  // 실제로는 Google Polyline 알고리즘을 사용해야 하지만, 여기서는 간단한 mock
  const encoded = points.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|');
  return btoa(encoded).replace(/=/g, ''); // Base64 인코딩
}

// 경로 중간 지점 생성
function generateIntermediatePoints(
  start: Location,
  end: Location,
  numPoints: number = 5
): Location[] {
  const points: Location[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio
    });
  }
  return points;
}

// 한국 지하철/버스 노선 생성
function generateKoreanTransitLine(): string {
  const subwayLines = ['1호선', '2호선', '3호선', '4호선', '5호선', '6호선', '7호선', '8호선', '9호선'];
  const busTypes = ['간선버스', '지선버스', '광역버스', '마을버스'];
  const busNumbers = ['142', '273', '360', '441', '504', '740', '9401'];
  
  if (Math.random() > 0.5) {
    return subwayLines[Math.floor(Math.random() * subwayLines.length)];
  } else {
    const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
    const busNumber = busNumbers[Math.floor(Math.random() * busNumbers.length)];
    return `${busNumber}번 ${busType}`;
  }
}

// 한국 역/정류장 이름 생성
function generateKoreanStationName(): string {
  const stations = [
    '강남역', '서울역', '시청역', '을지로입구역', '종로3가역',
    '명동역', '동대문역', '신촌역', '홍대입구역', '이태원역',
    '압구정역', '신사역', '삼성역', '선릉역', '역삼역'
  ];
  return stations[Math.floor(Math.random() * stations.length)];
}

export const routeHandlers = [
  // POST /api/v1/routes/calculate - 경로 계산
  http.post('*/api/v1/routes/calculate', async ({ request }) => {
    const body = await request.json() as RouteCalculateRequest;
    
    // Check for timeout trigger (too many waypoints)
    if (isErrorTrigger('route', body)) {
      // Simulate long processing before timeout
      try {
        await simulateTimeout(5000);
      } catch {
        const error = getErrorResponse(NetworkErrorType.TIMEOUT, request.url);
        return HttpResponse.json(error, { status: error.status });
      }
    }
    
    // Apply network conditions
    const error = await applyNetworkConditions('POST', request.url, body);
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    const { origin, destination, waypoints = [], mode = 'walking' } = body;
    
    // 전체 경로 거리 계산
    let totalDistance = 0;
    const points = [origin, ...waypoints, destination];
    
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(
        points[i].lat, points[i].lng,
        points[i + 1].lat, points[i + 1].lng
      );
    }
    
    // 이동 시간 계산
    let speed: number; // m/min
    switch (mode) {
      case 'walking':
        speed = 66.67; // 4km/h
        break;
      case 'transit':
        speed = 416.67; // 25km/h
        break;
      case 'driving':
        speed = 666.67; // 40km/h
        break;
      default:
        speed = 66.67;
    }
    
    const totalDuration = Math.ceil((totalDistance / speed) * 60); // 초 단위
    
    // 경로 단계 생성
    const steps: RouteStep[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const stepDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
      const stepDuration = Math.ceil((stepDistance / speed) * 60);
      const direction = getDirection(start.lat, start.lng, end.lat, end.lng);
      
      // 중간 단계 추가
      const intermediatePoints = generateIntermediatePoints(start, end, 3);
      
      for (let j = 0; j < intermediatePoints.length - 1; j++) {
        const segmentDistance = Math.floor(stepDistance / (intermediatePoints.length - 1));
        const segmentDuration = Math.floor(stepDuration / (intermediatePoints.length - 1));
        
        const step: RouteStep = {
          instruction: generateKoreanInstruction(
            steps.length,
            points.length * 3,
            direction,
            `도로 ${j + 1}`,
            segmentDistance
          ),
          distance: segmentDistance,
          duration: segmentDuration,
          startLocation: intermediatePoints[j],
          endLocation: intermediatePoints[j + 1]
        };
        
        // 대중교통 모드일 때 일부 단계에 대중교통 정보 추가
        if (mode === 'transit' && Math.random() > 0.7) {
          const transitDetails: TransitDetails = {
            line: generateKoreanTransitLine(),
            departure: generateKoreanStationName(),
            arrival: generateKoreanStationName(),
            numStops: Math.floor(Math.random() * 10) + 1
          };
          step.transitDetails = transitDetails;
          step.instruction = `${transitDetails.line}을(를) 타고 ${transitDetails.departure}에서 ${transitDetails.arrival}까지 ${transitDetails.numStops}개 정류장 이동`;
        }
        
        steps.push(step);
      }
    }
    
    // 마지막 도착 단계 추가
    steps.push({
      instruction: '도착: 목적지에 도착했습니다',
      distance: 0,
      duration: 0,
      startLocation: destination,
      endLocation: destination
    });
    
    // 폴리라인 생성
    const allPoints = steps.map(s => s.startLocation);
    const polyline = encodePolyline(allPoints);
    
    const route: Route = {
      summary: `${origin.name || '출발지'}에서 ${destination.name || '목적지'}까지`,
      distance: totalDistance,
      duration: totalDuration,
      polyline,
      steps,
      fare: mode === 'transit' ? 1250 : undefined // 서울 대중교통 기본요금
    };
    
    const response: RouteCalculateResponse = {
      routes: [route],
      origin,
      destination,
      waypoints
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }),

  // GET /api/v1/routes/optimize - 경로 최적화
  http.get('*/api/v1/routes/optimize', async ({ request }) => {
    const url = new URL(request.url);
    const originStr = url.searchParams.get('origin') || '37.5665,126.9780';
    const waypointsStr = url.searchParams.get('waypoints') || '';
    const mode = url.searchParams.get('mode') || 'walking';
    
    // Apply network conditions
    const error = await applyNetworkConditions('GET', request.url);
    if (error) {
      return HttpResponse.json(error, { status: error.status });
    }
    
    // 좌표 파싱
    const [originLat, originLng] = originStr.split(',').map(Number);
    const origin: Location = { lat: originLat, lng: originLng };
    
    const waypointPairs = waypointsStr.split(';').filter(Boolean);
    const waypoints: Location[] = waypointPairs.map(pair => {
      const [lat, lng] = pair.split(',').map(Number);
      return { lat, lng };
    });
    
    // 간단한 최적화: Nearest Neighbor 알고리즘
    const optimizedOrder: number[] = [];
    const unvisited = waypoints.map((_, index) => index);
    let currentLocation = origin;
    
    while (unvisited.length > 0) {
      let nearestIndex = -1;
      let nearestDistance = Infinity;
      
      for (const index of unvisited) {
        const distance = calculateDistance(
          currentLocation.lat, currentLocation.lng,
          waypoints[index].lat, waypoints[index].lng
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      }
      
      optimizedOrder.push(nearestIndex);
      currentLocation = waypoints[nearestIndex];
      unvisited.splice(unvisited.indexOf(nearestIndex), 1);
    }
    
    // 최적화된 경로로 거리 계산
    const optimizedWaypoints = optimizedOrder.map(i => waypoints[i]);
    const allPoints = [origin, ...optimizedWaypoints];
    
    let totalDistance = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      totalDistance += calculateDistance(
        allPoints[i].lat, allPoints[i].lng,
        allPoints[i + 1].lat, allPoints[i + 1].lng
      );
    }
    
    // 속도 기반 시간 계산
    const speed = mode === 'walking' ? 66.67 : mode === 'transit' ? 416.67 : 666.67;
    const totalDuration = Math.ceil((totalDistance / speed) * 60);
    
    // 경로 생성
    const steps: RouteStep[] = allPoints.slice(0, -1).map((point, i) => ({
      instruction: `경유지 ${i + 1}로 이동`,
      distance: calculateDistance(
        point.lat, point.lng,
        allPoints[i + 1].lat, allPoints[i + 1].lng
      ),
      duration: 60,
      startLocation: point,
      endLocation: allPoints[i + 1]
    }));
    
    const route: Route = {
      summary: `최적화된 경로 (${optimizedOrder.length}개 경유지)`,
      distance: totalDistance,
      duration: totalDuration,
      polyline: encodePolyline(allPoints),
      steps
    };
    
    const response: OptimizeRouteResponse = {
      optimizedOrder,
      totalDistance,
      totalDuration,
      route
    };
    
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  })
];