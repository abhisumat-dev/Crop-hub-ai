import { NextRequest, NextResponse } from 'next/server'
import { validatePin, buildSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const pin: string = (body?.pin ?? '').trim()

    if (!pin) {
      return NextResponse.json({ error: 'pin is required' }, { status: 400 })
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
