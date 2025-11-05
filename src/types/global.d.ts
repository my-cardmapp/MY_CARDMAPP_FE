/// <reference path="./naver-map.d.ts" />

declare global {
  interface Window {
    naver?: typeof naver
  }
}

export {}