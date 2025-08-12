import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { merchantHandlers } from './merchants';

const server = setupServer(...merchantHandlers);
const BASE_URL = 'http://localhost';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Debug Merchant Handlers', () => {
  it('should check nearby response structure', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/merchants/nearby?lat=37.5665&lng=126.9780&radius=1000`);
    const data = await response.json();
    
    console.log('Nearby Response:', JSON.stringify(data, null, 2));
    expect(response.status).toBe(200);
  });

  it('should check search response structure', async () => {
    const response = await fetch(`${BASE_URL}/api/v1/merchants/search?query=김밥`);
    const data = await response.json();
    
    console.log('Search Response:', JSON.stringify(data, null, 2));
    expect(response.status).toBe(200);
  });
});