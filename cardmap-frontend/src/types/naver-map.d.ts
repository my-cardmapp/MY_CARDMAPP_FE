declare namespace naver {
  namespace maps {
    // KVO base class
    class KVO {
      addListener(eventName: string, listener: Function): any
      removeListener(listeners: any): void
      get(key: string): any
      set(key: string, value: any): void
      setValues(properties: any): void
      bindTo(key: string, target: KVO, targetKey?: string): void
      unbind(key: string): void
      unbindAll(): void
    }

    // KVOArray for controls
    class KVOArray<T> extends KVO {
      clear(): void
      forEach(callback: (element: T, index: number) => void): void
      getArray(): T[]
      getAt(index: number): T
      getLength(): number
      insertAt(index: number, element: T): void
      pop(): T
      push(element: T): number
      removeAt(index: number): T
      setAt(index: number, element: T): void
    }

    class Map {
      constructor(element: HTMLElement | string, options: MapOptions)
      setCenter(latlng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getCenter(): LatLng
      getZoom(): number
      destroy(): void
      getElement(): HTMLElement
      controls: { [key: number]: KVOArray<CustomControl> }
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
      maxWidth?: number  // default: 0 (no limit)
      pixelOffset?: Point
      zIndex?: number  // default: 0
      disableAnchor?: boolean
      disableAutoPan?: boolean
      anchorSkew?: boolean  // enable skew effect on speech bubble tail
      anchorSize?: Size  // default: width 20, height 24
      anchorColor?: string  // default: "#fff"
      borderColor?: string  // default: "#333"
      borderWidth?: number  // default: 1
      backgroundColor?: string  // default: "#fff"
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

    // MapSystemProjection for overlay positioning
    interface MapSystemProjection {
      fromCoordToContainerPoint(coord: LatLng): Point
      fromCoordToOffset(coord: LatLng): Point
      fromOffsetToCoord(offset: Point): LatLng
      fromContainerPointToCoord(containerPoint: Point): LatLng
    }

    // Control classes - OverlayView is the base class
    class OverlayView extends KVO {
      setMap(map: Map | null): void
      getMap(): Map | null
      getPanes(): any
      getProjection(): MapSystemProjection
      onAdd(): void
      onRemove(): void
      draw(): void
    }

    class CustomControl extends KVO {
      constructor(html: string, options?: CustomControlOptions)
      setMap(map: Map | null): void
      getElement(): HTMLElement
      setOptions(options: CustomControlOptions): void
      setPosition(position: number): void
      html: string
      map: Map | null
      _element: HTMLElement
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