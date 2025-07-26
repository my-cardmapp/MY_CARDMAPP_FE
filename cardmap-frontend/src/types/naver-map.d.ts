declare namespace naver {
  namespace maps {
    class Map {
      constructor(element: HTMLElement | string, options: MapOptions)
      setCenter(latlng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getCenter(): LatLng
      getZoom(): number
      destroy(): void
      getElement(): HTMLElement
      controls: Control[]
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral
      zoom: number
      mapTypeId?: string
      mapTypeControl?: boolean
      zoomControl?: boolean
      zoomControlOptions?: ZoomControlOptions
      scaleControl?: boolean
      logoControl?: boolean
      mapDataControl?: boolean
    }

    interface ZoomControlOptions {
      position: number
    }

    // Position constants
    const Position: {
      CENTER: 0
      TOP_LEFT: 1
      TOP_CENTER: 2
      TOP_RIGHT: 3
      LEFT_CENTER: 4
      LEFT_TOP: 5
      LEFT_BOTTOM: 6
      RIGHT_TOP: 7
      RIGHT_CENTER: 8
      RIGHT_BOTTOM: 9
      BOTTOM_LEFT: 10
      BOTTOM_CENTER: 11
      BOTTOM_RIGHT: 12
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng | LatLngLiteral): void
      getPosition(): LatLng
      setIcon(icon: ImageIcon | SymbolIcon | HtmlIcon): void
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral
      map?: Map
      icon?: ImageIcon | SymbolIcon | HtmlIcon
      title?: string
      clickable?: boolean
      zIndex?: number
    }

    interface ImageIcon {
      url: string
      size?: Size
      scaledSize?: Size
      origin?: Point
      anchor?: Point
    }

    interface SymbolIcon {
      path: string | SymbolPath
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
      strokeOpacity?: number
      scale?: number
      anchor?: Point
    }

    interface HtmlIcon {
      content: string
      size?: Size
      anchor?: Point
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW = 1,
      BACKWARD_OPEN_ARROW = 2,
      CIRCLE = 3,
      FORWARD_CLOSED_ARROW = 4,
      FORWARD_OPEN_ARROW = 5,
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions)
      open(map: Map, anchor?: Marker | LatLng): void
      close(): void
      setContent(content: string | HTMLElement): void
    }

    interface InfoWindowOptions {
      content: string | HTMLElement
      position?: LatLng | LatLngLiteral
      maxWidth?: number
      pixelOffset?: Point
      zIndex?: number
      disableAnchor?: boolean
      disableAutoPan?: boolean
      anchorSkew?: boolean
      anchorSize?: Size
      anchorColor?: string
      borderColor?: string
      borderWidth?: number
      backgroundColor?: string
    }

    class MarkerClustering {
      constructor(options: MarkerClusteringOptions)
      setMap(map: Map | null): void
      addMarker(marker: Marker): void
      addMarkers(markers: Marker[]): void
      removeMarker(marker: Marker): void
      removeMarkers(markers: Marker[]): void
      clearMarkers(): void
      redraw(): void
    }

    interface MarkerClusteringOptions {
      minClusterSize?: number
      maxZoom?: number
      map?: Map
      markers?: Marker[]
      disableClickZoom?: boolean
      gridSize?: number
      icons?: ClusterIcon[]
      indexGenerator?: number[]
      averageCenter?: boolean
      stylingFunction?: (clusterMarker: any, count: number) => void
    }

    interface ClusterIcon {
      url: string
      size: Size
      anchor?: Point
    }

    // Event types
    interface MapEvent {
      coord: LatLng
      point: Point
      offset: Point
      domEvent: MouseEvent
      overlay: any
    }

    // Event handling
    class Event {
      static addListener(
        instance: any,
        eventName: string,
        handler: (e?: any) => void
      ): MapEventListener
      static removeListener(listener: MapEventListener): void
    }

    interface MapEventListener {
      eventName: string
      listener: Function
      target: any
    }

    // Utility functions
    namespace Service {
      function geocode(
        options: GeocodeOptions,
        callback: (status: Status, response: GeocodeResponse) => void
      ): void

      interface GeocodeOptions {
        query: string
        coordinate?: LatLng
      }

      interface GeocodeResponse {
        v2: {
          meta: {
            totalCount: number
            page: number
            count: number
          }
          addresses: Address[]
        }
      }

      interface Address {
        roadAddress: string
        jibunAddress: string
        englishAddress: string
        x: string
        y: string
        distance?: number
      }

      enum Status {
        OK = 200,
        ERROR = 500,
      }
    }

    // Control classes
    interface Control {
      clear(): void
      push(control: CustomControl): void
    }

    class CustomControl {
      constructor(element: HTMLElement, options?: CustomControlOptions)
    }

    interface CustomControlOptions {
      position?: number
    }

    class ZoomControl extends CustomControl {
      constructor(options?: ZoomControlOptions)
    }

    interface ZoomControlOptions {
      position?: number
      style?: ZoomControlStyle
      legendDisabled?: boolean
    }

    enum ZoomControlStyle {
      LARGE = 0,
      SMALL = 1,
    }

    class ScaleControl extends CustomControl {
      constructor(options?: ScaleControlOptions)
    }

    interface ScaleControlOptions {
      position?: number
    }

    class LogoControl extends CustomControl {
      constructor(options?: LogoControlOptions)
    }

    interface LogoControlOptions {
      position?: number
    }
  }
}

declare global {
  interface Window {
    naver: typeof naver
    navermap_authFailure?: () => void
  }
}