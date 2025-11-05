import { describe, it, expect, beforeEach, vi } from 'vitest'
import type * as NaverMaps from '../naver-map'
import {
  isLatLng,
  isLatLngLiteral,
  isMarker,
  isMap,
  isInfoWindow,
  isPolyline,
  isPolygon,
  isCircle,
  isRectangle,
  isEllipse,
  isPoint,
  isSize,
  isBounds,
  isLatLngBounds,
  isOverlayView,
  isKVO,
  isCustomControl
} from '../naver-maps-guards'

// Create base classes first
class MockLatLng {
  constructor(public _lat: number, public _lng: number) {}
  lat() { return this._lat }
  lng() { return this._lng }
}

class MockPoint {
  constructor(public x: number, public y: number) {}
}

class MockSize {
  constructor(public width: number, public height: number) {}
}

class MockBounds {
  constructor(public min: any, public max: any) {}
  getMin() { return this.min }
  getMax() { return this.max }
}

class MockLatLngBounds {
  constructor(public sw: any, public ne: any) {}
  getSouthWest() { return this.sw }
  getNorthEast() { return this.ne }
}

class MockMap {
  setCenter() {}
  setZoom() {}
  getCenter() {}
  getZoom() {}
}

class MockMarker {
  setMap() {}
  setPosition() {}
  getPosition() {}
}

class MockInfoWindow {
  open() {}
  close() {}
  setContent() {}
}

class MockPolyline {
  getPath() {}
  setPath() {}
}

class MockPolygon {
  getPaths() {}
  setPaths() {}
}

class MockCircle {
  getCenter() {}
  setCenter() {}
  getRadius() {}
  setRadius() {}
}

class MockRectangle {
  getBounds() {}
  setBounds() {}
}

class MockEllipse {
  getCenter() {}
  setCenter() {}
  getRadiusX() {}
  getRadiusY() {}
}

class MockKVO {
  get() {}
  set() {}
  setValues() {}
  bindTo() {}
  unbind() {}
  unbindAll() {}
}

class MockOverlayView {
  setMap() {}
  getMap() {}
  onAdd() {}
  draw() {}
}

class MockCustomControl {
  constructor(public html: string, public options?: any) {}
  setMap() {}
  getElement() {}
}

// Base Projection class
class MockProjection {
  static getDefault() { return new MockEPSG3857() }
  static get(name: string) { 
    switch(name) {
      case 'EPSG:3857': return new MockEPSG3857()
      case 'EPSG:4326': return new MockEPSG4326()
      case 'UTMK': return new MockUTMK()
      case 'TM128': return new MockTM128()
      default: return null
    }
  }
  fromCoordToPoint(coord: any) { return new MockPoint(0, 0) }
  fromPointToCoord(point: any) { return new MockLatLng(0, 0) }
  getProjectionName() { return 'EPSG:3857' }
  getDestinationCoord() { return new MockLatLng(0, 0) }
  getDistance() { return 1000 }
}

class MockEPSG3857 extends MockProjection {
  getProjectionName() { return 'EPSG:3857' }
}

class MockEPSG4326 extends MockProjection {
  getProjectionName() { return 'EPSG:4326' }
}

class MockUTMK extends MockProjection {
  getProjectionName() { return 'UTMK' }
}

class MockTM128 extends MockProjection {
  getProjectionName() { return 'TM128' }
}

class MockMapTypeRegistry {
  private registry = new Map<string, any>()
  set(id: string, mapType: any) { this.registry.set(id, mapType) }
  get(id: string) { return this.registry.get(id) || null }
  has(id: string) { return this.registry.has(id) }
  delete(id: string) { return this.registry.delete(id) }
  clear() { this.registry.clear() }
  forEach(callback: Function) { 
    this.registry.forEach((value, key) => callback(value, key))
  }
}

// Mock naver.maps global
const mockNaverMaps = {
  LatLng: MockLatLng,
  Point: MockPoint,
  Size: MockSize,
  Bounds: MockBounds,
  LatLngBounds: MockLatLngBounds,
  Map: MockMap,
  Marker: MockMarker,
  InfoWindow: MockInfoWindow,
  Polyline: MockPolyline,
  Polygon: MockPolygon,
  Circle: MockCircle,
  Rectangle: MockRectangle,
  Ellipse: MockEllipse,
  KVO: MockKVO,
  OverlayView: MockOverlayView,
  CustomControl: MockCustomControl,
  // Service namespace
  Service: {
    Status: {
      OK: 200,
      ERROR: 500,
      INVALID_REQUEST: 400,
      UNKNOWN_ERROR: 501
    },
    geocode: vi.fn(),
    reverseGeocode: vi.fn()
  },
  // Coordinate converters
  CoordinateConverter: {
    fromTM128ToLatLng: vi.fn(),
    fromLatLngToTM128: vi.fn(),
    fromEPSG3857ToLatLng: vi.fn(),
    fromLatLngToEPSG3857: vi.fn(),
    fromUTMKToLatLng: vi.fn(),
    fromLatLngToUTMK: vi.fn()
  },
  // Projection classes
  Projection: MockProjection,
  EPSG3857: MockEPSG3857,
  EPSG4326: MockEPSG4326,
  UTMK: MockUTMK,
  TM128: MockTM128,
  // Animation namespace
  animation: {
    panTo: vi.fn(),
    zoomTo: vi.fn(),
    fitBounds: vi.fn()
  },
  // MapTypeRegistry
  MapTypeRegistry: MockMapTypeRegistry
}

// Set up global mock
beforeEach(() => {
  ;(global as any).naver = { maps: mockNaverMaps }
  vi.clearAllMocks()
})

describe('Service Types', () => {
  describe('Geocoding Service', () => {
    it('should handle geocode requests with proper types', async () => {
      const mockResponse = {
        v2: {
          meta: {
            totalCount: 1,
            page: 1,
            count: 1
          },
          addresses: [{
            roadAddress: '서울특별시 강남구 테헤란로 123',
            jibunAddress: '서울특별시 강남구 역삼동 123-45',
            englishAddress: '123, Teheran-ro, Gangnam-gu, Seoul',
            x: '127.0276',
            y: '37.4979',
            distance: 0
          }],
          errorMessage: undefined
        }
      }

      mockNaverMaps.Service.geocode.mockImplementation((options: any, callback: Function) => {
        callback(mockNaverMaps.Service.Status.OK, mockResponse)
      })

      const options = {
        query: '테헤란로 123',
        coordinate: new mockNaverMaps.LatLng(37.5, 127.0),
        filter: 'HCODE',
        page: 1,
        count: 10
      }

      return new Promise<void>((resolve) => {
        mockNaverMaps.Service.geocode(options, (status, response) => {
          expect(status).toBe(200)
          expect(response.v2.addresses).toHaveLength(1)
          expect(response.v2.addresses[0].roadAddress).toBe('서울특별시 강남구 테헤란로 123')
          resolve()
        })
      })
    })

    it('should handle reverseGeocode requests', async () => {
      const mockResponse = {
        v2: {
          status: {
            code: 0,
            name: 'ok',
            message: 'done'
          },
          results: [{
            name: 'legalcode',
            code: {
              id: '1168010100',
              type: 'L',
              mappingId: '09680100'
            },
            region: {
              area0: {
                name: 'kr',
                coords: { center: { x: 128.0, y: 36.5 } }
              },
              area1: {
                name: '서울특별시',
                coords: { center: { x: 127.0, y: 37.5 } },
                alias: '서울'
              }
            },
            land: {
              type: '',
              number1: '123',
              number2: '45',
              addition0: { type: '', value: '' },
              name: '',
              coords: { center: { x: 127.0276, y: 37.4979 } }
            }
          }]
        }
      }

      mockNaverMaps.Service.reverseGeocode.mockImplementation((options: any, callback: Function) => {
        callback(mockNaverMaps.Service.Status.OK, mockResponse)
      })

      const options = {
        coords: new mockNaverMaps.LatLng(37.4979, 127.0276),
        orders: 'legalcode,admcode',
        output: 'json' as const
      }

      return new Promise<void>((resolve) => {
        mockNaverMaps.Service.reverseGeocode(options, (status, response) => {
          expect(status).toBe(200)
          expect(response.v2.status.code).toBe(0)
          expect(response.v2.results).toHaveLength(1)
          expect(response.v2.results[0].name).toBe('legalcode')
          resolve()
        })
      })
    })

    it('should handle error responses', async () => {
      mockNaverMaps.Service.geocode.mockImplementation((options: any, callback: Function) => {
        callback(mockNaverMaps.Service.Status.ERROR, {
          v2: {
            meta: { totalCount: 0, page: 1, count: 0 },
            addresses: [],
            errorMessage: 'Invalid API key'
          }
        })
      })

      return new Promise<void>((resolve) => {
        mockNaverMaps.Service.geocode({ query: 'test' }, (status, response) => {
          expect(status).toBe(500)
          expect(response.v2.errorMessage).toBe('Invalid API key')
          resolve()
        })
      })
    })
  })

  describe('Coordinate Converter', () => {
    it('should convert from TM128 to LatLng', () => {
      const tm128Point = new mockNaverMaps.Point(198234.5, 452340.1)
      const expectedLatLng = new mockNaverMaps.LatLng(37.5666805, 126.9784147)
      
      mockNaverMaps.CoordinateConverter.fromTM128ToLatLng.mockReturnValue(expectedLatLng)
      
      const result = mockNaverMaps.CoordinateConverter.fromTM128ToLatLng(tm128Point)
      
      expect(mockNaverMaps.CoordinateConverter.fromTM128ToLatLng).toHaveBeenCalledWith(tm128Point)
      expect(result.lat()).toBe(37.5666805)
      expect(result.lng()).toBe(126.9784147)
    })

    it('should convert from LatLng to TM128', () => {
      const latlng = new mockNaverMaps.LatLng(37.5666805, 126.9784147)
      const expectedPoint = new mockNaverMaps.Point(198234.5, 452340.1)
      
      mockNaverMaps.CoordinateConverter.fromLatLngToTM128.mockReturnValue(expectedPoint)
      
      const result = mockNaverMaps.CoordinateConverter.fromLatLngToTM128(latlng)
      
      expect(result.x).toBe(198234.5)
      expect(result.y).toBe(452340.1)
    })

    it('should convert between EPSG3857 and LatLng', () => {
      const epsg3857Point = new mockNaverMaps.Point(14135524.37, 4518045.64)
      const latlng = new mockNaverMaps.LatLng(37.5666805, 126.9784147)
      
      mockNaverMaps.CoordinateConverter.fromEPSG3857ToLatLng.mockReturnValue(latlng)
      mockNaverMaps.CoordinateConverter.fromLatLngToEPSG3857.mockReturnValue(epsg3857Point)
      
      const resultLatLng = mockNaverMaps.CoordinateConverter.fromEPSG3857ToLatLng(epsg3857Point)
      expect(resultLatLng.lat()).toBe(37.5666805)
      
      const resultPoint = mockNaverMaps.CoordinateConverter.fromLatLngToEPSG3857(latlng)
      expect(resultPoint.x).toBe(14135524.37)
    })

    it('should convert between UTMK and LatLng', () => {
      const utmkPoint = new mockNaverMaps.Point(957186.5, 1952053.1)
      const latlng = new mockNaverMaps.LatLng(37.5666805, 126.9784147)
      
      mockNaverMaps.CoordinateConverter.fromUTMKToLatLng.mockReturnValue(latlng)
      mockNaverMaps.CoordinateConverter.fromLatLngToUTMK.mockReturnValue(utmkPoint)
      
      const resultLatLng = mockNaverMaps.CoordinateConverter.fromUTMKToLatLng(utmkPoint)
      expect(resultLatLng.lat()).toBe(37.5666805)
      
      const resultPoint = mockNaverMaps.CoordinateConverter.fromLatLngToUTMK(latlng)
      expect(resultPoint.x).toBe(957186.5)
    })
  })

  describe('Projection System', () => {
    it('should get default projection (EPSG3857)', () => {
      const projection = mockNaverMaps.Projection.getDefault()
      expect(projection.getProjectionName()).toBe('EPSG:3857')
    })

    it('should get projection by name', () => {
      const epsg3857 = mockNaverMaps.Projection.get('EPSG:3857')
      expect(epsg3857).toBeTruthy()
      expect(epsg3857?.getProjectionName()).toBe('EPSG:3857')

      const epsg4326 = mockNaverMaps.Projection.get('EPSG:4326')
      expect(epsg4326).toBeTruthy()
      expect(epsg4326?.getProjectionName()).toBe('EPSG:4326')

      const utmk = mockNaverMaps.Projection.get('UTMK')
      expect(utmk).toBeTruthy()
      expect(utmk?.getProjectionName()).toBe('UTMK')

      const tm128 = mockNaverMaps.Projection.get('TM128')
      expect(tm128).toBeTruthy()
      expect(tm128?.getProjectionName()).toBe('TM128')

      const unknown = mockNaverMaps.Projection.get('UNKNOWN')
      expect(unknown).toBeNull()
    })

    it('should convert between coordinates and points', () => {
      const projection = new mockNaverMaps.Projection()
      const coord = new mockNaverMaps.LatLng(37.5, 127.0)
      const point = projection.fromCoordToPoint(coord)
      
      expect(point).toBeInstanceOf(mockNaverMaps.Point)
      
      const resultCoord = projection.fromPointToCoord(point)
      expect(resultCoord).toBeInstanceOf(mockNaverMaps.LatLng)
    })

    it('should calculate destination coordinates', () => {
      const projection = new mockNaverMaps.Projection()
      const startCoord = new mockNaverMaps.LatLng(37.5, 127.0)
      const angle = 45 // degrees
      const distance = 1000 // meters
      
      const destCoord = projection.getDestinationCoord(startCoord, angle, distance)
      expect(destCoord).toBeInstanceOf(mockNaverMaps.LatLng)
    })

    it('should calculate distance between coordinates', () => {
      const projection = new mockNaverMaps.Projection()
      const coord1 = new mockNaverMaps.LatLng(37.5, 127.0)
      const coord2 = new mockNaverMaps.LatLng(37.51, 127.01)
      
      const distance = projection.getDistance(coord1, coord2)
      expect(typeof distance).toBe('number')
      expect(distance).toBeGreaterThan(0)
    })
  })

  describe('Animation Utilities', () => {
    it('should animate pan to location', () => {
      const map = new mockNaverMaps.Map()
      const coord = new mockNaverMaps.LatLng(37.5, 127.0)
      const options = {
        duration: 500,
        easing: 'easeInOutCubic' as const,
        callback: vi.fn()
      }
      
      mockNaverMaps.animation.panTo(map, coord, options)
      
      expect(mockNaverMaps.animation.panTo).toHaveBeenCalledWith(map, coord, options)
    })

    it('should animate zoom', () => {
      const map = new mockNaverMaps.Map()
      const zoom = 15
      const options = {
        duration: 300,
        easing: 'linear' as const,
        callback: vi.fn()
      }
      
      mockNaverMaps.animation.zoomTo(map, zoom, options)
      
      expect(mockNaverMaps.animation.zoomTo).toHaveBeenCalledWith(map, zoom, options)
    })

    it('should animate fit bounds', () => {
      const map = new mockNaverMaps.Map()
      const bounds = new mockNaverMaps.LatLngBounds(
        new mockNaverMaps.LatLng(37.4, 126.9),
        new mockNaverMaps.LatLng(37.6, 127.1)
      )
      const options = {
        duration: 400,
        easing: 'easeOutCubic' as const
      }
      
      mockNaverMaps.animation.fitBounds(map, bounds, options)
      
      expect(mockNaverMaps.animation.fitBounds).toHaveBeenCalledWith(map, bounds, options)
    })
  })

  describe('MapTypeRegistry', () => {
    it('should manage map types', () => {
      const registry = new mockNaverMaps.MapTypeRegistry()
      
      const normalMapType = {
        name: 'Normal',
        minZoom: 1,
        maxZoom: 20,
        getTileUrl: (x: number, y: number, z: number) => `tile/${z}/${x}/${y}.png`
      }
      
      const satelliteMapType = {
        name: 'Satellite',
        minZoom: 1,
        maxZoom: 19
      }
      
      // Test set and get
      registry.set('NORMAL', normalMapType)
      registry.set('SATELLITE', satelliteMapType)
      
      expect(registry.get('NORMAL')).toEqual(normalMapType)
      expect(registry.get('SATELLITE')).toEqual(satelliteMapType)
      expect(registry.get('UNKNOWN')).toBeNull()
      
      // Test has
      expect(registry.has('NORMAL')).toBe(true)
      expect(registry.has('SATELLITE')).toBe(true)
      expect(registry.has('UNKNOWN')).toBe(false)
      
      // Test forEach
      const collected: Array<[any, string]> = []
      registry.forEach((mapType: any, id: string) => {
        collected.push([mapType, id])
      })
      
      expect(collected).toHaveLength(2)
      expect(collected[0][1]).toBe('NORMAL')
      expect(collected[1][1]).toBe('SATELLITE')
      
      // Test delete
      expect(registry.delete('NORMAL')).toBe(true)
      expect(registry.has('NORMAL')).toBe(false)
      expect(registry.get('NORMAL')).toBeNull()
      
      // Test clear
      registry.clear()
      expect(registry.has('SATELLITE')).toBe(false)
    })
  })
})

describe('Type Guards', () => {
  describe('isLatLng', () => {
    it('should identify LatLng instances', () => {
      const latlng = new mockNaverMaps.LatLng(37.5, 127.0)
      expect(isLatLng(latlng)).toBe(true)
      
      const duckTyped = {
        lat: () => 37.5,
        lng: () => 127.0
      }
      expect(isLatLng(duckTyped)).toBe(true)
      
      const notLatLng = { lat: 37.5, lng: 127.0 }
      expect(isLatLng(notLatLng)).toBe(false)
      
      expect(isLatLng(null)).toBe(false)
      expect(isLatLng(undefined)).toBe(false)
      expect(isLatLng({})).toBe(false)
    })
  })

  describe('isLatLngLiteral', () => {
    it('should identify LatLngLiteral objects', () => {
      const literal = { lat: 37.5, lng: 127.0 }
      expect(isLatLngLiteral(literal)).toBe(true)
      
      const invalidLiteral = { lat: '37.5', lng: '127.0' }
      expect(isLatLngLiteral(invalidLiteral)).toBe(false)
      
      const missingLat = { lng: 127.0 }
      expect(isLatLngLiteral(missingLat)).toBe(false)
      
      const missingLng = { lat: 37.5 }
      expect(isLatLngLiteral(missingLng)).toBe(false)
      
      expect(isLatLngLiteral(null)).toBe(false)
      expect(isLatLngLiteral(undefined)).toBe(false)
    })
  })

  describe('isMarker', () => {
    it('should identify Marker instances', () => {
      const marker = new mockNaverMaps.Marker()
      expect(isMarker(marker)).toBe(true)
      
      const duckTyped = {
        setMap: vi.fn(),
        setPosition: vi.fn()
      }
      expect(isMarker(duckTyped)).toBe(true)
      
      const notMarker = { setMap: 'not a function' }
      expect(isMarker(notMarker)).toBe(false)
      
      expect(isMarker(null)).toBe(false)
    })
  })

  describe('isMap', () => {
    it('should identify Map instances', () => {
      const map = new mockNaverMaps.Map()
      expect(isMap(map)).toBe(true)
      
      const duckTyped = {
        setCenter: vi.fn(),
        setZoom: vi.fn()
      }
      expect(isMap(duckTyped)).toBe(true)
      
      expect(isMap({})).toBe(false)
      expect(isMap(null)).toBe(false)
    })
  })

  describe('isInfoWindow', () => {
    it('should identify InfoWindow instances', () => {
      const infoWindow = new mockNaverMaps.InfoWindow()
      expect(isInfoWindow(infoWindow)).toBe(true)
      
      const duckTyped = {
        open: vi.fn(),
        close: vi.fn()
      }
      expect(isInfoWindow(duckTyped)).toBe(true)
      
      expect(isInfoWindow({})).toBe(false)
    })
  })

  describe('isPolyline', () => {
    it('should identify Polyline instances', () => {
      const polyline = new mockNaverMaps.Polyline()
      expect(isPolyline(polyline)).toBe(true)
      
      const duckTyped = {
        getPath: vi.fn(),
        setPath: vi.fn()
      }
      expect(isPolyline(duckTyped)).toBe(true)
      
      expect(isPolyline({})).toBe(false)
    })
  })

  describe('isPolygon', () => {
    it('should identify Polygon instances', () => {
      const polygon = new mockNaverMaps.Polygon()
      expect(isPolygon(polygon)).toBe(true)
      
      const duckTyped = {
        getPaths: vi.fn(),
        setPaths: vi.fn()
      }
      expect(isPolygon(duckTyped)).toBe(true)
      
      expect(isPolygon({})).toBe(false)
    })
  })

  describe('isCircle', () => {
    it('should identify Circle instances', () => {
      const circle = new mockNaverMaps.Circle()
      expect(isCircle(circle)).toBe(true)
      
      const duckTyped = {
        getCenter: vi.fn(),
        setCenter: vi.fn(),
        getRadius: vi.fn(),
        setRadius: vi.fn()
      }
      expect(isCircle(duckTyped)).toBe(true)
      
      const missingMethods = {
        getCenter: vi.fn(),
        setCenter: vi.fn()
      }
      expect(isCircle(missingMethods)).toBe(false)
    })
  })

  describe('isRectangle', () => {
    it('should identify Rectangle instances', () => {
      const rectangle = new mockNaverMaps.Rectangle()
      expect(isRectangle(rectangle)).toBe(true)
      
      const duckTyped = {
        getBounds: vi.fn(),
        setBounds: vi.fn()
      }
      expect(isRectangle(duckTyped)).toBe(true)
      
      expect(isRectangle({})).toBe(false)
    })
  })

  describe('isEllipse', () => {
    it('should identify Ellipse instances', () => {
      const ellipse = new mockNaverMaps.Ellipse()
      expect(isEllipse(ellipse)).toBe(true)
      
      const duckTyped = {
        getCenter: vi.fn(),
        setCenter: vi.fn(),
        getRadiusX: vi.fn(),
        getRadiusY: vi.fn()
      }
      expect(isEllipse(duckTyped)).toBe(true)
      
      const missingMethods = {
        getCenter: vi.fn(),
        setCenter: vi.fn(),
        getRadiusX: vi.fn()
      }
      expect(isEllipse(missingMethods)).toBe(false)
    })
  })

  describe('isPoint', () => {
    it('should identify Point instances', () => {
      const point = new mockNaverMaps.Point(100, 200)
      expect(isPoint(point)).toBe(true)
      
      const pointLike = { x: 100, y: 200 }
      expect(isPoint(pointLike)).toBe(true)
      
      const invalidPoint = { x: '100', y: '200' }
      expect(isPoint(invalidPoint)).toBe(false)
      
      expect(isPoint(null)).toBe(false)
    })
  })

  describe('isSize', () => {
    it('should identify Size instances', () => {
      const size = new mockNaverMaps.Size(300, 400)
      expect(isSize(size)).toBe(true)
      
      const sizeLike = { width: 300, height: 400 }
      expect(isSize(sizeLike)).toBe(true)
      
      const invalidSize = { width: '300', height: '400' }
      expect(isSize(invalidSize)).toBe(false)
      
      expect(isSize(null)).toBe(false)
    })
  })

  describe('isBounds', () => {
    it('should identify Bounds instances', () => {
      const min = new mockNaverMaps.Point(0, 0)
      const max = new mockNaverMaps.Point(100, 100)
      const bounds = new mockNaverMaps.Bounds(min, max)
      expect(isBounds(bounds)).toBe(true)
      
      const duckTyped = {
        getMin: vi.fn(),
        getMax: vi.fn()
      }
      expect(isBounds(duckTyped)).toBe(true)
      
      expect(isBounds({})).toBe(false)
    })
  })

  describe('isLatLngBounds', () => {
    it('should identify LatLngBounds instances', () => {
      const sw = new mockNaverMaps.LatLng(37.4, 126.9)
      const ne = new mockNaverMaps.LatLng(37.6, 127.1)
      const bounds = new mockNaverMaps.LatLngBounds(sw, ne)
      expect(isLatLngBounds(bounds)).toBe(true)
      
      const duckTyped = {
        getSouthWest: vi.fn(),
        getNorthEast: vi.fn()
      }
      expect(isLatLngBounds(duckTyped)).toBe(true)
      
      expect(isLatLngBounds({})).toBe(false)
    })
  })

  describe('isOverlayView', () => {
    it('should identify OverlayView instances', () => {
      const overlay = new mockNaverMaps.OverlayView()
      expect(isOverlayView(overlay)).toBe(true)
      
      const duckTyped = {
        setMap: vi.fn(),
        getMap: vi.fn(),
        onAdd: vi.fn(),
        draw: vi.fn()
      }
      expect(isOverlayView(duckTyped)).toBe(true)
      
      const missingMethods = {
        setMap: vi.fn(),
        getMap: vi.fn()
      }
      expect(isOverlayView(missingMethods)).toBe(false)
    })
  })

  describe('isKVO', () => {
    it('should identify KVO instances', () => {
      const kvo = new mockNaverMaps.KVO()
      expect(isKVO(kvo)).toBe(true)
      
      const duckTyped = {
        get: vi.fn(),
        set: vi.fn(),
        setValues: vi.fn(),
        bindTo: vi.fn(),
        unbind: vi.fn(),
        unbindAll: vi.fn()
      }
      expect(isKVO(duckTyped)).toBe(true)
      
      const missingMethods = {
        get: vi.fn(),
        set: vi.fn()
      }
      expect(isKVO(missingMethods)).toBe(false)
    })
  })

  describe('isCustomControl', () => {
    it('should identify CustomControl instances', () => {
      const control = new mockNaverMaps.CustomControl('<div>Test</div>')
      expect(isCustomControl(control)).toBe(true)
      
      const duckTyped = {
        setMap: vi.fn(),
        getElement: vi.fn()
      }
      expect(isCustomControl(duckTyped)).toBe(true)
      
      expect(isCustomControl({})).toBe(false)
    })
  })
})

describe('Service Response Types', () => {
  it('should handle different geocoding filter options', () => {
    const filters = ['HCODE', 'BCODE'] as const
    
    filters.forEach(filter => {
      const options = {
        query: 'test',
        filter
      }
      
      expect(options.filter).toMatch(/^(HCODE|BCODE)$/)
    })
  })

  it('should handle reverse geocoding order options', () => {
    const orders = ['legalcode', 'admcode', 'addr', 'roadaddr']
    const combinedOrders = orders.join(',')
    
    const options = {
      coords: new mockNaverMaps.LatLng(37.5, 127.0),
      orders: combinedOrders
    }
    
    expect(options.orders).toContain('legalcode')
    expect(options.orders).toContain('admcode')
  })

  it('should support string format for coordinates in reverse geocoding', () => {
    const coordString = '127.0276,37.4979'
    
    const options = {
      coords: coordString,
      output: 'json' as const
    }
    
    expect(typeof options.coords).toBe('string')
    expect(options.coords).toMatch(/^\d+\.\d+,\d+\.\d+$/)
  })
})

describe('Animation Options', () => {
  it('should support all easing types', () => {
    const easingTypes = [
      'linear',
      'easeInCubic',
      'easeOutCubic',
      'easeInOutCubic'
    ] as const
    
    easingTypes.forEach(easing => {
      const options = {
        duration: 300,
        easing,
        callback: vi.fn()
      }
      
      expect(options.easing).toMatch(/^(linear|easeInCubic|easeOutCubic|easeInOutCubic)$/)
    })
  })
})

describe('Projection Names', () => {
  it('should return correct projection names', () => {
    const projections = [
      { name: 'EPSG:3857', class: mockNaverMaps.EPSG3857 },
      { name: 'EPSG:4326', class: mockNaverMaps.EPSG4326 },
      { name: 'UTMK', class: mockNaverMaps.UTMK },
      { name: 'TM128', class: mockNaverMaps.TM128 }
    ]
    
    projections.forEach(({ name, class: ProjectionClass }) => {
      const projection = new ProjectionClass()
      expect(projection.getProjectionName()).toBe(name)
    })
  })
})