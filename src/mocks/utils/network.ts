/**
 * Network utilities for simulating realistic network conditions
 * 네트워크 시뮬레이션 유틸리티
 */

export enum NetworkErrorType {
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  SERVER_ERROR = 500,
  TIMEOUT = 408,
  SERVICE_UNAVAILABLE = 503,
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  requestId?: string;
  details?: Record<string, any>;
}

/**
 * Create realistic network delay with jitter
 * 지터가 포함된 현실적인 네트워크 지연 생성
 * 
 * @param baseDelay - Base delay in milliseconds (100-500ms default)
 * @returns Promise that resolves after delay
 */
export async function createNetworkDelay(baseDelay?: number): Promise<void> {
  // Use provided base delay or random between 100-500ms
  const base = baseDelay !== undefined ? baseDelay : (100 + Math.random() * 400);
  
  // Add jitter between 0-200ms
  const jitter = Math.random() * 200;
  
  const totalDelay = Math.max(0, base + jitter);
  
  return new Promise(resolve => setTimeout(resolve, totalDelay));
}

/**
 * Check if request should trigger an error based on specific conditions
 * 특정 조건에 따라 오류를 트리거해야 하는지 확인
 */
export function isErrorTrigger(type: string, data: any): boolean {
  switch (type) {
    case 'merchant':
      // 404 for merchant ID > 10000
      return typeof data === 'number' && data > 10000;
      
    case 'search':
      // 500 for specific error terms
      const errorTerms = ['error', '오류', 'crash', '에러'];
      return typeof data === 'string' && 
             errorTerms.some(term => data.toLowerCase().includes(term));
      
    case 'auth':
      // 401 for missing token
      return data === null || data === undefined || data === '';
      
    case 'route':
      // Timeout for routes with too many waypoints (> 5)
      return data?.waypoints && Array.isArray(data.waypoints) && data.waypoints.length > 5;
      
    default:
      return false;
  }
}

/**
 * Determine if a random network error should occur
 * 무작위 네트워크 오류 발생 여부 결정
 * 
 * @param method - HTTP method
 * @param errorRate - Error probability (0-1)
 * @returns Whether to trigger an error
 */
export function shouldTriggerError(method: string, errorRate: number = 0.05): boolean {
  // Only apply random errors to GET requests in development
  if (method !== 'GET') {
    return false;
  }
  
  // Random error based on error rate
  return Math.random() < errorRate;
}

/**
 * Generate an error response
 * 오류 응답 생성
 */
export function getErrorResponse(
  errorType: NetworkErrorType,
  path: string,
  details?: Record<string, any>
): ErrorResponse {
  const errorMessages: Record<NetworkErrorType, { error: string; message: string }> = {
    [NetworkErrorType.NOT_FOUND]: {
      error: 'Not Found',
      message: '요청한 리소스를 찾을 수 없습니다.',
    },
    [NetworkErrorType.UNAUTHORIZED]: {
      error: 'Unauthorized',
      message: '인증이 필요합니다. 다시 로그인해주세요.',
    },
    [NetworkErrorType.BAD_REQUEST]: {
      error: 'Bad Request',
      message: '잘못된 요청입니다. 입력값을 확인해주세요.',
    },
    [NetworkErrorType.SERVER_ERROR]: {
      error: 'Internal Server Error',
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
    [NetworkErrorType.TIMEOUT]: {
      error: 'Request Timeout',
      message: '요청 시간 초과. 네트워크 연결을 확인해주세요.',
    },
    [NetworkErrorType.SERVICE_UNAVAILABLE]: {
      error: 'Service Unavailable',
      message: '서비스를 일시적으로 사용할 수 없습니다.',
    },
  };

  const errorInfo = errorMessages[errorType];
  
  return {
    timestamp: new Date().toISOString(),
    status: errorType,
    error: errorInfo.error,
    message: errorInfo.message,
    path,
    requestId: generateRequestId(),
    ...(details && { details }),
  };
}

/**
 * Generate a unique request ID
 * 고유한 요청 ID 생성
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Simulate network timeout
 * 네트워크 타임아웃 시뮬레이션
 */
export async function simulateTimeout(timeoutMs: number = 5000): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Network timeout'));
    }, timeoutMs);
  });
}

/**
 * Apply network conditions to MSW response
 * MSW 응답에 네트워크 조건 적용
 */
export async function applyNetworkConditions(
  method: string,
  path: string,
  requestData?: any
): Promise<ErrorResponse | null> {
  // Check for specific error triggers
  if (path.includes('/merchants/') && !path.includes('/search')) {
    const idMatch = path.match(/\/merchants\/(\d+)/);
    if (idMatch) {
      const merchantId = parseInt(idMatch[1]);
      if (isErrorTrigger('merchant', merchantId)) {
        await createNetworkDelay(100);
        return getErrorResponse(NetworkErrorType.NOT_FOUND, path);
      }
    }
  }
  
  if (path.includes('/search') && requestData?.query) {
    if (isErrorTrigger('search', requestData.query)) {
      await createNetworkDelay(200);
      return getErrorResponse(NetworkErrorType.SERVER_ERROR, path);
    }
  }
  
  if (path.includes('/auth/') && !requestData?.token) {
    if (isErrorTrigger('auth', requestData?.token)) {
      await createNetworkDelay(50);
      return getErrorResponse(NetworkErrorType.UNAUTHORIZED, path);
    }
  }
  
  if (path.includes('/routes/') && requestData?.waypoints) {
    if (isErrorTrigger('route', requestData)) {
      await createNetworkDelay(5000);
      return getErrorResponse(NetworkErrorType.TIMEOUT, path);
    }
  }
  
  // Apply random error for GET requests (5% default)
  if (shouldTriggerError(method)) {
    await createNetworkDelay(150);
    return getErrorResponse(NetworkErrorType.SERVICE_UNAVAILABLE, path);
  }
  
  // Normal request - apply standard delay
  await createNetworkDelay();
  return null;
}