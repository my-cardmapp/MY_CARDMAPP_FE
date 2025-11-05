# Naver Maps Shape Types Implementation

## Overview
Complete TypeScript type definitions for Naver Maps shape overlays and drawing tools, including support for GeoJSON and the Data layer.

## Implemented Shape Types

### 1. Polyline
- **Path**: Array of LatLng coordinates
- **Stroke Styles**: 11 different styles (solid, shortdash, dot, dash, etc.)
- **Line Caps**: butt, round, square
- **Line Joins**: miter, round, bevel
- **Start/End Icons**: circle, arrow, openarrow, blockarrow
- **Methods**: setPath, getPath, getBounds, getDistance, setVisible

### 2. Polygon
- **Paths**: Supports single ring or multiple rings (for holes)
- **Fill Options**: fillColor, fillOpacity
- **Stroke Options**: All polyline stroke options
- **Methods**: setPaths, getPaths, getBounds, getArea, setVisible

### 3. Circle
- **Center**: LatLng coordinate
- **Radius**: In meters
- **Fill & Stroke**: Complete styling options
- **Methods**: setCenter, getCenter, setRadius, getRadius, getBounds, getArea

### 4. Ellipse (New)
- **Center**: LatLng coordinate
- **RadiusX/RadiusY**: Horizontal and vertical radii in meters
- **Fill & Stroke**: Complete styling options
- **Methods**: setRadiusX, getRadiusX, setRadiusY, getRadiusY, getBounds, getArea

### 5. Rectangle
- **Bounds**: LatLngBounds defining the rectangle
- **Fill & Stroke**: Complete styling options
- **Methods**: setBounds, getBounds, getArea, setVisible

## Stroke Style Types

### StrokeStyleType
```typescript
type StrokeStyleType = 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 
  'shortdashdotdot' | 'dot' | 'dash' | 'dashdot' | 'longdash' | 
  'longdashdot' | 'longdashdotdot'
```

### StrokeLineCapType
```typescript
type StrokeLineCapType = 'butt' | 'round' | 'square'
```

### StrokeLineJoinType
```typescript
type StrokeLineJoinType = 'miter' | 'round' | 'bevel'
```

## Data Layer for GeoJSON

### Data Class
Main class for managing geographic features and GeoJSON data:
- `add(feature)`: Add a feature to the data layer
- `addGeoJson(geoJson, options)`: Import GeoJSON data
- `remove(feature)`: Remove a feature
- `setStyle(style)`: Apply styling to all features
- `overrideStyle(feature, style)`: Override style for specific feature
- `toGeoJson()`: Export features as GeoJSON
- `loadGeoJson(url, options, callback)`: Load GeoJSON from URL

### Geometry Types
- **Point**: Single coordinate
- **LineString**: Array of coordinates forming a line
- **LinearRing**: Closed LineString
- **Polygon**: Array of LinearRings (outer ring + holes)
- **MultiPoint**: Collection of Points
- **MultiLineString**: Collection of LineStrings
- **MultiPolygon**: Collection of Polygons
- **GeometryCollection**: Mixed geometry types

### GeoJSON Support
Complete support for GeoJSON standard:
- GeoJsonFeature
- GeoJsonFeatureCollection
- All GeoJSON geometry types
- Properties and ID support

## Usage Examples

### Drawing a Polyline with Custom Style
```typescript
const polyline = new naver.maps.Polyline({
  map: map,
  path: [
    { lat: 37.5666805, lng: 126.9784147 },
    { lat: 37.5651005, lng: 126.9761147 }
  ],
  strokeColor: '#FF0000',
  strokeWeight: 5,
  strokeStyle: 'shortdash',
  strokeLineCap: 'round',
  strokeLineJoin: 'bevel',
  startIcon: naver.maps.PointingIcon.CIRCLE,
  endIcon: naver.maps.PointingIcon.ARROW
})
```

### Creating a Polygon with Hole
```typescript
const polygon = new naver.maps.Polygon({
  map: map,
  paths: [
    // Outer ring
    [
      { lat: 37.5666, lng: 126.9784 },
      { lat: 37.5651, lng: 126.9761 },
      { lat: 37.5661, lng: 126.9751 }
    ],
    // Inner ring (hole)
    [
      { lat: 37.5656, lng: 126.9774 },
      { lat: 37.5655, lng: 126.9771 },
      { lat: 37.5657, lng: 126.9772 }
    ]
  ],
  fillColor: '#0000FF',
  fillOpacity: 0.3
})
```

### Using Data Layer with GeoJSON
```typescript
const dataLayer = new naver.maps.Data()
dataLayer.setMap(map)

// Add GeoJSON data
const features = dataLayer.addGeoJson({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [126.9784, 37.5666]
      },
      properties: {
        name: 'Seoul City Hall'
      }
    }
  ]
})

// Dynamic styling based on properties
dataLayer.setStyle((feature) => {
  const type = feature.getProperty('type')
  if (type === 'park') {
    return {
      fillColor: '#90EE90',
      fillOpacity: 0.5
    }
  }
  return {}
})
```

## Testing
All shape types are fully tested with:
- Type safety checks
- Options validation
- Method availability
- GeoJSON import/export
- Geometry type handling

Test files:
- `/src/types/__tests__/naver-maps-shapes.test.ts`
- `/src/components/map/__tests__/ShapeOverlayExample.test.tsx`

## TypeScript Benefits
- Full IntelliSense support for all shape options
- Type-safe stroke styles, line caps, and joins
- Proper typing for GeoJSON structures
- Compile-time validation of shape configurations
- Better developer experience with autocomplete