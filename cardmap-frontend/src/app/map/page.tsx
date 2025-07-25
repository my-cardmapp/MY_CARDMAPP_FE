'use client'

import { useNaverMapScript } from '@/hooks/useNaverMapScript'

export default function MapPage() {
  const { isLoading, isError, isLoaded } = useNaverMapScript()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">지도를 불러오는 중...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          지도를 불러오는데 실패했습니다. 
          <br />
          Naver Map Client ID를 확인해주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <h1 className="text-2xl font-bold p-4">Naver Map SDK 테스트</h1>
      <div className="p-4">
        <p>지도 SDK 로드 상태: {isLoaded ? '✅ 로드됨' : '❌ 로드되지 않음'}</p>
      </div>
    </div>
  )
}