import type {
  GooglePlace,
  GooglePlacesTextSearchRequest,
  GooglePlacesTextSearchResponse,
  GooglePlaceDetailsResponse,
  Photo,
} from '@/types/googlePlaces'
import type { Merchant } from '@/types/api'
import { selectPrimaryCategory } from '@/constants/categoryMapping'

/**
 * Google Places API (New) 서비스 클래스
 *
 * 이 클래스는 Google Places API와 통신하여 장소 정보를 가져오고,
 * 프로젝트의 Merchant 타입으로 변환하는 역할을 합니다.
 */
class GooglePlacesAPIService {
  private readonly textSearchEndpoint = '/api/google/places/text-search'
  private readonly detailsEndpoint = '/api/google/places/details'

  /**
   * 텍스트 검색 (Text Search)
   *
   * @param query - 검색 쿼리 (예: "스타벅스 강남")
   * @param options - 검색 옵션
   * @returns 검색된 장소 목록
   */
  async searchByText(
    query: string,
    options?: {
      languageCode?: string
      pageSize?: number
      locationBias?: {
        lat: number
        lng: number
        radius?: number
      }
      includedType?: string
    }
  ): Promise<GooglePlace[]> {
    try {
      const requestBody: GooglePlacesTextSearchRequest = {
        textQuery: query,
        languageCode: options?.languageCode || 'ko',
        pageSize: options?.pageSize || 10,
      }

      // 위치 바이어스 추가
      if (options?.locationBias) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: options.locationBias.lat,
              longitude: options.locationBias.lng,
            },
            radius: options.locationBias.radius || 5000, // 기본 5km
          },
        }
      }

      // 장소 타입 추가
      if (options?.includedType) {
        requestBody.includedType = options.includedType
      }

      console.log('🔍 [Google Places Text Search]', {
        query,
        options,
      })

      const response = await fetch(this.textSearchEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Text search failed')
      }

      const data: GooglePlacesTextSearchResponse = await response.json()

      console.log('✅ [Text Search Results]', {
        count: data.places?.length || 0,
        query,
      })

      return data.places || []
    } catch (error) {
      console.error('❌ [Text Search Error]', error)
      throw error
    }
  }

  /**
   * Place ID로 상세 정보 조회
   *
   * @param placeId - Google Place ID
   * @param languageCode - 언어 코드 (기본: 'ko')
   * @returns 장소 상세 정보
   */
  async getPlaceDetails(placeId: string, languageCode = 'ko'): Promise<GooglePlace> {
    try {
      console.log('🔍 [Google Places Details]', {
        placeId,
        languageCode,
      })

      const url = `${this.detailsEndpoint}?placeId=${encodeURIComponent(placeId)}&languageCode=${languageCode}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Place details request failed')
      }

      const data: GooglePlaceDetailsResponse = await response.json()

      console.log('✅ [Place Details Retrieved]', {
        placeId,
        name: data.displayName?.text,
      })

      return data
    } catch (error) {
      console.error('❌ [Place Details Error]', error)
      throw error
    }
  }

  /**
   * Google Place 객체를 Merchant 객체로 변환
   *
   * @param place - Google Place 객체
   * @returns Merchant 객체
   */
  convertToMerchant(place: GooglePlace): Merchant {
    // 카테고리 추출 (우선순위에 따라 선택)
    const category = selectPrimaryCategory(place.types || [])

    // 영업시간 변환
    const businessHours = this.parseBusinessHours(place.currentOpeningHours?.weekdayDescriptions)

    // Merchant 객체 생성
    const merchant: Merchant = {
      id: this.generateMerchantId(place.id),
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      location: {
        lat: place.location?.latitude || 0,
        lng: place.location?.longitude || 0,
        address: place.formattedAddress || '',
        name: place.displayName?.text || '',
      },
      cards: [], // Google Places API에는 결제 카드 정보 없음
      category,
      phone: place.internationalPhoneNumber,
      businessHours,
      isVerified: false, // Google Places 데이터는 검증되지 않음으로 간주
      // Google Places 추가 정보
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      reviews: place.reviews,
      photos: place.photos,
      googlePlaceId: place.id,
      websiteUri: place.websiteUri,
      googleMapsUri: place.googleMapsUri,
      priceLevel: place.priceLevel,
    }

    return merchant
  }

  /**
   * 영업시간 문자열 배열을 객체로 파싱
   *
   * @param weekdayDescriptions - 요일별 영업시간 설명 배열
   * @returns 영업시간 객체
   */
  private parseBusinessHours(
    weekdayDescriptions?: string[]
  ): Record<string, string[]> | undefined {
    if (!weekdayDescriptions || weekdayDescriptions.length === 0) {
      return undefined
    }

    const businessHours: Record<string, string[]> = {}
    const dayMap: Record<string, string> = {
      Monday: '월요일',
      Tuesday: '화요일',
      Wednesday: '수요일',
      Thursday: '목요일',
      Friday: '금요일',
      Saturday: '토요일',
      Sunday: '일요일',
    }

    weekdayDescriptions.forEach((description) => {
      // "Monday: 9:00 AM – 5:00 PM" 형식 파싱
      const match = description.match(/^(\w+):\s*(.+)$/)
      if (match) {
        const [, englishDay, hours] = match
        const koreanDay = dayMap[englishDay]
        if (koreanDay) {
          businessHours[koreanDay] = [hours]
        }
      }
    })

    return Object.keys(businessHours).length > 0 ? businessHours : undefined
  }

  /**
   * Google Place ID를 숫자 ID로 변환
   *
   * @param placeId - Google Place ID
   * @returns 숫자 ID
   */
  private generateMerchantId(placeId: string): number {
    // Google Place ID를 해시하여 숫자 ID 생성
    let hash = 0
    for (let i = 0; i < placeId.length; i++) {
      const char = placeId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * 사진 URL 생성
   *
   * @param photo - Photo 객체
   * @param maxWidth - 최대 너비 (픽셀)
   * @returns 사진 URL (프록시 엔드포인트)
   */
  getPhotoUrl(photo: Photo, maxWidth = 400): string {
    // 프록시 엔드포인트를 통해 사진 가져오기
    // 서버에서 Google Places Photo API를 호출하여 클라이언트에 전달
    const photoName = encodeURIComponent(photo.name)
    return `/api/google/places/photo?name=${photoName}&maxWidth=${maxWidth}`
  }
}

// 싱글톤 인스턴스 생성 및 export
export const googlePlacesAPI = new GooglePlacesAPIService()
