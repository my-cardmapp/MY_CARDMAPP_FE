/**
 * Type guards for Naver Maps objects
 * These guards support both class instances and duck typing for flexibility
 * @module naver-maps-guards
 */

// Import types to ensure they are available
/// <reference path="./naver-map.d.ts" />

/**
 * Checks if the Naver Maps API is loaded and available
 * @returns {boolean} True if naver.maps namespace is available
 * @example
 * ```typescript
 * if (isNaverMapsAvailable()) {
 *   const map = new naver.maps.Map('map', options);
 * } else {
 *   console.error('Naver Maps API not loaded');
 * }
 * ```
 */
export function isNaverMapsAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.naver && 
         window.naver.maps !== undefined
}

/**
 * Type guard to check if an object is a LatLng instance
 * @param {any} obj - The object to check
 * @returns {obj is naver.maps.LatLng} True if obj is a LatLng
 * @example
 * ```typescript
 * const coord = getCoordinate();
 * if (isLatLng(coord)) {
 *   console.log('Latitude:', coord.lat());
 *   console.log('Longitude:', coord.lng());
 * }
 * ```
 */
export function isLatLng(obj: any): obj is naver.maps.LatLng {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.LatLng) {
    return true
  }
  
  // Duck typing: check for required methods
  return typeof obj.lat === 'function' && typeof obj.lng === 'function'
}

/**
 * Type guard to check if an object is a LatLngLiteral
 * @param {any} obj - The object to check
 * @returns {obj is naver.maps.LatLngLiteral} True if obj is a LatLngLiteral
 * @example
 * ```typescript
 * const position = { lat: 37.5, lng: 127 };
 * if (isLatLngLiteral(position)) {
 *   map.setCenter(position);
 * }
 * ```
 */
export function isLatLngLiteral(obj: any): obj is naver.maps.LatLngLiteral {
  if (!obj) return false
  
  return typeof obj === 'object' &&
         typeof obj.lat === 'number' &&
         typeof obj.lng === 'number'
}

/**
 * Type guard to check if an object is a Marker instance
 * @param {any} obj - The object to check
 * @returns {obj is naver.maps.Marker} True if obj is a Marker
 * @example
 * ```typescript
 * const overlay = getOverlay();
 * if (isMarker(overlay)) {
 *   overlay.setAnimation(naver.maps.Animation.BOUNCE);
 *   const position = overlay.getPosition();
 * }
 * ```
 */
export function isMarker(obj: any): obj is naver.maps.Marker {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Marker) {
    return true
  }
  
  // Duck typing
  return typeof obj.setMap === 'function' && 
         typeof obj.setPosition === 'function'
}

/**
 * Type guard to check if an object is a Map instance
 * @param {any} obj - The object to check
 * @returns {obj is naver.maps.Map} True if obj is a Map
 * @example
 * ```typescript
 * const element = getMapElement();
 * if (isMap(element)) {
 *   element.setZoom(10);
 *   element.panTo(new naver.maps.LatLng(37.5, 127));
 * }
 * ```
 */
export function isMap(obj: any): obj is naver.maps.Map {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Map) {
    return true
  }
  
  // Duck typing
  return typeof obj.setCenter === 'function' && 
         typeof obj.setZoom === 'function'
}

/**
 * Type guard to check if an object is an InfoWindow instance
 * @param {any} obj - The object to check
 * @returns {obj is naver.maps.InfoWindow} True if obj is an InfoWindow
 * @example
 * ```typescript
 * const popup = getPopup();
 * if (isInfoWindow(popup)) {
 *   popup.open(map, marker);
 *   popup.setContent('<div>Updated content</div>');
 * }
 * ```
 */
export function isInfoWindow(obj: any): obj is naver.maps.InfoWindow {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.InfoWindow) {
    return true
  }
  
  // Duck typing
  return typeof obj.open === 'function' && 
         typeof obj.close === 'function'
}

/**
 * Check if object is a Polyline instance
 */
export function isPolyline(obj: any): obj is naver.maps.Polyline {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Polyline) {
    return true
  }
  
  // Duck typing
  return typeof obj.getPath === 'function' && 
         typeof obj.setPath === 'function'
}

/**
 * Check if object is a Polygon instance
 */
export function isPolygon(obj: any): obj is naver.maps.Polygon {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Polygon) {
    return true
  }
  
  // Duck typing
  return typeof obj.getPaths === 'function' && 
         typeof obj.setPaths === 'function'
}

/**
 * Check if object is a Circle instance
 */
export function isCircle(obj: any): obj is naver.maps.Circle {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Circle) {
    return true
  }
  
  // Duck typing
  return typeof obj.getCenter === 'function' && 
         typeof obj.setCenter === 'function' &&
         typeof obj.getRadius === 'function' &&
         typeof obj.setRadius === 'function'
}

/**
 * Check if object is a Rectangle instance
 */
export function isRectangle(obj: any): obj is naver.maps.Rectangle {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Rectangle) {
    return true
  }
  
  // Duck typing
  return typeof obj.getBounds === 'function' && 
         typeof obj.setBounds === 'function'
}

/**
 * Check if object is an Ellipse instance
 */
export function isEllipse(obj: any): obj is naver.maps.Ellipse {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Ellipse) {
    return true
  }
  
  // Duck typing
  return typeof obj.getCenter === 'function' && 
         typeof obj.setCenter === 'function' &&
         typeof obj.getRadiusX === 'function' &&
         typeof obj.getRadiusY === 'function'
}

/**
 * Check if object is a Point instance
 */
export function isPoint(obj: any): obj is naver.maps.Point {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Point) {
    return true
  }
  
  // Duck typing
  return typeof obj === 'object' &&
         typeof obj.x === 'number' &&
         typeof obj.y === 'number'
}

/**
 * Check if object is a Size instance
 */
export function isSize(obj: any): obj is naver.maps.Size {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Size) {
    return true
  }
  
  // Duck typing
  return typeof obj === 'object' &&
         typeof obj.width === 'number' &&
         typeof obj.height === 'number'
}

/**
 * Check if object is a Bounds instance
 */
export function isBounds(obj: any): obj is naver.maps.Bounds {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Bounds) {
    return true
  }
  
  // Duck typing
  return typeof obj.getMin === 'function' && 
         typeof obj.getMax === 'function'
}

/**
 * Check if object is a LatLngBounds instance
 */
export function isLatLngBounds(obj: any): obj is naver.maps.LatLngBounds {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.LatLngBounds) {
    return true
  }
  
  // Duck typing
  return typeof obj.getSouthWest === 'function' && 
         typeof obj.getNorthEast === 'function'
}

/**
 * Check if object is an OverlayView instance
 */
export function isOverlayView(obj: any): obj is naver.maps.OverlayView {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.OverlayView) {
    return true
  }
  
  // Duck typing
  return typeof obj.setMap === 'function' && 
         typeof obj.getMap === 'function' &&
         typeof obj.onAdd === 'function' &&
         typeof obj.draw === 'function'
}

/**
 * Check if object is a KVO instance
 */
export function isKVO(obj: any): obj is naver.maps.KVO {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.KVO) {
    return true
  }
  
  // Duck typing
  return typeof obj.get === 'function' && 
         typeof obj.set === 'function' &&
         typeof obj.setValues === 'function' &&
         typeof obj.bindTo === 'function' &&
         typeof obj.unbind === 'function' &&
         typeof obj.unbindAll === 'function'
}

/**
 * Check if object is a CustomControl instance
 */
export function isCustomControl(obj: any): obj is naver.maps.CustomControl {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.CustomControl) {
    return true
  }
  
  // Duck typing
  return typeof obj.setMap === 'function' && 
         typeof obj.getElement === 'function'
}

/**
 * Check if object is a Data instance
 */
export function isData(obj: any): obj is naver.maps.Data {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Data) {
    return true
  }
  
  // Duck typing
  return typeof obj.add === 'function' && 
         typeof obj.addGeoJson === 'function' &&
         typeof obj.remove === 'function' &&
         typeof obj.forEach === 'function'
}

/**
 * Check if object is a GroundOverlay instance
 */
export function isGroundOverlay(obj: any): obj is naver.maps.GroundOverlay {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.GroundOverlay) {
    return true
  }
  
  // Duck typing
  return typeof obj.setUrl === 'function' && 
         typeof obj.getUrl === 'function' &&
         typeof obj.setBounds === 'function' &&
         typeof obj.getBounds === 'function'
}

/**
 * Check if object is a MapTypeRegistry instance
 */
export function isMapTypeRegistry(obj: any): obj is naver.maps.MapTypeRegistry {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.MapTypeRegistry) {
    return true
  }
  
  // Duck typing
  return typeof obj.set === 'function' && 
         typeof obj.get === 'function' &&
         typeof obj.has === 'function' &&
         typeof obj.delete === 'function' &&
         typeof obj.clear === 'function' &&
         typeof obj.forEach === 'function'
}

/**
 * Check if object is a Projection instance
 */
export function isProjection(obj: any): obj is naver.maps.Projection {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.Projection) {
    return true
  }
  
  // Duck typing
  return typeof obj.fromCoordToPoint === 'function' && 
         typeof obj.fromPointToCoord === 'function' &&
         typeof obj.getProjectionName === 'function' &&
         typeof obj.getDestinationCoord === 'function' &&
         typeof obj.getDistance === 'function'
}

/**
 * Check if object is a MarkerClustering instance
 */
export function isMarkerClustering(obj: any): obj is naver.maps.MarkerClustering {
  if (!obj) return false
  
  // Check for class instance
  if (isNaverMapsAvailable() && obj instanceof window.naver.maps.MarkerClustering) {
    return true
  }
  
  // Duck typing
  return typeof obj.setMap === 'function' && 
         typeof obj.getMap === 'function' &&
         typeof obj.addMarker === 'function' &&
         typeof obj.addMarkers === 'function' &&
         typeof obj.removeMarker === 'function' &&
         typeof obj.clearMarkers === 'function' &&
         typeof obj.redraw === 'function'
}

/**
 * Checks if a value is a valid Position constant for control placement
 * @param {any} value - The value to check
 * @returns {value is number} True if value is a valid position (0-12)
 * @example
 * ```typescript
 * const position = naver.maps.Position.TOP_RIGHT;
 * if (isValidPosition(position)) {
 *   control.setPosition(position);
 * }
 * ```
 */
export function isValidPosition(value: any): value is number {
  if (typeof value !== 'number') return false
  return value >= 0 && value <= 12
}

/**
 * Checks if a value is a valid Animation constant for markers
 * @param {any} value - The value to check
 * @returns {value is naver.maps.Animation} True if value is BOUNCE (1) or DROP (2)
 * @example
 * ```typescript
 * const animation = naver.maps.Animation.BOUNCE;
 * if (isValidAnimation(animation)) {
 *   marker.setAnimation(animation);
 * }
 * ```
 */
export function isValidAnimation(value: any): value is naver.maps.Animation {
  return value === 1 || value === 2 // BOUNCE or DROP
}

/**
 * Checks if a string is a valid stroke style type
 * @param {any} style - The style to check
 * @returns {style is naver.maps.StrokeStyleType} True if style is valid
 * @example
 * ```typescript
 * const style = 'dash';
 * if (isValidStrokeStyle(style)) {
 *   polyline.setOptions({ strokeStyle: style });
 * }
 * ```
 */
export function isValidStrokeStyle(style: any): style is naver.maps.StrokeStyleType {
  if (typeof style !== 'string') return false
  
  const validStyles = [
    'solid', 'shortdash', 'shortdot', 'shortdashdot', 
    'shortdashdotdot', 'dot', 'dash', 'dashdot', 'longdash', 
    'longdashdot', 'longdashdotdot'
  ]
  
  return validStyles.includes(style)
}

/**
 * Check if string is a valid StrokeLineCapType
 */
export function isValidStrokeLineCap(cap: any): cap is naver.maps.StrokeLineCapType {
  if (typeof cap !== 'string') return false
  return ['butt', 'round', 'square'].includes(cap)
}

/**
 * Check if string is a valid StrokeLineJoinType
 */
export function isValidStrokeLineJoin(join: any): join is naver.maps.StrokeLineJoinType {
  if (typeof join !== 'string') return false
  return ['miter', 'round', 'bevel'].includes(join)
}

/**
 * Check if string is a valid PointingIcon
 */
export function isValidPointingIcon(icon: any): icon is naver.maps.PointingIcon {
  if (typeof icon !== 'string') return false
  return ['circle', 'arrow', 'openarrow', 'blockarrow'].includes(icon)
}

/**
 * Check if object is a valid GeocodeOptions
 */
export function isGeocodeOptions(obj: any): obj is naver.maps.Service.GeocodeOptions {
  if (!obj || typeof obj !== 'object') return false
  
  // query is required
  if (typeof obj.query !== 'string') return false
  
  // Optional fields
  if (obj.coordinate && !isLatLng(obj.coordinate) && !isLatLngLiteral(obj.coordinate)) {
    return false
  }
  
  if (obj.filter && !['HCODE', 'BCODE'].includes(obj.filter)) {
    return false
  }
  
  if (obj.page !== undefined && typeof obj.page !== 'number') {
    return false
  }
  
  if (obj.count !== undefined && typeof obj.count !== 'number') {
    return false
  }
  
  return true
}

/**
 * Check if object is a valid ReverseGeocodeOptions
 */
export function isReverseGeocodeOptions(obj: any): obj is naver.maps.Service.ReverseGeocodeOptions {
  if (!obj || typeof obj !== 'object') return false
  
  // coords is required - can be LatLng, LatLngLiteral or string
  if (!obj.coords) return false
  
  if (typeof obj.coords === 'string') {
    // Check if it's a valid coordinate string format "lng,lat"
    if (!/^\d+\.?\d*,\d+\.?\d*$/.test(obj.coords)) {
      return false
    }
  } else if (!isLatLng(obj.coords) && !isLatLngLiteral(obj.coords)) {
    return false
  }
  
  // Optional fields
  if (obj.orders !== undefined && typeof obj.orders !== 'string') {
    return false
  }
  
  if (obj.output !== undefined && !['json', 'xml'].includes(obj.output)) {
    return false
  }
  
  return true
}

/**
 * Check if value is a valid Service Status
 */
export function isServiceStatus(value: any): value is naver.maps.Service.Status {
  return [200, 400, 500, 501].includes(value)
}

/**
 * Check if object is a valid AnimationOptions
 */
export function isAnimationOptions(obj: any): obj is naver.maps.animation.AnimationOptions {
  if (!obj || typeof obj !== 'object') return false
  
  // All fields are optional
  if (obj.duration !== undefined && typeof obj.duration !== 'number') {
    return false
  }
  
  if (obj.easing !== undefined) {
    const validEasings = ['linear', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic']
    if (!validEasings.includes(obj.easing)) {
      return false
    }
  }
  
  if (obj.callback !== undefined && typeof obj.callback !== 'function') {
    return false
  }
  
  return true
}

/**
 * Check if object is a valid GeoJsonObject
 */
export function isGeoJsonObject(obj: any): obj is naver.maps.GeoJsonObject {
  if (!obj || typeof obj !== 'object') return false
  if (!obj.type) return false
  
  const validTypes = [
    'Feature', 'FeatureCollection', 'Point', 'LineString', 
    'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 
    'GeometryCollection'
  ]
  
  return validTypes.includes(obj.type)
}

/**
 * Check if object is a valid MapEvent
 */
export function isMapEvent(obj: any): obj is naver.maps.MapEvent {
  // MapEvent is a base interface, so we just check if it's an object
  return obj && typeof obj === 'object'
}

/**
 * Check if object is a valid PointerEvent
 */
export function isPointerEvent(obj: any): obj is naver.maps.PointerEvent {
  if (!isMapEvent(obj)) return false
  
  return isLatLng(obj.coord) &&
         isPoint(obj.point) &&
         isPoint(obj.offset) &&
         ['mouse', 'touch', 'pen'].includes(obj.pointerType)
}

/**
 * Validates that latitude and longitude values are within valid ranges
 * @param {any} lat - The latitude value to check
 * @param {any} lng - The longitude value to check
 * @returns {boolean} True if both values are valid coordinates
 * @example
 * ```typescript
 * const lat = 37.5666805;
 * const lng = 126.9784147;
 * if (isValidCoordinate(lat, lng)) {
 *   const coord = new naver.maps.LatLng(lat, lng);
 * } else {
 *   console.error('Invalid coordinates');
 * }
 * ```
 */
export function isValidCoordinate(lat: any, lng: any): boolean {
  return typeof lat === 'number' && 
         typeof lng === 'number' &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180
}

/**
 * Validates that a zoom level is within the valid range (0-21)
 * @param {any} zoom - The zoom level to check
 * @returns {boolean} True if zoom is a valid level
 * @example
 * ```typescript
 * const zoom = 15;
 * if (isValidZoom(zoom)) {
 *   map.setZoom(zoom);
 * } else {
 *   console.error('Invalid zoom level');
 * }
 * ```
 */
export function isValidZoom(zoom: any): boolean {
  return typeof zoom === 'number' && zoom >= 0 && zoom <= 21
}