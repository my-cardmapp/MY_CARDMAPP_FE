import { NextRequest, NextResponse } from 'next/server'

const NAVER_LOCAL_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json'
const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
const CLIENT_SECRET = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET

export async function GET(request: NextRequest) {
  // Validate API credentials
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Naver API credentials not configured' },
      { status: 500 }
    )
  }

  // Extract query parameters
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  const display = searchParams.get('display') || '10'
  const start = searchParams.get('start') || '1'
  const sort = searchParams.get('sort') || 'random'

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Call Naver API from server-side
    const params = new URLSearchParams({
      query,
      display,
      start,
      sort,
    })

    const response = await fetch(`${NAVER_LOCAL_SEARCH_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Naver API Error]', response.status, errorText)
      return NextResponse.json(
        { error: `Naver API Error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Naver API Proxy Error]', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Naver API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
