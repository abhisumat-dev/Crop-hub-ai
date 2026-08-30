import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

/**
 * GET /api/health
 * Lightweight healthcheck for Vercel, uptime monitors, and CI smoke tests.
 * Returns 200 if the app and database are reachable, 503 otherwise.
 */
export async function GET() {
  const start = Date.now()

  try {
    // Ping Supabase — a lightweight count query is enough to confirm connectivity
    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('crops_master')
      .select('crop_id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          db: 'unreachable',
          error: error.message,
          latency_ms: Date.now() - start,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        db: 'connected',
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '1.0.0',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
