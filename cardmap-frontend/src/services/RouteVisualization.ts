/**
 * RouteVisualization Service
 * Handles drawing routes, markers, and waypoints on Naver Maps
 */

import type { Route, Location } from '@/types';

interface RouteStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'shortdashdotdot' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot' | 'longdashdotdot';
}

interface MarkerIcon {
  content: string;
  size?: naver.maps.Size;
  anchor?: naver.maps.Point;
}

export class RouteVisualization {
  private map: naver.maps.Map | null;
  private polylines: naver.maps.Polyline[] = [];
  private markers: naver.maps.Marker[] = [];
  private infoWindows: naver.maps.InfoWindow[] = [];
  private eventListeners: any[] = [];

  constructor(map: naver.maps.Map | null) {
    this.map = map;
  }

  /**
   * Draw a route on the map with markers
   */
  drawRoute(
    route: Route,
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): void {
    if (!this.map) return;

    // Clear any existing route
    this.clearRoute();

    // Draw the route polyline
    if (route.polyline) {
      this.drawPolyline(route.polyline);
    } else if (route.steps && route.steps.length > 0) {
      // Fallback: use step locations if no polyline
      this.drawPolylineFromSteps(route.steps);
    }

    // Create markers
    this.createOriginMarker(origin);
    this.createDestinationMarker(destination);

    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((waypoint, index) => {
        this.createWaypointMarker(waypoint, index + 1);
      });
    }

    // Fit bounds to show entire route
    this.fitBoundsToRoute(origin, destination, waypoints);
  }

  /**
   * Update an existing route
   */
  updateRoute(
    route: Route,
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): void {
    this.clearRoute();
    this.drawRoute(route, origin, destination, waypoints);
  }

  /**
   * Clear all route visualizations from the map
   */
  clearRoute(): void {
    // Remove polylines
    this.polylines.forEach(polyline => {
      polyline.setMap(null);
    });
    this.polylines = [];

    // Remove markers
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];

    // Close and remove info windows
    this.infoWindows.forEach(infoWindow => {
      infoWindow.close();
    });
    this.infoWindows = [];

    // Remove event listeners
    this.eventListeners.forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      } else if (naver.maps.Event && naver.maps.Event.removeListener) {
        naver.maps.Event.removeListener(listener);
      }
    });
    this.eventListeners = [];
  }

  /**
   * Highlight a specific segment of the route
   */
  highlightSegment(segmentIndex: number): void {
    if (segmentIndex < 0 || segmentIndex >= this.polylines.length) return;

    // Reset all polylines to default style
    this.polylines.forEach((polyline, index) => {
      if (index === segmentIndex) {
        // Highlight the selected segment
        polyline.setOptions({
          strokeColor: '#0066FF',
          strokeWeight: 7,
          strokeOpacity: 1,
        });
      } else {
        // Reset to default style
        polyline.setOptions({
          strokeColor: '#FF0000',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        });
      }
    });
  }

  /**
   * Show an info window for a marker
   */
  showInfoWindow(markerIndex: number, content: string): void {
    if (!this.map || markerIndex < 0 || markerIndex >= this.markers.length) return;

    // Close existing info windows
    this.infoWindows.forEach(infoWindow => {
      infoWindow.close();
    });

    const marker = this.markers[markerIndex];
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 150px;">
          ${content}
        </div>
      `,
      disableAnchor: false,
      backgroundColor: '#ffffff',
      borderColor: '#333333',
      borderWidth: 1,
      anchorSize: new naver.maps.Size(20, 24),
      anchorSkew: true,
      anchorColor: '#ffffff',
    });

    infoWindow.open(this.map, marker);
    this.infoWindows.push(infoWindow);
  }

  /**
   * Update the style of all route polylines
   */
  setRouteStyle(style: RouteStyle): void {
    this.polylines.forEach(polyline => {
      polyline.setOptions(style);
    });
  }

  /**
   * Clean up and destroy the visualization
   */
  destroy(): void {
    this.clearRoute();
    this.map = null;
  }

  /**
   * Draw polyline from encoded string
   */
  private drawPolyline(encodedPolyline: string): void {
    if (!this.map) return;

    const decodedPath = this.decodePolyline(encodedPolyline);
    if (decodedPath.length === 0) return;

    const path = decodedPath.map(coord => new naver.maps.LatLng(coord.lat, coord.lng));

    const polyline = new naver.maps.Polyline({
      map: this.map,
      path: path,
      strokeColor: '#FF0000',
      strokeWeight: 5,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    });

    this.polylines.push(polyline);
  }

  /**
   * Draw polyline from route steps
   */
  private drawPolylineFromSteps(steps: Route['steps']): void {
    if (!this.map || !steps || steps.length === 0) return;

    const path: naver.maps.LatLng[] = [];

    // Add start location of first step
    if (steps[0].startLocation) {
      path.push(new naver.maps.LatLng(
        steps[0].startLocation.lat,
        steps[0].startLocation.lng
      ));
    }

    // Add end location of each step
    steps.forEach(step => {
      if (step.endLocation) {
        path.push(new naver.maps.LatLng(
          step.endLocation.lat,
          step.endLocation.lng
        ));
      }
    });

    if (path.length > 1) {
      const polyline = new naver.maps.Polyline({
        map: this.map,
        path: path,
        strokeColor: '#FF0000',
        strokeWeight: 5,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });

      this.polylines.push(polyline);
    }
  }

  /**
   * Create origin marker
   */
  private createOriginMarker(location: Location): void {
    if (!this.map) return;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(location.lat, location.lng),
      map: this.map,
      title: location.name || '출발지',
      icon: this.createMarkerIcon('출발', '#00AA00'),
    });

    this.markers.push(marker);
    this.addMarkerClickListener(marker, location.name || '출발지');
  }

  /**
   * Create destination marker
   */
  private createDestinationMarker(location: Location): void {
    if (!this.map) return;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(location.lat, location.lng),
      map: this.map,
      title: location.name || '도착지',
      icon: this.createMarkerIcon('도착', '#FF0000'),
    });

    this.markers.push(marker);
    this.addMarkerClickListener(marker, location.name || '도착지');
  }

  /**
   * Create waypoint marker
   */
  private createWaypointMarker(location: Location, index: number): void {
    if (!this.map) return;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(location.lat, location.lng),
      map: this.map,
      title: location.name || `경유지 ${index}`,
      icon: this.createMarkerIcon(index.toString(), '#0066FF'),
    });

    this.markers.push(marker);
    this.addMarkerClickListener(marker, location.name || `경유지 ${index}`);
  }

  /**
   * Create custom marker icon
   */
  private createMarkerIcon(text: string, color: string): MarkerIcon {
    return {
      content: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 42px;
          position: relative;
        ">
          <div style="
            background: ${color};
            color: white;
            border: 2px solid white;
            border-radius: 50% 50% 50% 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            position: absolute;
            top: 0;
          ">
            <span style="transform: rotate(45deg);">${text}</span>
          </div>
        </div>
      `,
      size: new naver.maps.Size(32, 42),
      anchor: new naver.maps.Point(16, 42),
    };
  }

  /**
   * Add click listener to marker
   */
  private addMarkerClickListener(marker: naver.maps.Marker, title: string): void {
    if (!this.map) return;

    const listener = naver.maps.Event.addListener(marker, 'click', () => {
      const markerIndex = this.markers.indexOf(marker);
      if (markerIndex !== -1) {
        this.showInfoWindow(markerIndex, title);
      }
    });

    this.eventListeners.push(listener);
  }

  /**
   * Fit map bounds to show all route elements
   */
  private fitBoundsToRoute(
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): void {
    if (!this.map) return;

    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(origin.lat, origin.lng),
      new naver.maps.LatLng(destination.lat, destination.lng)
    );

    // Include waypoints in bounds
    if (waypoints) {
      waypoints.forEach(waypoint => {
        bounds.extend(new naver.maps.LatLng(waypoint.lat, waypoint.lng));
      });
    }

    // Include polyline path in bounds
    this.polylines.forEach(polyline => {
      try {
        const path = polyline.getPath ? polyline.getPath() : null;
        if (path) {
          // Handle both array and array-like objects
          const pathArray = Array.isArray(path) ? path : Array.from(path as any);
          pathArray.forEach((point: any) => {
            if (point && typeof point.lat === 'function' && typeof point.lng === 'function') {
              bounds.extend(point);
            } else if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
              bounds.extend(new naver.maps.LatLng(point.lat, point.lng));
            }
          });
        }
      } catch (error) {
        // Silently skip if getPath is not available or fails
        console.debug('Could not get path from polyline:', error);
      }
    });

    // Fit map to bounds with padding
    this.map.fitBounds(bounds, { 
      top: 100, 
      right: 100, 
      bottom: 100, 
      left: 100 
    });
  }

  /**
   * Decode Google's encoded polyline format
   * Based on: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
   */
  private decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
    if (!encoded) return [];

    const coordinates: Array<{ lat: number; lng: number }> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    try {
      while (index < encoded.length) {
        let shift = 0;
        let result = 0;
        let byte: number;

        // Decode latitude
        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        shift = 0;
        result = 0;

        // Decode longitude
        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coordinates.push({
          lat: lat / 1e5,
          lng: lng / 1e5,
        });
      }
    } catch (error) {
      console.error('Error decoding polyline:', error);
      return [];
    }

    return coordinates;
  }
}