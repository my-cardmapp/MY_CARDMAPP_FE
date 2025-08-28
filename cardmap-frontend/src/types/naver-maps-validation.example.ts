/**
 * Naver Maps Type Validation Examples
 * This file demonstrates all APIs with IntelliSense support
 * @file naver-maps-validation.example.ts
 */

/// <reference path="./naver-map.d.ts" />

import type { 
  NaverMap, 
  NaverLatLng, 
  NaverMarker,
  NaverPolyline,
  NaverCircle,
  NaverInfoWindow,
  NaverData
} from './naver-map'

import {
  isNaverMapsAvailable,
  isLatLng,
  isLatLngLiteral,
  isMarker,
  isMap,
  isValidPosition,
  isValidAnimation,
  isValidStrokeStyle,
  isValidCoordinate,
  isValidZoom
} from './naver-maps-guards'

/**
 * Example 1: Map Creation with Full Options
 * Demonstrates map initialization with comprehensive options
 */
function createMapExample() {
  if (!isNaverMapsAvailable()) {
    console.error('Naver Maps not loaded');
    return;
  }

  // Create map with all options - IntelliSense should show all properties
  const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5666805, 126.9784147),
    zoom: 10,
    mapTypeId: naver.maps.MapTypeId.NORMAL,
    mapTypeControl: true,
    mapTypeControlOptions: {
      position: naver.maps.Position.TOP_RIGHT,
      style: naver.maps.MapTypeControlStyle.DROPDOWN,
      mapTypeIds: [
        naver.maps.MapTypeId.NORMAL,
        naver.maps.MapTypeId.SATELLITE,
        naver.maps.MapTypeId.HYBRID
      ]
    },
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_LEFT,
      style: naver.maps.ZoomControlStyle.LARGE,
      legendDisabled: false
    },
    scaleControl: true,
    scaleControlOptions: {
      position: naver.maps.Position.BOTTOM_RIGHT
    },
    logoControl: false,
    minZoom: 6,
    maxZoom: 18,
    draggable: true,
    scrollWheel: true,
    disableDoubleClickZoom: false,
    disableKineticPan: false
  });

  // Test map methods - IntelliSense should show all available methods
  map.setCenter(new naver.maps.LatLng(37.5, 127));
  map.setZoom(12);
  map.panTo(new naver.maps.LatLng(37.6, 127.1), {
    duration: 500,
    easing: 'easeInOutCubic'
  });
  
  const bounds = new naver.maps.LatLngBounds(
    new naver.maps.LatLng(37.4, 126.9),
    new naver.maps.LatLng(37.7, 127.2)
  );
  map.fitBounds(bounds, {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
    maxZoom: 15
  });

  return map;
}

/**
 * Example 2: Marker Creation with All Icon Types
 * Demonstrates different marker icon configurations
 */
function createMarkerExamples(map: naver.maps.Map) {
  // Image Icon Marker
  const imageMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.5, 127),
    map: map,
    title: 'Image Icon Marker',
    icon: {
      url: '/marker-icon.png',
      size: new naver.maps.Size(50, 52),
      scaledSize: new naver.maps.Size(50, 52),
      origin: new naver.maps.Point(0, 0),
      anchor: new naver.maps.Point(25, 52)
    },
    animation: naver.maps.Animation.DROP,
    draggable: true,
    clickable: true,
    cursor: 'pointer',
    zIndex: 100
  });

  // Symbol Icon Marker
  const symbolMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.51, 127.01),
    map: map,
    icon: {
      path: naver.maps.SymbolPath.CIRCLE,
      fillColor: '#FF0000',
      fillOpacity: 0.8,
      strokeColor: '#000000',
      strokeWeight: 2,
      strokeOpacity: 1,
      scale: 10,
      anchor: new naver.maps.Point(5, 5)
    }
  });

  // HTML Icon Marker
  const htmlMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.52, 127.02),
    map: map,
    icon: {
      content: '<div style="padding:5px;background:blue;color:white;">HTML</div>',
      size: new naver.maps.Size(50, 30),
      anchor: new naver.maps.Point(25, 15)
    }
  });

  // Test marker methods
  imageMarker.setAnimation(naver.maps.Animation.BOUNCE);
  symbolMarker.setDraggable(false);
  htmlMarker.setVisible(true);
  
  return { imageMarker, symbolMarker, htmlMarker };
}

/**
 * Example 3: InfoWindow with Custom Styling
 * Demonstrates InfoWindow creation and manipulation
 */
function createInfoWindowExample(map: naver.maps.Map, marker: naver.maps.Marker) {
  const infoWindow = new naver.maps.InfoWindow({
    content: `
      <div style="padding: 20px; max-width: 300px;">
        <h3>Custom InfoWindow</h3>
        <p>This demonstrates all InfoWindow options</p>
        <button onclick="alert('Clicked!')">Click Me</button>
      </div>
    `,
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderColor: '#2196F3',
    borderWidth: 3,
    anchorSize: new naver.maps.Size(30, 30),
    anchorSkew: true,
    anchorColor: '#2196F3',
    pixelOffset: new naver.maps.Point(0, -10),
    zIndex: 1000,
    disableAutoPan: false
  });

  // Open at marker
  infoWindow.open(map, marker);

  // Test InfoWindow methods
  setTimeout(() => {
    infoWindow.setContent('<div>Updated Content</div>');
    infoWindow.setPosition(new naver.maps.LatLng(37.55, 127.05));
    infoWindow.setZIndex(2000);
  }, 3000);

  return infoWindow;
}

/**
 * Example 4: Shape Overlays
 * Demonstrates all shape overlay types
 */
function createShapeOverlays(map: naver.maps.Map) {
  // Polyline
  const polyline = new naver.maps.Polyline({
    map: map,
    path: [
      new naver.maps.LatLng(37.5, 127),
      new naver.maps.LatLng(37.51, 127.01),
      new naver.maps.LatLng(37.52, 127.02)
    ],
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 5,
    strokeStyle: 'dash',
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    startIcon: 'circle',
    startIconSize: 10,
    endIcon: 'arrow',
    endIconSize: 15
  });

  // Polygon with hole
  const polygon = new naver.maps.Polygon({
    map: map,
    paths: [
      // Outer ring
      [
        new naver.maps.LatLng(37.53, 127.03),
        new naver.maps.LatLng(37.54, 127.03),
        new naver.maps.LatLng(37.54, 127.04),
        new naver.maps.LatLng(37.53, 127.04)
      ],
      // Inner hole
      [
        new naver.maps.LatLng(37.535, 127.035),
        new naver.maps.LatLng(37.536, 127.035),
        new naver.maps.LatLng(37.536, 127.036),
        new naver.maps.LatLng(37.535, 127.036)
      ]
    ],
    fillColor: '#00FF00',
    fillOpacity: 0.3,
    strokeColor: '#00FF00',
    strokeWeight: 2
  });

  // Circle
  const circle = new naver.maps.Circle({
    map: map,
    center: new naver.maps.LatLng(37.55, 127.05),
    radius: 500, // 500 meters
    fillColor: '#0000FF',
    fillOpacity: 0.2,
    strokeColor: '#0000FF',
    strokeWeight: 3,
    strokeStyle: 'shortdot'
  });

  // Rectangle
  const rectangle = new naver.maps.Rectangle({
    map: map,
    bounds: new naver.maps.LatLngBounds(
      new naver.maps.LatLng(37.56, 127.06),
      new naver.maps.LatLng(37.57, 127.07)
    ),
    fillColor: '#FFFF00',
    fillOpacity: 0.4,
    strokeColor: '#FFFF00',
    strokeWeight: 2
  });

  // Ellipse
  const ellipse = new naver.maps.Ellipse({
    map: map,
    center: new naver.maps.LatLng(37.58, 127.08),
    radiusX: 1000, // 1000 meters horizontal
    radiusY: 500,  // 500 meters vertical
    fillColor: '#FF00FF',
    fillOpacity: 0.3,
    strokeColor: '#FF00FF',
    strokeWeight: 2
  });

  return { polyline, polygon, circle, rectangle, ellipse };
}

/**
 * Example 5: Event Handling with Type Safety
 * Demonstrates typed event listeners
 */
function setupEventHandlers(map: naver.maps.Map) {
  // Map events
  const clickListener = naver.maps.Event.addListener(map, 'click', (e) => {
    // e should be typed as PointerEvent
    console.log('Map clicked at:', e.coord.lat(), e.coord.lng());
    console.log('Pixel position:', e.point.x, e.point.y);
    console.log('Pointer type:', e.pointerType);
  });

  const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', (e) => {
    // e should be typed as MapEvent
    console.log('Zoom changed to:', map.getZoom());
  });

  const boundsListener = naver.maps.Event.addListener(map, 'bounds_changed', (e) => {
    const bounds = map.getBounds();
    console.log('Bounds changed:', bounds.toString());
  });

  // One-time listener
  naver.maps.Event.once(map, 'idle', (e) => {
    console.log('Map is now idle (fired once)');
  });

  // DOM event
  const button = document.getElementById('myButton');
  if (button) {
    const domListener = naver.maps.Event.addDOMListener(button, 'click', (e) => {
      console.log('Button clicked:', e.domEvent);
    });
  }

  // Clean up
  setTimeout(() => {
    naver.maps.Event.removeListener(clickListener);
    naver.maps.Event.clearListeners(map, 'zoom_changed');
  }, 10000);
}

/**
 * Example 6: Data Layer and GeoJSON
 * Demonstrates Data layer usage with GeoJSON
 */
function createDataLayer(map: naver.maps.Map) {
  const dataLayer = new naver.maps.Data();

  // Add GeoJSON features
  const features = dataLayer.addGeoJson({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [127.1, 37.6]
        },
        properties: {
          name: 'Seoul Station',
          category: 'transit'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [127.1, 37.6],
            [127.11, 37.61],
            [127.12, 37.62]
          ]
        },
        properties: {
          name: 'Route 1',
          type: 'subway'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [127.13, 37.63],
            [127.14, 37.63],
            [127.14, 37.64],
            [127.13, 37.64],
            [127.13, 37.63]
          ]]
        },
        properties: {
          name: 'Park Area',
          type: 'park'
        }
      }
    ]
  });

  // Set style function
  dataLayer.setStyle((feature) => {
    const type = feature.getProperty('type');
    
    switch (type) {
      case 'transit':
        return {
          icon: {
            url: '/transit-icon.png',
            scaledSize: new naver.maps.Size(30, 30)
          }
        };
      case 'subway':
        return {
          strokeColor: '#FF5722',
          strokeWeight: 4
        };
      case 'park':
        return {
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
          strokeColor: '#2E7D32',
          strokeWeight: 2
        };
      default:
        return {};
    }
  });

  // Override style for a specific feature
  if (features.length > 0) {
    dataLayer.overrideStyle(features[0], {
      icon: {
        url: '/special-icon.png',
        scaledSize: new naver.maps.Size(40, 40)
      }
    });
  }

  // Attach to map
  dataLayer.setMap(map);

  // Load external GeoJSON
  dataLayer.loadGeoJson('/data/districts.geojson', {}, (loadedFeatures) => {
    console.log('Loaded features:', loadedFeatures.length);
  });

  return dataLayer;
}

/**
 * Example 7: Custom Controls
 * Demonstrates custom control creation
 */
function createCustomControls(map: naver.maps.Map) {
  // Create custom zoom control
  const customZoom = new naver.maps.CustomControl(`
    <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
      <button id="zoom-in" style="display: block; margin-bottom: 5px;">+</button>
      <button id="zoom-out" style="display: block;">−</button>
    </div>
  `, {
    position: naver.maps.Position.RIGHT_CENTER
  });

  customZoom.setMap(map);

  // Add functionality after control is added
  const element = customZoom.getElement();
  const zoomIn = element.querySelector('#zoom-in') as HTMLButtonElement;
  const zoomOut = element.querySelector('#zoom-out') as HTMLButtonElement;

  if (zoomIn && zoomOut) {
    zoomIn.addEventListener('click', () => {
      map.setZoom(map.getZoom() + 1);
    });
    zoomOut.addEventListener('click', () => {
      map.setZoom(map.getZoom() - 1);
    });
  }

  // Create location control
  const locationControl = new naver.maps.CustomControl(`
    <button style="background: white; padding: 10px; border: none; cursor: pointer;">
      📍 My Location
    </button>
  `, {
    position: naver.maps.Position.TOP_LEFT
  });

  locationControl.setMap(map);

  return { customZoom, locationControl };
}

/**
 * Example 8: Geocoding Services
 * Demonstrates geocoding and reverse geocoding
 */
function geocodingExamples() {
  // Geocode an address
  naver.maps.Service.geocode({
    query: '서울특별시 중구 세종대로 110',
    coordinate: new naver.maps.LatLng(37.5, 127), // Optional: search near this point
    filter: 'HCODE',
    page: 1,
    count: 10
  }, (status, response) => {
    if (status === naver.maps.Service.Status.OK) {
      const addresses = response.v2.addresses;
      addresses.forEach(addr => {
        console.log('Address found:', addr.roadAddress);
        console.log('Coordinates:', addr.x, addr.y);
        
        // Create marker at geocoded location
        const position = new naver.maps.LatLng(
          parseFloat(addr.y),
          parseFloat(addr.x)
        );
        // Note: 'map' variable should be passed as parameter to this function
        // new naver.maps.Marker({
        //   position: position,
        //   map: map
        // });
      });
    } else {
      console.error('Geocoding failed:', status);
    }
  });

  // Reverse geocode coordinates
  naver.maps.Service.reverseGeocode({
    coords: new naver.maps.LatLng(37.5666805, 126.9784147),
    orders: 'roadaddr,addr',
    output: 'json'
  }, (status, response) => {
    if (status === naver.maps.Service.Status.OK) {
      const results = response.v2.results;
      results.forEach(result => {
        console.log('Location name:', result.name);
        console.log('Region:', result.region.area1.name, result.region.area2?.name);
        if (result.land) {
          console.log('Land info:', result.land.name);
        }
      });
    }
  });
}

/**
 * Example 9: Projection and Coordinate Conversion
 * Demonstrates projection systems and conversions
 */
function projectionExamples() {
  // Get default projection (Web Mercator)
  const projection = naver.maps.Projection.getDefault();
  console.log('Default projection:', projection.getProjectionName());

  // Convert between coordinate systems
  const wgs84 = new naver.maps.LatLng(37.5666805, 126.9784147);
  
  // To pixel point
  const pixel = projection.fromCoordToPoint(wgs84);
  console.log('Pixel coordinates:', pixel.x, pixel.y);
  
  // Back to coordinate
  const backToCoord = projection.fromPointToCoord(pixel);
  console.log('Back to WGS84:', backToCoord.lat(), backToCoord.lng());

  // Calculate distance
  const coord1 = new naver.maps.LatLng(37.5, 127);
  const coord2 = new naver.maps.LatLng(37.6, 127.1);
  const distance = projection.getDistance(coord1, coord2);
  console.log('Distance:', distance, 'meters');

  // Calculate destination point
  const destination = projection.getDestinationCoord(coord1, 45, 1000); // 45 degrees, 1000 meters
  console.log('Destination:', destination.lat(), destination.lng());

  // Coordinate system conversions
  const tm128 = naver.maps.CoordinateConverter.fromLatLngToTM128(wgs84);
  console.log('TM128:', tm128.x, tm128.y);

  const epsg3857 = naver.maps.CoordinateConverter.fromLatLngToEPSG3857(wgs84);
  console.log('Web Mercator:', epsg3857.x, epsg3857.y);

  const utmk = naver.maps.CoordinateConverter.fromLatLngToUTMK(wgs84);
  console.log('UTM-K:', utmk.x, utmk.y);
}

/**
 * Example 10: Type Guards Usage
 * Demonstrates all type guard functions
 */
function typeGuardExamples() {
  const unknownObject: any = getUnknownObject();

  // Check if Naver Maps is available
  if (!isNaverMapsAvailable()) {
    console.error('Naver Maps API not loaded');
    return;
  }

  // Check coordinates
  if (isLatLng(unknownObject)) {
    console.log('Is LatLng, lat:', unknownObject.lat());
  } else if (isLatLngLiteral(unknownObject)) {
    console.log('Is LatLngLiteral, lat:', unknownObject.lat);
  }

  // Check overlays
  if (isMarker(unknownObject)) {
    unknownObject.setAnimation(naver.maps.Animation.BOUNCE);
  }

  if (isMap(unknownObject)) {
    unknownObject.setZoom(10);
  }

  // Validate values
  const position = 3;
  if (isValidPosition(position)) {
    console.log('Valid position constant');
  }

  const animation = 1;
  if (isValidAnimation(animation)) {
    console.log('Valid animation constant');
  }

  const strokeStyle = 'dash';
  if (isValidStrokeStyle(strokeStyle)) {
    console.log('Valid stroke style');
  }

  const lat = 37.5;
  const lng = 127;
  if (isValidCoordinate(lat, lng)) {
    console.log('Valid coordinates');
  }

  const zoom = 15;
  if (isValidZoom(zoom)) {
    console.log('Valid zoom level');
  }
}

// Helper function for type guard example
function getUnknownObject(): any {
  return new naver.maps.LatLng(37.5, 127);
}

/**
 * Main function to run all examples
 */
export function runAllExamples() {
  // Create map
  const map = createMapExample();
  if (!map) return;

  // Create markers
  const { imageMarker } = createMarkerExamples(map);

  // Create info window
  createInfoWindowExample(map, imageMarker);

  // Create shape overlays
  createShapeOverlays(map);

  // Setup event handlers
  setupEventHandlers(map);

  // Create data layer
  createDataLayer(map);

  // Create custom controls
  createCustomControls(map);

  // Run geocoding examples
  geocodingExamples();

  // Run projection examples
  projectionExamples();

  // Run type guard examples
  typeGuardExamples();

  console.log('All examples executed successfully!');
}

// Export for testing
export {
  createMapExample,
  createMarkerExamples,
  createInfoWindowExample,
  createShapeOverlays,
  setupEventHandlers,
  createDataLayer,
  createCustomControls,
  geocodingExamples,
  projectionExamples,
  typeGuardExamples
};