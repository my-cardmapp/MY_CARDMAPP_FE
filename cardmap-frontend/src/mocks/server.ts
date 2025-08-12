import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Node.js 환경용 MSW server 설정 (테스트, SSR용)
export const server = setupServer(...handlers);