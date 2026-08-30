/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Uses a Map keyed by IP address. Works on Vercel serverless (per-function
 * instance) and locally. For multi-instance production, swap out for
 * Upstash Redis ratelimit.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Max Map size to prevent memory growth in long-running instances
const MAX_ENTRIES = 5000

const store = new Map<string, RateLimitEntry>()

/**
 * @param ip      The client IP address (from request headers)
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 * @returns `{ success: true }` if allowed, `{ success: false, retryAfter: number }` if rate-limited
 */
export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number,
): { success: true } | { success: false; retryAfter: number } {
  const now = Date.now()

  // Prune expired entries if store is getting large
  if (store.size > MAX_ENTRIES) {
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }

  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (entry.count >= limit) {
    return { success: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { success: true }
}

/**
 * Extract the real client IP from Next.js request headers.
 * Works behind Vercel's edge network and Cloudflare.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}
