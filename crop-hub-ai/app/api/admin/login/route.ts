import { NextRequest, NextResponse } from 'next/server'
import { validatePin, buildSessionCookie } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 login attempts per minute per IP
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 5, 60_000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute before trying again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      )
    }

    const body = await req.json()
    // Convert to string safely — handles numbers like 1234 sent as JSON number
    const pin: string = String(body?.pin ?? '').trim()

    if (!pin) {
      // Return 401 consistently for all auth failures
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    if (!validatePin(pin)) {
      // Return 401 with a generic message to prevent PIN enumeration
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', buildSessionCookie())
    return res
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
