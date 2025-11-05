/**
 * IntelliSense Test File
 * This file tests that all JSDoc comments are properly displayed in IntelliSense
 */

/// <reference path="./naver-map.d.ts" />

// Test 1: Map class should show JSDoc
const testMap = () => {
  // Hover over 'Map' to see:
  // "The main map class that displays Naver Maps"
  const map = new naver.maps.Map('map', {
    // Hover over 'center' to see documentation
    center: new naver.maps.LatLng(37.5, 127),
    // Hover over 'zoom' to see documentation
    zoom: 10
  });

  // Method documentation should appear
  map.setCenter(new naver.maps.LatLng(37.6, 127.1));
  map.setZoom(12);
  
  return map;
};

// Test 2: Marker class should show JSDoc  
const testMarker = () => {
  // Hover over 'Marker' to see:
  // "Represents a marker on the map"
  const marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.5, 127),
    // Animation constants should show documentation
    animation: naver.maps.Animation.BOUNCE
  });
  
  return marker;
};

// Test 3: InfoWindow should show JSDoc
const testInfoWindow = () => {
  // Hover over 'InfoWindow' to see:
  // "Represents an information window that can be attached to a map or marker"
  const infoWindow = new naver.maps.InfoWindow({
    content: '<div>Test</div>',
    // Each option should show its documentation
    maxWidth: 300,
    anchorSkew: true,
    borderColor: '#333'
  });
  
  return infoWindow;
};

// Test 4: Event class static methods
const testEvents = () => {
  // Hover over 'addListener' to see full documentation
  const listener = naver.maps.Event.addListener(
    {} as any,
    'click',
    (e) => {
      console.log(e);
    }
  );
  
  // Hover over 'once' to see:
  // "Adds a one-time event listener that will be automatically removed after firing"
  naver.maps.Event.once(
    {} as any,
    'idle',
    () => console.log('Idle')
  );
};

// Test 5: Service namespace
const testService = () => {
  // Hover over 'geocode' to see documentation
  naver.maps.Service.geocode({
    query: '서울시청'
  }, (status, response) => {
    // Status enum should show documentation
    if (status === naver.maps.Service.Status.OK) {
      console.log(response);
    }
  });
};

// Test 6: Position constants
const testConstants = () => {
  // Hover over Position to see:
  // "Position constants for control placement on the map"
  const position = naver.maps.Position.TOP_RIGHT;
  
  // Animation constants documentation
  const animation = naver.maps.Animation.DROP;
  
  return { position, animation };
};

// Test 7: Data layer
const testDataLayer = () => {
  // Hover over 'Data' to see:
  // "Data layer for managing and displaying GeoJSON features"
  const dataLayer = new naver.maps.Data();
  
  // Method documentation
  dataLayer.addGeoJson({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [127, 37.5]
    },
    properties: {}
  });
  
  return dataLayer;
};

// Test 8: KVO and KVOArray
const testKVO = () => {
  // Hover over methods to see documentation
  const kvo = new naver.maps.KVO<{ zoom: number }>();
  kvo.set('zoom', 10);
  const zoom = kvo.get('zoom');
  
  // KVOArray documentation
  const array = new naver.maps.KVOArray<any>();
  array.push({});
  array.getLength();
  
  return { kvo, array };
};

// Test 9: Projection
const testProjection = () => {
  // Hover over 'Projection' to see:
  // "Base class for map projections"
  const projection = naver.maps.Projection.getDefault();
  
  // Method documentation
  const distance = projection.getDistance(
    new naver.maps.LatLng(37.5, 127),
    new naver.maps.LatLng(37.6, 127.1)
  );
  
  return distance;
};

// Test 10: Type exports
import type { 
  NaverMap,
  NaverMarker,
  NaverInfoWindow,
  NaverLatLng
} from './naver-map';

const testExports = (map: NaverMap) => {
  // These should all have proper type checking
  const marker: NaverMarker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.5, 127),
    map: map
  });
  
  const infoWindow: NaverInfoWindow = new naver.maps.InfoWindow({
    content: 'Test'
  });
  
  return { marker, infoWindow };
};

// Export functions for testing
export {
  testMap,
  testMarker,
  testInfoWindow,
  testEvents,
  testService,
  testConstants,
  testDataLayer,
  testKVO,
  testProjection,
  testExports
};