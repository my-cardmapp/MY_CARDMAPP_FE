// This file is used to verify TypeScript compilation of event types
// It's not a test file, but a type-checking file
/// <reference path="../naver-map.d.ts" />

function typeCheckEventSystem() {
  const map = {} as naver.maps.Map
  const marker = {} as naver.maps.Marker
  const infoWindow = {} as naver.maps.InfoWindow
  
  // Test that event types are properly inferred
  
  // Map events
  naver.maps.Event.addListener(map, 'click', (e) => {
    // Should be PointerEvent
    const coord: naver.maps.LatLng = e.coord
    const point: naver.maps.Point = e.point
    const pointerType: 'mouse' | 'touch' | 'pen' = e.pointerType
  })
  
  naver.maps.Event.addListener(map, 'zoom_changed', (e) => {
    // Should be MapEvent
    const event: naver.maps.MapEvent = e
  })
  
  // Marker events
  naver.maps.Event.addListener(marker, 'dragend', (e) => {
    // Should be DragEvent
    const coord: naver.maps.LatLng = e.coord
    const point: naver.maps.Point = e.point
    // This would be a type error:
    // const pointerType = e.pointerType // Error: Property 'pointerType' does not exist
  })
  
  // InfoWindow events
  naver.maps.Event.addListener(infoWindow, 'close', (e) => {
    // Should be MapEvent
    const event: naver.maps.MapEvent = e
  })
  
  // Once method
  naver.maps.Event.once(map, 'tilesloaded', (e) => {
    const event: naver.maps.MapEvent = e
  })
  
  // DOM events
  const button = document.createElement('button')
  const listener = naver.maps.Event.addDOMListener(button, 'click', (e) => {
    const domEvent: Event = e.domEvent
    const element: HTMLElement | undefined = e.element
  })
  
  // Listener has remove method
  listener.remove()
  
  // Custom events
  naver.maps.Event.trigger(map, 'custom_event', { data: 'test' })
  
  // Clear listeners
  naver.maps.Event.clearListeners(map)
  naver.maps.Event.clearListeners(map, 'click')
  
  // Check for listeners
  const hasListeners: boolean = naver.maps.Event.hasListeners(map)
  
  console.log('Type checking complete')
}

// Export to prevent "unused" warnings
export { typeCheckEventSystem }