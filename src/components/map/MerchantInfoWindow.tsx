'use client'

import { useEffect, useRef } from 'react'
import { Merchant } from '@/types'
import { CARD_STYLES } from '@/constants/cardStyles'

interface MerchantInfoWindowProps {
  map: naver.maps.Map
  merchant: Merchant | null
  onClose: () => void
}

export default function MerchantInfoWindow({ map, merchant, onClose }: MerchantInfoWindowProps) {
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null)

  useEffect(() => {
    if (!merchant) {
      // 상인 정보가 없으면 InfoWindow 닫기
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
      return
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
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #212529;">
            ${merchant.name}
          </h3>
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
            "
            onclick="window.dispatchEvent(new CustomEvent('closeInfoWindow'))"
          >
            ×
          </button>
        </div>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #495057; font-size: 14px;">
            ${merchant.address}
          </p>
          ${merchant.phone ? `<p style="margin: 0; color: #6c757d; font-size: 14px;">📞 ${merchant.phone}</p>` : ''}
        </div>
        
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
        
        ${merchant.businessHours ? `
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
  }, [map, merchant, onClose])

  return null
}