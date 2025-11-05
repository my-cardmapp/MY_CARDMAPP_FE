import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { naverLocalSearchAPI, type NaverLocalSearchResponse } from './naverLocalSearchAPI'

// Mock fetch
global.fetch = vi.fn()

describe('naverLocalSearchAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchByQuery', () => {
    it('should search places by query string', async () => {
      const mockResponse: NaverLocalSearchResponse = {
        lastBuildDate: '2025-10-15',
        total: 1,
        start: 1,
        display: 10,
        items: [
          {
            title: '스타벅스 강남점',
            link: '',
            category: '음식점>카페',
            description: '',
            telephone: '02-1234-5678',
            address: '서울특별시 강남구 테헤란로 123',
            roadAddress: '서울특별시 강남구 테헤란로 123',
            mapx: '1270000',
            mapy: '375000'
          }
        ]
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await naverLocalSearchAPI.searchByQuery('스타벅스')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/search/local.json'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Naver-Client-Id': expect.any(String),
            'X-Naver-Client-Secret': expect.any(String)
          })
        })
      )

      expect(result.total).toBe(1)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].title).toBe('스타벅스 강남점')
    })

    it('should handle search with options', async () => {
      const mockResponse: NaverLocalSearchResponse = {
        lastBuildDate: '2025-10-15',
        total: 2,
        start: 1,
        display: 5,
        items: []
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await naverLocalSearchAPI.searchByQuery('커피', {
        display: 5,
        start: 1,
        sort: 'random'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('display=5'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('start=1'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=random'),
        expect.any(Object)
      )
    })

    it('should throw error on API failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(
        naverLocalSearchAPI.searchByQuery('test')
      ).rejects.toThrow('Naver API Error: 500 Internal Server Error')
    })
  })

  describe('searchByCoordinates', () => {
    it('should search places by coordinates', async () => {
      const mockResponse: NaverLocalSearchResponse = {
        lastBuildDate: '2025-10-15',
        total: 3,
        start: 1,
        display: 10,
        items: [
          {
            title: '근처 가게 1',
            link: '',
            category: '음식점',
            description: '',
            telephone: '02-111-2222',
            address: '서울특별시 강남구',
            roadAddress: '서울특별시 강남구',
            mapx: '1270000',
            mapy: '375000'
          }
        ]
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await naverLocalSearchAPI.searchByCoordinates(
        37.5665,
        126.9780,
        { radius: 1000 }
      )

      expect(result.items).toHaveLength(1)
    })
  })

  describe('convertToMerchant', () => {
    it('should convert Naver API response to Merchant type', () => {
      const naverItem = {
        title: '테스트 가게',
        link: '',
        category: '음식점>한식',
        description: '',
        telephone: '02-1234-5678',
        address: '서울특별시 강남구 테헤란로 123',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        mapx: '1270000',
        mapy: '375000'
      }

      const merchant = naverLocalSearchAPI.convertToMerchant(naverItem, 0)

      expect(merchant.name).toBe('테스트 가게')
      expect(merchant.address).toBe('서울특별시 강남구 테헤란로 123')
      expect(merchant.phone).toBe('02-1234-5678')
      expect(merchant.location).toHaveProperty('lat')
      expect(merchant.location).toHaveProperty('lng')
      expect(merchant.category).toHaveProperty('name')
      expect(merchant.category.name).toContain('음식점')
    })

    it('should handle missing optional fields', () => {
      const naverItem = {
        title: '테스트 가게',
        link: '',
        category: '',
        description: '',
        telephone: '',
        address: '서울시',
        roadAddress: '',
        mapx: '1270000',
        mapy: '375000'
      }

      const merchant = naverLocalSearchAPI.convertToMerchant(naverItem, 1)

      expect(merchant.name).toBe('테스트 가게')
      expect(merchant.phone).toBeUndefined()
      expect(merchant.category.name).toBe('기타')
    })
  })

  describe('convertNaverCoordinates', () => {
    it('should convert Naver coordinates to standard lat/lng', () => {
      const result = naverLocalSearchAPI.convertNaverCoordinates('1270000', '375000')

      expect(result).toHaveProperty('lat')
      expect(result).toHaveProperty('lng')
      expect(typeof result.lat).toBe('number')
      expect(typeof result.lng).toBe('number')
      // 대략적인 범위 확인 (서울 근처)
      expect(result.lat).toBeGreaterThan(37)
      expect(result.lat).toBeLessThan(38)
      expect(result.lng).toBeGreaterThan(126)
      expect(result.lng).toBeLessThan(127)
    })
  })
})
