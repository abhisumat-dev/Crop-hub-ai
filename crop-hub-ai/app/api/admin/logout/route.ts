import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Verify origin if present to protect against cross-site forged logout triggers
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  
  if (origin && host) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Cross-origin request forbidden' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid origin header' }, { status: 403 })
    }
  }

  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', clearSessionCookie())
  return res
}

