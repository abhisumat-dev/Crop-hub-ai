import { NextRequest, NextResponse } from 'next/server'
import { resolveWeather, mockWeatherFor } from '@/lib/weather'

// Cache weather responses for 30 minutes on the CDN/Vercel edge
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const location: string = (body?.location ?? '').trim()

    if (!location) {
      return NextResponse.json({ error: 'location is required' }, { status: 400 })
    }

    const weather = await resolveWeather(location)
    return NextResponse.json(weather, { headers: CACHE_HEADERS })
  } catch (err) {
    console.error('POST /api/weather failed:', err)
    return NextResponse.json({ error: 'Failed to resolve weather' }, { status: 500 })
  }
}

// Convenience GET for manual testing: /api/weather?location=Latur
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')
  if (!location) return NextResponse.json(mockWeatherFor('Latur, Maharashtra'))
  const weather = await resolveWeather(location)
  return NextResponse.json(weather, { headers: CACHE_HEADERS })
}
