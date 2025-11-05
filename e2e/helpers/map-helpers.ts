import { Page, Locator } from '@playwright/test';

/**
 * 지도 관련 헬퍼 함수들
 */
export class MapHelpers {
  constructor(private page: Page) {}

  /**
   * 지도가 로드될 때까지 대기
   */
  async waitForMapLoad() {
    // 네이버 지도 객체가 로드될 때까지 대기
    await this.page.waitForFunction(() => {
      return typeof window !== 'undefined' && 
             window.naver && 
             window.naver.maps;
    });

    // 지도 컨테이너가 표시될 때까지 대기
    const mapContainer = this.page.locator('#map');
    await mapContainer.waitFor({ state: 'visible' });
  }

  /**
   * 특정 위치로 지도 이동
   */
  async moveToLocation(lat: number, lng: number, zoom?: number) {
    await this.page.evaluate(({ lat, lng, zoom }) => {
      const map = (window as any).__naverMap;
      if (map) {
        const position = new (window as any).naver.maps.LatLng(lat, lng);
        if (zoom) {
          map.setOptions({ center: position, zoom });
        } else {
          map.setCenter(position);
        }
      }
    }, { lat, lng, zoom });
  }

  /**
   * 마커 클릭
   */
  async clickMarker(markerTitle: string) {
    // 마커는 canvas에 그려지므로 직접 클릭이 어려움
    // 대신 마커의 위치를 찾아서 해당 좌표를 클릭
    const markerLocator = this.page.locator(`[title="${markerTitle}"]`);
    await markerLocator.click();
  }

  /**
   * InfoWindow가 열렸는지 확인
   */
  async isInfoWindowOpen(): Promise<boolean> {
    const infoWindow = this.page.locator('.info-window');
    return await infoWindow.isVisible();
  }

  /**
   * 현재 지도의 줌 레벨 가져오기
   */
  async getZoomLevel(): Promise<number> {
    return await this.page.evaluate(() => {
      const map = (window as any).__naverMap;
      return map ? map.getZoom() : null;
    });
  }

  /**
   * 현재 지도의 중심 좌표 가져오기
   */
  async getCenter(): Promise<{ lat: number; lng: number } | null> {
    return await this.page.evaluate(() => {
      const map = (window as any).__naverMap;
      if (map) {
        const center = map.getCenter();
        return {
          lat: center.lat(),
          lng: center.lng()
        };
      }
      return null;
    });
  }
}