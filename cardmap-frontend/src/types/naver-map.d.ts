declare namespace naver {
  namespace maps {
    // KVO base class with generics
    class KVO<T = any> {
      addListener(eventName: string, listener: Function): any
      removeListener(listeners: any): void
      get<K extends keyof T>(key: K): T[K]
      get(key: string): any
      set<K extends keyof T>(key: K, value: T[K]): void
      set(key: string, value: any): void
      setValues(properties: Partial<T>): void
      bindTo<K extends keyof T>(key: K, target: KVO, targetKey?: string): void
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

    class Map extends KVO {
      constructor(element: HTMLElement | string, options: MapOptions)
      setCenter(latlng: LatLng | LatLngLiteral): void
      setZoom(zoom: number): void
      getCenter(): LatLng
      getZoom(): number
      destroy(): void
      getElement(): HTMLElement
      controls: { [key: number]: KVOArray<CustomControl> }
      
      // Extended methods
      getBounds(): LatLngBounds
      fitBounds(bounds: LatLngBounds, options?: FitBoundsOptions): void
      panTo(latlng: LatLng | LatLngLiteral, options?: TransitionOptions): void
      panBy(x: number, y: number): void
      getProjection(): MapSystemProjection
      setOptions(options: Partial<MapOptions>): void
      refresh(): void
      setMapTypeId(mapTypeId: string | MapTypeId): void
      getMapTypeId(): string
      setTilt(tilt: number): void
      getTilt(): number
      setHeading(heading: number): void
      getHeading(): number
      
      // Event methods
      addListener(eventName: string, handler: Function): MapEventListener
      removeListener(listener: MapEventListener): void
      trigger(eventName: string, ...args: any[]): void
    }

    class LatLng {
      constructor(lat: number, lng: number)
      lat(): number
      lng(): number
      equals(other: LatLng | LatLngLiteral): boolean
      toString(): string
      toPoint(): Point
      destinationPoint(angle: number, distance: number): LatLng
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    // LatLng Bounds for geographical boundaries
    class LatLngBounds {
      constructor(sw: LatLng | LatLngLiteral, ne: LatLng | LatLngLiteral)
      getNorthEast(): LatLng
      getSouthWest(): LatLng
      getCenter(): LatLng
      contains(latlng: LatLng | LatLngLiteral): boolean
      extend(latlng: LatLng | LatLngLiteral): LatLngBounds
      equals(bounds: LatLngBounds): boolean
      isEmpty(): boolean
      union(bounds: LatLngBounds): LatLngBounds
    }

    // Pixel bounds
    class Bounds {
      constructor(min: Point, max: Point)
      getMin(): Point
      getMax(): Point
      getCenter(): Point
      extend(point: Point): Bounds
      contains(point: Point): boolean
    }

    interface MapOptions {
      center: LatLng | LatLngLiteral
      zoom: number
      mapTypeId?: string | MapTypeId
      mapTypeControl?: boolean
      zoomControl?: boolean
      zoomControlOptions?: ZoomControlOptions
      scaleControl?: boolean
      scaleControlOptions?: ScaleControlOptions
      logoControl?: boolean
      logoControlOptions?: LogoControlOptions
      mapDataControl?: boolean
      mapDataControlOptions?: MapDataControlOptions
      mapTypeControlOptions?: MapTypeControlOptions
      
      // Extended options
      minZoom?: number
      maxZoom?: number
      restriction?: LatLngBounds
      tilt?: number
      heading?: number
      background?: string
      disableKineticPan?: boolean
      mapTypes?: MapTypeRegistry
      draggable?: boolean
      pinchZoom?: boolean
      scrollWheel?: boolean
      disableDoubleClickZoom?: boolean
      disableDoubleTapZoom?: boolean
      disableTwoFingerTapZoom?: boolean
      keyboardShortcuts?: boolean
    }

    interface ZoomControlOptions {
      position?: number
      style?: ZoomControlStyle
      legendDisabled?: boolean
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
      width: number
      height: number
      equals(other: Size): boolean
      toString(): string
    }

    class Point {
      constructor(x: number, y: number)
      x: number
      y: number
      equals(other: Point): boolean
      toString(): string
      add(point: Point): Point
      sub(point: Point): Point
      mul(scale: number): Point
      div(scale: number): Point
      distanceTo(point: Point): number
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

    interface MapDataControlOptions {
      position?: number
    }

    interface MapTypeControlOptions {
      position?: number
      style?: MapTypeControlStyle
      mapTypeIds?: string[] | MapTypeId[]
    }

    enum MapTypeControlStyle {
      BUTTON = 0,
      DROPDOWN = 1,
    }

    // Map Type Registry for custom map types
    class MapTypeRegistry {
      set(key: string, value: MapType): void
      get(key: string): MapType | null
    }

    interface MapType {
      name: string
      minZoom?: number
      maxZoom?: number
      projection?: any
      getTileUrl?(x: number, y: number, z: number): string
    }

    // Map Type IDs
    const MapTypeId: {
      NORMAL: string
      TERRAIN: string
      SATELLITE: string
      HYBRID: string
    }

    // Transition Options for animations
    interface TransitionOptions {
      duration?: number
      easing?: string
      callback?: () => void
    }

    // Fit Bounds Options
    interface FitBoundsOptions {
      top?: number
      right?: number
      bottom?: number
      left?: number
      maxZoom?: number
    }
  }
}

declare global {
  interface Window {
    naver: typeof naver
    navermap_authFailure?: () => void
  }
}