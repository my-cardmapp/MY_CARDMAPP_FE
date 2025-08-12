import { merchantHandlers } from './handlers/merchants';
import { routeHandlers } from './handlers/routes';
import { cardHandlers } from './handlers/cards';
import { authHandlers } from './handlers/auth';
import { suggestionHandlers } from './handlers/suggestions';

// 기본 API 핸들러들 (각 도메인별로 분리)
export const handlers = [
  // Merchant 관련 핸들러
  ...merchantHandlers,
  
  // Route 관련 핸들러
  ...routeHandlers,
  
  // Card 관련 핸들러
  ...cardHandlers,
  
  // Auth 관련 핸들러
  ...authHandlers,
  
  // Suggestion 관련 핸들러
  ...suggestionHandlers
];