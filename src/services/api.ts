/**
 * API Service Layer
 * Centralized API communication module
 */

import type { Merchant, Card, Category } from '@/types/merchant'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

// Helper for API calls
async function fetchAPI<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Merchant API
export const merchantAPI = {
  async getList(params?: {
    page?: number
    size?: number
    cardTypes?: string[]
    categories?: string[]
    lat?: number
    lng?: number
    radius?: number
  }) {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.size) searchParams.append('size', params.size.toString())
    if (params?.cardTypes?.length) {
      searchParams.append('cardTypes', params.cardTypes.join(','))
    }
    if (params?.categories?.length) {
      searchParams.append('categories', params.categories.join(','))
    }
    if (params?.lat) searchParams.append('lat', params.lat.toString())
    if (params?.lng) searchParams.append('lng', params.lng.toString())
    if (params?.radius) searchParams.append('radius', params.radius.toString())

    return fetchAPI<{
      content: Merchant[]
      totalElements: number
      totalPages: number
      first: boolean
      last: boolean
      pageable?: {
        page: number
        size: number
        sort: string[]
      }
    }>(`/merchants?${searchParams.toString()}`)
  },

  async get(id: number) {
    return fetchAPI<Merchant>(`/merchants/${id}`)
  },

  async getNearby(params: {
    lat: number
    lng: number
    radius?: number
    cardTypes?: string[]
    categories?: string[]
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    
    searchParams.append('lat', params.lat.toString())
    searchParams.append('lng', params.lng.toString())
    
    if (params.radius) searchParams.append('radius', params.radius.toString())
    if (params.cardTypes?.length) {
      searchParams.append('cardTypes', params.cardTypes.join(','))
    }
    if (params.categories?.length) {
      searchParams.append('categories', params.categories.join(','))
    }
    if (params.limit) searchParams.append('limit', params.limit.toString())

    return fetchAPI<{
      merchants: Merchant[]
      center: { lat: number; lng: number }
      radius: number
    }>(`/merchants/nearby?${searchParams.toString()}`)
  },

  async search(params: {
    query: string
    cardTypes?: string[]
    categories?: string[]
    page?: number
    size?: number
  }) {
    const searchParams = new URLSearchParams()
    
    searchParams.append('query', params.query)
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.size) searchParams.append('size', params.size.toString())
    if (params.cardTypes?.length) {
      searchParams.append('cardTypes', params.cardTypes.join(','))
    }
    if (params.categories?.length) {
      searchParams.append('categories', params.categories.join(','))
    }

    return fetchAPI<{
      content: Merchant[]
      totalElements: number
      totalPages: number
      currentPage: number
      query: string
      suggestions?: string[]
    }>(`/merchants/search?${searchParams.toString()}`)
  }
}

// Card API
export const cardAPI = {
  async getAll() {
    return fetchAPI<{
      cards: Card[]
    }>('/cards')
  },

  async get(code: string) {
    return fetchAPI<Card & {
      description: string
      benefits: string[]
      restrictions: string[]
      issuer: string
      merchantCount: number
      popularCategories: Category[]
    }>(`/cards/${code}`)
  }
}

// Category API
export const categoryAPI = {
  async getAll() {
    return fetchAPI<Category[]>('/categories')
  }
}

// Route API
export const routeAPI = {
  async calculate(params: {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    waypoints?: { lat: number; lng: number }[]
    mode: 'walking' | 'transit' | 'driving'
    departureTime?: string
    avoidTolls?: boolean
  }) {
    return fetchAPI<{
      routes: Array<{
        summary: string
        distance: number
        duration: number
        fare?: number
        polyline: string
        steps: Array<{
          instruction: string
          distance: number
          duration: number
          startLocation: { lat: number; lng: number }
          endLocation: { lat: number; lng: number }
        }>
      }>
      origin: { lat: number; lng: number; name?: string }
      destination: { lat: number; lng: number; name?: string }
      waypoints?: Array<{ lat: number; lng: number; name?: string }>
    }>('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  async optimize(params: {
    origin: string // "lat,lng"
    waypoints: string // "lat1,lng1;lat2,lng2"
    mode: string
  }) {
    const searchParams = new URLSearchParams()
    searchParams.append('origin', params.origin)
    searchParams.append('waypoints', params.waypoints)
    searchParams.append('mode', params.mode)

    return fetchAPI<{
      optimizedOrder: number[]
      totalDistance: number
      totalDuration: number
      route: any
    }>(`/routes/optimize?${searchParams.toString()}`)
  }
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    return fetchAPI<{
      accessToken: string
      refreshToken: string
      expiresIn: number
      user: {
        id: number
        email: string
        name: string
        role: string
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  },

  async refresh(refreshToken: string) {
    return fetchAPI<{
      accessToken: string
      expiresIn: number
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  },

  async logout() {
    return fetchAPI<void>('/auth/logout', {
      method: 'POST'
    })
  }
}

// AI API
export const aiAPI = {
  async chat(params: {
    message: string
    context?: {
      location?: { lat: number; lng: number }
      previousQueries?: string[]
      cardTypes?: string[]
    }
    sessionId?: string
  }) {
    return fetchAPI<{
      reply: string
      intent: 'search' | 'route' | 'info' | 'general'
      entities?: {
        cardTypes?: string[]
        categories?: string[]
        location?: string
        merchants?: Merchant[]
      }
      suggestions?: string[]
      actions?: Array<{
        type: 'show_merchants' | 'calculate_route' | 'filter_results'
        data: any
      }>
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  async analyzeIntent(query: string, context?: any) {
    return fetchAPI<{
      intent: string
      confidence: number
      entities: { [key: string]: any }
      requiresAI: boolean
    }>('/ai/intent', {
      method: 'POST',
      body: JSON.stringify({ query, context })
    })
  }
}