import { NextRequest, NextResponse } from 'next/server'
import { validatePin, buildSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
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
