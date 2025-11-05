import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Example component demonstrating shape overlay usage
const ShapeOverlayExample: React.FC<{ map: naver.maps.Map }> = ({ map }) => {
  React.useEffect(() => {
    if (!map || !window.naver?.maps) return

    // Create various shapes with complete options
    const polyline = new naver.maps.Polyline({
      map,
      path: [
        { lat: 37.5666805, lng: 126.9784147 },
        { lat: 37.5651005, lng: 126.9761147 },
        { lat: 37.5661005, lng: 126.9751147 }
      ],
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 5,
      strokeStyle: 'shortdash',
      strokeLineCap: 'round',
      strokeLineJoin: 'bevel',
      startIcon: naver.maps.PointingIcon.CIRCLE,
      startIconSize: 10,
      endIcon: naver.maps.PointingIcon.ARROW,
      endIconSize: 15,
      clickable: true,
      zIndex: 100,
      visible: true
    })

    // Polygon with hole
    const polygon = new naver.maps.Polygon({
      map,
      paths: [
        // Outer ring
        [
          { lat: 37.5666805, lng: 126.9784147 },
          { lat: 37.5651005, lng: 126.9761147 },
          { lat: 37.5661005, lng: 126.9751147 },
          { lat: 37.5676805, lng: 126.9774147 }
        ],
        // Inner ring (hole)
        [
          { lat: 37.5656805, lng: 126.9774147 },
          { lat: 37.5655005, lng: 126.9771147 },
          { lat: 37.5657005, lng: 126.9772147 }
        ]
      ],
      fillColor: '#0000FF',
      fillOpacity: 0.3,
      strokeColor: '#000080',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      strokeStyle: 'solid',
      clickable: true,
      visible: true
    })

    // Circle
    const circle = new naver.maps.Circle({
      map,
      center: { lat: 37.5666805, lng: 126.9784147 },
      radius: 500,
      fillColor: '#00FF00',
      fillOpacity: 0.2,
      strokeColor: '#008800',
      strokeOpacity: 0.9,
      strokeWeight: 3,
      strokeStyle: 'dash',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      clickable: true,
      zIndex: 50
    })

    // Ellipse
    const ellipse = new naver.maps.Ellipse({
      map,
      center: { lat: 37.5656805, lng: 126.9764147 },
      radiusX: 600,
      radiusY: 400,
      fillColor: '#FFFF00',
      fillOpacity: 0.4,
      strokeColor: '#FFD700',
      strokeOpacity: 1,
      strokeWeight: 2,
      strokeStyle: 'shortdot',
      clickable: false,
      visible: true
    })

    // Rectangle
    const bounds = new naver.maps.LatLngBounds(
      { lat: 37.5651005, lng: 126.9761147 },
      { lat: 37.5671005, lng: 126.9791147 }
    )

    const rectangle = new naver.maps.Rectangle({
      map,
      bounds,
      fillColor: '#FF00FF',
      fillOpacity: 0.3,
      strokeColor: '#800080',
      strokeOpacity: 0.7,
      strokeWeight: 4,
      strokeStyle: 'longdash',
      strokeLineCap: 'square',
      strokeLineJoin: 'miter',
      clickable: true,
      zIndex: 75
    })

    // Data layer with GeoJSON
    const dataLayer = new naver.maps.Data()
    dataLayer.setMap(map)

    // Add a feature directly
    const feature = dataLayer.add({
      geometry: new naver.maps.Data.Point({ lat: 37.5666805, lng: 126.9784147 }),
      id: 'point-1',
      properties: {
        name: 'Test Point',
        category: 'landmark'
      }
    })

    // Style the data layer
    dataLayer.setStyle({
      fillColor: '#FF5733',
      fillOpacity: 0.5,
      strokeColor: '#C70039',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      strokeStyle: 'solid',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      clickable: true,
      cursor: 'pointer'
    })

    // Load GeoJSON
    const geoJsonData: naver.maps.GeoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [126.9784147, 37.5666805]
          },
          properties: {
            name: 'Seoul City Hall',
            type: 'government'
          },
          id: 'seoul-city-hall'
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [126.9784147, 37.5666805],
              [126.9794147, 37.5676805],
              [126.9804147, 37.5686805]
            ]
          },
          properties: {
            name: 'Main Street',
            type: 'road'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [126.9774147, 37.5656805],
              [126.9784147, 37.5656805],
              [126.9784147, 37.5666805],
              [126.9774147, 37.5666805],
              [126.9774147, 37.5656805]
            ]]
          },
          properties: {
            name: 'City Park',
            type: 'park'
          }
        }
      ]
    }

    const features = dataLayer.addGeoJson(geoJsonData, {
      idProperty: 'id'
    })

    // Override style for specific feature
    if (features.length > 0) {
      dataLayer.overrideStyle(features[0], {
        fillColor: '#00FF00',
        fillOpacity: 0.8
      })
    }

    // Styling function for dynamic styling
    const stylingFunction: naver.maps.Data.StylingFunction = (feature) => {
      const type = feature.getProperty('type')
      switch (type) {
        case 'government':
          return {
            icon: {
              path: naver.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          }
        case 'road':
          return {
            strokeColor: '#333333',
            strokeWeight: 3,
            strokeStyle: 'solid'
          }
        case 'park':
          return {
            fillColor: '#90EE90',
            fillOpacity: 0.5,
            strokeColor: '#228B22',
            strokeWeight: 1
          }
        default:
          return {}
      }
    }

    dataLayer.setStyle(stylingFunction)

    // Test geometry methods
    const testBounds = polyline.getBounds()
    const testDistance = polyline.getDistance()
    const polygonArea = polygon.getArea()
    const circleArea = circle.getArea()
    const ellipseArea = ellipse.getArea()

    // Update visibility
    polyline.setVisible(false)
    polyline.setVisible(true)

    // Update ellipse radii
    ellipse.setRadiusX(700)
    ellipse.setRadiusY(500)

    // Convert data layer to GeoJSON
    const exportedGeoJson = dataLayer.toGeoJson()

    // Clean up
    return () => {
      polyline.setMap(null)
      polygon.setMap(null)
      circle.setMap(null)
      ellipse.setMap(null)
      rectangle.setMap(null)
      dataLayer.setMap(null)
    }
  }, [map])

  return (
    <div data-testid="shape-overlay-example">
      <h3>Shape Overlay Example</h3>
      <p>Demonstrating various shape overlays and Data layer with GeoJSON</p>
    </div>
  )
}

// Mock Naver Maps API
const mockNaverMaps = () => {
  const mockMap = {
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    getCenter: vi.fn(),
    getZoom: vi.fn()
  }

  const mockOverlayView = {
    setMap: vi.fn(),
    getMap: vi.fn(() => mockMap),
    setVisible: vi.fn(),
    getVisible: vi.fn(() => true)
  }

  window.naver = {
    maps: {
      Map: vi.fn(() => mockMap),
      LatLng: vi.fn((lat: number, lng: number) => ({ lat: () => lat, lng: () => lng })),
      LatLngBounds: vi.fn((sw: any, ne: any) => ({ getSouthWest: () => sw, getNorthEast: () => ne })),
      
      Polyline: vi.fn(() => ({
        ...mockOverlayView,
        setPath: vi.fn(),
        getPath: vi.fn(() => []),
        getBounds: vi.fn(() => new naver.maps.LatLngBounds({lat: 0, lng: 0}, {lat: 1, lng: 1})),
        getDistance: vi.fn(() => 1000),
        setOptions: vi.fn()
      })),
      
      Polygon: vi.fn(() => ({
        ...mockOverlayView,
        setPaths: vi.fn(),
        getPaths: vi.fn(() => []),
        getBounds: vi.fn(() => new naver.maps.LatLngBounds({lat: 0, lng: 0}, {lat: 1, lng: 1})),
        getArea: vi.fn(() => 10000),
        setOptions: vi.fn()
      })),
      
      Circle: vi.fn(() => ({
        ...mockOverlayView,
        setCenter: vi.fn(),
        getCenter: vi.fn(),
        setRadius: vi.fn(),
        getRadius: vi.fn(() => 500),
        getBounds: vi.fn(() => new naver.maps.LatLngBounds({lat: 0, lng: 0}, {lat: 1, lng: 1})),
        getArea: vi.fn(() => Math.PI * 500 * 500),
        setOptions: vi.fn()
      })),
      
      Ellipse: vi.fn(() => ({
        ...mockOverlayView,
        setCenter: vi.fn(),
        getCenter: vi.fn(),
        setRadiusX: vi.fn(),
        getRadiusX: vi.fn(() => 600),
        setRadiusY: vi.fn(),
        getRadiusY: vi.fn(() => 400),
        getBounds: vi.fn(() => new naver.maps.LatLngBounds({lat: 0, lng: 0}, {lat: 1, lng: 1})),
        getArea: vi.fn(() => Math.PI * 600 * 400),
        setOptions: vi.fn()
      })),
      
      Rectangle: vi.fn(() => ({
        ...mockOverlayView,
        setBounds: vi.fn(),
        getBounds: vi.fn(() => new naver.maps.LatLngBounds({lat: 0, lng: 0}, {lat: 1, lng: 1})),
        getArea: vi.fn(() => 20000),
        setOptions: vi.fn()
      })),
      
      Data: vi.fn(() => ({
        setMap: vi.fn(),
        add: vi.fn(() => ({
          getId: vi.fn(() => 'feature-1'),
          getProperty: vi.fn(),
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
          getGeometry: vi.fn(),
          setGeometry: vi.fn(),
          toGeoJson: vi.fn()
        })),
        addGeoJson: vi.fn(() => []),
        remove: vi.fn(),
        forEach: vi.fn(),
        overrideStyle: vi.fn(),
        revertStyle: vi.fn(),
        setStyle: vi.fn(),
        toGeoJson: vi.fn(() => ({ type: 'FeatureCollection', features: [] })),
        contains: vi.fn(() => false),
        loadGeoJson: vi.fn()
      })),
      
      PointingIcon: {
        CIRCLE: 'circle',
        ARROW: 'arrow',
        OPEN_ARROW: 'openarrow',
        BLOCK_ARROW: 'blockarrow'
      },
      
      SymbolPath: {
        BACKWARD_CLOSED_ARROW: 1,
        BACKWARD_OPEN_ARROW: 2,
        CIRCLE: 3,
        FORWARD_CLOSED_ARROW: 4,
        FORWARD_OPEN_ARROW: 5
      }
    }
  } as any

  // Add Data namespace classes
  window.naver.maps.Data.Point = vi.fn((latLng: any) => ({
    get: vi.fn(() => latLng),
    getType: vi.fn(() => 'Point')
  })) as any
  
  window.naver.maps.Data.LineString = vi.fn(() => ({
    getArray: vi.fn(() => []),
    getAt: vi.fn(),
    getLength: vi.fn(() => 0),
    getType: vi.fn(() => 'LineString')
  })) as any
  
  window.naver.maps.Data.Polygon = vi.fn(() => ({
    getArray: vi.fn(() => []),
    getAt: vi.fn(),
    getLength: vi.fn(() => 0),
    getType: vi.fn(() => 'Polygon')
  })) as any
}

describe('ShapeOverlayExample', () => {
  beforeEach(() => {
    mockNaverMaps()
  })

  it('should render shape overlay example', () => {
    const mockMap = new window.naver.maps.Map('map', {
      center: { lat: 37.5666805, lng: 126.9784147 },
      zoom: 15
    })

    render(<ShapeOverlayExample map={mockMap as any} />)
    
    expect(screen.getByTestId('shape-overlay-example')).toBeInTheDocument()
    expect(screen.getByText('Shape Overlay Example')).toBeInTheDocument()
  })

  it('should create all shape types with proper options', () => {
    const mockMap = new window.naver.maps.Map('map', {
      center: { lat: 37.5666805, lng: 126.9784147 },
      zoom: 15
    })

    render(<ShapeOverlayExample map={mockMap as any} />)

    // Verify shape constructors were called
    expect(window.naver.maps.Polyline).toHaveBeenCalled()
    expect(window.naver.maps.Polygon).toHaveBeenCalled()
    expect(window.naver.maps.Circle).toHaveBeenCalled()
    expect(window.naver.maps.Ellipse).toHaveBeenCalled()
    expect(window.naver.maps.Rectangle).toHaveBeenCalled()
    expect(window.naver.maps.Data).toHaveBeenCalled()
  })

  it('should handle stroke style types correctly', () => {
    const validStrokeStyles: naver.maps.StrokeStyleType[] = [
      'solid', 'shortdash', 'shortdot', 'shortdashdot',
      'shortdashdotdot', 'dot', 'dash', 'dashdot',
      'longdash', 'longdashdot', 'longdashdotdot'
    ]

    validStrokeStyles.forEach(style => {
      const options: Partial<naver.maps.PolylineOptions> = {
        strokeStyle: style
      }
      expect(options.strokeStyle).toBeDefined()
    })
  })

  it('should handle stroke line cap types correctly', () => {
    const validLineCaps: naver.maps.StrokeLineCapType[] = ['butt', 'round', 'square']

    validLineCaps.forEach(cap => {
      const options: Partial<naver.maps.PolylineOptions> = {
        strokeLineCap: cap
      }
      expect(options.strokeLineCap).toBeDefined()
    })
  })

  it('should handle stroke line join types correctly', () => {
    const validLineJoins: naver.maps.StrokeLineJoinType[] = ['miter', 'round', 'bevel']

    validLineJoins.forEach(join => {
      const options: Partial<naver.maps.PolylineOptions> = {
        strokeLineJoin: join
      }
      expect(options.strokeLineJoin).toBeDefined()
    })
  })

  it('should support GeoJSON feature types', () => {
    const point: naver.maps.GeoJsonPoint = {
      type: 'Point',
      coordinates: [126.9784147, 37.5666805]
    }

    const lineString: naver.maps.GeoJsonLineString = {
      type: 'LineString',
      coordinates: [[126.9784147, 37.5666805], [126.9794147, 37.5676805]]
    }

    const polygon: naver.maps.GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[[126.9784147, 37.5666805], [126.9794147, 37.5676805], [126.9784147, 37.5666805]]]
    }

    expect(point.type).toBe('Point')
    expect(lineString.type).toBe('LineString')
    expect(polygon.type).toBe('Polygon')
  })
})