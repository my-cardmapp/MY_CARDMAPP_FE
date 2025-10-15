'use client'

import { useEffect, useRef, useState } from 'react'
import { Merchant } from '@/types'
import { CARD_STYLES } from '@/constants/cardStyles'
import { naverLocalSearchAPI, NaverLocalSearchItem } from '@/services/naverLocalSearchAPI'

interface MerchantInfoWindowEnhancedProps {
  map: naver.maps.Map
  merchant: Merchant | null
  onClose: () => void
}

export default function MerchantInfoWindowEnhanced({
  map,
  merchant,
  onClose
}: MerchantInfoWindowEnhancedProps) {
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null)
  const [poiData, setPoiData] = useState<NaverLocalSearchItem | null>(null)
  const [isLoadingPOI, setIsLoadingPOI] = useState(false)
  const [poiError, setPoiError] = useState<string | null>(null)

  // POI 데이터 조회
  useEffect(() => {
    if (!merchant) {
      setPoiData(null)
      setPoiError(null)
      return
    }

    const fetchPOIData = async () => {
      setIsLoadingPOI(true)
      setPoiError(null)

      try {
        const response = await naverLocalSearchAPI.searchByQuery(merchant.name, {
          display: 1,
          start: 1
        })

        if (response.items.length > 0) {
          setPoiData(response.items[0])
        } else {
          setPoiError('POI 데이터를 찾을 수 없습니다')
        }
      } catch (error) {
        console.error('POI 데이터 조회 실패:', error)
        setPoiError('POI 데이터 조회 중 오류가 발생했습니다')
      } finally {
        setIsLoadingPOI(false)
      }
    }

    fetchPOIData()
  }, [merchant])

  useEffect(() => {
    if (!merchant) {
      // 상인 정보가 없으면 InfoWindow 닫기
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
      return
    }

    // POI 데이터가 있으면 병합, 없으면 기본 merchant 데이터 사용
    const displayData = {
      name: merchant.name,
      address: poiData?.roadAddress || poiData?.address || merchant.address,
      phone: poiData?.telephone || merchant.phone,
      category: poiData?.category || merchant.category.name,
      isVerified: !!poiData, // POI 데이터가 있으면 검증된 것으로 간주
    }

    // InfoWindow 콘텐츠 생성
    const content = `
      <div class="merchant-info-window" style="
        padding: 16px;
        min-width: 280px;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div style="flex: 1; padding-right: 8px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #212529;">
              ${displayData.name}
              ${displayData.isVerified ? '<span style="color: #10B981; font-size: 14px; margin-left: 4px;">✓</span>' : ''}
            </h3>
            ${isLoadingPOI ? '<p style="margin: 4px 0 0 0; color: #6c757d; font-size: 12px;">POI 정보 로딩 중...</p>' : ''}
            ${poiError ? `<p style="margin: 4px 0 0 0; color: #EF4444; font-size: 12px;">${poiError}</p>` : ''}
          </div>
          <button
            class="info-window-close"
            style="
              background: none;
              border: none;
              padding: 4px;
              cursor: pointer;
              color: #6c757d;
              font-size: 20px;
              line-height: 1;
              margin: -4px -4px 0 0;
              flex-shrink: 0;
            "
            onclick="window.dispatchEvent(new CustomEvent('closeInfoWindow'))"
          >
            ×
          </button>
        </div>

        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #495057; font-size: 14px;">
            📍 ${displayData.address}
          </p>
          ${displayData.phone ? `<p style="margin: 0; color: #6c757d; font-size: 14px;">📞 ${displayData.phone}</p>` : ''}
          ${displayData.category ? `<p style="margin: 4px 0 0 0; color: #6c757d; font-size: 13px;">🏷️ ${displayData.category}</p>` : ''}
        </div>

        ${merchant.cards.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; color: #212529; font-size: 14px; font-weight: 500;">
              사용 가능한 카드
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${merchant.cards.map(card => {
                const style = CARD_STYLES[card.code as keyof typeof CARD_STYLES]
                return `
                  <span style="
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 500;
                    background-color: ${style.color}20;
                    color: ${style.color};
                    border: 1px solid ${style.color}40;
                  ">
                    ${card.name}
                  </span>
                `
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${merchant.businessHours && Object.keys(merchant.businessHours).length > 0 ? `
          <div>
            <p style="margin: 0 0 8px 0; color: #212529; font-size: 14px; font-weight: 500;">
              영업시간
            </p>
            <div style="color: #495057; font-size: 14px; line-height: 1.5;">
              ${Object.entries(merchant.businessHours)
                .map(([day, hours]) => `${day}: ${hours.join(' - ')}`)
                .join('<br>')}
            </div>
          </div>
        ` : ''}

        ${poiData ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #6c757d; font-size: 11px; text-align: right;">
              네이버 지역 검색 정보
            </p>
          </div>
        ` : ''}
      </div>
    `

    // InfoWindow 생성 또는 업데이트
    if (!infoWindowRef.current) {
      infoWindowRef.current = new naver.maps.InfoWindow({
        content,
        maxWidth: 350,
        backgroundColor: '#ffffff',
        borderColor: '#e9ecef',
        borderWidth: 1,
        anchorSize: new naver.maps.Size(12, 12),
        anchorSkew: true,
        anchorColor: '#ffffff',
        pixelOffset: new naver.maps.Point(0, -10)
      })
    } else {
      infoWindowRef.current.setContent(content)
    }

    // InfoWindow 열기
    infoWindowRef.current.open(map, new naver.maps.LatLng(
      merchant.location.lat,
      merchant.location.lng
    ))

    // 닫기 버튼 이벤트 리스너
    const handleCloseEvent = () => {
      onClose()
    }
    window.addEventListener('closeInfoWindow', handleCloseEvent)

    // 맵 클릭 시 InfoWindow 닫기
    const mapClickListener = naver.maps.Event.addListener(map, 'click', () => {
      onClose()
    })

    return () => {
      window.removeEventListener('closeInfoWindow', handleCloseEvent)
      naver.maps.Event.removeListener(mapClickListener)
    }
  }, [map, merchant, onClose, poiData, isLoadingPOI, poiError])

  return null
}
