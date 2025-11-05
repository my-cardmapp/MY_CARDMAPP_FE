import Link from 'next/link'

export default function DesignProposalsIndex() {
  const basicDesigns = [
    {
      id: 'naver-style',
      title: '시안 1: 네이버형 통합 워크스페이스',
      description: '탭 기반 통합 인터페이스 - 검색/탐색/경로/저장 탭으로 기능 구분',
      color: 'from-green-500 to-emerald-600',
      features: ['탭 기반 네비게이션', '카드 필터 통합', '접을 수 있는 사이드바']
    },
    {
      id: 'kakao-style',
      title: '시안 2: 카카오형 고정 패널',
      description: '항상 표시되는 320px 좌측 패널 - 명확한 계층 구조',
      color: 'from-yellow-400 to-yellow-600',
      features: ['고정 사이드바', '대형 토글 버튼', '시각적 카드 UI']
    },
    {
      id: 'google-style',
      title: '시안 3: 구글형 검색 중심',
      description: '미니멀 검색 중심 UI - 검색 시에만 사이드바 표시',
      color: 'from-blue-500 to-blue-600',
      features: ['검색 중심', '카테고리 바', '동적 패널']
    },
    {
      id: 'mobile-first',
      title: '시안 4: 모바일 퍼스트 바텀 시트',
      description: '하단 시트 드래그 인터랙션 - 원핸드 최적화',
      color: 'from-purple-500 to-purple-600',
      features: ['드래그 가능 시트', '3단계 확장', '플로팅 검색창']
    },
    {
      id: 'dual-mode',
      title: '시안 5: 듀얼 모드 스플릿뷰',
      description: '탐색/경로 모드 완전 분리 - 50:50 스플릿뷰',
      color: 'from-red-500 to-pink-600',
      features: ['모드 전환', '스플릿뷰', '양방향 동기화']
    }
  ]

  const customDesigns = [
    {
      id: 'card-first',
      title: '시안 6: 카드 중심 대시보드',
      description: '카드 먼저 선택 → 해당 가맹점만 표시하는 직관적 흐름',
      color: 'from-slate-600 to-slate-800',
      features: ['카드 우선 선택', '대형 카드 UI', '카테고리 필터']
    },
    {
      id: 'journey-based',
      title: '시안 7: 스토리 기반 여정',
      description: '식사→문화→쇼핑 순서로 하루 일정을 계획하는 스토리텔링 UI',
      color: 'from-purple-500 to-pink-500',
      features: ['단계별 진행', '여정 타임라인', '추천 장소']
    },
    {
      id: 'map-first',
      title: '시안 8: 지도 우선 오버레이',
      description: '전체 화면 지도 + 필요한 정보만 플로팅 패널로 표시',
      color: 'from-blue-400 to-purple-600',
      features: ['풀스크린 지도', '플로팅 UI', '미니멀 오버레이']
    },
    {
      id: 'multi-card',
      title: '시안 9: 멀티 카드 비교',
      description: '여러 카드를 동시에 비교하여 최적의 가맹점 찾기',
      color: 'from-indigo-500 to-purple-600',
      features: ['분할/겹침 모드', '벤다이어그램', '비교 테이블']
    },
    {
      id: 'ai-powered',
      title: '시안 10: AI 기반 위치 추천',
      description: '현재 시간, 위치, 날씨를 분석한 AI 맞춤 추천',
      color: 'from-purple-500 via-pink-500 to-red-500',
      features: ['AI 추천', 'Smart Context', '자동 큐레이션']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Card-Map UI 디자인 시안</h1>
              <p className="mt-2 text-slate-600">총 10가지 디자인 방향성을 비교하고 선택하세요</p>
            </div>
            <Link
              href="/map"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← 현재 버전 보기
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 디자인 분석 기반</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                🗺️
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">네이버 지도</h3>
                <p className="text-sm text-slate-600">통합 사이드바, 탭 네비게이션</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                🗺️
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">카카오 맵</h3>
                <p className="text-sm text-slate-600">고정 패널, 계층 구조</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                🗺️
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">구글 맵</h3>
                <p className="text-sm text-slate-600">검색 중심, 미니멀</p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Designs - Based on Major Map Services */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">기본 시안 (1-5)</h2>
            <p className="text-slate-600">주요 지도 서비스(네이버, 카카오, 구글)의 패턴을 분석한 디자인</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicDesigns.map((design, index) => (
              <Link
                key={design.id}
                href={`/design-proposals/${design.id}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Color Header */}
                  <div className={`h-32 bg-gradient-to-r ${design.color} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      <div className="text-5xl font-bold mb-2">{index + 1}</div>
                      <div className="text-sm font-medium opacity-90">Basic Design</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {design.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {design.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        주요 특징
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {design.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">
                        Click to preview →
                      </span>
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Custom Designs - Card-Map Specialized */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">커스텀 시안 (6-10) ⭐</h2>
            <p className="text-slate-600">복지카드 특성에 맞춘 Card-Map만의 독창적인 디자인</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customDesigns.map((design, index) => (
              <Link
                key={design.id}
                href={`/design-proposals/${design.id}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden hover:shadow-2xl hover:border-purple-400 transition-all duration-300 hover:-translate-y-1">
                  {/* Color Header */}
                  <div className={`h-32 bg-gradient-to-r ${design.color} flex items-center justify-center relative`}>
                    <div className="text-white text-center relative z-10">
                      <div className="text-5xl font-bold mb-2">{index + 6}</div>
                      <div className="text-sm font-medium opacity-90">Custom Design</div>
                    </div>
                    <div className="absolute top-2 right-2 text-2xl">⭐</div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {design.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {design.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        주요 특징
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {design.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-600">
                        Click to preview →
                      </span>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Comparison Note */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">비교 포인트</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>공간 활용도</strong>: 지도와 정보 패널의 균형</li>
                <li>• <strong>사용 편의성</strong>: 주요 기능 접근성 및 학습 곡선</li>
                <li>• <strong>모바일 대응</strong>: 반응형 디자인 및 터치 최적화</li>
                <li>• <strong>차별화 포인트</strong>: 복지카드 특화 기능 강조 방식</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
