/**
 * lib/auth.ts
 * Server-side admin authentication helpers.
 * Uses a secure PIN + HMAC-signed HttpOnly session cookies.
 */

import { cookies } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'crophub_admin_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'crophub-default-secret-change-in-production'
// Session lasts 8 hours
const MAX_AGE_SECONDS = 60 * 60 * 8

/** Returns the configured admin PIN from env, defaulting to '1234' in dev. */
export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim()
  if (!pin) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: ADMIN_PIN environment variable is not set in production. Using default.')
    }
    return '1234'
  }
  return pin
}

/** Validates the supplied PIN against the configured one using constant-time comparison. */
export function validatePin(pin: string): boolean {
  const expected = getAdminPin()
  const trimmed = pin.trim()
  if (trimmed.length !== expected.length) return false
  
  const bufA = Buffer.from(trimmed)
  const bufB = Buffer.from(expected)
  return timingSafeEqual(bufA, bufB)
}

/** Generates a cryptographically signed session token: {payload}.{hmac} */
export function generateSessionToken(): string {
  const payload = randomBytes(24).toString('hex')
  const hmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${hmac}`
}

/** Verifies that a session token is valid and was signed with SESSION_SECRET. */
export function verifySessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, signature] = parts
  if (!payload || !signature) return false

  const expectedHmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (expectedHmac.length !== signature.length) return false

  const bufExpected = Buffer.from(expectedHmac)
  const bufActual = Buffer.from(signature)
  return timingSafeEqual(bufExpected, bufActual)
}

/** Reads the session cookie and returns true if the admin has a valid signed session. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifySessionToken(token)
}

/**
 * Returns the Set-Cookie header value string for setting an authenticated
 * admin session with a newly generated signed token.
 */
export function buildSessionCookie(): string {
  const token = generateSessionToken()
  return [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${MAX_AGE_SECONDS}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

/**
 * Returns the Set-Cookie header value string for clearing the admin session.
 */
export function clearSessionCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

