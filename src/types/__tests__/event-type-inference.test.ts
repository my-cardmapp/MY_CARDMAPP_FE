import { describe, it, expect } from 'vitest'

// This file tests comprehensive type inference for all event types
describe('Event Type Inference Tests', () => {
  it('should properly infer Map event types', () => {
    // This test validates that TypeScript correctly infers event types
    // The actual test is compilation - if this compiles, the types work
    
    function testMapEvents() {
      const map = {} as naver.maps.Map
      
      // Should infer PointerEvent for click events
      naver.maps.Event.addListener(map, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
        const offset: naver.maps.Point = e.offset
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
        const domEvent: MouseEvent | TouchEvent = e.domEvent
        const overlay: any = e.overlay
        const feature: any = e.feature
      })
      
      // Should infer MapEvent for other events
      naver.maps.Event.addListener(map, 'center_changed', (e) => {
        // e should be MapEvent
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(map, 'zoom_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(map, 'bounds_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      // Double click should be PointerEvent
      naver.maps.Event.addListener(map, 'dblclick', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      // Right click should be PointerEvent
      naver.maps.Event.addListener(map, 'rightclick', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
      })
      
      // Mouse events should be PointerEvent
      naver.maps.Event.addListener(map, 'mousemove', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const domEvent: MouseEvent | TouchEvent = e.domEvent
      })
      
      naver.maps.Event.addListener(map, 'mouseout', (e) => {
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      naver.maps.Event.addListener(map, 'mouseover', (e) => {
        const coord: naver.maps.LatLng = e.coord
      })
      
      // Drag events should be MapEvent
      naver.maps.Event.addListener(map, 'drag', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(map, 'dragstart', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(map, 'dragend', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer Marker event types', () => {
    function testMarkerEvents() {
      const marker = {} as naver.maps.Marker
      
      // Click events should be PointerEvent
      naver.maps.Event.addListener(marker, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      // Drag events should be DragEvent
      naver.maps.Event.addListener(marker, 'dragstart', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
        const offset: naver.maps.Point = e.offset
        // Should NOT have pointerType (that's specific to PointerEvent)
        // @ts-expect-error - pointerType doesn't exist on DragEvent
        const _invalid = e.pointerType
      })
      
      naver.maps.Event.addListener(marker, 'drag', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
      })
      
      naver.maps.Event.addListener(marker, 'dragend', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
        const offset: naver.maps.Point = e.offset
      })
      
      // Property change events should be MapEvent
      naver.maps.Event.addListener(marker, 'position_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(marker, 'icon_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(marker, 'visible_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer InfoWindow event types', () => {
    function testInfoWindowEvents() {
      const infoWindow = {} as naver.maps.InfoWindow
      
      // Open/close events should be MapEvent
      naver.maps.Event.addListener(infoWindow, 'open', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(infoWindow, 'close', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      // Property change events
      naver.maps.Event.addListener(infoWindow, 'content_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(infoWindow, 'position_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(infoWindow, 'anchorColor_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer Polyline event types', () => {
    function testPolylineEvents() {
      const polyline = {} as naver.maps.Polyline
      
      // Click events should be PointerEvent
      naver.maps.Event.addListener(polyline, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      naver.maps.Event.addListener(polyline, 'mouseover', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const domEvent: MouseEvent | TouchEvent = e.domEvent
      })
      
      // Property change events
      naver.maps.Event.addListener(polyline, 'path_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(polyline, 'strokeColor_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer Polygon event types', () => {
    function testPolygonEvents() {
      const polygon = {} as naver.maps.Polygon
      
      // Click events should be PointerEvent
      naver.maps.Event.addListener(polygon, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
      })
      
      // Polygon-specific events
      naver.maps.Event.addListener(polygon, 'fillColor_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(polygon, 'paths_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer Circle event types', () => {
    function testCircleEvents() {
      const circle = {} as naver.maps.Circle
      
      // Click events should be PointerEvent
      naver.maps.Event.addListener(circle, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      // Circle-specific events
      naver.maps.Event.addListener(circle, 'center_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      naver.maps.Event.addListener(circle, 'radius_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should properly infer Rectangle event types', () => {
    function testRectangleEvents() {
      const rectangle = {} as naver.maps.Rectangle
      
      // Rectangle extends Circle events and adds bounds_changed
      naver.maps.Event.addListener(rectangle, 'bounds_changed', (e) => {
        const _event: naver.maps.MapEvent = e
      })
      
      // Should still have Circle events
      naver.maps.Event.addListener(rectangle, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should support once() method with proper typing', () => {
    function testOnceMethod() {
      const map = {} as naver.maps.Map
      const marker = {} as naver.maps.Marker
      
      // Once should have same type inference as addListener
      naver.maps.Event.once(map, 'click', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
      })
      
      naver.maps.Event.once(marker, 'dragend', (e) => {
        const coord: naver.maps.LatLng = e.coord
        const point: naver.maps.Point = e.point
        // Should be DragEvent, not PointerEvent
        // @ts-expect-error - pointerType doesn't exist on DragEvent
        const _invalid = e.pointerType
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should support DOM event listeners', () => {
    function testDOMListeners() {
      const element = document.createElement('div')
      
      const listener = naver.maps.Event.addDOMListener(element, 'click', (e) => {
        const domEvent: Event = e.domEvent
        const el: HTMLElement | undefined = e.element
      })
      
      // Listener should have remove method
      listener.remove()
      
      // Can also remove via removeListener
      const listener2 = naver.maps.Event.addDOMListener(element, 'mousedown', (e) => {
        const domEvent: Event = e.domEvent
      })
      
      naver.maps.Event.removeListener(listener2)
    }
    
    expect(true).toBe(true)
  })
  
  it('should support custom events with trigger', () => {
    function testCustomEvents() {
      const map = {} as naver.maps.Map
      
      // Trigger allows custom events with any arguments
      naver.maps.Event.trigger(map, 'my_custom_event', { data: 'test' })
      naver.maps.Event.trigger(map, 'another_event', 123, 'test', true)
      
      // Can listen to custom events (type will be any)
      naver.maps.Event.addListener(map, 'my_custom_event', (e) => {
        // e is any for custom events
        const data = e?.data
      })
    }
    
    expect(true).toBe(true)
  })
  
  it('should support clearListeners and hasListeners', () => {
    function testUtilityMethods() {
      const map = {} as naver.maps.Map
      
      // Clear all listeners
      naver.maps.Event.clearListeners(map)
      
      // Clear specific event listeners
      naver.maps.Event.clearListeners(map, 'click')
      
      // Check if has listeners
      const hasAny: boolean = naver.maps.Event.hasListeners(map)
      const hasClick: boolean = naver.maps.Event.hasListeners(map, 'click')
    }
    
    expect(true).toBe(true)
  })
})