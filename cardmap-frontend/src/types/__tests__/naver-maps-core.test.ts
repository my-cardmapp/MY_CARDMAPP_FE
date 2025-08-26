/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, expectTypeOf } from 'vitest'

// Type-only imports for testing type definitions
import type { naver } from '../naver-map'

describe('Naver Maps Core Type Definitions', () => {
  describe('KVO Class with Generics', () => {
    it('should support generic type parameters', () => {
      // Test that KVO can accept generic types
      interface TestObject {
        name: string
        age: number
        active: boolean
      }

      type TestKVO = naver.maps.KVO<TestObject>
      
      // This should compile without errors
      const kvoTest = {} as TestKVO
      
      // Type checking for get method
      expectTypeOf(kvoTest.get).toBeFunction()
      expectTypeOf(kvoTest.get).parameter(0).toMatchTypeOf<keyof TestObject>()
      
      // Type checking for set method
      expectTypeOf(kvoTest.set).toBeFunction()
      expectTypeOf(kvoTest.set).parameter(0).toMatchTypeOf<keyof TestObject>()
      
      // Type checking for setValues
      expectTypeOf(kvoTest.setValues).toBeFunction()
      expectTypeOf(kvoTest.setValues).parameter(0).toMatchTypeOf<Partial<TestObject>>()
    })

    it('should support bindTo with proper type constraints', () => {
      type TestKVO = naver.maps.KVO<{ zoom: number }>
      const kvo = {} as TestKVO
      
      expectTypeOf(kvo.bindTo).toBeFunction()
      expectTypeOf(kvo.bindTo).parameter(0).toMatchTypeOf<'zoom'>()
      expectTypeOf(kvo.bindTo).parameter(1).toMatchTypeOf<naver.maps.KVO>()
    })
  })

  describe('KVOArray Class', () => {
    it('should support array operations with proper typing', () => {
      type TestArray = naver.maps.KVOArray<naver.maps.CustomControl>
      const array = {} as TestArray
      
      expectTypeOf(array.push).toBeFunction()
      expectTypeOf(array.push).parameter(0).toMatchTypeOf<naver.maps.CustomControl>()
      expectTypeOf(array.push).returns.toBeNumber()
      
      expectTypeOf(array.getAt).toBeFunction()
      expectTypeOf(array.getAt).parameter(0).toBeNumber()
      expectTypeOf(array.getAt).returns.toMatchTypeOf<naver.maps.CustomControl>()
      
      expectTypeOf(array.forEach).toBeFunction()
      expectTypeOf(array.getArray).returns.toMatchTypeOf<naver.maps.CustomControl[]>()
    })
  })

  describe('LatLng Class', () => {
    it('should have proper methods and properties', () => {
      const latlng = {} as naver.maps.LatLng
      
      expectTypeOf(latlng.lat).toBeFunction()
      expectTypeOf(latlng.lat).returns.toBeNumber()
      
      expectTypeOf(latlng.lng).toBeFunction()
      expectTypeOf(latlng.lng).returns.toBeNumber()
      
      expectTypeOf(latlng.equals).toBeFunction()
      expectTypeOf(latlng.equals).parameter(0).toMatchTypeOf<naver.maps.LatLng | naver.maps.LatLngLiteral>()
      expectTypeOf(latlng.equals).returns.toBeBoolean()
      
      expectTypeOf(latlng.toString).toBeFunction()
      expectTypeOf(latlng.toString).returns.toBeString()
      
      expectTypeOf(latlng.toPoint).toBeFunction()
      expectTypeOf(latlng.toPoint).returns.toMatchTypeOf<naver.maps.Point>()
    })

    it('should support destinationPoint method', () => {
      const latlng = {} as naver.maps.LatLng
      
      expectTypeOf(latlng.destinationPoint).toBeFunction()
      expectTypeOf(latlng.destinationPoint).parameter(0).toBeNumber() // angle
      expectTypeOf(latlng.destinationPoint).parameter(1).toBeNumber() // distance
      expectTypeOf(latlng.destinationPoint).returns.toMatchTypeOf<naver.maps.LatLng>()
    })
  })

  describe('LatLngBounds Class', () => {
    it('should have bounds-specific methods', () => {
      const bounds = {} as naver.maps.LatLngBounds
      
      expectTypeOf(bounds.getNorthEast).toBeFunction()
      expectTypeOf(bounds.getNorthEast).returns.toMatchTypeOf<naver.maps.LatLng>()
      
      expectTypeOf(bounds.getSouthWest).toBeFunction()
      expectTypeOf(bounds.getSouthWest).returns.toMatchTypeOf<naver.maps.LatLng>()
      
      expectTypeOf(bounds.getCenter).toBeFunction()
      expectTypeOf(bounds.getCenter).returns.toMatchTypeOf<naver.maps.LatLng>()
      
      expectTypeOf(bounds.contains).toBeFunction()
      expectTypeOf(bounds.contains).parameter(0).toMatchTypeOf<naver.maps.LatLng | naver.maps.LatLngLiteral>()
      expectTypeOf(bounds.contains).returns.toBeBoolean()
      
      expectTypeOf(bounds.extend).toBeFunction()
      expectTypeOf(bounds.extend).parameter(0).toMatchTypeOf<naver.maps.LatLng | naver.maps.LatLngLiteral>()
      expectTypeOf(bounds.extend).returns.toMatchTypeOf<naver.maps.LatLngBounds>()
      
      expectTypeOf(bounds.equals).toBeFunction()
      expectTypeOf(bounds.equals).parameter(0).toMatchTypeOf<naver.maps.LatLngBounds>()
      expectTypeOf(bounds.equals).returns.toBeBoolean()
      
      expectTypeOf(bounds.isEmpty).toBeFunction()
      expectTypeOf(bounds.isEmpty).returns.toBeBoolean()
      
      expectTypeOf(bounds.union).toBeFunction()
      expectTypeOf(bounds.union).parameter(0).toMatchTypeOf<naver.maps.LatLngBounds>()
      expectTypeOf(bounds.union).returns.toMatchTypeOf<naver.maps.LatLngBounds>()
    })

    it('should have constructor overloads', () => {
      // Constructor should accept various formats
      type Constructor = typeof naver.maps.LatLngBounds
      const ctor = {} as Constructor
      
      // Should be constructible with sw, ne points
      expectTypeOf(ctor).toBeConstructibleWith(
        {} as naver.maps.LatLng,
        {} as naver.maps.LatLng
      )
      
      // Should be constructible with LatLngLiterals
      expectTypeOf(ctor).toBeConstructibleWith(
        { lat: 37, lng: 127 },
        { lat: 38, lng: 128 }
      )
    })
  })

  describe('Bounds Class', () => {
    it('should handle pixel bounds', () => {
      const bounds = {} as naver.maps.Bounds
      
      expectTypeOf(bounds.getMin).toBeFunction()
      expectTypeOf(bounds.getMin).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(bounds.getMax).toBeFunction()
      expectTypeOf(bounds.getMax).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(bounds.getCenter).toBeFunction()
      expectTypeOf(bounds.getCenter).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(bounds.extend).toBeFunction()
      expectTypeOf(bounds.extend).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(bounds.extend).returns.toMatchTypeOf<naver.maps.Bounds>()
      
      expectTypeOf(bounds.contains).toBeFunction()
      expectTypeOf(bounds.contains).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(bounds.contains).returns.toBeBoolean()
    })
  })

  describe('Map Class Extensions', () => {
    it('should have extended Map methods', () => {
      const map = {} as naver.maps.Map
      
      // Bounds methods
      expectTypeOf(map.getBounds).toBeFunction()
      expectTypeOf(map.getBounds).returns.toMatchTypeOf<naver.maps.LatLngBounds>()
      
      expectTypeOf(map.fitBounds).toBeFunction()
      expectTypeOf(map.fitBounds).parameter(0).toMatchTypeOf<naver.maps.LatLngBounds>()
      expectTypeOf(map.fitBounds).parameter(1).toMatchTypeOf<naver.maps.FitBoundsOptions | undefined>()
      
      // Pan methods
      expectTypeOf(map.panTo).toBeFunction()
      expectTypeOf(map.panTo).parameter(0).toMatchTypeOf<naver.maps.LatLng | naver.maps.LatLngLiteral>()
      expectTypeOf(map.panTo).parameter(1).toMatchTypeOf<naver.maps.TransitionOptions | undefined>()
      
      expectTypeOf(map.panBy).toBeFunction()
      expectTypeOf(map.panBy).parameter(0).toBeNumber()
      expectTypeOf(map.panBy).parameter(1).toBeNumber()
      
      // Projection
      expectTypeOf(map.getProjection).toBeFunction()
      expectTypeOf(map.getProjection).returns.toMatchTypeOf<naver.maps.MapSystemProjection>()
      
      // Options
      expectTypeOf(map.setOptions).toBeFunction()
      expectTypeOf(map.setOptions).parameter(0).toMatchTypeOf<Partial<naver.maps.MapOptions>>()
      
      expectTypeOf(map.refresh).toBeFunction()
      
      // Map type
      expectTypeOf(map.setMapTypeId).toBeFunction()
      expectTypeOf(map.setMapTypeId).parameter(0).toMatchTypeOf<string | naver.maps.MapTypeId>()
      
      expectTypeOf(map.getMapTypeId).toBeFunction()
      expectTypeOf(map.getMapTypeId).returns.toMatchTypeOf<string>()
      
      // Tilt and heading (3D view)
      expectTypeOf(map.setTilt).toBeFunction()
      expectTypeOf(map.setTilt).parameter(0).toBeNumber()
      
      expectTypeOf(map.getTilt).toBeFunction()
      expectTypeOf(map.getTilt).returns.toBeNumber()
      
      expectTypeOf(map.setHeading).toBeFunction()
      expectTypeOf(map.setHeading).parameter(0).toBeNumber()
      
      expectTypeOf(map.getHeading).toBeFunction()
      expectTypeOf(map.getHeading).returns.toBeNumber()
    })

    it('should support Map event methods', () => {
      const map = {} as naver.maps.Map
      
      expectTypeOf(map.addListener).toBeFunction()
      expectTypeOf(map.addListener).parameter(0).toBeString()
      expectTypeOf(map.addListener).parameter(1).toBeFunction()
      expectTypeOf(map.addListener).returns.toMatchTypeOf<naver.maps.MapEventListener>()
      
      expectTypeOf(map.removeListener).toBeFunction()
      expectTypeOf(map.removeListener).parameter(0).toMatchTypeOf<naver.maps.MapEventListener>()
      
      expectTypeOf(map.trigger).toBeFunction()
      expectTypeOf(map.trigger).parameter(0).toBeString()
    })
  })

  describe('MapOptions Extensions', () => {
    it('should have extended options', () => {
      const options: naver.maps.MapOptions = {
        center: { lat: 37, lng: 127 },
        zoom: 10,
        minZoom: 5,
        maxZoom: 21,
        restriction: {} as naver.maps.LatLngBounds,
        tilt: 45,
        heading: 90,
        background: '#ffffff',
        disableKineticPan: false,
        mapTypes: {} as naver.maps.MapTypeRegistry,
        draggable: true,
        pinchZoom: true,
        scrollWheel: true,
        disableDoubleClickZoom: false,
        disableDoubleTapZoom: false,
        disableTwoFingerTapZoom: false,
        keyboardShortcuts: true,
        logoControlOptions: {
          position: 1 // TOP_LEFT
        },
        mapDataControlOptions: {
          position: 10 // BOTTOM_LEFT
        },
        scaleControlOptions: {
          position: 12 // BOTTOM_RIGHT
        },
        mapTypeControlOptions: {
          position: 3, // TOP_RIGHT
          style: 0 as naver.maps.MapTypeControlStyle,
          mapTypeIds: ['normal', 'satellite']
        },
        zoomControlOptions: {
          position: 1, // TOP_LEFT
          style: 0 as naver.maps.ZoomControlStyle,
          legendDisabled: false
        }
      }
      
      expectTypeOf(options).toMatchTypeOf<naver.maps.MapOptions>()
    })
  })

  describe('MapTypeRegistry', () => {
    it('should support custom map types', () => {
      const registry = {} as naver.maps.MapTypeRegistry
      
      expectTypeOf(registry.set).toBeFunction()
      expectTypeOf(registry.set).parameter(0).toBeString()
      expectTypeOf(registry.set).parameter(1).toMatchTypeOf<naver.maps.MapType>()
      
      expectTypeOf(registry.get).toBeFunction()
      expectTypeOf(registry.get).parameter(0).toBeString()
      expectTypeOf(registry.get).returns.toMatchTypeOf<naver.maps.MapType | null>()
    })
  })

  describe('TransitionOptions', () => {
    it('should define animation options', () => {
      const options: naver.maps.TransitionOptions = {
        duration: 500,
        easing: 'easeOutCubic',
        callback: () => {}
      }
      
      expectTypeOf(options).toMatchTypeOf<naver.maps.TransitionOptions>()
      expectTypeOf(options.duration).toBeNumber()
      expectTypeOf(options.easing).toBeString()
      expectTypeOf(options.callback).toBeFunction()
    })
  })

  describe('FitBoundsOptions', () => {
    it('should define fit bounds options', () => {
      const options: naver.maps.FitBoundsOptions = {
        top: 10,
        right: 20,
        bottom: 30,
        left: 40,
        maxZoom: 18
      }
      
      expectTypeOf(options).toMatchTypeOf<naver.maps.FitBoundsOptions>()
    })
  })

  describe('MapTypeId enum', () => {
    it('should define standard map types', () => {
      // Type-only check for enum existence
      type MapTypeIdType = typeof naver.maps.MapTypeId
      const mapTypeId = {} as MapTypeIdType
      
      expectTypeOf(mapTypeId.NORMAL).toBeString()
      expectTypeOf(mapTypeId.TERRAIN).toBeString()
      expectTypeOf(mapTypeId.SATELLITE).toBeString()
      expectTypeOf(mapTypeId.HYBRID).toBeString()
    })
  })

  describe('MapTypeControlStyle enum', () => {
    it('should define control styles', () => {
      // Type-only check for enum existence
      type MapTypeControlStyleType = typeof naver.maps.MapTypeControlStyle
      const controlStyle = {} as MapTypeControlStyleType
      
      expectTypeOf(controlStyle.BUTTON).toBeNumber()
      expectTypeOf(controlStyle.DROPDOWN).toBeNumber()
    })
  })

  describe('Point Class extensions', () => {
    it('should have utility methods', () => {
      const point = {} as naver.maps.Point
      
      expectTypeOf(point.x).toBeNumber()
      expectTypeOf(point.y).toBeNumber()
      
      expectTypeOf(point.equals).toBeFunction()
      expectTypeOf(point.equals).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(point.equals).returns.toBeBoolean()
      
      expectTypeOf(point.toString).toBeFunction()
      expectTypeOf(point.toString).returns.toBeString()
      
      expectTypeOf(point.add).toBeFunction()
      expectTypeOf(point.add).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(point.add).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(point.sub).toBeFunction()
      expectTypeOf(point.sub).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(point.sub).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(point.mul).toBeFunction()
      expectTypeOf(point.mul).parameter(0).toBeNumber()
      expectTypeOf(point.mul).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(point.div).toBeFunction()
      expectTypeOf(point.div).parameter(0).toBeNumber()
      expectTypeOf(point.div).returns.toMatchTypeOf<naver.maps.Point>()
      
      expectTypeOf(point.distanceTo).toBeFunction()
      expectTypeOf(point.distanceTo).parameter(0).toMatchTypeOf<naver.maps.Point>()
      expectTypeOf(point.distanceTo).returns.toBeNumber()
    })
  })

  describe('Size Class extensions', () => {
    it('should have utility methods', () => {
      const size = {} as naver.maps.Size
      
      expectTypeOf(size.width).toBeNumber()
      expectTypeOf(size.height).toBeNumber()
      
      expectTypeOf(size.equals).toBeFunction()
      expectTypeOf(size.equals).parameter(0).toMatchTypeOf<naver.maps.Size>()
      expectTypeOf(size.equals).returns.toBeBoolean()
      
      expectTypeOf(size.toString).toBeFunction()
      expectTypeOf(size.toString).returns.toBeString()
    })
  })
})