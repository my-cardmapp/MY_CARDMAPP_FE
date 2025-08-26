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

    // Animation enumeration
    const Animation: {
      BOUNCE: 1
      DROP: 2
    }

    type Animation = 1 | 2

    // Marker shape types
    interface MarkerShape {
      coords: number[]
      type: 'rect' | 'circle' | 'poly'
    }

    class Marker extends OverlayView {
      constructor(options: MarkerOptions)
      setPosition(position: LatLng | LatLngLiteral): void
      getPosition(): LatLng
      setIcon(icon: ImageIcon | SymbolIcon | HtmlIcon): void
      getIcon(): ImageIcon | SymbolIcon | HtmlIcon
      setAnimation(animation: Animation | null): void
      getAnimation(): Animation | null
      setClickable(clickable: boolean): void
      getClickable(): boolean
      setCursor(cursor: string): void
      getCursor(): string
      setDraggable(draggable: boolean): void
      getDraggable(): boolean
      getDrawingRect(): Bounds
      setOptions(options: Partial<MarkerOptions>): void
      setShape(shape: MarkerShape): void
      getShape(): MarkerShape
      setTitle(title: string): void
      getTitle(): string
      setVisible(visible: boolean): void
      getVisible(): boolean
      setZIndex(zIndex: number): void
      getZIndex(): number
      setOpacity(opacity: number): void
      getOpacity(): number
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral
      map?: Map
      icon?: ImageIcon | SymbolIcon | HtmlIcon
      title?: string
      clickable?: boolean
      draggable?: boolean
      cursor?: string
      shape?: MarkerShape
      visible?: boolean
      zIndex?: number
      flat?: boolean
      opacity?: number
      animation?: Animation
    }

    interface ImageIcon {
      url: string
      size?: Size
      scaledSize?: Size
      origin?: Point
      anchor?: Point
      spriteSize?: Size
      spriteOrigin?: Point
    }

    interface SymbolIcon {
      path: string | SymbolPath
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeWeight?: number
      strokeOpacity?: number
      scale?: number
      rotation?: number
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

    class InfoWindow extends OverlayView {
      constructor(options: InfoWindowOptions)
      open(map: Map, anchor?: Marker | LatLng): void
      close(): void
      setContent(content: string | HTMLElement): void
      getContent(): string | HTMLElement
      setPosition(position: LatLng | LatLngLiteral): void
      getPosition(): LatLng
      setOptions(options: Partial<InfoWindowOptions>): void
      setZIndex(zIndex: number): void
      getZIndex(): number
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
      autoPan?: boolean  // whether to auto pan when opened
      autoPanMargin?: Size  // margin from map edges when auto panning
    }

    class MarkerClustering {
      constructor(options: MarkerClusteringOptions)
      setMap(map: Map | null): void
      getMap(): Map | null
      addMarker(marker: Marker): void
      addMarkers(markers: Marker[]): void
      removeMarker(marker: Marker): void
      removeMarkers(markers: Marker[]): void
      clearMarkers(): void
      redraw(): void
      getMarkers(): Marker[]
      getClusters(): Cluster[]
      reset(): void
      setOptions(options: Partial<MarkerClusteringOptions>): void
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
      stylingFunction?: (clusterMarker: Marker, count: number, members: Marker[]) => void
      calculator?: (markers: Marker[], numStyles: number) => ClusterResult
      clusterMarkerClick?: (e: any, cluster: Cluster) => void
    }

    interface ClusterIcon {
      url: string
      size: Size
      anchor?: Point
      textColor?: string
      textSize?: number
    }

    interface ClusterResult {
      text: string
      index: number
    }

    interface Cluster {
      getClusterMarker(): Marker
      getCenter(): LatLng
      getSize(): number
      getMarkers(): Marker[]
      getBounds(): LatLngBounds
    }

    // Polyline overlay
    class Polyline extends OverlayView {
      constructor(options: PolylineOptions)
      setPath(path: (LatLng | LatLngLiteral)[]): void
      getPath(): LatLng[]
      setOptions(options: Partial<PolylineOptions>): void
      getDistance(): number
      getBounds(): LatLngBounds
    }

    interface PolylineOptions {
      map?: Map
      path: (LatLng | LatLngLiteral)[]
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'shortdashdotdot' | 'dot' | 'dash' | 'dashdot' | 'longdash' | 'longdashdot' | 'longdashdotdot'
      strokeLineCap?: 'butt' | 'round' | 'square'
      strokeLineJoin?: 'miter' | 'round' | 'bevel'
      startIcon?: PointingIcon
      startIconSize?: number
      endIcon?: PointingIcon
      endIconSize?: number
      clickable?: boolean
      zIndex?: number
    }

    // Pointing icon enumeration
    const PointingIcon: {
      CIRCLE: 'circle'
      ARROW: 'arrow'
      OPEN_ARROW: 'openarrow'
      BLOCK_ARROW: 'blockarrow'
    }

    type PointingIcon = 'circle' | 'arrow' | 'openarrow' | 'blockarrow'

    // Polygon overlay
    class Polygon extends OverlayView {
      constructor(options: PolygonOptions)
      setPaths(paths: (LatLng | LatLngLiteral)[] | (LatLng | LatLngLiteral)[][]): void
      getPaths(): LatLng[] | LatLng[][]
      setOptions(options: Partial<PolygonOptions>): void
      getArea(): number
      getBounds(): LatLngBounds
    }

    interface PolygonOptions {
      map?: Map
      paths: (LatLng | LatLngLiteral)[] | (LatLng | LatLngLiteral)[][]
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: string
      strokeLineCap?: string
      strokeLineJoin?: string
      clickable?: boolean
      zIndex?: number
    }

    // Circle overlay
    class Circle extends OverlayView {
      constructor(options: CircleOptions)
      setCenter(center: LatLng | LatLngLiteral): void
      getCenter(): LatLng
      setRadius(radius: number): void
      getRadius(): number
      setOptions(options: Partial<CircleOptions>): void
      getBounds(): LatLngBounds
      getArea(): number
    }

    interface CircleOptions {
      map?: Map
      center: LatLng | LatLngLiteral
      radius: number
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: string
      clickable?: boolean
      zIndex?: number
    }

    // Rectangle overlay
    class Rectangle extends OverlayView {
      constructor(options: RectangleOptions)
      setBounds(bounds: LatLngBounds): void
      getBounds(): LatLngBounds
      setOptions(options: Partial<RectangleOptions>): void
    }

    interface RectangleOptions {
      map?: Map
      bounds: LatLngBounds
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: string
      clickable?: boolean
      zIndex?: number
    }

    // Ground overlay
    class GroundOverlay extends OverlayView {
      constructor(url: string, bounds: LatLngBounds, options?: GroundOverlayOptions)
      setUrl(url: string): void
      getUrl(): string
      setBounds(bounds: LatLngBounds): void
      getBounds(): LatLngBounds
      setOpacity(opacity: number): void
      getOpacity(): number
    }

    interface GroundOverlayOptions {
      map?: Map
      opacity?: number
      clickable?: boolean
      zIndex?: number
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
    abstract class OverlayView extends KVO {
      setMap(map: Map | null): void
      getMap(): Map | null
      getPanes(): MapPanes
      getProjection(): MapSystemProjection
      onAdd(): void
      onRemove(): void
      draw(): void
      setVisible?(visible: boolean): void
      getVisible?(): boolean
      setZIndex?(zIndex: number): void
      getZIndex?(): number
    }

    // Map Panes for overlay positioning
    interface MapPanes {
      mapPane: HTMLElement
      overlayLayer: HTMLElement
      markerLayer: HTMLElement
      overlayImage: HTMLElement
      floatPane: HTMLElement
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