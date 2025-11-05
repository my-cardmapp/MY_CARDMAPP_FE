# Naver Maps TypeScript Type Definitions

## Overview

This directory contains comprehensive TypeScript type definitions for the Naver Maps API v3 with full JSDoc documentation for IntelliSense support.

## Files

- **`naver-map.d.ts`** - Main type definitions with complete JSDoc documentation
- **`naver-maps-guards.ts`** - Runtime type guards for safe type checking
- **`naver-maps-validation.example.ts`** - Comprehensive examples of all APIs
- **`test-intellisense.ts`** - IntelliSense validation test file

## Features

### ✅ Complete Type Coverage
- All core classes (Map, Marker, InfoWindow, etc.)
- All overlay types (Polyline, Polygon, Circle, Rectangle, Ellipse)
- Event system with typed event maps
- Service utilities (Geocoding, Reverse Geocoding)
- Projection and coordinate conversion
- Data layer with GeoJSON support
- Custom controls
- Marker clustering

### ✅ Comprehensive JSDoc Documentation
Every class, interface, method, and property includes:
- **Description** - Clear explanation of purpose
- **@param** tags - Parameter types and descriptions
- **@returns** tags - Return type information
- **@example** blocks - Usage examples
- **@throws** tags - Error conditions (where applicable)
- **@default** values - Default parameter values

### ✅ Type Guards
Safe runtime type checking with support for:
- Class instance checking
- Duck typing for flexibility
- Validation utilities

## IntelliSense Features

When you hover over any Naver Maps API element in your IDE, you'll see:

1. **Class Descriptions**
   ```typescript
   // Hover over 'Map' shows:
   // "The main map class that displays Naver Maps"
   const map = new naver.maps.Map(element, options);
   ```

2. **Method Documentation**
   ```typescript
   // Hover over 'setCenter' shows:
   // "Sets the center position of the map
   // @param latlng - The new center position"
   map.setCenter(latlng);
   ```

3. **Property Documentation**
   ```typescript
   // Hover over options shows documentation for each property
   const options: InfoWindowOptions = {
     content: '<div>Hello</div>',  // "The content to display..."
     maxWidth: 300,                // "Maximum width in pixels (0 = no limit)"
     anchorSkew: true              // "Enable skew effect on speech bubble tail..."
   };
   ```

4. **Example Code**
   ```typescript
   // Most items include examples in their documentation
   // These appear in IntelliSense hover tooltips
   ```

## Usage

### Basic Setup

```typescript
/// <reference path="./types/naver-map.d.ts" />

// Now you have full type support
const map = new naver.maps.Map('map', {
  center: new naver.maps.LatLng(37.5666805, 126.9784147),
  zoom: 10
});
```

### Using Type Guards

```typescript
import { isLatLng, isMarker, isValidZoom } from './types/naver-maps-guards';

// Safe type checking
if (isLatLng(coord)) {
  console.log(coord.lat(), coord.lng());
}

if (isValidZoom(zoomLevel)) {
  map.setZoom(zoomLevel);
}
```

### Importing Types

```typescript
import type {
  NaverMap,
  NaverMarker,
  NaverInfoWindow,
  NaverLatLng
} from './types/naver-map';

function createMarker(map: NaverMap): NaverMarker {
  return new naver.maps.Marker({
    position: new naver.maps.LatLng(37.5, 127),
    map: map
  });
}
```

## Common Patterns

### Event Handling with Type Safety

```typescript
// Typed event listeners
naver.maps.Event.addListener(map, 'click', (e) => {
  // 'e' is properly typed as PointerEvent
  console.log('Clicked at:', e.coord.lat(), e.coord.lng());
  console.log('Pixel:', e.point.x, e.point.y);
  console.log('Type:', e.pointerType); // 'mouse' | 'touch' | 'pen'
});
```

### InfoWindow with Full Options

```typescript
const infoWindow = new naver.maps.InfoWindow({
  content: '<div>Content</div>',
  maxWidth: 400,              // IntelliSense shows: "Maximum width in pixels (0 = no limit)"
  anchorSkew: true,           // IntelliSense shows: "Enable skew effect..."
  anchorSize: new naver.maps.Size(30, 30),
  backgroundColor: '#ffffff',
  borderColor: '#2196F3',
  borderWidth: 3
});
```

### Custom Control Creation

```typescript
const customControl = new naver.maps.CustomControl(
  '<div style="padding:10px;">Custom Control</div>',
  { position: naver.maps.Position.TOP_LEFT }
);
customControl.setMap(map);
```

## Type Safety Benefits

1. **Compile-time error detection** - Catch errors before runtime
2. **IntelliSense support** - Auto-completion and documentation
3. **Refactoring safety** - Rename and restructure with confidence
4. **Self-documenting code** - Types serve as inline documentation

## Validation

Run the validation example to test all APIs:

```typescript
import { runAllExamples } from './types/naver-maps-validation.example';

// This will test all major APIs
runAllExamples();
```

## Notes

- Types are based on Naver Maps API v3
- Supports both class instances and duck typing
- All numeric positions use the Position constants (0-12)
- Coordinates use WGS84 (latitude: -90 to 90, longitude: -180 to 180)
- Zoom levels range from 0 to 21

## Contributing

When adding new types:
1. Include comprehensive JSDoc documentation
2. Add corresponding type guards
3. Include usage examples
4. Update the validation file
5. Test IntelliSense functionality