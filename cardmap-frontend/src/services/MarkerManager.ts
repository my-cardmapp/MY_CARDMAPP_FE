import { getCardStyle, getClusterStyle } from '@/constants/cardStyles'
import type { Merchant } from '@/types/merchant'

interface MarkerData {
  marker: naver.maps.Marker
  merchant: Merchant
}

export class MarkerManager {
  private map: naver.maps.Map
  private markers: Map<number, MarkerData> = new Map()
  private clustering: naver.maps.MarkerClustering | null = null
  private activeFilter: string[] | null = null

  constructor(map: naver.maps.Map) {
    this.map = map
  }

  addMerchants(merchants: Merchant[]) {
    merchants.forEach(merchant => this.addMerchant(merchant))
  }

  private addMerchant(merchant: Merchant) {
    // Skip if already exists
    if (this.markers.has(merchant.id)) return

    const position = new naver.maps.LatLng(
      merchant.location.lat,
      merchant.location.lng
    )

    // Get card style (use first card if multiple)
    const cardCode = merchant.cards[0]?.code || 'DEFAULT'
    const cardStyle = getCardStyle(cardCode)

    const marker = new naver.maps.Marker({
      position,
      map: this.shouldShowMarker(merchant) ? this.map : null,
      title: merchant.name,
      icon: {
        content: cardStyle.markerIcon.content,
        size: new naver.maps.Size(
          cardStyle.markerIcon.size.width,
          cardStyle.markerIcon.size.height
        ),
        anchor: new naver.maps.Point(
          cardStyle.markerIcon.anchor.x,
          cardStyle.markerIcon.anchor.y
        ),
      } as naver.maps.HtmlIcon,
      zIndex: 100,
    })

    // Add click listener
    naver.maps.Event.addListener(marker, 'click', () => {
      this.onMarkerClick(merchant)
    })

    this.markers.set(merchant.id, { marker, merchant })

    // Update clustering if enabled
    if (this.clustering) {
      this.clustering.addMarker(marker)
    }
  }

  removeMarker(merchantId: number) {
    const markerData = this.markers.get(merchantId)
    if (!markerData) return

    markerData.marker.setMap(null)
    this.markers.delete(merchantId)

    if (this.clustering) {
      this.clustering.removeMarker(markerData.marker)
    }
  }

  clearMarkers() {
    this.markers.forEach(({ marker }) => {
      marker.setMap(null)
    })
    this.markers.clear()

    if (this.clustering) {
      this.clustering.clearMarkers()
    }
  }

  enableClustering(options?: Partial<naver.maps.MarkerClusteringOptions>) {
    if (this.clustering) return

    const markers = Array.from(this.markers.values()).map(data => data.marker)

    this.clustering = new naver.maps.MarkerClustering({
      minClusterSize: 2,
      maxZoom: 15,
      map: this.map,
      markers,
      disableClickZoom: false,
      gridSize: 80,
      stylingFunction: (clusterMarker: any, count: number) => {
        const style = getClusterStyle(count)
        const element = clusterMarker.getElement()
        
        if (element) {
          element.style.width = `${style.size}px`
          element.style.height = `${style.size}px`
          element.style.lineHeight = `${style.size}px`
          element.style.backgroundColor = style.backgroundColor
          element.style.borderRadius = '50%'
          element.style.border = `2px solid ${style.borderColor}`
          element.style.color = style.textColor
          element.style.fontSize = `${style.fontSize}px`
          element.style.fontWeight = 'bold'
          element.style.textAlign = 'center'
          element.style.cursor = 'pointer'
          element.innerHTML = count.toString()
        }
      },
      ...options,
    })
  }

  disableClustering() {
    if (!this.clustering) return

    this.clustering.setMap(null)
    this.clustering = null

    // Show all markers directly on map
    this.markers.forEach(({ marker, merchant }) => {
      if (this.shouldShowMarker(merchant)) {
        marker.setMap(this.map)
      }
    })
  }

  filterByCardType(cardTypes: string[]) {
    this.activeFilter = cardTypes

    this.markers.forEach(({ marker, merchant }) => {
      const shouldShow = this.shouldShowMarker(merchant)
      marker.setMap(shouldShow ? this.map : null)
    })

    if (this.clustering) {
      this.clustering.redraw()
    }
  }

  clearFilter() {
    this.activeFilter = null
    
    this.markers.forEach(({ marker }) => {
      marker.setMap(this.map)
    })

    if (this.clustering) {
      this.clustering.redraw()
    }
  }

  private shouldShowMarker(merchant: Merchant): boolean {
    if (!this.activeFilter || this.activeFilter.length === 0) {
      return true
    }

    return merchant.cards.some(card => 
      this.activeFilter!.includes(card.code)
    )
  }

  getMarkers(): MarkerData[] {
    return Array.from(this.markers.values())
  }

  getVisibleMarkers(): MarkerData[] {
    return this.getMarkers().filter(({ merchant }) => 
      this.shouldShowMarker(merchant)
    )
  }

  private onMarkerClick(merchant: Merchant) {
    // This will be handled by the parent component via event
    const event = new CustomEvent('markerClick', { 
      detail: { merchant } 
    })
    window.dispatchEvent(event)
  }

  updateMarkerSize(zoom: number) {
    const scale = zoom < 12 ? 1 : zoom < 15 ? 1.2 : 1.5

    this.markers.forEach(({ marker, merchant }) => {
      const cardCode = merchant.cards[0]?.code || 'DEFAULT'
      const cardStyle = getCardStyle(cardCode)
      
      const size = Math.floor(24 * scale)
      const content = cardStyle.markerIcon.content.replace(/width: 24px; height: 24px/g, `width: ${size}px; height: ${size}px`)

      marker.setIcon({
        content: content,
        size: new naver.maps.Size(size, size),
        anchor: new naver.maps.Point(size / 2, size),
      } as naver.maps.HtmlIcon)
    })
  }

  destroy() {
    this.clearMarkers()
    if (this.clustering) {
      this.disableClustering()
    }
  }
}