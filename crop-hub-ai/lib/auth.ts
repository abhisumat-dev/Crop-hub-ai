/**
 * lib/auth.ts
 * Server-side admin authentication helpers.
 * Uses a simple PIN stored in ADMIN_PIN env var + an HttpOnly session cookie.
 */

import { cookies } from 'next/headers'

const COOKIE_NAME = 'crophub_admin_session'
const SESSION_VALUE = 'authenticated'
// Session lasts 8 hours
const MAX_AGE_SECONDS = 60 * 60 * 8

/** Returns the configured admin PIN from env, defaulting to '1234'. */
export function getAdminPin(): string {
  return process.env.ADMIN_PIN?.trim() || '1234'
}

/** Validates the supplied PIN against the configured one. */
export function validatePin(pin: string): boolean {
  return pin.trim() === getAdminPin()
}

/** Reads the session cookie and returns true if the admin is authenticated. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === SESSION_VALUE
}

/**
 * Returns the Set-Cookie header value string for setting an authenticated
 * admin session. Use this in API route responses.
 */
export function buildSessionCookie(): string {
  return [
    `${COOKIE_NAME}=${SESSION_VALUE}`,
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
  ].join('; ')
}
