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

    // Stroke style type definitions
    type StrokeStyleType = 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 
      'shortdashdotdot' | 'dot' | 'dash' | 'dashdot' | 'longdash' | 
      'longdashdot' | 'longdashdotdot'
    
    type StrokeLineCapType = 'butt' | 'round' | 'square'
    
    type StrokeLineJoinType = 'miter' | 'round' | 'bevel'

    // Polyline overlay
    class Polyline extends OverlayView {
      constructor(options: PolylineOptions)
      setPath(path: (LatLng | LatLngLiteral)[]): void
      getPath(): LatLng[]
      setOptions(options: Partial<PolylineOptions>): void
      getDistance(): number
      getBounds(): LatLngBounds
      setVisible(visible: boolean): void
      getVisible(): boolean
    }

    interface PolylineOptions {
      map?: Map
      path: LatLng[] | LatLngLiteral[] | (LatLng | LatLngLiteral)[]
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: StrokeStyleType
      strokeLineCap?: StrokeLineCapType
      strokeLineJoin?: StrokeLineJoinType
      startIcon?: PointingIcon
      startIconSize?: number
      endIcon?: PointingIcon
      endIconSize?: number
      clickable?: boolean
      zIndex?: number
      visible?: boolean
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
      setVisible(visible: boolean): void
      getVisible(): boolean
    }

    interface PolygonOptions {
      map?: Map
      paths: (LatLng | LatLngLiteral)[] | (LatLng | LatLngLiteral)[][]  // Supports holes with nested arrays
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: StrokeStyleType
      strokeLineCap?: StrokeLineCapType
      strokeLineJoin?: StrokeLineJoinType
      clickable?: boolean
      zIndex?: number
      visible?: boolean
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
      setVisible(visible: boolean): void
      getVisible(): boolean
    }

    interface CircleOptions {
      map?: Map
      center: LatLng | LatLngLiteral
      radius: number  // In meters
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: StrokeStyleType
      strokeLineCap?: StrokeLineCapType
      strokeLineJoin?: StrokeLineJoinType
      clickable?: boolean
      zIndex?: number
      visible?: boolean
    }

    // Rectangle overlay
    class Rectangle extends OverlayView {
      constructor(options: RectangleOptions)
      setBounds(bounds: LatLngBounds): void
      getBounds(): LatLngBounds
      setOptions(options: Partial<RectangleOptions>): void
      getArea(): number
      setVisible(visible: boolean): void
      getVisible(): boolean
    }

    interface RectangleOptions {
      map?: Map
      bounds: LatLngBounds
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: StrokeStyleType
      strokeLineCap?: StrokeLineCapType
      strokeLineJoin?: StrokeLineJoinType
      clickable?: boolean
      zIndex?: number
      visible?: boolean
    }

    // Ellipse overlay
    class Ellipse extends OverlayView {
      constructor(options: EllipseOptions)
      setCenter(center: LatLng | LatLngLiteral): void
      getCenter(): LatLng
      setRadiusX(radiusX: number): void
      getRadiusX(): number
      setRadiusY(radiusY: number): void
      getRadiusY(): number
      setOptions(options: Partial<EllipseOptions>): void
      getBounds(): LatLngBounds
      getArea(): number
      setVisible(visible: boolean): void
      getVisible(): boolean
    }

    interface EllipseOptions {
      map?: Map
      center: LatLng | LatLngLiteral
      radiusX: number  // Horizontal radius in meters
      radiusY: number  // Vertical radius in meters
      fillColor?: string
      fillOpacity?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: StrokeStyleType
      strokeLineCap?: StrokeLineCapType
      strokeLineJoin?: StrokeLineJoinType
      clickable?: boolean
      zIndex?: number
      visible?: boolean
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

    // Data layer for GeoJSON and feature management
    class Data {
      constructor()
      add(feature: Data.Feature | Data.FeatureOptions): Data.Feature
      addGeoJson(geoJson: GeoJsonObject, options?: GeoJsonOptions): Data.Feature[]
      remove(feature: Data.Feature): void
      forEach(callback: (feature: Data.Feature) => void): void
      overrideStyle(feature: Data.Feature, style: Data.StyleOptions): void
      revertStyle(feature?: Data.Feature): void
      setMap(map: Map | null): void
      setStyle(style: Data.StyleOptions | Data.StylingFunction): void
      toGeoJson(): GeoJsonObject
      contains(latLng: LatLng | LatLngLiteral): boolean
      loadGeoJson(url: string, options?: GeoJsonOptions, callback?: (features: Data.Feature[]) => void): void
    }

    namespace Data {
      interface Feature {
        getId(): string | number | undefined
        getProperty(name: string): any
        setProperty(name: string, value: any): void
        removeProperty(name: string): void
        getGeometry(): Data.Geometry
        setGeometry(geometry: Data.Geometry | LatLng | LatLngLiteral): void
        toGeoJson(): GeoJsonFeature
      }

      interface FeatureOptions {
        geometry?: Data.Geometry | LatLng | LatLngLiteral
        id?: string | number
        properties?: any
      }

      interface StyleOptions {
        clickable?: boolean
        cursor?: string
        draggable?: boolean
        fillColor?: string
        fillOpacity?: number
        icon?: string | ImageIcon | SymbolIcon
        shape?: MarkerShape
        strokeColor?: string
        strokeOpacity?: number
        strokeWeight?: number
        strokeStyle?: StrokeStyleType
        strokeLineCap?: StrokeLineCapType
        strokeLineJoin?: StrokeLineJoinType
        title?: string
        visible?: boolean
        zIndex?: number
      }

      type StylingFunction = (feature: Data.Feature) => Data.StyleOptions

      // Geometry base class and implementations
      abstract class Geometry {
        getType(): string
      }

      class Point extends Geometry {
        constructor(latLng: LatLng | LatLngLiteral)
        get(): LatLng
      }

      class LineString extends Geometry {
        constructor(latLngs: (LatLng | LatLngLiteral)[])
        getArray(): LatLng[]
        getAt(index: number): LatLng
        getLength(): number
      }

      class LinearRing extends Geometry {
        constructor(latLngs: (LatLng | LatLngLiteral)[])
        getArray(): LatLng[]
        getAt(index: number): LatLng
        getLength(): number
      }

      class Polygon extends Geometry {
        constructor(paths: (LatLng | LatLngLiteral)[][] | LinearRing[])
        getArray(): LinearRing[]
        getAt(index: number): LinearRing
        getLength(): number
      }

      class MultiPoint extends Geometry {
        constructor(points: (LatLng | LatLngLiteral)[] | Point[])
        getArray(): Point[]
        getAt(index: number): Point
        getLength(): number
      }

      class MultiLineString extends Geometry {
        constructor(lineStrings: (LatLng | LatLngLiteral)[][] | LineString[])
        getArray(): LineString[]
        getAt(index: number): LineString
        getLength(): number
      }

      class MultiPolygon extends Geometry {
        constructor(polygons: (LatLng | LatLngLiteral)[][][] | Polygon[])
        getArray(): Polygon[]
        getAt(index: number): Polygon
        getLength(): number
      }

      class GeometryCollection extends Geometry {
        constructor(geometries: Geometry[])
        getArray(): Geometry[]
        getAt(index: number): Geometry
        getLength(): number
      }
    }

    // GeoJSON type definitions
    interface GeoJsonOptions {
      idProperty?: string
      featureFactory?: (geoJsonFeature: GeoJsonFeature) => Data.Feature
    }

    type GeoJsonObject = GeoJsonFeature | GeoJsonFeatureCollection | GeoJsonGeometry

    interface GeoJsonFeature {
      type: 'Feature'
      geometry: GeoJsonGeometry
      properties?: any
      id?: string | number
    }

    interface GeoJsonFeatureCollection {
      type: 'FeatureCollection'
      features: GeoJsonFeature[]
    }

    type GeoJsonGeometry = GeoJsonPoint | GeoJsonLineString | GeoJsonPolygon | 
      GeoJsonMultiPoint | GeoJsonMultiLineString | GeoJsonMultiPolygon | 
      GeoJsonGeometryCollection

    interface GeoJsonPoint {
      type: 'Point'
      coordinates: [number, number]  // [longitude, latitude]
    }

    interface GeoJsonLineString {
      type: 'LineString'
      coordinates: [number, number][]
    }

    interface GeoJsonPolygon {
      type: 'Polygon'
      coordinates: [number, number][][]  // Array of linear rings
    }

    interface GeoJsonMultiPoint {
      type: 'MultiPoint'
      coordinates: [number, number][]
    }

    interface GeoJsonMultiLineString {
      type: 'MultiLineString'
      coordinates: [number, number][][]
    }

    interface GeoJsonMultiPolygon {
      type: 'MultiPolygon'
      coordinates: [number, number][][][]
    }

    interface GeoJsonGeometryCollection {
      type: 'GeometryCollection'
      geometries: GeoJsonGeometry[]
    }

    // Base Event types
    interface MapEvent {
      // Base event interface - all events extend this
    }

    interface PointerEvent extends MapEvent {
      coord: LatLng
      point: Point
      offset: Point
      pointerType: 'mouse' | 'touch' | 'pen'
      domEvent: MouseEvent | TouchEvent
      overlay?: any
      feature?: any
    }

    interface DragEvent extends MapEvent {
      coord: LatLng
      point: Point
      offset: Point
    }

    interface KeyboardEvent extends MapEvent {
      keyCode: number
      key: string
      domEvent: globalThis.KeyboardEvent
    }

    interface DOMEvent {
      domEvent: Event
      element?: HTMLElement
    }

    // Event Maps for each class
    interface MapEvents {
      'idle': MapEvent
      'tilesloaded': MapEvent
      'center_changed': MapEvent
      'zoom_changed': MapEvent
      'bounds_changed': MapEvent
      'click': PointerEvent
      'dblclick': PointerEvent
      'rightclick': PointerEvent
      'mousemove': PointerEvent
      'mouseout': PointerEvent
      'mouseover': PointerEvent
      'drag': MapEvent
      'dragstart': MapEvent
      'dragend': MapEvent
      'zoom_start': MapEvent
      'zoom_end': MapEvent
      'size_changed': MapEvent
      'mapType_changed': MapEvent
      'mapTypeId_changed': MapEvent
      'projection_changed': MapEvent
      'panning': MapEvent
      'resize': MapEvent
    }

    interface MarkerEvents {
      'click': PointerEvent
      'dblclick': PointerEvent
      'rightclick': PointerEvent
      'mouseover': PointerEvent
      'mouseout': PointerEvent
      'mousedown': PointerEvent
      'mouseup': PointerEvent
      'dragstart': DragEvent
      'drag': DragEvent
      'dragend': DragEvent
      'animation_changed': MapEvent
      'clickable_changed': MapEvent
      'cursor_changed': MapEvent
      'draggable_changed': MapEvent
      'flat_changed': MapEvent
      'icon_changed': MapEvent
      'position_changed': MapEvent
      'shape_changed': MapEvent
      'title_changed': MapEvent
      'visible_changed': MapEvent
      'zIndex_changed': MapEvent
    }

    interface InfoWindowEvents {
      'anchorColor_changed': MapEvent
      'anchorSize_changed': MapEvent
      'anchorSkew_changed': MapEvent
      'backgroundColor_changed': MapEvent
      'borderColor_changed': MapEvent
      'borderWidth_changed': MapEvent
      'close': MapEvent
      'content_changed': MapEvent
      'disableAnchor_changed': MapEvent
      'disableAutoPan_changed': MapEvent
      'maxWidth_changed': MapEvent
      'open': MapEvent
      'pixelOffset_changed': MapEvent
      'position_changed': MapEvent
      'zIndex_changed': MapEvent
    }

    interface PolylineEvents {
      'click': PointerEvent
      'dblclick': PointerEvent
      'mousedown': PointerEvent
      'mouseout': PointerEvent
      'mouseover': PointerEvent
      'mouseup': PointerEvent
      'rightclick': PointerEvent
      'clickable_changed': MapEvent
      'path_changed': MapEvent
      'strokeColor_changed': MapEvent
      'strokeOpacity_changed': MapEvent
      'strokeStyle_changed': MapEvent
      'strokeWeight_changed': MapEvent
      'visible_changed': MapEvent
      'zIndex_changed': MapEvent
    }

    interface PolygonEvents extends PolylineEvents {
      'fillColor_changed': MapEvent
      'fillOpacity_changed': MapEvent
      'paths_changed': MapEvent
    }

    interface CircleEvents {
      'center_changed': MapEvent
      'click': PointerEvent
      'clickable_changed': MapEvent
      'dblclick': PointerEvent
      'fillColor_changed': MapEvent
      'fillOpacity_changed': MapEvent
      'mousedown': PointerEvent
      'mouseout': PointerEvent
      'mouseover': PointerEvent
      'mouseup': PointerEvent
      'radius_changed': MapEvent
      'rightclick': PointerEvent
      'strokeColor_changed': MapEvent
      'strokeOpacity_changed': MapEvent
      'strokeStyle_changed': MapEvent
      'strokeWeight_changed': MapEvent
      'visible_changed': MapEvent
      'zIndex_changed': MapEvent
    }

    interface RectangleEvents extends CircleEvents {
      'bounds_changed': MapEvent
    }

    interface EllipseEvents extends RectangleEvents {}

    interface GroundOverlayEvents {
      'click': PointerEvent
      'dblclick': PointerEvent
      'opacity_changed': MapEvent
    }

    // Event Target types
    type EventTarget = Map | Marker | InfoWindow | Polyline | Polygon | Circle | Rectangle | Ellipse | GroundOverlay

    // Event Map helper type
    type EventMap<T> = 
      T extends Map ? MapEvents :
      T extends Marker ? MarkerEvents :
      T extends InfoWindow ? InfoWindowEvents :
      T extends Polyline ? PolylineEvents :
      T extends Polygon ? PolygonEvents :
      T extends Circle ? CircleEvents :
      T extends Rectangle ? RectangleEvents :
      T extends Ellipse ? EllipseEvents :
      T extends GroundOverlay ? GroundOverlayEvents :
      never

    // Event Listener types
    interface MapEventListener {
      eventName: string
      listener: Function
      target: any
      remove(): void
    }

    interface DOMEventListener {
      eventName: string
      listener: Function
      element: HTMLElement
      remove(): void
    }

    // Event handling with generics
    class Event {
      /**
       * Adds an event listener to the specified instance
       * @param instance The target object to add the listener to
       * @param eventName The name of the event to listen for
       * @param handler The event handler function
       * @returns A MapEventListener object that can be used to remove the listener
       */
      static addListener<T extends EventTarget, K extends keyof EventMap<T>>(
        instance: T,
        eventName: K,
        handler: (e: EventMap<T>[K]) => void
      ): MapEventListener
      
      // Overload for custom events
      static addListener(
        instance: any,
        eventName: string,
        handler: (e?: any) => void
      ): MapEventListener

      /**
       * Adds a DOM event listener to the specified element
       * @param element The HTML element to add the listener to
       * @param eventName The DOM event name
       * @param handler The event handler function
       * @returns A DOMEventListener object
       */
      static addDOMListener(
        element: HTMLElement,
        eventName: string,
        handler: (e: DOMEvent) => void
      ): DOMEventListener

      /**
       * Adds a one-time event listener that will be automatically removed after firing
       * @param instance The target object
       * @param eventName The event name
       * @param handler The event handler
       * @returns A MapEventListener object
       */
      static once<T extends EventTarget, K extends keyof EventMap<T>>(
        instance: T,
        eventName: K,
        handler: (e: EventMap<T>[K]) => void
      ): MapEventListener
      
      // Overload for custom events
      static once(
        instance: any,
        eventName: string,
        handler: (e?: any) => void
      ): MapEventListener

      /**
       * Triggers an event on the specified instance
       * @param instance The target object
       * @param eventName The event name to trigger
       * @param args Additional arguments to pass to the event handlers
       */
      static trigger(
        instance: any,
        eventName: string,
        ...args: any[]
      ): void

      /**
       * Removes all event listeners from the specified instance
       * @param instance The target object
       * @param eventName Optional specific event name to clear
       */
      static clearListeners(
        instance: any,
        eventName?: string
      ): void

      /**
       * Removes a specific event listener
       * @param listener The listener to remove
       */
      static removeListener(listener: MapEventListener | DOMEventListener): void

      /**
       * Stops event propagation and prevents default behavior
       * @param e The event to stop
       */
      static stopDispatch(e: Event): void

      /**
       * Prevents the default behavior of an event
       * @param e The event
       */
      static preventDefault(e: Event): void

      /**
       * Checks if an object has any event listeners
       * @param instance The object to check
       * @param eventName Optional specific event name
       */
      static hasListeners(
        instance: any,
        eventName?: string
      ): boolean
    }

    // Utility functions
    namespace Service {
      /**
       * Geocode an address to coordinates
       */
      function geocode(
        options: GeocodeOptions,
        callback: (status: Status, response: GeocodeResponse) => void
      ): void

      /**
       * Reverse geocode coordinates to address
       */
      function reverseGeocode(
        options: ReverseGeocodeOptions,
        callback: (status: Status, response: ReverseGeocodeResponse) => void
      ): void

      interface GeocodeOptions {
        query: string
        coordinate?: LatLng | LatLngLiteral
        filter?: 'HCODE' | 'BCODE'  // House code or Building code
        page?: number
        count?: number
      }

      interface ReverseGeocodeOptions {
        coords: LatLng | LatLngLiteral | string  // "lng,lat" format string also supported
        orders?: string  // 'legalcode' | 'admcode' | 'addr' | 'roadaddr' - can be comma separated
        output?: 'json' | 'xml'
      }

      interface GeocodeResponse {
        v2: {
          meta: {
            totalCount: number
            page: number
            count: number
          }
          addresses: Address[]
          errorMessage?: string
        }
      }

      interface ReverseGeocodeResponse {
        v2: {
          status: {
            code: number
            name: string
            message: string
          }
          results: ReverseGeocodeResult[]
        }
      }

      interface ReverseGeocodeResult {
        name: string
        code: {
          id: string
          type: string
          mappingId: string
        }
        region: RegionInfo
        land?: LandInfo
      }

      interface RegionInfo {
        area0: AreaInfo  // Country
        area1: AreaInfo & { alias?: string }  // State/Province
        area2?: AreaInfo  // City
        area3?: AreaInfo  // District
        area4?: AreaInfo  // Sub-district
      }

      interface AreaInfo {
        name: string
        coords: {
          center: {
            x: number
            y: number
          }
        }
      }

      interface LandInfo {
        type: string
        number1: string
        number2: string
        addition0: {
          type: string
          value: string
        }
        name: string
        coords: {
          center: {
            x: number
            y: number
          }
        }
      }

      interface Address {
        roadAddress: string
        jibunAddress: string
        englishAddress: string
        x: string
        y: string
        distance?: number
        addressElements?: AddressElement[]
      }

      interface AddressElement {
        types: string[]
        longName: string
        shortName: string
        code: string
      }

      enum Status {
        OK = 200,
        ERROR = 500,
        INVALID_REQUEST = 400,
        UNKNOWN_ERROR = 501
      }
    }

    // Coordinate Converter namespace
    namespace CoordinateConverter {
      /**
       * Convert TM128 coordinates to WGS84 LatLng
       */
      function fromTM128ToLatLng(tm128: Point): LatLng

      /**
       * Convert WGS84 LatLng to TM128 coordinates
       */
      function fromLatLngToTM128(latlng: LatLng): Point

      /**
       * Convert Web Mercator (EPSG:3857) to WGS84 LatLng
       */
      function fromEPSG3857ToLatLng(coord: Point): LatLng

      /**
       * Convert WGS84 LatLng to Web Mercator (EPSG:3857)
       */
      function fromLatLngToEPSG3857(latlng: LatLng): Point

      /**
       * Convert UTM-K coordinates to WGS84 LatLng
       */
      function fromUTMKToLatLng(utmk: Point): LatLng

      /**
       * Convert WGS84 LatLng to UTM-K coordinates
       */
      function fromLatLngToUTMK(latlng: LatLng): Point
    }

    // Projection system classes
    class Projection {
      /**
       * Get the default projection (EPSG:3857 - Web Mercator)
       */
      static getDefault(): EPSG3857

      /**
       * Get a projection by name
       */
      static get(name: string): Projection | null

      /**
       * Convert coordinate to pixel point
       */
      fromCoordToPoint(coord: LatLng): Point

      /**
       * Convert pixel point to coordinate
       */
      fromPointToCoord(point: Point): LatLng

      /**
       * Get the projection name
       */
      getProjectionName(): string

      /**
       * Calculate destination coordinate from angle and distance
       * @param coord Starting coordinate
       * @param angle Bearing in degrees
       * @param meter Distance in meters
       */
      getDestinationCoord(coord: LatLng, angle: number, meter: number): LatLng

      /**
       * Calculate distance between two coordinates in meters
       */
      getDistance(coord1: LatLng, coord2: LatLng): number
    }

    /**
     * Web Mercator projection (EPSG:3857)
     * Used by most web mapping services
     */
    class EPSG3857 extends Projection {
      constructor()
    }

    /**
     * WGS84 Geographic projection (EPSG:4326)
     * Standard GPS coordinate system
     */
    class EPSG4326 extends Projection {
      constructor()
    }

    /**
     * Korean UTM-K projection
     * Used in Korean mapping systems
     */
    class UTMK extends Projection {
      constructor()
    }

    /**
     * Korean TM128 projection
     * Legacy Korean coordinate system
     */
    class TM128 extends Projection {
      constructor()
    }

    // Animation utilities namespace
    namespace animation {
      interface AnimationOptions {
        duration?: number  // Animation duration in milliseconds
        easing?: EasingType
        callback?: () => void  // Called when animation completes
      }

      type EasingType = 'linear' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'

      /**
       * Animate panning to a location
       */
      function panTo(
        map: Map,
        coord: LatLng | LatLngLiteral,
        options?: AnimationOptions
      ): void

      /**
       * Animate zooming to a level
       */
      function zoomTo(
        map: Map,
        zoom: number,
        options?: AnimationOptions
      ): void

      /**
       * Animate fitting to bounds
       */
      function fitBounds(
        map: Map,
        bounds: LatLngBounds,
        options?: AnimationOptions & FitBoundsOptions
      ): void
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
      set(id: string, mapType: MapType): void
      get(id: string): MapType | null
      has(id: string): boolean
      delete(id: string): boolean
      clear(): void
      forEach(callback: (mapType: MapType, id: string) => void): void
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

// Export types for external use
export type NaverMap = naver.maps.Map
export type NaverLatLng = naver.maps.LatLng
export type NaverLatLngLiteral = naver.maps.LatLngLiteral
export type NaverLatLngBounds = naver.maps.LatLngBounds
export type NaverMarker = naver.maps.Marker
export type NaverPolyline = naver.maps.Polyline
export type NaverPolygon = naver.maps.Polygon
export type NaverCircle = naver.maps.Circle
export type NaverEllipse = naver.maps.Ellipse
export type NaverRectangle = naver.maps.Rectangle
export type NaverData = naver.maps.Data
export type NaverStrokeStyleType = naver.maps.StrokeStyleType
export type NaverStrokeLineCapType = naver.maps.StrokeLineCapType
export type NaverStrokeLineJoinType = naver.maps.StrokeLineJoinType
export type NaverGeoJsonObject = naver.maps.GeoJsonObject
export type NaverGeoJsonFeature = naver.maps.GeoJsonFeature
export type NaverGeoJsonFeatureCollection = naver.maps.GeoJsonFeatureCollection